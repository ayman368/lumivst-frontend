'use client';

import { Search, FileSpreadsheet, FileText, LayoutGrid } from 'lucide-react';
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export function StocksTopBar() {
    const router = useRouter();
    const params = useParams();
    const currentSymbol = params?.symbol as string;
    const [query, setQuery] = useState('');

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && query.trim()) {
            router.push(`/stocks/${query.trim().toUpperCase()}`);
        }
    };

    return (
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm sticky top-0 z-50">
            {/* Search Bar */}
            <div className="relative max-w-md w-full">
                <input
                    type="text"
                    placeholder="Search Symbols (e.g. 4322, 1120)..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleSearch}
                />
                <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-gray-400" />
            </div>

            {/* Navigation Links */}
            <div className="flex items-center gap-2">
                <Link
                    href="/dashboard/financials"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all"
                >
                    <FileSpreadsheet className="w-4 h-4" />
                    Financials
                </Link>

                <Link
                    href={`/stocks/${currentSymbol || '4322'}/reports`}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all"
                >
                    <FileText className="w-4 h-4" />
                    Reports
                </Link>

                <Link
                    href="/rs-screener"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                >
                    <LayoutGrid className="w-4 h-4" />
                    RS Matrix
                </Link>
            </div>

            {/* User Actions (Placeholder) */}
            <div className="w-[100px] flex justify-end">
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                    <LayoutGrid className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
