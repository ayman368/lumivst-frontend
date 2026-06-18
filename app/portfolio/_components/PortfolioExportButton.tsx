'use client';

import { useRef, useState } from 'react';
import * as XLSX from 'xlsx';

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface Position {
    id: number;
    pfl: string;
    sym: number | string;
    name: string;
    pflPct: number;
    mgnPct: number;
    shortPct: number;
    pctChg: number;
    last: number;
    cost: number;
    rsRating: number | null;
    rank1m: number | null;
    rank3m: number | null;
    rank6m: number | null;
    rank9m: number | null;
    rank12m: number | null;
    trend: string;
    sRs: number;
    sRs3m: number;
    sRs1m: number;
    s150ma: number;
    entryDate: string;
    addDate1: string;
    addDate2: string;
    addDate3: string;
    qty: number;
    tCost: number;
    sellValue: number;
    sell: number;
    exitDate: string;
    tSold: number;
    return_: number;
    returnPct: number;
    days: number;
    stopPrice: number;
    cRRR: number;
    cLossPct: number;
    pctOfPtf: number;
    rf100: number;
    rf75: number;
    rf50: number;
    rf25: number;
    es100: number;
    es75: number;
    es50: number;
    es25: number;
    position: string;
    category: string;
    pPrice: number;
    amount: number;
    qtyPlan: number;
    gain: number;
    loss: number;
    rrr: number;
    pandl: number;
    pandlPct: number;
    tCostFull: number;
    sector: string;
    sellMnth: string;
    sellMnthNum: number;
    sellAllMnth: number;
    allPandl: number;
    pct: number;
    cGain: number;
    ptTV: number;
    ptV: number;
    ptPct: number;
    pflCost: number;
}

type DatasetKey = 'all';

interface PortfolioExportButtonProps {
    data: Position[];           // filtered positions (already filtered by search/portfolio)
    period?: string;            // optional — passed if parent has period concept
    tableRef?: React.RefObject<HTMLElement>; // optional — for PNG/PDF capture
    activeColumns?: string[];   // columns to include in CSV/XLS/TXT export
}

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

const f = (v: number | null | undefined, d = 2) =>
    v == null || isNaN(v) || v === 0 ? '' : v.toFixed(d);

const p = (v: number | null | undefined) =>
    v == null || isNaN(v) || v === 0 ? '' : (v * 100).toFixed(2) + '%';

// Safe number helper
const safeNumber = (value: any): number => {
    if (value === null || value === undefined || value === '—') return 0;
    const num = Number(value);
    return isNaN(num) ? 0 : num;
};

/* ─── Row builders ────────────────────────────────────────────────────────── */

function buildAllRows(positions: Position[], activeColumns?: string[]) {
    return positions.map((pos) => {
        const fullRow: Record<string, any> = {
            'Pfl.': pos.pfl || '—',
            'Sym': String(pos.sym || '—'),
            'Name': pos.name || '—',
            'Pfl.%': p(safeNumber(pos.pflPct)),
            'Mgn%': p(safeNumber(pos.mgnPct)),
            'Short%': p(safeNumber(pos.shortPct)),
            '%Chg': p(safeNumber(pos.pctChg)),
            'Last': f(safeNumber(pos.last)),
            'Cost': f(safeNumber(pos.cost)),
            'RS Rating': pos.rsRating != null ? String(pos.rsRating) : '—',
            'RS 1M': pos.rank1m != null ? String(pos.rank1m) : '—',
            'RS 3M': pos.rank3m != null ? String(pos.rank3m) : '—',
            'RS 6M': pos.rank6m != null ? String(pos.rank6m) : '—',
            'RS 9M': pos.rank9m != null ? String(pos.rank9m) : '—',
            'RS 12M': pos.rank12m != null ? String(pos.rank12m) : '—',
            'Trend': pos.trend || '—',
            'S-RS': f(safeNumber(pos.sRs)),
            'S-RS-3M': f(safeNumber(pos.sRs3m)),
            'S-RS-1M': f(safeNumber(pos.sRs1m)),
            'S-150 MA': f(safeNumber(pos.s150ma)),
            'Entry date': pos.entryDate || '—',
            'Add date 1': pos.addDate1 || '—',
            'Add date 2': pos.addDate2 || '—',
            'Add date 3': pos.addDate3 || '—',
            'Qty': f(safeNumber(pos.qty), 0),
            'T.Cost': f(safeNumber(pos.tCost), 0),
            'Sell Value': f(safeNumber(pos.sellValue), 0),
            'Sell': f(safeNumber(pos.sell), 0),
            'Exit date': pos.exitDate || '—',
            'T.Sold': f(safeNumber(pos.tSold), 0),
            'Return': f(safeNumber(pos.return_), 0),
            'Return%': p(safeNumber(pos.returnPct)),
            'Days': String(pos.days || 0),
            'Stop Price': f(safeNumber(pos.stopPrice)),
            'C.RRR': f(safeNumber(pos.cRRR)),
            'C.Loss%': p(safeNumber(pos.cLossPct)),
            '% of Ptf.': p(safeNumber(pos.pctOfPtf)),
            'RF-100%': f(safeNumber(pos.rf100), 0),
            'RF-75%': f(safeNumber(pos.rf75), 0),
            'RF-50%': f(safeNumber(pos.rf50), 0),
            'RF-25%': f(safeNumber(pos.rf25), 0),
            'ES-100%': p(safeNumber(pos.es100)),
            'ES-75%': p(safeNumber(pos.es75)),
            'ES-50%': p(safeNumber(pos.es50)),
            'ES-25%': p(safeNumber(pos.es25)),
            'Position': pos.position || '—',
            'Category': pos.category || '—',
            'P.Price': f(safeNumber(pos.pPrice)),
            'Amount': f(safeNumber(pos.amount), 0),
            'Qty(plan)': f(safeNumber(pos.qtyPlan), 0),
            'Gain': p(safeNumber(pos.gain)),
            'Loss': p(safeNumber(pos.loss)),
            'RRR': f(safeNumber(pos.rrr)),
            'P&L': f(safeNumber(pos.pandl), 0),
            'P&L%': p(safeNumber(pos.pandlPct)),
            'T.Cost(full)': f(safeNumber(pos.tCostFull), 0),
            'Sector': pos.sector || '—',
            'Sell.Mnth': pos.sellMnth || '—',
            'Sell Mnth': String(pos.sellMnthNum || 0),
            'Sell All.Mnth': String(pos.sellAllMnth || 0),
            'All.P&L': f(safeNumber(pos.allPandl), 0),
            '%': p(safeNumber(pos.pct)),
            'C.Gain': f(safeNumber(pos.cGain)),
            'PT-T.V': f(safeNumber(pos.ptTV), 0),
            'PT-V': f(safeNumber(pos.ptV), 0),
            'PT%': p(safeNumber(pos.ptPct)),
            'Pfl.Cost': f(safeNumber(pos.pflCost), 0),
        };

        if (!activeColumns || activeColumns.length === 0) return fullRow;

        const filteredRow: Record<string, any> = {};
        for (const col of activeColumns) {
            if (col in fullRow) {
                filteredRow[col] = fullRow[col];
            }
        }
        return filteredRow;
    });
}

/* ─── CSV / TXT helpers ───────────────────────────────────────────────────── */

function arrayToCSV(rows: Record<string, any>[]): string {
    if (!rows.length) return '';
    const headers = Object.keys(rows[0]);
    return [
        headers.join(','),
        ...rows.map((r) =>
            headers.map((h) => {
                const s = String(r[h] ?? '');
                return s.includes(',') ? `"${s}"` : s;
            }).join(',')
        ),
    ].join('\r\n');
}

function arrayToTXT(rows: Record<string, any>[], title: string, today: string, totalPositions: number): string {
    if (!rows.length) return '(no data)\n';
    const keys = Object.keys(rows[0]);
    const widths = keys.map((k) => Math.max(k.length, ...rows.map((r) => String(r[k] ?? '').length)));
    const line = '+' + widths.map((w) => '-'.repeat(w + 2)).join('+') + '+';
    const fmt = (vals: string[]) => '| ' + vals.map((v, i) => v.padEnd(widths[i])).join(' | ') + ' |';
    const header = `Portfolio Export — ${title}\nPositions: ${totalPositions}  ·  Generated: ${today}\n`;
    return [
        header,
        line,
        fmt(keys),
        line,
        ...rows.map((r) => fmt(keys.map((k) => String(r[k] ?? '')))),
        line,
    ].join('\n') + '\n';
}

function downloadText(content: string, filename: string, mime = 'text/plain') {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

/* ─── Main Component ─────────────────────────────────────────────────────── */

export default function PortfolioExportButton({ data, period, tableRef, activeColumns }: PortfolioExportButtonProps) {
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

    /* ─── Row selector ─────────────────────────────────────────────────── */
    const getRows = (key: DatasetKey): Record<string, any>[] => {
        return buildAllRows(data, activeColumns);
    };

    const getLabelMap = (key: DatasetKey) => 'All Data';

    /* ─── PNG capture (table screenshot) ─────────────────────────────── */
    const captureTable = async () => {
        const { default: html2canvas } = await import('html2canvas');
        const el = tableRef?.current ?? document.querySelector('table')?.closest('div') as HTMLElement;
        if (!el) throw new Error('Table element not found');

        // Temporarily remove overflow to capture all rows
        type ClipRecord = { node: HTMLElement; overflow: string; height: string };
        const clipped: ClipRecord[] = [];
        (Array.from(el.querySelectorAll('*')) as HTMLElement[]).forEach((node) => {
            const cs = window.getComputedStyle(node);
            if (cs.overflow === 'hidden' || cs.overflowY === 'hidden') {
                clipped.push({ node, overflow: node.style.overflow, height: node.style.height });
                node.style.overflow = 'visible';
                if (node.scrollHeight > node.clientHeight + 1) node.style.height = node.scrollHeight + 'px';
            }
        });

        let canvas: HTMLCanvasElement;
        try {
            canvas = await html2canvas(el, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#f8f9fb',
                logging: false,
                width: el.scrollWidth,
                height: el.scrollHeight,
                windowWidth: el.scrollWidth,
                windowHeight: el.scrollHeight,
                scrollX: 0,
                scrollY: 0,
            });
        } finally {
            clipped.forEach(({ node, overflow, height }) => {
                node.style.overflow = overflow;
                node.style.height = height;
            });
        }
        return canvas;
    };

    /* ─── PNG ─────────────────────────────────────────────────────────── */
    const exportPNG = async () => {
        setOpen(false); setSubMenu(null); setIsWorking(true);
        notify('Capturing table…');
        try {
            const canvas = await captureTable();
            const link = document.createElement('a');
            link.download = `Portfolio-${today()}.png`;
            link.href = canvas.toDataURL('image/png', 1.0);
            link.click();
            notify('PNG saved ✓');
        } catch (err) {
            console.error(err);
            notify('Screenshot failed', true);
        } finally {
            setIsWorking(false);
        }
    };

    /* ─── PDF ─────────────────────────────────────────────────────────── */
    const exportPDF = async () => {
        setOpen(false); setSubMenu(null); setIsWorking(true);
        notify('Building PDF…');
        try {
            const [{ default: jsPDF }, canvas] = await Promise.all([
                import('jspdf'),
                captureTable(),
            ]);
            const logicalW = canvas.width / 2;
            const logicalH = canvas.height / 2;
            const pdf = new jsPDF({
                orientation: logicalW > logicalH ? 'landscape' : 'portrait',
                unit: 'pt',
                format: [logicalW, logicalH],
                compress: true,
            });
            pdf.addImage(canvas.toDataURL('image/png', 1.0), 'PNG', 0, 0, logicalW, logicalH, undefined, 'FAST');
            pdf.setProperties({ title: 'Portfolio Positions', subject: today(), creator: 'TASI Analytics' });
            pdf.save(`Portfolio-${today()}.pdf`);
            notify('PDF saved ✓');
        } catch (err) {
            console.error(err);
            notify('PDF export failed', true);
        } finally {
            setIsWorking(false);
        }
    };

    /* ─── CSV ─────────────────────────────────────────────────────────── */
    const exportCSV = (key: DatasetKey) => {
        setOpen(false); setSubMenu(null);
        notify('Preparing CSV…');
        const rows = getRows(key);
        if (!rows.length) { notify('No data', true); return; }
        downloadText(arrayToCSV(rows), `Portfolio-${getLabelMap(key)}-${today()}.csv`, 'text/csv');
        notify('CSV saved ✓');
    };

    /* ─── TXT ─────────────────────────────────────────────────────────── */
    const exportTXT = (key: DatasetKey) => {
        setOpen(false); setSubMenu(null);
        notify('Preparing TXT…');
        const rows = getRows(key);
        if (!rows.length) { notify('No data', true); return; }
        const txt = arrayToTXT(rows, getLabelMap(key), today(), data.length);
        downloadText(txt, `Portfolio-${getLabelMap(key)}-${today()}.txt`);
        notify('TXT saved ✓');
    };

    /* ─── Excel ────────────────────────────────────────────────────────── */
    const exportExcel = (key: DatasetKey) => {
        setOpen(false); setSubMenu(null);
        notify('Preparing Excel…');
        const wb = XLSX.utils.book_new();

        const rows = getRows(key);
        if (!rows.length) { notify('No data', true); return; }
        const ws = XLSX.utils.json_to_sheet(rows);
        const colWidths = Object.keys(rows[0]).map((col) => ({
            wch: Math.min(Math.max(col.length, ...rows.map((r) => String(r[col] ?? '').length)) + 2, 50),
        }));
        ws['!cols'] = colWidths;
        XLSX.utils.book_append_sheet(wb, ws, 'All Data');

        XLSX.writeFile(wb, `Portfolio-All Data-${today()}.xlsx`);
        notify('Excel saved ✓');
    };

    /* ─── Render ─────────────────────────────────────────────────────── */
    return (
        <div
            style={{ position: 'relative', display: 'inline-block' }}
            onBlur={handleBlur}
            ref={menuRef}
            tabIndex={-1}
        >
            {/* ── Trigger ── */}
            <button
                onClick={() => { setOpen((o) => !o); setSubMenu(null); }}
                disabled={isWorking}
                style={{
                    display: 'flex', alignItems: 'center', gap: '7px',
                    padding: '7px 14px',
                    background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px',
                    fontSize: '13px', fontWeight: 500, color: '#0F172A',
                    fontFamily: '"DM Sans", sans-serif',
                    cursor: isWorking ? 'wait' : 'pointer',
                    opacity: isWorking ? 0.7 : 1,
                }}
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

            {/* ── Dropdown ── */}
            {open && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                    minWidth: '270px',
                    background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px',
                    zIndex: 999,
                    boxShadow: '0 8px 24px rgba(15,23,42,0.12)',
                    display: 'flex', flexDirection: 'column',
                    maxHeight: '80vh',
                }}>
                    {/* header */}
                    <div style={{
                        flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '8px 14px 6px',
                        fontSize: '10px', color: '#94A3B8',
                        letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600,
                        fontFamily: '"DM Sans", sans-serif',
                        borderBottom: '1px solid #F1F5F9',
                        borderRadius: '12px 12px 0 0',
                    }}>
                        <span>Export</span>
                        <span style={{
                            fontSize: '9px', fontWeight: 700,
                            color: '#0F7A5A', background: '#E6F5F0',
                            border: '1px solid #A7F3D0', borderRadius: '4px',
                            padding: '1px 6px', fontFamily: '"DM Sans", sans-serif',
                        }}>
                            {data.length} positions
                        </span>
                    </div>

                    {/* scrollable body */}
                    <div style={{ overflowY: 'auto', overflowX: 'hidden', flex: 1, borderRadius: '0 0 12px 12px' }}>

                        {/* PNG */}
                        <ExportMenuItem
                            iconBg="#EEF2FF"
                            icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4338CA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>}
                            label="PNG Image"
                            onClick={exportPNG}
                        />

                        {/* PDF */}
                        <ExportMenuItem
                            iconBg="#FEF2F2"
                            icon={<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#B02040" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2-2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>}
                            label="PDF Report"
                            onClick={exportPDF}
                        />

                        <div style={{ height: '1px', background: '#F1F5F9', margin: '4px 14px' }} />

                        {/* All Data */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 14px', fontFamily: '"DM Sans", sans-serif' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: '#F0FFF4', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="3" width="18" height="18" rx="2" />
                                    <line x1="3" y1="9" x2="21" y2="9" />
                                    <line x1="3" y1="15" x2="21" y2="15" />
                                    <line x1="9" y1="3" x2="9" y2="21" />
                                </svg>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '13px', fontWeight: 500, color: '#0F172A', fontFamily: '"DM Sans", sans-serif' }}>All Data</div>
                            </div>
                            <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                                <SubBtn color="#1560A8" bg="#EEF4FF" hoverBg="#DBEAFE" onClick={() => exportCSV('all')}>CSV</SubBtn>
                                <SubBtn color="#166534" bg="#F0FFF4" hoverBg="#D1FAE5" onClick={() => exportExcel('all')}>XLS</SubBtn>
                                <SubBtn color="#0369A1" bg="#F0F9FF" hoverBg="#BAE6FD" onClick={() => exportTXT('all')}>TXT</SubBtn>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Toast ── */}
            {status && (
                <div style={{
                    position: 'absolute', top: 'calc(100% + 6px)', right: 0,
                    display: 'flex', alignItems: 'center', gap: '7px',
                    padding: '9px 14px', background: '#FFFFFF',
                    border: `1px solid ${status.includes('fail') || status.includes('No data') ? '#FCA5A5' : '#E2E8F0'}`,
                    borderRadius: '8px',
                    fontSize: '12px', color: '#0F172A',
                    fontFamily: '"DM Sans", sans-serif',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 12px rgba(15,23,42,0.08)', zIndex: 1000,
                }}>
                    {status.includes('fail') || status.includes('No data') ? (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                    ) : (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0F7A5A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    )}
                    {status}
                </div>
            )}

            <style>{`
                @keyframes spin { 
                    from { transform: rotate(0deg); } 
                    to { transform: rotate(360deg); } 
                }
            `}</style>
        </div>
    );
}

/* ─── SubBtn ─────────────────────────────────────────────────────────────── */
function SubBtn({ children, color, bg, hoverBg, onClick }: { children: React.ReactNode; color: string; bg: string; hoverBg: string; onClick: () => void }) {
    return (
        <button onClick={onClick}
            style={{ padding: '3px 8px', fontSize: '10px', fontWeight: 700, color, background: bg, border: `1px solid ${color}30`, borderRadius: '5px', cursor: 'pointer', fontFamily: '"DM Sans", sans-serif', transition: 'background 0.12s', whiteSpace: 'nowrap' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = hoverBg)}
            onMouseLeave={(e) => (e.currentTarget.style.background = bg)}
        >
            {children}
        </button>
    );
}

/* ─── ExportMenuItem ──────────────────────────────────────────────────────── */
function ExportMenuItem({ icon, iconBg, label, badge, badgeColor, onClick }: { icon: React.ReactNode; iconBg: string; label: string; badge?: string; badgeColor?: string; onClick: () => void }) {
    return (
        <button onClick={onClick}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: '"DM Sans", sans-serif' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#F8FAFC')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
        >
            <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</div>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 500, color: '#0F172A', fontFamily: '"DM Sans", sans-serif' }}>{label}</div>
            </div>
            {badge && (
                <span style={{ fontSize: '9px', fontWeight: 700, color: badgeColor, background: `${badgeColor}18`, border: `1px solid ${badgeColor}30`, borderRadius: '4px', padding: '1px 5px', fontFamily: '"DM Sans", sans-serif', flexShrink: 0 }}>
                    {badge}
                </span>
            )}
        </button>
    );
}