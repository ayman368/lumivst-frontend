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
  TrendingUp,
  Activity,
  BarChart2,
  Radio,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  Download,
  FileText,
  Image as ImgIcon,
  Table2,
  Calendar,
  Target,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { authFetch } from '@/lib/api/authFetch';

/* ─── Types ─────────────────────────────────────────────────────────────── */

interface TrendDataPoint {
  time: string;
  trend_1m: number;
  trend_4m: number;
  trend_5m_wide: number;
  alrayan: number;
}

/* ─── Config ─────────────────────────────────────────────────────────────── */

const CHART_CONFIGS = [
  {
    key: 'trend_1m' as const,
    label: '1 Month',
    sublabel: 'Short-Term Momentum',
    badge: '1M',
    lineColor: '#4472C4',
    accentLight: '#EEF2FB',
    icon: Activity,
    desc: 'Number of stocks passing the Minervini 1-Month trend template screener',
  },
  {
    key: 'trend_4m' as const,
    label: '4 Months',
    sublabel: 'Intermediate Trend',
    badge: '4M',
    lineColor: '#ED7D31',
    accentLight: '#FEF3EB',
    icon: TrendingUp,
    desc: 'Number of stocks passing the Minervini 4-Month trend template screener',
  },
  {
    key: 'trend_5m_wide' as const,
    label: '5 Months Wide',
    sublabel: 'Broad Long-Term Trend',
    badge: '5MW',
    lineColor: '#70AD47',
    accentLight: '#EDF5E7',
    icon: BarChart2,
    desc: 'Number of stocks passing the Minervini 5-Month Wide trend template screener',
  },
  {
    key: 'alrayan' as const,
    label: 'Alrayan Screener',
    sublabel: 'Technical Alignment',
    badge: 'ALR',
    lineColor: '#8B5CF6',
    accentLight: '#F5F3FF',
    icon: Target,
    desc: 'Number of stocks passing the Alrayan technical screener',
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

/** Browser cache — instant paint on revisit while API revalidates */
const SESSION_CACHE_KEY = 'lumivst:minervini-trend:v1';
const SESSION_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const API_FULL_LIMIT = 2600;

function mapSeries(items: { date?: string; time?: string; trend_1m?: number; trend_4m?: number; trend_5m_wide?: number; alrayan?: number }[]): TrendDataPoint[] {
  return items.map((item) => ({
    time: item.date || item.time || '',
    trend_1m: item.trend_1m ?? 0,
    trend_4m: item.trend_4m ?? 0,
    trend_5m_wide: item.trend_5m_wide ?? 0,
    alrayan: item.alrayan ?? 0,
  }));
}

function readSessionCache(): TrendDataPoint[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SESSION_CACHE_KEY);
    if (!raw) return null;
    const { ts, series } = JSON.parse(raw) as { ts: number; series: TrendDataPoint[] };
    if (Date.now() - ts > SESSION_CACHE_TTL_MS) return null;
    return series?.length ? series : null;
  } catch {
    return null;
  }
}

function writeSessionCache(series: TrendDataPoint[]) {
  if (typeof window === 'undefined' || !series.length) return;
  try {
    sessionStorage.setItem(
      SESSION_CACHE_KEY,
      JSON.stringify({ ts: Date.now(), series })
    );
  } catch {
    // quota exceeded — ignore
  }
}

/* ─── Custom Tooltip ─────────────────────────────────────────────────────── */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '14px 18px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: '180px' }}>
      <div style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.12em', marginBottom: '10px', borderBottom: '1px solid #F3F4F6', paddingBottom: '8px' }}>{label}</div>
      {payload.map((entry: any, i: number) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', padding: '3px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: entry.color }} />
            <span style={{ fontSize: '12px', color: '#4B5563', fontWeight: 500 }}>{entry.name}</span>
          </div>
          <span style={{ fontSize: '13px', fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: '#111827' }}>{entry.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Component ─────────────────────────────────────────────────────────── */

export default function MinerviniTrendPage() {
  const [rawData, setRawData] = useState<TrendDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [period, setPeriod] = useState('ALL');
  const [seriesVisible, setSeriesVisible] = useState<Record<number, boolean>>({ 0: true, 1: true, 2: true, 3: true });
  const [fullscreenIdx, setFullscreenIdx] = useState<number | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  const pageRef = useRef<HTMLDivElement>(null);
  const fetchStarted = useRef(false);
  const cardRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];

  /* ── tick for live dot ── */
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1400);
    return () => clearInterval(id);
  }, []);

  /* ── fetch once: session cache first, then API (Redis-backed) ── */
  useEffect(() => {
    if (fetchStarted.current) return;
    fetchStarted.current = true;

    const cached = readSessionCache();
    if (cached) {
      setRawData(cached);
      setLoading(false);
    }

    (async () => {
      if (!cached) setLoading(true);
      setError(null);
      try {
        const res = await authFetch(
          `/api/screeners/historical-trend?limit=${API_FULL_LIMIT}`,
          { credentials: 'include' }
        );
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }
        const body = await res.json();
        if (!body?.series?.length) {
          throw new Error('Invalid data format');
        }
        const mapped = mapSeries(body.series);
        setRawData(mapped);
        writeSessionCache(mapped);
      } catch (err: unknown) {
        if (!cached) {
          const message = err instanceof Error ? err.message : 'Failed to load trend data';
          setError(message);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ── filter data client-side by selected period ── */
  const data = useMemo(() => {
    const maxDays = PERIOD_DAYS[period];
    if (!maxDays || rawData.length <= maxDays) return rawData;
    return rawData.slice(-maxDays);
  }, [rawData, period]);

  /* ── fullscreen ── */
  const handleFullscreen = (i: number) => {
    const el = cardRefs[i].current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().then(() => setFullscreenIdx(i)).catch(() => { });
    } else {
      document.exitFullscreen?.().then(() => setFullscreenIdx(null)).catch(() => { });
    }
  };

  useEffect(() => {
    const onChange = () => { if (!document.fullscreenElement) setFullscreenIdx(null); };
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
      pdf.save(`Minervini-Trend-${today()}.pdf`);
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
      link.download = `Minervini-Trend-${today()}.png`;
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
      'Trend 1 Month': d.trend_1m,
      'Trend 4 Months': d.trend_4m,
      'Trend 5 Months Wide': d.trend_5m_wide,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [{ wch: 12 }, { wch: 15 }, { wch: 16 }, { wch: 20 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Minervini Trend');
    XLSX.writeFile(wb, `Minervini-Trend-${today()}.xlsx`);
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
          <p className="text-xs text-slate-400 uppercase tracking-widest font-medium">Loading Minervini Trend Data</p>
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

  /* ─── Render ──────────────────────────────────────────────────────────── */
  return (
    <div
      className="w-full h-screen flex flex-col bg-slate-50 overflow-hidden mb-12"
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
              <svg width="16" height="16" viewBox="0 0 20 18" fill="none">
                <polyline points="1,14 6,8 10,11 14,4 19,7" fill="none" stroke="#4472C4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="1,14 6,8 10,11 14,4 19,7" fill="none" stroke="#4472C4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.3" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[14px] font-bold text-slate-900 tracking-tight m-0">
                  Minervini Trend
                </h1>
                <span className="text-slate-300">/</span>
                <span className="text-[12px] text-slate-500">Screener Analysis</span>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded ml-1">
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block"
                    style={{ opacity: tick % 2 === 0 ? 1 : 0.25, transition: 'opacity 0.5s ease' }}
                  />
                  Live
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-none">
                Historical stock count per Minervini screener over time
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
                      <span className="text-[9px] text-slate-400 font-medium tracking-wide">{cfg.badge}</span>
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
                    { icon: <FileText size={13} color="#B02040" />, bg: '#FEF2F2', label: 'PDF Report', sub: 'Full page with all charts', action: exportPDF },
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
                  <div className="px-3.5 pb-3">
                    <div className="text-[10px] text-slate-400 bg-slate-50 rounded-md px-2.5 py-1.5 leading-relaxed">Exports all 3 Minervini trend charts</div>
                  </div>
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

        {/* rainbow rule */}
        <div className="h-[2px]" style={{ background: 'linear-gradient(90deg, #4472C4 0%, #ED7D31 50%, #70AD47 100%)', opacity: 0.4 }} />
      </header>

      {/* ── Main content ── */}
      <main ref={pageRef} className="flex-1 min-h-0 flex flex-col w-full px-4 pt-2 pb-2 overflow-y-auto">

        {/* summary bar */}
        <div
          className="bg-white border border-slate-200 rounded-[9px] px-4 py-2 flex justify-between items-center mb-2 flex-shrink-0"
          style={{ boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }}
        >
          <div className="flex items-center gap-4 flex-wrap">
            {CHART_CONFIGS.map((cfg, i) => {
              const val = latest ? latest[cfg.key] : 0;
              const prev = data.length > 1 ? data[data.length - 2][cfg.key] : val;
              const isUp = val >= prev;
              const delta = Math.abs(val - prev);
              return (
                <div key={cfg.key} className={`flex items-center gap-2 ${i > 0 ? 'pl-4 border-l border-slate-200' : ''}`}>
                  <span className="text-[11px] font-semibold text-slate-500">{cfg.label}</span>
                  <span className="text-[11px] font-bold" style={{ color: cfg.lineColor }}>{val}</span>
                  <span title="Change vs previous trading day" className={`flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded ${isUp ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'}`}>
                    <span className="w-1 h-1 rounded-full inline-block" style={{ background: isUp ? '#059669' : '#B02040' }} />
                    {isUp ? '▲' : '▼'} {delta}
                  </span>
                </div>
              );
            })}
          </div>
          <span className="text-[10px] text-slate-300 flex-shrink-0">{latest?.time || '—'}</span>
        </div>

        {/* CHART GRID */}
        <div className={`flex-1 min-h-0 ${fullscreenIdx === null ? 'grid grid-cols-2 grid-rows-2 gap-2' : 'flex flex-col'}`}>
          {CHART_CONFIGS.map((cfg, i) => {
            if (fullscreenIdx !== null && fullscreenIdx !== i) return null;
            const Icon = cfg.icon;
            const isVisible = seriesVisible[i] !== false;
            const isFS = fullscreenIdx === i;

            const numVal = latest ? latest[cfg.key] : 0;
            const displayVal = !isVisible ? '—' : numVal.toLocaleString();

            const prev = data.length > 1 ? data[data.length - 2][cfg.key] : numVal;
            const delta = Math.abs(numVal - prev).toFixed(0);
            const isUp = numVal >= prev;

            const maxVal = Math.max(...data.map((d) => d[cfg.key]), 1);
            const minVal = Math.min(...data.map((d) => d[cfg.key]), 0);
            const range = maxVal - minVal;
            const padding = Math.max(range * 0.15, 2);
            const yMin = Math.max(0, Math.floor(minVal - padding));
            const yMax = Math.ceil(maxVal + padding);
            const yMid = Math.round((yMin + yMax) / 2);
            const formatY = (v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v.toString();
            const showDots = data.length < 80;
            const pct = Math.round((numVal / Math.max(maxVal, 1)) * 100);

            return (
              <div
                key={cfg.key}
                ref={cardRefs[i]}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col relative min-h-0 transition-all duration-200"
                style={{ borderLeft: `3px solid ${cfg.lineColor}`, boxShadow: '0 1px 3px rgba(15,23,42,0.05)' }}
              >
                {/* card header */}
                <div className="px-4 pt-2.5 pb-1.5 flex justify-between items-start flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center flex-shrink-0" style={{ background: cfg.accentLight }}>
                      <Icon size={14} color={cfg.lineColor} strokeWidth={2} />
                    </div>
                    <div>
                      <div className="text-[12px] font-semibold text-slate-900 tracking-tight leading-none">
                        {cfg.label} Trend
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 tracking-wide leading-none">{cfg.sublabel}</div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-0.5">
                    <div className="flex items-baseline gap-0.5">
                      {isVisible && (
                        <>
                          <span className="text-[22px] font-bold text-slate-900 leading-none tracking-tight">{displayVal}</span>
                          <span className="text-[11px] text-slate-400 font-medium ml-0.5">stocks</span>
                        </>
                      )}
                    </div>
                    {isVisible && (
                      <span title="Change vs previous trading day" className={`text-[10px] font-semibold px-1.5 py-0.5 rounded tracking-wide ${isUp ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'}`}>
                        {isUp ? '▲' : '▼'} {delta}
                      </span>
                    )}
                  </div>
                </div>

                {/* progress bar */}
                <div className="px-4 pb-1.5 flex-shrink-0">
                  <div className="flex justify-between mb-0.5">
                    <span className="text-[9px] text-slate-300 uppercase tracking-widest font-medium">0</span>
                    <span className="text-[9px] text-slate-300 uppercase tracking-widest font-medium">MAX · {maxVal}</span>
                  </div>
                  <div className="h-[4px] bg-slate-100 rounded-full relative overflow-hidden">
                    <div
                      className="absolute left-0 top-0 bottom-0 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${cfg.lineColor}44, ${cfg.lineColor})` }}
                    />
                    {[25, 50, 75].map((t) => (
                      <div key={t} className="absolute top-0 bottom-0 w-px bg-white/70 z-10" style={{ left: `${t}%` }} />
                    ))}
                  </div>
                </div>

                {/* button row */}
                <div className="px-3 py-1 flex items-center gap-1 border-y border-slate-100 flex-shrink-0">
                  <div className="flex-1" />

                  <button
                    onClick={() => setSeriesVisible((prev) => ({ ...prev, [i]: !prev[i] }))}
                    title={isVisible ? 'Hide series' : 'Show series'}
                    className="px-2 py-0.5 rounded text-[9px] font-semibold tracking-wide transition-all cursor-pointer border flex items-center gap-1"
                    style={{
                      borderColor: !isVisible ? cfg.lineColor : '#E2E8F0',
                      background: !isVisible ? cfg.lineColor : 'transparent',
                      color: !isVisible ? '#FFFFFF' : '#64748B',
                    }}
                  >
                    {isVisible ? <Eye size={9} /> : <EyeOff size={9} />}
                    <span>Data</span>
                  </button>

                  <button
                    onClick={() => handleFullscreen(i)}
                    className="w-[24px] h-[24px] flex items-center justify-center rounded border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer bg-transparent"
                  >
                    {isFS ? <Minimize2 size={10} /> : <Maximize2 size={10} />}
                  </button>
                </div>

                {/* recharts */}
                <div className="flex-1 min-h-[250px] relative">
                  {/* Y-axis label */}
                  <div style={{
                    position: 'absolute', left: 0, top: '50%',
                    transform: 'translateY(-50%) rotate(-90deg)',
                    transformOrigin: 'center',
                    fontSize: '11px', fontWeight: 700, color: '#9CA3AF',
                    letterSpacing: '0.05em', whiteSpace: 'nowrap', zIndex: 10,
                    pointerEvents: 'none',
                  }}>
                    {cfg.label}
                  </div>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 8, right: 20, left: 65, bottom: 55 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                      <XAxis
                        dataKey="time"
                        tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 600 }}
                        tickLine={false}
                        axisLine={{ stroke: '#E5E7EB' }}
                        angle={-45}
                        textAnchor="end"
                        interval={Math.max(0, Math.floor(data.length / 15))}
                        height={60}
                      />
                      <YAxis
                        tickFormatter={formatY}
                        tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 600 }}
                        tickLine={false}
                        axisLine={false}
                        width={50}
                        domain={[yMin, yMax]}
                        ticks={[yMin, yMid, yMax]}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      {isVisible && (
                        <Line
                          type="monotone"
                          dataKey={cfg.key}
                          name={cfg.label}
                          stroke={cfg.lineColor}
                          strokeWidth={2.5}
                          dot={showDots ? { r: 2.5, fill: cfg.lineColor, strokeWidth: 0 } : false}
                          activeDot={{ r: 5, fill: cfg.lineColor, stroke: '#fff', strokeWidth: 2 }}
                          isAnimationActive={false}
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* card footer */}
                <div className="px-4 py-1 border-t border-slate-50 flex justify-between items-center flex-shrink-0">
                  <span className="text-[9px] text-slate-300 leading-relaxed line-clamp-1">{cfg.desc}</span>
                  <span className="text-[9px] text-slate-300 ml-3 flex-shrink-0 font-medium">{data.length.toLocaleString()} obs</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* footer strip */}
        <div className="mt-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg flex justify-between items-center text-[9px] text-slate-300 tracking-wide flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <Radio size={9} color="#CBD5E1" />
            <span>Minervini Trend Screener · Historical stock count analysis · 1M · 4M · 5MW · Alrayan templates</span>
          </div>
          <span>{dateRange}</span>
        </div>
      </main>
    </div>
  );
}