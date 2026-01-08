'use client';

import { useState } from 'react';
import RSScreener from '@/components/Screener/RSScreener';
import MarketOverview from '@/components/Watchlist/MarketOverview';
import RSMatrix from '@/components/Watchlist/RSMatrix';
import MatrixChart from '@/components/Watchlist/MatrixChart';

export default function WatchlistPage() {
    const [activeTab, setActiveTab] = useState('Overview');

    const tabs = ['Overview', 'RS Matrix', 'Matrix Chart', 'RS Screener'];

    return (
        <div className="min-h-[calc(100vh-64px)] bg-[#131722] flex flex-col">
            {/* Tabs Header */}
            <div className="border-b border-[#2a2e39] bg-[#1e222d] px-4 shrink-0">
                <div className="flex space-x-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === tab
                                ? 'border-[#2962ff] text-[#2962ff]'
                                : 'border-transparent text-[#787b86] hover:text-[#d1d4dc] hover:border-[#787b86]'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 relative">
                {activeTab === 'Overview' && (
                    <div className="h-full">
                        <MarketOverview />
                    </div>
                )}

                {activeTab === 'RS Matrix' && (
                    <div className="h-full">
                        <RSMatrix />
                    </div>
                )}

                {activeTab === 'Matrix Chart' && (
                    <div className="h-full">
                        <MatrixChart />
                    </div>
                )}

                {activeTab === 'RS Screener' && (
                    <div className="h-full">
                        <RSScreener />
                    </div>
                )}
            </div>
        </div>
    );
}
