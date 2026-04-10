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

// GET /api/admin/products?catalog=slug — list products for a catalog
export async function GET(req: NextRequest) {
    if (!isAuthenticatedFromRequest(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const catalogSlug = req.nextUrl.searchParams.get('catalog');
    if (!catalogSlug) {
        return NextResponse.json({ error: 'Missing catalog param' }, { status: 400 });
    }
    const data = readData();
    const catalog = data.find((c: { slug: string }) => c.slug === catalogSlug);
    if (!catalog) {
        return NextResponse.json({ error: 'Catalog not found' }, { status: 404 });
    }
    return NextResponse.json(catalog.products || []);
}

// PUT /api/admin/products — update a single product
export async function PUT(req: NextRequest) {
    if (!isAuthenticatedFromRequest(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { catalogSlug, productId, updates } = await req.json();
    if (!catalogSlug || !productId || !updates) {
        return NextResponse.json({ error: 'Missing catalogSlug, productId, or updates' }, { status: 400 });
    }

    const data = readData();
    const catalog = data.find((c: { slug: string }) => c.slug === catalogSlug);
    if (!catalog) {
        return NextResponse.json({ error: 'Catalog not found' }, { status: 404 });
    }

    const product = (catalog.products || []).find((p: { id: string }) => p.id === productId);
    if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const allowed = ['name', 'price', 'oldPrice', 'discount'];
    for (const key of allowed) {
        if (key in updates) {
            product[key] = updates[key];
        }
    }

    writeData(data);
    return NextResponse.json({ ok: true, product });
}

// DELETE /api/admin/products — remove a product
export async function DELETE(req: NextRequest) {
    if (!isAuthenticatedFromRequest(req)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { catalogSlug, productId } = await req.json();
    if (!catalogSlug || !productId) {
        return NextResponse.json({ error: 'Missing catalogSlug or productId' }, { status: 400 });
    }

    const data = readData();
    const catalog = data.find((c: { slug: string }) => c.slug === catalogSlug);
    if (!catalog) {
        return NextResponse.json({ error: 'Catalog not found' }, { status: 404 });
    }

    const before = (catalog.products || []).length;
    catalog.products = (catalog.products || []).filter((p: { id: string }) => p.id !== productId);
    if (catalog.products.length === before) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    writeData(data);
    return NextResponse.json({ ok: true });
}
