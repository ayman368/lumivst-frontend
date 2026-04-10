'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, AreaSeries, IChartApi, CrosshairMode } from 'lightweight-charts';
import { TrendingUp, Activity, BarChart2, Layers, BarChart3, Radio } from 'lucide-react';
import ExportButton from './_components/ExportButton';
import { API_BASE_URL } from '@/lib/api/config';

interface BreadthItem {
    time: string;
    total: number;
    pct_above_20: number;
    pct_above_50: number;
    pct_above_100: number;
    pct_above_200: number;
}

const CHART_CONFIGS = [
    {
        key: 'pct_above_20' as const,
        label: '20-Day',
        sublabel: 'Short-Term Momentum',
        badge: 'MA20',
        lineColor: '#0F7A5A',
        topColor: 'rgba(15,122,90,0.09)',
        glowColor: 'rgba(15,122,90,0.18)',
        accentLight: '#E6F5F0',
        icon: Activity,
        desc: 'Percentage of TASI constituents trading above their 20-day moving average',
    },
    {
        key: 'pct_above_50' as const,
        label: '50-Day',
        sublabel: 'Intermediate Trend',
        badge: 'MA50',
        lineColor: '#1560A8',
        topColor: 'rgba(21,96,168,0.08)',
        glowColor: 'rgba(21,96,168,0.18)',
        accentLight: '#E8F0FA',
        icon: TrendingUp,
        desc: 'Percentage of TASI constituents trading above their 50-day moving average',
    },
    {
        key: 'pct_above_100' as const,
        label: '100-Day',
        sublabel: 'Long-Term Foundation',
        badge: 'MA100',
        lineColor: '#A0600A',
        topColor: 'rgba(160,96,10,0.08)',
        glowColor: 'rgba(160,96,10,0.18)',
        accentLight: '#FBF3E6',
        icon: BarChart2,
        desc: 'Percentage of TASI constituents trading above their 100-day moving average',
    },
    {
        key: 'pct_above_200' as const,
        label: '200-Day',
        sublabel: 'Primary Trend Core',
        badge: 'MA200',
        lineColor: '#B02040',
        topColor: 'rgba(176,32,64,0.08)',
        glowColor: 'rgba(176,32,64,0.18)',
        accentLight: '#FAE8EC',
        icon: BarChart3,
        desc: 'Percentage of TASI constituents trading above their 200-day moving average',
    },
];

export default function MarketBreadthPage() {
    const [data, setData] = useState<BreadthItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tick, setTick] = useState(0);
    const [period, setPeriod] = useState('ALL');

    // ── ref for export capture ──────────────────────────────────────────────────
    const pageRef = useRef<HTMLDivElement>(null);

    const chartRefs = [
        useRef<HTMLDivElement>(null),
        useRef<HTMLDivElement>(null),
        useRef<HTMLDivElement>(null),
        useRef<HTMLDivElement>(null),
    ];
    const chartsRef = useRef<IChartApi[]>([]);

    useEffect(() => {
        const id = setInterval(() => setTick(t => t + 1), 1400);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                const API_URL = API_BASE_URL;
                const res = await fetch(`${API_URL}/api/market-breadth/percent-above-ma?period=${period}`);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = await res.json();
                if (json.data && Array.isArray(json.data)) setData(json.data);
                else throw new Error('Invalid data format');
            } catch (e: any) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [period]);

    useEffect(() => {
        if (data.length === 0) return;

        const baseChartOptions = {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#94A3B8',
                fontFamily: '"DM Sans", "Geist", sans-serif',
                fontSize: 10,
            },
            grid: {
                vertLines: { color: '#F1F4F8' },
                horzLines: { color: '#F1F4F8' },
            },
            rightPriceScale: {
                borderColor: '#E8ECF2',
                autoScale: true,
                scaleMargins: { top: 0.1, bottom: 0.1 },
            },
            timeScale: {
                borderColor: '#E8ECF2',
                timeVisible: true,
                fixLeftEdge: true,
                fixRightEdge: true,
            },
            crosshair: {
                mode: CrosshairMode.Normal,
                vertLine: {
                    width: 1 as any,
                    color: '#CBD5E1',
                    style: 0 as any,
                    labelBackgroundColor: '#1E293B',
                },
                horzLine: {
                    width: 1 as any,
                    color: '#CBD5E1',
                    style: 0 as any,
                    labelBackgroundColor: '#1E293B',
                },
            },
            height: 210,
        };

        chartsRef.current.forEach(c => c.remove());
        chartsRef.current = [];

        const syncCrosshair = (source: IChartApi, targets: IChartApi[]) => {
            source.timeScale().subscribeVisibleLogicalRangeChange(range => {
                if (range) targets.forEach(c => c.timeScale().setVisibleLogicalRange(range));
            });
        };

        CHART_CONFIGS.forEach((cfg, i) => {
            const container = chartRefs[i].current;
            if (!container) return;
            container.innerHTML = '';

            const chart = createChart(container, baseChartOptions);
            chartsRef.current.push(chart);

            const series = chart.addSeries(AreaSeries, {
                lineColor: cfg.lineColor,
                topColor: cfg.topColor,
                bottomColor: 'rgba(0,0,0,0)',
                lineWidth: 1.5 as any,
                crosshairMarkerVisible: true,
                crosshairMarkerRadius: 4,
                crosshairMarkerBorderColor: cfg.lineColor,
                crosshairMarkerBackgroundColor: '#FFFFFF',
                lastValueVisible: true,
                priceLineVisible: false,
                autoscaleInfoProvider: () => ({ priceRange: { minValue: 0, maxValue: 100 } }),
            });

            series.setData(
                data.map(item => ({ time: item.time, value: item[cfg.key] as number })) as any
            );

            [20, 50, 80].forEach(level =>
                series.createPriceLine({
                    price: level,
                    color: '#E2E8F0',
                    lineWidth: 1,
                    lineStyle: 1,
                    axisLabelVisible: false,
                })
            );

            chart.timeScale().fitContent();
        });

        const allCharts = chartsRef.current;
        allCharts.forEach(c => syncCrosshair(c, allCharts.filter(x => x !== c)));

        const handleResize = () => {
            chartsRef.current.forEach((chart, i) => {
                const el = chartRefs[i].current;
                if (el) chart.applyOptions({ width: el.clientWidth });
            });
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
            chartsRef.current.forEach(c => c.remove());
            chartsRef.current = [];
        };
    }, [data]);

    if (loading && data.length === 0) return (
        <div style={S.fullscreen}>
            <style>{GLOBAL_CSS}</style>
            <div style={S.loadingWrap}>
                <svg width="36" height="36" viewBox="0 0 36 36" style={{ animation: 'spin 1s linear infinite' }}>
                    <circle cx="18" cy="18" r="15" fill="none" stroke="#E2E8F0" strokeWidth="2" />
                    <path d="M18 3 A15 15 0 0 1 33 18" fill="none" stroke="#0F7A5A" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <p style={{ fontSize: '11px', color: '#94A3B8', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: '20px', fontFamily: '"DM Sans", sans-serif', fontWeight: 500 }}>
                    Loading market data
                </p>
            </div>
        </div>
    );

    if (error) return (
        <div style={S.fullscreen}>
            <style>{GLOBAL_CSS}</style>
            <div style={S.errorCard}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <Activity size={18} color="#B02040" />
                </div>
                <p style={{ fontSize: '13px', color: '#B02040', fontFamily: '"DM Sans", sans-serif', fontWeight: 500 }}>Connection Failed</p>
                <p style={{ fontSize: '11px', color: '#94A3B8', fontFamily: '"DM Sans", sans-serif', marginTop: '6px' }}>{error}</p>
            </div>
        </div>
    );

    const latest = data[data.length - 1];

    return (
        <div style={S.page}>
            <style>{GLOBAL_CSS}</style>

            {/* ── Header ── */}
            <header style={S.header}>
                <div style={S.headerInner}>
                    <div style={S.headerLeft}>
                        <div style={S.logoWrap}>
                            <svg width="18" height="18" viewBox="0 0 20 18" fill="none">
                                <rect x="0" y="10" width="3.5" height="8" rx="1" fill="#0F7A5A" />
                                <rect x="5.5" y="6" width="3.5" height="12" rx="1" fill="#1560A8" />
                                <rect x="11" y="2" width="3.5" height="16" rx="1" fill="#A0600A" />
                                <rect x="16.5" y="8" width="3.5" height="10" rx="1" fill="#B02040" opacity="0.8" />
                            </svg>
                        </div>
                        <div>
                            <div style={S.headerTitleRow}>
                                <h1 style={S.headerTitle}>Market Breadth</h1>
                                <div style={S.breadcrumbSep}>/</div>
                                <span style={S.breadcrumbSub}>TASI Analysis</span>
                                <span style={S.liveDot}>
                                    <span style={{
                                        width: '5px', height: '5px', borderRadius: '50%',
                                        background: '#0F7A5A',
                                        display: 'inline-block',
                                        opacity: tick % 2 === 0 ? 1 : 0.25,
                                        transition: 'opacity 0.5s ease',
                                    }} />
                                    Live
                                </span>
                            </div>
                            <p style={S.headerDesc}>Constituent breadth across moving average thresholds</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

                        {/* ── Period Selector ── */}
                        <div style={{ display: 'flex', background: '#F8FAFC', border: '1px solid #E8ECF2', padding: '4px', borderRadius: '10px', gap: '2px' }}>
                            {['5D', '1M', '6M', '1Y', '5Y', '10Y', 'ALL'].map(p => (
                                <button
                                    key={p}
                                    onClick={() => setPeriod(p)}
                                    style={{
                                        border: 'none',
                                        background: period === p ? '#FFFFFF' : 'transparent',
                                        color: period === p ? '#0F172A' : '#64748B',
                                        boxShadow: period === p ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                        padding: '6px 12px',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        fontFamily: '"DM Sans", sans-serif',
                                        transition: 'all 0.2s ease',
                                        opacity: period === p ? 1 : (loading ? 0.5 : 1),
                                    }}
                                    disabled={loading}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>

                        {/* ── Stats Row ── */}
                        <div style={S.statsRow}>
                            {CHART_CONFIGS.map((cfg, i) => {
                                const val = latest ? Math.round(latest[cfg.key] as number) : 0;
                                return (
                                    <div key={cfg.key} style={{ ...S.statBlock, ...(i > 0 ? { borderLeft: '1px solid #F1F5F9' } : {}) }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
                                            <span style={{ width: '7px', height: '7px', borderRadius: '2px', background: cfg.lineColor, display: 'inline-block', flexShrink: 0 }} />
                                            <span style={{ fontSize: '10px', color: '#94A3B8', fontFamily: '"DM Sans", sans-serif', fontWeight: 500, letterSpacing: '0.06em' }}>{cfg.badge}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '1px' }}>
                                            <span style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', fontFamily: '"DM Sans", sans-serif', lineHeight: 1, letterSpacing: '-0.02em' }}>{val}</span>
                                            <span style={{ fontSize: '11px', color: '#94A3B8', fontFamily: '"DM Sans", sans-serif' }}>%</span>
                                        </div>
                                        <div style={{ marginTop: '6px', height: '3px', borderRadius: '2px', background: '#F1F5F9', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', borderRadius: '2px', width: `${val}%`, background: cfg.lineColor, transition: 'width 0.6s ease' }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* ── Export Button ── */}
                        <ExportButton data={data} captureRef={pageRef as React.RefObject<HTMLElement>} />

                    </div>
                </div>
                <div style={S.headerRainbow} />
            </header>

            {/* ── Main (captured for export) ── */}
            <main ref={pageRef} style={S.main}>

                {/* Summary bar */}
                <div style={S.summaryBar}>
                    <div style={S.summaryBarInner}>
                        {CHART_CONFIGS.map((cfg, i) => {
                            const val = latest ? (latest[cfg.key] as number) : 50;
                            const rounded = Math.round(val);
                            const label = val >= 70 ? 'Bullish' : val <= 30 ? 'Bearish' : 'Neutral';
                            const dot = val >= 70 ? '#0F7A5A' : val <= 30 ? '#B02040' : '#A0600A';
                            const bg = val >= 70 ? '#E6F5F0' : val <= 30 ? '#FAE8EC' : '#FBF3E6';
                            return (
                                <div key={cfg.key} style={{ display: 'flex', alignItems: 'center', gap: '10px', ...(i > 0 ? { paddingLeft: '20px', borderLeft: '1px solid #E8ECF2' } : {}) }}>
                                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569', fontFamily: '"DM Sans", sans-serif' }}>{cfg.label} MA</span>
                                    <span style={{ fontSize: '11px', color: cfg.lineColor, fontWeight: 700, fontFamily: '"DM Sans", sans-serif' }}>{rounded}%</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: dot, fontFamily: '"DM Sans", sans-serif', background: bg, padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                                        <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: dot, display: 'inline-block' }} />
                                        {label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    <span style={{ fontSize: '10px', color: '#CBD5E1', fontFamily: '"DM Sans", sans-serif', flexShrink: 0 }}>
                        {latest?.time || '—'}
                    </span>
                </div>

                {/* Chart Grid */}
                <div style={S.grid}>
                    {CHART_CONFIGS.map((cfg, i) => {
                        const Icon = cfg.icon;
                        const val = latest ? (latest[cfg.key] as number).toFixed(1) : '—';
                        const numVal = latest ? (latest[cfg.key] as number) : 50;
                        const prev = data.length > 2 ? (data[data.length - 2][cfg.key] as number) : numVal;
                        const delta = Math.abs(numVal - prev).toFixed(1);
                        const isUp = numVal >= prev;

                        return (
                            <div key={cfg.key} className="chart-card" style={{ ...S.card, '--accent': cfg.lineColor } as any}>

                                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: cfg.lineColor }} />

                                <div style={S.cardHead}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: cfg.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <Icon size={15} color={cfg.lineColor} strokeWidth={2} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', fontFamily: '"DM Sans", sans-serif', letterSpacing: '-0.01em' }}>
                                                {cfg.label} Moving Average
                                            </div>
                                            <div style={{ fontSize: '10px', color: '#94A3B8', fontFamily: '"DM Sans", sans-serif', marginTop: '2px', letterSpacing: '0.03em' }}>
                                                {cfg.sublabel}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
                                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                                            <span style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A', fontFamily: '"DM Sans", sans-serif', lineHeight: 1, letterSpacing: '-0.03em' }}>{val}</span>
                                            <span style={{ fontSize: '13px', color: '#94A3B8', fontWeight: 500 }}>%</span>
                                        </div>
                                        <span style={{
                                            fontSize: '10px', fontWeight: 600,
                                            color: isUp ? '#0F7A5A' : '#B02040',
                                            background: isUp ? '#E6F5F0' : '#FAE8EC',
                                            padding: '2px 7px', borderRadius: '4px',
                                            fontFamily: '"DM Sans", sans-serif',
                                            letterSpacing: '0.02em',
                                        }}>
                                            {isUp ? '▲' : '▼'} {delta}%
                                        </span>
                                    </div>
                                </div>

                                <div style={{ padding: '0 20px 10px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span style={{ fontSize: '9px', color: '#CBD5E1', fontFamily: '"DM Sans", sans-serif', letterSpacing: '0.1em', fontWeight: 500 }}>OVERSOLD · 30</span>
                                        <span style={{ fontSize: '9px', color: '#CBD5E1', fontFamily: '"DM Sans", sans-serif', letterSpacing: '0.1em', fontWeight: 500 }}>70 · OVERBOUGHT</span>
                                    </div>
                                    <div style={{ height: '5px', background: '#F1F5F9', borderRadius: '3px', position: 'relative', overflow: 'hidden' }}>
                                        <div style={{
                                            position: 'absolute', left: 0, top: 0, bottom: 0,
                                            width: `${numVal}%`,
                                            background: numVal >= 70
                                                ? `linear-gradient(90deg, #0F7A5A44, #0F7A5A)`
                                                : numVal <= 30
                                                    ? `linear-gradient(90deg, #B0204044, #B02040)`
                                                    : `linear-gradient(90deg, ${cfg.lineColor}44, ${cfg.lineColor})`,
                                            borderRadius: '3px',
                                            transition: 'width 0.8s cubic-bezier(0.16,1,0.3,1)',
                                        }} />
                                        {[30, 50, 70].map(t => (
                                            <div key={t} style={{ position: 'absolute', left: `${t}%`, top: 0, bottom: 0, width: '1px', background: 'rgba(255,255,255,0.7)', zIndex: 1 }} />
                                        ))}
                                    </div>
                                </div>

                                <div style={{ height: '1px', background: '#F8FAFC', marginLeft: '20px' }} />

                                <div style={{ padding: '8px 12px 4px', flex: 1 }}>
                                    <div ref={chartRefs[i]} style={{ width: '100%' }} />
                                </div>

                                <div style={S.cardFooter}>
                                    <span style={{ fontSize: '10px', color: '#CBD5E1', fontFamily: '"DM Sans", sans-serif', lineHeight: 1.4 }}>{cfg.desc}</span>
                                    <span style={{ fontSize: '10px', color: '#CBD5E1', fontFamily: '"DM Sans", sans-serif', whiteSpace: 'nowrap', flexShrink: 0, marginLeft: '12px', fontWeight: 500 }}>
                                        {data.length.toLocaleString()} obs
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer strip */}
                <div style={S.footerStrip}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Radio size={10} color="#CBD5E1" />
                        <span>TASI Market Breadth Index · Constituent moving average analysis · All values in percentage terms</span>
                    </div>
                    <span>SMA 20 · 50 · 100 · 200</span>
                </div>
            </main>
        </div>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const S: Record<string, React.CSSProperties> = {
    page: {
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        fontFamily: '"DM Sans", sans-serif',
    },
    fullscreen: {
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    loadingWrap: {
        display: 'flex', flexDirection: 'column', alignItems: 'center',
    },
    errorCard: {
        background: '#FFFFFF',
        border: '1px solid #FEE2E2',
        borderRadius: '12px',
        padding: '32px 40px',
        textAlign: 'center',
        maxWidth: '360px',
    },
    header: {
        background: '#FFFFFF',
        borderBottom: '1px solid #E8ECF2',
        position: 'sticky', top: 0, zIndex: 50,
        boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
    },
    headerInner: {
        maxWidth: '1600px', margin: '0 auto',
        padding: '0 28px',
        height: '68px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '32px',
    },
    headerLeft: {
        display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0,
    },
    logoWrap: {
        width: '38px', height: '38px',
        background: '#F8FAFC',
        border: '1px solid #E2E8F0',
        borderRadius: '9px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
    },
    headerTitleRow: {
        display: 'flex', alignItems: 'center', gap: '8px',
    },
    headerTitle: {
        fontSize: '15px', fontWeight: 700, color: '#0F172A',
        letterSpacing: '-0.02em', margin: 0,
        fontFamily: '"DM Sans", sans-serif',
    },
    breadcrumbSep: {
        fontSize: '14px', color: '#CBD5E1',
    },
    breadcrumbSub: {
        fontSize: '13px', color: '#64748B', fontWeight: 400,
        fontFamily: '"DM Sans", sans-serif',
    },
    liveDot: {
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        fontSize: '10px', fontWeight: 600, color: '#0F7A5A',
        background: '#E6F5F0',
        padding: '3px 8px', borderRadius: '4px',
        letterSpacing: '0.04em',
        marginLeft: '4px',
        fontFamily: '"DM Sans", sans-serif',
    },
    headerDesc: {
        fontSize: '11px', color: '#94A3B8', margin: '2px 0 0',
        fontFamily: '"DM Sans", sans-serif',
    },
    statsRow: {
        display: 'flex', alignItems: 'center',
        background: '#F8FAFC',
        border: '1px solid #E8ECF2',
        borderRadius: '10px',
        padding: '10px 18px',
        gap: '20px',
    },
    statBlock: {
        minWidth: '78px',
        paddingLeft: '20px',
    },
    headerRainbow: {
        height: '2px',
        background: 'linear-gradient(90deg, #0F7A5A 0%, #1560A8 33%, #A0600A 66%, #B02040 100%)',
        opacity: 0.3,
    },
    summaryBar: {
        background: '#FFFFFF',
        border: '1px solid #E8ECF2',
        borderRadius: '10px',
        padding: '10px 20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '16px',
        boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
    },
    summaryBarInner: {
        display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap',
    },
    main: {
        maxWidth: '1600px', margin: '0 auto',
        padding: '20px 28px 48px',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '14px',
    },
    card: {
        background: '#FFFFFF',
        border: '1px solid #E8ECF2',
        borderRadius: '12px',
        overflow: 'hidden',
        position: 'relative',
        paddingLeft: '3px',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 1px 3px rgba(15,23,42,0.05)',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
    },
    cardHead: {
        padding: '16px 20px 12px 20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    },
    cardFooter: {
        padding: '8px 20px 12px',
        borderTop: '1px solid #F1F5F9',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    },
    footerStrip: {
        marginTop: '16px',
        padding: '10px 18px',
        background: '#FFFFFF',
        border: '1px solid #E8ECF2',
        borderRadius: '8px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: '10px', color: '#CBD5E1', letterSpacing: '0.04em',
        fontFamily: '"DM Sans", sans-serif',
    },
};

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .chart-card:hover {
    box-shadow: 0 4px 20px rgba(15,23,42,0.08), 0 0 0 1px rgba(15,23,42,0.05) !important;
    transform: translateY(-1px);
  }

  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: #F8FAFC; }
  ::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 2px; }
  ::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }

  @media (max-width: 960px) {
    .chart-card { grid-column: span 2 !important; }
  }
`;