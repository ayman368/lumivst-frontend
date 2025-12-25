'use client';

import { HelpCircle } from 'lucide-react';

const GROWTH_GRADE_DATA = {
    grade: "A",
    rows: [
        { label: "Revenue Growth (YoY)", grade: "A+", nvda: "65.22%", median: "9.04%", diff: "621.09%", avg5y: "74.16%", diff5y: "-12.06%" },
        { label: "Revenue Growth (FWD)", grade: "A+", nvda: "73.36%", median: "7.97%", diff: "820.05%", avg5y: "47.29%", diff5y: "55.15%" },
        { label: "EBITDA Growth (YoY)", grade: "A-", nvda: "54.93%", median: "11.78%", diff: "366.22%", avg5y: "136.89%", diff5y: "-59.87%" },
        { label: "EBITDA Growth (FWD)", grade: "A+", nvda: "84.64%", median: "12.23%", diff: "592.15%", avg5y: "68.97%", diff5y: "22.72%" },
        { label: "EBIT Growth (YoY)", grade: "A-", nvda: "55.03%", median: "13.44%", diff: "309.58%", avg5y: "161.39%", diff5y: "-65.90%" },
    ]
};

const CAGR_DATA = [
    { name: "Revenue", yoy: "65.22%", y3: "87.11%", y5: "66.16%", y10: "44.06%" },
    { name: "EBITDA", yoy: "54.93%", y3: "134.69%", y5: "85.78%", y10: "59.95%" },
    { name: "Operation Income (EBIT)", yoy: "55.03%", y3: "147.19%", y5: "92.41%", y10: "63.17%" },
    { name: "Net Income", yoy: "57.27%", y3: "155.36%", y5: "91.76%", y10: "66.66%" },
    { name: "Normalized Net Income", yoy: "54.96%", y3: "149.74%", y5: "93.57%", y10: "63.31%" },
];

function GradeBadge({ grade }: { grade: string }) {
    let color = 'bg-gray-200 text-gray-700';
    if (grade.startsWith('A')) color = 'bg-green-700 text-white';
    else if (grade.startsWith('B')) color = 'bg-green-600 text-white';
    else if (grade.startsWith('C')) color = 'bg-yellow-500 text-black';
    else if (grade.startsWith('D')) color = 'bg-orange-500 text-white';
    else if (grade.startsWith('F')) color = 'bg-red-800 text-white';

    return (
        <span className={`${color} font-bold text-sm px-2 py-1 rounded w-8 h-8 flex items-center justify-center`}>
            {grade}
        </span>
    );
}

export default function GrowthPage() {
    return (
        <div className="space-y-8 py-6">

            {/* Growth Grade Table */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-6">
                    <h2 className="text-2xl font-normal text-gray-600">Growth Grade and Underlying Metrics</h2>
                    <HelpCircle size={18} className="text-gray-400" />
                </div>

                <div className="flex items-center gap-4 mb-6">
                    <span className="font-bold text-gray-800 text-lg">NVDA Growth Grade</span>
                    <GradeBadge grade="A" />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead>
                            <tr className="text-gray-500 border-b border-gray-300 font-bold text-xs uppercase">
                                <th className="text-left py-2 pb-3 w-[25%] font-medium"></th>
                                <th className="py-2 pb-3 w-[10%] font-medium">Sector Relative Grade</th>
                                <th className="py-2 pb-3 w-[12%] font-medium">NVDA</th>
                                <th className="py-2 pb-3 w-[12%] font-medium">Sector Median</th>
                                <th className="py-2 pb-3 w-[12%] font-medium">% Diff. to Sector</th>
                                <th className="py-2 pb-3 w-[12%] font-medium">NVDA 5Y Avg.</th>
                                <th className="py-2 pb-3 w-[12%] font-medium">% Diff. to 5Y Avg.</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {GROWTH_GRADE_DATA.rows.map((row, i) => (
                                <tr key={i} className="hover:bg-gray-50 transition-colors">
                                    <td className="text-left py-3 font-bold text-gray-800 break-words max-w-[200px]">{row.label}</td>
                                    <td className="py-3 flex justify-end pr-8"><GradeBadge grade={row.grade} /></td>
                                    <td className="py-3 font-bold text-gray-900">{row.nvda}</td>
                                    <td className="py-3 text-gray-600">{row.median}</td>
                                    <td className={`py-3 ${row.diff.startsWith('-') ? 'text-red-500' : 'text-green-600'}`}>{row.diff}</td>
                                    <td className="py-3 text-gray-600">{row.avg5y}</td>
                                    <td className={`py-3 ${row.diff5y.startsWith('-') ? 'text-red-500' : 'text-green-600'}`}>{row.diff5y}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* CAGR Table */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h2 className="text-2xl font-normal text-gray-600 mb-6">Compound Annual Growth Rates (TTM)</h2>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead>
                            <tr className="text-gray-500 border-b border-gray-800 font-bold text-xs uppercase">
                                <th className="text-left py-2 pb-3 w-[30%]">Name</th>
                                <th className="py-2 pb-3 w-[15%]">YoY</th>
                                <th className="py-2 pb-3 w-[15%]">3Y</th>
                                <th className="py-2 pb-3 w-[15%]">5Y</th>
                                <th className="py-2 pb-3 w-[15%]">10Y</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {CAGR_DATA.map((row, i) => (
                                <tr key={i} className="hover:bg-gray-50 transition-colors">
                                    <td className="text-left py-3 font-bold text-gray-900">{row.name}</td>
                                    <td className="py-3 text-gray-800">{row.yoy}</td>
                                    <td className="py-3 text-gray-800">{row.y3}</td>
                                    <td className="py-3 text-gray-800">{row.y5}</td>
                                    <td className="py-3 text-gray-800">{row.y10}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}
