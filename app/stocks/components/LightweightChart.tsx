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
    aroon_up?: number | null;
    aroon_down?: number | null;
}

type OscTab = 'rsi' | 'rsi_w' | 'cci' | 'cci_w' | 'cfg' | 'cfg_w' | 'the_number' | 'the_number_w' | 'stamp' | 'aroon' | 'volume' | 'price_stats';

const OSC_TABS: { id: OscTab; label: string }[] = [
    { id: 'rsi', label: 'RSI' },
    { id: 'rsi_w', label: 'RSI (W)' },
    { id: 'cci', label: 'CCI' },
    { id: 'cci_w', label: 'CCI (W)' },
    { id: 'cfg', label: 'CFG' },
    { id: 'cfg_w', label: 'CFG (W)' },
    { id: 'the_number', label: 'THE.NUM' },
    { id: 'the_number_w', label: 'THE.NUM(W)' },
    { id: 'stamp', label: 'STAMP' },
    { id: 'aroon', label: 'AROON' },
    { id: 'volume', label: 'Volume Stats' },
    { id: 'price_stats', label: 'Price Stats' },
];

interface Props {
    symbol: string;
    height?: number;
    showVolume?: boolean;
    overlays?: ('sma10' | 'sma21' | 'sma50' | 'sma150' | 'sma200' | 'ema10' | 'ema21' | 'sma4' | 'sma9' | 'sma18' | 'wma45_close' | 'ema21_sma50' | 'ema21_sma200')[];
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
    // Weekly averages
    sma4_w: { key: 'sma4_w', label: 'SMA4(W)', color: '#16a34a' },
    sma9_w: { key: 'sma9_w', label: 'SMA9(W)', color: '#65a30d' },
    sma18_w: { key: 'sma18_w', label: 'SMA18(W)', color: '#ca8a04' },
};

const DEFAULT_OVERLAYS: Props['overlays'] = ['sma50', 'sma150', 'sma200', 'ema10', 'ema21'];
const OSC_H = 150;   // oscillator chart fixed height in px
const TAB_H = 28;    // tab bar height in px

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
    const roRef = useRef<ResizeObserver | null>(null);   // single persistent observer

    const [data, setData] = useState<CandleData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [maPage, setMaPage] = useState(0);
    const [activeOverlays, setActiveOverlays] = useState<Props['overlays']>(overlays);
    const [crosshairData, setCrosshairData] = useState<CandleData | null>(null);
    const [activeOsc, setActiveOsc] = useState<OscTab>('rsi');
    const MA_PER_PAGE = 8;
    const maEntries = Object.entries(MA_CONFIG);
    const totalMaPages = Math.ceil(maEntries.length / MA_PER_PAGE);

    const currentMaEntries = maEntries.slice(maPage * MA_PER_PAGE, (maPage + 1) * MA_PER_PAGE);

    // ── Fetch ─────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!symbol) return;
        const ctrl = new AbortController();
        setLoading(true);
        setError(null);
        setData([]);

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        fetch(`${API_URL}/api/prices/history/${symbol}?limit=10000`, { headers, signal: ctrl.signal })
            .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
            .then(json => setData(json.data || []))
            .catch(err => { if (err.name !== 'AbortError') setError(err.message); })
            .finally(() => setLoading(false));

        return () => ctrl.abort();
    }, [symbol]);

    // حفظ تفضيلات المستخدم
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(`chart_overlays_${symbol}`, JSON.stringify(activeOverlays || []));
            localStorage.setItem(`chart_osc_${symbol}`, activeOsc);
        }
    }, [activeOverlays, activeOsc, symbol]);

    // تحميل تفضيلات المستخدم
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedOverlays = localStorage.getItem(`chart_overlays_${symbol}`);
            const savedOsc = localStorage.getItem(`chart_osc_${symbol}`);

            if (savedOverlays) {
                try {
                    const parsed = JSON.parse(savedOverlays);
                    setActiveOverlays(parsed);
                } catch (e) {
                    console.warn('Failed to parse saved overlays:', e);
                }
            }

            if (savedOsc && OSC_TABS.some(tab => tab.id === savedOsc)) {
                setActiveOsc(savedOsc as OscTab);
            }
        }
    }, [symbol]);

    // ── Main chart (candlestick + volume + MAs) ────────────────────────────────
    // Rebuilt only when data / overlays / volume / height changes (NOT activeOsc)
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

        const chart = createChart(mainCont, {
            layout: {
                background: { type: ColorType.Solid, color: '#ffffff' },
                textColor: '#374151',
                fontFamily: "'Inter', 'Segoe UI', sans-serif",
            },
            grid: { vertLines: { color: '#f3f4f6' }, horzLines: { color: '#f3f4f6' } },
            crosshair: { mode: CrosshairMode.Normal },
            rightPriceScale: { borderColor: '#e5e7eb' },
            timeScale: { borderColor: '#e5e7eb', timeVisible: true, secondsVisible: false, visible: false },
            width: wrapW,
            height: mainH,
        });
        mainChartRef.current = chart;

        // Candlesticks
        const cs = chart.addSeries(CandlestickSeries, {
            upColor: '#10b981', downColor: '#ef4444',
            borderUpColor: '#10b981', borderDownColor: '#ef4444',
            wickUpColor: '#10b981', wickDownColor: '#ef4444',
        });
        cs.setData(
            data
                .filter(d => d.open !== null && d.high !== null && d.low !== null && d.close !== null)
                .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()) // ترتيب تصاعدي حسب الوقت
                .map(d => ({ time: d.time as any, open: d.open!, high: d.high!, low: d.low!, close: d.close! }))
        );

        // Volume
        if (showVolume) {
            const vs = chart.addSeries(HistogramSeries, {
                color: '#94a3b8', priceFormat: { type: 'volume' }, priceScaleId: 'vol',
            });
            chart.priceScale('vol').applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });
            vs.setData(data
                .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()) // ترتيب تصاعدي حسب الوقت
                .map(d => ({
                time: d.time as any,
                value: d.volume || 0,
                color: (d.close ?? 0) >= (d.open ?? 0) ? '#86efac80' : '#fca5a580',
            })));
        }

        // MA overlays
        (activeOverlays || []).forEach(key => {
            const cfg = MA_CONFIG[key];
            if (!cfg) return;
            const ls = chart.addSeries(LineSeries, {
                color: cfg.color, lineWidth: 1,
                priceLineVisible: false, lastValueVisible: true, crosshairMarkerVisible: false,
            });
            ls.setData(
                data.filter(d => d[cfg.key] != null)
                    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()) // ترتيب تصاعدي حسب الوقت
                    .map(d => ({ time: d.time as any, value: d[cfg.key] as number }))
            );
        });

        // Crosshair → update OHLCV tooltip
        chart.subscribeCrosshairMove(param => {
            setCrosshairData(param.time ? (data.find(d => d.time === param.time) ?? null) : null);
        });

        chart.timeScale().fitContent();

        return () => {
            mainChartRef.current?.remove();
            mainChartRef.current = null;
        };
    }, [data, activeOverlays, showVolume, height]);

    // ── Oscillator chart (rebuilt when data OR activeOsc changes) ─────────────
    useEffect(() => {
        if (!oscContRef.current || !wrapperRef.current || data.length === 0) return;

        // Destroy old osc chart
        oscChartRef.current?.remove();
        oscChartRef.current = null;

        const wrapper = wrapperRef.current;
        const oscCont = oscContRef.current;
        const wrapW = wrapper.clientWidth || 800;

        oscCont.style.height = `${OSC_H}px`;

        const osc = createChart(oscCont, {
            layout: {
                background: { type: ColorType.Solid, color: '#ffffff' },
                textColor: '#374151',
                fontFamily: "'Inter', 'Segoe UI', sans-serif",
            },
            grid: { vertLines: { color: '#f3f4f6' }, horzLines: { color: '#f3f4f6' } },
            crosshair: { mode: CrosshairMode.Normal },
            rightPriceScale: { borderColor: '#e5e7eb', scaleMargins: { top: 0.05, bottom: 0.1 } },
            timeScale: { borderColor: '#e5e7eb', timeVisible: true, secondsVisible: false, visible: true },
            width: wrapW,
            height: OSC_H,
        });
        oscChartRef.current = osc;

        // Helper: add a line series to the oscillator chart
        const line = (key: keyof CandleData, color: string, lw: 1 | 2, title: string) => {
            const s = osc.addSeries(LineSeries, {
                color, lineWidth: lw,
                priceLineVisible: false,
                lastValueVisible: lw === 2,
                crosshairMarkerVisible: lw === 2,
                title,
            });
            s.setData(
                data.filter(d => d[key] != null)
                    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()) // ترتيب تصاعدي حسب الوقت
                    .map(d => ({ time: d.time as any, value: d[key] as number }))
            );
            return s;
        };

        const hline = (s: ReturnType<typeof line>, price: number, color: string) =>
            s.createPriceLine({ price, color, lineWidth: 1, lineStyle: 2, axisLabelVisible: true, title: String(price) });

        // Build the correct oscillator based on active tab
        if (activeOsc === 'rsi') {
            const s = line('rsi_14', '#6366f1', 2, 'RSI(14)');
            line('sma9_rsi', '#f59e0b', 1, 'SMA9');
            line('wma45_rsi', '#ef4444', 1, 'WMA45');
            hline(s, 70, '#ef444470'); hline(s, 50, '#9ca3af50'); hline(s, 30, '#10b98170');
        } else if (activeOsc === 'rsi_w') {
            const s = line('rsi_w', '#6366f1', 2, 'RSI(W)');
            line('sma9_rsi_w', '#f59e0b', 1, 'S9(W)');
            line('wma45_rsi_w', '#ef4444', 1, 'W45(W)');
            hline(s, 70, '#ef444470'); hline(s, 50, '#9ca3af50'); hline(s, 30, '#10b98170');
        } else if (activeOsc === 'cci') {
            const s = line('cci', '#0ea5e9', 2, 'CCI(14)');
            line('cci_ema20', '#f97316', 1, 'EMA20');
            hline(s, 100, '#ef444470'); hline(s, 0, '#9ca3af50'); hline(s, -100, '#10b98170');
        } else if (activeOsc === 'cci_w') {
            const s = line('cci_w', '#0ea5e9', 2, 'CCI(W)');
            line('cci_ema20_w', '#f97316', 1, 'EMA20(W)');
            hline(s, 100, '#ef444470'); hline(s, 0, '#9ca3af50'); hline(s, -100, '#10b98170');
        } else if (activeOsc === 'cfg') {
            const s = line('cfg', '#8b5cf6', 2, 'CFG');
            line('cfg_sma4', '#06b6d4', 1, 'SMA4');
            line('cfg_ema45', '#f59e0b', 1, 'EMA45');
            hline(s, 50, '#9ca3af50');
        } else if (activeOsc === 'cfg_w') {
            const s = line('cfg_w', '#8b5cf6', 2, 'CFG(W)');
            line('cfg_sma4_w', '#06b6d4', 1, 'SMA4(W)');
            line('cfg_ema45_w', '#f59e0b', 1, 'EMA45(W)');
            hline(s, 50, '#9ca3af50');
        } else if (activeOsc === 'the_number') {
            line('the_number', '#10b981', 2, 'THE.NUM');
            line('the_number_hl', '#3b82f6', 1, 'HIGH');
            line('the_number_ll', '#ef4444', 1, 'LOW');
        } else if (activeOsc === 'the_number_w') {
            line('the_number_w', '#10b981', 2, 'THE.NUM(W)');
            line('the_number_hl_w', '#3b82f6', 1, 'HIGH(W)');
            line('the_number_ll_w', '#ef4444', 1, 'LOW(W)');
        } else if (activeOsc === 'stamp') {
            line('stamp_s9rsi', '#ef4444', 2, 'S9RSI');
            line('stamp_e45cfg', '#10b981', 1, 'E45CFG');
            line('stamp_e45rsi', '#f59e0b', 1, 'E45RSI');
            line('stamp_e20sma3', '#1f2937', 1, 'E20SMA3');
        } else if (activeOsc === 'aroon') {
            line('aroon_up', '#10b981', 2, 'AROON↑');
            line('aroon_down', '#ef4444', 2, 'AROON↓');
        } else if (activeOsc === 'volume') {
            // Volume statistics - show as percentage change
            const volLine = line('vol_diff_50_percent', '#6366f1', 2, 'Vol % vs 50MA');
            hline(volLine, 0, '#9ca3af50');
            hline(volLine, 50, '#f59e0b70');
            hline(volLine, -50, '#10b98170');
        } else if (activeOsc === 'price_stats') {
            // Price statistics vs 52W
            const highLine = line('percent_off_52w_high', '#ef4444', 2, '% Off 52W High');
            const lowLine = line('percent_off_52w_low', '#10b981', 1, '% Off 52W Low');
            hline(highLine, -20, '#f59e0b70'); // Oversold zone
            hline(lowLine, 20, '#f59e0b70');  // Overbought zone
        }

        // Sync timescales between main and osc
        const syncMain = (range: any) => { if (range && mainChartRef.current) mainChartRef.current.timeScale().setVisibleLogicalRange(range); };
        const syncOsc = (range: any) => { if (range && oscChartRef.current) oscChartRef.current.timeScale().setVisibleLogicalRange(range); };
        if (mainChartRef.current) mainChartRef.current.timeScale().subscribeVisibleLogicalRangeChange(syncOsc);
        osc.timeScale().subscribeVisibleLogicalRangeChange(syncMain);

        osc.timeScale().fitContent();

        return () => {
            oscChartRef.current?.remove();
            oscChartRef.current = null;
        };
    }, [data, activeOsc]);

    // ── Resize observer (persistent, manages both charts) ─────────────────────
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

    // ── Crosshair display values ───────────────────────────────────────────────
    const lastCandle = data[data.length - 1];
    const displayCandle = crosshairData || lastCandle;
    const isUp = displayCandle && (displayCandle.close ?? 0) >= (displayCandle.open ?? 0);
    const changeColor = isUp ? 'text-emerald-600' : 'text-red-500';

    const oscHint: { label: string; val: number | null | undefined; color: string }[] = displayCandle ? (
        activeOsc === 'rsi' ? [{ label: 'RSI', val: displayCandle.rsi_14, color: '#6366f1' }, { label: 'SMA9', val: displayCandle.sma9_rsi, color: '#f59e0b' }, { label: 'WMA45', val: displayCandle.wma45_rsi, color: '#ef4444' }] :
            activeOsc === 'rsi_w' ? [{ label: 'RSI(W)', val: displayCandle.rsi_w, color: '#6366f1' }, { label: 'SMA9(W)', val: displayCandle.sma9_rsi_w, color: '#f59e0b' }] :
                activeOsc === 'cci' ? [{ label: 'CCI', val: displayCandle.cci, color: '#0ea5e9' }, { label: 'EMA20', val: displayCandle.cci_ema20, color: '#f97316' }] :
                    activeOsc === 'cci_w' ? [{ label: 'CCI(W)', val: displayCandle.cci_w, color: '#0ea5e9' }, { label: 'EMA20(W)', val: displayCandle.cci_ema20_w, color: '#f97316' }] :
                        activeOsc === 'cfg' ? [{ label: 'CFG', val: displayCandle.cfg, color: '#8b5cf6' }, { label: 'SMA4', val: displayCandle.cfg_sma4, color: '#06b6d4' }, { label: 'EMA45', val: displayCandle.cfg_ema45, color: '#f59e0b' }] :
                            activeOsc === 'cfg_w' ? [{ label: 'CFG(W)', val: displayCandle.cfg_w, color: '#8b5cf6' }] :
                                activeOsc === 'the_number' ? [{ label: 'THE.NUM', val: displayCandle.the_number, color: '#10b981' }, { label: 'HI', val: displayCandle.the_number_hl, color: '#3b82f6' }, { label: 'LO', val: displayCandle.the_number_ll, color: '#ef4444' }] :
                                    activeOsc === 'the_number_w' ? [{ label: 'THE.N(W)', val: displayCandle.the_number_w, color: '#10b981' }] :
                                        activeOsc === 'stamp' ? [{ label: 'S9RSI', val: displayCandle.stamp_s9rsi, color: '#ef4444' }, { label: 'E45CFG', val: displayCandle.stamp_e45cfg, color: '#10b981' }] :
                                            activeOsc === 'aroon' ? [{ label: 'UP', val: displayCandle.aroon_up, color: '#10b981' }, { label: 'DOWN', val: displayCandle.aroon_down, color: '#ef4444' }] : []
    ) : [];

    return (
        <div className="flex flex-col w-full h-full bg-white rounded-xl overflow-hidden">

            {/* ── OHLCV bar ─────────────────────────────────────────────── */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 px-3 py-1.5 bg-gray-50 border-b border-gray-100 text-[11px] shrink-0">
                {displayCandle ? (
                    <>
                        <span className="text-gray-400 font-mono">{displayCandle.time}</span>
                        <span className="text-gray-500">O: <b className={changeColor}>{displayCandle.open?.toFixed(2) ?? '–'}</b></span>
                        <span className="text-gray-500">H: <b className="text-emerald-600">{displayCandle.high?.toFixed(2) ?? '–'}</b></span>
                        <span className="text-gray-500">L: <b className="text-red-500">{displayCandle.low?.toFixed(2) ?? '–'}</b></span>
                        <span className="text-gray-500">C: <b className={changeColor}>{displayCandle.close?.toFixed(2) ?? '–'}</b></span>
                        <span className="text-gray-400">Vol: <b className="text-gray-600">{displayCandle.volume?.toLocaleString() ?? '–'}</b></span>

                        {/* إضافة معلومات إضافية */}
                        {displayCandle.fifty_two_week_high && (
                            <span className="text-gray-400">52W High: <b className="text-emerald-600">{displayCandle.fifty_two_week_high.toFixed(2)}</b></span>
                        )}
                        {displayCandle.fifty_two_week_low && (
                            <span className="text-gray-400">52W Low: <b className="text-red-500">{displayCandle.fifty_two_week_low.toFixed(2)}</b></span>
                        )}

                        {/* عرض المتوسطات النشطة */}
                        {(activeOverlays || []).slice(0, 3).map(key => { // أظهر أول 3 فقط لتوفير المساحة
                            const cfg = MA_CONFIG[key];
                            const val = displayCandle[cfg.key];
                            return val != null
                                ? <span key={key} className="font-semibold" style={{ color: cfg.color }}>{cfg.label}:{(val as number).toFixed(2)}</span>
                                : null;
                        })}
                    </>
                ) : (
                    <span className="text-gray-400">Hover over chart for data</span>
                )}
            </div>

            {/* ── MA toggles ────────────────────────────────────────────── */}
            <div className="flex items-center justify-between px-3 py-1 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-600">Moving Averages:</span>
                    <div className="flex flex-wrap gap-1">
                        {currentMaEntries.map(([key, cfg]) => {
                            const active = (activeOverlays || []).includes(key as any);
                            return (
                                <button
                                    key={key}
                                    onClick={() => toggleOverlay(key as any)}
                                    className="px-2 py-0.5 rounded text-[10px] font-bold border transition-all hover:opacity-80"
                                    style={{
                                        background: active ? cfg.color : 'transparent',
                                        borderColor: cfg.color,
                                        color: active ? '#fff' : cfg.color,
                                    }}
                                >
                                    {cfg.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* أزرار التنقل بين الصفحات */}
                    {totalMaPages > 1 && (
                        <div className="flex items-center gap-1 ml-2">
                            <button
                                onClick={() => setMaPage(Math.max(0, maPage - 1))}
                                disabled={maPage === 0}
                                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Previous"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <span className="text-[10px] text-gray-500 px-1">
                                {maPage + 1}/{totalMaPages}
                            </span>
                            <button
                                onClick={() => setMaPage(Math.min(totalMaPages - 1, maPage + 1))}
                                disabled={maPage === totalMaPages - 1}
                                className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Next"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    )}

                    <button
                        onClick={() => setActiveOverlays([])}
                        className="px-2 py-0.5 text-[10px] text-gray-500 hover:text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    >
                        Clear All
                    </button>
                </div>

                {/* أزرار التحكم في الرسم البياني */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => mainChartRef.current?.timeScale().zoomIn()}
                        className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                        title="Zoom In"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                    </button>
                    <button
                        onClick={() => mainChartRef.current?.timeScale().zoomOut()}
                        className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                        title="Zoom Out"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                        </svg>
                    </button>
                    <button
                        onClick={() => mainChartRef.current?.timeScale().fitContent()}
                        className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                        title="Fit Content"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 1v4m0 0h-4m4 0l-5-5" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* ── Chart wrapper ─────────────────────────────────────────── */}
            <div ref={wrapperRef} className="flex-1 relative" style={{ minHeight: 0 }}>

                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-xs text-gray-500">Loading...</span>
                        </div>
                    </div>
                )}
                {error && !loading && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                        <p className="text-sm text-red-500">⚠ {error}</p>
                    </div>
                )}
                {!loading && !error && data.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                        <p className="text-sm text-gray-400">No data for {symbol}</p>
                    </div>
                )}

                {/* Main candlestick chart (div height is set imperatively) */}
                <div ref={mainContRef} className="w-full" />

                {/* Oscillator tab bar */}
                <div className="flex items-center border-t border-b border-gray-100 bg-gray-50 overflow-x-auto" style={{ height: TAB_H }}>
                    {OSC_TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveOsc(tab.id)}
                            className={`px-2.5 text-[10px] font-bold border-b-2 whitespace-nowrap h-full shrink-0 transition-colors
                                ${activeOsc === tab.id ? 'border-blue-500 text-blue-600 bg-blue-50' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                    {oscHint.filter(o => o.val != null).length > 0 && (
                        <>
                            <span className="text-gray-200 mx-2 shrink-0">|</span>
                            {oscHint.filter(o => o.val != null).map(o => (
                                <span key={o.label} className="text-[10px] font-bold mr-3 shrink-0" style={{ color: o.color }}>
                                    {o.label}:{(o.val as number).toFixed(2)}
                                </span>
                            ))}
                        </>
                    )}
                </div>

                {/* Oscillator chart (height set imperatively) */}
                <div ref={oscContRef} className="w-full" />
            </div>
        </div>
    );
}
