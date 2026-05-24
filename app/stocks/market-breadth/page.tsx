'use client';

import { useEffect, useRef, useState } from 'react';
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
    Download,
    FileText,
    Image as ImgIcon,
    Table2,
    Scan,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { API_BASE_URL } from '@/lib/api/config';
import { ShariahFilterPage, useWatchlistShariah } from '@/components/Watchlist/WatchlistShariahContext';

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

/* ─── Component ─────────────────────────────────────────────────────────── */

function MarketBreadthContent() {
    const { selected: shariahSelected } = useWatchlistShariah();
    const [data, setData] = useState<BreadthItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tick, setTick] = useState(0);
    const [period, setPeriod] = useState('ALL');
    const [selectedAverages, setSelectedAverages] =
        useState<Record<number, Set<string>>>({});
    const [seriesVisible, setSeriesVisible] =
        useState<Record<number, boolean>>({ 0: true, 1: true, 2: true, 3: true });
    const [fullscreenIdx, setFullscreenIdx] = useState<number | null>(null);
    const [exportOpen, setExportOpen] = useState(false);
    const [exportStatus, setExportStatus] = useState<string | null>(null);
    const [hoverValues, setHoverValues] = useState<Record<number, HoverEntry>>({});

    /* ── refs ── */
    const pageRef = useRef<HTMLDivElement>(null);
    const isRestoringRef = useRef(false);
    const exportDropRef = useRef<HTMLDivElement>(null);

    // ✅ Fix 2: useRef بـ array بدل array من useRef — Rules of Hooks
    const cardRefs = useRef<(HTMLDivElement | null)[]>(Array(CHART_COUNT).fill(null));
    const canvasRefs = useRef<(HTMLDivElement | null)[]>(Array(CHART_COUNT).fill(null));

    const chartsRef = useRef<IChartApi[]>([]);
    const mainSeriesRef = useRef<(ISeriesApi<'Area'> | null)[]>(Array(CHART_COUNT).fill(null));
    const avg50SeriesRef = useRef<(ISeriesApi<'Area'> | null)[]>(Array(CHART_COUNT).fill(null));
    const avg200SeriesRef = useRef<(ISeriesApi<'Area'> | null)[]>(Array(CHART_COUNT).fill(null));
    const isSyncing = useRef(false);
    const savedRangeRef = useRef<any>(null);

    // ✅ تحسين hover: استخدام useRef كـ buffer مع requestAnimationFrame
    const hoverRafRef = useRef<number | null>(null);
    const pendingHoverRef = useRef<Record<number, HoverEntry>>({});

    // ✅ منع stale closure: ref يحمل أحدث قيمة seriesVisible
    const seriesVisibleRef = useRef(seriesVisible);
    seriesVisibleRef.current = seriesVisible;

    /* ── tick for live dot ── */
    useEffect(() => {
        const id = setInterval(() => setTick((t) => t + 1), 1400);
        return () => clearInterval(id);
    }, []);

    /* ── fetch data ── */
    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                setError(null); // ✅ Fix 3: reset error قبل كل fetch جديد
                const params = new URLSearchParams({ period });
                if (shariahSelected.length > 0) {
                    params.set('approval_with_controls', shariahSelected.join(','));
                }
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
    }, [period, shariahSelected]);

    /* ── click-outside: يقفل Export dropdown ── */
    useEffect(() => {
        if (!exportOpen) return;
        const handler = (e: MouseEvent) => {
            if (exportDropRef.current && !exportDropRef.current.contains(e.target as Node)) {
                setExportOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [exportOpen]);

    /* ── build / rebuild charts ── */
    useEffect(() => {
        if (data.length === 0) return;

        if (chartsRef.current.length > 0 && !isRestoringRef.current) {
            try {
                const range = chartsRef.current[0].timeScale().getVisibleLogicalRange();
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
                height: container.clientHeight || 180,
            });
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

        /* ── sync time-scale ── */
        chartsRef.current.forEach((chart, i) => {
            chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
                if (!range || isSyncing.current || isRestoringRef.current) return;
                isSyncing.current = true;
                chartsRef.current.forEach((c, j) => {
                    if (j !== i) c.timeScale().setVisibleLogicalRange(range);
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
            chart.subscribeCrosshairMove((param) => {
                const mainS = mainSeriesRef.current[i];
                const avg50S = avg50SeriesRef.current[i];
                const avg200S = avg200SeriesRef.current[i];

                let entry: HoverEntry = { main: null, avg50: null, avg200: null, time: null };

                if (param.point && param.time && mainS) {
                    const mainVal = param.seriesData.get(mainS);
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
                    if (j === i) return;
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
                const el = canvasRefs.current[i];
                if (!el) return;
                chart.applyOptions({
                    width: el.clientWidth,
                    height: Math.max(el.clientHeight, 100),
                });
            });
        });
        canvasRefs.current.forEach((el) => { if (el) ro.observe(el); });

        /* Restore zoom */
        const rangeToRestore = savedRangeRef.current;
        if (rangeToRestore) {
            isRestoringRef.current = true;
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    chartsRef.current.forEach((chart) => {
                        try { chart.timeScale().setVisibleLogicalRange(rangeToRestore); }
                        catch { chart.timeScale().fitContent(); }
                    });
                    setTimeout(() => { isRestoringRef.current = false; }, 100);
                });
            });
        } else {
            requestAnimationFrame(() => {
                chartsRef.current.forEach((chart) => chart.timeScale().fitContent());
            });
        }

        return () => {
            if (hoverRafRef.current !== null) {
                cancelAnimationFrame(hoverRafRef.current);
                hoverRafRef.current = null;
            }
            ro.disconnect();
            chartsRef.current.forEach((c) => c.remove());
            chartsRef.current = [];
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, selectedAverages]);

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

    /* ── export ── */
    const today = () => new Date().toISOString().slice(0, 10);
    const notify = (msg: string) => {
        setExportStatus(msg);
        setTimeout(() => setExportStatus(null), 2500);
    };

    const exportPDF = async () => {
        setExportOpen(false);
        if (!pageRef.current) return;
        notify('Generating PDF…');
        try {
            const canvas = await html2canvas(pageRef.current, { scale: 2, useCORS: true, backgroundColor: '#F8FAFC' });
            const pdf = new jsPDF({
                orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
                unit: 'px',
                format: [canvas.width / 2, canvas.height / 2],
            });
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
            pdf.save(`TASI-Market-Breadth-${today()}.pdf`);
            notify('PDF saved ✓');
        } catch { notify('PDF export failed'); }
    };

    const exportImage = async () => {
        setExportOpen(false);
        if (!pageRef.current) return;
        notify('Capturing screenshot…');
        try {
            const canvas = await html2canvas(pageRef.current, { scale: 2, useCORS: true, backgroundColor: '#F8FAFC' });
            const link = document.createElement('a');
            link.download = `TASI-Market-Breadth-${today()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            notify('Image saved ✓');
        } catch { notify('Image export failed'); }
    };

    const exportExcel = () => {
        setExportOpen(false);
        if (!data.length) return;
        notify('Preparing Excel file…');
        const rows = data.map((d) => ({
            Date: d.time,
            'Total Constituents': d.total,
            '% Above MA20': +d.pct_above_20.toFixed(2),
            '% Above MA50': +d.pct_above_50.toFixed(2),
            '% Above MA150': +d.pct_above_150.toFixed(2),
            '% Above MA200': +d.pct_above_200.toFixed(2),
        }));
        const ws = XLSX.utils.json_to_sheet(rows);
        ws['!cols'] = [{ wch: 12 }, { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 15 }, { wch: 15 }];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Market Breadth');
        XLSX.writeFile(wb, `TASI-Market-Breadth-${today()}.xlsx`);
        notify('Excel downloaded ✓');
    };

    /* ─── Loading / Error ──────────────────────────────────────────────── */

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
                        onClick={() => setPeriod((p) => p)}
                        className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg cursor-pointer border-none"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );

    const latest = data[data.length - 1];

    /* ─── Render ───────────────────────────────────────────────────────── */
    return (
        <div
            className="w-full flex-1 flex flex-col bg-slate-50 overflow-hidden min-h-0"
            style={{ fontFamily: '"DM Sans", sans-serif' }}
        >
            {/* ── Header ─────────────────────────────────────────────────── */}
            <header
                className="bg-white border-b border-slate-200 flex-shrink-0 z-50"
                style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}
            >
                <div className="w-full px-5 h-[60px] flex items-center justify-between gap-6">

                    {/* brand */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="w-[34px] h-[34px] bg-slate-50 border border-slate-200 rounded-[9px] flex items-center justify-center flex-shrink-0">
                            <svg width="16" height="16" viewBox="0 0 20 18" fill="none">
                                <rect x="0" y="10" width="3.5" height="8" rx="1" fill="#0F7A5A" />
                                <rect x="5.5" y="6" width="3.5" height="12" rx="1" fill="#1560A8" />
                                <rect x="11" y="2" width="3.5" height="16" rx="1" fill="#A0600A" />
                                <rect x="16.5" y="8" width="3.5" height="10" rx="1" fill="#B02040" opacity="0.8" />
                            </svg>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-[14px] font-bold text-slate-900 tracking-tight m-0">Market Breadth</h1>
                                <span className="text-slate-300">/</span>
                                <span className="text-[12px] text-slate-500">TASI Analysis</span>
                                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded ml-1">
                                    <span
                                        className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block"
                                        style={{ opacity: tick % 2 === 0 ? 1 : 0.25, transition: 'opacity 0.5s ease' }}
                                    />
                                    Live
                                </span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5 leading-none">
                                Constituent breadth across moving average thresholds
                            </p>
                        </div>
                    </div>

                    {/* controls */}
                    <div className="flex items-center gap-2.5">

                        {/* period selector */}
                        <div className="flex bg-slate-50 border border-slate-200 p-0.5 rounded-[9px] gap-0.5">
                            {['5D', '1M', '6M', '1Y', '5Y', '10Y', 'ALL'].map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPeriod(p)}
                                    disabled={loading}
                                    className={[
                                        'px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all border-none cursor-pointer',
                                        period === p ? 'bg-white text-slate-900 shadow-sm' : 'bg-transparent text-slate-500 hover:text-slate-700',
                                        loading ? 'opacity-50' : '',
                                    ].join(' ')}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>

                        {/* stat blocks */}
                        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-[9px] px-3.5 py-2 gap-4">
                            {CHART_CONFIGS.map((cfg, i) => {
                                const val = latest ? Math.round(latest[cfg.key] as number) : 0;
                                return (
                                    <div key={cfg.key} className={i > 0 ? 'pl-4 border-l border-slate-100' : ''}>
                                        <div className="flex items-center gap-1 mb-0.5">
                                            <span className="w-[6px] h-[6px] rounded-[2px] inline-block flex-shrink-0" style={{ background: cfg.lineColor }} />
                                            <span className="text-[9px] text-slate-400 font-medium tracking-wide">{cfg.badge}</span>
                                        </div>
                                        <div className="flex items-baseline gap-0.5">
                                            <span className="text-[18px] font-bold text-slate-900 leading-none tracking-tight">{val}</span>
                                            <span className="text-[10px] text-slate-400">%</span>
                                        </div>
                                        <div className="mt-1 h-[3px] rounded-full bg-slate-100 overflow-hidden w-[60px]">
                                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${val}%`, background: cfg.lineColor }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* fit all */}
                        <button
                            onClick={fitAll}
                            title="Fit all charts to data"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                            <Scan size={13} />
                            Fit All
                        </button>

                        {/* export — مع click-outside */}
                        <div className="relative" ref={exportDropRef}>
                            <button
                                onClick={() => setExportOpen((o) => !o)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[12px] font-medium text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                                <Download size={13} />
                                Export
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                    style={{ transform: exportOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </button>

                            {exportOpen && (
                                <div className="absolute top-[calc(100%+6px)] right-0 min-w-[210px] bg-white border border-slate-200 rounded-xl overflow-hidden z-[999]"
                                    style={{ boxShadow: '0 8px 24px rgba(15,23,42,0.10)' }}>
                                    <div className="px-3.5 py-2 text-[10px] text-slate-400 uppercase tracking-widest font-semibold border-b border-slate-100">
                                        Export as
                                    </div>
                                    {[
                                        { icon: <FileText size={13} color="#B02040" />, bg: '#FEF2F2', label: 'PDF Report', sub: 'Full page with all charts', action: exportPDF },
                                        { icon: <ImgIcon size={13} color="#4338CA" />, bg: '#EEF2FF', label: 'PNG Image', sub: 'Screenshot of the dashboard', action: exportImage },
                                        null,
                                        { icon: <Table2 size={13} color="#166534" />, bg: '#F0FFF4', label: 'Excel / CSV', sub: 'Raw breadth data table', action: exportExcel },
                                    ].map((item, idx) =>
                                        item === null ? (
                                            <div key={idx} className="h-px bg-slate-100 mx-3.5 my-1" />
                                        ) : (
                                            <button key={idx} onClick={item.action}
                                                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-slate-50 transition-colors text-left cursor-pointer border-none bg-transparent">
                                                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: item.bg }}>
                                                    {item.icon}
                                                </div>
                                                <div>
                                                    <div className="text-[13px] font-medium text-slate-800">{item.label}</div>
                                                    <div className="text-[11px] text-slate-400">{item.sub}</div>
                                                </div>
                                            </button>
                                        )
                                    )}
                                    <div className="px-3.5 pb-3">
                                        <div className="text-[10px] text-slate-400 bg-slate-50 rounded-md px-2.5 py-1.5 leading-relaxed">
                                            Exports all 4 MA charts and summary bar
                                        </div>
                                    </div>
                                </div>
                            )}

                            {exportStatus && (
                                <div className="absolute top-[calc(100%+6px)] right-0 flex items-center gap-2 px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg z-[1000] text-xs text-slate-800 whitespace-nowrap"
                                    style={{ boxShadow: '0 4px 12px rgba(15,23,42,0.08)' }}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0F7A5A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                    {exportStatus}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* rainbow rule */}
                <div className="h-[2px]" style={{
                    background: 'linear-gradient(90deg, #0F7A5A 0%, #1560A8 33%, #A0600A 66%, #B02040 100%)',
                    opacity: 0.3,
                }} />
            </header>

            {/* ── Main ───────────────────────────────────────────────────── */}
            <main ref={pageRef} className="flex-1 min-h-0 flex flex-col w-full px-4 pt-2 pb-2">

                {/* summary bar */}
                <div className="bg-white border border-slate-200 rounded-[9px] px-4 py-2 flex justify-between items-center mb-2 flex-shrink-0"
                    style={{ boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }}>
                    <div className="flex items-center gap-4 flex-wrap">
                        {CHART_CONFIGS.map((cfg, i) => {
                            const val = latest ? (latest[cfg.key] as number) : 50;
                            const rounded = Math.round(val);
                            const s = val >= 70
                                ? { label: 'Bullish', color: '#0F7A5A', bg: '#E6F5F0' }
                                : val <= 30
                                    ? { label: 'Bearish', color: '#B02040', bg: '#FAE8EC' }
                                    : { label: 'Neutral', color: '#A0600A', bg: '#FBF3E6' };
                            return (
                                <div key={cfg.key} className={`flex items-center gap-2 ${i > 0 ? 'pl-4 border-l border-slate-200' : ''}`}>
                                    <span className="text-[11px] font-semibold text-slate-500">{cfg.label} MA</span>
                                    <span className="text-[11px] font-bold" style={{ color: cfg.lineColor }}>{rounded}%</span>
                                    <span className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ color: s.color, background: s.bg }}>
                                        <span className="w-1 h-1 rounded-full inline-block" style={{ background: s.color }} />
                                        {s.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    <span className="text-[10px] text-slate-300 flex-shrink-0">{latest?.time || '—'}</span>
                </div>

                {/* CHART GRID */}
                <div className="flex-1 min-h-0 grid grid-cols-2 grid-rows-2 gap-2">
                    {CHART_CONFIGS.map((cfg, i) => {
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
                                key={cfg.key}
                                ref={(el) => { cardRefs.current[i] = el; }}
                                className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col relative min-h-0 transition-all duration-200"
                                style={{ borderLeft: `3px solid ${cfg.lineColor}`, boxShadow: '0 1px 3px rgba(15,23,42,0.05)' }}
                            >
                                {/* card header */}
                                <div className="px-4 pt-2.5 pb-1.5 flex justify-between items-start flex-shrink-0">
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

                                {/* progress bar */}
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

                                {/* button row */}
                                <div className="px-3 py-1 flex items-center gap-1 border-y border-slate-100 flex-shrink-0">
                                    <button onClick={() => toggleAvgKey(i, avg50Key)}
                                        className="px-2 py-0.5 rounded text-[9px] font-semibold tracking-wide transition-all cursor-pointer border"
                                        style={{
                                            borderColor: isAvg50Active ? AVG50_COLOR : '#E2E8F0',
                                            background: isAvg50Active ? AVG50_COLOR : 'transparent',
                                            color: isAvg50Active ? '#FFFFFF' : '#64748B',
                                        }}>
                                        {cfg.avgLabels[0]}
                                    </button>

                                    <button onClick={() => toggleAvgKey(i, avg200Key)}
                                        className="px-2 py-0.5 rounded text-[9px] font-semibold tracking-wide transition-all cursor-pointer border"
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
                                        className="px-2 py-0.5 rounded text-[9px] font-semibold tracking-wide transition-all cursor-pointer border flex items-center gap-1"
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
                                        className="w-[24px] h-[24px] flex items-center justify-center rounded border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer bg-transparent">
                                        <Scan size={10} />
                                    </button>

                                    <button onClick={() => handleFullscreen(i)}
                                        title={isFS ? 'Exit fullscreen' : 'Fullscreen'}
                                        className="w-[24px] h-[24px] flex items-center justify-center rounded border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer bg-transparent">
                                        {isFS ? <Minimize2 size={10} /> : <Maximize2 size={10} />}
                                    </button>
                                </div>

                                {/* chart canvas */}
                                <div className="flex-1 min-h-0 p-1">
                                    <div ref={(el) => { canvasRefs.current[i] = el; }} className="w-full h-full" />
                                </div>

                                {/* footer */}
                                <div className="px-4 py-1 border-t border-slate-50 flex justify-between items-center flex-shrink-0">
                                    <span className="text-[9px] text-slate-300 leading-relaxed line-clamp-1">{cfg.desc}</span>
                                    <span className="text-[9px] text-slate-300 ml-3 flex-shrink-0 font-medium">{data.length.toLocaleString()} obs</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* footer strip */}
                <div className="mt-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg flex justify-between items-center text-[9px] text-slate-300 tracking-wide flex-shrink-0">
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
        <ShariahFilterPage variant="light" className="w-screen h-screen flex flex-col overflow-hidden">
            <MarketBreadthContent />
        </ShariahFilterPage>
    );
}