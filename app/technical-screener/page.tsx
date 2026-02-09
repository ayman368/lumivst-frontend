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
    Sparkles
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

    const StatCard = ({ title, value, description, icon: Icon, color }: any) => (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${color}`}>
                    <Icon size={20} className="text-white" />
                </div>
                <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">{title}</p>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{value}</h3>
                    <p className="text-xs text-gray-500">{description}</p>
                </div>
            </div>
        </div>
    );

    const GaugeIndicator = ({ label, value, min, max, optimalRange, unit = '' }: any) => {
        const percentage = ((value - min) / (max - min)) * 100;
        const isOptimal = value >= optimalRange[0] && value <= optimalRange[1];
        const isOverbought = value > optimalRange[1];
        const isOversold = value < optimalRange[0];

        return (
            <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                    <span className={`text-base font-semibold ${isOptimal ? 'text-green-600' : isOverbought ? 'text-red-600' : 'text-blue-600'}`}>
                        {formatValue(value)}{unit}
                    </span>
                </div>
                <div className="relative h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
                    <div
                        className={`absolute h-full ${isOptimal ? 'bg-green-500' : isOverbought ? 'bg-red-500' : 'bg-blue-500'}`}
                        style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                    ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                    <span className={isOversold ? 'text-blue-600 font-medium' : ''}>Oversold</span>
                    <span className={isOptimal ? 'text-green-600 font-medium' : ''}>Optimal</span>
                    <span className={isOverbought ? 'text-red-600 font-medium' : ''}>Overbought</span>
                </div>
            </div>
        );
    };

    const ConditionPill = ({ label, passed, value, description }: any) => (
        <div className={`flex items-start gap-3 p-3 rounded-lg ${passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            {passed ? (
                <CheckCircle2 size={18} className="text-green-500 mt-0.5" />
            ) : (
                <XCircle size={18} className="text-red-500 mt-0.5" />
            )}
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
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

                        <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 gap-2' : 'space-y-2'} max-h-[calc(100vh-280px)] overflow-y-auto pr-1`}>
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
                                                </div>
                                                <div className="text-xs text-gray-600 truncate max-w-[180px]">
                                                    {stock.company_name}
                                                </div>
                                            </div>
                                            <div
                                                className={`px-2.5 py-1 rounded-full text-xs font-bold ${getScoreColor(stock.score)}`}
                                                style={{
                                                    background: getScoreGradient(stock.score)
                                                }}
                                            >
                                                {stock.score}
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <DollarSign size={12} className="text-gray-500" />
                                                <span className="font-semibold text-gray-900">
                                                    {formatValue(stock.close)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar size={12} className="text-gray-500" />
                                                <span className="text-xs text-gray-600">
                                                    {formatDate(stock.date)}
                                                </span>
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
                    {selectedStock && stockDetails ? (
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
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Navigation Tabs */}
                            <div className="flex gap-1 mb-6 bg-white p-1 rounded-lg border border-gray-200 w-fit">
                                {[
                                    { id: 'overview', label: 'Dashboard', icon: PieChart, color: 'text-blue-600' },
                                    { id: 'rsi', label: 'RSI Analysis', icon: Gauge, color: 'text-purple-600' },
                                    { id: 'trend', label: 'Trend Signals', icon: TrendingUpIcon, color: 'text-green-600' },
                                    { id: 'stamp', label: 'STAMP System', icon: Shield, color: 'text-amber-600' }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`flex items-center gap-2 px-4 py-2.5 rounded-md transition-all ${activeTab === tab.id
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
                            {detailsLoading ? (
                                <div className="flex justify-center items-center h-64">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                        <p className="text-gray-600">Loading detailed analysis...</p>
                                        <p className="text-gray-500 text-sm mt-1">Fetching latest indicators</p>
                                    </div>
                                </div>
                            ) : (
                                <>
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
                                                    value={formatValue(stockDetails.indicators.rsi.rsi, 1)}
                                                    description="Relative Strength Index"
                                                    icon={Gauge}
                                                    color="bg-purple-500"
                                                />
                                                <StatCard
                                                    title="Trend Signal"
                                                    value={stockDetails.indicators.trend_screener.signal ? "Bullish" : "Bearish"}
                                                    description="Overall trend direction"
                                                    icon={TrendingUpIcon}
                                                    color={stockDetails.indicators.trend_screener.signal ? "bg-green-500" : "bg-red-500"}
                                                />
                                                <StatCard
                                                    title="The Number"
                                                    value={formatValue(stockDetails.indicators.the_number.value)}
                                                    description="Volatility indicator"
                                                    icon={Target}
                                                    color="bg-amber-500"
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

                                                {/* Trend Indicators */}
                                                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <div className="p-2 bg-green-100 rounded-lg">
                                                            <TrendingUpIcon size={20} className="text-green-600" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-gray-900">Trend Strength Indicators</h3>
                                                            <p className="text-gray-600 text-sm">Momentum and direction analysis</p>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="p-4 bg-gray-50 rounded-lg">
                                                                <div className="text-sm text-gray-600 mb-2">CCI (14)</div>
                                                                <div className={`text-xl font-bold ${(stockDetails.indicators.trend_screener.cci ?? 0) > 100
                                                                    ? 'text-green-600'
                                                                    : (stockDetails.indicators.trend_screener.cci ?? 0) < -100
                                                                        ? 'text-red-600'
                                                                        : 'text-amber-600'
                                                                    }`}>
                                                                    {formatValue(stockDetails.indicators.trend_screener.cci, 1)}
                                                                </div>
                                                                <div className="text-xs text-gray-500 mt-1">
                                                                    {stockDetails.indicators.trend_screener.cci !== null &&
                                                                        (stockDetails.indicators.trend_screener.cci > 100 ? "Strong Uptrend" :
                                                                            stockDetails.indicators.trend_screener.cci < -100 ? "Strong Downtrend" :
                                                                                "Neutral Zone")}
                                                                </div>
                                                            </div>
                                                            <div className="p-4 bg-gray-50 rounded-lg">
                                                                <div className="text-sm text-gray-600 mb-2">Aroon Up</div>
                                                                <div className={`text-xl font-bold ${(stockDetails.indicators.trend_screener.aroon_up ?? 0) > 70
                                                                    ? 'text-green-600'
                                                                    : 'text-amber-600'
                                                                    }`}>
                                                                    {formatValue(stockDetails.indicators.trend_screener.aroon_up, 1)}%
                                                                </div>
                                                                <div className="text-xs text-gray-500 mt-1">
                                                                    {(stockDetails.indicators.trend_screener.aroon_up ?? 0) > 70
                                                                        ? "Strong Uptrend"
                                                                        : "Moderate Uptrend"}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="font-medium text-gray-900">The Number Analysis</div>
                                                                <div className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                                                                    Volatility Indicator
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <div>
                                                                    <div className="text-lg font-bold text-gray-900">
                                                                        {formatValue(stockDetails.indicators.the_number.value)}
                                                                    </div>
                                                                    <div className="text-sm text-gray-600">Current Value</div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className={`text-lg font-bold ${(stockDetails.indicators.the_number.sma9 ?? 0) > (stockDetails.indicators.the_number.value ?? 0)
                                                                        ? 'text-green-600'
                                                                        : 'text-red-600'
                                                                        }`}>
                                                                        SMA9: {formatValue(stockDetails.indicators.the_number.sma9)}
                                                                    </div>
                                                                    <div className="text-sm text-gray-600">9-Day Average</div>
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
                                                            <div className={`px-3 py-1.5 rounded-full ${stockDetails.indicators.rsi_screener.final_signal
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-red-100 text-red-800'
                                                                }`}>
                                                                <span className="font-semibold">
                                                                    {stockDetails.indicators.rsi_screener.final_signal ? 'Passing' : 'Failing'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                    {/* Daily Conditions */}
                                                    <div className="bg-gradient-to-b from-blue-50 to-white rounded-xl p-5 border border-blue-200">
                                                        <div className="flex items-center gap-3 mb-4">
                                                            <div className="w-3 h-6 bg-blue-600 rounded-full"></div>
                                                            <h4 className="font-bold text-gray-900">Daily Analysis</h4>
                                                            <div className="ml-auto text-sm text-gray-600">
                                                                {formatDate(stockDetails.date)}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-3">
                                                            {Object.entries(stockDetails.indicators.rsi_screener.daily.conditions).map(([key, passed]) => (
                                                                <ConditionPill
                                                                    key={key}
                                                                    label={key.replace(/_/g, ' ')}
                                                                    passed={passed}
                                                                    description={
                                                                        key.includes('rsi') ? "Optimal RSI range: 55-70" :
                                                                            key.includes('sma9') ? "SMA9 comparison" :
                                                                                key.includes('wma45') ? "Weighted moving average" :
                                                                                    key.includes('ema45') ? "Exponential moving average" :
                                                                                        "Technical condition"
                                                                    }
                                                                />
                                                            ))}
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
                                                            {Object.entries(stockDetails.indicators.rsi_screener.weekly.conditions).map(([key, passed]) => (
                                                                <ConditionPill
                                                                    key={key}
                                                                    label={key.replace(/_/g, ' ')}
                                                                    passed={passed}
                                                                    description={
                                                                        key.includes('weekly') ? "Weekly timeframe analysis" :
                                                                            key.includes('stamp') ? "Weekly STAMP signal" :
                                                                                "Long-term condition"
                                                                    }
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-6 pt-6 border-t border-gray-200">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Info size={16} />
                                                        <p>
                                                            RSI analysis evaluates momentum strength. Scores above 70 may indicate overbought conditions,
                                                            while scores below 30 may indicate oversold conditions.
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
                                                        <div className={`px-3 py-1.5 rounded-full ${stockDetails.indicators.trend_screener.signal
                                                            ? 'bg-green-100 text-green-800 border border-green-200'
                                                            : 'bg-red-100 text-red-800 border border-red-200'
                                                            }`}>
                                                            {stockDetails.indicators.trend_screener.signal ? (
                                                                <span className="font-semibold">Bullish Trend</span>
                                                            ) : (
                                                                <span className="font-semibold">Bearish Trend</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                                {Object.entries(stockDetails.indicators.trend_screener.conditions).map(([key, passed]) => (
                                                    <div
                                                        key={key}
                                                        className={`p-4 rounded-lg border ${passed
                                                            ? 'border-green-200 bg-green-50'
                                                            : 'border-red-200 bg-red-50'
                                                            }`}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            {passed ? (
                                                                <CheckCircle2 size={20} className="text-green-600 mt-0.5" />
                                                            ) : (
                                                                <XCircle size={20} className="text-red-600 mt-0.5" />
                                                            )}
                                                            <div>
                                                                <div className="font-medium text-gray-900 mb-1">
                                                                    {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                                                </div>
                                                                <div className="text-sm text-gray-600">
                                                                    {passed ? (
                                                                        <span className="text-green-700">Condition satisfied</span>
                                                                    ) : (
                                                                        <span className="text-red-700">Condition not met</span>
                                                                    )}
                                                                </div>
                                                                <div className="text-xs text-gray-500 mt-2">
                                                                    {key.includes('cci') ? "Commodity Channel Index" :
                                                                        key.includes('aroon') ? "Aroon Oscillator" :
                                                                            key.includes('sma') ? "Simple Moving Average" :
                                                                                "Trend indicator"}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Layers size={18} className="text-gray-600" />
                                                    <h4 className="font-medium text-gray-900">Indicator Values</h4>
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <div className="text-center p-3 bg-white rounded-lg border">
                                                        <div className="text-sm text-gray-600 mb-1">CCI (14)</div>
                                                        <div className={`text-lg font-bold ${(stockDetails.indicators.trend_screener.cci ?? 0) > 0
                                                            ? 'text-green-600'
                                                            : 'text-red-600'
                                                            }`}>
                                                            {formatValue(stockDetails.indicators.trend_screener.cci, 1)}
                                                        </div>
                                                    </div>
                                                    <div className="text-center p-3 bg-white rounded-lg border">
                                                        <div className="text-sm text-gray-600 mb-1">Aroon Up</div>
                                                        <div className="text-lg font-bold text-gray-900">
                                                            {formatValue(stockDetails.indicators.trend_screener.aroon_up, 1)}%
                                                        </div>
                                                    </div>
                                                    <div className="text-center p-3 bg-white rounded-lg border">
                                                        <div className="text-sm text-gray-600 mb-1">Aroon Down</div>
                                                        <div className="text-lg font-bold text-gray-900">
                                                            {formatValue(stockDetails.indicators.trend_screener.aroon_down, 1)}%
                                                        </div>
                                                    </div>
                                                    <div className="text-center p-3 bg-white rounded-lg border">
                                                        <div className="text-sm text-gray-600 mb-1">Trend Strength</div>
                                                        <div className={`text-lg font-bold ${stockDetails.indicators.trend_screener.signal
                                                            ? 'text-green-600'
                                                            : 'text-red-600'
                                                            }`}>
                                                            {stockDetails.indicators.trend_screener.signal ? "Strong" : "Weak"}
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
                                                    <div className={`px-4 py-2 rounded-full font-medium ${stockDetails.indicators.rsi_screener.stamp
                                                        ? 'bg-green-100 text-green-800 border border-green-200'
                                                        : 'bg-red-100 text-red-800 border border-red-200'
                                                        }`}>
                                                        {stockDetails.indicators.rsi_screener.stamp ? 'Active Signal' : 'No Signal'}
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
                                                            {formatValue(stockDetails.indicators.stamp.s9_rsi, 1)}
                                                        </div>
                                                        <div className="text-xs text-gray-500">9-period SMA of RSI</div>
                                                    </div>
                                                    <div className="text-center p-4 bg-gradient-to-b from-purple-50 to-white rounded-xl border border-purple-200">
                                                        <div className="text-xs text-gray-600 mb-2 font-medium">E45(CFG)</div>
                                                        <div className="text-2xl font-bold text-gray-900 mb-1">
                                                            {formatValue(stockDetails.indicators.stamp.e45_cfg, 1)}
                                                        </div>
                                                        <div className="text-xs text-gray-500">45-period EMA (CFG)</div>
                                                    </div>
                                                    <div className="text-center p-4 bg-gradient-to-b from-green-50 to-white rounded-xl border border-green-200">
                                                        <div className="text-xs text-gray-600 mb-2 font-medium">E45(RSI)</div>
                                                        <div className="text-2xl font-bold text-gray-900 mb-1">
                                                            {formatValue(stockDetails.indicators.stamp.e45_rsi, 1)}
                                                        </div>
                                                        <div className="text-xs text-gray-500">45-period EMA of RSI</div>
                                                    </div>
                                                    <div className="text-center p-4 bg-gradient-to-b from-amber-50 to-white rounded-xl border border-amber-200">
                                                        <div className="text-xs text-gray-600 mb-2 font-medium">E20(SMA3)</div>
                                                        <div className="text-2xl font-bold text-gray-900 mb-1">
                                                            {formatValue(stockDetails.indicators.stamp.e20_sma3_rsi3, 1)}
                                                        </div>
                                                        <div className="text-xs text-gray-500">20-period EMA of 3 SMA</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                                                <div className="flex items-start gap-3">
                                                    <Info size={18} className="text-amber-600 mt-0.5" />
                                                    <div>
                                                        <h4 className="font-medium text-gray-900 mb-1">About STAMP Signals</h4>
                                                        <p className="text-sm text-gray-600">
                                                            A STAMP signal is generated when multiple RSI-based indicators align, indicating
                                                            strong momentum. This pattern often precedes significant price movements and is
                                                            used by traders for strategic entry points.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
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
                            <div className="grid grid-cols-2 gap-4 max-w-md">
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
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}