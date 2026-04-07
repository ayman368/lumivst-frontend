'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import html2canvas from 'html2canvas'; // 1. استيراد المكتبة

interface StockRS {
    symbol: string;
    company_name?: string;
    Company?: string;
    rs_rating: number;
    RS?: number;
    prev_rs_rating?: number;
}

// Helper to get category
const getCategory = (rs: number) => {
    if (rs >= 90) return 'STRONG';
    if (rs >= 80) return 'IMPROVE';
    if (rs >= 70) return 'NEUTRAL';
    return 'WEAK';
};

export default function MatrixChart() {
    const [stocks, setStocks] = useState<StockRS[]>([]);
    const [loading, setLoading] = useState(true);
    const [gridStyles, setGridStyles] = useState({ col1: '50%', col2: '50%', row1: '50%', row2: '50%' });
    const [hoveredStock, setHoveredStock] = useState<{ stock: StockRS; x: number; y: number; movedFrom?: string } | null>(null);
    const [iscapturing, setIsCapturing] = useState(false); // لحالة الزر أثناء التصوير

    const chartRef = useRef<HTMLDivElement>(null); // 2. مرجع للعنصر المراد تصويره
    const router = useRouter();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${API_URL}/api/rs/latest?limit=500`, { credentials: 'include' });

            if (!res.ok) return;

            const data = await res.json();
            if (data.data) {
                const normalized = data.data.map((s: any) => ({
                    ...s,
                    rs_rating: s.rs_rating ?? s.RS ?? 0,
                    prev_rs_rating: s.prev_rs_rating,
                    company_name: s.company_name ?? s.Company ?? s.symbol
                }));
                setStocks(normalized);
                calculateGridDimensions(normalized);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // دالة التقاط الصورة
    const captureImage = async () => {
        if (!chartRef.current) return;

        setIsCapturing(true);
        try {
            // ننتظر قليلاً للتأكد من اختفاء أي Tooltip أو تأثيرات حركية
            const canvas = await html2canvas(chartRef.current, {
                useCORS: true, // للسماح بالصور من روابط خارجية إذا وجدت
                backgroundColor: "#ffffff",
                scale: 2, // جودة أعلى (Retina)
            });

            const link = document.createElement('a');
            link.download = `RS_Matrix_${new Date().toISOString().slice(0, 10)}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error("Failed to capture image:", err);
        } finally {
            setIsCapturing(false);
        }
    };

    // تقسيم البيانات
    const strong = stocks.filter(s => s.rs_rating >= 90).sort((a, b) => b.rs_rating - a.rs_rating);
    const improve = stocks.filter(s => s.rs_rating >= 80 && s.rs_rating < 90).sort((a, b) => b.rs_rating - a.rs_rating);
    const neutral = stocks.filter(s => s.rs_rating >= 70 && s.rs_rating < 80).sort((a, b) => b.rs_rating - a.rs_rating);
    const weak = stocks.filter(s => s.rs_rating < 70).sort((a, b) => b.rs_rating - a.rs_rating);

    const calculateGridDimensions = (allStocks: StockRS[]) => {
        const nStrong = allStocks.filter(s => s.rs_rating >= 90).length;
        const nImprove = allStocks.filter(s => s.rs_rating >= 80 && s.rs_rating < 90).length;
        const nNeutral = allStocks.filter(s => s.rs_rating >= 70 && s.rs_rating < 80).length;
        const nWeak = allStocks.filter(s => s.rs_rating < 70).length;

        const total = nStrong + nImprove + nNeutral + nWeak || 1;
        const leftCount = nNeutral + nWeak;
        let col1Pct = (leftCount / total) * 100;
        col1Pct = Math.max(20, Math.min(70, col1Pct)) * 0.85;
        const col2Pct = 100 - col1Pct;

        const topCount = nNeutral + nStrong;
        let row1Pct = (topCount / total) * 100;
        row1Pct = Math.max(25, Math.min(75, row1Pct * 1.15));
        const row2Pct = 100 - row1Pct;

        setGridStyles({
            col1: `${col1Pct}%`,
            col2: `${col2Pct}%`,
            row1: `${row1Pct}%`,
            row2: `${row2Pct}%`
        });
    };

    if (loading) return <div className="h-screen flex items-center justify-center bg-white text-black">Loading Matrix Chart...</div>;

    const totalCount = stocks.length || 1;
    const getPct = (count: number) => ((count / totalCount) * 100).toFixed(1) + '%';

    return (
        /* أضفنا الـ ref هنا ليشمل الهيدر والمصفوفة معاً */
        <div ref={chartRef} className="h-screen flex flex-col bg-white overflow-hidden font-sans text-[#333]">
            <header className="h-[60px] bg-[#1e222d] border-b border-[#2a2e39] flex items-center justify-between px-5 shrink-0 z-50">
                <h1 className="text-white text-[1.3rem] font-bold"> RS Matrix Chart</h1>
                <div className="flex gap-2 bg-white/5 p-1 rounded-lg">

                    {/* زر حفظ الصورة الجديد */}
                    <button
                        onClick={captureImage}
                        disabled={iscapturing}
                        className="bg-[#4caf50] text-white px-4 py-2 rounded-md text-[0.9rem] font-medium shadow-lg hover:bg-[#43a047] transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                        {iscapturing ? ' Capturing...' : ' Save Image'}
                    </button>
                </div>
            </header>

            <main
                className="flex-1 grid w-full bg-white transition-all duration-500 ease-in-out"
                style={{
                    gridTemplateColumns: `${gridStyles.col1} ${gridStyles.col2}`,
                    gridTemplateRows: `${gridStyles.row1} ${gridStyles.row2}`
                }}
            >
                <Quadrant
                    id="q-neutral"
                    title="NEUTRAL (70 - 79)"
                    watermark="NEUTRAL"
                    list={neutral}
                    bgColor="#fff3e0"
                    percentage={getPct(neutral.length)}
                    dotColor="#e65100"
                    onHover={setHoveredStock}
                    onLeave={() => setHoveredStock(null)}
                    router={router}
                />

                <Quadrant
                    id="q-strong"
                    title="STRONG (>= 90)"
                    watermark="STRONG"
                    list={strong}
                    bgColor="#e8f5e9"
                    percentage={getPct(strong.length)}
                    dotColor="#2e7d32"
                    onHover={setHoveredStock}
                    onLeave={() => setHoveredStock(null)}
                    router={router}
                />

                <Quadrant
                    id="q-weak"
                    title="WEAK (< 70)"
                    watermark="WEAK"
                    list={weak}
                    bgColor="#ffcdd2"
                    percentage={getPct(weak.length)}
                    dotColor="#c62828"
                    onHover={setHoveredStock}
                    onLeave={() => setHoveredStock(null)}
                    router={router}
                />

                <Quadrant
                    id="q-improve"
                    title="IMPROVE (80 - 89)"
                    watermark="IMPROVE"
                    list={improve}
                    bgColor="#e1f5fe"
                    percentage={getPct(improve.length)}
                    dotColor="#0277bd"
                    onHover={setHoveredStock}
                    onLeave={() => setHoveredStock(null)}
                    router={router}
                />
            </main>

            {/* Custom Tooltip - لن يظهر في الصورة لأنه خارج الـ chartRef أو يتم التقاطه بسرعة */}
            {hoveredStock && !iscapturing && (
                <div
                    className="fixed z-[10000] bg-black/90 text-white px-3 py-2 rounded shadow-2xl text-[0.8rem] pointer-events-none whitespace-nowrap border border-white/20"
                    style={{
                        left: hoveredStock.x + 15,
                        top: hoveredStock.y + 15
                    }}
                >
                    <div className="font-bold border-b border-white/10 pb-1 mb-1">{hoveredStock.stock.company_name} <span className="font-normal opacity-75">({hoveredStock.stock.symbol})</span></div>
                    <div>Current RS: <span className="font-bold text-yellow-400">{hoveredStock.stock.rs_rating}</span></div>
                    {hoveredStock.movedFrom && (
                        <div className="mt-1 flex items-center gap-1.5 font-bold text-blue-400 italic">
                            <span>★</span> Moved From {hoveredStock.movedFrom}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ... كود مكون Quadrant يبقى كما هو ...
interface QuadrantProps {
    id: string;
    title: string;
    watermark: string;
    list: StockRS[];
    bgColor: string;
    percentage: string;
    dotColor: string;
    onHover: (data: { stock: StockRS; x: number; y: number; movedFrom?: string }) => void;
    onLeave: () => void;
    router: any;
}

function Quadrant({ id, title, watermark, list, bgColor, percentage, dotColor, onHover, onLeave, router }: QuadrantProps) {
    return (
        <div
            id={id}
            className="relative p-[25px_15px_15px_15px] overflow-y-auto overflow-x-hidden flex flex-wrap content-start border border-black/[0.08]"
            style={{ backgroundColor: bgColor }}
        >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[3rem] font-[900] uppercase text-black/10 pointer-events-none z-0 text-center leading-[1.2]">
                {watermark}
            </div>

            <div className="absolute top-[5px] left-[8px] text-[0.85rem] opacity-80 font-bold z-10 bg-white/60 px-2 py-[2px] rounded text-black shadow-sm">
                {title} <span className="font-normal ml-[5px]">{percentage}</span>
            </div>

            {list.map((stock) => {
                const currentCat = getCategory(stock.rs_rating);
                const prevCat = stock.prev_rs_rating ? getCategory(stock.prev_rs_rating) : null;

                const categories = ['WEAK', 'NEUTRAL', 'IMPROVE', 'STRONG'];
                const currIdx = categories.indexOf(currentCat);
                const prevIdx = prevCat ? categories.indexOf(prevCat) : -1;

                let arrow = null;
                if (prevCat && currentCat !== prevCat) {
                    if (currIdx > prevIdx) {
                        arrow = <span className="text-[0.75rem] ml-1 font-bold text-green-700">↑</span>;
                    } else {
                        arrow = <span className="text-[0.75rem] ml-1 font-bold text-red-700">↓</span>;
                    }
                }

                return (
                    <div
                        key={stock.symbol}
                        className={`inline-flex items-center bg-transparent px-2 py-1 m-[2px] text-[0.7rem] font-semibold cursor-pointer z-[5] transition-transform duration-100 hover:scale-110 hover:z-[100] hover:bg-white hover:shadow-md hover:rounded whitespace-nowrap max-w-[140px] overflow-hidden ${arrow ? (arrow.props.children === '↑' ? 'text-green-700' : 'text-red-700') : 'text-[#222]'}`}
                        onMouseEnter={(e) => onHover({ stock, x: e.clientX, y: e.clientY, movedFrom: prevCat || undefined })}
                        onMouseMove={(e) => onHover({ stock, x: e.clientX, y: e.clientY, movedFrom: prevCat || undefined })}
                        onMouseLeave={onLeave}
                        onClick={() => router.push(`/stocks/${stock.symbol.replace(/\D/g, '')}/financials`)}
                    >
                        <div
                            className="w-[6px] h-[6px] rounded-full mr-[6px] shrink-0"
                            style={{ backgroundColor: dotColor }}
                        />
                        {stock.company_name || stock.symbol}
                        {arrow}
                    </div>
                );
            })}
        </div>
    );
}