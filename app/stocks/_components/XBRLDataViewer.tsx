"use client"

import React, { useState, useEffect } from 'react';
import { Loader2, FileSpreadsheet, AlertCircle } from 'lucide-react';

interface Metric {
    label: string;
    value: string | number | null;
}

interface PeriodData {
    [key: string]: Metric;
}

interface XBRLData {
    [period: string]: PeriodData;
}

interface XBRLDataViewerProps {
    symbol: string;
}

export default function XBRLDataViewer({ symbol }: XBRLDataViewerProps) {
    const [data, setData] = useState<XBRLData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<string>("");

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch(`http://localhost:8000/api/financial-details/${symbol}/xbrl`);
                if (!res.ok) throw new Error("Failed to fetch financial details");
                const json = await res.json();

                // Sort periods (newest first)
                const sortedKeys = Object.keys(json).sort().reverse();
                const sortedData: XBRLData = {};
                sortedKeys.forEach(k => sortedData[k] = json[k]);

                setData(sortedData);
                if (sortedKeys.length > 0) setActiveTab(sortedKeys[0]);

            } catch (err) {
                console.error(err);
                setError("No detailed XBRL data available for this company yet.");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [symbol]);

    if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-purple-600" /></div>;
    if (error) return <div className="flex items-center gap-2 p-4 text-amber-600 bg-amber-50 rounded-lg border border-amber-200"><AlertCircle size={20} /> {error}</div>;
    if (!data) return null;

    const periods = Object.keys(data);

    // Helper to format values
    const fmt = (val: string | number | null) => {
        if (val === null || val === "") return "-";
        if (typeof val === 'number') return val.toLocaleString();
        if (!isNaN(Number(val)) && val.toString().length > 4) return Number(val).toLocaleString();
        return val;
    };

    const currentData = data[activeTab];
    // Filter out empty keys and sort if needed, current implementation takes raw order
    const keys = currentData ? Object.keys(currentData).filter(k => currentData[k].label && currentData[k].value) : [];

    return (
        <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm">

            {/* Header */}
            <div className="border-b border-zinc-200 dark:border-zinc-800 p-4 flex items-center justify-between">
                <h3 className="text-lg font-medium flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                    <FileSpreadsheet className="w-5 h-5 text-green-600" />
                    Detailed Financials (XBRL)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                    {periods.length} Reports
                </span>
            </div>

            {/* Tabs */}
            <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-2 pt-2 overflow-x-auto">
                <div className="flex space-x-1">
                    {periods.map(p => (
                        <button
                            key={p}
                            onClick={() => setActiveTab(p)}
                            className={`
                        px-4 py-2 text-sm font-medium rounded-t-md border-t border-x border-b-0 transition-colors whitespace-nowrap
                        ${activeTab === p
                                    ? 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-purple-600 dark:text-purple-400 border-b-white dark:border-b-zinc-900 -mb-px relative z-10'
                                    : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'}
                    `}
                        >
                            {p.replace("_", " ")}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="p-0">
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto relative custom-scrollbar">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-900/50 sticky top-0 backdrop-blur-sm z-10 shadow-sm">
                            <tr>
                                <th className="px-6 py-3 font-medium border-b border-zinc-200 dark:border-zinc-800">Metric</th>
                                <th className="px-6 py-3 font-medium text-right border-b border-zinc-200 dark:border-zinc-800">Value</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                            {keys.map((key) => (
                                <tr key={key} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors group">
                                    <td className="px-6 py-2.5 font-medium text-zinc-700 dark:text-zinc-300">
                                        {currentData[key].label}
                                        <div className="text-[10px] text-zinc-400 font-normal font-mono opacity-0 group-hover:opacity-100 transition-opacity">{key}</div>
                                    </td>
                                    <td className="px-6 py-2.5 text-right font-mono text-zinc-600 dark:text-zinc-400">
                                        {fmt(currentData[key].value)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
