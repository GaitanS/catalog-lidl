import Link from 'next/link';
import { getActiveCatalogs, getAllCatalogs, getAllProducts } from '@/data/catalogs';
import CatalogCard from '@/components/CatalogCard';
import ProductSearch from '@/components/ProductSearch';
import NewsletterCapture from '@/components/NewsletterCapture';

export default function HomePage() {
    const activeCatalogs = getActiveCatalogs();
    const allCatalogs = getAllCatalogs();
    const currentCatalog = activeCatalogs[0];
    const allProducts = getAllProducts();

    const today = new Date();
    const weekDay = today.toLocaleDateString('ro-RO', { weekday: 'long' });
    const dateStr = today.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' });

    const endDateFormatted = currentCatalog
        ? new Date(currentCatalog.endDate).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long' })
        : '';

    // FAQ JSON-LD — captures question-based searches
    const faqLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
            {
                '@type': 'Question',
                name: 'Când apare catalogul nou Lidl?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Lidl lansează un catalog nou în fiecare luni și un catalog special în fiecare joi. Catalogul săptămânal e valabil de luni până duminică.',
                },
            },
            {
                '@type': 'Question',
                name: 'Trebuie să am cont pentru a vedea ofertele Lidl?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Nu. Pe cataloglidl.ro vezi toate ofertele fără cont, fără login și fără să instalezi nicio aplicație. Intri direct și vezi catalogul.',
                },
            },
            {
                '@type': 'Question',
                name: 'Care e diferența între cataloglidl.ro și aplicația Lidl Plus?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Aplicația Lidl Plus are cupoane exclusive și loyalty rewards dar necesită cont și instalare. cataloglidl.ro afișează doar catalogul public, fără friction — perfect dacă vrei doar să vezi ofertele săptămânii.',
                },
            },
            {
                '@type': 'Question',
                name: 'Pot căuta un anumit produs?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Da. Folosește bara de căutare de pe pagina principală sau filtrează pe categorii. Poți adăuga produsele direct pe lista ta de cumpărături.',
                },
            },
            {
                '@type': 'Question',
                name: 'Lista de cumpărături se salvează?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Da, lista se salvează pe telefonul tău (în browser) automat. Nu ai nevoie de cont. O poți trimite pe WhatsApp sau printa.',
                },
            },
        ],
    };

    return (
        <>
            <script type="application/ld+json">{JSON.stringify(faqLd)}</script>

            {/* Hero — compact on mobile */}
            <section className="bg-gradient-to-br from-lidl-blue to-lidl-dark text-white">
                <div className="max-w-7xl mx-auto px-4 py-6 md:py-12">
                    <div className="text-center">
                        <p className="text-lidl-yellow font-medium text-xs mb-1">
                            {weekDay.charAt(0).toUpperCase() + weekDay.slice(1)}, {dateStr}
                        </p>
                        <h1 className="text-2xl md:text-4xl font-extrabold mb-2 leading-tight">
                            Catalog Lidl <span className="text-lidl-yellow">Săptămâna Aceasta</span>
                        </h1>
                        <p className="text-white/80 text-sm md:text-base max-w-xl mx-auto mb-2">
                            Toate ofertele. Fără app. Fără login. Fără crash-uri.
                        </p>
                        {currentCatalog && (
                            <>
                                <p className="text-white/60 text-xs mb-4">
                                    Valabil până: <span className="text-lidl-yellow font-semibold">{endDateFormatted}</span>
                                </p>
                                <Link
                                    href={`/catalog/${currentCatalog.slug}`}
                                    className="inline-flex items-center gap-2 bg-lidl-yellow text-lidl-blue font-bold text-base px-6 py-3 rounded-xl hover:bg-yellow-300 transition-colors shadow-lg active:scale-95"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    Răsfoiește Catalogul
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* USP strip — what we do better than Lidl Plus */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-center gap-4 md:gap-8 overflow-x-auto text-xs text-gray-600 scrollbar-hide">
                    <span className="flex items-center gap-1.5 shrink-0 font-medium">
                        <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        Fără login
                    </span>
                    <span className="flex items-center gap-1.5 shrink-0 font-medium">
                        <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        Funcționează mereu
                    </span>
                    <span className="flex items-center gap-1.5 shrink-0 font-medium">
                        <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        Căutare instant
                    </span>
                    <span className="flex items-center gap-1.5 shrink-0 font-medium">
                        <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        Listă cumpărături
                    </span>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Active catalogs */}
                <section className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg md:text-xl font-bold text-gray-900">Cataloage Active</h2>
                        <Link href="/arhiva" className="text-lidl-blue hover:underline text-xs font-medium">
                            Toate &rarr;
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
                        {activeCatalogs.map((catalog) => (
                            <CatalogCard key={catalog.slug} catalog={catalog} />
                        ))}
                    </div>
                </section>

                {/* Product search — the killer feature */}
                {allProducts.length > 0 && (
                    <section className="mb-8">
                        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-1">
                            Caută în Oferte
                        </h2>
                        <p className="text-xs text-gray-500 mb-4">
                            {allProducts.length} produse în ofertă săptămâna aceasta
                        </p>
                        <ProductSearch products={allProducts} />
                    </section>
                )}

                {/* Categories */}
                <section className="mb-8">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Categorii</h2>
                    <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                        {[
                            { name: 'Fructe', slug: 'fructe-si-legume', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-1.5 0-3 .5-4 1.5C7 5.5 6 7.5 6 10c0 4 3 8 6 11 3-3 6-7 6-11 0-2.5-1-4.5-2-5.5-1-1-2.5-1.5-4-1.5z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c0 2-1 3-2 4" /></svg> },
                            { name: 'Carne', slug: 'carne-si-mezeluri', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a4 4 0 10-6.5 3.1A5 5 0 004 19h16a5 5 0 00-5-5zM9 7a3 3 0 116 0" /></svg> },
                            { name: 'Lactate', slug: 'lactate', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="7" y="4" width="10" height="16" rx="2" /><path strokeLinecap="round" d="M7 9h10M10 4V2M14 4V2" /></svg> },
                            { name: 'Panificatie', slug: 'panificatie', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 17h16M5 17c0-3 1.5-5 3-6s3.5-2 4-5c.5 3 2.5 4 4 5s3 3 3 6" /></svg> },
                            { name: 'Dulciuri', slug: 'dulciuri', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="4" y="6" width="16" height="12" rx="2" /><path strokeLinecap="round" d="M4 12h16M12 6v12" /></svg> },
                            { name: 'Bauturi', slug: 'bauturi', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 2h8l-1 8h-6L8 2zM9 10h6v1a5 5 0 01-6 0v-1zM10 14h4v6h-4z" /></svg> },
                            { name: 'Curatenie', slug: 'curatenie', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M5 14.5h14l-1.5 7h-11L5 14.5z" /></svg> },
                            { name: 'Non-Food', slug: 'non-food', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.658-5.66a2.122 2.122 0 010-3l3-3a2.122 2.122 0 013 0L15.17 7M19.5 11.5L12 19l-2-2" /><path strokeLinecap="round" d="M15 4l5 5" /></svg> },
                        ].map((cat) => (
                            <Link
                                key={cat.slug}
                                href={`/categorie/${cat.slug}`}
                                className="bg-white rounded-xl border border-gray-100 p-2 md:p-3 text-center hover:border-lidl-blue hover:shadow-md transition-all active:scale-95"
                            >
                                <span className="flex justify-center text-lidl-blue mb-1">{cat.icon}</span>
                                <span className="font-medium text-gray-700 text-[10px] md:text-xs">{cat.name}</span>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Newsletter capture */}
                <section className="mb-8">
                    <NewsletterCapture />
                </section>

                {/* SEO content — why us vs Lidl Plus */}
                <section className="mb-8 bg-white rounded-2xl border border-gray-100 p-5 md:p-8 shadow-sm">
                    <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3">De ce cataloglidl.ro?</h2>
                    <div className="text-sm text-gray-700 space-y-3 leading-relaxed">
                        <p>
                            <strong>Lidl Plus e complicat. Aici e simplu.</strong> Nu e nevoie să instalezi nimic. Nu e nevoie de cont. Nu e nevoie de SMS.
                            Deschizi pagina, vezi ofertele, găsești produsul căutat, îl adaugi pe listă. Gata.
                        </p>
                        <p>
                            Catalogul <strong>se actualizează săptămânal</strong> automat, cu toate reducerile și promoțiile din magazinele Lidl România.
                            Caută orice produs instant în loc să răsfoiești 40 de pagini. Adaugă ce-ți trebuie în <strong>lista de cumpărături</strong> — cu poze, prețuri și total calculat.
                        </p>
                        <p>
                            Dacă vrei cupoanele exclusive Lidl Plus, folosești în continuare aplicația. Dacă vrei doar să vezi ce e la reducere săptămâna asta,
                            fără friction — <strong>ești exact unde trebuie</strong>.
                        </p>
                    </div>

                    {/* FAQ section visible */}
                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-3">Întrebări frecvente</h3>
                        <div className="space-y-4 text-sm">
                            <div>
                                <p className="font-semibold text-gray-900">Când apare catalogul nou Lidl?</p>
                                <p className="text-gray-600 mt-1">Lidl lansează un catalog nou în fiecare <strong>luni</strong> și un catalog special în fiecare <strong>joi</strong>. Catalogul săptămânal e valabil de luni până duminică.</p>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">Trebuie să am cont pentru a vedea ofertele?</p>
                                <p className="text-gray-600 mt-1">Nu. Vezi toate ofertele fără cont, fără login și fără să instalezi nicio aplicație. Intri direct și vezi catalogul.</p>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">Pot căuta un anumit produs?</p>
                                <p className="text-gray-600 mt-1">Da. Folosește bara de căutare sau filtrează pe categorii. Poți adăuga produsele direct pe lista ta.</p>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">Lista de cumpărături se salvează?</p>
                                <p className="text-gray-600 mt-1">Da, lista se salvează automat pe telefonul tău. O poți trimite pe WhatsApp sau printa.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Past catalogs */}
                {allCatalogs.length > activeCatalogs.length && (
                    <section className="mb-8">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Cataloage Anterioare</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {allCatalogs.filter(c => !activeCatalogs.includes(c)).slice(0, 4).map((catalog) => (
                                <CatalogCard key={catalog.slug} catalog={catalog} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </>
    );
}
