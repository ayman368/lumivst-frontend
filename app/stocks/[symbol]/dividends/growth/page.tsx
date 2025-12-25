'use client';

import { Settings, Share2, Calendar, Plus, Download } from 'lucide-react';

const GROWTH_GRADE_DATA = {
    grade: "A+",
    rows: [
        { label: "1 Year Dividend Growth Rate (TTM)", grade: "A", nvda: "42.86%", median: "5.36%", diff: "699.39%", avg5y: "23.28%", diff5y: "84.12%" },
        { label: "Dividend Per Share Growth (FWD)", grade: "A+", nvda: "36.70%", median: "5.75%", diff: "538.28%", avg5y: "12.04%", diff5y: "204.69%" },
        { label: "Dividend Per Share Growth FY1 - FY3 (CAGR)", grade: "D+", nvda: "1.07%", median: "4.98%", diff: "-78.48%", avg5y: "6.08%", diff5y: "-82.38%" },
    ]
};

const GROWTH_HISTORY_DATA = [
    { year: "2025", amount: "$0.0400", yield: "-", growth: "17.65%", cagr: "-" },
    { year: "2024", amount: "$0.0340", yield: "0.03%", growth: "112.50%", cagr: "17.65%" },
    { year: "2023", amount: "$0.0160", yield: "0.03%", growth: "0.00%", cagr: "58.11%" },
    { year: "2022", amount: "$0.0160", yield: "0.11%", growth: "0.00%", cagr: "35.72%" },
    { year: "2021", amount: "$0.0160", yield: "0.05%", growth: "0.00%", cagr: "25.74%" },
];

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

function BarChartMock() {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h3 className="text-2xl font-normal text-gray-500">Dividend Growth</h3>
                <div className="flex items-center gap-2">
                    <div className="flex border border-gray-300 rounded overflow-hidden">
                        {['1Y', '5Y', '10Y'].map((tf) => (
                            <button key={tf} className={`px-3 py-1 text-sm font-medium ${tf === '5Y' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                                {tf}
                            </button>
                        ))}
                    </div>
                    <button className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded"><Share2 size={16} /></button>
                </div>
            </div>

            <div className="h-[300px] w-full relative mt-8">
                {/* Y Axis Grid Lines */}
                {[0.02, 0.01, 0.00].map((val, i) => (
                    <div key={i} className="absolute w-full border-t border-gray-100 flex items-center" style={{ top: `${i * 50}%` }}>
                        <span className="absolute right-0 text-xs text-gray-400 bg-white pl-1">${val.toFixed(2)}</span>
                    </div>
                ))}

                {/* Bars */}
                <div className="absolute inset-0 flex justify-around items-end px-10 pb-6">
                    <div className="w-12 bg-gray-600 h-[60%] relative group">
                        <span className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold bg-black text-white px-2 py-1 rounded">2020</span>
                    </div>
                    <div className="w-12 bg-gray-600 h-[60%]"></div>
                    <div className="w-12 bg-gray-600 h-[60%] flex flex-col items-center justify-end">
                        <span className="mb-2 bg-white border border-gray-300 text-xs font-bold px-1 rounded shadow-sm">S</span>
                    </div>
                    <div className="w-12 bg-gray-600 h-[60%]"></div>
                    <div className="w-12 bg-gray-600 h-[80%] flex flex-col items-center justify-end">
                        <span className="mb-2 bg-white border border-gray-300 text-xs font-bold px-1 rounded shadow-sm">S</span>
                    </div>
                </div>

                {/* X Axis Labels */}
                <div className="absolute bottom-0 w-full flex justify-around text-xs text-blue-600 font-medium">
                    <span>2020</span>
                    <span>2021</span>
                    <span>2022</span>
                    <span>2023</span>
                    <span>2024</span>
                </div>
            </div>
        </div>
    );
}

export default function DividendGrowthPage() {
    return (
        <div className="space-y-8">
            <div className="space-y-8">

                {/* Grade Table Card */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-normal text-gray-600 mb-6">Dividend Growth Grade</h2>
                    <div className="flex items-center gap-4 mb-6">
                        <span className="font-bold text-gray-800 text-lg">NVDA Dividend Growth Grade</span>
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
                                {GROWTH_GRADE_DATA.rows.map((row, i) => (
                                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                                        <td className="text-left py-3 font-semibold text-gray-800 max-w-[200px]">{row.label}</td>
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

                {/* Chart */}
                <BarChartMock />

                {/* History Table */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-normal text-gray-500">Dividend Growth History</h3>
                        <button className="text-gray-400 hover:text-gray-600 text-sm font-semibold flex items-center gap-1">
                            Download to Spreadsheet <Download size={16} className="bg-gray-200 p-0.5 rounded" />
                        </button>
                    </div>

                    <table className="w-full text-sm text-right">
                        <thead>
                            <tr className="border-b border-gray-800 text-gray-600 font-bold text-xs uppercase">
                                <th className="text-left py-2">Year</th>
                                <th className="py-2">Payout Amount</th>
                                <th className="py-2">Year End Yield</th>
                                <th className="py-2">Annual Payout Growth (YoY)</th>
                                <th className="py-2">CAGR to 2025</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {GROWTH_HISTORY_DATA.map((row) => (
                                <tr key={row.year} className="group hover:bg-gray-50 text-gray-900 font-medium">
                                    <td className="text-left py-3 font-bold">{row.year}</td>
                                    <td className="py-3">{row.amount}</td>
                                    <td className="py-3">{row.yield}</td>
                                    <td className="py-3">{row.growth}</td>
                                    <td className="py-3">{row.cagr}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
}
