'use client';

import { Settings, Share2, Calendar, Plus } from 'lucide-react';

const SAFETY_GRADE_DATA = {
    grade: "A+",
    rows: [
        { label: "Cash Dividend Payout Ratio (TTM)", grade: "A+", nvda: "1.26%", median: "29.17%", diff: "-95.67%", avg5y: "4.59%", diff5y: "-72.48%" },
        { label: "Dividend Payout Ratio (TTM) (GAAP)", grade: "A+", nvda: "0.99%", median: "34.92%", diff: "-97.16%", avg5y: "4.36%", diff5y: "-77.24%" },
        { label: "Dividend Payout Ratio (TTM) (Non GAAP)", grade: "A+", nvda: "0.99%", median: "28.59%", diff: "-96.54%", avg5y: "3.19%", diff5y: "-69.05%" },
        { label: "Dividend Payout Ratio (FY1) (Non GAAP)", grade: "A+", nvda: "0.85%", median: "26.42%", diff: "-96.77%", avg5y: "2.68%", diff5y: "-68.18%" },
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

function PayoutRatioChart() {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h3 className="text-2xl font-normal text-gray-500">Payout Ratio</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 border-b border-gray-100 pb-6">
                <div>
                    <div className="text-xs font-bold text-gray-700 mb-1">Annual Dividends Per Share (FWD)</div>
                    <div className="text-right font-bold">$0.04</div>
                </div>
                <div>
                    <div className="text-xs font-bold text-gray-700 mb-1">Annual Non-GAAP EPS (FWD)</div>
                    <div className="text-right font-bold">$1.25</div>
                </div>
                <div>
                    <div className="text-xs font-bold text-gray-700 mb-1">Payout Ratio</div>
                    <div className="text-right font-bold">0.99%</div>
                </div>
            </div>

            <div className="flex items-center gap-2 mb-6">
                <div className="flex border border-gray-300 rounded overflow-hidden">
                    {['6M', '1Y', '3Y', '5Y'].map((tf) => (
                        <button key={tf} className={`px-3 py-1 text-sm font-medium ${tf === '5Y' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                            {tf}
                        </button>
                    ))}
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded"><Settings size={16} /></button>
                <button className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded"><Share2 size={16} /></button>
                <button className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded"><Calendar size={16} /></button>
            </div>

            <div className="h-[250px] w-full relative">
                {/* Y Axis Grid Lines */}
                {[0.00, 2.00, 4.00, 6.00, 8.00].map((val, i) => (
                    <div key={i} className="absolute w-full border-t border-gray-100 flex items-center" style={{ bottom: `${i * 20}%` }}>
                        <span className="absolute -right-10 text-xs text-gray-400">{val.toFixed(2)}%</span>
                    </div>
                ))}

                {/* Simple SVG Chart Mock - Orange Line descending */}
                <svg className="w-full h-full" preserveAspectRatio="none">
                    <path
                        d="M0,50 C100,100 200,150 400,80 C600,200 800,220 1200,230"
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="2"
                    />
                </svg>
                {/* X Axis */}
                <div className="absolute bottom-0 w-full flex justify-between text-xs text-gray-400 pt-2 border-t border-gray-100">
                    <span>2021</span>
                    <span>2022</span>
                    <span>2023</span>
                    <span>2024</span>
                    <span>2025</span>
                </div>
            </div>
        </div>
    );
}

export default function DividendSafetyPage() {
    return (
        <div className="space-y-8">
            <div className="space-y-8">

                {/* Grade Table Card */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-normal text-gray-600 mb-6">Dividend Safety Grade</h2>
                    <div className="flex items-center gap-4 mb-6">
                        <span className="font-bold text-gray-800 text-lg">NVDA Dividend Safety Grade</span>
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
                                {SAFETY_GRADE_DATA.rows.map((row, i) => (
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
                <PayoutRatioChart />

            </div>
        </div>
    );
}
