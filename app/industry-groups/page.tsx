'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface IndustryGroup {
    id: number;
    date: string;
    industry_group: string;
    sector: string;
    number_of_stocks: number;
    market_value: number;
    rs_score: number;
    rank: number;
    rank_1_week_ago?: number;
    rank_3_months_ago?: number;
    rank_6_months_ago?: number;
    ytd_change_percent: number;
}

export default function IndustryGroupsPage() {
    const [data, setData] = useState<IndustryGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch('http://localhost:8000/api/industry-groups/latest');
                if (!res.ok) throw new Error('Failed to fetch data');
                const jsonData = await res.json();
                setData(jsonData);
            } catch (err) {
                console.error(err);
                setError('Failed to load industry groups.');
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    const formatNumber = (num: number, decimals = 2) => {
        if (num === undefined || num === null) return '-';
        return num.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    };

    const getRankChangeClass = (current: number, past: number) => {
        if (!past) return '';
        if (current < past) return 'text-green-500 font-bold'; // Improved Rank (Lower is better)
        if (current > past) return 'text-red-500 font-bold';   // Worsened Rank
        return '';
    };

    const getChangeColor = (val: number) => {
        if (val > 0) return 'text-green-600 font-medium';
        if (val < 0) return 'text-red-600 font-medium';
        return '';
    }

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading Industry Groups...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
            <div className="max-w-[1600px] mx-auto">
                <header className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Industry Group Rankings</h1>
                        <p className="text-sm text-gray-500 mt-1">Ranking 197 Industry Groups by Performance</p>
                    </div>

                    <div className="text-sm text-gray-500">
                        Data as of: <span className="font-semibold">{data.length > 0 ? data[0].date : '-'}</span>
                    </div>
                </header>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 font-medium text-gray-600">Order (Rank)</th>
                                    <th className="px-4 py-3 font-medium text-gray-600">Symbol (Name)</th>
                                    <th className="px-4 py-3 font-medium text-gray-600 text-center">Num Stocks</th>
                                    <th className="px-4 py-3 font-medium text-gray-600 text-center">Ind Group Rank</th>
                                    <th className="px-4 py-3 font-medium text-gray-600 text-center">Last Week</th>
                                    <th className="px-4 py-3 font-medium text-gray-600 text-center">3 Mo Ago</th>
                                    <th className="px-4 py-3 font-medium text-gray-600 text-center">6 Mo Ago</th>
                                    <th className="px-4 py-3 font-medium text-gray-600 text-right">% Chg YTD</th>
                                    <th className="px-4 py-3 font-medium text-gray-600 text-right">Ind Mkt Val (Bil)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {data.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 font-semibold text-gray-700">{item.rank}</td>
                                        <td className="px-4 py-3">
                                            {/* We don't have a 'Symbol' for group, using Name as both */}
                                            <div className="font-medium text-blue-600 hover:underline cursor-pointer">
                                                {item.industry_group}
                                            </div>
                                            <div className="text-xs text-gray-400 mt-0.5">{item.sector}</div>
                                        </td>
                                        <td className="px-4 py-3 text-center">{item.number_of_stocks}</td>
                                        <td className="px-4 py-3 text-center font-bold text-blue-800 bg-blue-50 rounded-lg mx-2 border border-blue-100">
                                            {item.rank}
                                        </td>

                                        <td className={`px-4 py-3 text-center ${getRankChangeClass(item.rank, item.rank_1_week_ago!)}`}>
                                            {item.rank_1_week_ago || '-'}
                                        </td>

                                        <td className={`px-4 py-3 text-center ${getRankChangeClass(item.rank, item.rank_3_months_ago!)}`}>
                                            {item.rank_3_months_ago || '-'}
                                        </td>

                                        <td className={`px-4 py-3 text-center ${getRankChangeClass(item.rank, item.rank_6_months_ago!)}`}>
                                            {item.rank_6_months_ago || '-'}
                                        </td>

                                        <td className={`px-4 py-3 text-right font-medium ${getChangeColor(item.ytd_change_percent)}`}>
                                            {formatNumber(item.ytd_change_percent)}%
                                        </td>

                                        <td className="px-4 py-3 text-right text-gray-600">
                                            {item.market_value > 0 ? formatNumber(item.market_value) : '-'}
                                        </td>
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
