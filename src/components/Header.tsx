import Link from 'next/link';

export default function Header() {
    return (
        <header className="bg-lidl-blue sticky top-0 z-50 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <div className="bg-lidl-yellow rounded-lg px-3 py-1">
                        <span className="text-lidl-blue font-extrabold text-xl">Catalog</span>
                    </div>
                    <span className="text-white font-bold text-xl">Lidl</span>
                    <span className="text-lidl-yellow text-sm">.ro</span>
                </Link>

                <nav className="hidden md:flex items-center gap-6">
                    <Link href="/" className="text-white/90 hover:text-white text-sm font-medium transition-colors">
                        Acasă
                    </Link>
                    <Link href="/arhiva" className="text-white/90 hover:text-white text-sm font-medium transition-colors">
                        Arhivă Cataloage
                    </Link>
                    <Link href="/categorie/alimente" className="text-white/90 hover:text-white text-sm font-medium transition-colors">
                        Alimente
                    </Link>
                    <Link href="/categorie/non-food" className="text-white/90 hover:text-white text-sm font-medium transition-colors">
                        Non-Food
                    </Link>
                </nav>

                <div className="flex items-center gap-3">
                    <Link
                        href="/arhiva"
                        className="bg-lidl-yellow text-lidl-blue font-bold text-sm px-4 py-2 rounded-lg hover:bg-yellow-300 transition-colors"
                    >
                        Vezi Cataloage
                    </Link>
                </div>
            </div>
        </header>
    );
}
