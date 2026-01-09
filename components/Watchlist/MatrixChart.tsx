'use client';

import { useEffect, useState } from 'react';

interface StockRS {
    symbol: string;
    company_name?: string;
    rs_rating: number;
}

export default function MatrixChart() {
    const [stocks, setStocks] = useState<StockRS[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${API_URL}/api/rs/latest?limit=500`, { headers });

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

    if (loading) return <div className="p-8 text-center text-[#d1d4dc]">Loading Chart...</div>;

    // Group stocks
    const strong = stocks.filter(s => s.rs_rating >= 90).sort((a, b) => b.rs_rating - a.rs_rating);
    const improve = stocks.filter(s => s.rs_rating >= 80 && s.rs_rating < 90).sort((a, b) => b.rs_rating - a.rs_rating);
    const neutral = stocks.filter(s => s.rs_rating >= 70 && s.rs_rating < 80).sort((a, b) => b.rs_rating - a.rs_rating);
    const weak = stocks.filter(s => s.rs_rating < 70).sort((a, b) => b.rs_rating - a.rs_rating);

    // Dynamic Grid Sizing Calculation (Same logic as original JS)
    const nStrong = strong.length;
    const nImprove = improve.length;
    const nNeutral = neutral.length;
    const nWeak = weak.length;
    const total = nStrong + nImprove + nNeutral + nWeak || 1;

    // Width Calculation (Left Col: Neutral+Weak, Right Col: Strong+Improve)
    const col1Weight = nNeutral + nWeak;
    let col1Pct = (col1Weight / total) * 100;
    col1Pct = Math.max(15, Math.min(85, col1Pct));
    col1Pct = col1Pct * 0.85; // Shift divider left
    const col2Pct = 100 - col1Pct;

    // Height Calculation (Top Row: Neutral+Strong, Bottom Row: Weak+Improve)
    const row1Weight = nNeutral + nStrong;
    let row1Pct = (row1Weight / total) * 100;
    row1Pct = Math.max(15, Math.min(85, row1Pct));
    row1Pct = row1Pct * 1.15; // Shift divider down
    row1Pct = Math.min(85, row1Pct);
    const row2Pct = 100 - row1Pct;

    const gridStyle = {
        gridTemplateColumns: `${col1Pct}% ${col2Pct}%`,
        gridTemplateRows: `${row1Pct}% ${row2Pct}%`
    };

    return (
        <div className="w-full bg-white text-black flex flex-col" style={{ minHeight: '600px', maxHeight: '800px' }}>
            <div className="bg-[#1e222d] text-white p-3 px-6 flex justify-between items-center shrink-0 border-b border-[#2a2e39]">
                <h1 className="text-lg font-bold">💠 RS Matrix Chart</h1>
                <div className="text-xs text-[#787b86]">Dynamic Heatmap</div>
            </div>

            <div className="flex-1 grid w-full h-full transition-all duration-500 ease-in-out" style={gridStyle}>
                {/* Top Left: NEUTRAL */}
                <Quadrant id="neutral" title="NEUTRAL (70-79)" bg="bg-orange-50" label="NEUTRAL" list={neutral} dotColor="bg-orange-600" />

                {/* Top Right: STRONG */}
                <Quadrant id="strong" title="STRONG (>=90)" bg="bg-emerald-50" label="STRONG" list={strong} dotColor="bg-emerald-700" />

                {/* Bottom Left: WEAK */}
                <Quadrant id="weak" title="WEAK (<70)" bg="bg-red-50" label="WEAK" list={weak} dotColor="bg-red-700" />

                {/* Bottom Right: IMPROVE */}
                <Quadrant id="improve" title="IMPROVE (80-89)" bg="bg-blue-50" label="IMPROVE" list={improve} dotColor="bg-blue-600" />
            </div>
        </div>
    );
}

function Quadrant({ title, bg, label, list, dotColor }: any) {
    const total = list.length;

    return (
        <div className={`relative p-4 border border-gray-200 overflow-hidden flex flex-col ${bg}`}>
            {/* Background Label */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl lg:text-9xl font-black text-black/5 pointer-events-none select-none">
                {label}
            </div>

            {/* Info Badge */}
            <div className="absolute top-2 left-2 bg-white/90 px-2 py-1 rounded text-xs font-bold shadow-sm z-10 text-gray-800 border border-gray-100">
                {title} <span className="font-normal ml-1 text-gray-500">{total}</span>
            </div>

            {/* Content */}
            <div className="mt-8 flex content-start flex-wrap gap-1 overflow-y-auto z-10 h-full w-full custom-scrollbar pr-2">
                {list.map((s: any) => (
                    <div key={s.symbol}
                        className="inline-flex items-center px-1.5 py-0.5 bg-transparent hover:bg-white hover:shadow-md hover:scale-110 rounded transition-all cursor-pointer text-[10px] font-semibold text-gray-800 border border-transparent hover:border-gray-200 shrink-0 max-w-[120px]"
                        title={`${s.company_name} (RS: ${s.rs_rating})`}
                    >
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotColor} shrink-0`}></span>
                        <span className="truncate">{s.company_name || s.symbol}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
