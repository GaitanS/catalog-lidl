import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getActiveCatalogs, getAllProducts } from '@/data/catalogs';
import CatalogCard from '@/components/CatalogCard';

interface CityInfo {
    slug: string;
    name: string;
    county: string;
    stores: number;
}

// Cities with a strong GSC query signal or major Lidl presence.
const CITIES: CityInfo[] = [
    { slug: 'bucuresti', name: 'București', county: 'București', stores: 38 },
    { slug: 'cluj-napoca', name: 'Cluj-Napoca', county: 'Cluj', stores: 9 },
    { slug: 'timisoara', name: 'Timișoara', county: 'Timiș', stores: 8 },
    { slug: 'iasi', name: 'Iași', county: 'Iași', stores: 7 },
    { slug: 'constanta', name: 'Constanța', county: 'Constanța', stores: 7 },
    { slug: 'brasov', name: 'Brașov', county: 'Brașov', stores: 6 },
    { slug: 'craiova', name: 'Craiova', county: 'Dolj', stores: 5 },
    { slug: 'ploiesti', name: 'Ploiești', county: 'Prahova', stores: 4 },
    { slug: 'oradea', name: 'Oradea', county: 'Bihor', stores: 4 },
    { slug: 'bacau', name: 'Bacău', county: 'Bacău', stores: 4 },
    { slug: 'sibiu', name: 'Sibiu', county: 'Sibiu', stores: 4 },
    { slug: 'baia-mare', name: 'Baia Mare', county: 'Maramureș', stores: 3 },
    { slug: 'suceava', name: 'Suceava', county: 'Suceava', stores: 3 },
    { slug: 'buzau', name: 'Buzău', county: 'Buzău', stores: 3 },
    { slug: 'pitesti', name: 'Pitești', county: 'Argeș', stores: 3 },
    { slug: 'arad', name: 'Arad', county: 'Arad', stores: 3 },
    { slug: 'targu-mures', name: 'Târgu Mureș', county: 'Mureș', stores: 3 },
    { slug: 'galati', name: 'Galați', county: 'Galați', stores: 3 },
    { slug: 'satu-mare', name: 'Satu Mare', county: 'Satu Mare', stores: 2 },
    { slug: 'carei', name: 'Carei', county: 'Satu Mare', stores: 1 },
];

const cityMap: Record<string, CityInfo> = Object.fromEntries(CITIES.map(c => [c.slug, c]));

export function generateStaticParams() {
    return CITIES.map(c => ({ oras: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ oras: string }> }): Promise<Metadata> {
    const { oras } = await params;
    const city = cityMap[oras];
    if (!city) return { title: 'Oraș' };

    const title = `Catalog Lidl ${city.name} — Oferte Săptămâna Aceasta`;
    const description = `Catalog Lidl ${city.name} (${city.county}): vezi toate ofertele săptămânale, reducerile și promoțiile din magazinele Lidl din ${city.name}. Actualizat luni și joi.`;

    return {
        title,
        description,
        alternates: { canonical: `https://cataloglidl.ro/lidl/${oras}` },
        openGraph: {
            title,
            description,
            url: `https://cataloglidl.ro/lidl/${oras}`,
            type: 'website',
        },
    };
}

export default async function CityPage({ params }: { params: Promise<{ oras: string }> }) {
    const { oras } = await params;
    const city = cityMap[oras];
    if (!city) notFound();

    const active = getActiveCatalogs();
    const products = getAllProducts();
    const main = active[0];

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                <Link href="/" className="hover:text-lidl-blue">Acasă</Link>
                <span>›</span>
                <span className="text-gray-700">Lidl {city.name}</span>
            </nav>

            <header className="mb-6">
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">
                    Catalog Lidl {city.name}
                </h1>
                <p className="text-gray-600 text-sm md:text-base max-w-2xl">
                    Toate ofertele Lidl din <strong>{city.name}</strong>, județul <strong>{city.county}</strong>.
                    Catalogul săptămânal e același în toate magazinele Lidl din România, deci reducerile de mai jos sunt valabile
                    și în cele <strong>{city.stores} magazine Lidl din {city.name}</strong>.
                </p>
            </header>

            {active.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
                        Cataloage active în {city.name}
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
                        {active.map((c, i) => (
                            <CatalogCard key={c.slug} catalog={c} priority={i === 0} />
                        ))}
                    </div>
                </section>
            )}

            <section className="mb-8 bg-white rounded-2xl border border-gray-100 p-5 md:p-8">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3">
                    Cum găsesc magazinul Lidl cel mai apropiat din {city.name}?
                </h2>
                <div className="text-sm text-gray-700 space-y-3 leading-relaxed">
                    <p>
                        În {city.name} există aproximativ <strong>{city.stores} magazine Lidl</strong>, distribuite în
                        principalele cartiere ale orașului. Pentru a găsi adresa exactă și programul magazinului, folosește{' '}
                        <a
                            href={`https://www.lidl.ro/s/ro-RO/cautare-magazin/${encodeURIComponent(city.name)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-lidl-blue hover:underline font-medium"
                        >
                            căutarea oficială de magazine Lidl pentru {city.name}
                        </a>
                        . Prețurile și stocurile pot varia în funcție de magazin, dar <strong>reducerile din catalogul săptămânal
                        sunt aceleași în toată țara</strong>.
                    </p>
                    <p>
                        Lidl actualizează ofertele <strong>în fiecare luni și joi</strong>. Catalogul principal e valabil de luni
                        până duminică, iar catalogul special (non-food, electrocasnice, textile) apare joia și e valabil până duminica.
                        Poți consulta{' '}
                        <Link href="/oferte-lidl-saptamana-asta" className="text-lidl-blue hover:underline font-medium">
                            ofertele Lidl de săptămâna aceasta
                        </Link>
                        {' '}sau{' '}
                        <Link href="/arhiva" className="text-lidl-blue hover:underline font-medium">
                            arhiva cataloagelor precedente
                        </Link>
                        .
                    </p>
                    {main && (
                        <p>
                            Catalogul activ chiar acum pentru {city.name} este{' '}
                            <Link href={`/catalog/${main.slug}`} className="text-lidl-blue hover:underline font-medium">
                                {main.title}
                            </Link>
                            , cu reduceri la alimente, băuturi, lactate, carne, fructe, legume și non-food.
                        </p>
                    )}
                </div>
            </section>

            <section className="mb-8">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3">
                    Cataloage Lidl pentru alte orașe
                </h2>
                <div className="flex flex-wrap gap-2">
                    {CITIES.filter(c => c.slug !== oras).map(c => (
                        <Link
                            key={c.slug}
                            href={`/lidl/${c.slug}`}
                            className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-700 hover:border-lidl-blue hover:text-lidl-blue transition-colors"
                        >
                            Lidl {c.name}
                        </Link>
                    ))}
                </div>
            </section>

            {products.length > 0 && (
                <p className="text-xs text-gray-500">
                    {products.length} produse în ofertă săptămâna aceasta în magazinele Lidl din {city.name}.
                </p>
            )}
        </div>
    );
}

export { CITIES };
