import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedFromRequest } from '@/lib/admin-auth';
import fs from 'fs';
import path from 'path';

const TRIGGER_FILE = path.join(process.cwd(), 'logs', 'scrape-trigger.json');
const LOG_FILE = path.join(process.cwd(), 'logs', 'scraper.log');

// POST /api/admin/scrape — trigger manual scrape via file trigger
// The watcher script (scripts/watch-trigger.js) picks this up and runs the scraper
export async function POST(req: NextRequest) {
    if (!isAuthenticatedFromRequest(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const logsDir = path.dirname(TRIGGER_FILE);
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

    // Write trigger file
    fs.writeFileSync(TRIGGER_FILE, JSON.stringify({
        requestedAt: new Date().toISOString(),
        status: 'pending',
    }), 'utf-8');

    // Wait for completion (poll for up to 10 minutes). The watcher now runs
    // scrape + production build + optional PM2 restart, not just the scraper.
    const maxWait = 600000;
    const pollInterval = 3000;
    const startTime = Date.now();

    while (Date.now() - startTime < maxWait) {
        await new Promise(r => setTimeout(r, pollInterval));

        if (!fs.existsSync(TRIGGER_FILE)) {
            // Trigger file was consumed — check latest log entry
            if (fs.existsSync(LOG_FILE)) {
                const lines = fs.readFileSync(LOG_FILE, 'utf-8').trim().split('\n');
                const lastLine = lines[lines.length - 1];
                try {
                    const log = JSON.parse(lastLine);
                    return NextResponse.json({
                        ok: log.status === 'success',
                        output: `Cataloage: ${log.catalogsScraped}/${log.catalogsFound}, Produse: ${log.totalProducts}, Durata: ${(log.durationMs / 1000).toFixed(1)}s`,
                        log,
                    });
                } catch {
                    return NextResponse.json({ ok: true, output: 'Scrape completat.' });
                }
            }
            return NextResponse.json({ ok: true, output: 'Scrape completat.' });
        }

        // Check if trigger was picked up and is running
        try {
            const trigger = JSON.parse(fs.readFileSync(TRIGGER_FILE, 'utf-8'));
            if (trigger.status === 'error') {
                fs.unlinkSync(TRIGGER_FILE);
                return NextResponse.json({ ok: false, error: trigger.error || 'Scrape failed' }, { status: 500 });
            }
        } catch { /* ignore */ }
    }

    return NextResponse.json({ ok: false, error: 'Timeout — scraper-ul nu a raspuns in 10 minute.' }, { status: 504 });
}

// GET /api/admin/scrape — check scrape status
export async function GET(req: NextRequest) {
    if (!isAuthenticatedFromRequest(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (fs.existsSync(TRIGGER_FILE)) {
        try {
            const trigger = JSON.parse(fs.readFileSync(TRIGGER_FILE, 'utf-8'));
            return NextResponse.json({ running: true, ...trigger });
        } catch {
            return NextResponse.json({ running: true });
        }
    }

    return NextResponse.json({ running: false });
}
