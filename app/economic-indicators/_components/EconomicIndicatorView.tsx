'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { API_BASE_URL } from '@/lib/api/config';

interface EconomicIndicatorProps {
  indicatorCode: string;
  title: string;
  yAxisLabel: string;
}

export default function EconomicIndicatorView({ indicatorCode, title, yAxisLabel }: EconomicIndicatorProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Date Range State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // We'll reverse to have chronological order for chart
        const res = await fetch(`${API_BASE_URL}/api/economic-indicators/${indicatorCode}?limit=3000`);
        if (!res.ok) throw new Error('Data fetch failed');
        const json = await res.json();
        
        const chartData = json.map((item: any) => ({
          date: item.report_date,
          value: item.value
        })).reverse();
        
        setData(chartData);

        // Initialize Data Range to Max
        if (chartData.length > 0) {
            setStartDate(chartData[0].date);
            setEndDate(chartData[chartData.length - 1].date);
        }

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [indicatorCode]);

  // Derived filtered data
  const filteredData = useMemo(() => {
    if (!startDate || !endDate) return data;
    return data.filter(d => d.date >= startDate && d.date <= endDate);
  }, [data, startDate, endDate]);

  const handleRangeClick = (years: number | 'MAX') => {
    if (data.length === 0) return;
    const latestDateStr = data[data.length - 1].date;
    setEndDate(latestDateStr);

    if (years === 'MAX') {
        setStartDate(data[0].date);
    } else {
        const d = new Date(latestDateStr);
        d.setFullYear(d.getFullYear() - years);
        // Correctly format to YYYY-MM-DD
        const newStart = d.toISOString().split('T')[0];
        // Ensure we don't go out of bounds of the actual dataset
        const actualStart = data[0].date;
        setStartDate(newStart < actualStart ? actualStart : newStart);
    }
  };

  // Exact FRED Match for Y-Axis
  let yAxisTicks: number[] | undefined = undefined;
  let yAxisDomain: [number | 'auto', number | 'auto'] = ['auto', 'auto'];

  if (indicatorCode === 'UNRATE') {
    yAxisTicks = [0.0, 2.5, 5.0, 7.5, 10.0, 12.5, 15.0];
    yAxisDomain = [0.0, 15.0];
  } else if (indicatorCode === 'PAYEMS') {
    yAxisTicks = [20000, 40000, 60000, 80000, 100000, 120000, 140000, 160000];
    yAxisDomain = [20000, 160000];
  } else if (indicatorCode === 'IC4WSA') {
    yAxisTicks = [0, 1000000, 2000000, 3000000, 4000000, 5000000, 6000000];
    yAxisDomain = [0, 6000000];
  }

  // Exact FRED Match for X-Axis (Years in multiples of 5)
  let xAxisTicks: string[] = [];
  if (filteredData.length > 0) {
    let minYear = 1900;
    if (indicatorCode === 'UNRATE') minYear = 1950;
    if (indicatorCode === 'PAYEMS') minYear = 1940;
    if (indicatorCode === 'IC4WSA') minYear = 1970;

    let lastRecordedYear = 0;
    for (let i = 0; i < filteredData.length; i++) {
        const year = parseInt(filteredData[i].date.substring(0, 4));
        if (year >= minYear && year % 5 === 0 && year !== lastRecordedYear) {
            xAxisTicks.push(filteredData[i].date);
            lastRecordedYear = year;
        }
    }
  }

  const formatYAxis = (value: number) => {
    if (indicatorCode === 'UNRATE') return value.toFixed(1);
    return value.toLocaleString();
  };

  const formatXAxis = (dateStr: string) => {
    if (!dateStr) return '';
    return dateStr.substring(0, 4); 
  };

  // Custom EXACT match for FRED Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Append T12:00:00 so timezone offsets don't shift the date backwards by 1 day
      const dateObj = new Date(label + "T12:00:00");
      const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
      
      let valFormatted = payload[0].value;
      if (indicatorCode === 'UNRATE') valFormatted = valFormatted.toFixed(1);
      else valFormatted = valFormatted.toLocaleString();

      return (
        <div className="bg-[#f8fbff] text-xs px-2 py-1.5 border border-blue-400 rounded-sm shadow opacity-95">
          <span className="font-bold text-[#333]">{dateStr}:</span> <span className="font-bold text-[#333] ml-1">{valFormatted}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-gray-200 pb-2">
        <div className="mb-4 md:mb-0">
          <h2 className="text-xl font-bold mb-1">{title}</h2>
        </div>

        {/* Date Range Selector identical to FRED */}
        {!loading && data.length > 0 && (
          <div className="flex flex-col items-center md:items-end text-sm">
              <div className="flex items-center space-x-3 text-[#0066cc] mb-2 font-medium">
                  <button onClick={() => handleRangeClick(1)} className="hover:underline focus:outline-none">1Y</button>
                  <span className="text-gray-400 font-light">|</span>
                  <button onClick={() => handleRangeClick(5)} className="hover:underline focus:outline-none">5Y</button>
                  <span className="text-gray-400 font-light">|</span>
                  <button onClick={() => handleRangeClick(10)} className="hover:underline focus:outline-none">10Y</button>
                  <span className="text-gray-400 font-light">|</span>
                  <button onClick={() => handleRangeClick('MAX')} className="hover:underline focus:outline-none">Max</button>
              </div>
              <div className="flex items-center space-x-2">
                  <input 
                      type="date" 
                      value={startDate} 
                      onChange={(e) => setStartDate(e.target.value)}
                      className="border border-gray-400 rounded px-2 py-1 text-gray-800 w-36 text-center"
                      max={endDate}
                  />
                  <span className="text-gray-800 font-medium">to</span>
                  <input 
                      type="date" 
                      value={endDate} 
                      onChange={(e) => setEndDate(e.target.value)}
                      className="border border-gray-400 rounded px-2 py-1 text-gray-800 w-36 text-center"
                      min={startDate}
                  />
              </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 text-gray-500">Loading data...</div>
      ) : error ? (
        <div className="text-red-500 bg-red-50 p-4 rounded-md">{error}</div>
      ) : filteredData.length === 0 ? (
         <div className="flex justify-center items-center h-64 text-gray-500">No data available or range too narrow.</div>
      ) : (
        <div className="h-[500px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={filteredData}
              margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="date" 
                ticks={xAxisTicks}
                tickFormatter={formatXAxis}
                tick={{ fontSize: 13, fill: '#64748b' }} 
                tickMargin={12}
                interval={0}
              />
              <YAxis 
                domain={yAxisDomain}
                ticks={yAxisTicks}
                tickFormatter={formatYAxis}
                label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', offset: -10, style: { textAnchor: 'middle', fill: '#64748b', fontSize: 13 } }} 
                tick={{ fontSize: 12, fill: '#64748b' }}
                width={85}
              />
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ stroke: '#94a3b8', strokeWidth: 1 }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                name={title}
                stroke="#0066cc" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, fill: '#0066cc', stroke: '#cce0f5', strokeWidth: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
