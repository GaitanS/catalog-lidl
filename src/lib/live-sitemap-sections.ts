import { getAllCatalogs } from '../data/catalogs';
import { getSitemapEntries, SitemapKind } from './sitemap-sections';

export function getLiveSitemapEntries(kind: SitemapKind) {
    return getSitemapEntries(kind, getAllCatalogs());
}
