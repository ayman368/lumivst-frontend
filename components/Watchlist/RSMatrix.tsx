'use client';

import { useEffect, useState } from 'react';

interface StockRS {
    symbol: string;
    company_name?: string;
    rs_rating: number;
}

export default function RSMatrix() {
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

    if (loading) return <div className="p-8 text-center text-[#d1d4dc]">Loading Matrix...</div>;

    // Group stocks
    const strong = stocks.filter(s => s.rs_rating >= 90).sort((a, b) => b.rs_rating - a.rs_rating);
    const improve = stocks.filter(s => s.rs_rating >= 80 && s.rs_rating < 90).sort((a, b) => b.rs_rating - a.rs_rating);
    const neutral = stocks.filter(s => s.rs_rating >= 70 && s.rs_rating < 80).sort((a, b) => b.rs_rating - a.rs_rating);
    const weak = stocks.filter(s => s.rs_rating < 70).sort((a, b) => b.rs_rating - a.rs_rating);

    const total = stocks.length;

    return (
        <div className="p-6 bg-[#131722] flex flex-col" style={{ minHeight: '600px' }}>
            <div className="flex items-center justify-between mb-4 shrink-0">
                <h2 className="text-xl font-bold text-white">💠 RS Matrix Cards</h2>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row gap-4 overflow-hidden">
                <MatrixCard title="STRONG" range=">= 90" colorClass="emerald" arrow="↑" list={strong} total={total} />
                <MatrixCard title="IMPROVE" range="80 - 89" colorClass="blue" arrow="↗" list={improve} total={total} />
                <MatrixCard title="NEUTRAL" range="70 - 79" colorClass="orange" arrow="→" list={neutral} total={total} />
                <MatrixCard title="WEAK" range="< 70" colorClass="red" arrow="↓" list={weak} total={total} />
            </div>
        </div>
    );
}

function MatrixCard({ title, range, colorClass, arrow, list, total }: any) {
    const percentage = total > 0 ? ((list.length / total) * 100).toFixed(1) : '0';

    const headerBgMap: any = {
        emerald: 'bg-emerald-900/30 text-emerald-400 border-emerald-800',
        blue: 'bg-blue-900/30 text-blue-400 border-blue-800',
        orange: 'bg-orange-900/30 text-orange-400 border-orange-800',
        red: 'bg-red-900/30 text-red-400 border-red-800'
    };

    const dotColorMap: any = {
        emerald: 'bg-emerald-500',
        blue: 'bg-blue-500',
        orange: 'bg-orange-500',
        red: 'bg-red-500'
    };

    return (
        <div className="flex-1 bg-[#1e222d] rounded-lg border border-[#2a2e39] flex flex-col min-w-[280px] overflow-hidden">
            <div className={`p-4 border-b flex justify-between items-center ${headerBgMap[colorClass]} shrink-0`}>
                <div>
                    <div className="font-bold text-lg">{title}</div>
                    <div className="text-xs opacity-75">{range}</div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold">{percentage}%</div>
                    <div className="text-xs opacity-75">{list.length} stocks</div>
                </div>
                <div className="text-3xl opacity-50">{arrow}</div>
            </div>

            <div className="flex-1 p-3 overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 gap-2">
                    {list.map((s: any) => (
                        <div key={s.symbol} className="flex items-center gap-2 p-2 bg-[#2a2e39] rounded hover:bg-[#363c4e] transition-colors cursor-default group">
                            <div className={`w-2 h-2 rounded-full ${dotColorMap[colorClass]} shrink-0`}></div>
                            <div className="flex-1 truncate text-sm text-[#d1d4dc] font-medium" title={s.company_name}>
                                {s.company_name || s.symbol}
                            </div>
                            <div className="text-xs font-bold text-[#787b86] bg-[#131722] px-1.5 py-0.5 rounded shrink-0">
                                {s.rs_rating}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
