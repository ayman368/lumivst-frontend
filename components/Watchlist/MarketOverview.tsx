'use client';

import { useEffect, useState, useMemo } from 'react';
import { API_BASE_URL } from '@/lib/api/config';

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

// نفس الـ interface من الكود التاني
interface SortConfig {
    key: SortKey;
    direction: SortDirection;
}

export default function MarketOverview() {
    const [stocks, setStocks] = useState<StockRS[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // نفس نظام الـ sortConfigs array من الكود التاني
    const [sortConfigs, setSortConfigs] = useState<SortConfig[]>([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(25);

    // Fetch data
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
            console.error('Failed to fetch data', err);
        } finally {
            setLoading(false);
        }
    };

    // Filter and multi-sort - نفس منطق الترتيب من الكود التاني
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

        // Apply multi-sorting
        if (sortConfigs.length > 0) {
            result = [...result].sort((a, b) => {
                for (const config of sortConfigs) {
                    const aValue = a[config.key];
                    const bValue = b[config.key];

                    if (aValue === undefined || aValue === null) return 1;
                    if (bValue === undefined || bValue === null) return -1;

                    let comparison = 0;

                    if (typeof aValue === 'string' && typeof bValue === 'string') {
                        comparison = aValue.localeCompare(bValue);
                    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
                        comparison = aValue - bValue;
                    }

                    if (comparison !== 0) {
                        return config.direction === 'asc' ? comparison : -comparison;
                    }
                }
                return 0;
            });
        }

        return result;
    }, [stocks, search, sortConfigs]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredAndSortedStocks.length / itemsPerPage);
    const paginatedStocks = filteredAndSortedStocks.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 4) {
                for (let i = 1; i <= 5; i++) pages.push(i);
                pages.push(-1);
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 3) {
                pages.push(1);
                pages.push(-1);
                for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push(-1);
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push(-1);
                pages.push(totalPages);
            }
        }
        return pages;
    };

    // نفس handleSort من الكود التاني
    const handleSort = (key: SortKey) => {
        setSortConfigs(prev => {
            const existingIndex = prev.findIndex(config => config.key === key);

            if (existingIndex === -1) {
                // إضافة عمود جديد للترتيب
                return [...prev, { key, direction: 'asc' }];
            }

            const existing = prev[existingIndex];
            if (existing.direction === 'asc') {
                // تغيير الاتجاه إلى تنازلي
                const newConfigs = [...prev];
                newConfigs[existingIndex] = { ...existing, direction: 'desc' };
                return newConfigs;
            }

            // إزالة العمود من الترتيب
            return prev.filter((_, index) => index !== existingIndex);
        });
        setCurrentPage(1);
    };

    // --- وظيفة تصدير الملف CSV ---
    const exportToCSV = () => {
        const headers = ["Symbol", "Company", "Industry", "RS Rating", "3M Rank", "6M Rank", "9M Rank", "12M Rank"];

        const csvRows = filteredAndSortedStocks.map(stock => [
            stock.symbol,
            `"${stock.company_name || ''}"`,
            `"${stock.industry_group || ''}"`,
            stock.rs_rating,
            stock.rank_3m,
            stock.rank_6m,
            stock.rank_9m,
            stock.rank_12m
        ].join(","));

        const BOM = "\uFEFF";
        const csvContent = BOM + [headers.join(","), ...csvRows].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `saudi_market_analysis_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // نفس getSortClass من الكود التاني
    const getSortClass = (key: SortKey): string => {
        const index = sortConfigs.findIndex(config => config.key === key);
        if (index === -1) return 'cursor-pointer hover:bg-gray-50';

        const direction = sortConfigs[index].direction;
        return `cursor-pointer ${direction === 'asc' ? 'bg-blue-50' : 'bg-blue-50'}`;
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
                        <select
                            className="mx-2 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-[#2c3e50]"
                            value={itemsPerPage}
                            onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                        >
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
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

                {/* Sticky header container */}
                <div className="overflow-x-auto w-full relative" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="sticky top-0 z-10 bg-white shadow-sm">
                            <tr className="border-b border-gray-300">
                                {[
                                    { key: 'symbol', label: 'Symbol' },
                                    { key: 'company_name', label: 'Company' },
                                    { key: 'industry_group', label: 'Industry' },
                                    { key: 'rs_rating', label: 'RS Rating' },
                                    { key: 'rank_3m', label: '3M' },
                                    { key: 'rank_6m', label: '6M' },
                                    { key: 'rank_9m', label: '9M' },
                                    { key: 'rank_12m', label: '12M' }
                                ].map(col => {
                                    const sortIndex = sortConfigs.findIndex(config => config.key === col.key);
                                    const isSorted = sortIndex !== -1;
                                    const sortPriority = sortIndex + 1;
                                    const sortDir = isSorted ? sortConfigs[sortIndex].direction : null;

                                    return (
                                        <th
                                            key={col.key}
                                            className={`
                                                px-3 py-3 font-medium text-gray-600 cursor-pointer select-none
                                                hover:bg-gray-100 transition-colors whitespace-nowrap
                                                ${getSortClass(col.key as SortKey)}
                                                ${isSorted ? 'bg-blue-50 text-blue-900 border-b-2 border-b-blue-500' : ''}
                                            `}
                                            onClick={() => handleSort(col.key as SortKey)}
                                        >
                                            <div className="flex items-center">
                                                <span className="font-semibold">{col.label}</span>
                                                <div className="flex flex-col ml-1">
                                                    {isSorted ? (
                                                        <span className="text-xs font-bold">
                                                            {sortDir === 'asc' ? '▲' : '▼'}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[10px] text-gray-400 opacity-50 block leading-[8px]">
                                                            ▲<br />▼
                                                        </span>
                                                    )}
                                                </div>
                                                {isSorted && (
                                                    <span className="ml-1 inline-flex items-center justify-center w-4 h-4 bg-blue-600 text-white text-[10px] font-bold rounded-full flex-shrink-0">
                                                        {sortPriority}
                                                    </span>
                                                )}
                                            </div>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedStocks.map((stock, index) => (
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
                        Showing {filteredAndSortedStocks.length === 0 ? 0 : Math.min((currentPage - 1) * itemsPerPage + 1, filteredAndSortedStocks.length)} to {Math.min(currentPage * itemsPerPage, filteredAndSortedStocks.length)} of {filteredAndSortedStocks.length} entries
                    </div>
                    <div className="flex gap-1 mt-2 sm:mt-0">
                        <button
                            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                            disabled={currentPage === 1}
                            onClick={() => handlePageChange(currentPage - 1)}
                        >Previous</button>

                        {getPageNumbers().map((p, i) => (
                            <button
                                key={i}
                                disabled={p === -1}
                                onClick={() => p !== -1 && handlePageChange(p as number)}
                                className={`px-3 py-1 border rounded ${p === -1 ? 'border-none cursor-default' : currentPage === p ? 'bg-[#2c3e50] text-white' : 'hover:bg-gray-100'}`}
                            >
                                {p === -1 ? '...' : p}
                            </button>
                        ))}

                        <button
                            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                            disabled={currentPage === totalPages || totalPages === 0}
                            onClick={() => handlePageChange(currentPage + 1)}
                        >Next</button>
                    </div>
                </div>

            </div>
        </div>
    );
}