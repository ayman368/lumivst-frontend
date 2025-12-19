'use client';

import {
    Bookmark,
    Share2,
    MessageSquare,
    ChevronLeft,
    Clock,
    Printer,
    MoreHorizontal
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function StockNewsDetailsPage() {
    const params = useParams();
    const symbol = params.symbol as string;

    const article = {
        source: "LumiVST Intelligence",
        tags: ['Technology', 'M&A', 'Market Movers'],
        title: "Paramount is top S&P 500 weekly loser after Netflix wins the fight for Warner Bros.",
        date: "December 06, 2025",
        time: "1:05 PM ET",
        author: "Anuron Mitra",
        role: "Senior Markets Editor",
        stocks: [
            { name: 'Paramount Global', ticker: 'PSKY', change: -9.82, price: 12.45 },
            { name: 'Warner Bros.', ticker: 'WBD', change: -2.40, price: 8.90 },
            { name: 'Netflix Inc.', ticker: 'NFLX', change: +4.50, price: 680.20 }
        ],
        comments: 12
    };

    return (
        <div className="bg-[#f8f9fa] pb-20 font-sans text-slate-900">
            {/* Note: Padding top removed because it's inside stock layout which handles header */}
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Top Navigation Bar */}
                <div className="flex items-center justify-between mb-6 text-sm text-slate-500 border-b border-slate-200 pb-4">
                    <Link href={`/stocks/${symbol}/news`} className="flex items-center gap-1 hover:text-blue-700 transition-colors font-semibold">
                        <ChevronLeft className="w-4 h-4" /> Back to News
                    </Link>
                    <div className="flex items-center gap-4">
                        <span>{article.time}</span>
                        <span className="text-slate-300">|</span>
                        <button className="flex items-center gap-1 hover:text-slate-800"><Printer className="w-4 h-4" /> Print</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Main Article Column */}
                    <div className="col-span-12 lg:col-span-8 bg-white border border-slate-200 shadow-sm p-8 lg:p-10 rounded-sm">

                        {/* Meta Header */}
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded uppercase tracking-wide">
                                {article.source}
                            </span>
                            {article.tags.map(tag => (
                                <span key={tag} className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                    {tag}
                                </span>
                            ))}
                        </div>

                        <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 leading-tight mb-4">
                            {article.title}
                        </h1>

                        <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600">
                                    AM
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-slate-900">
                                        <Link href="#" className="hover:underline">{article.author}</Link>
                                    </div>
                                    <div className="text-xs text-slate-500">{article.role} • {article.date}</div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-full transition-colors"><Bookmark className="w-5 h-5" /></button>
                                <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-full transition-colors"><Share2 className="w-5 h-5" /></button>
                            </div>
                        </div>

                        {/* Article Content - PRO TYPOGRAPHY */}
                        <div className="prose prose-lg max-w-none prose-slate prose-headings:font-serif prose-headings:font-bold prose-a:text-blue-700 prose-a:no-underline hover:prose-a:underline text-slate-800 leading-8">
                            <p className="lead">
                                Paramount Skydance (<Link href="#">PSKY</Link>) stock was the top percentage decliner on the <strong>S&P 500</strong> this week, after the David Ellison-led company lost out on the fight for Warner Bros. Discovery (<Link href="#">WBD</Link>) to Netflix (<Link href="#">NFLX</Link>) despite multiple sweetened bids.
                            </p>

                            <h3>Market Impact</h3>
                            <p>
                                Shares of PSKY slumped <span className="text-red-700 bg-red-50 px-1 font-bold">-16.5%</span> this week and slid <span className="text-red-700 bg-red-50 px-1 font-bold">-9.8%</span> on Friday alone. Investors reacted sharply to Netflix's (<Link href="#">NFLX</Link>) announcement to buy Warner Bros. Discovery's film and television studios and streaming assets in a deal with a total enterprise value of <strong>$82.7B</strong>.
                            </p>

                            <p>
                                According to reports from Reuters and CNBC, Paramount (<Link href="#">PSKY</Link>) courted Warner Bros. (<Link href="#">WBD</Link>) with three sweetened unsolicited offers that were all rejected by the company, after which WBD kicked off an auction on October 21. Netflix (<Link href="#">NFLX</Link>) then entered the fray.
                            </p>

                            <p>
                                CNBC on Friday said PSKY was evaluating taking another improved offer that could be even higher than its previous $30/share bid straight to WBD's shareholders.
                            </p>
                        </div>

                        {/* Bottom Actions */}
                        <div className="flex items-center gap-4 mt-12 pt-6 border-t border-slate-200">
                            <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded text-sm transition-colors">
                                <MessageSquare className="w-4 h-4" /> Comments ({article.comments})
                            </button>
                            <button className="ml-auto text-sm text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1">
                                Report Issue <MoreHorizontal className="w-4 h-4" />
                            </button>
                        </div>

                    </div>

                    {/* Sidebar Column - Market Data Widget */}
                    <div className="col-span-12 lg:col-span-4 space-y-6">

                        <div className="bg-white border border-slate-200 shadow-sm rounded-sm p-5 sticky top-24">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">
                                Mentioned in this article
                            </h3>

                            <div className="space-y-1">
                                {article.stocks.map((stock, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded hover:bg-[#f8f9fa] transition-colors cursor-pointer group border border-transparent hover:border-slate-200">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-blue-700 group-hover:underline text-base">{stock.ticker}</span>
                                            <span className="text-xs text-slate-500">{stock.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-semibold text-slate-900">${stock.price}</div>
                                            <div className={`text-xs font-bold ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {stock.change > 0 ? '+' : ''}{stock.change}%
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-100">
                                <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded transition-colors shadow-sm">
                                    + Add to Watchlist
                                </button>
                            </div>
                        </div>

                        {/* Related News Widget */}
                        <div className="bg-white border border-slate-200 shadow-sm rounded-sm p-5">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2">
                                Related Analysis
                            </h3>
                            <ul className="space-y-4">
                                <li className="text-sm">
                                    <Link href="#" className="font-semibold text-slate-800 hover:text-blue-700 leading-snug block mb-1">
                                        Warner Bros. Discovery: Why The Netflix Deal Makes Sense
                                    </Link>
                                    <span className="text-xs text-slate-400">2 hours ago • Analysis</span>
                                </li>
                                <li className="text-sm">
                                    <Link href="#" className="font-semibold text-slate-800 hover:text-blue-700 leading-snug block mb-1">
                                        Streaming Wars: Who survives the consolidation phase?
                                    </Link>
                                    <span className="text-xs text-slate-400">4 hours ago • Market Outlook</span>
                                </li>
                            </ul>
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
}
