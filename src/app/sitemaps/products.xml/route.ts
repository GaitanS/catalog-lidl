import { getLiveSitemapEntries } from '@/lib/live-sitemap-sections';
import { renderUrlSetXml, sitemapXmlResponse } from '@/lib/sitemap-sections';

export function GET() {
    return sitemapXmlResponse(renderUrlSetXml(getLiveSitemapEntries('products')));
}
