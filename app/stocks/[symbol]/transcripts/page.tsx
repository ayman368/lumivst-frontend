'use client';

import { use, useEffect, useState } from 'react';
import { MOCK_STOCK_DATA } from '../../data/mockData';
import { StockSubTabs } from '../../_components/StockSubTabs';
import { RatingsSummary } from '../../_components/RatingsSummary';
import { FactorGrades } from '../../_components/FactorGrades';
import { Lightbulb, FileText, Bookmark, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function TranscriptsPage() {
    const params = useParams();
    const symbol = (params.symbol as string).toUpperCase();

    // In a real app, you'd fetch data based on symbol. 
    // Here we use the mock data which we updated to include transcripts.
    // If MOCK_STOCK_DATA doesn't have transcripts yet (runtime issue), we fallback.
    const transcriptsData = MOCK_STOCK_DATA.transcripts || {
        insights: [],
        fullTranscripts: []
    };

    return (
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-4">
            <StockSubTabs symbol={symbol} activeTab="Transcripts & Insights" />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-9 space-y-8">

                    {/* Insights Section */}
                    {transcriptsData.insights.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-xl font-medium text-gray-900 mb-6 border-b border-gray-100 pb-4">
                                Earnings Calls Insights
                            </h2>
                            <div className="space-y-6">
                                {transcriptsData.insights.map((item) => (
                                    <div key={item.id} className="flex gap-4 group">
                                        <div className="flex-shrink-0">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                                <Lightbulb size={20} />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="px-2 py-0.5 rounded bg-gray-600 text-white text-[10px] font-bold uppercase tracking-wide">
                                                    Earnings Call Insights
                                                </span>
                                            </div>
                                            <Link href="#" className="block mb-2">
                                                <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-snug">
                                                    {item.title}
                                                </h3>
                                            </Link>
                                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                                <span className="font-medium text-orange-600">{item.source}</span>
                                                <span>•</span>
                                                <span>{item.date}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <MessageSquare size={12} />
                                                    {item.comments} Comments
                                                </span>
                                                <span className="ml-auto md:ml-0 md:border-l md:border-gray-200 md:pl-3">
                                                    <button className="flex items-center gap-1 hover:text-gray-900">
                                                        <Bookmark size={14} />
                                                        <span className="hidden md:inline">Save</span>
                                                    </button>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 pt-4 border-t border-gray-100">
                                <Link href="#" className="text-sm font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wide">
                                    Show more
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Full Transcripts Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-medium text-gray-900 mb-6 border-b border-gray-100 pb-4">
                            Full Transcripts
                        </h2>
                        <div className="space-y-6">
                            {transcriptsData.fullTranscripts.map((item) => (
                                <div key={item.id} className="flex gap-4 group">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                            <FileText size={20} />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Link href="#" className="block mb-2">
                                            <h3 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-snug">
                                                {item.title}
                                            </h3>
                                        </Link>
                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                            <span className="font-medium text-gray-500">{item.source}</span>
                                            <span>•</span>
                                            <span>{item.date}</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <MessageSquare size={12} />
                                                {item.comments} Comment
                                            </span>
                                            <span className="ml-auto md:ml-0 md:border-l md:border-gray-200 md:pl-3">
                                                <button className="flex items-center gap-1 hover:text-gray-900">
                                                    <Bookmark size={14} />
                                                    <span className="hidden md:inline">Save</span>
                                                </button>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 pt-4 border-t border-gray-100">
                            <Link href="#" className="text-sm font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wide">
                                Show more
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Sidebar (Optional - using placeholders to match layout) */}
                {/* Sidebar */}
                <div className="lg:col-span-3 space-y-5">
                    <RatingsSummary data={MOCK_STOCK_DATA.ratings} />
                    <FactorGrades data={MOCK_STOCK_DATA.factorGrades} />
                </div>
            </div>
        </div>
    );
}
