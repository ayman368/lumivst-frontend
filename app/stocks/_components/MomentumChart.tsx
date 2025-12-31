'use client';
import { useState } from 'react';
import { Settings, Share2, Calendar, FileText, BarChart2 } from 'lucide-react';

interface ChartSummary {
    label: string;
    value: string;
    color: string;
    sub?: string;
}

interface MomentumChartProps {
    title: string;
    summary: ChartSummary[];
    children?: React.ReactNode; // For extra content like the table in Moving Averages
    isMovingAverage?: boolean; // To render multiple lines
}

export function MomentumChart({ title, summary, children, isMovingAverage = false }: MomentumChartProps) {
    const [range, setRange] = useState('1Y');
    const ranges = ['1M', '6M', '1Y', '5Y', '10Y', 'MAX'];

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-xl font-normal text-gray-700 mb-6">{title}</h3>

            {/* Controls */}
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <div className="flex flex-wrap gap-1">
                    {ranges.map((r) => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            className={`
                                px-3 py-1.5 text-xs font-semibold rounded border transition-all
                                ${range === r
                                    ? 'bg-gray-800 text-white border-gray-800'
                                    : 'bg-white border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                }
                            `}
                        >
                            {r}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 border border-gray-200 rounded hover:bg-gray-50"><Settings className="w-4 h-4" /></button>
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 border border-gray-200 rounded hover:bg-gray-50"><BarChart2 className="w-4 h-4" /></button>
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 border border-gray-200 rounded hover:bg-gray-50"><Share2 className="w-4 h-4" /></button>
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 border border-gray-200 rounded hover:bg-gray-50"><Calendar className="w-4 h-4" /></button>
                    {/* Add Comparison Button */}
                    {!isMovingAverage && (
                        <button className="px-3 py-1.5 text-xs font-semibold text-gray-500 border border-gray-200 rounded hover:bg-gray-50 flex items-center gap-1">
                            + Add Comparison
                        </button>
                    )}
                </div>
            </div>

            {/* Summary Badges */}
            <div className="flex flex-wrap gap-4 mb-6">
                {summary.map((item, i) => (
                    <div key={i} className="flex flex-col border border-gray-200 rounded px-4 py-2 min-w-[140px]">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                            <span className="text-xs font-bold text-gray-700 uppercase">{item.label}</span>
                        </div>
                        <div className="flex justify-between items-end">
                            <span className="text-sm text-gray-500">{item.sub || 'Performance'}</span>
                            <span className="text-lg font-bold text-gray-900">{item.value}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Extra Content (Table) */}
            {children}

            {/* Chart Area */}
            <div className="relative h-[300px] w-full border-t border-gray-100 mt-4 pt-4">
                {/* Y-Axis Grid */}
                <div className="absolute inset-0 flex flex-col justify-between text-xs text-gray-400 pointer-events-none pr-4">
                    {[75, 50, 25, 0, -25, -50].map((val, i) => (
                        <div key={i} className="flex items-center justify-end w-full h-0">
                            <div className="w-full border-t border-gray-100 mr-2"></div>
                            <span className="w-8 text-right">{val}%</span>
                        </div>
                    ))}
                </div>

                <svg className="w-[calc(100%-40px)] h-full absolute top-0 left-0" preserveAspectRatio="none">
                    {/* Line 1 (Orange/Primary) */}
                    <path
                        d="M0,180 C50,180 100,160 150,140 C200,150 250,120 300,110 C350,100 400,115 450,90 C500,80 550,60 600,70 C650,50 700,60 750,40 C800,30 850,50 900,45 C950,40 1000,20 1000,20"
                        fill="none"
                        stroke={summary[0]?.color || "#f97316"}
                        strokeWidth="2"
                        vectorEffect="non-scaling-stroke"
                    />
                    {/* Line 2 (Blue/Secondary) */}
                    {!isMovingAverage && summary[1] && (
                        <path
                            d="M0,180 C50,175 100,170 150,165 C200,160 250,155 300,150 C350,145 400,140 450,135 C500,133 550,130 600,128 C650,125 700,120 750,118 C800,115 850,112 900,110 C950,108 1000,105 1000,105"
                            fill="none"
                            stroke={summary[1]?.color || "#3b82f6"}
                            strokeWidth="2"
                            vectorEffect="non-scaling-stroke"
                        />
                    )}

                    {/* Moving Average Extra Lines */}
                    {isMovingAverage && (
                        <>
                            <path d="M0,180 C100,170 300,160 600,140 1000,120" fill="none" stroke="#3b82f6" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                            <path d="M0,190 C100,180 300,170 600,150 1000,130" fill="none" stroke="#d946ef" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                            <path d="M0,200 C100,190 300,180 600,160 1000,140" fill="none" stroke="#22c55e" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                            <path d="M0,220 C100,210 300,200 600,180 1000,160" fill="none" stroke="#ef4444" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                        </>
                    )}
                </svg>

                {/* X-Axis Labels and Ticks */}
                <div className="absolute top-full left-0 right-10 mt-1">
                    <div className="flex justify-between w-full">
                        {['Feb \'25', 'May \'25', 'Aug \'25', 'Nov \'25'].map((label, i) => (
                            <div key={i} className="flex flex-col items-center" style={{ width: '40px' }}>
                                {/* Tick Mark */}
                                <div className="w-px h-1.5 bg-gray-300 mb-1"></div>
                                {/* Label */}
                                <span className="text-[10px] text-gray-500 font-medium">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {/* Spacer for labels */}
            <div className="h-6"></div>
        </div>
    );
}
