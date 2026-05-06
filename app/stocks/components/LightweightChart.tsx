'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
    createChart,
    ColorType,
    CandlestickSeries,
    LineSeries,
    HistogramSeries,
    IChartApi,
    CrosshairMode,
} from 'lightweight-charts';
import { API_BASE_URL } from '@/lib/api/config';

// ─── Data type ─────────────────────────────────────────────────────────────────
interface CandleData {
    time: string;
    open: number | null;
    high: number | null;
    low: number | null;
    close: number | null;
    volume: number;
    sma_10?: number | null;
    sma_21?: number | null;
    sma_50?: number | null;
    sma_150?: number | null;
    sma_200?: number | null;
    ema_10?: number | null;
    ema_21?: number | null;
    rsi_14?: number | null;
    sma9_rsi?: number | null;
    wma45_rsi?: number | null;
    rsi_w?: number | null;
    sma9_rsi_w?: number | null;
    wma45_rsi_w?: number | null;
    cci?: number | null;
    cci_ema20?: number | null;
    cci_w?: number | null;
    cci_ema20_w?: number | null;
    cfg?: number | null;
    cfg_sma4?: number | null;
    cfg_ema45?: number | null;
    cfg_w?: number | null;
    cfg_sma4_w?: number | null;
    cfg_ema45_w?: number | null;
    the_number?: number | null;
    the_number_hl?: number | null;
    the_number_ll?: number | null;
    the_number_w?: number | null;
    the_number_hl_w?: number | null;
    the_number_ll_w?: number | null;
    stamp_s9rsi?: number | null;
    stamp_e45cfg?: number | null;
    stamp_e45rsi?: number | null;
    stamp_e20sma3?: number | null;
    stamp_s9rsi_w?: number | null;
    stamp_e45cfg_w?: number | null;
    stamp_e45rsi_w?: number | null;
    stamp_e20sma3_w?: number | null;
    aroon_up?: number | null;
    aroon_down?: number | null;
    aroon_up_w?: number | null;
    aroon_down_w?: number | null;
    sma_3?: number | null;
    sma_30w?: number | null;
    sma_40w?: number | null;
    ema_20_sma3?: number | null;
    sma4?: number | null;
    sma9?: number | null;
    sma18?: number | null;
    sma4_w?: number | null;
    sma9_w?: number | null;
    sma18_w?: number | null;
    wma45_close?: number | null;
    vol_diff_50_percent?: number | null;
    percent_off_52w_high?: number | null;
    percent_off_52w_low?: number | null;
    fifty_two_week_high?: number | null;
    fifty_two_week_low?: number | null;
    average_volume_50?: number | null;
}

type OscTab =
    | 'rsi' | 'rsi_w'
    | 'cci' | 'cci_w'
    | 'cfg' | 'cfg_w'
    | 'the_number' | 'the_number_w'
    | 'stamp' | 'stamp_w'
    | 'aroon' | 'aroon_w'
    | 'volume' | 'price_stats';

const OSC_TABS: { id: OscTab; label: string }[] = [
    { id: 'rsi', label: 'RSI' },
    { id: 'rsi_w', label: 'RSI·W' },
    { id: 'cci', label: 'CCI' },
    { id: 'cci_w', label: 'CCI·W' },
    { id: 'cfg', label: 'CFG' },
    { id: 'cfg_w', label: 'CFG·W' },
    { id: 'the_number', label: 'NUM' },
    { id: 'the_number_w', label: 'NUM·W' },
    { id: 'stamp', label: 'STAMP' },
    { id: 'stamp_w', label: 'STAMP·W' },
    { id: 'aroon', label: 'AROON' },
    { id: 'aroon_w', label: 'AROON·W' },
    { id: 'volume', label: 'VOL STATS' },
    { id: 'price_stats', label: 'PRICE STATS' },
];

interface Props {
    symbol: string;
    height?: number;
    showVolume?: boolean;
    overlays?: (
        | 'sma10' | 'sma21' | 'sma50' | 'sma150' | 'sma200'
        | 'ema10' | 'ema21'
        | 'sma4' | 'sma9' | 'sma18' | 'wma45_close'
        | 'ema21_sma50' | 'ema21_sma200'
    )[];
}

const MA_CONFIG: Record<string, { key: keyof CandleData; label: string; color: string }> = {
    sma4: { key: 'sma4', label: 'SMA4', color: '#22c55e' },
    sma9: { key: 'sma9', label: 'SMA9', color: '#84cc16' },
    sma10: { key: 'sma_10', label: 'SMA10', color: '#3b82f6' },
    sma18: { key: 'sma18', label: 'SMA18', color: '#eab308' },
    sma21: { key: 'sma_21', label: 'SMA21', color: '#f59e0b' },
    sma50: { key: 'sma_50', label: 'SMA50', color: '#10b981' },
    sma150: { key: 'sma_150', label: 'SMA150', color: '#8b5cf6' },
    sma200: { key: 'sma_200', label: 'SMA200', color: '#ef4444' },
    ema10: { key: 'ema_10', label: 'EMA10', color: '#06b6d4' },
    ema21: { key: 'ema_21', label: 'EMA21', color: '#f97316' },
    wma45_close: { key: 'wma45_close', label: 'WMA45', color: '#ec4899' },
    sma4_w: { key: 'sma4_w', label: 'SMA4W', color: '#16a34a' },
    sma9_w: { key: 'sma9_w', label: 'SMA9W', color: '#65a30d' },
    sma18_w: { key: 'sma18_w', label: 'SMA18W', color: '#ca8a04' },
    sma3: { key: 'sma_3', label: 'SMA3', color: '#06b6d4' },
    sma30w: { key: 'sma_30w', label: 'SMA30W', color: '#14b8a6' },
    sma40w: { key: 'sma_40w', label: 'SMA40W', color: '#0891b2' },
    ema20_sma3: { key: 'ema_20_sma3', label: 'E20·S3', color: '#a78bfa' },
};

const DEFAULT_OVERLAYS: Props['overlays'] = ['sma50', 'sma150', 'sma200', 'ema10', 'ema21'];
const OSC_H = 150;
const TAB_H = 30;

// ─── Tiny icon helpers ─────────────────────────────────────────────────────────
const IconZoomIn = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
    </svg>
);
const IconZoomOut = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
    </svg>
);
const IconFit = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 1v4m0 0h-4m4 0l-5-5" />
    </svg>
);
const IconMoon = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);
const IconSun = () => (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);
const IconChevronLeft = () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
);
const IconChevronRight = () => (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
);
const IconBarChart = () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
export default function LightweightChart({
    symbol,
    height,
    showVolume = true,
    overlays = DEFAULT_OVERLAYS,
}: Props) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const mainContRef = useRef<HTMLDivElement>(null);
    const oscContRef = useRef<HTMLDivElement>(null);
    const mainChartRef = useRef<IChartApi | null>(null);
    const oscChartRef = useRef<IChartApi | null>(null);
    const roRef = useRef<ResizeObserver | null>(null);

    const [data, setData] = useState<CandleData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [maPage, setMaPage] = useState(0);
    const [activeOverlays, setActiveOverlays] = useState<Props['overlays']>(overlays);
    const [crosshairData, setCrosshairData] = useState<CandleData | null>(null);
    const [activeOsc, setActiveOsc] = useState<OscTab>('rsi');
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    const MA_PER_PAGE = 8;
    const maEntries = Object.entries(MA_CONFIG);
    const totalMaPages = Math.ceil(maEntries.length / MA_PER_PAGE);
    const currentMaEntries = maEntries.slice(maPage * MA_PER_PAGE, (maPage + 1) * MA_PER_PAGE);

    // ── Theme-aware CSS classes ───────────────────────────────────────────────
    const isDark = theme === 'dark';
    const bg = isDark ? 'bg-[#131722]' : 'bg-white';
    const bgPanel = isDark ? 'bg-[#1e222d]' : 'bg-[#fafafa]';
    const borderC = isDark ? 'border-[#2a2e39]' : 'border-slate-100';
    const textMuted = isDark ? 'text-slate-400' : 'text-slate-500';
    const textFaint = isDark ? 'text-slate-500' : 'text-slate-400';
    const btnHover = isDark
        ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/60'
        : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100';

    // ── Fetch data ────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!symbol) return;
        const ctrl = new AbortController();
        setLoading(true);
        setError(null);
        setData([]);

        const API_URL = API_BASE_URL;
        fetch(`${API_URL}/api/prices/history/${symbol}?limit=10000`, { signal: ctrl.signal, credentials: 'include' })
            .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
            .then(json => setData(json.data || []))
            .catch(err => { if (err.name !== 'AbortError') setError(err.message); })
            .finally(() => setLoading(false));

        return () => ctrl.abort();
    }, [symbol]);

    // ── Persist user preferences ──────────────────────────────────────────────
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(`chart_overlays_${symbol}`, JSON.stringify(activeOverlays || []));
            localStorage.setItem(`chart_osc_${symbol}`, activeOsc);
            localStorage.setItem(`chart_theme_${symbol}`, theme);
        }
    }, [activeOverlays, activeOsc, theme, symbol]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedOverlays = localStorage.getItem(`chart_overlays_${symbol}`);
            const savedOsc = localStorage.getItem(`chart_osc_${symbol}`);
            if (savedOverlays) {
                try { setActiveOverlays(JSON.parse(savedOverlays)); } catch { /* ignore */ }
            }
            if (savedOsc && OSC_TABS.some(t => t.id === savedOsc)) {
                setActiveOsc(savedOsc as OscTab);
            }
        }
    }, [symbol]);

    // ── Main chart ─────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!mainContRef.current || !wrapperRef.current || data.length === 0) return;

        mainChartRef.current?.remove();
        mainChartRef.current = null;

        const wrapper = wrapperRef.current;
        const mainCont = mainContRef.current;
        const wrapW = wrapper.clientWidth || 800;
        const wrapH = wrapper.clientHeight || 500;
        const mainH = Math.max((height ?? wrapH) - OSC_H - TAB_H, 200);

        mainCont.style.height = `${mainH}px`;

        const bgColor = isDark ? '#131722' : '#ffffff';
        const textColor = isDark ? '#d1d5db' : '#374151';
        const gridColor = isDark ? '#1e222d' : '#f1f5f9';
        const borderColor = isDark ? '#2a2e39' : '#e2e8f0';

        const chart = createChart(mainCont, {

            localization: {
                priceFormatter: (price: number) => price.toFixed(2),
            },
            layout: {
                background: { type: ColorType.Solid, color: bgColor },
                textColor,
                fontFamily: "'DM Mono', 'Fira Code', 'Cascadia Code', 'SF Mono', monospace",
                fontSize: 11,
            },
            grid: {
                vertLines: { color: gridColor, style: 1 },
                horzLines: { color: gridColor, style: 1 },
            },
            crosshair: {
                mode: CrosshairMode.Normal,
                vertLine: {
                    color: isDark ? '#485563' : '#94a3b8',
                    labelBackgroundColor: isDark ? '#2a2e39' : '#334155',
                    style: 2,
                },
                horzLine: {
                    color: isDark ? '#485563' : '#94a3b8',
                    labelBackgroundColor: isDark ? '#2a2e39' : '#334155',
                    style: 2,
                },
            },
            kineticScroll: {
                touch: true,
                mouse: true,
            },
            rightPriceScale: {
                borderColor,
                scaleMargins: { top: 0.08, bottom: 0.22 },
            },
            timeScale: {
                borderColor,
                timeVisible: true,
                secondsVisible: false,
                visible: true,
                rightOffset: 8,
                barSpacing: 8,
            },
            handleScroll: { mouseWheel: true, pressedMouseMove: true },
            handleScale: { mouseWheel: true, pinch: true, axisPressedMouseMove: true },
            width: wrapW,
            height: mainH,
        });
        mainChartRef.current = chart;

        // ── Candlesticks
        const cs = chart.addSeries(CandlestickSeries, {
            upColor: '#16a34a',
            downColor: '#dc2626',
            borderUpColor: '#16a34a',
            borderDownColor: '#dc2626',
            wickUpColor: '#16a34a',
            wickDownColor: '#dc2626',
        });
        const sortedData = [...data]
            .filter(d => d.open !== null && d.high !== null && d.low !== null && d.close !== null)
            .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

        cs.setData(sortedData.map(d => ({
            time: d.time as any,
            open: d.open!,
            high: d.high!,
            low: d.low!,
            close: d.close!,
        })));

        // ── Volume
        if (showVolume) {
            const vs = chart.addSeries(HistogramSeries, {
                color: '#94a3b8',
                priceFormat: { type: 'volume' },
                priceScaleId: 'vol',
            });
            chart.priceScale('vol').applyOptions({
                scaleMargins: { top: 0.83, bottom: 0 },
            });
            vs.setData(
                [...data]
                    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
                    .map(d => ({
                        time: d.time as any,
                        value: d.volume || 0,
                        color: (d.close ?? 0) >= (d.open ?? 0) ? '#16a34a40' : '#dc262640',
                    }))
            );
        }

        // ── MA overlays
        (activeOverlays || []).forEach(key => {
            const cfg = MA_CONFIG[key];
            if (!cfg) return;
            const ls = chart.addSeries(LineSeries, {
                color: cfg.color,
                lineWidth: 1,
                priceLineVisible: false,
                lastValueVisible: true,
                crosshairMarkerVisible: false,
            });
            ls.setData(
                data
                    .filter(d => d[cfg.key] != null)
                    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
                    .map(d => ({ time: d.time as any, value: d[cfg.key] as number }))
            );
        });

        // ── Crosshair move
        chart.subscribeCrosshairMove(param => {
            setCrosshairData(param.time ? (data.find(d => d.time === param.time) ?? null) : null);
        });

        chart.timeScale().fitContent();

        return () => {
            mainChartRef.current?.remove();
            mainChartRef.current = null;
        };
    }, [data, activeOverlays, showVolume, height, theme]);

    // ── Oscillator chart ──────────────────────────────────────────────────────
    useEffect(() => {
        if (!oscContRef.current || !wrapperRef.current || data.length === 0) return;

        oscChartRef.current?.remove();
        oscChartRef.current = null;

        const wrapper = wrapperRef.current;
        const oscCont = oscContRef.current;
        const wrapW = wrapper.clientWidth || 800;

        oscCont.style.height = `${OSC_H}px`;

        const bgColor = isDark ? '#131722' : '#ffffff';
        const textColor = isDark ? '#d1d5db' : '#374151';
        const gridColor = isDark ? '#1e222d' : '#f1f5f9';
        const borderColor = isDark ? '#2a2e39' : '#e2e8f0';

        const osc = createChart(oscCont, {
            layout: {
                background: { type: ColorType.Solid, color: bgColor },
                textColor,
                fontFamily: "'DM Mono', 'Fira Code', monospace",
                fontSize: 10,
            },
            grid: {
                vertLines: { color: gridColor, style: 1 },
                horzLines: { color: gridColor, style: 1 },
            },
            crosshair: {
                mode: CrosshairMode.Normal,
                vertLine: { color: isDark ? '#485563' : '#94a3b8', labelBackgroundColor: isDark ? '#2a2e39' : '#334155', style: 2 },
                horzLine: { color: isDark ? '#485563' : '#94a3b8', labelBackgroundColor: isDark ? '#2a2e39' : '#334155', style: 2 },
            },
            kineticScroll: {
                touch: true,
                mouse: true,
            },
            rightPriceScale: {
                borderColor,
                scaleMargins: { top: 0.05, bottom: 0.1 },
            },
            timeScale: {
                borderColor,
                timeVisible: true,
                secondsVisible: false,
                visible: true,
                rightOffset: 8,
            },
            handleScroll: { mouseWheel: true, pressedMouseMove: true },
            handleScale: { mouseWheel: true, pinch: true, axisPressedMouseMove: true },
            width: wrapW,
            height: OSC_H,
        });
        oscChartRef.current = osc;

        const line = (key: keyof CandleData, color: string, lw: 1 | 2, title: string) => {
            const s = osc.addSeries(LineSeries, {
                color,
                lineWidth: lw,
                priceLineVisible: false,
                lastValueVisible: true,
                crosshairMarkerVisible: true,
                crosshairMarkerRadius: 4,
                title,
            });
            s.setData(
                data
                    .filter(d => d[key] != null)
                    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
                    .map(d => ({ time: d.time as any, value: d[key] as number }))
            );
            return s;
        };

        const hline = (s: ReturnType<typeof line>, price: number, color: string) =>
            s.createPriceLine({ price, color, lineWidth: 1, lineStyle: 2, axisLabelVisible: false });

        if (activeOsc === 'rsi') {
            const s = line('rsi_14', '#6366f1', 2, 'RSI(14)');
            line('sma9_rsi', '#f59e0b', 1, 'SMA9');
            line('wma45_rsi', '#ef4444', 1, 'WMA45');
            hline(s, 70, '#ef444450'); hline(s, 50, '#94a3b840'); hline(s, 30, '#10b98150');
        } else if (activeOsc === 'rsi_w') {
            const s = line('rsi_w', '#6366f1', 2, 'RSI(W)');
            line('sma9_rsi_w', '#f59e0b', 1, 'SMA9·W');
            line('wma45_rsi_w', '#ef4444', 1, 'WMA45·W');
            hline(s, 70, '#ef444450'); hline(s, 50, '#94a3b840'); hline(s, 30, '#10b98150');
        } else if (activeOsc === 'cci') {
            const s = line('cci', '#0ea5e9', 2, 'CCI(14)');
            line('cci_ema20', '#f97316', 1, 'EMA20');
            hline(s, 100, '#ef444450'); hline(s, 0, '#94a3b840'); hline(s, -100, '#10b98150');
        } else if (activeOsc === 'cci_w') {
            const s = line('cci_w', '#0ea5e9', 2, 'CCI·W');
            line('cci_ema20_w', '#f97316', 1, 'EMA20·W');
            hline(s, 100, '#ef444450'); hline(s, 0, '#94a3b840'); hline(s, -100, '#10b98150');
        } else if (activeOsc === 'cfg') {
            const s = line('cfg', '#8b5cf6', 2, 'CFG');
            line('cfg_sma4', '#06b6d4', 1, 'SMA4');
            line('cfg_ema45', '#f59e0b', 1, 'EMA45');
            hline(s, 50, '#94a3b840');
        } else if (activeOsc === 'cfg_w') {
            const s = line('cfg_w', '#8b5cf6', 2, 'CFG·W');
            line('cfg_sma4_w', '#06b6d4', 1, 'SMA4·W');
            line('cfg_ema45_w', '#f59e0b', 1, 'EMA45·W');
            hline(s, 50, '#94a3b840');
        } else if (activeOsc === 'the_number') {
            line('the_number', '#10b981', 2, 'NUM');
            line('the_number_hl', '#3b82f6', 1, 'HIGH');
            line('the_number_ll', '#ef4444', 1, 'LOW');
        } else if (activeOsc === 'the_number_w') {
            line('the_number_w', '#10b981', 2, 'NUM·W');
            line('the_number_hl_w', '#3b82f6', 1, 'HIGH·W');
            line('the_number_ll_w', '#ef4444', 1, 'LOW·W');
        } else if (activeOsc === 'stamp') {
            line('stamp_s9rsi', '#ef4444', 2, 'S9·RSI');
            line('stamp_e45cfg', '#10b981', 1, 'E45·CFG');
            line('stamp_e45rsi', '#f59e0b', 1, 'E45·RSI');
            line('stamp_e20sma3', '#6366f1', 1, 'E20·S3');
        } else if (activeOsc === 'stamp_w') {
            line('stamp_s9rsi_w', '#ef4444', 2, 'S9·RSI·W');
            line('stamp_e45cfg_w', '#10b981', 1, 'E45·CFG·W');
            line('stamp_e45rsi_w', '#f59e0b', 1, 'E45·RSI·W');
            line('stamp_e20sma3_w', '#6366f1', 1, 'E20·S3·W');
        } else if (activeOsc === 'aroon') {
            line('aroon_up', '#16a34a', 2, 'AROON ↑');
            line('aroon_down', '#dc2626', 2, 'AROON ↓');
        } else if (activeOsc === 'aroon_w') {
            line('aroon_up_w', '#16a34a', 2, 'AROON ↑W');
            line('aroon_down_w', '#dc2626', 2, 'AROON ↓W');
        } else if (activeOsc === 'volume') {
            const volLine = line('vol_diff_50_percent', '#6366f1', 2, 'Vol % vs 50MA');
            hline(volLine, 0, '#94a3b840');
            hline(volLine, 50, '#f59e0b60');
            hline(volLine, -50, '#10b98160');
        } else if (activeOsc === 'price_stats') {
            const highLine = line('percent_off_52w_high', '#ef4444', 2, '% Off 52W High');
            const lowLine = line('percent_off_52w_low', '#10b981', 1, '% Off 52W Low');
            hline(highLine, -20, '#f59e0b60');
            hline(lowLine, 20, '#f59e0b60');
        }

        // ── Sync timescales
        const syncMain = (range: any) => {
            if (range && mainChartRef.current)
                mainChartRef.current.timeScale().setVisibleLogicalRange(range);
        };
        const syncOsc = (range: any) => {
            if (range && oscChartRef.current)
                oscChartRef.current.timeScale().setVisibleLogicalRange(range);
        };
        if (mainChartRef.current)
            mainChartRef.current.timeScale().subscribeVisibleLogicalRangeChange(syncOsc);
        osc.timeScale().subscribeVisibleLogicalRangeChange(syncMain);
        osc.timeScale().fitContent();

        return () => {
            oscChartRef.current?.remove();
            oscChartRef.current = null;
        };
    }, [data, activeOsc, theme]);

    // ── Resize observer ───────────────────────────────────────────────────────
    useEffect(() => {
        const wrapper = wrapperRef.current;
        const mainCont = mainContRef.current;
        if (!wrapper || !mainCont) return;

        roRef.current?.disconnect();
        roRef.current = new ResizeObserver(() => {
            const newW = wrapper.clientWidth || 800;
            const newWH = wrapper.clientHeight || 500;
            const newMain = Math.max((height ?? newWH) - OSC_H - TAB_H, 200);
            mainCont.style.height = `${newMain}px`;
            mainChartRef.current?.applyOptions({ width: newW, height: newMain });
            oscChartRef.current?.applyOptions({ width: newW, height: OSC_H });
        });
        roRef.current.observe(wrapper);

        return () => {
            roRef.current?.disconnect();
            roRef.current = null;
        };
    }, [height]);

    // ── Toggle MA overlay ─────────────────────────────────────────────────────
    const toggleOverlay = useCallback((key: keyof typeof MA_CONFIG) => {
        setActiveOverlays(prev =>
            (prev || []).includes(key as any)
                ? (prev || []).filter((k: string) => k !== key)
                : [...(prev || []), key as any]
        );
    }, []);

    // ── Derived display values ────────────────────────────────────────────────
    const lastCandle = data[data.length - 1];
    const displayCandle = crosshairData || lastCandle;
    const isUp = displayCandle && (displayCandle.close ?? 0) >= (displayCandle.open ?? 0);

    const oscHint: { label: string; val: number | null | undefined; color: string }[] =
        displayCandle ? (
            activeOsc === 'rsi' ? [{ label: 'RSI', val: displayCandle.rsi_14, color: '#6366f1' }, { label: 'SMA9', val: displayCandle.sma9_rsi, color: '#f59e0b' }, { label: 'WMA45', val: displayCandle.wma45_rsi, color: '#ef4444' }] :
                activeOsc === 'rsi_w' ? [{ label: 'RSI·W', val: displayCandle.rsi_w, color: '#6366f1' }, { label: 'SMA9·W', val: displayCandle.sma9_rsi_w, color: '#f59e0b' }] :
                    activeOsc === 'cci' ? [{ label: 'CCI', val: displayCandle.cci, color: '#0ea5e9' }, { label: 'EMA20', val: displayCandle.cci_ema20, color: '#f97316' }] :
                        activeOsc === 'cci_w' ? [{ label: 'CCI·W', val: displayCandle.cci_w, color: '#0ea5e9' }, { label: 'EMA20·W', val: displayCandle.cci_ema20_w, color: '#f97316' }] :
                            activeOsc === 'cfg' ? [{ label: 'CFG', val: displayCandle.cfg, color: '#8b5cf6' }, { label: 'SMA4', val: displayCandle.cfg_sma4, color: '#06b6d4' }, { label: 'EMA45', val: displayCandle.cfg_ema45, color: '#f59e0b' }] :
                                activeOsc === 'cfg_w' ? [{ label: 'CFG·W', val: displayCandle.cfg_w, color: '#8b5cf6' }, { label: 'SMA4·W', val: displayCandle.cfg_sma4_w, color: '#06b6d4' }] :
                                    activeOsc === 'the_number' ? [{ label: 'NUM', val: displayCandle.the_number, color: '#10b981' }, { label: 'HI', val: displayCandle.the_number_hl, color: '#3b82f6' }, { label: 'LO', val: displayCandle.the_number_ll, color: '#ef4444' }] :
                                        activeOsc === 'the_number_w' ? [{ label: 'NUM·W', val: displayCandle.the_number_w, color: '#10b981' }] :
                                            activeOsc === 'stamp' ? [{ label: 'S9·RSI', val: displayCandle.stamp_s9rsi, color: '#ef4444' }, { label: 'E45·CFG', val: displayCandle.stamp_e45cfg, color: '#10b981' }] :
                                                activeOsc === 'stamp_w' ? [{ label: 'S9·RSI·W', val: displayCandle.stamp_s9rsi_w, color: '#ef4444' }] :
                                                    activeOsc === 'aroon' ? [{ label: '↑', val: displayCandle.aroon_up, color: '#16a34a' }, { label: '↓', val: displayCandle.aroon_down, color: '#dc2626' }] :
                                                        activeOsc === 'aroon_w' ? [{ label: '↑W', val: displayCandle.aroon_up_w, color: '#16a34a' }, { label: '↓W', val: displayCandle.aroon_down_w, color: '#dc2626' }] :
                                                            []
        ) : [];

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className={`flex flex-col w-full h-full ${bg} overflow-hidden`}>

            {/* ══ OHLCV Info Bar ══════════════════════════════════════════════ */}
            <div className={`flex flex-wrap items-center gap-x-4 gap-y-0 px-4 py-1.5 border-b text-[11px] shrink-0 ${bgPanel} ${borderC}`}>
                {displayCandle ? (
                    <>
                        <span className={`font-mono tabular-nums ${textFaint}`}>
                            {displayCandle.time}
                        </span>

                        {/* OHLC values */}
                        <div className="flex items-center gap-2.5">
                            {[
                                { lbl: 'O', val: displayCandle.open, cls: isUp ? 'text-emerald-600' : 'text-rose-500' },
                                { lbl: 'H', val: displayCandle.high, cls: 'text-emerald-600' },
                                { lbl: 'L', val: displayCandle.low, cls: 'text-rose-500' },
                                { lbl: 'C', val: displayCandle.close, cls: isUp ? 'text-emerald-600' : 'text-rose-500' },
                            ].map(item => (
                                <span key={item.lbl} className="flex items-baseline gap-0.5 font-mono tabular-nums">
                                    <span className={textFaint}>{item.lbl}</span>
                                    <span className={`font-semibold ${item.cls}`}>{item.val?.toFixed(2) ?? '—'}</span>
                                </span>
                            ))}
                        </div>

                        {/* Volume */}
                        <span className={`font-mono tabular-nums flex items-baseline gap-0.5`}>
                            <span className={textFaint}>Vol</span>
                            <span className={`font-semibold ${textMuted}`}>{displayCandle.volume?.toLocaleString() ?? '—'}</span>
                        </span>

                        {/* 52W */}
                        {displayCandle.fifty_two_week_high && (
                            <span className={`font-mono tabular-nums flex items-baseline gap-0.5`}>
                                <span className={textFaint}>52H</span>
                                <span className="font-semibold text-emerald-600">{displayCandle.fifty_two_week_high.toFixed(2)}</span>
                            </span>
                        )}
                        {displayCandle.fifty_two_week_low && (
                            <span className={`font-mono tabular-nums flex items-baseline gap-0.5`}>
                                <span className={textFaint}>52L</span>
                                <span className="font-semibold text-rose-500">{displayCandle.fifty_two_week_low.toFixed(2)}</span>
                            </span>
                        )}

                        {/* Active MA values */}
                        {(activeOverlays || []).slice(0, 4).map(key => {
                            const cfg = MA_CONFIG[key];
                            if (!cfg) return null;
                            const val = displayCandle[cfg.key];
                            return val != null ? (
                                <span key={key} className="font-mono tabular-nums font-semibold text-[10px]" style={{ color: cfg.color }}>
                                    {cfg.label}&nbsp;{(val as number).toFixed(2)}
                                </span>
                            ) : null;
                        })}
                    </>
                ) : (
                    <span className={`${textFaint} italic`}>Hover over chart to inspect data</span>
                )}
            </div>

            {/* ══ MA Toggles + Chart Controls Bar ══════════════════════════════ */}
            <div className={`flex items-center justify-between px-3 py-1.5 border-b shrink-0 ${borderC} ${bgPanel}`}>

                {/* MA Toggles */}
                <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
                    <span className={`text-[9px] uppercase tracking-widest font-bold shrink-0 ${textFaint}`}>MA</span>
                    <div className="flex items-center gap-1 flex-wrap">
                        {currentMaEntries.map(([key, cfg]) => {
                            const active = (activeOverlays || []).includes(key as any);
                            return (
                                <button
                                    key={key}
                                    onClick={() => toggleOverlay(key as any)}
                                    title={active ? `Hide ${cfg.label}` : `Show ${cfg.label}`}
                                    className={`
                                        flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold
                                        border transition-all duration-150 leading-none
                                        ${active
                                            ? 'text-white shadow-sm'
                                            : isDark
                                                ? 'text-slate-500 border-slate-700 hover:border-slate-500 bg-transparent hover:bg-slate-800'
                                                : 'text-slate-500 border-slate-200 hover:border-slate-300 bg-transparent hover:bg-slate-50'
                                        }
                                    `}
                                    style={{
                                        backgroundColor: active ? cfg.color : undefined,
                                        borderColor: active ? cfg.color : undefined,
                                    }}
                                >
                                    <span
                                        className="w-1.5 h-1.5 rounded-full shrink-0"
                                        style={{
                                            backgroundColor: cfg.color,
                                            opacity: active ? 0 : 1,
                                            width: active ? 0 : 6,
                                            transition: 'opacity 0.15s, width 0.15s',
                                        }}
                                    />
                                    {cfg.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* MA Pagination */}
                    {totalMaPages > 1 && (
                        <div className="flex items-center gap-0.5 shrink-0">
                            <button
                                onClick={() => setMaPage(Math.max(0, maPage - 1))}
                                disabled={maPage === 0}
                                className={`w-5 h-5 flex items-center justify-center rounded transition-colors disabled:opacity-30 ${btnHover}`}
                            >
                                <IconChevronLeft />
                            </button>
                            <span className={`text-[9px] font-mono tabular-nums ${textFaint}`}>
                                {maPage + 1}/{totalMaPages}
                            </span>
                            <button
                                onClick={() => setMaPage(Math.min(totalMaPages - 1, maPage + 1))}
                                disabled={maPage === totalMaPages - 1}
                                className={`w-5 h-5 flex items-center justify-center rounded transition-colors disabled:opacity-30 ${btnHover}`}
                            >
                                <IconChevronRight />
                            </button>
                        </div>
                    )}

                    <button
                        onClick={() => setActiveOverlays([])}
                        className={`px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide rounded transition-colors shrink-0 ${btnHover}`}
                    >
                        Clear
                    </button>
                </div>

                {/* Chart Control Buttons */}
                <div className={`flex items-center gap-0.5 pl-2 ml-2 border-l ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                    {[
                        {
                            title: 'Zoom In',
                            icon: <IconZoomIn />,
                            onClick: () => {
                                const ts = mainChartRef.current?.timeScale();
                                const r = ts?.getVisibleLogicalRange();
                                if (r && ts) {
                                    const d = (r.to - r.from) * 0.15;
                                    ts.setVisibleLogicalRange({ from: r.from + d, to: r.to - d });
                                }
                            },
                        },
                        {
                            title: 'Zoom Out',
                            icon: <IconZoomOut />,
                            onClick: () => {
                                const ts = mainChartRef.current?.timeScale();
                                const r = ts?.getVisibleLogicalRange();
                                if (r && ts) {
                                    const d = (r.to - r.from) * 0.15;
                                    ts.setVisibleLogicalRange({ from: r.from - d, to: r.to + d });
                                }
                            },
                        },
                        {
                            title: 'Fit All',
                            icon: <IconFit />,
                            onClick: () => mainChartRef.current?.timeScale().fitContent(),
                        },
                    ].map(btn => (
                        <button
                            key={btn.title}
                            onClick={btn.onClick}
                            title={btn.title}
                            className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${btnHover}`}
                        >
                            {btn.icon}
                        </button>
                    ))}

                    {/* Theme toggle */}
                    <button
                        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                        title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                        className={`w-7 h-7 flex items-center justify-center rounded transition-colors ml-0.5 ${btnHover}`}
                    >
                        {theme === 'light' ? <IconMoon /> : <IconSun />}
                    </button>
                </div>
            </div>

            {/* ══ Chart Wrapper ════════════════════════════════════════════════ */}
            <div ref={wrapperRef} className="flex-1 relative" style={{ minHeight: 0 }}>

                {/* Loading overlay */}
                {loading && (
                    <div className={`absolute inset-0 flex flex-col items-center justify-center z-10 ${isDark ? 'bg-[#131722]/90' : 'bg-white/90'} backdrop-blur-[1px]`}>
                        <div className="relative w-10 h-10">
                            <div className={`absolute inset-0 rounded-full border-2 ${isDark ? 'border-slate-700' : 'border-slate-100'}`} />
                            <div className="absolute inset-0 rounded-full border-2 border-t-blue-500 animate-spin" />
                        </div>
                        <p className={`mt-3 text-[11px] font-medium ${textMuted}`}>Loading chart data…</p>
                    </div>
                )}

                {/* Error overlay */}
                {error && !loading && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg border ${isDark ? 'bg-rose-950/40 border-rose-800/50' : 'bg-rose-50 border-rose-100'}`}>
                            <svg className="w-4 h-4 text-rose-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span className={`text-sm font-medium ${isDark ? 'text-rose-300' : 'text-rose-700'}`}>{error}</span>
                        </div>
                    </div>
                )}

                {/* Empty state */}
                {!loading && !error && data.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-2">
                        <span className={isDark ? 'text-slate-600' : 'text-slate-300'}><IconBarChart /></span>
                        <p className={`text-[12px] font-medium ${textMuted}`}>
                            No chart data for <span className="font-mono font-bold">{symbol}</span>
                        </p>
                    </div>
                )}

                {/* Candlestick chart container */}
                <div ref={mainContRef} className="w-full" />

                {/* ── Oscillator Tab Bar ──────────────────────────────────── */}
                <div
                    className={`flex items-center border-t overflow-x-auto shrink-0 ${bgPanel} ${borderC}`}
                    style={{ height: TAB_H }}
                >
                    <div className="flex items-center px-2 gap-0.5 py-1">
                        {OSC_TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveOsc(tab.id)}
                                className={`
                                    px-2.5 py-0.5 text-[10px] font-bold rounded-md whitespace-nowrap shrink-0
                                    transition-all duration-150 leading-none
                                    ${activeOsc === tab.id
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : isDark
                                            ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-700/70'
                                            : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                                    }
                                `}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Oscillator live values */}
                    {oscHint.filter(o => o.val != null).length > 0 && (
                        <div className={`flex items-center gap-2.5 px-3 ml-1 border-l shrink-0 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                            {oscHint.filter(o => o.val != null).map(o => (
                                <span
                                    key={o.label}
                                    className="text-[10px] font-mono font-bold tabular-nums shrink-0"
                                    style={{ color: o.color }}
                                >
                                    {o.label}&nbsp;{(o.val as number).toFixed(2)}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Oscillator chart container */}
                <div ref={oscContRef} className="w-full" />
            </div>
        </div>
    );
}