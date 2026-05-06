'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine
} from 'recharts';
import { API_BASE_URL } from '@/lib/api/config';
import EditGraphSidebar, {
  defaultFormatSettings,
  GraphFormatSettings,
} from './EditGraphSidebar';
import {
  DataPoint,
  applyFrequencyTransform,
  applyOutputUnitsTransform,
  getTransformedYAxisLabel,
  calculateXAxisTicks,
  formatXAxisLabel,
  calculateYAxisTicks,
} from './dataTransforms';

export default function NFPChangeView() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [displayMode, setDisplayMode] = useState<'Value' | 'Chg' | 'Chg%'>('Value');
  const [selectedRange, setSelectedRange] = useState<number | 'MAX'>(5);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  // ── Format settings ──
  const [formatSettings, setFormatSettings] = useState<GraphFormatSettings>({
    ...defaultFormatSettings,
    graphType: 'Bar',
  });
  const [chartHeight, setChartHeight] = useState(350);
  const [chartWidth, setChartWidth] = useState(1320);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ── Transformation state ──
  const [selectedFrequency, setSelectedFrequency] = useState('Monthly');
  const [outputUnits, setOutputUnits] = useState('Select');

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

  /* ── Close date picker on outside click ── */
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
      }
    }
    if (isDatePickerOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDatePickerOpen]);

  /* ── Fetch data ── */
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/economic-indicators/PAYEMS?limit=3000`);
        if (!res.ok) throw new Error('Data fetch failed');
        const json = await res.json();

        const chronologicalData = json
          .map((item: any) => ({ date: item.report_date, value: item.value }))
          .reverse();

        const diffData: any[] = [];
        for (let i = 2; i < chronologicalData.length; i++) {
          const nfpValue = chronologicalData[i].value - chronologicalData[i - 1].value;
          const prevNfpValue = chronologicalData[i - 1].value - chronologicalData[i - 2].value;
          const chg = nfpValue - prevNfpValue;
          const chgPercent = prevNfpValue !== 0 ? (chg / Math.abs(prevNfpValue)) * 100 : 0;
          diffData.push({
            date: chronologicalData[i].date,
            Value: nfpValue,
            Chg: chg,
            'Chg%': chgPercent,
          });
        }

        setData(diffData);

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

  /* ── Transform pipeline ── */
  const filteredData = useMemo(() => {
    if (!startDate || !endDate) return data;
    let filtered = data.filter((d) => d.date >= startDate && d.date <= endDate);

    // Apply frequency aggregation
    if (selectedFrequency !== 'Monthly' && filtered.length > 0) {
      const asDataPoints: DataPoint[] = filtered.map((d) => ({ date: d.date, value: d[displayMode] }));
      const aggregated = applyFrequencyTransform(asDataPoints, selectedFrequency);
      return aggregated.map((d) => ({
        date: d.date,
        Value: d.value,
        Chg: d.value,
        'Chg%': d.value,
        _aggregated: true,
      }));
    }

    // Apply output units
    if (outputUnits !== 'Select' && filtered.length > 0) {
      const asDataPoints: DataPoint[] = filtered.map((d) => ({ date: d.date, value: d[displayMode] }));
      const transformed = applyOutputUnitsTransform(asDataPoints, outputUnits, selectedFrequency);
      return transformed.map((d) => ({
        date: d.date,
        Value: d.value,
        Chg: d.value,
        'Chg%': d.value,
        _transformed: true,
      }));
    }

    return filtered;
  }, [data, startDate, endDate, selectedFrequency, outputUnits, displayMode]);

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

  /* ── X-Axis ticks ── */
  const { ticks: xAxisTicks, formatType: xAxisFormatType } = useMemo(() => {
    return calculateXAxisTicks(filteredData);
  }, [filteredData]);

  /* ── Y-Axis ticks ── */
  let yAxisTicks: number[] | undefined = undefined;
  let yDomain: [number, number] | ['auto', 'auto'] = ['auto', 'auto'];

  const isOutputTransformed = outputUnits !== 'Select' || selectedFrequency !== 'Monthly';

  if (filteredData.length > 0) {
    const vals = filteredData.map((d) => d[displayMode]);
    const min = Math.min(...vals, 0); // Include 0 to ground NFP charts
    const max = Math.max(...vals, 0);
    const { ticks, domain } = calculateYAxisTicks(min, max, 8);
    yAxisTicks = ticks;
    yDomain = domain;
  }

  const dynamicYAxisLabel = isOutputTransformed
    ? getTransformedYAxisLabel('Thousand', 'Thousands of Persons', outputUnits)
    : (displayMode === 'Chg%' ? '%' : 'Thousand');

  const formatXAxis = (dateStr: string) => formatXAxisLabel(dateStr, xAxisFormatType);

  /* ── Custom Tooltip ── */
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!formatSettings.showTooltip) return null;
    if (!active || !payload || !payload.length) return null;
    const dateObj = new Date(label + 'T12:00:00');
    const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const val = payload[0].value;
    let displayStr = '';
    if (isOutputTransformed && outputUnits !== 'Select') {
      if (dynamicYAxisLabel.includes('Percent') || dynamicYAxisLabel.includes('Rate')) {
        displayStr = val > 0 ? `+${val.toFixed(2)}%` : `${val.toFixed(2)}%`;
      } else if (dynamicYAxisLabel.includes('Index')) {
        displayStr = val.toFixed(1);
      } else {
        displayStr = `${Math.round(val).toLocaleString()}`;
      }
    } else if (displayMode === 'Chg%') {
      displayStr = val > 0 ? `+${val.toFixed(2)}%` : `${val.toFixed(2)}%`;
    } else {
      displayStr = `${Math.round(val).toLocaleString()} Thousand`;
    }
    return (
      <div className="bg-white text-[11px] px-3 py-1.5 border border-blue-300 rounded shadow-[0_2px_6px_rgba(0,0,0,0.15)] text-center min-w-[90px] z-50">
        <div className="font-bold text-gray-800 pb-1 mb-1 border-b border-gray-400">{dateStr}</div>
        <div className="text-gray-800">{displayStr}</div>
      </div>
    );
  };

  /* ── Derived style helpers (same pattern as EconomicIndicatorView) ── */
  const getStrokeDasharray = (): string | undefined => {
    if (formatSettings.lineStyle === 'Dashed') return '6 3';
    if (formatSettings.lineStyle === 'Dotted') return '2 3';
    return undefined;
  };

  const getDotProps = (): false | object => {
    if (formatSettings.markType === 'None') return false;
    return { r: formatSettings.markWidth, fill: formatSettings.lineColor };
  };

  const yAxisOrientation = formatSettings.yAxisPosition === 'Right' ? 'right' : 'left';

  /* ── Chart renderer ── */
  const renderChart = () => {
    const commonProps = {
      data: filteredData,
      margin: { top: 25, right: 30, left: 10, bottom: 5 },
    };

    const commonXAxisEl = (
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
    );

    const commonYAxisEl = (
      <YAxis
        orientation={yAxisOrientation}
        domain={yDomain}
        ticks={yAxisTicks}
        label={
          formatSettings.showAxisTitles
            ? { value: dynamicYAxisLabel, angle: 0, position: 'top', offset: 12, style: { textAnchor: 'middle', fill: '#888', fontSize: 10 } }
            : undefined
        }
        tickFormatter={(val) =>
          displayMode === 'Chg%' || isOutputTransformed
            ? parseFloat(val.toString()).toFixed(1)
            : Math.round(val).toLocaleString()
        }
        tick={{ fontSize: 11, fill: '#111' }}
        tickLine={false}
        axisLine={false}
        width={40}
        scale={formatSettings.logScaleLeft ? 'log' : 'auto'}
      />
    );

    const commonTooltipEl = (
      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
    );

    switch (formatSettings.graphType) {
      case 'Line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#f0f0f0" />
            {commonXAxisEl}{commonYAxisEl}{commonTooltipEl}
            <ReferenceLine y={0} stroke="#cdcdcd" strokeWidth={1.5} />
            <Line
              type="monotone"
              dataKey={displayMode}
              stroke={formatSettings.lineColor}
              strokeWidth={formatSettings.lineWidth}
              strokeDasharray={getStrokeDasharray()}
              dot={getDotProps() as any}
              isAnimationActive={false}
            />
          </LineChart>
        );

      case 'Area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#f0f0f0" />
            {commonXAxisEl}{commonYAxisEl}{commonTooltipEl}
            <ReferenceLine y={0} stroke="#cdcdcd" strokeWidth={1.5} />
            <Area
              type="monotone"
              dataKey={displayMode}
              stroke={formatSettings.lineColor}
              fill={formatSettings.lineColor + '33'}
              strokeWidth={formatSettings.lineWidth}
              strokeDasharray={getStrokeDasharray()}
              isAnimationActive={false}
            />
          </AreaChart>
        );

      case 'Scatter':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#f0f0f0" />
            {commonXAxisEl}{commonYAxisEl}{commonTooltipEl}
            <ReferenceLine y={0} stroke="#cdcdcd" strokeWidth={1.5} />
            <Line
              type="monotone"
              dataKey={displayMode}
              stroke="transparent"
              dot={{ r: formatSettings.markWidth || 2, fill: formatSettings.lineColor }}
              isAnimationActive={false}
            />
          </LineChart>
        );

      case 'Bar':
      default:
        return (
          <BarChart {...commonProps} barCategoryGap={selectedRange === 'MAX' ? '0%' : '15%'}>
            <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#f0f0f0" />
            {commonXAxisEl}{commonYAxisEl}{commonTooltipEl}
            <ReferenceLine y={0} stroke="#cdcdcd" strokeWidth={1.5} />
            <Bar dataKey={displayMode} isAnimationActive={false}>
              {filteredData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  // FIX: use lineColor for positive bars; dim it for negative
                  fill={entry[displayMode] >= 0 ? formatSettings.lineColor : formatSettings.lineColor + '88'}
                />
              ))}
            </Bar>
          </BarChart>
        );
    }
  };

  /* ── Render ── */
  return (
    <div className="bg-white p-2">
      {/* Top controls row */}
      <div className="flex items-center justify-between mb-4 pl-1">

        {/* Left: Date range picker */}
        <div className="relative flex" ref={datePickerRef}>
          <div className="flex items-center border border-[#ccc] rounded-sm bg-white h-[30px] my-1 text-[#555]">
            <div
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className={`px-2 border-r border-[#ccc] flex items-center justify-center h-full hover:bg-gray-100 cursor-pointer ${isDatePickerOpen ? 'bg-[#e5e7eb]' : ''}`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            {([1, 3, 5, 10] as const).map((y) => (
              <button
                key={y}
                onClick={() => handleRangeClick(y)}
                className={`px-2.5 h-full text-[11px] tracking-wide ${selectedRange === y ? 'bg-[#e5e7eb] text-[#333]' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                {y}Y
              </button>
            ))}
            <button
              onClick={() => handleRangeClick('MAX')}
              className={`px-3 h-full text-[11px] tracking-wide ${selectedRange === 'MAX' ? 'bg-[#e5e7eb] text-[#333]' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              MAX
            </button>
          </div>

          {/* Date Picker Popover */}
          {isDatePickerOpen && (
            <div className="absolute top-[40px] left-0 bg-white border border-[#ccc] shadow-[0_2px_8px_rgba(0,0,0,0.1)] p-2 z-[60] flex flex-col space-y-2 w-[140px]">
              <input
                type="date"
                className="border border-[#ccc] px-1 py-1 text-[11px] text-center w-full focus:outline-none focus:border-[#4d7eb2]"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setSelectedRange(0 as any); }}
              />
              <input
                type="date"
                className="border border-[#ccc] px-1 py-1 text-[11px] text-center w-full focus:outline-none focus:border-[#4d7eb2]"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setSelectedRange(0 as any); }}
              />
            </div>
          )}
        </div>

        {/* Right: Edit Graph button – FIX: passes both h and w to onSizeApply */}
        <EditGraphSidebar
          lineInfo={{
            seriesId: 'PAYEMS',
            label: 'All Employees, Total Nonfarm (Monthly Change)',
            units: 'Thousands of Persons',
            frequency: 'Monthly',
            seasonalAdjustment: 'Seasonally Adjusted',
          }}
          formatSettings={formatSettings}
          onFormatChange={setFormatSettings}
          onSizeApply={(h, w) => { setChartHeight(h); setChartWidth(w); }}
          onFrequencyChange={(f) => setSelectedFrequency(f)}
          onOutputUnitsChange={(u) => setOutputUnits(u)}
        />
      </div>

      {/* Chart */}
      {loading ? (
        <div className="flex justify-center items-center h-64 text-gray-500">Loading data...</div>
      ) : error ? (
        <div className="text-red-500 bg-red-50 p-4 rounded-md">{error}</div>
      ) : filteredData.length === 0 ? (
        <div className="flex justify-center items-center h-64 text-gray-500">No data available. Go to Admin Dashboard to Update Data.</div>
      ) : (
        <div className="border border-gray-200 overflow-x-auto">
          <div style={{ height: chartHeight, width: chartWidth, minWidth: '100%' }} className="pt-6">
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </div>

          {/* Fullscreen button at bottom right */}
          <div className="flex justify-end px-6 mt-4 mb-2">
            <button
              onClick={() => setIsFullscreen(true)}
              className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded transition-colors"
              title="View chart in fullscreen"
            >
              ⛶ Fullscreen
            </button>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center text-[11px] px-6 py-2 border-t border-gray-100 mb-1">
            <div className="text-gray-400">U.S. Bureau of Labor Statistics</div>
            <div className="flex space-x-4 font-semibold">
              {(['Value', 'Chg', 'Chg%'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setDisplayMode(mode)}
                  className={`${displayMode === mode ? 'text-[#0088cc]' : 'text-[#333]'} hover:text-[#0088cc]`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl" style={{ maxWidth: '90vw', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: 'calc(85vh - 60px)', width: 'calc(90vw - 40px)', minWidth: '800px', overflow: 'auto' }} className="pt-6">
              <ResponsiveContainer width="100%" height="100%">
                {renderChart()}
              </ResponsiveContainer>
            </div>
          </div>
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