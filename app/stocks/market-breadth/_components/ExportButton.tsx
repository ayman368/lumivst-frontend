'use client';

import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

interface BreadthItem {
    time: string;
    total: number;
    pct_above_20: number;
    pct_above_50: number;
    pct_above_100: number;
    pct_above_200: number;
}

interface ExportButtonProps {
    data: BreadthItem[];
    captureRef: React.RefObject<HTMLElement>;
}

export default function ExportButton({ data, captureRef }: ExportButtonProps) {
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
        if (!menuRef.current?.contains(e.relatedTarget as Node)) setOpen(false);
    };

    const notify = (msg: string) => {
        setStatus(msg);
        setTimeout(() => setStatus(null), 2500);
    };

    const today = () => new Date().toISOString().slice(0, 10);

    const exportPDF = async () => {
        setOpen(false);
        if (!captureRef.current) return;
        notify('Generating PDF…');
        try {
            const canvas = await html2canvas(captureRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#F8FAFC',
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
                unit: 'px',
                format: [canvas.width / 2, canvas.height / 2],
            });
            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
            pdf.save(`TASI-Market-Breadth-${today()}.pdf`);
            notify('PDF saved ✓');
        } catch {
            notify('PDF export failed');
        }
    };

    const exportImage = async () => {
        setOpen(false);
        if (!captureRef.current) return;
        notify('Capturing screenshot…');
        try {
            const canvas = await html2canvas(captureRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#F8FAFC',
            });
            const link = document.createElement('a');
            link.download = `TASI-Market-Breadth-${today()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            notify('Image saved ✓');
        } catch {
            notify('Image export failed');
        }
    };

    const exportExcel = () => {
        setOpen(false);
        if (!data.length) return;
        notify('Preparing Excel file…');

        const rows = data.map(d => ({
            Date: d.time,
            'Total Constituents': d.total,
            '% Above MA20': +d.pct_above_20.toFixed(2),
            '% Above MA50': +d.pct_above_50.toFixed(2),
            '% Above MA100': +d.pct_above_100.toFixed(2),
            '% Above MA200': +d.pct_above_200.toFixed(2),
        }));

        const ws = XLSX.utils.json_to_sheet(rows);
        ws['!cols'] = [{ wch: 12 }, { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 15 }, { wch: 15 }];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Market Breadth');
        XLSX.writeFile(wb, `TASI-Market-Breadth-${today()}.xlsx`);
        notify('Excel downloaded ✓');
    };

    return (
        <div
            style={{ position: 'relative', display: 'inline-block' }}
            onBlur={handleBlur}
            ref={menuRef}
            tabIndex={-1}
        >
            {/* Trigger */}
            <button onClick={() => setOpen(o => !o)} style={S.btn}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>

            {/* Dropdown */}
            {open && (
                <div style={S.menu}>
                    <div style={S.menuLabel}>Export as</div>

                    <MenuItem
                        iconBg="#FEF2F2"
                        icon={
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#B02040" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                                <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                            </svg>
                        }
                        label="PDF Report"
                        sub="Full page with all charts"
                        onClick={exportPDF}
                    />

                    <MenuItem
                        iconBg="#EEF2FF"
                        icon={
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4338CA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                            </svg>
                        }
                        label="PNG Image"
                        sub="Screenshot of the dashboard"
                        onClick={exportImage}
                    />

                    <div style={{ height: '1px', background: '#E8ECF2', margin: '4px 14px' }} />

                    <MenuItem
                        iconBg="#F0FFF4"
                        icon={
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                                <path d="M8 13h2l2 4 2-4h2" />
                            </svg>
                        }
                        label="Excel / CSV"
                        sub="Raw breadth data table"
                        onClick={exportExcel}
                    />

                    <div style={{ padding: '6px 14px 10px' }}>
                        <div style={S.hint}>Exports all 4 MA charts and summary bar</div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {status && (
                <div style={S.toast}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0F7A5A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {status}
                </div>
            )}
        </div>
    );
}

function MenuItem({ icon, iconBg, label, sub, onClick }: {
    icon: React.ReactNode;
    iconBg: string;
    label: string;
    sub: string;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            style={S.menuItem}
            onMouseEnter={e => (e.currentTarget.style.background = '#F8FAFC')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
        >
            <div style={{ ...S.menuIconWrap, background: iconBg }}>{icon}</div>
            <div>
                <div style={S.menuItemLabel}>{label}</div>
                <div style={S.menuItemSub}>{sub}</div>
            </div>
        </button>
    );
}

const S: Record<string, React.CSSProperties> = {
    btn: {
        display: 'flex', alignItems: 'center', gap: '7px',
        padding: '7px 14px',
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '8px',
        fontSize: '13px', fontWeight: 500, color: '#0F172A',
        fontFamily: '"DM Sans", sans-serif',
        cursor: 'pointer',
    },
    menu: {
        position: 'absolute', top: 'calc(100% + 6px)', right: 0,
        minWidth: '220px',
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        overflow: 'hidden',
        zIndex: 999,
        boxShadow: '0 8px 24px rgba(15,23,42,0.10)',
    },
    menuLabel: {
        padding: '8px 14px 4px',
        fontSize: '10px', color: '#94A3B8',
        letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600,
        fontFamily: '"DM Sans", sans-serif',
        borderBottom: '1px solid #F1F5F9',
        marginBottom: '4px',
    },
    menuItem: {
        width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
        padding: '9px 14px',
        background: 'none', border: 'none',
        cursor: 'pointer', textAlign: 'left',
        fontFamily: '"DM Sans", sans-serif',
    },
    menuIconWrap: {
        width: '28px', height: '28px', borderRadius: '7px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    menuItemLabel: {
        fontSize: '13px', fontWeight: 500, color: '#0F172A',
        fontFamily: '"DM Sans", sans-serif',
    },
    menuItemSub: {
        fontSize: '11px', color: '#94A3B8', marginTop: '1px',
        fontFamily: '"DM Sans", sans-serif',
    },
    hint: {
        fontSize: '10px', color: '#94A3B8',
        padding: '6px 10px',
        background: '#F8FAFC', borderRadius: '6px',
        lineHeight: 1.5, fontFamily: '"DM Sans", sans-serif',
    },
    toast: {
        position: 'absolute', top: 'calc(100% + 6px)', right: 0,
        display: 'flex', alignItems: 'center', gap: '7px',
        padding: '9px 14px',
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '8px',
        fontSize: '12px', color: '#0F172A',
        fontFamily: '"DM Sans", sans-serif',
        whiteSpace: 'nowrap',
        boxShadow: '0 4px 12px rgba(15,23,42,0.08)',
        zIndex: 1000,
    },
};