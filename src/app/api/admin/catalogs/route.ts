import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedFromRequest } from '@/lib/admin-auth';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'src', 'data', 'catalogs-scraped.json');

function readData() {
    if (!fs.existsSync(DATA_FILE)) return [];
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function writeData(data: unknown[]) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET(req: NextRequest) {
    if (!isAuthenticatedFromRequest(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(readData());
}

export async function PUT(req: NextRequest) {
    if (!isAuthenticatedFromRequest(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const { slug, updates } = body;
    if (!slug || !updates) {
        return NextResponse.json({ error: 'Missing slug or updates' }, { status: 400 });
    }

    const data = readData();
    const idx = data.findIndex((c: { slug: string }) => c.slug === slug);
    if (idx === -1) {
        return NextResponse.json({ error: 'Catalog not found' }, { status: 404 });
    }

    // Allow editing title, description, startDate, endDate, isActive
    const allowed = ['title', 'description', 'startDate', 'endDate', 'isActive'];
    for (const key of allowed) {
        if (key in updates) {
            data[idx][key] = updates[key];
        }
    }

    writeData(data);
    return NextResponse.json({ ok: true, catalog: data[idx] });
}

export async function DELETE(req: NextRequest) {
    if (!isAuthenticatedFromRequest(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { slug } = await req.json();
    if (!slug) {
        return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
    }

    const data = readData();
    const filtered = data.filter((c: { slug: string }) => c.slug !== slug);
    if (filtered.length === data.length) {
        return NextResponse.json({ error: 'Catalog not found' }, { status: 404 });
    }

    writeData(filtered);

    // Also remove catalog directory
    const catalogDir = path.join(process.cwd(), 'public', 'catalogs', slug);
    if (fs.existsSync(catalogDir)) {
        fs.rmSync(catalogDir, { recursive: true, force: true });
    }

    return NextResponse.json({ ok: true });
}
