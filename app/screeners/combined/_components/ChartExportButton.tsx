'use client';

import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ChartDataset {
    key: string;
    label: string;
    rows: Record<string, unknown>[];
}

export interface ChartExportButtonProps {
    /** The element to screenshot (PNG / PDF) */
    captureRef: React.RefObject<HTMLElement>;
    /** Named datasets available for CSV / XLS / TXT export */
    datasets: ChartDataset[];
    /** Optional period label shown as a pill in the menu header */
    period?: string;
    /** Prefix used in saved file names, e.g. "Alhussain-Charts" */
    filePrefix?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────

function arrayToCSV(rows: Record<string, unknown>[]): string {
    if (!rows.length) return '';
    const headers = Object.keys(rows[0]);
    return [
        headers.join(','),
        ...rows.map(r =>
            headers
                .map(h => {
                    const s = String(r[h] ?? '');
                    return s.includes(',') ? `"${s}"` : s;
                })
                .join(','),
        ),
    ].join('\r\n');
}

function tableFromRows(rows: Record<string, unknown>[]): string {
    if (!rows.length) return '  (no data)\n';
    const keys = Object.keys(rows[0]);
    const widths = keys.map(k =>
        Math.max(k.length, ...rows.map(r => String(r[k] ?? '').length)),
    );
    const line = '+' + widths.map(w => '-'.repeat(w + 2)).join('+') + '+';
    const fmt = (vals: string[]) =>
        '| ' + vals.map((v, i) => v.padEnd(widths[i])).join(' | ') + ' |';
    return (
        [
            line,
            fmt(keys),
            line,
            ...rows.map(r => fmt(keys.map(k => String(r[k] ?? '')))),
            line,
        ].join('\n') + '\n'
    );
}

function downloadBlob(content: string, filename: string, mime = 'text/plain') {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// ─────────────────────────────────────────────────────────────────────────────
// High-quality screenshot
// ─────────────────────────────────────────────────────────────────────────────

const STAMP_PROPS = [
    'color', 'fontSize', 'fontWeight', 'fontFamily',
    'lineHeight', 'letterSpacing', 'textTransform',
    'backgroundColor', 'borderColor', 'opacity', 'display',
] as const;

type StampProp = (typeof STAMP_PROPS)[number];

interface ClipRecord {
    node: HTMLElement;
    overflow: string;
    overflowX: string;
    overflowY: string;
    height: string;
}

async function captureHighQuality(el: HTMLElement): Promise<HTMLCanvasElement> {
    const clipped: ClipRecord[] = [];
    const allEls = Array.from(el.querySelectorAll('*')) as HTMLElement[];

    // Temporarily expand clipped elements so html2canvas captures them fully
    allEls.forEach(node => {
        const cs = window.getComputedStyle(node);
        if (cs.overflow === 'hidden' || cs.overflowX === 'hidden' || cs.overflowY === 'hidden') {
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

    // Stamp computed styles so html2canvas picks them up correctly
    const originals = new Map<HTMLElement, Partial<Record<StampProp, string>>>();

    allEls.forEach(node => {
        const tag = node.tagName.toLowerCase();
        if (tag === 'canvas' || tag === 'style' || tag === 'script') return;

        const cs = window.getComputedStyle(node);
        const snapshot: Partial<Record<StampProp, string>> = {};

        STAMP_PROPS.forEach(p => {
            const computed = cs[p] as string;
            if (!computed || computed === 'none') return;
            if (p === 'backgroundColor' && computed === 'rgba(0, 0, 0, 0)') return;
            if (p === 'borderColor' && computed === 'rgba(0, 0, 0, 0)') return;
            snapshot[p] = node.style[p];
            try {
                node.style[p] = computed;
            } catch { /* read-only property — skip */ }
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
        // Restore overflow
        clipped.forEach(({ node, overflow, overflowX, overflowY, height }) => {
            node.style.overflow = overflow;
            node.style.overflowX = overflowX;
            node.style.overflowY = overflowY;
            node.style.height = height;
        });
        // Restore stamped styles
        originals.forEach((snapshot, node) => {
            STAMP_PROPS.forEach(p => {
                if (p in snapshot) {
                    try {
                        node.style[p] = snapshot[p] ?? '';
                    } catch { /* skip */ }
                }
            });
        });
    }

    return canvas;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-button (CSV / XLS / TXT)
// ─────────────────────────────────────────────────────────────────────────────

function SubBtn({
    children, color, bg, hoverBg, onClick,
}: {
    children: React.ReactNode;
    color: string;
    bg: string;
    hoverBg: string;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            style={{
                padding: '3px 8px', fontSize: '10px', fontWeight: 700,
                color, background: bg,
                border: `1px solid ${color}30`, borderRadius: '5px',
                cursor: 'pointer', fontFamily: '"DM Sans", system-ui, sans-serif',
                transition: 'background 0.12s', whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
            onMouseLeave={e => (e.currentTarget.style.background = bg)}
        >
            {children}
        </button>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────────────────

export default function ChartExportButton({
    captureRef,
    datasets,
    period,
    filePrefix = 'Chart',
}: ChartExportButtonProps) {
    const [open, setOpen] = useState(false);
    const [subMenu, setSubMenu] = useState<string | null>(null);
    const [status, setStatus] = useState<string | null>(null);
    const [isWorking, setIsWorking] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
        if (!menuRef.current?.contains(e.relatedTarget as Node)) {
            setOpen(false);
            setSubMenu(null);
        }
    };

    const notify = (msg: string, isError = false) => {
        setStatus(msg);
        setTimeout(() => setStatus(null), isError ? 4000 : 2500);
    };

    const today = new Date().toISOString().slice(0, 10);
    const periodSuffix = period && period !== 'ALL' ? `-${period}` : '';

    // ── PNG ──────────────────────────────────────────────────────────────────

    const exportPNG = async () => {
        setOpen(false);
        setSubMenu(null);
        if (!captureRef.current) return;
        setIsWorking(true);
        notify('Capturing screenshot…');
        try {
            const canvas = await captureHighQuality(captureRef.current);
            const link = document.createElement('a');
            link.download = `${filePrefix}${periodSuffix}-${today}.png`;
            link.href = canvas.toDataURL('image/png', 1.0);
            link.click();
            notify('PNG saved ✓');
        } catch {
            notify('Screenshot failed', true);
        } finally {
            setIsWorking(false);
        }
    };

    // ── PDF ──────────────────────────────────────────────────────────────────

    const exportPDF = async () => {
        setOpen(false);
        setSubMenu(null);
        if (!captureRef.current) return;
        setIsWorking(true);
        notify('Building PDF…');
        try {
            const canvas = await captureHighQuality(captureRef.current);
            const logicalW = canvas.width / 3;
            const logicalH = canvas.height / 3;
            const pdf = new jsPDF({
                orientation: logicalW > logicalH ? 'landscape' : 'portrait',
                unit: 'pt',
                format: [logicalW, logicalH],
                compress: true,
            });
            pdf.addImage(
                canvas.toDataURL('image/png', 1.0), 'PNG',
                0, 0, logicalW, logicalH,
                undefined, 'FAST',
            );
            pdf.setProperties({
                title: filePrefix,
                subject: `${period ?? 'ALL'} · ${today}`,
                creator: 'TASI Analytics',
            });
            pdf.save(`${filePrefix}${periodSuffix}-${today}.pdf`);
            notify('PDF saved ✓');
        } catch {
            notify('PDF failed', true);
        } finally {
            setIsWorking(false);
        }
    };

    // ── CSV ──────────────────────────────────────────────────────────────────

    const exportCSV = (ds: ChartDataset) => {
        setOpen(false);
        setSubMenu(null);
        downloadBlob(arrayToCSV(ds.rows), `${filePrefix}-${ds.key}${periodSuffix}-${today}.csv`, 'text/csv');
        notify('CSV saved ✓');
    };

    // ── Excel ────────────────────────────────────────────────────────────────

    const exportExcel = (ds: ChartDataset) => {
        setOpen(false);
        setSubMenu(null);
        if (!ds.rows.length) { notify('No data', true); return; }
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(ds.rows);
        XLSX.utils.book_append_sheet(wb, ws, ds.label.slice(0, 31));
        XLSX.writeFile(wb, `${filePrefix}-${ds.key}${periodSuffix}-${today}.xlsx`);
        notify('Excel saved ✓');
    };

    // ── TXT ──────────────────────────────────────────────────────────────────

    const exportTXT = (ds: ChartDataset) => {
        setOpen(false);
        setSubMenu(null);
        const header = `${filePrefix} Export\nPeriod: ${period ?? 'ALL'}  ·  Generated: ${today}\n\n`;
        downloadBlob(header + tableFromRows(ds.rows), `${filePrefix}-${ds.key}${periodSuffix}-${today}.txt`);
        notify('TXT saved ✓');
    };

    // ── Render ───────────────────────────────────────────────────────────────

    return (
        <div
            ref={menuRef}
            tabIndex={-1}
            onBlur={handleBlur}
            style={{ position: 'relative', display: 'inline-block' }}
        >
            {/* Trigger button */}
            <button
                onClick={() => { setOpen(o => !o); setSubMenu(null); }}
                disabled={isWorking}
                style={{
                    display: 'flex', alignItems: 'center', gap: '7px',
                    padding: '6px 12px',
                    background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px',
                    fontSize: '12px', fontWeight: 500, color: '#0F172A',
                    fontFamily: '"DM Sans", system-ui, sans-serif',
                    cursor: isWorking ? 'wait' : 'pointer',
                    opacity: isWorking ? 0.7 : 1,
                }}
            >
                {isWorking ? (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        style={{ animation: 'ce-spin 1s linear infinite' }}>
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                ) : (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                )}
                Export
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>

            {/* Dropdown menu */}
            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                    minWidth: '260px', background: '#FFFFFF',
                    border: '1px solid #E2E8F0', borderRadius: '12px',
                    zIndex: 999, boxShadow: '0 8px 24px rgba(15,23,42,0.12)',
                    display: 'flex', flexDirection: 'column', maxHeight: '80vh',
                }}>
                    {/* Header */}
                    <div style={{
                        flexShrink: 0, display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between', padding: '8px 14px 6px',
                        fontSize: '10px', color: '#94A3B8',
                        letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600,
                        fontFamily: '"DM Sans", system-ui, sans-serif',
                        borderBottom: '1px solid #F1F5F9', borderRadius: '12px 12px 0 0',
                    }}>
                        <span>Export</span>
                        {period && period !== 'ALL' && (
                            <span style={{
                                fontSize: '9px', fontWeight: 700,
                                color: '#0F7A5A', background: '#E6F5F0',
                                border: '1px solid #A7F3D0', borderRadius: '4px',
                                padding: '1px 6px',
                            }}>
                                {period}
                            </span>
                        )}
                    </div>

                    <div style={{ overflowY: 'auto', flex: 1, borderRadius: '0 0 12px 12px' }}>

                        {/* PNG */}
                        <button onClick={exportPNG} style={S.menuItem}>
                            <div style={{ ...S.iconWrap, background: '#EEF2FF' }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4338CA" strokeWidth="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" />
                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                    <polyline points="21 15 16 10 5 21" />
                                </svg>
                            </div>
                            <div style={{ flex: 1, textAlign: 'left' }}>
                                <div style={S.menuLabel}>PNG Image</div>
                                <div style={S.menuSub}>Full-resolution screenshot</div>
                            </div>
                        </button>

                        {/* PDF */}
                        <button onClick={exportPDF} style={S.menuItem}>
                            <div style={{ ...S.iconWrap, background: '#FEF2F2' }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#B02040" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="16" y1="13" x2="8" y2="13" />
                                    <line x1="16" y1="17" x2="8" y2="17" />
                                </svg>
                            </div>
                            <div style={{ flex: 1, textAlign: 'left' }}>
                                <div style={S.menuLabel}>PDF Report</div>
                                <div style={S.menuSub}>Print-ready document</div>
                            </div>
                        </button>

                        <div style={S.divider} />

                        {/* Data export accordion */}
                        {datasets.length > 0 && (
                            <div>
                                <button
                                    onClick={() => setSubMenu(s => (s === 'data' ? null : 'data'))}
                                    style={{ ...S.menuItem, width: '100%' }}
                                >
                                    <div style={{ ...S.iconWrap, background: '#F0FFF4' }}>
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2">
                                            <ellipse cx="12" cy="5" rx="9" ry="3" />
                                            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                                            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                                        </svg>
                                    </div>
                                    <div style={{ flex: 1, textAlign: 'left' }}>
                                        <div style={S.menuLabel}>Data Export</div>
                                        <div style={S.menuSub}>CSV · XLS · TXT per dataset</div>
                                    </div>
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5"
                                        style={{ transform: subMenu === 'data' ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.15s' }}>
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </button>

                                {subMenu === 'data' && (
                                    <div style={{
                                        background: '#F8FAFC',
                                        borderTop: '1px solid #F1F5F9',
                                        borderBottom: '1px solid #F1F5F9',
                                        padding: '6px 0 8px',
                                    }}>
                                        {/* Column headers */}
                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: '4px',
                                            padding: '3px 14px 5px',
                                            borderBottom: '1px solid #E8ECF2', marginBottom: '2px',
                                        }}>
                                            <span style={S.colHeader}>Dataset</span>
                                            {(['CSV', 'XLS', 'TXT'] as const).map(h => (
                                                <span key={h} style={{ ...S.colHeader, width: '36px', textAlign: 'center' }}>{h}</span>
                                            ))}
                                        </div>

                                        {datasets.map(ds => (
                                            <div key={ds.key} style={{
                                                display: 'flex', alignItems: 'center',
                                                gap: '6px', padding: '5px 14px',
                                            }}>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{
                                                        fontSize: '12px', fontWeight: 500, color: '#0F172A',
                                                        fontFamily: '"DM Sans", system-ui, sans-serif',
                                                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                                    }}>
                                                        {ds.label}
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                                                    <SubBtn color="#1560A8" bg="#EEF4FF" hoverBg="#DBEAFE" onClick={() => exportCSV(ds)}>CSV</SubBtn>
                                                    <SubBtn color="#166534" bg="#F0FFF4" hoverBg="#D1FAE5" onClick={() => exportExcel(ds)}>XLS</SubBtn>
                                                    <SubBtn color="#0369A1" bg="#F0F9FF" hoverBg="#BAE6FD" onClick={() => exportTXT(ds)}>TXT</SubBtn>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Toast notification */}
            {status && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                    display: 'flex', alignItems: 'center', gap: '7px',
                    padding: '9px 14px', background: '#FFFFFF',
                    border: '1px solid #E2E8F0', borderRadius: '8px',
                    fontSize: '12px', color: '#0F172A',
                    fontFamily: '"DM Sans", system-ui, sans-serif',
                    whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(15,23,42,0.08)',
                    zIndex: 1000,
                }}>
                    {status.toLowerCase().includes('fail') ? (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="15" y1="9" x2="9" y2="15" />
                            <line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                    ) : (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0F7A5A" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    )}
                    {status}
                </div>
            )}

            <style>{`@keyframes ce-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const S: Record<string, React.CSSProperties> = {
    menuItem: {
        width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
        padding: '9px 14px', background: 'none', border: 'none',
        cursor: 'pointer', textAlign: 'left',
        fontFamily: '"DM Sans", system-ui, sans-serif',
    },
    iconWrap: {
        width: '28px', height: '28px', borderRadius: '7px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    menuLabel: {
        fontSize: '13px', fontWeight: 500, color: '#0F172A',
        fontFamily: '"DM Sans", system-ui, sans-serif',
    },
    menuSub: {
        fontSize: '11px', color: '#94A3B8',
        fontFamily: '"DM Sans", system-ui, sans-serif',
        marginTop: '1px',
    },
    divider: { height: '1px', background: '#F1F5F9', margin: '4px 14px' },
    colHeader: {
        flex: 1, fontSize: '9px', fontWeight: 700, color: '#94A3B8',
        letterSpacing: '0.06em', textTransform: 'uppercase' as const,
        fontFamily: '"DM Sans", system-ui, sans-serif',
    },
};