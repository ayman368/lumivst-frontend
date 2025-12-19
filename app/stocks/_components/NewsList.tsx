import { MessageSquare, Bookmark } from 'lucide-react';

interface NewsItem {
    id: number;
    title: string;
    source: string;
    date: string;
    comments?: number;
}

export function NewsList({ items }: { items: NewsItem[] }) {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 h-full">
            <div className="p-5 border-b border-gray-100">
                <h3 className="text-xl font-medium text-gray-700">News</h3>
            </div>
            <div className="divide-y divide-gray-50">
                {items.map((item) => (
                    <div key={item.id} className="p-5 hover:bg-gray-50 transition-colors cursor-pointer group">
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-400 font-bold text-xs ring-1 ring-gray-200">
                                {/* Placeholder source icon */}
                                {item.source.substring(0, 2)}
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-900 leading-snug mb-1 group-hover:text-blue-600 transition-colors">
                                    {item.title}
                                </h4>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                    <span className="text-gray-600 font-medium">{item.source}</span>
                                    <span>•</span>
                                    <span>{item.date}</span>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
                                    {item.comments && (
                                        <span className="flex items-center gap-1 hover:text-gray-600">
                                            <MessageSquare className="w-3 h-3" />
                                            {item.comments} Comments
                                        </span>
                                    )}
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
                <button className="text-sm font-bold text-blue-600 hover:underline">See All News »</button>
            </div>
        </div>
    );
}
