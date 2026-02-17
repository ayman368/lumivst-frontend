'use client';

import { useEffect, useState } from 'react';
import {
    Search,
    RefreshCw,
    Zap,
    Cpu,
    Clock,
    CheckCircle2,
    XCircle,
    Shield,
    TrendingUp as TrendingUpIcon,
} from 'lucide-react';

interface ScreenerStock {
    symbol: string;
    company_name?: string;
    date: string;
    close: number;
    score: number;

    // Daily RSI
    rsi_14: number | null;
    rsi_3: number | null;
    sma9_rsi: number | null;
    wma45_rsi: number | null;
    ema45_rsi: number | null;
    sma3_rsi3: number | null;
    ema20_sma3: number | null;

    // Daily The Number
    sma9_close: number | null;
    high_sma13: number | null;
    low_sma13: number | null;
    high_sma65: number | null;
    low_sma65: number | null;
    the_number: number | null;
    the_number_hl: number | null;
    the_number_ll: number | null;

    // Daily STAMP
    rsi_14_9days_ago: number | null;
    stamp_a_value: number | null;
    stamp_s9rsi: number | null;
    stamp_e45cfg: number | null;
    stamp_e45rsi: number | null;
    stamp_e20sma3: number | null;

    // Daily CFG
    cfg_daily: number | null;
    cfg_sma4: number | null;
    cfg_sma9: number | null;
    cfg_sma20: number | null;
    cfg_ema20: number | null;
    cfg_ema45: number | null;
    cfg_wma45: number | null;

    // Daily Trend
    sma4: number | null;
    sma9: number | null;
    sma18: number | null;
    wma45_close: number | null;
    cci: number | null;
    cci_ema20: number | null;
    aroon_up: number | null;
    aroon_down: number | null;

    // Weekly RSI
    rsi_w: number | null;
    rsi_3_w: number | null;
    sma9_rsi_w: number | null;
    wma45_rsi_w: number | null;
    ema45_rsi_w: number | null;
    sma3_rsi3_w: number | null;
    ema20_sma3_w: number | null;

    // Weekly The Number
    sma9_close_w: number | null;
    high_sma13_w: number | null;
    low_sma13_w: number | null;
    high_sma65_w: number | null;
    low_sma65_w: number | null;
    the_number_w: number | null;
    the_number_hl_w: number | null;
    the_number_ll_w: number | null;

    // Weekly STAMP
    rsi_14_9days_ago_w: number | null;
    stamp_a_value_w: number | null;
    stamp_s9rsi_w: number | null;
    stamp_e45cfg_w: number | null;
    stamp_e45rsi_w: number | null;
    stamp_e20sma3_w: number | null;

    // Weekly CFG
    cfg_w: number | null;
    cfg_sma4_w: number | null;
    cfg_sma9_w: number | null;
    cfg_ema20_w: number | null;
    cfg_ema45_w: number | null;
    cfg_wma45_w: number | null;

    // Weekly Trend
    close_w: number | null;
    sma4_w: number | null;
    sma9_w: number | null;
    sma18_w: number | null;
    wma45_close_w: number | null;
    cci_w: number | null;
    cci_ema20_w: number | null;
    aroon_up_w: number | null;
    aroon_down_w: number | null;

    // Signals & Booleans
    stamp: boolean;
    stamp_daily: boolean;
    stamp_weekly: boolean;
    trend_signal: boolean;
    final_signal: boolean;
    rsi_55_70: boolean;
    cfg_gt_50_daily: boolean;
    cfg_gt_50_w: boolean;
}

const formatValue = (val: number | null | undefined, decimals: number = 2) => {
    if (val === null || val === undefined) return '-';
    const num = typeof val === 'number' ? val : Number(val);
    if (Number.isNaN(num)) return '-';
    return num.toFixed(decimals);
};

export default function TechnicalScreenerPage() {
    const [stocks, setStocks] = useState<ScreenerStock[]>([]);
    const [filteredStocks, setFilteredStocks] = useState<ScreenerStock[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [minScore, setMinScore] = useState<number>(0);
    const [passingOnly, setPassingOnly] = useState(false);
    const [sortBy, setSortBy] = useState<'score' | 'rsi' | 'close' | 'symbol'>('score');
    const [availableDates, setAvailableDates] = useState<string[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>('');

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    useEffect(() => {
        fetchScreenerData();
    }, [minScore, passingOnly]);

    useEffect(() => {
        filterAndSortStocks();
    }, [searchQuery, sortBy, stocks, selectedDate]);

    const getAuthHeaders = (): HeadersInit => {
        const token = localStorage.getItem('token');
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        return headers;
    };

    const fetchScreenerData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (minScore > 0) params.append('min_score', minScore.toString());
            if (passingOnly) params.append('passing_only', 'true');
            params.append('limit', '500');

            const res = await fetch(
                `${API_URL}/api/technical-screener/screener?${params.toString()}`,
                { headers: getAuthHeaders() }
            );

            if (!res.ok) throw new Error('Failed to fetch screener data');

            const data = await res.json();
            const normalized = (data.data || []).map((s: any) => ({
                ...s,
                // أي تحويلات أو aliases إذا لزم الحال
                close_w: s.close_w ?? s.close ?? null,
            }));

            setStocks(normalized);

            // Extract unique dates and sort descending
            const dates: string[] = Array.from(new Set<string>(normalized.map((s: any) => s.date))).sort().reverse();
            setAvailableDates(dates);
            // Set default to latest date
            if (dates.length > 0 && !selectedDate) {
                setSelectedDate(dates[0]);
            }
        } catch (err) {
            console.error('Error fetching screener:', err);
        } finally {
            setLoading(false);
        }
    };

    const filterAndSortStocks = () => {
        let result = stocks;

        // Filter by selected date
        if (selectedDate) {
            result = result.filter(s => s.date === selectedDate);
        }

        if (searchQuery) {
            const q = searchQuery.toUpperCase();
            result = result.filter(s =>
                s.symbol.includes(q) ||
                s.company_name?.toUpperCase().includes(q)
            );
        }

        result.sort((a, b) => {
            switch (sortBy) {
                case 'score':
                    return b.score - a.score;
                case 'rsi':
                    return (b.rsi_14 || 0) - (a.rsi_14 || 0);
                case 'close':
                    return b.close - a.close;
                case 'symbol':
                    return a.symbol.localeCompare(b.symbol);
                default:
                    return b.score - a.score;
            }
        });

        setFilteredStocks(result);
    };

    const Cell = ({ value, condition }: { value: any; condition?: boolean }) => {
        let colorClass = 'text-gray-900';
        if (condition === true) colorClass = 'text-green-600 font-medium bg-green-50';
        if (condition === false) colorClass = 'text-red-600 font-medium bg-red-50';

        return (
            <td className={`px-3 py-2 text-sm whitespace-nowrap border-b border-gray-100 ${colorClass}`}>
                {typeof value === 'boolean'
                    ? (value ? <CheckCircle2 size={16} className="text-green-500 inline" /> : <XCircle size={16} className="text-red-500 inline" />)
                    : formatValue(value, 2)
                }
            </td>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                                <Cpu size={24} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Technical Screener</h1>
                                <p className="text-gray-600 text-sm">Daily & Weekly Indicators</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-sm text-gray-600 hidden md:block">
                                <Clock size={14} className="inline mr-1" />
                                Real-time Analysis
                            </div>
                            <button
                                onClick={fetchScreenerData}
                                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-blue-700 transition-all flex items-center gap-2"
                            >
                                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex flex-col h-[calc(100vh-73px)] p-4">
                {/* Filters Bar */}
                <div className="mb-4 bg-white p-4 rounded-lg border border-gray-200 flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[300px]">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Search</label>
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by symbol or name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="min-w-[150px]">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Min Score</label>
                        <select
                            value={minScore}
                            onChange={(e) => setMinScore(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="0">All Scores</option>
                            <option value="5">5+ (Good)</option>
                            <option value="8">8+ (Very Good)</option>
                            <option value="10">10+ (Excellent)</option>
                            <option value="13">13+ (Premium)</option>
                        </select>
                    </div>

                    <div className="min-w-[150px]">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Sort By</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="score">Score (High to Low)</option>
                            <option value="rsi">RSI (High to Low)</option>
                            <option value="close">Price (High to Low)</option>
                            <option value="symbol">Symbol (A to Z)</option>
                        </select>
                    </div>

                    <div className="min-w-[150px]">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                        <select
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {availableDates.map(date => (
                                <option key={date} value={date}>
                                    {date}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={() => setPassingOnly(!passingOnly)}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium flex items-center gap-2 h-[38px] ${passingOnly
                            ? 'bg-green-50 border-green-200 text-green-700'
                            : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        <Zap size={14} className={passingOnly ? 'text-green-600' : 'text-gray-500'} />
                        Passing Only
                    </button>
                </div>

                {/* Results Table */}
                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : filteredStocks.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <Search size={32} className="mx-auto text-gray-400 mb-3" />
                            <p className="text-gray-600">No stocks found</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-auto bg-white rounded-lg border border-gray-200 shadow">
                        <table className="w-full border-collapse">
                            <thead className="bg-gray-50 sticky top-0 z-20">
                                <tr>
                                    <th rowSpan={2} className="px-3 py-2 text-left text-xs font-bold text-gray-700 border-b sticky left-0 top-0 bg-gray-50 z-30" style={{ boxShadow: '2px 0 5px -2px rgba(0,0,0,0.1)' }}>Symbol</th>
                                    <th rowSpan={2} className="px-3 py-2 text-center text-xs font-bold text-gray-700 border-b">Date</th>
                                    <th rowSpan={2} className="px-3 py-2 text-center text-xs font-bold text-gray-700 border-b">Score</th>
                                    <th rowSpan={2} className="px-3 py-2 text-center text-xs font-bold text-gray-700 border-b">Close</th>

                                    {/* Daily RSI */}
                                    <th colSpan={7} className="px-3 py-2 text-center text-xs font-bold text-blue-700 bg-blue-50 border-b">Daily RSI</th>

                                    {/* Daily The Number */}
                                    <th colSpan={8} className="px-3 py-2 text-center text-xs font-bold text-indigo-700 bg-indigo-50 border-b">Daily The Number</th>

                                    {/* Daily STAMP */}
                                    <th colSpan={6} className="px-3 py-2 text-center text-xs font-bold text-purple-700 bg-purple-50 border-b">Daily STAMP</th>

                                    {/* Daily CFG */}
                                    <th colSpan={7} className="px-3 py-2 text-center text-xs font-bold text-pink-700 bg-pink-50 border-b">Daily CFG</th>

                                    {/* Daily Trend */}
                                    <th colSpan={8} className="px-3 py-2 text-center text-xs font-bold text-emerald-700 bg-emerald-50 border-b">Daily Trend</th>

                                    {/* Weekly RSI */}
                                    <th colSpan={7} className="px-3 py-2 text-center text-xs font-bold text-blue-700 bg-blue-100 border-b">Weekly RSI</th>

                                    {/* Weekly The Number */}
                                    <th colSpan={8} className="px-3 py-2 text-center text-xs font-bold text-indigo-700 bg-indigo-100 border-b">Weekly The Number</th>

                                    {/* Weekly STAMP */}
                                    <th colSpan={6} className="px-3 py-2 text-center text-xs font-bold text-purple-700 bg-purple-100 border-b">Weekly STAMP</th>

                                    {/* Weekly CFG */}
                                    <th colSpan={6} className="px-3 py-2 text-center text-xs font-bold text-pink-700 bg-pink-100 border-b">Weekly CFG</th>

                                    {/* Weekly Trend */}
                                    <th colSpan={8} className="px-3 py-2 text-center text-xs font-bold text-emerald-700 bg-emerald-100 border-b">Weekly Trend</th>

                                    {/* Signals */}
                                    <th colSpan={5} className="px-3 py-2 text-center text-xs font-bold text-green-700 bg-green-50 border-b">Signals</th>
                                </tr>
                                <tr className="text-xs">
                                    {/* Daily RSI headers */}
                                    {['RSI(14)', 'RSI(3)', 'SMA9(RSI)', 'WMA45(RSI)', 'EMA45(RSI)', 'SMA3(RSI3)', 'EMA20(SMA3)'].map(h => (
                                        <th key={h} className="px-2 py-1 font-medium text-gray-600 border-b bg-blue-50 text-xs">{h}</th>
                                    ))}
                                    {/* Daily The Number headers */}
                                    {['SMA9(Close)', 'HIGH.SMA13', 'LOW.SMA13', 'HIGH.SMA65', 'LOW.SMA65', 'THE.NUMBER', 'THE.NUMBER.HIGH', 'THE.NUMBER.LOW'].map(h => (
                                        <th key={h} className="px-2 py-1 font-medium text-gray-600 border-b bg-indigo-50 text-xs">{h}</th>
                                    ))}
                                    {/* Daily STAMP headers */}
                                    {['RSI[9]', 'STAMP.A', 'SMA9(RSI)', 'EMA45(CFG)', 'EMA45(RSI)', 'EMA20(SMA3)'].map(h => (
                                        <th key={h} className="px-2 py-1 font-medium text-gray-600 border-b bg-purple-50 text-xs">{h}</th>
                                    ))}
                                    {/* Daily CFG headers */}
                                    {['CFG', 'CFG.SMA4', 'CFG.SMA9', 'CFG.SMA20', 'CFG.EMA20', 'CFG.EMA45', 'CFG.WMA45'].map(h => (
                                        <th key={h} className="px-2 py-1 font-medium text-gray-600 border-b bg-pink-50 text-xs">{h}</th>
                                    ))}
                                    {/* Daily Trend headers */}
                                    {['SMA4', 'SMA9', 'SMA18', 'WMA45(Price)', 'CCI(14)', 'CCI.EMA20', 'AROON.UP', 'AROON.DOWN'].map(h => (
                                        <th key={h} className="px-2 py-1 font-medium text-gray-600 border-b bg-emerald-50 text-xs">{h}</th>
                                    ))}
                                    {/* Weekly RSI headers */}
                                    {['RSI(14)', 'RSI(3)', 'SMA9(RSI)', 'WMA45(RSI)', 'EMA45(RSI)', 'SMA3(RSI3)', 'EMA20(SMA3)'].map(h => (
                                        <th key={`w${h}`} className="px-2 py-1 font-medium text-gray-600 border-b bg-blue-100 text-xs">{h}(W)</th>
                                    ))}
                                    {/* Weekly The Number headers */}
                                    {['SMA9(Close)', 'HIGH.SMA13', 'LOW.SMA13', 'HIGH.SMA65', 'LOW.SMA65', 'THE.NUMBER', 'THE.NUMBER.HIGH', 'THE.NUMBER.LOW'].map(h => (
                                        <th key={`w${h}`} className="px-2 py-1 font-medium text-gray-600 border-b bg-indigo-100 text-xs">{h}(W)</th>
                                    ))}
                                    {/* Weekly STAMP headers */}
                                    {['RSI[9]', 'STAMP.A', 'SMA9(RSI)', 'EMA45(CFG)', 'EMA45(RSI)', 'EMA20(SMA3)'].map(h => (
                                        <th key={`w${h}`} className="px-2 py-1 font-medium text-gray-600 border-b bg-purple-100 text-xs">{h}(W)</th>
                                    ))}
                                    {/* Weekly CFG headers */}
                                    {['CFG', 'CFG.SMA4', 'CFG.SMA9', 'CFG.EMA20', 'CFG.EMA45', 'CFG.WMA45'].map(h => (
                                        <th key={`w${h}`} className="px-2 py-1 font-medium text-gray-600 border-b bg-pink-100 text-xs">{h}(W)</th>
                                    ))}
                                    {/* Weekly Trend headers */}
                                    {['Close', 'SMA4', 'SMA9', 'SMA18', 'WMA45(Price)', 'CCI(14)', 'CCI.EMA20', 'AROON.UP', 'AROON.DOWN'].map(h => (
                                        <th key={`w${h}`} className="px-2 py-1 font-medium text-gray-600 border-b bg-emerald-100 text-xs">{h}(W)</th>
                                    ))}
                                    {/* Signals headers */}
                                    {['FINAL.SIGNAL', 'STAMP', 'TREND', 'RSI', 'SCORE'].map(h => (
                                        <th key={h} className="px-2 py-1 font-medium text-gray-600 border-b bg-green-50 text-xs">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredStocks.map((stock, idx) => (
                                    <tr key={`${stock.symbol}-${stock.date}-${idx}`} className="hover:bg-gray-50 transition-colors text-xs">
                                        <td className="px-3 py-1 text-sm font-medium text-gray-900 sticky left-0 bg-white z-10" style={{ boxShadow: '2px 0 5px -2px rgba(0,0,0,0.1)' }}>
                                            <div className="font-bold">{stock.symbol}</div>
                                            <div className="text-gray-500 text-xs">{stock.company_name}</div>
                                        </td>
                                        <td className="px-3 py-1 text-xs text-gray-600 border-b">
                                            {stock.date}
                                        </td>
                                        <td className="px-3 py-1 text-center font-bold">
                                            <span className="px-2 py-1 rounded text-white text-xs" style={{
                                                background: stock.score >= 10 ? '#10B981' : stock.score >= 5 ? '#F59E0B' : '#EF4444'
                                            }}>
                                                {stock.score}
                                            </span>
                                        </td>
                                        <Cell value={stock.close} />

                                        {/* Daily RSI */}
                                        <Cell value={stock.rsi_14} condition={stock.rsi_55_70} />
                                        <Cell value={stock.rsi_3} />
                                        <Cell value={stock.sma9_rsi} />
                                        <Cell value={stock.wma45_rsi} />
                                        <Cell value={stock.ema45_rsi} />
                                        <Cell value={stock.sma3_rsi3} />
                                        <Cell value={stock.ema20_sma3} />

                                        {/* Daily The Number */}
                                        <Cell value={stock.sma9_close} />
                                        <Cell value={stock.high_sma13} />
                                        <Cell value={stock.low_sma13} />
                                        <Cell value={stock.high_sma65} />
                                        <Cell value={stock.low_sma65} />
                                        <Cell value={stock.the_number} />
                                        <Cell value={stock.the_number_hl} />
                                        <Cell value={stock.the_number_ll} />

                                        {/* Daily STAMP */}
                                        <Cell value={stock.rsi_14_9days_ago} />
                                        <Cell value={stock.stamp_a_value} />
                                        <Cell value={stock.stamp_s9rsi} />
                                        <Cell value={stock.stamp_e45cfg} />
                                        <Cell value={stock.stamp_e45rsi} />
                                        <Cell value={stock.stamp_e20sma3} />

                                        {/* Daily CFG */}
                                        <Cell value={stock.cfg_daily} condition={stock.cfg_gt_50_daily} />
                                        <Cell value={stock.cfg_sma4} />
                                        <Cell value={stock.cfg_sma9} />
                                        <Cell value={stock.cfg_sma20} />
                                        <Cell value={stock.cfg_ema20} />
                                        <Cell value={stock.cfg_ema45} />
                                        <Cell value={stock.cfg_wma45} />

                                        {/* Daily Trend */}
                                        <Cell value={stock.sma4} />
                                        <Cell value={stock.sma9} />
                                        <Cell value={stock.sma18} />
                                        <Cell value={stock.wma45_close} />
                                        <Cell value={stock.cci} />
                                        <Cell value={stock.cci_ema20} />
                                        <Cell value={stock.aroon_up} />
                                        <Cell value={stock.aroon_down} />

                                        {/* Weekly RSI */}
                                        <Cell value={stock.rsi_w} />
                                        <Cell value={stock.rsi_3_w} />
                                        <Cell value={stock.sma9_rsi_w} />
                                        <Cell value={stock.wma45_rsi_w} />
                                        <Cell value={stock.ema45_rsi_w} />
                                        <Cell value={stock.sma3_rsi3_w} />
                                        <Cell value={stock.ema20_sma3_w} />

                                        {/* Weekly The Number */}
                                        <Cell value={stock.sma9_close_w} />
                                        <Cell value={stock.high_sma13_w} />
                                        <Cell value={stock.low_sma13_w} />
                                        <Cell value={stock.high_sma65_w} />
                                        <Cell value={stock.low_sma65_w} />
                                        <Cell value={stock.the_number_w} />
                                        <Cell value={stock.the_number_hl_w} />
                                        <Cell value={stock.the_number_ll_w} />

                                        {/* Weekly STAMP */}
                                        <Cell value={stock.rsi_14_9days_ago_w} />
                                        <Cell value={stock.stamp_a_value_w} />
                                        <Cell value={stock.stamp_s9rsi_w} />
                                        <Cell value={stock.stamp_e45cfg_w} />
                                        <Cell value={stock.stamp_e45rsi_w} />
                                        <Cell value={stock.stamp_e20sma3_w} />

                                        {/* Weekly CFG */}
                                        <Cell value={stock.cfg_w} condition={stock.cfg_gt_50_w} />
                                        <Cell value={stock.cfg_sma4_w} />
                                        <Cell value={stock.cfg_sma9_w} />
                                        <Cell value={stock.cfg_ema20_w} />
                                        <Cell value={stock.cfg_ema45_w} />
                                        <Cell value={stock.cfg_wma45_w} />

                                        {/* Weekly Trend */}
                                        <Cell value={stock.close_w} />
                                        <Cell value={stock.sma4_w} />
                                        <Cell value={stock.sma9_w} />
                                        <Cell value={stock.sma18_w} />
                                        <Cell value={stock.wma45_close_w} />
                                        <Cell value={stock.cci_w} />
                                        <Cell value={stock.cci_ema20_w} />
                                        <Cell value={stock.aroon_up_w} />
                                        <Cell value={stock.aroon_down_w} />

                                        {/* Signals */}
                                        <td className="px-2 py-1 text-center border-b border-gray-100">
                                            {stock.final_signal ? <CheckCircle2 size={14} className="text-blue-600 inline" /> : <XCircle size={14} className="text-gray-300 inline" />}
                                        </td>
                                        <td className="px-2 py-1 text-center border-b border-gray-100">
                                            {stock.stamp ? <Shield size={14} className="text-amber-600 inline" /> : <XCircle size={14} className="text-gray-300 inline" />}
                                        </td>
                                        <td className="px-2 py-1 text-center border-b border-gray-100">
                                            {stock.trend_signal ? <TrendingUpIcon size={14} className="text-green-600 inline" /> : <XCircle size={14} className="text-gray-300 inline" />}
                                        </td>
                                        <td className="px-2 py-1 text-center border-b border-gray-100">
                                            {stock.rsi_55_70 ? <CheckCircle2 size={14} className="text-green-600 inline" /> : <XCircle size={14} className="text-red-500 inline" />}
                                        </td>
                                        <td className="px-2 py-1 text-center border-b border-gray-100 font-bold">
                                            {stock.score}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-3 text-xs text-gray-500 text-right">
                    Showing {filteredStocks.length} / {stocks.length} stocks
                </div>
            </div>
        </div>
    );
}
