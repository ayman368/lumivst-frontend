'use client';

import { HelpCircle } from 'lucide-react';

const PROFITABILITY_GRADE_DATA = {
    grade: "A+",
    rows: [
        { label: "Gross Profit Margin (TTM)", grade: "B+", nvda: "70.05%", median: "48.65%", diff: "43.98%", avg5y: "66.60%", diff5y: "5.18%" },
        { label: "EBIT Margin (TTM)", grade: "A+", nvda: "58.84%", median: "6.10%", diff: "865.13%", avg5y: "41.63%", diff5y: "41.34%" },
        { label: "EBITDA Margin (TTM)", grade: "A+", nvda: "60.22%", median: "10.48%", diff: "474.72%", avg5y: "45.51%", diff5y: "32.31%" },
        { label: "Net Income Margin (TTM)", grade: "A+", nvda: "53.01%", median: "4.97%", diff: "966.42%", avg5y: "37.58%", diff5y: "41.05%" },
        { label: "Levered FCF Margin (TTM)", grade: "A", nvda: "28.47%", median: "11.23%", diff: "153.51%", avg5y: "27.36%", diff5y: "4.06%" },
        { label: "Return on Common Equity (TTM)", grade: "A+", nvda: "107.36%", median: "6.43%", diff: "1,570.04%", avg5y: "64.86%", diff5y: "65.53%" },
        { label: "Return on Total Capital (TTM)", grade: "A+", nvda: "66.87%", median: "4.08%", diff: "1,539.05%", avg5y: "34.84%", diff5y: "91.93%" },
    ]
};

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

export default function ProfitabilityPage() {
    return (
        <div className="space-y-8 py-6">

            {/* Profitability Grade Table */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-6">
                    <h2 className="text-2xl font-normal text-gray-600">Profitability Grade and Underlying Metrics</h2>
                    <HelpCircle size={18} className="text-gray-400" />
                </div>

                <div className="flex items-center gap-4 mb-6">
                    <span className="font-bold text-gray-800 text-lg">NVDA Profitability Grade</span>
                    <GradeBadge grade="A+" />
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
                            {PROFITABILITY_GRADE_DATA.rows.map((row, i) => (
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

        </div>
    );
}
