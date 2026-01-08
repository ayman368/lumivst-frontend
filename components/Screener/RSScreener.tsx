'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface StockRS {
    symbol: string;
    company_name?: string;
    rs_rating: number;
    rank_3m: number;
    rank_6m: number;
    rank_9m: number;
    rank_12m: number;
    // Add Returns
    return_3m: number;
    return_6m: number;
    return_9m: number;
    return_12m: number;
}

export default function RSScreener() {
    const [stocks, setStocks] = useState<StockRS[]>([]);
    const [filteredStocks, setFilteredStocks] = useState<StockRS[]>([]);
    const [selectedStock, setSelectedStock] = useState<StockRS | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRange, setFilterRange] = useState<[number, number]>([0, 100]);

    const [viewMode, setViewMode] = useState<'term' | 'history' | 'all_time'>('term');
    const [historyData, setHistoryData] = useState<any[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    useEffect(() => {
        fetchLatestRS();
    }, []);

    useEffect(() => {
        let result = stocks;

        // Apply range filter
        result = result.filter(s => s.rs_rating >= filterRange[0] && s.rs_rating <= filterRange[1]);

        // Apply search
        if (searchQuery) {
            const q = searchQuery.toUpperCase();
            result = result.filter(s => s.symbol.includes(q));
        }

        setFilteredStocks(result);
    }, [stocks, searchQuery, filterRange]);

    useEffect(() => {
        if (selectedStock) {
            if (viewMode === 'history') {
                fetchHistory(selectedStock.symbol, '1Y');
            } else if (viewMode === 'all_time') {
                fetchHistory(selectedStock.symbol, 'ALL');
            }
        }
    }, [selectedStock, viewMode]);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    const fetchLatestRS = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers: HeadersInit = {
                'Content-Type': 'application/json'
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch(`${API_URL}/api/rs/latest?limit=500`, { headers });

            if (res.status === 401 || res.status === 403) {
                console.error("Authentication failed or forbidden");
                // Optionally redirect to login or show error
                return;
            }

            const data = await res.json();
            if (data.data) {
                setStocks(data.data);
                if (data.data.length > 0) setSelectedStock(data.data[0]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = async (symbol: string, range: '1Y' | 'ALL' = 'ALL') => {
        setHistoryLoading(true);
        try {
            let url = `${API_URL}/api/rs/${symbol}`;
            if (range === '1Y') {
                const date = new Date();
                date.setFullYear(date.getFullYear() - 1);
                const fromDate = date.toISOString().split('T')[0];
                url += `?from_date=${fromDate}`;
            }

            const token = localStorage.getItem('token');
            const headers: HeadersInit = {
                'Content-Type': 'application/json'
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch(url, { headers });

            if (!res.ok) {
                console.error("Failed to fetch history");
                return;
            }

            const data = await res.json();
            setHistoryData(data);
        } catch (err) {
            console.error(err);
        } finally {
            setHistoryLoading(false);
        }
    };

    const getRSColor = (val: number) => {
        if (val >= 90) return 'bg-emerald-500';
        if (val >= 70) return 'bg-blue-600';
        if (val >= 50) return 'bg-yellow-500';
        if (val >= 30) return 'bg-orange-500';
        return 'bg-red-500';
    };

    // Helper to format return percentage
    const formatReturn = (val: number | undefined) => {
        if (val === undefined || val === null) return '-';
        return `${(val * 100).toFixed(1)}%`;
    };

    // Helper to get color based on return value (Green(+), Red(-), Gray(0))
    const getReturnColorClass = (val: number | undefined) => {
        if (val === undefined || val === null) return 'text-white';
        if (val > 0) return 'text-emerald-400';
        if (val < 0) return 'text-red-400';
        return 'text-gray-400';
    };

    const getChartData = (stock: StockRS) => [
        { name: '1Y', value: stock.rank_12m || 0 },
        { name: '9M', value: stock.rank_9m || 0 },
        { name: '6M', value: stock.rank_6m || 0 },
        { name: '3M', value: stock.rank_3m || 0 },
        { name: 'Now', value: stock.rs_rating }
    ];

    return (
        <div className="flex h-full bg-[#131722] text-[#d1d4dc] font-sans overflow-hidden">
            {/* Sidebar */}
            <div className="w-[300px] bg-[#1e222d] flex flex-col border-r border-[#2a2e39]">
                <div className="p-4 border-b border-[#2a2e39]">
                    <h3 className="text-[#787b86] text-xs font-bold mb-3">FILTERS</h3>
                    <div className="space-y-2">
                        <button onClick={() => setFilterRange([90, 100])} className="w-full py-1.5 bg-[#00897b] text-white rounded text-sm font-bold hover:brightness-110 shadow-sm relative overflow-hidden group">
                            <span className="relative z-10">Top (90+)</span>
                        </button>
                        <button onClick={() => setFilterRange([80, 100])} className="w-full py-1.5 bg-[#00897b] text-white rounded text-sm font-bold hover:brightness-110 shadow-sm">Top (80+)</button>
                        <button onClick={() => setFilterRange([70, 100])} className="w-full py-1.5 bg-[#00897b] text-white rounded text-sm font-bold hover:brightness-110 shadow-sm">Top (70+)</button>

                        <button onClick={() => setFilterRange([51, 100])} className="w-full py-1.5 bg-[#2962ff] text-white rounded text-sm font-bold hover:brightness-110 shadow-sm">Above Avg</button>
                        <button onClick={() => setFilterRange([0, 50])} className="w-full py-1.5 bg-[#ff9800] text-white rounded text-sm font-bold hover:brightness-110 shadow-sm">Below Avg</button>
                        <button onClick={() => setFilterRange([0, 30])} className="w-full py-1.5 bg-[#ef5350] text-white rounded text-sm font-bold hover:brightness-110 shadow-sm">Weak</button>

                        <button onClick={() => setFilterRange([0, 100])} className="w-full py-1.5 bg-[#363c4e] text-white rounded text-sm font-bold hover:bg-[#434a5d] shadow-sm">All</button>
                    </div>
                    <input
                        type="text"
                        placeholder="Search Symbol..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full mt-4 p-2 bg-[#2a2e39] border border-[#363c4e] rounded text-white text-sm focus:outline-none focus:border-[#2962ff]"
                    />
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="p-4 text-center text-gray-500">Loading...</div>
                    ) : filteredStocks.map(stock => (
                        <div
                            key={stock.symbol}
                            onClick={() => setSelectedStock(stock)}
                            className={`p-3 cursor-pointer border-l-[3px] hover:bg-[#2a2e39] transition-colors flex justify-between items-center ${selectedStock?.symbol === stock.symbol ? 'bg-[#2a2e39] border-l-[#2962ff]' : 'border-l-transparent'
                                }`}
                        >
                            <div>
                                <div className="font-bold text-white text-sm">{stock.company_name || stock.symbol}</div>
                                <div className="text-xs text-[#787b86]">{stock.symbol}</div>
                            </div>
                            <div className={`px-2 py-1 rounded text-xs font-bold text-white text-center min-w-[32px] ${getRSColor(stock.rs_rating)}`}>
                                {stock.rs_rating}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Chart Area */}
            <div className="flex-1 p-6 bg-[#131722] flex flex-col">
                {selectedStock ? (
                    <>
                        <div className="bg-[#1e222d] p-6 rounded-lg mb-6 flex justify-between items-center shadow-lg">
                            <div>
                                <h1 className="text-2xl font-bold text-white mb-1">{selectedStock.company_name}</h1>
                                <p className="text-[#787b86]">Saudi Stock Exchange</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex bg-[#2a2e39] rounded p-1">
                                    <button
                                        onClick={() => setViewMode('term')}
                                        className={`px-4 py-1.5 text-sm font-bold rounded transition-colors ${viewMode === 'term' ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:text-white'}`}
                                    >
                                        Term Structure
                                    </button>
                                    <button
                                        onClick={() => setViewMode('history')}
                                        className={`px-4 py-1.5 text-sm font-bold rounded transition-colors ${viewMode === 'history' ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:text-white'}`}
                                    >
                                        History
                                    </button>
                                    <button
                                        onClick={() => setViewMode('all_time')}
                                        className={`px-4 py-1.5 text-sm font-bold rounded transition-colors ${viewMode === 'all_time' ? 'bg-[#2962ff] text-white' : 'text-[#787b86] hover:text-white'}`}
                                    >
                                        All Time
                                    </button>
                                </div>
                                <div className={`text-4xl font-bold px-6 py-3 rounded-lg text-white ${getRSColor(selectedStock.rs_rating)}`}>
                                    {selectedStock.rs_rating}
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#1e222d] p-6 rounded-lg flex-1 shadow-lg flex flex-col">
                            <h2 className="text-[#787b86] mb-4 text-sm font-semibold tracking-wider">
                                {viewMode === 'term' ? 'RS TERM STRUCTURE' : viewMode === 'history' ? 'RS RATING HISTORY' : 'RS RATING ALL TIME'}
                            </h2>
                            <div className="flex-1 min-h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    {viewMode === 'term' ? (
                                        <LineChart data={getChartData(selectedStock)}>
                                            <defs>
                                                <linearGradient id="colorRs" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#2962ff" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#2962ff" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#2a2e39" vertical={false} />
                                            <XAxis
                                                dataKey="name"
                                                stroke="#787b86"
                                                tick={{ fill: '#787b86', fontWeight: 'bold' }}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <YAxis
                                                domain={[0, 100]}
                                                stroke="#787b86"
                                                tick={{ fill: '#787b86' }}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1e222d', borderColor: '#2962ff', borderRadius: '8px', color: '#fff' }}
                                                itemStyle={{ color: '#fff' }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="value"
                                                stroke="#2962ff"
                                                strokeWidth={4}
                                                dot={{ r: 6, fill: '#2962ff', stroke: '#fff', strokeWidth: 2 }}
                                                activeDot={{ r: 8 }}
                                            />
                                        </LineChart>
                                    ) : (
                                        <LineChart data={historyData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#2a2e39" vertical={false} />
                                            <XAxis
                                                dataKey="date"
                                                stroke="#787b86"
                                                tick={{ fill: '#787b86', fontSize: 12 }}
                                                tickFormatter={(val) => {
                                                    if (viewMode === 'all_time') {
                                                        return new Date(val).getFullYear().toString();
                                                    }
                                                    return new Date(val).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
                                                }}
                                                ticks={viewMode === 'all_time' ? undefined : undefined}
                                                minTickGap={viewMode === 'all_time' ? 50 : 30}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <YAxis
                                                domain={[0, 100]}
                                                stroke="#787b86"
                                                tick={{ fill: '#787b86', fontSize: 12 }}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#1e222d', borderColor: '#2962ff', borderRadius: '8px', color: '#fff' }}
                                                labelFormatter={(val) => new Date(val).toLocaleDateString()}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="rs_rating"
                                                name="RS Rating"
                                                stroke="#2962ff"
                                                strokeWidth={2}
                                                dot={false}
                                                activeDot={{ r: 6, fill: '#2962ff' }}
                                            />
                                        </LineChart>
                                    )}
                                </ResponsiveContainer>
                            </div>

                            <div className="grid grid-cols-4 gap-4 mt-8 pt-6 border-t border-[#2a2e39]">
                                <div className="text-center p-4 bg-[#2a2e39] rounded-lg">
                                    <div className="text-[#787b86] text-xs font-bold mb-1">3 MONTHS</div>
                                    <div className={`text-xl font-bold ${getReturnColorClass(selectedStock.return_3m)}`}>
                                        {formatReturn(selectedStock.return_3m)}
                                    </div>
                                </div>
                                <div className="text-center p-4 bg-[#2a2e39] rounded-lg">
                                    <div className="text-[#787b86] text-xs font-bold mb-1">6 MONTHS</div>
                                    <div className={`text-xl font-bold ${getReturnColorClass(selectedStock.return_6m)}`}>
                                        {formatReturn(selectedStock.return_6m)}
                                    </div>
                                </div>
                                <div className="text-center p-4 bg-[#2a2e39] rounded-lg">
                                    <div className="text-[#787b86] text-xs font-bold mb-1">9 MONTHS</div>
                                    <div className={`text-xl font-bold ${getReturnColorClass(selectedStock.return_9m)}`}>
                                        {formatReturn(selectedStock.return_9m)}
                                    </div>
                                </div>
                                <div className="text-center p-4 bg-[#2a2e39] rounded-lg">
                                    <div className="text-[#787b86] text-xs font-bold mb-1">12 MONTHS</div>
                                    <div className={`text-xl font-bold ${getReturnColorClass(selectedStock.return_12m)}`}>
                                        {formatReturn(selectedStock.return_12m)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-[#787b86]">
                        Select a stock to view RS Analysis
                    </div>
                )}
            </div>
        </div>
    );
}
