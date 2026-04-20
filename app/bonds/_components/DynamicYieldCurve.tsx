'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { API_BASE_URL } from '@/lib/api/config';

export default function DynamicYieldCurve() {
  const [ycData, setYcData] = useState<any[]>([]);
  const [sp500Data, setSp500Data] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const sp500ContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const resYC = await fetch(`${API_BASE_URL}/api/economic-indicators/yield-curve?limit=25000`);
        if (!resYC.ok) throw new Error('Failed to fetch yield curve data');
        const jsonYC = await resYC.json();
        const sortedYC = [...jsonYC].reverse();
        setYcData(sortedYC);

        const resSP = await fetch(`${API_BASE_URL}/api/economic-indicators/SP500?limit=25000`);
        if (resSP.ok) {
          const jsonSP = await resSP.json();
          setSp500Data([...jsonSP].reverse());
        }

        if (sortedYC.length > 0) {
          setSelectedDate(sortedYC[sortedYC.length - 1].report_date);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const currentCurveData = React.useMemo(() => {
    if (!selectedDate || ycData.length === 0) return [];
    const dayData = ycData.find(d => d.report_date === selectedDate);
    if (!dayData) return [];

    const maturities = [
      { key: 'month_1', label: '1M', sort: 1 },
      { key: 'month_3', label: '3M', sort: 3 },
      { key: 'month_6', label: '6M', sort: 6 },
      { key: 'year_1', label: '1Y', sort: 12 },
      { key: 'year_2', label: '2Y', sort: 24 },
      { key: 'year_3', label: '3Y', sort: 36 },
      { key: 'year_5', label: '5Y', sort: 60 },
      { key: 'year_7', label: '7Y', sort: 84 },
      { key: 'year_10', label: '10Y', sort: 120 },
      { key: 'year_20', label: '20Y', sort: 240 },
      { key: 'year_30', label: '30Y', sort: 360 },
    ];

    return maturities
      .filter(m => dayData[m.key] !== null && dayData[m.key] !== undefined)
      .map(m => ({ maturity: m.label, yield: dayData[m.key], sort: m.sort }));
  }, [ycData, selectedDate]);

  const getDateFromMouseX = useCallback((clientX: number) => {
    const container = sp500ContainerRef.current;
    if (!container || sp500Data.length === 0) return;
    const rect = container.getBoundingClientRect();
    const chartLeft = rect.left + 20 + 40;
    const chartRight = rect.right - 10;
    let ratio = (clientX - chartLeft) / (chartRight - chartLeft);
    ratio = Math.max(0, Math.min(1, ratio));
    const idx = Math.round(ratio * (sp500Data.length - 1));
    const newDate = sp500Data[idx]?.trade_date;
    if (newDate && newDate !== selectedDate) setSelectedDate(newDate);
  }, [sp500Data, selectedDate]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    getDateFromMouseX(e.clientX);
  }, [getDateFromMouseX]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) getDateFromMouseX(e.clientX);
  }, [isDragging, getDateFromMouseX]);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  useEffect(() => {
    const onUp = () => setIsDragging(false);
    window.addEventListener('mouseup', onUp);
    return () => window.removeEventListener('mouseup', onUp);
  }, []);

  const selectedIndex = ycData.findIndex(d => d.report_date === selectedDate);

  const curveShape = React.useMemo(() => {
    if (currentCurveData.length < 2) return 'FLAT';
    const diff = currentCurveData[currentCurveData.length - 1].yield - currentCurveData[0].yield;
    if (diff > 0.5) return 'NORMAL';
    if (diff < -0.3) return 'INVERTED';
    return 'FLAT';
  }, [currentCurveData]);

  const shapeColor = curveShape === 'NORMAL' ? '#0a7c52' : curveShape === 'INVERTED' ? '#b91c1c' : '#92640a';
  const shapeBg = curveShape === 'NORMAL' ? '#ecfdf5' : curveShape === 'INVERTED' ? '#fef2f2' : '#fffbeb';
  const shapeBorder = curveShape === 'NORMAL' ? '#6ee7b7' : curveShape === 'INVERTED' ? '#fca5a5' : '#fcd34d';

  const axisTickStyle = { fontSize: 11, fill: '#4b5563', fontFamily: 'monospace' };
  const gridStyle = { stroke: '#e5e7eb', strokeDasharray: '3 3' };

  // Compute S&P 500 Y-axis ticks dynamically (4 evenly spaced values from data)
  const sp500YTicks = React.useMemo(() => {
    if (sp500Data.length === 0) return [];
    const closes = sp500Data.map((d: any) => d.close).filter((v: number) => v != null);
    const min = Math.floor(Math.min(...closes));
    const max = Math.ceil(Math.max(...closes));
    const step = (max - min) / 3;
    return [min, Math.round(min + step), Math.round(min + step * 2), max];
  }, [sp500Data]);

  const YCTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4, padding: '3px 9px', fontSize: 11, fontFamily: 'monospace', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}>
        <span style={{ color: '#9ca3af' }}>{payload[0].payload.maturity} </span>
        <span style={{ color: shapeColor, fontWeight: 700 }}>{payload[0].value.toFixed(2)}%</span>
      </div>
    );
  };

  const SP500Tooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4, padding: '3px 9px', fontSize: 11, fontFamily: 'monospace', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}>
        <span style={{ color: '#9ca3af' }}>{payload[0].payload.trade_date} </span>
        <span style={{ color: '#1d4ed8', fontWeight: 700 }}>
          {payload[0].value?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      </div>
    );
  };

  const sp500Close = sp500Data.find(s => s.trade_date === selectedDate)?.close ?? null;
  const formattedDate = selectedDate
    ? new Date(selectedDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

  return (
    <div style={{ background: '#f9fafb', padding: '14px 16px 12px', borderRadius: 8, fontFamily: 'monospace', border: '1px solid #e5e7eb', maxWidth: '50%', margin: '0 auto' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span style={{ color: '#111827', fontSize: 13, fontWeight: 700, letterSpacing: 0.5 }}>
          US TREASURY YIELD CURVE
        </span>
        <span style={{ color: '#9ca3af', fontSize: 11 }}>vs S&amp;P 500</span>
        <span style={{
          marginLeft: 'auto', fontSize: 10, fontWeight: 700, letterSpacing: 1,
          color: shapeColor, background: shapeBg, border: `1px solid ${shapeBorder}`,
          borderRadius: 4, padding: '2px 9px', textTransform: 'uppercase',
          flexShrink: 0, whiteSpace: 'nowrap'
        }}>
          {curveShape}
        </span>
      </div>

      {error && (
        <div style={{ color: '#b91c1c', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 4, padding: '6px 10px', marginBottom: 8, fontSize: 12 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 13 }}>
          Loading market data…
        </div>
      ) : ycData.length === 0 ? (
        <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: 12 }}>
          No data — run the scraper first.
        </div>
      ) : (
        <>
          {/* ── Dual Charts ── */}
          {/* ✅ Height reduced to 320, left chart narrowed to 220px */}
          <div style={{ display: 'flex', height: 400, border: '1px solid #e5e7eb', borderRadius: 6, overflow: 'hidden' }}>

            {/* LEFT: Yield Curve */}
            <div style={{ width: 220, height: '100%', position: 'relative', background: '#ffffff', borderRight: '1px solid #e5e7eb', flexShrink: 0 }}>
              <div style={{ position: 'absolute', bottom: 52, left: 48, zIndex: 10, fontSize: 10, color: '#6b7280', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
                {formattedDate}
              </div>
              <div style={{ position: 'absolute', bottom: 52, right: 14, zIndex: 10, fontSize: 10, color: shapeColor, fontWeight: 700, pointerEvents: 'none', whiteSpace: 'nowrap' }}>
                {curveShape}
              </div>

              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={currentCurveData} margin={{ top: 18, right: 14, left: 4, bottom: 28 }}>
                  <CartesianGrid {...gridStyle} vertical horizontal />
                  <XAxis
                    type="number" dataKey="sort"
                    ticks={[1, 3, 6, 12, 24, 36, 60, 84, 120, 240, 360]}
                    tickFormatter={(v) => {
                      if (v === 1) return '1M';
                      if (v === 3) return '3M';
                      if (v === 6) return '6M';
                      if (v === 12) return '1Y';
                      if (v === 24) return '2Y';
                      if (v === 36) return '3Y';
                      if (v === 60) return '5Y';
                      if (v === 84) return '7Y';
                      if (v === 120) return '10Y';
                      if (v === 240) return '20Y';
                      if (v === 360) return '30Y';
                      return '';
                    }}
                    domain={[0, 360]}
                    tick={{ ...axisTickStyle, fontSize: 9 }} tickLine={false}
                    axisLine={{ stroke: '#d1d5db' }} tickMargin={4} height={22}
                  />
                  <YAxis
                    type="number" domain={[0, 7.5]}
                    ticks={[0, 2.5, 5.0, 7.5]}
                    tickFormatter={(v) => `${v}%`}
                    tick={axisTickStyle} tickLine={false}
                    axisLine={{ stroke: '#d1d5db' }} width={38}
                  />
                  <Tooltip cursor={false} content={<YCTooltip />} />
                  {/* ✅ strokeWidth raised to 2.8 for better visibility */}
                  <Line
                    type="linear" dataKey="yield"
                    stroke={shapeColor} strokeWidth={2.8}
                    dot={{ r: 3, fill: shapeColor, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: shapeColor, strokeWidth: 0 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* RIGHT: S&P 500 */}
            <div
              ref={sp500ContainerRef}
              style={{ flex: 1, height: '100%', position: 'relative', background: '#ffffff', cursor: isDragging ? 'col-resize' : 'crosshair', userSelect: 'none' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              <div style={{
                position: 'absolute', top: 4, left: 66, zIndex: 10,
                fontSize: 10, lineHeight: 1.4, pointerEvents: 'none', whiteSpace: 'nowrap'
              }}>
                <span style={{ color: '#111827', fontWeight: 700, fontSize: 11 }}>S&P 500</span>
                <div style={{ color: '#6b7280' }}>{formattedDate}</div>
                <div style={{ color: '#6b7280' }}>Close: <span style={{ color: '#1d4ed8', fontWeight: 700 }}>{sp500Close ? sp500Close.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '—'}</span></div>
              </div>

              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sp500Data} margin={{ top: 44, right: 10, left: 20, bottom: 28 }}>
                  <CartesianGrid {...gridStyle} vertical horizontal />
                  <XAxis
                    dataKey="trade_date"
                    tickFormatter={(v) => `'${new Date(v).getFullYear().toString().substring(2)}`}
                    minTickGap={30}
                    tick={axisTickStyle} tickLine={false}
                    axisLine={{ stroke: '#e5e7eb' }} tickMargin={4} height={22}
                  />
                  <YAxis
                    domain={sp500YTicks.length >= 2 ? [sp500YTicks[0], sp500YTicks[sp500YTicks.length - 1]] : ['auto', 'auto']}
                    ticks={sp500YTicks}
                    tickFormatter={(v) => v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    tick={axisTickStyle} tickLine={false}
                    axisLine={{ stroke: '#d1d5db' }} width={62}
                  />
                  <Tooltip content={<SP500Tooltip />} cursor={false} />
                  <Line
                    type="linear" dataKey="close"
                    stroke="#3b82f6" strokeWidth={1.5}
                    dot={false} activeDot={false}
                    isAnimationActive={false}
                  />
                  {selectedDate && (
                    <ReferenceLine x={selectedDate} stroke={shapeColor} strokeWidth={1.5} strokeDasharray="4 3" />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── Slider only ── */}
          <div style={{ display: 'flex', alignItems: 'center', marginTop: 10, gap: 10, fontSize: 11, color: '#6b7280' }}>
            <span style={{ flexShrink: 0 }}>Trail</span>

            <div style={{ position: 'relative', width: 180, height: 14, flexShrink: 0 }}>
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 2, transform: 'translateY(-50%)', background: '#e5e7eb', borderRadius: 2 }} />
              <div style={{
                position: 'absolute', top: '50%', left: 0, height: 2,
                transform: 'translateY(-50%)', borderRadius: 2, background: shapeColor,
                width: `${(((ycData.length - 1) - selectedIndex) / (ycData.length - 1)) * 100}%`
              }} />
              <div style={{
                position: 'absolute', top: '50%', width: 13, height: 13,
                background: '#fff', border: `2px solid ${shapeColor}`, borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                left: `${(((ycData.length - 1) - selectedIndex) / (ycData.length - 1)) * 100}%`,
                pointerEvents: 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.12)'
              }} />
              <input
                type="range" min={0} max={ycData.length - 1} step={1}
                value={(ycData.length - 1) - selectedIndex}
                onChange={(e) => {
                  const mappedIndex = (ycData.length - 1) - parseInt(e.target.value, 10);
                  setSelectedDate(ycData[mappedIndex].report_date);
                }}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, cursor: 'ew-resize', zIndex: 10 }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}