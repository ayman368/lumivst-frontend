'use client';
import { Search, Bell, HelpCircle, User } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function StocksTopBar() {
    const router = useRouter();
    const [query, setQuery] = useState('');

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && query.trim()) {
            router.push(`/stocks/${query.trim().toUpperCase()}`);
        }
    };

    return (
        <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
            {/* Search Bar */}
            <div className="relative max-w-xl w-full">
                <input
                    type="text"
                    placeholder="Symbols, Analysts, Keywords"
                    className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleSearch}
                />
                <button
                    onClick={() => query.trim() && router.push(`/stocks/${query.trim().toUpperCase()}`)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                    <Search className="h-4 w-4" />
                </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
            </div>
        </div>
    );
}
