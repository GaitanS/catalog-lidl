export interface ProductLike {
    slug: string;
    name: string;
    newPrice: number;
    category: string;
    categorySlug: string;
    brand?: string;
    description?: string;
}

export interface ProductCategory {
    category: string;
    categorySlug: string;
}

const CATEGORY_RULES: Array<ProductCategory & { patterns: RegExp[] }> = [
    {
        category: 'Fructe și legume',
        categorySlug: 'fructe-si-legume',
        patterns: [
            /fruct|legum|mere|mar\b|pere|banan|strugur|portocal|lamai|lamaie|morcov|cartof|ardei|rosii|tomate|castravet|ceapa|usturoi|salata|varza|broccoli|conopida|dovlecel|ciuperc|spanac|mazare|naut|fasole|chili|visine|padure/i,
        ],
    },
    {
        category: 'Carne și mezeluri',
        categorySlug: 'carne-si-mezeluri',
        patterns: [
            /carne|pui|porc|vita|rata|curcan|miel|pulpe|piept|ceafa|snitel|sunca|salam|carnat|mezel|pastrav|somon|peste|knuckle|pork|meat/i,
        ],
    },
    {
        category: 'Lactate',
        categorySlug: 'lactate',
        patterns: [
            /lapte|iaurt|branza|branza|cascaval|telemea|feta|unt|smantana|cheese|pilos/i,
        ],
    },
    {
        category: 'Panificație',
        categorySlug: 'panificatie',
        patterns: [
            /paine|chifla|croissant|cozonac|pasca|faina|prajitur|mini-prajituri|biscuit|foietaj|bakery/i,
        ],
    },
    {
        category: 'Băuturi',
        categorySlug: 'bauturi',
        patterns: [
            /\bapa\b|suc|cafea|bere|\bvin\b|spumant|rose|rosado|feteasca|riesling|bautur|cola|nectar|prosecco/i,
        ],
    },
    {
        category: 'Dulciuri',
        categorySlug: 'dulciuri',
        patterns: [
            /ciocolat|chocolate|dulce|napolitan|inghetata|desert|fistic|caju|bomboan|caramel|mister choc/i,
        ],
    },
    {
        category: 'Curățenie',
        categorySlug: 'curatenie',
        patterns: [
            /detergent|curaten|dezinfect|hartie igienica|servetel|w5|formil|floralys|gel de dus|sampon|sapun/i,
        ],
    },
    {
        category: 'Non-Food',
        categorySlug: 'non-food',
        patterns: [
            /parkside|silvercrest|crivit|oala|tigaie|caserola|baking paper|hartie de copt|folie|ustensil|electrocasnic|textil|gradina|bricolaj|jucarie/i,
        ],
    },
];

export const FOOD_CATEGORY_SLUGS = new Set([
    'alimente',
    'fructe-si-legume',
    'carne-si-mezeluri',
    'lactate',
    'panificatie',
    'dulciuri',
    'bauturi',
    'oua',
]);

function normalizeText(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/ș|ş/g, 's')
        .replace(/ț|ţ/g, 't')
        .toLowerCase();
}

export function inferProductCategory(name: string, description = '', brand = ''): ProductCategory {
    const haystack = normalizeText(`${name} ${description} ${brand}`);

    for (const rule of CATEGORY_RULES) {
        if (rule.patterns.some(pattern => pattern.test(haystack))) {
            return {
                category: rule.category,
                categorySlug: rule.categorySlug,
            };
        }
    }

    return {
        category: 'Alimente',
        categorySlug: 'alimente',
    };
}

export function getProductsForCategoryPage<T extends ProductLike>(categorySlug: string, products: T[]): T[] {
    if (categorySlug === 'alimente') {
        return products.filter(product => FOOD_CATEGORY_SLUGS.has(product.categorySlug));
    }

    return products.filter(product => product.categorySlug === categorySlug);
}
