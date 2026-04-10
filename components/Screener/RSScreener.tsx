'use client';

import { useEffect, useState, useRef } from 'react';
import { createChart, ColorType, CrosshairMode, AreaSeries } from 'lightweight-charts';
import { Calendar, TrendingUp, TrendingDown, Search, Filter, X, ChevronRight, ChevronLeft, BarChart3, Sparkles, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api/config';

// ─── DESIGN TOKENS: Black & White ────────────────────────────────
// Page bg:         #FFFFFF   Sidebar/Card bg: #FFFFFF
// Border:          #E5E7EB   Border-light:    #F3F4F6
// Navbar/Accent:   #111827   Accent mid:      #374151
// Text primary:    #111827   Text secondary:  #4B5563   Text muted: #9CA3AF
// Badge green bg:  #DCFCE7   text: #15803D   border: #BBF7D0
// Badge red bg:    #FEE2E2   text: #B91C1C   border: #FECACA
// Badge amber bg:  #FEF3C7   text: #B45309   border: #FDE68A
// ─────────────────────────────────────────────────────────────────────────────

function RSHistoryChart({ data, period }: { data: any[], period: string }) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<any>(null);

    useEffect(() => {
        if (!chartContainerRef.current || data.length === 0) return;
        if (chartRef.current) { chartRef.current.remove(); chartRef.current = null; }

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#6B7280',
                fontFamily: 'system-ui, sans-serif',
            },
            grid: {
                vertLines: { color: 'rgba(229,231,235,0.6)' },
                horzLines: { color: 'rgba(229,231,235,0.6)' },
            },
            crosshair: {
                mode: CrosshairMode.Magnet,
                vertLine: { labelBackgroundColor: '#111827' },
                horzLine: { labelBackgroundColor: '#111827' },
            },
            rightPriceScale: { borderColor: '#E5E7EB' },
            timeScale: { borderColor: '#E5E7EB', timeVisible: false, fixLeftEdge: true, fixRightEdge: true },
        });

        const areaSeries = chart.addSeries(AreaSeries, {
            lineColor: '#2D6A4F',
            topColor: 'rgba(45,106,79,0.18)',
            bottomColor: 'rgba(45,106,79,0.0)',
            lineWidth: 2,
            priceLineVisible: false,
            crosshairMarkerVisible: true,
            crosshairMarkerRadius: 5,
        });

        const uniqueData = new Map();
        [...data]
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .forEach(d => {
                let timeStr = d.date;
                if (timeStr.includes('T')) timeStr = timeStr.split('T')[0];
                uniqueData.set(timeStr, { time: timeStr, value: d.rs_rating });
            });

        areaSeries.setData(Array.from(uniqueData.values()));
        chart.timeScale().fitContent();
        chartRef.current = chart;

        const ro = new ResizeObserver((entries) => {
            if (chartContainerRef.current && chartRef.current) {
                const { width, height } = entries[0].contentRect;
                chartRef.current.applyOptions({ width, height });
            }
        });
        ro.observe(chartContainerRef.current);
        return () => {
            ro.disconnect();
            if (chartRef.current) { chartRef.current.remove(); chartRef.current = null; }
        };
    }, [data, period]);

    return <div ref={chartContainerRef} className="w-full h-full" />;
}

interface StockRS {
    symbol: string;
    company_name?: string;
    rs_rating: number;
    rank_3m: number; rank_6m: number; rank_9m: number; rank_12m: number;
    return_3m: number; return_6m: number; return_9m: number; return_12m: number;
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
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const calculateStartDate = (opt: { label: string; type: string; value: number }): Date => {
    const today = new Date();
    const result = new Date(today);
    switch (opt.type) {
        case 'days': result.setDate(result.getDate() - opt.value); break;
        case 'months':
            result.setMonth(result.getMonth() - opt.value);
            if (result.getDate() !== today.getDate()) result.setDate(0);
            break;
        case 'years':
            result.setFullYear(result.getFullYear() - opt.value);
            if (result.getMonth() !== today.getMonth() || result.getDate() !== today.getDate()) result.setDate(0);
            break;
        case 'ytd': result.setMonth(0, 1); break;
        case 'max': result.setFullYear(result.getFullYear() - 25); break;
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
    const datePickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node))
                setShowDatePicker(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => { fetchLatestRS(); }, []);

    useEffect(() => {
        let r = stocks.filter(s => s.rs_rating >= filterRange[0] && s.rs_rating <= filterRange[1]);
        if (searchQuery) {
            const q = searchQuery.toUpperCase();
            r = r.filter(s => s.symbol.includes(q) || s.company_name?.toUpperCase().includes(q));
        }
        setFilteredStocks(r);
    }, [stocks, searchQuery, filterRange]);

    useEffect(() => {
        if (selectedStock) fetchHistoryWithPeriod(selectedStock.symbol);
    }, [selectedStock, selectedPeriod, customStartDate, customEndDate]);

    const API_URL = API_BASE_URL;

    const fetchLatestRS = async () => {
        try {
            const res = await fetch(`${API_URL}/api/rs/latest?limit=500`, { credentials: 'include' });
            if (res.status === 401 || res.status === 403) return;
            const data = await res.json();
            if (data.data) { setStocks(data.data); if (data.data.length > 0) setSelectedStock(data.data[0]); }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const fetchHistoryWithPeriod = async (symbol: string) => {
        setHistoryLoading(true);
        try {
            let fromDate = '';
            const toDate = getLocalDateString(new Date());
            if (selectedPeriod === 'Custom' && customStartDate && customEndDate) {
                fromDate = customStartDate;
            } else {
                const option = PERIOD_OPTIONS.find(p => p.label === selectedPeriod);
                if (option) fromDate = getLocalDateString(calculateStartDate(option));
            }
            const params = new URLSearchParams();
            const finalToDate = selectedPeriod === 'Custom' && customEndDate ? customEndDate : toDate;
            if (fromDate) params.append('from_date', fromDate);
            if (finalToDate) params.append('to_date', finalToDate);
            let url = `${API_URL}/api/rs/${symbol}${params.toString() ? '?' + params.toString() : ''}`;
            const res = await fetch(url, { credentials: 'include' });
            if (!res.ok) throw new Error('Failed');
            const data = await res.json();
            setHistoryData(Array.isArray(data) ? data : []);
        } catch (err) { console.error(err); setHistoryData([]); }
        finally { setHistoryLoading(false); }
    };

    const handlePeriodChange = (p: string) => { setSelectedPeriod(p); setShowDatePicker(false); };
    const handleApplyCustomRange = () => {
        if (customStartDate && customEndDate) {
            if (new Date(customStartDate) > new Date(customEndDate)) { alert('Start date must be before end date'); return; }
            setSelectedPeriod('Custom');
            setShowDatePicker(false);
        }
    };

    const getRSBadge = (v: number) => {
        if (v >= 90) return { bg: '#DCFCE7', text: '#15803D', border: '#BBF7D0' };
        if (v >= 70) return { bg: '#E0F2FE', text: '#0369A1', border: '#BAE6FD' };
        if (v >= 50) return { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' };
        if (v >= 30) return { bg: '#FFEDD5', text: '#C2410C', border: '#FDBA74' };
        return { bg: '#FEE2E2', text: '#B91C1C', border: '#FECACA' };
    };

    const formatReturn = (v: number | undefined) => v === undefined || v === null ? '-' : `${(v * 100).toFixed(1)}%`;
    const returnColor = (v: number | undefined) => v === undefined || v === null ? '#9CA3AF' : v > 0 ? '#15803D' : v < 0 ? '#B91C1C' : '#4B5563';

    const getRSChange = () => {
        if (historyData.length < 2) return { value: 0, isPositive: true };
        const change = (historyData[historyData.length - 1]?.rs_rating || 0) - (historyData[0]?.rs_rating || 0);
        return { value: change, isPositive: change >= 0 };
    };
    const rsChange = getRSChange();

    // Shared input style
    const inputStyle = { backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', color: '#111827' };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#FFFFFF', color: '#111827', fontFamily: 'system-ui, sans-serif', position: 'relative' }}>

            {/* ── Sidebar ── */}
            <div style={{
                width: sidebarCollapsed ? '64px' : '295px',
                flexShrink: 0,
                backgroundColor: '#FFFFFF',
                borderRight: '1px solid #E5E7EB',
                boxShadow: '2px 0 8px rgba(0,0,0,0.06)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'width 0.3s',
                position: 'relative',
            }}>

                {!sidebarCollapsed && (
                    <>
                        {/* Header */}
                        <div style={{ padding: '20px', borderBottom: '1px solid #F3F4F6' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <BarChart3 size={20} color="#FFFFFF" />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '15px', color: '#111827' }}>RS Screener</div>
                                    <div style={{ fontSize: '11px', color: '#6B7280' }}>Relative Strength Analysis</div>
                                </div>
                            </div>

                            {/* Search */}
                            <div style={{ position: 'relative', marginBottom: '14px' }}>
                                <Search size={14} color="#9CA3AF" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    type="text"
                                    placeholder="Search stocks..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    style={{ ...inputStyle, width: '100%', padding: '10px 10px 10px 34px', borderRadius: '12px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                                />
                            </div>

                            {/* Quick filter label */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                                <Filter size={12} color="#9CA3AF" />
                                <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#9CA3AF' }}>Quick Filters</span>
                            </div>

                            {/* Filter grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                                {[{ label: '90+', range: [90, 100] }, { label: '80+', range: [80, 100] }, { label: '70+', range: [70, 100] }, { label: '50+', range: [51, 100] }, { label: '<50', range: [0, 50] }, { label: 'All', range: [0, 100] }].map(f => {
                                    const active = filterRange[0] === f.range[0] && filterRange[1] === f.range[1];
                                    return (
                                        <button key={f.label} onClick={() => setFilterRange(f.range as [number, number])} style={{
                                            padding: '8px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                                            backgroundColor: active ? '#111827' : '#F9FAFB',
                                            color: active ? '#FFFFFF' : '#6B7280',
                                            border: `1px solid ${active ? '#111827' : '#E5E7EB'}`,
                                        }}>
                                            {f.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Stock list */}
                        <div style={{ overflowY: 'auto', maxHeight: '480px', padding: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px 8px' }}>
                                <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{filteredStocks.length} stocks</span>
                                <Sparkles size={11} color="#374151" />
                            </div>

                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                                    <Loader2 size={28} color="#374151" style={{ margin: '0 auto 8px', animation: 'spin 1s linear infinite' }} />
                                    <p style={{ fontSize: '12px', color: '#9CA3AF' }}>Loading stocks...</p>
                                </div>
                            ) : filteredStocks.length === 0 ? (
                                <p style={{ fontSize: '12px', color: '#9CA3AF', textAlign: 'center', padding: '32px 0' }}>No stocks found</p>
                            ) : filteredStocks.map(stock => {
                                const isSelected = selectedStock?.symbol === stock.symbol;
                                const badge = getRSBadge(stock.rs_rating);
                                return (
                                    <div key={stock.symbol} onClick={() => setSelectedStock(stock)} style={{
                                        marginBottom: '6px', padding: '12px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid',
                                        backgroundColor: isSelected ? '#F3F4F6' : '#FFFFFF',
                                        borderColor: isSelected ? '#111827' : '#E5E7EB',
                                        boxShadow: isSelected ? '0 1px 6px rgba(0,0,0,0.12)' : 'none',
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                            <div style={{ flex: 1, minWidth: 0, marginRight: '8px' }}>
                                                <div style={{ fontWeight: 700, fontSize: '13px', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stock.company_name || stock.symbol}</div>
                                                <div style={{ fontSize: '11px', color: '#9CA3AF', fontFamily: 'monospace' }}>{stock.symbol}</div>
                                            </div>
                                            <div style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 900, backgroundColor: badge.bg, color: badge.text, border: `1px solid ${badge.border}` }}>
                                                {stock.rs_rating}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                                            <span style={{ color: '#9CA3AF' }}>12M Return</span>
                                            <span style={{ fontWeight: 700, color: returnColor(stock.return_12m), display: 'flex', alignItems: 'center', gap: '2px' }}>
                                                {stock.return_12m !== undefined && stock.return_12m > 0 && <ArrowUpRight size={11} />}
                                                {stock.return_12m !== undefined && stock.return_12m < 0 && <ArrowDownRight size={11} />}
                                                {formatReturn(stock.return_12m)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}

                {sidebarCollapsed && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0', gap: '20px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BarChart3 size={16} color="#FFFFFF" />
                        </div>
                        <Search size={14} color="#9CA3AF" />
                        <Filter size={14} color="#9CA3AF" />
                        <Sparkles size={12} color="#374151" />
                    </div>
                )}
            </div>

            {/* Sidebar Toggle Button - Center Edge */}
            <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="absolute top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-5 h-14 bg-white border border-gray-200 border-l-0 rounded-r-md shadow-sm text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-all duration-300 ease-in-out cursor-pointer outline-none focus:ring-0"
                style={{ left: sidebarCollapsed ? '64px' : '295px' }}
                title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
                {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            {/* ── Main Content ── */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {selectedStock ? (
                    <>
                        {/* Top bar */}
                        <div style={{ padding: '20px 32px', backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                {(() => {
                                    const b = getRSBadge(selectedStock.rs_rating); return (
                                        <div style={{ fontSize: '28px', fontWeight: 900, padding: '12px 20px', borderRadius: '16px', backgroundColor: b.bg, color: b.text, border: `1px solid ${b.border}` }}>
                                            {selectedStock.rs_rating}
                                        </div>
                                    );
                                })()}
                                <div>
                                    <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>{selectedStock.company_name}</h1>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '13px', fontFamily: 'monospace', color: '#6B7280' }}>{selectedStock.symbol}</span>
                                        <span style={{ color: '#E5E7EB' }}>•</span>
                                        <span style={{
                                            fontSize: '12px', fontWeight: 700, padding: '3px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px',
                                            backgroundColor: rsChange.isPositive ? '#DCFCE7' : '#FEE2E2',
                                            color: rsChange.isPositive ? '#15803D' : '#B91C1C',
                                            border: `1px solid ${rsChange.isPositive ? '#BBF7D0' : '#FECACA'}`,
                                        }}>
                                            {rsChange.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                            {rsChange.isPositive ? '+' : ''}{rsChange.value.toFixed(1)} pts ({selectedPeriod})
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Period selector */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px', borderRadius: '14px', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                                {PERIOD_OPTIONS.map(opt => {
                                    const active = selectedPeriod === opt.label;
                                    return (
                                        <button key={opt.label} onClick={() => handlePeriodChange(opt.label)} style={{
                                            padding: '6px 12px', fontSize: '12px', fontWeight: 700, borderRadius: '10px', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                                            backgroundColor: active ? '#111827' : 'transparent',
                                            color: active ? '#FFFFFF' : '#6B7280',
                                            boxShadow: active ? '0 1px 4px rgba(0,0,0,0.3)' : 'none',
                                        }}>{opt.label}</button>
                                    );
                                })}
                                <div style={{ position: 'relative' }} ref={datePickerRef}>
                                    <button onClick={() => setShowDatePicker(!showDatePicker)} style={{
                                        display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 700, borderRadius: '10px', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                                        backgroundColor: showDatePicker || selectedPeriod === 'Custom' ? '#111827' : 'transparent',
                                        color: showDatePicker || selectedPeriod === 'Custom' ? '#FFFFFF' : '#6B7280',
                                    }}>
                                        <Calendar size={13} />
                                        {selectedPeriod === 'Custom' && <span>Custom</span>}
                                    </button>
                                    {showDatePicker && (
                                        <div style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, width: '340px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', padding: '20px', zIndex: 50 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                                <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>Custom Date Range</span>
                                                <button onClick={() => setShowDatePicker(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}><X size={16} /></button>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                                {[{ label: 'Start Date', val: customStartDate, set: setCustomStartDate }, { label: 'End Date', val: customEndDate, set: setCustomEndDate }].map(({ label, val, set }) => (
                                                    <div key={label}>
                                                        <label style={{ display: 'block', fontSize: '11px', color: '#6B7280', marginBottom: '6px', fontWeight: 600 }}>{label}</label>
                                                        <input type="date" value={val} onChange={e => set(e.target.value)} style={{ ...inputStyle, width: '100%', padding: '8px 10px', borderRadius: '10px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                                                    </div>
                                                ))}
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                <button onClick={() => { setCustomStartDate(''); setCustomEndDate(''); setShowDatePicker(false); }} style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '10px', border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB', color: '#6B7280', cursor: 'pointer' }}>Cancel</button>
                                                <button onClick={handleApplyCustomRange} disabled={!customStartDate || !customEndDate} style={{
                                                    padding: '8px 16px', fontSize: '13px', fontWeight: 700, borderRadius: '10px', border: 'none', cursor: !customStartDate || !customEndDate ? 'not-allowed' : 'pointer',
                                                    backgroundColor: !customStartDate || !customEndDate ? '#F3F4F6' : '#111827',
                                                    color: !customStartDate || !customEndDate ? '#9CA3AF' : '#FFFFFF',
                                                }}>Apply Range</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div style={{ flex: 1, padding: '28px', overflowY: 'auto', backgroundColor: '#FFFFFF' }}>
                            {/* Chart */}
                            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '20px', padding: '20px', marginBottom: '20px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', height: '440px', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ marginBottom: '16px' }}>
                                    <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '3px', height: '20px', backgroundColor: '#374151', borderRadius: '2px' }} />
                                        RS Rating History
                                    </h2>
                                    <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>{historyData.length} data points • {selectedPeriod}</p>
                                </div>
                                <div style={{ flex: 1 }}>
                                    {historyLoading ? (
                                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <div style={{ textAlign: 'center' }}>
                                                <Loader2 size={40} color="#374151" style={{ margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
                                                <p style={{ fontSize: '13px', color: '#9CA3AF' }}>Loading chart data...</p>
                                            </div>
                                        </div>
                                    ) : historyData.length === 0 ? (
                                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <div style={{ textAlign: 'center' }}>
                                                <BarChart3 size={40} color="#E5E7EB" style={{ margin: '0 auto 12px' }} />
                                                <p style={{ fontSize: '13px', color: '#9CA3AF' }}>No data available for this period</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <RSHistoryChart data={historyData} period={selectedPeriod} />
                                    )}
                                </div>
                            </div>

                            {/* Return cards */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
                                {[
                                    { label: '3M Return', value: selectedStock.return_3m },
                                    { label: '6M Return', value: selectedStock.return_6m },
                                    { label: '9M Return', value: selectedStock.return_9m },
                                    { label: '12M Return', value: selectedStock.return_12m },
                                ].map(item => (
                                    <div key={item.label} style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                                        <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#9CA3AF', display: 'block', marginBottom: '8px' }}>{item.label}</span>
                                        <div style={{ fontSize: '22px', fontWeight: 900, color: returnColor(item.value), display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {item.value !== undefined && item.value > 0 && <ArrowUpRight size={18} />}
                                            {item.value !== undefined && item.value < 0 && <ArrowDownRight size={18} />}
                                            {formatReturn(item.value)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '20px', backgroundColor: '#F3F4F6', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                <TrendingUp size={36} color="#374151" />
                            </div>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>Select a Stock</h3>
                            <p style={{ color: '#9CA3AF' }}>Choose a stock from the sidebar to view detailed RS analysis</p>
                        </div>
                    </div>
                )}
            </div>

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}