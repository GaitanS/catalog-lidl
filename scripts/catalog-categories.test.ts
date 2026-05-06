import test from 'node:test';
import assert from 'node:assert/strict';

import {
    getProductsForCategoryPage,
    inferProductCategory,
} from '../src/data/category-utils.ts';

test('inferProductCategory classifies scraped food products into useful SEO categories', () => {
    assert.deepEqual(inferProductCategory('Pulpe de rață', ''), {
        category: 'Carne și mezeluri',
        categorySlug: 'carne-si-mezeluri',
    });
    assert.deepEqual(inferProductCategory('Morcovi Bio', ''), {
        category: 'Fructe și legume',
        categorySlug: 'fructe-si-legume',
    });
    assert.deepEqual(inferProductCategory('Pâine integrală', ''), {
        category: 'Panificație',
        categorySlug: 'panificatie',
    });
    assert.deepEqual(inferProductCategory('Vin spumant dulce', ''), {
        category: 'Băuturi',
        categorySlug: 'bauturi',
    });
    assert.deepEqual(inferProductCategory('Oală sub presiune', 'Capacitate: 6 L'), {
        category: 'Non-Food',
        categorySlug: 'non-food',
    });
});

test('getProductsForCategoryPage keeps alimente focused on food products', () => {
    const products = [
        { slug: 'morcovi', name: 'Morcovi Bio', newPrice: 3.99, category: 'Fructe și legume', categorySlug: 'fructe-si-legume' },
        { slug: 'pulpe-rata', name: 'Pulpe de rață', newPrice: 24.99, category: 'Carne și mezeluri', categorySlug: 'carne-si-mezeluri' },
        { slug: 'oala', name: 'Oală sub presiune', newPrice: 99.99, category: 'Non-Food', categorySlug: 'non-food' },
        { slug: 'detergent', name: 'Detergent rufe', newPrice: 19.99, category: 'Curățenie', categorySlug: 'curatenie' },
    ];

    assert.deepEqual(
        getProductsForCategoryPage('alimente', products).map(p => p.slug),
        ['morcovi', 'pulpe-rata'],
    );
});
