import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAllCatalogs } from '@/data/catalogs';
import CatalogCard from '@/components/CatalogCard';
import ProductSearch from '@/components/ProductSearch';
import {
    SEO_LANDING_PAGE_SLUGS,
    formatCatalogRangeForDisplay,
    getCatalogImageUrl,
    getSeoLandingPage,
} from '@/lib/seo-landing-pages';

interface PageProps {
    params: Promise<{ seoSlug: string }>;
}

const jsonLdSafe = (obj: unknown) => JSON.stringify(obj).replace(/</g, '\\u003c');

export function generateStaticParams() {
    return SEO_LANDING_PAGE_SLUGS.map(seoSlug => ({ seoSlug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { seoSlug } = await params;
    const page = getSeoLandingPage(seoSlug, getAllCatalogs());
    if (!page) return { title: 'Pagina negăsită' };

    const image = getCatalogImageUrl(page.primaryCatalog);

    return {
        title: page.title,
        description: page.description,
        keywords: page.keywords,
        alternates: { canonical: page.canonical },
        openGraph: {
            title: page.title,
            description: page.description,
            url: page.canonical,
            type: 'website',
            ...(image ? { images: [{ url: image, alt: page.h1 }] } : {}),
        },
        twitter: {
            card: 'summary_large_image',
            title: page.title,
            description: page.description,
            ...(image ? { images: [image] } : {}),
        },
    };
}

export default async function SeoLandingPage({ params }: PageProps) {
    const { seoSlug } = await params;
    const allCatalogs = getAllCatalogs();
    const page = getSeoLandingPage(seoSlug, allCatalogs);
    if (!page) notFound();

    const catalog = page.primaryCatalog;
    const displayImage = catalog?.coverImage || catalog?.thumbnailImage || catalog?.pages[0]?.imageUrl;
    const range = formatCatalogRangeForDisplay(catalog);
    const faqLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: page.faq.map(item => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
            },
        })),
    };

    const breadcrumbLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Acasă', item: 'https://cataloglidl.ro' },
            { '@type': 'ListItem', position: 2, name: page.h1, item: page.canonical },
        ],
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: jsonLdSafe(faqLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: jsonLdSafe(breadcrumbLd) }}
            />

            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                <Link href="/" className="hover:text-lidl-blue">Acasă</Link>
                <span>›</span>
                <span className="text-gray-700 truncate">{page.h1}</span>
            </nav>

            <header className="grid lg:grid-cols-[1fr_360px] gap-6 items-start mb-8">
                <div>
                    {range && (
                        <p className="text-xs text-lidl-blue font-semibold uppercase tracking-wide mb-2">
                            {range}
                        </p>
                    )}
                    <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 mb-3 leading-tight">
                        {page.h1}
                    </h1>
                    <p className="text-gray-600 text-sm md:text-base max-w-3xl leading-relaxed">
                        {page.intro}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-4">
                        {page.keywords.map(keyword => (
                            <span
                                key={keyword}
                                className="bg-white border border-gray-200 rounded-full px-3 py-1 text-xs font-medium text-gray-700"
                            >
                                {keyword}
                            </span>
                        ))}
                    </div>
                </div>

                {catalog && displayImage && (
                    <Link
                        href={`/catalog/${catalog.slug}`}
                        className="bg-white border border-gray-100 rounded-2xl p-3 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="relative aspect-[4/5] bg-gray-50 rounded-xl overflow-hidden">
                            <Image
                                src={displayImage}
                                alt={`${page.h1} - coperta catalog Lidl`}
                                fill
                                sizes="(max-width: 1024px) 100vw, 360px"
                                className="object-contain"
                                priority
                            />
                        </div>
                        <p className="text-sm font-bold text-gray-900 mt-3 line-clamp-2">{catalog.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{catalog.pages.length} pagini</p>
                    </Link>
                )}
            </header>

            {catalog && (
                <section className="mb-8">
                    <div className="flex items-center justify-between mb-4 gap-3">
                        <h2 className="text-lg md:text-xl font-bold text-gray-900">Catalogul relevant</h2>
                        <Link href={`/catalog/${catalog.slug}`} className="text-lidl-blue hover:underline text-xs font-semibold">
                            Răsfoiește catalogul
                        </Link>
                    </div>
                    <CatalogCard catalog={catalog} priority />
                </section>
            )}

            {page.featuredProducts.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                        Produse și oferte din catalog
                    </h2>
                    <p className="text-xs text-gray-500 mb-4">
                        Caută rapid în ofertele listate pentru această pagină.
                    </p>
                    <ProductSearch products={page.featuredProducts} />
                </section>
            )}

            {page.secondaryCatalogs.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
                        Alte cataloage Lidl active
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
                        {page.secondaryCatalogs.map(c => (
                            <CatalogCard key={c.slug} catalog={c} />
                        ))}
                    </div>
                </section>
            )}

            <section className="mb-8 bg-white rounded-2xl border border-gray-100 p-5 md:p-8">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Întrebări frecvente</h2>
                <div className="space-y-4 text-sm text-gray-700">
                    {page.faq.map(item => (
                        <div key={item.question}>
                            <h3 className="font-semibold text-gray-900">{item.question}</h3>
                            <p className="mt-1 leading-relaxed">{item.answer}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="bg-blue-50 border border-blue-100 rounded-2xl p-5 md:p-8">
                <h2 className="text-lg md:text-xl font-bold text-blue-950 mb-3">
                    Căutări populare pentru catalogul Lidl
                </h2>
                <div className="flex flex-wrap gap-2">
                    {SEO_LANDING_PAGE_SLUGS.filter(slug => slug !== page.slug).map(slug => {
                        const related = getSeoLandingPage(slug, allCatalogs);
                        return related ? (
                            <Link
                                key={slug}
                                href={`/${slug}`}
                                className="px-3 py-1.5 bg-white border border-blue-100 rounded-full text-xs font-medium text-blue-900 hover:border-lidl-blue hover:text-lidl-blue transition-colors"
                            >
                                {related.keywords[0]}
                            </Link>
                        ) : null;
                    })}
                </div>
            </section>
        </div>
    );
}
