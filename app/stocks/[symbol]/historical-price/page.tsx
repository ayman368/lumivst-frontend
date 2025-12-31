'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Printer, X, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import ChartingTabs from '../../_components/ChartingTabs';
import { MOCK_STOCK_DATA } from '../../data/mockData';

export default function HistoricalPricePage() {
    const data = MOCK_STOCK_DATA.historicalPrice;

    // UI States
    const [isDateOpen, setIsDateOpen] = useState(false);
    const [isShowOpen, setIsShowOpen] = useState(false);
    const [dateRange, setDateRange] = useState("Dec. 27, 2024 - Dec. 27, 2025");
    const [showType, setShowType] = useState("Daily Quotes");

    // Refs for click outside
    const dateDropdownRef = useRef<HTMLDivElement>(null);
    const showDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target as Node)) {
                setIsDateOpen(false);
            }
            if (showDropdownRef.current && !showDropdownRef.current.contains(event.target as Node)) {
                setIsShowOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6">
            {/* Tabs */}
            <div className="flex justify-between items-center mb-6">
                <ChartingTabs activeTab="historical-prices" />
                <div className="flex gap-2">
                    <button className="p-1.5 text-gray-500 hover:text-gray-900 bg-gray-100 border border-gray-200 rounded-sm">
                        <Printer className="w-5 h-5" />
                    </button>
                    <button className="p-1.5 text-gray-500 hover:text-gray-900 bg-gray-100 border border-gray-200 rounded-sm">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="bg-white p-6 mt-6">
                {/* Title */}
                <div className="mb-6">
                    <h1 className="text-[26px] text-[#333333] font-normal mb-2">NVDA Historical Stock Price and Closing Data</h1>
                    <p className="text-[13px] text-[#666666] max-w-5xl leading-relaxed">
                        Access detailed historical stock prices, including daily closing prices, for NVDA. Analyze past performance trends, track price movements, and explore historical data to inform your investment decisions.
                    </p>
                </div>

                {/* Filter Controls */}
                <div className="flex flex-wrap items-center gap-4 mb-6 text-[13px] text-[#333333]">
                    <div className="flex items-center gap-2" ref={dateDropdownRef}>
                        <span className="font-bold text-[#666666]">Set dates</span>
                        <div className="relative">
                            <button
                                onClick={() => setIsDateOpen(!isDateOpen)}
                                className="flex items-center justify-between min-w-[220px] h-[34px] px-3 bg-white hover:bg-gray-50 border border-gray-300 rounded-[3px] text-[#333333] shadow-sm"
                            >
                                <span>{dateRange}</span>
                                <ChevronDown className="w-3 h-3 ml-2 text-[#555555]" />
                            </button>

                            {/* Date Picker Popup */}
                            {isDateOpen && (
                                <div className="absolute top-full left-0 z-20 w-[300px] mt-1 bg-white border border-[#cccccc] rounded shadow-lg p-3">
                                    <div className="flex items-center justify-between gap-2 mb-4 text-sm">
                                        <div className="border border-[#cccccc] rounded-[3px] px-2 py-1.5 w-full text-center text-[#333333] font-medium">12/27/2024</div>
                                        <div className="text-gray-400">-</div>
                                        <div className="border border-[#cccccc] rounded-[3px] px-2 py-1.5 w-full text-center text-[#333333] font-medium">12/27/2025</div>
                                    </div>
                                    <div className="flex items-center justify-between mb-3 px-1">
                                        <button className="p-1 hover:bg-gray-100 rounded text-[#333333]"><ChevronLeft className="w-4 h-4" /></button>
                                        <span className="font-bold text-[#333333] text-sm">December 2024</span>
                                        <button className="p-1 hover:bg-gray-100 rounded text-[#333333]"><ChevronRight className="w-4 h-4" /></button>
                                    </div>
                                    {/* Calendar Grid */}
                                    <div className="grid grid-cols-7 gap-1 text-center text-[11px] mb-3">
                                        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => <div key={d} className="font-bold text-[#333333]">{d}</div>)}
                                        {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                                            <button key={d} className={`h-8 w-8 rounded-full flex items-center justify-center text-sm ${d === 27 ? 'bg-[#ffe4cc] text-[#d95f02] font-bold' : 'text-[#333333] hover:bg-gray-100'}`}>
                                                {d}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-gray-100 mt-2">
                                        <button onClick={() => setIsDateOpen(false)} className="px-4 py-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium">Clear</button>
                                        <button onClick={() => setIsDateOpen(false)} className="px-6 py-1.5 text-sm bg-black text-white rounded-[3px] font-bold hover:bg-gray-800">Apply</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2" ref={showDropdownRef}>
                        <span className="font-bold text-[#666666]">Show</span>
                        <div className="relative">
                            <button
                                onClick={() => setIsShowOpen(!isShowOpen)}
                                className="flex items-center justify-between min-w-[140px] h-[34px] px-3 bg-white hover:bg-gray-50 border border-gray-300 rounded-[3px] text-[#333333] shadow-sm"
                            >
                                <span>{showType}</span>
                                <ChevronDown className="w-3 h-3 ml-2 text-[#555555]" />
                            </button>
                            {isShowOpen && (
                                <div className="absolute top-full left-0 z-20 min-w-[160px] mt-1 bg-white border border-[#cccccc] rounded-[3px] shadow-lg py-2">
                                    {['Daily Quotes', 'Weekly Quotes', 'Monthly Quotes', 'Dividends only', 'Splits only'].map((opt, i) => (
                                        <button
                                            key={opt}
                                            onClick={() => {
                                                setShowType(opt);
                                                setIsShowOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-[13px] hover:bg-[#f2f2f2] text-[#0055b3] ${i < 3 ? 'border-b border-gray-100 last:border-0' : ''}`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="font-bold text-[#666666]">Adj</span>
                        <div className="relative px-2">
                            <button
                                className="flex items-center justify-between min-w-[120px] h-[34px] px-3 bg-white hover:bg-gray-50 border border-gray-300 rounded-[3px] text-[#333333] shadow-sm"
                            >
                                <span>Splits only</span>
                                <ChevronDown className="w-3 h-3 ml-2 text-[#555555]" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-[13px] border-collapse">
                        <thead>
                            <tr className="border-b border-[#cccccc]">
                                <th className="py-2 px-2 text-left font-bold text-[#333333]">Date</th>
                                <th className="py-2 px-2 text-right font-bold text-[#333333]">Open</th>
                                <th className="py-2 px-2 text-right font-bold text-[#333333]">High</th>
                                <th className="py-2 px-2 text-right font-bold text-[#333333]">Low</th>
                                <th className="py-2 px-2 text-right font-bold text-[#333333]">Close*</th>
                                <th className="py-2 px-2 text-right font-bold text-[#333333]">Change %</th>
                                <th className="py-2 px-2 text-right font-bold text-[#333333]">Volume</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data?.map((row: any, i: number) => {
                                const isNegative = row.change.startsWith('-');
                                const changeColor = isNegative ? 'text-red-500' : 'text-green-600';

                                return (
                                    <tr key={i} className="hover:bg-gray-50">
                                        <td className="py-3 px-2 text-left font-medium text-gray-700">{row.date}</td>
                                        <td className="py-3 px-2 text-right text-gray-900">{row.open}</td>
                                        <td className="py-3 px-2 text-right text-gray-900">{row.high}</td>
                                        <td className="py-3 px-2 text-right text-gray-900">{row.low}</td>
                                        <td className="py-3 px-2 text-right text-gray-900">{row.close}</td>
                                        <td className={`py-3 px-2 text-right font-medium ${changeColor}`}>{row.change}</td>
                                        <td className="py-3 px-2 text-right text-gray-900">{row.volume}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4 text-xs text-gray-500">
                    *Close price adjusted for splits.
                </div>
            </div>
        </div>
    );
}
