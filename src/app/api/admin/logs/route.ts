import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedFromRequest } from '@/lib/admin-auth';
import fs from 'fs';
import path from 'path';

const LOG_FILE = path.join(process.cwd(), 'logs', 'scraper.log');

export async function GET(req: NextRequest) {
    if (!isAuthenticatedFromRequest(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!fs.existsSync(LOG_FILE)) {
        return NextResponse.json([]);
    }

    const content = fs.readFileSync(LOG_FILE, 'utf-8');
    const lines = content.trim().split('\n').filter(Boolean);

    // Return last 50 entries, newest first
    const entries = [];
    for (let i = lines.length - 1; i >= 0 && entries.length < 50; i--) {
        try {
            entries.push(JSON.parse(lines[i]));
        } catch {
            // skip malformed lines
        }
    }

    return NextResponse.json(entries);
}
