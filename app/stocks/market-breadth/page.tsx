'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import BreadthTabs from './_components/BreadthTabs';
import TasiIndexChart from './_components/TasiIndexChart';
import {
    createChart,
    ColorType,
    AreaSeries,
    LineSeries,
    IChartApi,
    ISeriesApi,
    CrosshairMode,
} from 'lightweight-charts';
import {
    TrendingUp,
    Activity,
    BarChart2,
    BarChart3,
    Maximize2,
    Minimize2,
    Eye,
    EyeOff,
    Scan,
    Target,
    Percent,
    Hash,
} from 'lucide-react';
import { API_BASE_URL } from '@/lib/api/config';
import { WatchlistShariahProvider, ShariahFilterBar, useWatchlistShariah } from '@/components/Watchlist/WatchlistShariahContext';
import ExportButton from './_components/ExportButton';
import { seriesMovingAverage } from '../../../lib/movingAverage';

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

interface ADRatingItem {
    time: string;
    a_rating: number;
    d_rating: number;
    a_rating_pct: number;
    d_rating_pct: number;
}

interface AlhussainItem {
    time: string;
    count: number;
}

interface ScreenerTrendItem {
    time: string;
    trend_1m: number;
    trend_4m: number;
    trend_5m_wide: number;
    alrayan: number;
}

type HoverEntry = {
    main: number | null;
    secondary: number | null;
    avg50: number | null;
    avg200: number | null;
    time: string | null;
};

/* ─── Config ─────────────────────────────────────────────────────────────── */

const AVG50_COLOR = '#E02020';
const AVG200_COLOR = '#1A1A1A';

/* ── موحّد لكل الشارتات: شكل التاريخ في الـ crosshair label زي TradingView
   (اسم اليوم المختصر + رقم اليوم + اسم الشهر المختصر + السنة) من غير توقيت ── */
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

const MA_CHART_COUNT = CHART_CONFIGS.length;

const MINERVINI_CONFIGS = [
    {
        key: 'trend_1m' as const,
        label: '1 Month',
        sublabel: 'Minervini · Short-Term',
        badge: '1M',
        lineColor: '#4472C4',
        topColor: 'rgba(68,114,196,0.10)',
        accentLight: '#EEF2FB',
        icon: Activity,
    },
    {
        key: 'trend_4m' as const,
        label: '4 Months',
        sublabel: 'Minervini · Intermediate',
        badge: '4M',
        lineColor: '#ED7D31',
        topColor: 'rgba(237,125,49,0.10)',
        accentLight: '#FEF3EB',
        icon: TrendingUp,
    },
    {
        key: 'trend_5m_wide' as const,
        label: '5 Months Wide',
        sublabel: 'Minervini · Broad Trend',
        badge: '5MW',
        lineColor: '#70AD47',
        topColor: 'rgba(112,173,71,0.10)',
        accentLight: '#EDF5E7',
        icon: BarChart2,
    },
    {
        key: 'alrayan' as const,
        label: 'Alrayan',
        sublabel: 'Technical Alignment',
        badge: 'ALR',
        lineColor: '#8B5CF6',
        topColor: 'rgba(139,92,246,0.10)',
        accentLight: '#F5F3FF',
        icon: Target,
    },
] as const;

const MAX_CHART_POINTS = 900;

function downsampleSeries<T extends { time: string }>(data: T[], max: number): T[] {
    if (data.length <= max) return data;
    const step = Math.ceil(data.length / max);
    const out: T[] = [];
    for (let i = 0; i < data.length; i += step) out.push(data[i]);
    const last = data[data.length - 1];
    if (out[out.length - 1]?.time !== last.time) out.push(last);
    return out;
}

const GRID_COL_NARROW = 'col-span-2';
const GRID_COL_WIDE = 'col-span-3';
// First 9 grid cells (3 rows × 3) use the narrow (span-2 of 6) column,
// the remaining cells (final row of 2) use the wide (span-3 of 6) column.
const NARROW_CHART_COUNT = 9;

function chartGridColClass(chartIndex: number): string {
    return chartIndex < NARROW_CHART_COUNT ? GRID_COL_NARROW : GRID_COL_WIDE;
}

const EXTRA_PANELS = [
    {
        kind: 'ad-count' as const,
        label: 'A/D Rating',
        sublabel: 'A vs D · Count & %',
        badge: 'A/D',
        lineColor: '#4CAF50',
        secondaryColor: '#F44336',
        accentLight: '#E8F5E9',
        icon: Activity,
        desc: 'Green = A Rating · Red = D Rating',
        unit: 'stk',
    },
    {
        kind: 'alhussain' as const,
        label: 'Alhussain',
        sublabel: 'Screener Count',
        badge: 'ALH',
        lineColor: '#7C3AED',
        topColor: 'rgba(124,58,237,0.09)',
        accentLight: '#F5F3FF',
        icon: Target,
        desc: 'Stocks passing Alhussain SMA & volume criteria',
        unit: 'stk',
    },
] as const;

const MINERVINI_CHART_COUNT = MINERVINI_CONFIGS.length;
// Total charts driven by lightweight-charts refs (MA + extras + Minervini) — unchanged.
const TOTAL_CHART_COUNT = MA_CHART_COUNT + EXTRA_PANELS.length + MINERVINI_CHART_COUNT;
// Total grid cells rendered = the charts above + 1 dedicated cell for TASI.
// 9 (3×3) + 2 = 11 → rows of 3, 3, 3, 2.
const GRID_ITEM_COUNT = TOTAL_CHART_COUNT + 1;

/* ── Helper: resolve the AVG50 / AVG200 selectedAverages keys for any chart index.
   Used by the per-chart toggle buttons AND by the new global AVG50/AVG200 toggles,
   so both stay perfectly in sync (same key strings). ── */
function getAvgKeysForIndex(i: number): { avg50Key: string; avg200Key: string } {
    if (i < MA_CHART_COUNT) {
        const cfg = CHART_CONFIGS[i];
        return { avg50Key: cfg.avgKeys[0], avg200Key: cfg.avgKeys[1] };
    }
    const extraIdx = i - MA_CHART_COUNT;
    if (extraIdx < EXTRA_PANELS.length) {
        const panel = EXTRA_PANELS[extraIdx];
        return { avg50Key: `avg50_${panel.kind}`, avg200Key: `avg200_${panel.kind}` };
    }
    const minIdx = i - MA_CHART_COUNT - EXTRA_PANELS.length;
    if (minIdx >= 0 && minIdx < MINERVINI_CONFIGS.length) {
        const cfg = MINERVINI_CONFIGS[minIdx];
        return { avg50Key: `avg50_${cfg.key}`, avg200Key: `avg200_${cfg.key}` };
    }
    return { avg50Key: '', avg200Key: '' };
}

/* ─── Component ─────────────────────────────────────────────────────────── */

function MarketBreadthContent() {
    const { selected: shariahSelected } = useWatchlistShariah();
    const [data, setData] = useState<BreadthItem[]>([]);
    const [adData, setAdData] = useState<ADRatingItem[]>([]);
    const [alhussainData, setAlhussainData] = useState<AlhussainItem[]>([]);
    const [trendData, setTrendData] = useState<ScreenerTrendItem[]>([]);
    /* ── per-section loading state for progressive rendering ── */
    const [sectionLoading, setSectionLoading] = useState<Record<string, boolean>>({
        ma: true, ad: true, alhussain: true, trend: true,
    });
    const [sectionError, setSectionError] = useState<Record<string, string | null>>({
        ma: null, ad: null, alhussain: null, trend: null,
    });
    const loading = Object.values(sectionLoading).some(Boolean);
    const error = Object.values(sectionError).every((e) => e !== null)
        ? Object.values(sectionError).filter(Boolean).join(' | ')
        : null;

    const [period, setPeriod] = useState('ALL');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedAverages, setSelectedAverages] = useState<Record<number, Set<string>>>({});
    const [seriesVisible, setSeriesVisible] = useState<Record<number, boolean>>(
        Object.fromEntries(Array.from({ length: TOTAL_CHART_COUNT }, (_, i) => [i, true]))
    );
    const [fullscreenIdx, setFullscreenIdx] = useState<number | null>(null);
    const [adShowPercent, setAdShowPercent] = useState(false);
    const [hoverValues, setHoverValues] = useState<Record<number, HoverEntry>>({});

    /* ── global AVG 50 / AVG 200 toggles — apply across every chart at once ── */
    const [globalAvg50, setGlobalAvg50] = useState(false);
    const [globalAvg200, setGlobalAvg200] = useState(false);

    /* ── refs ── */
    const pageRef = useRef<HTMLDivElement>(null);
    const isRestoringRef = useRef(false);
    const exportDropRef = useRef<HTMLDivElement>(null);

    const cardRefs = useRef<(HTMLDivElement | null)[]>(Array(TOTAL_CHART_COUNT).fill(null));
    const canvasRefs = useRef<(HTMLDivElement | null)[]>(Array(TOTAL_CHART_COUNT).fill(null));

    const chartsRef = useRef<IChartApi[]>([]);
    const mainSeriesRef = useRef<(ISeriesApi<'Area'> | ISeriesApi<'Line'> | null)[]>(Array(TOTAL_CHART_COUNT).fill(null));
    const secondarySeriesRef = useRef<(ISeriesApi<'Line'> | null)[]>(Array(TOTAL_CHART_COUNT).fill(null));
    const avg50SeriesRef = useRef<(ISeriesApi<'Area'> | ISeriesApi<'Line'> | null)[]>(Array(TOTAL_CHART_COUNT).fill(null));
    const avg200SeriesRef = useRef<(ISeriesApi<'Area'> | ISeriesApi<'Line'> | null)[]>(Array(TOTAL_CHART_COUNT).fill(null));
    const isSyncing = useRef(false);
    const isSyncingCrosshair = useRef(false);
    const savedRangeRef = useRef<any>(null);
    const lastValueUpdateRef = useRef(false);

    const tasiChartRef = useRef<IChartApi | null>(null);
    const tasiSeriesRef = useRef<ISeriesApi<'Area'> | null>(null); // ← جديد: نحتفظ بسيريز تاسي عشان نقدر نقرأ منه ونزامن معاه

    const handleTasiReady = useCallback((chart: IChartApi, series: ISeriesApi<"Area">) => {
        tasiChartRef.current = chart;
        tasiSeriesRef.current = series; // ← جديد

        chart.timeScale().subscribeVisibleTimeRangeChange((range) => {
            if (!range || isSyncing.current || isRestoringRef.current) return;
            isSyncing.current = true;
            chartsRef.current.forEach((c) => {
                if (c) try { c.timeScale().setVisibleRange(range); } catch { }
            });
            setTimeout(() => { isSyncing.current = false; }, 0);
        });

        /* ── جديد: مزامنة crosshair من تاسي → باقي الشارتات ── */
        chart.subscribeCrosshairMove((param) => {
            if (isSyncingCrosshair.current) return; // ده سنك جاي من شارت تاني، متعملش دورة

            /* مفيش hover حالي (الماوس خرج من الشارت) */
            if (!param.point || !param.time) {
                isSyncingCrosshair.current = true;
                chartsRef.current.forEach((c) => {
                    if (c) try { c.clearCrosshairPosition(); } catch { }
                });
                isSyncingCrosshair.current = false;
                return;
            }

            const timeStr =
                typeof param.time === 'string'
                    ? param.time
                    : typeof param.time === 'number'
                        ? String(param.time)
                        : `${(param.time as any).year}-${String((param.time as any).month).padStart(2, '0')}-${String((param.time as any).day).padStart(2, '0')}`;

            isSyncingCrosshair.current = true;
            const updatedEntries: Record<number, HoverEntry> = {};

            chartsRef.current.forEach((targetChart, j) => {
                if (!targetChart) return;
                const targetSeries = mainSeriesRef.current[j];
                if (!targetSeries) return;
                try {
                    const seriesData: any[] = targetSeries.data() as any[];
                    const item = seriesData.find((d) => d.time === timeStr);
                    if (item && item.value != null) {
                        targetChart.setCrosshairPosition(item.value, param.time!, targetSeries);

                        let secondary: number | null = null;
                        const secSeries = secondarySeriesRef.current[j];
                        if (secSeries) {
                            const secItem: any = (secSeries.data() as any[]).find((d) => d.time === timeStr);
                            if (secItem) secondary = secItem.value;
                        }
                        let avg50: number | null = null;
                        const avg50S = avg50SeriesRef.current[j];
                        if (avg50S) {
                            const a: any = (avg50S.data() as any[]).find((d) => d.time === timeStr);
                            if (a) avg50 = a.value;
                        }
                        let avg200: number | null = null;
                        const avg200S = avg200SeriesRef.current[j];
                        if (avg200S) {
                            const a: any = (avg200S.data() as any[]).find((d) => d.time === timeStr);
                            if (a) avg200 = a.value;
                        }

                        updatedEntries[j] = { main: item.value, secondary, avg50, avg200, time: timeStr };
                    }
                } catch { }
            });

            pendingHoverRef.current = { ...pendingHoverRef.current, ...updatedEntries };
            isSyncingCrosshair.current = false;

            if (hoverRafRef.current === null) {
                hoverRafRef.current = requestAnimationFrame(() => {
                    setHoverValues({ ...pendingHoverRef.current });
                    hoverRafRef.current = null;
                });
            }
        });
    }, []);

    // ✅ تحسين hover: استخدام useRef كـ buffer مع requestAnimationFrame
    const hoverRafRef = useRef<number | null>(null);
    const pendingHoverRef = useRef<Record<number, HoverEntry>>({});

    // ✅ منع stale closure: ref يحمل أحدث قيمة seriesVisible
    const seriesVisibleRef = useRef(seriesVisible);
    seriesVisibleRef.current = seriesVisible;


    /* ── progressive parallel fetch: each section independent ── */
    useEffect(() => {
        const controllers: AbortController[] = [];
        let cancelled = false;

        function sortAndDedupeByTime<T extends { time: string }>(items: T[]): T[] {
            const map = new Map<string, T>();
            items.forEach((item) => {
                if (item.time) map.set(item.time, item);
            });
            return Array.from(map.values()).sort((a, b) => a.time.localeCompare(b.time));
        }

        const transformAD = (items: any[]): ADRatingItem[] =>
            sortAndDedupeByTime(
                items.map((item: any) => ({
                    time: item.time, a_rating: item.a_rating ?? 0,
                    d_rating: item.d_rating ?? 0, a_rating_pct: item.a_rating_pct ?? 0,
                    d_rating_pct: item.d_rating_pct ?? 0,
                }))
            );

        const transformAlh = (items: any[]): AlhussainItem[] =>
            sortAndDedupeByTime(
                items.map((item: any) => ({ time: item.time, count: item.count ?? 0 }))
            );

        const transformTrend = (items: any[]): ScreenerTrendItem[] =>
            sortAndDedupeByTime(
                items.map((item: any) => ({
                    time: item.time, trend_1m: item.trend_1m ?? 0,
                    trend_4m: item.trend_4m ?? 0, trend_5m_wide: item.trend_5m_wide ?? 0,
                    alrayan: item.alrayan ?? 0,
                }))
            );

        const fetchWithRetry = async (
            url: string, timeoutMs: number, retries: number,
            signal?: AbortSignal,
        ): Promise<any> => {
            for (let attempt = 0; attempt <= retries; attempt++) {
                const ctrl = new AbortController();
                controllers.push(ctrl);
                const tid = setTimeout(() => ctrl.abort(), timeoutMs);
                if (signal) signal.addEventListener('abort', () => ctrl.abort(), { once: true });
                try {
                    const res = await fetch(url, { signal: ctrl.signal });
                    clearTimeout(tid);
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    return await res.json();
                } catch (e: any) {
                    clearTimeout(tid);
                    if (e.name === 'AbortError' && signal?.aborted) throw e;
                    if (attempt === retries) throw e;
                    await new Promise((r) => setTimeout(r, 800));
                }
            }
        };

        const params = new URLSearchParams({ ad_limit: '3000', alhussain_limit: '3000', screener_trend_limit: '3000' });
        if (period) params.set('period', period);
        if (startDate) params.set('start_date', startDate);
        if (endDate) params.set('end_date', endDate);
        if (shariahSelected.length > 0) {
            params.set('approval_with_controls', shariahSelected.join(','));
        }
        const dashUrl = `${API_BASE_URL}/api/market-breadth/dashboard?${params.toString()}`;

        setSectionLoading({ ma: true, ad: true, alhussain: true, trend: true });
        setSectionError({ ma: null, ad: null, alhussain: null, trend: null });

        const run = async () => {
            try {
                const json = await fetchWithRetry(dashUrl, 15_000, 0);
                if (cancelled) return;

                const maData = json.ma_breadth?.data || [];
                const adItems = transformAD(json.ad_rating?.data || []);
                const alhItems = transformAlh(json.alhussain?.data || []);
                const trendItems = transformTrend(json.screener_trend?.data || []);

                setData(maData);
                setAdData(adItems);
                setAlhussainData(alhItems);
                setTrendData(trendItems);
                setSectionLoading({ ma: false, ad: false, alhussain: false, trend: false });
                setSectionError({ ma: null, ad: null, alhussain: null, trend: null });
                return;
            } catch {
                if (cancelled) return;
            }

            const indParams = new URLSearchParams();
            if (period) indParams.set('period', period);
            if (startDate) indParams.set('start_date', startDate);
            if (endDate) indParams.set('end_date', endDate);
            if (shariahSelected.length > 0) {
                indParams.set('approval_with_controls', shariahSelected.join(','));
            }

            const fetchMA = async () => {
                try {
                    const json = await fetchWithRetry(
                        `${API_BASE_URL}/api/market-breadth/percent-above-ma?${indParams.toString()}`,
                        60_000, 1,
                    );
                    if (cancelled) return;
                    setData(json?.data || []);
                    setSectionError((p) => ({ ...p, ma: null }));
                } catch (e: any) {
                    if (!cancelled) setSectionError((p) => ({ ...p, ma: e.message || 'Failed' }));
                } finally {
                    if (!cancelled) setSectionLoading((p) => ({ ...p, ma: false }));
                }
            };

            const fetchAD = async () => {
                try {
                    const json = await fetchWithRetry(
                        `${API_BASE_URL}/api/market-breadth/ad-rating?${indParams.toString()}&limit=3000`,
                        60_000, 1,
                    );
                    if (cancelled) return;
                    setAdData(transformAD(json?.data || []));
                    setSectionError((p) => ({ ...p, ad: null }));
                } catch (e: any) {
                    if (!cancelled) setSectionError((p) => ({ ...p, ad: e.message || 'Failed' }));
                } finally {
                    if (!cancelled) setSectionLoading((p) => ({ ...p, ad: false }));
                }
            };

            const fetchAlh = async () => {
                try {
                    const json = await fetchWithRetry(
                        `${API_BASE_URL}/api/market-breadth/alhussain-count?${indParams.toString()}&limit=3000`,
                        60_000, 1,
                    );
                    if (cancelled) return;
                    setAlhussainData(transformAlh(json?.data || []));
                    setSectionError((p) => ({ ...p, alhussain: null }));
                } catch (e: any) {
                    if (!cancelled) setSectionError((p) => ({ ...p, alhussain: e.message || 'Failed' }));
                } finally {
                    if (!cancelled) setSectionLoading((p) => ({ ...p, alhussain: false }));
                }
            };

            const fetchTrend = async () => {
                try {
                    const json = await fetchWithRetry(
                        `${API_BASE_URL}/api/market-breadth/screener-trend?${indParams.toString()}&limit=3000`,
                        60_000, 1,
                    );
                    if (cancelled) return;
                    const trendItems = transformTrend(json?.data || []);
                    if (trendItems.length) setTrendData(trendItems);
                    setSectionError((p) => ({ ...p, trend: null }));
                } catch (e: any) {
                    if (!cancelled) setSectionError((p) => ({ ...p, trend: e.message || 'Failed' }));
                } finally {
                    if (!cancelled) setSectionLoading((p) => ({ ...p, trend: false }));
                }
            };

            await Promise.allSettled([fetchMA(), fetchAD(), fetchAlh(), fetchTrend()]);
        };

        run();

        return () => {
            cancelled = true;
            controllers.forEach((c) => c.abort());
        };
    }, [period, startDate, endDate, shariahSelected]);

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

    /* ── build / rebuild charts ── */
    useEffect(() => {
        const hasAnyData =
            data.length > 0 || adData.length > 0 || alhussainData.length > 0 || trendData.length > 0;
        if (!hasAnyData) return;

        if (chartsRef.current.length > 0 && !isRestoringRef.current) {
            try {
                const range = chartsRef.current[0].timeScale().getVisibleRange();
                if (range) savedRangeRef.current = range;
            } catch (e) {
                console.warn('Could not save range:', e);
            }
        }

        chartsRef.current.forEach((c) => c?.remove());
        chartsRef.current = Array(TOTAL_CHART_COUNT).fill(null);
        mainSeriesRef.current = Array(TOTAL_CHART_COUNT).fill(null);
        secondarySeriesRef.current = Array(TOTAL_CHART_COUNT).fill(null);
        avg50SeriesRef.current = Array(TOTAL_CHART_COUNT).fill(null);
        avg200SeriesRef.current = Array(TOTAL_CHART_COUNT).fill(null);

        const baseOptions = {
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
        };

        CHART_CONFIGS.forEach((cfg, i) => {
            const container = canvasRefs.current[i];
            if (!container || data.length === 0) return;
            container.innerHTML = '';

            const chart = createChart(container, {
                ...baseOptions,
                width: container.clientWidth,
                height: Math.max(container.clientHeight, 1),
            });
            chartsRef.current[i] = chart;

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
                crosshairMarkerRadius: 3,
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

            [20, 50, 80].forEach((level) =>
                series.createPriceLine({
                    price: level,
                    color: '#E2E8F0',
                    lineWidth: 1,
                    lineStyle: 1,
                    axisLabelVisible: false,
                })
            );
        });

        /* ── A/D Rating + Alhussain charts ── */
        EXTRA_PANELS.forEach((panel, extraIdx) => {
            const i = MA_CHART_COUNT + extraIdx;
            const container = canvasRefs.current[i];
            if (!container) return;
            container.innerHTML = '';

            const chart = createChart(container, {
                ...baseOptions,
                width: container.clientWidth,
                height: Math.max(container.clientHeight, 1),
            });
            chartsRef.current[i] = chart;

            if (panel.kind === 'ad-count' && adData.length > 0) {
                const aSeries = chart.addSeries(LineSeries, {
                    color: panel.lineColor,
                    lineWidth: 1.5 as any,
                    crosshairMarkerVisible: true,
                    lastValueVisible: true,
                    priceLineVisible: false,
                });
                aSeries.setData(
                    adData.map((d) => ({
                        time: d.time,
                        value: adShowPercent ? d.a_rating_pct : d.a_rating,
                    })) as any
                );
                const dSeries = chart.addSeries(LineSeries, {
                    color: panel.secondaryColor,
                    lineWidth: 1.5 as any,
                    crosshairMarkerVisible: true,
                    lastValueVisible: true,
                    priceLineVisible: false,
                });
                dSeries.setData(
                    adData.map((d) => ({
                        time: d.time,
                        value: adShowPercent ? d.d_rating_pct : d.d_rating,
                    })) as any
                );
                mainSeriesRef.current[i] = aSeries;
                secondarySeriesRef.current[i] = dSeries;

                const selectedSet = selectedAverages[i] || new Set<string>();
                if (selectedSet.has('avg50_ad-count')) {
                    const avg50Series = chart.addSeries(LineSeries, {
                        color: AVG50_COLOR,
                        lineWidth: 1.5 as any,
                        lineStyle: 1,
                        crosshairMarkerVisible: true,
                        lastValueVisible: true,
                        priceLineVisible: false,
                    });
                    avg50Series.setData(
                        seriesMovingAverage(adData, (d) => adShowPercent ? d.a_rating_pct : d.a_rating, 50) as any
                    );
                    avg50SeriesRef.current[i] = avg50Series;
                }
                if (selectedSet.has('avg200_ad-count')) {
                    const avg200Series = chart.addSeries(LineSeries, {
                        color: AVG200_COLOR,
                        lineWidth: 1.5 as any,
                        lineStyle: 1,
                        crosshairMarkerVisible: true,
                        lastValueVisible: true,
                        priceLineVisible: false,
                    });
                    avg200Series.setData(
                        seriesMovingAverage(adData, (d) => adShowPercent ? d.a_rating_pct : d.a_rating, 200) as any
                    );
                    avg200SeriesRef.current[i] = avg200Series;
                }
            } else if (panel.kind === 'alhussain' && alhussainData.length > 0) {
                const series = chart.addSeries(AreaSeries, {
                    lineColor: panel.lineColor,
                    topColor: panel.topColor,
                    bottomColor: 'rgba(0,0,0,0)',
                    lineWidth: 1.5 as any,
                    crosshairMarkerVisible: true,
                    crosshairMarkerRadius: 3,
                    crosshairMarkerBorderColor: panel.lineColor,
                    crosshairMarkerBackgroundColor: '#FFFFFF',
                    lastValueVisible: true,
                    priceLineVisible: false,
                    visible: seriesVisibleRef.current[i] !== false,
                });
                series.setData(alhussainData.map((d) => ({ time: d.time, value: d.count })) as any);
                mainSeriesRef.current[i] = series;

                const selectedSet = selectedAverages[i] || new Set<string>();
                if (selectedSet.has('avg50_alhussain')) {
                    const avg50Series = chart.addSeries(LineSeries, {
                        color: AVG50_COLOR,
                        lineWidth: 1.5 as any,
                        lineStyle: 1,
                        crosshairMarkerVisible: true,
                        lastValueVisible: true,
                        priceLineVisible: false,
                    });
                    avg50Series.setData(
                        seriesMovingAverage(alhussainData, (d) => d.count, 50) as any
                    );
                    avg50SeriesRef.current[i] = avg50Series;
                }
                if (selectedSet.has('avg200_alhussain')) {
                    const avg200Series = chart.addSeries(LineSeries, {
                        color: AVG200_COLOR,
                        lineWidth: 1.5 as any,
                        lineStyle: 1,
                        crosshairMarkerVisible: true,
                        lastValueVisible: true,
                        priceLineVisible: false,
                    });
                    avg200Series.setData(
                        seriesMovingAverage(alhussainData, (d) => d.count, 200) as any
                    );
                    avg200SeriesRef.current[i] = avg200Series;
                }
            }
        });

        /* ── Minervini / Alrayan trend charts ── */
        const trendChartData = downsampleSeries(trendData, MAX_CHART_POINTS);
        MINERVINI_CONFIGS.forEach((cfg, minIdx) => {
            const i = MA_CHART_COUNT + EXTRA_PANELS.length + minIdx;
            const container = canvasRefs.current[i];
            if (!container || trendChartData.length === 0) return;
            container.innerHTML = '';

            const chart = createChart(container, {
                ...baseOptions,
                width: container.clientWidth,
                height: Math.max(container.clientHeight, 1),
            });
            chartsRef.current[i] = chart;

            const series = chart.addSeries(AreaSeries, {
                lineColor: cfg.lineColor,
                topColor: cfg.topColor,
                bottomColor: 'rgba(0,0,0,0)',
                lineWidth: 1.5 as any,
                crosshairMarkerVisible: true,
                crosshairMarkerRadius: 3,
                crosshairMarkerBorderColor: cfg.lineColor,
                crosshairMarkerBackgroundColor: '#FFFFFF',
                lastValueVisible: true,
                priceLineVisible: false,
                visible: seriesVisibleRef.current[i] !== false,
            });
            series.setData(
                trendChartData.map((d) => ({ time: d.time, value: d[cfg.key] })) as any
            );
            mainSeriesRef.current[i] = series;

            const selSet = selectedAverages[i] || new Set<string>();
            const mv50Key = `avg50_${cfg.key}`;
            const mv200Key = `avg200_${cfg.key}`;
            if (selSet.has(mv50Key)) {
                const ma50 = seriesMovingAverage(trendChartData, (d: any) => d[cfg.key], 50);
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
                    priceLineVisible: false,
                });
                avg50Series.setData(ma50 as any);
                avg50SeriesRef.current[i] = avg50Series;
            }
            if (selSet.has(mv200Key)) {
                const ma200 = seriesMovingAverage(trendChartData, (d: any) => d[cfg.key], 200);
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
                    priceLineVisible: false,
                });
                avg200Series.setData(ma200 as any);
                avg200SeriesRef.current[i] = avg200Series;
            }
        });

        /* ── sync time-scale ── */
        chartsRef.current.forEach((chart, i) => {
            if (!chart) return;
            chart.timeScale().subscribeVisibleTimeRangeChange((range) => {
                if (!range || isSyncing.current || isRestoringRef.current) return;
                isSyncing.current = true;
                chartsRef.current.forEach((c, j) => {
                    if (j !== i && c) c.timeScale().setVisibleRange(range);
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

        /* ── crosshair sync + hover (مع تحسين الأداء باستخدام RAF) ── */
        chartsRef.current.forEach((chart, i) => {
            if (!chart) return;
            chart.subscribeCrosshairMove((param) => {
                const mainS = mainSeriesRef.current[i];
                const secS = secondarySeriesRef.current[i];
                const avg50S = avg50SeriesRef.current[i];
                const avg200S = avg200SeriesRef.current[i];

                /* ── mouse left / no data → clear everything ── */
                if (!param.point || !param.time || !mainS) {
                    if (isSyncingCrosshair.current) return;
                    isSyncingCrosshair.current = true;
                    const emptyEntry: HoverEntry = { main: null, secondary: null, avg50: null, avg200: null, time: null };
                    const cleared: Record<number, HoverEntry> = {};
                    chartsRef.current.forEach((c, j) => {
                        cleared[j] = emptyEntry;
                        if (c && c !== chart) { try { c.clearCrosshairPosition(); } catch { } }
                    });
                    if (tasiChartRef.current && tasiChartRef.current !== (chart as any)) {
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

                /* ── valid hover → extract values ── */
                const mainVal = param.seriesData.get(mainS);
                const secVal = secS ? param.seriesData.get(secS) : null;
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
                    secondary: secVal && 'value' in secVal ? (secVal as any).value : null,
                    avg50: avg50Val && 'value' in avg50Val ? (avg50Val as any).value : null,
                    avg200: avg200Val && 'value' in avg200Val ? (avg200Val as any).value : null,
                    time: timeStr,
                };

                pendingHoverRef.current = { ...pendingHoverRef.current, [i]: entry };

                /* ── sync crosshair to other charts (only from real mouse, not from our own sync) ── */
                if (!isSyncingCrosshair.current) {
                    isSyncingCrosshair.current = true;

                    chartsRef.current.forEach((targetChart, j) => {
                        if (j === i || !targetChart) return;
                        const targetSeries = mainSeriesRef.current[j];
                        if (!targetSeries) return;
                        try {
                            let price: number | null = null;
                            let secondary: number | null = null;
                            let avg50: number | null = null;
                            let avg200: number | null = null;

                            if (j < MA_CHART_COUNT && data.length > 0) {
                                const item = data.find(d => d.time === timeStr);
                                if (item) {
                                    price = item[CHART_CONFIGS[j].key] as number;
                                    avg50 = item[CHART_CONFIGS[j].avgKeys[0]] as number;
                                    avg200 = item[CHART_CONFIGS[j].avgKeys[1]] as number;
                                }
                            }
                            else if (j === MA_CHART_COUNT && adData.length > 0) {
                                const item = adData.find(d => d.time === timeStr);
                                if (item) {
                                    price = adShowPercent ? item.a_rating_pct : item.a_rating;
                                    secondary = adShowPercent ? item.d_rating_pct : item.d_rating;
                                }
                            }
                            else if (j === MA_CHART_COUNT + 1 && alhussainData.length > 0) {
                                const item = alhussainData.find(d => d.time === timeStr);
                                if (item) price = item.count;
                            }
                            else if (j >= MA_CHART_COUNT + EXTRA_PANELS.length && trendData.length > 0) {
                                const minIdx = j - MA_CHART_COUNT - EXTRA_PANELS.length;
                                if (minIdx >= 0 && minIdx < MINERVINI_CONFIGS.length) {
                                    const item = trendData.find(d => d.time === timeStr);
                                    if (item) {
                                        const cfgKey = MINERVINI_CONFIGS[minIdx].key;
                                        price = item[cfgKey] as number;
                                        avg50 = item[`avg50_${cfgKey}` as keyof ScreenerTrendItem] as number;
                                        avg200 = item[`avg200_${cfgKey}` as keyof ScreenerTrendItem] as number;
                                    }
                                }
                            }

                            if (price !== null) {
                                targetChart.setCrosshairPosition(price, param.time!, targetSeries);

                                pendingHoverRef.current[j] = {
                                    main: price,
                                    secondary,
                                    avg50,
                                    avg200,
                                    time: timeStr,
                                };
                            }
                        } catch { }
                    });

                    /* ── جديد: مزامنة crosshair لشارت تاسي كمان ── */
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

        /* ── ResizeObserver ── */
        const ro = new ResizeObserver(() => {
            chartsRef.current.forEach((chart, i) => {
                if (!chart) return;
                const el = canvasRefs.current[i];
                if (!el) return;
                chart.applyOptions({
                    width: el.clientWidth,
                    height: Math.max(el.clientHeight, 1),
                });
            });
        });
        canvasRefs.current.forEach((el) => { if (el) ro.observe(el); });

        /* Force charts to fill grid cells after layout */
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                chartsRef.current.forEach((chart, i) => {
                    const el = canvasRefs.current[i];
                    if (!el || !chart) return;
                    chart.applyOptions({
                        width: el.clientWidth,
                        height: Math.max(el.clientHeight, 1),
                    });
                    chart.timeScale().fitContent();
                });
            });
        });

        /* Restore zoom */
        const rangeToRestore = savedRangeRef.current;
        if (rangeToRestore) {
            isRestoringRef.current = true;
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    chartsRef.current.forEach((chart) => {
                        if (!chart) return;
                        try { chart.timeScale().setVisibleRange(rangeToRestore); }
                        catch { chart.timeScale().fitContent(); }
                    });
                    setTimeout(() => { isRestoringRef.current = false; }, 100);
                });
            });
        } else {
            requestAnimationFrame(() => {
                chartsRef.current.forEach((chart) => {
                    if (chart) chart.timeScale().fitContent();
                });
            });
        }

        setTimeout(() => {
            chartsRef.current.forEach((c) => {
                if (c) try { c.clearCrosshairPosition(); } catch { }
            });
        }, 300);

        return () => {
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
    }, [data, adData, alhussainData, trendData, selectedAverages, adShowPercent]);

    /* ── reset saved range on period change ── */
    useEffect(() => { savedRangeRef.current = null; }, [period]);

    /* ── toggle visibility بدون rebuild ── */
    useEffect(() => {
        Object.entries(seriesVisible).forEach(([idx, vis]) => {
            const s = mainSeriesRef.current[Number(idx)];
            if (s) s.applyOptions({ visible: vis });
        });
    }, [seriesVisible]);

    /* ── fullscreen ── */
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

    /* ── fit all ── */
    const fitAll = () => {
        savedRangeRef.current = null;
        chartsRef.current.forEach((c) => c.timeScale().fitContent());
    };

    /* ── toggle avg overlay (per-chart button) ── */
    const toggleAvgKey = (chartIdx: number, key: string) => {
        setSelectedAverages((prev) => {
            const current = new Set(prev[chartIdx] || []);
            if (current.has(key)) current.delete(key);
            else current.add(key);
            return { ...prev, [chartIdx]: current };
        });
    };

    /* ── global toggle: turns AVG50 (or AVG200) on/off across EVERY chart at once ── */
    const toggleGlobalAvg = (which: 'avg50' | 'avg200') => {
        const setter = which === 'avg50' ? setGlobalAvg50 : setGlobalAvg200;
        setter((prev) => {
            const next = !prev;
            setSelectedAverages((prevSel) => {
                const updated: Record<number, Set<string>> = { ...prevSel };
                for (let i = 0; i < TOTAL_CHART_COUNT; i++) {
                    const { avg50Key, avg200Key } = getAvgKeysForIndex(i);
                    const key = which === 'avg50' ? avg50Key : avg200Key;
                    if (!key) continue;
                    const currentSet = new Set(updated[i] || []);
                    if (next) currentSet.add(key);
                    else currentSet.delete(key);
                    updated[i] = currentSet;
                }
                return updated;
            });
            return next;
        });
    };

    /* ── extra controls for Shariah bar ──
       الترتيب المطلوب: AVG 50/200 → الفترات → From/To → Clear → Fit All → Export ── */
    const extraControls = (
        <div className="flex items-center gap-2.5 mr-2">
            {/* ── Global AVG 50 / AVG 200 toggles — أول عنصر ── */}
            <div className="flex bg-slate-100 border border-slate-200 p-0.5 rounded-[9px] gap-0.5">
                <button
                    onClick={() => toggleGlobalAvg('avg50')}
                    title="Show/hide AVG 50 on every chart"
                    className="px-2.5 py-1 rounded-md text-[10px] font-bold transition-all border-none cursor-pointer"
                    style={{
                        background: globalAvg50 ? AVG50_COLOR : 'transparent',
                        color: globalAvg50 ? '#FFFFFF' : '#64748B',
                    }}
                >
                    AVG 50
                </button>
                <button
                    onClick={() => toggleGlobalAvg('avg200')}
                    title="Show/hide AVG 200 on every chart"
                    className="px-2.5 py-1 rounded-md text-[10px] font-bold transition-all border-none cursor-pointer"
                    style={{
                        background: globalAvg200 ? AVG200_COLOR : 'transparent',
                        color: globalAvg200 ? '#FFFFFF' : '#64748B',
                    }}
                >
                    AVG 200
                </button>
            </div>

            {/* ── الفترات — تاني عنصر ── */}
            <div className="flex bg-slate-100 border border-slate-200 p-0.5 rounded-[9px] gap-0.5">
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
                            'px-2.5 py-1 rounded-md text-[10px] font-bold transition-all border-none cursor-pointer',
                            period === p ? 'bg-white text-slate-900 shadow-sm' : 'bg-transparent text-slate-500 hover:text-slate-700',
                            loading ? 'opacity-50' : '',
                        ].join(' ')}
                    >
                        {p}
                    </button>
                ))}
            </div>

            {/* ── From / To — تالت عنصر ── */}
            <label className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-[9px] px-2 py-1 text-[10px] text-slate-600">
                <span className="text-slate-400 font-medium">From</span>
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                        setStartDate(e.target.value);
                        if (e.target.value) setPeriod('');
                    }}
                    className="bg-transparent border-none outline-none text-[10px] font-medium text-slate-700"
                />
            </label>

            <label className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-[9px] px-2 py-1 text-[10px] text-slate-600">
                <span className="text-slate-400 font-medium">To</span>
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                        setEndDate(e.target.value);
                        if (e.target.value) setPeriod('');
                    }}
                    className="bg-transparent border-none outline-none text-[10px] font-medium text-slate-700"
                />
            </label>

            {/* ── Clear — رابع عنصر ── */}
            <button
                onClick={() => {
                    setStartDate('');
                    setEndDate('');
                    setPeriod('ALL');
                }}
                className="px-2 py-1 rounded-[9px] border border-slate-200 bg-white text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
                CLEAR
            </button>

            {/* ── Fit All — خامس عنصر ── */}
            <button
                onClick={fitAll}
                title="Fit all charts to data"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
                <Scan size={12} strokeWidth={2.5} />
                FIT ALL
            </button>

            {/* ── Export — آخر عنصر ── */}
            <ExportButton
                data={data as any}
                adData={adData}
                alhussainData={alhussainData}
                trendData={trendData}
                period={period}
                captureRef={pageRef as any}
            />
        </div>
    );

    const latest = data[data.length - 1];
    const latestAd = adData[adData.length - 1];
    const latestAlh = alhussainData[alhussainData.length - 1];
    const latestTrend = trendData[trendData.length - 1];

    /* ─── Render ───────────────────────────────────────────────────────── */
    return (
        <div
            className="w-full h-full flex-1 flex flex-col bg-slate-50 overflow-hidden min-h-0"
            style={{ fontFamily: '"DM Sans", sans-serif' }}
        >
            <BreadthTabs>
                {extraControls}
            </BreadthTabs>

            <ShariahFilterBar variant="light" />
            <main ref={pageRef} className="flex-1 min-h-0 flex flex-col w-full px-2 pt-1 pb-1 overflow-auto" style={{ flex: '1 1 0' }}>
                <div
                    className="flex-1 min-h-0 w-full grid grid-cols-6 gap-1.5"
                    style={{ gridTemplateRows: 'repeat(4, minmax(0, 1fr))', height: '100%' }}
                >
                    {Array.from({ length: GRID_ITEM_COUNT }, (_, gridIdx) => {
                        if (gridIdx === 0) {
                            const gridCol = chartGridColClass(gridIdx);
                            return (
                                <div
                                    key="tasi-chart"
                                    className={`${gridCol} bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col relative min-h-0 h-full`}
                                    style={{ boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }}
                                >
                                    <TasiIndexChart
                                        period={period}
                                        startDate={startDate}
                                        endDate={endDate}
                                        onChartReady={handleTasiReady}
                                        globalAvg50={globalAvg50}
                                        globalAvg200={globalAvg200}
                                    />
                                </div>
                            );
                        }

                        const i = gridIdx - 1;
                        const isMa = i < MA_CHART_COUNT;
                        const isExtra = !isMa && i < MA_CHART_COUNT + EXTRA_PANELS.length;
                        const isMinervini = i >= MA_CHART_COUNT + EXTRA_PANELS.length;
                        const cfg = isMa ? CHART_CONFIGS[i] : null;
                        const panel = isExtra ? EXTRA_PANELS[i - MA_CHART_COUNT] : null;
                        const minCfg = isMinervini
                            ? MINERVINI_CONFIGS[i - MA_CHART_COUNT - EXTRA_PANELS.length]
                            : null;
                        const lineColor = isMa
                            ? cfg!.lineColor
                            : isMinervini
                                ? minCfg!.lineColor
                                : panel!.lineColor;
                        const Icon = isMa ? cfg!.icon : isMinervini ? minCfg!.icon : panel!.icon;
                        const gridCol = chartGridColClass(gridIdx);
                        const hover = hoverValues[i];
                        const isVisible = seriesVisible[i] !== false;
                        const isFS = fullscreenIdx === i;

                        let displayVal = '—';
                        let unit: string = isMa ? '%' : isMinervini ? 'stk' : panel!.unit;
                        let secondaryDisplay: string | null = null;

                        if (isMa && cfg) {
                            displayVal = !isVisible ? '—' : hover?.main != null
                                ? hover.main.toFixed(1)
                                : latest ? (latest[cfg.key] as number).toFixed(1) : '—';
                        } else if (panel?.kind === 'ad-count') {
                            const pt = hover?.time
                                ? adData.find((d) => d.time === hover.time)
                                : latestAd;
                            if (pt) {
                                if (adShowPercent) {
                                    unit = '';
                                    const aVal = hover?.main != null ? hover.main : pt.a_rating_pct;
                                    const dVal = hover?.secondary != null ? hover.secondary : pt.d_rating_pct;
                                    const aStr = `${Number(aVal).toFixed(1)}%`;
                                    const dStr = `${Number(dVal).toFixed(1)}%`;
                                    displayVal = aStr;
                                    secondaryDisplay = hover?.time
                                        ? `${dStr} · ${pt.a_rating} / ${pt.d_rating}`
                                        : dStr;
                                } else {
                                    unit = '';
                                    const aNum = hover?.main != null ? Math.round(hover.main) : pt.a_rating;
                                    const dNum = hover?.secondary != null ? Math.round(hover.secondary) : pt.d_rating;
                                    displayVal = String(aNum);
                                    secondaryDisplay = hover?.time
                                        ? `${dNum} · ${pt.a_rating_pct}% / ${pt.d_rating_pct}%`
                                        : String(dNum);
                                }
                            }
                        } else if (panel?.kind === 'alhussain') {
                            displayVal = hover?.main != null ? String(Math.round(hover.main)) : latestAlh ? String(latestAlh.count) : '—';
                        } else if (isMinervini && minCfg) {
                            const pt = hover?.time
                                ? trendData.find((d) => d.time === hover.time)
                                : latestTrend;
                            const v = pt ? pt[minCfg.key] : null;
                            displayVal = hover?.main != null
                                ? String(Math.round(hover.main))
                                : v != null ? String(v) : '—';
                        }

                        const title = isMa
                            ? `${cfg!.label} MA`
                            : isMinervini
                                ? minCfg!.label
                                : panel!.label;
                        const sub = panel?.kind === 'ad-count'
                            ? (adShowPercent ? 'A vs D · %' : 'A vs D · Count')
                            : isMa
                                ? cfg!.sublabel
                                : isMinervini
                                    ? minCfg!.sublabel
                                    : panel!.sublabel;
                        const badge = isMa ? cfg!.badge : isMinervini ? minCfg!.badge : panel!.badge;

                        const selectedSet = selectedAverages[i] || new Set<string>();
                        let avg50Key = '';
                        let avg200Key = '';
                        if (isMa) {
                            avg50Key = cfg!.avgKeys[0];
                            avg200Key = cfg!.avgKeys[1];
                        } else if (isMinervini && minCfg) {
                            avg50Key = `avg50_${minCfg.key}`;
                            avg200Key = `avg200_${minCfg.key}`;
                        } else if (isExtra && panel) {
                            avg50Key = `avg50_${panel.kind}`;
                            avg200Key = `avg200_${panel.kind}`;
                        }
                        const isAvg50Active = avg50Key ? selectedSet.has(avg50Key) : false;
                        const isAvg200Active = avg200Key ? selectedSet.has(avg200Key) : false;
                        const avg50DisplayVal = hover?.avg50 != null ? hover.avg50.toFixed(1) : null;
                        const avg200DisplayVal = hover?.avg200 != null ? hover.avg200.toFixed(1) : null;

                        return (
                            <div
                                key={gridIdx}
                                ref={(el) => { cardRefs.current[i] = el; }}
                                className={`${gridCol} bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col relative min-h-0 h-full`}
                                style={{ borderLeft: `3px solid ${lineColor}`, boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }}
                            >
                                <div className="px-2.5 pt-1.5 pb-1 flex justify-between items-center flex-shrink-0">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                        <div className="w-[22px] h-[22px] rounded-md flex items-center justify-center flex-shrink-0"
                                            style={{
                                                background: isMa
                                                    ? cfg!.accentLight
                                                    : isMinervini
                                                        ? minCfg!.accentLight
                                                        : panel!.accentLight,
                                            }}>
                                            <Icon size={11} color={lineColor} strokeWidth={2} />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="text-[10px] font-semibold text-slate-900 leading-none truncate">{title}</div>
                                            <div className="text-[8px] text-slate-400 leading-none mt-0.5">{sub}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-baseline gap-0.5 flex-shrink-0">
                                        <span className="text-[15px] font-bold text-slate-900 leading-none">{displayVal}</span>
                                        {unit === '%' && displayVal !== '—' && <span className="text-[9px] text-slate-400">%</span>}
                                        {secondaryDisplay && (
                                            <span className="text-[10px] font-semibold text-red-500 ml-1">/ {secondaryDisplay}</span>
                                        )}
                                        {avg50DisplayVal && isAvg50Active && (
                                            <span className="text-[9px] ml-1 font-semibold" style={{ color: AVG50_COLOR }}>/{avg50DisplayVal}%</span>
                                        )}
                                    </div>
                                </div>

                                <div className="px-2 py-0.5 flex items-center gap-1 border-y border-slate-100 flex-shrink-0">
                                    {isExtra && panel?.kind === 'ad-count' && (
                                        <>
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                            <span className="text-[8px] text-slate-400">A</span>
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 ml-1" />
                                            <span className="text-[8px] text-slate-400">D</span>
                                        </>
                                    )}
                                    <div className="flex-1" />
                                    {hover?.time && <span className="text-[8px] text-slate-400">{hover.time}</span>}
                                    {(isMa || isMinervini || isExtra) && (
                                        <>
                                            <button onClick={() => toggleAvgKey(i, avg50Key)}
                                                className="px-1.5 py-0.5 rounded text-[8px] font-semibold cursor-pointer border"
                                                style={{ borderColor: isAvg50Active ? AVG50_COLOR : '#E2E8F0', background: isAvg50Active ? AVG50_COLOR : 'transparent', color: isAvg50Active ? '#FFF' : '#64748B' }}>
                                                AVG50
                                            </button>
                                            <button onClick={() => toggleAvgKey(i, avg200Key)}
                                                className="px-1.5 py-0.5 rounded text-[8px] font-semibold cursor-pointer border"
                                                style={{ borderColor: isAvg200Active ? AVG200_COLOR : '#E2E8F0', background: isAvg200Active ? AVG200_COLOR : 'transparent', color: isAvg200Active ? '#FFF' : '#64748B' }}>
                                                AVG200
                                            </button>
                                        </>
                                    )}
                                    {panel?.kind === 'ad-count' && (
                                        <button
                                            type="button"
                                            onClick={() => setAdShowPercent((p) => !p)}
                                            title={adShowPercent ? 'Show count' : 'Show percentage'}
                                            className={[
                                                'w-[20px] h-[20px] flex items-center justify-center rounded border cursor-pointer transition-colors',
                                                adShowPercent
                                                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                                                    : 'border-slate-200 bg-transparent text-slate-500 hover:bg-slate-50',
                                            ].join(' ')}
                                        >
                                            {adShowPercent ? <Hash size={9} /> : <Percent size={9} />}
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setSeriesVisible((prev) => ({ ...prev, [i]: !isVisible }))}
                                        title={isVisible ? 'Hide original data' : 'Show original data'}
                                        className="w-[20px] h-[20px] flex items-center justify-center rounded border cursor-pointer transition-colors"
                                        style={{
                                            borderColor: !isVisible ? lineColor : '#E2E8F0',
                                            background: !isVisible ? lineColor : 'transparent',
                                            color: !isVisible ? '#FFFFFF' : '#64748B',
                                        }}
                                    >
                                        {isVisible ? <Eye size={9} /> : <EyeOff size={9} />}
                                    </button>
                                    <button onClick={() => handleFullscreen(i)}
                                        className="w-[20px] h-[20px] flex items-center justify-center rounded border border-slate-200 cursor-pointer bg-transparent">
                                        {isFS ? <Minimize2 size={9} /> : <Maximize2 size={9} />}
                                    </button>
                                </div>

                                <div className="flex-1 min-h-0 relative w-full">
                                    <div ref={(el) => { canvasRefs.current[i] = el; }} className="absolute inset-0 w-full h-full" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}

export default function MarketBreadthPage() {
    return (
        <WatchlistShariahProvider>
            <MarketBreadthContent />
        </WatchlistShariahProvider>
    );
}