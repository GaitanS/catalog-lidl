import Link from 'next/link';
import type { Catalog } from '@/data/catalogs';

interface CatalogCardProps {
    catalog: Catalog;
    priority?: boolean;
}

function formatDate(dateStr: string): string {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function isActive(catalog: Catalog): boolean {
    const today = new Date().toISOString().split('T')[0];
    return catalog.startDate <= today && catalog.endDate >= today;
}

function daysLeft(endDate: string): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDate + 'T00:00:00');
    return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export default function CatalogCard({ catalog, priority = false }: CatalogCardProps) {
    const active = isActive(catalog);
    const remaining = daysLeft(catalog.endDate);

    return (
        <Link
            href={`/catalog/${catalog.slug}`}
            className="card-catalog block bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm"
        >
            {/* Cover image */}
            <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
                {catalog.coverImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                        src={catalog.thumbnailImage || catalog.coverImage}
                        alt={catalog.title}
                        loading={priority ? "eager" : "lazy"}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                    </div>
                )}

                {/* Status badge */}
                {active && (
                    <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        Activ
                    </div>
                )}

                {active && remaining <= 3 && remaining > 0 && (
                    <div className="absolute top-3 right-3 bg-lidl-red text-white text-xs font-bold px-3 py-1 rounded-full">
                        Expiră în {remaining} {remaining === 1 ? 'zi' : 'zile'}
                    </div>
                )}

                {/* Page count */}
                <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-lg">
                    {catalog.pages.length} pagini
                </div>
            </div>

            {/* Info */}
            <div className="p-4">
                <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1">
                    {catalog.title}
                </h3>
                <p className="text-xs text-gray-500">
                    {formatDate(catalog.startDate)} — {formatDate(catalog.endDate)}
                </p>
                {catalog.products.length > 0 && (
                    <p className="text-xs text-lidl-blue font-medium mt-2">
                        {catalog.products.length} oferte
                    </p>
                )}
            </div>
        </Link>
    );
}
