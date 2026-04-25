import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { getActiveCatalogs, getAllProducts } from '@/data/catalogs';
import CatalogCard from '@/components/CatalogCard';
import ProductSearch from '@/components/ProductSearch';

function formatDayMonth(iso: string): string {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long' });
}

function formatShortDay(iso: string): string {
    return new Date(iso + 'T00:00:00').toLocaleDateString('ro-RO', { day: 'numeric' });
}

function formatYear(iso: string): string {
    return new Date(iso + 'T00:00:00').getFullYear().toString();
}

function buildDateRange(startDate?: string, endDate?: string): string {
    if (!startDate || !endDate) return '';
    const startMonth = new Date(startDate + 'T00:00:00').getMonth();
    const endMonth = new Date(endDate + 'T00:00:00').getMonth();
    if (startMonth === endMonth) {
        const month = new Date(endDate + 'T00:00:00').toLocaleDateString('ro-RO', { month: 'long' });
        return `${formatShortDay(startDate)}–${formatShortDay(endDate)} ${month} ${formatYear(endDate)}`;
    }
    return `${formatDayMonth(startDate)} – ${formatDayMonth(endDate)} ${formatYear(endDate)}`;
}

function pickWeeklyCatalog<T extends { startDate: string; endDate: string }>(catalogs: T[]): T | undefined {
    if (catalogs.length === 0) return undefined;
    const today = new Date().toISOString().split('T')[0];
    const containingToday = catalogs.filter(c => c.startDate <= today && c.endDate >= today);
    const pool = containingToday.length > 0 ? containingToday : catalogs;
    const sorted = [...pool].sort((a, b) => {
        const da = new Date(a.endDate).getTime() - new Date(a.startDate).getTime();
        const db = new Date(b.endDate).getTime() - new Date(b.startDate).getTime();
        return da - db || (a.endDate < b.endDate ? -1 : 1);
    });
    return sorted[0];
}

export async function generateMetadata(): Promise<Metadata> {
    const active = getActiveCatalogs();
    const main = pickWeeklyCatalog(active);
    const range = main ? buildDateRange(main.startDate, main.endDate) : '';
    const title = range
        ? `Oferte Lidl Săptămâna Asta (${range}) — Reduceri și Promoții`
        : 'Oferte Lidl Săptămâna Asta — Reduceri și Promoții Actuale';
    const offerCount = main ? main.products.filter(p => p.oldPrice && p.oldPrice > p.newPrice).length : 0;
    const description = main && offerCount > 0
        ? `${offerCount} reduceri Lidl active acum (${range}). Vezi prețuri vechi, prețuri noi și procentul economisit pe fiecare produs — alimente, carne, lactate, fructe, legume, dulciuri și non-food.`
        : 'Toate ofertele Lidl pentru săptămâna asta: reduceri la alimente, carne, lactate, fructe, legume, dulciuri și non-food. Actualizat în fiecare luni și joi.';
    return {
        title,
        description,
        alternates: { canonical: 'https://cataloglidl.ro/oferte-lidl-saptamana-asta' },
        openGraph: {
            title: `Oferte Lidl Săptămâna Asta${range ? ` (${range})` : ''}`,
            description,
            url: 'https://cataloglidl.ro/oferte-lidl-saptamana-asta',
            type: 'website',
        },
    };
}

const jsonLdSafe = (obj: unknown) => JSON.stringify(obj).replace(/</g, '\\u003c');

export default function OferteSaptamanaAstaPage() {
    const active = getActiveCatalogs();
    const products = getAllProducts();
    const main = pickWeeklyCatalog(active);
    const range = main ? buildDateRange(main.startDate, main.endDate) : '';

    const featured = main
        ? main.products
            .filter(p => p.oldPrice && p.oldPrice > p.newPrice)
            .slice(0, 12)
        : [];

    const itemListLd = featured.length > 0 ? {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: `Oferte Lidl Săptămâna Asta${range ? ` (${range})` : ''}`,
        numberOfItems: featured.length,
        itemListElement: featured.map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            item: {
                '@type': 'Product',
                name: p.name,
                url: `https://cataloglidl.ro/produs/${p.slug}`,
                ...(p.imageUrl ? { image: p.imageUrl } : {}),
                offers: {
                    '@type': 'Offer',
                    priceCurrency: 'RON',
                    price: p.newPrice.toFixed(2),
                    availability: 'https://schema.org/InStock',
                    url: `https://cataloglidl.ro/produs/${p.slug}`,
                },
            },
        })),
    } : null;

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            {itemListLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: jsonLdSafe(itemListLd) }}
                />
            )}

            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                <Link href="/" className="hover:text-lidl-blue">Acasă</Link>
                <span>›</span>
                <span className="text-gray-700">Oferte săptămâna asta</span>
            </nav>

            <header className="mb-6">
                {range && (
                    <p className="text-xs text-lidl-blue font-semibold uppercase tracking-wide mb-1">
                        {range}
                    </p>
                )}
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">
                    Oferte Lidl Săptămâna Asta{range ? ` (${range})` : ''}
                </h1>
                <p className="text-gray-600 text-sm md:text-base max-w-2xl">
                    {main ? (
                        <>
                            Catalogul curent: <strong>{main.title}</strong>, valabil până pe <strong>{formatDayMonth(main.endDate)}</strong>.
                            Toate reducerile săptămânii într-un singur loc — cu prețuri vechi, prețuri noi și procentul economisit.
                        </>
                    ) : (
                        'Catalogul activ al săptămânii va fi disponibil în curând.'
                    )}
                </p>
            </header>

            {featured.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
                        Top reduceri Lidl săptămâna asta
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                        {featured.map(p => {
                            const saved = p.oldPrice! - p.newPrice;
                            return (
                                <Link
                                    key={p.slug}
                                    href={`/produs/${p.slug}`}
                                    className="bg-white rounded-xl border border-gray-100 p-3 hover:shadow-md transition-shadow flex flex-col"
                                >
                                    {p.imageUrl && (
                                        <div className="relative aspect-square mb-2 bg-gray-50 rounded-lg overflow-hidden">
                                            <Image
                                                src={p.imageUrl}
                                                alt={p.name}
                                                fill
                                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                                className="object-contain"
                                            />
                                        </div>
                                    )}
                                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">{p.name}</h3>
                                    {p.unit && <p className="text-xs text-gray-500 mb-2">{p.unit}</p>}
                                    <div className="mt-auto flex items-baseline gap-2">
                                        <span className="text-lg font-extrabold text-lidl-red">{p.newPrice.toFixed(2)} lei</span>
                                        <span className="text-xs text-gray-400 line-through">{p.oldPrice!.toFixed(2)}</span>
                                    </div>
                                    {p.discount && (
                                        <span className="text-xs font-bold text-green-700 mt-1">
                                            {p.discount} · economisești {saved.toFixed(2)} lei
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </section>
            )}

            {active.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Cataloage active acum</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
                        {active.map((c, i) => (
                            <CatalogCard key={c.slug} catalog={c} priority={i === 0} />
                        ))}
                    </div>
                </section>
            )}

            {products.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-1">
                        Caută în ofertele Lidl de săptămâna asta
                    </h2>
                    <p className="text-xs text-gray-500 mb-4">
                        {products.length} produse în ofertă. Scrie numele produsului pentru a vedea prețul și catalogul în care apare.
                    </p>
                    <ProductSearch products={products} />
                </section>
            )}

            <section className="mb-8 bg-white rounded-2xl border border-gray-100 p-5 md:p-8">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3">
                    Când se actualizează ofertele Lidl?
                </h2>
                <div className="text-sm text-gray-700 space-y-3 leading-relaxed">
                    <p>
                        Lidl România lansează <strong>un catalog nou în fiecare luni</strong> (valabil până duminică)
                        și <strong>un catalog tematic în fiecare joi</strong>, de obicei pentru produse non-food și oferte speciale.
                        Pe cataloglidl.ro vezi ambele cataloage imediat ce sunt disponibile, fără să instalezi aplicația Lidl Plus.
                    </p>
                    <p>
                        Toate reducerile, promoțiile și prețurile afișate sunt valabile în toate magazinele Lidl din România:
                        București, Cluj-Napoca, Timișoara, Iași, Constanța, Brașov, Craiova, Ploiești, Oradea, Bacău, Sibiu,
                        Baia Mare, Suceava, Buzău, Pitești, Arad și multe alte orașe.
                    </p>
                    <p>
                        Pentru cataloagele din săptămânile anterioare, consultă{' '}
                        <Link href="/arhiva" className="text-lidl-blue hover:underline font-medium">
                            arhiva cataloagelor Lidl
                        </Link>
                        . Pentru căutări specifice pe categorii (carne, lactate, fructe, legume, dulciuri), folosește{' '}
                        <Link href="/categorie/alimente" className="text-lidl-blue hover:underline font-medium">
                            meniul de categorii
                        </Link>
                        .
                    </p>
                </div>
            </section>
        </div>
    );
}
