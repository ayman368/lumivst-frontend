'use client';
import { Download } from 'lucide-react';

export function PricePerformanceTable({ data }: { data: any }) {
    if (!data) return null;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-normal text-gray-600">Price Performance</h2>
                <button className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-900 border border-gray-200 rounded px-2 py-1 hover:bg-gray-50 transition-colors">
                    Download to Spreadsheet <Download className="w-3 h-3" />
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="py-3 text-left font-bold text-gray-900 w-1/5"></th>
                            {data.headers.map((h: string) => (
                                <th key={h} className="py-3 px-4 font-bold text-gray-500 text-xs uppercase tracking-wider">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.rows.map((row: any, i: number) => (
                            <tr key={i} className="hover:bg-gray-50/50">
                                <td className={`py-4 text-left font-bold border-r border-gray-100 pr-4 ${row.label === 'Price Return' || row.label === 'Total Return' ? 'text-gray-900' : 'text-gray-500'}`}>
                                    {row.label}
                                </td>
                                {row.values.map((val: string, j: number) => {
                                    // Determine color based on value
                                    let colorClass = "text-gray-700";
                                    if (val.includes('%')) {
                                        const num = parseFloat(val.replace(/[%+,]/g, ''));
                                        if (num > 0) colorClass = "text-green-600";
                                        // else if (num < 0) colorClass = "text-red-600"; // Usually tables use green for positive, standard/red for negative.
                                        // In the image provided, all visible are green. Lets assume green for pos.
                                        // Actually S&P values are green too.
                                    }
                                    return (
                                        <td key={j} className={`py-4 px-4 font-medium ${colorClass} text-xs`}>
                                            {val}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
