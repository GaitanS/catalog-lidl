import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Termeni și Condiții',
    description: 'Termeni și condiții de utilizare a site-ului cataloglidl.ro.',
    alternates: { canonical: 'https://cataloglidl.ro/termeni' },
};

export default function TermeniPage() {
    return (
        <div className="max-w-3xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Termeni și Condiții</h1>
            <div className="prose max-w-none text-gray-600 space-y-4">
                <p>Ultima actualizare: aprilie 2026</p>
                <h2 className="text-xl font-bold text-gray-900">1. Acceptarea termenilor</h2>
                <p>Prin accesarea site-ului cataloglidl.ro, acceptați acești termeni și condiții de utilizare.</p>
                <h2 className="text-xl font-bold text-gray-900">2. Conținutul site-ului</h2>
                <p>Informațiile despre cataloage și oferte sunt furnizate cu titlu informativ. Ne străduim să menținem informațiile actualizate, dar nu garantăm exactitatea prețurilor sau disponibilitatea produselor.</p>
                <h2 className="text-xl font-bold text-gray-900">3. Proprietate intelectuală</h2>
                <p>Marca Lidl și logo-ul sunt proprietatea Lidl Stiftung & Co. KG. Acest site nu este afiliat oficial cu Lidl.</p>
                <h2 className="text-xl font-bold text-gray-900">4. Limitarea răspunderii</h2>
                <p>Nu ne asumăm responsabilitatea pentru diferențele între prețurile afișate pe site și cele din magazin. Verificați întotdeauna ofertele direct în magazin.</p>
                <h2 className="text-xl font-bold text-gray-900">5. Contact</h2>
                <p>Pentru întrebări legate de acești termeni, contactați-ne la contact@cataloglidl.ro.</p>
            </div>
        </div>
    );
}
