'use client';


import { Settings, Share2, Calendar, Plus } from 'lucide-react';

const YIELD_GRADE_DATA = {
    grade: "F",
    rows: [
        { label: "4 Year Average Dividend Yield", grade: "F", nvda: "0.05%", median: "1.53%", diff: "-96.92%", avg5y: "0.15%", diff5y: "-68.96%" },
        { label: "Dividend Yield (TTM)", grade: "F", nvda: "0.02%", median: "1.46%", diff: "-98.42%", avg5y: "0.06%", diff5y: "-59.19%" },
        { label: "Dividend Yield (FWD)", grade: "F", nvda: "0.02%", median: "1.48%", diff: "-98.45%", avg5y: "0.06%", diff5y: "-59.81%" },
        { label: "1 Year Yield on Cost", grade: "F", nvda: "0.03%", median: "1.54%", diff: "-97.98%", avg5y: "0.09%", diff5y: "-67.32%" },
        { label: "3 Year Yield on Cost", grade: "F", nvda: "0.24%", median: "2.07%", diff: "-88.36%", avg5y: "0.24%", diff5y: "0.83%" },
        { label: "5 Year Yield on Cost", grade: "F", nvda: "0.30%", median: "2.18%", diff: "-86.18%", avg5y: "0.64%", diff5y: "-52.79%" },
    ]
};

const YIELD_HISTORY_DATA = [
    { year: "2025", end: "0.02%", avg: "0.03%", max: "0.04%", min: "0.02%" },
    { year: "2024", end: "0.03%", avg: "0.02%", max: "0.03%", min: "0.01%" },
    { year: "2023", end: "0.03%", avg: "0.05%", max: "0.11%", min: "0.03%" },
    { year: "2022", end: "0.11%", avg: "0.09%", max: "0.14%", min: "0.05%" },
    { year: "2021", end: "0.05%", avg: "0.09%", max: "0.14%", min: "0.05%" },
    { year: "2020", end: "0.12%", avg: "0.18%", max: "0.33%", min: "0.11%" },
];

function GradeBadge({ grade }: { grade: string }) {
    let color = 'bg-gray-200 text-gray-700';
    if (grade.startsWith('A')) color = 'bg-green-700 text-white';
    else if (grade.startsWith('F')) color = 'bg-red-800 text-white';
    else if (grade.startsWith('C')) color = 'bg-yellow-500 text-black';
    else if (grade.startsWith('D')) color = 'bg-orange-500 text-white';

    return (
        <span className={`${color} font-bold text-sm px-2 py-1 rounded w-8 h-8 flex items-center justify-center`}>
            {grade}
        </span>
    );
}

function SimpleLineChart({ title, value, subValue, color }: { title: string, value?: string, subValue?: string, color: string }) {
    const timeframes = ['1M', '6M', '1Y', '5Y', '10Y'];

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h3 className="text-xl font-normal text-gray-500">{title}</h3>

                <div className="flex items-center gap-2">
                    <div className="flex border border-gray-300 rounded overflow-hidden">
                        {timeframes.map((tf) => (
                            <button key={tf} className={`px-3 py-1 text-sm font-medium ${tf === '5Y' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                                {tf}
                            </button>
                        ))}
                    </div>
                    <button className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded"><Settings size={16} /></button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded"><Share2 size={16} /></button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded"><Calendar size={16} /></button>
                    <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-600 hover:bg-gray-50">
                        <Plus size={16} /> <span>Add Comparison</span>
                    </button>
                </div>
            </div>

            {value && (
                <div className="mb-6 inline-block border border-gray-200 rounded p-2 shadow-sm bg-white">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                        <span className="font-bold text-gray-700 text-sm">NVDA</span>
                    </div>
                    <div className="flex justify-between items-end gap-8">
                        <span className="text-xs text-gray-500">Yield (TTM)</span>
                        <div className="text-right">
                            <div className="font-bold text-gray-900">{value}</div>
                            <div className="text-xs text-red-500">{subValue}</div>
                        </div>
                    </div>
                </div>
            )}

            <div className="h-[250px] w-full relative">
                {/* Simple SVG Chart Mock */}
                <svg className="w-full h-full" preserveAspectRatio="none">
                    <path
                        d="M0,100 C150,150 300,50 450,180 C600,200 750,230 900,100 L1200,220"
                        fill="none"
                        stroke={color}
                        strokeWidth="2"
                        vectorEffect="non-scaling-stroke"
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

export default function DividendYieldPage() {
    return (
        <div className="space-y-8">
            <div className="space-y-8">

                {/* Heading */}
                {/* Heading */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-normal text-gray-600 mb-6">Dividend Yield Grade</h2>
                    <div className="flex items-center gap-4 mb-6">
                        <span className="font-bold text-gray-800 text-lg">NVDA Dividend Yield Grade</span>
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
                                {YIELD_GRADE_DATA.rows.map((row, i) => (
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

                {/* Charts */}
                <SimpleLineChart title="Dividend Yield" value="0.023%" subValue="-80.95%" color="#f97316" />
                <SimpleLineChart title="Yield On Cost" color="#f97316" />

                {/* History Table */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-normal text-gray-500">Dividend Yield History</h3>
                        <button className="text-gray-400 hover:text-gray-600 text-sm font-semibold flex items-center gap-1">
                            Download to Spreadsheet <span className="bg-gray-200 rounded px-1 text-xs">⬇</span>
                        </button>
                    </div>

                    <table className="w-full text-sm text-right">
                        <thead>
                            <tr className="border-b border-gray-800 text-gray-600 font-bold">
                                <th className="text-left py-2">Year</th>
                                <th className="py-2">Year End Yield</th>
                                <th className="py-2">Average Yield</th>
                                <th className="py-2">Max Yield</th>
                                <th className="py-2">Min Yield</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {YIELD_HISTORY_DATA.map((row) => (
                                <tr key={row.year} className="group hover:bg-gray-50">
                                    <td className="text-left py-3 font-bold text-gray-900">{row.year}</td>
                                    <td className="py-3">{row.end}</td>
                                    <td className="py-3">{row.avg}</td>
                                    <td className="py-3">{row.max}</td>
                                    <td className="py-3">{row.min}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>

        </div>

    );
}

