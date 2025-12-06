'use client';

import {
    Bookmark,
    Share2,
    MessageSquare,
    PlayCircle,
    ChevronLeft
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function NewsDetailsPage() {
    const params = useParams();

    // In a real app, you would fetch data based on params.id
    // content matches the image provided
    const article = {
        tags: ['Tech', 'On the Move', 'M&A'],
        title: "Paramount is top S&P 500 weekly loser after Netflix wins the fight for Warner Bros.",
        date: "Dec. 06, 2025 1:05 PM ET",
        author: "Anuron Mitra",
        role: "SA News Editor",
        stocks: [
            { name: 'Paramount Skydance Corporation', ticker: 'PSKY' },
            { name: 'WBD Stock', ticker: 'WBD' },
            { name: 'NFLX Stock', ticker: 'NFLX' }
        ],
        comments: 3
    };

    return (
        <div className="min-h-screen bg-white pb-20 pt-24">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Back Button (Optional but good UX) */}
                <Link href="/news" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-6 transition-colors">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back to News
                </Link>

                {/* Header Section */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-2">
                        {article.tags.map((tag, i) => (
                            <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-md">
                                {tag}
                            </span>
                        ))}
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 transition-colors">
                        <Bookmark className="w-5 h-5" />
                    </button>
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                    {article.title}
                </h1>

                {/* Meta Info */}
                <div className="text-sm text-gray-600 mb-6 pb-6 border-b border-gray-100">
                    <span className="text-gray-500">{article.date}</span>
                    <span className="mx-2">|</span>
                    <span className="font-medium text-gray-900">
                        {article.stocks.map((stock, i) => (
                            <span key={i}>
                                <Link href="#" className="hover:underline text-gray-900 font-bold">{stock.name} ({stock.ticker})</Link>
                                {i < article.stocks.length - 1 ? ', ' : ''}
                            </span>
                        ))}
                    </span>
                    <span className="mx-2">|</span>
                    <span className="text-gray-500">By: </span>
                    <span className="font-medium text-blue-600 hover:underline cursor-pointer">{article.author}</span>
                    <span className="text-gray-400">, {article.role}</span>
                </div>

                {/* Action Bar */}
                <div className="flex items-center justify-between max-w-2xl text-sm font-medium text-blue-600 mb-8">
                    <button className="flex flex-col items-center gap-1 hover:text-blue-800 transition-colors">
                        <div className="relative">
                            <Share2 className="w-5 h-5" />
                            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] px-1 rounded-full">6</span>
                        </div>
                        <span>Share</span>
                    </button>

                    <button className="flex flex-col items-center gap-1 hover:text-blue-800 transition-colors">
                        <Bookmark className="w-5 h-5" />
                        <span>Save</span>
                    </button>

                    <button className="flex flex-col items-center gap-1 hover:text-blue-800 transition-colors">
                        <PlayCircle className="w-5 h-5" />
                        <span>Play (2min)</span>
                    </button>

                    <button className="flex flex-col items-center gap-1 hover:text-blue-800 transition-colors">
                        <MessageSquare className="w-5 h-5" />
                        <span>Comments ({article.comments})</span>
                    </button>
                </div>

                {/* Article Body */}
                <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed space-y-6">
                    <p>
                        Paramount Skydance (<Link href="#" className="text-blue-600 hover:underline">PSKY</Link>) stock was the top percentage decliner on the S&P 500 this week, after the David Ellison-led company lost out on the fight for Warner Bros. Discovery (<Link href="#" className="text-blue-600 hover:underline">WBD</Link>) to Netflix (<Link href="#" className="text-blue-600 hover:underline">NFLX</Link>) despite multiple sweetened bids.
                    </p>

                    <p>
                        Shares of PSKY slumped <span className="text-red-500 font-medium">-16.5%</span> this week and slid <span className="text-red-500 font-medium">-9.8%</span> on Friday alone after Netflix's (<Link href="#" className="text-blue-600 hover:underline">NFLX</Link>) announcement to buy Warner Bros. Discovery's (<Link href="#" className="text-blue-600 hover:underline">WBD</Link>) film and television studios and streaming assets in a deal with a total enterprise value of <Link href="#" className="text-blue-600 hover:underline">about $82.7B</Link>.
                    </p>

                    <p>
                        According to reports from Reuters and CNBC, Paramount (<Link href="#" className="text-blue-600 hover:underline">PSKY</Link>) courted Warner Bros. (<Link href="#" className="text-blue-600 hover:underline">WBD</Link>) with three sweetened unsolicited offers that were all rejected by the company, after which WBD kicked off an auction on October 21. Netflix (<Link href="#" className="text-blue-600 hover:underline">NFLX</Link>) then entered the fray.
                    </p>

                    <p>
                        CNBC on Friday said PSKY was <Link href="#" className="text-blue-600 hover:underline">evaluating</Link> taking another improved offer that could be even higher than its previous $30/share bid straight to WBD's shareholders.
                    </p>
                </div>

            </div>
        </div>
    );
}
