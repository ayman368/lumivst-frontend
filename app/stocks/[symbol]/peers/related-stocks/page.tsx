'use client';

import React, { useState, useEffect } from 'react';
import { PeersSubTabs } from '../../../_components/PeersSubTabs';

const RELATED_DATA = [
    { symbol: 'NVDA', name: 'NVIDIA Corporation', marketCap: '4.63T', pe: '47.16', pb: '38.95', evEbitda: '40.64' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', marketCap: '3.62T', pe: '34.69', pb: '9.99', evEbitda: '21.89' },
    { symbol: 'AMZN', name: 'Amazon.com, Inc.', marketCap: '2.49T', pe: '32.86', pb: '6.72', evEbitda: '18.27' },
    { symbol: 'AAPL', name: 'Apple Inc.', marketCap: '4.04T', pe: '36.65', pb: '54.78', evEbitda: '27.77' },
    { symbol: 'TSLA', name: 'Tesla, Inc.', marketCap: '1.58T', pe: '327.92', pb: '19.75', evEbitda: '144.25' },
    { symbol: 'META', name: 'Meta Platforms, Inc.', marketCap: '1.67T', pe: '29.31', pb: '8.62', evEbitda: '17.06' },
];

const MENTIONED_DATA = [
    { symbol: 'NVDA', name: 'NVIDIA Corporation', marketCap: '4.63T', pe: '47.16', pb: '38.95', evEbitda: '40.64' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', marketCap: '3.62T', pe: '34.69', pb: '9.99', evEbitda: '21.89' },
    { symbol: 'AMD', name: 'Advanced Micro Devices, Inc.', marketCap: '350.01B', pe: '112.57', pb: '5.76', evEbitda: '57.26' },
];

const SUB_TABS = ['Valuation', 'Day Watch', 'Dividends', 'Growth', 'Momentum', 'Performance'];

export default function RelatedStocksPage({ params }: { params: Promise<{ symbol: string }> }) {
    const [resolvedParams, setResolvedParams] = useState<{ symbol: string } | null>(null);
    const [activeTab, setActiveTab] = useState('Valuation');

    useEffect(() => {
        params.then(setResolvedParams);
    }, [params]);

    if (!resolvedParams) return null;
    const { symbol } = resolvedParams;

    return (
        <div className="bg-gray-50 min-h-screen pb-10">
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

                {/* Table 1: People Who Follow... */}
                <div className="mb-10">
                    <h3 className="text-sm font-bold text-gray-900 mb-4">People Who Follow {symbol} Also Follow</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="py-2 font-semibold text-gray-500 w-[80px]">Ticker</th>
                                    <th className="py-2 font-semibold text-gray-500">Company Name</th>
                                    <th className="py-2 font-semibold text-gray-500 text-right">Market Cap</th>
                                    <th className="py-2 font-semibold text-gray-500 text-right">PE Ratio</th>
                                    <th className="py-2 font-semibold text-gray-500 text-right">Price / Book</th>
                                    <th className="py-2 font-semibold text-gray-500 text-right">EV / EBITDA. Vol</th>
                                </tr>
                            </thead>
                            <tbody>
                                {RELATED_DATA.map((row) => (
                                    <tr key={row.symbol} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 font-bold text-blue-600 cursor-pointer hover:underline">{row.symbol}</td>
                                        <td className="py-3 text-gray-900 font-semibold">{row.name}</td>
                                        <td className="py-3 text-right font-bold text-gray-900">{row.marketCap}</td>
                                        <td className="py-3 text-right text-gray-900 font-medium">{row.pe}</td>
                                        <td className="py-3 text-right text-gray-900 font-medium">{row.pb}</td>
                                        <td className="py-3 text-right text-gray-900 font-medium">{row.evEbitda}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-2">
                        <button className="text-xs text-blue-500 hover:underline">Subscribe to See All »</button>
                    </div>
                </div>

                {/* Table 2: Stocks Most Mentioned... */}
                <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-4">Stocks Most Mentioned In Articles With {symbol}</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="py-2 font-semibold text-gray-500 w-[80px]">Ticker</th>
                                    <th className="py-2 font-semibold text-gray-500">Company Name</th>
                                    <th className="py-2 font-semibold text-gray-500 text-right">Market Cap</th>
                                    <th className="py-2 font-semibold text-gray-500 text-right">PE Ratio</th>
                                    <th className="py-2 font-semibold text-gray-500 text-right">Price / Book</th>
                                    <th className="py-2 font-semibold text-gray-500 text-right">EV / EBITDA. Vol</th>
                                </tr>
                            </thead>
                            <tbody>
                                {MENTIONED_DATA.map((row) => (
                                    <tr key={row.symbol} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 font-bold text-blue-600 cursor-pointer hover:underline">{row.symbol}</td>
                                        <td className="py-3 text-gray-900 font-semibold">{row.name}</td>
                                        <td className="py-3 text-right font-bold text-gray-900">{row.marketCap}</td>
                                        <td className="py-3 text-right text-gray-900 font-medium">{row.pe}</td>
                                        <td className="py-3 text-right text-gray-900 font-medium">{row.pb}</td>
                                        <td className="py-3 text-right text-gray-900 font-medium">{row.evEbitda}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}
