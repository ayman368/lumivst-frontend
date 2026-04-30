'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { API_BASE_URL } from '@/lib/api/config';
import EditGraphSidebar, {
  defaultFormatSettings,
  GraphFormatSettings,
} from './EditGraphSidebar';
import {
  DataPoint,
  applyUnitsTransform,
  applyFrequencyTransform,
  applyOutputUnitsTransform,
  getTransformedYAxisLabel,
  calculateXAxisTicks,
  formatXAxisLabel,
  calculateYAxisTicks,
} from './dataTransforms';

interface EconomicIndicatorProps {
  indicatorCode: string;
  title: string;
  yAxisLabel: string;
}

/* ─────────────────────────────────────────────
   Safe formula evaluator
   Replaces variable names (a, b, c…) with their
   numeric values then uses Function() instead of
   eval() to reduce scope exposure.
───────────────────────────────────────────── */
function safeEval(expr: string, vars: Record<string, number>): number | null {
  try {
    let e = expr.toLowerCase();
    // Replace each variable with its value (whole-word match)
    Object.keys(vars).forEach((v) => {
      e = e.replace(new RegExp(`\\b${v}\\b`, 'g'), String(vars[v]));
    });
    // Only digits, operators, spaces, dots and parens are allowed after substitution
    if (!/^[0-9\s+\-*/.()e]+$/i.test(e)) return null;
    // eslint-disable-next-line no-new-func
    const result = new Function(`"use strict"; return (${e})`)();
    return typeof result === 'number' && isFinite(result) ? result : null;
  } catch {
    return null;
  }
}

export default function EconomicIndicatorView({ indicatorCode, title, yAxisLabel }: EconomicIndicatorProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // ── Format settings ──
  const [formatSettings, setFormatSettings] = useState<GraphFormatSettings>({
    ...defaultFormatSettings,
    graphType: 'Line',
  });
  const [chartHeight, setChartHeight] = useState(500);
  const [chartWidth, setChartWidth] = useState(1320);

  // ── Data transformation state ──
  const [selectedUnits, setSelectedUnits] = useState('');
  const [selectedFrequency, setSelectedFrequency] = useState('Monthly');
  const [outputUnits, setOutputUnits] = useState('Select');

  // ── Multi-series + formula ──
  const [additionalSeries, setAdditionalSeries] = useState<Record<string, { data: DataPoint[]; label: string }>>({});
  const [activeFormula, setActiveFormula] = useState('a');
  const [isFormulaActive, setIsFormulaActive] = useState(false);

  /* ── Fetch primary series ── */
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/economic-indicators/${indicatorCode}?limit=3000`);
        if (!res.ok) throw new Error('Data fetch failed');
        const json = await res.json();
        const chartData = json
          .map((item: any) => ({ date: item.report_date, value: item.value }))
          .reverse();
        setData(chartData);
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

  /* ── Fetch an additional series (from ADD LINE or Customize) ── */
  const fetchNewSeries = async (code: string) => {
    if (additionalSeries[code]) return; // already loaded
    try {
      const res = await fetch(`${API_BASE_URL}/api/economic-indicators/${code}?limit=3000`);
      if (!res.ok) return;
      const json = await res.json();
      const chartData: DataPoint[] = json
        .map((item: any) => ({ date: item.report_date, value: item.value }))
        .reverse();
      setAdditionalSeries((prev) => ({
        ...prev,
        [code]: { data: chartData, label: code },
      }));
    } catch {
      console.error('Failed to fetch series:', code);
    }
  };

  // Units label mapping
  const unitsMap: Record<string, string> = {
    UNRATE: 'Percent',
    PAYEMS: 'Thousands of Persons',
    IC4WSA: 'Number',
  };
  const defaultUnits = unitsMap[indicatorCode] ?? yAxisLabel;

  useEffect(() => {
    if (!selectedUnits) setSelectedUnits(defaultUnits);
  }, [defaultUnits, selectedUnits]);

  /* ── Transform pipeline ── */
  const transformedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // 1. Date filter
    let filtered = data;
    if (startDate && endDate) {
      filtered = data.filter((d) => d.date >= startDate && d.date <= endDate);
    }

    // 2. Build variable map for formula: a = primary, b/c/d… = additional
    const seriesMap: Record<string, DataPoint[]> = {
      a: filtered.map((d) => ({ date: d.date, value: d.value })),
    };
    Object.values(additionalSeries).forEach(({ data: sd }, idx) => {
      const varName = String.fromCharCode(98 + idx); // b, c, d …
      seriesMap[varName] = sd.filter((d) => d.date >= startDate && d.date <= endDate);
    });

    // 3. Apply formula or use raw primary
    let result: DataPoint[] = [];
    if (isFormulaActive && activeFormula.trim() !== 'a') {
      result = seriesMap['a'].map((p) => {
        const vars: Record<string, number> = {};
        Object.entries(seriesMap).forEach(([k, pts]) => {
          const match = pts.find((pt) => pt.date === p.date);
          vars[k] = match ? match.value : 0;
        });
        const computed = safeEval(activeFormula, vars);
        return { date: p.date, value: computed ?? p.value };
      });
    } else {
      result = seriesMap['a'];
    }

    // 4. Frequency aggregation
    result = applyFrequencyTransform(result, selectedFrequency);

    // 5. Units transformation
    if (selectedUnits && selectedUnits !== defaultUnits) {
      result = applyUnitsTransform(result, selectedUnits, selectedFrequency);
    }

    // 6. Output units transformation
    if (outputUnits && outputUnits !== 'Select') {
      result = applyOutputUnitsTransform(result, outputUnits, selectedFrequency);
    }

    return result;
  }, [data, additionalSeries, isFormulaActive, activeFormula, startDate, endDate, selectedUnits, selectedFrequency, outputUnits, defaultUnits]);

  /* ── Sidebar callbacks ── */
  const handleAddSeries = (code: string) => fetchNewSeries(code);

  const handleApplyFormula = (f: string) => {
    setActiveFormula(f);
    // Only activate formula mode if it's not just the identity 'a'
    setIsFormulaActive(f.trim() !== '' && f.trim() !== 'a');
  };

  const handleRangeClick = (years: number | 'MAX') => {
    if (data.length === 0) return;
    const latestDateStr = data[data.length - 1].date;
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

  /* ── Y-axis config ── */
  const isTransformed = (selectedUnits && selectedUnits !== defaultUnits) || outputUnits !== 'Select' || isFormulaActive;

  let yAxisTicks: number[] | undefined = undefined;
  let yAxisDomain: [number | 'auto', number | 'auto'] = ['auto', 'auto'];

  if (transformedData.length > 0) {
    const min = Math.min(...transformedData.map(d => d.value));
    const max = Math.max(...transformedData.map(d => d.value));
    const { ticks, domain } = calculateYAxisTicks(min, max, 8);
    yAxisTicks = ticks;
    yAxisDomain = domain;
  }

  /* ── X-axis ticks ── */
  const { ticks: xAxisTicks, formatType: xAxisFormatType } = useMemo(() => {
    return calculateXAxisTicks(transformedData);
  }, [transformedData]);

  const dynamicYAxisLabel = getTransformedYAxisLabel(yAxisLabel, selectedUnits, outputUnits);

  const formatYAxis = (value: number) => {
    if (isTransformed) {
      if (dynamicYAxisLabel.includes('Percent') || dynamicYAxisLabel.includes('Rate') || dynamicYAxisLabel.includes('Log')) return value.toFixed(1);
      if (dynamicYAxisLabel.includes('Index')) return value.toFixed(0);
    }
    if (indicatorCode === 'UNRATE') return value.toFixed(1);
    return value.toLocaleString();
  };

  const formatXAxis = (dateStr: string) => formatXAxisLabel(dateStr, xAxisFormatType);

  /* ── Derived style props from formatSettings ── */
  const getStrokeDasharray = (): string | undefined => {
    if (formatSettings.lineStyle === 'Dashed') return '6 3';
    if (formatSettings.lineStyle === 'Dotted') return '2 3';
    return undefined;
  };

  // Returns false (no dots) when markType is None, otherwise dot config
  const getDotProps = (): false | object => {
    if (formatSettings.markType === 'None') return false;
    return { r: formatSettings.markWidth, fill: formatSettings.lineColor };
  };

  const yAxisOrientation = formatSettings.yAxisPosition === 'Right' ? 'right' : 'left';

  /* ── Custom Tooltip ── */
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!formatSettings.showTooltip) return null;
    if (!active || !payload || !payload.length) return null;
    const dateObj = new Date(label + 'T12:00:00');
    const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    const rawVal: number = payload[0].value;
    let valFormatted: string;
    if (isTransformed) {
      if (dynamicYAxisLabel.includes('Percent') || dynamicYAxisLabel.includes('Rate')) valFormatted = rawVal.toFixed(2) + '%';
      else if (dynamicYAxisLabel.includes('Index')) valFormatted = rawVal.toFixed(1);
      else if (dynamicYAxisLabel.includes('Log')) valFormatted = rawVal.toFixed(4);
      else valFormatted = rawVal.toLocaleString();
    } else {
      if (indicatorCode === 'UNRATE') valFormatted = rawVal.toFixed(1);
      else valFormatted = rawVal.toLocaleString();
    }
    return (
      <div className="bg-[#f8fbff] text-xs px-2 py-1.5 border border-blue-400 rounded-sm shadow opacity-95">
        <span className="font-bold text-[#333]">{dateStr}:</span>
        <span className="font-bold text-[#333] ml-1">{valFormatted}</span>
      </div>
    );
  };

  /* ── Chart renderer ── */
  const renderChart = () => {
    const commonXAxis = (
      <XAxis
        dataKey="date"
        ticks={xAxisTicks}
        tickFormatter={formatXAxis}
        tick={{ fontSize: 13, fill: '#64748b' }}
        tickMargin={12}
        interval={0}
      />
    );

    const commonYAxis = (
      <YAxis
        orientation={yAxisOrientation}
        domain={yAxisDomain}
        ticks={yAxisTicks}
        tickFormatter={formatYAxis}
        label={
          formatSettings.showAxisTitles
            ? { value: dynamicYAxisLabel, angle: -90, position: 'insideLeft', offset: -10, style: { textAnchor: 'middle', fill: '#64748b', fontSize: 13 } }
            : undefined
        }
        scale={formatSettings.logScaleLeft ? 'log' : 'auto'}
        tick={{ fontSize: 12, fill: '#64748b' }}
        width={85}
      />
    );

    const commonTooltip = (
      <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#94a3b8', strokeWidth: 1 }} />
    );

    switch (formatSettings.graphType) {
      case 'Bar':
        return (
          <BarChart data={transformedData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            {commonXAxis}{commonYAxis}{commonTooltip}
            <Bar dataKey="value" name={title} fill={formatSettings.lineColor} isAnimationActive={false} />
          </BarChart>
        );

      case 'Area':
        return (
          <AreaChart data={transformedData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            {commonXAxis}{commonYAxis}{commonTooltip}
            <Area
              type="monotone"
              dataKey="value"
              name={title}
              stroke={formatSettings.lineColor}
              fill={formatSettings.lineColor + '33'}
              strokeWidth={formatSettings.lineWidth}
              strokeDasharray={getStrokeDasharray()}
            />
          </AreaChart>
        );

      case 'Scatter':
        return (
          <LineChart data={transformedData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            {commonXAxis}{commonYAxis}{commonTooltip}
            <Line
              type="monotone"
              dataKey="value"
              name={title}
              stroke="transparent"
              dot={{ r: formatSettings.markWidth || 2, fill: formatSettings.lineColor }}
              activeDot={{ r: 5, fill: formatSettings.lineColor, stroke: '#cce0f5', strokeWidth: 8 }}
              isAnimationActive={false}
            />
          </LineChart>
        );

      case 'Line':
      default:
        return (
          <LineChart data={transformedData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            {commonXAxis}{commonYAxis}{commonTooltip}
            <Line
              type="monotone"
              dataKey="value"
              name={title}
              stroke={formatSettings.lineColor}
              strokeWidth={formatSettings.lineWidth}
              strokeDasharray={getStrokeDasharray()}
              dot={getDotProps() as any}
              activeDot={{ r: 5, fill: formatSettings.lineColor, stroke: '#cce0f5', strokeWidth: 8 }}
              isAnimationActive={false}
            />
          </LineChart>
        );
    }
  };

  /* ── Render ── */
  return (
    <div className="bg-white">
      {/* Header row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-gray-200 pb-2">
        <div className="mb-4 md:mb-0">
          {formatSettings.showTitle && <h2 className="text-xl font-bold mb-1">{title}</h2>}
        </div>

        <div className="flex flex-col items-end gap-2">
          {/* Date range buttons */}
          {!loading && data.length > 0 && (
            <div className="flex flex-col items-center md:items-end text-sm">
              <div className="flex items-center space-x-3 text-[#0066cc] mb-2 font-medium">
                {[1, 5, 10].map((y, i, arr) => (
                  <React.Fragment key={y}>
                    <button onClick={() => handleRangeClick(y)} className="hover:underline focus:outline-none">{y}Y</button>
                    {i < arr.length - 1 && <span className="text-gray-400 font-light">|</span>}
                  </React.Fragment>
                ))}
                <span className="text-gray-400 font-light">|</span>
                <button onClick={() => handleRangeClick('MAX')} className="hover:underline focus:outline-none">Max</button>
              </div>
              <div className="flex items-center space-x-2">
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                  className="border border-gray-400 rounded px-2 py-1 text-gray-800 w-36 text-center" max={endDate} />
                <span className="text-gray-800 font-medium">to</span>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                  className="border border-gray-400 rounded px-2 py-1 text-gray-800 w-36 text-center" min={startDate} />
              </div>
            </div>
          )}

          {/* Edit Graph sidebar */}
          <EditGraphSidebar
            lineInfo={{
              seriesId: indicatorCode,
              label: title,
              units: defaultUnits,
              frequency: 'Monthly',
              seasonalAdjustment: 'Seasonally Adjusted',
            }}
            formatSettings={formatSettings}
            onFormatChange={setFormatSettings}
            onSizeApply={(h, w) => { setChartHeight(h); setChartWidth(w); }}
            onUnitsChange={(u) => setSelectedUnits(u)}
            onFrequencyChange={(f) => setSelectedFrequency(f)}
            onOutputUnitsChange={(u) => setOutputUnits(u)}
            onAddSeries={handleAddSeries}
            onFormulaApply={handleApplyFormula}
          />
        </div>
      </div>

      {/* Chart */}
      {loading ? (
        <div className="flex justify-center items-center h-64 text-gray-500">Loading data...</div>
      ) : error ? (
        <div className="text-red-500 bg-red-50 p-4 rounded-md">{error}</div>
      ) : transformedData.length === 0 ? (
        <div className="flex justify-center items-center h-64 text-gray-500">No data available or range too narrow.</div>
      ) : (
        <div className="overflow-x-auto">
          <div style={{ height: chartHeight, width: chartWidth, minWidth: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}