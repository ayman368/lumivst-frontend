'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, CrosshairMode, AreaSeries, LineSeries } from 'lightweight-charts';
import { Maximize2, Minimize2, TrendingUp } from 'lucide-react';
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

const AVG50_COLOR = '#E02020';
const AVG200_COLOR = '#1A1A1A';

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
                textColor: '#64748b',
                fontFamily: '"DM Sans", "Geist", sans-serif',
                fontSize: 11,
            },
            grid: {
                vertLines: { color: '#f1f5f9' },
                horzLines: { color: '#f1f5f9' },
            },
            rightPriceScale: {
                borderColor: '#e2e8f0',
                autoScale: true,
            },
            timeScale: {
                borderColor: '#e2e8f0',
                timeVisible: true,
                fixLeftEdge: true,
                fixRightEdge: true,
            },
            crosshair: {
                mode: CrosshairMode.Normal,
            },
            // Size to the actual grid cell instead of a fixed height
            width: container.clientWidth,
            height: Math.max(container.clientHeight, 1),
        });

        const series = chart.addSeries(AreaSeries, {
            lineColor: '#2563eb',
            topColor: 'rgba(37, 99, 235, 0.2)',
            bottomColor: 'rgba(37, 99, 235, 0)',
            lineWidth: 2,
            priceFormat: {
                type: 'price',
                precision: 2,
                minMove: 0.01,
            },
        });

        series.setData(filteredData);
        chartRef.current = chart;
        seriesRef.current = series as ISeriesApi<"Area">;

        if (showAvg50) {
            const avg50Series = chart.addSeries(LineSeries, {
                color: AVG50_COLOR,
                lineWidth: 2,
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
                lineWidth: 2,
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
            const timeStr = String(param.time);
            setHoverTime(timeStr);

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

    const displayVal = hoverValue != null
        ? hoverValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : (!loading && !error && filteredData.length > 0)
            ? filteredData[filteredData.length - 1].value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : '—';

    return (
        // Card chrome (bg/border/shadow) is now owned by the parent grid cell
        <div ref={cardRef} className="h-full flex flex-col bg-white">
            <div className="px-2.5 pt-1.5 pb-1 flex justify-between items-center flex-shrink-0">
                <div className="flex items-center gap-1.5 min-w-0">
                    <div className="w-[22px] h-[22px] rounded-md flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(37, 99, 235, 0.1)' }}>
                        <TrendingUp size={11} color="#2563eb" strokeWidth={2} />
                    </div>
                    <div className="min-w-0">
                        <div className="text-[10px] font-semibold text-slate-900 leading-none truncate">
                            TASI Index
                        </div>
                        <div className="text-[8px] text-slate-400 leading-none mt-0.5">
                            Saudi Exchange
                        </div>
                    </div>
                </div>

                <div className="flex items-baseline gap-0.5 flex-shrink-0">
                    {loading && <span className="text-[9px] text-slate-400 font-medium">Loading...</span>}
                    {error && <span className="text-[9px] text-red-500 font-medium">{error}</span>}
                    {!loading && !error && (
                        <span className="text-[15px] font-bold text-slate-900 leading-none">{displayVal}</span>
                    )}
                </div>
            </div>

            {/* ── toolbar: AVG toggles + date + fullscreen ── */}
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
                <div className="flex-1" />
                {hoverTime && <span className="text-[8px] text-slate-400">{hoverTime}</span>}
                <button onClick={handleFullscreen}
                    className="w-[20px] h-[20px] flex items-center justify-center rounded border border-slate-200 cursor-pointer bg-transparent">
                    {isFullscreen ? <Minimize2 size={9} /> : <Maximize2 size={9} />}
                </button>
            </div>

            <div className="flex-1 min-h-0 relative w-full">
                <div ref={chartContainerRef} className="absolute inset-0 w-full h-full" />
            </div>
        </div>
    );
}