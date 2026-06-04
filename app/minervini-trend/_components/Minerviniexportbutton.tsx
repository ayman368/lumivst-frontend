'use client';

import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

/* ─── Types ─────────────────────────────────────────────────────────────── */

interface TrendDataPoint {
    time: string;
    trend_1m: number;
    trend_4m: number;
    trend_5m_wide: number;
    alrayan: number;
}

interface MinerviniExportButtonProps {
    data: TrendDataPoint[];
    period: string;
    captureRef: React.RefObject<HTMLElement>;
}

type TrendRow = {
    Date: string;
    '1M': number;
    '4M': number;
    '5MW': number;
    Alrayan: number;
};

type ExportType = 'all' | '1m' | '4m' | '5mw' | 'alrayan';

/* ─── Period filter ──────────────────────────────────────────────────────── */

function filterByPeriod(items: TrendDataPoint[], period: string): TrendDataPoint[] {
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

/* ─── Main Component ─────────────────────────────────────────────────────── */

export default function MinerviniExportButton({
    data, period, captureRef,
}: MinerviniExportButtonProps) {
    const [open, setOpen] = useState(false);
    const [subMenu, setSubMenu] = useState<'data' | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [isWorking, setIsWorking] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
        if (!menuRef.current?.contains(e.relatedTarget as Node)) {
            setOpen(false); setSubMenu(null);
        }
    };

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
            const isHidden =
                cs.overflow === 'hidden' ||
                cs.overflowX === 'hidden' ||
                cs.overflowY === 'hidden';

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
            'backgroundColor', 'borderColor',
            'opacity', 'display',
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

    /* ─── PNG ─────────────────────────────────────────────────────────── */
    const exportPNG = async () => {
        setOpen(false); setSubMenu(null); setIsWorking(true);
        notify('Capturing screenshot…');
        try {
            const canvas = await captureHighQuality();
            const link = document.createElement('a');
            link.download = `Minervini-Trend${periodSuffix}-${today()}.png`;
            link.href = canvas.toDataURL('image/png', 1.0);
            link.click();
            notify('PNG saved ✓');
        } catch { notify('Screenshot failed', true); }
        finally { setIsWorking(false); }
    };

    /* ─── PDF ─────────────────────────────────────────────────────────── */
    const exportPDF = async () => {
        setOpen(false); setSubMenu(null); setIsWorking(true);
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
            pdf.setProperties({
                title: 'Minervini Trend Screener',
                subject: `${period} · ${today()}`,
                creator: 'TASI Analytics',
            });
            pdf.save(`Minervini-Trend${periodSuffix}-${today()}.pdf`);
            notify('PDF saved ✓');
        } catch { notify('PDF export failed', true); }
        finally { setIsWorking(false); }
    };

    /* ─── Data helpers ─────────────────────────────────────────────────── */
    const arrayToCSV = (rows: Record<string, any>[]): string => {
        if (!rows.length) return '';
        const headers = Object.keys(rows[0]);
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

    const getFilteredData = () => filterByPeriod(data, period);

    const getAllRows = (): TrendRow[] =>
        getFilteredData().map((d) => ({
            Date: d.time,
            '1M': d.trend_1m,
            '4M': d.trend_4m,
            '5MW': d.trend_5m_wide,
            Alrayan: d.alrayan,
        }));

    const getChartRows = (type: ExportType): any[] => {
        const filtered = getFilteredData();
        switch (type) {
            case '1m':
                return filtered.map((d) => ({ Date: d.time, '1M': d.trend_1m }));
            case '4m':
                return filtered.map((d) => ({ Date: d.time, '4M': d.trend_4m }));
            case '5mw':
                return filtered.map((d) => ({ Date: d.time, '5MW': d.trend_5m_wide }));
            case 'alrayan':
                return filtered.map((d) => ({ Date: d.time, Alrayan: d.alrayan }));
            default:
                return getAllRows();
        }
    };

    /* ─── CSV Export ───────────────────────────────────────────────────── */
    const exportCSV = (type: ExportType) => {
        setOpen(false); setSubMenu(null); notify('Preparing CSV…');
        const rows = getChartRows(type);
        const labels: Record<ExportType, string> = {
            all: 'All-Trends',
            '1m': '1M-Trend',
            '4m': '4M-Trend',
            '5mw': '5MW-Trend',
            alrayan: 'Alrayan-Trend',
        };
        downloadText(arrayToCSV(rows), `Minervini-${labels[type]}${periodSuffix}-${today()}.csv`, 'text/csv');
        notify('CSV saved ✓');
    };

    /* ─── TXT Export ───────────────────────────────────────────────────── */
    const exportTXT = (type: ExportType) => {
        setOpen(false); setSubMenu(null); notify('Preparing TXT…');

        const tableFromRows = (rows: Record<string, any>[]): string => {
            if (!rows.length) return '  (no data)\n';
            const keys = Object.keys(rows[0]);
            const widths = keys.map((k) => Math.max(k.length, ...rows.map((r) => String(r[k] ?? '').length)));
            const line = '+' + widths.map((w) => '-'.repeat(w + 2)).join('+') + '+';
            const fmt = (vals: string[]) => '| ' + vals.map((v, i) => v.padEnd(widths[i])).join(' | ') + ' |';
            return [line, fmt(keys), line, ...rows.map((r) => fmt(keys.map((k) => String(r[k] ?? '')))), line].join('\n') + '\n';
        };

        const header = `Minervini Trend Screener Export\nPeriod: ${period}  ·  Generated: ${today()}\n\n`;
        const rows = getChartRows(type);
        const labels: Record<ExportType, string> = {
            all: 'All-Trends',
            '1m': '1M-Trend',
            '4m': '4M-Trend',
            '5mw': '5MW-Trend',
            alrayan: 'Alrayan-Trend',
        };
        downloadText(header + tableFromRows(rows), `Minervini-${labels[type]}${periodSuffix}-${today()}.txt`);
        notify('TXT saved ✓');
    };

    /* ─── Excel Export ─────────────────────────────────────────────────── */
    const exportExcel = (type: ExportType) => {
        setOpen(false); setSubMenu(null); notify('Preparing Excel…');
        const wb = XLSX.utils.book_new();
        const rows = getChartRows(type);
        if (!rows.length) { notify('No data to export', true); return; }

        const ws = XLSX.utils.json_to_sheet(rows);
        ws['!cols'] = [{ wch: 12 }, { wch: 12 }];
        if (type === 'all') ws['!cols'] = [{ wch: 12 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 10 }];

        const labels: Record<ExportType, string> = {
            all: 'All Trends',
            '1m': '1 Month Trend',
            '4m': '4 Months Trend',
            '5mw': '5 Months Wide',
            alrayan: 'Alrayan Screener',
        };
        XLSX.utils.book_append_sheet(wb, ws, labels[type]);
        XLSX.writeFile(wb, `Minervini-${labels[type].replace(/\s/g, '-')}${periodSuffix}-${today()}.xlsx`);
        notify('Excel saved ✓');
    };

    /* ─── Dataset config ───────────────────────────────────────────────── */
    const DATASETS: { key: ExportType; label: string }[] = [
        { key: 'all', label: 'All Trends' },
        { key: '1m', label: '1 Month Trend' },
        { key: '4m', label: '4 Months Trend' },
        { key: '5mw', label: '5 Months Wide' },
        { key: 'alrayan', label: 'Alrayan Screener' },
    ];

    /* ─── Render ─────────────────────────────────────────────────────── */
    return (
        <div
            style={{ position: 'relative', display: 'inline-block' }}
            onBlur={handleBlur}
            ref={menuRef}
            tabIndex={-1}
        >
            <button
                onClick={() => { setOpen((o) => !o); setSubMenu(null); }}
                disabled={isWorking}
                style={{ ...S.btn, opacity: isWorking ? 0.7 : 1, cursor: isWorking ? 'wait' : 'pointer' }}
            >
                {isWorking ? (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        style={{ animation: 'spin 1s linear infinite' }}>
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                ) : (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                )}
                Export
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>

            {open && (
                <div style={S.menu}>
                    <div style={S.menuLabel}>
                        <span>Export</span>
                        {period !== 'ALL' && <span style={S.periodPill}>{period}</span>}
                    </div>

                    <div style={S.menuScroll}>
                        {/* PNG & PDF buttons */}
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

                        {/* Data export accordion */}
                        <button
                            onClick={() => setSubMenu((s) => (s === 'data' ? null : 'data'))}
                            style={S.menuItem}
                        >
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

                                {DATASETS.map(({ key, label }) => (
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
                        )}
                    </div>
                </div>
            )}

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
        <button
            onClick={onClick}
            style={{
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
            onMouseLeave={(e) => (e.currentTarget.style.background = bg)}
        >
            {children}
        </button>
    );
}

/* ─── Styles ─────────────────────────────────────────────────────────────── */

const S: Record<string, React.CSSProperties> = {
    btn: {
        display: 'flex', alignItems: 'center', gap: '7px',
        padding: '6px 12px',
        background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px',
        fontSize: '12px', fontWeight: 500, color: '#0F172A',
        fontFamily: '"DM Sans", sans-serif',
        cursor: 'pointer',
    },
    menu: {
        position: 'absolute', top: 'calc(100% + 6px)', right: 0,
        minWidth: '260px',
        background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px',
        zIndex: 999,
        boxShadow: '0 8px 24px rgba(15,23,42,0.12)',
        display: 'flex', flexDirection: 'column',
        maxHeight: '80vh',
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
    subRow: {
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '5px 14px',
    },
    subRowLabel: {
        fontSize: '12px', fontWeight: 500, color: '#0F172A',
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