'use client';

import { useEffect, useRef, useState } from 'react';
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
const NARROW_CHART_COUNT = 6;

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
const TOTAL_CHART_COUNT = MA_CHART_COUNT + EXTRA_PANELS.length + MINERVINI_CHART_COUNT;

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
    const [selectedAverages, setSelectedAverages] = useState<Record<number, Set<string>>>({});
    const [seriesVisible, setSeriesVisible] = useState<Record<number, boolean>>(
        Object.fromEntries(Array.from({ length: TOTAL_CHART_COUNT }, (_, i) => [i, true]))
    );
    const [fullscreenIdx, setFullscreenIdx] = useState<number | null>(null);
    const [adShowPercent, setAdShowPercent] = useState(false);
    const [hoverValues, setHoverValues] = useState<Record<number, HoverEntry>>({});

    /* ── refs ── */
    const pageRef = useRef<HTMLDivElement>(null);
    const isRestoringRef = useRef(false);
    const exportDropRef = useRef<HTMLDivElement>(null);

    const cardRefs = useRef<(HTMLDivElement | null)[]>(Array(TOTAL_CHART_COUNT).fill(null));
    const canvasRefs = useRef<(HTMLDivElement | null)[]>(Array(TOTAL_CHART_COUNT).fill(null));

    const chartsRef = useRef<IChartApi[]>([]);
    const mainSeriesRef = useRef<(ISeriesApi<'Area'> | ISeriesApi<'Line'> | null)[]>(Array(TOTAL_CHART_COUNT).fill(null));
    const secondarySeriesRef = useRef<(ISeriesApi<'Line'> | null)[]>(Array(TOTAL_CHART_COUNT).fill(null));
    const avg50SeriesRef = useRef<(ISeriesApi<'Area'> | null)[]>(Array(TOTAL_CHART_COUNT).fill(null));
    const avg200SeriesRef = useRef<(ISeriesApi<'Area'> | null)[]>(Array(TOTAL_CHART_COUNT).fill(null));
    const isSyncing = useRef(false);
    const savedRangeRef = useRef<any>(null);

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

        /**
         * Strategy (like Bloomberg/TradingView):
         *  Phase 1 — Try the bundled /dashboard endpoint with a SHORT timeout (15s).
         *            On warm cache this returns instantly with all 4 datasets.
         *  Phase 2 — If phase 1 fails (cold cache → timeout/ECONNRESET),
         *            fire 4 individual lightweight requests in parallel.
         *            Each chart renders as soon as its data arrives (progressive).
         */

        const transformAD = (items: any[]): ADRatingItem[] =>
            items.map((item: any) => ({
                time: item.time, a_rating: item.a_rating ?? 0,
                d_rating: item.d_rating ?? 0, a_rating_pct: item.a_rating_pct ?? 0,
                d_rating_pct: item.d_rating_pct ?? 0,
            }));

        const transformAlh = (items: any[]): AlhussainItem[] =>
            items.map((item: any) => ({ time: item.time, count: item.count ?? 0 }));

        const transformTrend = (items: any[]): ScreenerTrendItem[] =>
            items.map((item: any) => ({
                time: item.time, trend_1m: item.trend_1m ?? 0,
                trend_4m: item.trend_4m ?? 0, trend_5m_wide: item.trend_5m_wide ?? 0,
                alrayan: item.alrayan ?? 0,
            }));

        // ── helper: fetch with timeout, retry, and per-section state ──
        const fetchWithRetry = async (
            url: string, timeoutMs: number, retries: number,
            signal?: AbortSignal,
        ): Promise<any> => {
            for (let attempt = 0; attempt <= retries; attempt++) {
                const ctrl = new AbortController();
                controllers.push(ctrl);
                const tid = setTimeout(() => ctrl.abort(), timeoutMs);
                // link parent signal
                if (signal) signal.addEventListener('abort', () => ctrl.abort(), { once: true });
                try {
                    const res = await fetch(url, { signal: ctrl.signal });
                    clearTimeout(tid);
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    return await res.json();
                } catch (e: any) {
                    clearTimeout(tid);
                    if (e.name === 'AbortError' && signal?.aborted) throw e; // parent cancelled
                    if (attempt === retries) throw e;
                    await new Promise((r) => setTimeout(r, 800)); // brief pause before retry
                }
            }
        };

        const params = new URLSearchParams({ period, ad_limit: '3000', alhussain_limit: '3000', screener_trend_limit: '3000' });
        if (shariahSelected.length > 0) {
            params.set('approval_with_controls', shariahSelected.join(','));
        }
        const dashUrl = `${API_BASE_URL}/api/market-breadth/dashboard?${params.toString()}`;

        // Reset all sections to loading
        setSectionLoading({ ma: true, ad: true, alhussain: true, trend: true });
        setSectionError({ ma: null, ad: null, alhussain: null, trend: null });

        const run = async () => {
            // ═══════════════════════════════════════════════════════
            // PHASE 1 — fast dashboard attempt (15s timeout, 0 retries)
            // ═══════════════════════════════════════════════════════
            try {
                const json = await fetchWithRetry(dashUrl, 15_000, 0);
                if (cancelled) return;

                // Dashboard returned successfully (cache hit or fast cold)
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
                return; // all done
            } catch {
                // Dashboard failed (cold cache timeout) → fall through to phase 2
                if (cancelled) return;
            }

            // ═══════════════════════════════════════════════════════
            // PHASE 2 — parallel individual requests (60s each, 1 retry)
            //           each section renders independently as it arrives
            // ═══════════════════════════════════════════════════════
            const indParams = new URLSearchParams({ period });
            if (shariahSelected.length > 0) {
                indParams.set('approval_with_controls', shariahSelected.join(','));
            }

            // MA Breadth (from pre-aggregated table — fast)
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

            // A/D Rating
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

            // Alhussain
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

            // Screener Trend (from screener_daily_trend_counts — fast)
            const fetchTrend = async () => {
                try {
                    // Use the dashboard endpoint one more time but with short data
                    // Actually, use the individual alhussain-count which also reads the same table
                    // The screener_daily_bundle is already fast, so let's try dashboard again
                    // with a longer timeout — this time the other sections are already loading
                    const json = await fetchWithRetry(
                        `${API_BASE_URL}/api/market-breadth/dashboard?${params.toString()}`,
                        60_000, 1,
                    );
                    if (cancelled) return;
                    // Extract only trend from the dashboard response
                    const trendItems = transformTrend(json.screener_trend?.data || []);
                    if (trendItems.length) setTrendData(trendItems);
                    // Also backfill any sections that were slower individually
                    const maData = json.ma_breadth?.data || [];
                    const adItems = transformAD(json.ad_rating?.data || []);
                    const alhItems = transformAlh(json.alhussain?.data || []);
                    if (maData.length) setData((prev) => prev.length ? prev : maData);
                    if (adItems.length) setAdData((prev) => prev.length ? prev : adItems);
                    if (alhItems.length) setAlhussainData((prev) => prev.length ? prev : alhItems);
                    setSectionError((p) => ({ ...p, trend: null }));
                } catch (e: any) {
                    if (!cancelled) setSectionError((p) => ({ ...p, trend: e.message || 'Failed' }));
                } finally {
                    if (!cancelled) setSectionLoading((p) => ({ ...p, trend: false }));
                }
            };

            // Fire all 4 in parallel — each updates its own section independently
            await Promise.allSettled([fetchMA(), fetchAD(), fetchAlh(), fetchTrend()]);
        };

        run();

        return () => {
            cancelled = true;
            controllers.forEach((c) => c.abort());
        };
    }, [period, shariahSelected]);


    /* ── build / rebuild charts ── */
    useEffect(() => {
        const hasAnyData =
            data.length > 0 || adData.length > 0 || alhussainData.length > 0 || trendData.length > 0;
        if (!hasAnyData) return;

        if (chartsRef.current.length > 0 && !isRestoringRef.current) {
            try {
                const range = chartsRef.current[0].timeScale().getVisibleLogicalRange();
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
                data.map((item) => ({ time: item.time, value: item[cfg.key] as number })) as any
            );
            mainSeriesRef.current[i] = series;

            const selectedSet = selectedAverages[i] || new Set<string>();

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
        });

        /* ── sync time-scale ── */
        chartsRef.current.forEach((chart, i) => {
            if (!chart) return;
            chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
                if (!range || isSyncing.current || isRestoringRef.current) return;
                isSyncing.current = true;
                chartsRef.current.forEach((c, j) => {
                    if (j !== i && c) c.timeScale().setVisibleLogicalRange(range);
                });
                setTimeout(() => { isSyncing.current = false; }, 0);
                if (!isRestoringRef.current && chartsRef.current[0]) {
                    try {
                        const newRange = chartsRef.current[0].timeScale().getVisibleLogicalRange();
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

                let entry: HoverEntry = { main: null, secondary: null, avg50: null, avg200: null, time: null };

                if (param.point && param.time && mainS) {
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

                    entry = {
                        main: mainVal && 'value' in mainVal ? (mainVal as any).value : null,
                        secondary: secVal && 'value' in secVal ? (secVal as any).value : null,
                        avg50: avg50Val && 'value' in avg50Val ? (avg50Val as any).value : null,
                        avg200: avg200Val && 'value' in avg200Val ? (avg200Val as any).value : null,
                        time: timeStr,
                    };
                }

                // ✅ تحسين الأداء: استخدام pendingHoverRef كـ buffer مع RAF
                pendingHoverRef.current = { ...pendingHoverRef.current, [i]: entry };
                if (hoverRafRef.current === null) {
                    hoverRafRef.current = requestAnimationFrame(() => {
                        setHoverValues({ ...pendingHoverRef.current });
                        hoverRafRef.current = null;
                    });
                }

                // ✅ الحفاظ على مزامنة الـ crosshair بين جميع الشارتات
                chartsRef.current.forEach((targetChart, j) => {
                    if (j === i || !targetChart) return;
                    const targetSeries = mainSeriesRef.current[j];
                    if (!param.point || !param.time || !targetSeries) {
                        try { targetChart.clearCrosshairPosition(); } catch { }
                        return;
                    }
                    try {
                        const price = targetSeries.coordinateToPrice(param.point.y);
                        if (price !== null)
                            targetChart.setCrosshairPosition(price, param.time, targetSeries);
                    } catch { }
                });
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
                        try { chart.timeScale().setVisibleLogicalRange(rangeToRestore); }
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

        return () => {
            if (hoverRafRef.current !== null) {
                cancelAnimationFrame(hoverRafRef.current);
                hoverRafRef.current = null;
            }
            ro.disconnect();
            chartsRef.current.forEach((c) => c?.remove());
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

    /* ── toggle avg overlay ── */
    const toggleAvgKey = (chartIdx: number, key: string) => {
        setSelectedAverages((prev) => {
            const current = new Set(prev[chartIdx] || []);
            if (current.has(key)) current.delete(key);
            else current.add(key);
            return { ...prev, [chartIdx]: current };
        });
    };

    /* ── extra controls for Shariah bar ── */
    const extraControls = (
        <div className="flex items-center gap-2.5 mr-2">
            {/* period selector */}
            <div className="flex bg-slate-100 border border-slate-200 p-0.5 rounded-[9px] gap-0.5">
                {['5D', '1M', '6M', '1Y', '5Y', '10Y', 'ALL'].map((p) => (
                    <button
                        key={p}
                        onClick={() => setPeriod(p)}
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

            {/* fit all */}
            <button
                onClick={fitAll}
                title="Fit all charts to data"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
                <Scan size={12} strokeWidth={2.5} />
                FIT ALL
            </button>

            {/* export */}
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

    /* ─── helpers: which section does each chart belong to? ──────────── */
    const sectionForChart = (i: number): string => {
        if (i < MA_CHART_COUNT) return 'ma';
        if (i < MA_CHART_COUNT + EXTRA_PANELS.length) {
            const panel = EXTRA_PANELS[i - MA_CHART_COUNT];
            return panel.kind === 'ad-count' ? 'ad' : 'alhussain';
        }
        return 'trend';
    };

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
            <ShariahFilterBar variant="light" extraControls={extraControls} />
            {/* ── Main ───────────────────────────────────────────────────── */}
            <main ref={pageRef} className="flex-1 min-h-0 flex flex-col w-full px-2 pt-1 pb-1 overflow-hidden" style={{ flex: '1 1 0' }}>

                {/* CHART GRID — rows: 3+3 narrow, then 2+2 wide (Minervini) */}
                <div
                    className="flex-1 min-h-0 w-full grid grid-cols-6 gap-1.5"
                    style={{ gridTemplateRows: 'repeat(4, minmax(0, 1fr))', height: '100%' }}
                >
                    {Array.from({ length: TOTAL_CHART_COUNT }, (_, i) => {
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
                        const gridCol = chartGridColClass(i);
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

                        const selectedSet = isMa ? (selectedAverages[i] || new Set<string>()) : new Set<string>();
                        const avg50Key = isMa ? cfg!.avgKeys[0] : '';
                        const avg200Key = isMa ? cfg!.avgKeys[1] : '';
                        const isAvg50Active = selectedSet.has(avg50Key);
                        const isAvg200Active = selectedSet.has(avg200Key);
                        const avg50DisplayVal = hover?.avg50 != null ? hover.avg50.toFixed(1) : null;
                        const avg200DisplayVal = hover?.avg200 != null ? hover.avg200.toFixed(1) : null;

                        return (
                            <div
                                key={i}
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
                                    <span className="text-[8px] font-bold text-slate-400 px-1">{badge}</span>
                                    {isMa && (
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