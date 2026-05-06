import type { Catalog } from '../data/catalogs.ts';
import { CITIES } from '../data/cities.ts';
import { getCatalogImageUrl, getSeoLandingPages } from './seo-landing-pages.ts';

const BASE_URL = 'https://cataloglidl.ro';

type ChangeFrequency = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';

export type SitemapKind = 'pages' | 'products' | 'catalogs' | 'stores';

export interface SitemapEntry {
    url: string;
    lastModified: string;
    changeFrequency: ChangeFrequency;
    priority: number;
    images?: string[];
}

export const SITEMAP_SECTIONS: Array<{ kind: SitemapKind; loc: string }> = [
    { kind: 'pages', loc: `${BASE_URL}/sitemaps/pages.xml` },
    { kind: 'products', loc: `${BASE_URL}/sitemaps/products.xml` },
    { kind: 'catalogs', loc: `${BASE_URL}/sitemaps/catalogs.xml` },
    { kind: 'stores', loc: `${BASE_URL}/sitemaps/stores.xml` },
];

const CATEGORY_SLUGS = [
    'alimente',
    'fructe-si-legume',
    'carne-si-mezeluri',
    'lactate',
    'panificatie',
    'dulciuri',
    'bauturi',
    'curatenie',
    'non-food',
    'oua',
];

function currentDate(): string {
    return new Date().toISOString().split('T')[0];
}

function absoluteUrl(pathOrUrl: string): string {
    return pathOrUrl.startsWith('http') ? pathOrUrl : `${BASE_URL}${pathOrUrl}`;
}

function escapeXml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function pagesSitemap(allCatalogs: Catalog[], today: string): SitemapEntry[] {
    const staticPages: SitemapEntry[] = [
        { url: BASE_URL, lastModified: today, changeFrequency: 'daily', priority: 1 },
        { url: `${BASE_URL}/oferte-lidl-saptamana-asta`, lastModified: today, changeFrequency: 'daily', priority: 0.95 },
        { url: `${BASE_URL}/arhiva`, lastModified: today, changeFrequency: 'weekly', priority: 0.7 },
        { url: `${BASE_URL}/lidl`, lastModified: today, changeFrequency: 'weekly', priority: 0.8 },
        { url: `${BASE_URL}/despre`, lastModified: '2026-01-01', changeFrequency: 'yearly', priority: 0.4 },
        { url: `${BASE_URL}/contact`, lastModified: '2026-01-01', changeFrequency: 'yearly', priority: 0.4 },
        { url: `${BASE_URL}/confidentialitate`, lastModified: '2026-01-01', changeFrequency: 'yearly', priority: 0.2 },
        { url: `${BASE_URL}/termeni`, lastModified: '2026-01-01', changeFrequency: 'yearly', priority: 0.2 },
    ];

    const seoLandingPages: SitemapEntry[] = getSeoLandingPages(allCatalogs, today).map(page => {
        const image = getCatalogImageUrl(page.primaryCatalog);
        return {
            url: page.canonical,
            lastModified: today,
            changeFrequency: 'daily',
            priority: page.slug === 'catalog-lidl-online' ? 0.98 : 0.88,
            ...(image ? { images: [image] } : {}),
        };
    });

    const categoryPages: SitemapEntry[] = CATEGORY_SLUGS.map(slug => ({
        url: `${BASE_URL}/categorie/${slug}`,
        lastModified: today,
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    return [...staticPages, ...seoLandingPages, ...categoryPages];
}

function productsSitemap(allCatalogs: Catalog[], today: string): SitemapEntry[] {
    const activeSlugs = new Set<string>();
    allCatalogs
        .filter(catalog => catalog.endDate >= today)
        .forEach(catalog => catalog.products.forEach(product => activeSlugs.add(product.slug)));

    type ProductEntry = { slug: string; lastMod: string; active: boolean; imageUrl?: string };
    const seen = new Map<string, ProductEntry>();

    allCatalogs.forEach(catalog => {
        catalog.products.forEach(product => {
            const existing = seen.get(product.slug);
            const entry: ProductEntry = {
                slug: product.slug,
                lastMod: catalog.startDate,
                active: activeSlugs.has(product.slug),
                imageUrl: product.imageUrl ? absoluteUrl(product.imageUrl) : undefined,
            };

            if (!existing || catalog.startDate > existing.lastMod) {
                seen.set(product.slug, {
                    ...entry,
                    active: entry.active || existing?.active || false,
                    imageUrl: entry.imageUrl || existing?.imageUrl,
                });
            } else if (entry.active) {
                existing.active = true;
                existing.imageUrl = existing.imageUrl || entry.imageUrl;
            }
        });
    });

    return Array.from(seen.values()).map(product => ({
        url: `${BASE_URL}/produs/${product.slug}`,
        lastModified: product.active ? today : product.lastMod,
        changeFrequency: product.active ? 'weekly' : 'monthly',
        priority: product.active ? 0.75 : 0.5,
        ...(product.imageUrl ? { images: [product.imageUrl] } : {}),
    }));
}

function catalogsSitemap(allCatalogs: Catalog[], today: string): SitemapEntry[] {
    return allCatalogs.map(catalog => {
        const isActive = catalog.endDate >= today;
        const image = getCatalogImageUrl(catalog);

        return {
            url: `${BASE_URL}/catalog/${catalog.slug}`,
            lastModified: catalog.startDate,
            changeFrequency: isActive ? 'weekly' : 'monthly',
            priority: isActive ? 0.9 : 0.5,
            ...(image ? { images: [image] } : {}),
        };
    });
}

function storesSitemap(today: string): SitemapEntry[] {
    return CITIES.map(city => ({
        url: `${BASE_URL}/lidl/${city.slug}`,
        lastModified: today,
        changeFrequency: 'weekly',
        priority: 0.75,
    }));
}

export function getSitemapEntries(kind: SitemapKind, catalogs: Catalog[], today = currentDate()): SitemapEntry[] {
    switch (kind) {
        case 'pages':
            return pagesSitemap(catalogs, today);
        case 'products':
            return productsSitemap(catalogs, today);
        case 'catalogs':
            return catalogsSitemap(catalogs, today);
        case 'stores':
            return storesSitemap(today);
    }
}

export function buildSitemapIndexXml(today = currentDate()): string {
    const entries = SITEMAP_SECTIONS.map(section => [
        '  <sitemap>',
        `    <loc>${escapeXml(section.loc)}</loc>`,
        `    <lastmod>${escapeXml(today)}</lastmod>`,
        '  </sitemap>',
    ].join('\n')).join('\n');

    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        entries,
        '</sitemapindex>',
        '',
    ].join('\n');
}

export function renderUrlSetXml(entries: SitemapEntry[]): string {
    const hasImages = entries.some(entry => entry.images && entry.images.length > 0);
    const namespace = hasImages
        ? '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">'
        : '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

    const urls = entries.map(entry => {
        const images = (entry.images || [])
            .map(image => [
                '    <image:image>',
                `      <image:loc>${escapeXml(image)}</image:loc>`,
                '    </image:image>',
            ].join('\n'))
            .join('\n');

        return [
            '  <url>',
            `    <loc>${escapeXml(entry.url)}</loc>`,
            images,
            `    <lastmod>${escapeXml(entry.lastModified)}</lastmod>`,
            `    <changefreq>${entry.changeFrequency}</changefreq>`,
            `    <priority>${entry.priority}</priority>`,
            '  </url>',
        ].filter(Boolean).join('\n');
    }).join('\n');

    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        namespace,
        urls,
        '</urlset>',
        '',
    ].join('\n');
}

export function sitemapXmlResponse(xml: string): Response {
    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=300, s-maxage=300',
        },
    });
}
