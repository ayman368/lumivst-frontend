'use client';
import { useState, Fragment } from 'react';
import { FileText, Mic, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';

export function EarningsHistory({ history }: any) {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(0); // Default first one expanded

    if (!history) return null;

    const toggleExpand = (i: number) => {
        setExpandedIndex(expandedIndex === i ? null : i);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mt-6">
            <h3 className="text-xl text-gray-500 mb-6">Earnings History</h3>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead>
                        <tr className="text-gray-500 font-bold border-b border-gray-200">
                            <th className="py-2 pr-4">Period</th>
                            <th className="py-2 px-4 text-right">EPS</th>
                            <th className="py-2 px-4 text-right">Beat / Miss</th>
                            <th className="py-2 px-4 text-right">Revenue</th>
                            <th className="py-2 px-4 text-right">YoY</th>
                            <th className="py-2 px-4 text-right">Beat / Miss</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {history.map((item: any, i: number) => {
                            const isExpanded = expandedIndex === i;
                            return (
                                <Fragment key={i}>
                                    <tr
                                        className={`group hover:bg-gray-50 transition-colors cursor-pointer ${isExpanded ? 'bg-gray-50' : ''}`}
                                        onClick={() => toggleExpand(i)}
                                    >
                                        <td className="py-3 pr-4">
                                            <div className="flex items-center gap-2 font-bold text-gray-900">
                                                <button className="p-1 rounded bg-gray-200 hover:bg-gray-300 transition-colors">
                                                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                                </button>
                                                {item.period}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-right font-medium">{item.eps}</td>
                                        <td className={`py-3 px-4 text-right font-bold text-xs ${parseFloat(item.beat || 0) >= 0 ? 'text-green-600' : 'text-red-500'}`}>{item.beat}</td>
                                        <td className="py-3 px-4 text-right font-medium">{item.revenue}</td>
                                        <td className="py-3 px-4 text-right font-medium text-green-600">{item.yoy}</td>
                                        <td className={`py-3 px-4 text-right font-bold text-xs ${parseFloat(item.beatRevenue?.replace('B', '') || 0) >= 0 ? 'text-green-600' : 'text-red-500'}`}>{item.beatRevenue}</td>
                                    </tr>

                                    {/* Expanded Content */}
                                    {isExpanded && (
                                        <tr>
                                            <td colSpan={6} className="px-4 pb-6 pt-2 bg-gray-50 border-b border-gray-100">
                                                <div className="pl-8">
                                                    {/* Articles List */}
                                                    {item.articles && item.articles.length > 0 ? (
                                                        <div className="space-y-4 max-w-4xl">
                                                            {item.articles.map((article: any, j: number) => (
                                                                <div key={j} className="flex gap-3 group/article cursor-pointer">
                                                                    <div className="mt-1 flex-shrink-0">
                                                                        <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs">
                                                                            α
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <h4 className="text-sm font-bold text-blue-600 group-hover/article:underline leading-snug">
                                                                            {article.title}
                                                                        </h4>
                                                                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                                                            <span className="font-semibold text-gray-700">{article.source}</span>
                                                                            <span>•</span>
                                                                            <span>{article.date}</span>
                                                                            <span>•</span>
                                                                            <div className="flex items-center gap-1 hover:text-gray-700">
                                                                                <MessageSquare className="w-3 h-3" />
                                                                                {article.comments} Comments
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="text-gray-500 text-sm italic">No related analysis found for this period.</div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
