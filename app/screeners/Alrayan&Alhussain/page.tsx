'use client';

import React, {
    useState,
    useEffect,
    useRef,
    useMemo,
    useCallback,
} from 'react';
import BreadthTabs from '../../stocks/market-breadth/_components/BreadthTabs';
import { motion } from 'framer-motion';
import { Activity, Maximize2, Minimize2, Target, TrendingUp, BarChart2 } from 'lucide-react';
import {
    createChart,
    IChartApi,
    ISeriesApi,
    LineData,
    Time,
    CrosshairMode,
    MouseEventParams,
    LineStyle,
    LineSeries,
} from 'lightweight-charts';

import { API_BASE_URL } from '@/lib/api/config';
import { authFetch } from '@/lib/api/authFetch';
import { WatchlistShariahProvider } from '@/components/Watchlist/WatchlistShariahContext';
import ChartExportButton from './_components/ChartExportButton';
import type { ChartDataset } from './_components/ChartExportButton';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface TrendPoint {
    time: string;
    alhussain: number;
    alrayan: number;
    a_rating: number;
    d_rating: number;
    a_rating_pct: number;
    d_rating_pct: number;
    total_stocks: number;
}

type PeriodKey = '5D' | '1M' | '6M' | '1Y' | '5Y' | '10Y' | 'ALL';
type ViewMode = 'count' | 'percentage';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const PERIOD_DAYS: Record<PeriodKey, number | null> = {
    '5D': 5,
    '1M': 22,
    '6M': 130,
    '1Y': 260,
    '5Y': 1300,
    '10Y': 2600,
    ALL: null,
};

const PERIODS: PeriodKey[] = ['5D', '1M', '6M', '1Y', '5Y', '10Y', 'ALL'];

const ALHUSSAIN_CONDITIONS = [
    '50 SMA > 150 SMA',
    '50 SMA > 200 SMA',
    '150 SMA > 200 SMA',
    'vs SMA 50% ≥ 0',
    'Avg Volume 50 ≥ 100,000',
];

const ALRAYAN_CONDITIONS = [
    'Price > 18 SMA (Daily)',
    'SMA 4 > SMA 9 > SMA 18 (Daily)',
    'Price > 9 SMA (Weekly)',
    'CCI(14) > 100',
    'Aroon Up > 70%',
];

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

function filterByPeriod(items: TrendPoint[], period: PeriodKey): TrendPoint[] {
    const days = PERIOD_DAYS[period];
    if (!days) return items;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    return items.filter(d => d.time >= cutoffStr);
}

function fmt(n: number, decimals = 1): string {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return n.toFixed(decimals);
}

// ─────────────────────────────────────────────────────────────────────────────
// Chart Sync — shared time-range + crosshair across all charts
// ─────────────────────────────────────────────────────────────────────────────

interface ChartHandle {
    chart: IChartApi;
    series: Map<string, ISeriesApi<'Line'>>;
}

function useChartSync() {
    const chartsRef = useRef<Map<string, ChartHandle>>(new Map());
    const isSyncingRef = useRef(false);

    const register = useCallback((id: string, handle: ChartHandle) => {
        chartsRef.current.set(id, handle);

        handle.chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
            if (isSyncingRef.current || !range) return;
            isSyncingRef.current = true;
            chartsRef.current.forEach((other, otherId) => {
                if (otherId !== id) {
                    other.chart.timeScale().setVisibleLogicalRange(range);
                }
            });
            isSyncingRef.current = false;
        });

        handle.chart.subscribeCrosshairMove((param: MouseEventParams) => {
            if (isSyncingRef.current) return;
            isSyncingRef.current = true;
            chartsRef.current.forEach((other, otherId) => {
                if (otherId !== id) {
                    if (param.time === undefined || param.point === undefined) {
                        other.chart.clearCrosshairPosition();
                    } else {
                        const firstSeries = other.series.values().next().value;
                        if (firstSeries) {
                            other.chart.setCrosshairPosition(0, param.time, firstSeries);
                        }
                    }
                }
            });
            isSyncingRef.current = false;
        });
    }, []);

    const unregister = useCallback((id: string) => {
        chartsRef.current.delete(id);
    }, []);

    return { register, unregister };
}

// ─────────────────────────────────────────────────────────────────────────────
// Hover Legend
// ─────────────────────────────────────────────────────────────────────────────

interface HoverValue {
    name: string;
    color: string;
    value: number | null;
}

function HoverLegend({ values, label }: { values: HoverValue[]; label: string | null }) {
    if (!values.length) return null;
    return (
        <div style={{
            position: 'absolute', top: 8, left: 8, zIndex: 5,
            background: 'rgba(255,255,255,0.95)', border: '1px solid #E5E7EB',
            borderRadius: 10, padding: '8px 12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            pointerEvents: 'none', minWidth: 140,
        }}>
            {label && (
                <div style={{
                    fontSize: 9, fontWeight: 700, color: '#9CA3AF',
                    letterSpacing: '0.1em', marginBottom: 4,
                }}>
                    {label}
                </div>
            )}
            {values.map((v, i) => (
                <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', gap: 12, marginBottom: 2,
                }}>
                    <span style={{
                        fontSize: 11, color: '#6B7280',
                        display: 'flex', alignItems: 'center', gap: 5,
                    }}>
                        <span style={{
                            width: 8, height: 8, borderRadius: '50%',
                            background: v.color, display: 'inline-block',
                        }} />
                        {v.name}
                    </span>
                    <span style={{
                        fontSize: 12, fontWeight: 700, color: '#111827',
                        fontVariantNumeric: 'tabular-nums',
                    }}>
                        {v.value !== null ? v.value.toLocaleString() : '—'}
                    </span>
                </div>
            ))}
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// ChartPanel
// ─────────────────────────────────────────────────────────────────────────────

interface LineDef {
    dataKey: string;
    name: string;
    color: string;
    show: boolean;
}

interface ChartPanelProps {
    chartId: string;
    title: string;
    subtitle: string;
    accentColor: string;
    conditions?: string[];
    count?: number;
    icon: React.ReactNode;
    data: TrendPoint[];
    lines: LineDef[];
    loading: boolean;
    sync: ReturnType<typeof useChartSync>;
    viewMode?: ViewMode;
    onViewModeChange?: (v: ViewMode) => void;
    showViewToggle?: boolean;
}

function ChartPanel({
    chartId, title, subtitle, accentColor, conditions, count, icon,
    data, lines, loading, sync,
    viewMode, onViewModeChange, showViewToggle,
}: ChartPanelProps) {
    const [fullscreen, setFullscreen] = useState(false);
    const [hoverValues, setHoverValues] = useState<HoverValue[]>([]);
    const [hoverLabel, setHoverLabel] = useState<string | null>(null);
    const [seriesVisible, setSeriesVisible] = useState<Record<string, boolean>>(
        () => Object.fromEntries(lines.map(l => [l.dataKey, l.show]))
    );

    const containerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<Map<string, ISeriesApi<'Line'>>>(new Map());

    const yFormatter = useCallback((v: number) => {
        if (viewMode === 'percentage') return v.toFixed(1) + '%';
        return fmt(v, 0);
    }, [viewMode]);

    // Initialise chart once on mount
    useEffect(() => {
        if (!containerRef.current) return;

        const chart = createChart(containerRef.current, {
            layout: {
                background: { color: 'transparent' },
                textColor: '#9CA3AF',
                fontSize: 9,
                fontFamily: 'system-ui, -apple-system, sans-serif',
            },
            grid: {
                vertLines: { color: '#F0F0F0' },
                horzLines: { color: '#F0F0F0' },
            },
            rightPriceScale: { borderColor: '#E5E7EB', visible: true },
            timeScale: { borderColor: '#E5E7EB', timeVisible: false, secondsVisible: false },
            crosshair: {
                mode: CrosshairMode.Normal,
                vertLine: { labelBackgroundColor: accentColor, width: 1, style: LineStyle.Dashed },
                horzLine: { labelBackgroundColor: accentColor, width: 1, style: LineStyle.Dashed },
            },
            handleScroll: true,
            handleScale: true,
            autoSize: true,
        });

        chartRef.current = chart;

        const seriesMap = new Map<string, ISeriesApi<'Line'>>();

        lines.forEach(l => {
            const series = chart.addSeries(LineSeries, {
                color: l.color,
                lineWidth: 2,
                priceLineVisible: false,
                lastValueVisible: true,
                priceFormat: {
                    type: 'custom',
                    formatter: yFormatter,
                    minMove: 0.01,
                },
            });
            seriesMap.set(l.dataKey, series);
        });

        seriesRef.current = seriesMap;

        chart.subscribeCrosshairMove((param: MouseEventParams) => {
            if (param.time === undefined || !param.seriesData) {
                setHoverValues([]);
                setHoverLabel(null);
                return;
            }
            const vals: HoverValue[] = [];
            lines.forEach(l => {
                const series = seriesMap.get(l.dataKey);
                if (!series) return;
                const d = param.seriesData.get(series) as LineData | undefined;
                vals.push({ name: l.name, color: l.color, value: d ? (d.value as number) : null });
            });
            setHoverValues(vals);
            setHoverLabel(String(param.time));
        });

        sync.register(chartId, { chart, series: seriesMap });

        return () => {
            sync.unregister(chartId);
            chart.remove();
            chartRef.current = null;
            seriesRef.current = new Map();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Sync price formatter when viewMode changes
    useEffect(() => {
        seriesRef.current.forEach(series => {
            series.applyOptions({
                priceFormat: { type: 'custom', formatter: yFormatter, minMove: 0.01 },
            });
        });
    }, [yFormatter]);

    // Push data + visibility into series
    useEffect(() => {
        lines.forEach(l => {
            const series = seriesRef.current.get(l.dataKey);
            if (!series) return;
            const seriesData: LineData[] = data.map(d => ({
                time: d.time as Time,
                value: d[l.dataKey as keyof TrendPoint] as number,
            }));
            series.setData(seriesData);
            series.applyOptions({ visible: seriesVisible[l.dataKey] ?? true });
        });
        if (chartRef.current && data.length > 0) {
            chartRef.current.timeScale().fitContent();
        }
    }, [data, lines, seriesVisible]);

    // Re-fit on fullscreen toggle
    useEffect(() => {
        if (!chartRef.current || !containerRef.current) return;
        requestAnimationFrame(() => {
            chartRef.current?.resize(
                containerRef.current!.clientWidth,
                containerRef.current!.clientHeight,
            );
            chartRef.current?.timeScale().fitContent();
        });
    }, [fullscreen]);

    const toggleSeries = (key: string) =>
        setSeriesVisible(prev => ({ ...prev, [key]: !prev[key] }));

    return (
        <motion.div
            layout
            animate={fullscreen ? { position: 'fixed', inset: 0, zIndex: 50, borderRadius: 0 } : {}}
            style={{
                background: '#fff',
                border: '1px solid #E5E7EB',
                borderRadius: 20,
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
            }}
        >
            {/* Accent bar */}
            <div style={{ height: 4, background: accentColor, flexShrink: 0 }} />

            {/* Header */}
            <div style={{
                padding: '10px 14px', borderBottom: '1px solid #F3F4F6',
                display: 'flex', alignItems: 'center', gap: 10,
                flexShrink: 0, flexWrap: 'wrap',
            }}>
                <div style={{
                    width: 34, height: 34, borderRadius: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `${accentColor}18`, color: accentColor,
                    border: `1px solid ${accentColor}30`, flexShrink: 0,
                }}>
                    {icon}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>{title}</div>
                    <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 1 }}>{subtitle}</div>
                </div>

                {count !== undefined && (
                    <div style={{ textAlign: 'right', marginRight: 6 }}>
                        <div style={{ fontSize: 24, fontWeight: 900, color: '#111827', lineHeight: 1 }}>
                            {count.toLocaleString()}
                        </div>
                        <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#9CA3AF' }}>
                            Assets
                        </div>
                    </div>
                )}

                {showViewToggle && onViewModeChange && (
                    <div style={{
                        display: 'flex', background: '#F1F5F9',
                        border: '1px solid #E2E8F0', borderRadius: 8, padding: 2, gap: 2,
                    }}>
                        {(['count', 'percentage'] as ViewMode[]).map(v => (
                            <button key={v} onClick={() => onViewModeChange(v)} style={{
                                padding: '4px 10px', borderRadius: 6, fontSize: 10, fontWeight: 700,
                                background: viewMode === v ? '#fff' : 'transparent',
                                color: viewMode === v ? '#111827' : '#94A3B8',
                                border: 'none', cursor: 'pointer',
                                boxShadow: viewMode === v ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                            }}>
                                {v === 'count' ? 'Count' : '%'}
                            </button>
                        ))}
                    </div>
                )}

                <div style={{ display: 'flex', gap: 5 }}>
                    {lines.map(l => (
                        <button
                            key={l.dataKey}
                            onClick={() => toggleSeries(l.dataKey)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 4,
                                padding: '3px 7px', border: '1px solid #E5E7EB',
                                borderRadius: 6, background: '#F9FAFB', cursor: 'pointer',
                            }}
                        >
                            <span style={{
                                width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                                background: seriesVisible[l.dataKey] ? l.color : '#CBD5E1',
                            }} />
                            <span style={{ fontSize: 10, fontWeight: 600, color: '#6B7280' }}>{l.name}</span>
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => setFullscreen(f => !f)}
                    style={{
                        width: 28, height: 28, border: '1px solid #E5E7EB',
                        borderRadius: 7, background: '#F9FAFB', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#6B7280', flexShrink: 0,
                    }}
                >
                    {fullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
                </button>
            </div>

            {/* Chart area */}
            <div style={{ flex: 1, padding: '8px 8px 0', position: 'relative', minHeight: 0 }}>
                {loading && (
                    <div style={{
                        position: 'absolute', inset: 0, display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(255,255,255,0.8)', zIndex: 10, borderRadius: 12,
                    }}>
                        <svg
                            width="24" height="24" viewBox="0 0 24 24"
                            fill="none" stroke={accentColor} strokeWidth="2"
                            style={{ animation: 'spin 1s linear infinite' }}
                        >
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                    </div>
                )}

                {!loading && data.length === 0 && (
                    <div style={{
                        position: 'absolute', inset: 0, display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        flexDirection: 'column', gap: 8, zIndex: 4,
                    }}>
                        <div style={{ fontSize: 13, color: '#9CA3AF', fontWeight: 500 }}>No historical data</div>
                        <div style={{ fontSize: 11, color: '#C4C9D4' }}>Chart will appear as data is recorded</div>
                    </div>
                )}

                <HoverLegend values={hoverValues} label={hoverLabel} />
                <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
            </div>

            {/* Conditions footer */}
            {conditions && conditions.length > 0 && (
                <div style={{
                    padding: '7px 14px 10px',
                    background: '#FAFAFA', borderTop: '1px solid #F3F4F6', flexShrink: 0,
                }}>
                    <div style={{
                        fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: '0.15em', color: '#C4C9D4', marginBottom: 5,
                    }}>
                        Active Conditions ({conditions.length})
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {conditions.map((c, i) => (
                            <span key={i} style={{
                                fontSize: 9, fontWeight: 600, color: '#374151',
                                background: '#F3F4F6', border: '1px solid #E5E7EB',
                                borderRadius: 6, padding: '2px 7px',
                            }}>
                                {c}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Dashboard
// ─────────────────────────────────────────────────────────────────────────────

function CombinedDashboardContent() {
    const [trendData, setTrendData] = useState<TrendPoint[]>([]);
    const [loading, setLoading] = useState(false);
    const [period, setPeriod] = useState<PeriodKey>('1Y');
    const [adViewMode, setAdViewMode] = useState<ViewMode>('count');
    const dashRef = useRef<HTMLDivElement>(null);
    const sync = useChartSync();

    const filtered = useMemo(() => filterByPeriod(trendData, period), [trendData, period]);
    const latestPoint = useMemo(() => trendData[trendData.length - 1] ?? null, [trendData]);

    const mainDashboardDatasets: ChartDataset[] = useMemo(() => [
        {
            key: 'alhussain',
            label: 'Alhussain Screener',
            rows: filtered.map(d => ({ Date: d.time, Count: d.alhussain })),
        },
        {
            key: 'alrayan',
            label: 'Alrayan Screener',
            rows: filtered.map(d => ({ Date: d.time, Count: d.alrayan })),
        },
        {
            key: 'a-rating',
            label: 'A Rating',
            rows: filtered.map(d => ({ Date: d.time, Count: d.a_rating, Percentage: d.a_rating_pct })),
        },
        {
            key: 'd-rating',
            label: 'D Rating',
            rows: filtered.map(d => ({ Date: d.time, Count: d.d_rating, Percentage: d.d_rating_pct })),
        },
    ], [filtered]);

    useEffect(() => {
        async function fetchAll() {
            setLoading(true);
            try {
                const response = await authFetch(
                    `${API_BASE_URL}/api/market-breadth/dashboard?period=ALL`,
                    { cache: 'no-store', credentials: 'include' },
                );
                const data = response.ok ? await response.json() : {};

                const alhData = data.alhussain ?? { data: [] };
                const alrData = data.screener_trend ?? { data: [] };
                const adData = data.ad_rating ?? { data: [] };

                const map = new Map<string, Partial<TrendPoint>>();

                const merge = (items: any[], keyMap: (item: any) => Partial<TrendPoint>) => {
                    for (const item of items) {
                        const key: string = item.date || item.time || '';
                        if (!key) continue;
                        map.set(key, { ...(map.get(key) ?? {}), ...keyMap(item) });
                    }
                };

                merge(alhData.data ?? [], item => ({
                    time: item.date || item.time,
                    alhussain: Number(item.count ?? item.alhussain ?? 0),
                }));

                merge(alrData.data ?? [], item => ({
                    time: item.date || item.time,
                    alrayan: Number(item.alrayan ?? item.count ?? 0),
                }));

                merge(adData.data ?? [], item => ({
                    time: item.date || item.time,
                    a_rating: Number(item.a_rating ?? 0),
                    d_rating: Number(item.d_rating ?? 0),
                    total_stocks: Number(item.total_stocks ?? 0),
                    a_rating_pct: Number(
                        item.a_rating_pct ?? (item.a_rating / (item.total_stocks || 1) * 100),
                    ),
                    d_rating_pct: Number(
                        item.d_rating_pct ?? (item.d_rating / (item.total_stocks || 1) * 100),
                    ),
                }));

                const merged: TrendPoint[] = Array.from(map.entries())
                    .map(([time, v]) => ({
                        time,
                        alhussain: v.alhussain ?? 0,
                        alrayan: v.alrayan ?? 0,
                        a_rating: v.a_rating ?? 0,
                        d_rating: v.d_rating ?? 0,
                        a_rating_pct: v.a_rating_pct ?? 0,
                        d_rating_pct: v.d_rating_pct ?? 0,
                        total_stocks: v.total_stocks ?? 0,
                    }))
                    .sort((a, b) => a.time.localeCompare(b.time));

                setTrendData(merged);
            } catch (err) {
                console.error('Combined dashboard fetch error:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchAll();
    }, []);

    const adLines: LineDef[] = useMemo(() => [
        {
            dataKey: adViewMode === 'count' ? 'a_rating' : 'a_rating_pct',
            name: 'A Rating',
            color: '#16A34A',
            show: true,
        },
        {
            dataKey: adViewMode === 'count' ? 'd_rating' : 'd_rating_pct',
            name: 'D Rating',
            color: '#DC2626',
            show: true,
        },
    ], [adViewMode]);

    return (
        <div style={{
            width: '100%',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#F8FAFC',
            color: '#111827',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            overflow: 'hidden',
        }}>
            <BreadthTabs />

            {/* Header */}
            <div style={{ background: '#fff', borderBottom: '1px solid #E5E7EB', padding: '0 24px', flexShrink: 0 }}>
                <div style={{
                    maxWidth: 1920, margin: '0 auto',
                    display: 'flex', alignItems: 'center', gap: 16, height: 56,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            width: 34, height: 34, borderRadius: 10,
                            background: 'linear-gradient(135deg, #7C3AED, #2962FF)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Activity size={17} color="#fff" />
                        </div>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 800, color: '#111827', lineHeight: 1.1 }}>
                                Combined Screener Dashboard
                            </div>
                            <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 500 }}>
                                Alhussain · Alrayan · A/D Rating — Synchronized
                            </div>
                        </div>
                    </div>

                    <div style={{ flex: 1 }} />

                    {/* Period selector */}
                    <div style={{
                        display: 'flex', gap: 3, background: '#F1F5F9',
                        borderRadius: 10, padding: 3, border: '1px solid #E2E8F0',
                    }}>
                        {PERIODS.map(p => (
                            <button key={p} onClick={() => setPeriod(p)} style={{
                                padding: '4px 11px', borderRadius: 8,
                                fontSize: 11, fontWeight: 700,
                                background: period === p ? '#fff' : 'transparent',
                                color: period === p ? '#111827' : '#9CA3AF',
                                border: 'none', cursor: 'pointer',
                                boxShadow: period === p ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                                transition: 'all 0.15s',
                            }}>
                                {p}
                            </button>
                        ))}
                    </div>

                    <ChartExportButton
                        captureRef={dashRef as React.RefObject<HTMLElement>}
                        period={period}
                        filePrefix="Combined-Screener-Dashboard"
                        datasets={mainDashboardDatasets}
                    />
                </div>
            </div>

            {/* Charts Grid */}
            <div
                ref={dashRef}
                style={{
                    flex: 1, minHeight: 0,
                    padding: '14px 24px',
                    maxWidth: 1920, width: '100%', margin: '0 auto',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gridTemplateRows: '1fr 1fr',
                    gap: 14,
                    boxSizing: 'border-box',
                }}
            >
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} style={{ minHeight: 0 }}>
                    <ChartPanel
                        chartId="alhussain"
                        title="Alhussain Screener"
                        subtitle="SMA & Volume Conditions — Daily Count"
                        accentColor="#7C3AED"
                        icon={<Target size={16} />}
                        conditions={ALHUSSAIN_CONDITIONS}
                        count={latestPoint?.alhussain}
                        data={filtered}
                        lines={[{ dataKey: 'alhussain', name: 'Alhussain', color: '#7C3AED', show: true }]}
                        loading={loading}
                        sync={sync}
                    />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }} style={{ minHeight: 0 }}>
                    <ChartPanel
                        chartId="alrayan"
                        title="Alrayan Screener"
                        subtitle="CCI · Aroon · SMA Multi-Timeframe — Daily Count"
                        accentColor="#2962FF"
                        icon={<Target size={16} />}
                        conditions={ALRAYAN_CONDITIONS}
                        count={latestPoint?.alrayan}
                        data={filtered}
                        lines={[{ dataKey: 'alrayan', name: 'Alrayan', color: '#2962FF', show: true }]}
                        loading={loading}
                        sync={sync}
                    />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }} style={{ gridColumn: '1 / -1', minHeight: 0 }}>
                    <ChartPanel
                        chartId="ad-rating"
                        title="A/D Rating Distribution"
                        subtitle="A-Rating vs D-Rating over time"
                        accentColor="#0EA5E9"
                        icon={<TrendingUp size={16} />}
                        data={filtered}
                        lines={adLines}
                        loading={loading}
                        sync={sync}
                        viewMode={adViewMode}
                        onViewModeChange={setAdViewMode}
                        showViewToggle
                    />
                </motion.div>
            </div>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                * { box-sizing: border-box; }
            `}</style>
        </div>
    );
}

export default function CombinedDashboardPage() {
    return (
        <WatchlistShariahProvider>
            <CombinedDashboardContent />
        </WatchlistShariahProvider>
    );
}