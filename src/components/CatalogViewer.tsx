'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import type { Catalog } from '@/data/catalogs';
import { AddToListButton } from './ShoppingList';

function formatDate(dateStr: string): string {
    const d = new Date(`${dateStr}T00:00:00`);
    return d.toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function CatalogViewer({ catalog }: { catalog: Catalog }) {
    const [currentPage, setCurrentPage] = useState(0);
    const [showProducts, setShowProducts] = useState(false);

    // Touch swipe handling
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        touchEndX.current = e.touches[0].clientX;
    }, []);

    const handleTouchEnd = useCallback(() => {
        const diff = touchStartX.current - touchEndX.current;
        const threshold = 50;
        if (diff > threshold && currentPage < catalog.pages.length - 1) {
            setCurrentPage(p => p + 1);
        } else if (diff < -threshold && currentPage > 0) {
            setCurrentPage(p => p - 1);
        }
    }, [catalog, currentPage]);

    const totalPages = catalog.pages.length;
    const dateRange = `${formatDate(catalog.startDate)} - ${formatDate(catalog.endDate)}`;

    return (
        <>
            {/* Tab selector — pill group with shared border */}
            <div className="flex mb-4 bg-gray-100 rounded-xl p-1 gap-1">
                <button
                    onClick={() => setShowProducts(false)}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                        !showProducts
                            ? 'bg-lidl-blue text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Catalog
                    <span className={`ml-1.5 text-xs font-normal ${!showProducts ? 'opacity-75' : 'text-gray-400'}`}>
                        {totalPages} pag.
                    </span>
                </button>
                <button
                    onClick={() => setShowProducts(true)}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                        showProducts
                            ? 'bg-lidl-blue text-white shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Produse
                    {catalog.products.length > 0 && (
                        <span className={`ml-1.5 text-xs font-normal ${showProducts ? 'opacity-75' : 'text-gray-400'}`}>
                            {catalog.products.length}
                        </span>
                    )}
                </button>
            </div>

            {!showProducts ? (
                /* Catalog viewer with touch swipe */
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    <div
                        className="relative aspect-[3/4] bg-gray-100 flex items-center justify-center select-none overflow-hidden"
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        {catalog.pages[currentPage]?.imageUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                                src={catalog.pages[currentPage].imageUrl}
                                alt={`Catalog Lidl ${dateRange} - pagina ${currentPage + 1}`}
                                loading={currentPage === 0 ? 'eager' : 'lazy'}
                                className="absolute inset-0 w-full h-full object-contain bg-white"
                            />
                        ) : (
                            <div className="text-gray-400 text-center px-4">
                                <svg className="w-16 h-16 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <p className="text-sm font-medium">Pagina {currentPage + 1}</p>
                            </div>
                        )}

                        {/* Nav arrows */}
                        {currentPage > 0 && (
                            <button
                                onClick={() => setCurrentPage(p => p - 1)}
                                aria-label="Pagina anterioară"
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 active:bg-white shadow-md ring-1 ring-gray-200/70 rounded-full w-9 h-9 flex items-center justify-center transition-opacity"
                            >
                                <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                        )}
                        {currentPage < totalPages - 1 && (
                            <button
                                onClick={() => setCurrentPage(p => p + 1)}
                                aria-label="Pagina următoare"
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 active:bg-white shadow-md ring-1 ring-gray-200/70 rounded-full w-9 h-9 flex items-center justify-center transition-opacity"
                            >
                                <svg className="w-4 h-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        )}

                        {/* Page indicator */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full tabular-nums">
                            {currentPage + 1} / {totalPages}
                        </div>
                    </div>

                    {/* Thumbnail strip */}
                    <div className="border-t border-gray-100 p-3">
                        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                            {catalog.pages.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i)}
                                    aria-label={`Pagina ${i + 1}`}
                                    className={`shrink-0 w-10 h-14 rounded-lg border-2 transition-colors flex items-center justify-center text-[10px] font-medium ${
                                        i === currentPage
                                            ? 'border-lidl-blue bg-lidl-light text-lidl-blue font-bold'
                                            : 'border-gray-200 bg-gray-50 text-gray-400 active:border-gray-300'
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                /* Products list with add-to-list */
                <div className="space-y-2">
                    {catalog.products.map((product) => (
                        <div key={product.slug} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center gap-3 shadow-sm hover:border-lidl-blue transition-colors">
                            <Link href={`/produs/${product.slug}`} className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="shrink-0 w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
                                    {product.imageUrl ? (
                                        /* eslint-disable-next-line @next/next/no-img-element */
                                        <img
                                            src={product.imageUrl}
                                            alt={product.name}
                                            loading="lazy"
                                            className="w-full h-full object-contain p-1"
                                        />
                                    ) : (
                                        <svg className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 text-sm leading-snug">{product.name}</h3>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {product.category}{product.unit ? ` · ${product.unit}` : ''}
                                    </p>
                                    {product.newPrice > 0 && (
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <span className="text-lidl-red font-bold text-sm">{product.newPrice.toFixed(2)} lei</span>
                                            {product.oldPrice && (
                                                <span className="text-gray-400 line-through text-xs">{product.oldPrice.toFixed(2)}</span>
                                            )}
                                            {product.discount && (
                                                <span className="bg-lidl-red text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">{product.discount}</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </Link>
                            <AddToListButton product={product} />
                        </div>
                    ))}

                    {catalog.products.length === 0 && (
                        <div className="text-center py-12 text-gray-400">
                            <svg className="w-10 h-10 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <p className="text-sm font-medium text-gray-500">Lista de produse nu este disponibilă</p>
                            <p className="text-xs text-gray-400 mt-1">Răsfoiește catalogul din tab-ul anterior.</p>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
