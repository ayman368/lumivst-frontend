'use client';

import { useState } from 'react';
import { MessageSquare, Bookmark, Share2, Flame, ChevronRight } from 'lucide-react';
import Link from 'next/link';

// Mock data based on the image
const NEWS_CATEGORIES = [
    { name: 'All News', active: true },
    { name: 'AI Tech', icon: Flame },
    { name: 'Biotech' },
    { name: 'Budget & Regulation' },
    { name: 'Buybacks' },
    { name: 'Commodities' },
    { name: 'Consumer' },
    { name: 'Cryptocurrency', icon: Flame },
];

const NEWS_ITEMS = [
    {
        id: 1,
        title: "Paramount is top S&P 500 weekly loser after Netflix wins the fight for Warner Bros.",
        ticker: "PSKY",
        change: -9.82,
        time: "Today, 1:05 PM",
        comments: 2,
        saved: false,
    },
    {
        id: 2,
        title: "Trump signs memo to align U.S. vaccines for children with practices from other countries",
        ticker: "PFE",
        change: +1.28,
        time: "Today, 12:33 PM",
        comments: 36,
        saved: false,
    },
    {
        id: 3,
        title: "Trending stocks as Wall Street ends first week of December in the green",
        ticker: "COST",
        change: -0.13,
        time: "Today, 12:10 PM",
        comments: 1,
        saved: false,
    },
    {
        id: 4,
        title: "Real estate stocks post negative returns this week, 2025-end trajectory unpredictable",
        ticker: "XLRE",
        change: -0.02,
        time: "Today, 12:00 PM",
        comments: 1,
        saved: false,
    },
    {
        id: 5,
        title: "Notable analyst calls this week: Novartis, Albemarle and Zscaler among top picks",
        ticker: "U",
        change: +3.69,
        time: "Today, 10:35 AM",
        comments: 0,
        saved: false,
    }
];

export default function NewsPage() {
    const [showFullStories, setShowFullStories] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 pb-20 pt-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6 uppercase tracking-wide">News</h1>

                    {/* Categories */}
                    <div className="flex flex-wrap items-center gap-2">
                        {NEWS_CATEGORIES.map((category, index) => (
                            <button
                                key={index}
                                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all
                  ${category.active
                                        ? 'bg-slate-800 text-white shadow-md'
                                        : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 shadow-sm'
                                    }`}
                            >
                                {category.icon && <category.icon className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />}
                                {category.name}
                            </button>
                        ))}
                        <button className="ml-auto text-sm text-blue-600 font-medium hover:text-blue-700 hover:underline px-2">
                            More
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

                    {/* Toolbar */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">All News</h2>
                        <button
                            onClick={() => setShowFullStories(!showFullStories)}
                            className={`text-sm font-medium px-4 py-1.5 rounded-full border transition-colors
                ${showFullStories
                                    ? 'bg-blue-50 text-blue-600 border-blue-200'
                                    : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                                }`}
                        >
                            Show full stories
                        </button>
                    </div>

                    {/* News List */}
                    <div className="divide-y divide-gray-100">
                        {NEWS_ITEMS.map((item) => (
                            <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors group">
                                <div className="flex flex-col gap-2">
                                    <Link href={`/news/${item.id}`} className="block">
                                        <h3 className="text-lg font-semibold text-gray-900 leading-tight cursor-pointer hover:text-blue-600 transition-colors">
                                            {item.title}
                                        </h3>
                                    </Link>

                                    <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500 mt-1">
                                        {/* Ticker & Change */}
                                        <div className="flex items-center gap-2">
                                            <Link href={`/stocks/${item.ticker}`} className="font-semibold text-blue-600 cursor-pointer hover:underline">
                                                {item.ticker}
                                            </Link>
                                            <span className={`font-medium ${item.change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                {item.change > 0 ? '+' : ''}{item.change}%
                                            </span>
                                        </div>

                                        <span className="text-gray-300">•</span>

                                        {/* Time */}
                                        <span>{item.time}</span>

                                        <span className="text-gray-300">•</span>

                                        {/* Comments */}
                                        <button className="flex items-center gap-1 hover:text-gray-700">
                                            <MessageSquare className="w-4 h-4 ml-1" />
                                            {item.comments > 0 ? `${item.comments} Comments` : 'Comment'}
                                        </button>

                                        <span className="text-gray-300 sm:inline hidden">•</span>

                                        {/* Actions */}
                                        <div className="flex items-center gap-3 ml-auto sm:ml-0">
                                            <button className="hover:text-gray-900 transition-colors p-1" title="Save">
                                                <Bookmark className="w-4 h-4" />
                                            </button>
                                            <button className="hover:text-gray-900 transition-colors p-1" title="Share">
                                                <Share2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer / Load More */}
                    <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                        <button className="text-blue-600 font-medium hover:text-blue-700 text-sm flex items-center justify-center gap-1 mx-auto">
                            Show more news <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
