import { buildSitemapIndexXml, sitemapXmlResponse } from '@/lib/sitemap-sections';

export function GET() {
    return sitemapXmlResponse(buildSitemapIndexXml());
}
