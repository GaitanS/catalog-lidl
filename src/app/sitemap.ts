import { MetadataRoute } from 'next';
import { getAllCatalogs, getActiveCatalogs } from '@/data/catalogs';
import { CITIES } from './lidl/[oras]/page';
import { getCatalogImageUrl, getSeoLandingPages } from '@/lib/seo-landing-pages';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://cataloglidl.ro';
    const today = new Date().toISOString().split('T')[0];
    const allCatalogs = getAllCatalogs();
    const activeCatalogs = getActiveCatalogs();

    // Include every product that is reachable on the site (all catalogs, not just active),
    // so products that already rank on Google don't silently drop out of the sitemap when
    // a catalog expires. Products from active catalogs get higher priority and a today
    // lastmod; products from expired catalogs get lower priority and their catalog's
    // startDate, which lets Google understand they're older but still indexable.
    const activeSlugs = new Set<string>();
    activeCatalogs.forEach(c => c.products.forEach(p => activeSlugs.add(p.slug)));

    type ProductEntry = { slug: string; lastMod: string; active: boolean; imageUrl?: string };
    const seen = new Map<string, ProductEntry>();
    allCatalogs.forEach(c => {
        c.products.forEach(p => {
            const existing = seen.get(p.slug);
            const entry: ProductEntry = {
                slug: p.slug,
                lastMod: c.startDate,
                active: activeSlugs.has(p.slug),
                imageUrl: p.imageUrl ? (p.imageUrl.startsWith('http') ? p.imageUrl : `${baseUrl}${p.imageUrl}`) : undefined,
            };
            // Prefer the most recent catalog's startDate and always keep an active flag
            // if any catalog containing this product is currently active.
            if (!existing || c.startDate > existing.lastMod) {
                seen.set(p.slug, { ...entry, active: entry.active || existing?.active || false, imageUrl: entry.imageUrl || existing?.imageUrl });
            } else if (existing && entry.active) {
                existing.active = true;
                existing.imageUrl = existing.imageUrl || entry.imageUrl;
            }
        });
    });

    const staticPages: MetadataRoute.Sitemap = [
        { url: baseUrl, lastModified: today, changeFrequency: 'daily', priority: 1 },
        { url: `${baseUrl}/oferte-lidl-saptamana-asta`, lastModified: today, changeFrequency: 'daily', priority: 0.95 },
        { url: `${baseUrl}/arhiva`, lastModified: today, changeFrequency: 'weekly', priority: 0.7 },
        { url: `${baseUrl}/lidl`, lastModified: today, changeFrequency: 'weekly', priority: 0.8 },
        { url: `${baseUrl}/despre`, lastModified: '2026-01-01', changeFrequency: 'yearly', priority: 0.4 },
        { url: `${baseUrl}/contact`, lastModified: '2026-01-01', changeFrequency: 'yearly', priority: 0.4 },
        { url: `${baseUrl}/confidentialitate`, lastModified: '2026-01-01', changeFrequency: 'yearly', priority: 0.2 },
        { url: `${baseUrl}/termeni`, lastModified: '2026-01-01', changeFrequency: 'yearly', priority: 0.2 },
    ];

    const cityPages: MetadataRoute.Sitemap = CITIES.map(c => ({
        url: `${baseUrl}/lidl/${c.slug}`,
        lastModified: today,
        changeFrequency: 'weekly' as const,
        priority: 0.75,
    }));

    const seoLandingPages: MetadataRoute.Sitemap = getSeoLandingPages(allCatalogs, today).map(page => {
        const image = getCatalogImageUrl(page.primaryCatalog);
        return {
            url: page.canonical,
            lastModified: today,
            changeFrequency: 'daily' as const,
            priority: page.slug === 'catalog-lidl-online' ? 0.98 : 0.88,
            ...(image ? { images: [image] } : {}),
        };
    });

    const categoryPages: MetadataRoute.Sitemap = [
        'alimente', 'fructe-si-legume', 'carne-si-mezeluri', 'lactate',
        'panificatie', 'dulciuri', 'bauturi', 'curatenie', 'non-food', 'oua',
    ].map(slug => ({
        url: `${baseUrl}/categorie/${slug}`,
        lastModified: today,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    const catalogPages: MetadataRoute.Sitemap = allCatalogs.map(c => {
        const isActive = c.endDate >= today;
        const image = getCatalogImageUrl(c);
        return {
            url: `${baseUrl}/catalog/${c.slug}`,
            lastModified: c.startDate,
            changeFrequency: (isActive ? 'weekly' : 'monthly') as 'weekly' | 'monthly',
            priority: isActive ? 0.9 : 0.5,
            ...(image ? { images: [image] } : {}),
        };
    });

    const productPages: MetadataRoute.Sitemap = Array.from(seen.values()).map(p => ({
        url: `${baseUrl}/produs/${p.slug}`,
        lastModified: p.active ? today : p.lastMod,
        changeFrequency: (p.active ? 'weekly' : 'monthly') as 'weekly' | 'monthly',
        priority: p.active ? 0.75 : 0.5,
        ...(p.imageUrl ? { images: [p.imageUrl] } : {}),
    }));

    return [...staticPages, ...seoLandingPages, ...cityPages, ...categoryPages, ...catalogPages, ...productPages];
}
