'use client';
import Link from 'next/link';

interface StockSubTabsProps {
    symbol: string;
    activeTab: string;
}

export function StockSubTabs({ symbol, activeTab }: StockSubTabsProps) {
    const tabs = [
        { name: 'All', path: '' }, // Summary page
        { name: 'Analysis', path: '/analysis' },
        { name: 'Comments', path: '/comments' }, // Placeholder paths
        { name: 'News', path: '/news' }, // Placeholder
        { name: 'Transcripts & Insights', path: '/transcripts' },
        { name: 'SEC Filings', path: '/sec-filings' }, // Placeholder
        { name: 'Press Releases', path: '/press-releases' }, // Placeholder
        { name: 'Related Analysis', path: '/related-analysis' } // Placeholder
    ];

    return (
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6 border-b border-gray-100 pb-3">
            <div className="flex bg-transparent items-center text-[13px] text-gray-500 overflow-x-auto no-scrollbar whitespace-nowrap">
                {tabs.map((tab, i) => {
                    // Determine if this tab is active.
                    // For "All" (empty path), it matches exactly /stocks/[symbol]
                    // For others, we check if the path is included? Or exact match?
                    // The simple way: pass "activeTab" prop which matches the 'name'
                    const isActive = activeTab === tab.name;

                    // Determine the href. If path is empty, it's the root stock page.
                    const href = `/stocks/${symbol}${tab.path}`;

                    // Valid text styling
                    const textClass = isActive
                        ? 'text-gray-900 font-bold'
                        : 'hover:text-blue-600 transition-colors cursor-pointer';

                    return (
                        <div key={tab.name} className="flex items-center shrink-0">
                            <Link href={href} className={textClass}>
                                {tab.name}
                            </Link>
                            {i < tabs.length - 1 && <span className="mx-3 text-gray-300 font-light text-xs">|</span>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
