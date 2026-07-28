'use client';

import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

/* ─── Types ─────────────────────────────────────────────────────────────── */

interface BreadthItem {
    time: string;
    total: number;
    pct_above_20: number;
    pct_above_50: number;
    pct_above_150: number;
    pct_above_200: number;
    ma50_20?: number;
    ma200_20?: number;
    ma50_50?: number;
    ma200_50?: number;
    ma50_150?: number;
    ma200_150?: number;
    ma50_200?: number;
    ma200_200?: number;
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

interface ExportButtonProps {
    data: BreadthItem[];
    adData: ADRatingItem[];
    alhussainData: AlhussainItem[];
    trendData: ScreenerTrendItem[];
    period: string;
    captureRef: React.RefObject<HTMLElement>;
}

type ExportType =
    | 'all'
    | 'ma20' | 'ma50' | 'ma150' | 'ma200'
    | 'ma20_avg50' | 'ma20_avg200' | 'ma20_with_avgs'
    | 'ma50_avg50' | 'ma50_avg200' | 'ma50_with_avgs'
    | 'ma150_avg50' | 'ma150_avg200' | 'ma150_with_avgs'
    | 'ma200_avg50' | 'ma200_avg200' | 'ma200_with_avgs'
    | 'ad_count' | 'ad_percent'
    | 'alhussain'
    | 'trend_1m' | 'trend_4m' | 'trend_5mw' | 'alrayan';

/* ─── Period filter ──────────────────────────────────────────────────────── */

function filterByPeriod<T extends { time: string }>(items: T[], period: string): T[] {
    if (!items.length || period === 'ALL') return items;
    const now = new Date();
    let cutoff: Date | null = null;
    if (period === '5D') { cutoff = new Date(now); cutoff.setDate(cutoff.getDate() - 5); }
    else if (period === '1M') { cutoff = new Date(now); cutoff.setMonth(cutoff.getMonth() - 1); }
    else if (period === '6M') { cutoff = new Date(now); cutoff.setMonth(cutoff.getMonth() - 6); }
    else if (period === '1Y') { cutoff = new Date(now); cutoff.setFullYear(cutoff.getFullYear() - 1); }
    else if (period === '5Y') { cutoff = new Date(now); cutoff.setFullYear(cutoff.getFullYear() - 5); }
    else if (period === '10Y') { cutoff = new Date(now); cutoff.setFullYear(cutoff.getFullYear() - 10); }
    if (!cutoff) return items;
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    return items.filter((d) => d.time >= cutoffStr);
}

/* ─── Helper to format value ────────────────────────────────────────────── */
const formatValue = (val: number | null | undefined): number | string => {
    if (val === null || val === undefined || isNaN(val)) return '';
    return +val.toFixed(2);
};

/* ─── Main Component ─────────────────────────────────────────────────────── */

export default function ExportButton({
    data, adData, alhussainData, trendData, period, captureRef,
}: ExportButtonProps) {
    const [open, setOpen] = useState(false);
    const [subMenu, setSubMenu] = useState<'data' | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [isWorking, setIsWorking] = useState(false);

    // Position of the dropdown, computed from the trigger button's screen rect.
    // The menu itself is rendered through a portal straight into <body>, so it can
    // never be visually clipped by an ancestor's `overflow: hidden`/`overflow-x: auto`
    // (e.g. a scrollable tabs bar) — which is what was hiding it before even though
    // `open` was correctly becoming `true`.
    const [menuPos, setMenuPos] = useState<{ top: number; left: number; width: number } | null>(null);

    const btnRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const closeAll = () => { setOpen(false); setSubMenu(null); };

    /* ── recompute position whenever the menu opens, and keep it pinned
         on scroll/resize while it stays open ── */
    useLayoutEffect(() => {
        if (!open) return;

        const updatePos = () => {
            const rect = btnRef.current?.getBoundingClientRect();
            if (!rect) return;
            setMenuPos({
                top: rect.bottom + 6,
                left: Math.max(8, rect.right - 320), // 320 = menu minWidth, right-aligned to button
                width: rect.width,
            });
        };

        updatePos();
        window.addEventListener('scroll', updatePos, true);
        window.addEventListener('resize', updatePos);
        return () => {
            window.removeEventListener('scroll', updatePos, true);
            window.removeEventListener('resize', updatePos);
        };
    }, [open]);

    /* ── click-outside handling (portal content isn't a DOM descendant of the
         trigger button, so we can't rely on onBlur/relatedTarget containment
         anymore — a real document-level listener is used instead) ── */
    useEffect(() => {
        if (!open) return;
        const onPointerDown = (e: MouseEvent) => {
            const target = e.target as Node;
            if (btnRef.current?.contains(target)) return;
            if (menuRef.current?.contains(target)) return;
            closeAll();
        };
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeAll();
        };
        document.addEventListener('mousedown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [open]);

    const notify = (msg: string, isError = false) => {
        setStatus(msg);
        setTimeout(() => setStatus(null), isError ? 4000 : 2500);
    };

    const today = () => new Date().toISOString().slice(0, 10);
    const periodSuffix = period !== 'ALL' ? `-${period}` : '';

    /* ─── High-quality capture ────────────────────────────────────────── */
    const captureHighQuality = async () => {
        if (!captureRef.current) throw new Error('Nothing to capture');
        const el = captureRef.current;

        type ClipRecord = { node: HTMLElement; overflow: string; overflowX: string; overflowY: string; height: string };
        const clipped: ClipRecord[] = [];
        const allEls = Array.from(el.querySelectorAll('*')) as HTMLElement[];

        allEls.forEach((node) => {
            const cs = window.getComputedStyle(node);
            const isHidden = cs.overflow === 'hidden' || cs.overflowX === 'hidden' || cs.overflowY === 'hidden';
            if (isHidden) {
                clipped.push({
                    node,
                    overflow: node.style.overflow,
                    overflowX: node.style.overflowX,
                    overflowY: node.style.overflowY,
                    height: node.style.height,
                });
                node.style.overflow = 'visible';
                node.style.overflowX = 'visible';
                node.style.overflowY = 'visible';
                if (node.scrollHeight > node.clientHeight + 1) {
                    node.style.height = node.scrollHeight + 'px';
                }
            }
        });

        const STAMP_PROPS = [
            'color', 'fontSize', 'fontWeight', 'fontFamily',
            'lineHeight', 'letterSpacing', 'textTransform',
            'backgroundColor', 'borderColor', 'opacity', 'display',
        ] as const;
        type StampProp = typeof STAMP_PROPS[number];
        const originals = new Map<HTMLElement, Partial<Record<StampProp, string>>>();

        allEls.forEach((node) => {
            const tag = node.tagName.toLowerCase();
            if (tag === 'canvas' || tag === 'style' || tag === 'script') return;
            const cs = window.getComputedStyle(node);
            const snapshot: Partial<Record<StampProp, string>> = {};
            STAMP_PROPS.forEach((p) => {
                const computed = cs[p as any] as string;
                if (!computed || computed === 'none') return;
                if (p === 'backgroundColor' && computed === 'rgba(0, 0, 0, 0)') return;
                if (p === 'borderColor' && computed === 'rgba(0, 0, 0, 0)') return;
                snapshot[p] = node.style[p as any];
                try { node.style[p as any] = computed; } catch { /* skip */ }
            });
            originals.set(node, snapshot);
        });

        const captureW = el.scrollWidth;
        const captureH = el.scrollHeight;

        let canvas: HTMLCanvasElement;
        try {
            canvas = await html2canvas(el, {
                scale: 3,
                useCORS: true,
                allowTaint: false,
                backgroundColor: '#F8FAFC',
                logging: false,
                imageTimeout: 15000,
                width: captureW,
                height: captureH,
                windowWidth: captureW,
                windowHeight: captureH,
                scrollX: 0,
                scrollY: 0,
            });
        } finally {
            clipped.forEach(({ node, overflow, overflowX, overflowY, height }) => {
                node.style.overflow = overflow;
                node.style.overflowX = overflowX;
                node.style.overflowY = overflowY;
                node.style.height = height;
            });
            originals.forEach((snapshot, node) => {
                STAMP_PROPS.forEach((p) => {
                    if (p in snapshot) {
                        try { node.style[p as any] = snapshot[p] ?? ''; } catch { /* skip */ }
                    }
                });
            });
        }
        return canvas;
    };

    /* ─── PNG & PDF ─────────────────────────────────────────────────────── */
    const exportPNG = async () => {
        closeAll(); setIsWorking(true);
        notify('Capturing screenshot…');
        try {
            const canvas = await captureHighQuality();
            const link = document.createElement('a');
            link.download = `TASI-Market-Breadth${periodSuffix}-${today()}.png`;
            link.href = canvas.toDataURL('image/png', 1.0);
            link.click();
            notify('PNG saved ✓');
        } catch { notify('Screenshot failed', true); }
        finally { setIsWorking(false); }
    };

    const exportPDF = async () => {
        closeAll(); setIsWorking(true);
        notify('Building PDF…');
        try {
            const canvas = await captureHighQuality();
            const logicalW = canvas.width / 3;
            const logicalH = canvas.height / 3;
            const pdf = new jsPDF({
                orientation: logicalW > logicalH ? 'landscape' : 'portrait',
                unit: 'pt',
                format: [logicalW, logicalH],
                compress: true,
            });
            pdf.addImage(canvas.toDataURL('image/png', 1.0), 'PNG', 0, 0, logicalW, logicalH, undefined, 'FAST');
            pdf.setProperties({ title: 'TASI Market Breadth', subject: `${period} · ${today()}`, creator: 'TASI Analytics' });
            pdf.save(`TASI-Market-Breadth${periodSuffix}-${today()}.pdf`);
            notify('PDF saved ✓');
        } catch { notify('PDF export failed', true); }
        finally { setIsWorking(false); }
    };

    /* ─── Data Builders ─────────────────────────────────────────────────── */
    const getFilteredData = () => filterByPeriod(data, period);
    const getFilteredAD = () => filterByPeriod(adData, period);
    const getFilteredAlh = () => filterByPeriod(alhussainData, period);
    const getFilteredTrend = () => filterByPeriod(trendData, period);

    // ==================== MA20 ====================
    const buildMA20Rows = () =>
        getFilteredData().map((d) => ({ Date: d.time, 'MA20 %': formatValue(d.pct_above_20) }));

    const buildMA20Avg50Rows = () =>
        getFilteredData().map((d) => ({ Date: d.time, 'MA20 AVG50': formatValue(d.ma50_20) }));

    const buildMA20Avg200Rows = () =>
        getFilteredData().map((d) => ({ Date: d.time, 'MA20 AVG200': formatValue(d.ma200_20) }));

    const buildMA20WithAvgsRows = () =>
        getFilteredData().map((d) => ({
            Date: d.time,
            'MA20 %': formatValue(d.pct_above_20),
            'AVG50': formatValue(d.ma50_20),
            'AVG200': formatValue(d.ma200_20),
        }));

    // ==================== MA50 ====================
    const buildMA50Rows = () =>
        getFilteredData().map((d) => ({ Date: d.time, 'MA50 %': formatValue(d.pct_above_50) }));

    const buildMA50Avg50Rows = () =>
        getFilteredData().map((d) => ({ Date: d.time, 'MA50 AVG50': formatValue(d.ma50_50) }));

    const buildMA50Avg200Rows = () =>
        getFilteredData().map((d) => ({ Date: d.time, 'MA50 AVG200': formatValue(d.ma200_50) }));

    const buildMA50WithAvgsRows = () =>
        getFilteredData().map((d) => ({
            Date: d.time,
            'MA50 %': formatValue(d.pct_above_50),
            'AVG50': formatValue(d.ma50_50),
            'AVG200': formatValue(d.ma200_50),
        }));

    // ==================== MA150 ====================
    const buildMA150Rows = () =>
        getFilteredData().map((d) => ({ Date: d.time, 'MA150 %': formatValue(d.pct_above_150) }));

    const buildMA150Avg50Rows = () =>
        getFilteredData().map((d) => ({ Date: d.time, 'MA150 AVG50': formatValue(d.ma50_150) }));

    const buildMA150Avg200Rows = () =>
        getFilteredData().map((d) => ({ Date: d.time, 'MA150 AVG200': formatValue(d.ma200_150) }));

    const buildMA150WithAvgsRows = () =>
        getFilteredData().map((d) => ({
            Date: d.time,
            'MA150 %': formatValue(d.pct_above_150),
            'AVG50': formatValue(d.ma50_150),
            'AVG200': formatValue(d.ma200_150),
        }));

    // ==================== MA200 ====================
    const buildMA200Rows = () =>
        getFilteredData().map((d) => ({ Date: d.time, 'MA200 %': formatValue(d.pct_above_200) }));

    const buildMA200Avg50Rows = () =>
        getFilteredData().map((d) => ({ Date: d.time, 'MA200 AVG50': formatValue(d.ma50_200) }));

    const buildMA200Avg200Rows = () =>
        getFilteredData().map((d) => ({ Date: d.time, 'MA200 AVG200': formatValue(d.ma200_200) }));

    const buildMA200WithAvgsRows = () =>
        getFilteredData().map((d) => ({
            Date: d.time,
            'MA200 %': formatValue(d.pct_above_200),
            'AVG50': formatValue(d.ma50_200),
            'AVG200': formatValue(d.ma200_200),
        }));

    // ==================== A/D Rating ====================
    const buildADCountRows = () =>
        getFilteredAD().map((d) => ({
            Date: d.time,
            'A Count': d.a_rating,
            'D Count': d.d_rating,
        }));

    const buildADPercentRows = () =>
        getFilteredAD().map((d) => ({
            Date: d.time,
            'A %': formatValue(d.a_rating_pct),
            'D %': formatValue(d.d_rating_pct),
        }));

    // ==================== Alhussain ====================
    const buildAlhussainRows = () =>
        getFilteredAlh().map((d) => ({ Date: d.time, 'Alhussain': d.count }));

    // ==================== Minervini ====================
    const buildTrend1MRows = () =>
        getFilteredTrend().map((d) => ({ Date: d.time, '1M': d.trend_1m }));

    const buildTrend4MRows = () =>
        getFilteredTrend().map((d) => ({ Date: d.time, '4M': d.trend_4m }));

    const buildTrend5MWRows = () =>
        getFilteredTrend().map((d) => ({ Date: d.time, '5MW': d.trend_5m_wide }));

    const buildAlrayanRows = () =>
        getFilteredTrend().map((d) => ({ Date: d.time, 'Alrayan': d.alrayan }));

    // ==================== All Data Combined ====================
    const buildMergedRows = () => {
        const dateMap = new Map<string, Record<string, any>>();
        const get = (t: string) => { if (!dateMap.has(t)) dateMap.set(t, { Date: t }); return dateMap.get(t)!; };

        getFilteredData().forEach((d) => {
            const r = get(d.time);
            r['MA20 %'] = formatValue(d.pct_above_20);
            r['MA20 AVG50'] = formatValue(d.ma50_20);
            r['MA20 AVG200'] = formatValue(d.ma200_20);
            r['MA50 %'] = formatValue(d.pct_above_50);
            r['MA50 AVG50'] = formatValue(d.ma50_50);
            r['MA50 AVG200'] = formatValue(d.ma200_50);
            r['MA150 %'] = formatValue(d.pct_above_150);
            r['MA150 AVG50'] = formatValue(d.ma50_150);
            r['MA150 AVG200'] = formatValue(d.ma200_150);
            r['MA200 %'] = formatValue(d.pct_above_200);
            r['MA200 AVG50'] = formatValue(d.ma50_200);
            r['MA200 AVG200'] = formatValue(d.ma200_200);
        });
        getFilteredAD().forEach((d) => {
            const r = get(d.time);
            r['A Count'] = d.a_rating;
            r['D Count'] = d.d_rating;
            r['A %'] = formatValue(d.a_rating_pct);
            r['D %'] = formatValue(d.d_rating_pct);
        });
        getFilteredAlh().forEach((d) => { get(d.time)['Alhussain'] = d.count; });
        getFilteredTrend().forEach((d) => {
            const r = get(d.time);
            r['Minervini 1M'] = d.trend_1m;
            r['Minervini 4M'] = d.trend_4m;
            r['Minervini 5MW'] = d.trend_5m_wide;
            r['Alrayan'] = d.alrayan;
        });
        return [...dateMap.values()].sort((a, b) => a.Date.localeCompare(b.Date));
    };

    /* ─── Common Helpers ────────────────────────────────────────────────── */

    // Union of every key across every row — NOT just Object.keys(rows[0]).
    // "All Data Combined" rows have different shapes per date (a date that only
    // has Alhussain data won't have MA/AD/Minervini keys), so reading columns
    // from the first row alone silently dropped any column missing on that
    // particular date from the *entire* export. This walks every row instead.
    const getAllHeaders = (rows: Record<string, any>[]): string[] => {
        const seen = new Set<string>();
        const ordered: string[] = [];
        rows.forEach((r) => {
            Object.keys(r).forEach((k) => {
                if (!seen.has(k)) { seen.add(k); ordered.push(k); }
            });
        });
        // Keep Date first regardless of which row introduced it.
        const withoutDate = ordered.filter((k) => k !== 'Date');
        return ordered.includes('Date') ? ['Date', ...withoutDate] : withoutDate;
    };

    const arrayToCSV = (rows: Record<string, any>[]): string => {
        if (!rows.length) return '';
        const headers = getAllHeaders(rows);
        return [
            headers.join(','),
            ...rows.map((r) => headers.map((h) => {
                const s = String(r[h] ?? '');
                return s.includes(',') ? `"${s}"` : s;
            }).join(',')),
        ].join('\r\n');
    };

    const downloadText = (content: string, filename: string, mime = 'text/plain') => {
        const blob = new Blob([content], { type: mime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
        URL.revokeObjectURL(url);
    };

    const tableFromRows = (rows: Record<string, any>[]): string => {
        if (!rows.length) return '  (no data)\n';
        const keys = getAllHeaders(rows);
        const widths = keys.map((k) => Math.max(k.length, ...rows.map((r) => String(r[k] ?? '').length)));
        const line = '+' + widths.map((w) => '-'.repeat(w + 2)).join('+') + '+';
        const fmt = (vals: string[]) => '| ' + vals.map((v, i) => v.padEnd(widths[i])).join(' | ') + ' |';
        return [line, fmt(keys), line, ...rows.map((r) => fmt(keys.map((k) => String(r[k] ?? '')))), line].join('\n') + '\n';
    };

    /* ─── Export Functions ──────────────────────────────────────────────── */
    const exportCSV = (type: ExportType) => {
        closeAll(); notify('Preparing CSV…');
        let rows: Record<string, any>[] = [];
        let label = '';

        switch (type) {
            case 'all': rows = buildMergedRows(); label = 'All-Data'; break;
            case 'ma20': rows = buildMA20Rows(); label = 'MA20'; break;
            case 'ma20_avg50': rows = buildMA20Avg50Rows(); label = 'MA20-AVG50'; break;
            case 'ma20_avg200': rows = buildMA20Avg200Rows(); label = 'MA20-AVG200'; break;
            case 'ma20_with_avgs': rows = buildMA20WithAvgsRows(); label = 'MA20-With-AVGs'; break;
            case 'ma50': rows = buildMA50Rows(); label = 'MA50'; break;
            case 'ma50_avg50': rows = buildMA50Avg50Rows(); label = 'MA50-AVG50'; break;
            case 'ma50_avg200': rows = buildMA50Avg200Rows(); label = 'MA50-AVG200'; break;
            case 'ma50_with_avgs': rows = buildMA50WithAvgsRows(); label = 'MA50-With-AVGs'; break;
            case 'ma150': rows = buildMA150Rows(); label = 'MA150'; break;
            case 'ma150_avg50': rows = buildMA150Avg50Rows(); label = 'MA150-AVG50'; break;
            case 'ma150_avg200': rows = buildMA150Avg200Rows(); label = 'MA150-AVG200'; break;
            case 'ma150_with_avgs': rows = buildMA150WithAvgsRows(); label = 'MA150-With-AVGs'; break;
            case 'ma200': rows = buildMA200Rows(); label = 'MA200'; break;
            case 'ma200_avg50': rows = buildMA200Avg50Rows(); label = 'MA200-AVG50'; break;
            case 'ma200_avg200': rows = buildMA200Avg200Rows(); label = 'MA200-AVG200'; break;
            case 'ma200_with_avgs': rows = buildMA200WithAvgsRows(); label = 'MA200-With-AVGs'; break;
            case 'ad_count': rows = buildADCountRows(); label = 'AD-Count'; break;
            case 'ad_percent': rows = buildADPercentRows(); label = 'AD-Percent'; break;
            case 'alhussain': rows = buildAlhussainRows(); label = 'Alhussain'; break;
            case 'trend_1m': rows = buildTrend1MRows(); label = 'Minervini-1M'; break;
            case 'trend_4m': rows = buildTrend4MRows(); label = 'Minervini-4M'; break;
            case 'trend_5mw': rows = buildTrend5MWRows(); label = 'Minervini-5MW'; break;
            case 'alrayan': rows = buildAlrayanRows(); label = 'Alrayan'; break;
        }
        downloadText(arrayToCSV(rows), `TASI-${label}${periodSuffix}-${today()}.csv`, 'text/csv');
        notify('CSV saved ✓');
    };

    const exportTXT = (type: ExportType) => {
        closeAll(); notify('Preparing TXT…');
        const header = `TASI Market Breadth Export\nPeriod: ${period} · Generated: ${today()}\n\n`;
        let content = '';
        let label = '';

        switch (type) {
            case 'all': content = header + tableFromRows(buildMergedRows()); label = 'All-Data'; break;
            case 'ma20': content = header + tableFromRows(buildMA20Rows()); label = 'MA20'; break;
            case 'ma20_avg50': content = header + tableFromRows(buildMA20Avg50Rows()); label = 'MA20-AVG50'; break;
            case 'ma20_avg200': content = header + tableFromRows(buildMA20Avg200Rows()); label = 'MA20-AVG200'; break;
            case 'ma20_with_avgs': content = header + tableFromRows(buildMA20WithAvgsRows()); label = 'MA20-With-AVGs'; break;
            case 'ma50': content = header + tableFromRows(buildMA50Rows()); label = 'MA50'; break;
            case 'ma50_avg50': content = header + tableFromRows(buildMA50Avg50Rows()); label = 'MA50-AVG50'; break;
            case 'ma50_avg200': content = header + tableFromRows(buildMA50Avg200Rows()); label = 'MA50-AVG200'; break;
            case 'ma50_with_avgs': content = header + tableFromRows(buildMA50WithAvgsRows()); label = 'MA50-With-AVGs'; break;
            case 'ma150': content = header + tableFromRows(buildMA150Rows()); label = 'MA150'; break;
            case 'ma150_avg50': content = header + tableFromRows(buildMA150Avg50Rows()); label = 'MA150-AVG50'; break;
            case 'ma150_avg200': content = header + tableFromRows(buildMA150Avg200Rows()); label = 'MA150-AVG200'; break;
            case 'ma150_with_avgs': content = header + tableFromRows(buildMA150WithAvgsRows()); label = 'MA150-With-AVGs'; break;
            case 'ma200': content = header + tableFromRows(buildMA200Rows()); label = 'MA200'; break;
            case 'ma200_avg50': content = header + tableFromRows(buildMA200Avg50Rows()); label = 'MA200-AVG50'; break;
            case 'ma200_avg200': content = header + tableFromRows(buildMA200Avg200Rows()); label = 'MA200-AVG200'; break;
            case 'ma200_with_avgs': content = header + tableFromRows(buildMA200WithAvgsRows()); label = 'MA200-With-AVGs'; break;
            case 'ad_count': content = header + tableFromRows(buildADCountRows()); label = 'AD-Count'; break;
            case 'ad_percent': content = header + tableFromRows(buildADPercentRows()); label = 'AD-Percent'; break;
            case 'alhussain': content = header + tableFromRows(buildAlhussainRows()); label = 'Alhussain'; break;
            case 'trend_1m': content = header + tableFromRows(buildTrend1MRows()); label = 'Minervini-1M'; break;
            case 'trend_4m': content = header + tableFromRows(buildTrend4MRows()); label = 'Minervini-4M'; break;
            case 'trend_5mw': content = header + tableFromRows(buildTrend5MWRows()); label = 'Minervini-5MW'; break;
            case 'alrayan': content = header + tableFromRows(buildAlrayanRows()); label = 'Alrayan'; break;
        }
        downloadText(content, `TASI-${label}${periodSuffix}-${today()}.txt`);
        notify('TXT saved ✓');
    };

    const exportExcel = (type: ExportType) => {
        closeAll(); notify('Preparing Excel…');
        const wb = XLSX.utils.book_new();

        const addSheet = (rows: Record<string, any>[], name: string, widths: number[]) => {
            if (!rows.length) return;
            const ws = XLSX.utils.json_to_sheet(rows);
            ws['!cols'] = widths.map((w) => ({ wch: w }));
            XLSX.utils.book_append_sheet(wb, ws, name);
        };

        let label = '';
        switch (type) {
            case 'all': addSheet(buildMergedRows(), 'All Data', [12, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10]); label = 'All-Data'; break;
            case 'ma20': addSheet(buildMA20Rows(), 'MA20 %', [12, 12]); label = 'MA20'; break;
            case 'ma20_avg50': addSheet(buildMA20Avg50Rows(), 'MA20 AVG50', [12, 12]); label = 'MA20-AVG50'; break;
            case 'ma20_avg200': addSheet(buildMA20Avg200Rows(), 'MA20 AVG200', [12, 12]); label = 'MA20-AVG200'; break;
            case 'ma20_with_avgs': addSheet(buildMA20WithAvgsRows(), 'MA20 + AVGs', [12, 10, 10, 10]); label = 'MA20-With-AVGs'; break;
            case 'ma50': addSheet(buildMA50Rows(), 'MA50 %', [12, 12]); label = 'MA50'; break;
            case 'ma50_avg50': addSheet(buildMA50Avg50Rows(), 'MA50 AVG50', [12, 12]); label = 'MA50-AVG50'; break;
            case 'ma50_avg200': addSheet(buildMA50Avg200Rows(), 'MA50 AVG200', [12, 12]); label = 'MA50-AVG200'; break;
            case 'ma50_with_avgs': addSheet(buildMA50WithAvgsRows(), 'MA50 + AVGs', [12, 10, 10, 10]); label = 'MA50-With-AVGs'; break;
            case 'ma150': addSheet(buildMA150Rows(), 'MA150 %', [12, 12]); label = 'MA150'; break;
            case 'ma150_avg50': addSheet(buildMA150Avg50Rows(), 'MA150 AVG50', [12, 12]); label = 'MA150-AVG50'; break;
            case 'ma150_avg200': addSheet(buildMA150Avg200Rows(), 'MA150 AVG200', [12, 12]); label = 'MA150-AVG200'; break;
            case 'ma150_with_avgs': addSheet(buildMA150WithAvgsRows(), 'MA150 + AVGs', [12, 10, 10, 10]); label = 'MA150-With-AVGs'; break;
            case 'ma200': addSheet(buildMA200Rows(), 'MA200 %', [12, 12]); label = 'MA200'; break;
            case 'ma200_avg50': addSheet(buildMA200Avg50Rows(), 'MA200 AVG50', [12, 12]); label = 'MA200-AVG50'; break;
            case 'ma200_avg200': addSheet(buildMA200Avg200Rows(), 'MA200 AVG200', [12, 12]); label = 'MA200-AVG200'; break;
            case 'ma200_with_avgs': addSheet(buildMA200WithAvgsRows(), 'MA200 + AVGs', [12, 10, 10, 10]); label = 'MA200-With-AVGs'; break;
            case 'ad_count': addSheet(buildADCountRows(), 'A/D Count', [12, 12, 12]); label = 'AD-Count'; break;
            case 'ad_percent': addSheet(buildADPercentRows(), 'A/D %', [12, 12, 12]); label = 'AD-Percent'; break;
            case 'alhussain': addSheet(buildAlhussainRows(), 'Alhussain', [12, 12]); label = 'Alhussain'; break;
            case 'trend_1m': addSheet(buildTrend1MRows(), 'Minervini 1M', [12, 12]); label = 'Minervini-1M'; break;
            case 'trend_4m': addSheet(buildTrend4MRows(), 'Minervini 4M', [12, 12]); label = 'Minervini-4M'; break;
            case 'trend_5mw': addSheet(buildTrend5MWRows(), 'Minervini 5MW', [12, 12]); label = 'Minervini-5MW'; break;
            case 'alrayan': addSheet(buildAlrayanRows(), 'Alrayan', [12, 12]); label = 'Alrayan'; break;
        }

        if (!wb.SheetNames.length) { notify('No data to export', true); return; }
        XLSX.writeFile(wb, `TASI-${label}${periodSuffix}-${today()}.xlsx`);
        notify('Excel saved ✓');
    };

    /* ─── Dataset Config ────────────────────────────────────────────────── */
    const DATASETS: { key: ExportType; label: string; group: string }[] = [
        { key: 'all', label: 'All Data Combined', group: 'All' },

        // MA20
        { key: 'ma20', label: 'MA20 %', group: 'MA20 (20-Day)' },
        { key: 'ma20_avg50', label: 'MA20 · AVG50', group: 'MA20 (20-Day)' },
        { key: 'ma20_avg200', label: 'MA20 · AVG200', group: 'MA20 (20-Day)' },
        { key: 'ma20_with_avgs', label: 'MA20 + AVG50 + AVG200', group: 'MA20 (20-Day)' },

        // MA50
        { key: 'ma50', label: 'MA50 %', group: 'MA50 (50-Day)' },
        { key: 'ma50_avg50', label: 'MA50 · AVG50', group: 'MA50 (50-Day)' },
        { key: 'ma50_avg200', label: 'MA50 · AVG200', group: 'MA50 (50-Day)' },
        { key: 'ma50_with_avgs', label: 'MA50 + AVG50 + AVG200', group: 'MA50 (50-Day)' },

        // MA150
        { key: 'ma150', label: 'MA150 %', group: 'MA150 (150-Day)' },
        { key: 'ma150_avg50', label: 'MA150 · AVG50', group: 'MA150 (150-Day)' },
        { key: 'ma150_avg200', label: 'MA150 · AVG200', group: 'MA150 (150-Day)' },
        { key: 'ma150_with_avgs', label: 'MA150 + AVG50 + AVG200', group: 'MA150 (150-Day)' },

        // MA200
        { key: 'ma200', label: 'MA200 %', group: 'MA200 (200-Day)' },
        { key: 'ma200_avg50', label: 'MA200 · AVG50', group: 'MA200 (200-Day)' },
        { key: 'ma200_avg200', label: 'MA200 · AVG200', group: 'MA200 (200-Day)' },
        { key: 'ma200_with_avgs', label: 'MA200 + AVG50 + AVG200', group: 'MA200 (200-Day)' },

        // Other
        { key: 'ad_count', label: 'A/D Rating (Count)', group: 'A/D Rating' },
        { key: 'ad_percent', label: 'A/D Rating (%)', group: 'A/D Rating' },
        { key: 'alhussain', label: 'Alhussain Screener', group: 'Alhussain' },
        { key: 'trend_1m', label: 'Minervini 1M', group: 'Minervini' },
        { key: 'trend_4m', label: 'Minervini 4M', group: 'Minervini' },
        { key: 'trend_5mw', label: 'Minervini 5MW', group: 'Minervini' },
        { key: 'alrayan', label: 'Alrayan Screener', group: 'Minervini' },
    ];

    const groupedDatasets = DATASETS.reduce((acc, item) => {
        if (!acc[item.group]) acc[item.group] = [];
        acc[item.group].push(item);
        return acc;
    }, {} as Record<string, typeof DATASETS>);

    /* ─── Menu content (rendered through a portal — see menuPos effect above) ── */
    const menuContent = open && menuPos && (
        <div ref={menuRef} style={{ ...S.menu, top: menuPos.top, left: menuPos.left }}>
            <div style={S.menuLabel}>
                <span>Export</span>
                {period !== 'ALL' && <span style={S.periodPill}>{period}</span>}
            </div>

            <div style={S.menuScroll}>
                {/* PNG & PDF */}
                <div style={S.menuItem} onClick={exportPNG}>
                    <div style={{ ...S.menuIconWrap, background: '#EEF2FF' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4338CA" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                        </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={S.menuItemLabel}>PNG Image</div>
                    </div>
                </div>

                <div style={S.menuItem} onClick={exportPDF}>
                    <div style={{ ...S.menuIconWrap, background: '#FEF2F2' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#B02040" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={S.menuItemLabel}>PDF Report</div>
                    </div>
                </div>

                <div style={S.divider} />

                {/* Data Export Accordion */}
                <button onClick={() => setSubMenu((s) => (s === 'data' ? null : 'data'))} style={S.menuItem}>
                    <div style={{ ...S.menuIconWrap, background: '#F0FFF4' }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2">
                            <ellipse cx="12" cy="5" rx="9" ry="3" />
                            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                        </svg>
                    </div>
                    <div style={{ flex: 1, textAlign: 'left' }}>
                        <div style={S.menuItemLabel}>Data Export</div>
                    </div>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5"
                        style={{ transform: subMenu === 'data' ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.15s' }}>
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>

                {subMenu === 'data' && (
                    <div style={S.subMenu}>
                        <div style={S.subHeader}>
                            <span style={{ flex: 1 }}>Dataset</span>
                            <span style={S.subColHead}>CSV</span>
                            <span style={S.subColHead}>XLS</span>
                            <span style={S.subColHead}>TXT</span>
                        </div>

                        {Object.entries(groupedDatasets).map(([group, items]) => (
                            <div key={group}>
                                <div style={S.groupHeader}>{group}</div>
                                {items.map(({ key, label }) => (
                                    <div key={key} style={S.subRow}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={S.subRowLabel}>{label}</div>
                                        </div>
                                        <div style={S.subRowBtns}>
                                            <SubBtn color="#1560A8" bg="#EEF4FF" hoverBg="#DBEAFE" onClick={() => exportCSV(key)}>CSV</SubBtn>
                                            <SubBtn color="#166534" bg="#F0FFF4" hoverBg="#D1FAE5" onClick={() => exportExcel(key)}>XLS</SubBtn>
                                            <SubBtn color="#0369A1" bg="#F0F9FF" hoverBg="#BAE6FD" onClick={() => exportTXT(key)}>TXT</SubBtn>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    /* ─── Render ────────────────────────────────────────────────────────── */
    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            <button
                ref={btnRef}
                onClick={() => setOpen((o) => !o)}
                disabled={isWorking}
                style={{ ...S.btn, opacity: isWorking ? 0.7 : 1, cursor: isWorking ? 'wait' : 'pointer' }}
            >
                {isWorking ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                )}
                Export
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>

            {typeof document !== 'undefined' && menuContent && createPortal(menuContent, document.body)}

            {status && (
                <div style={S.toast}>
                    {status.includes('fail') ? (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5">
                            <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                    ) : (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0F7A5A" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    )}
                    {status}
                </div>
            )}

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

/* ─── SubBtn ─────────────────────────────────────────────────────────────── */

function SubBtn({ children, color, bg, hoverBg, onClick }: {
    children: React.ReactNode;
    color: string; bg: string; hoverBg: string;
    onClick: () => void;
}) {
    return (
        <button onClick={onClick} style={{
            padding: '3px 8px',
            fontSize: '10px', fontWeight: 700,
            color, background: bg,
            border: `1px solid ${color}30`,
            borderRadius: '5px',
            cursor: 'pointer',
            fontFamily: '"DM Sans", sans-serif',
            transition: 'background 0.12s',
            whiteSpace: 'nowrap',
        }}
            onMouseEnter={(e) => (e.currentTarget.style.background = hoverBg)}
            onMouseLeave={(e) => (e.currentTarget.style.background = bg)}>
            {children}
        </button>
    );
}

/* ─── Styles ─────────────────────────────────────────────────────────────── */

const S: Record<string, React.CSSProperties> = {
    btn: {
        display: 'flex', alignItems: 'center', gap: '7px',
        padding: '7px 14px',
        background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px',
        fontSize: '13px', fontWeight: 500, color: '#0F172A',
        fontFamily: '"DM Sans", sans-serif',
        cursor: 'pointer',
    },
    menu: {
        position: 'fixed',
        minWidth: '320px',
        background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px',
        zIndex: 9999,
        boxShadow: '0 8px 24px rgba(15,23,42,0.12)',
        display: 'flex', flexDirection: 'column',
        maxHeight: '85vh',
    },
    menuLabel: {
        flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 14px 6px',
        fontSize: '10px', color: '#94A3B8',
        letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600,
        fontFamily: '"DM Sans", sans-serif',
        borderBottom: '1px solid #F1F5F9',
        background: '#FFFFFF',
        borderRadius: '12px 12px 0 0',
    },
    menuScroll: {
        overflowY: 'auto',
        overflowX: 'hidden',
        flex: 1,
        borderRadius: '0 0 12px 12px',
    },
    periodPill: {
        fontSize: '9px', fontWeight: 700,
        color: '#0F7A5A', background: '#E6F5F0',
        border: '1px solid #A7F3D0', borderRadius: '4px',
        padding: '1px 6px',
        fontFamily: '"DM Sans", sans-serif',
    },
    menuItem: {
        width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
        padding: '9px 14px', background: 'none', border: 'none',
        cursor: 'pointer', textAlign: 'left', fontFamily: '"DM Sans", sans-serif',
    },
    menuIconWrap: {
        width: '28px', height: '28px', borderRadius: '7px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    menuItemLabel: { fontSize: '13px', fontWeight: 500, color: '#0F172A', fontFamily: '"DM Sans", sans-serif' },
    divider: { height: '1px', background: '#F1F5F9', margin: '4px 14px' },
    subMenu: {
        background: '#F8FAFC',
        borderTop: '1px solid #F1F5F9',
        borderBottom: '1px solid #F1F5F9',
        padding: '6px 0 8px',
        maxHeight: '500px',
        overflowY: 'auto',
    },
    subHeader: {
        display: 'flex', alignItems: 'center', gap: '4px',
        padding: '3px 14px 5px',
        borderBottom: '1px solid #E8ECF2',
        marginBottom: '2px',
    },
    subColHead: {
        fontSize: '9px', fontWeight: 700, color: '#94A3B8',
        letterSpacing: '0.06em', textTransform: 'uppercase',
        fontFamily: '"DM Sans", sans-serif',
        width: '36px', textAlign: 'center' as const,
    },
    groupHeader: {
        fontSize: '10px', fontWeight: 700, color: '#64748B',
        letterSpacing: '0.05em', textTransform: 'uppercase',
        padding: '8px 14px 2px',
        fontFamily: '"DM Sans", sans-serif',
        borderBottom: '1px solid #E8ECF2',
        marginTop: '4px',
    },
    subRow: {
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '4px 14px',
    },
    subRowLabel: {
        fontSize: '11px', fontWeight: 500, color: '#0F172A',
        fontFamily: '"DM Sans", sans-serif',
        whiteSpace: 'nowrap',
    },
    subRowBtns: { display: 'flex', gap: '4px', flexShrink: 0 },
    toast: {
        position: 'absolute', top: 'calc(100% + 6px)', right: 0,
        display: 'flex', alignItems: 'center', gap: '7px',
        padding: '9px 14px', background: '#FFFFFF',
        border: '1px solid #E2E8F0', borderRadius: '8px',
        fontSize: '12px', color: '#0F172A',
        fontFamily: '"DM Sans", sans-serif',
        whiteSpace: 'nowrap',
        boxShadow: '0 4px 12px rgba(15,23,42,0.08)', zIndex: 1000,
    },
};