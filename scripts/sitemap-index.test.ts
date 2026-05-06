import test from 'node:test';
import assert from 'node:assert/strict';

import {
    SITEMAP_SECTIONS,
    buildSitemapIndexXml,
    getSitemapEntries,
    renderUrlSetXml,
} from '../src/lib/sitemap-sections.ts';

const TODAY = '2026-05-06';
const catalogs = [
    {
        slug: 'catalog-lidl-activ',
        title: 'Catalog Lidl activ',
        description: 'Oferte active',
        startDate: '2026-05-04',
        endDate: '2026-05-10',
        coverImage: '/catalogs/activ/pages/page_01.webp',
        thumbnailImage: '/catalogs/activ/pages/thumb_01.webp',
        pages: [{ pageNumber: 1, imageUrl: '/catalogs/activ/pages/page_01.webp', thumbnailUrl: '/catalogs/activ/pages/thumb_01.webp' }],
        products: [
            {
                slug: 'pulpe-de-rata',
                name: 'Pulpe de rață',
                newPrice: 24.99,
                category: 'Carne și mezeluri',
                categorySlug: 'carne-si-mezeluri',
                imageUrl: '/catalogs/activ/crops/pulpe.webp',
            },
        ],
        categories: ['Carne și mezeluri'],
        isActive: true,
    },
    {
        slug: 'catalog-lidl-arhiva',
        title: 'Catalog Lidl arhivă',
        description: 'Oferte arhivate',
        startDate: '2026-04-27',
        endDate: '2026-05-03',
        coverImage: '/catalogs/arhiva/pages/page_01.webp',
        thumbnailImage: '/catalogs/arhiva/pages/thumb_01.webp',
        pages: [{ pageNumber: 1, imageUrl: '/catalogs/arhiva/pages/page_01.webp', thumbnailUrl: '/catalogs/arhiva/pages/thumb_01.webp' }],
        products: [],
        categories: [],
        isActive: false,
    },
];

test('buildSitemapIndexXml lists the public child sitemap files', () => {
    const xml = buildSitemapIndexXml(TODAY);

    assert.match(xml, /<sitemapindex xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
    assert.deepEqual(
        SITEMAP_SECTIONS.map(section => section.loc),
        [
            'https://cataloglidl.ro/sitemaps/pages.xml',
            'https://cataloglidl.ro/sitemaps/products.xml',
            'https://cataloglidl.ro/sitemaps/catalogs.xml',
            'https://cataloglidl.ro/sitemaps/stores.xml',
        ],
    );
    assert.ok(xml.includes('<loc>https://cataloglidl.ro/sitemaps/products.xml</loc>'));
    assert.ok(!xml.includes('/produs/'));
});

test('getSitemapEntries separates pages, products, catalogs and stores', () => {
    const pages = getSitemapEntries('pages', catalogs, TODAY);
    const products = getSitemapEntries('products', catalogs, TODAY);
    const catalogEntries = getSitemapEntries('catalogs', catalogs, TODAY);
    const stores = getSitemapEntries('stores', catalogs, TODAY);

    assert.ok(pages.some(entry => entry.url === 'https://cataloglidl.ro/catalog-lidl-online'));
    assert.ok(pages.some(entry => entry.url === 'https://cataloglidl.ro/categorie/fructe-si-legume'));
    assert.ok(!pages.some(entry => entry.url.includes('/produs/')));

    assert.ok(products.some(entry => entry.url.includes('/produs/')));
    assert.ok(!products.some(entry => entry.url.includes('/catalog/')));

    assert.ok(catalogEntries.some(entry => entry.url.includes('/catalog/')));
    assert.ok(catalogEntries.some(entry => entry.images && entry.images.length > 0));
    assert.ok(!catalogEntries.some(entry => entry.url.includes('/lidl/bucuresti')));

    assert.ok(stores.some(entry => entry.url === 'https://cataloglidl.ro/lidl/bucuresti'));
    assert.ok(!stores.some(entry => entry.url.includes('/produs/')));
});

test('renderUrlSetXml emits image sitemap markup when entries include images', () => {
    const xml = renderUrlSetXml([
        {
            url: 'https://cataloglidl.ro/catalog/test',
            lastModified: TODAY,
            changeFrequency: 'weekly',
            priority: 0.9,
            images: ['https://cataloglidl.ro/catalogs/test/page.webp'],
        },
    ]);

    assert.match(xml, /xmlns:image="http:\/\/www\.google\.com\/schemas\/sitemap-image\/1\.1"/);
    assert.ok(xml.includes('<image:loc>https://cataloglidl.ro/catalogs/test/page.webp</image:loc>'));
});
