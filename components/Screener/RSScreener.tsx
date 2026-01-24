'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart } from 'recharts';
import { Calendar, TrendingUp, TrendingDown, Search, Filter, X, ChevronRight, BarChart3, Sparkles, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';

interface StockRS {
    symbol: string;
    company_name?: string;
    rs_rating: number;
    rank_3m: number;
    rank_6m: number;
    rank_9m: number;
    rank_12m: number;
    return_3m: number;
    return_6m: number;
    return_9m: number;
    return_12m: number;
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

const getLocalDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

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

export default function RSScreener() {
    const [stocks, setStocks] = useState<StockRS[]>([]);
    const [filteredStocks, setFilteredStocks] = useState<StockRS[]>([]);
    const [selectedStock, setSelectedStock] = useState<StockRS | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRange, setFilterRange] = useState<[number, number]>([0, 100]);
    const [historyData, setHistoryData] = useState<any[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState('1Y');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    useEffect(() => {
        fetchLatestRS();
    }, []);

    useEffect(() => {
        let result = stocks;
        result = result.filter(s => s.rs_rating >= filterRange[0] && s.rs_rating <= filterRange[1]);
        if (searchQuery) {
            const q = searchQuery.toUpperCase();
            result = result.filter(s =>
                s.symbol.includes(q) ||
                s.company_name?.toUpperCase().includes(q)
            );
        }
        setFilteredStocks(result);
    }, [stocks, searchQuery, filterRange]);

    useEffect(() => {
        if (selectedStock) {
            fetchHistoryWithPeriod(selectedStock.symbol);
        }
    }, [selectedStock, selectedPeriod, customStartDate, customEndDate]);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    const fetchLatestRS = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch(`${API_URL}/api/rs/latest?limit=500`, { headers });
            if (res.status === 401 || res.status === 403) return;

            const data = await res.json();
            if (data.data) {
                setStocks(data.data);
                if (data.data.length > 0) {
                    setSelectedStock(data.data[0]);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchHistoryWithPeriod = async (symbol: string) => {
        setHistoryLoading(true);
        try {
            let fromDate = '';
            const today = new Date();
            const toDate = getLocalDateString(today);

            if (selectedPeriod === 'Custom' && customStartDate && customEndDate) {
                fromDate = customStartDate;
            } else {
                const option = PERIOD_OPTIONS.find(p => p.label === selectedPeriod);
                if (option) {
                    const startDate = calculateStartDate(option);
                    fromDate = getLocalDateString(startDate);
                }
            }

            let url = `${API_URL}/api/rs/${symbol}`;
            const params = new URLSearchParams();
            const finalToDate = (selectedPeriod === 'Custom' && customEndDate) ? customEndDate : toDate;

            if (fromDate) params.append('from_date', fromDate);
            if (finalToDate) params.append('to_date', finalToDate);
            if (params.toString()) url += `?${params.toString()}`;

            const token = localStorage.getItem('token');
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch(url, { headers });
            if (!res.ok) throw new Error('Failed to fetch history');

            const data = await res.json();
            setHistoryData(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
            setHistoryData([]);
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

    const getRSBadgeStyle = (val: number) => {
        if (val >= 90) return 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/50';
        if (val >= 70) return 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/50';
        if (val >= 50) return 'bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg shadow-amber-500/50';
        if (val >= 30) return 'bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/50';
        return 'bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/50';
    };

    const formatReturn = (val: number | undefined) => {
        if (val === undefined || val === null) return '-';
        return `${(val * 100).toFixed(1)}%`;
    };

    const getReturnColorClass = (val: number | undefined) => {
        if (val === undefined || val === null) return 'text-slate-300';
        if (val > 0) return 'text-emerald-400';
        if (val < 0) return 'text-red-400';
        return 'text-slate-400';
    };

    const getRSChange = () => {
        if (historyData.length < 2) return { value: 0, isPositive: true };
        const first = historyData[0]?.rs_rating || 0;
        const last = historyData[historyData.length - 1]?.rs_rating || 0;
        const change = last - first;
        return { value: change, isPositive: change >= 0 };
    };

    const rsChange = getRSChange();

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-4 shadow-2xl backdrop-blur-xl">
                    <p className="text-slate-300 text-sm mb-2 font-medium">
                        {new Date(label).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500"></div>
                        <p className="text-white font-bold text-lg">RS {payload[0].value?.toFixed(1)}</p>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="flex bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 font-sans min-h-screen">
            {/* Enhanced Sidebar */}
            <div className={`${sidebarCollapsed ? 'w-16' : 'w-80'} bg-gradient-to-b from-slate-900/80 to-slate-900/60 backdrop-blur-xl flex flex-col border-r border-slate-800/50 transition-all duration-300 relative`}>
                <button
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="absolute -right-3 top-6 z-10 w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                >
                    <ChevronRight size={14} className={`text-white transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`} />
                </button>

                {!sidebarCollapsed && (
                    <>
                        <div className="p-6 border-b border-slate-800/50">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <BarChart3 size={20} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">RS Screener</h2>
                                    <p className="text-xs text-slate-400">Relative Strength Analysis</p>
                                </div>
                            </div>

                            <div className="relative group mb-4">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search stocks..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-500"
                                />
                            </div>

                            <div className="flex items-center gap-2 mb-3">
                                <Filter size={14} className="text-slate-400" />
                                <h3 className="text-slate-400 text-xs font-bold tracking-wider uppercase">Quick Filters</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { label: '90+', range: [90, 100], gradient: 'from-emerald-500 to-emerald-600', shadow: 'emerald' },
                                    { label: '80+', range: [80, 100], gradient: 'from-blue-500 to-blue-600', shadow: 'blue' },
                                    { label: '70+', range: [70, 100], gradient: 'from-cyan-500 to-cyan-600', shadow: 'cyan' },
                                    { label: '50+', range: [51, 100], gradient: 'from-amber-500 to-amber-600', shadow: 'amber' },
                                    { label: '<50', range: [0, 50], gradient: 'from-orange-500 to-orange-600', shadow: 'orange' },
                                    { label: 'All', range: [0, 100], gradient: 'from-slate-600 to-slate-700', shadow: 'slate' },
                                ].map(filter => (
                                    <button
                                        key={filter.label}
                                        onClick={() => setFilterRange(filter.range as [number, number])}
                                        className={`py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${filterRange[0] === filter.range[0] && filterRange[1] === filter.range[1]
                                            ? `bg-gradient-to-br ${filter.gradient} text-white shadow-lg scale-105`
                                            : 'bg-slate-800/30 text-slate-400 hover:bg-slate-800/50 hover:text-white'
                                            }`}
                                    >
                                        {filter.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            <div className="p-3">
                                <div className="flex items-center justify-between px-3 mb-2">
                                    <p className="text-xs text-slate-500 font-medium">{filteredStocks.length} stocks</p>
                                    <Sparkles size={12} className="text-blue-400" />
                                </div>
                                {loading ? (
                                    <div className="py-12 text-center">
                                        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                                        <p className="text-slate-500 text-sm">Loading stocks...</p>
                                    </div>
                                ) : filteredStocks.length === 0 ? (
                                    <div className="py-12 text-center">
                                        <p className="text-slate-500 text-sm">No stocks found</p>
                                    </div>
                                ) : (
                                    filteredStocks.map(stock => (
                                        <div
                                            key={stock.symbol}
                                            onClick={() => setSelectedStock(stock)}
                                            className={`mb-2 p-4 cursor-pointer rounded-xl transition-all duration-200 border ${selectedStock?.symbol === stock.symbol
                                                ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-500/50 shadow-lg shadow-blue-500/20 scale-[1.02]'
                                                : 'bg-slate-800/30 border-slate-800/50 hover:bg-slate-800/50 hover:border-slate-700'
                                                }`}
                                        >
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="flex-1 min-w-0 mr-3">
                                                    <div className="font-bold text-white text-sm truncate">{stock.company_name || stock.symbol}</div>
                                                    <div className="text-xs text-slate-500 font-medium">{stock.symbol}</div>
                                                </div>
                                                <div className={`px-3 py-1.5 rounded-lg text-xs font-black text-white ${getRSBadgeStyle(stock.rs_rating)}`}>
                                                    {stock.rs_rating}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-slate-500">12M Return</span>
                                                <span className={`font-bold flex items-center gap-1 ${getReturnColorClass(stock.return_12m)}`}>
                                                    {stock.return_12m !== undefined && stock.return_12m > 0 ? (
                                                        <ArrowUpRight size={12} />
                                                    ) : stock.return_12m !== undefined && stock.return_12m < 0 ? (
                                                        <ArrowDownRight size={12} />
                                                    ) : null}
                                                    {formatReturn(stock.return_12m)}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </>
                )}

                {sidebarCollapsed && (
                    <div className="flex flex-col items-center py-6 space-y-6">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <BarChart3 size={16} className="text-white" />
                        </div>
                        <div className="w-6 h-6 flex items-center justify-center">
                            <Search size={14} className="text-slate-400" />
                        </div>
                        <div className="w-6 h-6 flex items-center justify-center">
                            <Filter size={14} className="text-slate-400" />
                        </div>
                        <div className="w-6 h-6 flex items-center justify-center">
                            <Sparkles size={12} className="text-blue-400" />
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {selectedStock ? (
                    <>
                        <div className="bg-gradient-to-r from-slate-900/80 to-slate-800/80 backdrop-blur-xl border-b border-slate-800/50 px-8 py-6">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-5">
                                    <div className={`text-4xl font-black px-6 py-4 rounded-2xl text-white ${getRSBadgeStyle(selectedStock.rs_rating)}`}>
                                        {selectedStock.rs_rating}
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold text-white mb-1">{selectedStock.company_name}</h1>
                                        <div className="flex items-center gap-3">
                                            <span className="text-slate-400 text-sm font-mono">{selectedStock.symbol}</span>
                                            <span className="text-slate-600">•</span>
                                            <span className={`text-sm font-bold flex items-center gap-1.5 px-3 py-1 rounded-lg ${rsChange.isPositive
                                                ? 'bg-emerald-500/20 text-emerald-400'
                                                : 'bg-red-500/20 text-red-400'
                                                }`}>
                                                {rsChange.isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                                {rsChange.isPositive ? '+' : ''}{rsChange.value.toFixed(1)} pts
                                                <span className="text-xs opacity-70">({selectedPeriod})</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 bg-slate-900/50 p-2 rounded-xl border border-slate-800/50">
                                    {PERIOD_OPTIONS.map(opt => (
                                        <button
                                            key={opt.label}
                                            onClick={() => handlePeriodChange(opt.label)}
                                            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${selectedPeriod === opt.label
                                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                                                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                                }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}

                                    <div className="relative">
                                        <button
                                            onClick={() => setShowDatePicker(!showDatePicker)}
                                            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${showDatePicker || selectedPeriod === 'Custom'
                                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                                                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                                }`}
                                        >
                                            <Calendar size={14} />
                                            {selectedPeriod === 'Custom' && (
                                                <span className="ml-1">Custom</span>
                                            )}
                                        </button>

                                        {showDatePicker && (
                                            <div className="absolute top-full right-0 mt-3 bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-800/50 p-6 z-50 w-96">
                                                <div className="flex items-center justify-between mb-5">
                                                    <span className="text-sm font-bold text-white">Custom Date Range</span>
                                                    <button onClick={() => setShowDatePicker(false)} className="text-slate-400 hover:text-white transition-colors">
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4 mb-5">
                                                    <div>
                                                        <label className="block text-xs text-slate-400 mb-2 font-medium">Start Date</label>
                                                        <input
                                                            type="date"
                                                            value={customStartDate}
                                                            onChange={(e) => setCustomStartDate(e.target.value)}
                                                            className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-slate-400 mb-2 font-medium">End Date</label>
                                                        <input
                                                            type="date"
                                                            value={customEndDate}
                                                            onChange={(e) => setCustomEndDate(e.target.value)}
                                                            className="w-full px-3 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex justify-end gap-3">
                                                    <button
                                                        onClick={() => { setCustomStartDate(''); setCustomEndDate(''); setShowDatePicker(false); }}
                                                        className="px-5 py-2.5 text-sm font-medium text-slate-400 hover:text-white border border-slate-700 rounded-xl hover:bg-slate-800/50 transition-all"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={handleApplyCustomRange}
                                                        disabled={!customStartDate || !customEndDate}
                                                        className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all ${!customStartDate || !customEndDate
                                                            ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed'
                                                            : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/30'
                                                            }`}
                                                    >
                                                        Apply Range
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 p-8 overflow-auto">
                            <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-800/50 p-6 mb-6 h-[500px] flex flex-col">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h2 className="text-white text-lg font-bold flex items-center gap-2">
                                            <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                                            RS Rating History
                                        </h2>
                                        <p className="text-slate-500 text-sm mt-1">
                                            {historyData.length} data points • {selectedPeriod}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex-1">
                                    {historyLoading ? (
                                        <div className="h-full flex items-center justify-center">
                                            <div className="text-center">
                                                <Loader2 size={48} className="mx-auto mb-4 text-blue-500 animate-spin" />
                                                <p className="text-slate-400">Loading chart data...</p>
                                            </div>
                                        </div>
                                    ) : historyData.length === 0 ? (
                                        <div className="h-full flex items-center justify-center">
                                            <div className="text-center">
                                                <BarChart3 size={48} className="mx-auto mb-4 text-slate-700" />
                                                <p className="text-slate-500">No data available for this period</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={historyData}>
                                                <defs>
                                                    <linearGradient id="rsGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" strokeOpacity={0.3} vertical={false} />
                                                <XAxis
                                                    dataKey="date"
                                                    tick={{ fill: '#64748b', fontSize: 11 }}
                                                    tickFormatter={(val) => {
                                                        if (selectedPeriod === 'MAX' || selectedPeriod === '5Y' || selectedPeriod === '10Y') {
                                                            return val.slice(0, 4);
                                                        }
                                                        return new Date(val).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                                                    }}
                                                    minTickGap={30}
                                                    axisLine={{ stroke: '#334155' }}
                                                    tickLine={false}
                                                />
                                                <YAxis
                                                    domain={[0, 100]}
                                                    tick={{ fill: '#64748b', fontSize: 11 }}
                                                    axisLine={{ stroke: '#334155' }}
                                                    tickLine={false}
                                                    width={40}
                                                />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Area
                                                    type="monotone"
                                                    dataKey="rs_rating"
                                                    stroke="#3b82f6"
                                                    strokeWidth={3}
                                                    fill="url(#rsGradient)"
                                                    dot={false}
                                                    activeDot={{ r: 6, strokeWidth: 0, fill: '#3b82f6' }}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-4">
                                {[
                                    { label: '3M Return', value: selectedStock.return_3m, icon: '' },
                                    { label: '6M Return', value: selectedStock.return_6m, icon: '' },
                                    { label: '9M Return', value: selectedStock.return_9m, icon: '' },
                                    { label: '12M Return', value: selectedStock.return_12m, icon: '' },
                                ].map((item) => (
                                    <div key={item.label} className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-800/50 p-6 hover:border-slate-700 transition-all group hover:scale-[1.02] hover:shadow-lg">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-slate-400 text-xs font-bold tracking-wider uppercase">{item.label}</span>
                                            <span className="text-2xl group-hover:scale-110 transition-transform">{item.icon}</span>
                                        </div>
                                        <div className={`text-3xl font-black ${getReturnColorClass(item.value)} flex items-center gap-2`}>
                                            {item.value !== undefined && item.value > 0 && <ArrowUpRight size={20} />}
                                            {item.value !== undefined && item.value < 0 && <ArrowDownRight size={20} />}
                                            {formatReturn(item.value)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <TrendingUp size={40} className="text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Select a Stock</h3>
                            <p className="text-slate-500">Choose a stock from the sidebar to view detailed RS analysis</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}