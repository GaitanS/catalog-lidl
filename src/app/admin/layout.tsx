import type { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Admin Panel',
    robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <style>{`
                header, footer, .mobile-nav, .shopping-list-btn { display: none !important; }
                main { padding-bottom: 0 !important; }
                body { background: #f3f4f6 !important; }
            `}</style>
            {children}
        </>
    );
}
