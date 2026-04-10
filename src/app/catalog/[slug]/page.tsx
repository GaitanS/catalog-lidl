import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getCatalogBySlug, getAllCatalogs } from '@/data/catalogs';
import CatalogViewer from '@/components/CatalogViewer';
import ShareButtons from '@/components/ShareButtons';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    return getAllCatalogs().map(c => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const catalog = getCatalogBySlug(slug);
    if (!catalog) return { title: 'Catalog negăsit' };

    return {
        title: `${catalog.title} — Vezi Ofertele Lidl`,
        description: catalog.description,
        openGraph: {
            title: catalog.title,
            description: catalog.description,
            url: `https://cataloglidl.ro/catalog/${slug}`,
            type: 'website',
        },
        alternates: { canonical: `https://cataloglidl.ro/catalog/${slug}` },
    };
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' });
}

function daysUntil(iso: string): number {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const end = new Date(iso);
    return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default async function CatalogPage({ params }: PageProps) {
    const { slug } = await params;
    const catalog = getCatalogBySlug(slug);
    if (!catalog) notFound();

    const daysLeft = daysUntil(catalog.endDate);
    const isExpired = daysLeft < 0;

    // JSON-LD for the catalog
    const catalogLd = {
        '@context': 'https://schema.org',
        '@type': 'OfferCatalog',
        name: catalog.title,
        description: catalog.description,
        url: `https://cataloglidl.ro/catalog/${slug}`,
        validFrom: catalog.startDate,
        validThrough: catalog.endDate,
        itemListElement: catalog.products.slice(0, 20).map((p, i) => ({
            '@type': 'Offer',
            position: i + 1,
            name: p.name,
            price: p.newPrice.toFixed(2),
            priceCurrency: 'RON',
            priceValidUntil: catalog.endDate,
            url: `https://cataloglidl.ro/produs/${p.slug}`,
        })),
    };

    return (
        <>
            <script type="application/ld+json">{JSON.stringify(catalogLd)}</script>

            <div className="max-w-3xl mx-auto px-3 md:px-4 py-4">
                {/* Breadcrumb */}
                <nav aria-label="Breadcrumb" className="text-xs text-gray-400 mb-3 flex items-center gap-1.5">
                    <Link href="/" className="hover:text-lidl-blue transition-colors">Acasă</Link>
                    <svg className="w-3 h-3 shrink-0 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="text-gray-700 truncate">{catalog.title}</span>
                </nav>

                {/* Page header */}
                <div className="mb-4">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-snug mb-2">
                        {catalog.title}
                    </h1>

                    {/* Status + date — single compact row */}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500 mb-3">
                        {isExpired ? (
                            <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 font-medium px-2 py-0.5 rounded-full">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Expirat
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 bg-green-50 border border-green-200 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                Valabil
                            </span>
                        )}
                        <span>
                            {formatDate(catalog.startDate)} – {formatDate(catalog.endDate)}
                        </span>
                        {!isExpired && daysLeft <= 7 && (
                            <>
                                <span className="text-gray-300" aria-hidden>·</span>
                                <span className={daysLeft <= 2 ? 'text-red-600 font-semibold' : 'text-yellow-700 font-medium'}>
                                    {daysLeft === 1 ? 'Ultima zi' : `Mai ${daysLeft === 0 ? 'putin de o zi' : `sunt ${daysLeft} zile`}`}
                                </span>
                            </>
                        )}
                    </div>

                    {/* Share — below meta, separated by visual weight */}
                    <ShareButtons
                        url={`https://cataloglidl.ro/catalog/${slug}`}
                        title={catalog.title}
                    />
                </div>

                {/* Main viewer */}
                <CatalogViewer catalog={catalog} />

                {/* Disclaimer */}
                <div className="mt-5 bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <p className="text-xs font-semibold text-blue-900 flex items-center gap-1.5 mb-1">
                        <svg className="w-3.5 h-3.5 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Disponibilitate în magazin
                    </p>
                    <p className="text-xs text-blue-800 leading-relaxed">
                        Ofertele pot varia în funcție de magazin.{' '}
                        <a
                            href="https://www.lidl.ro/s/ro-RO/cautare-magazin/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline font-medium hover:text-lidl-blue transition-colors"
                        >
                            Găsește magazinul Lidl cel mai apropiat
                        </a>{' '}
                        pentru a verifica stocul local.
                    </p>
                </div>
            </div>
        </>
    );
}
