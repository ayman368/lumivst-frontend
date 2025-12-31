'use client';

import React, { useState, useEffect } from 'react';
import { PeersSubTabs } from '../../../_components/PeersSubTabs';

// Mock data for Related ETFs
const ETF_DATA = [
    { symbol: 'SOXX', name: 'iShares Semiconductor ETF', marketCap: '12.5B', pe: '32.4', expense: '0.35%', grade: 'A' },
    { symbol: 'SMH', name: 'VanEck Semiconductor ETF', marketCap: '18.2B', pe: '35.1', expense: '0.35%', grade: 'A-' },
    { symbol: 'QQQ', name: 'Invesco QQQ Trust', marketCap: '245.8B', pe: '30.2', expense: '0.20%', grade: 'A+' },
    { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', marketCap: '490.1B', pe: '24.5', expense: '0.09%', grade: 'A' },
    { symbol: 'XLK', name: 'Technology Select Sector SPDR Fund', marketCap: '65.4B', pe: '28.9', expense: '0.10%', grade: 'A' },
];

const SUB_TABS = ['Valuation', 'Day Watch', 'Dividends', 'Growth', 'Momentum', 'Performance'];

export default function RelatedEtfsPage({ params }: { params: Promise<{ symbol: string }> }) {
    const [resolvedParams, setResolvedParams] = useState<{ symbol: string } | null>(null);
    const [activeTab, setActiveTab] = useState('Valuation');

    useEffect(() => {
        params.then(setResolvedParams);
    }, [params]);

    if (!resolvedParams) return null;
    const { symbol } = resolvedParams;

    return (
        <div className="bg-gray-50 min-h-screen pb-10">
            {/* Top Navigation Tabs */}
            <PeersSubTabs symbol={symbol} />

            <div className="px-6 max-w-[1400px] mx-auto bg-white p-6 rounded shadow-sm">
                
                {/* Secondary Tabs */}
                <div className="flex gap-6 mb-8 border-b border-gray-200 pb-2">
                    {SUB_TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`text-sm font-medium pb-2 -mb-2.5 transition-colors ${
                                activeTab === tab
                                    ? 'text-black border-b-2 border-black'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Table: Related ETFs */}
                <div className="mb-10">
                    <h3 className="text-sm font-bold text-gray-900 mb-4">ETFs Related to {symbol}</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="py-2 font-semibold text-gray-500 w-[80px]">Ticker</th>
                                    <th className="py-2 font-semibold text-gray-500">ETF Name</th>
                                    <th className="py-2 font-semibold text-gray-500 text-right">AUM</th>
                                    <th className="py-2 font-semibold text-gray-500 text-right">PE Ratio</th>
                                    <th className="py-2 font-semibold text-gray-500 text-right">Expense Ratio</th>
                                    <th className="py-2 font-semibold text-gray-500 text-right">Grade</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ETF_DATA.map((row) => (
                                    <tr key={row.symbol} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 font-bold text-blue-600 cursor-pointer hover:underline">{row.symbol}</td>
                                        <td className="py-3 text-gray-900 font-semibold">{row.name}</td>
                                        <td className="py-3 text-right font-bold text-gray-900">{row.marketCap}</td>
                                        <td className="py-3 text-right text-gray-900 font-medium">{row.pe}</td>
                                        <td className="py-3 text-right text-gray-900 font-medium">{row.expense}</td>
                                        <td className="py-3 text-right text-gray-900 font-medium">{row.grade}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-2">
                        <button className="text-xs text-blue-500 hover:underline">Subscribe to See All »</button>
                    </div>
                </div>

            </div>
        </div>
    );
}
