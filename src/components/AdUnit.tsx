'use client';

import { useEffect, useRef } from 'react';

interface AdUnitProps {
    slot: string;
    format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
    className?: string;
}

export default function AdUnit({ slot, format = 'auto', className = '' }: AdUnitProps) {
    const adRef = useRef<HTMLDivElement>(null);
    const pushed = useRef(false);

    useEffect(() => {
        if (pushed.current) return;
        pushed.current = true;

        try {
            const w = window as unknown as { adsbygoogle?: unknown[] };
            (w.adsbygoogle = w.adsbygoogle || []).push({});
        } catch {
            // AdSense not loaded
        }
    }, []);

    return (
        <div ref={adRef} className={`ad-container overflow-hidden ${className}`}>
            <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client="ca-pub-XXXXXXXXXX"
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive="true"
            />
        </div>
    );
}
