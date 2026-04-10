/**
 * Scrape trigger watcher — runs as a PM2 process alongside the main app.
 * Watches for logs/scrape-trigger.json and runs the scraper when it appears.
 *
 * PM2 config: see ecosystem.config.js (catalog-lidl-watcher)
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const TRIGGER_FILE = path.join(__dirname, '..', 'logs', 'scrape-trigger.json');
const SCRAPER_SCRIPT = path.join(__dirname, 'scrape-catalogs.js');
const POLL_INTERVAL = 5000; // 5 seconds

console.log('Scrape trigger watcher started');
console.log(`Watching: ${TRIGGER_FILE}`);

function checkTrigger() {
    if (!fs.existsSync(TRIGGER_FILE)) return;

    console.log(`[${new Date().toISOString()}] Trigger detected — running scraper...`);

    try {
        // Mark as running
        fs.writeFileSync(TRIGGER_FILE, JSON.stringify({
            requestedAt: new Date().toISOString(),
            status: 'running',
        }), 'utf-8');

        // Run the scraper synchronously
        execFileSync('node', [SCRAPER_SCRIPT], {
            cwd: path.join(__dirname, '..'),
            timeout: 300000,
            stdio: 'inherit',
        });

        console.log(`[${new Date().toISOString()}] Scrape completed successfully`);

        // Remove trigger file to signal completion
        if (fs.existsSync(TRIGGER_FILE)) fs.unlinkSync(TRIGGER_FILE);

    } catch (err) {
        console.error(`[${new Date().toISOString()}] Scrape failed:`, err.message);

        // Write error status
        try {
            fs.writeFileSync(TRIGGER_FILE, JSON.stringify({
                status: 'error',
                error: err.message,
                timestamp: new Date().toISOString(),
            }), 'utf-8');
        } catch { /* ignore */ }
    }
}

// Poll every 5 seconds
setInterval(checkTrigger, POLL_INTERVAL);
