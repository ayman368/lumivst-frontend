'use client';

import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { API_BASE_URL } from '@/lib/api/config';
import { authFetch } from '@/lib/api/authFetch';
import { useWatchlistShariah } from '@/components/Watchlist/WatchlistShariahContext';

interface StockRS {
    symbol: string;
    company_name?: string;
    rs_rating: number;
    prev_rs_rating?: number;
}

const getCategory = (rs: number) => {
    if (rs >= 90) return 'STRONG';
    if (rs >= 80) return 'IMPROVE';
    if (rs >= 70) return 'NEUTRAL';
    return 'WEAK';
};

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function roundRectTop(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function clipText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
    if (ctx.measureText(text).width <= maxWidth) return text;
    let t = text;
    while (t.length > 1 && ctx.measureText(t + '…').width > maxWidth) t = t.slice(0, -1);
    return t + '…';
}

function drawRows(
    ctx: CanvasRenderingContext2D,
    list: StockRS[],
    startY: number,
    cardX: number,
    cardW: number,
    rowH: number,
    rowGap: number,
    dotColor: string,
    padding: number,
) {
    list.forEach((item, ri) => {
        const ry = startY + padding / 2 + ri * (rowH + rowGap);
        const rx = cardX + 12;
        const rw = cardW - 24;

        ctx.fillStyle = '#f8f9fa';
        roundRect(ctx, rx, ry, rw, rowH, 8);
        ctx.fill();
        ctx.strokeStyle = '#e9ecef';
        ctx.lineWidth = 1;
        roundRect(ctx, rx, ry, rw, rowH, 8);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(rx + 16, ry + rowH / 2, 5, 0, Math.PI * 2);
        ctx.fillStyle = dotColor;
        ctx.fill();

        ctx.font = 'bold 14px system-ui, sans-serif';
        const rsStr = String(item.rs_rating);
        const rsW = ctx.measureText(rsStr).width + 20;
        const rsX = rx + rw - 10 - rsW;
        const rsY = ry + rowH / 2 - 13;

        ctx.fillStyle = '#ffffff';
        roundRect(ctx, rsX, rsY, rsW, 26, 6);
        ctx.fill();
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        roundRect(ctx, rsX, rsY, rsW, 26, 6);
        ctx.stroke();
        ctx.fillStyle = '#444444';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillText(rsStr, rsX + rsW / 2, ry + rowH / 2);

        let reservedRight = rsW + 14;

        const currentCat = getCategory(item.rs_rating);
        const prevCat = item.prev_rs_rating ? getCategory(item.prev_rs_rating) : null;
        const categories = ['WEAK', 'NEUTRAL', 'IMPROVE', 'STRONG'];
        const currIdx = categories.indexOf(currentCat);
        const prevIdx = prevCat ? categories.indexOf(prevCat) : -1;

        if (prevCat && currentCat !== prevCat) {
            const up = currIdx > prevIdx;
            const badgeText = `From ${prevCat}`;
            const badgeColor = up ? '#00c853' : '#d50000';

            ctx.font = 'bold 11px system-ui, sans-serif';
            const tw = ctx.measureText(badgeText).width;
            const bW = tw + 14;
            const bX = rx + rw - 10 - rsW - 6 - 18 - 4 - bW;
            const bY = ry + rowH / 2 - 10;

            ctx.fillStyle = badgeColor;
            roundRect(ctx, bX, bY, bW, 20, 4);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'left';
            ctx.fillText(badgeText, bX + 7, ry + rowH / 2);

            ctx.font = 'bold 16px system-ui, sans-serif';
            ctx.fillStyle = up ? '#00c853' : '#d50000';
            ctx.fillText(up ? '↑' : '↓', bX + bW + 3, ry + rowH / 2);

            reservedRight += bW + 24;
        }

        const nameMaxW = rw - 36 - reservedRight;
        ctx.font = '14px system-ui, sans-serif';
        ctx.fillStyle = '#333333';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'left';
        const name = item.company_name || item.symbol;
        ctx.fillText(clipText(ctx, name, nameMaxW), rx + 30, ry + rowH / 2);
    });
}

function drawHeader(
    ctx: CanvasRenderingContext2D,
    col: { title: string; range: string; arrow: string; list: StockRS[]; colors: any },
    x: number, y: number, cardW: number, headerH: number, total: number,
) {
    const grad = ctx.createLinearGradient(x, y, x + cardW, y + headerH);
    grad.addColorStop(0, col.colors.header);
    grad.addColorStop(1, col.colors.headerTo);
    ctx.fillStyle = grad;
    roundRectTop(ctx, x, y, cardW, headerH, 14);
    ctx.fill();

    ctx.fillStyle = col.colors.text;
    ctx.font = 'bold 28px system-ui, sans-serif';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.fillText(col.title, x + 20, y + 18);

    ctx.font = '13px system-ui, sans-serif';
    ctx.globalAlpha = 0.75;
    ctx.fillText(col.range, x + 20, y + 54);
    ctx.globalAlpha = 1;

    const pct = total > 0 ? ((col.list.length / total) * 100).toFixed(1) : '0';
    ctx.font = 'bold 36px system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${pct}%`, x + cardW - 56, y + 14);

    ctx.font = '13px system-ui, sans-serif';
    ctx.globalAlpha = 0.65;
    ctx.fillText(`${col.list.length} stocks`, x + cardW - 56, y + 56);
    ctx.globalAlpha = 1;

    ctx.font = 'bold 34px system-ui, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'right';
    ctx.fillText(col.arrow, x + cardW - 16, y + headerH / 2);

    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y + headerH);
    ctx.lineTo(x + cardW, y + headerH);
    ctx.stroke();
}

export default function RSMatrix() {
    const { filterStocks } = useWatchlistShariah();
    const [stocks, setStocks] = useState<StockRS[]>([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const isMounted = useRef(true);

    useEffect(() => {
        fetchData();
        return () => {
            isMounted.current = false;
        };
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const fetchData = async () => {
        try {
            const res = await authFetch(`${API_BASE_URL}/api/rs/latest?limit=500`, { credentials: 'include' });
            if (!res.ok) { console.error(`Fetch error: ${res.status}`); return; }
            const data = await res.json();
            if (data.data && isMounted.current) setStocks(data.data);
        } catch (err) {
            console.error(err);
        } finally {
            if (isMounted.current) setLoading(false);
        }
    };

    const filteredStocks = useMemo(() => filterStocks(stocks), [stocks, filterStocks]);

    const strong = useMemo(() => filteredStocks.filter(s => s.rs_rating >= 90).sort((a, b) => b.rs_rating - a.rs_rating), [filteredStocks]);
    const improve = useMemo(() => filteredStocks.filter(s => s.rs_rating >= 80 && s.rs_rating < 90).sort((a, b) => b.rs_rating - a.rs_rating), [filteredStocks]);
    const neutral = useMemo(() => filteredStocks.filter(s => s.rs_rating >= 70 && s.rs_rating < 80).sort((a, b) => b.rs_rating - a.rs_rating), [filteredStocks]);
    const weak = useMemo(() => filteredStocks.filter(s => s.rs_rating < 70).sort((a, b) => b.rs_rating - a.rs_rating), [filteredStocks]);
    const total = filteredStocks.length;

    const columns = useMemo(() => [
        { title: 'STRONG', range: '>= 90', arrow: '↑', list: strong, colors: { header: '#e8f5e9', headerTo: '#c8e6c9', text: '#1b5e20', dot: '#1b5e20' } },
        { title: 'IMPROVE', range: '80 - 89', arrow: '↗', list: improve, colors: { header: '#e1f5fe', headerTo: '#b3e5fc', text: '#01579b', dot: '#01579b' } },
        { title: 'NEUTRAL', range: '70 - 79', arrow: '→', list: neutral, colors: { header: '#fff3e0', headerTo: '#ffe0b2', text: '#e65100', dot: '#e65100' } },
        { title: 'WEAK', range: '< 70', arrow: '↓', list: weak, colors: { header: '#ffebee', headerTo: '#ffcdd2', text: '#b71c1c', dot: '#b71c1c' } },
    ], [strong, improve, neutral, weak]);

    const buildCanvas = useCallback((dpr = 2): HTMLCanvasElement => {
        const COL_W = 380;
        const GAP = 16;
        const PADDING = 20;
        const HEADER_H = 110;
        const ROW_H = 44;
        const ROW_GAP = 6;
        const COLS = 4;
        const TOP_BAR = 56;

        const maxRows = Math.max(...columns.map(c => c.list.length));
        const bodyH = maxRows * (ROW_H + ROW_GAP) + PADDING;
        const rawH = TOP_BAR + PADDING + HEADER_H + bodyH + PADDING;
        const rawW = PADDING * 2 + COLS * COL_W + (COLS - 1) * GAP;

        const canvas = document.createElement('canvas');
        canvas.width = rawW * dpr;
        canvas.height = rawH * dpr;
        const ctx = canvas.getContext('2d')!;
        ctx.scale(dpr, dpr);

        ctx.fillStyle = '#f0f2f5';
        ctx.fillRect(0, 0, rawW, rawH);

        ctx.fillStyle = '#1e222d';
        ctx.fillRect(0, 0, rawW, TOP_BAR);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px system-ui, sans-serif';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'left';
        ctx.fillText('RS Matrix Cards', PADDING, TOP_BAR / 2);
        ctx.fillStyle = '#aaaaaa';
        ctx.font = '13px system-ui, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(new Date().toLocaleDateString('en-GB'), rawW - PADDING, TOP_BAR / 2);

        columns.forEach((col, ci) => {
            const x = PADDING + ci * (COL_W + GAP);
            const y = TOP_BAR + PADDING;

            ctx.fillStyle = 'rgba(0,0,0,0.07)';
            roundRect(ctx, x + 3, y + 3, COL_W, HEADER_H + bodyH, 14);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            roundRect(ctx, x, y, COL_W, HEADER_H + bodyH, 14);
            ctx.fill();

            drawHeader(ctx, col, x, y, COL_W, HEADER_H, total);
            drawRows(ctx, col.list, y + HEADER_H, x, COL_W, ROW_H, ROW_GAP, col.colors.dot, PADDING);
        });

        return canvas;
    }, [columns, total]);

    const download = (href: string, filename: string) => {
        const a = document.createElement('a');
        a.href = href;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        requestAnimationFrame(() => {
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(href);
            }, 100);
        });
    };

    const dateStr = new Date().toISOString().slice(0, 10);

    const exportImage = async () => {
        setExporting(true);
        setDropdownOpen(false);
        try {
            const canvas = buildCanvas(2);
            const dataUrl = canvas.toDataURL('image/png', 1.0);
            download(dataUrl, `RS_Matrix_${dateStr}.png`);
        } catch (err) {
            console.error('Export image error:', err);
        } finally {
            setExporting(false);
        }
    };

    const exportPdf = async () => {
        setExporting(true);
        setDropdownOpen(false);
        try {
            const jsPDF = (await import('jspdf')).default;
            const canvas = buildCanvas(2);

            // Use toDataURL directly instead of toBlob for better compatibility
            const imgData = canvas.toDataURL('image/png', 1.0);

            const pdfW = canvas.width / 2;
            const pdfH = canvas.height / 2;
            const pdf = new jsPDF({
                orientation: pdfW > pdfH ? 'landscape' : 'portrait',
                unit: 'px',
                format: [pdfW, pdfH]
            });

            pdf.addImage(imgData, 'PNG', 0, 0, pdfW, pdfH, undefined, 'FAST');
            pdf.save(`RS_Matrix_${dateStr}.pdf`);
        } catch (err) {
            console.error('Export PDF error:', err);
        } finally {
            setExporting(false);
        }
    };

    const exportExcel = async () => {
        setExporting(true);
        setDropdownOpen(false);
        try {
            const XLSX = await import('xlsx');
            const rows = filteredStocks.map(s => ({
                Symbol: s.symbol,
                Company: s.company_name || s.symbol,
                RS_Rating: s.rs_rating,
                Prev_RS: s.prev_rs_rating ?? '',
                Category: getCategory(s.rs_rating),
                Change: s.prev_rs_rating ? s.rs_rating - s.prev_rs_rating : '',
            }));
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(rows);
            ws['!cols'] = [{ wch: 12 }, { wch: 32 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 10 }];
            XLSX.utils.book_append_sheet(wb, ws, 'RS Matrix');
            XLSX.writeFile(wb, `RS_Matrix_${dateStr}.xlsx`);
        } catch (err) {
            console.error('Export Excel error:', err);
        } finally {
            setExporting(false);
        }
    };

    const exportCsv = () => {
        setDropdownOpen(false);
        const headers = ['Symbol', 'Company', 'RS_Rating', 'Prev_RS', 'Category', 'Change'];
        const rows = filteredStocks.map(s => [
            s.symbol,
            `"${(s.company_name || s.symbol).replace(/"/g, '""')}"`,
            s.rs_rating,
            s.prev_rs_rating ?? '',
            getCategory(s.rs_rating),
            s.prev_rs_rating ? s.rs_rating - s.prev_rs_rating : '',
        ].join(','));
        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        download(url, `RS_Matrix_${dateStr}.csv`);
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-[#f5f5f5]">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <div className="text-gray-600">Loading Matrix...</div>
            </div>
        </div>
    );

    const menuItems = [
        { label: 'Image (.png)', action: exportImage },
        { label: 'PDF', action: exportPdf },
        { label: 'Excel (.xlsx)', action: exportExcel },
        { label: 'CSV', action: exportCsv },
    ];

    return (
        <div className="min-h-screen bg-[#f5f5f5] font-sans text-[#333]">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-[#1e222d] px-5 py-3 border-b border-[#2a2e39] flex justify-between items-center shadow-md">
                <h1 className="text-white text-[1.3rem] font-bold m-0">RS Matrix Cards</h1>

                {/* Export Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setDropdownOpen(prev => !prev)}
                        disabled={exporting}
                        className="flex items-center gap-2 bg-[#2962ff] hover:bg-[#1e4fd8] disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-[0.9rem] font-semibold shadow-lg transition-all"
                    >
                        {exporting ? (
                            <>
                                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                                Exporting...
                            </>
                        ) : (
                            <>
                                Export
                                <svg
                                    className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </>
                        )}
                    </button>

                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden z-50">
                            {menuItems.map((item) => (
                                <button
                                    key={item.label}
                                    onClick={item.action}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-[0.88rem] text-gray-700 hover:bg-gray-50 transition-colors text-left"
                                >
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Container with Scroll */}
            <div className="h-[calc(100vh-76px)] overflow-y-auto">
                <div className="flex flex-col xl:flex-row items-start justify-between gap-[15px] p-[20px_15px] w-full">
                    <MatrixCard title="STRONG" range=">= 90" variant="strong" arrow="↑" list={strong} total={total} />
                    <MatrixCard title="IMPROVE" range="80 - 89" variant="improve" arrow="↗" list={improve} total={total} />
                    <MatrixCard title="NEUTRAL" range="70 - 79" variant="neutral" arrow="→" list={neutral} total={total} />
                    <MatrixCard title="WEAK" range="< 70" variant="weak" arrow="↓" list={weak} total={total} />
                </div>
            </div>
        </div>
    );
}

function MatrixCard({ title, range, variant, arrow, list, total }: any) {
    const percentage = total > 0 ? ((list.length / total) * 100).toFixed(1) : '0';

    const styles: any = {
        strong: { headerBg: 'bg-gradient-to-br from-[#e8f5e9] to-[#c8e6c9]', headerText: 'text-[#1b5e20]', dot: 'bg-[#1b5e20]' },
        improve: { headerBg: 'bg-gradient-to-br from-[#e1f5fe] to-[#b3e5fc]', headerText: 'text-[#01579b]', dot: 'bg-[#01579b]' },
        neutral: { headerBg: 'bg-gradient-to-br from-[#fff3e0] to-[#ffe0b2]', headerText: 'text-[#e65100]', dot: 'bg-[#e65100]' },
        weak: { headerBg: 'bg-gradient-to-br from-[#ffebee] to-[#ffcdd2]', headerText: 'text-[#b71c1c]', dot: 'bg-[#b71c1c]' },
    };
    const s = styles[variant];

    return (
        <div className="flex-1 min-w-[100%] xl:min-w-[280px] bg-white rounded-xl shadow-md border border-black/5 flex flex-col overflow-hidden transition-all hover:shadow-xl max-h-[80vh]">
            <div className={`p-5 flex justify-between items-center ${s.headerBg} ${s.headerText} flex-shrink-0`}>
                <div>
                    <div className="text-[1.4rem] font-extrabold">{title}</div>
                    <div className="text-xs font-semibold opacity-80">{range}</div>
                </div>
                <div className="flex flex-col items-end">
                    <div className="text-[1.8rem] font-bold leading-none">{percentage}%</div>
                    <div className="text-[0.85rem] opacity-70">{list.length} stocks</div>
                </div>
                <div className="text-[2rem] ml-2">{arrow}</div>
            </div>

            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto min-h-0 p-3">
                <div className="grid grid-cols-1 gap-2 content-start">
                    {list.map((item: any) => {
                        const currentCat = getCategory(item.rs_rating);
                        const prevCat = item.prev_rs_rating ? getCategory(item.prev_rs_rating) : null;
                        const categories = ['WEAK', 'NEUTRAL', 'IMPROVE', 'STRONG'];
                        const currIdx = categories.indexOf(currentCat);
                        const prevIdx = prevCat ? categories.indexOf(prevCat) : -1;

                        let movement = null;
                        if (prevCat && currentCat !== prevCat) {
                            movement = currIdx > prevIdx
                                ? { arrow: '↑', color: 'text-green-600', badgeClass: 'bg-[#00c853] text-white', from: prevCat }
                                : { arrow: '↓', color: 'text-red-600', badgeClass: 'bg-[#d50000] text-white', from: prevCat };
                        }

                        return (
                            <div key={item.symbol} className="flex items-center gap-2 px-2.5 py-2 rounded-md bg-[#f8f9fa] border border-[#e9ecef] hover:border-[#2962ff] transition-all">
                                <div className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`}></div>
                                <div className="stock-name-cell flex-1 text-[0.85rem] font-medium text-[#333] leading-tight break-words min-w-0 flex items-center gap-1">
                                    <span className="truncate">{item.company_name || item.symbol}</span>
                                    {item.prev_rs_rating && item.prev_rs_rating < item.rs_rating && (
                                        <div className="relative group inline-block flex-shrink-0">
                                            <span className="text-green-600 text-sm font-bold cursor-help">↑</span>
                                            <div className="absolute bottom-full left-0 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                Previous: {item.prev_rs_rating}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    {movement && (
                                        <div className="flex items-center gap-1">
                                            <span className={`text-[0.65rem] px-1.5 py-0.5 rounded font-bold whitespace-nowrap uppercase ${movement.badgeClass}`}>
                                                From {movement.from}
                                            </span>
                                            <span className={`text-base font-bold ${movement.color}`}>{movement.arrow}</span>
                                        </div>
                                    )}
                                    <div className="text-[0.8rem] font-bold text-[#666] bg-white px-2 py-1 rounded shadow-sm">
                                        {item.rs_rating}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}