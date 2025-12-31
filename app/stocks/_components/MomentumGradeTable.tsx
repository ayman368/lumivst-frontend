'use client';
import { HelpCircle } from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';

export function MomentumGradeTable({ data, symbol }: { data: any, symbol: string }) {
    if (!data) return null;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
                <h2 className="text-xl font-medium text-gray-700">Momentum Grade and Underlying Metrics</h2>
                <Tooltip content="Momentum Grade based on relative performance">
                    <HelpCircle className="w-4 h-4 text-gray-400 cursor-help" />
                </Tooltip>
            </div>

            <div className="flex items-center gap-3 mb-6">
                <h3 className="text-lg font-bold text-gray-900">{symbol} Momentum Grade</h3>
                <span className={`px-2 py-0.5 rounded text-sm font-bold bg-green-700 text-white`}>
                    {data.grade}
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="py-3 font-semibold text-gray-900 border-r border-gray-100 pr-4"></th>
                            <th className="py-3 px-4 font-semibold text-gray-600 text-center whitespace-nowrap">Sector Relative Grade</th>
                            <th className="py-3 px-4 font-semibold text-gray-600 text-right whitespace-nowrap">{symbol}</th>
                            <th className="py-3 px-4 font-semibold text-gray-600 text-right whitespace-nowrap">Sector Median</th>
                            <th className="py-3 px-4 font-semibold text-gray-600 text-right whitespace-nowrap">% Diff. to Sector</th>
                            <th className="py-3 px-4 font-semibold text-gray-600 text-right border-l border-gray-100 whitespace-nowrap">{symbol} 5Y Avg.</th>
                            <th className="py-3 px-4 font-semibold text-gray-600 text-right whitespace-nowrap">% Diff. to 5Y Avg.</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.underlyingMetrics.map((row: any, i: number) => (
                            <tr key={i} className="hover:bg-gray-50/50">
                                <td className="py-4 font-bold text-gray-900 border-r border-gray-100 pr-4 w-1/4">
                                    {row.metric}
                                </td>
                                <td className="py-4 px-4 text-center">
                                    <span className="bg-green-700 text-white font-bold text-xs px-2 py-1 rounded">
                                        {row.grade}
                                    </span>
                                </td>
                                <td className="py-4 px-4 text-right font-bold text-gray-900">{row.value}</td>
                                <td className="py-4 px-4 text-right text-gray-600">{row.sectorMedian}</td>
                                <td className="py-4 px-4 text-right text-gray-600">{row.diffToSector}</td>
                                <td className="py-4 px-4 text-right text-gray-600 border-l border-gray-100">{row.fiveYearAvg}</td>
                                <td className="py-4 px-4 text-right text-gray-600">{row.diffToFiveYear}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 text-xs text-gray-500 space-y-1">
                <p>*Grades are relative to the <span className="text-blue-600 cursor-pointer hover:underline">Information Technology</span> sector</p>
                <p>**NM signifies a non meaningful value. A dash signifies the data is not available.</p>
            </div>
        </div>
    );
}
