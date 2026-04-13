import { MetadataRoute } from 'next';
import { getAllCatalogs, getActiveCatalogs } from '@/data/catalogs';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://cataloglidl.ro';
    const today = new Date().toISOString().split('T')[0];
    const allCatalogs = getAllCatalogs();
    const activeCatalogs = getActiveCatalogs();

    // Only include products from catalogs that are still active (end date >= today).
    // Expired-catalog products get removed from the sitemap so Google stops wasting crawl
    // budget on stale URLs that will 404 or redirect after the catalog rotates.
    const activeProductSlugs = new Set<string>();
    const productLastMod = new Map<string, string>();
    activeCatalogs.forEach(c => {
        c.products.forEach(p => {
            if (!activeProductSlugs.has(p.slug)) {
                activeProductSlugs.add(p.slug);
                productLastMod.set(p.slug, c.startDate);
            }
        });
    });

    const staticPages: MetadataRoute.Sitemap = [
        { url: baseUrl, lastModified: today, changeFrequency: 'daily', priority: 1 },
        { url: `${baseUrl}/arhiva`, lastModified: today, changeFrequency: 'weekly', priority: 0.6 },
        { url: `${baseUrl}/despre`, lastModified: '2026-01-01', changeFrequency: 'yearly', priority: 0.4 },
        { url: `${baseUrl}/contact`, lastModified: '2026-01-01', changeFrequency: 'yearly', priority: 0.4 },
        { url: `${baseUrl}/confidentialitate`, lastModified: '2026-01-01', changeFrequency: 'yearly', priority: 0.2 },
        { url: `${baseUrl}/termeni`, lastModified: '2026-01-01', changeFrequency: 'yearly', priority: 0.2 },
    ];

    const categoryPages: MetadataRoute.Sitemap = [
        'alimente', 'fructe-si-legume', 'carne-si-mezeluri', 'lactate',
        'panificatie', 'dulciuri', 'bauturi', 'curatenie', 'non-food', 'oua',
    ].map(slug => ({
        url: `${baseUrl}/categorie/${slug}`,
        lastModified: today,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    // Active catalogs get high priority; recently-expired ones stay in sitemap with
    // lower priority so Google can update the index, but older ones drop off entirely.
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const twoWeeksAgoStr = twoWeeksAgo.toISOString().split('T')[0];

    const catalogPages: MetadataRoute.Sitemap = allCatalogs
        .filter(c => c.endDate >= twoWeeksAgoStr)
        .map(c => {
            const isActive = c.endDate >= today;
            return {
                url: `${baseUrl}/catalog/${c.slug}`,
                lastModified: c.startDate,
                changeFrequency: (isActive ? 'weekly' : 'monthly') as 'weekly' | 'monthly',
                priority: isActive ? 0.9 : 0.4,
            };
        });

    const productPages: MetadataRoute.Sitemap = Array.from(activeProductSlugs).map(slug => ({
        url: `${baseUrl}/produs/${slug}`,
        lastModified: productLastMod.get(slug) || today,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    return [...staticPages, ...categoryPages, ...catalogPages, ...productPages];
}
