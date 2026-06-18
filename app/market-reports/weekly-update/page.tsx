'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/axiosClient';
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  ResponsiveContainer, LineChart, Line, ComposedChart, Area,
} from 'recharts';

// ── Design Tokens ──────────────────────────────────────────
const C = {
  pageBg: '#0d1b2a',
  cardBg: '#0f2236',
  border: '#1e3a5f',
  headerBg: '#1e3a5f',
  sectionRed: '#c0392b',
  accentBlue: '#4a9fd4',
  bull: '#27ae60',
  bear: '#e74c3c',
  neutral: '#7f8c8d',
  tasiLine: '#2980b9',
  volumeBar: '#5bc0de',
  positiveBar: '#27ae60',
  negativeBar: '#e74c3c',
  positiveFill: 'rgba(39,174,96,0.25)',
  negativeFill: 'rgba(231,76,60,0.25)',
  tableHeader: '#1e3a5f',
  tableText: '#c8d6e5',
  rowAlt: '#0d1b2a',
  badgeBg: '#2c5282',
  highBadge: '#1a5e2a',
  lowBadge: '#6b1111',
};

// ── Types / Label helpers ──────────────────────────────────
function getTrendColor(t: string) {
  if (t === 'Bull') return C.bull;
  if (t === 'Bear') return C.bear;
  return C.neutral;
}

const tooltipStyle = {
  contentStyle: {
    backgroundColor: C.cardBg,
    border: `1px solid ${C.border}`,
    borderRadius: 4,
    fontSize: 11,
    color: C.tableText,
  },
  labelStyle: { color: '#fff', fontWeight: 700 },
};

// ── Shared primitives ──────────────────────────────────────
function SectionTitle({ title }: { title: string }) {
  return (
    <div style={{ borderBottom: `2px solid ${C.sectionRed}`, marginBottom: 16 }}>
      <span style={{
        display: 'inline-block',
        backgroundColor: C.sectionRed,
        color: '#fff',
        padding: '5px 16px',
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
      }}>
        {title}
      </span>
    </div>
  );
}

function ChartTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      textAlign: 'center',
      fontWeight: 700,
      fontSize: 13,
      color: C.tableText,
      marginBottom: 10,
      letterSpacing: '0.02em',
      fontFamily: 'monospace',
    }}>
      {children}
    </div>
  );
}

function TrendBadge({ value }: { value: string }) {
  return (
    <span style={{
      display: 'inline-block',
      backgroundColor: getTrendColor(value),
      color: '#fff',
      borderRadius: 3,
      padding: '2px 10px',
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.02em',
      minWidth: 52,
      textAlign: 'center',
    }}>
      {value}
    </span>
  );
}

function ReturnCell({ value }: { value?: number | null }) {
  if (value == null) return <span style={{ color: '#4a5568' }}>—</span>;
  return (
    <span style={{ color: value >= 0 ? C.bull : C.bear, fontWeight: 700 }}>
      {value >= 0 ? '+' : ''}{Number(value).toFixed(2)}%
    </span>
  );
}

const TH: React.CSSProperties = {
  backgroundColor: C.tableHeader,
  color: '#fff',
  fontSize: 11,
  fontWeight: 700,
  padding: '8px 12px',
  textAlign: 'left',
  borderBottom: `2px solid ${C.border}`,
  whiteSpace: 'nowrap',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
};

const TD: React.CSSProperties = {
  padding: '6px 12px',
  fontSize: 12,
  color: C.tableText,
  borderBottom: `1px solid ${C.border}`,
  whiteSpace: 'nowrap',
};

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      backgroundColor: C.cardBg,
      border: `1px solid ${C.border}`,
      padding: 20,
      ...style,
    }}>
      {children}
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// PAGE COMPONENT
// ──────────────────────────────────────────────────────────
export default function WeeklyMarketUpdatePage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/api/weekly-market-update/latest');
      setReport(res.data.report);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'No report found.');
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      await apiClient.post('/api/weekly-market-update/generate');
      await fetchReport();
    } catch (err: any) {
      setError(err.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={{ backgroundColor: C.pageBg, minHeight: '100vh', fontFamily: 'Arial, Helvetica, sans-serif', color: C.tableText }}>
      {/* ── Header ── */}
      <div style={{
        backgroundColor: C.headerBg,
        padding: '0 28px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `2px solid ${C.sectionRed}`,
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: '0.02em' }}>
            Saudi Weekly Market Update
          </div>
          {report?.week_label && (
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
              {report.week_label}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>www.aporiaanalytics.com</span>
          <button
            onClick={handleGenerate}
            disabled={generating}
            style={{
              backgroundColor: C.sectionRed,
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 3,
              padding: '6px 16px',
              fontSize: 12,
              fontWeight: 700,
              cursor: generating ? 'not-allowed' : 'pointer',
              opacity: generating ? 0.65 : 1,
              letterSpacing: '0.02em',
            }}
          >
            {generating ? 'Generating…' : 'Generate Latest Week'}
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ padding: '20px 24px 60px' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>

          {loading && (
            <div style={{ textAlign: 'center', color: '#4a6fa5', padding: 64, fontSize: 14 }}>
              Loading report…
            </div>
          )}

          {error && !loading && (
            <div style={{
              border: `1px solid #744210`, backgroundColor: '#1a1000',
              color: '#fbbf24', padding: '10px 16px', borderRadius: 3,
              fontSize: 13, marginBottom: 20,
            }}>
              {error}
            </div>
          )}

          {report && !loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              <IndexPerformanceSection report={report} />
              <TrendAnalysisSection report={report} />
              <VolumeSectionComp report={report} />
              <SectorAnalyticsSection report={report} />
              <TrendBreadthSection report={report} />
              <NewHighsLowsSection report={report} />
              <StockPerformanceSection report={report} />
              <TopMarketCapSection report={report} />
              <TopBottomRankedSection report={report} />
              <BreakoutsSection report={report} />
              <BreakoutStockCharts report={report} />
              <VolumeGainersSection report={report} />

              <div style={{
                backgroundColor: C.cardBg,
                border: `1px solid ${C.border}`,
                padding: '14px 20px',
                fontSize: 10,
                color: '#4a6fa5',
                lineHeight: 1.8,
              }}>
                <strong style={{ color: '#6b8ab0' }}>DISCLAIMER:</strong> This Weekly Market Update is provided
                for informational purposes only and does not constitute investment advice, recommendations,
                or solicitation to buy or sell any securities. Past performance is not indicative of future
                results. Readers should conduct their own research and consult with qualified financial
                advisors before making any investment decisions.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── 1. Index Performance ───────────────────────────────────
function IndexPerformanceSection({ report }: any) {
  const ip = report.index_performance;
  if (!ip) return null;

  const shortName = (name: string) => {
    if (name.includes('All Share')) return 'Tadawul\nAll Share\nIndex';
    if (name.includes('Tada30')) return 'MSCI\nTada30\nIndex';
    if (name.includes('TASI50')) return 'Tadawul\nTASI50\nIndex';
    if (name.includes('Large')) return 'Tadawul\nLarge Cap\nIndex';
    if (name.includes('Medium')) return 'Tadawul\nMedium Cap\nIndex';
    if (name.includes('Small')) return 'Tadawul\nSmall Cap\nIndex';
    if (name.includes('ACWI')) return 'MSCI\nACWI';
    if (name.includes('Emerging')) return 'MSCI\nEmerging\nMarkets';
    return name;
  };

  const allBars = [
    ...(ip.market_indices || []).map((d: any) => ({ ...d, group: 'Market Indices' })),
    ...(ip.market_cap_indices || []).map((d: any) => ({ ...d, group: 'Market Cap Indices' })),
    ...(ip.global_indices || []).map((d: any) => ({ ...d, group: 'Global Indices' })),
  ];

  const data = allBars.map((d: any) => ({
    name: shortName(d.name),
    return: d.return,
    group: d.group,
    fill: d.return >= 0 ? C.positiveBar : C.negativeBar,
  }));

  const CustomLabel = (props: any) => {
    const { x, y, width, value } = props;
    const positive = value >= 0;
    return (
      <text
        x={x + width / 2}
        y={positive ? y - 4 : y + 14}
        fill={positive ? C.bull : C.bear}
        textAnchor="middle"
        fontSize={9}
        fontWeight={700}
      >
        {value >= 0 ? '+' : ''}{Number(value).toFixed(2)}%
      </text>
    );
  };

  const CustomTick = ({ x, y, payload }: any) => {
    const lines = String(payload.value).split('\n');
    return (
      <g transform={`translate(${x},${y})`}>
        {lines.map((line, i) => (
          <text key={i} x={0} y={i * 12} textAnchor="middle" fill="#94a3b8" fontSize={9}>
            {line}
          </text>
        ))}
      </g>
    );
  };

  // Group separator positions
  const groupBoundaries = [
    { x: data.findIndex(d => d.group === 'Market Cap Indices'), label: 'Market Indices' },
    { x: data.findIndex(d => d.group === 'Global Indices'), label: 'Market Cap Indices' },
    { x: data.length, label: 'Global Indices' },
  ];

  return (
    <section>
      <SectionTitle title="Weekly Index Performance:" />
      <Card>
        <ChartTitle>Weekly Index Performance Comparison</ChartTitle>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 28, right: 20, left: 0, bottom: 64 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
            <XAxis
              dataKey="name"
              tick={<CustomTick />}
              axisLine={{ stroke: C.border }}
              tickLine={false}
              interval={0}
              height={70}
            />
            <YAxis
              tickFormatter={v => `${v}%`}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              axisLine={{ stroke: C.border }}
              tickLine={false}
            />
            <Tooltip
              {...tooltipStyle}
              formatter={(v) => [`${Number(v).toFixed(2)}%`, 'Return']}
            />
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" />
            <Bar dataKey="return" maxBarSize={40} label={<CustomLabel />}>
              {data.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Group labels */}
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: -8, paddingLeft: 40 }}>
          {['Market Indices', 'Market Cap Indices', 'Global Indices'].map(g => (
            <span key={g} style={{ fontSize: 12, fontWeight: 700, color: C.tableText, letterSpacing: '0.02em' }}>
              {g}
            </span>
          ))}
        </div>
      </Card>
    </section>
  );
}

// ── 2. Trend Analysis ──────────────────────────────────────
function TrendAnalysisSection({ report }: any) {
  const ta = report.trend_analysis;
  if (!ta?.series) return null;
  const { series, high_250, low_250, daily, weekly, monthly, current_close } = ta;

  const Ribbon = ({ label, data, current }: any) => (
    <div style={{ display: 'flex', alignItems: 'center', marginTop: 6, gap: 8 }}>
      <span style={{ width: 56, fontSize: 11, fontWeight: 700, color: C.tableText, flexShrink: 0 }}>
        {label}
      </span>
      <div style={{ flex: 1, display: 'flex', height: 16, overflow: 'hidden', borderRadius: 2 }}>
        {data.map((d: any, i: number) => (
          <div key={i} style={{ flex: 1, backgroundColor: getTrendColor(d.trend), minWidth: 1 }} />
        ))}
      </div>
      <span style={{
        backgroundColor: getTrendColor(current),
        color: '#fff',
        fontSize: 11,
        fontWeight: 700,
        padding: '2px 10px',
        borderRadius: 2,
        minWidth: 58,
        textAlign: 'center',
        flexShrink: 0,
      }}>
        {current}
      </span>
    </div>
  );

  return (
    <section>
      <SectionTitle title="Trend Analysis:" />
      <Card>
        <ChartTitle>Tadawul All-Share Index: Trend Analysis</ChartTitle>
        <div style={{ position: 'relative' }}>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={series} margin={{ top: 10, right: 100, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={{ stroke: C.border }} tickLine={false} minTickGap={50} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={{ stroke: C.border }} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Line type="monotone" dataKey="close" stroke={C.tasiLine} dot={false} strokeWidth={2.5} />
              <Line type="stepAfter" dataKey="high_250" stroke={C.bull} strokeDasharray="5 4" dot={false} strokeWidth={1.5} />
              <Line type="stepAfter" dataKey="low_250" stroke={C.bear} strokeDasharray="5 4" dot={false} strokeWidth={1.5} />
            </LineChart>
          </ResponsiveContainer>

          <div style={{
            position: 'absolute', top: 10, right: 4,
            backgroundColor: C.bull, color: '#fff',
            fontSize: 11, fontWeight: 700, padding: '4px 10px',
            borderRadius: 3, lineHeight: 1.5,
          }}>
            250-Day High:<br />{high_250?.toLocaleString()}
          </div>
          <div style={{
            position: 'absolute', top: 62, right: 4,
            backgroundColor: C.bear, color: '#fff',
            fontSize: 11, fontWeight: 700, padding: '4px 10px',
            borderRadius: 3, lineHeight: 1.5,
          }}>
            250-Day Low:<br />{low_250?.toLocaleString()}
          </div>
        </div>

        <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
          <Ribbon label="Daily" data={series.slice(-200)} current={daily} />
          <Ribbon label="Weekly" data={series.filter((_: any, i: number) => i % 5 === 0).slice(-52)} current={weekly} />
          <Ribbon label="Monthly" data={series.filter((_: any, i: number) => i % 21 === 0).slice(-24)} current={monthly} />
        </div>
      </Card>
    </section>
  );
}

// ── 3. Volume ──────────────────────────────────────────────
function VolumeSectionComp({ report }: any) {
  const vol = report.volume;
  if (!vol?.series) return null;
  const { series, current_week_millions, pct_change, current_index_level } = vol;

  return (
    <section>
      <SectionTitle title="Weekly Traded Volume:" />
      <Card>
        <ChartTitle>Tadawul All-Share Index Weekly Volume</ChartTitle>
        <div style={{ position: 'relative' }}>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={series} margin={{ top: 10, right: 100, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={{ stroke: C.border }} tickLine={false} minTickGap={30} />
              <YAxis yAxisId="left" domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={{ stroke: C.border }} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={{ stroke: C.border }} tickLine={false} tickFormatter={v => `${v}M`} />
              <Tooltip {...tooltipStyle} />
              <Bar yAxisId="right" dataKey="volume" fill={C.volumeBar} maxBarSize={5} />
              <Line yAxisId="left" dataKey="index_level" type="monotone" stroke={C.tasiLine} dot={false} strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>

          <div style={{ position: 'absolute', top: 10, right: 4, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ backgroundColor: C.badgeBg, color: '#fff', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 3, textAlign: 'center', lineHeight: 1.5 }}>
              Index Level<br />{current_index_level?.toLocaleString()}
            </div>
            <div style={{ backgroundColor: C.badgeBg, color: '#fff', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 3, textAlign: 'center', lineHeight: 1.5 }}>
              Volume<br />{current_week_millions}M
            </div>
          </div>

          <div style={{
            position: 'absolute', bottom: 55, left: 60,
            backgroundColor: 'rgba(13,27,42,0.85)',
            border: `1px solid ${C.border}`,
            padding: '5px 10px', fontSize: 11, color: C.tableText, zIndex: 10,
          }}>
            Volume: {current_week_millions} Mil.<br />
            Change vs. Previous Week:{' '}
            <span style={{ color: pct_change >= 0 ? C.bull : C.bear, fontWeight: 700 }}>
              {pct_change >= 0 ? '+' : ''}{pct_change}%
            </span>
          </div>
        </div>
      </Card>
    </section>
  );
}

// ── 4. Sector Analytics ────────────────────────────────────
function SectorAnalyticsSection({ report }: any) {
  if (!report.sector_analytics?.length) return null;
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section>
      <SectionTitle title="Weekly Sector Analytics:" />
      <div style={{ border: `1px solid ${C.border}`, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Sector Name', 'Weekly % Return', 'Daily', 'Weekly', 'Monthly', 'Trend Rank', '% Below 250D High', 'Days Since 250D High'].map(h => (
                <th key={h} style={TH}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {report.sector_analytics.map((row: any, i: number) => (
              <tr
                key={row.sector}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{ backgroundColor: hovered === i ? '#1a2e42' : i % 2 === 0 ? C.cardBg : C.rowAlt }}
              >
                <td style={{ ...TD, fontWeight: 600, color: C.accentBlue }}>{row.sector}</td>
                <td style={TD}><ReturnCell value={row.weekly_return} /></td>
                <td style={TD}><TrendBadge value={row.trend_daily} /></td>
                <td style={TD}><TrendBadge value={row.trend_weekly} /></td>
                <td style={TD}><TrendBadge value={row.trend_monthly} /></td>
                <td style={{ ...TD, textAlign: 'center' }}>{row.trend_rank}</td>
                <td style={TD}>{row.pct_below_250d_high}%</td>
                <td style={TD}>{row.days_since_250d_high}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ── 5. Trend Breadth ───────────────────────────────────────
function TrendBreadthSection({ report }: any) {
  const tb = report.trend_breadth;
  const ta = report.trend_analysis;
  if (!tb || !ta) return null;
  const { current, daily, weekly, monthly } = tb;

  const getOffset = (data: any[]) => {
    const max = Math.max(...data.map(d => d.breadth));
    const min = Math.min(...data.map(d => d.breadth));
    if (max <= 0) return 0;
    if (min >= 0) return 1;
    return max / (max - min);
  };

  const BreadthPanel = ({ data, stroke, label, value, showXAxis = false }: any) => {
    const offset = getOffset(data);
    const gradId = `grad-${label}`;
    return (
      <div style={{
        height: showXAxis ? 145 : 125,
        position: 'relative',
        borderTop: `1px solid ${C.border}`,
        paddingTop: 8,
        paddingBottom: showXAxis ? 20 : 0,
      }}>
        <div style={{
          position: 'absolute', top: 10, left: 60, zIndex: 10,
          border: `2px solid ${stroke}`, borderRadius: 3,
          padding: '2px 8px', fontSize: 11, fontWeight: 700,
          color: stroke, backgroundColor: C.cardBg,
        }}>
          {label} Trend Breadth
        </div>

        <div style={{
          position: 'absolute', top: '50%', left: 2,
          transform: 'translateY(-50%) rotate(-90deg)',
          fontSize: 9, color: stroke, textAlign: 'center',
          width: 56, transformOrigin: 'center center',
        }}>
          Net Bullish<br />Stocks
        </div>

        <div style={{
          position: 'absolute', top: '50%', right: 4,
          transform: 'translateY(-50%)',
          backgroundColor: stroke, borderRadius: 3,
          padding: '4px 8px', fontSize: 11,
          fontWeight: 700, color: '#fff',
          textAlign: 'center', minWidth: 64, lineHeight: 1.5, zIndex: 10,
        }}>
          {label}<br />{value}
        </div>

        <div style={{ paddingLeft: 60, paddingRight: 82, height: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} syncId="breadth" margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset={offset} stopColor={C.positiveFill} stopOpacity={1} />
                  <stop offset={offset} stopColor={C.negativeFill} stopOpacity={1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              {showXAxis
                ? <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={{ stroke: C.border }} tickLine={false} minTickGap={30} />
                : <XAxis dataKey="date" hide />
              }
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={{ stroke: C.border }} tickLine={false} width={40} />
              <Tooltip {...tooltipStyle} />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" />
              <Area type="monotone" dataKey="breadth" stroke={stroke} strokeWidth={2} fill={`url(#${gradId})`} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <section>
      <SectionTitle title="Trend Breadth:" />
      <ChartTitle>Tadawul All-Share Index vs Trend Breadth</ChartTitle>
      <div style={{ border: `2px solid ${C.border}`, backgroundColor: C.cardBg }}>

        {/* Index Level */}
        <div style={{ height: 180, position: 'relative', paddingTop: 8 }}>
          <div style={{
            position: 'absolute', top: '50%', left: 2,
            transform: 'translateY(-50%) rotate(-90deg)',
            fontSize: 11, color: C.accentBlue, textAlign: 'center',
            width: 56, transformOrigin: 'center center',
          }}>
            Index Level
          </div>
          <div style={{
            position: 'absolute', top: '50%', right: 4,
            transform: 'translateY(-50%)',
            backgroundColor: '#2c5282', borderRadius: 3,
            padding: '4px 8px', fontSize: 11, fontWeight: 700,
            color: '#fff', textAlign: 'center', minWidth: 64,
            lineHeight: 1.5, zIndex: 10,
          }}>
            Index Level<br />{ta.current_close?.toLocaleString()}
          </div>
          <div style={{ paddingLeft: 60, paddingRight: 82, height: '100%', minHeight: 180 }}>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={ta.series} syncId="breadth" margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                <XAxis dataKey="date" hide />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={{ stroke: C.border }} tickLine={false} width={40} />
                <Line type="monotone" dataKey="close" stroke={C.tasiLine} dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <BreadthPanel data={daily} stroke="#f0ad4e" label="Daily" value={current.daily} />
        <BreadthPanel data={weekly} stroke={C.bear} label="Weekly" value={current.weekly} />
        <BreadthPanel data={monthly} stroke={C.neutral} label="Monthly" value={current.monthly} showXAxis />
      </div>
    </section>
  );
}

// ── 6. New Highs & Lows ────────────────────────────────────
function NewHighsLowsSection({ report }: any) {
  if (!report.new_highs_lows?.series) return null;
  const data = report.new_highs_lows.series.map((d: any) => ({
    ...d,
    pct_new_lows_inv: -d.pct_new_lows,
  }));
  const { pct_new_highs, pct_new_lows } = report.new_highs_lows.current;

  return (
    <section>
      <SectionTitle title="Stocks Making New Highs & New Lows:" />
      <Card>
        <ChartTitle>Tadawul All-Share Index vs. New Stock Highs &amp; Lows</ChartTitle>
        <div style={{ position: 'relative' }}>
          <ResponsiveContainer width="100%" height={360}>
            <ComposedChart data={data} margin={{ top: 10, right: 90, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={{ stroke: C.border }} tickLine={false} minTickGap={30} />
              <YAxis yAxisId="l" domain={[-100, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={{ stroke: C.border }} tickLine={false} tickFormatter={v => `${Math.abs(v)}%`} />
              <YAxis yAxisId="r" orientation="right" domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={{ stroke: C.border }} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <ReferenceLine yAxisId="l" y={0} stroke="rgba(255,255,255,0.2)" />
              <ReferenceLine yAxisId="l" y={60} stroke="transparent"
                label={{ value: '% Stocks Making 250-Day Lows', position: 'insideLeft', fontSize: 10, fill: '#94a3b8' }} />
              <ReferenceLine yAxisId="l" y={-60} stroke="transparent"
                label={{ value: '% Stocks Making 250-Day Highs', position: 'insideLeft', fontSize: 10, fill: '#94a3b8' }} />
              <Area yAxisId="l" type="monotone" dataKey="pct_new_lows_inv" fill={C.negativeFill} stroke={C.bear} strokeWidth={1.5} fillOpacity={1} />
              <Area yAxisId="l" type="monotone" dataKey="pct_new_highs" fill={C.positiveFill} stroke={C.bull} strokeWidth={1.5} fillOpacity={1} />
              <Line yAxisId="r" type="monotone" dataKey="close" stroke={C.tasiLine} dot={false} strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>

          <div style={{ position: 'absolute', top: 10, right: 4, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ backgroundColor: C.bear, color: '#fff', fontSize: 10, fontWeight: 700, padding: '4px 8px', borderRadius: 3, textAlign: 'center' }}>
              New Lows<br />{pct_new_lows}%
            </div>
            <div style={{ backgroundColor: C.bull, color: '#fff', fontSize: 10, fontWeight: 700, padding: '4px 8px', borderRadius: 3, textAlign: 'center' }}>
              New Highs<br />{pct_new_highs}%
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}

// ── 7. Stock Performance ───────────────────────────────────
function StockPerformanceSection({ report }: any) {
  if (!report.stock_performance?.returns) return null;
  const { positive_count, negative_count, mean_return, returns } = report.stock_performance;

  const data = [...returns]
    .map((r: any) => {
      const retVal = r.return_pct ?? r.return ?? 0;
      return { ...r, retVal };
    })
    .sort((a: any, b: any) => a.retVal - b.retVal)
    .map((r: any, i: number) => ({ ...r, index: i }));

  const top4 = [...data].sort((a: any, b: any) => b.retVal - a.retVal).slice(0, 4);
  const bot3 = [...data].sort((a: any, b: any) => a.retVal - b.retVal).slice(0, 3);
  const featured = [...top4, ...bot3];

  return (
    <section>
      <SectionTitle title="Stock Performance:" />
      <div style={{
        border: `2px solid ${C.border}`,
        backgroundColor: C.cardBg,
        padding: 16,
        height: 460,
        position: 'relative',
      }}>
        <ChartTitle>Weekly Saudi Stock Performance</ChartTitle>

        <div style={{
          position: 'absolute', top: 44, left: 24, zIndex: 10,
          backgroundColor: C.cardBg,
          border: `2px solid ${C.accentBlue}`,
          borderRadius: 5, padding: '10px 14px',
          fontSize: 11, color: C.tableText,
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          maxWidth: 290,
        }}>
          <div style={{ fontWeight: 700, marginBottom: 6, color: '#fff', fontSize: 12 }}>
            Positive Stocks: {positive_count} | Negative Stocks: {negative_count}
          </div>
          <ol style={{ paddingLeft: 16, margin: 0, lineHeight: 2 }}>
            {featured.map((s, i) => (
              <li key={i} style={{ fontFamily: 'monospace', fontSize: 11 }}>
                {s.stock_name}:{' '}
                <span style={{ color: s.retVal >= 0 ? C.bull : C.bear, fontWeight: 700 }}>
                  {s.retVal >= 0 ? '+' : ''}{Number(s.retVal).toFixed(2)}%
                </span>
              </li>
            ))}
          </ol>
        </div>

        <ResponsiveContainer width="100%" height={395}>
          <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
            <XAxis dataKey="index" hide axisLine={false} tickLine={false} />
            <YAxis tickFormatter={v => `${v}%`} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={{ stroke: C.border }} tickLine={false} />
            <Tooltip
              {...tooltipStyle}
              formatter={(v: any, _: any, props: any) => [`${Number(v).toFixed(2)}%`, props.payload.stock_name]}
              labelFormatter={() => ''}
            />
            <ReferenceLine
              y={mean_return}
              stroke={C.accentBlue}
              strokeDasharray="6 3"
              strokeWidth={2}
              label={{ value: `Mean: ${Number(mean_return).toFixed(2)}%`, position: 'insideLeft', fontSize: 10, fill: C.accentBlue }}
            />
            <Bar dataKey="retVal" isAnimationActive={false} maxBarSize={6}>
              {data.map((e, i) => (
                <Cell key={i} fill={e.retVal >= 0 ? C.positiveBar : C.negativeBar} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

// ── 8. Top Market Cap ──────────────────────────────────────
function TopMarketCapSection({ report }: any) {
  if (!report.top_market_cap?.length) return null;
  return (
    <section>
      <SectionTitle title="Top Market Cap Analytics:" />
      <StockTable rows={report.top_market_cap} />
    </section>
  );
}

// ── 9. Top / Bottom Ranked ─────────────────────────────────
function TopBottomRankedSection({ report }: any) {
  if (!report.top_ranked?.length && !report.bottom_ranked?.length) return null;
  return (
    <section>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <SectionTitle title="Top Ranked Stock Analytics:" />
          <StockTable rows={report.top_ranked} showExtra />
        </div>
        <div>
          <SectionTitle title="Bottom Ranked Stock Analytics:" />
          <StockTable rows={report.bottom_ranked} showExtra />
        </div>
      </div>
    </section>
  );
}

function StockTable({ rows, showExtra = false }: any) {
  const [hovered, setHovered] = useState<number | null>(null);
  const headers = showExtra
    ? ['Stock Name', '% Return', 'Daily', 'Weekly', 'Monthly', 'Rank', '% Below 250D High', 'Days Since 250D High']
    : ['Stock Name', '% Return', 'Daily', 'Weekly', 'Monthly', 'Rank'];

  return (
    <div style={{ border: `1px solid ${C.border}`, overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>{headers.map(h => <th key={h} style={TH}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row: any, i: number) => (
            <tr
              key={row.symbol || i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ backgroundColor: hovered === i ? '#1a2e42' : i % 2 === 0 ? C.cardBg : C.rowAlt }}
            >
              <td style={{ ...TD, fontWeight: 600, color: C.accentBlue }}>{row.stock_name}</td>
              <td style={TD}><ReturnCell value={row.weekly_return} /></td>
              <td style={TD}><TrendBadge value={row.trend_daily} /></td>
              <td style={TD}><TrendBadge value={row.trend_weekly} /></td>
              <td style={TD}><TrendBadge value={row.trend_monthly} /></td>
              <td style={{ ...TD, textAlign: 'center' }}>{row.trend_rank}</td>
              {showExtra && <td style={TD}>{row.pct_below_250d_high != null ? `${row.pct_below_250d_high}%` : '—'}</td>}
              {showExtra && <td style={TD}>{row.days_since_250d_high}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── 10. Price Breakouts ────────────────────────────────────
function BreakoutsSection({ report }: any) {
  if (!report.breakouts) return null;
  const { summary, breakouts } = report.breakouts;

  const getBreakoutStyle = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('all-time high') || t.includes('all time high')) return { bg: '#1a3a1a', color: C.bull, icon: '▲ ' };
    if (t.includes('all-time low') || t.includes('all time low')) return { bg: '#4a1010', color: C.bear, icon: '▼ ' };
    if (t.includes('high') || t.includes('positive')) return { bg: '#0f2a0f', color: C.bull, icon: '▲ ' };
    if (t.includes('low') || t.includes('negative')) return { bg: '#2a0f0f', color: '#ff6b6b', icon: '▼ ' };
    return { bg: '#1a2e42', color: C.tableText, icon: '' };
  };

  return (
    <section>
      <SectionTitle title="Price Breakouts:" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'All-Time Highs', value: summary.all_time_highs, color: C.bull },
          { label: 'All-Time Lows', value: summary.all_time_lows, color: C.bear },
          { label: 'Positive Breakouts', value: summary.positive_breakouts, color: C.bull },
          { label: 'Negative Breakouts', value: summary.negative_breakouts, color: C.bear },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            backgroundColor: C.cardBg,
            border: `1px solid ${C.border}`,
            padding: '14px 16px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 10, color: '#4a6fa5', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
              {label}
            </div>
            <div style={{ fontSize: 30, fontWeight: 700, color }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ border: `1px solid ${C.border}`, maxHeight: 500, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
            <tr>
              {['Stock Name', 'Sector', 'Price', 'Breakout Type', 'Date'].map(h => (
                <th key={h} style={TH}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {breakouts.map((b: any, i: number) => {
              const style = getBreakoutStyle(b.breakout_type);
              return (
                <tr key={i} style={{ backgroundColor: i % 2 === 0 ? C.cardBg : C.rowAlt }}>
                  <td style={{ ...TD, fontWeight: 600, color: C.accentBlue }}>{b.stock_name}</td>
                  <td style={TD}>{b.sector}</td>
                  <td style={TD}>{b.price}</td>
                  <td style={TD}>
                    <span style={{
                      backgroundColor: style.bg,
                      color: style.color,
                      borderRadius: 3,
                      padding: '2px 8px',
                      fontSize: 11,
                      fontWeight: 700,
                    }}>
                      {style.icon}{b.breakout_type}
                    </span>
                  </td>
                  <td style={TD}>{b.date}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ── 11. Breakout Stock Mini-Charts (IMAGE 6) ───────────────
function BreakoutStockCharts({ report }: any) {
  if (!report.breakout_stocks?.length) return null;
  const stocks = report.breakout_stocks;

  // Place breakout markers (green diamonds = highs, red diamonds = lows)
  const addMarkers = (series: any[], breakoutType: string) => {
    const isHigh = breakoutType.toLowerCase().includes('high');
    const isLow = breakoutType.toLowerCase().includes('low');
    return series.map((pt, i) => {
      const isFirst = i === 0;
      const isLast = i === series.length - 1;
      const isMid = i === Math.floor(series.length * 0.45);
      const isMarker = isFirst || isLast || isMid;
      return {
        ...pt,
        marker: isMarker ? (isHigh ? 'high' : isLow ? 'low' : null) : null,
      };
    });
  };

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!payload.marker) return null;
    const isHigh = payload.marker === 'high';
    const color = isHigh ? C.bull : C.bear;
    const size = 5;
    return (
      <polygon
        points={`${cx},${cy - size} ${cx + size},${cy} ${cx},${cy + size} ${cx - size},${cy}`}
        fill={color}
        stroke={color}
      />
    );
  };

  const BreakoutCard = ({ stock }: any) => {
    const isHigh = stock.breakout_type.toLowerCase().includes('high');
    const badgeBg = isHigh ? '#1a4d2e' : '#4d1a1a';
    const badgeText = isHigh ? '#4ade80' : '#f87171';
    const markedData = addMarkers(stock.series, stock.breakout_type);

    // Price range for Y axis
    const prices = stock.series.map((d: any) => d.price);
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    const padding = (maxP - minP) * 0.1;

    return (
      <div style={{
        backgroundColor: C.cardBg,
        border: `1px solid ${C.border}`,
        padding: '10px 12px 8px',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 6,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#c8d6e5', lineHeight: 1.4, maxWidth: '65%' }}>
            {stock.stock_name}
          </div>
          <div style={{
            backgroundColor: badgeBg,
            color: badgeText,
            fontSize: 10,
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 3,
            whiteSpace: 'nowrap',
            border: `1px solid ${badgeText}44`,
          }}>
            {stock.breakout_type}
          </div>
        </div>

        {/* Chart */}
        <div style={{ position: 'relative', height: 140 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={markedData} margin={{ top: 8, right: 40, left: -10, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,58,95,0.6)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9, fill: '#64748b' }}
                axisLine={{ stroke: C.border }}
                tickLine={false}
                minTickGap={40}
              />
              <YAxis
                domain={[minP - padding, maxP + padding]}
                tick={{ fontSize: 9, fill: '#64748b' }}
                axisLine={{ stroke: C.border }}
                tickLine={false}
                tickFormatter={v => v.toFixed(0)}
                width={36}
              />
              <Tooltip
                {...tooltipStyle}
                formatter={(v) => [Number(v).toFixed(2), 'Price']}
              />
              {/* Bull / Bear markers as diamonds */}
              <Line
                type="monotone"
                dataKey="price"
                stroke={C.tasiLine}
                dot={<CustomDot />}
                activeDot={{ r: 3, fill: C.tasiLine }}
                strokeWidth={1.5}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>

          {/* Current price badge top-right */}
          <div style={{
            position: 'absolute',
            top: 8,
            right: 4,
            backgroundColor: isHigh ? '#1a4d2e' : '#4d1a1a',
            color: isHigh ? '#4ade80' : '#f87171',
            fontSize: 11,
            fontWeight: 700,
            padding: '2px 6px',
            borderRadius: 3,
            border: `1px solid ${isHigh ? '#4ade8044' : '#f8717144'}`,
          }}>
            {Number(stock.price).toFixed(1)}
          </div>
        </div>

        {/* Legend: markers */}
        <div style={{ display: 'flex', gap: 14, marginTop: 4, fontSize: 9, color: '#64748b' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="10" height="10" viewBox="0 0 10 10">
              <polygon points="5,0 10,5 5,10 0,5" fill={C.bull} />
            </svg>
            All-Time High
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="10" height="10" viewBox="0 0 10 10">
              <polygon points="5,0 10,5 5,10 0,5" fill={C.bull} />
            </svg>
            Positive Breakout
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="10" height="10" viewBox="0 0 10 10">
              <polygon points="5,0 10,5 5,10 0,5" fill={C.bear} />
            </svg>
            All-Time Low
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="10" height="10" viewBox="0 0 10 10">
              <polygon points="5,0 10,5 5,10 0,5" fill={C.bear} />
            </svg>
            Negative Breakout
          </span>
        </div>
      </div>
    );
  };

  // 2 columns × 3 rows = 6 cards (matching image 6)
  const grid = [stocks.slice(0, 2), stocks.slice(2, 4), stocks.slice(4, 6)];

  return (
    <section>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {grid.map((row, ri) => (
          <div key={ri} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {row.map((stock: any, ci: number) => (
              <BreakoutCard key={ci} stock={stock} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

// ── 12. Volume Gainers ─────────────────────────────────────
function VolumeGainersSection({ report }: any) {
  if (!report.volume_gainers?.length) return null;
  const topGainers = report.volume_gainers.slice(0, 4);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  return (
    <section>
      <SectionTitle title="Weekly Volume Gainers:" />
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>

        {/* Left — full table */}
        <div style={{
          flex: '1.1',
          border: `1px solid ${C.border}`,
          backgroundColor: C.cardBg,
          maxHeight: 680,
          overflowY: 'auto',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
              <tr>
                <th style={TH}>Stock Name</th>
                <th style={{ ...TH, textAlign: 'right' }}>5-Day Volume % Change</th>
              </tr>
            </thead>
            <tbody>
              {report.volume_gainers.map((g: any, i: number) => (
                <tr
                  key={g.stock_name}
                  onMouseEnter={() => setHoveredRow(i)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{ backgroundColor: hoveredRow === i ? '#1a2e42' : i % 2 === 0 ? C.cardBg : C.rowAlt }}
                >
                  <td style={{ ...TD, fontWeight: 600, color: C.accentBlue, fontSize: 11 }}>{g.stock_name}</td>
                  <td style={{ ...TD, color: C.bull, fontWeight: 700, fontSize: 12, textAlign: 'right' }}>
                    +{g.volume_pct_change}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right — top 4 mini charts */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {topGainers.map((g: any, idx: number) => {
            const curr = g.current_week_vol || 5e6;
            const prev = g.prev_week_vol || 1e6;
            const miniData = [
              { x: 'Prev', volume: prev / 1e6 },
              { x: 'This', volume: curr / 1e6 },
            ];
            return (
              <div key={idx} style={{
                backgroundColor: C.cardBg,
                border: `1px solid ${C.border}`,
                position: 'relative',
              }}>
                <div style={{
                  textAlign: 'center', fontSize: 11, fontWeight: 700,
                  color: C.accentBlue, padding: '6px 0 2px',
                }}>
                  {g.stock_name}
                </div>
                <div style={{
                  position: 'absolute', top: 6, right: 8,
                  backgroundColor: C.volumeBar, color: '#fff',
                  fontSize: 10, fontWeight: 700,
                  padding: '2px 6px', borderRadius: 2,
                }}>
                  +{g.volume_pct_change}%
                </div>
                <ResponsiveContainer width="100%" height={140}>
                  <ComposedChart data={miniData} margin={{ top: 10, right: 40, left: -10, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                    <XAxis dataKey="x" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={{ stroke: C.border }} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${Number(v).toFixed(1)}M`} />
                    <Tooltip {...tooltipStyle} />
                    <Bar dataKey="volume" fill={C.volumeBar} isAnimationActive={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}