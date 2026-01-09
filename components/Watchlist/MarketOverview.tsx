'use client';

import { useEffect, useState } from 'react';

interface StockRS {
    symbol: string;
    company_name?: string;
    rs_rating: number;
    rank_3m: number;
    rank_6m: number;
    rank_9m: number;
    rank_12m: number;
    industry_group?: string;
}

export default function MarketOverview() {
    const [stocks, setStocks] = useState<StockRS[]>([]);
    const [filteredStocks, setFilteredStocks] = useState<StockRS[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (!search) {
            setFilteredStocks(stocks);
        } else {
            const q = search.toLowerCase();
            const filtered = stocks.filter(s =>
                s.symbol.toLowerCase().includes(q) ||
                (s.company_name && s.company_name.toLowerCase().includes(q))
            );
            setFilteredStocks(filtered);
        }
    }, [search, stocks]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${API_URL}/api/rs/latest?limit=500`, { headers });

            if (!res.ok) {
                console.error(`Fetch error: ${res.status} ${res.statusText}`);
                if (res.status === 401) console.error("Unauthorized - Check token");
                return;
            }

            const data = await res.json();
            if (data.data) {
                setStocks(data.data);
                setFilteredStocks(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch data', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-[#d1d4dc]">Loading Market Overview...</div>;

    return (
        <div className="p-6 bg-[#131722]" style={{ minHeight: '600px' }}>
            <div className="bg-[#1e222d] rounded-lg shadow-lg overflow-hidden flex flex-col h-full">
                <div className="p-6 border-b border-[#2a2e39] flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">Saudi Market RS Analysis</h2>
                        <p className="text-[#787b86]">Relative Strength Rating · Data Table</p>
                    </div>
                    <div>
                        <input
                            type="text"
                            placeholder="Search..."
                            className="bg-[#2a2e39] text-white px-4 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#2a2e39] text-[#787b86] text-sm uppercase sticky top-0">
                                <th className="p-4 font-semibold border-b border-[#363c4e]">Symbol</th>
                                <th className="p-4 font-semibold border-b border-[#363c4e]">Company</th>
                                <th className="p-4 font-semibold border-b border-[#363c4e]">Industry</th>
                                <th className="p-4 font-semibold border-b border-[#363c4e] text-center cursor-pointer" title="Sort by RS">RS Rating</th>
                                <th className="p-4 font-semibold border-b border-[#363c4e] text-center">3M Rank</th>
                                <th className="p-4 font-semibold border-b border-[#363c4e] text-center">6M Rank</th>
                                <th className="p-4 font-semibold border-b border-[#363c4e] text-center">12M Rank</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2a2e39]">
                            {filteredStocks.map((stock) => (
                                <tr key={stock.symbol} className="hover:bg-[#2a2e39] transition-colors text-[#d1d4dc]">
                                    <td className="p-4 font-medium text-white">{stock.symbol}</td>
                                    <td className="p-4">{stock.company_name || '-'}</td>
                                    <td className="p-4 text-[#787b86]">{stock.industry_group || '-'}</td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2 py-1 rounded font-bold text-xs ${getRSColor(stock.rs_rating)} text-white inline-block min-w-[30px]`}>
                                            {stock.rs_rating}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">{stock.rank_3m}</td>
                                    <td className="p-4 text-center">{stock.rank_6m}</td>
                                    <td className="p-4 text-center">{stock.rank_12m}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 text-xs text-[#787b86] border-t border-[#2a2e39]">
                    Showing {filteredStocks.length} stocks
                </div>
            </div>
        </div>
    );
}

function getRSColor(val: number) {
    if (val >= 90) return 'bg-emerald-600';
    if (val >= 80) return 'bg-blue-600';
    if (val >= 70) return 'bg-orange-600';
    return 'bg-red-600';
}
