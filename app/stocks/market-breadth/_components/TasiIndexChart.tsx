'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, CrosshairMode, AreaSeries, LineSeries } from 'lightweight-charts';
import { Maximize2, Minimize2, TrendingUp, Eye, EyeOff, Scan } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api/config';
import { seriesMovingAverage } from '@/lib/movingAverage';

interface TasiChartItem {
    time: string;
    value: number;
}

interface TasiIndexChartProps {
    period: string;
    startDate?: string;
    endDate?: string;
    onChartReady?: (chart: IChartApi, series: ISeriesApi<"Area">) => void;
    globalAvg50?: boolean;
    globalAvg200?: boolean;
}

const PERIOD_DAYS: Record<string, number | null> = {
    '5D': 5,
    '1M': 22,
    '6M': 130,
    '1Y': 260,
    '5Y': 1300,
    '10Y': 2600,
    ALL: null,
};

const LINE_COLOR = '#2563eb';
const ACCENT_LIGHT = '#EEF2FB';
const AVG50_COLOR = '#E02020';
const AVG200_COLOR = '#1A1A1A';

/* ── نفس الفورماتر المستخدم في صفحة market-breadth عشان شكل تاريخ الـ crosshair
   يبقى موحّد في كل الشارتات (زي TradingView، من غير توقيت) ── */
function formatCrosshairTime(time: any): string {
    let date: Date;
    if (typeof time === 'string') {
        date = new Date(time);
    } else if (typeof time === 'number') {
        date = new Date(time * 1000);
    } else if (time && typeof time === 'object') {
        date = new Date(time.year, time.month - 1, time.day);
    } else {
        return '';
    }
    if (isNaN(date.getTime())) return String(time);

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export default function TasiIndexChart({ period, startDate, endDate, onChartReady, globalAvg50, globalAvg200 }: TasiIndexChartProps) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);

    const [data, setData] = useState<TasiChartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAvg50, setShowAvg50] = useState(false);
    const [showAvg200, setShowAvg200] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [hoverTime, setHoverTime] = useState<string | null>(null);
    const [hoverValue, setHoverValue] = useState<number | null>(null);
    // ─── إظهار/إخفاء الـ series الأساسية بتاعة TASI (زر Data) ───
    const [seriesVisible, setSeriesVisible] = useState(true);

    // Sync global averages
    useEffect(() => {
        if (globalAvg50 !== undefined) setShowAvg50(globalAvg50);
    }, [globalAvg50]);

    useEffect(() => {
        if (globalAvg200 !== undefined) setShowAvg200(globalAvg200);
    }, [globalAvg200]);

    // Fetch ALL data once
    useEffect(() => {
        let isMounted = true;
        async function fetchTasiData() {
            try {
                setLoading(true);
                setError(null);

                const res = await fetch(`${API_BASE_URL}/api/market-reports/historical-reports/tasi-chart?period=ALL`);
                if (!res.ok) throw new Error(`HTTP Error ${res.status}`);

                const json = await res.json();
                if (isMounted) {
                    setData(json);
                }
            } catch (err: any) {
                if (isMounted) setError(err.message);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        fetchTasiData();
        return () => { isMounted = false; };
    }, []); // fetch once — no deps

    // Local Filtering by period + date range
    const filteredData = React.useMemo(() => {
        let items = data;
        // Apply date range filters first
        if (startDate) items = items.filter(d => d.time >= startDate);
        if (endDate) items = items.filter(d => d.time <= endDate);
        // Apply period-based slicing (take last N trading days)
        const maxDays = PERIOD_DAYS[period] ?? null;
        if (maxDays && items.length > maxDays) {
            items = items.slice(-maxDays);
        }
        return items;
    }, [data, period, startDate, endDate]);

    /* ── fullscreen ── */
    const handleFullscreen = useCallback(() => {
        const el = cardRef.current;
        if (!el) return;
        if (!document.fullscreenElement) {
            el.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => { });
        } else {
            document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => { });
        }
    }, []);

    useEffect(() => {
        const onChange = () => { if (!document.fullscreenElement) setIsFullscreen(false); };
        document.addEventListener('fullscreenchange', onChange);
        return () => document.removeEventListener('fullscreenchange', onChange);
    }, []);

    // Initialize & Update Chart
    useEffect(() => {
        if (!chartContainerRef.current || filteredData.length === 0) return;

        // Cleanup existing chart
        if (chartRef.current) {
            try { chartRef.current.remove(); } catch { }
            chartRef.current = null;
            seriesRef.current = null;
        }

        const container = chartContainerRef.current;

        const chart = createChart(container, {
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#94A3B8',
                fontFamily: '"DM Sans", "Geist", sans-serif',
                fontSize: 10,
            },
            /* ── شكل تاريخ الـ crosshair بالظبط زي TradingView (من غير توقيت) ── */
            localization: {
                timeFormatter: formatCrosshairTime,
            },
            grid: {
                vertLines: { color: '#F1F4F8' },
                horzLines: { color: '#F1F4F8' },
            },
            rightPriceScale: {
                borderColor: '#E8ECF2',
                autoScale: true,
                scaleMargins: { top: 0.08, bottom: 0.08 },
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
                    labelVisible: true,
                },
            },
            // Size to the actual grid cell instead of a fixed height
            width: container.clientWidth,
            height: Math.max(container.clientHeight, 1),
        });

        const series = chart.addSeries(AreaSeries, {
            lineColor: LINE_COLOR,
            topColor: 'rgba(37, 99, 235, 0.2)',
            bottomColor: 'rgba(37, 99, 235, 0)',
            lineWidth: 1.5 as any,
            crosshairMarkerVisible: true,
            crosshairMarkerRadius: 3,
            crosshairMarkerBorderColor: LINE_COLOR,
            crosshairMarkerBackgroundColor: '#FFFFFF',
            priceFormat: {
                type: 'price',
                precision: 2,
                minMove: 0.01,
            },
            priceLineVisible: false,
            visible: seriesVisible,
        });

        series.setData(filteredData);
        chartRef.current = chart;
        seriesRef.current = series as ISeriesApi<"Area">;

        if (showAvg50) {
            const avg50Series = chart.addSeries(LineSeries, {
                color: AVG50_COLOR,
                lineWidth: 1.5 as any,
                lineStyle: 1,
                crosshairMarkerVisible: true,
                lastValueVisible: true,
                priceLineVisible: false,
            });
            avg50Series.setData(seriesMovingAverage(filteredData, (d) => d.value, 50) as any);
        }

        if (showAvg200) {
            const avg200Series = chart.addSeries(LineSeries, {
                color: AVG200_COLOR,
                lineWidth: 1.5 as any,
                lineStyle: 1,
                crosshairMarkerVisible: true,
                lastValueVisible: true,
                priceLineVisible: false,
            });
            avg200Series.setData(seriesMovingAverage(filteredData, (d) => d.value, 200) as any);
        }

        /* ── crosshair move → update hover date & value ── */
        chart.subscribeCrosshairMove((param) => {
            if (!param.time) {
                setHoverTime(null);
                setHoverValue(null);
                return;
            }
            // نفس فورمات التاريخ المستخدم في label الـ crosshair، عشان الـ badge الصغير
            // اللي بيظهر تحت القيمة في الهيدر يبقى متسق مع الشكل الجديد بدل التاريخ الخام.
            setHoverTime(formatCrosshairTime(param.time));

            const seriesData = param.seriesData?.get(series);
            if (seriesData && 'value' in seriesData) {
                setHoverValue((seriesData as any).value);
            }
        });

        if (onChartReady) {
            onChartReady(chart, series as ISeriesApi<"Area">);
        }

        chart.timeScale().fitContent();

        // Track the grid cell's own size (fullscreen, sidebar resize, etc.), not just window resize
        const ro = new ResizeObserver(() => {
            if (container && chartRef.current) {
                chartRef.current.applyOptions({
                    width: container.clientWidth,
                    height: Math.max(container.clientHeight, 1),
                });
            }
        });
        ro.observe(container);

        return () => {
            ro.disconnect();
            if (chartRef.current) {
                try { chartRef.current.remove(); } catch { }
                chartRef.current = null;
            }
        };
    }, [filteredData, onChartReady, showAvg50, showAvg200]);

    // ─── تطبيق إظهار/إخفاء الـ series الأساسية لما يتغير حالة زر Data ───
    useEffect(() => {
        seriesRef.current?.applyOptions({ visible: seriesVisible });
    }, [seriesVisible]);

    const latest = filteredData.length > 0 ? filteredData[filteredData.length - 1] : null;
    const prevPoint = filteredData.length > 1 ? filteredData[filteredData.length - 2] : latest;
    const latestVal = latest ? latest.value : 0;
    const prevVal = prevPoint ? prevPoint.value : latestVal;
    const isUp = latestVal >= prevVal;
    const delta = Math.abs(latestVal - prevVal);

    const displayVal = hoverValue != null
        ? hoverValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : (!loading && !error && filteredData.length > 0)
            ? latestVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : '—';

    return (
        // Card chrome (bg/border/shadow) is now owned by the parent grid cell — sized to match the other breadth cards
        <div ref={cardRef} className="h-full flex flex-col bg-white">
            {/* ── header: نفس أحجام وتنسيق هيدر باقي كروت الـ market-breadth ── */}
            <div className="px-2.5 pt-1.5 pb-1 flex justify-between items-center flex-shrink-0">
                <div className="flex items-center gap-1.5 min-w-0">
                    <div className="w-[22px] h-[22px] rounded-md flex items-center justify-center flex-shrink-0" style={{ background: ACCENT_LIGHT }}>
                        <TrendingUp size={11} color={LINE_COLOR} strokeWidth={2} />
                    </div>
                    <div className="min-w-0">
                        <div className="text-[10px] font-semibold text-slate-900 leading-none truncate">TASI Index</div>
                        <div className="text-[8px] text-slate-400 leading-none mt-0.5">Saudi Exchange</div>
                    </div>
                </div>

                <div className="flex items-baseline gap-0.5 flex-shrink-0">
                    {error ? (
                        <span className="text-[9px] text-red-500 font-medium">{error}</span>
                    ) : (
                        <>
                            <span className="text-[15px] font-bold text-slate-900 leading-none">{displayVal}</span>
                            {!loading && <span className="text-[9px] text-slate-400 ml-0.5">pts</span>}
                            {!loading && (
                                hoverTime ? (
                                    <span className="text-[8px] text-slate-400 ml-1">{hoverTime}</span>
                                ) : (
                                    <span className={`text-[9px] font-semibold ml-1 ${isUp ? 'text-emerald-600' : 'text-red-500'}`}>
                                        {isUp ? '▲' : '▼'} {delta.toFixed(2)}
                                    </span>
                                )
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* ── toolbar: نفس ارتفاع وأحجام أزرار باقي كروت الـ market-breadth ── */}
            <div className="px-2 py-0.5 flex items-center gap-1 border-y border-slate-100 flex-shrink-0">
                <span className="text-[8px] font-bold text-slate-400 px-1">TASI</span>

                <button onClick={() => setShowAvg50(!showAvg50)}
                    className="px-1.5 py-0.5 rounded text-[8px] font-semibold cursor-pointer border"
                    style={{ borderColor: showAvg50 ? AVG50_COLOR : '#E2E8F0', background: showAvg50 ? AVG50_COLOR : 'transparent', color: showAvg50 ? '#FFF' : '#64748B' }}>
                    AVG50
                </button>

                <button onClick={() => setShowAvg200(!showAvg200)}
                    className="px-1.5 py-0.5 rounded text-[8px] font-semibold cursor-pointer border"
                    style={{ borderColor: showAvg200 ? AVG200_COLOR : '#E2E8F0', background: showAvg200 ? AVG200_COLOR : 'transparent', color: showAvg200 ? '#FFF' : '#64748B' }}>
                    AVG200
                </button>

                <button onClick={() => setSeriesVisible(!seriesVisible)}
                    title={seriesVisible ? 'Hide series' : 'Show series'}
                    className="px-1.5 py-0.5 rounded text-[8px] font-semibold cursor-pointer border flex items-center gap-0.5"
                    style={{
                        borderColor: !seriesVisible ? LINE_COLOR : '#E2E8F0',
                        background: !seriesVisible ? LINE_COLOR : 'transparent',
                        color: !seriesVisible ? '#FFFFFF' : '#64748B',
                    }}>
                    {seriesVisible ? <Eye size={8} /> : <EyeOff size={8} />}
                </button>

                <div className="flex-1" />
                {hoverTime && <span className="text-[8px] text-slate-400">{hoverTime}</span>}

                <button onClick={() => chartRef.current?.timeScale().fitContent()}
                    title="Fit to data"
                    className="w-[20px] h-[20px] flex items-center justify-center rounded border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer bg-transparent">
                    <Scan size={9} />
                </button>

                <button onClick={handleFullscreen}
                    className="w-[20px] h-[20px] flex items-center justify-center rounded border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer bg-transparent">
                    {isFullscreen ? <Minimize2 size={9} /> : <Maximize2 size={9} />}
                </button>
            </div>

            {/* ── chart area: الـ spinner بيظهر في النص هنا لحد ما البيانات توصل ── */}
            <div className="flex-1 min-h-0 relative w-full">
                {loading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2">
                            <svg width="20" height="20" viewBox="0 0 36 36" className="animate-spin">
                                <circle cx="18" cy="18" r="15" fill="none" stroke="#E2E8F0" strokeWidth="3" />
                                <path d="M18 3 A15 15 0 0 1 33 18" fill="none" stroke={LINE_COLOR} strokeWidth="3" strokeLinecap="round" />
                            </svg>
                            <p className="text-[8px] text-slate-400 uppercase tracking-widest font-medium">Loading</p>
                        </div>
                    </div>
                ) : (
                    <div ref={chartContainerRef} className="absolute inset-0 w-full h-full" />
                )}
            </div>
        </div>
    );
}