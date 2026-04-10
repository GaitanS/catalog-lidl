import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contact',
    description: 'Contactează echipa cataloglidl.ro pentru întrebări, sugestii sau colaborări.',
    alternates: { canonical: 'https://cataloglidl.ro/contact' },
};

export default function ContactPage() {
    return (
        <div className="max-w-3xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Contact</h1>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
                <p className="text-gray-600 mb-6">
                    Ai o întrebare sau o sugestie? Trimite-ne un mesaj și îți vom răspunde cât mai curând.
                </p>
                <div className="space-y-4 text-gray-600">
                    <p>
                        <strong>Email:</strong>{' '}
                        <a href="mailto:contact@cataloglidl.ro" className="text-lidl-blue hover:underline">
                            contact@cataloglidl.ro
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
