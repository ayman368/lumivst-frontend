'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, X } from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
    BarChart, Bar, CartesianGrid, Legend, PieChart, Pie, Cell
} from 'recharts';
import { div } from 'framer-motion/client';

interface StockRS {
    symbol: string;
    date: string;
    rs_rating: number;
    rs_raw: number | null;
    return_3m: number | null;
    return_6m: number | null;
    return_9m: number | null;
    return_12m: number | null;
    rank_3m: number | null;
    rank_6m: number | null;
    rank_9m: number | null;
    rank_12m: number | null;
    company_name: string | null;
    industry_group: string | null;
}

interface Stats {
    total_records: number;
    date_range: { start: string; end: string };
    latest_date: string;
    stocks_count: number;
    avg_rs: number;
}

interface Industry {
    name: string;
    count: number;
}

const PERIOD_OPTIONS = [
    { label: '5D', type: 'days', value: 5 },
    { label: '1M', type: 'months', value: 1 },
    { label: '6M', type: 'months', value: 6 },
    { label: 'YTD', type: 'ytd', value: 0 },
    { label: '1Y', type: 'years', value: 1 },
    { label: '5Y', type: 'years', value: 5 },
    { label: '10Y', type: 'years', value: 10 },
    { label: 'MAX', type: 'max', value: 0 },
];

const calculateStartDate = (periodOption: { label: string; type: string; value: number }): Date => {
    const today = new Date();
    const result = new Date(today);

    switch (periodOption.type) {
        case 'days':
            result.setDate(result.getDate() - periodOption.value);
            break;
        case 'months':
            result.setMonth(result.getMonth() - periodOption.value);
            if (result.getDate() !== today.getDate()) {
                result.setDate(0);
            }
            break;
        case 'years':
            result.setFullYear(result.getFullYear() - periodOption.value);
            if (result.getMonth() !== today.getMonth() || result.getDate() !== today.getDate()) {
                result.setDate(0);
            }
            break;
        case 'ytd':
            result.setMonth(0, 1);
            break;
        case 'max':
            result.setFullYear(result.getFullYear() - 25);
            break;
    }

    return result;
};

export default function RSAnalysisPage() {
    const [stocks, setStocks] = useState<StockRS[]>([]);
    const [filteredStocks, setFilteredStocks] = useState<StockRS[]>([]);
    const [selectedStock, setSelectedStock] = useState<StockRS | null>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<Stats | null>(null);
    const [industries, setIndustries] = useState<Industry[]>([]);
    const [historyData, setHistoryData] = useState<any[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    // Detailed Filters State
    const [selectedPeriod, setSelectedPeriod] = useState('1Y');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [minRS, setMinRS] = useState(0);
    const [maxRS, setMaxRS] = useState(100);
    const [selectedIndustry, setSelectedIndustry] = useState('');
    const [viewMode, setViewMode] = useState<'table' | 'cards' | 'chart'>('table');

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        let result = stocks;

        // Apply RS filter
        result = result.filter(s => s.rs_rating >= minRS && s.rs_rating <= maxRS);

        // Apply industry filter
        if (selectedIndustry) {
            result = result.filter(s => s.industry_group === selectedIndustry);
        }

        // Apply search
        if (searchQuery) {
            const q = searchQuery.toUpperCase();
            result = result.filter(s =>
                s.symbol.includes(q) ||
                (s.company_name && s.company_name.toUpperCase().includes(q))
            );
        }

        setFilteredStocks(result);
    }, [stocks, searchQuery, minRS, maxRS, selectedIndustry]);

    useEffect(() => {
        if (selectedStock) {
            fetchHistory(selectedStock.symbol);
        }
    }, [selectedStock, selectedPeriod, customStartDate, customEndDate]);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        return headers;
    };

    const fetchData = async () => {
        try {
            const headers = getAuthHeaders();

            // Fetch stocks only (we will derive stats and industries from this)
            const res = await fetch(`${API_URL}/api/rs/latest?limit=500`, { headers, cache: 'no-store' });

            if (res.ok) {
                const responseData = await res.json();
                let stocksData = responseData.data || [];

                // Normalize data to match Watchlist/MatrixChart robustness
                stocksData = stocksData.map((s: any) => ({
                    ...s,
                    rs_rating: s.rs_rating ?? s.RS ?? 0,
                    company_name: s.company_name ?? s.Company ?? s.symbol,
                    // Ensure other fields are present or null to avoid undefined errors
                    return_3m: s.return_3m ?? null,
                    rank_3m: s.rank_3m ?? null
                }));

                setStocks(stocksData);

                if (stocksData.length > 0) {
                    setSelectedStock(stocksData[0]);

                    // Compute Stats Client-side
                    const avgRs = stocksData.reduce((acc: number, s: StockRS) => acc + s.rs_rating, 0) / stocksData.length;
                    setStats({
                        total_records: responseData.total_count || stocksData.length,
                        date_range: { start: '-', end: '-' },
                        latest_date: responseData.date || new Date().toISOString().split('T')[0],
                        stocks_count: stocksData.length,
                        avg_rs: avgRs
                    });

                    // Compute Industries Client-side
                    const indMap = new Map<string, number>();
                    stocksData.forEach((s: StockRS) => {
                        if (s.industry_group) {
                            indMap.set(s.industry_group, (indMap.get(s.industry_group) || 0) + 1);
                        }
                    });
                    const indArray = Array.from(indMap.entries())
                        .map(([name, count]) => ({ name, count }))
                        .sort((a, b) => b.count - a.count);
                    setIndustries(indArray);
                }
            }
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const getLocalDateString = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const fetchHistory = async (symbol: string) => {
        setHistoryLoading(true);
        try {
            const headers = getAuthHeaders();
            let url = `${API_URL}/api/rs/${symbol}`;

            let fromDate = '';
            const today = new Date();
            const toDate = getLocalDateString(today);
            let finalToDate = toDate;

            if (selectedPeriod === 'Custom' && customStartDate && customEndDate) {
                fromDate = customStartDate;
                finalToDate = customEndDate;
            } else {
                const option = PERIOD_OPTIONS.find(p => p.label === selectedPeriod);
                if (option) {
                    const startDate = calculateStartDate(option);
                    fromDate = getLocalDateString(startDate);
                }
            }

            const params = new URLSearchParams();
            if (fromDate) params.append('from_date', fromDate);
            if (finalToDate) params.append('to_date', finalToDate);

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const res = await fetch(url, { headers, cache: 'no-store' });

            if (res.ok) {
                const data = await res.json();
                // RS V1 returns array directly: List[RSResponse]
                const history = Array.isArray(data) ? data : (data.data || []);
                setHistoryData(history);
            }
        } catch (err) {
            console.error('Error fetching history:', err);
        } finally {
            setHistoryLoading(false);
        }
    };

    const handlePeriodChange = (period: string) => {
        setSelectedPeriod(period);
        setShowDatePicker(false);
    };

    const handleApplyCustomRange = () => {
        if (customStartDate && customEndDate) {
            if (new Date(customStartDate) > new Date(customEndDate)) {
                alert('Start date must be before end date');
                return;
            }
            setSelectedPeriod('Custom');
            setShowDatePicker(false);
        }
    };

    const formatPercent = (value: number | null) => {
        // Handle undefined/null explicitly
        if (value === null || value === undefined) return '-';
        return `${(value * 100).toFixed(1)}%`;
    };

    // Updated colors to match Watchlist/Matrix logic (90/80/70)
    const getRSColor = (rs: number) => {
        if (rs >= 90) return 'text-green-500'; // Strong
        if (rs >= 80) return 'text-blue-500';  // Improve
        if (rs >= 70) return 'text-orange-500'; // Neutral
        return 'text-red-500'; // Weak
    };

    const getRSBgColor = (rs: number) => {
        if (rs >= 90) return 'bg-green-500/10 border-green-500/30';
        if (rs >= 80) return 'bg-blue-500/10 border-blue-500/30';
        if (rs >= 70) return 'bg-orange-500/10 border-orange-500/30';
        return 'bg-red-500/10 border-red-500/30';
    };

    const COLORS = ['#22c55e', '#3b82f6', '#f97316', '#ef4444'];

    // Distribution data matching Watchlist logic
    const getDistribution = () => {
        const ranges = [
            { name: 'Strong (90-99)', min: 90, max: 100, color: '#22c55e' },
            { name: 'Improve (80-89)', min: 80, max: 89, color: '#3b82f6' },
            { name: 'Neutral (70-79)', min: 70, max: 79, color: '#f97316' },
            { name: 'Weak (<70)', min: 0, max: 69, color: '#ef4444' },
        ];

        return ranges.map(r => ({
            name: r.name,
            value: stocks.filter(s => s.rs_rating >= r.min && s.rs_rating <= r.max).length,
            color: r.color
        }));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading RS Analysis...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                    📊 RS Analysis
                </h1>
                <p className="text-gray-400 mt-2">
                    Relative Strength Analysis using weighted period ranks
                </p>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-4">
                        <p className="text-gray-400 text-sm">Total Records</p>
                        <p className="text-2xl font-bold text-cyan-400">{stats.total_records.toLocaleString()}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-4">
                        <p className="text-gray-400 text-sm">Stocks Count</p>
                        <p className="text-2xl font-bold text-purple-400">{stats.stocks_count}</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-xl p-4">
                        <p className="text-gray-400 text-sm">Latest Date</p>
                        <p className="text-2xl font-bold text-emerald-400">{stats.latest_date}</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border border-orange-500/20 rounded-xl p-4">
                        <p className="text-gray-400 text-sm">Average RS</p>
                        <p className="text-2xl font-bold text-orange-400">{stats.avg_rs.toFixed(1)}</p>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-[#12121a] border border-gray-800 rounded-xl p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {/* Search */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Search</label>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Symbol or Name..."
                            className="w-full bg-[#1a1a24] border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                        />
                    </div>

                    {/* Min RS */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Min RS: {minRS}</label>
                        <input
                            type="range"
                            min="0"
                            max="99"
                            value={minRS}
                            onChange={(e) => setMinRS(Number(e.target.value))}
                            className="w-full accent-cyan-500"
                        />
                    </div>

                    {/* Max RS */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Max RS: {maxRS}</label>
                        <input
                            type="range"
                            min="1"
                            max="100"
                            value={maxRS}
                            onChange={(e) => setMaxRS(Number(e.target.value))}
                            className="w-full accent-cyan-500"
                        />
                    </div>

                    {/* Industry */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Industry</label>
                        <select
                            value={selectedIndustry}
                            onChange={(e) => setSelectedIndustry(e.target.value)}
                            className="w-full bg-[#1a1a24] border border-gray-700 rounded-lg px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                        >
                            <option value="">All Industries</option>
                            {industries.map(ind => (
                                <option key={ind.name} value={ind.name}>{ind.name} ({ind.count})</option>
                            ))}
                        </select>
                    </div>

                    {/* View Mode */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">View</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setViewMode('table')}
                                className={`flex-1 py-2 rounded-lg text-sm ${viewMode === 'table' ? 'bg-cyan-500 text-white' : 'bg-gray-800 text-gray-400'}`}
                            >
                                Table
                            </button>
                            <button
                                onClick={() => setViewMode('cards')}
                                className={`flex-1 py-2 rounded-lg text-sm ${viewMode === 'cards' ? 'bg-cyan-500 text-white' : 'bg-gray-800 text-gray-400'}`}
                            >
                                Cards
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-4 text-sm text-gray-400">
                    Showing {filteredStocks.length} of {stocks.length} stocks
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Stocks List */}
                <div className="lg:col-span-2">
                    {viewMode === 'table' ? (
                        <div className="bg-[#12121a] border border-gray-800 rounded-xl overflow-hidden">
                            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                                <table className="w-full">
                                    <thead className="bg-[#1a1a24] sticky top-0">
                                        <tr className="text-left text-gray-400 text-sm">
                                            <th className="p-3">Symbol</th>
                                            <th className="p-3">Company</th>
                                            <th className="p-3 text-center">RS</th>
                                            <th className="p-3 text-center">3M</th>
                                            <th className="p-3 text-center">6M</th>
                                            <th className="p-3 text-center">9M</th>
                                            <th className="p-3 text-center">12M</th>
                                            <th className="p-3">Industry</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredStocks.map((stock, idx) => (
                                            <tr
                                                key={stock.symbol}
                                                onClick={() => setSelectedStock(stock)}
                                                className={`border-t border-gray-800 hover:bg-[#1a1a24] cursor-pointer transition-colors
                                                    ${selectedStock?.symbol === stock.symbol ? 'bg-cyan-500/10' : ''}`}
                                            >
                                                <td className="p-3">
                                                    <Link href={`/stocks/${stock.symbol}`} className="text-cyan-400 hover:underline font-medium">
                                                        {stock.symbol}
                                                    </Link>
                                                </td>
                                                <td className="p-3 text-gray-300 text-sm max-w-[200px] truncate">
                                                    {stock.company_name || '-'}
                                                </td>
                                                <td className="p-3 text-center">
                                                    <span className={`font-bold text-lg ${getRSColor(stock.rs_rating)}`}>
                                                        {stock.rs_rating}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-center text-sm text-gray-300">{stock.rank_3m}</td>
                                                <td className="p-3 text-center text-sm text-gray-300">{stock.rank_6m}</td>
                                                <td className="p-3 text-center text-sm text-gray-300">{stock.rank_9m}</td>
                                                <td className="p-3 text-center text-sm text-gray-300">{stock.rank_12m}</td>
                                                <td className="p-3 text-gray-400 text-sm max-w-[150px] truncate">
                                                    {stock.industry_group || '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
                            {filteredStocks.map(stock => (
                                <div
                                    key={stock.symbol}
                                    onClick={() => setSelectedStock(stock)}
                                    className={`bg-[#12121a] border rounded-xl p-4 cursor-pointer transition-all hover:border-cyan-500/50 ${getRSBgColor(stock.rs_rating)}
                                        ${selectedStock?.symbol === stock.symbol ? 'ring-2 ring-cyan-500' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <Link href={`/stocks/${stock.symbol}`} className="text-cyan-400 hover:underline font-bold text-lg">
                                                {stock.symbol}
                                            </Link>
                                            <p className="text-gray-400 text-sm truncate max-w-[150px]">{stock.company_name || '-'}</p>
                                        </div>
                                        <div className={`text-3xl font-bold ${getRSColor(stock.rs_rating)}`}>
                                            {stock.rs_rating}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-4 gap-2 text-center text-sm">
                                        <div>
                                            <p className="text-gray-500">3M</p>
                                            <p className="text-gray-300">{stock.rank_3m}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">6M</p>
                                            <p className="text-gray-300">{stock.rank_6m}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">9M</p>
                                            <p className="text-gray-300">{stock.rank_9m}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">12M</p>
                                            <p className="text-gray-300">{stock.rank_12m}</p>
                                        </div>
                                    </div>

                                    <p className="text-gray-500 text-xs mt-3 truncate">{stock.industry_group || '-'}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Details Panel */}
                <div className="space-y-6">
                    {/* Selected Stock Details */}
                    {selectedStock && (
                        <div className="bg-[#12121a] border border-gray-800 rounded-xl p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-cyan-400">{selectedStock.symbol}</h2>
                                    <p className="text-gray-400">{selectedStock.company_name || 'No Name'}</p>
                                </div>
                                <div className={`text-4xl font-bold ${getRSColor(selectedStock.rs_rating)}`}>
                                    {selectedStock.rs_rating}
                                </div>
                            </div>

                            {/* Returns */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="bg-[#1a1a24] rounded-lg p-3">
                                    <p className="text-gray-500 text-xs">3M Return</p>
                                    <p className={`text-lg font-semibold ${(selectedStock.return_3m || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {formatPercent(selectedStock.return_3m)}
                                    </p>
                                    <p className="text-gray-400 text-sm">Rank: {selectedStock.rank_3m}</p>
                                </div>
                                <div className="bg-[#1a1a24] rounded-lg p-3">
                                    <p className="text-gray-500 text-xs">6M Return</p>
                                    <p className={`text-lg font-semibold ${(selectedStock.return_6m || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {formatPercent(selectedStock.return_6m)}
                                    </p>
                                    <p className="text-gray-400 text-sm">Rank: {selectedStock.rank_6m}</p>
                                </div>
                                <div className="bg-[#1a1a24] rounded-lg p-3">
                                    <p className="text-gray-500 text-xs">9M Return</p>
                                    <p className={`text-lg font-semibold ${(selectedStock.return_9m || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {formatPercent(selectedStock.return_9m)}
                                    </p>
                                    <p className="text-gray-400 text-sm">Rank: {selectedStock.rank_9m}</p>
                                </div>
                                <div className="bg-[#1a1a24] rounded-lg p-3">
                                    <p className="text-gray-500 text-xs">12M Return</p>
                                    <p className={`text-lg font-semibold ${(selectedStock.return_12m || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {formatPercent(selectedStock.return_12m)}
                                    </p>
                                    <p className="text-gray-400 text-sm">Rank: {selectedStock.rank_12m}</p>
                                </div>
                            </div>

                            {/* RS History Chart */}
                            <div className="mt-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-gray-400 text-sm">RS History</h3>

                                    <div className="flex items-center gap-2 bg-[#1a1a24] p-1 rounded-xl border border-gray-800">
                                        {PERIOD_OPTIONS.map(opt => (
                                            <button
                                                key={opt.label}
                                                onClick={() => handlePeriodChange(opt.label)}
                                                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${selectedPeriod === opt.label
                                                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                                                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                                                    }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}

                                        <div className="relative">
                                            <button
                                                onClick={() => setShowDatePicker(!showDatePicker)}
                                                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-200 ${showDatePicker || selectedPeriod === 'Custom'
                                                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                                                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                                                    }`}
                                            >
                                                <Calendar size={14} />
                                                {selectedPeriod === 'Custom' && (
                                                    <span className="ml-1">Custom</span>
                                                )}
                                            </button>

                                            {showDatePicker && (
                                                <div className="absolute top-full right-0 mt-3 bg-[#1a1a24] rounded-2xl shadow-2xl border border-gray-700 p-4 z-50 w-80">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <span className="text-sm font-bold text-white">Custom Range</span>
                                                        <button onClick={() => setShowDatePicker(false)} className="text-gray-400 hover:text-white">
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                                        <div>
                                                            <label className="block text-xs text-gray-400 mb-1">Start</label>
                                                            <input
                                                                type="date"
                                                                value={customStartDate}
                                                                onChange={(e) => setCustomStartDate(e.target.value)}
                                                                className="w-full px-2 py-1.5 bg-[#12121a] border border-gray-700 rounded-lg text-xs text-white focus:border-cyan-500 outline-none"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-400 mb-1">End</label>
                                                            <input
                                                                type="date"
                                                                value={customEndDate}
                                                                onChange={(e) => setCustomEndDate(e.target.value)}
                                                                className="w-full px-2 py-1.5 bg-[#12121a] border border-gray-700 rounded-lg text-xs text-white focus:border-cyan-500 outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={handleApplyCustomRange}
                                                        disabled={!customStartDate || !customEndDate}
                                                        className={`w-full py-2 text-xs font-bold rounded-lg transition-all ${!customStartDate || !customEndDate
                                                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                                            : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-lg'
                                                            }`}
                                                    >
                                                        Apply Range
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {historyLoading ? (
                                    <div className="h-[200px] flex items-center justify-center">
                                        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : historyData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={250}>
                                        <LineChart data={historyData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                            <XAxis
                                                dataKey="date"
                                                tick={{ fill: '#666', fontSize: 10 }}
                                                tickFormatter={(val) => {
                                                    // Display based on period selection for better readability
                                                    if (!val) return '';
                                                    if (selectedPeriod === 'MAX' || selectedPeriod === '5Y' || selectedPeriod === '10Y') {
                                                        return val.slice(0, 4);
                                                    }
                                                    const d = new Date(val);
                                                    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                                                }}
                                                minTickGap={30}
                                            />
                                            <YAxis domain={[0, 100]} tick={{ fill: '#666', fontSize: 10 }} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1a1a24', border: '1px solid #333' }}
                                                labelStyle={{ color: '#fff' }}
                                                formatter={(value) => [value, 'RS Rating']}
                                                labelFormatter={(label) => {
                                                    if (!label) return '';
                                                    return new Date(label).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
                                                }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="rs_rating"
                                                stroke="#22d3ee"
                                                strokeWidth={2}
                                                dot={false}
                                                activeDot={{ r: 4, strokeWidth: 0 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <p className="text-gray-500 text-center py-8">No history data</p>
                                )}
                            </div>

                            <Link
                                href={`/stocks/${selectedStock.symbol}`}
                                className="block w-full mt-4 bg-cyan-500 hover:bg-cyan-600 text-white text-center py-2 rounded-lg transition-colors font-medium"
                            >
                                View Full Profile →
                            </Link>
                        </div>
                    )}

                    {/* RS Distribution */}
                    <div className="bg-[#12121a] border border-gray-800 rounded-xl p-6">
                        <h3 className="text-gray-400 text-sm mb-4">RS Distribution</h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={getDistribution()}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={2}
                                    dataKey="value"
                                    label={({ name, value }) => `${name}: ${value}`}
                                >
                                    {getDistribution().map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1a1a24', border: '1px solid #333', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
