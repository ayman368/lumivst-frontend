'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
    BarChart, Bar, CartesianGrid, Legend, PieChart, Pie, Cell
} from 'recharts';

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

export default function RSAnalysisPage() {
    const [stocks, setStocks] = useState<StockRS[]>([]);
    const [filteredStocks, setFilteredStocks] = useState<StockRS[]>([]);
    const [selectedStock, setSelectedStock] = useState<StockRS | null>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<Stats | null>(null);
    const [industries, setIndustries] = useState<Industry[]>([]);
    const [historyData, setHistoryData] = useState<any[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyRange, setHistoryRange] = useState<'1Y' | 'ALL'>('1Y'); // New state

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
    }, [selectedStock, historyRange]); // Add historyRange dependency

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        return headers;
    };

    const fetchData = async () => {
        try {
            const headers = getAuthHeaders();

            // Fetch stocks, stats, and industries in parallel
            const [stocksRes, statsRes, industriesRes] = await Promise.all([
                fetch(`${API_URL}/api/rs-v2/latest?limit=500`, { headers, cache: 'no-store' }),
                fetch(`${API_URL}/api/rs-v2/stats`, { headers, cache: 'no-store' }),
                fetch(`${API_URL}/api/rs-v2/industries`, { headers, cache: 'no-store' })
            ]);

            if (stocksRes.ok) {
                const stocksData = await stocksRes.json();
                setStocks(stocksData.data || []);
                if (stocksData.data?.length > 0) {
                    setSelectedStock(stocksData.data[0]);
                }
            }

            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStats(statsData);
            }

            if (industriesRes.ok) {
                const industriesData = await industriesRes.json();
                setIndustries(industriesData.industries || []);
            }

        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async (symbol: string) => {
        setHistoryLoading(true);
        try {
            const headers = getAuthHeaders();
            const limit = historyRange === 'ALL' ? 5000 : 365;
            const res = await fetch(`${API_URL}/api/rs-v2/history/${symbol}?limit=${limit}`, { headers, cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setHistoryData(data.data?.reverse() || []);
            }
        } catch (err) {
            console.error('Error fetching history:', err);
        } finally {
            setHistoryLoading(false);
        }
    };

    const formatPercent = (value: number | null) => {
        if (value === null || value === undefined) return '-';
        return `${(value * 100).toFixed(1)}%`;
    };

    const getRSColor = (rs: number) => {
        if (rs >= 80) return 'text-green-400';
        if (rs >= 60) return 'text-emerald-400';
        if (rs >= 40) return 'text-yellow-400';
        if (rs >= 20) return 'text-orange-400';
        return 'text-red-400';
    };

    const getRSBgColor = (rs: number) => {
        if (rs >= 80) return 'bg-green-500/20 border-green-500/30';
        if (rs >= 60) return 'bg-emerald-500/20 border-emerald-500/30';
        if (rs >= 40) return 'bg-yellow-500/20 border-yellow-500/30';
        if (rs >= 20) return 'bg-orange-500/20 border-orange-500/30';
        return 'bg-red-500/20 border-red-500/30';
    };

    const COLORS = ['#22c55e', '#10b981', '#eab308', '#f97316', '#ef4444'];

    // Distribution data for pie chart
    const getDistribution = () => {
        const ranges = [
            { name: '80-99', min: 80, max: 99, color: '#22c55e' },
            { name: '60-79', min: 60, max: 79, color: '#10b981' },
            { name: '40-59', min: 40, max: 59, color: '#eab308' },
            { name: '20-39', min: 20, max: 39, color: '#f97316' },
            { name: '1-19', min: 1, max: 19, color: '#ef4444' },
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
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-gray-400 text-sm">RS History</h3>
                                    <div className="flex bg-[#1a1a24] rounded-lg p-1">
                                        <button
                                            onClick={() => setHistoryRange('1Y')}
                                            className={`px-3 py-1 text-xs rounded-md transition-colors ${historyRange === '1Y' ? 'bg-cyan-500 text-white' : 'text-gray-400 hover:text-white'
                                                }`}
                                        >
                                            1Y
                                        </button>
                                        <button
                                            onClick={() => setHistoryRange('ALL')}
                                            className={`px-3 py-1 text-xs rounded-md transition-colors ${historyRange === 'ALL' ? 'bg-cyan-500 text-white' : 'text-gray-400 hover:text-white'
                                                }`}
                                        >
                                            All Time
                                        </button>
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
                                                tickFormatter={(v) => v.slice(0, 4)}
                                                minTickGap={30}
                                            />
                                            <YAxis domain={[0, 100]} tick={{ fill: '#666', fontSize: 10 }} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1a1a24', border: '1px solid #333' }}
                                                labelStyle={{ color: '#fff' }}
                                                formatter={(value) => [value, 'RS Rating']}
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
