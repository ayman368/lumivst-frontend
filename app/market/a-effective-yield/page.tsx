'use client';

import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { API_BASE_URL } from '@/lib/api/config';
import { TrendingUp } from 'lucide-react';

interface IndicatorRow {
  report_date: string;
  indicator_code: string;
  value: number;
}

export default function AEffectiveYieldPage() {
  const [data, setData] = useState<IndicatorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<string>('5Y');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/economic-indicators/BAMLC0A3CAEY?limit=5000`)
      .then(res => res.json())
      .then((json) => {
        const arr = Array.isArray(json) ? json : [];
        // Sort ascending by date
        const sorted = arr.sort((a, b) => new Date(a.report_date).getTime() - new Date(b.report_date).getTime());
        setData(sorted);
        if (sorted.length > 0) {
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
        console.error("Error fetching effective yield data:", err);
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
        const t = new Date(d.report_date).getTime();
        const s = customStart ? new Date(customStart).getTime() : -Infinity;
        // set end date to end of day to include the selected date
        const e = customEnd ? new Date(customEnd).getTime() + 86400000 : Infinity; 
        return t >= s && t <= e;
      });
    }

    if (timeRange === 'MAX') return data;
    // We get the max date in the data (most recent date) to calculate exactly from the latest available record
    const latestDate = new Date(data[data.length - 1].report_date);
    const years = timeRange === '1Y' ? 1 : timeRange === '5Y' ? 5 : 10;
    const cutoffDate = new Date(latestDate.setFullYear(latestDate.getFullYear() - years));
    
    return data.filter(d => new Date(d.report_date).getTime() >= cutoffDate.getTime());
  };
  const filteredData = getFilteredData();

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-slate-50">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <TrendingUp className="text-emerald-600" size={32} />
            ICE BofA US Corporate A Effective Yield
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            Measures the effective yield of US dollar denominated investment grade corporate debt publicly issued in the US domestic market, rated A.
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="h-[500px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : data.length === 0 ? (
          <div className="h-[500px] flex items-center justify-center text-gray-500 flex-col gap-4">
            <p className="text-xl">No yield data available yet.</p>
            <p className="text-sm">Please visit the Admin page to trigger the scrapers.</p>
          </div>
        ) : (
          <div className="w-full">
            <div className="flex flex-col md:flex-row justify-end items-end md:items-center gap-4 mb-4 border-b pb-4">
              <div className="flex items-center gap-2">
                <input 
                  type="date" 
                  className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500 text-gray-700"
                  value={customStart}
                  onChange={(e) => { setCustomStart(e.target.value); setTimeRange('CUSTOM'); }}
                  title="Start Date"
                />
                <span className="text-gray-500 text-sm font-medium">to</span>
                <input 
                  type="date" 
                  className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500 text-gray-700"
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
                    className={`px-5 py-1.5 text-sm font-semibold rounded-md transition-all ${timeRange === tr ? 'bg-white shadow text-emerald-700' : 'text-gray-500 hover:text-gray-900'}`}
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
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  dataKey="report_date" 
                  tickFormatter={(val) => {
                    if (!val) return '';
                    const d = new Date(val);
                    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                  }}
                  minTickGap={30}
                  tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }}
                  tickMargin={8}
                />
                <YAxis 
                  domain={['auto', 'auto']} 
                  tickFormatter={(val) => val.toString()}
                  tickCount={9}
                  tick={{ fill: '#475569', fontSize: 13, fontWeight: 500 }}
                  width={75}
                  label={{ value: 'Percent', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' }, fill: '#475569', fontSize: 13, dx: 15 }}
                />
                <Tooltip 
                  labelFormatter={(val) => `Date: ${val}`}
                  formatter={(value: any) => {
                    const numValue = Number(value);
                    return [isNaN(numValue) ? String(value) : `${numValue.toFixed(2)}`, 'Effective Yield'];
                  }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#10b981" 
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                  activeDot={{ r: 6, fill: '#10b981' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {/* Fullscreen button at bottom right */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setIsFullscreen(true)}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded transition-colors"
              title="View chart in fullscreen"
            >
              ⛶ Fullscreen
            </button>
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
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="report_date" 
                      tickFormatter={(val) => {
                        if (!val) return '';
                        const d = new Date(val);
                        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                      }}
                      minTickGap={30}
                      tick={{ fill: '#475569', fontSize: 12, fontWeight: 500 }}
                      tickMargin={8}
                    />
                    <YAxis 
                      domain={['auto', 'auto']} 
                      tickFormatter={(val) => val.toString()}
                      tickCount={9}
                      tick={{ fill: '#475569', fontSize: 13, fontWeight: 500 }}
                      width={75}
                      label={{ value: 'Percent', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' }, fill: '#475569', fontSize: 13, dx: 15 }}
                    />
                    <Tooltip 
                      labelFormatter={(val) => `Date: ${val}`}
                      formatter={(value: any) => {
                        const numValue = Number(value);
                        return [isNaN(numValue) ? String(value) : `${numValue.toFixed(2)}`, 'Effective Yield'];
                      }}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#10b981" 
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorValue)"
                      activeDot={{ r: 6, fill: '#10b981' }}
                    />
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
