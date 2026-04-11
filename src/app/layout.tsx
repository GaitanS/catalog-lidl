import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";
import ShoppingList from "@/components/ShoppingList";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

export const metadata: Metadata = {
    metadataBase: new URL('https://cataloglidl.ro'),
    title: {
        default: 'Catalog Lidl Săptămânal 2026 — Oferte și Reduceri | cataloglidl.ro',
        template: '%s | cataloglidl.ro',
    },
    description: 'Catalogul Lidl actualizat săptămânal. Fără login, fără app. Vezi toate ofertele, reducerile și promoțiile din magazinele Lidl România. Căutare produse și listă cumpărături gratuite.',
    keywords: [
        'catalog lidl',
        'oferte lidl',
        'reduceri lidl',
        'catalog lidl saptamana aceasta',
        'lidl promotii',
        'catalog lidl romania',
        'catalog lidl online',
        'lidl plus fara aplicatie',
        'catalog lidl luni',
        'catalog lidl joi',
    ],
    manifest: '/manifest.json',
    openGraph: {
        type: 'website',
        locale: 'ro_RO',
        siteName: 'cataloglidl.ro',
        url: 'https://cataloglidl.ro',
    },
    twitter: {
        card: 'summary_large_image',
    },
    alternates: {
        canonical: 'https://cataloglidl.ro',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    icons: {
        icon: [
            { url: '/favicon.ico' },
            { url: '/icon.svg', type: 'image/svg+xml' },
        ],
        apple: '/icon.svg',
    },
};

export const viewport: Viewport = {
    themeColor: '#0050aa',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
};

const organizationLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'cataloglidl.ro',
    url: 'https://cataloglidl.ro',
    logo: 'https://cataloglidl.ro/icon-512.png',
    description: 'Catalogul Lidl România actualizat săptămânal, fără login și fără aplicație.',
};

const websiteLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Catalog Lidl România',
    url: 'https://cataloglidl.ro',
    potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: 'https://cataloglidl.ro/?q={search_term_string}' },
        'query-input': 'required name=search_term_string',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ro" className="h-full antialiased" data-scroll-behavior="smooth">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link rel="preconnect" href="https://fundingchoicesmessages.google.com" />
                <meta name="google-adsense-account" content="ca-pub-4509784482094331" />
                <script
                    async
                    src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4509784482094331"
                    crossOrigin="anonymous"
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
                />
            </head>
            <body className="min-h-full flex flex-col bg-gray-50">
                <Header />
                <main className="flex-1 pb-16 md:pb-0">
                    {children}
                </main>
                <Footer />
                <MobileNav />
                <ShoppingList />
                <ServiceWorkerRegister />
            </body>
        </html>
    );
}
