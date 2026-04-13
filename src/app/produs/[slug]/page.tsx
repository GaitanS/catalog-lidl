import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getProductBySlug, getAllProductSlugs, getProductsByCategorySlug } from '@/data/catalogs';
import { AddToListButton } from '@/components/ShoppingList';
import ShareButtons from '@/components/ShareButtons';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    return getAllProductSlugs().map(slug => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const result = getProductBySlug(slug);
    if (!result) return { title: 'Produs negăsit' };

    const { product, catalog } = result;
    const priceStr = product.newPrice > 0 ? `${product.newPrice.toFixed(2)} lei` : '';
    const title = `${product.name} ${product.unit ? product.unit + ' ' : ''}${priceStr ? priceStr + ' ' : ''}Lidl`;
    const description = `${product.name}${product.brand ? ` ${product.brand}` : ''}${product.unit ? ` (${product.unit})` : ''} la Lidl${priceStr ? ` — preț ${priceStr}` : ''}${product.oldPrice ? ` (reducere ${product.discount} de la ${product.oldPrice.toFixed(2)} lei)` : ''}. Valabil ${catalog.startDate} — ${catalog.endDate}.`;

    const ogImage = product.imageUrl
        ? (product.imageUrl.startsWith('http') ? product.imageUrl : `https://cataloglidl.ro${product.imageUrl}`)
        : undefined;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            url: `https://cataloglidl.ro/produs/${slug}`,
            type: 'website',
            ...(ogImage ? { images: [{ url: ogImage }] } : {}),
        },
        alternates: {
            canonical: `https://cataloglidl.ro/produs/${slug}`,
        },
    };
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default async function ProductPage({ params }: PageProps) {
    const { slug } = await params;
    const result = getProductBySlug(slug);
    if (!result) notFound();

    const { product, catalog } = result;
    const relatedProducts = getProductsByCategorySlug(product.categorySlug)
        .filter(p => p.slug !== product.slug)
        .slice(0, 6);

    const savings = product.oldPrice ? product.oldPrice - product.newPrice : 0;

    // JSON-LD Product schema (safe: server-rendered with controlled data only).
    // jsonLd() below replaces `</` with `<\/` so no stringified value can close the
    // surrounding <script> tag, even if scraped data ever contains "</script>".
    const jsonLd = (obj: unknown) => JSON.stringify(obj).replace(/</g, '\\u003c');

    const imageUrl = product.imageUrl
        ? (product.imageUrl.startsWith('http') ? product.imageUrl : `https://cataloglidl.ro${product.imageUrl}`)
        : `https://cataloglidl.ro${catalog.coverImage}`;

    const productLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: imageUrl,
        description: product.description || `${product.name} la Lidl România`,
        brand: { '@type': 'Brand', name: product.brand || 'Lidl' },
        category: product.category,
        offers: {
            '@type': 'Offer',
            url: `https://cataloglidl.ro/produs/${slug}`,
            priceCurrency: 'RON',
            price: product.newPrice.toFixed(2),
            priceValidUntil: catalog.endDate,
            availability: 'https://schema.org/InStock',
            seller: { '@type': 'Organization', name: 'Lidl România' },
            shippingDetails: {
                '@type': 'OfferShippingDetails',
                shippingDestination: {
                    '@type': 'DefinedRegion',
                    addressCountry: 'RO',
                },
                doesNotShip: true,
            },
            hasMerchantReturnPolicy: {
                '@type': 'MerchantReturnPolicy',
                applicableCountry: 'RO',
                returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
                merchantReturnDays: 30,
                returnMethod: 'https://schema.org/ReturnInStore',
                returnFees: 'https://schema.org/FreeReturn',
            },
        },
    };

    const breadcrumbLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Acasă', item: 'https://cataloglidl.ro' },
            { '@type': 'ListItem', position: 2, name: product.category, item: `https://cataloglidl.ro/categorie/${product.categorySlug}` },
            { '@type': 'ListItem', position: 3, name: product.name, item: `https://cataloglidl.ro/produs/${slug}` },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: jsonLd(productLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbLd) }}
            />

            <div className="max-w-4xl mx-auto px-4 py-6">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-xs text-gray-500 mb-4" aria-label="Breadcrumb">
                    <Link href="/" className="hover:text-lidl-blue">Acasă</Link>
                    <span>›</span>
                    <Link href={`/categorie/${product.categorySlug}`} className="hover:text-lidl-blue">{product.category}</Link>
                    <span>›</span>
                    <span className="text-gray-700 truncate">{product.name}</span>
                </nav>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="grid md:grid-cols-2 gap-0">
                        {/* Image */}
                        <div className="bg-gray-50 aspect-square flex items-center justify-center overflow-hidden">
                            {product.imageUrl ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain" />
                            ) : (
                                <svg className="w-32 h-32 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            )}
                        </div>

                        {/* Details */}
                        <div className="p-5 md:p-8 flex flex-col">
                            {product.brand && (
                                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">{product.brand}</p>
                            )}
                            <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                                {product.name}
                            </h1>
                            {product.unit && (
                                <p className="text-sm text-gray-500 mb-4">{product.unit}</p>
                            )}

                            {/* Validity badge */}
                            <div className="inline-flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs font-medium px-3 py-1.5 rounded-full mb-4 self-start">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Valabil până: {formatDate(catalog.endDate)}
                            </div>

                            {/* Price */}
                            {product.newPrice > 0 && (
                                <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4">
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-3xl md:text-4xl font-extrabold text-lidl-red">
                                            {product.newPrice.toFixed(2)} <span className="text-lg">lei</span>
                                        </span>
                                        {product.discount && (
                                            <span className="bg-lidl-red text-white text-xs font-bold px-2 py-1 rounded">
                                                {product.discount}
                                            </span>
                                        )}
                                    </div>
                                    {product.oldPrice && (
                                        <p className="text-sm text-gray-500 mt-1">
                                            Preț normal: <span className="line-through">{product.oldPrice.toFixed(2)} lei</span>
                                            <span className="text-green-600 font-medium ml-2">— economisești {savings.toFixed(2)} lei</span>
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Add to list */}
                            <div className="flex items-center gap-2 mb-4">
                                <AddToListButton product={product} />
                                <span className="text-sm text-gray-600">Adaugă pe lista ta</span>
                            </div>

                            {/* Share */}
                            <ShareButtons
                                url={`https://cataloglidl.ro/produs/${slug}`}
                                title={`${product.name} — ${product.newPrice.toFixed(2)} lei la Lidl`}
                            />

                            {/* Description */}
                            {product.description && (
                                <p className="text-sm text-gray-600 mt-4 leading-relaxed">{product.description}</p>
                            )}

                            {/* Catalog info */}
                            <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                                <p>Din catalogul <Link href={`/catalog/${catalog.slug}`} className="text-lidl-blue hover:underline">{catalog.title}</Link></p>
                                <p className="mt-1">Perioadă: {formatDate(catalog.startDate)} — {formatDate(catalog.endDate)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Store locator disclaimer */}
                <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-900">
                    <p className="font-semibold mb-1 flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Verifică disponibilitatea
                    </p>
                    <p className="text-xs text-blue-800">
                        Prețurile și stocurile pot varia în funcție de magazin. Pentru confirmare, verifică{' '}
                        <a href="https://www.lidl.ro/s/ro-RO/cautare-magazin/" target="_blank" rel="noopener noreferrer" className="underline font-medium">
                            magazinul Lidl cel mai apropiat
                        </a>.
                    </p>
                </div>

                {/* Related products */}
                {relatedProducts.length > 0 && (
                    <section className="mt-8">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">
                            Alte oferte la {product.category}
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {relatedProducts.map(p => (
                                <Link
                                    key={p.slug}
                                    href={`/produs/${p.slug}`}
                                    className="bg-white rounded-xl border border-gray-100 p-3 hover:border-lidl-blue hover:shadow-md transition-all active:scale-[0.98]"
                                >
                                    <div className="aspect-square bg-gray-50 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                                        {p.imageUrl ? (
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            <img src={p.imageUrl} alt={p.name} loading="lazy" className="w-full h-full object-contain" />
                                        ) : (
                                            <svg className="w-10 h-10 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                            </svg>
                                        )}
                                    </div>
                                    <h3 className="font-semibold text-xs text-gray-900 line-clamp-2 min-h-[32px]">{p.name}</h3>
                                    {p.newPrice > 0 && (
                                        <div className="flex items-baseline gap-1 mt-1">
                                            <span className="text-lidl-red font-bold text-sm">{p.newPrice.toFixed(2)} lei</span>
                                            {p.oldPrice && (
                                                <span className="text-gray-400 line-through text-[10px]">{p.oldPrice.toFixed(2)}</span>
                                            )}
                                        </div>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </>
    );
}
