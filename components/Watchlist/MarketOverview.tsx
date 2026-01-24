'use client';

import { useEffect, useState, useMemo } from 'react';

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

type SortKey = keyof StockRS;
type SortDirection = 'asc' | 'desc';

export default function MarketOverview() {
    const [stocks, setStocks] = useState<StockRS[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sortConfig, setSortConfig] = useState<{
        key: SortKey;
        direction: SortDirection;
    }>({ key: 'rs_rating', direction: 'desc' });

    // Fetch data
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
            console.error('Failed to fetch data', err);
        } finally {
            setLoading(false);
        }
    };

    // Filter and sort
    const filteredAndSortedStocks = useMemo(() => {
        let result = stocks.filter(stock => {
            if (!search) return true;
            const searchLower = search.toLowerCase();
            return (
                stock.symbol.toLowerCase().includes(searchLower) ||
                (stock.company_name && stock.company_name.toLowerCase().includes(searchLower)) ||
                (stock.industry_group && stock.industry_group.toLowerCase().includes(searchLower))
            );
        });

        result.sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];
            if (aValue === undefined || aValue === null) return 1;
            if (bValue === undefined || bValue === null) return -1;

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortConfig.direction === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortConfig.direction === 'asc'
                    ? aValue - bValue
                    : bValue - aValue;
            }
            return 0;
        });

        return result;
    }, [stocks, search, sortConfig]);

    const handleSort = (key: SortKey) => {
        setSortConfig(prev => {
            if (prev.key === key) {
                return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
            } else {
                const isStringKey = ['symbol', 'company_name', 'industry_group'].includes(key);
                return { key, direction: isStringKey ? 'asc' : 'desc' };
            }
        });
    };

    // --- وظيفة تصدير الملف CSV ---
    const exportToCSV = () => {
        // العناوين
        const headers = ["Symbol", "Company", "Industry", "RS Rating", "3M Rank", "6M Rank", "9M Rank", "12M Rank"];

        // تجهيز البيانات: نستخدم البيانات المفلترة والمرتبة حالياً
        const csvRows = filteredAndSortedStocks.map(stock => [
            stock.symbol,
            `"${stock.company_name || ''}"`, // نضع النصوص داخل علامات تنصيص لتجنب مشاكل الفواصل
            `"${stock.industry_group || ''}"`,
            stock.rs_rating,
            stock.rank_3m,
            stock.rank_6m,
            stock.rank_9m,
            stock.rank_12m
        ].join(","));

        // إضافة BOM لدعم اللغة العربية في Excel
        const BOM = "\uFEFF";
        const csvContent = BOM + [headers.join(","), ...csvRows].join("\n");

        // إنشاء رابط تحميل وهمي وتفعيله
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `saudi_market_analysis_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const renderSortIcon = (columnKey: SortKey) => {
        const isActive = sortConfig.key === columnKey;
        return (
            <span className={`inline-block ml-1 relative bottom-0.5 text-[10px] ${isActive ? 'opacity-100' : 'opacity-30'}`}>
                {isActive && sortConfig.direction === 'asc' ? '▲' :
                    isActive && sortConfig.direction === 'desc' ? '▼' : '⇅'}
            </span>
        );
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#667eea] to-[#764ba2]">
            <div className="text-white text-xl font-medium">Loading Data Table...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] py-5 px-4 font-sans text-[#333]">
            <div className="max-w-[1320px] mx-auto bg-white rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.2)] p-[30px] mt-[20px] mb-[40px]">

                <h1 className="text-[#2c3e50] mb-[10px] text-center font-bold text-[2.5rem] leading-tight">
                    📊 Saudi Market RS Analysis
                </h1>
                <p className="text-center text-[#7f8c8d] mb-[30px] text-[1.1rem]">
                    Relative Strength Rating · Table View
                </p>

                <div className="flex flex-wrap justify-center gap-[8px] bg-white/10 p-[6px] rounded-[12px] mb-[30px]">
                    {/* <a href="#" className="flex items-center gap-2 px-5 py-[10px] rounded-[8px] text-[0.95rem] font-medium transition-all duration-200 border border-black/10 bg-[#2c3e50] text-white shadow-[0_4px_15px_rgba(0,0,0,0.2)]">
                        📋 Data Table
                    </a>
                    <a href="#" className="flex items-center gap-2 px-5 py-[10px] rounded-[8px] text-[0.95rem] font-medium transition-all duration-200 border border-black/10 text-[#2c3e50] bg-white/95 opacity-90 hover:bg-white hover:opacity-100 hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
                        📈 Comparisons
                    </a>
                    <a href="#" className="flex items-center gap-2 px-5 py-[10px] rounded-[8px] text-[0.95rem] font-medium transition-all duration-200 border border-black/10 text-[#2c3e50] bg-white/95 opacity-90 hover:bg-white hover:opacity-100 hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
                        💠 Matrix Cards
                    </a>
                    <a href="#" className="flex items-center gap-2 px-5 py-[10px] rounded-[8px] text-[0.95rem] font-medium transition-all duration-200 border border-black/10 text-[#2c3e50] bg-white/95 opacity-90 hover:bg-white hover:opacity-100 hover:-translate-y-[2px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
                        📊 Heatmap
                    </a> */}

                    {/* الزر المعدل ليقوم بالتصدير */}
                    <button
                        onClick={exportToCSV}
                        className="flex items-center gap-2 px-5 py-[10px] rounded-[8px] text-[0.95rem] font-medium transition-all duration-200 border border-black/10 bg-[#27ae60] text-white opacity-90 hover:bg-[#219150] hover:opacity-100 hover:-translate-y-[2px] hover:shadow-[0_4px_15px_rgba(39,174,96,0.4)] cursor-pointer"
                    >
                        📥 Export CSV
                    </button>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                    <div className="text-gray-600 text-sm">
                        Show
                        <select className="mx-2 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-[#2c3e50]">
                            <option>25</option>
                            <option>50</option>
                            <option>100</option>
                        </select>
                        stocks
                    </div>
                    <div className="flex items-center">
                        <label className="mr-2 text-gray-600 text-sm">Search stocks:</label>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:border-[#2c3e50] text-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto w-full">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-300">
                                <SortableHeader label="Symbol" sortKey="symbol" currentSort={sortConfig} onSort={handleSort} icon={renderSortIcon} />
                                <SortableHeader label="Company" sortKey="company_name" currentSort={sortConfig} onSort={handleSort} icon={renderSortIcon} />
                                <SortableHeader label="Industry" sortKey="industry_group" currentSort={sortConfig} onSort={handleSort} icon={renderSortIcon} />
                                <SortableHeader label="RS Rating" sortKey="rs_rating" currentSort={sortConfig} onSort={handleSort} icon={renderSortIcon} />
                                <SortableHeader label="3M " sortKey="rank_3m" currentSort={sortConfig} onSort={handleSort} icon={renderSortIcon} />
                                <SortableHeader label="6M " sortKey="rank_6m" currentSort={sortConfig} onSort={handleSort} icon={renderSortIcon} />
                                <SortableHeader label="9M " sortKey="rank_9m" currentSort={sortConfig} onSort={handleSort} icon={renderSortIcon} />
                                <SortableHeader label="12M " sortKey="rank_12m" currentSort={sortConfig} onSort={handleSort} icon={renderSortIcon} />
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAndSortedStocks.map((stock, index) => (
                                <tr
                                    key={stock.symbol}
                                    className={`${index % 2 !== 0 ? 'bg-[#f2f2f2]' : 'bg-white'} hover:bg-gray-100 transition-colors border-t border-gray-200`}
                                >
                                    <td className="px-3 py-2.5 font-bold text-[#212529]">{stock.symbol}</td>
                                    <td className="px-3 py-2.5 text-[#212529]">{stock.company_name || '-'}</td>
                                    <td className="px-3 py-2.5 text-[#212529]">{stock.industry_group || '-'}</td>
                                    <td className="px-3 py-2.5 font-bold text-[#212529]">{stock.rs_rating}</td>
                                    <td className="px-3 py-2.5 text-[#212529]">{stock.rank_3m}</td>
                                    <td className="px-3 py-2.5 text-[#212529]">{stock.rank_6m}</td>
                                    <td className="px-3 py-2.5 text-[#212529]">{stock.rank_9m}</td>
                                    <td className="px-3 py-2.5 text-[#212529]">{stock.rank_12m}</td>
                                </tr>
                            ))}
                            {filteredAndSortedStocks.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="text-center py-6 text-gray-500">No matching records found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center mt-4 text-sm text-gray-600">
                    <div>
                        Showing 1 to {Math.min(filteredAndSortedStocks.length, 25)} of {filteredAndSortedStocks.length} entries
                    </div>
                    <div className="flex gap-1 mt-2 sm:mt-0">
                        <button className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50" disabled>Previous</button>
                        <button className="px-3 py-1 border bg-[#2c3e50] text-white rounded">1</button>
                        <button className="px-3 py-1 border rounded hover:bg-gray-100">2</button>
                        <button className="px-3 py-1 border rounded hover:bg-gray-100">3</button>
                        <button className="px-3 py-1 border rounded hover:bg-gray-100">Next</button>
                    </div>
                </div>

            </div>
        </div>
    );
}

function SortableHeader({ label, sortKey, currentSort, onSort, icon }: any) {
    return (
        <th
            className="px-3 py-3 font-bold text-[#212529] cursor-pointer select-none pr-6 group"
            onClick={() => onSort(sortKey)}
        >
            <div className="flex items-center justify-between">
                {label}
                {icon(sortKey)}
            </div>
        </th>
    );
}