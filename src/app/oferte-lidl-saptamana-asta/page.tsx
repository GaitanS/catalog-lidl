import Link from 'next/link';
import type { Metadata } from 'next';
import { getActiveCatalogs, getAllProducts } from '@/data/catalogs';
import CatalogCard from '@/components/CatalogCard';
import ProductSearch from '@/components/ProductSearch';

export const metadata: Metadata = {
    title: 'Oferte Lidl Săptămâna Aceasta — Reduceri și Promoții Actuale',
    description: 'Toate ofertele Lidl pentru săptămâna aceasta: reduceri la alimente, carne, lactate, fructe, legume, dulciuri și non-food. Actualizat în fiecare luni și joi. Fără login, fără aplicație.',
    alternates: {
        canonical: 'https://cataloglidl.ro/oferte-lidl-saptamana-asta',
    },
    openGraph: {
        title: 'Oferte Lidl Săptămâna Aceasta',
        description: 'Toate reducerile Lidl din catalogul săptămânal. Fără login, fără aplicație.',
        url: 'https://cataloglidl.ro/oferte-lidl-saptamana-asta',
        type: 'website',
    },
};

function formatDate(iso: string): string {
    return new Date(iso + 'T00:00:00').toLocaleDateString('ro-RO', { day: 'numeric', month: 'long' });
}

export default function OferteSaptamanaAstaPage() {
    const active = getActiveCatalogs();
    const products = getAllProducts();
    const main = active[0];

    const today = new Date();
    const weekDay = today.toLocaleDateString('ro-RO', { weekday: 'long' });
    const currentMonth = today.toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' });

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                <Link href="/" className="hover:text-lidl-blue">Acasă</Link>
                <span>›</span>
                <span className="text-gray-700">Oferte săptămâna aceasta</span>
            </nav>

            <header className="mb-6">
                <p className="text-xs text-lidl-blue font-semibold uppercase tracking-wide mb-1">
                    {weekDay.charAt(0).toUpperCase() + weekDay.slice(1)}, {currentMonth}
                </p>
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">
                    Oferte Lidl Săptămâna Aceasta
                </h1>
                <p className="text-gray-600 text-sm md:text-base max-w-2xl">
                    {main ? (
                        <>
                            Catalogul curent: <strong>{main.title}</strong>, valabil până pe <strong>{formatDate(main.endDate)}</strong>.
                            Toate reducerile săptămânii într-un singur loc — cu prețuri vechi, prețuri noi și procentul economisit.
                        </>
                    ) : (
                        'Catalogul activ al săptămânii va fi disponibil în curând.'
                    )}
                </p>
            </header>

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
                        Caută în ofertele Lidl de săptămâna aceasta
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
