'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ReferenceArea } from 'recharts';
import { API_BASE_URL } from '@/lib/api/config';
import { TrendingUp } from 'lucide-react';

interface IndicatorRow {
  report_date: string;
  indicator_code: string;
  value: number;
  yoy_pct: number | null;
}

export default function SP500EarningsYieldPage() {
  const [data, setData] = useState<IndicatorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<string>('5Y');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/economic-indicators/SP500_EY?limit=50000`)
      .then(res => res.json())
      .then((json) => {
        const arr = Array.isArray(json) ? json : [];
        const sorted = arr.sort((a: IndicatorRow, b: IndicatorRow) => a.report_date.localeCompare(b.report_date));
        setData(sorted);
        if (sorted.length > 0) {
          // Calculate 5Y range as default
          const latest = sorted[sorted.length - 1].report_date;
          const parts = latest.split('-');
          const cutoff = `${parseInt(parts[0]) - 5}-${parts[1]}-${parts[2]}`;
          const actualStart = sorted[0].report_date;
          setCustomStart(cutoff < actualStart ? actualStart : cutoff);
          setCustomEnd(latest);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching S&P 500 Earnings Yield data:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    if (isFullscreen) {
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
    }
  }, [isFullscreen]);

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

  const { mean, stdDev } = useMemo(() => {
    if (filteredData.length === 0) return { mean: 0, stdDev: 0 };
    const sum = filteredData.reduce((acc, curr) => acc + curr.value, 0);
    const m = sum / filteredData.length;
    const variance = filteredData.reduce((acc, curr) => acc + Math.pow(curr.value - m, 2), 0) / filteredData.length;
    return { mean: m, stdDev: Math.sqrt(variance) };
  }, [filteredData]);

  const tableData = useMemo(() => {
    return [...filteredData].reverse();
  }, [filteredData]);

  const latestValue = data.length > 0 ? data[data.length - 1] : null;

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-slate-50">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <TrendingUp className="text-blue-600" size={32} />
            S&P 500 Earnings Yield
            {latestValue && (
              <span className="text-blue-600 text-2xl ml-2">: {latestValue.value.toFixed(3)}%</span>
            )}
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            Measures the earnings yield (EPS / Price) of the S&P 500 index. Sourced from GuruFocus.
            <span className="ml-3 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
              {data.length} records loaded {data.length > 0 && `(${data[0].report_date} → ${data[data.length - 1].report_date})`}
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
            <p className="text-xl">No Earnings Yield data available yet.</p>
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
                    onClick={() => {
                      setTimeRange(tr);
                      if (data.length > 0) {
                        const latest = data[data.length - 1].report_date;
                        setCustomEnd(latest);
                        if (tr === 'MAX') {
                          setCustomStart(data[0].report_date);
                        } else {
                          const parts = latest.split('-');
                          const years = tr === '1Y' ? 1 : tr === '5Y' ? 5 : 10;
                          const cutoff = `${parseInt(parts[0]) - years}-${parts[1]}-${parts[2]}`;
                          const actualStart = data[0].report_date;
                          setCustomStart(cutoff < actualStart ? actualStart : cutoff);
                        }
                      }
                    }}
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
                    tickFormatter={(val) => `${val}%`}
                    tick={{ fill: '#64748b' }}
                    width={60}
                  />
                  <Tooltip
                    labelFormatter={(val) => `Date: ${val}`}
                    formatter={(value: any) => {
                      const numValue = Number(value);
                      return [isNaN(numValue) ? String(value) : `${numValue.toFixed(3)}%`, 'Earnings Yield'];
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
            {/* Fullscreen button at bottom right */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setIsFullscreen(true)}
                className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded transition-colors"
                title="View chart in fullscreen"
              >
                ⛶ Fullscreen
              </button>
            </div>

            <div className="mt-8 border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm">
              <div className="p-4 border-b border-gray-200 bg-slate-50">
                <h2 className="text-xl font-bold text-gray-800">Historical Data</h2>
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
                        <td className="px-6 py-3 text-right">{row.value.toFixed(3)}%</td>
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

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-4">
          {/* Fullscreen Chart Container */}
          <div className="bg-white rounded-lg shadow-2xl" style={{ maxWidth: '90vw', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            {/* Chart Content */}
            <div style={{ height: 'calc(85vh - 60px)', width: 'calc(90vw - 40px)', minWidth: '800px', overflow: 'auto' }}>
              {loading ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <span>Loading data...</span>
                </div>
              ) : data.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <span>No data available</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={filteredData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
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
                    <YAxis domain={['auto', 'auto']} tickFormatter={(val) => `${val}%`} tick={{ fill: '#64748b' }} width={60} />
                    <Tooltip
                      labelFormatter={(val) => `Date: ${val}`}
                      formatter={(value: any) => {
                        const numValue = Number(value);
                        return [isNaN(numValue) ? String(value) : `${numValue.toFixed(3)}%`, 'Earnings Yield'];
                      }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} fillOpacity={0.05} fill="#2563eb" activeDot={{ r: 6, fill: '#2563eb' }} />
                    {filteredData.length > 0 && (
                      <>
                        <ReferenceArea y1={mean - stdDev} y2={mean + stdDev} fill="#3b82f6" fillOpacity={0.15} />
                        <ReferenceLine y={mean} stroke="#2563eb" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Mean', fill: '#2563eb', fontSize: 12 }} />
                        <ReferenceLine y={mean + stdDev} stroke="#2563eb" strokeDasharray="3 3" label={{ position: 'insideTopRight', value: '+1σ', fill: '#2563eb', fontSize: 12 }} />
                        <ReferenceLine y={mean - stdDev} stroke="#2563eb" strokeDasharray="3 3" label={{ position: 'insideBottomRight', value: '-1σ', fill: '#2563eb', fontSize: 12 }} />
                      </>
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Back Button outside chart */}
          <div className="mt-4">
            <button
              onClick={() => setIsFullscreen(false)}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded transition-colors"
              title="Close fullscreen (Press ESC)"
            >
              ← Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}