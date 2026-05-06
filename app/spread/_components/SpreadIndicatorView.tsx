'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { API_BASE_URL } from '@/lib/api/config';
import EditGraphSidebar, {
  defaultFormatSettings,
  GraphFormatSettings,
  UserDefinedLine,
} from './EditGraphSidebar';
import IndicatorHeader from './IndicatorHeader';
import IndicatorFooter from './IndicatorFooter';
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
import { SpreadMetadata } from '../_data/spreadMetadata';

interface EconomicIndicatorProps {
  indicatorCode: string;
  title: string;
  yAxisLabel: string;
  metadata?: SpreadMetadata;
  showHeader?: boolean;
}

/* ─────────────────────────────────────────────
   Safe formula evaluator
───────────────────────────────────────────── */
function safeEval(expr: string, vars: Record<string, number>): number | null {
  try {
    let e = expr.toLowerCase();
    Object.keys(vars).forEach((v) => {
      e = e.replace(new RegExp(`\\b${v}\\b`, 'g'), String(vars[v]));
    });
    if (!/^[0-9\s+\-*/.()e]+$/i.test(e)) return null;
    // eslint-disable-next-line no-new-func
    const result = new Function(`"use strict"; return (${e})`)();
    return typeof result === 'number' && isFinite(result) ? result : null;
  } catch {
    return null;
  }
}

/* ─────────────────────────────────────────────
   Build interpolated data points for a user-defined
   straight line so it can be rendered on the chart.
───────────────────────────────────────────── */
function buildUDLPoints(
  udl: UserDefinedLine,
  chartDates: string[]
): { date: string; value: number }[] {
  const t0 = new Date(udl.dateStart).getTime();
  const t1 = new Date(udl.dateEnd).getTime();
  if (t0 >= t1) return [];
  const span = t1 - t0;

  return chartDates
    .filter((d) => d >= udl.dateStart && d <= udl.dateEnd)
    .map((d) => {
      const t = new Date(d).getTime();
      const ratio = (t - t0) / span;
      const value = udl.valueStart + ratio * (udl.valueEnd - udl.valueStart);
      return { date: d, value: Math.round(value * 10000) / 10000 };
    });
}

function getStrokeDasharrayForStyle(style: 'Solid' | 'Dashed' | 'Dotted'): string | undefined {
  if (style === 'Dashed') return '6 3';
  if (style === 'Dotted') return '2 3';
  return undefined;
}

export default function SpreadIndicatorView({ indicatorCode, title, yAxisLabel, metadata, showHeader = true }: EconomicIndicatorProps) {
  const [data, setData] = useState<any[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);  // Keep full response with created_at
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
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ── Data transformation state ──
  const [selectedUnits, setSelectedUnits] = useState('');
  const [selectedFrequency, setSelectedFrequency] = useState('Monthly');
  const [outputUnits, setOutputUnits] = useState('Select');

  // ── Multi-series + formula ──
  const [additionalSeries, setAdditionalSeries] = useState<Record<string, { data: DataPoint[]; label: string }>>({});
  const [activeFormula, setActiveFormula] = useState('a');
  const [isFormulaActive, setIsFormulaActive] = useState(false);

  // ── User-defined lines (trend lines) ──
  const [userDefinedLines, setUserDefinedLines] = useState<UserDefinedLine[]>([]);

  /* ── Fetch primary series ── */
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/economic-indicators/${indicatorCode}?limit=5000`);
        if (!res.ok) throw new Error('Data fetch failed');
        const json = await res.json();

        // Store raw data (with created_at) for metadata computation
        setRawData(json);

        // Create chart data by reversing and extracting date/value
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

  /* ── Handle ESC key for fullscreen exit ── */
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

  /* ── Fetch an additional series ── */
  const fetchNewSeries = async (code: string) => {
    if (additionalSeries[code]) return;
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

  /* ── Compute dynamic metadata from fetched data ── */
  const computedMetadata = useMemo(() => {
    if (!metadata) return metadata;

    const dynamicValues: Partial<SpreadMetadata> = {};

    // Latest observation value and date (first item in reversed rawData)
    if (rawData.length > 0) {
      const latestRecord = rawData[0]; // Already in descending order from API
      if (latestRecord.value !== null && latestRecord.value !== undefined) {
        dynamicValues.observations = Number(latestRecord.value).toLocaleString();
      }

      // Observation date (report_date from latest record)
      if (latestRecord.report_date) {
        dynamicValues.observationDate = latestRecord.report_date;
      }

      // Updated timestamp (created_at from latest record)
      if (latestRecord.created_at) {
        const createdDate = new Date(latestRecord.created_at);
        dynamicValues.updated = createdDate.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short',
        });
      }
    }

    // Date range (first and last dates from data)
    if (data.length > 0) {
      const firstDate = data[0].date;
      const lastDate = data[data.length - 1].date;
      dynamicValues.dateRange = `${firstDate} to ${lastDate}`;
    }

    // Merge static metadata with computed dynamic values
    return { ...metadata, ...dynamicValues };
  }, [metadata, rawData, data]);

  /* ── Transform pipeline ── */
  const transformedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // 1. Date filter
    let filtered = data;
    if (startDate && endDate) {
      filtered = data.filter((d) => d.date >= startDate && d.date <= endDate);
    }

    // 2. Build variable map for formula
    const seriesMap: Record<string, DataPoint[]> = {
      a: filtered.map((d) => ({ date: d.date, value: d.value })),
    };
    Object.values(additionalSeries).forEach(({ data: sd }, idx) => {
      const varName = String.fromCharCode(98 + idx);
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

  /* ── Build UDL chart data keyed by line id ── */
  const udlChartData = useMemo(() => {
    const dates = transformedData.map((d) => d.date);
    const result: Record<string, { date: string; value: number }[]> = {};
    for (const udl of userDefinedLines) {
      result[udl.id] = buildUDLPoints(udl, dates);
    }
    return result;
  }, [userDefinedLines, transformedData]);

  /* ── Sidebar callbacks ── */
  const handleAddSeries = (code: string) => fetchNewSeries(code);

  const handleApplyFormula = (f: string) => {
    setActiveFormula(f);
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
    // Include UDL values in domain calculation
    const allValues = [
      ...transformedData.map(d => d.value),
      ...userDefinedLines.flatMap(udl => [udl.valueStart, udl.valueEnd]),
    ];
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
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

    /* ── Render user-defined lines as extra <Line> elements ── */
    const udlLines = userDefinedLines.map((udl) => {
      const pts = udlChartData[udl.id] ?? [];
      if (pts.length === 0) return null;

      // Merge UDL data into chart data keyed by date via a unique dataKey
      // We'll pass UDL as a separate Line on the same LineChart using referenceLines approach
      // Since recharts needs same data array, we use a ReferenceLine-style trick:
      // inject UDL values as additional keys on the main data or render as separate overlaid Line
      // The cleanest way is a custom SVG overlay — but for simplicity we add UDL data as extra keys
      // on transformedData (done below via mergedData).
      return (
        <Line
          key={udl.id}
          data={pts}
          dataKey="value"
          name={`Trend ${udl.id}`}
          stroke={udl.color}
          strokeWidth={udl.lineWidth}
          strokeDasharray={getStrokeDasharrayForStyle(udl.lineStyle)}
          dot={false}
          activeDot={false}
          isAnimationActive={false}
          connectNulls
        />
      );
    }).filter(Boolean);

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
            {udlLines}
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
            {udlLines}
          </LineChart>
        );
    }
  };

  /* ── Additional series labels map for sidebar ── */
  const additionalSeriesLabels = useMemo(() => {
    const map: Record<string, string> = {};
    Object.entries(additionalSeries).forEach(([id, { label }]) => {
      map[id] = label;
    });
    return map;
  }, [additionalSeries]);

  /* ── Render ── */
  return (
    <div className="bg-white">
      {/* Indicator Header with metadata */}
      {showHeader && computedMetadata && <IndicatorHeader metadata={computedMetadata} />}

      <div className={computedMetadata ? 'px-6' : ''}>
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

            {/* Fullscreen and Edit Graph buttons in same row */}
            <div className="flex items-center gap-2">
              {/* Fullscreen button */}
              {!loading && data.length > 0 && (
                <button
                  onClick={() => setIsFullscreen(true)}
                  className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded transition-colors"
                  title="View chart in fullscreen"
                >
                  ⛶ Fullscreen
                </button>
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
                userDefinedLines={userDefinedLines}
                onUserDefinedLinesChange={setUserDefinedLines}
                additionalSeriesLabels={additionalSeriesLabels}
              />
            </div>
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

      {/* Indicator Footer with notes and metadata */}
      {computedMetadata && <IndicatorFooter metadata={computedMetadata} />}

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
              ) : error ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-red-600 bg-red-50 p-4 rounded-md max-w-md text-center">{error}</div>
                </div>
              ) : transformedData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <span>No data available</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  {renderChart()}
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