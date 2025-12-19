'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Printer, X } from 'lucide-react';

interface FinancialsTableProps {
    data: any;
    activeTab?: 'Income Statement' | 'Balance Sheet' | 'Cash Flow';
    symbol: string;
}

export function FinancialsTable({ data, activeTab = 'Income Statement', symbol }: FinancialsTableProps) {
    if (!data) return null;

    let tableData;
    switch (activeTab) {
        case 'Income Statement':
            tableData = data.incomeStatement;
            break;
        case 'Balance Sheet':
            tableData = data.balanceSheet;
            break;
        case 'Cash Flow':
            tableData = data.cashFlow;
            break;
        default:
            tableData = data.incomeStatement;
    }

    if (!tableData) return <div className="p-4 text-gray-500">Data not available for {activeTab}</div>;

    const { years, rows } = tableData;

    const tabs = [
        { name: 'Income Statement', path: 'income-statement' },
        { name: 'Balance Sheet', path: 'balance-sheet' },
        { name: 'Cash Flow', path: 'cash-flow' }
    ];

    const [activeChart, setActiveChart] = useState<{
        rowIndex: number;
        data: number[];
        years: string[];
        label: string;
        triggerRect: { top: number; left: number; height: number; width: number };
    } | null>(null);

    return (
        <div className="space-y-6 relative">
            {/* Sub-navigation */}
            <div className="flex border-b border-gray-200">
                {tabs.map((tab) => (
                    <Link
                        key={tab.name}
                        href={`/stocks/${symbol}/${tab.path}`}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.name ? 'border-black text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        {tab.name}
                    </Link>
                ))}
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 relative">
                {/* Header Controls */}
                <div className="p-4 border-b border-gray-200 flex flex-wrap gap-6 items-center justify-between bg-white rounded-t-lg">
                    <h2 className="text-xl font-bold text-gray-900">{activeTab}</h2>

                    <div className="flex gap-6 items-center text-sm">
                        <div className="flex items-center gap-3">
                            <span className="text-gray-500 font-medium">Period</span>
                            <div className="relative">
                                <select className="appearance-none font-medium text-gray-900 bg-white border border-gray-200 rounded-md px-3 py-1.5 pr-8 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-sm">
                                    <option>Annual</option>
                                    <option>Quarterly</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                    <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-gray-500 font-medium">View</span>
                            <div className="relative">
                                <select className="appearance-none font-medium text-gray-900 bg-white border border-gray-200 rounded-md px-3 py-1.5 pr-8 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-sm">
                                    <option>Absolute</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                    <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-gray-500 font-medium">Order</span>
                            <div className="relative">
                                <select className="appearance-none font-medium text-gray-900 bg-white border border-gray-200 rounded-md px-3 py-1.5 pr-8 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-sm">
                                    <option>Latest on the Left</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                    <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-gray-500 font-medium">Currency</span>
                            <div className="relative">
                                <select className="appearance-none font-medium text-gray-900 bg-white border border-gray-200 rounded-md px-3 py-1.5 pr-8 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-sm">
                                    <option>United States Dollar (USD)</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                    <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                                </div>
                            </div>
                        </div>
                        <button className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-md border border-gray-200">
                            <Printer className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-white border-b border-gray-200 text-gray-600 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="py-4 px-4 text-left font-medium w-64 min-w-[200px]">Last Report</th>
                                <th className="py-4 px-2 w-24"></th>
                                {years.map((year: string, i: number) => {
                                    return (
                                        <th key={i} className="py-4 px-2 text-right font-medium min-w-[80px] whitespace-nowrap">
                                            {year === 'TTM' ? 'Last Report' : year}
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 relative">
                            {rows.map((row: any, i: number) => {
                                if (row.isSectionHeader) {
                                    return (
                                        <tr key={i} className="bg-white">
                                            <td colSpan={years.length + 2} className="pt-8 pb-3 px-4 font-bold text-lg text-gray-900">
                                                {row.label}
                                            </td>
                                        </tr>
                                    )
                                }

                                // Parse values for sparkline (remove commas/parens)
                                const numericValues = row.values.map((v: string) => {
                                    if (v === "-") return 0;
                                    let clean = v.replace(/,/g, '');
                                    if (clean.startsWith('(') && clean.endsWith(')')) {
                                        clean = '-' + clean.slice(1, -1);
                                    }
                                    return parseFloat(clean) || 0;
                                }).reverse(); // Reverse for left-to-right chart

                                // Reverse years too for the chart
                                const chartYears = [...years].reverse();

                                return (
                                    <tr key={i} className={`hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 ${row.isHeader ? 'font-bold text-gray-900 border-t border-gray-200' : 'text-gray-600'}`}>
                                        <td className={`py-3 px-4 ${!row.isHeader && !row.isSectionHeader ? 'pl-4' : ''}`}>
                                            {row.label}
                                        </td>
                                        <td className="py-3 px-2 relative">
                                            {row.hasSparkline && (
                                                <div
                                                    className="h-6 w-20 flex items-end gap-0.5 cursor-pointer hover:opacity-80"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        // Capture rect for fixed positioning to avoid overflow clipping
                                                        const rect = e.currentTarget.getBoundingClientRect();
                                                        setActiveChart({
                                                            rowIndex: i,
                                                            data: numericValues,
                                                            years: chartYears,
                                                            label: row.label,
                                                            triggerRect: { top: rect.top, left: rect.left, height: rect.height, width: rect.width }
                                                        });
                                                    }}
                                                >
                                                    {numericValues.map((val: number, idx: number) => {
                                                        const max = Math.max(...numericValues.map(Math.abs)) || 1;
                                                        const height = Math.abs(val) / max * 100;
                                                        return (
                                                            <div
                                                                key={idx}
                                                                className={`w-full rounded-sm ${val >= 0 ? 'bg-gray-400' : 'bg-red-300'}`}
                                                                style={{ height: `${height}%` }}
                                                            />
                                                        )
                                                    })}
                                                </div>
                                            )}
                                        </td>
                                        {row.values.map((val: string, j: number) => (
                                            <td key={j} className="py-3 px-4 text-right tabular-nums">
                                                {val}
                                            </td>
                                        ))}
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Overlay to close popup when clicking outside */}
            {activeChart && (
                <div
                    className="fixed inset-0 z-40 bg-transparent"
                    onClick={() => setActiveChart(null)}
                />
            )}

            {/* Popup Chart - Rendered outside table using fixed positioning */}
            {activeChart && (
                <div
                    className="fixed z-50 bg-white p-4 shadow-xl border border-gray-200 rounded-lg w-[500px] h-[300px]"
                    style={{
                        top: Math.max(10, activeChart.triggerRect.top - 310) + 'px', // 300px height + 10px Gap
                        left: activeChart.triggerRect.left + 'px'
                    }}
                >
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-900">{activeChart.label}</h3>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveChart(null);
                            }}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="h-[230px] w-full flex items-end justify-between gap-2 px-2 pb-6 border-b border-gray-200 relative">
                        {/* Y-axis grid lines approx */}
                        {[0, 1, 2].map(idx => (
                            <div key={idx} className="absolute w-full border-t border-gray-100 left-0" style={{ bottom: `${idx * 50}%` }}></div>
                        ))}

                        {activeChart.data.map((val, idx) => {
                            const max = Math.max(...activeChart.data.map(Math.abs)) * 1.1 || 1;
                            const height = Math.abs(val) / max * 100;

                            return (
                                <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                                    {/* Tooltip on hover */}
                                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap z-50 pointer-events-none transition-opacity">
                                        {val.toLocaleString()}
                                    </div>

                                    <div
                                        className={`w-full rounded-sm transition-all duration-300 ${val >= 0 ? 'bg-gray-500 hover:bg-gray-700' : 'bg-red-400 hover:bg-red-600'}`}
                                        style={{ height: `${height}%` }}
                                    />
                                    <span className="text-[10px] text-gray-500 mt-2 absolute -bottom-6 w-full text-center truncate">
                                        {activeChart.years[idx]}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                    {/* Triangle pointer */}
                    <div className="absolute bottom-[-6px] left-6 w-3 h-3 bg-white border-b border-r border-gray-200 transform rotate-45"></div>
                </div>
            )}
        </div>
    );
}
