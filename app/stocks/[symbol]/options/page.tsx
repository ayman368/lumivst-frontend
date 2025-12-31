'use client';
import { useState } from 'react';
import { ChevronDown, ChevronRight, Settings, SlidersHorizontal, Table, List } from 'lucide-react';
import { MOCK_STOCK_DATA } from '../../data/mockData';

export default function OptionsPage() {
    const data = MOCK_STOCK_DATA.options;
    const [selectedDate, setSelectedDate] = useState(data?.expirationDates[0] || "");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCallsExpanded, setIsCallsExpanded] = useState(true);

    if (!data) return null;

    return (
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6">
            <h1 className="text-2xl text-gray-700 font-normal mb-6">NVDA Call and Put Options</h1>

            {/* Controls Bar */}
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <div className="flex items-center gap-4">
                    {/* Date Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="flex items-center justify-between min-w-[160px] px-3 py-1.5 bg-gray-100/50 hover:bg-gray-100 border border-gray-200 rounded text-sm font-medium text-gray-700"
                        >
                            {selectedDate}
                            <ChevronDown className="w-4 h-4 ml-2 text-gray-500" />
                        </button>

                        {isMenuOpen && (
                            <div className="absolute top-full left-0 z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                {data.expirationDates.map((date: string) => (
                                    <button
                                        key={date}
                                        onClick={() => {
                                            setSelectedDate(date);
                                            setIsMenuOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${date === selectedDate ? 'font-bold text-gray-900 bg-gray-50' : 'text-gray-600'}`}
                                    >
                                        {date}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Calls Section */}
            <div className="mb-8">
                <button
                    onClick={() => setIsCallsExpanded(!isCallsExpanded)}
                    className="flex items-center gap-2 mb-4 group"
                >
                    <div className={`p-0.5 rounded bg-gray-500 group-hover:bg-gray-600 transition-colors`}>
                        {isCallsExpanded ? (
                            <ChevronDown className="w-4 h-4 text-white" />
                        ) : (
                            <ChevronRight className="w-4 h-4 text-white" />
                        )}
                    </div>
                    <span className="text-lg font-bold text-gray-900">Calls</span>
                </button>

                {
                    isCallsExpanded && (
                        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm whitespace-nowrap">
                                    <thead className="bg-white border-b border-gray-200">
                                        <tr>
                                            {["Strike", "Price", "Change", "% Change", "Bid", "Ask", "Volume", "Open Int", "Last Trade Time"].map((h) => (
                                                <th key={h} className="py-3 px-4 text-right font-bold text-gray-600 text-xs uppercase tracking-wider sticky top-0 bg-white">
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {data.calls.map((row: any, i: number) => {
                                            const isNegative = row.change.startsWith('-');
                                            const changeColor = isNegative ? 'text-red-500' : 'text-green-600';

                                            return (
                                                <tr key={i} className="hover:bg-gray-50/80 transition-colors">
                                                    <td className="py-3 px-4 text-center font-bold text-gray-700 bg-gray-50 border-r border-gray-200">
                                                        {row.strike}
                                                    </td>
                                                    <td className="py-3 px-4 text-right font-medium text-gray-900">{row.price}</td>
                                                    <td className={`py-3 px-4 text-right font-medium ${changeColor}`}>{row.change}</td>
                                                    <td className={`py-3 px-4 text-right font-medium ${changeColor}`}>{row.changePercent}</td>
                                                    <td className="py-3 px-4 text-right text-gray-600">{row.bid}</td>
                                                    <td className="py-3 px-4 text-right text-gray-600">{row.ask}</td>
                                                    <td className="py-3 px-4 text-right text-gray-600">{row.volume}</td>
                                                    <td className="py-3 px-4 text-right text-gray-600">{row.openInt}</td>
                                                    <td className="py-3 px-4 text-right text-gray-500 text-xs">{row.lastTrade}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                }
            </div >

            {/* Puts Section (Placeholder structure as per Calls) */}
            <div>
                {/* Logic would be duplicated for Puts, but focusing on Calls as requested/shown */}
            </div >
        </div >
    );
}
