'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

interface ChartingTabsProps {
    activeTab: 'charting' | 'historical-prices' | 'splits';
}

export default function ChartingTabs({ activeTab }: ChartingTabsProps) {
    const params = useParams();
    const symbol = params.symbol as string;

    const tabs = [
        { id: 'charting', label: 'Charting', path: `/stocks/${symbol}/charting` },
        { id: 'historical-prices', label: 'Historical Prices', path: `/stocks/${symbol}/historical-price` },
        { id: 'splits', label: 'Splits', path: `/stocks/${symbol}/splits` }, // Placeholder path
    ];

    return (
        <div className="flex items-center mb-6 text-sm">
            {tabs.map((tab, index) => (
                <div key={tab.id} className="flex items-center">
                    <Link
                        href={tab.path}
                        className={`transition-colors ${activeTab === tab.id
                                ? 'text-[#333333] font-bold'
                                : 'text-[#555555] hover:text-[#333333]'
                            }`}
                    >
                        {tab.label}
                    </Link>
                    {index < tabs.length - 1 && (
                        <span className="mx-3 text-[#e0e0e0]">|</span>
                    )}
                </div>
            ))}
        </div>
    );
}
