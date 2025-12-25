'use client';

const VALUATION_GRADE_DATA = {
    grade: "F",
    rows: [
        { label: "P/E Non-GAAP (FWD)", grade: "D+", nvda: "44.89", median: "24.32", diff: "83.79%", avg5y: "61.59", diff5y: "-27.45%" },
        { label: "P/E Non-GAAP (TTM)", grade: "D+", nvda: "38.55", median: "24.27", diff: "59.01%", avg5y: "45.73", diff5y: "-15.61%" },
        { label: "P/E GAAP (TTM)", grade: "C-", nvda: "44.80", median: "30.95", diff: "44.75%", avg5y: "79.97", diff5y: "-43.98%" },
        { label: "P/E GAAP (FWD)", grade: "C-", nvda: "39.40", median: "31.53", diff: "24.96%", avg5y: "57.57", diff5y: "-31.56%" },
        { label: "PEG GAAP (TTM)", grade: "F+", nvda: "0.75", median: "1.00", diff: "-24.66%", avg5y: "-", diff5y: "NM" },
    ]
};

const CAPITAL_STRUCTURE_DATA = [
    { label: "Market Cap", value: "$4.40T" },
    { label: "Total Debt", value: "$10.92B" },
    { label: "Cash", value: "$50.61B" },
    { label: "Other", value: "-" },
    { label: "Enterprise Value", value: "$4.35T" },
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

export default function ValuationPage() {
    return (
        <div className="space-y-8">
            <div className="space-y-8">

                {/* Valuation Grade Table */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-normal text-gray-600 mb-6">Valuation Grade and Underlying Metrics</h2>
                    <div className="flex items-center gap-4 mb-6">
                        <span className="font-bold text-gray-800 text-lg">NVDA Valuation Grade</span>
                        <GradeBadge grade="F" />
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
                                {VALUATION_GRADE_DATA.rows.map((row, i) => (
                                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                                        <td className="text-left py-3 font-semibold text-gray-800 max-w-[200px]">{row.label}</td>
                                        <td className="py-3 flex justify-end pr-8"><GradeBadge grade={row.grade} /></td>
                                        <td className="py-3 font-bold text-gray-900">{row.nvda}</td>
                                        <td className="py-3 text-gray-600">{row.median}</td>
                                        <td className={`py-3 ${row.diff.startsWith('-') ? 'text-green-600' : 'text-red-500'}`}>{row.diff}</td>
                                        <td className="py-3 text-gray-600">{row.avg5y}</td>
                                        <td className={`py-3 ${row.diff5y.startsWith('-') ? 'text-green-600' : row.diff5y === 'NM' ? 'text-gray-400' : 'text-red-500'}`}>{row.diff5y}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Capital Structure Summary */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-normal text-gray-600 mb-6">Capital Structure</h2>

                    <div className="divide-y divide-gray-100">
                        {CAPITAL_STRUCTURE_DATA.map((item, i) => (
                            <div key={i} className="flex justify-between py-3 hover:bg-gray-50 transition-colors">
                                <span className={`font-bold text-gray-800 text-sm ${item.label === 'Enterprise Value' ? 'text-blue-600' : ''}`}>{item.label}</span>
                                <span className="font-bold text-gray-900">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
