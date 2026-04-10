import { Metadata } from 'next';
import { getAllCatalogs } from '@/data/catalogs';
import CatalogCard from '@/components/CatalogCard';

export const metadata: Metadata = {
    title: 'Arhivă Cataloage Lidl 2026 — Toate Ofertele Săptămânale',
    description: 'Arhiva completă a cataloagelor Lidl România. Vezi toate ofertele săptămânale și cataloagele anterioare din 2026.',
    alternates: {
        canonical: 'https://cataloglidl.ro/arhiva',
    },
};

export default function ArhivaPage() {
    const catalogs = getAllCatalogs();
    const currentYear = new Date().getFullYear();

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Arhivă Cataloage Lidl {currentYear}</h1>
            <p className="text-gray-500 mb-8">Toate cataloagele Lidl România — oferte săptămânale și cataloage tematice.</p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {catalogs.map((catalog) => (
                    <CatalogCard key={catalog.slug} catalog={catalog} />
                ))}
            </div>

            {catalogs.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                    <p className="text-lg">Niciun catalog disponibil momentan.</p>
                </div>
            )}
        </div>
    );
}
