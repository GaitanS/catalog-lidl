import { Metadata } from 'next';
import Link from 'next/link';
import { getAllProducts, getProductsByCategorySlug } from '@/data/catalogs';
import ProductSearch from '@/components/ProductSearch';

const categoryMap: Record<string, { name: string; description: string }> = {
    'alimente': { name: 'Alimente', description: 'Toate ofertele la alimente din catalogul Lidl: fructe, legume, carne, lactate și multe altele.' },
    'fructe-si-legume': { name: 'Fructe și Legume', description: 'Oferte la fructe și legume proaspete din catalogul Lidl. Prețuri mici în fiecare săptămână.' },
    'carne-si-mezeluri': { name: 'Carne și Mezeluri', description: 'Oferte la carne proaspătă și mezeluri din catalogul Lidl. Piept de pui, porc, vită și preparate.' },
    'lactate': { name: 'Lactate', description: 'Oferte la produse lactate din catalogul Lidl: lapte, iaurt, brânză, smântână și unt.' },
    'panificatie': { name: 'Panificație', description: 'Oferte la panificație din catalogul Lidl: pâine, cozonac, croissant și produse de patiserie.' },
    'dulciuri': { name: 'Dulciuri', description: 'Oferte la dulciuri și ciocolată din catalogul Lidl. Biscuiți, ciocolată, prăjituri și deserturi.' },
    'bauturi': { name: 'Băuturi', description: 'Oferte la băuturi din catalogul Lidl: apă, sucuri, cafea, bere, vin și alte băuturi.' },
    'curatenie': { name: 'Curățenie', description: 'Oferte la produse de curățenie din catalogul Lidl. Detergent, balsam, dezinfectant și multe altele.' },
    'non-food': { name: 'Non-Food', description: 'Oferte non-food din catalogul Lidl: electrocasnice, haine, unelte, grădină și bricolaj.' },
    'oua': { name: 'Ouă', description: 'Oferte la ouă din catalogul Lidl: ouă proaspete, ouă vopsite pentru Paște.' },
};

export async function generateStaticParams() {
    return Object.keys(categoryMap).map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const cat = categoryMap[slug];
    if (!cat) return { title: 'Categorie' };

    return {
        title: `Oferte Lidl ${cat.name} 2026 — Reduceri Săptămânale`,
        description: cat.description,
        alternates: { canonical: `https://cataloglidl.ro/categorie/${slug}` },
    };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const cat = categoryMap[slug];

    if (!cat) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-16 text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Categorie negăsită</h1>
                <Link href="/" className="text-lidl-blue hover:underline">Înapoi la pagina principală</Link>
            </div>
        );
    }

    const products = slug === 'alimente' ? getAllProducts() : getProductsByCategorySlug(slug);

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            <nav className="text-xs text-gray-500 mb-3 flex items-center gap-2">
                <Link href="/" className="hover:text-lidl-blue">Acasă</Link>
                <span>›</span>
                <span className="text-gray-900">{cat.name}</span>
            </nav>

            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Oferte Lidl {cat.name}</h1>
            <p className="text-sm text-gray-500 mb-6">{cat.description}</p>

            {/* Products from catalogs in this category */}
            <section className="mb-10">
                <h2 className="text-lg font-bold text-gray-900 mb-3">
                    {products.length} {products.length === 1 ? 'produs' : 'produse'} în ofertă
                </h2>
                {products.length > 0 ? (
                    <ProductSearch products={products} />
                ) : (
                    <p className="text-sm text-gray-500 bg-white rounded-xl p-6 border border-gray-100">
                        Nu sunt produse în ofertă la această categorie în acest moment.
                    </p>
                )}
            </section>

            {/* Other categories */}
            <section>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Alte Categorii</h2>
                <div className="flex flex-wrap gap-2">
                    {Object.entries(categoryMap).filter(([s]) => s !== slug).map(([s, c]) => (
                        <Link
                            key={s}
                            href={`/categorie/${s}`}
                            className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm hover:border-lidl-blue hover:text-lidl-blue transition-colors"
                        >
                            {c.name}
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
