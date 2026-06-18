/**
 * Compact: All Hooks, Utilities & Components in ONE FILE
 */

'use client';

import { useCallback, useEffect, useState, CSSProperties, ReactNode } from 'react';
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  ResponsiveContainer, LineChart, Line, ComposedChart, Area,
} from 'recharts';
import { apiClient } from '@/lib/api/axiosClient';
import {
  WeeklyMarketReport, StockAnalytics, SectorData, VolumeGainer,
  COLORS, TOOLTIP_STYLE, CHART_MARGINS, getTrendColor,
  formatPercent, shortIndexName, getBreakoutStyle,
} from '@/lib/market-report';

// ═══════════════════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════════════════

export function useWeeklyReport() {
  const [report, setReport] = useState<WeeklyMarketReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<{ report: WeeklyMarketReport }>('/api/weekly-market-update/latest');
      setReport(res.data.report);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load report.');
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const generateReport = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    try {
      await apiClient.post('/api/weekly-market-update/generate');
      await fetchReport();
    } catch (err: any) {
      setError(err.message || 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  }, [fetchReport]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  return { report, loading, error, isGenerating, fetchReport, generateReport };
}

// ═══════════════════════════════════════════════════════
// PRIMITIVES
// ═══════════════════════════════════════════════════════

export const SectionTitle = ({ title }: { title: string }) => (
  <div style={{ borderBottom: `2px solid ${COLORS.sectionRed}`, marginBottom: 16 }}>
    <span style={{ display: 'inline-block', backgroundColor: COLORS.sectionRed, color: '#fff', padding: '5px 16px', fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
      {title}
    </span>
  </div>
);

export const ChartTitle = ({ children }: { children: ReactNode }) => (
  <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 13, color: COLORS.tableText, marginBottom: 10, letterSpacing: '0.02em' }}>
    {children}
  </div>
);

export const Card = ({ children, style }: { children: ReactNode; style?: CSSProperties }) => (
  <div style={{ backgroundColor: COLORS.cardBg, border: `1px solid ${COLORS.border}`, padding: 20, ...style }}>
    {children}
  </div>
);

export const TrendBadge = ({ value }: { value: string }) => (
  <span style={{ display: 'inline-block', backgroundColor: getTrendColor(value), color: '#fff', borderRadius: 3, padding: '2px 10px', fontSize: 11, fontWeight: 700, minWidth: 52, textAlign: 'center' }}>
    {value}
  </span>
);

export const ReturnCell = ({ value }: { value?: number | null }) => {
  if (value == null) return <span style={{ color: '#4a5568' }}>—</span>;
  return <span style={{ color: value >= 0 ? COLORS.bull : COLORS.bear, fontWeight: 700 }}>{value >= 0 ? '+' : ''}{Number(value).toFixed(2)}%</span>;
};

export const ErrorAlert = ({ message }: { message: string }) => (
  <div style={{ border: `1px solid ${COLORS.error}`, backgroundColor: COLORS.errorBg, color: COLORS.errorText, padding: '10px 16px', borderRadius: 3, fontSize: 13, marginBottom: 20 }}>
    {message}
  </div>
);

export const LoadingSpinner = ({ message = 'Loading report…' }: { message?: string }) => (
  <div style={{ textAlign: 'center', color: '#4a6fa5', padding: 64, fontSize: 14 }}>
    {message}
  </div>
);

export const Disclaimer = () => (
  <div style={{ backgroundColor: COLORS.cardBg, border: `1px solid ${COLORS.border}`, padding: '14px 20px', fontSize: 10, color: '#4a6fa5', lineHeight: 1.8 }}>
    <strong style={{ color: '#6b8ab0' }}>DISCLAIMER:</strong> This Weekly Market Update is for informational purposes only. Not investment advice. Readers should consult qualified financial advisors before making investment decisions.
  </div>
);

// ═══════════════════════════════════════════════════════
// TABLES
// ═══════════════════════════════════════════════════════

const TH: CSSProperties = {
  backgroundColor: COLORS.tableHeader, color: '#fff', fontSize: 11, fontWeight: 700,
  padding: '8px 12px', textAlign: 'left', borderBottom: `2px solid ${COLORS.border}`, whiteSpace: 'nowrap',
};

const TD: CSSProperties = {
  padding: '6px 12px', fontSize: 12, color: COLORS.tableText, borderBottom: `1px solid ${COLORS.border}`, whiteSpace: 'nowrap',
};

export const DataTable = ({ rows, headers, renderCell, maxHeight = '500px' }: {
  rows: any[]; headers: string[]; renderCell: (row: any, col: string, i: number) => any; maxHeight?: string;
}) => {
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <div style={{ border: `1px solid ${COLORS.border}`, overflowX: 'auto', maxHeight, overflowY: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ position: 'sticky', top: 0 }}>
          <tr>
            {headers.map(h => <th key={h} style={TH}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} style={{ backgroundColor: hovered === i ? '#1a2e42' : i % 2 === 0 ? COLORS.cardBg : COLORS.rowAlt }}>
              {headers.map(h => <td key={h} style={TD}>{renderCell(row, h, i)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// CHARTS
// ═══════════════════════════════════════════════════════

const PercentLabel = (props: any) => {
  const { x, y, width, value } = props;
  const positive = value >= 0;
  return (
    <text x={x + width / 2} y={positive ? y - 4 : y + 14} fill={positive ? COLORS.bull : COLORS.bear} textAnchor="middle" fontSize={9} fontWeight={700}>
      {value >= 0 ? '+' : ''}{Number(value).toFixed(2)}%
    </text>
  );
};

const MultilineTick = (props: any) => {
  const { x, y, payload } = props;
  const lines = String(payload.value).split('\n');
  return (
    <g transform={`translate(${x},${y})`}>
      {lines.map((line, i) => <text key={i} x={0} y={i * 12} textAnchor="middle" fill="#94a3b8" fontSize={9}>{line}</text>)}
    </g>
  );
};

// ═══════════════════════════════════════════════════════
// SECTIONS
// ═══════════════════════════════════════════════════════

export const IndexPerformanceSection = ({ data }: any) => {
  if (!data) return null;
  const allBars = [
    ...(data.market_indices || []).map((d: any) => ({ ...d, group: 'Market Indices' })),
    ...(data.market_cap_indices || []).map((d: any) => ({ ...d, group: 'Market Cap Indices' })),
    ...(data.global_indices || []).map((d: any) => ({ ...d, group: 'Global Indices' })),
  ];
  const chartData = allBars.map((d: any) => ({ name: shortIndexName(d.name), return: d.return, fill: d.return >= 0 ? COLORS.positiveBar : COLORS.negativeBar }));

  return (
    <section>
      <SectionTitle title="Weekly Index Performance:" />
      <Card>
        <ChartTitle>Weekly Index Performance Comparison</ChartTitle>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={CHART_MARGINS.large}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
            <XAxis dataKey="name" tick={<MultilineTick />} axisLine={{ stroke: COLORS.border }} tickLine={false} interval={0} height={70} />
            <YAxis tickFormatter={v => `${v}%`} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={{ stroke: COLORS.border }} tickLine={false} />
            <Tooltip {...TOOLTIP_STYLE} formatter={v => [`${Number(v).toFixed(2)}%`, 'Return']} />
            <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" />
            <Bar dataKey="return" maxBarSize={40} label={<PercentLabel />}>
              {chartData.map((e, i) => <Cell key={i} fill={e.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </section>
  );
};

export const SectorAnalyticsSection = ({ data }: { data: SectorData[] | null }) => {
  if (!data?.length) return null;
  return (
    <section>
      <SectionTitle title="Weekly Sector Analytics:" />
      <DataTable
        rows={data}
        headers={['Sector', 'Return %', 'Daily', 'Weekly', 'Monthly', 'Rank', '% Below 250D', 'Days Since High']}
        renderCell={(row, col) => {
          if (col === 'Sector') return <span style={{ color: COLORS.accentBlue, fontWeight: 600 }}>{row.sector}</span>;
          if (col === 'Return %') return <ReturnCell value={row.weekly_return} />;
          if (col === 'Daily') return <TrendBadge value={row.trend_daily} />;
          if (col === 'Weekly') return <TrendBadge value={row.trend_weekly} />;
          if (col === 'Monthly') return <TrendBadge value={row.trend_monthly} />;
          if (col === 'Rank') return <span style={{ textAlign: 'center' }}>{row.trend_rank}</span>;
          if (col === '% Below 250D') return `${row.pct_below_250d_high}%`;
          if (col === 'Days Since High') return `${row.days_since_250d_high}`;
          return '-';
        }}
      />
    </section>
  );
};

export const StockPerformanceSection = ({ data }: { data: any | null }) => {
  if (!data?.returns) return null;
  const { positive_count, negative_count, mean_return, returns } = data;
  const chartData = [...returns].map((r: any) => ({ stock_name: r.stock_name, retVal: r.return_pct ?? r.return ?? 0 })).sort((a: any, b: any) => a.retVal - b.retVal).map((r: any, i: number) => ({ ...r, index: i }));
  const top4 = [...chartData].sort((a: any, b: any) => b.retVal - a.retVal).slice(0, 4);
  const bot3 = [...chartData].sort((a: any, b: any) => a.retVal - b.retVal).slice(0, 3);
  const featured = [...top4, ...bot3];

  return (
    <section>
      <SectionTitle title="Stock Performance:" />
      <div style={{ border: `2px solid ${COLORS.border}`, backgroundColor: COLORS.cardBg, padding: 16, height: 460, position: 'relative' }}>
        <ChartTitle>Weekly Saudi Stock Performance</ChartTitle>
        <div style={{ position: 'absolute', top: 44, left: 24, zIndex: 10, backgroundColor: COLORS.cardBg, border: `2px solid ${COLORS.accentBlue}`, borderRadius: 5, padding: '10px 14px', fontSize: 11, color: COLORS.tableText, boxShadow: '0 4px 12px rgba(0,0,0,0.4)', maxWidth: 290 }}>
          <div style={{ fontWeight: 700, marginBottom: 6, color: '#fff', fontSize: 12 }}>Positive: {positive_count} | Negative: {negative_count}</div>
          <ol style={{ paddingLeft: 16, margin: 0, lineHeight: 2 }}>
            {featured.map((s: any, i: number) => (
              <li key={i} style={{ fontFamily: 'monospace', fontSize: 11 }}>
                {s.stock_name}: <span style={{ color: s.retVal >= 0 ? COLORS.bull : COLORS.bear, fontWeight: 700 }}>{s.retVal >= 0 ? '+' : ''}{Number(s.retVal).toFixed(2)}%</span>
              </li>
            ))}
          </ol>
        </div>
        <ResponsiveContainer width="100%" height={395}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
            <XAxis dataKey="index" hide />
            <YAxis tickFormatter={v => `${v}%`} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={{ stroke: COLORS.border }} tickLine={false} />
            <Tooltip {...TOOLTIP_STYLE} formatter={(v: any) => [`${Number(v).toFixed(2)}%`, 'Return']} />
            <ReferenceLine y={mean_return} stroke={COLORS.accentBlue} strokeDasharray="6 3" label={{ value: `Mean: ${Number(mean_return).toFixed(2)}%`, position: 'insideLeft', fontSize: 10, fill: COLORS.accentBlue }} />
            <Bar dataKey="retVal" isAnimationActive={false} maxBarSize={6}>
              {chartData.map((e: any, i: number) => <Cell key={i} fill={e.retVal >= 0 ? COLORS.positiveBar : COLORS.negativeBar} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

export const TopMarketCapSection = ({ data }: { data: StockAnalytics[] | null }) => {
  if (!data?.length) return null;
  return (
    <section>
      <SectionTitle title="Top Market Cap:" />
      <DataTable
        rows={data}
        headers={['Stock', 'Return %', 'Daily', 'Weekly', 'Monthly', 'Rank']}
        renderCell={(row) => {
          if (row.stock_name) return <span style={{ color: COLORS.accentBlue, fontWeight: 600 }}>{row.stock_name}</span>;
          if ('weekly_return' in row) return <ReturnCell value={row.weekly_return} />;
          if (row.trend_daily) return <TrendBadge value={row.trend_daily} />;
          if (row.trend_weekly) return <TrendBadge value={row.trend_weekly} />;
          if (row.trend_monthly) return <TrendBadge value={row.trend_monthly} />;
          return row.trend_rank;
        }}
      />
    </section>
  );
};

export const BreakoutsSection = ({ data }: { data: any | null }) => {
  if (!data?.breakouts) return null;
  const { summary, breakouts } = data;

  return (
    <section>
      <SectionTitle title="Price Breakouts:" />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
        {[
          { label: 'All-Time Highs', value: summary.all_time_highs, color: COLORS.bull },
          { label: 'All-Time Lows', value: summary.all_time_lows, color: COLORS.bear },
          { label: 'Positive Breakouts', value: summary.positive_breakouts, color: COLORS.bull },
          { label: 'Negative Breakouts', value: summary.negative_breakouts, color: COLORS.bear },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ backgroundColor: COLORS.cardBg, border: `1px solid ${COLORS.border}`, padding: '14px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: '#4a6fa5', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 30, fontWeight: 700, color }}>{value}</div>
          </div>
        ))}
      </div>
      <div style={{ border: `1px solid ${COLORS.border}`, maxHeight: 500, overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ position: 'sticky', top: 0 }}>
            <tr>{['Stock', 'Sector', 'Price', 'Type', 'Date'].map(h => <th key={h} style={TH}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {breakouts.map((b: any, i: number) => {
              const style = getBreakoutStyle(b.breakout_type);
              return (
                <tr key={i} style={{ backgroundColor: i % 2 === 0 ? COLORS.cardBg : COLORS.rowAlt }}>
                  <td style={{ ...TD, fontWeight: 600, color: COLORS.accentBlue }}>{b.stock_name}</td>
                  <td style={TD}>{b.sector}</td>
                  <td style={TD}>{b.price}</td>
                  <td style={TD}><span style={{ backgroundColor: style.bg, color: style.color, borderRadius: 3, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>{style.icon}{b.breakout_type}</span></td>
                  <td style={TD}>{b.date}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export const VolumeGainersSection = ({ data }: { data: VolumeGainer[] | null }) => {
  if (!data?.length) return null;
  const topGainers = data.slice(0, 4);

  return (
    <section>
      <SectionTitle title="Weekly Volume Gainers:" />
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: '1.1', border: `1px solid ${COLORS.border}`, backgroundColor: COLORS.cardBg, maxHeight: 680, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0 }}>
              <tr><th style={TH}>Stock Name</th><th style={{ ...TH, textAlign: 'right' }}>% Change</th></tr>
            </thead>
            <tbody>
              {data.map((g, i) => (
                <tr key={i} style={{ backgroundColor: i % 2 === 0 ? COLORS.cardBg : COLORS.rowAlt }}>
                  <td style={{ ...TD, fontWeight: 600, color: COLORS.accentBlue, fontSize: 11 }}>{g.stock_name}</td>
                  <td style={{ ...TD, color: COLORS.bull, fontWeight: 700, textAlign: 'right' }}>+{g.volume_pct_change}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {topGainers.map((g, idx) => {
            const miniData = [{ x: 'Prev', volume: (g.prev_week_vol || 1e6) / 1e6 }, { x: 'This', volume: (g.current_week_vol || 5e6) / 1e6 }];
            return (
              <div key={idx} style={{ backgroundColor: COLORS.cardBg, border: `1px solid ${COLORS.border}`, position: 'relative' }}>
                <div style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: COLORS.accentBlue, padding: '6px 0 2px' }}>{g.stock_name}</div>
                <div style={{ position: 'absolute', top: 6, right: 8, backgroundColor: COLORS.volumeBar, color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 2 }}>+{g.volume_pct_change}%</div>
                <ResponsiveContainer width="100%" height={140}>
                  <ComposedChart data={miniData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
                    <XAxis dataKey="x" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 9 }} tickFormatter={v => `${Number(v).toFixed(1)}M`} />
                    <Tooltip {...TOOLTIP_STYLE} />
                    <Bar dataKey="volume" fill={COLORS.volumeBar} isAnimationActive={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
