'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function PeersSubTabs({ symbol }: { symbol: string }) {
    const pathname = usePathname();
    
    const tabs = [
        { name: 'Key Stats Comparison', path: '/comparison' },
        { name: 'Related Stocks', path: '/related-stocks' },
        { name: 'Related ETFs', path: '/related-etfs' },
    ];

    const isActive = (path: string) => pathname?.includes(`/peers${path}`);

    return (
        <div className="flex border-b border-gray-200 mb-6 bg-white px-6">
            {tabs.map((tab) => (
                <Link
                    key={tab.path}
                    href={`/stocks/${symbol}/peers${tab.path}`}
                    className={`mr-8 py-3 text-sm font-medium border-b-2 transition-colors ${
                        isActive(tab.path)
                            ? 'border-black text-black'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                    {tab.name}
                </Link>
            ))}
        </div>
    );
}
