'use client';

const ESTIMATES_TABLE_DATA = [
    { end: "Jan. 2026", rate: "$0.04", yield: "0.02%", low: "$0.04", high: "$0.04", analysts: 18 },
    { end: "Jan. 2027", rate: "$0.04", yield: "0.02%", low: "$0.04", high: "$0.05", analysts: 21 },
    { end: "Jan. 2028", rate: "$0.04", yield: "0.02%", low: "$0.04", high: "$0.06", analysts: 14 },
];

const REVISIONS_GRADE_DATA = {
    grade: "A-",
    rows: [
        { label: "FY1 DPS Up Revisions (last 90 days)", val1: "2", label2: "FY2 DPS Up Revisions (last 90 days)", val2: "1" },
        { label: "FY1 DPS Down Revisions (last 90 days)", val1: "0", label2: "FY2 DPS Down Revisions (last 90 days)", val2: "0" },
    ]
};

function GradeBadge({ grade }: { grade: string }) {
    let color = 'bg-gray-200 text-gray-700';
    if (grade.startsWith('A')) color = 'bg-green-700 text-white';
    else if (grade.startsWith('B')) color = 'bg-green-600 text-white';
    else if (grade.startsWith('C')) return 'bg-yellow-500 text-black';
    else if (grade.startsWith('D')) color = 'bg-orange-500 text-white';
    else if (grade.startsWith('F')) color = 'bg-red-800 text-white';

    return (
        <span className={`${color} font-bold text-sm px-2 py-1 rounded w-8 h-8 flex items-center justify-center`}>
            {grade}
        </span>
    );
}

function EstimatesChart() {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8 min-h-[350px]">
            <div className="flex justify-end gap-6 mb-8 text-sm font-medium">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-700 rounded-full"></span>
                    <span className="text-gray-600">Dividend Actual</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-green-400 rounded-full"></span>
                    <span className="text-gray-600">Dividend Estimate</span>
                </div>
            </div>

            <div className="h-[250px] w-full relative">
                {/* Y Axis Grid Lines */}
                {[0.045, 0.030, 0.015, 0.00].map((val, i) => (
                    <div key={i} className="absolute w-full border-t border-gray-100 flex items-center" style={{ top: `${i * 33}%` }}>
                        <span className="absolute right-0 text-xs text-gray-400 bg-white pl-1">{val.toFixed(2)}</span>
                    </div>
                ))}

                {/* Bars */}
                <div className="absolute inset-0 flex justify-between items-end px-4 pb-6 gap-8 pr-12">
                    {/* Actuals */}
                    {[...Array(4)].map((_, i) => (
                        <div key={`actual-${i}`} className="w-full h-[30%] flex flex-col items-center justify-end">
                            <div className="w-full bg-green-700 h-full rounded-t"></div>
                        </div>
                    ))}
                    {/* Estimates */}
                    {[...Array(5)].map((_, i) => (
                        <div key={`estimate-${i}`} className="w-full h-[60%] flex flex-col items-center justify-end">
                            <div className="w-full bg-green-400 opacity-90 h-full rounded-t" style={{ height: `${50 + (i * 10)}%` }}></div>
                        </div>
                    ))}
                </div>

                {/* X Axis Labels */}
                <div className="absolute bottom-0 w-full flex justify-between text-xs text-gray-500 pt-2 border-t border-gray-100 pr-12 text-center uppercase font-medium">
                    <span>FY 2020</span>
                    <span>FY 2021</span>
                    <span>FY 2022</span>
                    <span>FY 2023</span>
                    <span>FY 2024</span>
                    <span>FY 2025</span>
                    <span>FY 2026 (E)</span>
                    <span>FY 2027 (E)</span>
                    <span>FY 2028 (E)</span>
                </div>
            </div>
        </div>
    );
}

export default function DividendEstimatesPage() {
    return (
        <div className="space-y-8">
            <div className="space-y-8">

                {/* Consensus Estimates Table */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-normal text-gray-600 mb-6">Consensus Dividend Estimates</h2>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-right">
                            <thead>
                                <tr className="text-gray-500 border-b border-gray-300 font-bold text-xs uppercase">
                                    <th className="text-left py-2 pb-3 font-semibold">Fiscal Period Ending</th>
                                    <th className="py-2 pb-3 font-semibold">Consensus Rate</th>
                                    <th className="py-2 pb-3 font-semibold">Consensus Yield</th>
                                    <th className="py-2 pb-3 font-semibold">Low</th>
                                    <th className="py-2 pb-3 font-semibold">High</th>
                                    <th className="py-2 pb-3 font-semibold"># of Analysts</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {ESTIMATES_TABLE_DATA.map((row, i) => (
                                    <tr key={i} className="hover:bg-gray-50 transition-colors font-bold text-gray-800">
                                        <td className="text-left py-3">{row.end}</td>
                                        <td className="py-3">{row.rate}</td>
                                        <td className="py-3 font-medium text-gray-600">{row.yield}</td>
                                        <td className="py-3 font-medium text-gray-600">{row.low}</td>
                                        <td className="py-3 font-medium text-gray-600">{row.high}</td>
                                        <td className="py-3 font-medium text-gray-600">{row.analysts}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-8">
                        <EstimatesChart />
                    </div>
                </div>

                {/* Revisions Grade */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-normal text-gray-600 mb-6">Dividend Revisions Grade</h2>
                    <div className="flex items-center gap-4 mb-6">
                        <span className="font-bold text-gray-800 text-lg">NVDA DPS Revisions Grade</span>
                        <GradeBadge grade="A-" />
                    </div>

                    <div className="overflow-x-auto">
                        <div className="divide-y divide-gray-100">
                            {REVISIONS_GRADE_DATA.rows.map((row, i) => (
                                <div key={i} className="flex py-3 items-center">
                                    <div className="flex-1 flex justify-between pr-10 border-r border-gray-100">
                                        <span className="font-bold text-gray-800 text-sm">{row.label}</span>
                                        <span className="text-gray-600 font-medium">{row.val1}</span>
                                    </div>
                                    <div className="flex-1 flex justify-between pl-10">
                                        <span className="font-bold text-gray-800 text-sm">{row.label2}</span>
                                        <span className="text-gray-600 font-medium">{row.val2}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
