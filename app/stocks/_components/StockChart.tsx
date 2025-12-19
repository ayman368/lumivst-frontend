'use client';
import { useState } from 'react';
import { Settings, Maximize2 } from 'lucide-react';

export function StockChart() {
    const [range, setRange] = useState('1Y');

    const ranges = ['1D', '5D', '1M', '6M', 'YTD', '1Y', '5Y', '10Y', 'MAX'];

    // Stats to be displayed on the right
    const chartStats = [
        { label: 'EPS (FWD)', value: '4.69' },
        { label: 'PE (FWD)', value: '37.36' },
        { label: 'Div Rate (FWD)', value: '$0.04' },
        { label: 'Yield (FWD)', value: '0.02%' },
        { label: 'Short Interest', value: '0.98%' },
        { label: 'Market Cap', value: '$4.25T' },
        { label: 'Volume', value: '204,274,918' },
        { label: 'Prev. Close', value: '$180.93' },
    ];

    return (
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
            {/* Header Controls */}
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <button className="flex items-center gap-2 px-3 py-1.5 border border-orange-500 text-orange-600 text-sm font-semibold rounded hover:bg-orange-50 transition-colors">
                    <Settings className="w-4 h-4" />
                    Adv Chart
                </button>

                <div className="flex flex-wrap gap-1">
                    {ranges.map((r) => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            className={`
                                relative px-3 py-1 text-xs font-semibold rounded transition-all
                                ${range === r
                                    ? 'bg-gray-900 text-white shadow-sm'
                                    : 'bg-white border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-300'
                                }
                            `}
                        >
                            {r}
                            {range === r && (
                                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-green-700 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap z-20">
                                    +27.44%
                                    {/* Triangle pointer */}
                                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[4px] border-b-green-700"></div>
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">

                {/* Chart Area (Left) */}
                <div className="flex-grow h-[350px] relative">
                    {/* Y-Axis Grid Lines */}
                    <div className="absolute inset-0 flex flex-col justify-between text-xs text-gray-400 pointer-events-none pr-8">
                        {[200, 175, 150, 125, 100, 75].map((val, i) => (
                            <div key={i} className="flex items-center w-full">
                                <div className="w-full border-t border-gray-100 border-dashed mr-2"></div>
                                <span className="w-6 text-right">{val}</span>
                            </div>
                        ))}
                    </div>

                    <svg className="w-[calc(100%-24px)] h-full absolute top-0 left-0" preserveAspectRatio="none">
                        {/* Main Price Line (Orange) - Smoother, Stretched Path */}
                        <path
                            d="M0,280 C40,280 40,270 80,275 C120,280 160,290 200,280 C240,270 280,260 320,265 C360,270 400,240 440,230 C480,220 520,210 560,200 C600,190 640,200 680,180 C720,160 760,180 800,185 C840,190 880,180 920,175 C960,170 1000,160 1000,160"
                            fill="none"
                            stroke="#f97316"
                            strokeWidth="2"
                            vectorEffect="non-scaling-stroke"
                        />

                        {/* Volume Bars (Gray, at bottom) */}
                        {[...Array(60)].map((_, i) => (
                            <rect
                                key={i}
                                x={`${i * (100 / 60)}%`}
                                y={`${(85 + (Math.sin(i * 1321) * 7.5 + 7.5)).toFixed(2)}%`} // Deterministic "random" look
                                width="1%"
                                height="15%"
                                fill="#d1d5db"
                                opacity="0.6"
                            />
                        ))}
                    </svg>

                    {/* X-Axis Labels */}
                    <div className="absolute -bottom-6 left-0 right-8 flex justify-between text-xs text-gray-500 font-medium">
                        <span>Feb 2025</span>
                        <span>Apr 2025</span>
                        <span>Jun 2025</span>
                        <span>Aug 2025</span>
                        <span>Oct 2025</span>
                        <span>Dec 2025</span>
                    </div>

                </div>

                {/* Info Column (Right) */}
                <div className="lg:w-[250px] flex-shrink-0 space-y-6">

                    {/* 52 Week Range */}
                    <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>52 Week Range</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>88.62</span>
                            <span>212.19</span>
                        </div>
                        <div className="relative h-1.5 bg-gray-200 rounded-full w-full">
                            <div className="absolute top-1/2 -translate-y-1/2 left-[70%] w-3 h-3 bg-gray-600 rounded-full border-2 border-white shadow-sm"></div>
                        </div>
                    </div>

                    {/* Day Range */}
                    <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Day Range</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>174.62</span>
                            <span>182.82</span>
                        </div>
                        <div className="relative h-1.5 bg-gray-200 rounded-full w-full">
                            <div className="absolute top-1/2 -translate-y-1/2 left-[40%] w-3 h-3 bg-gray-600 rounded-full border-2 border-white shadow-sm"></div>
                        </div>
                    </div>

                    {/* Stats List */}
                    <div className="space-y-2 pt-2">
                        {chartStats.map((stat, i) => (
                            <div key={i} className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">{stat.label}</span>
                                <span className="text-gray-900 font-medium">{stat.value}</span>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
}

