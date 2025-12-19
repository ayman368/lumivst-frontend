'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
    { name: 'Earnings Summary', path: '' },
    { name: 'Earnings Estimates', path: '/estimates' },
    { name: 'Earnings Revisions', path: '/revisions' },
    { name: 'Earnings Surprise', path: '/surprise' },
    // Transcripts is a Top-Level tab, not a sub-tab of Earnings in our folder structure
    { name: 'Transcripts & Insights', path: '/transcripts', isAbsolute: true }
];

export function EarningsTabs({ symbol }: { symbol: string }) {
    const pathname = usePathname();
    const basePath = `/stocks/${symbol}/earnings`;

    const isActive = (tab: { path: string, isAbsolute?: boolean }) => {
        // Normalize pathname by removing trailing slash for consistent comparison
        const currentPath = pathname?.endsWith('/') ? pathname.slice(0, -1) : pathname;

        if (tab.isAbsolute) {
            return currentPath?.includes(`/stocks/${symbol}${tab.path}`);
        }

        if (tab.path === '') {
            // Exact match for Summary tab
            return currentPath === basePath;
        }
        // Starts with match for sub-pages
        return currentPath?.startsWith(`${basePath}${tab.path}`);
    };

    return (
        <div className="flex bg-transparent border-b border-gray-200 overflow-x-auto no-scrollbar mb-6">
            {TABS.map((tab) => (
                <Link
                    key={tab.name}
                    href={tab.isAbsolute ? `/stocks/${symbol}${tab.path}` : `${basePath}${tab.path}`}
                    className={`
                        px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors relative
                        ${isActive(tab)
                            ? 'text-gray-900 border-b-2 border-black'
                            : 'text-gray-500 hover:text-gray-700'
                        }
                    `}
                >
                    {tab.name}
                </Link>
            ))}
        </div>
    );
}
