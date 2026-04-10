'use client';

import { useState } from 'react';

const STORAGE_KEY = 'cataloglidl-newsletter';

export default function NewsletterCapture() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !email.includes('@')) {
            setStatus('error');
            setError('Introdu un email valid');
            return;
        }

        setStatus('submitting');
        // For now, store locally. Backend integration will replace this.
        try {
            const existing = localStorage.getItem(STORAGE_KEY);
            const emails = existing ? JSON.parse(existing) : [];
            if (!emails.includes(email)) {
                emails.push({ email, date: new Date().toISOString() });
                localStorage.setItem(STORAGE_KEY, JSON.stringify(emails));
            }
            await new Promise(resolve => setTimeout(resolve, 400));
            setStatus('success');
            setEmail('');
            setTimeout(() => setStatus('idle'), 4000);
        } catch {
            setStatus('error');
            setError('A apărut o eroare. Încearcă din nou.');
        }
    };

    if (status === 'success') {
        return (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
                <div className="inline-flex items-center gap-2 text-green-700 font-semibold">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Te-ai abonat cu succes!
                </div>
                <p className="text-sm text-green-600 mt-1">Vei primi catalogul nou lunea și joia.</p>
            </div>
        );
    }

    return (
        <div className="bg-lidl-blue rounded-2xl p-5 md:p-6 text-white">
            <div className="max-w-xl mx-auto text-center">
                <h3 className="text-lg md:text-xl font-bold mb-1">
                    Primește catalogul nou pe email
                </h3>
                <p className="text-white/80 text-xs md:text-sm mb-4">
                    Lunea și joia dimineața. Fără spam, fără reclame.
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
                        placeholder="email@exemplu.ro"
                        required
                        className="flex-1 px-4 py-3 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-lidl-yellow"
                    />
                    <button
                        type="submit"
                        disabled={status === 'submitting'}
                        className="bg-lidl-yellow text-lidl-blue font-bold px-6 py-3 rounded-xl hover:bg-yellow-300 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {status === 'submitting' ? 'Se trimite...' : 'Mă abonez'}
                    </button>
                </form>
                {status === 'error' && (
                    <p className="text-yellow-200 text-xs mt-2">{error}</p>
                )}
                <p className="text-white/60 text-[10px] mt-3">
                    Datele tale rămân private. Poți dezabona oricând.
                </p>
            </div>
        </div>
    );
}
