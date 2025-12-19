'use client';
import { Plus } from "lucide-react";

interface SeasonalityProps {
    data?: {
        months: any[];
        years: any[];
    }
}

export function Seasonality({ data }: SeasonalityProps) {
    if (!data) return null;

    const maxVal = Math.max(...data.months.map(m => Math.max(Math.abs(m.median), Math.abs(m.mean)))) * 1.2;

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const getBarHeight = (val: number) => {
        return (Math.abs(val) / maxVal) * 100;
    };

    return (
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-bold text-gray-700">Seasonality</h3>
                <button className="flex items-center gap-1 text-blue-600 text-sm font-bold hover:underline">
                    <Plus className="w-4 h-4" />
                    Seasonality Stocks To Home Page
                </button>
            </div>
            <p className="text-sm text-gray-500 mb-8">Displays mean and median monthly returns for <span className="text-blue-600 font-bold">NVDA</span> in order to identify seasonal patterns.</p>

            {/* Legend */}
            <div className="flex justify-end gap-6 mb-4 text-xs font-bold">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span>Median</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-800"></div>
                    <span>Mean</span>
                </div>
            </div>

            {/* Chart Area */}
            <div className="relative h-[250px] border-b border-gray-200 mb-6 mr-8">
                {/* Y-Axis Lines (Simplified) */}
                {[20, 15, 10, 5, 0, -5].map((val) => (
                    <div key={val} className="absolute w-full border-t border-gray-100 flex items-center" style={{ bottom: `${((val + 5) / (maxVal + 5)) * 100}%` }}>
                        <span className="absolute -right-8 text-xs text-gray-400">{val}%</span>
                    </div>
                ))}

                {/* Zero Line */}
                <div className="absolute w-full border-t border-gray-300" style={{ bottom: `${(5 / (maxVal + 5)) * 100}%` }}></div>


                {/* Bars */}
                <div className="absolute inset-0 flex justify-between px-4 items-end h-full">
                    {data.months.map((m, i) => (
                        <div key={i} className="flex flex-col items-center gap-1 w-full h-full justify-end relative pb-6">
                            {/* Bars Container */}
                            <div className="absolute w-full h-full flex justify-center items-end gap-1">
                                {/* Median Bar */}
                                <div
                                    className="w-2.5 bg-orange-500 rounded-t-sm"
                                    style={{
                                        height: `${(Math.abs(m.median) / 25) * 100}%`,
                                        marginBottom: m.median >= 0 ? '20%' : `calc(20% - ${(Math.abs(m.median) / 25) * 100}%)`,
                                        transform: m.median < 0 ? 'translateY(100%)' : 'none'
                                    }}
                                ></div>
                                {/* Mean Bar */}
                                <div
                                    className="w-2.5 bg-gray-800 rounded-t-sm"
                                    style={{
                                        height: `${(Math.abs(m.mean) / 25) * 100}%`,
                                        marginBottom: m.mean >= 0 ? '20%' : `calc(20% - ${(Math.abs(m.mean) / 25) * 100}%)`,
                                        transform: m.mean < 0 ? 'translateY(100%)' : 'none'
                                    }}
                                ></div>
                            </div>

                            <span className="absolute bottom-0 text-xs text-gray-500 font-medium">{m.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                    <thead>
                        <tr className="border-b border-gray-200 text-gray-500">
                            <th className="text-left py-2 font-medium">Year</th>
                            {months.map(m => <th key={m} className="py-2 font-medium px-2">{m}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-gray-100">
                            <td className="text-left py-2 font-bold text-gray-700">Win Rate</td>
                            {data.months.map((m, i) => (
                                <td key={i} className="py-2 font-bold text-gray-900">{m.winRate}%</td>
                            ))}
                        </tr>
                        {/* We can calculate 10yr avg from mock data or just mock it for now since it wasn't explicitly in the JSON structure I made, I'll skip avg rows or add them back if needed, focusing on years provided */}
                        {data.years.map((y, idx) => (
                            <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50">
                                <td className="text-left py-2 font-medium text-gray-600">{y.year}</td>
                                {y.values.map((v: number | null, i: number) => (
                                    <td key={i} className={`py-2 px-2 ${(v || 0) > 0 ? 'text-green-600' : (v || 0) < 0 ? 'text-red-500' : 'text-gray-300'}`}>
                                        {v !== null ? `${v}%` : '-'}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
