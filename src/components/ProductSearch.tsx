'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { CatalogProduct } from '@/data/catalogs';
import { AddToListButton } from './ShoppingList';

interface ProductSearchProps {
    products: CatalogProduct[];
}

function removeDiacritics(text: string): string {
    return text
        .toLowerCase()
        .replace(/[ăâ]/g, 'a')
        .replace(/[î]/g, 'i')
        .replace(/[ș]/g, 's')
        .replace(/[ț]/g, 't');
}

export default function ProductSearch({ products }: ProductSearchProps) {
    const [query, setQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');

    const categories = useMemo(() => {
        const cats = new Set(products.map(p => p.category));
        return Array.from(cats).sort();
    }, [products]);

    const filtered = useMemo(() => {
        let result = products;
        if (query.trim()) {
            const q = removeDiacritics(query);
            const words = q.split(/\s+/).filter(Boolean);
            result = result.filter(p => {
                const text = removeDiacritics(`${p.name} ${p.category} ${p.description || ''}`);
                return words.every(w => text.includes(w));
            });
        }
        if (selectedCategory) {
            result = result.filter(p => p.category === selectedCategory);
        }
        return result;
    }, [products, query, selectedCategory]);

    return (
        <div>
            {/* Search bar */}
            <div className="flex gap-2 mb-4">
                <div className="flex-1 relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Caută produse... (ex: piept de pui, ciocolată)"
                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-lidl-blue focus:border-transparent"
                    />
                    {query && (
                        <button
                            onClick={() => setQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Category pills - horizontally scrollable on mobile */}
            <div className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1 scrollbar-hide">
                <button
                    onClick={() => setSelectedCategory('')}
                    className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        !selectedCategory ? 'bg-lidl-blue text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-lidl-blue'
                    }`}
                >
                    Toate ({products.length})
                </button>
                {categories.map(cat => {
                    const count = products.filter(p => p.category === cat).length;
                    return (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat === selectedCategory ? '' : cat)}
                            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                selectedCategory === cat ? 'bg-lidl-blue text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-lidl-blue'
                            }`}
                        >
                            {cat} ({count})
                        </button>
                    );
                })}
            </div>

            {/* Results count */}
            <p className="text-xs text-gray-400 mt-2 mb-4">
                {filtered.length} {filtered.length === 1 ? 'produs' : 'produse'} {query && `pentru "${query}"`}
            </p>

            {/* Product grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filtered.map((product) => (
                    <div key={product.slug} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm hover:border-lidl-blue hover:shadow-md transition-all">
                        <Link href={`/produs/${product.slug}`} className="flex items-center gap-3 flex-1 min-w-0 active:scale-[0.98] transition-transform">
                            <div className="shrink-0 w-14 h-14 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
                                {product.imageUrl ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img src={product.imageUrl} alt={product.name} loading="lazy" className="w-full h-full object-cover" />
                                ) : (
                                    <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate">{product.name}</h3>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {product.category}{product.unit ? ` · ${product.unit}` : ''}
                                </p>
                            </div>
                            <div className="shrink-0 text-right">
                                {product.newPrice > 0 && (
                                    <>
                                        <span className="text-lidl-red font-bold text-base">{product.newPrice.toFixed(2)}</span>
                                        <span className="text-lidl-red text-xs font-medium"> lei</span>
                                    </>
                                )}
                                {product.oldPrice && (
                                    <div className="text-gray-400 line-through text-xs">{product.oldPrice.toFixed(2)} lei</div>
                                )}
                                {product.discount && (
                                    <span className="inline-block bg-lidl-red text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full mt-0.5">{product.discount}</span>
                                )}
                            </div>
                        </Link>
                        <AddToListButton product={product} />
                    </div>
                ))}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                    <svg className="w-12 h-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p>Niciun produs găsit</p>
                </div>
            )}
        </div>
    );
}
