'use client';

import { useEffect, useState, use } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';
import { format } from 'date-fns';

interface RSData {
    date: string;
    rs_percentile: number;
    rs_raw: number;
    symbol: string;
}

export default function RSChartPage({ params }: { params: Promise<{ symbol: string }> }) {
    const { symbol } = use(params);
    const [data, setData] = useState<RSData[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        from: '2023-01-01',
        to: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchRSData();
    }, [symbol, dateRange]);

    const fetchRSData = async () => {
        setLoading(true);
        try {
            const url = `http://localhost:8000/api/rs/${symbol}?from_date=${dateRange.from}&to_date=${dateRange.to}`;
            const res = await fetch(url);

            if (!res.ok) throw new Error('Failed to fetch');

            const rsData = await res.json();
            setData(rsData);
        } catch (error) {
            console.error('Error fetching RS data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStrokeColor = (val: number) => {
        if (val >= 90) return '#22c55e'; // Green
        if (val >= 70) return '#3b82f6'; // Blue
        if (val >= 50) return '#eab308'; // Yellow
        if (val >= 30) return '#f97316'; // Orange
        return '#ef4444'; // Red
    };

    const currentRS = data.length > 0 ? data[data.length - 1].rs_percentile : 0;

    return (
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            Relative Strength (RS) Rating
                            <span className={`px-3 py-1 rounded-full text-base ${currentRS >= 90 ? 'bg-green-100 text-green-700' :
                                    currentRS >= 70 ? 'bg-blue-100 text-blue-700' :
                                        currentRS >= 50 ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                }`}>
                                {loading ? '...' : currentRS.toFixed(0)}
                            </span>
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Comparing {symbol}'s performance against the entire Saudi Market
                        </p>
                    </div>

                    <div className="flex gap-3 bg-gray-50 p-1 rounded-lg">
                        <input
                            type="date"
                            value={dateRange.from}
                            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                            className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm outline-none focus:border-blue-500"
                        />
                        <span className="text-gray-400 self-center">-</span>
                        <input
                            type="date"
                            value={dateRange.to}
                            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                            className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="h-[500px] flex items-center justify-center text-gray-400">
                        Loading chart data...
                    </div>
                ) : data.length === 0 ? (
                    <div className="h-[500px] flex items-center justify-center text-gray-400">
                        No RS data available for this period
                    </div>
                ) : (
                    <div className="h-[500px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(date) => format(new Date(date), 'MMM yy')}
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    domain={[0, 100]}
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                    dx={-10}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    labelFormatter={(date) => format(new Date(date), 'MMM dd, yyyy')}
                                    formatter={(value: number) => [value.toFixed(2), 'RS Rating']}
                                />
                                <ReferenceLine y={90} stroke="#22c55e" strokeDasharray="3 3" label={{ value: 'Strong (90)', fill: '#22c55e', fontSize: 12 }} />
                                <ReferenceLine y={70} stroke="#3b82f6" strokeDasharray="3 3" label={{ value: 'Good (70)', fill: '#3b82f6', fontSize: 12 }} />
                                <ReferenceLine y={30} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Weak (30)', fill: '#ef4444', fontSize: 12 }} />

                                <Line
                                    type="monotone"
                                    dataKey="rs_percentile"
                                    stroke="#2563eb"
                                    strokeWidth={2}
                                    dot={false}
                                    activeDot={{ r: 6, fill: '#2563eb' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                        <h3 className="text-sm font-semibold text-blue-900 mb-2">What is RS Rating?</h3>
                        <p className="text-xs text-blue-700 leading-relaxed">
                            The Relative Strength (RS) Rating measures a stock's price performance against all other stocks in the Saudi market over the last 12 months.
                        </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">Interpretation</h3>
                        <ul className="text-xs text-gray-600 space-y-1.5">
                            <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> 90-99: Superior Performance</li>
                            <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> 70-89: Strong Performance</li>
                            <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> 50-69: Average</li>
                            <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div> Below 50: Underperformance</li>
                        </ul>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900 mb-2">Methodology</h3>
                        <p className="text-xs text-gray-600 leading-relaxed">
                            Calculation gives 40% weight to the most recent 3 months and 20% to each of the previous 3 quarters. The result is ranked from 1 to 99.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
