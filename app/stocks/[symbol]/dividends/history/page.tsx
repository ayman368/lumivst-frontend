'use client';

import React from 'react';
import { Settings, Share2, Calendar, Download, ChevronRight, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const CONSISTENCY_DATA = {
    grade: "C-",
    rows: [
        { label: "Consecutive Years of Dividend Growth", grade: "C-", nvda: "2 Years", median: "2.5 Years", diff: "-20.96%" },
        { label: "Consecutive Years of Dividend Payments", grade: "C", nvda: "13 Years", median: "12.6 Years", diff: "3.00%" },
    ]
};

const PAYOUT_HISTORY_DATA = [
    {
        year: "2025",
        rows: [
            { amount: "0.0100", adjAmount: "0.0100", type: "Regular", frequency: "Quarterly", exDate: "12/4/2025", recordDate: "12/4/2025", payDate: "12/26/2025" },
            { amount: "0.0100", adjAmount: "0.0100", type: "Regular", frequency: "Quarterly", exDate: "9/11/2025", recordDate: "9/11/2025", payDate: "10/3/2025" },
            { amount: "0.0100", adjAmount: "0.0100", type: "Regular", frequency: "Quarterly", exDate: "6/11/2025", recordDate: "6/11/2025", payDate: "6/28/2025" },
            { amount: "0.0100", adjAmount: "0.0100", type: "Regular", frequency: "Quarterly", exDate: "3/12/2025", recordDate: "3/12/2025", payDate: "3/29/2025" },
        ]
    },
    {
        year: "2024",
        rows: [
            { amount: "0.0100", adjAmount: "0.0100", type: "Regular", frequency: "Quarterly", exDate: "12/5/2024", recordDate: "12/5/2024", payDate: "12/28/2024" },
            { amount: "0.0100", adjAmount: "0.0100", type: "Regular", frequency: "Quarterly", exDate: "9/12/2024", recordDate: "9/12/2024", payDate: "10/4/2024" },
            { amount: "0.0100", adjAmount: "0.0100", type: "Regular", frequency: "Quarterly", exDate: "6/11/2024", recordDate: "6/11/2024", payDate: "6/28/2024" },
        ]
    }
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

function DividendHistoryChart() {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
            <h3 className="text-2xl font-normal text-gray-500 mb-6">Dividend History</h3>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex border border-gray-300 rounded overflow-hidden">
                    {['1Y', '3Y', '5Y', '10Y', 'MAX'].map((tf) => (
                        <button key={tf} className={`px-3 py-1 text-sm font-medium ${tf === '5Y' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                            {tf}
                        </button>
                    ))}
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded"><Share2 size={16} /></button>
            </div>

            <div className="h-[250px] w-full relative mt-8">
                {/* Y Axis Grid Lines */}
                {[0.02, 0.01, 0.00].map((val, i) => (
                    <div key={i} className="absolute w-full border-t border-gray-100 flex items-center" style={{ top: `${i * 50}%` }}>
                        <span className="absolute right-0 text-xs text-gray-400 bg-white pl-1">${val.toFixed(2)}</span>
                    </div>
                ))}

                {/* Bars - Mocking visual consistency */}
                <div className="absolute inset-0 flex justify-between items-end px-4 pb-6 gap-2">
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className="w-full bg-gray-600 h-[20%]"></div>
                    ))}
                    {[...Array(6)].map((_, i) => (
                        <div key={`high-${i}`} className="w-full bg-gray-800 h-[60%] relative group">
                            {i === 0 && (
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white border border-gray-300 text-[10px] font-bold px-1 rounded shadow-sm text-gray-700 z-10">B</div>
                            )}
                        </div>
                    ))}
                </div>

                {/* X Axis Labels */}
                <div className="absolute bottom-0 w-full flex justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                    <span>Jul 2020</span>
                    <span>Jan 2021</span>
                    <span>Jul 2021</span>
                    <span>Jan 2022</span>
                    <span>Jul 2022</span>
                    <span>Jan 2023</span>
                    <span>Jul 2023</span>
                    <span>Jan 2024</span>
                    <span>Jul 2024</span>
                    <span>Jan 2025</span>
                    <span>Jul 2025</span>
                    <span>Jan 2026</span>
                </div>
            </div>
        </div>
    );
}

function PriceDividendChart() {
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
            <h3 className="text-2xl font-normal text-gray-500 mb-6">Price & Dividend History</h3>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex border border-gray-300 rounded overflow-hidden">
                    {['1M', '6M', '1Y', '5Y', '10Y', 'MAX'].map((tf) => (
                        <button key={tf} className={`px-3 py-1 text-sm font-medium ${tf === '5Y' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
                            {tf}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded"><Settings size={16} /></button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded"><Share2 size={16} /></button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded"><Calendar size={16} /></button>
                </div>
            </div>

            <div className="h-[250px] w-full relative mt-8">
                {/* Y Axis Grid Lines */}
                {[300.00, 200.00, 100.00, 0.00].map((val, i) => (
                    <div key={i} className="absolute w-full border-t border-gray-100 flex items-center" style={{ top: `${i * 33}%` }}>
                        <span className="absolute right-0 text-xs text-gray-400 bg-white pl-1">{val.toFixed(2)}</span>
                    </div>
                ))}

                {/* Area Chart Mock - Orange Gradient */}
                <svg className="w-full h-full absolute inset-0 pb-6 pr-10" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f97316" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#f97316" stopOpacity="0.1" />
                        </linearGradient>
                    </defs>
                    <path
                        d="M0,220 C100,220 200,210 300,180 C400,170 500,190 600,160 C700,140 800,150 900,100 C1000,80 1100,60 1200,50 L1200,250 L0,250 Z"
                        fill="url(#orangeGradient)"
                    />
                    <path
                        d="M0,220 C100,220 200,210 300,180 C400,170 500,190 600,160 C700,140 800,150 900,100 C1000,80 1100,60 1200,50"
                        fill="none"
                        stroke="#f97316"
                        strokeWidth="2"
                    />
                </svg>

                {/* Dividend Markers "D" */}
                {[0.05, 0.25, 0.45, 0.65, 0.85].map((pos, i) => (
                    <div key={i} className="absolute bottom-6 flex flex-col items-center" style={{ left: `${pos * 100}%` }}>
                        <div className="w-5 h-5 bg-white border border-gray-400 flex items-center justify-center text-[10px] font-bold text-gray-600 shadow-sm cursor-pointer hover:bg-gray-50">D</div>
                        <div className="h-2 w-px bg-gray-300"></div>
                    </div>
                ))}

                {/* X Axis Labels */}
                <div className="absolute bottom-0 w-full flex justify-between text-xs text-gray-500 pt-2 border-t border-gray-100 pr-10">
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

export default function DividendHistoryPage() {
    return (
        <div className="space-y-8">
            <div className="space-y-8">

                {/* Consistency Grade Table */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-normal text-gray-600 mb-6">Consistency Grade</h2>
                    <div className="flex items-center gap-4 mb-6">
                        <span className="font-bold text-gray-800 text-lg">NVDA Consistency Grade</span>
                        <GradeBadge grade="C-" />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-right">
                            <thead>
                                <tr className="text-gray-500 border-b border-gray-300 font-bold text-xs uppercase">
                                    <th className="text-left py-2 pb-3 w-[40%] font-medium"></th>
                                    <th className="py-2 pb-3 w-[15%] font-medium">Sector Relative Grade</th>
                                    <th className="py-2 pb-3 w-[15%] font-medium">NVDA</th>
                                    <th className="py-2 pb-3 w-[15%] font-medium">Sector Median</th>
                                    <th className="py-2 pb-3 w-[15%] font-medium">% Diff. to Sector</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {CONSISTENCY_DATA.rows.map((row, i) => (
                                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                                        <td className="text-left py-3 font-bold text-gray-800">{row.label}</td>
                                        <td className="py-3 flex justify-end pr-8"><GradeBadge grade={row.grade} /></td>
                                        <td className="py-3 font-medium text-gray-700">{row.nvda}</td>
                                        <td className="py-3 text-gray-600">{row.median}</td>
                                        <td className={`py-3 ${row.diff.startsWith('-') ? 'text-red-500' : 'text-green-600'}`}>{row.diff}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="text-sm text-gray-900 font-bold">
                            *Grades are relative to the <span className="text-blue-600 hover:underline cursor-pointer">Information Technology</span> sector
                        </div>
                    </div>
                </div>

                <DividendHistoryChart />
                <PriceDividendChart />

                {/* Dividend Payout History Table */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-2xl font-normal text-gray-500">Dividend Payout History</h3>
                        <button className="text-gray-400 hover:text-gray-600 text-sm font-semibold flex items-center gap-1">
                            Download to Spreadsheet <Download size={16} className="bg-gray-200 p-0.5 rounded" />
                        </button>
                    </div>

                    <table className="w-full text-sm text-right">
                        <thead>
                            <tr className="border-b border-gray-800 text-gray-600 font-bold text-xs uppercase">
                                <th className="text-left py-2 w-[10%]">Year</th>
                                <th className="py-2 w-[15%]">Amount</th>
                                <th className="py-2 w-[15%]">Adj. Amount</th>
                                <th className="py-2 w-[15%]">Dividend Type</th>
                                <th className="py-2 w-[15%]">Frequency</th>
                                <th className="py-2 w-[15%]">Ex-Div Date</th>
                                <th className="py-2 w-[15%]">Record Date</th>
                                <th className="py-2 w-[15%]">Pay Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {PAYOUT_HISTORY_DATA.map((yearGroup) => (
                                <React.Fragment key={yearGroup.year}>
                                    <tr className="bg-gray-50 font-bold text-gray-900 border-b border-gray-100">
                                        <td className="text-left py-2 pt-4 px-2" colSpan={8}>{yearGroup.year}</td>
                                    </tr>
                                    {yearGroup.rows.map((row, idx) => (
                                        <tr key={`${yearGroup.year}-${idx}`} className="hover:bg-gray-50 text-gray-700">
                                            <td className="py-3 px-2"></td>
                                            <td className="py-3">{row.amount}</td>
                                            <td className="py-3">{row.adjAmount}</td>
                                            <td className="py-3">{row.type}</td>
                                            <td className="py-3">{row.frequency}</td>
                                            <td className="py-3">{row.exDate}</td>
                                            <td className="py-3">{row.recordDate}</td>
                                            <td className="py-3">{row.payDate}</td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
}
