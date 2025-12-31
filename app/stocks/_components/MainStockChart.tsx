'use client';

import React, { useState } from 'react';
import { Calendar, Settings, Share2, Plus } from 'lucide-react';

export default function MainStockChart() {
    const [timeRange, setTimeRange] = useState('1Y');

    const ranges = ['1D', '5D', '1M', '6M', 'YTD', '1Y', '3Y', '5Y', '10Y'];

    return (
        <div className="bg-white rounded-lg p-6">
            <h2 className="text-xl text-gray-500 mb-4 font-light">NVDA stock vs. SP500 chart</h2>

            {/* Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex gap-2">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50">
                        <Plus className="w-3.5 h-3.5" />
                        Select Symbols
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50">
                        <Plus className="w-3.5 h-3.5" />
                        Select Metrics
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center border border-gray-300 rounded overflow-hidden">
                        {ranges.map((r) => (
                            <button
                                key={r}
                                onClick={() => setTimeRange(r)}
                                className={`px-3 py-1.5 text-xs font-medium transition-colors ${timeRange === r
                                    ? 'bg-gray-900 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-50 border-l first:border-l-0 border-gray-200'
                                    }`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>
                    <button className="p-1.5 text-gray-500 hover:text-gray-900 border border-gray-300 rounded bg-white">
                        <Calendar className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-gray-500 hover:text-gray-900 border border-gray-300 rounded bg-white">
                        <Settings className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-gray-500 hover:text-gray-900 border border-gray-300 rounded bg-white">
                        <Share2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Legend / Stats */}
            <div className="flex gap-4 mb-6">
                <div className="flex items-center justify-between p-2 pl-3 pr-2 bg-white border border-gray-200 rounded-md w-48 shadow-sm">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
                            <span className="text-xs font-bold text-gray-700">NVDA</span>
                        </div>
                        <span className="text-[10px] text-gray-400">Price Return</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">36.16%</span>
                </div>

                <div className="flex items-center justify-between p-2 pl-3 pr-2 bg-white border border-gray-200 rounded-md w-48 shadow-sm">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                            <span className="text-xs font-bold text-gray-700">SP500</span>
                        </div>
                        <span className="text-[10px] text-gray-400">Price Return</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">14.78%</span>
                </div>
            </div>

            {/* Chart Area */}
            <div className="relative h-[350px] w-full mt-4">
                {/* Y-Axis Labels */}
                <div className="absolute top-0 left-0 bottom-8 flex flex-col justify-between text-xs text-gray-400 font-medium">
                    <span>50%</span>
                    <span>25%</span>
                    <span>0%</span>
                    <span>-25%</span>
                    <span>-50%</span>
                </div>

                {/* Chart SVG */}
                <div className="absolute top-0 left-10 right-0 bottom-8">
                    {/* Horizontal Grid Lines */}
                    <div className="w-full h-full flex flex-col justify-between">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="w-full h-px bg-gray-100"></div>
                        ))}
                    </div>

                    {/* Lines */}
                    <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
                        {/* NVDA Line (Orange) */}
                        <path
                            d="M0 150 C 20 160, 40 130, 60 140 S 100 170, 150 120 S 250 140, 300 90 S 400 110, 500 80 S 600 60, 700 80 S 800 50, 900 60 S 1000 40, 1200 30"
                            fill="none"
                            stroke="#f97316"
                            strokeWidth="2"
                            vectorEffect="non-scaling-stroke"
                        />
                        {/* SP500 Line (Blue) */}
                        <path
                            d="M0 150 L 50 155 L 100 145 L 200 150 L 300 140 L 400 135 L 500 130 L 700 120 L 900 110 L 1200 105"
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="2"
                            vectorEffect="non-scaling-stroke"
                        />
                    </svg>
                </div>

                {/* X-Axis Labels */}
                <div className="absolute bottom-0 left-10 right-0 flex justify-between text-xs text-gray-500 pt-2">
                    <span className="invisible">Start</span> {/* Spacer */}
                    <span>Feb '25</span>
                    <span>May '25</span>
                    <span>Aug '25</span>
                    <span>Nov '25</span>
                    <span className="invisible">End</span> {/* Spacer */}
                </div>
            </div>
        </div>
    );
}
