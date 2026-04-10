import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Politica de Confidențialitate',
    description: 'Politica de confidențialitate a site-ului cataloglidl.ro.',
    alternates: { canonical: 'https://cataloglidl.ro/confidentialitate' },
};

export default function ConfidentialitatePage() {
    return (
        <div className="max-w-3xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Politica de Confidențialitate</h1>
            <div className="prose max-w-none text-gray-600 space-y-4">
                <p>Ultima actualizare: aprilie 2026</p>
                <h2 className="text-xl font-bold text-gray-900">1. Informații colectate</h2>
                <p>Colectăm automat informații tehnice precum adresa IP, tipul de browser și paginile accesate, prin intermediul cookie-urilor și serviciilor terțe (Google Analytics, Google AdSense).</p>
                <h2 className="text-xl font-bold text-gray-900">2. Utilizarea informațiilor</h2>
                <p>Informațiile sunt folosite pentru îmbunătățirea experienței pe site, analiză statistică și afișarea de reclame relevante prin Google AdSense.</p>
                <h2 className="text-xl font-bold text-gray-900">3. Cookie-uri</h2>
                <p>Site-ul folosește cookie-uri proprii și de la terți (Google) pentru funcționalitate și publicitate. Poți dezactiva cookie-urile din setările browserului.</p>
                <h2 className="text-xl font-bold text-gray-900">4. Google AdSense</h2>
                <p>Folosim Google AdSense pentru afișarea de reclame. Google poate folosi cookie-uri pentru a afișa reclame bazate pe vizitele anterioare pe acest site sau alte site-uri.</p>
                <h2 className="text-xl font-bold text-gray-900">5. Drepturile tale</h2>
                <p>Conform GDPR, ai dreptul de acces, rectificare și ștergere a datelor personale. Contactează-ne la contact@cataloglidl.ro.</p>
            </div>
        </div>
    );
}
