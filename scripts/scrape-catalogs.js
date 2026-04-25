/**
 * Lidl Catalog Scraper (tiendeo.ro + Shopfully Publication API)
 *
 * Flow:
 *   1. Fetch https://www.tiendeo.ro/cataloage-oferte/lidl
 *      → JSON-LD SaleEvents give us {title, startDate, endDate, imageId}
 *   2. For each catalog, fetch https://www.tiendeo.ro/cataloage/{id}
 *      → extract "publication_url": "http://viewer.zmags.com/publication/ro_ro_NNNNN"
 *   3. Fetch Shopfully publication pages API:
 *      https://shopfully-publication-api.global.ssl.fastly.net/publication_pages/ro_ro/{N}/1?format=all
 *      → JSON of page_N → resourcePath list at multiple resolutions
 *   4. Download each page's level_5 (1200x2036) .webp to public/catalogs/{slug}/pages/
 *   5. Emit src/data/catalogs-scraped.json
 *
 * USAGE:
 *   node scripts/scrape-catalogs.js
 *
 * CRON:
 *   0 7 * * 1 cd /var/www/catalog-lidl && node scripts/scrape-catalogs.js && npm run build && pm2 restart catalog-lidl
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const LISTING_URL = 'https://www.tiendeo.ro/cataloage-oferte/lidl';
const DETAIL_URL = (id) => `https://www.tiendeo.ro/cataloage/${id}`;
const PAGES_API = (pubNum) =>
    `https://shopfully-publication-api.global.ssl.fastly.net/publication_pages/ro_ro/${pubNum}/1?format=all`;
const ENRICH_API = (pubNum, page) =>
    `https://shopfully-publication-api.global.ssl.fastly.net/publication_pages/ro_ro/${pubNum}/enr/${page}`;

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'catalogs');
const DATA_FILE = path.join(__dirname, '..', 'src', 'data', 'catalogs-scraped.json');
const LOG_DIR = path.join(__dirname, '..', 'logs');
const LOG_FILE = path.join(LOG_DIR, 'scraper.log');

const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';
const REFERER = 'https://www.tiendeo.ro/';

function fetchUrl(url, redirectCount = 0) {
    return new Promise((resolve, reject) => {
        if (redirectCount > 5) return reject(new Error('Too many redirects'));
        const lib = url.startsWith('https') ? https : http;
        const req = lib.get(
            url,
            { headers: { 'User-Agent': UA, 'Accept': '*/*', 'Referer': REFERER } },
            (res) => {
                if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                    const nextUrl = res.headers.location.startsWith('http')
                        ? res.headers.location
                        : new URL(res.headers.location, url).href;
                    res.resume();
                    return fetchUrl(nextUrl, redirectCount + 1).then(resolve).catch(reject);
                }
                if (res.statusCode >= 400) {
                    res.resume();
                    return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
                }
                const chunks = [];
                res.on('data', chunk => chunks.push(chunk));
                res.on('end', () => resolve(Buffer.concat(chunks)));
                res.on('error', reject);
            }
        );
        req.on('error', reject);
        req.setTimeout(30000, () => req.destroy(new Error(`Timeout: ${url}`)));
    });
}

async function downloadImage(url, filePath) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (fs.existsSync(filePath) && fs.statSync(filePath).size > 1000) {
        return { cached: true, size: fs.statSync(filePath).size };
    }
    const buffer = await fetchUrl(url);
    fs.writeFileSync(filePath, buffer);
    return { cached: false, size: buffer.length };
}

/**
 * Recursively walk JSON-LD and collect SaleEvent entries.
 */
function collectSaleEvents(node, out = []) {
    if (!node || typeof node !== 'object') return out;
    if (Array.isArray(node)) {
        for (const item of node) collectSaleEvents(item, out);
        return out;
    }
    if (node['@type'] === 'SaleEvent') out.push(node);
    if (node.itemListElement) collectSaleEvents(node.itemListElement, out);
    if (node['@graph']) collectSaleEvents(node['@graph'], out);
    return out;
}

function parseListingCatalogs(html) {
    const catalogs = [];
    const seenId = new Set();
    const jsonLdMatches = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi) || [];

    for (const match of jsonLdMatches) {
        try {
            const jsonStr = match.replace(/<script[^>]*>/, '').replace(/<\/script>/, '').trim();
            const data = JSON.parse(jsonStr);
            const events = collectSaleEvents(data);
            for (const ev of events) {
                // Extract flyer id from image URL: .../volantini/small_53242@2x_webp.webp
                const imgId = (ev.image || '').match(/\/volantini\/(?:small|big)_(\d+)/);
                if (!imgId) continue;
                const id = imgId[1];
                if (seenId.has(id)) continue;
                seenId.add(id);
                catalogs.push({
                    id,
                    title: ev.name || 'Catalog Lidl',
                    description: ev.description || '',
                    startDate: (ev.startDate || '').split('T')[0],
                    endDate: (ev.endDate || '').split('T')[0],
                });
            }
        } catch {
            // Skip malformed JSON-LD blocks
        }
    }
    return catalogs;
}

/**
 * Extract publication_url from a tiendeo catalog detail page.
 * Returns the publication numeric id (e.g. "52519") or null.
 */
function extractPublicationId(html) {
    // "publication_url":"http://viewer.zmags.com/publication/ro_ro_52519"
    const m = html.match(/"publication_url":"http[s]?:\\?\/\\?\/viewer\.zmags\.com\\?\/publication\\?\/ro_ro_(\d+)"/);
    return m ? m[1] : null;
}

/**
 * Slug: stable + SEO-friendly.
 */
function generateSlug(title, startDate) {
    const date = (startDate || '').split('T')[0];
    const clean = (title || 'catalog-lidl')
        .toLowerCase()
        .replace(/ă/g, 'a').replace(/â/g, 'a').replace(/î/g, 'i')
        .replace(/ș|ş/g, 's').replace(/ț|ţ/g, 't')
        .replace(/[^a-z0-9\s-]/g, ' ')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    return date ? `${clean}-${date}` : clean;
}

function isActive(startDate, endDate) {
    if (!startDate || !endDate) return false;
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return now >= start && now <= end;
}

/**
 * Pick the largest (level_5 or fallback max) webp resource from a pageRepresentationDescriptors array.
 */
function pickBestImage(descriptors) {
    if (!Array.isArray(descriptors) || !descriptors.length) return null;
    const webps = descriptors.filter(d => (d.pageRepresentation?.resourcePath || '').endsWith('.webp'));
    const pool = webps.length ? webps : descriptors;
    pool.sort((a, b) => (b.width || 0) - (a.width || 0));
    const best = pool[0];
    const p = best.pageRepresentation?.resourcePath;
    if (!p) return null;
    return {
        url: p.startsWith('http') ? p : `https://${p}`,
        width: best.width || 0,
        height: best.height || 0,
    };
}

/**
 * Parse an enrichment bundle (which covers 10 pages at a time) into a flat
 * map of page→hotspot[].  The /enr/1 endpoint returns pages 1-10,
 * /enr/2 returns pages 11-20, etc.
 */
function parseEnrichmentBundle(bundleJson) {
    const byPage = {};
    for (const [pageKey, arr] of Object.entries(bundleJson)) {
        if (!/^\d+$/.test(pageKey) || !Array.isArray(arr)) continue;
        const hotspots = [];
        for (const enr of arr) {
            if (enr.type !== 'externalLink' || !enr.crop_shape) continue;
            hotspots.push({
                id: enr.id,
                page: Number(pageKey),
                crop: {
                    x: Number(enr.crop_shape.x) || 0,
                    y: Number(enr.crop_shape.y) || 0,
                    w: Number(enr.crop_shape.width) || 0,
                    h: Number(enr.crop_shape.height) || 0,
                },
                landingUrl: (enr.url || '').split('?')[0],
            });
        }
        if (hotspots.length) byPage[pageKey] = hotspots;
    }
    return byPage;
}

/**
 * Crop a product thumbnail from a full-res page image using normalized 0-1 coords.
 * Saves a 400px-wide webp.
 */
async function cropHotspot(pageImagePath, hotspot, outPath) {
    const dir = path.dirname(outPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (fs.existsSync(outPath) && fs.statSync(outPath).size > 500) return;

    const meta = await sharp(pageImagePath).metadata();
    const left = Math.round(hotspot.crop.x * meta.width);
    const top = Math.round(hotspot.crop.y * meta.height);
    const width = Math.min(Math.round(hotspot.crop.w * meta.width), meta.width - left);
    const height = Math.min(Math.round(hotspot.crop.h * meta.height), meta.height - top);
    if (width < 10 || height < 10) return;

    await sharp(pageImagePath)
        .extract({ left, top, width, height })
        .webp({ quality: 85 })
        .toFile(outPath);
}

/**
 * Translate common English/non-Romanian product names to Romanian.
 */
const NAME_TRANSLATIONS = {
    'almonds': 'Migdale',
    'kashkaval cheese': 'Cașcaval',
    'antipasti plate greek style': 'Platou antipasti stil grecesc',
    'vegetable chips with sea salt': 'Chips de legume cu sare de mare',
    'dried tomatoes with rosemary': 'Roșii uscate cu rozmarin',
    'wine chocolate': 'Ciocolată cu vin',
};

function translateName(name) {
    const key = name.toLowerCase().trim();
    if (NAME_TRANSLATIONS[key]) return NAME_TRANSLATIONS[key];
    // Strip "Frozen - " prefix
    if (key.startsWith('frozen - ') || key.startsWith('frozen -')) {
        return name.replace(/^Frozen\s*-\s*/i, '');
    }
    return name;
}

/**
 * Extract ALL product data from tiendeo detail page's __NEXT_DATA__ → flyerGibsData.
 * Each flyerGib contains: id, title, description, image_url (CDN crop), price,
 * starting_price, sale, flyer_page — everything we need in one place.
 * Returns array of fully-formed product objects (not a Map).
 */
function extractProducts(detailHtml) {
    const products = [];

    const nextMatch = detailHtml.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
    if (!nextMatch) return products;

    try {
        const nd = JSON.parse(nextMatch[1]);
        const gibs = nd.props?.pageProps?.apiResources?.flyerGibsData?.flyerGibs;
        if (!Array.isArray(gibs)) return products;

        for (const g of gibs) {
            if (!g.id || g.type !== 'crop') continue;
            const s = g.settings || {};

            const rawName = (g.title || '').replace(/[\t\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
            if (!rawName) continue;
            const name = translateName(rawName);

            const price = parseFloat(s.price_extended?.digits) || 0;
            const oldPrice = parseFloat(s.starting_price?.digits) || 0;

            // Calculate real discount from prices (more reliable than s.sale text)
            let discount = '';
            if (oldPrice > 0 && price > 0 && oldPrice > price) {
                const pct = Math.round((1 - price / oldPrice) * 100);
                discount = `-${pct}%`;
            } else if (s.sale && typeof s.sale === 'string' && s.sale.includes('%')) {
                discount = s.sale;
            } else if (s.sale) {
                // Non-percentage promo text like "3 la pret de 2"
                discount = s.sale;
            }

            const description = (g.description || '').replace(/[\t\r\n]+/g, ' ').trim();
            const page = parseInt(s.flyer_page) || 1;
            const imageUrl = g.image || s.image_url || '';

            products.push({
                id: g.id,
                name,
                description,
                price,
                oldPrice,
                discount,
                page,
                imageUrl,  // CDN image — no manual cropping needed
                imagePath: '',  // will be set after download
                landingUrl: g.href || '',
            });
        }
    } catch {
        // Skip on parse error
    }

    return products;
}

async function scrapeCatalog(catalog) {
    const { id, title, startDate, endDate } = catalog;
    const slug = generateSlug(title, startDate);
    console.log(`→ [${id}] ${title}`);
    console.log(`  slug:  ${slug}`);
    console.log(`  valid: ${startDate} → ${endDate}`);

    // Step 1: fetch detail page to get publication_url
    const detailHtml = (await fetchUrl(DETAIL_URL(id))).toString('utf-8');
    const pubId = extractPublicationId(detailHtml);
    if (!pubId) {
        console.log(`  ✗ no publication_url found`);
        return null;
    }
    console.log(`  pub:   ro_ro_${pubId}`);

    // Step 2: fetch pages API
    const pagesRaw = (await fetchUrl(PAGES_API(pubId))).toString('utf-8');
    let pagesData;
    try {
        pagesData = JSON.parse(pagesRaw);
    } catch (e) {
        console.log(`  ✗ pages JSON parse failed: ${e.message}`);
        return null;
    }

    // Map numeric keys (page numbers) → ordered list
    const pageKeys = Object.keys(pagesData).filter(k => /^\d+$/.test(k)).sort((a, b) => Number(a) - Number(b));
    if (!pageKeys.length) {
        console.log(`  ✗ no pages in response`);
        return null;
    }
    console.log(`  pages: ${pageKeys.length}`);

    // Step 3: download each page at highest webp resolution
    const catalogDir = path.join(OUTPUT_DIR, slug, 'pages');
    const pageEntries = [];
    let totalBytes = 0;

    for (const key of pageKeys) {
        const page = pagesData[key];
        const best = pickBestImage(page.pageRepresentationDescriptors);
        if (!best) continue;

        const pageNum = Number(key);
        const fileName = `page_${String(pageNum).padStart(2, '0')}.webp`;
        const localFile = path.join(catalogDir, fileName);

        try {
            const res = await downloadImage(best.url, localFile);
            totalBytes += res.size;
            const tag = res.cached ? '⊙' : '✓';
            process.stdout.write(`  ${tag} p${pageNum} (${(res.size / 1024).toFixed(0)}KB) `);
        } catch (err) {
            console.log(`\n  ✗ page ${pageNum} download failed: ${err.message}`);
            continue;
        }

        pageEntries.push({
            pageNumber: pageNum,
            imagePath: `/catalogs/${slug}/pages/${fileName}`,
            width: best.width,
            height: best.height,
        });
    }
    console.log(`\n  total: ${(totalBytes / 1024 / 1024).toFixed(2)}MB`);

    // Step 4: extract products from flyerGibs (complete data: name, price, page)
    const products = extractProducts(detailHtml);
    console.log(`  products: ${products.length} from flyerGibs`);

    // Step 5: download product images from Shopfully CDN
    // CDN images are guaranteed correct (same source as name/price)
    const cropsDir = path.join(OUTPUT_DIR, slug, 'crops');
    let downloadCount = 0;
    for (const product of products) {
        if (!product.imageUrl) continue;
        const localFile = path.join(cropsDir, `${product.id}.webp`);
        const localPath = `/catalogs/${slug}/crops/${product.id}.webp`;
        try {
            const url = product.imageUrl.startsWith('http') ? product.imageUrl : `https://${product.imageUrl}`;
            // Download and convert to consistent webp format
            const buffer = await fetchUrl(url);
            const dir = path.dirname(localFile);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            if (!fs.existsSync(localFile) || fs.statSync(localFile).size < 500) {
                await sharp(buffer)
                    .resize({ width: 400, withoutEnlargement: false, kernel: 'lanczos3' })
                    .webp({ quality: 90 })
                    .toFile(localFile);
            }
            product.imagePath = localPath;
            downloadCount++;
        } catch {
            // Keep product without image
        }
    }
    console.log(`  images: ${downloadCount} from CDN (upscaled to 400px)`);

    // Generate cover thumbnail (400px wide) for homepage cards
    let coverThumb = pageEntries[0]?.imagePath || '';
    if (pageEntries[0]) {
        const thumbFile = path.join(OUTPUT_DIR, slug, 'pages', 'thumb_01.webp');
        const thumbPath = `/catalogs/${slug}/pages/thumb_01.webp`;
        const srcFile = path.join(OUTPUT_DIR, slug, 'pages', 'page_01.webp');
        try {
            if (fs.existsSync(srcFile)) {
                await sharp(srcFile)
                    .resize({ width: 400 })
                    .webp({ quality: 80 })
                    .toFile(thumbFile);
                coverThumb = thumbPath;
            }
        } catch {}
    }

    const enrichmentsByPage = {};

    return {
        slug,
        sourceId: id,
        publicationId: pubId,
        title,
        description: `Catalog Lidl valabil ${startDate} — ${endDate}`,
        startDate,
        endDate,
        coverImage: pageEntries[0]?.imagePath || '',
        coverThumb,
        pages: pageEntries,
        hotspots: enrichmentsByPage,
        products,
        isActive: isActive(startDate, endDate),
        scrapedAt: new Date().toISOString(),
    };
}

/**
 * Append a JSON log entry to logs/scraper.log
 */
function writeLog(entry) {
    if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
    const line = JSON.stringify(entry) + '\n';
    fs.appendFileSync(LOG_FILE, line, 'utf-8');
}

async function main() {
    console.log('━━━ Lidl Catalog Scraper (tiendeo/Shopfully) ━━━\n');
    console.log(`Listing: ${LISTING_URL}\n`);

    const startTime = Date.now();
    const logEntry = {
        timestamp: new Date().toISOString(),
        status: 'running',
        catalogsFound: 0,
        catalogsScraped: 0,
        totalPages: 0,
        totalProducts: 0,
        errors: [],
        durationMs: 0,
    };

    try {
        const listingHtml = (await fetchUrl(LISTING_URL)).toString('utf-8');
        const rawCatalogs = parseListingCatalogs(listingHtml);
        console.log(`Found ${rawCatalogs.length} catalogs in JSON-LD\n`);
        logEntry.catalogsFound = rawCatalogs.length;

        if (!rawCatalogs.length) {
            logEntry.status = 'error';
            logEntry.errors.push('No catalogs parsed — tiendeo.ro structure may have changed');
            logEntry.durationMs = Date.now() - startTime;
            writeLog(logEntry);
            console.log('No catalogs parsed.');
            process.exit(1);
        }

        const results = [];
        for (const raw of rawCatalogs) {
            if (!raw.startDate || !raw.endDate) {
                console.log(`⊙  Skip "${raw.title}" — missing dates`);
                logEntry.errors.push(`Skip "${raw.title}" — missing dates`);
                continue;
            }
            try {
                const scraped = await scrapeCatalog(raw);
                if (scraped) results.push(scraped);
            } catch (err) {
                console.log(`  ✗ failed: ${err.message}`);
                logEntry.errors.push(`${raw.title}: ${err.message}`);
            }
            console.log('');
        }

        // Sort: active first, then by startDate desc
        results.sort((a, b) => {
            if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
            return b.startDate.localeCompare(a.startDate);
        });

        fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
        fs.writeFileSync(DATA_FILE, JSON.stringify(results, null, 2), 'utf-8');

        const totalPages = results.reduce((s, c) => s + c.pages.length, 0);
        const totalProducts = results.reduce((s, c) => s + (c.products || []).length, 0);

        logEntry.status = 'success';
        logEntry.catalogsScraped = results.length;
        logEntry.totalPages = totalPages;
        logEntry.totalProducts = totalProducts;
        logEntry.activeCatalogs = results.filter(r => r.isActive).length;
        logEntry.durationMs = Date.now() - startTime;
        writeLog(logEntry);

        console.log(`━━━ Done ━━━`);
        console.log(`✓ ${results.length} catalogs → ${path.relative(process.cwd(), DATA_FILE)}`);
        console.log(`  Active: ${results.filter(r => r.isActive).length}`);
        console.log(`  Archive: ${results.filter(r => !r.isActive).length}`);
        console.log(`  Total pages: ${totalPages}`);
        console.log(`  Total products: ${totalProducts}`);
    } catch (err) {
        logEntry.status = 'error';
        logEntry.errors.push(err.message);
        logEntry.durationMs = Date.now() - startTime;
        writeLog(logEntry);
        throw err;
    }
}

main().catch(err => {
    console.error('✗ Error:', err.message);
    console.error(err.stack);
    process.exit(1);
});
