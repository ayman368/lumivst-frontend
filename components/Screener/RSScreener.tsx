'use client';

import { useEffect, useState, useRef } from 'react';
import { createChart, ColorType, CrosshairMode, AreaSeries } from 'lightweight-charts';
import { Calendar, TrendingUp, TrendingDown, Search, Filter, X, ChevronRight, BarChart3, Sparkles, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';

// ─── DESIGN TOKENS: Warm Cream × Forest Green ────────────────────────────────
// Page bg:         #EDE8DC   Sidebar/Card bg: #FDFAF5
// Border:          #D9D2C3   Border-light:    #E8E2D5
// Navbar/Accent:   #1C3D2E   Accent mid:      #2D6A4F
// Text primary:    #2C2416   Text secondary:  #7A7060   Text muted: #A09880
// Badge green bg:  #D4EDDA   text: #1C7A3F   border: #A8D5B5
// Badge red bg:    #FADADD   text: #C0392B   border: #F5AAAF
// Badge amber bg:  #FEF3C7   text: #92400E   border: #FCD37A
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
                textColor: '#7A7060',
                fontFamily: 'system-ui, sans-serif',
            },
            grid: {
                vertLines: { color: 'rgba(217,210,195,0.6)' },
                horzLines: { color: 'rgba(217,210,195,0.6)' },
            },
            crosshair: {
                mode: CrosshairMode.Magnet,
                vertLine: { labelBackgroundColor: '#1C3D2E' },
                horzLine: { labelBackgroundColor: '#1C3D2E' },
            },
            rightPriceScale: { borderColor: '#D9D2C3' },
            timeScale: { borderColor: '#D9D2C3', timeVisible: false, fixLeftEdge: true, fixRightEdge: true },
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

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    const fetchLatestRS = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const res = await fetch(`${API_URL}/api/rs/latest?limit=500`, { headers });
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
            const token = localStorage.getItem('token');
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;
            const res = await fetch(url, { headers });
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
        if (v >= 90) return { bg: '#D4EDDA', text: '#1C7A3F', border: '#A8D5B5' };
        if (v >= 70) return { bg: '#D4E8FF', text: '#1A5276', border: '#A8CCE8' };
        if (v >= 50) return { bg: '#FEF3C7', text: '#92400E', border: '#FCD37A' };
        if (v >= 30) return { bg: '#FFE8CC', text: '#7C3D00', border: '#F5C68A' };
        return { bg: '#FADADD', text: '#C0392B', border: '#F5AAAF' };
    };

    const formatReturn = (v: number | undefined) => v === undefined || v === null ? '-' : `${(v * 100).toFixed(1)}%`;
    const returnColor = (v: number | undefined) => v === undefined || v === null ? '#A09880' : v > 0 ? '#1C7A3F' : v < 0 ? '#C0392B' : '#7A7060';

    const getRSChange = () => {
        if (historyData.length < 2) return { value: 0, isPositive: true };
        const change = (historyData[historyData.length - 1]?.rs_rating || 0) - (historyData[0]?.rs_rating || 0);
        return { value: change, isPositive: change >= 0 };
    };
    const rsChange = getRSChange();

    // Shared input style
    const inputStyle = { backgroundColor: '#F5F0E8', border: '1px solid #D9D2C3', color: '#2C2416' };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#EDE8DC', color: '#2C2416', fontFamily: 'system-ui, sans-serif' }}>

            {/* ── Sidebar ── */}
            <div style={{
                width: sidebarCollapsed ? '64px' : '295px',
                flexShrink: 0,
                backgroundColor: '#FDFAF5',
                borderRight: '1px solid #D9D2C3',
                boxShadow: '2px 0 8px rgba(44,36,22,0.06)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'width 0.3s',
                position: 'relative',
            }}>
                {/* Toggle button */}
                <button
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    style={{
                        position: 'absolute', right: '-12px', top: '24px', zIndex: 10,
                        width: '24px', height: '24px', borderRadius: '50%',
                        backgroundColor: '#1C3D2E', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(28,61,46,0.3)',
                    }}
                >
                    <ChevronRight size={13} color="#D4EDDA" style={{ transform: sidebarCollapsed ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.3s' }} />
                </button>

                {!sidebarCollapsed && (
                    <>
                        {/* Header */}
                        <div style={{ padding: '20px', borderBottom: '1px solid #E8E2D5' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#1C3D2E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <BarChart3 size={20} color="#A8D5B5" />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '15px', color: '#2C2416' }}>RS Screener</div>
                                    <div style={{ fontSize: '11px', color: '#7A7060' }}>Relative Strength Analysis</div>
                                </div>
                            </div>

                            {/* Search */}
                            <div style={{ position: 'relative', marginBottom: '14px' }}>
                                <Search size={14} color="#A09880" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
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
                                <Filter size={12} color="#A09880" />
                                <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#A09880' }}>Quick Filters</span>
                            </div>

                            {/* Filter grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                                {[{ label: '90+', range: [90, 100] }, { label: '80+', range: [80, 100] }, { label: '70+', range: [70, 100] }, { label: '50+', range: [51, 100] }, { label: '<50', range: [0, 50] }, { label: 'All', range: [0, 100] }].map(f => {
                                    const active = filterRange[0] === f.range[0] && filterRange[1] === f.range[1];
                                    return (
                                        <button key={f.label} onClick={() => setFilterRange(f.range as [number, number])} style={{
                                            padding: '8px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                                            backgroundColor: active ? '#1C3D2E' : '#F5F0E8',
                                            color: active ? '#D4EDDA' : '#7A7060',
                                            border: `1px solid ${active ? '#1C3D2E' : '#D9D2C3'}`,
                                        }}>
                                            {f.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Stock list */}
                        <div style={{ overflowY: 'auto', flex: 1, padding: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px 8px' }}>
                                <span style={{ fontSize: '11px', color: '#A09880' }}>{filteredStocks.length} stocks</span>
                                <Sparkles size={11} color="#2D6A4F" />
                            </div>

                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                                    <Loader2 size={28} color="#2D6A4F" style={{ margin: '0 auto 8px', animation: 'spin 1s linear infinite' }} />
                                    <p style={{ fontSize: '12px', color: '#A09880' }}>Loading stocks...</p>
                                </div>
                            ) : filteredStocks.length === 0 ? (
                                <p style={{ fontSize: '12px', color: '#A09880', textAlign: 'center', padding: '32px 0' }}>No stocks found</p>
                            ) : filteredStocks.map(stock => {
                                const isSelected = selectedStock?.symbol === stock.symbol;
                                const badge = getRSBadge(stock.rs_rating);
                                return (
                                    <div key={stock.symbol} onClick={() => setSelectedStock(stock)} style={{
                                        marginBottom: '6px', padding: '12px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid',
                                        backgroundColor: isSelected ? '#E8F5EE' : '#FDFAF5',
                                        borderColor: isSelected ? '#2D6A4F' : '#E8E2D5',
                                        boxShadow: isSelected ? '0 1px 6px rgba(28,61,46,0.12)' : 'none',
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                            <div style={{ flex: 1, minWidth: 0, marginRight: '8px' }}>
                                                <div style={{ fontWeight: 700, fontSize: '13px', color: '#2C2416', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stock.company_name || stock.symbol}</div>
                                                <div style={{ fontSize: '11px', color: '#A09880', fontFamily: 'monospace' }}>{stock.symbol}</div>
                                            </div>
                                            <div style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 900, backgroundColor: badge.bg, color: badge.text, border: `1px solid ${badge.border}` }}>
                                                {stock.rs_rating}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                                            <span style={{ color: '#A09880' }}>12M Return</span>
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
                        <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: '#1C3D2E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BarChart3 size={16} color="#A8D5B5" />
                        </div>
                        <Search size={14} color="#A09880" />
                        <Filter size={14} color="#A09880" />
                        <Sparkles size={12} color="#2D6A4F" />
                    </div>
                )}
            </div>

            {/* ── Main Content ── */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {selectedStock ? (
                    <>
                        {/* Top bar */}
                        <div style={{ padding: '20px 32px', backgroundColor: '#FDFAF5', borderBottom: '1px solid #D9D2C3', boxShadow: '0 1px 4px rgba(44,36,22,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                {(() => {
                                    const b = getRSBadge(selectedStock.rs_rating); return (
                                        <div style={{ fontSize: '28px', fontWeight: 900, padding: '12px 20px', borderRadius: '16px', backgroundColor: b.bg, color: b.text, border: `1px solid ${b.border}` }}>
                                            {selectedStock.rs_rating}
                                        </div>
                                    );
                                })()}
                                <div>
                                    <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#2C2416', marginBottom: '4px' }}>{selectedStock.company_name}</h1>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '13px', fontFamily: 'monospace', color: '#7A7060' }}>{selectedStock.symbol}</span>
                                        <span style={{ color: '#D9D2C3' }}>•</span>
                                        <span style={{
                                            fontSize: '12px', fontWeight: 700, padding: '3px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '4px',
                                            backgroundColor: rsChange.isPositive ? '#D4EDDA' : '#FADADD',
                                            color: rsChange.isPositive ? '#1C7A3F' : '#C0392B',
                                            border: `1px solid ${rsChange.isPositive ? '#A8D5B5' : '#F5AAAF'}`,
                                        }}>
                                            {rsChange.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                            {rsChange.isPositive ? '+' : ''}{rsChange.value.toFixed(1)} pts ({selectedPeriod})
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Period selector */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px', borderRadius: '14px', backgroundColor: '#EDE8DC', border: '1px solid #D9D2C3' }}>
                                {PERIOD_OPTIONS.map(opt => {
                                    const active = selectedPeriod === opt.label;
                                    return (
                                        <button key={opt.label} onClick={() => handlePeriodChange(opt.label)} style={{
                                            padding: '6px 12px', fontSize: '12px', fontWeight: 700, borderRadius: '10px', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                                            backgroundColor: active ? '#1C3D2E' : 'transparent',
                                            color: active ? '#D4EDDA' : '#7A7060',
                                            boxShadow: active ? '0 1px 4px rgba(28,61,46,0.3)' : 'none',
                                        }}>{opt.label}</button>
                                    );
                                })}
                                <div style={{ position: 'relative' }} ref={datePickerRef}>
                                    <button onClick={() => setShowDatePicker(!showDatePicker)} style={{
                                        display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 700, borderRadius: '10px', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                                        backgroundColor: showDatePicker || selectedPeriod === 'Custom' ? '#1C3D2E' : 'transparent',
                                        color: showDatePicker || selectedPeriod === 'Custom' ? '#D4EDDA' : '#7A7060',
                                    }}>
                                        <Calendar size={13} />
                                        {selectedPeriod === 'Custom' && <span>Custom</span>}
                                    </button>
                                    {showDatePicker && (
                                        <div style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, width: '340px', backgroundColor: '#FDFAF5', border: '1px solid #D9D2C3', borderRadius: '16px', boxShadow: '0 8px 32px rgba(44,36,22,0.12)', padding: '20px', zIndex: 50 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                                <span style={{ fontSize: '14px', fontWeight: 700, color: '#2C2416' }}>Custom Date Range</span>
                                                <button onClick={() => setShowDatePicker(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A09880' }}><X size={16} /></button>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                                                {[{ label: 'Start Date', val: customStartDate, set: setCustomStartDate }, { label: 'End Date', val: customEndDate, set: setCustomEndDate }].map(({ label, val, set }) => (
                                                    <div key={label}>
                                                        <label style={{ display: 'block', fontSize: '11px', color: '#7A7060', marginBottom: '6px', fontWeight: 600 }}>{label}</label>
                                                        <input type="date" value={val} onChange={e => set(e.target.value)} style={{ ...inputStyle, width: '100%', padding: '8px 10px', borderRadius: '10px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                                                    </div>
                                                ))}
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                <button onClick={() => { setCustomStartDate(''); setCustomEndDate(''); setShowDatePicker(false); }} style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '10px', border: '1px solid #D9D2C3', backgroundColor: '#F5F0E8', color: '#7A7060', cursor: 'pointer' }}>Cancel</button>
                                                <button onClick={handleApplyCustomRange} disabled={!customStartDate || !customEndDate} style={{
                                                    padding: '8px 16px', fontSize: '13px', fontWeight: 700, borderRadius: '10px', border: 'none', cursor: !customStartDate || !customEndDate ? 'not-allowed' : 'pointer',
                                                    backgroundColor: !customStartDate || !customEndDate ? '#E8E2D5' : '#1C3D2E',
                                                    color: !customStartDate || !customEndDate ? '#A09880' : '#D4EDDA',
                                                }}>Apply Range</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div style={{ flex: 1, padding: '28px', overflowY: 'auto', backgroundColor: '#EDE8DC' }}>
                            {/* Chart */}
                            <div style={{ backgroundColor: '#FDFAF5', border: '1px solid #D9D2C3', borderRadius: '20px', padding: '20px', marginBottom: '20px', boxShadow: '0 1px 6px rgba(44,36,22,0.06)', height: '440px', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ marginBottom: '16px' }}>
                                    <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#2C2416', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '3px', height: '20px', backgroundColor: '#2D6A4F', borderRadius: '2px' }} />
                                        RS Rating History
                                    </h2>
                                    <p style={{ fontSize: '12px', color: '#A09880', marginTop: '2px' }}>{historyData.length} data points • {selectedPeriod}</p>
                                </div>
                                <div style={{ flex: 1 }}>
                                    {historyLoading ? (
                                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <div style={{ textAlign: 'center' }}>
                                                <Loader2 size={40} color="#2D6A4F" style={{ margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
                                                <p style={{ fontSize: '13px', color: '#A09880' }}>Loading chart data...</p>
                                            </div>
                                        </div>
                                    ) : historyData.length === 0 ? (
                                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <div style={{ textAlign: 'center' }}>
                                                <BarChart3 size={40} color="#D9D2C3" style={{ margin: '0 auto 12px' }} />
                                                <p style={{ fontSize: '13px', color: '#A09880' }}>No data available for this period</p>
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
                                    <div key={item.label} style={{ backgroundColor: '#FDFAF5', border: '1px solid #D9D2C3', borderRadius: '16px', padding: '20px', boxShadow: '0 1px 4px rgba(44,36,22,0.05)' }}>
                                        <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#A09880', display: 'block', marginBottom: '8px' }}>{item.label}</span>
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
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EDE8DC' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '20px', backgroundColor: '#E8F5EE', border: '1px solid #A8D5B5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                                <TrendingUp size={36} color="#2D6A4F" />
                            </div>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#2C2416', marginBottom: '6px' }}>Select a Stock</h3>
                            <p style={{ color: '#A09880' }}>Choose a stock from the sidebar to view detailed RS analysis</p>
                        </div>
                    </div>
                )}
            </div>

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}