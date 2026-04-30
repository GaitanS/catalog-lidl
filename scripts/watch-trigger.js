/**
 * Scrape trigger watcher — runs as a PM2 process alongside the main app.
 *
 * Responsibilities:
 *   1. Consume logs/scrape-trigger.json for manual admin scrapes.
 *   2. Run scheduled scrapes every day at SCRAPE_SCHEDULE_HOURS (default 07,13).
 *   3. After scraping, rebuild the standalone Next app and restart catalog-lidl in production.
 *
 * PM2 config: see ecosystem.config.js (catalog-lidl-watcher).
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const {
    markScheduledRun,
    parseScheduleHours,
    shouldRunStaleScrape,
    shouldRunScheduledScrape,
} = require('./scrape-automation');

const APP_DIR = path.join(__dirname, '..');
const LOG_DIR = path.join(APP_DIR, 'logs');
const TRIGGER_FILE = path.join(LOG_DIR, 'scrape-trigger.json');
const STATE_FILE = path.join(LOG_DIR, 'scrape-automation-state.json');
const DATA_FILE = path.join(APP_DIR, 'src', 'data', 'catalogs-scraped.json');
const SCRAPER_SCRIPT = path.join(__dirname, 'scrape-catalogs.js');
const POLL_INTERVAL = Number(process.env.SCRAPE_POLL_INTERVAL_MS || 5000);
const SCHEDULE_HOURS = parseScheduleHours(process.env.SCRAPE_SCHEDULE_HOURS);
const MAX_DATA_AGE_HOURS = Number(process.env.SCRAPE_MAX_DATA_AGE_HOURS || 26);
const PM2_APP_NAME = process.env.SCRAPE_PM2_APP_NAME || 'catalog-lidl';
const SHOULD_BUILD = process.env.SCRAPE_SKIP_BUILD !== '1';
const SHOULD_RESTART_PM2 =
    process.env.SCRAPE_RESTART_PM2 === '1' ||
    (process.env.SCRAPE_RESTART_PM2 !== '0' && process.env.NODE_ENV === 'production');

let running = false;
let checkedStaleDataOnStartup = false;

function ensureLogDir() {
    if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
}

function readJson(file, fallback) {
    try {
        if (!fs.existsSync(file)) return fallback;
        return JSON.parse(fs.readFileSync(file, 'utf-8'));
    } catch {
        return fallback;
    }
}

function writeJson(file, data) {
    ensureLogDir();
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
}

function runStep(label, command, args, options = {}) {
    console.log(`[${new Date().toISOString()}] ${label}...`);
    execFileSync(command, args, {
        cwd: APP_DIR,
        timeout: options.timeout || 600000,
        stdio: 'inherit',
        env: process.env,
    });
}

function commandName(base) {
    return process.platform === 'win32' ? `${base}.cmd` : base;
}

function copyDirIfExists(from, to) {
    if (!fs.existsSync(from)) return;
    fs.cpSync(from, to, { recursive: true, force: true });
}

function copyStandaloneAssets() {
    const standaloneDir = path.join(APP_DIR, '.next', 'standalone');
    if (!fs.existsSync(standaloneDir)) return;

    copyDirIfExists(path.join(APP_DIR, 'public'), path.join(standaloneDir, 'public'));
    copyDirIfExists(path.join(APP_DIR, '.next', 'static'), path.join(standaloneDir, '.next', 'static'));
}

function runScrapePipeline(reason) {
    if (running) {
        console.log(`[${new Date().toISOString()}] Scrape already running; skipping ${reason}.`);
        return;
    }

    running = true;
    console.log(`[${new Date().toISOString()}] Starting scrape pipeline (${reason})`);

    try {
        runStep('Running scraper', 'node', [SCRAPER_SCRIPT], { timeout: 300000 });

        if (SHOULD_BUILD) {
            runStep('Building Next.js', commandName('npm'), ['run', 'build']);
            copyStandaloneAssets();
        }

        if (SHOULD_RESTART_PM2) {
            runStep(`Restarting PM2 app ${PM2_APP_NAME}`, 'pm2', ['restart', PM2_APP_NAME, '--update-env'], { timeout: 120000 });
        }

        console.log(`[${new Date().toISOString()}] Scrape pipeline completed (${reason})`);
    } finally {
        running = false;
    }
}

function completeTrigger() {
    if (fs.existsSync(TRIGGER_FILE)) fs.unlinkSync(TRIGGER_FILE);
}

function failTrigger(error) {
    writeJson(TRIGGER_FILE, {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString(),
    });
}

function checkManualTrigger() {
    if (!fs.existsSync(TRIGGER_FILE)) return;

    const trigger = readJson(TRIGGER_FILE, {});
    if (trigger.status === 'running') return;

    console.log(`[${new Date().toISOString()}] Manual trigger detected`);

    writeJson(TRIGGER_FILE, {
        requestedAt: trigger.requestedAt || new Date().toISOString(),
        status: 'running',
    });

    try {
        runScrapePipeline('manual trigger');
        completeTrigger();
    } catch (err) {
        console.error(`[${new Date().toISOString()}] Manual scrape failed:`, err.message);
        failTrigger(err);
    }
}

function checkScheduledRun() {
    const state = readJson(STATE_FILE, {});
    const now = new Date();

    if (!shouldRunScheduledScrape({ now, state, scheduleHours: SCHEDULE_HOURS, running })) return;

    markScheduledRun({ now, state });
    writeJson(STATE_FILE, state);

    try {
        runScrapePipeline('scheduled run');
    } catch (err) {
        console.error(`[${new Date().toISOString()}] Scheduled scrape failed:`, err.message);
        writeJson(STATE_FILE, {
            ...state,
            lastError: err.message,
            lastErrorAt: new Date().toISOString(),
        });
    }
}

function getDataFileUpdatedAt() {
    try {
        return fs.statSync(DATA_FILE).mtime;
    } catch {
        return null;
    }
}

function checkStaleDataOnStartup() {
    if (checkedStaleDataOnStartup) return;
    checkedStaleDataOnStartup = true;

    if (!shouldRunStaleScrape({
        now: new Date(),
        lastUpdatedAt: getDataFileUpdatedAt(),
        maxAgeHours: MAX_DATA_AGE_HOURS,
        running,
    })) {
        return;
    }

    try {
        runScrapePipeline(`stale data > ${MAX_DATA_AGE_HOURS}h`);
    } catch (err) {
        console.error(`[${new Date().toISOString()}] Startup stale-data scrape failed:`, err.message);
        const state = readJson(STATE_FILE, {});
        writeJson(STATE_FILE, {
            ...state,
            lastError: err.message,
            lastErrorAt: new Date().toISOString(),
        });
    }
}

function tick() {
    checkManualTrigger();
    checkStaleDataOnStartup();
    checkScheduledRun();
}

ensureLogDir();
console.log('Scrape trigger watcher started');
console.log(`Watching manual trigger: ${TRIGGER_FILE}`);
console.log(`Scheduled scrape hours: ${SCHEDULE_HOURS.join(', ')}`);
console.log(`Max catalog data age: ${MAX_DATA_AGE_HOURS}h`);
console.log(`Build after scrape: ${SHOULD_BUILD ? 'yes' : 'no'}`);
console.log(`PM2 restart after scrape: ${SHOULD_RESTART_PM2 ? `yes (${PM2_APP_NAME})` : 'no'}`);

tick();
setInterval(tick, POLL_INTERVAL);
