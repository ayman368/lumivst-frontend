'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine
} from 'recharts';
import { API_BASE_URL } from '@/lib/api/config';

export default function NFPChangeView() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Date Range and Mode State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [displayMode, setDisplayMode] = useState<'Value' | 'Chg' | 'Chg%'>('Value');
  const [selectedRange, setSelectedRange] = useState<number | 'MAX'>(5);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
      }
    }
    if (isDatePickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDatePickerOpen]);



  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch PAYEMS data
        const res = await fetch(`${API_BASE_URL}/api/economic-indicators/PAYEMS?limit=3000`);
        if (!res.ok) throw new Error('Data fetch failed');
        const json = await res.json();
        
        // Reverse to chronological
        const chronologicalData = json.map((item: any) => ({
          date: item.report_date,
          value: item.value
        })).reverse();
        
        // Calculate Month-over-Month Change mathematically mapped down to all 3 modes
        const diffData = [];
        for (let i = 2; i < chronologicalData.length; i++) {
          const currentTotal = chronologicalData[i].value;
          const prevTotal = chronologicalData[i - 1].value;
          const prevPrevTotal = chronologicalData[i - 2].value;

          const nfpValue = currentTotal - prevTotal;              // Direct Change
          const prevNfpValue = prevTotal - prevPrevTotal;

          const chg = nfpValue - prevNfpValue;                    // Chg of the Change
          const chgPercent = prevNfpValue !== 0 ? (chg / Math.abs(prevNfpValue)) * 100 : 0;

          diffData.push({
            date: chronologicalData[i].date,
            Value: nfpValue,
            Chg: chg,
            'Chg%': chgPercent,
          });
        }

        setData(diffData);

        // Default to selectedRange initially
        if (diffData.length > 0) {
            const latestDateStr = diffData[diffData.length - 1].date;
            setEndDate(latestDateStr);
            const d = new Date(latestDateStr);
            d.setFullYear(d.getFullYear() - 5);
            setStartDate(d.toISOString().split('T')[0]);
        }

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Filtered data based on range
  const filteredData = useMemo(() => {
    if (!startDate || !endDate) return data;
    return data.filter(d => d.date >= startDate && d.date <= endDate);
  }, [data, startDate, endDate]);

  const handleRangeClick = (years: number | 'MAX') => {
    if (data.length === 0) return;
    const latestDateStr = data[data.length - 1].date;
    setSelectedRange(years);
    setEndDate(latestDateStr);

    if (years === 'MAX') {
        setStartDate(data[0].date);
    } else {
        const d = new Date(latestDateStr);
        d.setFullYear(d.getFullYear() - years);
        const newStart = d.toISOString().split('T')[0];
        const actualStart = data[0].date;
        setStartDate(newStart < actualStart ? actualStart : newStart);
    }
  };

  // Dynamically determine X-Axis ticks depending on length
  let xAxisTicks: string[] = [];
  if (filteredData.length > 0) {
      const len = filteredData.length;
      
      if (len <= 24) {  
          // Up to 2 years: show every single month
          xAxisTicks = filteredData.map(d => d.date);
      } else if (len <= 12 * 7) { 
          // 3 to 7 years: show quarters
          xAxisTicks = filteredData.filter(d => ['01', '04', '07', '10'].includes(d.date.substring(5, 7))).map(d => d.date);
      } else if (len <= 12 * 20) {
          // 10 to 20 years: show every single year
          xAxisTicks = filteredData.filter(d => d.date.endsWith('-01-01')).map(d => d.date);
      } else {
          // MAX: show every 5 years (e.g., 1940, 1945, 1950) to prevent overlap
          xAxisTicks = filteredData.filter(d => {
              const month = d.date.substring(5, 7);
              const year = parseInt(d.date.substring(0, 4));
              return month === '01' && year % 5 === 0;
          }).map(d => d.date);
      }
  }

  // Dynamically determine Y-Axis ticks based on Trading Economics algorithm OR explicit overrides
  let yAxisTicks: number[] | undefined = undefined;
  let yDomain: [number, number] | ['auto', 'auto'] = ['auto', 'auto'];

  if (displayMode === 'Chg%' || selectedRange === 'MAX' || selectedRange === 10) {
      // Dynamic Trading Economics TE-like math for MAX and 10Y and percentage
      if (filteredData.length > 0) {
          const vals = filteredData.map(d => d[displayMode]);
          const dataMax = Math.max(...vals, 0);
          const dataMin = Math.min(...vals, 0);

          const span = dataMax - dataMin;
          if (span > 0) {
              const pairs = [[5, 0], [4, -1], [3, -2], [2, -3], [1, -4], [0, -5]];
              let bestStep = Infinity;
              let bestPair = [5, 0];

              for (const [N, M] of pairs) {
                  if (N === 0 && dataMax > 0) continue; 
                  if (M === 0 && dataMin < 0) continue; 
                  
                  let reqStepP = N > 0 ? dataMax / N : 0;
                  let reqStepN = M < 0 ? Math.abs(dataMin) / Math.abs(M) : 0;
                  
                  let requiredStep = Math.max(reqStepP, reqStepN);
                  if (requiredStep < bestStep) {
                      bestStep = requiredStep;
                      bestPair = [N, M];
                  }
              }

              if (bestStep === 0) bestStep = 1;
              const magnitude = Math.pow(10, Math.floor(Math.log10(bestStep))); 
              const normalized = bestStep / magnitude; 
              
              const roundMult = 2; 
              const roundedNormalized = Math.ceil(normalized * roundMult) / roundMult; 
              const finalStep = roundedNormalized * magnitude;

              const [N, M] = bestPair;
              const generatedTicks = [];
              for (let i = M; i <= N; i++) {
                  generatedTicks.push(i * finalStep);
              }
              yAxisTicks = generatedTicks;
              yDomain = [M * finalStep, N * finalStep];
          }
      }
  } else {
      // Strict hardcoded exact match for 1Y, 3Y, 5Y as requested by the user
      if (selectedRange === 1) {
          yAxisTicks = [-130, -65, 0, 65, 130, 195];
          yDomain = [-130, 195];
      } else if (selectedRange === 3) {
          yAxisTicks = [-170, -85, 0, 85, 170, 255];
          yDomain = [-170, 255];
      } else if (selectedRange === 5) {
          yAxisTicks = [-200, 0, 200, 400, 600, 800, 1000];
          yDomain = [-200, 1000];
      }
  }

  const formatXAxis = (dateStr: string) => {
    if (!dateStr) return '';
    const month = dateStr.substring(5, 7);
    const year = dateStr.substring(0, 4);
    if (month === '01') return year;    // January shows as Year (e.g., "2024")
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('en-US', { month: 'short' }); // Apr, Jul, Oct
  };

  // Custom toolitp absolutely matching screenshot
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dateObj = new Date(label + "T12:00:00");
      const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      const val = payload[0].value;
      
      let displayStr = '';
      if (displayMode === 'Chg%') {
          displayStr = val > 0 ? `+${val.toFixed(2)}%` : `${val.toFixed(2)}%`;
      } else {
          const rounded = Math.round(val).toLocaleString();
          displayStr = `${rounded} Thousand`;
      }
      
      return (
        <div className="bg-white text-[11px] px-3 py-1.5 border border-blue-300 rounded shadow-[0_2px_6px_rgba(0,0,0,0.15)] text-center min-w-[90px] z-50">
          <div className="font-bold text-gray-800 pb-1 mb-1 border-b border-gray-400">{dateStr}</div>
          <div className="text-gray-800">{displayStr}</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-2">
      {/* Top Header Controls aligned to top left like TE */}
      <div className="flex justify-start mb-4 pl-1 relative" ref={datePickerRef}>
        <div className="flex items-center border border-[#ccc] rounded-sm bg-white h-[30px] my-1 text-[#555]">
            <div 
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className={`px-2 border-r border-[#ccc] flex items-center justify-center h-full hover:bg-gray-100 cursor-pointer ${isDatePickerOpen ? 'bg-[#e5e7eb]' : ''}`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <button onClick={() => handleRangeClick(1)} className={`px-2.5 h-full text-[11px] tracking-wide ${selectedRange === 1 ? 'bg-[#e5e7eb] text-[#333]' : 'text-gray-600 hover:bg-gray-50'}`}>1Y</button>
            <button onClick={() => handleRangeClick(3)} className={`px-2.5 h-full text-[11px] tracking-wide ${selectedRange === 3 ? 'bg-[#e5e7eb] text-[#333]' : 'text-gray-600 hover:bg-gray-50'}`}>3Y</button>
            <button onClick={() => handleRangeClick(5)} className={`px-2.5 h-full text-[11px] tracking-wide ${selectedRange === 5 ? 'bg-[#e5e7eb] text-[#333]' : 'text-gray-600 hover:bg-gray-50'}`}>5Y</button>
            <button onClick={() => handleRangeClick(10)} className={`px-2.5 h-full text-[11px] tracking-wide ${selectedRange === 10 ? 'bg-[#e5e7eb] text-[#333]' : 'text-gray-600 hover:bg-gray-50'}`}>10Y</button>
            <button onClick={() => handleRangeClick('MAX')} className={`px-3 h-full text-[11px] tracking-wide ${selectedRange === 'MAX' ? 'bg-[#e5e7eb] text-[#333]' : 'text-gray-600 hover:bg-gray-50'}`}>MAX</button>
        </div>

        {/* Date Picker Popover */}
        {isDatePickerOpen && (
            <div className="absolute top-[40px] left-1 bg-white border border-[#ccc] shadow-[0_2px_8px_rgba(0,0,0,0.1)] p-2 z-[60] flex flex-col space-y-2 w-[140px]">
                <input 
                  type="date" 
                  className="border border-[#ccc] px-1 py-1 text-[11px] text-center w-full focus:outline-none focus:border-[#4d7eb2]" 
                  value={startDate} 
                  onChange={e => { setStartDate(e.target.value); setSelectedRange(0); }} 
                />
                <input 
                  type="date" 
                  className="border border-[#ccc] px-1 py-1 text-[11px] text-center w-full focus:outline-none focus:border-[#4d7eb2]" 
                  value={endDate} 
                  onChange={e => { setEndDate(e.target.value); setSelectedRange(0); }} 
                />
            </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 text-gray-500">Loading data...</div>
      ) : error ? (
        <div className="text-red-500 bg-red-50 p-4 rounded-md">{error}</div>
      ) : filteredData.length === 0 ? (
         <div className="flex justify-center items-center h-64 text-gray-500">No data available. Go to Admin Dashboard to Update Data.</div>
      ) : (
        <div className="border border-gray-200">
          <div className="h-[350px] w-full pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filteredData}
                margin={{ top: 25, right: 30, left: 10, bottom: 5 }}
                barCategoryGap={selectedRange === 'MAX' ? "0%" : "15%"}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#f0f0f0"/>
                <XAxis 
                  dataKey="date" 
                  ticks={xAxisTicks}
                  tickFormatter={formatXAxis}
                  tick={{ fontSize: 11, fill: '#111' }} 
                  tickMargin={10}
                  tickLine={false}
                  axisLine={{ stroke: '#d1d5db' }}
                  interval={0}
                />
                <YAxis 
                  domain={yDomain}
                  ticks={yAxisTicks}
                  label={{ value: displayMode === 'Chg%' ? '%' : 'Thousand', angle: 0, position: 'top', offset: 12, style: { textAnchor: 'middle', fill: '#888', fontSize: 10 } }} 
                  tickFormatter={(val) => displayMode === 'Chg%' ? parseFloat(val.toString()).toFixed(1) : Math.round(val).toLocaleString()}
                  tick={{ fontSize: 11, fill: '#111' }}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                  orientation="right"
                />
                <Tooltip 
                  content={<CustomTooltip />}
                  cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                />
                <ReferenceLine y={0} stroke="#cdcdcd" strokeWidth={1.5} />
                <Bar dataKey={displayMode} isAnimationActive={false}>
                  {filteredData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry[displayMode] >= 0 ? '#4d7eb2' : '#f4dcb0'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Bottom Footer Legends */}
          <div className="flex justify-between items-center text-[11px] px-6 py-2 border-t border-gray-100 mb-1">
              <div className="text-gray-400">U.S. Bureau of Labor Statistics</div>
              <div className="flex space-x-4 font-semibold">
                  <button onClick={() => setDisplayMode('Value')} className={`${displayMode === 'Value' ? 'text-[#0088cc]' : 'text-[#333]'} hover:text-[#0088cc] flex items-center`}>Value</button>
                  <button onClick={() => setDisplayMode('Chg')} className={`${displayMode === 'Chg' ? 'text-[#0088cc]' : 'text-[#333]'} hover:text-[#0088cc] flex items-center`}>Chg</button>
                  <button onClick={() => setDisplayMode('Chg%')} className={`${displayMode === 'Chg%' ? 'text-[#0088cc]' : 'text-[#333]'} hover:text-[#0088cc] flex items-center`}>Chg%</button>
              </div>
          </div>
        </div>
      )}
    </div>
  );
}
