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

export default function BBBCorporateSpreadPage() {
  const [data, setData] = useState<IndicatorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<string>('5Y');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/economic-indicators/BAMLC0A4CBBB?limit=5000`)
      .then(res => res.json())
      .then((json) => {
        const arr = Array.isArray(json) ? json : [];
        // Sort ascending by date
        const sorted = arr.sort((a, b) => new Date(a.report_date).getTime() - new Date(b.report_date).getTime());
        setData(sorted);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching spread data:", err);
        setLoading(false);
      });
  }, []);

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
            ICE BofA "BBB" US Corporate Index Option-Adjusted Spread
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            Measures the spread of US dollar denominated investment grade corporate debt publicly issued in the US domestic market, rated BBB.
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
            <p className="text-xl">No spread data available yet.</p>
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
                    onClick={() => { setTimeRange(tr); setCustomStart(''); setCustomEnd(''); }}
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
                  <linearGradient id="colorValueBBB" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="report_date" 
                  tickFormatter={(val) => {
                    if (!val) return '';
                    const d = new Date(val);
                    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
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
                    return [isNaN(numValue) ? String(value) : `${numValue.toFixed(2)}%`, 'OAS Spread'];
                  }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorValueBBB)"
                  activeDot={{ r: 6, fill: '#10b981' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
