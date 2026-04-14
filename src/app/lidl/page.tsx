import Link from 'next/link';
import type { Metadata } from 'next';
import { CITIES } from './[oras]/page';

export const metadata: Metadata = {
    title: 'Magazine Lidl România — Cataloage pe Orașe',
    description: 'Lista completă a orașelor cu magazine Lidl din România. Vezi catalogul săptămânal pentru București, Cluj, Timișoara, Iași, Constanța, Brașov și alte orașe.',
    alternates: {
        canonical: 'https://cataloglidl.ro/lidl',
    },
};

export default function LidlHubPage() {
    const totalStores = CITIES.reduce((sum, c) => sum + c.stores, 0);

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                <Link href="/" className="hover:text-lidl-blue">Acasă</Link>
                <span>›</span>
                <span className="text-gray-700">Magazine Lidl</span>
            </nav>

            <header className="mb-8">
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">
                    Magazine Lidl România
                </h1>
                <p className="text-gray-600 text-sm md:text-base max-w-2xl">
                    Lidl are peste <strong>{totalStores} de magazine</strong> în cele {CITIES.length} orașe principale din România.
                    Catalogul săptămânal e același în toate magazinele, iar mai jos găsești pagina dedicată pentru fiecare oraș.
                </p>
            </header>

            <section className="mb-8">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Alege orașul tău</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {CITIES.map(city => (
                        <Link
                            key={city.slug}
                            href={`/lidl/${city.slug}`}
                            className="bg-white rounded-xl border border-gray-100 p-4 hover:border-lidl-blue hover:shadow-md transition-all"
                        >
                            <h3 className="font-bold text-gray-900 text-sm">Lidl {city.name}</h3>
                            <p className="text-xs text-gray-500 mt-1">{city.county}</p>
                            <p className="text-xs text-lidl-blue font-semibold mt-2">
                                {city.stores} {city.stores === 1 ? 'magazin' : 'magazine'}
                            </p>
                        </Link>
                    ))}
                </div>
            </section>

            <section className="bg-white rounded-2xl border border-gray-100 p-5 md:p-8">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3">
                    Catalogul Lidl e același în toate orașele?
                </h2>
                <div className="text-sm text-gray-700 space-y-3 leading-relaxed">
                    <p>
                        Da. <strong>Catalogul săptămânal Lidl este valabil în toate magazinele din România</strong>,
                        indiferent de oraș sau județ. Singura diferență poate apărea la disponibilitatea stocului local —
                        unele produse în ediție limitată se epuizează mai repede în orașele mari.
                    </p>
                    <p>
                        Ofertele se actualizează <strong>lunea</strong> (catalogul principal, valabil până duminică)
                        și <strong>joia</strong> (catalog special pentru non-food și electrocasnice).
                        Consultă{' '}
                        <Link href="/oferte-lidl-saptamana-asta" className="text-lidl-blue hover:underline font-medium">
                            ofertele Lidl de săptămâna aceasta
                        </Link>
                        {' '}pentru lista completă a reducerilor curente.
                    </p>
                </div>
            </section>
        </div>
    );
}
