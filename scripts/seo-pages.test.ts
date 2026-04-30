import test from 'node:test';
import assert from 'node:assert/strict';

import {
    SEO_LANDING_PAGE_SLUGS,
    buildSeoLandingPage,
    getSeoLandingPages,
} from '../src/lib/seo-landing-pages.ts';

const catalogs = [
    {
        slug: 'catalog-lidl-27-04-03-05-2026',
        title: 'Catalog Lidl 27.04 - 03.05.2026',
        description: 'Oferte Lidl valabile in perioada 27 aprilie - 3 mai 2026.',
        startDate: '2026-04-27',
        endDate: '2026-05-03',
        coverImage: '/catalogs/current/pages/page_01.webp',
        thumbnailImage: '/catalogs/current/pages/thumb_01.webp',
        pages: [{ pageNumber: 1, imageUrl: '/catalogs/current/pages/page_01.webp', thumbnailUrl: '/catalogs/current/pages/thumb_01.webp' }],
        products: [
            { slug: 'lapte-pilos', name: 'Lapte Pilos', newPrice: 4.99, category: 'Lactate', categorySlug: 'lactate' },
        ],
        categories: ['Lactate'],
        isActive: true,
    },
    {
        slug: 'catalog-lidl-04-05-10-05-2026',
        title: 'Catalog Lidl 04.05 - 10.05.2026',
        description: 'Oferte Lidl valabile in perioada 4 - 10 mai 2026.',
        startDate: '2026-05-04',
        endDate: '2026-05-10',
        coverImage: '/catalogs/next/pages/page_01.webp',
        thumbnailImage: '/catalogs/next/pages/thumb_01.webp',
        pages: [{ pageNumber: 1, imageUrl: '/catalogs/next/pages/page_01.webp', thumbnailUrl: '/catalogs/next/pages/thumb_01.webp' }],
        products: [
            { slug: 'parkside-bormasina', name: 'Bormasina Parkside 20V', newPrice: 199, category: 'Non-Food', categorySlug: 'non-food', brand: 'Parkside' },
        ],
        categories: ['Non-Food'],
        isActive: true,
    },
    {
        slug: 'catalog-lidl-20-04-26-04-2026',
        title: 'Catalog Lidl 20.04 - 26.04.2026',
        description: 'Catalog Lidl anterior.',
        startDate: '2026-04-20',
        endDate: '2026-04-26',
        coverImage: '/catalogs/previous/pages/page_01.webp',
        thumbnailImage: '/catalogs/previous/pages/thumb_01.webp',
        pages: [{ pageNumber: 1, imageUrl: '/catalogs/previous/pages/page_01.webp', thumbnailUrl: '/catalogs/previous/pages/thumb_01.webp' }],
        products: [],
        categories: [],
        isActive: false,
    },
];

test('defines all Google SERP landing pages', () => {
    assert.deepEqual(SEO_LANDING_PAGE_SLUGS, [
        'catalog-lidl-online',
        'catalog-lidl-pdf',
        'catalog-lidl-joi',
        'catalog-lidl-parkside',
        'catalog-lidl-saptamana-viitoare',
        'catalog-lidl-saptamana-trecuta',
    ]);
});

test('builds current catalog landing page with date-first metadata', () => {
    const page = buildSeoLandingPage('catalog-lidl-online', catalogs, '2026-04-30');

    assert.equal(page.slug, 'catalog-lidl-online');
    assert.match(page.title, /^Catalog Lidl 27\.04\.2026 - 03\.05\.2026/);
    assert.match(page.description, /catalogul Lidl online/i);
    assert.equal(page.primaryCatalog?.slug, 'catalog-lidl-27-04-03-05-2026');
});

test('builds next-week and Parkside landing pages from catalog data', () => {
    const nextWeek = buildSeoLandingPage('catalog-lidl-saptamana-viitoare', catalogs, '2026-04-30');
    const parkside = buildSeoLandingPage('catalog-lidl-parkside', catalogs, '2026-04-30');

    assert.equal(nextWeek.primaryCatalog?.slug, 'catalog-lidl-04-05-10-05-2026');
    assert.match(nextWeek.title, /04\.05\.2026 - 10\.05\.2026/);
    assert.equal(parkside.featuredProducts[0]?.slug, 'parkside-bormasina');
    assert.match(parkside.h1, /Parkside/);
});

test('returns sitemap-ready landing pages in stable order', () => {
    const pages = getSeoLandingPages(catalogs, '2026-04-30');

    assert.equal(pages.length, 6);
    assert.equal(pages[0].slug, 'catalog-lidl-online');
    assert.ok(pages.every(page => page.canonical.startsWith('https://cataloglidl.ro/')));
});
