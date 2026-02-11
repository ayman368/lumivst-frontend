'use client';

import { useEffect, useState } from 'react';
import {
    Activity,
    TrendingUp,
    TrendingDown,
    Search,
    CheckCircle2,
    XCircle,
    RefreshCw,
    Gauge,
    Target,
    Zap,
    PieChart,
    Shield,
    TrendingUp as TrendingUpIcon,
    AlertCircle,
    Filter,
    BarChart3,
    LineChart,
    Info,
    Calendar,
    DollarSign,
    Star,
    TrendingDown as TrendingDownIcon,
    Clock,
    Layers,
    Cpu,
    Sparkles,
    BarChart,
    LineChart as LineChartIcon,
    Target as TargetIcon,
    AlertTriangle,
    ChevronRight,
    Percent,
    Hash,
    Calculator,
    Sigma,
    Divide,
    Minus,
    Plus,
    Grid3x3,
    ChartLine,
    ChartArea,
    ChartBar,
    ChartCandlestick
} from 'lucide-react';

interface ScreenerStock {
    symbol: string;
    company_name?: string;
    date: string;
    close: number;
    rsi: number | null;
    rsi_14_9_days_ago: number | null;  // RSI from 9 days ago
    sma9_rsi: number | null;
    wma45_rsi: number | null;
    ema45_rsi: number | null;
    e45_cfg: number | null;
    e20_sma3_rsi3: number | null;
    sma9_close: number | null;
    the_number: number | null;
    the_number_hl: number | null;
    the_number_ll: number | null;
    stamp: boolean;
    stamp_daily: boolean;
    stamp_weekly: boolean;
    rsi_55_70: boolean;
    sma9_gt_tn_daily: boolean;
    sma9_gt_tn_weekly: boolean;
    rsi_lt_80_d: boolean;
    rsi_lt_80_w: boolean;
    sma9_rsi_lte_75_d: boolean;
    sma9_rsi_lte_75_w: boolean;
    ema45_rsi_lte_70_d: boolean;
    ema45_rsi_lte_70_w: boolean;
    rsi_gt_wma45_d: boolean;
    rsi_gt_wma45_w: boolean;
    sma9rsi_gt_wma45rsi_d: boolean;
    sma9rsi_gt_wma45rsi_w: boolean;
    cci: number | null;
    cci_ema20: number | null;
    cci_ema20_w: number | null;
    aroon_up: number | null;
    aroon_down: number | null;
    trend_signal: boolean;
    final_signal: boolean;
    score: number;
    price_gt_sma18: boolean;
    price_gt_sma9_weekly: boolean;
    sma_trend_daily: boolean;
    sma_trend_weekly: boolean;
    cci_gt_100: boolean;
    cci_ema20_gt_0_daily: boolean;
    cci_ema20_gt_0_weekly: boolean;
    aroon_up_gt_70: boolean;
    aroon_down_lt_30: boolean;

    // CFG Indicators - أضيفت هنا
    cfg_daily: number | null;
    cfg_sma9: number | null;
    cfg_sma20: number | null;
    cfg_ema20: number | null;
    cfg_ema45: number | null;

    // Additional Fields
    wma45_close: number | null;
    sma4: number | null;
    sma18: number | null;

    // CFG Conditions
    cfg_gt_50_daily: boolean;
    cfg_gt_50_weekly: boolean;
    cfg_ema45_gt_50: boolean;
    cfg_ema20_gt_50: boolean;

    // Weekly General Values
    rsi_w: number | null;
    rsi_w_9_weeks_ago: number | null;  // RSI from 9 weeks ago
    sma9_rsi_w: number | null;
    wma45_rsi_w: number | null;
    ema45_rsi_w: number | null;
    sma9_close_w: number | null;
    the_number_w: number | null;
    ema20_sma3_rsi3_w: number | null;  // EMA20 of SMA3 RSI3 (Weekly)

    // CFG Weekly Values
    cfg_w: number | null;
    cfg_weekly?: number | null; // Alias for frontend compatibility
    wma45_close_w: number | null;
    sma4_w: number | null;
    sma18_w: number | null;
    close_w: number | null;
    cfg_sma9_w: number | null;
    cfg_ema20_w: number | null;
    cfg_ema45_w: number | null;

    // CFG Weekly Conditions
    cfg_gt_50_w: boolean;
    cfg_ema45_gt_50_w: boolean;
    cfg_ema20_gt_50_w: boolean;

    // RSI3 for CFG Calculation
    rsi_3: number | null;
    rsi_3_w: number | null;
    sma3_rsi3: number | null;
    sma3_rsi3_w: number | null;

    // CFG Components
    rsi_14_shifted: number | null;  // Daily ta.rsi(close[9], 14)
    rsi_14_minus_9: number | null;
    rsi_14_minus_9_w: number | null;
    rsi_14_w_shifted: number | null;  // Weekly ta.rsi(close[9], 14)

    // Weekly Aroon
    aroon_up_w: number | null;
    aroon_down_w: number | null;

    // Screener Filters
    is_etf_or_index: boolean;
    has_gap: boolean;
}

const formatValue = (val: number | null | undefined, decimals: number = 2) => {
    if (val === null || val === undefined) return '-';
    return val.toFixed(decimals);
};

const CFGFormulaDisplay = ({ stock }: { stock: ScreenerStock }) => {
    // Calculate values correctly using stored values
    const rsi14 = stock.rsi || 0;
    // استخدم rsi_14_9_days_ago وهي تحتوي على (rsi14_current - ta.rsi(close[9], 14))
    const rsiDifference = stock.rsi_14_9_days_ago || 0;  // rsi14_current - ta.rsi(close[9], 14)
    const sma3Rsi3 = stock.sma3_rsi3 || 0;
    const cfgValue = stock.cfg_daily || 0;

    return (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-200 mb-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-600 rounded-lg">
                    <Calculator size={24} className="text-white" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900">CFG Formula Breakdown</h3>
                    <p className="text-gray-600 text-sm">CFG = RSI(14)_current - RSI(14)_9daysago + SMA(RSI(3), 3)</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg border border-indigo-200">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1 bg-blue-100 rounded">
                            <Sigma size={16} className="text-blue-600" />
                        </div>
                        <span className="font-medium text-gray-900">RSI(14) Current</span>
                    </div>
                    <div className="text-2xl font-bold text-indigo-700">{formatValue(rsi14, 1)}</div>
                    <div className="text-sm text-gray-600 mt-1">Current RSI 14-day</div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-indigo-200">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1 bg-red-100 rounded">
                            <Minus size={16} className="text-red-600" />
                        </div>
                        <span className="font-medium text-gray-900">RSI(14) - Shifted(9)</span>
                    </div>
                    <div className="text-2xl font-bold text-indigo-700">
                        {formatValue(rsiDifference, 1)}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">RSI(14) - ta.rsi(close[9], 14)</div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-indigo-200">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1 bg-green-100 rounded">
                            <Plus size={16} className="text-green-600" />
                        </div>
                        <span className="font-medium text-gray-900">SMA(RSI(3), 3)</span>
                    </div>
                    <div className="text-2xl font-bold text-indigo-700">{formatValue(sma3Rsi3, 1)}</div>
                    <div className="text-sm text-gray-600 mt-1">3-day SMA of RSI(3)</div>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-indigo-200">
                <div className="text-center">
                    <div className="text-sm text-gray-600 mb-2">Final CFG Calculation</div>
                    <div className="text-3xl font-bold text-indigo-700 mb-2">
                        {formatValue(rsi14, 1)} - ({formatValue(rsiDifference, 1)}) + {formatValue(sma3Rsi3, 1)} = {formatValue(cfgValue, 1)}
                    </div>
                    <div className="text-sm text-gray-500">
                        CFG = {formatValue(rsi14, 1)} - ta.rsi(close[9], 14) + {formatValue(sma3Rsi3, 1)} = {formatValue(cfgValue, 1)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function TechnicalScreenerPage() {
    const [stocks, setStocks] = useState<ScreenerStock[]>([]);
    const [filteredStocks, setFilteredStocks] = useState<ScreenerStock[]>([]);
    const [selectedStock, setSelectedStock] = useState<ScreenerStock | null>(null);
    const [loading, setLoading] = useState(true);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [minScore, setMinScore] = useState<number>(0);
    const [passingOnly, setPassingOnly] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'rsi' | 'trend' | 'stamp' | 'theNumber' | 'cfg'>('overview');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState<'score' | 'rsi' | 'close' | 'symbol'>('score');

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    useEffect(() => {
        fetchScreenerData();
    }, [minScore, passingOnly]);

    useEffect(() => {
        filterAndSortStocks();
    }, [searchQuery, sortBy]); // Removed 'stocks' from dependency to prevent infinite loop if filter modifies it, but filterAndSort uses stocks state. Actually stocks is fine if it's state. But wait.

    // Debugging Selected Stock Data
    useEffect(() => {
        if (selectedStock) {
            console.log('Selected Stock Data:', {
                symbol: selectedStock.symbol,
                score: selectedStock.score,
                cfg_daily: selectedStock.cfg_daily,
                cfg_weekly: selectedStock.cfg_w || selectedStock.cfg_weekly,
                stamp: selectedStock.stamp,
                allFields: Object.keys(selectedStock)
            });
        }
    }, [selectedStock]);

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
            setStocks(data.data || []);

            if (data.data?.length > 0 && !selectedStock) {
                setSelectedStock(data.data[0]);
            }
        } catch (err) {
            console.error('Error fetching screener:', err);
        } finally {
            setLoading(false);
        }
    };

    const filterAndSortStocks = () => {
        let result = stocks;

        // Filter by search query
        if (searchQuery) {
            const q = searchQuery.toUpperCase();
            result = result.filter(s =>
                s.symbol.includes(q) ||
                s.company_name?.toUpperCase().includes(q)
            );
        }

        // Sort stocks
        result.sort((a, b) => {
            switch (sortBy) {
                case 'score':
                    return b.score - a.score;
                case 'rsi':
                    return (b.rsi || 0) - (a.rsi || 0);
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

    const getScoreGradient = (score: number) => {
        if (score >= 13) return 'linear-gradient(135deg, #059669 0%, #10B981 100%)';
        if (score >= 10) return 'linear-gradient(135deg, #10B981 0%, #34D399 100%)';
        if (score >= 7) return 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)';
        if (score >= 4) return 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)';
        return 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)';
    };

    const getScoreColor = (score: number) => {
        if (score >= 13) return 'text-green-600';
        if (score >= 10) return 'text-emerald-500';
        if (score >= 7) return 'text-amber-500';
        if (score >= 4) return 'text-orange-500';
        return 'text-red-500';
    };

    const getRSIColor = (rsi: number) => {
        if (rsi >= 70) return 'text-red-600';
        if (rsi >= 55) return 'text-green-600';
        if (rsi >= 30) return 'text-gray-600';
        return 'text-blue-600';
    };

    const getRSIBgColor = (rsi: number) => {
        if (rsi >= 70) return 'bg-red-100';
        if (rsi >= 55) return 'bg-green-100';
        if (rsi >= 30) return 'bg-gray-100';
        return 'bg-blue-100';
    };

    const formatValue = (val: number | null | undefined, decimals: number = 2) => {
        if (val === null || val === undefined) return '-';
        return val.toFixed(decimals);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getSignalIcon = (signal: boolean) => {
        return signal ? (
            <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-green-600 text-sm font-semibold">Passing</span>
            </div>
        ) : (
            <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                <span className="text-red-600 text-sm font-semibold">Failing</span>
            </div>
        );
    };

    const StatCard = ({ title, value, description, icon: Icon, color, trend }: any) => (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${color}`}>
                    <Icon size={20} className="text-white" />
                </div>
                <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">{title}</p>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{value}</h3>
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">{description}</p>
                        {trend && (
                            <div className={`flex items-center text-xs ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {trend > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                <span>{Math.abs(trend)}%</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    const GaugeIndicator = ({ label, value, min, max, optimalRange, unit = '', description }: any) => {
        const percentage = ((value - min) / (max - min)) * 100;
        const isOptimal = value >= optimalRange[0] && value <= optimalRange[1];
        const isOverbought = value > optimalRange[1];
        const isOversold = value < optimalRange[0];

        return (
            <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                    <span className={`text-base font-semibold ${isOptimal ? 'text-green-600' : isOverbought ? 'text-red-600' : 'text-blue-600'}`}>
                        {formatValue(value)}{unit}
                    </span>
                </div>
                <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
                    <div
                        className={`absolute h-full ${isOptimal ? 'bg-green-500' : isOverbought ? 'bg-red-500' : 'bg-blue-500'}`}
                        style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                    ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span className={isOversold ? 'text-blue-600 font-medium' : ''}>Oversold</span>
                    <span className={isOptimal ? 'text-green-600 font-medium' : ''}>Optimal</span>
                    <span className={isOverbought ? 'text-red-600 font-medium' : ''}>Overbought</span>
                </div>
                {description && (
                    <p className="text-xs text-gray-400 mt-1">{description}</p>
                )}
            </div>
        );
    };

    const ConditionPill = ({ label, passed, value, description, icon: Icon }: any) => (
        <div className={`flex items-start gap-3 p-3 rounded-lg ${passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            {passed ? (
                <CheckCircle2 size={18} className="text-green-500 mt-0.5" />
            ) : (
                <XCircle size={18} className="text-red-500 mt-0.5" />
            )}
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    {Icon && <Icon size={14} className="text-gray-500" />}
                    <span className={`text-sm font-medium ${passed ? 'text-green-800' : 'text-red-800'}`}>
                        {label}
                    </span>
                    {value && (
                        <span className={`text-xs px-1.5 py-0.5 rounded ${passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {value}
                        </span>
                    )}
                </div>
                {description && (
                    <p className="text-xs text-gray-600">{description}</p>
                )}
            </div>
        </div>
    );

    const IndicatorCard = ({ title, value, unit, description, color, icon: Icon }: any) => (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${color}`}>
                    <Icon size={18} className="text-white" />
                </div>
                <div>
                    <h4 className="font-medium text-gray-900">{title}</h4>
                    <p className="text-xs text-gray-500">{description}</p>
                </div>
            </div>
            <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{value}</div>
                {unit && <div className="text-sm text-gray-600">{unit}</div>}
            </div>
        </div>
    );

    const CFGFormulaDisplay = ({ stock }: { stock: ScreenerStock }) => {
        return (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-200 mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-indigo-600 rounded-lg">
                        <Calculator size={24} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">CFG Formula Breakdown</h3>
                        <p className="text-gray-600 text-sm">CFG = RSI(14) - RSI(14)[9] + SMA(RSI(3), 3)</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg border border-indigo-200">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1 bg-blue-100 rounded">
                                <Sigma size={16} className="text-blue-600" />
                            </div>
                            <span className="font-medium text-gray-900">RSI(14)</span>
                        </div>
                        <div className="text-2xl font-bold text-indigo-700">{formatValue(stock.rsi, 1)}</div>
                        <div className="text-sm text-gray-600 mt-1">Current RSI 14-day</div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-indigo-200">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1 bg-red-100 rounded">
                                <Minus size={16} className="text-red-600" />
                            </div>
                            <span className="font-medium text-gray-900">RSI(14)[9]</span>
                        </div>
                        <div className="text-2xl font-bold text-indigo-700">
                            {stock.rsi_14_minus_9 ? formatValue(stock.rsi! - stock.rsi_14_minus_9!, 1) : '-'}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">RSI from 9 days ago</div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-indigo-200">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1 bg-green-100 rounded">
                                <Plus size={16} className="text-green-600" />
                            </div>
                            <span className="font-medium text-gray-900">SMA(RSI(3), 3)</span>
                        </div>
                        <div className="text-2xl font-bold text-indigo-700">{formatValue(stock.sma3_rsi3, 1)}</div>
                        <div className="text-sm text-gray-600 mt-1">3-day SMA of RSI(3)</div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-indigo-200">
                    <div className="text-center">
                        <div className="text-sm text-gray-600 mb-2">Final CFG Calculation</div>
                        <div className="text-3xl font-bold text-indigo-700 mb-2">
                            CFG = {formatValue(stock.cfg_daily, 1)}
                        </div>
                        <div className="text-sm text-gray-500">
                            {formatValue(stock.rsi, 1)} - {formatValue(stock.rsi_14_minus_9, 1)} + {formatValue(stock.sma3_rsi3, 1)} = {formatValue(stock.cfg_daily, 1)}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 font-sans">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                                <Cpu size={24} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Technical Screener Pro</h1>
                                <p className="text-gray-600 text-sm">Advanced RSI & Trend Analysis Dashboard</p>
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
                                Refresh Data
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex flex-col lg:flex-row">
                {/* Sidebar - Stock List */}
                <div className="lg:w-96 bg-white border-r border-gray-200 lg:h-[calc(100vh-73px)] lg:sticky lg:top-16">
                    <div className="p-4 border-b border-gray-200">
                        <div className="relative mb-4">
                            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by symbol or company name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 text-sm"
                            />
                        </div>

                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Filter size={16} className="text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">Filters</span>
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}
                                >
                                    <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
                                        {[...Array(4)].map((_, i) => (
                                            <div key={i} className="bg-current rounded-sm"></div>
                                        ))}
                                    </div>
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}
                                >
                                    <div className="space-y-0.5 w-4 h-4">
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className="w-full h-0.5 bg-current rounded"></div>
                                        ))}
                                    </div>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
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

                            <div className="flex flex-wrap gap-2">
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Minimum Score</label>
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
                                <div className="flex items-end">
                                    <button
                                        onClick={() => setPassingOnly(!passingOnly)}
                                        className={`px-3 py-2 rounded-lg border text-sm font-medium flex items-center gap-2 ${passingOnly
                                            ? 'bg-green-50 border-green-200 text-green-700'
                                            : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        <Zap size={14} className={passingOnly ? 'text-green-600' : 'text-gray-500'} />
                                        Passing Only
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stock List */}
                    <div className="p-4">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-sm text-gray-600">
                                <span className="font-semibold text-gray-900">{filteredStocks.length}</span> stocks found
                            </span>
                            {!loading && (
                                <div className="text-xs text-gray-500">
                                    Updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            )}
                        </div>

                        <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 gap-2' : 'space-y-2'} max-h-[calc(100vh-320px)] overflow-y-auto pr-1`}>
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-10">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
                                    <p className="text-gray-600 text-sm">Loading market data...</p>
                                </div>
                            ) : filteredStocks.length === 0 ? (
                                <div className="text-center py-10 bg-gray-50 rounded-lg">
                                    <Search size={32} className="mx-auto text-gray-400 mb-3" />
                                    <p className="text-gray-600">No stocks match your criteria</p>
                                    <p className="text-gray-500 text-sm mt-1">Try adjusting your filters</p>
                                </div>
                            ) : (
                                filteredStocks.map((stock) => (
                                    <div
                                        key={stock.symbol}
                                        onClick={() => setSelectedStock(stock)}
                                        className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${selectedStock?.symbol === stock.symbol
                                            ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 shadow-sm'
                                            : 'bg-white border border-gray-200 hover:border-blue-300 hover:shadow'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-gray-900">{stock.symbol}</span>
                                                    {stock.score >= 10 && (
                                                        <Star size={12} className="text-amber-500 fill-amber-500" />
                                                    )}
                                                    {stock.rsi_55_70 && (
                                                        <div className="w-2 h-2 bg-green-500 rounded-full" title="RSI 55-70"></div>
                                                    )}
                                                    {stock.cfg_ema45_gt_50 && (
                                                        <div className="w-2 h-2 bg-indigo-500 rounded-full" title="CFG EMA45 > 50"></div>
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-600 truncate max-w-[180px]">
                                                    {stock.company_name}
                                                </div>
                                            </div>
                                            <div
                                                className={`px-2.5 py-1 rounded-full text-xs font-bold text-white`}
                                                style={{
                                                    background: getScoreGradient(stock.score)
                                                }}
                                            >
                                                {stock.score}
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-2">
                                                <DollarSign size={12} className="text-gray-500" />
                                                <span className="font-semibold text-gray-900">
                                                    {formatValue(stock.close)}
                                                </span>
                                            </div>
                                            <div className={`px-2 py-1 rounded text-xs ${getRSIBgColor(stock.rsi || 50)} ${getRSIColor(stock.rsi || 50)}`}>
                                                RSI: {formatValue(stock.rsi, 1)}
                                            </div>
                                        </div>

                                        <div className="mt-2 flex items-center justify-between">
                                            <div className="flex gap-1">
                                                <div className={`w-5 h-1 rounded-full ${stock.stamp ? 'bg-green-500' : 'bg-gray-300'}`}
                                                    title="STAMP Signal"></div>
                                                <div className={`w-5 h-1 rounded-full ${stock.trend_signal ? 'bg-blue-500' : 'bg-gray-300'}`}
                                                    title="Trend Signal"></div>
                                                <div className={`w-5 h-1 rounded-full ${stock.rsi_55_70 ? 'bg-purple-500' : 'bg-gray-300'}`}
                                                    title="RSI 55-70"></div>
                                                <div className={`w-5 h-1 rounded-full ${stock.final_signal ? 'bg-amber-500' : 'bg-gray-300'}`}
                                                    title="Final Signal"></div>
                                                <div className={`w-5 h-1 rounded-full ${stock.cfg_ema45_gt_50 ? 'bg-indigo-500' : 'bg-gray-300'}`}
                                                    title="CFG Signal"></div>
                                            </div>
                                            {getSignalIcon(stock.final_signal)}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-4 lg:p-6">
                    {selectedStock ? (
                        <>
                            {/* Stock Header */}
                            <div className="bg-white rounded-xl p-5 mb-6 shadow-sm border border-gray-200">
                                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-4">
                                            <div
                                                className="px-6 py-3 rounded-xl text-white font-black shadow-lg w-fit"
                                                style={{
                                                    background: getScoreGradient(selectedStock.score)
                                                }}
                                            >
                                                <div className="text-2xl">{selectedStock.score}</div>
                                                <div className="text-xs opacity-90">OUT OF 15</div>
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-gray-900 mb-1">
                                                    {selectedStock.symbol}
                                                    {selectedStock.company_name && (
                                                        <span className="text-gray-600 font-normal ml-2">
                                                            - {selectedStock.company_name}
                                                        </span>
                                                    )}
                                                </h2>
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <div className="flex items-center gap-2">
                                                        <DollarSign size={16} className="text-gray-500" />
                                                        <span className="text-lg font-bold text-gray-900">
                                                            SAR {formatValue(selectedStock.close)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar size={16} className="text-gray-500" />
                                                        <span className="text-sm text-gray-600">
                                                            {formatDate(selectedStock.date)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Percent size={16} className="text-gray-500" />
                                                        <span className={`text-sm font-medium ${getRSIColor(selectedStock.rsi || 50)}`}>
                                                            RSI: {formatValue(selectedStock.rsi, 1)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Activity size={16} className="text-gray-500" />
                                                        <span className={`text-sm font-medium ${selectedStock.cfg_daily && selectedStock.cfg_daily > 50 ? 'text-green-600' : 'text-red-600'}`}>
                                                            CFG: {formatValue(selectedStock.cfg_daily, 1)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            <div className={`px-3 py-1.5 rounded-full flex items-center gap-2 ${selectedStock.final_signal
                                                ? 'bg-green-100 text-green-800 border border-green-200'
                                                : 'bg-red-100 text-red-800 border border-red-200'
                                                }`}>
                                                {selectedStock.final_signal ? (
                                                    <>
                                                        <CheckCircle2 size={14} />
                                                        <span className="font-semibold text-sm">All Conditions Met</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <AlertCircle size={14} />
                                                        <span className="font-semibold text-sm">{15 - selectedStock.score} Conditions Failed</span>
                                                    </>
                                                )}
                                            </div>
                                            <div className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                                <Sparkles size={14} className="inline mr-1" />
                                                Technical Score: {selectedStock.score}/15
                                            </div>
                                            <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${selectedStock.trend_signal
                                                ? 'bg-green-100 text-green-800 border border-green-200'
                                                : 'bg-red-100 text-red-800 border border-red-200'
                                                }`}>
                                                <TrendingUpIcon size={14} className="inline mr-1" />
                                                Trend: {selectedStock.trend_signal ? 'Bullish' : 'Bearish'}
                                            </div>
                                            <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${selectedStock.stamp
                                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                                : 'bg-gray-100 text-gray-800 border border-gray-200'
                                                }`}>
                                                <Shield size={14} className="inline mr-1" />
                                                STAMP: {selectedStock.stamp ? 'Active' : 'Inactive'}
                                            </div>
                                            <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${selectedStock.cfg_ema45_gt_50
                                                ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                                : 'bg-gray-100 text-gray-800 border border-gray-200'
                                                }`}>
                                                {/* <Function size={14} className="inline mr-1" /> */}
                                                CFG: {selectedStock.cfg_ema45_gt_50 ? 'Positive' : 'Negative'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Navigation Tabs */}
                            <div className="flex gap-1 mb-6 bg-white p-1 rounded-lg border border-gray-200 w-fit overflow-x-auto">
                                {[
                                    { id: 'overview', label: 'Dashboard', icon: PieChart, color: 'text-blue-600' },
                                    { id: 'rsi', label: 'RSI Analysis', icon: Gauge, color: 'text-purple-600' },
                                    { id: 'trend', label: 'Trend Signals', icon: TrendingUpIcon, color: 'text-green-600' },
                                    { id: 'stamp', label: 'STAMP System', icon: Shield, color: 'text-amber-600' },
                                    { id: 'theNumber', label: 'The Number', icon: TargetIcon, color: 'text-red-600' },
                                    { id: 'cfg', label: 'CFG Analysis', icon: Activity, color: 'text-indigo-600' }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-md transition-all whitespace-nowrap ${activeTab === tab.id
                                            ? 'bg-blue-50 text-blue-600'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                            }`}
                                    >
                                        <tab.icon size={18} className={activeTab === tab.id ? tab.color : ''} />
                                        <span className="font-medium">{tab.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Content Area */}
                            {activeTab === 'overview' && (
                                <div className="space-y-6">
                                    {/* Quick Stats */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <StatCard
                                            title="Current Price"
                                            value={`SAR ${formatValue(selectedStock.close)}`}
                                            description="Latest closing price"
                                            icon={DollarSign}
                                            color="bg-blue-500"
                                        />
                                        <StatCard
                                            title="RSI Score"
                                            value={formatValue(selectedStock.rsi, 1)}
                                            description="Relative Strength Index"
                                            icon={Gauge}
                                            color="bg-purple-500"
                                        />
                                        <StatCard
                                            title="CFG Value"
                                            value={formatValue(selectedStock.cfg_daily, 1)}
                                            description="Custom Formula Generator"
                                            icon={Activity}
                                            color="bg-indigo-500"
                                        />
                                        <StatCard
                                            title="The Number"
                                            value={formatValue(selectedStock.the_number)}
                                            description="Volatility indicator"
                                            icon={TargetIcon}
                                            color="bg-red-500"
                                        />
                                    </div>

                                    {/* Key Indicators */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* RSI Indicators */}
                                        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="p-2 bg-purple-100 rounded-lg">
                                                    <Gauge size={20} className="text-purple-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900">RSI Momentum Analysis</h3>
                                                    <p className="text-gray-600 text-sm">Optimal range: 55-70 (Not overbought)</p>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <GaugeIndicator
                                                    label="RSI (14)"
                                                    value={selectedStock.rsi}
                                                    min={0}
                                                    max={100}
                                                    optimalRange={[55, 70]}
                                                    description="Relative Strength Index"
                                                />
                                                <GaugeIndicator
                                                    label="SMA9 RSI"
                                                    value={selectedStock.sma9_rsi}
                                                    min={0}
                                                    max={100}
                                                    optimalRange={[0, 75]}
                                                    description="9-period SMA of RSI"
                                                />
                                                <GaugeIndicator
                                                    label="WMA45 RSI"
                                                    value={selectedStock.wma45_rsi}
                                                    min={0}
                                                    max={100}
                                                    optimalRange={[0, 70]}
                                                    description="45-period WMA of RSI"
                                                />
                                                <GaugeIndicator
                                                    label="EMA45 RSI"
                                                    value={selectedStock.ema45_rsi}
                                                    min={0}
                                                    max={100}
                                                    optimalRange={[0, 70]}
                                                    description="45-period EMA of RSI"
                                                />
                                            </div>
                                        </div>

                                        {/* CFG & Trend Indicators */}
                                        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="p-2 bg-indigo-100 rounded-lg">
                                                    <Activity size={20} className="text-indigo-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900">CFG & Trend Analysis</h3>
                                                    <p className="text-gray-600 text-sm">Custom Formula Generator and trend signals</p>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                                                        <div className="text-sm text-gray-600 mb-2">CFG Value</div>
                                                        <div className={`text-xl font-bold ${(selectedStock.cfg_daily ?? 0) > 50
                                                            ? 'text-green-600'
                                                            : 'text-red-600'
                                                            }`}>
                                                            {formatValue(selectedStock.cfg_daily, 1)}
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {selectedStock.cfg_daily !== null &&
                                                                (selectedStock.cfg_daily > 50 ? "Positive Momentum" : "Negative Momentum")}
                                                        </div>
                                                    </div>
                                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                        <div className="text-sm text-gray-600 mb-2">CFG EMA45</div>
                                                        <div className={`text-xl font-bold ${(selectedStock.cfg_ema45 ?? 0) > 50
                                                            ? 'text-green-600'
                                                            : 'text-red-600'
                                                            }`}>
                                                            {formatValue(selectedStock.cfg_ema45, 1)}
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {selectedStock.cfg_ema45 !== null &&
                                                                (selectedStock.cfg_ema45 > 50 ? "Strong CFG Signal" : "Weak CFG Signal")}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="font-medium text-gray-900">The Number Analysis</div>
                                                        <div className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                                            Volatility Indicator
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="text-lg font-bold text-gray-900">
                                                                {formatValue(selectedStock.the_number)}
                                                            </div>
                                                            <div className="text-sm text-gray-600">Current Value</div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className={`text-lg font-bold ${(selectedStock.sma9_close ?? 0) > (selectedStock.the_number ?? 0)
                                                                ? 'text-green-600'
                                                                : 'text-red-600'
                                                                }`}>
                                                                SMA9: {formatValue(selectedStock.sma9_close)}
                                                            </div>
                                                            <div className="text-sm text-gray-600">9-Day Average</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="text-center p-3 bg-indigo-50 rounded-lg">
                                                        <div className="text-sm text-gray-600 mb-1">CFG Condition</div>
                                                        <div className={`text-lg font-bold ${selectedStock.cfg_ema45_gt_50 ? 'text-green-600' : 'text-red-600'}`}>
                                                            {selectedStock.cfg_ema45_gt_50 ? 'EMA45 > 50 ✓' : 'EMA45 < 50 ✗'}
                                                        </div>
                                                        <div className={`text-sm ${selectedStock.cfg_gt_50_daily ? 'text-green-600' : 'text-red-600'}`}>
                                                            CFG: {formatValue(selectedStock.cfg_daily, 1)}
                                                        </div>
                                                    </div>
                                                    <div className="text-center p-3 bg-green-50 rounded-lg">
                                                        <div className="text-sm text-gray-600 mb-1">RSI Range</div>
                                                        <div className={`text-lg font-bold ${selectedStock.rsi_55_70 ? 'text-green-600' : 'text-red-600'}`}>
                                                            {selectedStock.rsi_55_70 ? '55-70 ✓' : 'Out of Range'}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            Current: {formatValue(selectedStock.rsi, 1)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'rsi' && (
                                <div className="space-y-6">
                                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-2 bg-purple-100 rounded-lg">
                                                <BarChart3 size={24} className="text-purple-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">RSI Screener Analysis</h3>
                                                <p className="text-gray-600 text-sm">Detailed daily and weekly RSI conditions</p>
                                            </div>
                                            <div className="ml-auto">
                                                <div className="flex items-center gap-2">
                                                    <div className={`px-3 py-1.5 rounded-full ${selectedStock.final_signal
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        <span className="font-semibold">
                                                            {selectedStock.final_signal ? 'Passing' : 'Failing'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-6">
                                            <h4 className="font-bold text-gray-900 mb-3">RSI Values</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                <IndicatorCard
                                                    title="RSI (14)"
                                                    value={formatValue(selectedStock.rsi, 1)}
                                                    description="Relative Strength Index"
                                                    color="bg-purple-500"
                                                    icon={Gauge}
                                                />
                                                <IndicatorCard
                                                    title="SMA9 RSI"
                                                    value={formatValue(selectedStock.sma9_rsi, 1)}
                                                    description="9-period SMA of RSI"
                                                    color="bg-blue-500"
                                                    icon={BarChart}
                                                />
                                                <IndicatorCard
                                                    title="WMA45 RSI"
                                                    value={formatValue(selectedStock.wma45_rsi, 1)}
                                                    description="45-period WMA of RSI"
                                                    color="bg-red-500"
                                                    icon={LineChartIcon}
                                                />
                                                <IndicatorCard
                                                    title="EMA45 RSI"
                                                    value={formatValue(selectedStock.ema45_rsi, 1)}
                                                    description="45-period EMA of RSI"
                                                    color="bg-green-500"
                                                    icon={TrendingUpIcon}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            {/* Daily Conditions */}
                                            <div className="bg-gradient-to-b from-blue-50 to-white rounded-xl p-5 border border-blue-200">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-3 h-6 bg-blue-600 rounded-full"></div>
                                                    <h4 className="font-bold text-gray-900">Daily Analysis</h4>
                                                    <div className="ml-auto text-sm text-gray-600">
                                                        {formatDate(selectedStock.date)}
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <ConditionPill
                                                        label="SMA9 > The Number"
                                                        passed={selectedStock.sma9_gt_tn_daily}
                                                        value={`SMA9: ${formatValue(selectedStock.sma9_close)} vs TN: ${formatValue(selectedStock.the_number)}`}
                                                        description="9-day SMA must be above The Number"
                                                    />
                                                    <ConditionPill
                                                        label="RSI < 80"
                                                        passed={selectedStock.rsi_lt_80_d}
                                                        value={`RSI: ${formatValue(selectedStock.rsi, 1)}`}
                                                        description="RSI must be below 80 (not overbought)"
                                                    />
                                                    <ConditionPill
                                                        label="SMA9(RSI) ≤ 75"
                                                        passed={selectedStock.sma9_rsi_lte_75_d}
                                                        value={`SMA9 RSI: ${formatValue(selectedStock.sma9_rsi, 1)}`}
                                                        description="9-day SMA of RSI must be ≤ 75"
                                                    />
                                                    <ConditionPill
                                                        label="EMA45(RSI) ≤ 70"
                                                        passed={selectedStock.ema45_rsi_lte_70_d}
                                                        value={`EMA45 RSI: ${formatValue(selectedStock.ema45_rsi, 1)}`}
                                                        description="45-day EMA of RSI must be ≤ 70"
                                                    />
                                                    <ConditionPill
                                                        label="RSI 55-70"
                                                        passed={selectedStock.rsi_55_70}
                                                        value={`RSI: ${formatValue(selectedStock.rsi, 1)}`}
                                                        description="RSI must be between 55 and 70"
                                                    />
                                                    <ConditionPill
                                                        label="RSI > WMA45 RSI"
                                                        passed={selectedStock.rsi_gt_wma45_d}
                                                        value={`RSI: ${formatValue(selectedStock.rsi, 1)} vs WMA45: ${formatValue(selectedStock.wma45_rsi, 1)}`}
                                                        description="RSI must be above 45-day WMA of RSI"
                                                    />
                                                    <ConditionPill
                                                        label="SMA9 RSI > WMA45 RSI"
                                                        passed={selectedStock.sma9rsi_gt_wma45rsi_d}
                                                        value={`SMA9 RSI: ${formatValue(selectedStock.sma9_rsi, 1)} vs WMA45: ${formatValue(selectedStock.wma45_rsi, 1)}`}
                                                        description="9-day SMA RSI must be above 45-day WMA RSI"
                                                    />
                                                </div>
                                            </div>

                                            {/* Weekly Conditions */}
                                            <div className="bg-gradient-to-b from-purple-50 to-white rounded-xl p-5 border border-purple-200">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-3 h-6 bg-purple-600 rounded-full"></div>
                                                    <h4 className="font-bold text-gray-900">Weekly Analysis</h4>
                                                    <div className="ml-auto text-sm text-gray-600">
                                                        This week
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <ConditionPill
                                                        label="SMA9 > The Number"
                                                        passed={selectedStock.sma9_gt_tn_weekly}
                                                        value="Weekly timeframe"
                                                        description="Weekly SMA9 must be above The Number"
                                                    />
                                                    <ConditionPill
                                                        label="RSI < 80"
                                                        passed={selectedStock.rsi_lt_80_w}
                                                        value="Weekly RSI"
                                                        description="Weekly RSI must be below 80"
                                                    />
                                                    <ConditionPill
                                                        label="SMA9(RSI) ≤ 75"
                                                        passed={selectedStock.sma9_rsi_lte_75_w}
                                                        value="Weekly SMA9 RSI"
                                                        description="Weekly SMA9 of RSI must be ≤ 75"
                                                    />
                                                    <ConditionPill
                                                        label="EMA45(RSI) ≤ 70"
                                                        passed={selectedStock.ema45_rsi_lte_70_w}
                                                        value="Weekly EMA45 RSI"
                                                        description="Weekly EMA45 of RSI must be ≤ 70"
                                                    />
                                                    <ConditionPill
                                                        label="RSI > WMA45 RSI"
                                                        passed={selectedStock.rsi_gt_wma45_w}
                                                        value="Weekly comparison"
                                                        description="Weekly RSI must be above WMA45 RSI"
                                                    />
                                                    <ConditionPill
                                                        label="SMA9 RSI > WMA45 RSI"
                                                        passed={selectedStock.sma9rsi_gt_wma45rsi_w}
                                                        value="Weekly SMA9 vs WMA45"
                                                        description="Weekly SMA9 RSI must be above WMA45 RSI"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 pt-6 border-t border-gray-200">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Info size={16} />
                                                <p>
                                                    RSI analysis evaluates momentum strength. Scores above 70 may indicate overbought conditions,
                                                    while scores below 30 may indicate oversold conditions. Optimal range for trading is 55-70.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'trend' && (
                                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <LineChart size={24} className="text-green-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">Trend Analysis Dashboard</h3>
                                            <p className="text-gray-600 text-sm">Comprehensive trend detection and momentum signals</p>
                                        </div>
                                        <div className="ml-auto">
                                            <div className="flex items-center gap-2">
                                                <div className={`px-3 py-1.5 rounded-full ${selectedStock.trend_signal
                                                    ? 'bg-green-100 text-green-800 border border-green-200'
                                                    : 'bg-red-100 text-red-800 border border-red-200'
                                                    }`}>
                                                    {selectedStock.trend_signal ? (
                                                        <span className="font-semibold">Bullish Trend</span>
                                                    ) : (
                                                        <span className="font-semibold">Bearish Trend</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <h4 className="font-bold text-gray-900 mb-3">Trend Indicators</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <IndicatorCard
                                                title="CCI (14)"
                                                value={formatValue(selectedStock.cci, 1)}
                                                description="Commodity Channel Index"
                                                color={selectedStock.cci_gt_100 ? 'bg-green-500' : 'bg-red-500'}
                                                icon={LineChartIcon}
                                            />
                                            <IndicatorCard
                                                title="Aroon Up"
                                                value={`${formatValue(selectedStock.aroon_up, 1)}%`}
                                                description="Uptrend strength"
                                                color={selectedStock.aroon_up_gt_70 ? 'bg-green-500' : 'bg-amber-500'}
                                                icon={TrendingUp}
                                            />
                                            <IndicatorCard
                                                title="Aroon Down"
                                                value={`${formatValue(selectedStock.aroon_down, 1)}%`}
                                                description="Downtrend strength"
                                                color={selectedStock.aroon_down_lt_30 ? 'bg-green-500' : 'bg-red-500'}
                                                icon={TrendingDown}
                                            />
                                            <IndicatorCard
                                                title="CCI EMA(20)"
                                                value={formatValue(selectedStock.cci_ema20, 1)}
                                                description="20-period EMA of CCI"
                                                color={selectedStock.cci_ema20_gt_0_daily ? 'bg-green-500' : 'bg-red-500'}
                                                icon={BarChart}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                        <ConditionPill
                                            label="Price > 18 SMA (Daily)"
                                            passed={selectedStock.price_gt_sma18}
                                            description="Daily close must be above 18-day SMA"
                                            icon={DollarSign}
                                        />
                                        <ConditionPill
                                            label="Price > 9 SMA (Weekly)"
                                            passed={selectedStock.price_gt_sma9_weekly}
                                            description="Weekly close must be above 9-week SMA"
                                            icon={Calendar}
                                        />
                                        <ConditionPill
                                            label="SMA 4 > 9 > 18 (Daily)"
                                            passed={selectedStock.sma_trend_daily}
                                            description="Daily SMA alignment: 4 > 9 > 18"
                                            icon={TrendingUpIcon}
                                        />
                                        <ConditionPill
                                            label="SMA 4 > 9 > 18 (Weekly)"
                                            passed={selectedStock.sma_trend_weekly}
                                            description="Weekly SMA alignment: 4 > 9 > 18"
                                            icon={Calendar}
                                        />
                                        <ConditionPill
                                            label="CCI(14) > 100"
                                            passed={selectedStock.cci_gt_100}
                                            value={`CCI: ${formatValue(selectedStock.cci, 1)}`}
                                            description="CCI must be above 100"
                                            icon={LineChartIcon}
                                        />
                                        <ConditionPill
                                            label="CCI EMA(20) > 0 (Daily)"
                                            passed={selectedStock.cci_ema20_gt_0_daily}
                                            value={`CCI EMA20: ${formatValue(selectedStock.cci_ema20, 1)}`}
                                            description="Daily CCI EMA must be positive"
                                            icon={BarChart}
                                        />
                                        <ConditionPill
                                            label="CCI EMA(20) > 0 (Weekly)"
                                            passed={selectedStock.cci_ema20_gt_0_weekly}
                                            description="Weekly CCI EMA must be positive"
                                            icon={Calendar}
                                        />
                                        <ConditionPill
                                            label="Aroon Up > 70%"
                                            passed={selectedStock.aroon_up_gt_70}
                                            value={`Aroon Up: ${formatValue(selectedStock.aroon_up, 1)}%`}
                                            description="Aroon Up must be above 70%"
                                            icon={TrendingUp}
                                        />
                                        <ConditionPill
                                            label="Aroon Down < 30%"
                                            passed={selectedStock.aroon_down_lt_30}
                                            value={`Aroon Down: ${formatValue(selectedStock.aroon_down, 1)}%`}
                                            description="Aroon Down must be below 30%"
                                            icon={TrendingDown}
                                        />
                                    </div>

                                    {/* Weekly Aroon Indicators */}
                                    <div className="mt-4 grid grid-cols-2 gap-4">
                                        <IndicatorCard
                                            title="Aroon Up Weekly"
                                            value={`${formatValue(selectedStock.aroon_up_w, 1)}%`}
                                            description="Weekly uptrend strength"
                                            color={(selectedStock.aroon_up_w ?? 0) > 70 ? 'bg-green-500' : 'bg-amber-500'}
                                            icon={TrendingUp}
                                        />
                                        <IndicatorCard
                                            title="Aroon Down Weekly"
                                            value={`${formatValue(selectedStock.aroon_down_w, 1)}%`}
                                            description="Weekly downtrend strength"
                                            color={(selectedStock.aroon_down_w ?? 100) < 30 ? 'bg-green-500' : 'bg-red-500'}
                                            icon={TrendingDown}
                                        />
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Layers size={18} className="text-gray-600" />
                                            <h4 className="font-medium text-gray-900">Trend Summary</h4>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-3 bg-white rounded-lg border">
                                                <div className="text-sm text-gray-600 mb-2">Overall Trend Strength</div>
                                                <div className={`text-lg font-bold ${selectedStock.trend_signal
                                                    ? 'text-green-600'
                                                    : 'text-red-600'
                                                    }`}>
                                                    {selectedStock.trend_signal ? "Strong Bullish" : "Bearish/Weak"}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Based on {selectedStock.trend_signal ? 'all' : 'some'} conditions
                                                </div>
                                            </div>
                                            <div className="p-3 bg-white rounded-lg border">
                                                <div className="text-sm text-gray-600 mb-2">Conditions Met</div>
                                                <div className="text-lg font-bold text-gray-900">
                                                    {[
                                                        selectedStock.price_gt_sma18,
                                                        selectedStock.price_gt_sma9_weekly,
                                                        selectedStock.sma_trend_daily,
                                                        selectedStock.sma_trend_weekly,
                                                        selectedStock.cci_gt_100,
                                                        selectedStock.cci_ema20_gt_0_daily,
                                                        selectedStock.cci_ema20_gt_0_weekly,
                                                        selectedStock.aroon_up_gt_70,
                                                        selectedStock.aroon_down_lt_30
                                                    ].filter(Boolean).length} / 9
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Trend conditions satisfied
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'stamp' && (
                                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-amber-100 rounded-lg">
                                            <Shield size={24} className="text-amber-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">STAMP Momentum System</h3>
                                            <p className="text-gray-600 text-sm">Strategic Trading and Momentum Pattern</p>
                                        </div>
                                        <div className="ml-auto">
                                            <div className={`px-4 py-2 rounded-full font-medium ${selectedStock.stamp
                                                ? 'bg-green-100 text-green-800 border border-green-200'
                                                : 'bg-red-100 text-red-800 border border-red-200'
                                                }`}>
                                                {selectedStock.stamp ? 'Active Signal' : 'No Signal'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <div className="text-sm text-gray-600 mb-4">
                                            The STAMP system combines multiple RSI-based indicators to detect strong momentum patterns
                                            suitable for strategic trading entries.
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="text-center p-4 bg-gradient-to-b from-blue-50 to-white rounded-xl border border-blue-200">
                                                <div className="text-xs text-gray-600 mb-2 font-medium">S9(RSI)</div>
                                                <div className="text-2xl font-bold text-gray-900 mb-1">
                                                    {formatValue(selectedStock.sma9_rsi, 1)}
                                                </div>
                                                <div className="text-xs text-gray-500">9-period SMA of RSI</div>
                                                <div className={`text-xs mt-1 ${selectedStock.stamp_daily ? 'text-green-600' : 'text-red-600'}`}>
                                                    {selectedStock.stamp_daily ? '✓ Daily' : '✗ Daily'}
                                                </div>
                                            </div>
                                            <div className="text-center p-4 bg-gradient-to-b from-purple-50 to-white rounded-xl border border-purple-200">
                                                <div className="text-xs text-gray-600 mb-2 font-medium">E45(CFG)</div>
                                                <div className="text-2xl font-bold text-gray-900 mb-1">
                                                    {formatValue(selectedStock.e45_cfg, 1)}
                                                </div>
                                                <div className="text-xs text-gray-500">45-period EMA (CFG)</div>
                                                <div className={`text-xs mt-1 ${selectedStock.e45_cfg && selectedStock.e45_cfg > 50 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {selectedStock.e45_cfg && selectedStock.e45_cfg > 50 ? '> 50 ✓' : '< 50 ✗'}
                                                </div>
                                            </div>
                                            <div className="text-center p-4 bg-gradient-to-b from-green-50 to-white rounded-xl border border-green-200">
                                                <div className="text-xs text-gray-600 mb-2 font-medium">E45(RSI)</div>
                                                <div className="text-2xl font-bold text-gray-900 mb-1">
                                                    {formatValue(selectedStock.ema45_rsi, 1)}
                                                </div>
                                                <div className="text-xs text-gray-500">45-period EMA of RSI</div>
                                                <div className={`text-xs mt-1 ${selectedStock.ema45_rsi && selectedStock.ema45_rsi > 50 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {selectedStock.ema45_rsi && selectedStock.ema45_rsi > 50 ? '> 50 ✓' : '< 50 ✗'}
                                                </div>
                                            </div>
                                            <div className="text-center p-4 bg-gradient-to-b from-amber-50 to-white rounded-xl border border-amber-200">
                                                <div className="text-xs text-gray-600 mb-2 font-medium">E20(SMA3)</div>
                                                <div className="text-2xl font-bold text-gray-900 mb-1">
                                                    {formatValue(selectedStock.e20_sma3_rsi3, 1)}
                                                </div>
                                                <div className="text-xs text-gray-500">20-period EMA of 3 SMA</div>
                                                <div className={`text-xs mt-1 ${selectedStock.e20_sma3_rsi3 && selectedStock.e20_sma3_rsi3 > 50 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {selectedStock.e20_sma3_rsi3 && selectedStock.e20_sma3_rsi3 > 50 ? '> 50 ✓' : '< 50 ✗'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        {/* Daily STAMP Conditions */}
                                        <div className="bg-gradient-to-b from-blue-50 to-white rounded-xl p-4 border border-blue-200">
                                            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                                <div className="w-2 h-4 bg-blue-600 rounded-full"></div>
                                                Daily STAMP Conditions
                                            </h4>
                                            <div className="space-y-2">
                                                <ConditionPill
                                                    label="SMA9 > WMA45 (Close)"
                                                    passed={selectedStock.stamp_daily}
                                                    description="9-day SMA above 45-day WMA"
                                                />
                                                <ConditionPill
                                                    label="SMA9 RSI > WMA45 RSI"
                                                    passed={selectedStock.sma9rsi_gt_wma45rsi_d}
                                                    description="SMA9 RSI above WMA45 RSI"
                                                />
                                                <ConditionPill
                                                    label="EMA45 RSI > 50"
                                                    passed={selectedStock.ema45_rsi && selectedStock.ema45_rsi > 50}
                                                    value={`EMA45 RSI: ${formatValue(selectedStock.ema45_rsi, 1)}`}
                                                    description="45-day EMA of RSI above 50"
                                                />
                                                <ConditionPill
                                                    label="E45 CFG > 50"
                                                    passed={selectedStock.e45_cfg && selectedStock.e45_cfg > 50}
                                                    value={`E45 CFG: ${formatValue(selectedStock.e45_cfg, 1)}`}
                                                    description="45-day EMA of CFG above 50"
                                                />
                                                <ConditionPill
                                                    label="E20 SMA3 > 50"
                                                    passed={selectedStock.e20_sma3_rsi3 && selectedStock.e20_sma3_rsi3 > 50}
                                                    value={`E20 SMA3: ${formatValue(selectedStock.e20_sma3_rsi3, 1)}`}
                                                    description="20-day EMA of 3-day SMA RSI above 50"
                                                />
                                            </div>
                                        </div>

                                        {/* Weekly STAMP Conditions */}
                                        <div className="bg-gradient-to-b from-purple-50 to-white rounded-xl p-4 border border-purple-200">
                                            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                                <div className="w-2 h-4 bg-purple-600 rounded-full"></div>
                                                Weekly STAMP Conditions
                                            </h4>
                                            <div className="space-y-2">
                                                <ConditionPill
                                                    label="SMA9 > WMA45 (Close)"
                                                    passed={selectedStock.stamp_weekly}
                                                    description="Weekly SMA9 above WMA45"
                                                />
                                                <ConditionPill
                                                    label="SMA9 RSI > WMA45 RSI"
                                                    passed={selectedStock.sma9rsi_gt_wma45rsi_w}
                                                    description="Weekly SMA9 RSI above WMA45 RSI"
                                                />
                                                <ConditionPill
                                                    label="EMA45 RSI > 50"
                                                    passed={selectedStock.ema45_rsi_w ? selectedStock.ema45_rsi_w > 50 : false}
                                                    value={selectedStock.ema45_rsi_w ? formatValue(selectedStock.ema45_rsi_w) : '-'}
                                                    description="Weekly EMA45 RSI above 50"
                                                />
                                                <ConditionPill
                                                    label="E45 CFG > 50"
                                                    passed={selectedStock.cfg_ema45_w ? selectedStock.cfg_ema45_w > 50 : false}
                                                    value={selectedStock.cfg_ema45_w ? formatValue(selectedStock.cfg_ema45_w) : '-'}
                                                    description="Weekly E45 CFG above 50"
                                                />
                                                <ConditionPill
                                                    label="E20 SMA3 > 50"
                                                    passed={selectedStock.ema20_sma3_rsi3_w ? selectedStock.ema20_sma3_rsi3_w > 50 : false}
                                                    value={selectedStock.ema20_sma3_rsi3_w ? formatValue(selectedStock.ema20_sma3_rsi3_w) : '-'}
                                                    description="Weekly E20 SMA3(RSI3) above 50"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Weekly STAMP Components Details */}
                                    <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                                        <h5 className="font-bold text-amber-900 mb-3">Weekly STAMP Components Breakdown</h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="p-3 bg-white rounded-lg border border-amber-100">
                                                <div className="text-xs font-medium text-amber-700 mb-1">EMA20(SMA3 RSI3) Weekly</div>
                                                <div className="text-lg font-bold text-gray-900">{formatValue(selectedStock.ema20_sma3_rsi3_w, 1)}</div>
                                                <div className="text-xs text-gray-600 mt-1">20-period EMA of 3-week SMA RSI3</div>
                                                <div className={`text-xs mt-2 font-medium ${selectedStock.ema20_sma3_rsi3_w && selectedStock.ema20_sma3_rsi3_w > 50 ? 'text-green-600' : 'text-red-600'}`}>
                                                    Status: {selectedStock.ema20_sma3_rsi3_w && selectedStock.ema20_sma3_rsi3_w > 50 ? '> 50 ✓' : '< 50 ✗'}
                                                </div>
                                            </div>
                                            <div className="p-3 bg-white rounded-lg border border-amber-100">
                                                <div className="text-xs font-medium text-amber-700 mb-1">Daily E20(SMA3) Comparison</div>
                                                <div className="text-sm text-gray-600 mt-2">
                                                    <div>Daily: <span className="font-bold">{formatValue(selectedStock.e20_sma3_rsi3, 1)}</span></div>
                                                    <div className="mt-1">Weekly: <span className="font-bold">{formatValue(selectedStock.ema20_sma3_rsi3_w, 1)}</span></div>
                                                    <div className={`mt-2 text-xs ${(selectedStock.ema20_sma3_rsi3_w || 0) > (selectedStock.e20_sma3_rsi3 || 0) ? 'text-green-600' : 'text-red-600'}`}>
                                                        {(selectedStock.ema20_sma3_rsi3_w || 0) > (selectedStock.e20_sma3_rsi3 || 0) ? '✓ Weekly > Daily' : '✗ Weekly ≤ Daily'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-amber-50 rounded-lg p-4 border border-amber-200 mt-4">
                                        <div className="flex items-start gap-3">
                                            <Info size={18} className="text-amber-600 mt-0.5" />
                                            <div>
                                                <h4 className="font-medium text-gray-900 mb-1">About STAMP Signals</h4>
                                                <p className="text-sm text-gray-600">
                                                    A STAMP signal is generated when multiple RSI-based indicators align, indicating
                                                    strong momentum. This pattern often precedes significant price movements and is
                                                    used by traders for strategic entry points.
                                                </p>
                                                <p className="text-sm text-gray-500 mt-2">
                                                    <strong>Formula:</strong> A = RSI(14) - RSI(14)[9] + SMA(RSI(3), 3)
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'theNumber' && (
                                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-red-100 rounded-lg">
                                            <TargetIcon size={24} className="text-red-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">The Number Analysis</h3>
                                            <p className="text-gray-600 text-sm">Volatility and Price Level Indicator</p>
                                        </div>
                                        <div className="ml-auto">
                                            <div className={`px-4 py-2 rounded-full font-medium ${selectedStock.sma9_gt_tn_daily && selectedStock.sma9_gt_tn_weekly
                                                ? 'bg-green-100 text-green-800 border border-green-200'
                                                : 'bg-red-100 text-red-800 border border-red-200'
                                                }`}>
                                                {selectedStock.sma9_gt_tn_daily && selectedStock.sma9_gt_tn_weekly ? 'Above The Number' : 'Below The Number'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <div className="text-sm text-gray-600 mb-4">
                                            <strong>The Number</strong> is a composite indicator calculated as:
                                            THE.NUMBER = (SMA(High,13) + SMA(Low,13) + SMA(High,65) + SMA(Low,65)) / 4
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="text-center p-4 bg-gradient-to-b from-red-50 to-white rounded-xl border border-red-200">
                                                <div className="text-xs text-gray-600 mb-2 font-medium">THE.NUMBER</div>
                                                <div className="text-2xl font-bold text-gray-900 mb-1">
                                                    SAR {formatValue(selectedStock.the_number)}
                                                </div>
                                                <div className="text-xs text-gray-500">Composite volatility level</div>
                                                <div className="text-xs text-red-600 mt-1">
                                                    Current Price vs The Number
                                                </div>
                                            </div>
                                            <div className="text-center p-4 bg-gradient-to-b from-green-50 to-white rounded-xl border border-green-200">
                                                <div className="text-xs text-gray-600 mb-2 font-medium">SMA9 Close</div>
                                                <div className="text-2xl font-bold text-gray-900 mb-1">
                                                    SAR {formatValue(selectedStock.sma9_close)}
                                                </div>
                                                <div className="text-xs text-gray-500">9-day Simple Moving Average</div>
                                                <div className={`text-xs mt-1 ${selectedStock.sma9_gt_tn_daily ? 'text-green-600' : 'text-red-600'}`}>
                                                    {selectedStock.sma9_gt_tn_daily ? 'Above The Number ✓' : 'Below The Number ✗'}
                                                </div>
                                            </div>
                                            <div className="text-center p-4 bg-gradient-to-b from-blue-50 to-white rounded-xl border border-blue-200">
                                                <div className="text-xs text-gray-600 mb-2 font-medium">Current Price</div>
                                                <div className="text-2xl font-bold text-gray-900 mb-1">
                                                    SAR {formatValue(selectedStock.close)}
                                                </div>
                                                <div className="text-xs text-gray-500">Latest closing price</div>
                                                <div className="text-xs text-blue-600 mt-1">
                                                    Difference: {formatValue(selectedStock.close - (selectedStock.the_number || 0))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        {/* Daily Analysis */}
                                        <div className="bg-gradient-to-b from-gray-50 to-white rounded-xl p-4 border border-gray-200">
                                            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                                <Hash size={16} className="text-gray-600" />
                                                Daily Analysis
                                            </h4>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">The Number Value:</span>
                                                    <span className="font-medium text-gray-900">SAR {formatValue(selectedStock.the_number)}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">SMA9 Close:</span>
                                                    <span className={`font-medium ${selectedStock.sma9_gt_tn_daily ? 'text-green-600' : 'text-red-600'}`}>
                                                        SAR {formatValue(selectedStock.sma9_close)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">Condition:</span>
                                                    <span className={`font-medium ${selectedStock.sma9_gt_tn_daily ? 'text-green-600' : 'text-red-600'}`}>
                                                        SMA9 {selectedStock.sma9_gt_tn_daily ? '>' : '<'} The Number
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">Difference:</span>
                                                    <span className={`font-medium ${selectedStock.sma9_gt_tn_daily ? 'text-green-600' : 'text-red-600'}`}>
                                                        {formatValue((selectedStock.sma9_close || 0) - (selectedStock.the_number || 0))}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Weekly Analysis */}
                                        <div className="bg-gradient-to-b from-gray-50 to-white rounded-xl p-4 border border-gray-200">
                                            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                                <Calendar size={16} className="text-gray-600" />
                                                Weekly Analysis
                                            </h4>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">Weekly Condition:</span>
                                                    <span className={`font-medium ${selectedStock.sma9_gt_tn_weekly ? 'text-green-600' : 'text-red-600'}`}>
                                                        {selectedStock.sma9_gt_tn_weekly ? 'Passing' : 'Failing'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">Weekly SMA9  The Number:</span>
                                                    <span className={`font-medium ${selectedStock.sma9_gt_tn_weekly ? 'text-green-600' : 'text-red-600'}`}>
                                                        {selectedStock.sma9_gt_tn_weekly ? '✓' : '✗'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">Both Timeframes:</span>
                                                    <span className={`font-medium ${selectedStock.sma9_gt_tn_daily && selectedStock.sma9_gt_tn_weekly ? 'text-green-600' : 'text-red-600'}`}>
                                                        {selectedStock.sma9_gt_tn_daily && selectedStock.sma9_gt_tn_weekly ? 'Both ✓' : 'One or Both ✗'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">Signal Strength:</span>
                                                    <span className={`font-medium ${selectedStock.sma9_gt_tn_daily && selectedStock.sma9_gt_tn_weekly ? 'text-green-600' : selectedStock.sma9_gt_tn_daily || selectedStock.sma9_gt_tn_weekly ? 'text-amber-600' : 'text-red-600'}`}>
                                                        {selectedStock.sma9_gt_tn_daily && selectedStock.sma9_gt_tn_weekly ? 'Strong' : selectedStock.sma9_gt_tn_daily || selectedStock.sma9_gt_tn_weekly ? 'Moderate' : 'Weak'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* The Number Bands */}
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                                            <div className="text-sm font-medium text-blue-800 mb-2">Upper Band (HL)</div>
                                            <div className="text-2xl font-bold text-gray-900">SAR {formatValue(selectedStock.the_number_hl)}</div>
                                            <div className="text-xs text-gray-600 mt-1">(SMA13(High) + SMA65(High)) / 2</div>
                                            <div className="text-xs text-blue-600 mt-2">
                                                {selectedStock.close && selectedStock.the_number_hl ? (
                                                    selectedStock.close > selectedStock.the_number_hl ? '✓ Price above' : '✗ Price below'
                                                ) : '-'}
                                            </div>
                                        </div>
                                        <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                                            <div className="text-sm font-medium text-purple-800 mb-2">Lower Band (LL)</div>
                                            <div className="text-2xl font-bold text-gray-900">SAR {formatValue(selectedStock.the_number_ll)}</div>
                                            <div className="text-xs text-gray-600 mt-1">(SMA13(Low) + SMA65(Low)) / 2</div>
                                            <div className="text-xs text-purple-600 mt-2">
                                                {selectedStock.close && selectedStock.the_number_ll ? (
                                                    selectedStock.close > selectedStock.the_number_ll ? '✓ Price above' : '✗ Price below'
                                                ) : '-'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                                        <div className="flex items-start gap-3">
                                            <Info size={18} className="text-red-600 mt-0.5" />
                                            <div>
                                                <h4 className="font-medium text-gray-900 mb-1">About The Number</h4>
                                                <p className="text-sm text-gray-600">
                                                    The Number is a volatility-based indicator that combines multiple moving averages
                                                    to identify key price levels. When SMA9 is above The Number, it suggests the stock
                                                    is in a strong uptrend. The indicator works best when both daily and weekly
                                                    timeframes show SMA9 above The Number.
                                                </p>
                                                <p className="text-sm text-gray-500 mt-2">
                                                    <strong>Formula:</strong> (SMA(High,13) + SMA(Low,13) + SMA(High,65) + SMA(Low,65)) / 4
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'cfg' && (
                                <div className="space-y-6">
                                    <CFGFormulaDisplay stock={selectedStock} />

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <IndicatorCard
                                            title="CFG Daily"
                                            value={formatValue(selectedStock.cfg_daily, 1)}
                                            description="Custom Formula Generator"
                                            color="bg-indigo-500"
                                            icon={Calculator}
                                        />
                                        <IndicatorCard
                                            title="CFG EMA45"
                                            value={formatValue(selectedStock.cfg_ema45, 1)}
                                            description="45-day EMA of CFG"
                                            color={selectedStock.cfg_ema45_gt_50 ? 'bg-green-500' : 'bg-red-500'}
                                            icon={TrendingUpIcon}
                                        />
                                        <IndicatorCard
                                            title="SMA(RSI3, 3)"
                                            value={formatValue(selectedStock.sma3_rsi3, 1)}
                                            description="3-day SMA of RSI(3)"
                                            color="bg-purple-500"
                                            icon={Sigma}
                                        />
                                    </div>

                                    {/* Weekly CFG Section */}
                                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                                        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <Calculator size={18} className="text-purple-600" />
                                            Weekly CFG Analysis
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <IndicatorCard
                                                title="CFG Weekly"
                                                value={formatValue(selectedStock.cfg_w, 1)}
                                                description="Weekly CFG Value"
                                                color={selectedStock.cfg_gt_50_w ? 'bg-green-500' : 'bg-red-500'}
                                                icon={Calculator}
                                            />
                                            <IndicatorCard
                                                title="CFG EMA45 Weekly"
                                                value={formatValue(selectedStock.cfg_ema45_w, 1)}
                                                description="45-week EMA of CFG"
                                                color={selectedStock.cfg_ema45_gt_50_w ? 'bg-green-500' : 'bg-red-500'}
                                                icon={TrendingUpIcon}
                                            />
                                            <IndicatorCard
                                                title="RSI(14) Weekly"
                                                value={formatValue(selectedStock.rsi_w, 1)}
                                                description="Weekly RSI 14-period"
                                                color="bg-blue-500"
                                                icon={Sigma}
                                            />
                                        </div>
                                        {selectedStock.rsi_w_9_weeks_ago !== null && (
                                            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                                <div className="text-sm text-gray-600">
                                                    <span className="font-medium">RSI(14) from 9 weeks ago:</span> {formatValue(selectedStock.rsi_w_9_weeks_ago, 1)}
                                                </div>
                                                {selectedStock.rsi_14_w_shifted !== null && (
                                                    <div className="text-sm text-gray-600 mt-2">
                                                        <span className="font-medium">ta.rsi(close[9], 14) Weekly:</span> {formatValue(selectedStock.rsi_14_w_shifted, 1)}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="bg-white rounded-xl p-4 border border-gray-200 mt-4">
                                        <h4 className="font-medium text-gray-900 mb-3">CFG Components Details</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                                                <span className="text-xs text-gray-600">ta.rsi(close[9], 14):</span>
                                                <div className="font-bold text-lg text-gray-900 mt-1">{formatValue(selectedStock.rsi_14_shifted, 1)}</div>
                                                <span className="text-xs text-gray-500">Daily shifted</span>
                                            </div>
                                            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                                <span className="text-xs text-gray-600">Weekly ta.rsi(close[9], 14):</span>
                                                <div className="font-bold text-lg text-gray-900 mt-1">{formatValue(selectedStock.rsi_14_w_shifted, 1)}</div>
                                                <span className="text-xs text-gray-500">Weekly shifted</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                                        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <Info size={18} className="text-blue-600" />
                                            Interpretation
                                        </h4>
                                        <p className="text-sm text-gray-600 leading-relaxed mb-3">
                                            <strong>CFG &gt; 50</strong> indicates bullish momentum.
                                            <br />
                                            <strong>CFG &lt; 50</strong> indicates bearish momentum.
                                        </p>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            Confirm signals when CFG crosses its EMA45 line.
                                            Divergences between Price and CFG can signal reversals.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full pt-20 px-4">
                            <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6">
                                <Cpu size={48} className="text-gray-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">Welcome to Technical Screener</h3>
                            <p className="text-gray-600 max-w-md text-center mb-8">
                                Select a stock from the sidebar to begin detailed technical analysis
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl">
                                <div className="p-4 bg-white rounded-lg border border-gray-200 text-center">
                                    <BarChart3 size={24} className="mx-auto text-blue-600 mb-2" />
                                    <div className="font-medium text-gray-900">RSI Analysis</div>
                                    <div className="text-sm text-gray-600">Momentum indicators</div>
                                </div>
                                <div className="p-4 bg-white rounded-lg border border-gray-200 text-center">
                                    <TrendingUpIcon size={24} className="mx-auto text-green-600 mb-2" />
                                    <div className="font-medium text-gray-900">Trend Signals</div>
                                    <div className="text-sm text-gray-600">Direction analysis</div>
                                </div>
                                <div className="p-4 bg-white rounded-lg border border-gray-200 text-center">
                                    <Shield size={24} className="mx-auto text-amber-600 mb-2" />
                                    <div className="font-medium text-gray-900">STAMP System</div>
                                    <div className="text-sm text-gray-600">Momentum patterns</div>
                                </div>
                                <div className="p-4 bg-white rounded-lg border border-gray-200 text-center">
                                    <TargetIcon size={24} className="mx-auto text-red-600 mb-2" />
                                    <div className="font-medium text-gray-900">The Number</div>
                                    <div className="text-sm text-gray-600">Volatility indicator</div>
                                </div>
                            </div>
                        </div>
                    )
                    }
                </div >
            </div >
        </div >
    );
}