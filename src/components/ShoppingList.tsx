'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CatalogProduct } from '@/data/catalogs';

interface ShoppingItem extends CatalogProduct {
    checked: boolean;
    addedAt: number;
}

const STORAGE_KEY = 'cataloglidl-shopping-list';

function loadList(): ShoppingItem[] {
    if (typeof window === 'undefined') return [];
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

function saveList(items: ShoppingItem[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function AddToListButton({ product }: { product: CatalogProduct }) {
    const [added, setAdded] = useState(false);

    const handleAdd = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const list = loadList();
        if (list.some(item => item.slug === product.slug)) {
            setAdded(true);
            setTimeout(() => setAdded(false), 2000);
            return;
        }
        list.push({ ...product, checked: false, addedAt: Date.now() });
        saveList(list);
        setAdded(true);

        window.dispatchEvent(new CustomEvent('shopping-list-updated'));

        setTimeout(() => setAdded(false), 2000);
    }, [product]);

    return (
        <button
            onClick={handleAdd}
            aria-label="Adaugă în lista de cumpărături"
            className={`shrink-0 p-2 rounded-lg transition-colors ${
                added ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400 hover:bg-lidl-light hover:text-lidl-blue active:scale-90'
            }`}
            title="Adaugă în lista de cumpărături"
        >
            {added ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
            )}
        </button>
    );
}

function formatListForShare(items: ShoppingItem[]): string {
    const active = items.filter(i => !i.checked);
    const total = active.reduce((sum, i) => sum + i.newPrice, 0);
    const lines = [
        'Lista mea de cumparaturi Lidl:',
        '',
        ...active.map(i => `- ${i.name} — ${i.newPrice.toFixed(2)} lei`),
        '',
        `Total estimat: ${total.toFixed(2)} lei`,
        '',
        'cataloglidl.ro',
    ];
    return lines.join('\n');
}

export default function ShoppingList() {
    const [items, setItems] = useState<ShoppingItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        setItems(loadList());

        const handler = () => setItems(loadList());
        window.addEventListener('shopping-list-updated', handler);
        return () => window.removeEventListener('shopping-list-updated', handler);
    }, []);

    const toggleCheck = (index: number) => {
        const updated = [...items];
        updated[index].checked = !updated[index].checked;
        setItems(updated);
        saveList(updated);
    };

    const removeItem = (index: number) => {
        const updated = items.filter((_, i) => i !== index);
        setItems(updated);
        saveList(updated);
    };

    const clearAll = () => {
        if (confirm('Ești sigur că vrei să golești lista?')) {
            setItems([]);
            saveList([]);
        }
    };

    const shareWhatsApp = () => {
        const text = encodeURIComponent(formatListForShare(items));
        window.open(`https://wa.me/?text=${text}`, '_blank');
    };

    const printList = () => {
        window.print();
    };

    const total = items.reduce((sum, item) => sum + (item.checked ? 0 : item.newPrice), 0);
    const totalAll = items.reduce((sum, item) => sum + item.newPrice, 0);
    const checkedCount = items.filter(i => i.checked).length;

    if (!mounted) return null;
    if (items.length === 0 && !isOpen) return null;

    return (
        <>
            {/* Floating button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Deschide lista de cumpărături"
                className="no-print fixed bottom-20 md:bottom-6 right-4 z-40 bg-lidl-blue text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:bg-lidl-dark transition-colors active:scale-90"
            >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
                {items.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-lidl-red text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {items.length}
                    </span>
                )}
            </button>

            {/* Shopping list panel */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex flex-col shopping-list-modal">
                    <div className="absolute inset-0 bg-black/40 no-print" onClick={() => setIsOpen(false)} />
                    <div className="relative mt-auto bg-white rounded-t-2xl max-h-[85vh] flex flex-col shadow-2xl print:static print:rounded-none print:max-h-none print:shadow-none">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-100 no-print">
                            <div>
                                <h2 className="font-bold text-gray-900">Lista de Cumpărături</h2>
                                <p className="text-xs text-gray-400">
                                    {items.length} {items.length === 1 ? 'produs' : 'produse'}
                                    {checkedCount > 0 && ` · ${checkedCount} bifate`}
                                </p>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
                                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Print-only header */}
                        <div className="hidden print:block p-4 border-b border-gray-300">
                            <h2 className="font-bold text-xl">Lista de Cumpărături Lidl</h2>
                            <p className="text-sm text-gray-600">{new Date().toLocaleDateString('ro-RO')} · cataloglidl.ro</p>
                        </div>

                        {/* Items */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-2 print:overflow-visible">
                            {items.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <svg className="w-16 h-16 mx-auto mb-3 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                                    </svg>
                                    <p className="text-sm">Lista ta e goală</p>
                                    <p className="text-xs mt-1">Apasă butonul + pe orice produs pentru a-l adăuga</p>
                                </div>
                            ) : (
                                items.map((item, i) => (
                                    <div
                                        key={item.slug + i}
                                        className={`flex items-center gap-3 p-3 rounded-xl border transition-colors print:border-gray-300 ${
                                            item.checked ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-gray-100'
                                        }`}
                                    >
                                        <button
                                            onClick={() => toggleCheck(i)}
                                            aria-label={item.checked ? 'Debifează' : 'Bifează'}
                                            className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                                item.checked ? 'bg-green-500 border-green-500' : 'border-gray-300'
                                            }`}
                                        >
                                            {item.checked && (
                                                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </button>
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-medium text-sm ${item.checked ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                                                {item.name}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {item.category}{item.unit ? ` · ${item.unit}` : ''}
                                            </p>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <span className={`font-bold text-sm ${item.checked ? 'text-gray-400' : 'text-lidl-red'}`}>
                                                {item.newPrice.toFixed(2)} lei
                                            </span>
                                            {item.discount && !item.checked && (
                                                <span className="block text-[10px] text-lidl-red font-medium">{item.discount}</span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => removeItem(i)}
                                            aria-label="Șterge produsul"
                                            className="shrink-0 p-1 text-gray-300 hover:text-red-500 no-print"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Total + actions */}
                        {items.length > 0 && (
                            <>
                                <div className="border-t border-gray-100 p-4 bg-gray-50">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm text-gray-500">Total rămas:</span>
                                        <span className="font-bold text-lg text-gray-900">{total.toFixed(2)} lei</span>
                                    </div>
                                    {checkedCount > 0 && (
                                        <div className="flex items-center justify-between text-xs text-gray-400">
                                            <span>Total complet (cu bifate):</span>
                                            <span>{totalAll.toFixed(2)} lei</span>
                                        </div>
                                    )}
                                </div>

                                {/* Action buttons */}
                                <div className="grid grid-cols-3 gap-2 p-3 border-t border-gray-100 no-print">
                                    <button
                                        onClick={shareWhatsApp}
                                        className="flex flex-col items-center gap-1 py-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 active:scale-95 transition-all"
                                    >
                                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                        </svg>
                                        <span className="text-[10px] font-semibold">WhatsApp</span>
                                    </button>
                                    <button
                                        onClick={printList}
                                        className="flex flex-col items-center gap-1 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 active:scale-95 transition-all"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                        </svg>
                                        <span className="text-[10px] font-semibold">Printează</span>
                                    </button>
                                    <button
                                        onClick={clearAll}
                                        className="flex flex-col items-center gap-1 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 active:scale-95 transition-all"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        <span className="text-[10px] font-semibold">Golește</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
