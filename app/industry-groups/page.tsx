'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Search, Filter, Download } from 'lucide-react';

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

interface StockSummary {
    symbol: string;
    company_name: string;
    close: number;
    change_percent: number;
    market_cap: number;
    industry_group: string;
    sector: string;
    industry: string;
    sub_industry: string;
    date: string;
    rs_rating?: number;
}

export default function IndustryGroupsPage() {
    const [data, setData] = useState<IndustryGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSector, setSelectedSector] = useState('all');
    const [sectors, setSectors] = useState<string[]>(['all']);

    // State for expansion
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
    const [stocksCache, setStocksCache] = useState<Record<string, StockSummary[]>>({});
    const [loadingStocks, setLoadingStocks] = useState<Set<string>>(new Set());

    // Stats for top/worst performers
    const [stats, setStats] = useState({
        topPerformer: { group: '', change: 0 },
        worstPerformer: { group: '', change: 0 }
    });

    useEffect(() => {
        async function fetchData() {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

                const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                const headers: HeadersInit = { 'Content-Type': 'application/json' };
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const res = await fetch(`${API_URL}/api/industry-groups/latest`, {
                    headers,
                    cache: 'no-store'
                });

                if (!res.ok) throw new Error('Failed to fetch data');
                const jsonData = await res.json();
                setData(jsonData);

                // Extract unique sectors
                const uniqueSectors = ['all', ...new Set(jsonData.map((item: IndustryGroup) => item.sector))];
                setSectors(uniqueSectors as string[]);

                // Calculate top/worst performers
                if (jsonData.length > 0) {
                    let top = jsonData[0];
                    let worst = jsonData[0];

                    jsonData.forEach((item: IndustryGroup) => {
                        if (item.ytd_change_percent > top.ytd_change_percent) {
                            top = item;
                        }
                        if (item.ytd_change_percent < worst.ytd_change_percent) {
                            worst = item;
                        }
                    });

                    setStats({
                        topPerformer: { group: top.industry_group, change: top.ytd_change_percent },
                        worstPerformer: { group: worst.industry_group, change: worst.ytd_change_percent }
                    });
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load industry groups.');
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    // Filter data based on search and sector
    const filteredData = data.filter(item => {
        const matchesSearch = item.industry_group.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.sector.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSector = selectedSector === 'all' || item.sector === selectedSector;
        return matchesSearch && matchesSector;
    });

    const toggleGroup = async (groupName: string) => {
        const newExpanded = new Set(expandedGroups);
        if (newExpanded.has(groupName)) {
            newExpanded.delete(groupName);
            setExpandedGroups(newExpanded);
        } else {
            newExpanded.add(groupName);
            setExpandedGroups(newExpanded);

            if (!stocksCache[groupName]) {
                await fetchGroupStocks(groupName);
            }
        }
    };

    const fetchGroupStocks = async (groupName: string) => {
        if (loadingStocks.has(groupName)) return;

        setLoadingStocks(prev => new Set(prev).add(groupName));
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const encodedGroup = encodeURIComponent(groupName);

            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch(`${API_URL}/api/industry-groups/${encodedGroup}/stocks`, {
                headers,
                cache: 'no-store'
            });

            if (res.ok) {
                const stocks = await res.json();
                setStocksCache(prev => ({ ...prev, [groupName]: stocks }));
            }
        } catch (err) {
            console.error(`Failed to fetch stocks for group ${groupName}`, err);
        } finally {
            setLoadingStocks(prev => {
                const next = new Set(prev);
                next.delete(groupName);
                return next;
            });
        }
    };

    const formatNumber = (num: number, decimals = 2) => {
        if (num === undefined || num === null) return '-';
        return num.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    };

    const getRankChangeClass = (current: number, past: number) => {
        if (!past) return '';
        if (current < past) return 'text-green-500 font-bold';
        if (current > past) return 'text-red-500 font-bold';
        return '';
    };

    const getChangeColor = (val: number) => {
        if (val > 0) return 'text-green-600 font-medium';
        if (val < 0) return 'text-red-600 font-medium';
        return '';
    }

    const exportToCSV = () => {
        if (filteredData.length === 0) return;

        // Define comprehensive headers
        const headers = [
            'Type',
            'Rank',
            'Industry Group',
            'Symbol',
            'Company Name',
            'Sector',
            'Industry',
            'Sub Industry',
            'Close Price',
            'Change %',
            'Num Stocks',
            'Market Value (Bil)',
            'RS Rating',
            'Rank 1 Week Ago',
            'Rank 3 Months Ago',
            'Rank 6 Months Ago',
            'YTD Change %'
        ];

        const rows: (string | number)[][] = [];

        filteredData.forEach(item => {
            // 1. Add Industry Group Row
            rows.push([
                'Group',
                item.rank,
                `"${item.industry_group}"`,
                '', // Symbol
                '', // Company Name
                `"${item.sector}"`,
                '', // Industry
                '', // Sub Industry
                '', // Close Price
                '', // Change % (Stock)
                item.number_of_stocks,
                item.market_value ? item.market_value.toFixed(2) : '-',
                '', // RS Rating
                item.rank_1_week_ago || '-',
                item.rank_3_months_ago || '-',
                item.rank_6_months_ago || '-',
                item.ytd_change_percent.toFixed(2)
            ]);

            // 2. Add Stocks if Group is Expanded
            if (expandedGroups.has(item.industry_group)) {
                const groupStocks = stocksCache[item.industry_group];
                if (groupStocks && groupStocks.length > 0) {
                    groupStocks.forEach(stock => {
                        rows.push([
                            'Stock',
                            '', // Rank
                            `"${stock.industry_group}"`,
                            stock.symbol,
                            `"${stock.company_name}"`,
                            `"${stock.sector}"`,
                            `"${stock.industry}"`,
                            `"${stock.sub_industry}"`,
                            stock.close,
                            stock.change_percent ? Number(stock.change_percent).toFixed(2) : '-',
                            '', // Num Stocks
                            '', // Market Value (Group) - Or stock Market Cap if available? Stock has market_cap in interface
                            stock.rs_rating || '-',
                            '', // Rank 1W
                            '', // Rank 3M
                            '', // Rank 6M
                            ''  // YTD Change (Group)
                        ]);
                    });
                }
            }
        });

        // Combine headers and rows
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `industry_groups_details_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Loading Industry Groups...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
            <div className="max-w-[1600px] mx-auto">
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Industry Group Rankings</h1>
                        <p className="text-sm text-gray-500 mt-1">Ranking 197 Industry Groups by Performance</p>
                    </div>

                    <div className="text-sm text-gray-500">
                        Data as of: <span className="font-semibold">{data.length > 0 ? data[0].date : '-'}</span>
                    </div>
                </header>

                {/* Performance Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Top Performer</p>
                                <p className="text-lg font-bold text-gray-900 truncate">
                                    {stats.topPerformer.group}
                                </p>
                                <p className="text-sm text-green-600 font-medium">
                                    +{formatNumber(stats.topPerformer.change)}%
                                </p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-green-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Worst Performer</p>
                                <p className="text-lg font-bold text-gray-900 truncate">
                                    {stats.worstPerformer.group}
                                </p>
                                <p className="text-sm text-red-600 font-medium">
                                    {formatNumber(stats.worstPerformer.change)}%
                                </p>
                            </div>
                            <TrendingDown className="w-8 h-8 text-red-500" />
                        </div>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200 shadow-sm">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search industry groups or sectors..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg 
                                               focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                                               outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <select
                                    value={selectedSector}
                                    onChange={(e) => setSelectedSector(e.target.value)}
                                    className="pl-10 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg 
                                               focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                                               outline-none appearance-none cursor-pointer"
                                >
                                    {sectors.map(sector => (
                                        <option key={sector} value={sector}>
                                            {sector === 'all' ? 'All Sectors' : sector}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={exportToCSV}
                                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                                               transition-colors flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                Export
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results Count */}
                <div className="mb-4 text-sm text-gray-500">
                    Showing {filteredData.length} of {data.length} industry groups
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 w-8"></th>
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
                                {filteredData.map((item) => {
                                    const isExpanded = expandedGroups.has(item.industry_group);

                                    return (
                                        <React.Fragment key={item.id}>
                                            <tr
                                                className={`hover:bg-gray-50 transition-colors cursor-pointer ${isExpanded ? 'bg-gray-50' : ''}`}
                                                onClick={() => toggleGroup(item.industry_group)}
                                            >
                                                <td className="px-4 py-3 text-center text-gray-400">
                                                    <svg
                                                        className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </td>
                                                <td className="px-4 py-3 font-semibold text-gray-700">{item.rank}</td>
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-blue-600 hover:underline">
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

                                            {/* Nested Row for Stocks */}
                                            {isExpanded && (
                                                <tr className="bg-gray-50">
                                                    <td colSpan={10} className="px-4 pb-4 pt-2">
                                                        <div className="bg-white rounded border border-gray-200 p-4 ml-8 shadow-inner">
                                                            <h3 className="text-sm font-bold text-gray-700 mb-3">Stocks in {item.industry_group}</h3>

                                                            {loadingStocks.has(item.industry_group) ? (
                                                                <div className="text-center py-4 text-gray-500 text-sm">Loading stocks...</div>
                                                            ) : !stocksCache[item.industry_group] || stocksCache[item.industry_group].length === 0 ? (
                                                                <div className="text-center py-4 text-gray-500 text-sm">No stocks found in this group.</div>
                                                            ) : (
                                                                <div className="overflow-x-auto">
                                                                    <table className="w-full text-xs text-left">
                                                                        <thead className="bg-gray-100 text-gray-500 font-medium border-b border-gray-200">
                                                                            <tr>
                                                                                <th className="px-3 py-2">Symbol</th>
                                                                                <th className="px-3 py-2">Name</th>
                                                                                <th className="px-3 py-2">Industry Group</th>
                                                                                <th className="px-3 py-2">Sector</th>
                                                                                <th className="px-3 py-2">Industry</th>
                                                                                <th className="px-3 py-2">Sub Industry</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody className="divide-y divide-gray-100">
                                                                            {stocksCache[item.industry_group].map(stock => (
                                                                                <tr key={stock.symbol} className="hover:bg-gray-50">
                                                                                    <td className="px-3 py-2 font-medium text-blue-600">
                                                                                        <Link href={`/stocks/${stock.symbol}`} className="hover:underline">
                                                                                            {stock.symbol}
                                                                                        </Link>
                                                                                    </td>
                                                                                    <td className="px-3 py-2">{stock.company_name}</td>
                                                                                    <td className="px-3 py-2">{stock.industry_group}</td>
                                                                                    <td className="px-3 py-2">{stock.sector}</td>
                                                                                    <td className="px-3 py-2">{stock.industry}</td>
                                                                                    <td className="px-3 py-2">{stock.sub_industry}</td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}