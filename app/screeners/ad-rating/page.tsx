'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  Activity,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  Download,
  FileText,
  Image as ImgIcon,
  Table2,
  Calendar,
  Radio
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { useApi } from '@/hooks/useApi';

/* ─── Types ─────────────────────────────────────────────────────────────── */

interface ADRatingDataPoint {
  time: string;
  a_rating: number;
  d_rating: number;
  total_stocks: number;
  a_rating_pct: number;
  d_rating_pct: number;
}

/* ─── Config ─────────────────────────────────────────────────────────────── */

const CHART_CONFIGS = [
  {
    key: 'a_rating' as const,
    label: 'A Rating',
    lineColor: '#4CAF50', // Green
    desc: 'Number of stocks with an A/D Rating of A',
  },
  {
    key: 'd_rating' as const,
    label: 'D Rating',
    lineColor: '#F44336', // Red
    desc: 'Number of stocks with an A/D Rating of D',
  },
] as const;

/* ─── Period → days mapping ─────────────────────────────────────────────── */
const PERIOD_DAYS: Record<string, number | null> = {
  '5D': 5,
  '1M': 22,
  '6M': 130,
  '1Y': 260,
  '5Y': 1300,
  '10Y': 2600,
  'ALL': null,
};

/* ─── Custom Tooltip ─────────────────────────────────────────────────────── */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '14px 18px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: '180px' }}>
      <div style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.12em', marginBottom: '10px', borderBottom: '1px solid #F3F4F6', paddingBottom: '8px' }}>{label}</div>
      {payload.map((entry: any, i: number) => {
        const isPct = entry.name.includes('%');
        return (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', padding: '3px 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: entry.color }} />
              <span style={{ fontSize: '12px', color: '#4B5563', fontWeight: 500 }}>{entry.name}</span>
            </div>
            <span style={{ fontSize: '13px', fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: '#111827' }}>
              {isPct ? `${entry.value}%` : entry.value?.toLocaleString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Component ─────────────────────────────────────────────────────────── */

export default function ADRatingHistoryPage() {
  const [rawData, setRawData] = useState<ADRatingDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [period, setPeriod] = useState('ALL');
  const [seriesVisible, setSeriesVisible] = useState<Record<string, boolean>>({ a_rating: true, d_rating: true });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  const { apiCall } = useApi();

  const pageRef = useRef<HTMLDivElement>(null);
  const chartCardRef = useRef<HTMLDivElement>(null);

  /* ── tick for live dot ── */
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1400);
    return () => clearInterval(id);
  }, []);

  /* ── fetch ALL data once on mount ── */
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const response = await apiCall('/api/screeners/historical-ad-rating?limit=5000');
        if (response?.data?.series) {
          const mapped = response.data.series.map((item: any) => ({
            time: item.date || item.time,
            a_rating: item.a_rating ?? 0,
            d_rating: item.d_rating ?? 0,
            total_stocks: item.total_stocks ?? 1,
            a_rating_pct: item.a_rating_pct ?? 0,
            d_rating_pct: item.d_rating_pct ?? 0,
          }));
          setRawData(mapped);
        } else throw new Error('Invalid data format');
      } catch (err: any) {
        setError(err.message || 'Failed to load A/D Rating data');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── filter data client-side by selected period ── */
  const data = useMemo(() => {
    const maxDays = PERIOD_DAYS[period];
    if (!maxDays || rawData.length <= maxDays) return rawData;
    return rawData.slice(-maxDays);
  }, [rawData, period]);

  /* ── fullscreen ── */
  const handleFullscreen = () => {
    const el = chartCardRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => { });
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => { });
    }
  };

  useEffect(() => {
    const onChange = () => { if (!document.fullscreenElement) setIsFullscreen(false); };
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  /* ── Export ── */
  const today = () => new Date().toISOString().slice(0, 10);
  const notify = (msg: string) => {
    setExportStatus(msg);
    setTimeout(() => setExportStatus(null), 2500);
  };

  const exportPDF = async () => {
    setExportOpen(false);
    if (!pageRef.current) return;
    notify('Generating PDF…');
    try {
      const canvas = await html2canvas(pageRef.current, { scale: 2, useCORS: true, backgroundColor: '#F8FAFC' });
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width / 2, canvas.height / 2] });
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`AD-Rating-${today()}.pdf`);
      notify('PDF saved ✓');
    } catch { notify('PDF export failed'); }
  };

  const exportImage = async () => {
    setExportOpen(false);
    if (!pageRef.current) return;
    notify('Capturing screenshot…');
    try {
      const canvas = await html2canvas(pageRef.current, { scale: 2, useCORS: true, backgroundColor: '#F8FAFC' });
      const link = document.createElement('a');
      link.download = `AD-Rating-${today()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      notify('Image saved ✓');
    } catch { notify('Image export failed'); }
  };

  const exportExcel = () => {
    setExportOpen(false);
    if (!data.length) return;
    notify('Preparing Excel file…');
    const rows = data.map((d) => ({
      Date: d.time,
      'A Rating': d.a_rating,
      'D Rating': d.d_rating,
      'A Rating (%)': d.a_rating_pct,
      'D Rating (%)': d.d_rating_pct,
      'Total Stocks': d.total_stocks,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [{ wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'A-D Rating');
    XLSX.writeFile(wb, `AD-Rating-${today()}.xlsx`);
    notify('Excel downloaded ✓');
  };

  /* ── Loading / Error ── */
  if (loading && rawData.length === 0)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center"
        style={{ fontFamily: '"DM Sans", sans-serif' }}>
        <div className="flex flex-col items-center gap-5">
          <svg width="36" height="36" viewBox="0 0 36 36" className="animate-spin">
            <circle cx="18" cy="18" r="15" fill="none" stroke="#E2E8F0" strokeWidth="2" />
            <path d="M18 3 A15 15 0 0 1 33 18" fill="none" stroke="#4472C4" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <p className="text-xs text-slate-400 uppercase tracking-widest font-medium">Loading A/D Rating Data</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center"
        style={{ fontFamily: '"DM Sans", sans-serif' }}>
        <div className="bg-white border border-red-100 rounded-xl p-10 text-center max-w-sm">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <Activity size={18} color="#B02040" />
          </div>
          <p className="text-sm font-semibold text-red-700">Failed to Load</p>
          <p className="text-xs text-slate-400 mt-1">{error}</p>
        </div>
      </div>
    );

  const latest = data[data.length - 1];
  const dateRange = data.length > 0 ? `${data[0].time} — ${data[data.length - 1].time}` : '';

  const maxVal = Math.max(...data.map(d => Math.max(d.a_rating, d.d_rating)), 1);
  const minVal = Math.min(...data.map(d => Math.min(d.a_rating, d.d_rating)), 0);
  const formatY = (v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v.toString();
  const formatYPct = (v: number) => `${v}%`;
  const showDots = data.length < 80;

  /* ─── Render ──────────────────────────────────────────────────────────── */
  return (
    <div
      className="w-screen h-screen flex flex-col bg-slate-50 overflow-hidden"
      style={{ fontFamily: '"DM Sans", sans-serif' }}
    >
      {/* ── Header ── */}
      <header
        className="bg-white border-b border-slate-200 flex-shrink-0 z-50"
        style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}
      >
        <div className="w-full px-5 h-[60px] flex items-center justify-between gap-6">

          {/* left brand */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="w-[34px] h-[34px] bg-slate-50 border border-slate-200 rounded-[9px] flex items-center justify-center flex-shrink-0">
              <Activity size={16} stroke="#4472C4" strokeWidth={2} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[14px] font-bold text-slate-900 tracking-tight m-0">
                  A/D Rating History
                </h1>
                <span className="text-slate-300">/</span>
                <span className="text-[12px] text-slate-500">Market Breadth</span>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded ml-1">
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block"
                    style={{ opacity: tick % 2 === 0 ? 1 : 0.25, transition: 'opacity 0.5s ease' }}
                  />
                  Live
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-none">
                Historical counts of stocks with A vs D Accumulation/Distribution Ratings
              </p>
            </div>
          </div>

          {/* right controls */}
          <div className="flex items-center gap-2.5">

            {/* period selector */}
            <div className="flex bg-slate-50 border border-slate-200 p-0.5 rounded-[9px] gap-0.5">
              {['5D', '1M', '6M', '1Y', '5Y', '10Y', 'ALL'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  disabled={loading}
                  className={[
                    'px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all border-none cursor-pointer',
                    period === p ? 'bg-white text-slate-900 shadow-sm' : 'bg-transparent text-slate-500 hover:text-slate-700',
                    loading ? 'opacity-50' : '',
                  ].join(' ')}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* stat blocks */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-[9px] px-3.5 py-2 gap-4">
              {CHART_CONFIGS.map((cfg, i) => {
                const val = latest ? latest[cfg.key] : 0;
                return (
                  <div key={cfg.key} className={i > 0 ? 'pl-4 border-l border-slate-100' : ''}>
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="w-[6px] h-[6px] rounded-[2px] inline-block flex-shrink-0" style={{ background: cfg.lineColor }} />
                      <span className="text-[9px] text-slate-400 font-medium tracking-wide">{cfg.label}</span>
                    </div>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-[18px] font-bold text-slate-900 leading-none tracking-tight">{val}</span>
                      <span className="text-[10px] text-slate-400">stk</span>
                    </div>
                  </div>
                );
              })}

              {/* date range */}
              {dateRange && (
                <div className="pl-4 border-l border-slate-100 flex items-center gap-1.5">
                  <Calendar size={10} className="text-slate-400" />
                  <div>
                    <div className="text-[9px] text-slate-400 font-medium tracking-wide">RANGE</div>
                    <div className="text-[10px] font-semibold text-slate-600">{data[0].time} — {data[data.length - 1].time}</div>
                  </div>
                </div>
              )}
            </div>

            {/* export */}
            <div className="relative">
              <button
                onClick={() => setExportOpen((o) => !o)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[12px] font-medium text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Download size={13} />
                Export
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  style={{ transform: exportOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {exportOpen && (
                <div className="absolute top-[calc(100%+6px)] right-0 min-w-[210px] bg-white border border-slate-200 rounded-xl overflow-hidden z-[999]"
                  style={{ boxShadow: '0 8px 24px rgba(15,23,42,0.10)' }}>
                  <div className="px-3.5 py-2 text-[10px] text-slate-400 uppercase tracking-widest font-semibold border-b border-slate-100">Export as</div>
                  {[
                    { icon: <FileText size={13} color="#B02040" />, bg: '#FEF2F2', label: 'PDF Report', sub: 'Full page report', action: exportPDF },
                    { icon: <ImgIcon size={13} color="#4338CA" />, bg: '#EEF2FF', label: 'PNG Image', sub: 'Screenshot of the dashboard', action: exportImage },
                    null,
                    { icon: <Table2 size={13} color="#166534" />, bg: '#F0FFF4', label: 'Excel / CSV', sub: 'Raw trend data table', action: exportExcel },
                  ].map((item, idx) =>
                    item === null ? (
                      <div key={idx} className="h-px bg-slate-100 mx-3.5 my-1" />
                    ) : (
                      <button key={idx} onClick={item.action}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-slate-50 transition-colors text-left cursor-pointer border-none bg-transparent">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: item.bg }}>{item.icon}</div>
                        <div>
                          <div className="text-[13px] font-medium text-slate-800">{item.label}</div>
                          <div className="text-[11px] text-slate-400">{item.sub}</div>
                        </div>
                      </button>
                    )
                  )}
                </div>
              )}

              {exportStatus && (
                <div className="absolute top-[calc(100%+6px)] right-0 flex items-center gap-2 px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg z-[1000] text-xs text-slate-800 whitespace-nowrap"
                  style={{ boxShadow: '0 4px 12px rgba(15,23,42,0.08)' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0F7A5A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {exportStatus}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* green to red rule */}
        <div className="h-[2px]" style={{ background: 'linear-gradient(90deg, #4CAF50 0%, #F44336 100%)', opacity: 0.8 }} />
      </header>

      {/* ── Main content ── */}
      <main ref={pageRef} className="flex-1 min-h-0 flex flex-col w-full px-4 pt-4 pb-4 overflow-hidden">

        {/* CHART CONTAINER — dual charts wrapper */}
        <div
          ref={chartCardRef}
          className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col relative transition-all duration-200 flex-1 h-full"
          style={{ boxShadow: '0 4px 12px rgba(15,23,42,0.03)' }}
        >
          {/* button row */}
          <div className="px-4 py-2 flex items-center gap-3 border-b border-slate-100 flex-shrink-0 bg-white z-10">
            <span className="text-[13px] font-bold text-slate-800">A/D Rating Distribution</span>
            <div className="flex-1" />

            {/* Toggle series buttons */}
            <div className="flex items-center gap-2">
              {CHART_CONFIGS.map(cfg => {
                const isVisible = seriesVisible[cfg.key];
                return (
                  <button
                    key={cfg.key}
                    onClick={() => setSeriesVisible((prev) => ({ ...prev, [cfg.key]: !prev[cfg.key] }))}
                    className="px-2 py-1 rounded text-[10px] font-semibold tracking-wide transition-all cursor-pointer border flex items-center gap-1.5"
                    style={{
                      borderColor: !isVisible ? cfg.lineColor : '#E2E8F0',
                      background: !isVisible ? cfg.lineColor : 'transparent',
                      color: !isVisible ? '#FFFFFF' : '#64748B',
                    }}
                  >
                    {isVisible ? <Eye size={10} /> : <EyeOff size={10} />}
                    <span className="w-2 h-2 rounded-full inline-block" style={{ background: isVisible ? cfg.lineColor : '#FFF' }} />
                    {cfg.label}
                  </button>
                )
              })}
            </div>

            <div className="w-px h-4 bg-slate-200" />

            <button
              onClick={handleFullscreen}
              className="w-[26px] h-[26px] flex items-center justify-center rounded border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer bg-transparent"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
            </button>
          </div>

          {/* scrollable charts container */}
          <div className="flex-1 overflow-y-auto flex flex-col bg-slate-50">

            {/* ── Absolute Count Chart ── */}
            <div className="flex-shrink-0 h-[400px] sm:h-[450px] relative p-4 border-b border-slate-100 bg-white">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 20, right: 20, left: 20, bottom: 65 }}>
                  <CartesianGrid stroke="#E5E7EB" strokeWidth={1} vertical={true} horizontal={true} />

                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 13, fill: '#6B7280', fontWeight: 500 }}
                    tickLine={{ stroke: '#E5E7EB' }}
                    axisLine={{ stroke: '#E5E7EB', strokeWidth: 2 }}
                    angle={-90}
                    textAnchor="end"
                    interval={Math.max(0, Math.floor(data.length / 45))}
                    height={100}
                    dx={-5}
                    dy={45}
                  />

                  <YAxis
                    tickFormatter={formatY}
                    tick={{ fontSize: 13, fill: '#6B7280', fontWeight: 500 }}
                    tickLine={false}
                    axisLine={{ stroke: '#E5E7EB', strokeWidth: 2 }}
                    width={60}
                    domain={['auto', 'auto']}
                    dx={-5}
                  />
                  <Tooltip content={<CustomTooltip />} />

                  {seriesVisible.a_rating && (
                    <Line
                      type="linear"
                      dataKey="a_rating"
                      name="A Rating"
                      stroke="#4CAF50"
                      strokeWidth={showDots ? 4 : 2}
                      dot={showDots ? { r: 4.5, fill: '#4CAF50', strokeWidth: 0 } : false}
                      activeDot={{ r: 7, fill: '#4CAF50', stroke: '#fff', strokeWidth: 2 }}
                      animationDuration={1200}
                      isAnimationActive={false}
                    />
                  )}

                  {seriesVisible.d_rating && (
                    <Line
                      type="linear"
                      dataKey="d_rating"
                      name="D Rating"
                      stroke="#F44336"
                      strokeWidth={showDots ? 4 : 2}
                      dot={showDots ? { r: 4.5, fill: '#F44336', strokeWidth: 0 } : false}
                      activeDot={{ r: 7, fill: '#F44336', stroke: '#fff', strokeWidth: 2 }}
                      animationDuration={1200}
                      isAnimationActive={false}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* ── Percentage Chart ── */}
            <div className="flex-shrink-0 h-[400px] sm:h-[450px] relative p-4 bg-white">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 20, right: 20, left: 20, bottom: 65 }}>
                  <CartesianGrid stroke="#E5E7EB" strokeWidth={1} vertical={true} horizontal={true} />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 13, fill: '#6B7280', fontWeight: 500 }}
                    tickLine={{ stroke: '#E5E7EB' }}
                    axisLine={{ stroke: '#E5E7EB', strokeWidth: 2 }}
                    angle={-90}
                    textAnchor="end"
                    interval={Math.max(0, Math.floor(data.length / 45))}
                    height={100}
                    dx={-5}
                    dy={45}
                  />
                  <YAxis
                    tickFormatter={formatYPct}
                    tick={{ fontSize: 13, fill: '#6B7280', fontWeight: 500 }}
                    tickLine={false}
                    axisLine={{ stroke: '#E5E7EB', strokeWidth: 2 }}
                    width={60}
                    domain={['auto', 'auto']}
                    dx={-5}
                  />
                  <Tooltip content={<CustomTooltip />} />

                  {seriesVisible.a_rating && (
                    <Line
                      type="linear"
                      dataKey="a_rating_pct"
                      name="A Rating (%)"
                      stroke="#4CAF50"
                      strokeWidth={showDots ? 4 : 2}
                      dot={showDots ? { r: 4.5, fill: '#4CAF50', strokeWidth: 0 } : false}
                      activeDot={{ r: 7, fill: '#4CAF50', stroke: '#fff', strokeWidth: 2 }}
                      animationDuration={1200}
                      isAnimationActive={false}
                    />
                  )}

                  {seriesVisible.d_rating && (
                    <Line
                      type="linear"
                      dataKey="d_rating_pct"
                      name="D Rating (%)"
                      stroke="#F44336"
                      strokeWidth={showDots ? 4 : 2}
                      dot={showDots ? { r: 4.5, fill: '#F44336', strokeWidth: 0 } : false}
                      activeDot={{ r: 7, fill: '#F44336', stroke: '#fff', strokeWidth: 2 }}
                      animationDuration={1200}
                      isAnimationActive={false}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>

          </div>

          {/* card footer */}
          <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex justify-between items-center flex-shrink-0 z-10">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                <span className="w-2 h-2 rounded-full" style={{ background: '#4CAF50' }} />
                <span>Green line tracks A Rating</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                <span className="w-2 h-2 rounded-full" style={{ background: '#F44336' }} />
                <span>Red line tracks D Rating</span>
              </div>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">{data.length.toLocaleString()} observations</span>
          </div>
        </div>

      </main>
    </div>
  );
}