'use client';

import { useState, useEffect } from 'react';
import { FileText, FileSpreadsheet, Loader2, AlertCircle } from 'lucide-react';

interface OfficialFiling {
    id: number;
    period: string; // 'Annual', 'Q1'...
    year: number;
    file_url: string | null;
    published_date: string | null;
    file_type: 'pdf' | 'excel' | 'other' | null;
}

const CATEGORIES = [
    'Financial Statements',
    'XBRL',
    'Board Report',
    'ESG Report'
];

const PERIOD_ORDER = ['Annual', 'Q4', 'Q3', 'Q2', 'Q1'];

export default function FinancialReportsTable({ symbol }: { symbol: string }) {
    const [data, setData] = useState<Record<string, OfficialFiling[]>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState(CATEGORIES[0]);
    const [years, setYears] = useState<number[]>([]);

    useEffect(() => {
        if (symbol) fetchReports();
    }, [symbol]);

    const fetchReports = async () => {
        setLoading(true);
        setError(null);
        try {
            const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await fetch(`${apiBase}/api/reports/${symbol}`);

            if (!res.ok) {
                throw new Error('Failed to fetch reports');
            }

            const json = await res.json();
            setData(json);

            // Extract all unique years
            const allYears = new Set<number>();
            Object.values(json).forEach((list: any) => {
                list.forEach((d: any) => allYears.add(d.year));
            });
            setYears(Array.from(allYears).sort((a, b) => b - a));

        } catch (e: any) {
            setError(e.message || 'Error loading reports');
        } finally {
            setLoading(false);
        }
    };

    const currentItems = data[activeTab] || [];

    const getCell = (period: string, year: number) => {
        return currentItems.find(i => i.period === period && i.year === year);
    }

    if (loading) return (
        <div className="flex justify-center p-8 bg-white rounded-lg border shadow-sm mt-6">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg border shadow-sm mt-6 text-red-500">
            <AlertCircle className="w-8 h-8 mb-2" />
            <p>{error}</p>
            <button onClick={fetchReports} className="mt-2 text-sm underline hover:text-red-700">Retry</button>
        </div>
    );

    // If no data at all
    if (years.length === 0) {
        return (
            <div className="p-8 bg-white rounded-lg border shadow-sm mt-6 text-center text-gray-500">
                <p>No official filings available for this company.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mt-6 overflow-hidden">
            {/* Header / Tabs */}
            <div className="flex border-b border-gray-200 bg-gray-50/50 overflow-x-auto">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveTab(cat)}
                        className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === cat
                                ? 'border-b-2 border-blue-600 text-blue-600 bg-white'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 sticky left-0 bg-gray-50 min-w-[120px]">Period</th>
                            {years.map(y => <th key={y} className="px-6 py-4 text-center min-w-[100px]">{y}</th>)}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {PERIOD_ORDER.map(period => (
                            <tr key={period} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900 sticky left-0 bg-white shadow-[1px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                    {period}
                                </td>
                                {years.map(year => {
                                    const item = getCell(period, year);
                                    return (
                                        <td key={year} className="px-6 py-4 text-center align-middle">
                                            {item && item.file_url ? (
                                                <a
                                                    href={item.file_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex flex-col items-center justify-center p-2 rounded-lg hover:bg-gray-100 transition-all group gap-1"
                                                    title={item.published_date || ''}
                                                >
                                                    {item.file_type === 'pdf' ? (
                                                        <FileText className="w-6 h-6 text-red-500 group-hover:scale-110 transition-transform" />
                                                    ) : (
                                                        <FileSpreadsheet className="w-6 h-6 text-green-600 group-hover:scale-110 transition-transform" />
                                                    )}

                                                    {item.published_date && (
                                                        <span className="text-[10px] text-gray-400 group-hover:text-gray-600">
                                                            {new Date(item.published_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                        </span>
                                                    )}
                                                </a>
                                            ) : (
                                                <span className="text-gray-200 select-none text-xl">·</span>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
