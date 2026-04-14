import Link from 'next/link';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 text-gray-400 mt-auto">
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="text-white font-bold mb-4">Catalog Lidl</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/" className="hover:text-white transition-colors">Catalog Săptămâna Asta</Link></li>
                            <li><Link href="/oferte-lidl-saptamana-asta" className="hover:text-white transition-colors">Oferte Lidl Săptămâna Aceasta</Link></li>
                            <li><Link href="/arhiva" className="hover:text-white transition-colors">Catalog Săptămâna Trecută</Link></li>
                            <li><Link href="/lidl" className="hover:text-white transition-colors">Magazine Lidl pe Orașe</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-white font-bold mb-4">Categorii</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/categorie/fructe-si-legume" className="hover:text-white transition-colors">Fructe și Legume</Link></li>
                            <li><Link href="/categorie/carne-si-mezeluri" className="hover:text-white transition-colors">Carne și Mezeluri</Link></li>
                            <li><Link href="/categorie/lactate" className="hover:text-white transition-colors">Lactate</Link></li>
                            <li><Link href="/categorie/bauturi" className="hover:text-white transition-colors">Băuturi</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-white font-bold mb-4">Informații</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/despre" className="hover:text-white transition-colors">Despre Noi</Link></li>
                            <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                            <li><Link href="/confidentialitate" className="hover:text-white transition-colors">Confidențialitate</Link></li>
                            <li><Link href="/termeni" className="hover:text-white transition-colors">Termeni și Condiții</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-white font-bold mb-4">Orașe Populare</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/lidl/bucuresti" className="hover:text-white transition-colors">Lidl București</Link></li>
                            <li><Link href="/lidl/cluj-napoca" className="hover:text-white transition-colors">Lidl Cluj-Napoca</Link></li>
                            <li><Link href="/lidl/timisoara" className="hover:text-white transition-colors">Lidl Timișoara</Link></li>
                            <li><Link href="/lidl/iasi" className="hover:text-white transition-colors">Lidl Iași</Link></li>
                            <li><Link href="/lidl/constanta" className="hover:text-white transition-colors">Lidl Constanța</Link></li>
                            <li><Link href="/lidl/brasov" className="hover:text-white transition-colors">Lidl Brașov</Link></li>
                        </ul>
                        <p className="text-xs mt-4 text-gray-500">
                            * Acest site nu este afiliat oficial cu Lidl.
                        </p>
                    </div>
                </div>
                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
                    <p>&copy; {currentYear} cataloglidl.ro — Toate drepturile rezervate.</p>
                </div>
            </div>
        </footer>
    );
}
