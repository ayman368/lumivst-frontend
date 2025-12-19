import { MessageSquare, Bookmark } from 'lucide-react';

interface AnalysisItem {
    id: number;
    title: string;
    author: string;
    rating?: string;
    date: string;
    comments?: number;
}

export function AnalysisList({ items }: { items: AnalysisItem[] }) {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 h-full">
            <div className="p-5 border-b border-gray-100">
                <h3 className="text-xl font-medium text-gray-700">Analysis</h3>
            </div>
            <div className="divide-y divide-gray-50">
                {items.map((item) => (
                    <div key={item.id} className="p-5 hover:bg-gray-50 transition-colors cursor-pointer group">
                        <div className="flex gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                                {/* Placeholder avatar */}
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${item.author}`} alt={item.author} className="w-full h-full" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-900 leading-snug mb-1 group-hover:text-blue-600 transition-colors">
                                    {item.title}
                                </h4>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                    {item.rating && (
                                        <span className="font-bold text-green-700 bg-green-50 px-1 rounded border border-green-100">{item.rating}</span>
                                    )}
                                    <span className="text-blue-600 font-medium">{item.author}</span>
                                    <span>•</span>
                                    <span>{item.date}</span>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
                                    <span className="flex items-center gap-1 hover:text-gray-600">
                                        <MessageSquare className="w-3 h-3" />
                                        {item.comments || 0} Comments
                                    </span>
                                    <span className="flex items-center gap-1 hover:text-gray-600">
                                        <Bookmark className="w-3 h-3" />
                                        Save
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-4 border-t border-gray-100">
                <button className="text-sm font-bold text-blue-600 hover:underline">See All Analysis »</button>
            </div>
        </div>
    );
}
