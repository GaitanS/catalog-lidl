'use client';

import { useState, useEffect, useCallback } from 'react';

interface ScraperLog {
    timestamp: string;
    status: string;
    catalogsFound: number;
    catalogsScraped: number;
    totalPages: number;
    totalProducts: number;
    activeCatalogs?: number;
    errors: string[];
    durationMs: number;
}

interface Product {
    id: string;
    name: string;
    price: number;
    oldPrice: number;
    discount: string;
    page: number;
    imagePath: string;
}

interface Catalog {
    slug: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
    pages: { pageNumber: number }[];
    products?: Product[];
    scrapedAt?: string;
}

type Tab = 'overview' | 'catalogs' | 'scraper' | 'logs';

export default function AdminPage() {
    const [authed, setAuthed] = useState(false);
    const [user, setUser] = useState('');
    const [pass, setPass] = useState('');
    const [loginError, setLoginError] = useState('');
    const [tab, setTab] = useState<Tab>('overview');
    const [catalogs, setCatalogs] = useState<Catalog[]>([]);
    const [logs, setLogs] = useState<ScraperLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [scraping, setScraping] = useState(false);
    const [scrapeOutput, setScrapeOutput] = useState('');
    const [editingCatalog, setEditingCatalog] = useState<string | null>(null);
    const [editingProduct, setEditingProduct] = useState<{ catalogSlug: string; productId: string } | null>(null);
    const [editForm, setEditForm] = useState<Record<string, string | number | boolean>>({});
    const [productEditForm, setProductEditForm] = useState<Record<string, string | number>>({});
    const [message, setMessage] = useState('');

    const fetchCatalogs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/catalogs');
            if (res.status === 401) { setAuthed(false); return; }
            setCatalogs(await res.json());
        } catch { /* ignore */ }
        setLoading(false);
    }, []);

    const fetchLogs = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/logs');
            if (res.status === 401) { setAuthed(false); return; }
            setLogs(await res.json());
        } catch { /* ignore */ }
    }, []);

    useEffect(() => {
        if (authed) {
            fetchCatalogs();
            fetchLogs();
        }
    }, [authed, fetchCatalogs, fetchLogs]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError('');
        const res = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user, pass }),
        });
        if (res.ok) {
            setAuthed(true);
            setPass('');
        } else {
            setLoginError('Credentiale invalide');
        }
    };

    const handleLogout = async () => {
        await fetch('/api/admin/logout', { method: 'POST' });
        setAuthed(false);
    };

    const handleScrape = async () => {
        setScraping(true);
        setScrapeOutput('Se ruleaza scraper-ul... (poate dura 2-5 minute)');
        try {
            const res = await fetch('/api/admin/scrape', { method: 'POST' });
            const data = await res.json();
            if (data.ok) {
                setScrapeOutput(data.output || 'Scrape complet!');
                fetchCatalogs();
                fetchLogs();
            } else {
                setScrapeOutput(`Eroare: ${data.error}\n${data.stdout || ''}\n${data.stderr || ''}`);
            }
        } catch (err) {
            setScrapeOutput(`Eroare de retea: ${err}`);
        }
        setScraping(false);
    };

    const handleCatalogSave = async (slug: string) => {
        const res = await fetch('/api/admin/catalogs', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slug, updates: editForm }),
        });
        if (res.ok) {
            setMessage('Catalog salvat!');
            setEditingCatalog(null);
            fetchCatalogs();
        } else {
            setMessage('Eroare la salvare');
        }
        setTimeout(() => setMessage(''), 3000);
    };

    const handleCatalogDelete = async (slug: string) => {
        if (!confirm(`Sterge catalogul "${slug}"? Actiunea este ireversibila.`)) return;
        const res = await fetch('/api/admin/catalogs', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slug }),
        });
        if (res.ok) {
            setMessage('Catalog sters!');
            fetchCatalogs();
        }
        setTimeout(() => setMessage(''), 3000);
    };

    const handleProductSave = async () => {
        if (!editingProduct) return;
        const res = await fetch('/api/admin/products', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                catalogSlug: editingProduct.catalogSlug,
                productId: editingProduct.productId,
                updates: {
                    name: productEditForm.name,
                    price: Number(productEditForm.price),
                    oldPrice: Number(productEditForm.oldPrice),
                    discount: productEditForm.discount,
                },
            }),
        });
        if (res.ok) {
            setMessage('Produs salvat!');
            setEditingProduct(null);
            fetchCatalogs();
        }
        setTimeout(() => setMessage(''), 3000);
    };

    const handleProductDelete = async (catalogSlug: string, productId: string) => {
        if (!confirm('Sterge acest produs?')) return;
        const res = await fetch('/api/admin/products', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ catalogSlug, productId }),
        });
        if (res.ok) {
            setMessage('Produs sters!');
            fetchCatalogs();
        }
        setTimeout(() => setMessage(''), 3000);
    };

    // ─── Login Screen ────────────────────────────────────────
    if (!authed) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <form onSubmit={handleLogin} className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-lidl-blue rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        </div>
                        <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                    </div>
                    <input
                        type="text"
                        placeholder="Utilizator"
                        value={user}
                        onChange={e => setUser(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 mb-3 text-sm focus:ring-2 focus:ring-lidl-blue focus:border-lidl-blue outline-none"
                    />
                    <input
                        type="password"
                        placeholder="Parola"
                        value={pass}
                        onChange={e => setPass(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 mb-4 text-sm focus:ring-2 focus:ring-lidl-blue focus:border-lidl-blue outline-none"
                    />
                    {loginError && <p className="text-red-600 text-sm mb-3">{loginError}</p>}
                    <button type="submit" className="w-full bg-lidl-blue text-white rounded-lg py-2.5 font-medium hover:bg-lidl-dark transition-colors">
                        Autentificare
                    </button>
                </form>
            </div>
        );
    }

    const totalProducts = catalogs.reduce((s, c) => s + (c.products?.length || 0), 0);
    const totalPages = catalogs.reduce((s, c) => s + (c.pages?.length || 0), 0);
    const activeCatalogs = catalogs.filter(c => c.isActive);
    const lastLog = logs[0];

    const tabs: { key: Tab; label: string }[] = [
        { key: 'overview', label: 'Prezentare generala' },
        { key: 'catalogs', label: 'Cataloage' },
        { key: 'scraper', label: 'Scraper' },
        { key: 'logs', label: 'Jurnale' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-lidl-blue rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">CatalogLidl Admin</h1>
                        <p className="text-sm text-gray-500">Panou de administrare</p>
                    </div>
                </div>
                <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-600 transition-colors">
                    Deconectare
                </button>
            </div>

            {/* Toast */}
            {message && (
                <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50">
                    {message}
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-200 rounded-lg p-1 mb-6">
                {tabs.map(t => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${tab === t.key ? 'bg-white text-lidl-blue shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ─── Overview ──────────────────────────────────── */}
            {tab === 'overview' && (
                <div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <StatCard label="Cataloage" value={catalogs.length} color="blue" />
                        <StatCard label="Active" value={activeCatalogs.length} color="green" />
                        <StatCard label="Produse" value={totalProducts} color="yellow" />
                        <StatCard label="Pagini" value={totalPages} color="purple" />
                    </div>

                    {lastLog && (
                        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 mb-6">
                            <h3 className="font-semibold text-gray-900 mb-3">Ultimul Scrape</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                <div>
                                    <span className="text-gray-500">Status:</span>{' '}
                                    <span className={lastLog.status === 'success' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                        {lastLog.status === 'success' ? 'OK' : 'Eroare'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Data:</span>{' '}
                                    {new Date(lastLog.timestamp).toLocaleString('ro-RO')}
                                </div>
                                <div>
                                    <span className="text-gray-500">Durata:</span>{' '}
                                    {(lastLog.durationMs / 1000).toFixed(1)}s
                                </div>
                                <div>
                                    <span className="text-gray-500">Cataloage:</span>{' '}
                                    {lastLog.catalogsScraped}/{lastLog.catalogsFound}
                                </div>
                            </div>
                            {lastLog.errors.length > 0 && (
                                <div className="mt-3 text-sm text-red-600">
                                    {lastLog.errors.map((e, i) => <div key={i}>{e}</div>)}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-3">Cataloage Active</h3>
                        {activeCatalogs.length === 0 && <p className="text-gray-500 text-sm">Niciun catalog activ</p>}
                        <div className="space-y-2">
                            {activeCatalogs.map(c => (
                                <div key={c.slug} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                                    <div>
                                        <span className="font-medium text-gray-900">{c.title}</span>
                                        <span className="text-sm text-gray-500 ml-2">{c.startDate} - {c.endDate}</span>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {c.pages?.length || 0} pag. / {c.products?.length || 0} prod.
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Catalogs ──────────────────────────────────── */}
            {tab === 'catalogs' && (
                <div className="space-y-4">
                    {loading && <p className="text-gray-500">Se incarca...</p>}
                    {catalogs.map(catalog => (
                        <div key={catalog.slug} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{catalog.title}</h3>
                                        <p className="text-sm text-gray-500">{catalog.startDate} - {catalog.endDate}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${catalog.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {catalog.isActive ? 'Activ' : 'Arhivat'}
                                        </span>
                                        <button
                                            onClick={() => {
                                                setEditingCatalog(editingCatalog === catalog.slug ? null : catalog.slug);
                                                setEditForm({
                                                    title: catalog.title,
                                                    description: catalog.description,
                                                    startDate: catalog.startDate,
                                                    endDate: catalog.endDate,
                                                    isActive: catalog.isActive,
                                                });
                                            }}
                                            className="text-lidl-blue hover:text-lidl-dark text-sm font-medium"
                                        >
                                            Editeaza
                                        </button>
                                        <button onClick={() => handleCatalogDelete(catalog.slug)} className="text-red-500 hover:text-red-700 text-sm">
                                            Sterge
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-4 text-sm text-gray-500">
                                    <span>{catalog.pages?.length || 0} pagini</span>
                                    <span>{catalog.products?.length || 0} produse</span>
                                    {catalog.scrapedAt && <span>Scapat: {new Date(catalog.scrapedAt).toLocaleString('ro-RO')}</span>}
                                </div>

                                {/* Edit Catalog Form */}
                                {editingCatalog === catalog.slug && (
                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Titlu</label>
                                                <input
                                                    value={String(editForm.title || '')}
                                                    onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Descriere</label>
                                                <input
                                                    value={String(editForm.description || '')}
                                                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Data inceput</label>
                                                <input
                                                    type="date"
                                                    value={String(editForm.startDate || '')}
                                                    onChange={e => setEditForm({ ...editForm, startDate: e.target.value })}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Data sfarsit</label>
                                                <input
                                                    type="date"
                                                    value={String(editForm.endDate || '')}
                                                    onChange={e => setEditForm({ ...editForm, endDate: e.target.value })}
                                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 mt-3">
                                            <label className="flex items-center gap-2 text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={Boolean(editForm.isActive)}
                                                    onChange={e => setEditForm({ ...editForm, isActive: e.target.checked })}
                                                    className="rounded"
                                                />
                                                Activ
                                            </label>
                                            <button
                                                onClick={() => handleCatalogSave(catalog.slug)}
                                                className="bg-lidl-blue text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-lidl-dark"
                                            >
                                                Salveaza
                                            </button>
                                            <button onClick={() => setEditingCatalog(null)} className="text-gray-500 text-sm">
                                                Anuleaza
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Products Table */}
                                {catalog.products && catalog.products.length > 0 && (
                                    <div className="mt-4">
                                        <details>
                                            <summary className="cursor-pointer text-sm font-medium text-lidl-blue hover:text-lidl-dark">
                                                {catalog.products.length} produse — click pentru detalii
                                            </summary>
                                            <div className="mt-3 overflow-x-auto">
                                                <table className="w-full text-sm">
                                                    <thead>
                                                        <tr className="text-left text-gray-500 border-b border-gray-200">
                                                            <th className="pb-2 pr-3">Imagine</th>
                                                            <th className="pb-2 pr-3">Nume</th>
                                                            <th className="pb-2 pr-3">Pret</th>
                                                            <th className="pb-2 pr-3">Pret vechi</th>
                                                            <th className="pb-2 pr-3">Reducere</th>
                                                            <th className="pb-2 pr-3">Pag.</th>
                                                            <th className="pb-2">Actiuni</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {catalog.products.map(product => (
                                                            <tr key={product.id} className="border-b border-gray-100 last:border-0">
                                                                <td className="py-2 pr-3">
                                                                    {product.imagePath ? (
                                                                        <img src={product.imagePath} alt="" className="w-10 h-10 object-contain rounded" />
                                                                    ) : (
                                                                        <div className="w-10 h-10 bg-gray-100 rounded" />
                                                                    )}
                                                                </td>
                                                                <td className="py-2 pr-3">
                                                                    {editingProduct?.productId === product.id ? (
                                                                        <input
                                                                            value={String(productEditForm.name || '')}
                                                                            onChange={e => setProductEditForm({ ...productEditForm, name: e.target.value })}
                                                                            className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                                                                        />
                                                                    ) : (
                                                                        <span className="text-gray-900">{product.name || '—'}</span>
                                                                    )}
                                                                </td>
                                                                <td className="py-2 pr-3 tabular-nums">
                                                                    {editingProduct?.productId === product.id ? (
                                                                        <input
                                                                            type="number"
                                                                            step="0.01"
                                                                            value={productEditForm.price || 0}
                                                                            onChange={e => setProductEditForm({ ...productEditForm, price: e.target.value })}
                                                                            className="border border-gray-300 rounded px-2 py-1 text-sm w-20"
                                                                        />
                                                                    ) : (
                                                                        product.price > 0 ? `${product.price} lei` : '—'
                                                                    )}
                                                                </td>
                                                                <td className="py-2 pr-3 tabular-nums text-gray-500">
                                                                    {editingProduct?.productId === product.id ? (
                                                                        <input
                                                                            type="number"
                                                                            step="0.01"
                                                                            value={productEditForm.oldPrice || 0}
                                                                            onChange={e => setProductEditForm({ ...productEditForm, oldPrice: e.target.value })}
                                                                            className="border border-gray-300 rounded px-2 py-1 text-sm w-20"
                                                                        />
                                                                    ) : (
                                                                        product.oldPrice > 0 ? `${product.oldPrice} lei` : '—'
                                                                    )}
                                                                </td>
                                                                <td className="py-2 pr-3">
                                                                    {editingProduct?.productId === product.id ? (
                                                                        <input
                                                                            value={String(productEditForm.discount || '')}
                                                                            onChange={e => setProductEditForm({ ...productEditForm, discount: e.target.value })}
                                                                            className="border border-gray-300 rounded px-2 py-1 text-sm w-16"
                                                                        />
                                                                    ) : (
                                                                        product.discount ? (
                                                                            <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded text-xs font-medium">{product.discount}</span>
                                                                        ) : '—'
                                                                    )}
                                                                </td>
                                                                <td className="py-2 pr-3 text-gray-500">{product.page}</td>
                                                                <td className="py-2">
                                                                    {editingProduct?.productId === product.id ? (
                                                                        <div className="flex gap-1">
                                                                            <button onClick={handleProductSave} className="text-green-600 hover:text-green-800 text-xs font-medium">Salveaza</button>
                                                                            <button onClick={() => setEditingProduct(null)} className="text-gray-400 text-xs">Anuleaza</button>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex gap-1">
                                                                            <button
                                                                                onClick={() => {
                                                                                    setEditingProduct({ catalogSlug: catalog.slug, productId: product.id });
                                                                                    setProductEditForm({
                                                                                        name: product.name,
                                                                                        price: product.price,
                                                                                        oldPrice: product.oldPrice,
                                                                                        discount: product.discount,
                                                                                    });
                                                                                }}
                                                                                className="text-lidl-blue hover:text-lidl-dark text-xs font-medium"
                                                                            >
                                                                                Editeaza
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleProductDelete(catalog.slug, product.id)}
                                                                                className="text-red-500 hover:text-red-700 text-xs"
                                                                            >
                                                                                Sterge
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </details>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ─── Scraper ──────────────────────────────────── */}
            {tab === 'scraper' && (
                <div className="space-y-4">
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-3">Scraper Manual</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Ruleaza scraper-ul pentru a actualiza cataloagele. Procesul poate dura 2-5 minute.
                            Automatul ruleaza zilnic la 07:00.
                        </p>
                        <button
                            onClick={handleScrape}
                            disabled={scraping}
                            className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-colors ${
                                scraping
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-lidl-blue text-white hover:bg-lidl-dark'
                            }`}
                        >
                            {scraping ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                    Se ruleaza...
                                </span>
                            ) : 'Ruleaza Scraper Acum'}
                        </button>
                    </div>

                    {scrapeOutput && (
                        <div className="bg-gray-900 text-green-400 rounded-xl p-5 shadow-sm overflow-x-auto">
                            <pre className="text-xs font-mono whitespace-pre-wrap">{scrapeOutput}</pre>
                        </div>
                    )}

                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-3">Configurare Cron</h3>
                        <p className="text-sm text-gray-600 mb-3">
                            Adauga urmatoarea linie in crontab pe VPS pentru scraping automat zilnic:
                        </p>
                        <code className="block bg-gray-100 rounded-lg p-3 text-sm text-gray-800 font-mono">
                            0 7 * * * /var/www/catalog-lidl/scripts/daily-scrape.sh &gt;&gt; /var/www/catalog-lidl/logs/cron.log 2&gt;&amp;1
                        </code>
                        <p className="text-xs text-gray-500 mt-2">
                            Ruleaza zilnic la 07:00. Scraper-ul descarca cataloagele noi, reconstruieste site-ul si restarteaza PM2.
                        </p>
                    </div>
                </div>
            )}

            {/* ─── Logs ──────────────────────────────────── */}
            {tab === 'logs' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-5 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Jurnale Scraper</h3>
                        <button onClick={fetchLogs} className="text-sm text-lidl-blue hover:text-lidl-dark font-medium">
                            Reincarca
                        </button>
                    </div>
                    {logs.length === 0 ? (
                        <p className="p-5 text-gray-500 text-sm">Niciun jurnal disponibil</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-gray-500 bg-gray-50">
                                        <th className="px-5 py-2.5">Data</th>
                                        <th className="px-5 py-2.5">Status</th>
                                        <th className="px-5 py-2.5">Cataloage</th>
                                        <th className="px-5 py-2.5">Produse</th>
                                        <th className="px-5 py-2.5">Pagini</th>
                                        <th className="px-5 py-2.5">Durata</th>
                                        <th className="px-5 py-2.5">Erori</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((log, i) => (
                                        <tr key={i} className="border-b border-gray-100 last:border-0">
                                            <td className="px-5 py-2.5 text-gray-900">{new Date(log.timestamp).toLocaleString('ro-RO')}</td>
                                            <td className="px-5 py-2.5">
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                    log.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                    {log.status === 'success' ? 'OK' : 'Eroare'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-2.5 tabular-nums">{log.catalogsScraped}/{log.catalogsFound}</td>
                                            <td className="px-5 py-2.5 tabular-nums">{log.totalProducts}</td>
                                            <td className="px-5 py-2.5 tabular-nums">{log.totalPages}</td>
                                            <td className="px-5 py-2.5 tabular-nums">{(log.durationMs / 1000).toFixed(1)}s</td>
                                            <td className="px-5 py-2.5">
                                                {log.errors.length > 0 ? (
                                                    <span className="text-red-600 text-xs">{log.errors.length} erori</span>
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
    const colors: Record<string, string> = {
        blue: 'bg-blue-50 text-blue-700 border-blue-200',
        green: 'bg-green-50 text-green-700 border-green-200',
        yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        purple: 'bg-purple-50 text-purple-700 border-purple-200',
    };
    return (
        <div className={`rounded-xl p-4 border ${colors[color] || colors.blue}`}>
            <div className="text-2xl font-bold tabular-nums">{value}</div>
            <div className="text-sm opacity-75">{label}</div>
        </div>
    );
}
