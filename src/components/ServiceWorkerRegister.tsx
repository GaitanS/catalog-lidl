'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (!('serviceWorker' in navigator)) return;
        // Only register in production to avoid dev HMR conflicts
        if (process.env.NODE_ENV !== 'production') return;

        const register = async () => {
            try {
                await navigator.serviceWorker.register('/sw.js', { scope: '/' });
            } catch {
                // ignore
            }
        };

        if (document.readyState === 'complete') {
            register();
        } else {
            window.addEventListener('load', register, { once: true });
        }
    }, []);

    return null;
}
