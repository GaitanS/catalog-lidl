import type { Catalog, CatalogProduct } from '@/data/catalogs';

export const SEO_LANDING_PAGE_SLUGS = [
    'catalog-lidl-online',
    'catalog-lidl-pdf',
    'catalog-lidl-joi',
    'catalog-lidl-parkside',
    'catalog-lidl-saptamana-viitoare',
    'catalog-lidl-saptamana-trecuta',
] as const;

export type SeoLandingPageSlug = (typeof SEO_LANDING_PAGE_SLUGS)[number];

export interface SeoLandingPage {
    slug: SeoLandingPageSlug;
    title: string;
    h1: string;
    description: string;
    intro: string;
    canonical: string;
    keywords: string[];
    primaryCatalog?: Catalog;
    secondaryCatalogs: Catalog[];
    featuredProducts: CatalogProduct[];
    faq: { question: string; answer: string }[];
}

const BASE_URL = 'https://cataloglidl.ro';

function asIsoDate(dateIso?: string): string {
    return dateIso || new Date().toISOString().split('T')[0];
}

function toDate(iso: string): Date {
    return new Date(`${iso}T00:00:00`);
}

function formatNumericDate(iso: string): string {
    const date = toDate(iso);
    return date.toLocaleDateString('ro-RO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

function formatLongDate(iso: string): string {
    return toDate(iso).toLocaleDateString('ro-RO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function formatRange(catalog?: Catalog): string {
    if (!catalog) return '';
    return `${formatNumericDate(catalog.startDate)} - ${formatNumericDate(catalog.endDate)}`;
}

function sortByStartDate(catalogs: Catalog[]): Catalog[] {
    return [...catalogs].sort((a, b) => a.startDate.localeCompare(b.startDate));
}

function sortByEndDateDesc(catalogs: Catalog[]): Catalog[] {
    return [...catalogs].sort((a, b) => b.endDate.localeCompare(a.endDate));
}

function getCurrentCatalog(catalogs: Catalog[], todayIso: string): Catalog | undefined {
    const containingToday = catalogs.filter(c => c.startDate <= todayIso && c.endDate >= todayIso);
    const pool = containingToday.length > 0 ? containingToday : catalogs.filter(c => c.endDate >= todayIso);
    return sortByStartDate(pool)[0] || sortByEndDateDesc(catalogs)[0];
}

function getNextCatalog(catalogs: Catalog[], todayIso: string): Catalog | undefined {
    return sortByStartDate(catalogs.filter(c => c.startDate > todayIso))[0];
}

function getPreviousCatalog(catalogs: Catalog[], todayIso: string): Catalog | undefined {
    return sortByEndDateDesc(catalogs.filter(c => c.endDate < todayIso))[0];
}

function startsOnThursday(catalog: Catalog): boolean {
    return toDate(catalog.startDate).getDay() === 4;
}

function getThursdayCatalog(catalogs: Catalog[], todayIso: string): Catalog | undefined {
    const eligible = catalogs.filter(c =>
        c.endDate >= todayIso && (
            startsOnThursday(c) ||
            /joi|non-food|silvercrest|parkside/i.test(`${c.title} ${c.description}`)
        )
    );
    return sortByStartDate(eligible)[0] || getCurrentCatalog(catalogs, todayIso);
}

function isParksideProduct(product: CatalogProduct): boolean {
    return /parkside/i.test(`${product.name} ${product.brand || ''} ${product.description || ''}`);
}

function getParksideCatalog(catalogs: Catalog[], todayIso: string): Catalog | undefined {
    const eligible = catalogs.filter(c =>
        c.endDate >= todayIso && (
            /parkside/i.test(`${c.title} ${c.description}`) ||
            c.products.some(isParksideProduct)
        )
    );
    return sortByStartDate(eligible)[0] || getThursdayCatalog(catalogs, todayIso);
}

function getFeaturedProducts(catalog?: Catalog, mode?: SeoLandingPageSlug): CatalogProduct[] {
    if (!catalog) return [];
    if (mode === 'catalog-lidl-parkside') {
        const parkside = catalog.products.filter(isParksideProduct);
        return (parkside.length > 0 ? parkside : catalog.products.filter(p => p.categorySlug === 'non-food')).slice(0, 12);
    }
    return catalog.products.slice(0, 12);
}

function relatedCatalogs(catalogs: Catalog[], primary: Catalog | undefined, todayIso: string): Catalog[] {
    return catalogs
        .filter(c => c.slug !== primary?.slug)
        .filter(c => c.endDate >= todayIso || c.isActive)
        .slice(0, 4);
}

function makeFaq(slug: SeoLandingPageSlug, primary?: Catalog) {
    const range = primary ? formatRange(primary) : 'perioada curenta';
    const base = [
        {
            question: 'Cand apare catalogul nou Lidl?',
            answer: 'Catalogul principal Lidl apare lunea, iar ofertele speciale de joi aduc de obicei produse non-food, scule, electrocasnice, textile si articole pentru casa.',
        },
        {
            question: 'Este acelasi catalog in toate magazinele Lidl?',
            answer: 'Da, catalogul saptamanal este in general acelasi in magazinele Lidl din Romania. Stocul poate varia local, mai ales la ofertele limitate.',
        },
    ];

    if (slug === 'catalog-lidl-pdf') {
        return [
            { question: 'Pot vedea catalogul Lidl PDF online?', answer: `Da. Pe aceasta pagina poti rasfoi catalogul Lidl pentru ${range} direct online, fara aplicatie si fara cont.` },
            ...base,
        ];
    }

    if (slug === 'catalog-lidl-parkside') {
        return [
            { question: 'Cand apar ofertele Parkside la Lidl?', answer: 'Produsele Parkside apar de obicei in cataloagele non-food si in ofertele speciale de joi, in limita stocului disponibil.' },
            ...base,
        ];
    }

    return base;
}

export function isSeoLandingPageSlug(slug: string): slug is SeoLandingPageSlug {
    return (SEO_LANDING_PAGE_SLUGS as readonly string[]).includes(slug);
}

export function buildSeoLandingPage(slug: SeoLandingPageSlug, catalogs: Catalog[], todayIso?: string): SeoLandingPage {
    const today = asIsoDate(todayIso);
    const current = getCurrentCatalog(catalogs, today);
    const next = getNextCatalog(catalogs, today);
    const previous = getPreviousCatalog(catalogs, today);
    const thursday = getThursdayCatalog(catalogs, today);
    const parkside = getParksideCatalog(catalogs, today);

    const primaryBySlug: Record<SeoLandingPageSlug, Catalog | undefined> = {
        'catalog-lidl-online': current,
        'catalog-lidl-pdf': current,
        'catalog-lidl-joi': thursday,
        'catalog-lidl-parkside': parkside,
        'catalog-lidl-saptamana-viitoare': next,
        'catalog-lidl-saptamana-trecuta': previous || current,
    };
    const primary = primaryBySlug[slug];
    const range = formatRange(primary);
    const rangeSuffix = range ? ` ${range}` : '';
    const rangeText = range || (slug === 'catalog-lidl-saptamana-viitoare' ? 'perioada urmatoare' : 'perioada curenta');

    const pageCopy: Record<SeoLandingPageSlug, Omit<SeoLandingPage, 'slug' | 'canonical' | 'primaryCatalog' | 'secondaryCatalogs' | 'featuredProducts' | 'faq'>> = {
        'catalog-lidl-online': {
            title: `Catalog Lidl${rangeSuffix} | Oferte Lidl online`,
            h1: `Catalog Lidl online${rangeSuffix}`,
            description: `Vezi catalogul Lidl online pentru ${rangeText}: oferte, reduceri, produse alimentare si non-food. Rasfoieste rapid, fara login si fara aplicatia Lidl Plus.`,
            intro: `Aici gasesti catalogul Lidl online pentru ${rangeText}, cu ofertele saptamanii intr-un format usor de rasfoit de pe telefon sau desktop.`,
            keywords: ['catalog lidl online', 'catalog lidl', 'oferte lidl online'],
        },
        'catalog-lidl-pdf': {
            title: `Catalog Lidl PDF${rangeSuffix} | Revista Lidl online`,
            h1: `Catalog Lidl PDF si revista online${rangeSuffix}`,
            description: `Rasfoieste catalogul Lidl PDF online pentru ${rangeText}. Vezi revista Lidl actuala, produsele din oferta si reducerile valabile in Romania.`,
            intro: `Pagina aceasta grupeaza catalogul Lidl in format usor de consultat online, pentru cautarile de tip PDF, revista si pliant Lidl.`,
            keywords: ['catalog lidl pdf', 'revista lidl pdf', 'pliant lidl'],
        },
        'catalog-lidl-joi': {
            title: `Catalog Lidl de joi${rangeSuffix} | Extra oferte si non-food`,
            h1: `Catalog Lidl de joi - extra oferte${rangeSuffix}`,
            description: `Vezi catalogul Lidl de joi cu extra oferte, produse non-food, electrocasnice, textile, articole pentru casa si reduceri speciale.`,
            intro: `Ofertele de joi sunt cautate separat pentru ca aduc frecvent produse non-food si promotii tematice. Am pus aici catalogul relevant si linkuri spre produsele active.`,
            keywords: ['catalog lidl joi', 'extra oferte de joi lidl', 'oferte lidl joi'],
        },
        'catalog-lidl-parkside': {
            title: `Catalog Lidl Parkside${rangeSuffix} | Scule si unelte in oferta`,
            h1: `Catalog Lidl Parkside${rangeSuffix}`,
            description: `Urmareste ofertele Parkside din catalogul Lidl: scule electrice, acumulatori, accesorii, unelte pentru casa si gradina, valabile in limita stocului.`,
            intro: `Produsele Parkside se epuizeaza rapid, asa ca pagina strange ofertele relevante din catalogul Lidl si cataloagele non-food active.`,
            keywords: ['catalog lidl parkside', 'parkside lidl', 'scule parkside lidl'],
        },
        'catalog-lidl-saptamana-viitoare': {
            title: `Catalog Lidl saptamana viitoare${rangeSuffix} | Revista noua`,
            h1: `Catalog Lidl saptamana viitoare${rangeSuffix}`,
            description: `Vezi noul catalog Lidl pentru saptamana viitoare: ${rangeText}, oferte viitoare, produse alimentare, non-food si reduceri anuntate.`,
            intro: `Daca vrei sa planifici cumparaturile din timp, aici apar ofertele Lidl pentru saptamana viitoare imediat ce catalogul este disponibil.`,
            keywords: ['catalog lidl saptamana viitoare', 'catalog lidl nou', 'revista lidl noua'],
        },
        'catalog-lidl-saptamana-trecuta': {
            title: `Catalog Lidl saptamana trecuta${rangeSuffix} | Arhiva oferte`,
            h1: `Catalog Lidl saptamana trecuta${rangeSuffix}`,
            description: `Consulta catalogul Lidl din saptamana trecuta, arhiva de oferte si reducerile care au fost valabile in ${rangeText}.`,
            intro: `Catalogul Lidl din saptamana trecuta este util pentru verificarea preturilor, comparatii si produse vazute in pliantul vechi.`,
            keywords: ['catalog lidl saptamana trecuta', 'arhiva catalog lidl', 'catalog lidl vechi'],
        },
    };

    return {
        slug,
        canonical: `${BASE_URL}/${slug}`,
        primaryCatalog: primary,
        secondaryCatalogs: relatedCatalogs(catalogs, primary, today),
        featuredProducts: getFeaturedProducts(primary, slug),
        faq: makeFaq(slug, primary),
        ...pageCopy[slug],
    };
}

export function getSeoLandingPages(catalogs: Catalog[], todayIso?: string): SeoLandingPage[] {
    return SEO_LANDING_PAGE_SLUGS.map(slug => buildSeoLandingPage(slug, catalogs, todayIso));
}

export function getSeoLandingPage(slug: string, catalogs: Catalog[], todayIso?: string): SeoLandingPage | undefined {
    if (!isSeoLandingPageSlug(slug)) return undefined;
    return buildSeoLandingPage(slug, catalogs, todayIso);
}

export function getCatalogImageUrl(catalog?: Catalog): string | undefined {
    const image = catalog?.coverImage || catalog?.thumbnailImage || catalog?.pages[0]?.imageUrl;
    if (!image) return undefined;
    return image.startsWith('http') ? image : `${BASE_URL}${image}`;
}

export function formatCatalogRangeForDisplay(catalog?: Catalog): string {
    if (!catalog) return '';
    return `${formatLongDate(catalog.startDate)} - ${formatLongDate(catalog.endDate)}`;
}
