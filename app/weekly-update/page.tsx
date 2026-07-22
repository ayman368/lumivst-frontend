'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { apiClient } from '@/lib/api/axiosClient';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  ResponsiveContainer, LineChart, Line, ComposedChart, Area,
} from 'recharts';

// NOTE: Export features require these two packages:
//   npm install html2canvas jspdf

// ── Design Tokens (LIGHT MODE) ─────────────────────────────
const C = {
  pageBg: '#f4f6f8',
  cardBg: '#ffffff',
  border: '#e2e8f0',
  headerBg: '#1e3a5f',
  sectionRed: '#c0392b',
  accentBlue: '#2563eb',
  bull: '#16a34a',
  bear: '#dc2626',
  neutral: '#6b7280',
  tasiLine: '#2563eb',
  volumeBar: '#0ea5e9',
  positiveBar: '#16a34a',
  negativeBar: '#dc2626',
  positiveFill: 'rgba(22,163,74,0.15)',
  negativeFill: 'rgba(220,38,38,0.15)',
  tableHeader: '#1e3a5f',
  tableText: '#1e293b',
  rowAlt: '#f8fafc',
  badgeBg: '#2c5282',
  highBadge: '#16a34a',
  lowBadge: '#dc2626',
  mutedText: '#64748b',
};

// ── Types / Label helpers ──────────────────────────────────
function getTrendColor(t: string) {
  if (t === 'Bull') return C.bull;
  if (t === 'Bear') return C.bear;
  return C.neutral;
}

const tooltipStyle = {
  contentStyle: {
    backgroundColor: '#ffffff',
    border: `1px solid ${C.border}`,
    borderRadius: 4,
    fontSize: 11,
    color: C.tableText,
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  labelStyle: { color: '#0f172a', fontWeight: 700 },
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
  if (value == null) return <span style={{ color: '#94a3b8' }}>—</span>;
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
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
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
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingImg, setExportingImg] = useState(false);

  const reportRef = useRef<HTMLDivElement>(null);

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

  const fileBaseName = () => {
    const label = (report?.week_label || 'weekly-market-update').toString();
    return label.replace(/[^a-z0-9-_]+/gi, '-');
  };

  const handleExportImage = async () => {
    if (!reportRef.current) return;
    setExportingImg(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `${fileBaseName()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Image export failed:', err);
      setError('Failed to export image. Make sure html2canvas is installed.');
    } finally {
      setExportingImg(false);
    }
  };

  const handleExportPdf = async () => {
    if (!reportRef.current) return;
    setExportingPdf(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      });
      const imgData = canvas.toDataURL('image/png');

      // Build a multi-page A4 PDF, slicing the tall canvas into pages.
      const pdf = new jsPDF('p', 'pt', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${fileBaseName()}.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
      setError('Failed to export PDF. Make sure html2canvas and jspdf are installed.');
    } finally {
      setExportingPdf(false);
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>www.aporiaanalytics.com</span>

          <button
            onClick={handleExportImage}
            disabled={exportingImg || !report}
            style={{
              backgroundColor: 'transparent',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.35)',
              borderRadius: 3,
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 700,
              cursor: exportingImg || !report ? 'not-allowed' : 'pointer',
              opacity: exportingImg || !report ? 0.5 : 1,
              letterSpacing: '0.02em',
            }}
          >
            {exportingImg ? 'Exporting…' : 'Export Image'}
          </button>

          <button
            onClick={handleExportPdf}
            disabled={exportingPdf || !report}
            style={{
              backgroundColor: 'transparent',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.35)',
              borderRadius: 3,
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 700,
              cursor: exportingPdf || !report ? 'not-allowed' : 'pointer',
              opacity: exportingPdf || !report ? 0.5 : 1,
              letterSpacing: '0.02em',
            }}
          >
            {exportingPdf ? 'Exporting…' : 'Export PDF'}
          </button>

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
        <div style={{ maxWidth: 1140, margin: '0 auto' }} ref={reportRef}>

          {loading && (
            <LoadingSpinner className="h-64" />
          )}

          {error && !loading && (
            <div style={{
              border: `1px solid #fde68a`, backgroundColor: '#fffbeb',
              color: '#92400e', padding: '10px 16px', borderRadius: 3,
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
                color: C.mutedText,
                lineHeight: 1.8,
              }}>
                <strong style={{ color: '#475569' }}>DISCLAIMER:</strong> This Weekly Market Update is provided
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
    if (name.includes('Tadawul 30') || name.includes('MSCI Tadawul') || name.includes('Tada30')) return 'MSCI\nTada30\nIndex';
    if (name.includes('TASI50')) return 'Tadawul\nTASI50\nIndex';
    if (name.includes('Large')) return 'Tadawul\nLarge Cap\nIndex';
    if (name.includes('Medium')) return 'Tadawul\nMedium Cap\nIndex';
    if (name.includes('Small')) return 'Tadawul\nSmall Cap\nIndex';
    if (name.includes('ACWI')) return 'MSCI\nACWI';
    if (name.includes('Emerging')) return 'MSCI\nEmerging\nMarkets';
    return name;
  };

  const allBars = [
    ...(ip.market_indices || []).map((d: any) => ({ ...d, group: 'Market Indices', color: '#448eb5' })),
    ...(ip.market_cap_indices || []).map((d: any) => ({ ...d, group: 'Market Cap Indices', color: '#27b282' })),
  ];

  const data = allBars.map((d: any) => ({
    name: shortName(d.name),
    fullName: d.name.replace('Tadawul ', ''),
    return: d.return,
    group: d.group,
    color: d.color,
  }));

  const CustomBarLabel = (props: any) => {
    const { x, y, width, height, value, index } = props;
    const fullName = data[index]?.fullName || '';
    return (
      <g transform={`translate(${x + width / 2},${y + height + 20})`}>
        <rect x={-40} y={-10} width={80} height={34} rx={3} fill="#fff" stroke="#94a3b8" />
        <text x={0} y={4} textAnchor="middle" fill="#1e293b" fontSize={9} fontWeight={600}>
          {fullName.length > 20 ? fullName.substring(0, 18) + '...' : fullName}
        </text>
        <text x={0} y={16} textAnchor="middle" fill="#475569" fontSize={10} fontWeight={700}>
          {value >= 0 ? '+' : ''}{Number(value).toFixed(2)}%
        </text>
      </g>
    );
  };

  const CustomTick = ({ x, y, payload }: any) => {
    return null;
  };

  return (
    <section>
      <SectionTitle title="Weekly Index Performance:" />
      <Card style={{ paddingTop: 30, paddingBottom: 60 }}>
        <ChartTitle>Weekly Index Performance Comparison</ChartTitle>
        <div style={{ width: '100%', height: 350, position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
              barCategoryGap="15%"
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <ReferenceLine y={0} stroke="#475569" strokeWidth={1} />
              
              <XAxis 
                dataKey="name" 
                tick={<CustomTick />} 
                axisLine={{ stroke: '#94a3b8' }} 
                tickLine={false} 
              />
              <YAxis 
                orientation="right" 
                tickFormatter={(v) => `${v.toFixed(1)}%`}
                tick={{ fontSize: 11, fill: C.mutedText }}
                axisLine={{ stroke: '#94a3b8' }}
                tickLine={false}
              />
              
              <Tooltip contentStyle={tooltipStyle.contentStyle} labelStyle={tooltipStyle.labelStyle} />
              
              <Bar 
                dataKey="return" 
                label={<CustomBarLabel />}
                stroke="#1e293b" 
                strokeWidth={1.5}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div style={{ position: 'absolute', bottom: -10, left: 0, width: '100%', display: 'flex', justifyContent: 'space-around', fontSize: 11, fontWeight: 700, color: '#1e293b' }}>
            <div style={{ flex: 1, textAlign: 'center' }}>Market Indices</div>
            <div style={{ width: 1, backgroundColor: '#94a3b8', borderRight: '1px dashed #94a3b8' }} />
            <div style={{ flex: 1, textAlign: 'center' }}>Market Cap Indices</div>
          </div>
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

  const coloredSeries = series.map((d: any, i: number, arr: any[]) => {
    const prev = arr[i - 1];
    const next = arr[i + 1];
    return {
      ...d,
      closeBull: (d.trend === 'Bull' || prev?.trend === 'Bull' || next?.trend === 'Bull') ? d.close : null,
      closeBear: (d.trend === 'Bear' || prev?.trend === 'Bear' || next?.trend === 'Bear') ? d.close : null,
      closeNeutral: (d.trend === 'Neutral' || prev?.trend === 'Neutral' || next?.trend === 'Neutral') ? d.close : null,
    };
  });

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
          <div style={{
            position: 'absolute', top: 10, left: 10, zIndex: 10,
            display: 'flex', flexDirection: 'column', gap: 4,
            padding: '6px 8px', borderRadius: 4,
            backgroundColor: 'rgba(255,255,255,0.9)',
            border: `1px solid ${C.border}`,
            fontSize: 10, fontWeight: 700,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, backgroundColor: C.bull }} /> Bull
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, backgroundColor: C.neutral }} /> Neutral
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, backgroundColor: C.bear }} /> Bear
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={coloredSeries} margin={{ top: 10, right: 100, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: C.mutedText }} axisLine={{ stroke: C.border }} tickLine={false} minTickGap={50} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: C.mutedText }} axisLine={{ stroke: C.border }} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Line type="stepAfter" dataKey="high_250" stroke={C.bull} strokeDasharray="5 4" dot={false} strokeWidth={1.5} />
              <Line type="stepAfter" dataKey="low_250" stroke={C.bear} strokeDasharray="5 4" dot={false} strokeWidth={1.5} />
              <Line type="monotone" dataKey="closeBull" stroke={C.bull} dot={false} strokeWidth={2} connectNulls={true} isAnimationActive={false} />
              <Line type="monotone" dataKey="closeNeutral" stroke={C.neutral} dot={false} strokeWidth={2} connectNulls={true} isAnimationActive={false} />
              <Line type="monotone" dataKey="closeBear" stroke={C.bear} dot={false} strokeWidth={2} connectNulls={true} isAnimationActive={false} />
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
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: C.mutedText }} axisLine={{ stroke: C.border }} tickLine={false} minTickGap={30} />
              <YAxis yAxisId="left" domain={['auto', 'auto']} tick={{ fontSize: 10, fill: C.mutedText }} axisLine={{ stroke: C.border }} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: C.mutedText }} axisLine={{ stroke: C.border }} tickLine={false} tickFormatter={v => `${v}M`} />
              <Tooltip {...tooltipStyle} />
              <Bar yAxisId="right" dataKey="volume" fill={C.volumeBar} maxBarSize={5} />
              <Line yAxisId="left" dataKey="index_level" type="monotone" stroke={C.tasiLine} dot={false} strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>

          <div style={{ position: 'absolute', top: 10, right: 4, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ backgroundColor: C.badgeBg, color: '#fff', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 3, textAlign: 'center', lineHeight: 1.5 }}>
              Index Level<br />{current_index_level}
            </div>
            <div style={{ backgroundColor: C.badgeBg, color: '#fff', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 3, textAlign: 'center', lineHeight: 1.5 }}>
              Volume<br />{current_week_millions}M
            </div>
          </div>

          <div style={{
            position: 'absolute', bottom: 55, left: 60,
            backgroundColor: 'rgba(255,255,255,0.92)',
            border: `1px solid ${C.border}`,
            padding: '5px 10px', fontSize: 11, color: C.tableText, zIndex: 10,
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
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
        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' }}>
          <thead>
            <tr>
              <th rowSpan={2} style={{ ...TH, backgroundColor: '#fff', color: C.tableText, textAlign: 'left', textTransform: 'none', borderRight: `1px solid ${C.border}` }}>Sector Name</th>
              <th rowSpan={2} style={{ ...TH, backgroundColor: '#fff', color: C.tableText, textAlign: 'center', textTransform: 'none', borderRight: `1px solid ${C.border}` }}>Weekly<br/>% Return</th>
              <th colSpan={2} style={{ ...TH, backgroundColor: '#fff', color: C.tableText, textAlign: 'center', textTransform: 'none', borderRight: `1px solid ${C.border}`, borderBottom: 'none' }}>Trend Direction</th>
              <th rowSpan={2} style={{ ...TH, backgroundColor: '#fff', color: C.tableText, textAlign: 'center', textTransform: 'none', borderRight: `1px solid ${C.border}` }}>Trend<br/>Rank</th>
              <th rowSpan={2} style={{ ...TH, backgroundColor: '#fff', color: C.tableText, textAlign: 'center', textTransform: 'none', borderRight: `1px solid ${C.border}` }}>% Below<br/>250-Day High</th>
              <th rowSpan={2} style={{ ...TH, backgroundColor: '#fff', color: C.tableText, textAlign: 'center', textTransform: 'none' }}>Days Since Last<br/>250-Day High</th>
            </tr>
            <tr>
              <th style={{ ...TH, backgroundColor: '#fff', color: C.tableText, textAlign: 'center', textTransform: 'none', borderRight: `1px solid ${C.border}` }}>Weekly</th>
              <th style={{ ...TH, backgroundColor: '#fff', color: C.tableText, textAlign: 'center', textTransform: 'none', borderRight: `1px solid ${C.border}` }}>Monthly</th>
            </tr>
          </thead>
          <tbody>
            {report.sector_analytics.map((row: any, i: number) => {
              const getBg = (v: string) => v === 'Bull' ? C.bull : v === 'Bear' ? C.bear : C.neutral;
              return (
                <tr
                  key={row.sector}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ backgroundColor: hovered === i ? '#eff6ff' : i % 2 === 0 ? '#fff' : '#f8fafc' }}
                >
                  <td style={{ ...TD, fontWeight: 500, color: C.tableText, borderRight: `1px solid ${C.border}` }}>{row.sector}</td>
                  <td style={{ ...TD, textAlign: 'center', fontWeight: 700, color: row.weekly_return >= 0 ? C.bull : C.bear, borderRight: `1px solid ${C.border}` }}>
                    {row.weekly_return >= 0 ? '+' : ''}{Number(row.weekly_return).toFixed(1)}
                  </td>
                  <td style={{ ...TD, textAlign: 'center', backgroundColor: getBg(row.trend_weekly), color: '#fff', borderRight: '1px solid #fff' }}>{row.trend_weekly}</td>
                  <td style={{ ...TD, textAlign: 'center', backgroundColor: getBg(row.trend_monthly), color: '#fff', borderRight: `1px solid ${C.border}` }}>{row.trend_monthly}</td>
                  <td style={{ ...TD, textAlign: 'center', borderRight: `1px solid ${C.border}` }}>{row.trend_rank}</td>
                  <td style={{ ...TD, textAlign: 'center', borderRight: `1px solid ${C.border}` }}>{row.pct_below_250d_high.toFixed(1)}</td>
                  <td style={{ ...TD, textAlign: 'center' }}>{row.days_since_250d_high}</td>
                </tr>
              );
            })}
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
                ? <XAxis dataKey="date" tick={{ fontSize: 10, fill: C.mutedText }} axisLine={{ stroke: C.border }} tickLine={false} minTickGap={30} />
                : <XAxis dataKey="date" hide />
              }
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 9, fill: C.mutedText }} axisLine={{ stroke: C.border }} tickLine={false} width={40} />
              <Tooltip {...tooltipStyle} />
              <ReferenceLine y={0} stroke="rgba(0,0,0,0.15)" />
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
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: C.mutedText }} axisLine={{ stroke: C.border }} tickLine={false} width={40} />
                <Line type="monotone" dataKey="close" stroke={C.tasiLine} dot={false} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <BreadthPanel data={daily} stroke="#d97706" label="Daily" value={current.daily} />
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
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: C.mutedText }} axisLine={{ stroke: C.border }} tickLine={false} minTickGap={30} />
              <YAxis yAxisId="l" domain={[-100, 100]} tick={{ fontSize: 10, fill: C.mutedText }} axisLine={{ stroke: C.border }} tickLine={false} tickFormatter={v => `${Math.abs(v)}%`} />
              <YAxis yAxisId="r" orientation="right" domain={['auto', 'auto']} tick={{ fontSize: 10, fill: C.mutedText }} axisLine={{ stroke: C.border }} tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <ReferenceLine yAxisId="l" y={0} stroke="rgba(0,0,0,0.15)" />
              <ReferenceLine yAxisId="l" y={60} stroke="transparent"
                label={{ value: '% Stocks Making 250-Day Lows', position: 'insideLeft', fontSize: 10, fill: C.mutedText }} />
              <ReferenceLine yAxisId="l" y={-60} stroke="transparent"
                label={{ value: '% Stocks Making 250-Day Highs', position: 'insideLeft', fontSize: 10, fill: C.mutedText }} />
              <Area yAxisId="l" type="monotone" dataKey="pct_new_lows_inv" fill={C.negativeFill} stroke={C.bear} strokeWidth={1.5} fillOpacity={1} />
              <Area yAxisId="l" type="monotone" dataKey="pct_new_highs" fill={C.positiveFill} stroke={C.bull} strokeWidth={1.5} fillOpacity={1} />
              <Line yAxisId="r" type="monotone" dataKey="close" stroke={C.tasiLine} dot={false} strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>

          <div style={{ position: 'absolute', top: 10, right: 4, display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
            <div style={{ backgroundColor: C.bear, color: '#fff', fontSize: 10, fontWeight: 700, padding: '4px 8px', borderRadius: 3, textAlign: 'center', minWidth: 64 }}>
              New Lows<br />{Number(pct_new_lows).toFixed(1)}%
            </div>
            {report.trend_analysis?.current_close && (
              <div style={{ backgroundColor: '#2c5282', color: '#fff', fontSize: 10, fontWeight: 700, padding: '4px 8px', borderRadius: 3, textAlign: 'center', minWidth: 64, marginTop: 40, marginBottom: 40 }}>
                Index Level<br />{Math.round(report.trend_analysis.current_close)}
              </div>
            )}
            <div style={{ backgroundColor: C.bull, color: '#fff', fontSize: 10, fontWeight: 700, padding: '4px 8px', borderRadius: 3, textAlign: 'center', minWidth: 64 }}>
              New Highs<br />{Number(pct_new_highs).toFixed(1)}%
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

  const sortedData = [...returns]
    .map((r: any) => {
      const retVal = r.return_pct ?? r.return ?? 0;
      return { ...r, retVal };
    })
    .sort((a: any, b: any) => a.retVal - b.retVal);

  // Featured: top 5 largest by market cap (from top_market_cap), then 1 best return and 1 worst return
  const topByMcap = report.top_market_cap?.slice(0, 5).map((m: any) => {
    const match = sortedData.find((s: any) => s.symbol === m.symbol);
    return match || { ...m, retVal: m.weekly_return ?? 0 };
  }) || [];
  const remaining = [...sortedData].filter((s: any) => !topByMcap.some((t: any) => t.symbol === s.symbol));
  const extremes = [];
  if (remaining.length > 0) extremes.push(remaining[remaining.length - 1]); // Highest return
  if (remaining.length > 1) extremes.push(remaining[0]); // Lowest return
  const featured = [...topByMcap, ...extremes];

  const data = sortedData.map((r: any, i: number) => {
    const featureIdx = featured.findIndex(f => f.symbol === r.symbol);
    return { ...r, index: i, badgeNum: featureIdx >= 0 ? featureIdx + 1 : null };
  });

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
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          maxWidth: 290,
        }}>
          <div style={{ fontWeight: 700, marginBottom: 6, color: '#0f172a', fontSize: 12 }}>
            Positive Stocks: {positive_count} | Negative Stocks: {negative_count}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {featured.map((s, i) => (
              <div key={i} style={{ fontSize: 11, color: '#333' }}>
                {i + 1}. {s.stock_name}:{' '}
                <span style={{ color: '#333', fontWeight: 500 }}>
                  {s.retVal >= 0 ? '' : ''}{Number(s.retVal).toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={395}>
          <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
            <XAxis dataKey="index" hide axisLine={false} tickLine={false} />
            <YAxis tickFormatter={v => `${v}%`} tick={{ fontSize: 10, fill: C.mutedText }} axisLine={{ stroke: C.border }} tickLine={false} />
            <Tooltip
              {...tooltipStyle}
              formatter={(v: any, _: any, props: any) => [`${Number(v).toFixed(2)}%`, props.payload.stock_name]}
              labelFormatter={() => ''}
            />
            <ReferenceLine
              y={mean_return}
              stroke="#1e1b4b"
              strokeDasharray="5 5"
              strokeWidth={1.5}
              label={(props: any) => {
                const { viewBox } = props;
                return (
                  <g>
                    <rect x={viewBox.x + 4} y={viewBox.y - 12} width={76} height={24} rx={6} fill="#fff" stroke="#1e1b4b" strokeWidth={1} />
                    <text x={viewBox.x + 42} y={viewBox.y + 4} textAnchor="middle" fontSize={10} fill="#333" fontFamily="sans-serif">
                      Mean: {Number(mean_return).toFixed(2)}%
                    </text>
                  </g>
                );
              }}
            />
            <Bar
              dataKey="retVal"
              isAnimationActive={false}
              maxBarSize={6}
              label={(props: any) => {
                const { x, y, width, value, payload } = props;
                const badgeNum = payload?.badgeNum;
                if (!badgeNum) return null;
                const positive = value >= 0;
                return (
                  <g transform={`translate(${x + width / 2}, ${positive ? y - 10 : y + 10})`}>
                    <circle cx={0} cy={0} r={7} fill="#1e1b4b" />
                    <text x={0} y={3} textAnchor="middle" fill="#fff" fontSize={9} fontWeight={700}>
                      {badgeNum}
                    </text>
                  </g>
                );
              }}
            >
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
      <StockTable rows={report.top_market_cap} showExtra />
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

  const getBg = (v: string) => v === 'Bull' ? C.bull : v === 'Bear' ? C.bear : C.neutral;

  return (
    <div style={{ border: `1px solid ${C.border}`, overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' }}>
        <thead>
          <tr>
            <th rowSpan={2} style={{ ...TH, backgroundColor: '#fff', color: C.tableText, textAlign: 'left', textTransform: 'none', borderRight: `1px solid ${C.border}` }}>Stock Name</th>
            <th rowSpan={2} style={{ ...TH, backgroundColor: '#fff', color: C.tableText, textAlign: 'center', textTransform: 'none', borderRight: `1px solid ${C.border}` }}>Weekly<br/>% Return</th>
            <th colSpan={3} style={{ ...TH, backgroundColor: '#fff', color: C.tableText, textAlign: 'center', textTransform: 'none', borderRight: `1px solid ${C.border}`, borderBottom: 'none' }}>Trend Direction</th>
            <th rowSpan={2} style={{ ...TH, backgroundColor: '#fff', color: C.tableText, textAlign: 'center', textTransform: 'none', borderRight: showExtra ? `1px solid ${C.border}` : 'none' }}>Trend<br/>Rank</th>
            {showExtra && <th rowSpan={2} style={{ ...TH, backgroundColor: '#fff', color: C.tableText, textAlign: 'center', textTransform: 'none', borderRight: `1px solid ${C.border}` }}>% Below<br/>250-Day High</th>}
            {showExtra && <th rowSpan={2} style={{ ...TH, backgroundColor: '#fff', color: C.tableText, textAlign: 'center', textTransform: 'none' }}>Days Since Last<br/>250-Day High</th>}
          </tr>
          <tr>
            <th style={{ ...TH, backgroundColor: '#fff', color: C.tableText, textAlign: 'center', textTransform: 'none', borderRight: `1px solid ${C.border}` }}>Daily</th>
            <th style={{ ...TH, backgroundColor: '#fff', color: C.tableText, textAlign: 'center', textTransform: 'none', borderRight: `1px solid ${C.border}` }}>Weekly</th>
            <th style={{ ...TH, backgroundColor: '#fff', color: C.tableText, textAlign: 'center', textTransform: 'none', borderRight: `1px solid ${C.border}` }}>Monthly</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row: any, i: number) => (
            <tr
              key={row.symbol || i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ backgroundColor: hovered === i ? '#eff6ff' : i % 2 === 0 ? '#fff' : '#f8fafc' }}
            >
              <td style={{ ...TD, fontWeight: 500, color: C.tableText, borderRight: `1px solid ${C.border}` }}>{row.stock_name}</td>
              <td style={{ ...TD, textAlign: 'center', fontWeight: 700, color: (row.weekly_return ?? 0) >= 0 ? C.bull : C.bear, borderRight: `1px solid ${C.border}` }}>
                {row.weekly_return != null ? `${(row.weekly_return >= 0 ? '+' : '')}${Number(row.weekly_return).toFixed(1)}` : '—'}
              </td>
              <td style={{ ...TD, textAlign: 'center', backgroundColor: getBg(row.trend_daily), color: '#fff', borderRight: '1px solid #fff' }}>{row.trend_daily}</td>
              <td style={{ ...TD, textAlign: 'center', backgroundColor: getBg(row.trend_weekly), color: '#fff', borderRight: '1px solid #fff' }}>{row.trend_weekly}</td>
              <td style={{ ...TD, textAlign: 'center', backgroundColor: getBg(row.trend_monthly), color: '#fff', borderRight: `1px solid ${C.border}` }}>{row.trend_monthly}</td>
              <td style={{ ...TD, textAlign: 'center', borderRight: showExtra ? `1px solid ${C.border}` : 'none' }}>{row.trend_rank}</td>
              {showExtra && <td style={{ ...TD, textAlign: 'center', borderRight: `1px solid ${C.border}` }}>{row.pct_below_250d_high != null ? Number(row.pct_below_250d_high).toFixed(1) : '—'}</td>}
              {showExtra && <td style={{ ...TD, textAlign: 'center' }}>{row.days_since_250d_high}</td>}
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
    if (t.includes('all-time high') || t.includes('all time high')) return { bg: '#dcfce7', color: C.bull, icon: '▲ ' };
    if (t.includes('all-time low') || t.includes('all time low')) return { bg: '#fee2e2', color: C.bear, icon: '▼ ' };
    if (t.includes('high') || t.includes('positive')) return { bg: '#ecfdf5', color: C.bull, icon: '▲ ' };
    if (t.includes('low') || t.includes('negative')) return { bg: '#fef2f2', color: C.bear, icon: '▼ ' };
    return { bg: '#f1f5f9', color: C.tableText, icon: '' };
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
            <div style={{ fontSize: 10, color: C.mutedText, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
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

// ── 11. Breakout Stock Mini-Charts ─────────────────────────
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
    const points = isHigh
      ? `${cx},${cy - size} ${cx + size},${cy} ${cx},${cy + size} ${cx - size},${cy}`
      : `${cx - size},${cy - size} ${cx + size},${cy - size} ${cx},${cy + size}`;
    return (
      <polygon
        points={points}
        fill={color}
        stroke={color}
      />
    );
  };

  const BreakoutCard = ({ stock }: any) => {
    const isHigh = stock.breakout_type.toLowerCase().includes('high');
    const badgeBg = isHigh ? '#dcfce7' : '#fee2e2';
    const badgeText = isHigh ? C.bull : C.bear;
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
          <div style={{ fontSize: 11, fontWeight: 700, color: C.tableText, lineHeight: 1.4, maxWidth: '65%' }}>
            {stock.stock_name} ({stock.symbol})
          </div>
          <div style={{
            backgroundColor: badgeBg,
            color: badgeText,
            fontSize: 10,
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 3,
            whiteSpace: 'nowrap',
            border: `1px solid ${badgeText}33`,
          }}>
            {stock.breakout_type}
          </div>
        </div>

        {/* Chart */}
        <div style={{ position: 'relative', height: 140 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={markedData} margin={{ top: 8, right: 40, left: -10, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9, fill: C.mutedText }}
                axisLine={{ stroke: C.border }}
                tickLine={false}
                minTickGap={40}
              />
              <YAxis
                domain={[minP - padding, maxP + padding]}
                tick={{ fontSize: 9, fill: C.mutedText }}
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
            backgroundColor: isHigh ? '#dcfce7' : '#fee2e2',
            color: isHigh ? C.bull : C.bear,
            fontSize: 11,
            fontWeight: 700,
            padding: '2px 6px',
            borderRadius: 3,
            border: `1px solid ${isHigh ? '#16a34a33' : '#dc262633'}`,
          }}>
            {Number(stock.price).toFixed(1)}
          </div>
        </div>

        {/* Legend: markers */}
        <div style={{ display: 'flex', gap: 14, marginTop: 4, fontSize: 9, color: C.mutedText }}>
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

  // 2 columns × 3 rows = 6 cards
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
                  style={{ backgroundColor: hoveredRow === i ? '#eff6ff' : i % 2 === 0 ? C.cardBg : C.rowAlt }}
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
            const miniData = g.series?.length > 2 
              ? g.series 
              : [
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
                    <XAxis dataKey="x" tick={{ fontSize: 9, fill: C.mutedText }} axisLine={{ stroke: C.border }} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fontSize: 9, fill: C.mutedText }} axisLine={false} tickLine={false} tickFormatter={v => `${Number(v).toFixed(1)}`} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 9, fill: C.mutedText }} axisLine={false} tickLine={false} tickFormatter={v => `${Number(v).toFixed(1)}M`} />
                    <Tooltip {...tooltipStyle} />
                    <Bar yAxisId="right" dataKey="volume" fill={C.volumeBar} isAnimationActive={false} maxBarSize={18} />
                    <Line yAxisId="left" dataKey="price" stroke={C.tasiLine} dot={false} strokeWidth={1.5} isAnimationActive={false} />
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