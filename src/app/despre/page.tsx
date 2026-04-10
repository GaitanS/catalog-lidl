import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Despre cataloglidl.ro',
    description: 'Informații despre cataloglidl.ro — site-ul unde găsești catalogul Lidl actualizat săptămânal cu oferte și reduceri.',
    alternates: { canonical: 'https://cataloglidl.ro/despre' },
};

export default function DesprePage() {
    return (
        <div className="max-w-3xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Despre cataloglidl.ro</h1>
            <div className="prose max-w-none text-gray-600 space-y-4">
                <p>
                    <strong>cataloglidl.ro</strong> este un site independent care pune la dispoziția consumatorilor din România
                    catalogul Lidl actualizat săptămânal, într-un format ușor de răsfoit online.
                </p>
                <p>
                    Scopul nostru este să te ajutăm să găsești rapid cele mai bune oferte și reduceri din magazinele Lidl,
                    fără a fi nevoie să te deplasezi în magazin pentru a vedea catalogul fizic.
                </p>
                <p>
                    <strong>Precizare:</strong> Acest site nu este afiliat, sponsorizat sau aprobat oficial de Lidl România sau Lidl Stiftung & Co. KG.
                    Toate mărcile comerciale aparțin deținătorilor respectivi.
                </p>
                <p>
                    Pentru întrebări sau sugestii, ne poți contacta pe pagina de <Link href="/contact" className="text-lidl-blue hover:underline">contact</Link>.
                </p>
            </div>
        </div>
    );
}
