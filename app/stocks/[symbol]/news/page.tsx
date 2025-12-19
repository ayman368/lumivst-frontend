'use client';

import { useState } from 'react';
import {
    Search,
    Bookmark,
    Share2,
    LayoutList,
    LayoutGrid,
    MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { StockSubTabs } from '../../_components/StockSubTabs';

const CATEGORIES = [
    'All News', 'Market Pulse', 'Earnings', 'Dividends', 'M&A', 'Economy', 'Tech', 'Energy', 'Healthcare'
];

const NEWS_ITEMS = [
    {
        id: 1,
        source: "LumiVST Intelligence",
        title: "Paramount is top S&P 500 weekly loser after Netflix wins the fight for Warner Bros.",
        tickers: [{ symbol: "PSKY", change: -9.82 }, { symbol: "NFLX", change: +4.50 }, { symbol: "WBD", change: -2.40 }],
        time: "1:05 PM",
        date: "Today",
        comments: 12,
    },
    {
        id: 2,
        source: "Market Wire",
        title: "Trump signs memo to align U.S. vaccines for children with practices from other countries",
        tickers: [{ symbol: "PFE", change: +1.28 }, { symbol: "MRNA", change: +2.15 }],
        time: "12:33 PM",
        date: "Today",
        comments: 45,
    },
    {
        id: 3,
        source: "Global Markets",
        title: "Trending stocks as Wall Street ends first week of December in the green",
        tickers: [{ symbol: "SPY", change: +0.45 }, { symbol: "QQQ", change: +0.60 }],
        time: "12:10 PM",
        date: "Today",
        comments: 8,
    },
    {
        id: 4,
        source: "Real Estate Watch",
        title: "Real estate stocks post negative returns this week, 2025-end trajectory unpredictable",
        tickers: [{ symbol: "XLRE", change: -0.02 }],
        time: "12:00 PM",
        date: "Today",
        comments: 3,
    },
    {
        id: 5,
        source: "Analyst Corner",
        title: "Notable analyst calls this week: Novartis, Albemarle and Zscaler among top picks",
        tickers: [{ symbol: "NVS", change: +1.20 }, { symbol: "ALB", change: +3.40 }],
        time: "10:35 AM",
        date: "Today",
        comments: 0,
    }
];

export default function StockNewsPage() {
    const params = useParams();
    const symbol = (params.symbol as string).toUpperCase();
    const [activeTab, setActiveTab] = useState('All News');

    return (
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-4">

            <StockSubTabs symbol={symbol} activeTab="News" />

            <div className="grid grid-cols-12 gap-10">

                {/* Main News Feed */}
                <div className="col-span-12 lg:col-span-9">

                    {/* Search & Controls - Adapted for integrated view */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 pb-4 border-b border-gray-200">
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                            News
                        </h1>

                        <div className="flex items-center gap-4 mt-4 md:mt-0">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder={`Search ${symbol} news...`}
                                    className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded text-sm focus:outline-none focus:border-gray-400 w-64 transition-all placeholder:text-gray-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Minimalist Categories */}
                    <div className="flex items-center gap-6 mb-6 overflow-x-auto pb-2 scrollbar-hide border-b border-gray-100">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveTab(cat)}
                                className={`pb-3 text-sm font-medium transition-colors whitespace-nowrap relative
                                    ${activeTab === cat
                                        ? 'text-black border-b-2 border-black'
                                        : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                        <div className="ml-auto hidden sm:flex gap-2">
                            <button className="p-1.5 text-gray-400 hover:text-gray-900"><LayoutList className="w-5 h-5" /></button>
                            <button className="p-1.5 text-gray-400 hover:text-gray-900"><LayoutGrid className="w-5 h-5" /></button>
                        </div>
                    </div>

                    {/* News List - Clean Style */}
                    <div className="flex flex-col gap-6">
                        {NEWS_ITEMS.map((item) => (
                            <div key={item.id} className="group flex flex-col sm:flex-row gap-4 sm:gap-6 py-4 border-b border-gray-100 last:border-0 items-start">

                                {/* Time Stamp - Simple Gray */}
                                <div className="w-20 pt-1 shrink-0 text-sm text-gray-500 flex flex-col">
                                    <span className="font-medium text-gray-900">{item.time}</span>
                                    <span className="text-xs">{item.date}</span>
                                </div>

                                {/* Main Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                            {item.source}
                                        </span>
                                    </div>

                                    <Link href={`/stocks/${symbol}/news/${item.id}`} className="block">
                                        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-700 leading-snug mb-3 transition-colors">
                                            {item.title}
                                        </h3>
                                    </Link>

                                    {/* Meta Footer */}
                                    <div className="flex items-center flex-wrap gap-4 text-sm">
                                        {/* Tickers - Minimalist */}
                                        <div className="flex items-center gap-3">
                                            {item.tickers.map((t, idx) => (
                                                <Link
                                                    key={idx}
                                                    href={`/stocks/${t.symbol}`}
                                                    className="flex items-center gap-1.5 group/ticker"
                                                >
                                                    <span className="font-bold text-gray-900 hover:underline">{t.symbol}</span>
                                                    <span className={`text-xs font-medium ${t.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {t.change > 0 ? '+' : ''}{t.change}%
                                                    </span>
                                                </Link>
                                            ))}
                                        </div>

                                        <div className="w-px h-3 bg-gray-300 mx-1 hidden sm:block"></div>

                                        <div className="flex items-center gap-4 text-gray-400">
                                            <button className="flex items-center gap-1 hover:text-gray-700 transition-colors text-xs font-medium">
                                                <MessageSquare className="w-3.5 h-3.5" /> {item.comments}
                                            </button>
                                            <button className="hover:text-gray-700 transition-colors"><Bookmark className="w-4 h-4" /></button>
                                            <button className="hover:text-gray-700 transition-colors"><Share2 className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 pt-6 border-t border-gray-200">
                        <button className="text-sm font-semibold text-gray-900 hover:text-blue-700 transition-colors flex items-center gap-2">
                            Load More Headlines <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">&darr;</div>
                        </button>
                    </div>
                </div>

                {/* Sidebar - Minimalist Data */}
                <div className="col-span-12 lg:col-span-3 space-y-8 border-l border-gray-100 pl-8 hidden lg:block">

                    {/* Trending Block */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                            Market Movers
                        </h3>
                        <div className="space-y-4">
                            {[
                                { s: 'NVDA', n: 'NVIDIA', c: +2.45 },
                                { s: 'TSLA', n: 'Tesla', c: -1.20 },
                                { s: 'AAPL', n: 'Apple', c: +0.85 },
                                { s: 'AMD', n: 'AMD', c: +3.10 },
                            ].map((stock) => (
                                <div key={stock.s} className="flex items-center justify-between group cursor-pointer">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors text-sm">{stock.s}</span>
                                        <span className="text-xs text-gray-500">{stock.n}</span>
                                    </div>
                                    <span className={`text-sm font-medium ${stock.c >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {stock.c > 0 ? '+' : ''}{stock.c}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sectors Block */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                            Sector Watch
                        </h3>
                        <div className="space-y-3">
                            {['Technology', 'Biotech', 'Energy'].map(sector => (
                                <div key={sector} className="flex justify-between text-xs items-center">
                                    <span className="text-gray-600 font-medium hover:text-gray-900 cursor-pointer">{sector}</span>
                                    <span className="text-green-600 bg-green-50 px-1.5 py-0.5 rounded font-medium">+1.2%</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
