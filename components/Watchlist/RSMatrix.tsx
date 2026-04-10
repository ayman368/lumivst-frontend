'use client';

import { useEffect, useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { API_BASE_URL } from '@/lib/api/config';

interface StockRS {
    symbol: string;
    company_name?: string;
    rs_rating: number;
    prev_rs_rating?: number;

}

// Helper to get category
const getCategory = (rs: number) => {
    if (rs >= 90) return 'STRONG';
    if (rs >= 80) return 'IMPROVE';
    if (rs >= 70) return 'NEUTRAL';
    return 'WEAK';
};

export default function RSMatrix() {
    const [stocks, setStocks] = useState<StockRS[]>([]);
    const [loading, setLoading] = useState(true);
    const [capturing, setCapturing] = useState(false);

    // مرجع للحاوية التي سيتم تصويرها
    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const API_URL = API_BASE_URL;
            const res = await fetch(`${API_URL}/api/rs/latest?limit=500`, { credentials: 'include' });

            if (!res.ok) {
                console.error(`Fetch error: ${res.status}`);
                return;
            }

            const data = await res.json();
            if (data.data) {
                setStocks(data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const captureImage = async () => {
        if (!printRef.current) return;

        setCapturing(true);

        // ننتظر 500ms للتأكد من استقرار الخطوط وإلغاء الـ Scroll
        setTimeout(async () => {
            try {
                const canvas = await html2canvas(printRef.current!, {
                    scale: 3, // جودة فائقة لضمان وضوح النصوص الصغيرة
                    backgroundColor: '#f5f5f5',
                    useCORS: true,
                    logging: false,
                    allowTaint: true,
                    // ضمان التقاط المساحة الكاملة للمحتوى
                    width: printRef.current!.scrollWidth,
                    height: printRef.current!.scrollHeight,
                    windowWidth: printRef.current!.scrollWidth,
                    windowHeight: printRef.current!.scrollHeight,
                    onclone: (clonedDoc) => {
                        // تعديل يدوي داخل نسخة التصوير لضمان ظهور الأسماء
                        const names = clonedDoc.querySelectorAll('.stock-name-cell');
                        names.forEach((el: any) => {
                            el.style.whiteSpace = 'normal';
                            el.style.overflow = 'visible';
                            el.style.textOverflow = 'clip';
                        });
                    }
                });

                const link = document.createElement('a');
                link.download = `RS_Matrix_${new Date().toISOString().slice(0, 10)}.png`;
                link.href = canvas.toDataURL('image/png', 1.0);
                link.click();
            } catch (err) {
                console.error('Capture failed:', err);
            } finally {
                setCapturing(false);
            }
        }, 500);
    };

    // تقسيم الأسهم بناءً على التقييم
    const strong = stocks.filter(s => s.rs_rating >= 90).sort((a, b) => b.rs_rating - a.rs_rating);
    const improve = stocks.filter(s => s.rs_rating >= 80 && s.rs_rating < 90).sort((a, b) => b.rs_rating - a.rs_rating);
    const neutral = stocks.filter(s => s.rs_rating >= 70 && s.rs_rating < 80).sort((a, b) => b.rs_rating - a.rs_rating);
    const weak = stocks.filter(s => s.rs_rating < 70).sort((a, b) => b.rs_rating - a.rs_rating);

    const total = stocks.length;

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-[#f5f5f5]">
            Loading Matrix...
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f5f5f5] font-sans text-[#333]">
            {/* Styles لمعالجة مشاكل التصوير */}
            <style jsx global>{`
                @media screen {
                    .capturing-now .card-body-container {
                        max-height: none !important;
                        overflow: visible !important;
                    }
                    .capturing-now {
                        width: 1440px !important; /* تثبيت العرض أثناء التصوير لضمان التنسيق */
                    }
                }
            `}</style>

            {/* Header */}
            <div className="sticky top-0 z-50 bg-[#1e222d] px-5 py-3 border-b border-[#2a2e39] flex justify-between items-center shadow-md">
                <h1 className="text-white text-[1.3rem] font-bold m-0"> RS Matrix Cards</h1>

                <div className="flex gap-2 bg-white/5 p-1 rounded-lg">
                    <button
                        onClick={captureImage}
                        disabled={capturing}
                        className={`${capturing ? 'bg-gray-600' : 'bg-[#4caf50] hover:bg-[#43a047]'} text-white px-4 py-2 rounded-md text-[0.9rem] font-medium transition-all flex items-center gap-2 shadow-lg`}
                    >
                        {capturing ? 'Capturing...' : '📸 Save Image'}
                    </button>

                </div>
            </div>

            {/* Main Container */}
            <div
                ref={printRef}
                className={`flex flex-col xl:flex-row items-start justify-between gap-[15px] p-[20px_15px] w-full min-h-[calc(100vh-60px)] h-auto ${capturing ? 'capturing-now' : ''}`}
            >
                <MatrixCard title="STRONG" range=">= 90" variant="strong" arrow="↑" list={strong} total={total} />
                <MatrixCard title="IMPROVE" range="80 - 89" variant="improve" arrow="↗" list={improve} total={total} />
                <MatrixCard title="NEUTRAL" range="70 - 79" variant="neutral" arrow="→" list={neutral} total={total} />
                <MatrixCard title="WEAK" range="< 70" variant="weak" arrow="↓" list={weak} total={total} />
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
        weak: { headerBg: 'bg-gradient-to-br from-[#ffebee] to-[#ffcdd2]', headerText: 'text-[#b71c1c]', dot: 'bg-[#b71c1c]' }
    };

    const s = styles[variant];

    return (
        <div className="flex-1 min-w-[100%] xl:min-w-[280px] bg-white rounded-xl shadow-md border border-black/5 flex flex-col overflow-hidden transition-all hover:shadow-xl">
            {/* Header */}
            <div className={`p-5 flex justify-between items-center ${s.headerBg} ${s.headerText}`}>
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

            {/* Body */}
            <div className="card-body-container flex-1 p-3 grid grid-cols-1 gap-2 content-start overflow-y-auto max-h-[750px]
                [&::-webkit-scrollbar]:w-[6px]
                [&::-webkit-scrollbar-track]:bg-black/5
                [&::-webkit-scrollbar-thumb]:bg-black/20
                [&::-webkit-scrollbar-thumb]:rounded-full
            ">
                {list.map((item: any) => {
                    const currentCat = getCategory(item.rs_rating);
                    const prevCat = item.prev_rs_rating ? getCategory(item.prev_rs_rating) : null;

                    const categories = ['WEAK', 'NEUTRAL', 'IMPROVE', 'STRONG'];
                    const currIdx = categories.indexOf(currentCat);
                    const prevIdx = prevCat ? categories.indexOf(prevCat) : -1;

                    let movement = null;
                    if (prevCat && currentCat !== prevCat) {
                        if (currIdx > prevIdx) {
                            movement = { arrow: '↑', color: 'text-green-600', badgeClass: 'bg-[#00c853] text-white', from: prevCat };
                        } else {
                            movement = { arrow: '↓', color: 'text-red-600', badgeClass: 'bg-[#d50000] text-white', from: prevCat };
                        }
                    }

                    return (
                        <div
                            key={item.symbol}
                            className="flex items-center gap-2 px-2.5 py-2 rounded-md bg-[#f8f9fa] border border-[#e9ecef] hover:border-[#2962ff] transition-all"
                        >
                            <div className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`}></div>
                            <div className={`stock-name-cell flex-1 text-[0.85rem] font-medium text-[#333] leading-tight break-words min-w-0`}>
                                {item.company_name || item.symbol}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                <div className="text-[0.8rem] font-bold text-[#666] bg-white px-2 py-1 rounded shadow-sm">
                                    {item.rs_rating}
                                </div>
                                {movement && (
                                    <div className="flex items-center gap-1">
                                        <span className={`text-base font-bold ${movement.color}`}>{movement.arrow}</span>
                                        <span className={`text-[0.65rem] px-1.5 py-0.5 rounded font-bold whitespace-nowrap uppercase ${movement.badgeClass}`}>
                                            From {movement.from}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}