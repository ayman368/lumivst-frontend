"use client"

import React, { useState, useEffect } from 'react';
import { Loader2, FileSpreadsheet, AlertCircle } from 'lucide-react';

interface MetricRecord {
    row_id: number;
    key: string;
    label: string;
    value: string | number | null;
}

interface XBRLData {
    [period: string]: MetricRecord[];
}

interface XBRLDataViewerProps {
    symbol: string;
}

export default function XBRLDataViewer({ symbol }: XBRLDataViewerProps) {
    const [data, setData] = useState<XBRLData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
                const res = await fetch(`${API_URL}/api/financial-details/${symbol}/xbrl`);
                if (!res.ok) throw new Error("Failed to fetch financial details");
                const json = await res.json();
                setData(json);
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

    // 1. Determine Columns (Periods) - Sort Newest First
    const periods = Object.keys(data).sort((a, b) => {
        // Handle both "2024_ANNUAL" and "2024 ANNUAL"
        const partsA = a.includes('_') ? a.split('_') : a.split(' ');
        const partsB = b.includes('_') ? b.split('_') : b.split(' ');

        const yearA = partsA[0];
        const typeA = partsA[1]?.toUpperCase() || '';

        const yearB = partsB[0];
        const typeB = partsB[1]?.toUpperCase() || '';

        if (yearA !== yearB) return Number(yearB) - Number(yearA);

        const order: Record<string, number> = { 'ANNUAL': 4, 'Q3': 3, 'Q2': 2, 'Q1': 1 };
        return (order[typeB] || 0) - (order[typeA] || 0);
    });

    if (periods.length === 0) return <div>No data found</div>;

    // 2. Master Template rows (taking the most complete period, usually Annual or latest)
    // We strive to find a period that has the most keys to serve as the master list
    const masterPeriod = periods.reduce((a, b) => (data[a]?.length > data[b]?.length ? a : b), periods[0]);
    const masterRows = data[masterPeriod] || [];

    // 3. Lookup Map using KEY (metric name) instead of row_id 
    // row_id is not persistent across files, so we MUST use the metric key
    const lookups: Record<string, Record<string, any>> = {};

    // Pre-process lookups for O(1) access
    periods.forEach(p => {
        lookups[p] = {};
        data[p].forEach((item: any) => {
            // Use 'key' which is the snake_case metric name
            if (item.key) {
                lookups[p][item.key] = item.value ?? item.text;
            }
        });
    });

    const fmt = (val: any) => {
        if (val === null || val === undefined || val === "") return "-";
        if (typeof val === 'number') return val.toLocaleString(undefined, { maximumFractionDigits: 2 });
        // Check if string is numeric but large
        if (!isNaN(Number(val)) && val.toString().length > 4) {
            return Number(val).toLocaleString(undefined, { maximumFractionDigits: 2 });
        }
        return val;
    };

    return (
        <div className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm overflow-hidden flex flex-col h-[calc(100vh-200px)]">

            {/* Header */}
            <div className="border-b border-zinc-200 dark:border-zinc-800 p-4 flex items-center justify-between bg-white dark:bg-zinc-900 shrink-0">
                <h3 className="text-lg font-medium flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                    <FileSpreadsheet className="w-5 h-5 text-green-600" />
                    Financial Comparison Matrix
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                    {periods.length} Periods
                </span>
            </div>

            {/* Table Container */}
            <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-sm text-left border-collapse relative">
                    <thead className="text-xs text-zinc-500 uppercase bg-zinc-50 dark:bg-zinc-950 sticky top-0 z-20 shadow-sm">
                        <tr>
                            <th className="px-4 py-3 font-medium border-b border-r border-zinc-200 dark:border-zinc-800 min-w-[300px] sticky left-0 bg-zinc-50 dark:bg-zinc-950 z-30">
                                Parameter
                            </th>
                            {periods.map(p => (
                                <th key={p} className="px-4 py-3 font-medium text-right border-b border-zinc-200 dark:border-zinc-800 min-w-[140px] whitespace-nowrap">
                                    <div className="flex flex-col">
                                        <span className="text-zinc-900 dark:text-zinc-100 font-bold">{p.replace("_", " ")}</span>
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {masterRows.map((row, idx) => {
                            // Skip if no label
                            if (!row.label) return null;

                            return (
                                <tr key={`${row.key}-${idx}`} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/20 transition-colors">
                                    <td className="px-4 py-2 border-r border-zinc-200 dark:border-zinc-800 sticky left-0 bg-white dark:bg-zinc-900 z-10 text-zinc-600 dark:text-zinc-400 font-medium">
                                        {row.label}
                                    </td>

                                    {periods.map(p => {
                                        // Retrieve value using the metric KEY
                                        let val = lookups[p][row.key];
                                        return (
                                            <td key={p} className="px-4 py-2 text-right font-mono text-zinc-700 dark:text-zinc-300 border-b border-zinc-50 dark:border-zinc-800/50 max-w-[200px]">
                                                <div className="break-words whitespace-normal text-xs leading-relaxed">
                                                    {fmt(val)}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
