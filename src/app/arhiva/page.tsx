import Link from 'next/link';
import { Metadata } from 'next';
import { getAllCatalogs, getActiveCatalogs } from '@/data/catalogs';
import CatalogCard from '@/components/CatalogCard';

export const metadata: Metadata = {
    title: 'Catalog Lidl Săptămâna Trecută + Arhivă Completă 2026',
    description: 'Arhiva cataloagelor Lidl România — catalog Lidl săptămâna trecută, cataloage anterioare 2026 și toate ofertele tematice. Revezi reducerile care ți-au scăpat.',
    alternates: {
        canonical: 'https://cataloglidl.ro/arhiva',
    },
};

export default function ArhivaPage() {
    const allCatalogs = getAllCatalogs();
    const active = getActiveCatalogs();
    const archived = allCatalogs.filter(c => !active.includes(c));
    const currentYear = new Date().getFullYear();

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                <Link href="/" className="hover:text-lidl-blue">Acasă</Link>
                <span>›</span>
                <span className="text-gray-700">Arhivă cataloage</span>
            </nav>

            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">
                Catalog Lidl Săptămâna Trecută și Arhivă {currentYear}
            </h1>
            <p className="text-gray-600 mb-6 text-sm md:text-base max-w-2xl">
                Toate cataloagele Lidl România din {currentYear}: catalogul săptămânii trecute, cataloagele tematice
                (Paște, vinuri, Silvercrest, non-food) și ofertele anterioare.
                Revezi reducerile care ți-au scăpat sau compară prețurile de la o săptămână la alta.
            </p>

            {active.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Active acum</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {active.map(c => <CatalogCard key={c.slug} catalog={c} />)}
                    </div>
                </section>
            )}

            {archived.length > 0 && (
                <section className="mb-8">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
                        Cataloage anterioare (săptămâna trecută și mai vechi)
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {archived.map(c => <CatalogCard key={c.slug} catalog={c} />)}
                    </div>
                </section>
            )}

            {allCatalogs.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                    <p className="text-lg">Niciun catalog disponibil momentan.</p>
                </div>
            )}

            <section className="mt-10 bg-white rounded-2xl border border-gray-100 p-5 md:p-8">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3">
                    De ce păstrăm arhiva cataloagelor Lidl?
                </h2>
                <div className="text-sm text-gray-700 space-y-3 leading-relaxed">
                    <p>
                        Catalogul Lidl din săptămâna trecută e util din mai multe motive: poate vrei să compari cum au evoluat
                        prețurile la carne, lactate sau fructe, poate ai ratat o reducere care s-a întors, sau poate
                        cauți un produs pe care l-ai văzut în pliantul vechi și vrei să verifici prețul.
                    </p>
                    <p>
                        Pe cataloglidl.ro păstrăm <strong>toate cataloagele săptămânale</strong> din {currentYear}
                        — catalogul principal (luni-duminică), catalogul special de joi, cataloagele tematice de Paște,
                        Crăciun, vinuri, Silvercrest și non-food. Consultă și{' '}
                        <Link href="/oferte-lidl-saptamana-asta" className="text-lidl-blue hover:underline font-medium">
                            ofertele Lidl de săptămâna aceasta
                        </Link>
                        {' '}pentru catalogul curent.
                    </p>
                </div>
            </section>
        </div>
    );
}
