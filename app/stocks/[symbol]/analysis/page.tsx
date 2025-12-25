import { StockTabs } from '../../_components/StockTabs';
import { StockSubTabs } from '../../_components/StockSubTabs';

import { MOCK_STOCK_DATA } from '../../data/mockData';
import { Filter, Calendar, MessageSquare, Bookmark } from 'lucide-react';
import Link from 'next/link';

export default async function AnalysisPage({
    params
}: {
    params: Promise<{ symbol: string }>
}) {
    const { symbol } = await params;
    const data = { ...MOCK_STOCK_DATA, symbol: symbol.toUpperCase() };

    // Use shared component instead of hardcoded tabs
    return (
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-4">

            {/* Secondary Navigation & Action Header */}
            <StockSubTabs symbol={symbol} activeTab="Analysis" />

            <div className="space-y-8">

                {/* Main Content: Analysis List */}
                <div className="w-full">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[600px]">

                        {/* Header & Filters */}
                        <div className="p-6 border-b border-gray-100">
                            <h2 className="text-2xl font-normal text-gray-700 mb-6">Analysis</h2>
                            <div className="flex flex-wrap gap-4">
                                <div className="relative">
                                    <span className="text-gray-500 text-sm mr-2">Ratings:</span>
                                    <div className="inline-flex items-center border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-400 min-w-[160px] justify-between cursor-pointer hover:border-gray-400 bg-white">
                                        Select Ratings
                                        <span className="text-[10px] ml-2">▼</span>
                                    </div>
                                </div>
                                <div className="relative">
                                    <span className="text-gray-500 text-sm mr-2">Date Range:</span>
                                    <div className="inline-flex items-center border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-400 min-w-[160px] justify-between cursor-pointer hover:border-gray-400 bg-white">
                                        Select Date
                                        <span className="text-[10px] ml-2">▼</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Articles List */}
                        <div className="divide-y divide-gray-100">
                            {data.analysis.map((item) => (
                                <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors cursor-pointer group">
                                    <div className="flex gap-4">
                                        {/* Avatar */}
                                        <div className="w-12 h-12 rounded-full bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-100">
                                            <img
                                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.author}`}
                                                alt={item.author}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-blue-600 leading-tight mb-2 group-hover:underline cursor-pointer">
                                                {item.title}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-2">
                                                {item.rating && (
                                                    <span className={`font-bold px-1.5 py-0.5 rounded text-[11px] ${item.rating === 'STRONG BUY'
                                                        ? 'bg-green-700 text-white'
                                                        : 'bg-green-600 text-white'
                                                        }`}>
                                                        {item.rating}
                                                    </span>
                                                )}
                                                <span className="text-gray-600">{item.author}</span>
                                                <span className="text-gray-300">•</span>
                                                <span className="text-gray-400">{item.date}</span>
                                                <span className="text-gray-300">•</span>
                                                <span className="flex items-center gap-1 hover:text-gray-700">
                                                    <MessageSquare className="w-3 h-3" />
                                                    {item.comments} Comments
                                                </span>
                                                <span className="text-gray-300">•</span>
                                                <span className="flex items-center gap-1 hover:text-gray-700 cursor-pointer">
                                                    <Bookmark className="w-3 h-3" />
                                                    Save
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>



            </div>
        </div>
    );
}
