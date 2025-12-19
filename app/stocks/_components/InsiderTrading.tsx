'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';


interface InsiderTransaction {
    date: string;
    name: string;
    title: string;
    type: string;
    shares: string;
    price: string;
    value: string;
}

interface InsiderTradingProps {
    data: InsiderTransaction[];
}

export function InsiderTrading({ data }: InsiderTradingProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    if (!data) return null;

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300; // Adjust scroll distance as needed
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 mt-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-normal text-gray-500">Insider Selling & Buying</h3>
                <div className="flex gap-1 text-gray-300 select-none">
                    <ChevronLeft
                        className="w-5 h-5 cursor-pointer hover:text-gray-600 active:text-gray-800 transition-colors"
                        onClick={() => scroll('left')}
                    />
                    <ChevronRight
                        className="w-5 h-5 cursor-pointer text-gray-800 hover:text-black active:scale-95 transition-all"
                        onClick={() => scroll('right')}
                    />
                </div>
            </div>

            {/* Scale styles to hide scrollbar across browsers */}
            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none; /* IE and Edge */
                    scrollbar-width: none; /* Firefox */
                }
            `}</style>

            <div
                ref={scrollContainerRef}
                className="relative overflow-x-auto no-scrollbar"
            >
                <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="text-gray-500 font-bold border-b border-gray-200">
                        <tr>
                            <th className="py-3 pr-6 sticky left-0 bg-white z-20 box-border border-b border-gray-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                <div className="flex items-center gap-1 cursor-pointer hover:text-gray-700">
                                    Date <ChevronDown className="w-3 h-3" />
                                </div>
                            </th>
                            <th className="py-3 px-4">Name</th>
                            <th className="py-3 px-4">Title</th>
                            <th className="py-3 px-4">Transaction Type</th>
                            <th className="py-3 px-4"># Shares</th>
                            <th className="py-3 px-4">Share Price</th>
                            <th className="py-3 px-4">
                                Total Value
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {data.map((row, i) => (
                            <tr key={i} className="hover:bg-gray-50 transition-colors group">
                                <td className="py-3 pr-6 text-gray-900 sticky left-0 bg-white group-hover:bg-gray-50 z-20 border-r border-transparent group-hover:border-gray-100 transition-colors align-top shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                    {row.date}
                                </td>
                                <td className="py-3 px-4 text-blue-600 hover:underline cursor-pointer align-top font-medium">
                                    {row.name}
                                </td>
                                <td className="py-3 px-4 text-gray-900 align-top max-w-[200px] truncate" title={row.title}>
                                    {row.title}
                                </td>
                                <td className={`py-3 px-4 align-top font-medium ${row.type === 'Sell' ? 'text-red-500' : 'text-gray-900'}`}>
                                    {row.type}
                                </td>
                                <td className="py-3 px-4 text-gray-900 align-top">
                                    {row.shares}
                                </td>
                                <td className="py-3 px-4 text-gray-900 align-top">
                                    {row.price}
                                </td>
                                <td className="py-3 px-4 text-gray-900 align-top font-medium">
                                    {row.value}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
