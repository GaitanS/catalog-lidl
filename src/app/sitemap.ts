import { MetadataRoute } from 'next';
import { getAllCatalogs, getAllProductSlugs } from '@/data/catalogs';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://cataloglidl.ro';
    const catalogs = getAllCatalogs();
    const productSlugs = getAllProductSlugs();

    const staticPages: MetadataRoute.Sitemap = [
        { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
        { url: `${baseUrl}/arhiva`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
        { url: `${baseUrl}/despre`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
        { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
        { url: `${baseUrl}/confidentialitate`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
        { url: `${baseUrl}/termeni`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    ];

    const categoryPages: MetadataRoute.Sitemap = [
        'alimente', 'fructe-si-legume', 'carne-si-mezeluri', 'lactate',
        'panificatie', 'dulciuri', 'bauturi', 'curatenie', 'non-food', 'oua',
    ].map(slug => ({
        url: `${baseUrl}/categorie/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    const catalogPages: MetadataRoute.Sitemap = catalogs.map(c => ({
        url: `${baseUrl}/catalog/${c.slug}`,
        lastModified: new Date(c.startDate),
        changeFrequency: 'weekly' as const,
        priority: 0.85,
    }));

    const productPages: MetadataRoute.Sitemap = productSlugs.map(slug => ({
        url: `${baseUrl}/produs/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    return [...staticPages, ...categoryPages, ...catalogPages, ...productPages];
}
