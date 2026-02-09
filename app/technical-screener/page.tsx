'use client';

import { useEffect, useState } from 'react';
import {
    Activity,
    TrendingUp,
    TrendingDown,
    Search,
    Filter,
    CheckCircle2,
    XCircle,
    Loader2,
    BarChart3,
    Gauge,
    Target,
    Zap,
    RefreshCw,
    ChevronRight,
    Star,
    LineChart,
    PieChart,
    AlertCircle,
    Shield,
    Rocket,
    TrendingUp as TrendingUpIcon,
    Bell,
    Settings,
    Download,
    Share2,
    Bookmark
} from 'lucide-react';

interface ScreenerStock {
    symbol: string;
    company_name?: string;
    date: string;
    close: number;
    rsi: number | null;
    sma9_rsi: number | null;
    wma45_rsi: number | null;
    ema45_rsi: number | null;
    sma9_close: number | null;
    the_number: number | null;
    stamp: boolean;
    stamp_daily: boolean;
    stamp_weekly: boolean;
    rsi_55_70: boolean;
    sma9_gt_tn_daily: boolean;
    sma9_gt_tn_weekly: boolean;
    cci: number | null;
    aroon_up: number | null;
    aroon_down: number | null;
    trend_signal: boolean;
    final_signal: boolean;
    score: number;
}

interface StockIndicators {
    symbol: string;
    date: string;
    close: number;
    indicators: {
        rsi: {
            rsi: number | null;
            sma9: number | null;
            wma45: number | null;
        };
        the_number: {
            sma9: number | null;
            value: number | null;
            upper_band: number | null;
            lower_band: number | null;
        };
        stamp: {
            s9_rsi: number | null;
            e45_cfg: number | null;
            e45_rsi: number | null;
            e20_sma3_rsi3: number | null;
        };
        trend_screener: {
            signal: boolean;
            cci: number | null;
            cci_ema20: number | null;
            aroon_up: number | null;
            aroon_down: number | null;
            conditions: Record<string, boolean>;
        };
        rsi_screener: {
            final_signal: boolean;
            score: number;
            total_conditions: number;
            stamp: boolean;
            stamp_daily: boolean;
            stamp_weekly: boolean;
            daily: {
                rsi: number | null;
                sma9_rsi: number | null;
                wma45_rsi: number | null;
                ema45_rsi: number | null;
                sma9_close: number | null;
                the_number: number | null;
                conditions: Record<string, boolean>;
            };
            weekly: {
                rsi: number | null;
                sma9_rsi: number | null;
                wma45_rsi: number | null;
                ema45_rsi: number | null;
                sma9_close: number | null;
                the_number: number | null;
                conditions: Record<string, boolean>;
            };
        };
    };
}

export default function TechnicalScreenerPage() {
    const [stocks, setStocks] = useState<ScreenerStock[]>([]);
    const [filteredStocks, setFilteredStocks] = useState<ScreenerStock[]>([]);
    const [selectedStock, setSelectedStock] = useState<ScreenerStock | null>(null);
    const [stockDetails, setStockDetails] = useState<StockIndicators | null>(null);
    const [loading, setLoading] = useState(true);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [minScore, setMinScore] = useState<number>(0);
    const [passingOnly, setPassingOnly] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'rsi' | 'trend' | 'stamp'>('overview');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    useEffect(() => {
        fetchScreenerData();
    }, [minScore, passingOnly]);

    useEffect(() => {
        filterStocks();
    }, [stocks, searchQuery]);

    useEffect(() => {
        if (selectedStock) {
            fetchStockDetails(selectedStock.symbol);
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
            params.append('limit', '200');

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

    const fetchStockDetails = async (symbol: string) => {
        setDetailsLoading(true);
        try {
            const res = await fetch(
                `${API_URL}/api/technical-screener/stock/${symbol}`,
                { headers: getAuthHeaders() }
            );

            if (!res.ok) throw new Error('Failed to fetch stock details');

            const data = await res.json();
            setStockDetails(data);
        } catch (err) {
            console.error('Error fetching stock details:', err);
            setStockDetails(null);
        } finally {
            setDetailsLoading(false);
        }
    };

    const filterStocks = () => {
        let result = stocks;
        if (searchQuery) {
            const q = searchQuery.toUpperCase();
            result = result.filter(s =>
                s.symbol.includes(q) ||
                s.company_name?.toUpperCase().includes(q)
            );
        }
        setFilteredStocks(result);
    };

    const getScoreColor = (score: number) => {
        if (score >= 13) return '#10B981';
        if (score >= 10) return '#34D399';
        if (score >= 7) return '#F59E0B';
        if (score >= 4) return '#F97316';
        return '#EF4444';
    };

    const getScoreGradient = (score: number) => {
        if (score >= 13) return 'linear-gradient(135deg, #10B981 0%, #059669 100%)';
        if (score >= 10) return 'linear-gradient(135deg, #34D399 0%, #10B981 100%)';
        if (score >= 7) return 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)';
        if (score >= 4) return 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)';
        return 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)';
    };

    const formatValue = (val: number | null | undefined, decimals: number = 2) => {
        if (val === null || val === undefined) return '-';
        return val.toFixed(decimals);
    };

    const getSignalIcon = (signal: boolean) => {
        return signal ? (
            <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-green-500 text-sm font-semibold">Passing</span>
            </div>
        ) : (
            <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="text-red-500 text-sm font-semibold">Failing</span>
            </div>
        );
    };

    const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
                    {change && (
                        <div className={`flex items-center gap-1 mt-2 text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            <span>{Math.abs(change)}%</span>
                        </div>
                    )}
                </div>
                <div className={`p-3 rounded-xl ${color}`}>
                    <Icon size={24} className="text-white" />
                </div>
            </div>
        </div>
    );

    const GaugeIndicator = ({ label, value, min, max, optimalRange, unit = '' }: any) => {
        const percentage = ((value - min) / (max - min)) * 100;
        const isOptimal = value >= optimalRange[0] && value <= optimalRange[1];

        return (
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                    <span className={`text-lg font-bold ${isOptimal ? 'text-green-600' : 'text-red-600'}`}>
                        {formatValue(value)}{unit}
                    </span>
                </div>
                <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className={`absolute h-full ${isOptimal ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                    ></div>
                    <div
                        className="absolute h-full w-0.5 bg-gray-400"
                        style={{ left: `${((optimalRange[0] - min) / (max - min)) * 100}%` }}
                    ></div>
                    <div
                        className="absolute h-full w-0.5 bg-gray-400"
                        style={{ left: `${((optimalRange[1] - min) / (max - min)) * 100}%` }}
                    ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{min}</span>
                    <span className="text-gray-400">Optimal: {optimalRange[0]}-{optimalRange[1]}</span>
                    <span>{max}</span>
                </div>
            </div>
        );
    };

    const ConditionPill = ({ label, passed, value }: any) => (
        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full ${passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            {passed ? (
                <CheckCircle2 size={16} className="text-green-500" />
            ) : (
                <XCircle size={16} className="text-red-500" />
            )}
            <span className={`text-sm font-medium ${passed ? 'text-green-700' : 'text-red-700'}`}>{label}</span>
            {value && (
                <span className={`text-xs ${passed ? 'text-green-600' : 'text-red-600'}`}>
                    {value}
                </span>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-sans">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
                                <Activity size={28} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Technical Screener</h1>
                                <p className="text-gray-600 text-sm">Real-time RSI & Trend Analysis</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="p-2 hover:bg-gray-100 rounded-lg">
                                <Bell size={20} className="text-gray-600" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded-lg">
                                <Settings size={20} className="text-gray-600" />
                            </button>
                            <div className="h-8 w-px bg-gray-300"></div>
                            <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity">
                                New Scan
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar */}
                <div className="w-80 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)]">
                    <div className="p-6">
                        <div className="relative mb-6">
                            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search stocks..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                            />
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Score Filter</h3>
                                <div className="flex gap-2">
                                    {['All', '5+', '10+', '13+'].map((label, idx) => {
                                        const score = idx === 0 ? 0 : idx === 1 ? 5 : idx === 2 ? 10 : 13;
                                        return (
                                            <button
                                                key={label}
                                                onClick={() => setMinScore(score)}
                                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${minScore === score
                                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Quick Filters</h3>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => setPassingOnly(!passingOnly)}
                                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${passingOnly
                                            ? 'bg-green-50 border border-green-200'
                                            : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <Zap size={18} className={passingOnly ? 'text-green-600' : 'text-gray-500'} />
                                            <span className={passingOnly ? 'text-green-700 font-medium' : 'text-gray-700'}>
                                                Passing Only
                                            </span>
                                        </div>
                                        <div className={`w-8 h-4 rounded-full transition-all ${passingOnly ? 'bg-green-500 justify-end' : 'bg-gray-300 justify-start'} flex items-center px-1`}>
                                            <div className="w-3 h-3 bg-white rounded-full"></div>
                                        </div>
                                    </button>
                                    <button className="w-full flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-all">
                                        <div className="flex items-center gap-2">
                                            <Star size={18} className="text-yellow-500" />
                                            <span className="text-gray-700">Top Performers</span>
                                        </div>
                                        <ChevronRight size={18} className="text-gray-400" />
                                    </button>
                                    <button className="w-full flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-all">
                                        <div className="flex items-center gap-2">
                                            <Rocket size={18} className="text-purple-600" />
                                            <span className="text-gray-700">Momentum Plays</span>
                                        </div>
                                        <ChevronRight size={18} className="text-gray-400" />
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-200">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-sm font-semibold text-gray-700">View Mode</h3>
                                    <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                                        >
                                            <div className="grid grid-cols-2 gap-1 w-4 h-4">
                                                <div className="bg-current rounded-sm"></div>
                                                <div className="bg-current rounded-sm"></div>
                                                <div className="bg-current rounded-sm"></div>
                                                <div className="bg-current rounded-sm"></div>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                                        >
                                            <div className="space-y-1 w-4">
                                                <div className="h-0.5 bg-current rounded-full"></div>
                                                <div className="h-0.5 bg-current rounded-full"></div>
                                                <div className="h-0.5 bg-current rounded-full"></div>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stock List */}
                    <div className="px-4">
                        <div className="flex justify-between items-center mb-3 px-2">
                            <span className="text-sm text-gray-600">{filteredStocks.length} stocks</span>
                            <button
                                onClick={fetchScreenerData}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Refresh"
                            >
                                <RefreshCw size={16} className={`text-gray-600 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>

                        <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
                            {loading ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : filteredStocks.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">No stocks found</p>
                                </div>
                            ) : (
                                filteredStocks.map((stock) => (
                                    <div
                                        key={stock.symbol}
                                        onClick={() => setSelectedStock(stock)}
                                        className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${selectedStock?.symbol === stock.symbol
                                            ? 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 shadow-sm scale-[1.02]'
                                            : 'bg-white border border-gray-200 hover:shadow-md hover:border-blue-200'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <div className="font-bold text-gray-900">{stock.symbol}</div>
                                                <div className="text-sm text-gray-600 truncate max-w-[180px]">
                                                    {stock.company_name}
                                                </div>
                                            </div>
                                            <div
                                                className="px-3 py-1.5 rounded-full text-white text-sm font-bold shadow-sm"
                                                style={{
                                                    background: getScoreGradient(stock.score)
                                                }}
                                            >
                                                {stock.score}
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <div className="text-lg font-bold text-gray-900">
                                                SAR {formatValue(stock.close)}
                                            </div>
                                            {getSignalIcon(stock.final_signal)}
                                        </div>

                                        <div className="mt-3 flex gap-1">
                                            <div className={`w-6 h-1 rounded-full ${stock.stamp ? 'bg-green-500' : 'bg-red-300'}`}></div>
                                            <div className={`w-6 h-1 rounded-full ${stock.trend_signal ? 'bg-green-500' : 'bg-red-300'}`}></div>
                                            <div className={`w-6 h-1 rounded-full ${stock.rsi_55_70 ? 'bg-green-500' : 'bg-red-300'}`}></div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-8">
                    {selectedStock && stockDetails ? (
                        <>
                            {/* Stock Header */}
                            <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg border border-gray-200">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-4 mb-3">
                                            <div
                                                className="px-6 py-4 rounded-xl text-white text-2xl font-black shadow-lg"
                                                style={{
                                                    background: getScoreGradient(selectedStock.score)
                                                }}
                                            >
                                                {selectedStock.score}/15
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-gray-900">
                                                    {selectedStock.company_name || selectedStock.symbol}
                                                </h2>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-gray-700 font-medium">{selectedStock.symbol}</span>
                                                    <span className="text-gray-400">•</span>
                                                    <span className="text-xl font-bold text-gray-900">
                                                        SAR {formatValue(selectedStock.close)}
                                                    </span>
                                                    <span className="text-gray-400">•</span>
                                                    <span className="text-sm text-gray-600">
                                                        {selectedStock.date}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className={`px-3 py-1.5 rounded-full flex items-center gap-2 ${selectedStock.final_signal
                                                ? 'bg-green-100 text-green-800 border border-green-200'
                                                : 'bg-red-100 text-red-800 border border-red-200'
                                                }`}>
                                                {selectedStock.final_signal ? (
                                                    <>
                                                        <CheckCircle2 size={14} />
                                                        <span className="font-semibold">All Conditions Passed</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <AlertCircle size={14} />
                                                        <span className="font-semibold">{15 - selectedStock.score} Conditions Failed</span>
                                                    </>
                                                )}
                                            </div>
                                            <button className="p-2 hover:bg-gray-100 rounded-lg">
                                                <Bookmark size={18} className="text-gray-500" />
                                            </button>
                                            <button className="p-2 hover:bg-gray-100 rounded-lg">
                                                <Share2 size={18} className="text-gray-500" />
                                            </button>
                                            <button className="p-2 hover:bg-gray-100 rounded-lg">
                                                <Download size={18} className="text-gray-500" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-gray-600 mb-1">Market Status</div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                                            <span className="font-medium text-gray-900">Live</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Navigation Tabs */}
                            <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
                                {[
                                    { id: 'overview', label: 'Overview', icon: PieChart },
                                    { id: 'rsi', label: 'RSI Analysis', icon: Gauge },
                                    { id: 'trend', label: 'Trend', icon: TrendingUpIcon },
                                    { id: 'stamp', label: 'STAMP', icon: Shield }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all ${activeTab === tab.id
                                            ? 'bg-white shadow-sm text-blue-600'
                                            : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        <tab.icon size={18} />
                                        <span className="font-medium">{tab.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Content Area */}
                            {detailsLoading ? (
                                <div className="flex justify-center items-center h-64">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                        <p className="text-gray-600">Loading indicators...</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {activeTab === 'overview' && (
                                        <div className="space-y-6">
                                            {/* Stats Grid */}
                                            <div className="grid grid-cols-4 gap-4">
                                                <StatCard
                                                    title="Total Scanned"
                                                    value={stocks.length}
                                                    change={2.5}
                                                    icon={Activity}
                                                    color="bg-blue-100"
                                                />
                                                <StatCard
                                                    title="Passing RSI"
                                                    value={stocks.filter(s => s.final_signal).length}
                                                    change={5.2}
                                                    icon={CheckCircle2}
                                                    color="bg-green-100"
                                                />
                                                <StatCard
                                                    title="Trend Positive"
                                                    value={stocks.filter(s => s.trend_signal).length}
                                                    change={3.8}
                                                    icon={TrendingUp}
                                                    color="bg-purple-100"
                                                />
                                                <StatCard
                                                    title="STAMP Signals"
                                                    value={stocks.filter(s => s.stamp).length}
                                                    change={4.1}
                                                    icon={Zap}
                                                    color="bg-amber-100"
                                                />
                                            </div>

                                            {/* Key Indicators */}
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Key RSI Indicators</h3>
                                                    <div className="space-y-4">
                                                        <GaugeIndicator
                                                            label="RSI (14)"
                                                            value={stockDetails.indicators.rsi.rsi}
                                                            min={0}
                                                            max={100}
                                                            optimalRange={[55, 70]}
                                                        />
                                                        <GaugeIndicator
                                                            label="SMA9 RSI"
                                                            value={stockDetails.indicators.rsi.sma9}
                                                            min={0}
                                                            max={100}
                                                            optimalRange={[0, 75]}
                                                        />
                                                        <GaugeIndicator
                                                            label="WMA45 RSI"
                                                            value={stockDetails.indicators.rsi.wma45}
                                                            min={0}
                                                            max={100}
                                                            optimalRange={[0, 70]}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Trend Indicators</h3>
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                                            <div className="flex items-center gap-3">
                                                                <Target size={20} className="text-blue-600" />
                                                                <div>
                                                                    <div className="font-medium text-gray-900">The Number</div>
                                                                    <div className="text-sm text-gray-600">SMA9 vs Value</div>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="text-xl font-bold text-gray-900">
                                                                    {formatValue(stockDetails.indicators.the_number.value)}
                                                                </div>
                                                                <div className={`text-sm ${(stockDetails.indicators.the_number.sma9 ?? 0) > (stockDetails.indicators.the_number.value ?? 0)
                                                                    ? 'text-green-600'
                                                                    : 'text-red-600'
                                                                    }`}>
                                                                    SMA9: {formatValue(stockDetails.indicators.the_number.sma9)}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="p-4 bg-gray-50 rounded-xl">
                                                                <div className="text-sm text-gray-600 mb-1">CCI (14)</div>
                                                                <div className={`text-xl font-bold ${(stockDetails.indicators.trend_screener.cci ?? 0) > 100
                                                                    ? 'text-green-600'
                                                                    : 'text-amber-600'
                                                                    }`}>
                                                                    {formatValue(stockDetails.indicators.trend_screener.cci, 1)}
                                                                </div>
                                                            </div>
                                                            <div className="p-4 bg-gray-50 rounded-xl">
                                                                <div className="text-sm text-gray-600 mb-1">Aroon Up</div>
                                                                <div className={`text-xl font-bold ${(stockDetails.indicators.trend_screener.aroon_up ?? 0) > 70
                                                                    ? 'text-green-600'
                                                                    : 'text-amber-600'
                                                                    }`}>
                                                                    {formatValue(stockDetails.indicators.trend_screener.aroon_up, 1)}%
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
                                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                                                <div className="flex items-center gap-3 mb-6">
                                                    <div className="p-2 bg-blue-100 rounded-lg">
                                                        <Gauge size={24} className="text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold text-gray-900">RSI Screener Analysis</h3>
                                                        <p className="text-gray-600">Daily & Weekly Conditions</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-6">
                                                    {/* Daily Conditions */}
                                                    <div className="bg-blue-50 rounded-xl p-5">
                                                        <div className="flex items-center gap-2 mb-4">
                                                            <div className="w-2 h-5 bg-blue-600 rounded-full"></div>
                                                            <h4 className="font-semibold text-gray-900">Daily Conditions</h4>
                                                        </div>
                                                        <div className="space-y-3">
                                                            {Object.entries(stockDetails.indicators.rsi_screener.daily.conditions).map(([key, passed]) => (
                                                                <ConditionPill
                                                                    key={key}
                                                                    label={key.replace(/_/g, ' ')}
                                                                    passed={passed}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Weekly Conditions */}
                                                    <div className="bg-purple-50 rounded-xl p-5">
                                                        <div className="flex items-center gap-2 mb-4">
                                                            <div className="w-2 h-5 bg-purple-600 rounded-full"></div>
                                                            <h4 className="font-semibold text-gray-900">Weekly Conditions</h4>
                                                        </div>
                                                        <div className="space-y-3">
                                                            {Object.entries(stockDetails.indicators.rsi_screener.weekly.conditions).map(([key, passed]) => (
                                                                <ConditionPill
                                                                    key={key}
                                                                    label={key.replace(/_/g, ' ')}
                                                                    passed={passed}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'trend' && (
                                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="p-2 bg-green-100 rounded-lg">
                                                    <TrendingUpIcon size={24} className="text-green-600" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900">Trend Analysis</h3>
                                                    <p className="text-gray-600">CCI, Aroon & SMA Trend Indicators</p>
                                                </div>
                                                <div className="ml-auto">
                                                    {getSignalIcon(stockDetails.indicators.trend_screener.signal)}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-4">
                                                {Object.entries(stockDetails.indicators.trend_screener.conditions).map(([key, passed]) => (
                                                    <div
                                                        key={key}
                                                        className={`p-4 rounded-xl border ${passed
                                                            ? 'border-green-200 bg-green-50'
                                                            : 'border-red-200 bg-red-50'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {passed ? (
                                                                <CheckCircle2 size={20} className="text-green-600" />
                                                            ) : (
                                                                <XCircle size={20} className="text-red-600" />
                                                            )}
                                                            <div>
                                                                <div className="font-medium text-gray-900">
                                                                    {key.replace(/_/g, ' ')}
                                                                </div>
                                                                <div className="text-sm text-gray-600 mt-1">
                                                                    {passed ? 'Condition met' : 'Condition not met'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'stamp' && (
                                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="p-2 bg-amber-100 rounded-lg">
                                                    <Shield size={24} className="text-amber-600" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900">STAMP Indicator</h3>
                                                    <p className="text-gray-600">RSI-based Momentum Analysis</p>
                                                </div>
                                                <div className="ml-auto">
                                                    <div className={`px-4 py-2 rounded-full font-medium ${stockDetails.indicators.rsi_screener.stamp
                                                        ? 'bg-green-100 text-green-800 border border-green-200'
                                                        : 'bg-red-100 text-red-800 border border-red-200'
                                                        }`}>
                                                        {stockDetails.indicators.rsi_screener.stamp ? 'STAMP Active' : 'STAMP Inactive'}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-4 gap-4">
                                                <div className="text-center p-4">
                                                    <div className="text-sm text-gray-600 mb-2">S9(RSI)</div>
                                                    <div className="text-2xl font-bold text-gray-900">
                                                        {formatValue(stockDetails.indicators.stamp.s9_rsi, 1)}
                                                    </div>
                                                </div>
                                                <div className="text-center p-4">
                                                    <div className="text-sm text-gray-600 mb-2">E45(CFG)</div>
                                                    <div className="text-2xl font-bold text-gray-900">
                                                        {formatValue(stockDetails.indicators.stamp.e45_cfg, 1)}
                                                    </div>
                                                </div>
                                                <div className="text-center p-4">
                                                    <div className="text-sm text-gray-600 mb-2">E45(RSI)</div>
                                                    <div className="text-2xl font-bold text-gray-900">
                                                        {formatValue(stockDetails.indicators.stamp.e45_rsi, 1)}
                                                    </div>
                                                </div>
                                                <div className="text-center p-4">
                                                    <div className="text-sm text-gray-600 mb-2">E20(SMA3(RSI3))</div>
                                                    <div className="text-2xl font-bold text-gray-900">
                                                        {formatValue(stockDetails.indicators.stamp.e20_sma3_rsi3, 1)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full pt-20">
                            <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6">
                                <Activity size={48} className="text-gray-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Select a Stock</h3>
                            <p className="text-gray-600 max-w-md text-center">
                                Choose a stock from the sidebar to view detailed technical analysis and indicators
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}