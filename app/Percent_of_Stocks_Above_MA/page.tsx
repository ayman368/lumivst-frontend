'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import BreadthTabs from '../stocks/market-breadth/_components/BreadthTabs';
import TasiIndexChart from '../stocks/market-breadth/_components/TasiIndexChart';
import {
    createChart,
    ColorType,
    AreaSeries,
    IChartApi,
    ISeriesApi,
    CrosshairMode,
} from 'lightweight-charts';
import {
    TrendingUp,
    Activity,
    BarChart2,
    BarChart3,
    Radio,
    Maximize2,
    Minimize2,
    Eye,
    EyeOff,
    Scan,
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/api/config';
import MarketBreadthExportButton from './_components/marketBreadth2exportbutton';

/* ─── Types ─────────────────────────────────────────────────────────────── */

interface BreadthItem {
    time: string;
    total: number;
    pct_above_20: number;
    pct_above_50: number;
    pct_above_150: number;
    pct_above_200: number;
    ma50_20: number;
    ma200_20: number;
    ma50_50: number;
    ma200_50: number;
    ma50_150: number;
    ma200_150: number;
    ma50_200: number;
    ma200_200: number;
}

type HoverEntry = {
    main: number | null;
    avg50: number | null;
    avg200: number | null;
    time: string | null;
};

/* ─── Config ─────────────────────────────────────────────────────────────── */

const AVG50_COLOR = '#E02020';
const AVG200_COLOR = '#1A1A1A';

const CHART_CONFIGS = [
    {
        key: 'pct_above_20' as const,
        label: '20-Day',
        sublabel: 'Short-Term Momentum',
        badge: 'MA20',
        lineColor: '#0F7A5A',
        topColor: 'rgba(15,122,90,0.09)',
        accentLight: '#E6F5F0',
        icon: Activity,
        desc: 'Percentage of TASI constituents trading above their 20-day moving average',
        avgKeys: ['ma50_20', 'ma200_20'] as const,
        avgLabels: ['AVG 50', 'AVG 200'],
    },
    {
        key: 'pct_above_50' as const,
        label: '50-Day',
        sublabel: 'Intermediate Trend',
        badge: 'MA50',
        lineColor: '#1560A8',
        topColor: 'rgba(21,96,168,0.08)',
        accentLight: '#E8F0FA',
        icon: TrendingUp,
        desc: 'Percentage of TASI constituents trading above their 50-day moving average',
        avgKeys: ['ma50_50', 'ma200_50'] as const,
        avgLabels: ['AVG 50', 'AVG 200'],
    },
    {
        key: 'pct_above_150' as const,
        label: '150-Day',
        sublabel: 'Long-Term Foundation',
        badge: 'MA150',
        lineColor: '#A0600A',
        topColor: 'rgba(160,96,10,0.08)',
        accentLight: '#FBF3E6',
        icon: BarChart2,
        desc: 'Percentage of TASI constituents trading above their 150-day moving average',
        avgKeys: ['ma50_150', 'ma200_150'] as const,
        avgLabels: ['AVG 50', 'AVG 200'],
    },
    {
        key: 'pct_above_200' as const,
        label: '200-Day',
        sublabel: 'Primary Trend Core',
        badge: 'MA200',
        lineColor: '#B02040',
        topColor: 'rgba(176,32,64,0.08)',
        accentLight: '#FAE8EC',
        icon: BarChart3,
        desc: 'Percentage of TASI constituents trading above their 200-day moving average',
        avgKeys: ['ma50_200', 'ma200_200'] as const,
        avgLabels: ['AVG 50', 'AVG 200'],
    },
] as const;

const CHART_COUNT = CHART_CONFIGS.length;

/* ─── Grid layout: TASI + 4 MA charts = 5 cells, rows of 3 then 2 ───────── */

const GRID_COL_NARROW = 'col-span-2'; // 6/2 = 3 cells per row
const GRID_COL_WIDE = 'col-span-3';   // 6/3 = 2 cells per row
const NARROW_CHART_COUNT = 3;         // first row: TASI, MA20, MA50

function chartGridColClass(gridIdx: number): string {
    return gridIdx < NARROW_CHART_COUNT ? GRID_COL_NARROW : GRID_COL_WIDE;
}

// +1 grid cell reserved for the TASI chart, placed at index 0
const GRID_ITEM_COUNT = CHART_COUNT + 1;

/* ─── Component ─────────────────────────────────────────────────────────── */

function MarketBreadthContent() {
    const [data, setData] = useState<BreadthItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tick, setTick] = useState(0);
    const [period, setPeriod] = useState('ALL');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);
    const [selectedAverages, setSelectedAverages] =
        useState<Record<number, Set<string>>>({});
    // ─── حالة موحدة لأزرار AVG 50 / AVG 200 اللي بتتحكم في كل المخططات مرة واحدة ───
    const [globalAvg, setGlobalAvg] = useState<{ avg50: boolean; avg200: boolean }>({
        avg50: false,
        avg200: false,
    });
    const [seriesVisible, setSeriesVisible] =
        useState<Record<number, boolean>>({ 0: true, 1: true, 2: true, 3: true });
    const [fullscreenIdx, setFullscreenIdx] = useState<number | null>(null);
    const [hoverValues, setHoverValues] = useState<Record<number, HoverEntry>>({});

    /* ── refs ── */
    const pageRef = useRef<HTMLDivElement>(null);
    const isRestoringRef = useRef(false);

    const cardRefs = useRef<(HTMLDivElement | null)[]>(Array(CHART_COUNT).fill(null));
    const canvasRefs = useRef<(HTMLDivElement | null)[]>(Array(CHART_COUNT).fill(null));

    const chartsRef = useRef<IChartApi[]>([]);
    const mainSeriesRef = useRef<(ISeriesApi<'Area'> | null)[]>(Array(CHART_COUNT).fill(null));
    const avg50SeriesRef = useRef<(ISeriesApi<'Area'> | null)[]>(Array(CHART_COUNT).fill(null));
    const avg200SeriesRef = useRef<(ISeriesApi<'Area'> | null)[]>(Array(CHART_COUNT).fill(null));
    const isSyncing = useRef(false);
    const isSyncingCrosshair = useRef(false);
    const savedRangeRef = useRef<any>(null);
    const lastValueUpdateRef = useRef(false);

    // ── NEW: guards against the "phantom crosshair on mount" bug ──
    const chartsReadyRef = useRef(false);

    const tasiChartRef = useRef<IChartApi | null>(null);
    const tasiSeriesRef = useRef<ISeriesApi<'Area'> | null>(null);

    const dataRef = useRef<BreadthItem[]>([]);
    useEffect(() => { dataRef.current = data; }, [data]);

    const handleTasiReady = useCallback((chart: IChartApi, series: ISeriesApi<"Area">) => {
        tasiChartRef.current = chart;
        tasiSeriesRef.current = series;

        chart.timeScale().subscribeVisibleTimeRangeChange((range) => {
            if (!range || isSyncing.current || isRestoringRef.current) return;
            isSyncing.current = true;
            chartsRef.current.forEach((c) => {
                if (c) try { c.timeScale().setVisibleRange(range); } catch { }
            });
            setTimeout(() => { isSyncing.current = false; }, 0);
        });

        chart.subscribeCrosshairMove((param) => {
            if (!chartsReadyRef.current) return;
            if (isSyncingCrosshair.current) return;

            if (!param.point || !param.time) {
                isSyncingCrosshair.current = true;
                chartsRef.current.forEach((c) => {
                    if (c) try { c.clearCrosshairPosition(); } catch { }
                });
                isSyncingCrosshair.current = false;

                const emptyEntry: HoverEntry = { main: null, avg50: null, avg200: null, time: null };
                const cleared: Record<number, HoverEntry> = {};
                chartsRef.current.forEach((_, j) => { cleared[j] = emptyEntry; });
                pendingHoverRef.current = cleared;
                if (hoverRafRef.current === null) {
                    hoverRafRef.current = requestAnimationFrame(() => {
                        setHoverValues({ ...pendingHoverRef.current });
                        hoverRafRef.current = null;
                    });
                }
                return;
            }

            const timeStr =
                typeof param.time === 'string'
                    ? param.time
                    : typeof param.time === 'number'
                        ? String(param.time)
                        : `${(param.time as any).year}-${String((param.time as any).month).padStart(2, '0')}-${String((param.time as any).day).padStart(2, '0')}`;

            isSyncingCrosshair.current = true;

            const dataItem = dataRef.current.find((d) => d.time === timeStr);

            chartsRef.current.forEach((targetChart, j) => {
                const targetSeries = mainSeriesRef.current[j];
                if (!targetChart || !targetSeries || !dataItem) return;
                try {
                    const price = dataItem[CHART_CONFIGS[j].key] as number;
                    targetChart.setCrosshairPosition(price, param.time!, targetSeries);

                    pendingHoverRef.current[j] = {
                        main: price,
                        avg50: dataItem[CHART_CONFIGS[j].avgKeys[0]] as number | null,
                        avg200: dataItem[CHART_CONFIGS[j].avgKeys[1]] as number | null,
                        time: timeStr,
                    };
                } catch { }
            });

            isSyncingCrosshair.current = false;

            if (hoverRafRef.current === null) {
                hoverRafRef.current = requestAnimationFrame(() => {
                    setHoverValues({ ...pendingHoverRef.current });
                    hoverRafRef.current = null;
                });
            }
        });
    }, []);

    const hoverRafRef = useRef<number | null>(null);
    const pendingHoverRef = useRef<Record<number, HoverEntry>>({});

    const seriesVisibleRef = useRef(seriesVisible);
    seriesVisibleRef.current = seriesVisible;

    useEffect(() => {
        const id = setInterval(() => setTick((t) => t + 1), 1400);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                setError(null);
                const params = new URLSearchParams();
                if (period) params.set('period', period);
                if (startDate) params.set('start_date', startDate);
                if (endDate) params.set('end_date', endDate);
                const res = await fetch(
                    `${API_BASE_URL}/api/market-breadth/percent-above-ma?${params.toString()}`
                );
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
    }, [period, startDate, endDate, refreshKey]);

    const updateLastValues = useCallback(() => {
        if (!data.length || lastValueUpdateRef.current) return;

        lastValueUpdateRef.current = true;
        const latest = data[data.length - 1];

        CHART_CONFIGS.forEach((cfg, i) => {
            const mainSeries = mainSeriesRef.current[i];
            if (mainSeries && latest) {
                try {
                    (mainSeries as any).update({
                        time: latest.time,
                        value: latest[cfg.key] as number,
                    });
                } catch (e) { }
            }

            const avg50Series = avg50SeriesRef.current[i];
            if (avg50Series && latest) {
                try {
                    const avg50Key = cfg.avgKeys[0];
                    (avg50Series as any).update({
                        time: latest.time,
                        value: latest[avg50Key] as number,
                    });
                } catch (e) { }
            }

            const avg200Series = avg200SeriesRef.current[i];
            if (avg200Series && latest) {
                try {
                    const avg200Key = cfg.avgKeys[1];
                    (avg200Series as any).update({
                        time: latest.time,
                        value: latest[avg200Key] as number,
                    });
                } catch (e) { }
            }
        });

        setTimeout(() => {
            lastValueUpdateRef.current = false;
        }, 100);
    }, [data]);

    const toggleAvgKey = (chartIdx: number, key: string) => {
        setSelectedAverages((prev) => {
            const current = new Set(prev[chartIdx] || []);
            if (current.has(key)) current.delete(key);
            else current.add(key);
            return { ...prev, [chartIdx]: current };
        });
    };

    // ─── تفعيل/تعطيل AVG 50 أو AVG 200 على كل المخططات الأربعة مرة واحدة ───
    const toggleGlobalAvg = (which: 'avg50' | 'avg200') => {
        setGlobalAvg((prev) => {
            const nextEnabled = !prev[which];
            setSelectedAverages((prevSel) => {
                const updated: Record<number, Set<string>> = {};
                CHART_CONFIGS.forEach((cfg, idx) => {
                    const key = which === 'avg50' ? cfg.avgKeys[0] : cfg.avgKeys[1];
                    const current = new Set(prevSel[idx] ?? []);
                    if (nextEnabled) current.add(key);
                    else current.delete(key);
                    updated[idx] = current;
                });
                return updated;
            });
            return { ...prev, [which]: nextEnabled };
        });
    };

    useEffect(() => {
        if (data.length === 0) return;

        chartsReadyRef.current = false;

        if (chartsRef.current.length > 0 && !isRestoringRef.current) {
            try {
                const range = chartsRef.current[0].timeScale().getVisibleRange();
                if (range) savedRangeRef.current = range;
            } catch (e) {
                console.warn('Could not save range:', e);
            }
        }

        chartsRef.current.forEach((c) => c.remove());
        chartsRef.current = [];
        mainSeriesRef.current = Array(CHART_COUNT).fill(null);
        avg50SeriesRef.current = Array(CHART_COUNT).fill(null);
        avg200SeriesRef.current = Array(CHART_COUNT).fill(null);

        const baseOptions = {
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
        };

        CHART_CONFIGS.forEach((cfg, i) => {
            const container = canvasRefs.current[i];
            if (!container) return;
            container.innerHTML = '';

            const chart = createChart(container, {
                ...baseOptions,
                width: container.clientWidth,
                height: container.clientHeight || 200,
            });
            chartsRef.current.push(chart);

            const selectedSet = selectedAverages[i] || new Set<string>();

            const avg200Key = cfg.avgKeys[1];
            if (selectedSet.has(avg200Key) && avg200Key in data[0]) {
                const avg200Series = chart.addSeries(AreaSeries, {
                    lineColor: AVG200_COLOR,
                    topColor: 'rgba(0,0,0,0)',
                    bottomColor: 'rgba(0,0,0,0)',
                    lineWidth: 1.5 as any,
                    lineStyle: 1,
                    crosshairMarkerVisible: true,
                    crosshairMarkerRadius: 3,
                    crosshairMarkerBorderColor: AVG200_COLOR,
                    crosshairMarkerBackgroundColor: '#FFFFFF',
                    lastValueVisible: true,
                    priceFormat: {
                        type: 'custom',
                        formatter: (value: number) => `${value.toFixed(1)}%`,
                    },
                    // ── الخط المنقط في نص الشارت كان بسبب priceLineVisible: true هنا — اتشال عشان يبقى شكله زي باقي الصفحات ──
                    priceLineVisible: false,
                });
                avg200Series.setData(
                    data.map((item) => ({
                        time: item.time,
                        value: item[avg200Key as keyof BreadthItem] as number,
                    })) as any
                );
                avg200SeriesRef.current[i] = avg200Series;
            }

            const avg50Key = cfg.avgKeys[0];
            if (selectedSet.has(avg50Key) && avg50Key in data[0]) {
                const avg50Series = chart.addSeries(AreaSeries, {
                    lineColor: AVG50_COLOR,
                    topColor: 'rgba(0,0,0,0)',
                    bottomColor: 'rgba(0,0,0,0)',
                    lineWidth: 1.5 as any,
                    lineStyle: 1,
                    crosshairMarkerVisible: true,
                    crosshairMarkerRadius: 3,
                    crosshairMarkerBorderColor: AVG50_COLOR,
                    crosshairMarkerBackgroundColor: '#FFFFFF',
                    lastValueVisible: true,
                    priceFormat: {
                        type: 'custom',
                        formatter: (value: number) => `${value.toFixed(1)}%`,
                    },
                    // ── نفس التعديل هنا كمان ──
                    priceLineVisible: false,
                });
                avg50Series.setData(
                    data.map((item) => ({
                        time: item.time,
                        value: item[avg50Key as keyof BreadthItem] as number,
                    })) as any
                );
                avg50SeriesRef.current[i] = avg50Series;
            }

            const series = chart.addSeries(AreaSeries, {
                lineColor: cfg.lineColor,
                topColor: cfg.topColor,
                bottomColor: 'rgba(0,0,0,0)',
                lineWidth: 1.5 as any,
                crosshairMarkerVisible: true,
                crosshairMarkerRadius: 4,
                crosshairMarkerBorderColor: cfg.lineColor,
                crosshairMarkerBackgroundColor: '#FFFFFF',
                lastValueVisible: false,
                priceFormat: {
                    type: 'custom',
                    formatter: (value: number) => `${value.toFixed(1)}%`,
                },
                priceLineVisible: false,
                visible: seriesVisibleRef.current[i] !== false,
            });
            series.setData(
                data.map((item) => ({ time: item.time, value: item[cfg.key] as number })) as any
            );
            mainSeriesRef.current[i] = series;

            const lastVal = data[data.length - 1]?.[cfg.key] as number;
            if (lastVal != null && !isNaN(lastVal)) {
                series.createPriceLine({
                    price: lastVal,
                    color: cfg.lineColor,
                    lineWidth: 0 as any,
                    lineStyle: 0,
                    axisLabelVisible: true,
                    title: '',
                });
            }

            [20, 80].forEach((level) =>
                series.createPriceLine({
                    price: level,
                    color: '#E2E8F0',
                    lineWidth: 1,
                    lineStyle: 1,
                    axisLabelVisible: false,
                })
            );
        });

        chartsRef.current.forEach((chart, i) => {
            chart.timeScale().subscribeVisibleTimeRangeChange((range) => {
                if (!range || isSyncing.current || isRestoringRef.current) return;
                isSyncing.current = true;
                chartsRef.current.forEach((c, j) => {
                    if (j !== i) try { c.timeScale().setVisibleRange(range); } catch { }
                });
                if (tasiChartRef.current) {
                    try { tasiChartRef.current.timeScale().setVisibleRange(range); } catch { }
                }
                setTimeout(() => { isSyncing.current = false; }, 0);
                if (!isRestoringRef.current && chartsRef.current[0]) {
                    try {
                        const newRange = chartsRef.current[0].timeScale().getVisibleRange();
                        if (newRange) savedRangeRef.current = newRange;
                    } catch { }
                }
            });
        });

        chartsRef.current.forEach((chart, i) => {
            chart.subscribeCrosshairMove((param) => {
                if (!chartsReadyRef.current) return;

                const mainS = mainSeriesRef.current[i];
                const avg50S = avg50SeriesRef.current[i];
                const avg200S = avg200SeriesRef.current[i];

                if (!param.point || !param.time || !mainS) {
                    if (isSyncingCrosshair.current) return;
                    isSyncingCrosshair.current = true;
                    const emptyEntry: HoverEntry = { main: null, avg50: null, avg200: null, time: null };
                    const cleared: Record<number, HoverEntry> = {};
                    chartsRef.current.forEach((c, j) => {
                        cleared[j] = emptyEntry;
                        if (c && c !== chart) { try { c.clearCrosshairPosition(); } catch { } }
                    });
                    if (tasiChartRef.current) {
                        try { tasiChartRef.current.clearCrosshairPosition(); } catch { }
                    }
                    pendingHoverRef.current = cleared;
                    if (hoverRafRef.current === null) {
                        hoverRafRef.current = requestAnimationFrame(() => {
                            setHoverValues({ ...pendingHoverRef.current });
                            hoverRafRef.current = null;
                        });
                    }
                    isSyncingCrosshair.current = false;
                    return;
                }

                const mainVal = param.seriesData.get(mainS);
                const avg50Val = avg50S ? param.seriesData.get(avg50S) : null;
                const avg200Val = avg200S ? param.seriesData.get(avg200S) : null;

                const timeStr =
                    typeof param.time === 'string'
                        ? param.time
                        : typeof param.time === 'number'
                            ? String(param.time)
                            : `${(param.time as any).year}-${String((param.time as any).month).padStart(2, '0')}-${String((param.time as any).day).padStart(2, '0')}`;

                const entry: HoverEntry = {
                    main: mainVal && 'value' in mainVal ? (mainVal as any).value : null,
                    avg50: avg50Val && 'value' in avg50Val ? (avg50Val as any).value : null,
                    avg200: avg200Val && 'value' in avg200Val ? (avg200Val as any).value : null,
                    time: timeStr,
                };

                pendingHoverRef.current = { ...pendingHoverRef.current, [i]: entry };

                if (!isSyncingCrosshair.current) {
                    isSyncingCrosshair.current = true;

                    const dataItem = data.find(d => d.time === timeStr);

                    chartsRef.current.forEach((targetChart, j) => {
                        if (j === i) return;
                        const targetSeries = mainSeriesRef.current[j];
                        if (!targetSeries) return;
                        try {
                            if (dataItem) {
                                const price = dataItem[CHART_CONFIGS[j].key] as number;
                                targetChart.setCrosshairPosition(price, param.time!, targetSeries);

                                pendingHoverRef.current[j] = {
                                    main: price,
                                    avg50: dataItem[CHART_CONFIGS[j].avgKeys[0]] as number | null,
                                    avg200: dataItem[CHART_CONFIGS[j].avgKeys[1]] as number | null,
                                    time: timeStr,
                                };
                            }
                        } catch { }
                    });

                    if (tasiChartRef.current && tasiSeriesRef.current) {
                        try {
                            const tasiData: any[] = tasiSeriesRef.current.data() as any[];
                            const tasiItem = tasiData.find((d) => d.time === timeStr);
                            if (tasiItem && tasiItem.value != null) {
                                tasiChartRef.current.setCrosshairPosition(
                                    tasiItem.value,
                                    param.time!,
                                    tasiSeriesRef.current
                                );
                            }
                        } catch { }
                    }

                    isSyncingCrosshair.current = false;
                }

                if (hoverRafRef.current === null) {
                    hoverRafRef.current = requestAnimationFrame(() => {
                        setHoverValues({ ...pendingHoverRef.current });
                        hoverRafRef.current = null;
                    });
                }
            });
        });

        const ro = new ResizeObserver(() => {
            chartsRef.current.forEach((chart, i) => {
                const el = canvasRefs.current[i];
                if (!el) return;
                const w = el.clientWidth;
                const h = Math.max(el.clientHeight, 150);
                if (w > 0 && h > 0) {
                    chart.applyOptions({ width: w, height: h });
                }
            });
            chartsRef.current.forEach((c) => {
                if (c) try { c.clearCrosshairPosition(); } catch { }
            });
            if (tasiChartRef.current) {
                try { tasiChartRef.current.clearCrosshairPosition(); } catch { }
            }
            if (hoverRafRef.current === null) {
                const emptyEntry: HoverEntry = { main: null, avg50: null, avg200: null, time: null };
                const cleared: Record<number, HoverEntry> = {};
                chartsRef.current.forEach((_, j) => { cleared[j] = emptyEntry; });
                pendingHoverRef.current = cleared;
                hoverRafRef.current = requestAnimationFrame(() => {
                    setHoverValues({ ...pendingHoverRef.current });
                    hoverRafRef.current = null;
                });
            }
        });
        canvasRefs.current.forEach((el) => { if (el) ro.observe(el); });

        const rangeToRestore = savedRangeRef.current;
        if (rangeToRestore) {
            isRestoringRef.current = true;
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    chartsRef.current.forEach((chart) => {
                        try { chart.timeScale().setVisibleRange(rangeToRestore); }
                        catch { chart.timeScale().fitContent(); }
                    });
                    setTimeout(() => {
                        isRestoringRef.current = false;
                        chartsRef.current.forEach((c) => {
                            if (c) try { c.clearCrosshairPosition(); } catch { }
                        });
                        if (tasiChartRef.current) {
                            try { tasiChartRef.current.clearCrosshairPosition(); } catch { }
                        }
                        chartsReadyRef.current = true;
                    }, 100);
                });
            });
        } else {
            requestAnimationFrame(() => {
                chartsRef.current.forEach((chart) => chart.timeScale().fitContent());
                requestAnimationFrame(() => {
                    chartsRef.current.forEach((c) => {
                        if (c) try { c.clearCrosshairPosition(); } catch { }
                    });
                    if (tasiChartRef.current) {
                        try { tasiChartRef.current.clearCrosshairPosition(); } catch { }
                    }
                    chartsReadyRef.current = true;
                });
            });
        }

        return () => {
            chartsReadyRef.current = false;
            if (hoverRafRef.current !== null) {
                cancelAnimationFrame(hoverRafRef.current);
                hoverRafRef.current = null;
            }
            ro.disconnect();
            chartsRef.current.forEach((c) => {
                if (c) {
                    try { c.remove(); } catch { }
                }
            });
            chartsRef.current = [];
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, selectedAverages]);

    useEffect(() => { savedRangeRef.current = null; }, [period]);

    useEffect(() => {
        Object.entries(seriesVisible).forEach(([idx, vis]) => {
            const s = mainSeriesRef.current[Number(idx)];
            if (s) s.applyOptions({ visible: vis });
        });
    }, [seriesVisible]);

    const handleFullscreen = (i: number) => {
        const el = cardRefs.current[i];
        if (!el) return;
        if (!document.fullscreenElement) {
            el.requestFullscreen?.().then(() => setFullscreenIdx(i)).catch(() => { });
        } else {
            document.exitFullscreen?.().then(() => setFullscreenIdx(null)).catch(() => { });
        }
    };

    useEffect(() => {
        const onChange = () => { if (!document.fullscreenElement) setFullscreenIdx(null); };
        document.addEventListener('fullscreenchange', onChange);
        return () => document.removeEventListener('fullscreenchange', onChange);
    }, []);

    const fitAll = () => {
        savedRangeRef.current = null;
        chartsRef.current.forEach((c) => c.timeScale().fitContent());
    };

    if (loading && data.length === 0)
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center"
                style={{ fontFamily: '"DM Sans", sans-serif' }}>
                <div className="flex flex-col items-center gap-5">
                    <svg width="36" height="36" viewBox="0 0 36 36" className="animate-spin">
                        <circle cx="18" cy="18" r="15" fill="none" stroke="#E2E8F0" strokeWidth="2" />
                        <path d="M18 3 A15 15 0 0 1 33 18" fill="none" stroke="#0F7A5A"
                            strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-medium">
                        Loading market data
                    </p>
                </div>
            </div>
        );

    if (error)
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center"
                style={{ fontFamily: '"DM Sans", sans-serif' }}>
                <div className="bg-white border border-red-100 rounded-xl p-10 text-center max-w-sm">
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                        <Activity size={18} color="#B02040" />
                    </div>
                    <p className="text-sm font-semibold text-red-700">Connection Failed</p>
                    <p className="text-xs text-slate-400 mt-1">{error}</p>
                    <button
                        onClick={() => setRefreshKey((k) => k + 1)}
                        className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg cursor-pointer border-none"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );

    const latest = data[data.length - 1];

    return (
        <div
            className="w-full h-screen flex flex-col bg-slate-50 overflow-hidden"
            style={{ fontFamily: '"DM Sans", sans-serif', minWidth: 0 }}
        >
            <BreadthTabs>
                <div className="flex items-center gap-2.5 min-w-0 overflow-x-auto flex-shrink mr-2">
                    <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                        {/* ─── أزرار AVG 50 / AVG 200 الموحدة لكل المخططات الأربعة ─── */}
                        <div className="flex bg-slate-50 border border-slate-200 p-0.5 rounded-[9px] gap-0.5 flex-shrink-0">
                            <button
                                onClick={() => toggleGlobalAvg('avg50')}
                                className="px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all border-none cursor-pointer whitespace-nowrap"
                                style={{
                                    background: globalAvg.avg50 ? AVG50_COLOR : 'transparent',
                                    color: globalAvg.avg50 ? '#FFFFFF' : '#64748B',
                                }}
                            >
                                AVG 50
                            </button>
                            <button
                                onClick={() => toggleGlobalAvg('avg200')}
                                className="px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all border-none cursor-pointer whitespace-nowrap"
                                style={{
                                    background: globalAvg.avg200 ? AVG200_COLOR : 'transparent',
                                    color: globalAvg.avg200 ? '#FFFFFF' : '#64748B',
                                }}
                            >
                                AVG 200
                            </button>
                        </div>

                        <div className="flex bg-slate-50 border border-slate-200 p-0.5 rounded-[9px] gap-0.5 flex-shrink-0">
                            {['5D', '1M', '6M', '1Y', '5Y', '10Y', 'ALL'].map((p) => (
                                <button
                                    key={p}
                                    onClick={() => {
                                        setPeriod(p);
                                        setStartDate('');
                                        setEndDate('');
                                    }}
                                    disabled={loading}
                                    className={[
                                        'px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all border-none cursor-pointer whitespace-nowrap',
                                        period === p ? 'bg-white text-slate-900 shadow-sm' : 'bg-transparent text-slate-500 hover:text-slate-700',
                                        loading ? 'opacity-50' : '',
                                    ].join(' ')}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>

                        <label className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-[9px] px-2.5 py-1.5 text-[11px] text-slate-600">
                            <span className="text-slate-400">From</span>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => {
                                    setStartDate(e.target.value);
                                    if (e.target.value) setPeriod('');
                                }}
                                className="bg-transparent border-none outline-none text-[11px] text-slate-700"
                            />
                        </label>

                        <label className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-[9px] px-2.5 py-1.5 text-[11px] text-slate-600">
                            <span className="text-slate-400">To</span>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => {
                                    setEndDate(e.target.value);
                                    if (e.target.value) setPeriod('');
                                }}
                                className="bg-transparent border-none outline-none text-[11px] text-slate-700"
                            />
                        </label>

                        <button
                            onClick={() => {
                                setStartDate('');
                                setEndDate('');
                                setPeriod('ALL');
                            }}
                            className="px-2.5 py-1.5 rounded-[9px] border border-slate-200 bg-white text-[11px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                            Clear
                        </button>
                    </div>

                    <button
                        onClick={fitAll}
                        title="Fit all charts to data"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer flex-shrink-0"
                    >
                        <Scan size={13} />
                        Fit All
                    </button>

                    <div className="flex-shrink-0 mr-2">
                        <MarketBreadthExportButton
                            data={data}
                            period={period}
                            captureRef={pageRef}
                        />
                    </div>
                </div>
            </BreadthTabs>
            <main ref={pageRef} className="flex-1 min-h-0 flex flex-col w-full px-2 pt-1 pb-1 overflow-auto" style={{ flex: '1 1 0' }}>

                <div
                    className="flex-1 min-h-0 grid grid-cols-6 gap-2"
                    style={{ gridTemplateRows: 'repeat(2, minmax(0, 1fr))' }}
                >
                    {Array.from({ length: GRID_ITEM_COUNT }, (_, gridIdx) => {
                        if (gridIdx === 0) {
                            const gridCol = chartGridColClass(gridIdx);
                            return (
                                <div
                                    key="tasi-chart"
                                    className={`${gridCol} bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col relative min-h-0`}
                                    style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.05)' }}
                                >
                                    <TasiIndexChart
                                        period={period}
                                        startDate={startDate}
                                        endDate={endDate}
                                        onChartReady={handleTasiReady}
                                        globalAvg50={globalAvg.avg50}
                                        globalAvg200={globalAvg.avg200}
                                    />
                                </div>
                            );
                        }

                        const i = gridIdx - 1;
                        const cfg = CHART_CONFIGS[i];
                        const gridCol = chartGridColClass(gridIdx);
                        const Icon = cfg.icon;
                        const hover = hoverValues[i];
                        const isVisible = seriesVisible[i] !== false;

                        const displayVal = !isVisible
                            ? '—'
                            : hover?.main != null
                                ? hover.main.toFixed(1)
                                : latest ? (latest[cfg.key] as number).toFixed(1) : '—';

                        const numVal = hover?.main != null
                            ? hover.main
                            : latest ? (latest[cfg.key] as number) : 50;

                        const prev = data.length > 1 ? (data[data.length - 2][cfg.key] as number) : numVal;
                        const delta = Math.abs(numVal - prev).toFixed(1);
                        const isUp = numVal >= prev;
                        const isFS = fullscreenIdx === i;

                        const selectedSet = selectedAverages[i] || new Set<string>();
                        const avg50Key = cfg.avgKeys[0];
                        const avg200Key = cfg.avgKeys[1];
                        const isAvg50Active = selectedSet.has(avg50Key);
                        const isAvg200Active = selectedSet.has(avg200Key);

                        const avg50DisplayVal = hover?.avg50 != null ? hover.avg50.toFixed(1) : null;
                        const avg200DisplayVal = hover?.avg200 != null ? hover.avg200.toFixed(1) : null;

                        return (
                            <div
                                key={gridIdx}
                                ref={(el) => { cardRefs.current[i] = el; }}
                                className={[
                                    gridCol,
                                    "bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col transition-all duration-200",
                                    isFS
                                        ? "fixed inset-0 z-[200] rounded-none"
                                        : "relative min-h-0",
                                ].join(" ")}
                                style={{ borderLeft: `3px solid ${cfg.lineColor}`, boxShadow: '0 1px 3px rgba(15,23,42,0.05)' }}
                            >
                                <div className="px-4 pt-2.5 pb-1.5 flex justify-between items-start flex-shrink-0 flex-wrap gap-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center flex-shrink-0" style={{ background: cfg.accentLight }}>
                                            <Icon size={14} color={cfg.lineColor} strokeWidth={2} />
                                        </div>
                                        <div>
                                            <div className="text-[12px] font-semibold text-slate-900 tracking-tight leading-none">{cfg.label} Moving Average</div>
                                            <div className="text-[10px] text-slate-400 mt-0.5 tracking-wide leading-none">{cfg.sublabel}</div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-0.5">
                                        <div className="flex items-baseline gap-0.5 flex-wrap justify-end">
                                            {isVisible && (
                                                <>
                                                    <span className="text-[22px] font-bold text-slate-900 leading-none tracking-tight">{displayVal}</span>
                                                    <span className="text-[11px] text-slate-400 font-medium">%</span>
                                                </>
                                            )}
                                            {avg50DisplayVal && isAvg50Active && (
                                                <span className="text-[11px] ml-1.5 font-semibold" style={{ color: AVG50_COLOR }}>
                                                    {isVisible ? '/ ' : ''}{avg50DisplayVal}%
                                                </span>
                                            )}
                                            {avg200DisplayVal && isAvg200Active && (
                                                <span className="text-[11px] ml-1.5 font-semibold" style={{ color: AVG200_COLOR }}>
                                                    {isVisible || isAvg50Active ? '/ ' : ''}{avg200DisplayVal}%
                                                </span>
                                            )}
                                        </div>
                                        {hover?.time ? (
                                            <span className="text-[10px] text-slate-400 font-medium">{hover.time}</span>
                                        ) : isVisible ? (
                                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded tracking-wide ${isUp ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'}`}>
                                                {isUp ? '▲' : '▼'} {delta}%
                                            </span>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="px-4 pb-1.5 flex-shrink-0">
                                    <div className="flex justify-between mb-0.5">
                                        <span className="text-[9px] text-slate-300 uppercase tracking-widest font-medium">OVERSOLD · 30</span>
                                        <span className="text-[9px] text-slate-300 uppercase tracking-widest font-medium">70 · OVERBOUGHT</span>
                                    </div>
                                    <div className="h-[4px] bg-slate-100 rounded-full relative overflow-hidden">
                                        <div
                                            className="absolute left-0 top-0 bottom-0 rounded-full transition-all duration-700"
                                            style={{
                                                width: `${numVal}%`,
                                                background: numVal >= 70
                                                    ? `linear-gradient(90deg, #0F7A5A44, #0F7A5A)`
                                                    : numVal <= 30
                                                        ? `linear-gradient(90deg, #B0204044, #B02040)`
                                                        : `linear-gradient(90deg, ${cfg.lineColor}44, ${cfg.lineColor})`,
                                            }}
                                        />
                                        {[30, 50, 70].map((t) => (
                                            <div key={t} className="absolute top-0 bottom-0 w-px bg-white/70 z-10" style={{ left: `${t}%` }} />
                                        ))}
                                    </div>
                                </div>

                                <div className="px-3 py-1 flex items-center gap-1 border-y border-slate-100 flex-shrink-0 flex-wrap">
                                    <button onClick={() => toggleAvgKey(i, avg50Key)}
                                        className="px-2 py-0.5 rounded text-[9px] font-semibold tracking-wide transition-all cursor-pointer border whitespace-nowrap"
                                        style={{
                                            borderColor: isAvg50Active ? AVG50_COLOR : '#E2E8F0',
                                            background: isAvg50Active ? AVG50_COLOR : 'transparent',
                                            color: isAvg50Active ? '#FFFFFF' : '#64748B',
                                        }}>
                                        {cfg.avgLabels[0]}
                                    </button>

                                    <button onClick={() => toggleAvgKey(i, avg200Key)}
                                        className="px-2 py-0.5 rounded text-[9px] font-semibold tracking-wide transition-all cursor-pointer border whitespace-nowrap"
                                        style={{
                                            borderColor: isAvg200Active ? AVG200_COLOR : '#E2E8F0',
                                            background: isAvg200Active ? AVG200_COLOR : 'transparent',
                                            color: isAvg200Active ? '#FFFFFF' : '#64748B',
                                        }}>
                                        {cfg.avgLabels[1]}
                                    </button>

                                    <div className="flex-1" />

                                    <button onClick={() => setSeriesVisible((prev) => ({ ...prev, [i]: !prev[i] }))}
                                        title={isVisible ? 'Hide original data' : 'Show original data'}
                                        className="px-2 py-0.5 rounded text-[9px] font-semibold tracking-wide transition-all cursor-pointer border flex items-center gap-1 whitespace-nowrap"
                                        style={{
                                            borderColor: !isVisible ? cfg.lineColor : '#E2E8F0',
                                            background: !isVisible ? cfg.lineColor : 'transparent',
                                            color: !isVisible ? '#FFFFFF' : '#64748B',
                                        }}>
                                        {isVisible ? <Eye size={9} /> : <EyeOff size={9} />}
                                        <span>Data</span>
                                    </button>

                                    <button onClick={() => chartsRef.current[i]?.timeScale().fitContent()}
                                        title="Fit data to screen"
                                        className="w-[24px] h-[24px] flex items-center justify-center rounded border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer bg-transparent flex-shrink-0">
                                        <Scan size={10} />
                                    </button>

                                    <button onClick={() => handleFullscreen(i)}
                                        title={isFS ? 'Exit fullscreen' : 'Fullscreen'}
                                        className="w-[24px] h-[24px] flex items-center justify-center rounded border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer bg-transparent flex-shrink-0">
                                        {isFS ? <Minimize2 size={10} /> : <Maximize2 size={10} />}
                                    </button>
                                </div>

                                <div className="flex-1 min-h-0 p-1">
                                    <div ref={(el) => { canvasRefs.current[i] = el; }} className="w-full h-full" />
                                </div>

                                <div className="px-4 py-1 border-t border-slate-50 flex justify-between items-center flex-shrink-0">
                                    <span className="text-[9px] text-slate-300 leading-relaxed line-clamp-1">{cfg.desc}</span>
                                    <span className="text-[9px] text-slate-300 ml-3 flex-shrink-0 font-medium">{data.length.toLocaleString()} obs</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg flex justify-between items-center text-[9px] text-slate-300 tracking-wide flex-shrink-0 flex-wrap gap-2">
                    <div className="flex items-center gap-1.5">
                        <Radio size={9} color="#CBD5E1" />
                        <span>TASI Market Breadth Index · Constituent moving average analysis · All values in percentage terms</span>
                    </div>
                    <span>SMA 20 · 50 · 150 · 200</span>
                </div>
            </main>
        </div>
    );
}

export default function MarketBreadthPage() {
    return (
        <MarketBreadthContent />
    );
}