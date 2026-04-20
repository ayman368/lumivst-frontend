'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ReferenceArea } from 'recharts';
import { API_BASE_URL } from '@/lib/api/config';
import { TrendingUp, Download } from 'lucide-react';

interface IndicatorRow {
  report_date: string;
  indicator_code: string;
  value: number;
  yoy_pct: number | null;
}

export default function SP500PERatioPage() {
  const [data, setData] = useState<IndicatorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<string>('5Y');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/economic-indicators/SP500_PE?limit=50000`)
      .then(res => res.json())
      .then((json) => {
        const arr = Array.isArray(json) ? json : [];
        const sorted = arr.sort((a: IndicatorRow, b: IndicatorRow) => a.report_date.localeCompare(b.report_date));
        setData(sorted);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching S&P 500 PE Ratio data:", err);
        setLoading(false);
      });
  }, []);

  const getFilteredData = () => {
    if (data.length === 0) return data;

    if (timeRange === 'CUSTOM') {
      return data.filter(d => {
        const t = d.report_date;
        const s = customStart || '0000-01-01';
        const e = customEnd || '9999-12-31';
        return t >= s && t <= e;
      });
    }

    if (timeRange === 'MAX') return data;
    const latestDateStr = data[data.length - 1].report_date;
    const parts = latestDateStr.split('-');
    const years = timeRange === '1Y' ? 1 : timeRange === '5Y' ? 5 : 10;
    const cutoffStr = `${parseInt(parts[0]) - years}-${parts[1]}-${parts[2]}`;
    
    return data.filter(d => d.report_date >= cutoffStr);
  };
  const filteredData = getFilteredData();

  // Statistical calculations for Mean and +/- 1 Sigma (Standard Deviation)
  const { mean, stdDev } = useMemo(() => {
    if (filteredData.length === 0) return { mean: 0, stdDev: 0 };
    const sum = filteredData.reduce((acc, curr) => acc + curr.value, 0);
    const m = sum / filteredData.length;
    const variance = filteredData.reduce((acc, curr) => acc + Math.pow(curr.value - m, 2), 0) / filteredData.length;
    return { mean: m, stdDev: Math.sqrt(variance) };
  }, [filteredData]);

  // Table data: newest first
  const tableData = useMemo(() => {
    return [...filteredData].reverse();
  }, [filteredData]);

  // Latest value for header display
  const latestValue = data.length > 0 ? data[data.length - 1] : null;

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-slate-50">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <TrendingUp className="text-blue-600" size={32} />
            S&P 500 PE Ratio
            {latestValue && (
              <span className="text-blue-600 text-2xl ml-2">: {latestValue.value.toFixed(2)}</span>
            )}
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            Measures the Price-to-Earnings ratio of the S&P 500 index. Sourced from GuruFocus.
            <span className="ml-3 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
              {data.length} records loaded {data.length > 0 && `(${data[0].report_date} → ${data[data.length-1].report_date})`}
            </span>
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="h-[500px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : data.length === 0 ? (
          <div className="h-[500px] flex items-center justify-center text-gray-500 flex-col gap-4">
            <p className="text-xl">No PE Ratio data available yet.</p>
            <p className="text-sm">Please visit the Admin page to trigger the GuruFocus Scraper.</p>
          </div>
        ) : (
          <div className="w-full">
            <div className="flex flex-col md:flex-row justify-end items-end md:items-center gap-4 mb-4 border-b pb-4">
              <div className="flex items-center gap-2">
                <input 
                  type="date" 
                  className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 text-gray-700"
                  value={customStart}
                  onChange={(e) => { setCustomStart(e.target.value); setTimeRange('CUSTOM'); }}
                  title="Start Date"
                />
                <span className="text-gray-500 text-sm font-medium">to</span>
                <input 
                  type="date" 
                  className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 text-gray-700"
                  value={customEnd}
                  onChange={(e) => { setCustomEnd(e.target.value); setTimeRange('CUSTOM'); }}
                  title="End Date"
                />
              </div>
              <div className="inline-flex bg-slate-100 rounded-lg p-1.5 shadow-inner">
                {['1Y', '5Y', '10Y', 'MAX'].map(tr => (
                  <button
                    key={tr}
                    onClick={() => { setTimeRange(tr); setCustomStart(''); setCustomEnd(''); }}
                    className={`px-5 py-1.5 text-sm font-semibold rounded-md transition-all ${timeRange === tr ? 'bg-white shadow text-blue-700' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    {tr}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-[550px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={filteredData}
                  margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                >
                <defs>
                  <linearGradient id="colorValueSP" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="report_date" 
                  tickFormatter={(val) => {
                    if (!val) return '';
                    const parts = val.split('-');
                    return parts[0];
                  }}
                  minTickGap={50}
                  tick={{ fill: '#64748b' }}
                />
                <YAxis 
                  domain={['auto', 'auto']} 
                  tickFormatter={(val) => `${val}`}
                  tick={{ fill: '#64748b' }}
                  width={60}
                />
                <Tooltip 
                  labelFormatter={(val) => `Date: ${val}`}
                  formatter={(value: any) => {
                    const numValue = Number(value);
                    return [isNaN(numValue) ? String(value) : `${numValue.toFixed(2)}`, 'PE Ratio'];
                  }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  fillOpacity={0.05}
                  fill="#2563eb"
                  activeDot={{ r: 6, fill: '#2563eb' }}
                />
                
                {filteredData.length > 0 && (
                  <>
                    <ReferenceArea 
                      y1={mean - stdDev} 
                      y2={mean + stdDev} 
                      fill="#3b82f6" 
                      fillOpacity={0.15} 
                    />
                    <ReferenceLine 
                      y={mean} 
                      stroke="#2563eb" 
                      strokeDasharray="3 3" 
                      label={{ position: 'insideTopLeft', value: 'Mean', fill: '#2563eb', fontSize: 12 }} 
                    />
                    <ReferenceLine 
                      y={mean + stdDev} 
                      stroke="#2563eb" 
                      strokeDasharray="3 3" 
                      label={{ position: 'insideTopRight', value: '+1σ', fill: '#2563eb', fontSize: 12 }} 
                    />
                    <ReferenceLine 
                      y={mean - stdDev} 
                      stroke="#2563eb" 
                      strokeDasharray="3 3" 
                      label={{ position: 'insideBottomRight', value: '-1σ', fill: '#2563eb', fontSize: 12 }} 
                    />
                  </>
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Historical Data Table */}
          <div className="mt-8 border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-gray-800">Historical Data</h2>
              <button className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 border border-yellow-200 px-3 py-1.5 rounded font-medium hover:bg-yellow-100 transition">
                <Download size={16} /> Bulk Export <span className="bg-yellow-500 text-white text-[10px] px-1 rounded ml-1">P</span>
              </button>
            </div>
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0 shadow-sm">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-semibold">Date</th>
                    <th scope="col" className="px-6 py-4 font-semibold text-right">Value</th>
                    <th scope="col" className="px-6 py-4 font-semibold text-right">YOY (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50 transition">
                      <td className="px-6 py-3 font-medium text-gray-900">{row.report_date}</td>
                      <td className="px-6 py-3 text-right">{row.value.toFixed(3)}</td>
                      <td className={`px-6 py-3 text-right font-medium ${row.yoy_pct !== null && row.yoy_pct !== undefined ? (row.yoy_pct >= 0 ? 'text-green-600' : 'text-red-500') : 'text-gray-400'}`}>
                        {row.yoy_pct !== null && row.yoy_pct !== undefined
                          ? `${row.yoy_pct > 0 ? '+' : ''}${row.yoy_pct.toFixed(2)}%`
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-4 bg-gray-50 text-right text-xs text-gray-500 border-t border-gray-200">
                Total {tableData.length} records
              </div>
            </div>
          </div>

        </div>
        )}
      </div>
    </div>
  );
}
