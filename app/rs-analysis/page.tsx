'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Calendar, X } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { createChart, ColorType, CrosshairMode, AreaSeries } from 'lightweight-charts';

// ─── DESIGN TOKENS: Black & White ────────────────────────────────
// Page bg: #FFFFFF  |  Card bg: #FFFFFF  |  Border: #E5E7EB
// Accent dark: #111827  |  Accent mid: #374151  |  Accent light: #6B7280
// Text primary: #111827  |  secondary: #4B5563  |  muted: #9CA3AF
// Badge green: bg #DCFCE7 text #15803D border #BBF7D0
// Badge red:   bg #FEE2E2 text #B91C1C border #FECACA
// Badge amber: bg #FEF3C7 text #B45309 border #FDE68A
// ─────────────────────────────────────────────────────────────────────────────

function RSHistoryChart({ data, period }: { data: any[]; period: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const chartRef = useRef<any>(null);

    useEffect(() => {
        if (!ref.current || data.length === 0) return;
        if (chartRef.current) { chartRef.current.remove(); chartRef.current = null; }

        const chart = createChart(ref.current, {
            layout: { background: { type: ColorType.Solid, color: 'transparent' }, textColor: '#6B7280', fontFamily: 'system-ui, sans-serif' },
            grid: { vertLines: { color: 'rgba(229,231,235,0.6)' }, horzLines: { color: 'rgba(229,231,235,0.6)' } },
            crosshair: { mode: CrosshairMode.Magnet, vertLine: { labelBackgroundColor: '#111827' }, horzLine: { labelBackgroundColor: '#111827' } },
            rightPriceScale: { borderColor: '#E5E7EB' },
            timeScale: { borderColor: '#E5E7EB', timeVisible: false, fixLeftEdge: true, fixRightEdge: true },
        });
        const series = chart.addSeries(AreaSeries, {
            lineColor: '#2D6A4F', topColor: 'rgba(45,106,79,0.18)', bottomColor: 'rgba(45,106,79,0)', lineWidth: 2,
            priceLineVisible: false, crosshairMarkerVisible: true, crosshairMarkerRadius: 5,
        });
        const unique = new Map();
        [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).forEach(d => {
            const t = d.date.includes('T') ? d.date.split('T')[0] : d.date;
            unique.set(t, { time: t, value: d.rs_rating });
        });
        series.setData(Array.from(unique.values()));
        chart.timeScale().fitContent();
        chartRef.current = chart;
        const ro = new ResizeObserver(entries => {
            if (ref.current && chartRef.current) {
                const { width, height } = entries[0].contentRect;
                chartRef.current.applyOptions({ width, height });
            }
        });
        ro.observe(ref.current);
        return () => { ro.disconnect(); if (chartRef.current) { chartRef.current.remove(); chartRef.current = null; } };
    }, [data, period]);

    return <div ref={ref} className="w-full h-full" />;
}

interface StockRS {
    symbol: string; date: string; rs_rating: number; rs_raw: number | null;
    return_3m: number | null; return_6m: number | null; return_9m: number | null; return_12m: number | null;
    rank_3m: number | null; rank_6m: number | null; rank_9m: number | null; rank_12m: number | null;
    company_name: string | null; industry_group: string | null;
}
interface Stats { total_records: number; date_range: { start: string; end: string }; latest_date: string; stocks_count: number; avg_rs: number; }
interface Industry { name: string; count: number; }

const PERIOD_OPTIONS = [
    { label: '5D', type: 'days', value: 5 }, { label: '1M', type: 'months', value: 1 },
    { label: '6M', type: 'months', value: 6 }, { label: 'YTD', type: 'ytd', value: 0 },
    { label: '1Y', type: 'years', value: 1 }, { label: '5Y', type: 'years', value: 5 },
    { label: '10Y', type: 'years', value: 10 }, { label: 'MAX', type: 'max', value: 0 },
];

const calcStart = (opt: { label: string; type: string; value: number }): Date => {
    const today = new Date(); const r = new Date(today);
    switch (opt.type) {
        case 'days': r.setDate(r.getDate() - opt.value); break;
        case 'months': r.setMonth(r.getMonth() - opt.value); if (r.getDate() !== today.getDate()) r.setDate(0); break;
        case 'years': r.setFullYear(r.getFullYear() - opt.value); if (r.getDate() !== today.getDate()) r.setDate(0); break;
        case 'ytd': r.setMonth(0, 1); break;
        case 'max': r.setFullYear(r.getFullYear() - 25); break;
    }
    return r;
};
const toDateStr = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export default function RSAnalysisPage() {
    const [stocks, setStocks] = useState<StockRS[]>([]);
    const [filtered, setFiltered] = useState<StockRS[]>([]);
    const [selected, setSelected] = useState<StockRS | null>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<Stats | null>(null);
    const [industries, setIndustries] = useState<Industry[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [histLoading, setHistLoading] = useState(false);
    const [period, setPeriod] = useState('1Y');
    const [showPicker, setShowPicker] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [search, setSearch] = useState('');
    const [minRS, setMinRS] = useState(0); const [maxRS, setMaxRS] = useState(100);
    const [selIndustry, setSelIndustry] = useState('');
    const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
    const pickerRef = useRef<HTMLDivElement>(null);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    useEffect(() => {
        const h = (e: MouseEvent) => { if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setShowPicker(false); };
        document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h);
    }, []);

    useEffect(() => { fetchData(); }, []);
    useEffect(() => {
        let r = stocks.filter(s => s.rs_rating >= minRS && s.rs_rating <= maxRS);
        if (selIndustry) r = r.filter(s => s.industry_group === selIndustry);
        if (search) { const q = search.toUpperCase(); r = r.filter(s => s.symbol.includes(q) || (s.company_name && s.company_name.toUpperCase().includes(q))); }
        setFiltered(r);
    }, [stocks, search, minRS, maxRS, selIndustry]);
    useEffect(() => { if (selected) fetchHistory(selected.symbol); }, [selected, period, startDate, endDate]);

    const headers = () => {
        const token = localStorage.getItem('token');
        const h: HeadersInit = { 'Content-Type': 'application/json' };
        if (token) h['Authorization'] = `Bearer ${token}`;
        return h;
    };

    const fetchData = async () => {
        try {
            const res = await fetch(`${API_URL}/api/rs/latest?limit=500`, { headers: headers(), cache: 'no-store' });
            if (!res.ok) return;
            const d = await res.json();
            let data: StockRS[] = (d.data || []).map((s: any) => ({ ...s, rs_rating: s.rs_rating ?? s.RS ?? 0, company_name: s.company_name ?? s.Company ?? s.symbol, return_3m: s.return_3m ?? null, rank_3m: s.rank_3m ?? null }));
            setStocks(data);
            if (data.length > 0) {
                setSelected(data[0]);
                const avg = data.reduce((a, s) => a + s.rs_rating, 0) / data.length;
                setStats({ total_records: d.total_count || data.length, date_range: { start: '-', end: '-' }, latest_date: d.date || new Date().toISOString().split('T')[0], stocks_count: data.length, avg_rs: avg });
                const im = new Map<string, number>();
                data.forEach(s => { if (s.industry_group) im.set(s.industry_group, (im.get(s.industry_group) || 0) + 1); });
                setIndustries(Array.from(im.entries()).map(([n, c]) => ({ name: n, count: c })).sort((a, b) => b.count - a.count));
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const fetchHistory = async (symbol: string) => {
        setHistLoading(true);
        try {
            let from = ''; const today = toDateStr(new Date()); let to = today;
            if (period === 'Custom' && startDate && endDate) { from = startDate; to = endDate; }
            else { const opt = PERIOD_OPTIONS.find(p => p.label === period); if (opt) from = toDateStr(calcStart(opt)); }
            const params = new URLSearchParams();
            if (from) params.append('from_date', from);
            if (to) params.append('to_date', to);
            const url = `${API_URL}/api/rs/${symbol}${params.toString() ? '?' + params : ''}`;
            const res = await fetch(url, { headers: headers(), cache: 'no-store' });
            if (res.ok) { const d = await res.json(); setHistory(Array.isArray(d) ? d : (d.data || [])); }
        } catch (e) { console.error(e); }
        finally { setHistLoading(false); }
    };

    const applyCustom = () => {
        if (startDate && endDate) {
            if (new Date(startDate) > new Date(endDate)) { alert('Start date must be before end date'); return; }
            setPeriod('Custom'); setShowPicker(false);
        }
    };

    const formatPct = (v: number | null) => v === null || v === undefined ? '-' : `${(v * 100).toFixed(1)}%`;
    const rsColor = (v: number) => v >= 90 ? '#15803D' : v >= 80 ? '#374151' : v >= 70 ? '#B45309' : '#B91C1C';
    const rsBg = (v: number) => v >= 90 ? { bg: '#DCFCE7', text: '#15803D', border: '#BBF7D0' } : v >= 80 ? { bg: '#F3F4F6', text: '#374151', border: '#E5E7EB' } : v >= 70 ? { bg: '#FEF3C7', text: '#B45309', border: '#FDE68A' } : { bg: '#FEE2E2', text: '#B91C1C', border: '#FECACA' };
    const retColor = (v: number | null) => !v ? '#9CA3AF' : v >= 0 ? '#15803D' : '#B91C1C';

    const distribution = [
        { name: 'Strong (90-99)', value: stocks.filter(s => s.rs_rating >= 90).length, color: '#15803D' },
        { name: 'Good (80-89)', value: stocks.filter(s => s.rs_rating >= 80 && s.rs_rating < 90).length, color: '#374151' },
        { name: 'Neutral (70-79)', value: stocks.filter(s => s.rs_rating >= 70 && s.rs_rating < 80).length, color: '#B45309' },
        { name: 'Weak (<70)', value: stocks.filter(s => s.rs_rating < 70).length, color: '#B91C1C' },
    ];

    // Shared card style
    const card = { backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' };

    if (loading) return (
        <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', border: '4px solid #E5E7EB', borderTopColor: '#374151', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                <p style={{ color: '#6B7280', fontSize: '14px' }}>Loading RS Analysis...</p>
            </div>
            <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', color: '#111827', padding: '28px', fontFamily: 'system-ui, sans-serif' }}>

            {/* Header */}
            <div style={{ marginBottom: '28px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#111827', marginBottom: '6px' }}>RS Analysis</h1>
                <p style={{ color: '#6B7280', fontSize: '14px' }}>Relative Strength Analysis using weighted period ranks</p>
            </div>

            {/* Stats */}
            {stats && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '28px' }}>
                    {[
                        { label: 'Total Records', val: stats.total_records.toLocaleString(), color: '#374151' },
                        { label: 'Stocks Count', val: stats.stocks_count, color: '#111827' },
                        { label: 'Latest Date', val: stats.latest_date, color: '#4B5563' },
                        { label: 'Average RS', val: stats.avg_rs.toFixed(1), color: '#B45309' },
                    ].map(item => (
                        <div key={item.label} style={{ ...card, padding: '16px' }}>
                            <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '4px' }}>{item.label}</p>
                            <p style={{ fontSize: '22px', fontWeight: 700, color: item.color }}>{item.val}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Filters */}
            <div style={{ ...card, padding: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Search</label>
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Symbol or Name..." style={{ width: '100%', padding: '8px 10px', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', color: '#111827', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Min RS: {minRS}</label>
                        <input type="range" min="0" max="99" value={minRS} onChange={e => setMinRS(Number(e.target.value))} style={{ width: '100%', accentColor: '#374151' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Max RS: {maxRS}</label>
                        <input type="range" min="1" max="100" value={maxRS} onChange={e => setMaxRS(Number(e.target.value))} style={{ width: '100%', accentColor: '#374151' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Industry</label>
                        <select value={selIndustry} onChange={e => setSelIndustry(e.target.value)} style={{ width: '100%', padding: '8px 10px', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '13px', color: '#111827', outline: 'none' }}>
                            <option value="">All Industries</option>
                            {industries.map(i => <option key={i.name} value={i.name}>{i.name} ({i.count})</option>)}
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>View</label>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            {['table', 'cards'].map(m => (
                                <button key={m} onClick={() => setViewMode(m as any)} style={{
                                    flex: 1, padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.2s',
                                    backgroundColor: viewMode === m ? '#111827' : '#F9FAFB',
                                    color: viewMode === m ? '#FFFFFF' : '#6B7280',
                                    border: `1px solid ${viewMode === m ? '#111827' : '#E5E7EB'}`,
                                }}>
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <p style={{ marginTop: '10px', fontSize: '12px', color: '#9CA3AF' }}>Showing {filtered.length} of {stocks.length} stocks</p>
            </div>

            {/* Main Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '20px' }}>

                {/* Left: Stock List */}
                <div>
                    {viewMode === 'table' ? (
                        <div style={{ ...card, overflow: 'hidden' }}>
                            <div style={{ overflowX: 'auto', maxHeight: '600px', overflowY: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                                        <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                                            {['Symbol', 'Company', 'RS', '3M', '6M', '9M', '12M', 'Industry'].map(h => (
                                                <th key={h} style={{ padding: '12px 14px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#9CA3AF', textAlign: h === 'RS' || h === '3M' || h === '6M' || h === '9M' || h === '12M' ? 'center' : 'left' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map((stock, i) => {
                                            const isSelected = selected?.symbol === stock.symbol;
                                            const b = rsBg(stock.rs_rating);
                                            return (
                                                <tr key={stock.symbol} onClick={() => setSelected(stock)} style={{ borderBottom: '1px solid #F3F4F6', cursor: 'pointer', backgroundColor: isSelected ? '#F3F4F6' : i % 2 === 0 ? '#FFFFFF' : '#F9FAFB', transition: 'background-color 0.15s' }}>
                                                    <td style={{ padding: '10px 14px' }}>
                                                        <Link href={`/stocks/${stock.symbol}`} style={{ color: '#111827', fontWeight: 600, textDecoration: 'none', fontSize: '13px' }} onClick={e => e.stopPropagation()}>{stock.symbol}</Link>
                                                    </td>
                                                    <td style={{ padding: '10px 14px', fontSize: '12px', color: '#4B5563', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stock.company_name || '-'}</td>
                                                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                                                        <span style={{ fontWeight: 700, fontSize: '15px', color: b.text }}>{stock.rs_rating}</span>
                                                    </td>
                                                    {[stock.rank_3m, stock.rank_6m, stock.rank_9m, stock.rank_12m].map((r, j) => (
                                                        <td key={j} style={{ padding: '10px 14px', textAlign: 'center', fontSize: '12px', color: '#4B5563' }}>{r ?? '-'}</td>
                                                    ))}
                                                    <td style={{ padding: '10px 14px', fontSize: '11px', color: '#9CA3AF', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stock.industry_group || '-'}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', maxHeight: '600px', overflowY: 'auto' }}>
                            {filtered.map(stock => {
                                const b = rsBg(stock.rs_rating);
                                const isSel = selected?.symbol === stock.symbol;
                                return (
                                    <div key={stock.symbol} onClick={() => setSelected(stock)} style={{ ...card, padding: '16px', cursor: 'pointer', borderColor: isSel ? '#111827' : '#E5E7EB', outline: isSel ? '2px solid #111827' : 'none', transition: 'all 0.15s' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                            <div>
                                                <Link href={`/stocks/${stock.symbol}`} style={{ color: '#111827', fontWeight: 700, fontSize: '16px', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>{stock.symbol}</Link>
                                                <p style={{ fontSize: '11px', color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '130px' }}>{stock.company_name || '-'}</p>
                                            </div>
                                            <span style={{ fontSize: '24px', fontWeight: 900, color: b.text }}>{stock.rs_rating}</span>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', textAlign: 'center', fontSize: '11px' }}>
                                            {[['3M', stock.rank_3m], ['6M', stock.rank_6m], ['9M', stock.rank_9m], ['12M', stock.rank_12m]].map(([l, v]) => (
                                                <div key={l as string}>
                                                    <p style={{ color: '#9CA3AF' }}>{l}</p>
                                                    <p style={{ color: '#4B5563', fontWeight: 600 }}>{v ?? '-'}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right: Detail Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {selected && (
                        <div style={{ ...card, padding: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div>
                                    <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#111827', marginBottom: '2px' }}>{selected.symbol}</h2>
                                    <p style={{ fontSize: '13px', color: '#4B5563' }}>{selected.company_name || 'No Name'}</p>
                                </div>
                                {(() => {
                                    const b = rsBg(selected.rs_rating); return (
                                        <div style={{ fontSize: '32px', fontWeight: 900, color: b.text, padding: '8px 16px', borderRadius: '12px', backgroundColor: b.bg, border: `1px solid ${b.border}` }}>
                                            {selected.rs_rating}
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Return grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                                {[
                                    { p: '3M', ret: selected.return_3m, rank: selected.rank_3m },
                                    { p: '6M', ret: selected.return_6m, rank: selected.rank_6m },
                                    { p: '9M', ret: selected.return_9m, rank: selected.rank_9m },
                                    { p: '12M', ret: selected.return_12m, rank: selected.rank_12m },
                                ].map(item => (
                                    <div key={item.p} style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '12px' }}>
                                        <p style={{ fontSize: '11px', color: '#9CA3AF', marginBottom: '2px' }}>{item.p} Return</p>
                                        <p style={{ fontSize: '16px', fontWeight: 700, color: retColor(item.ret) }}>{formatPct(item.ret)}</p>
                                        <p style={{ fontSize: '11px', color: '#9CA3AF' }}>Rank: {item.rank ?? '-'}</p>
                                    </div>
                                ))}
                            </div>

                            {/* History chart */}
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#4B5563' }}>RS History</span>
                                    <div style={{ display: 'flex', gap: '2px', backgroundColor: '#F9FAFB', padding: '3px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                                        {PERIOD_OPTIONS.map(opt => {
                                            const active = period === opt.label;
                                            return (
                                                <button key={opt.label} onClick={() => { setPeriod(opt.label); setShowPicker(false); }} style={{
                                                    padding: '4px 8px', fontSize: '11px', fontWeight: 700, borderRadius: '6px', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                                                    backgroundColor: active ? '#111827' : 'transparent',
                                                    color: active ? '#FFFFFF' : '#9CA3AF',
                                                }}>
                                                    {opt.label}
                                                </button>
                                            );
                                        })}
                                        <div style={{ position: 'relative' }} ref={pickerRef}>
                                            <button onClick={() => setShowPicker(!showPicker)} style={{
                                                display: 'flex', alignItems: 'center', padding: '4px 8px', fontSize: '11px', fontWeight: 700, borderRadius: '6px', border: 'none', cursor: 'pointer', gap: '3px', transition: 'all 0.2s',
                                                backgroundColor: showPicker || period === 'Custom' ? '#111827' : 'transparent',
                                                color: showPicker || period === 'Custom' ? '#FFFFFF' : '#9CA3AF',
                                            }}>
                                                <Calendar style={{ width: '11px', height: '11px' }} />
                                                {period === 'Custom' && 'Custom'}
                                            </button>
                                            {showPicker && (
                                                <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: '280px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', padding: '16px', zIndex: 50 }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>Custom Range</span>
                                                        <button onClick={() => setShowPicker(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}><X style={{ width: '14px', height: '14px' }} /></button>
                                                    </div>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                                                        {[{ label: 'Start', v: startDate, s: setStartDate }, { label: 'End', v: endDate, s: setEndDate }].map(({ label, v, s }) => (
                                                            <div key={label}>
                                                                <label style={{ display: 'block', fontSize: '11px', color: '#6B7280', marginBottom: '4px' }}>{label}</label>
                                                                <input type="date" value={v} onChange={e => s(e.target.value)} style={{ width: '100%', padding: '6px 8px', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '12px', color: '#111827', outline: 'none', boxSizing: 'border-box' }} />
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <button onClick={applyCustom} disabled={!startDate || !endDate} style={{ width: '100%', padding: '8px', fontSize: '12px', fontWeight: 700, borderRadius: '8px', border: 'none', cursor: !startDate || !endDate ? 'not-allowed' : 'pointer', backgroundColor: !startDate || !endDate ? '#E5E7EB' : '#111827', color: !startDate || !endDate ? '#9CA3AF' : '#FFFFFF' }}>Apply</button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {histLoading ? (
                                    <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '3px solid #E5E7EB', borderTopColor: '#374151', animation: 'spin 1s linear infinite' }} />
                                    </div>
                                ) : history.length > 0 ? (
                                    <div style={{ height: '220px', width: '100%' }}>
                                        <RSHistoryChart data={history} period={period} />
                                    </div>
                                ) : (
                                    <p style={{ textAlign: 'center', padding: '40px 0', color: '#9CA3AF', fontSize: '13px' }}>No history data</p>
                                )}
                            </div>

                            <Link href={`/stocks/${selected.symbol}`} style={{ display: 'block', width: '100%', marginTop: '16px', padding: '10px', textAlign: 'center', backgroundColor: '#111827', color: '#FFFFFF', borderRadius: '10px', textDecoration: 'none', fontSize: '13px', fontWeight: 600, transition: 'background-color 0.2s', boxSizing: 'border-box' }}>
                                View Full Profile →
                            </Link>
                        </div>
                    )}

                    {/* Distribution chart */}
                    <div style={{ ...card, padding: '20px' }}>
                        <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#9CA3AF', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>RS Distribution</h3>
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie data={distribution} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={3} dataKey="value" label={({ name, value }) => `${value}`}>
                                    {distribution.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '10px', color: '#111827' }} />
                                <Legend verticalAlign="bottom" height={36} formatter={(v) => <span style={{ color: '#6B7280', fontSize: '11px' }}>{v}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
        </div>
    );
}