export interface CatalogPage {
    pageNumber: number;
    imageUrl: string;
    thumbnailUrl: string;
}

export interface CatalogProduct {
    slug: string;
    name: string;
    oldPrice?: number;
    newPrice: number;
    discount?: string;
    category: string;
    categorySlug: string;
    imageUrl?: string;
    unit?: string; // e.g., "1kg", "500g", "1L"
    brand?: string;
    description?: string;
}

export interface Catalog {
    slug: string;
    title: string;
    description: string;
    startDate: string; // YYYY-MM-DD
    endDate: string;
    coverImage: string;
    thumbnailImage: string;
    pages: CatalogPage[];
    products: CatalogProduct[];
    categories: string[];
    isActive: boolean;
}

function slugify(text: string): string {
    return text
        .toLowerCase()
        .replace(/ă/g, 'a').replace(/â/g, 'a').replace(/î/g, 'i')
        .replace(/ș/g, 's').replace(/ț/g, 't')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

// Realistic Lidl Romania products with typical pricing
const currentWeekProducts: CatalogProduct[] = [
    // Carne și mezeluri
    { slug: 'piept-pui-lidl', name: 'Piept de pui dezosat', oldPrice: 29.99, newPrice: 19.99, discount: '-33%', category: 'Carne și mezeluri', categorySlug: 'carne-si-mezeluri', unit: '1kg', brand: 'Lidl', description: 'Piept de pui dezosat, proaspăt, ambalat în atmosferă protectoare.' },
    { slug: 'pulpe-pui-lidl', name: 'Pulpe de pui superioare', oldPrice: 16.99, newPrice: 11.99, discount: '-29%', category: 'Carne și mezeluri', categorySlug: 'carne-si-mezeluri', unit: '1kg' },
    { slug: 'carne-tocata-vita-porc', name: 'Carne tocată vită + porc', oldPrice: 34.99, newPrice: 24.99, discount: '-28%', category: 'Carne și mezeluri', categorySlug: 'carne-si-mezeluri', unit: '500g' },
    { slug: 'salam-sibiu', name: 'Salam de Sibiu feliat', oldPrice: 12.99, newPrice: 8.99, discount: '-30%', category: 'Carne și mezeluri', categorySlug: 'carne-si-mezeluri', unit: '100g' },
    { slug: 'sunca-presata-pilos', name: 'Șuncă presată Pilos', oldPrice: 9.99, newPrice: 6.49, discount: '-35%', category: 'Carne și mezeluri', categorySlug: 'carne-si-mezeluri', unit: '100g', brand: 'Pilos' },
    { slug: 'muschi-file-porc', name: 'Mușchi file de porc', oldPrice: 39.99, newPrice: 26.99, discount: '-32%', category: 'Carne și mezeluri', categorySlug: 'carne-si-mezeluri', unit: '1kg' },

    // Lactate
    { slug: 'lapte-pilos-3-5', name: 'Lapte Pilos 3.5% grăsime', oldPrice: 6.49, newPrice: 4.99, discount: '-23%', category: 'Lactate', categorySlug: 'lactate', unit: '1L', brand: 'Pilos' },
    { slug: 'iaurt-grecesc-pilos', name: 'Iaurt grecesc Pilos 10% grăsime', oldPrice: 6.99, newPrice: 4.49, discount: '-36%', category: 'Lactate', categorySlug: 'lactate', unit: '400g', brand: 'Pilos' },
    { slug: 'branza-telemea-pilos', name: 'Brânză Telemea de vacă', oldPrice: 14.99, newPrice: 9.99, discount: '-33%', category: 'Lactate', categorySlug: 'lactate', unit: '250g', brand: 'Pilos' },
    { slug: 'unt-pilos-82', name: 'Unt Pilos 82% grăsime', oldPrice: 11.99, newPrice: 8.99, discount: '-25%', category: 'Lactate', categorySlug: 'lactate', unit: '200g', brand: 'Pilos' },
    { slug: 'branza-feta-eridanous', name: 'Brânză Feta Eridanous', oldPrice: 13.99, newPrice: 9.49, discount: '-32%', category: 'Lactate', categorySlug: 'lactate', unit: '200g', brand: 'Eridanous' },
    { slug: 'smantana-pilos-20', name: 'Smântână Pilos 20% grăsime', oldPrice: 5.49, newPrice: 3.99, discount: '-27%', category: 'Lactate', categorySlug: 'lactate', unit: '400g', brand: 'Pilos' },

    // Fructe și legume
    { slug: 'banane-lidl', name: 'Banane', oldPrice: 5.99, newPrice: 3.99, discount: '-33%', category: 'Fructe și legume', categorySlug: 'fructe-si-legume', unit: '1kg' },
    { slug: 'mere-roșii', name: 'Mere roșii', oldPrice: 4.99, newPrice: 3.49, discount: '-30%', category: 'Fructe și legume', categorySlug: 'fructe-si-legume', unit: '1kg' },
    { slug: 'rosii-cherry', name: 'Roșii cherry', oldPrice: 12.99, newPrice: 8.99, discount: '-30%', category: 'Fructe și legume', categorySlug: 'fructe-si-legume', unit: '500g' },
    { slug: 'castraveti-lungi', name: 'Castraveți lungi', oldPrice: 9.99, newPrice: 6.99, discount: '-30%', category: 'Fructe și legume', categorySlug: 'fructe-si-legume', unit: '1kg' },
    { slug: 'cartofi-noi', name: 'Cartofi noi', oldPrice: 4.99, newPrice: 2.99, discount: '-40%', category: 'Fructe și legume', categorySlug: 'fructe-si-legume', unit: '1kg' },
    { slug: 'lamai', name: 'Lămâi', oldPrice: 9.99, newPrice: 6.99, discount: '-30%', category: 'Fructe și legume', categorySlug: 'fructe-si-legume', unit: '1kg' },

    // Alimente de bază
    { slug: 'ulei-floarea-soarelui', name: 'Ulei de floarea soarelui', oldPrice: 9.99, newPrice: 7.49, discount: '-25%', category: 'Alimente de bază', categorySlug: 'alimente', unit: '1L' },
    { slug: 'faina-alba-000', name: 'Făină albă 000', oldPrice: 4.49, newPrice: 2.99, discount: '-33%', category: 'Alimente de bază', categorySlug: 'alimente', unit: '1kg' },
    { slug: 'zahar-alb', name: 'Zahăr alb cristal', oldPrice: 5.99, newPrice: 3.99, discount: '-33%', category: 'Alimente de bază', categorySlug: 'alimente', unit: '1kg' },
    { slug: 'paste-combino', name: 'Paste Combino', oldPrice: 4.99, newPrice: 2.99, discount: '-40%', category: 'Alimente de bază', categorySlug: 'alimente', unit: '500g', brand: 'Combino' },
    { slug: 'orez-bonafarm', name: 'Orez rotund Bonafarm', oldPrice: 5.99, newPrice: 3.99, discount: '-33%', category: 'Alimente de bază', categorySlug: 'alimente', unit: '1kg' },

    // Dulciuri
    { slug: 'ciocolata-fin-carre', name: 'Ciocolată Fin Carré cu lapte', oldPrice: 7.49, newPrice: 4.99, discount: '-33%', category: 'Dulciuri', categorySlug: 'dulciuri', unit: '200g', brand: 'Fin Carré' },
    { slug: 'biscuiti-sondey', name: 'Biscuiți Sondey', oldPrice: 5.99, newPrice: 3.99, discount: '-33%', category: 'Dulciuri', categorySlug: 'dulciuri', unit: '400g', brand: 'Sondey' },
    { slug: 'napolitane-mister-choc', name: 'Napolitane Mister Choc', oldPrice: 8.99, newPrice: 5.99, discount: '-33%', category: 'Dulciuri', categorySlug: 'dulciuri', unit: '300g', brand: 'Mister Choc' },

    // Băuturi
    { slug: 'cafea-bellarom-boabe', name: 'Cafea Bellarom boabe', oldPrice: 29.99, newPrice: 19.99, discount: '-33%', category: 'Băuturi', categorySlug: 'bauturi', unit: '1kg', brand: 'Bellarom' },
    { slug: 'cafea-bellarom-macinata', name: 'Cafea Bellarom măcinată', oldPrice: 22.99, newPrice: 15.99, discount: '-30%', category: 'Băuturi', categorySlug: 'bauturi', unit: '500g', brand: 'Bellarom' },
    { slug: 'bere-perlenbacher', name: 'Bere Perlenbacher 6x0.5L', oldPrice: 18.99, newPrice: 12.99, discount: '-32%', category: 'Băuturi', categorySlug: 'bauturi', unit: '6x500ml', brand: 'Perlenbacher' },
    { slug: 'apa-saguaro', name: 'Apă minerală Saguaro', oldPrice: 2.49, newPrice: 1.69, discount: '-32%', category: 'Băuturi', categorySlug: 'bauturi', unit: '2L' },
    { slug: 'suc-solevita-portocale', name: 'Suc Solevita portocale', oldPrice: 6.49, newPrice: 4.49, discount: '-31%', category: 'Băuturi', categorySlug: 'bauturi', unit: '1L', brand: 'Solevita' },

    // Panificație
    { slug: 'paine-integrala', name: 'Pâine integrală feliată', oldPrice: 4.99, newPrice: 3.49, discount: '-30%', category: 'Panificație', categorySlug: 'panificatie', unit: '500g' },
    { slug: 'croissant-uri', name: 'Croissant-uri cu unt', oldPrice: 8.99, newPrice: 5.99, discount: '-33%', category: 'Panificație', categorySlug: 'panificatie', unit: '6 buc' },

    // Curățenie
    { slug: 'detergent-formil', name: 'Detergent rufe Formil', oldPrice: 34.99, newPrice: 24.99, discount: '-29%', category: 'Curățenie', categorySlug: 'curatenie', unit: '4L', brand: 'Formil' },
    { slug: 'detergent-vase-w5', name: 'Detergent vase W5', oldPrice: 8.99, newPrice: 5.99, discount: '-33%', category: 'Curățenie', categorySlug: 'curatenie', unit: '1L', brand: 'W5' },
    { slug: 'hartie-igienica-floralys', name: 'Hârtie igienică Floralys 3 straturi', oldPrice: 24.99, newPrice: 16.99, discount: '-32%', category: 'Curățenie', categorySlug: 'curatenie', unit: '10 role', brand: 'Floralys' },
    { slug: 'servetele-floralys', name: 'Șervețele Floralys', oldPrice: 6.99, newPrice: 4.99, discount: '-29%', category: 'Curățenie', categorySlug: 'curatenie', unit: '10 pachete', brand: 'Floralys' },

    // Non-Food
    { slug: 'parkside-bormasina', name: 'Bormașină acumulator Parkside 20V', oldPrice: 299.00, newPrice: 199.00, discount: '-33%', category: 'Non-Food', categorySlug: 'non-food', brand: 'Parkside' },
    { slug: 'crivit-bicicleta', name: 'Bicicletă copii Crivit 16"', oldPrice: 599.00, newPrice: 449.00, discount: '-25%', category: 'Non-Food', categorySlug: 'non-food', brand: 'Crivit' },
];

const pasteProducts: CatalogProduct[] = [
    { slug: 'miel-pulpa', name: 'Miel - pulpă', oldPrice: 54.99, newPrice: 39.99, discount: '-27%', category: 'Carne și mezeluri', categorySlug: 'carne-si-mezeluri', unit: '1kg' },
    { slug: 'miel-spata', name: 'Miel - spată', oldPrice: 49.99, newPrice: 34.99, discount: '-30%', category: 'Carne și mezeluri', categorySlug: 'carne-si-mezeluri', unit: '1kg' },
    { slug: 'cozonac-traditional', name: 'Cozonac tradițional cu nucă', oldPrice: 29.99, newPrice: 19.99, discount: '-33%', category: 'Panificație', categorySlug: 'panificatie', unit: '500g' },
    { slug: 'oua-vopsite', name: 'Ouă vopsite 10 buc', newPrice: 12.99, category: 'Ouă', categorySlug: 'oua', unit: '10 buc' },
    { slug: 'pasca-cu-branza', name: 'Pască cu brânză', oldPrice: 19.99, newPrice: 14.99, discount: '-25%', category: 'Panificație', categorySlug: 'panificatie', unit: '400g' },
    { slug: 'vin-rosu-paste', name: 'Vin roșu sec Paște', oldPrice: 24.99, newPrice: 16.99, discount: '-32%', category: 'Băuturi', categorySlug: 'bauturi', unit: '750ml' },
];

const previousWeekProducts: CatalogProduct[] = [
    { slug: 'cafea-bellarom-arhiva', name: 'Cafea Bellarom', oldPrice: 22.99, newPrice: 15.99, discount: '-30%', category: 'Băuturi', categorySlug: 'bauturi', unit: '500g', brand: 'Bellarom' },
    { slug: 'branza-telemea-arhiva', name: 'Brânză Telemea', oldPrice: 14.99, newPrice: 9.99, discount: '-33%', category: 'Lactate', categorySlug: 'lactate', unit: '250g' },
    { slug: 'detergent-arhiva', name: 'Detergent Formil', oldPrice: 32.99, newPrice: 22.99, discount: '-30%', category: 'Curățenie', categorySlug: 'curatenie', unit: '4L' },
];

// -----------------------------------------------------------------------------
// Real scraped catalog data (from tiendeo.ro + Shopfully Publication API)
// Generated by: node scripts/scrape-catalogs.js
// Falls back to hardcoded mock catalogs if empty/missing.
// -----------------------------------------------------------------------------
import scrapedData from './catalogs-scraped.json';

interface ScrapedPage {
    pageNumber: number;
    imagePath: string;
    width: number;
    height: number;
}

interface ScrapedHotspot {
    id: string;
    page: number;
    crop: { x: number; y: number; w: number; h: number };
    landingUrl: string;
}

interface ScrapedProduct {
    id: string;
    name: string;
    price: number;
    oldPrice: number;
    discount: string;
    page: number;
    imagePath: string;
    crop: { x: number; y: number; w: number; h: number };
    landingUrl: string;
}

interface ScrapedCatalog {
    slug: string;
    sourceId: string;
    publicationId: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    coverImage: string;
    pages: ScrapedPage[];
    hotspots: Record<string, ScrapedHotspot[]>;
    products?: ScrapedProduct[];
    isActive: boolean;
    scrapedAt: string;
}

/**
 * Pick the product list that best matches a scraped catalog based on title
 * keywords. Real product-level scraping isn't available (image-based flipbook),
 * so we attach curated product lists by theme.
 */
function productsForCatalog(title: string): CatalogProduct[] {
    const t = title.toLowerCase();
    if (t.includes('paste') || t.includes('paște') || t.includes('pate')) return pasteProducts;
    // Silvercrest / special tool catalogs → use non-food subset of current week
    if (t.includes('silvercrest') || t.includes('parkside') || t.includes('crivit')) {
        return currentWeekProducts.filter(p => p.categorySlug === 'non-food');
    }
    return currentWeekProducts;
}

function categoriesForProducts(products: CatalogProduct[]): string[] {
    return [...new Set(products.map(p => p.category))];
}

function buildFromScraped(scraped: ScrapedCatalog): Catalog {
    const pages: CatalogPage[] = scraped.pages.length > 0
        ? scraped.pages.map(p => ({
            pageNumber: p.pageNumber,
            imageUrl: p.imagePath,
            thumbnailUrl: p.imagePath,
        }))
        : [{ pageNumber: 1, imageUrl: scraped.coverImage || '', thumbnailUrl: scraped.coverImage || '' }];

    // Prefer real scraped products (from hotspot crops) over curated mock data
    const scrapedProducts = (scraped.products || []).filter(sp => sp.name);
    const products: CatalogProduct[] = scrapedProducts.length > 0
        ? scrapedProducts.map((sp) => ({
            slug: slugify(sp.name) || `oferta-${sp.id.substring(0, 8)}`,
            name: sp.name,
            newPrice: sp.price,
            oldPrice: sp.oldPrice || undefined,
            discount: sp.discount || undefined,
            category: 'Oferte',
            categorySlug: 'oferte',
            imageUrl: sp.imagePath,
        }))
        : productsForCatalog(scraped.title);

    return {
        slug: scraped.slug,
        title: scraped.title,
        description: scraped.description,
        startDate: scraped.startDate,
        endDate: scraped.endDate,
        coverImage: scraped.coverImage || pages[0]?.imageUrl || '',
        thumbnailImage: scraped.coverImage || pages[0]?.imageUrl || '',
        pages,
        products,
        categories: categoriesForProducts(products),
        isActive: scraped.isActive,
    };
}

const scrapedCatalogs: ScrapedCatalog[] = Array.isArray(scrapedData) ? (scrapedData as unknown as ScrapedCatalog[]) : [];

const fallbackCatalogs: Catalog[] = [
    {
        slug: 'catalog-lidl-07-04-13-04-2026',
        title: 'Catalog Lidl 07.04 - 13.04.2026',
        description: 'Oferte Lidl valabile în perioada 7-13 aprilie 2026. Reduceri la alimente, produse proaspete, băuturi și non-food.',
        startDate: '2026-04-07',
        endDate: '2026-04-13',
        coverImage: '/catalogs/2026-04-07/cover.jpg',
        thumbnailImage: '/catalogs/2026-04-07/thumb.jpg',
        pages: Array.from({ length: 32 }, (_, i) => ({
            pageNumber: i + 1,
            imageUrl: `/catalogs/2026-04-07/page-${i + 1}.jpg`,
            thumbnailUrl: `/catalogs/2026-04-07/thumb-${i + 1}.jpg`,
        })),
        products: currentWeekProducts,
        categories: ['Fructe și legume', 'Carne și mezeluri', 'Lactate', 'Dulciuri', 'Băuturi', 'Panificație', 'Alimente de bază', 'Curățenie', 'Non-Food'],
        isActive: true,
    },
    {
        slug: 'catalog-lidl-paste-2026',
        title: 'Catalog Lidl Paște 2026',
        description: 'Oferte speciale de Paște la Lidl. Miel, cozonac, ouă vopsite și preparate tradiționale românești.',
        startDate: '2026-03-30',
        endDate: '2026-04-20',
        coverImage: '/catalogs/paste-2026/cover.jpg',
        thumbnailImage: '/catalogs/paste-2026/thumb.jpg',
        pages: Array.from({ length: 24 }, (_, i) => ({
            pageNumber: i + 1,
            imageUrl: `/catalogs/paste-2026/page-${i + 1}.jpg`,
            thumbnailUrl: `/catalogs/paste-2026/thumb-${i + 1}.jpg`,
        })),
        products: pasteProducts,
        categories: ['Carne și mezeluri', 'Panificație', 'Ouă', 'Dulciuri', 'Băuturi'],
        isActive: true,
    },
    {
        slug: 'catalog-lidl-31-03-06-04-2026',
        title: 'Catalog Lidl 31.03 - 06.04.2026',
        description: 'Oferte Lidl valabile în perioada 31 martie - 6 aprilie 2026. Prețuri mici la produsele tale preferate.',
        startDate: '2026-03-31',
        endDate: '2026-04-06',
        coverImage: '/catalogs/2026-03-31/cover.jpg',
        thumbnailImage: '/catalogs/2026-03-31/thumb.jpg',
        pages: Array.from({ length: 32 }, (_, i) => ({
            pageNumber: i + 1,
            imageUrl: `/catalogs/2026-03-31/page-${i + 1}.jpg`,
            thumbnailUrl: `/catalogs/2026-03-31/thumb-${i + 1}.jpg`,
        })),
        products: previousWeekProducts,
        categories: ['Fructe și legume', 'Carne și mezeluri', 'Lactate', 'Băuturi', 'Curățenie'],
        isActive: false,
    },
];

const catalogs: Catalog[] = scrapedCatalogs.length > 0
    ? scrapedCatalogs.map(buildFromScraped)
    : fallbackCatalogs;

export function getAllCatalogs(): Catalog[] {
    return catalogs;
}

export function getActiveCatalogs(): Catalog[] {
    const today = new Date().toISOString().split('T')[0];
    return catalogs.filter(c => c.endDate >= today);
}

export function getCatalogBySlug(slug: string): Catalog | undefined {
    return catalogs.find(c => c.slug === slug);
}

export function getArchivedCatalogs(): Catalog[] {
    const today = new Date().toISOString().split('T')[0];
    return catalogs.filter(c => c.endDate < today);
}

export function getCatalogsByCategory(category: string): Catalog[] {
    return catalogs.filter(c => c.categories.includes(category));
}

export function getAllCategories(): string[] {
    const cats = new Set<string>();
    catalogs.forEach(c => c.categories.forEach(cat => cats.add(cat)));
    return Array.from(cats).sort();
}

export function getAllProducts(): CatalogProduct[] {
    const seen = new Set<string>();
    const products: CatalogProduct[] = [];
    catalogs.filter(c => c.isActive).forEach(c => {
        c.products.forEach(p => {
            if (!seen.has(p.slug)) {
                seen.add(p.slug);
                products.push(p);
            }
        });
    });
    return products;
}

export function getProductBySlug(slug: string): { product: CatalogProduct; catalog: Catalog } | undefined {
    for (const catalog of catalogs) {
        const product = catalog.products.find(p => p.slug === slug);
        if (product) return { product, catalog };
    }
    return undefined;
}

export function getAllProductSlugs(): string[] {
    const slugs = new Set<string>();
    catalogs.forEach(c => c.products.forEach(p => slugs.add(p.slug)));
    return Array.from(slugs);
}

export function getProductsByCategorySlug(categorySlug: string): CatalogProduct[] {
    const seen = new Set<string>();
    const products: CatalogProduct[] = [];
    catalogs.filter(c => c.isActive).forEach(c => {
        c.products.filter(p => p.categorySlug === categorySlug).forEach(p => {
            if (!seen.has(p.slug)) {
                seen.add(p.slug);
                products.push(p);
            }
        });
    });
    return products;
}

export { slugify };
