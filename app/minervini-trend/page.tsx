'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import BreadthTabs from '../stocks/market-breadth/_components/BreadthTabs';
import TasiIndexChart from '../stocks/market-breadth/_components/TasiIndexChart';
import {
  createChart,
  ColorType,
  AreaSeries,
  IChartApi,
  ISeriesApi,
  CrosshairMode,
} from 'lightweight-charts';
import {
  TrendingUp,
  Activity,
  BarChart2,
  Radio,
  Maximize2,
  Minimize2,
  Eye,
  EyeOff,
  FileText,
  Image as ImgIcon,
  Table2,
  Calendar,
  Scan,
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import MinerviniExportButton from './_components/Minerviniexportbutton'
import * as XLSX from 'xlsx';
import { authFetch } from '@/lib/api/authFetch';

interface TrendDataPoint {
  time: string;
  trend_1m: number;
  trend_4m: number;
  trend_5m_wide: number;
  avg50_trend_1m?: number | null;
  avg200_trend_1m?: number | null;
  avg50_trend_4m?: number | null;
  avg200_trend_4m?: number | null;
  avg50_trend_5m_wide?: number | null;
  avg200_trend_5m_wide?: number | null;
}

type HoverEntry = {
  value: number | null;
  time: string | null;
};

const CHART_CONFIGS = [
  {
    key: 'trend_1m' as const,
    label: '1 Month',
    sublabel: 'Short-Term Momentum',
    badge: '1M',
    lineColor: '#4472C4',
    topColor: 'rgba(68,114,196,0.10)',
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
    topColor: 'rgba(237,125,49,0.10)',
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
    topColor: 'rgba(112,173,71,0.10)',
    accentLight: '#EDF5E7',
    icon: BarChart2,
    desc: 'Number of stocks passing the Minervini 5-Month Wide trend template screener',
  },
];

// تغيير عدد المخططات إلى 4 (TASI + 3 Minervini = 4)
const CHART_COUNT = CHART_CONFIGS.length;

/* ─── تغيير توزيع الشبكة: 2 في الأعلى و 2 في الأسفل ─── */
// أول مخططين (تاسي و 1M) يأخذون عرض 3 أعمدة من أصل 6
// آخر مخططين (4M و 5MW) يأخذون عرض 3 أعمدة من أصل 6
const GRID_COL_HALF = 'col-span-3'; // نصف العرض
const HALF_CHART_COUNT = 2; // أول مخططين في الصف الأول

function chartGridColClass(gridIdx: number): string {
  // جميع المخططات الأربعة تأخذ نفس العرض (نصف الشبكة)
  return GRID_COL_HALF;
}

// +1 لأننا نضيف تاسي = 4 مخططات إجمالاً
const GRID_ITEM_COUNT = CHART_COUNT + 1;

const PERIOD_DAYS: Record<string, number | null> = {
  '5D': 5,
  '1M': 22,
  '6M': 130,
  '1Y': 260,
  '5Y': 1300,
  '10Y': 2600,
  ALL: null,
};

const MAX_CHART_POINTS = 900;
const API_FULL_LIMIT = 6000;
const SESSION_CACHE_KEY = 'lumivst:minervini-trend:v3';
const SESSION_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const AVG50_COLOR = '#38BDF8';
const AVG200_COLOR = '#F59E0B';

function downsample(data: TrendDataPoint[], max: number): TrendDataPoint[] {
  if (data.length <= max) return data;
  const step = Math.ceil(data.length / max);
  const out: TrendDataPoint[] = [];
  for (let i = 0; i < data.length; i += step) out.push(data[i]);
  const last = data[data.length - 1];
  if (out[out.length - 1]?.time !== last.time) out.push(last);
  return out;
}

function mapSeries(items: any[]): TrendDataPoint[] {
  return items.map((item) => ({
    time: item.date || item.time || '',
    trend_1m: item.trend_1m ?? 0,
    trend_4m: item.trend_4m ?? 0,
    trend_5m_wide: item.trend_5m_wide ?? 0,
  }));
}

function buildSma(values: number[], window: number): Array<number | null> {
  const out: Array<number | null> = [];
  for (let i = 0; i < values.length; i += 1) {
    const start = Math.max(0, i - window + 1);
    const slice = values.slice(start, i + 1);
    out.push(slice.length === window ? slice.reduce((sum, value) => sum + value, 0) / window : null);
  }
  return out;
}

function enrichWithMovingAverages(items: TrendDataPoint[]): TrendDataPoint[] {
  const enriched = items.map((item) => ({ ...item }));
  CHART_CONFIGS.forEach((cfg) => {
    const values = enriched.map((item) => Number((item[cfg.key] as number | undefined) ?? 0));
    const avg50Values = buildSma(values, 50);
    const avg200Values = buildSma(values, 200);
    enriched.forEach((item, index) => {
      const avg50Key = `avg50_${cfg.key}` as keyof TrendDataPoint;
      const avg200Key = `avg200_${cfg.key}` as keyof TrendDataPoint;
      (item as any)[avg50Key] = avg50Values[index];
      (item as any)[avg200Key] = avg200Values[index];
    });
  });
  return enriched;
}

function readCache(): TrendDataPoint[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SESSION_CACHE_KEY);
    if (!raw) return null;
    const { ts, series } = JSON.parse(raw);
    if (Date.now() - ts > SESSION_CACHE_TTL_MS) return null;
    return series?.length ? series : null;
  } catch { return null; }
}

function writeCache(series: TrendDataPoint[]) {
  if (typeof window === 'undefined' || !series.length) return;
  try { sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify({ ts: Date.now(), series })); } catch { }
}

export default function MinerviniTrendPage() {
  const [rawData, setRawData] = useState<TrendDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [period, setPeriod] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [seriesVisible, setSeriesVisible] = useState<Record<number, boolean>>({ 0: true, 1: true, 2: true });
  const [selectedAverages, setSelectedAverages] = useState<Record<number, Set<string>>>({});
  const [fullscreenIdx, setFullscreenIdx] = useState<number | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [hoverValues, setHoverValues] = useState<Record<number, HoverEntry>>({});

  const pageRef = useRef<HTMLDivElement>(null);
  const exportDropRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>(Array(CHART_COUNT).fill(null));
  const canvasRefs = useRef<(HTMLDivElement | null)[]>(Array(CHART_COUNT).fill(null));
  const chartsRef = useRef<IChartApi[]>([]);
  const mainSeriesRef = useRef<(ISeriesApi<'Area'> | null)[]>(Array(CHART_COUNT).fill(null));
  const avg50SeriesRef = useRef<(ISeriesApi<'Area'> | null)[]>(Array(CHART_COUNT).fill(null));
  const avg200SeriesRef = useRef<(ISeriesApi<'Area'> | null)[]>(Array(CHART_COUNT).fill(null));
  const isSyncing = useRef(false);
  const isSyncingCrosshair = useRef(false);
  const isRestoringRef = useRef(false);
  const savedRangeRef = useRef<any>(null);
  const fetchStarted = useRef(false);
  const hoverRafRef = useRef<number | null>(null);
  const pendingHoverRef = useRef<Record<number, HoverEntry>>({});

  const tasiChartRef = useRef<IChartApi | null>(null);

  const handleTasiReady = useCallback((chart: IChartApi, _series: ISeriesApi<"Area">) => {
    tasiChartRef.current = chart;

    chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
      if (!range || isSyncing.current || isRestoringRef.current) return;
      isSyncing.current = true;
      chartsRef.current.forEach((c) => {
        if (c) try { c.timeScale().setVisibleLogicalRange(range); } catch { }
      });
      setTimeout(() => { isSyncing.current = false; }, 0);
    });
  }, []);

  const seriesVisibleRef = useRef(seriesVisible);
  seriesVisibleRef.current = seriesVisible;

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1400);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (fetchStarted.current) return;
    fetchStarted.current = true;
    const cached = readCache();
    if (cached) { setRawData(cached); setLoading(false); }
    (async () => {
      if (!cached) setLoading(true);
      setError(null);
      try {
        const res = await authFetch(`/api/screeners/historical-trend?limit=${API_FULL_LIMIT}`, { credentials: 'include' });
        const body = await res.json().catch(() => ({}));
        if (res.status === 503 || body?.status === 'not_ready') throw new Error(body?.message || 'Chart history not loaded on server.');
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        if (!body?.series?.length) throw new Error('Invalid data format');
        const mapped = mapSeries(body.series);
        setRawData(mapped);
        writeCache(mapped);
      } catch (err: unknown) {
        if (!cached) setError(err instanceof Error ? err.message : 'Failed to load trend data');
      } finally { setLoading(false); }
    })();
  }, []);

  const data = useMemo(() => {
    let filtered = rawData;
    if (startDate) {
      filtered = filtered.filter(d => d.time >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(d => d.time <= endDate);
    }

    const maxDays = PERIOD_DAYS[period];
    if (!maxDays || filtered.length <= maxDays) return filtered;
    return filtered.slice(-maxDays);
  }, [rawData, period, startDate, endDate]);

  const chartData = useMemo(() => enrichWithMovingAverages(downsample(data, MAX_CHART_POINTS)), [data]);

  const toggleAvgKey = (index: number, key: string) => {
    setSelectedAverages((prev) => {
      const next = { ...prev };
      const current = new Set(prev[index] ?? []);
      if (current.has(key)) current.delete(key);
      else current.add(key);
      next[index] = current;
      return next;
    });
  };

  useEffect(() => {
    if (!exportOpen) return;
    const handler = (e: MouseEvent) => {
      if (exportDropRef.current && !exportDropRef.current.contains(e.target as Node)) setExportOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [exportOpen]);

  useEffect(() => {
    if (chartData.length === 0) return;

    if (chartsRef.current.length > 0 && !isRestoringRef.current) {
      try {
        const range = chartsRef.current[0].timeScale().getVisibleLogicalRange();
        if (range) savedRangeRef.current = range;
      } catch { }
    }

    chartsRef.current.forEach((c) => c.remove());
    chartsRef.current = [];
    mainSeriesRef.current = Array(CHART_COUNT).fill(null);
    avg50SeriesRef.current = Array(CHART_COUNT).fill(null);
    avg200SeriesRef.current = Array(CHART_COUNT).fill(null);

    const baseOptions = {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#94A3B8',
        fontFamily: '"DM Sans", "Geist", sans-serif',
        fontSize: 10,
      },
      grid: {
        vertLines: { color: '#F1F4F8' },
        horzLines: { color: '#F1F4F8' },
      },
      rightPriceScale: {
        borderColor: '#E8ECF2',
        autoScale: true,
        scaleMargins: { top: 0.08, bottom: 0.08 },
      },
      timeScale: {
        borderColor: '#E8ECF2',
        timeVisible: true,
        fixLeftEdge: true,
        fixRightEdge: true,
      },
      crosshair: {
        mode: CrosshairMode.Magnet,
        vertLine: {
          width: 1 as any,
          color: '#CBD5E1',
          style: 0 as any,
          labelBackgroundColor: '#1E293B',
        },
        horzLine: {
          width: 1 as any,
          color: '#CBD5E1',
          style: 0 as any,
          labelBackgroundColor: '#1E293B',
        },
      },
    };

    CHART_CONFIGS.forEach((cfg, i) => {
      const container = canvasRefs.current[i];
      if (!container) return;
      container.innerHTML = '';

      const chart = createChart(container, {
        ...baseOptions,
        width: container.clientWidth,
        height: container.clientHeight || container.offsetHeight || 180,
      });
      chartsRef.current.push(chart);

      const series = chart.addSeries(AreaSeries, {
        lineColor: cfg.lineColor,
        topColor: cfg.topColor,
        bottomColor: 'rgba(0,0,0,0)',
        lineWidth: 1.5 as any,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
        crosshairMarkerBorderColor: cfg.lineColor,
        crosshairMarkerBackgroundColor: '#FFFFFF',
        lastValueVisible: true,
        priceLineVisible: false,
        visible: seriesVisibleRef.current[i] !== false,
      });

      series.setData(
        chartData.map((d) => ({ time: d.time, value: d[cfg.key] })) as any
      );
      mainSeriesRef.current[i] = series;

      const selectedSet = selectedAverages[i] || new Set<string>();
      const avg50Key = `avg50_${cfg.key}` as keyof TrendDataPoint;
      if (selectedSet.has('avg50') && avg50Key in chartData[0]) {
        const avg50Series = chart.addSeries(AreaSeries, {
          lineColor: AVG50_COLOR,
          topColor: 'rgba(0,0,0,0)',
          bottomColor: 'rgba(0,0,0,0)',
          lineWidth: 1.5 as any,
          lineStyle: 1,
          crosshairMarkerVisible: true,
          crosshairMarkerRadius: 3,
          crosshairMarkerBorderColor: AVG50_COLOR,
          crosshairMarkerBackgroundColor: '#FFFFFF',
          lastValueVisible: true,
          priceLineVisible: false,
        });
        avg50Series.setData(
          chartData.map((d) => {
            const v = d[avg50Key] as number | null;
            return v != null ? { time: d.time, value: v } : { time: d.time };
          }) as any
        );
        avg50SeriesRef.current[i] = avg50Series;
      }

      const avg200Key = `avg200_${cfg.key}` as keyof TrendDataPoint;
      if (selectedSet.has('avg200') && avg200Key in chartData[0]) {
        const avg200Series = chart.addSeries(AreaSeries, {
          lineColor: AVG200_COLOR,
          topColor: 'rgba(0,0,0,0)',
          bottomColor: 'rgba(0,0,0,0)',
          lineWidth: 1.5 as any,
          lineStyle: 1,
          crosshairMarkerVisible: true,
          crosshairMarkerRadius: 3,
          crosshairMarkerBorderColor: AVG200_COLOR,
          crosshairMarkerBackgroundColor: '#FFFFFF',
          lastValueVisible: true,
          priceLineVisible: false,
        });
        avg200Series.setData(
          chartData.map((d) => {
            const v = d[avg200Key] as number | null;
            return v != null ? { time: d.time, value: v } : { time: d.time };
          }) as any
        );
        avg200SeriesRef.current[i] = avg200Series;
      }
    });

    chartsRef.current.forEach((chart, i) => {
      chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
        if (!range || isSyncing.current || isRestoringRef.current) return;
        isSyncing.current = true;
        chartsRef.current.forEach((c, j) => {
          if (j !== i) c.timeScale().setVisibleLogicalRange(range);
        });
        // Also sync to TASI chart
        if (tasiChartRef.current) {
          try { tasiChartRef.current.timeScale().setVisibleLogicalRange(range); } catch { }
        }
        setTimeout(() => { isSyncing.current = false; }, 0);
        try {
          const newRange = chartsRef.current[0].timeScale().getVisibleLogicalRange();
          if (newRange) savedRangeRef.current = newRange;
        } catch { }
      });
    });

    chartsRef.current.forEach((chart, i) => {
      chart.subscribeCrosshairMove((param) => {
        const mainS = mainSeriesRef.current[i];

        if (!param.point || !param.time || !mainS) {
          if (isSyncingCrosshair.current) return;
          isSyncingCrosshair.current = true;
          const emptyEntry: HoverEntry = { value: null, time: null };
          const cleared: Record<number, HoverEntry> = {};
          chartsRef.current.forEach((c, j) => {
            cleared[j] = emptyEntry;
            if (c && c !== chart) { try { c.clearCrosshairPosition(); } catch { } }
          });
          pendingHoverRef.current = cleared;
          if (hoverRafRef.current === null) {
            hoverRafRef.current = requestAnimationFrame(() => {
              setHoverValues({ ...pendingHoverRef.current });
              hoverRafRef.current = null;
            });
          }
          isSyncingCrosshair.current = false;
          return;
        }

        const raw = param.seriesData.get(mainS);
        const timeStr =
          typeof param.time === 'string'
            ? param.time
            : typeof param.time === 'number'
              ? new Date((param.time as number) * 1000).toISOString().slice(0, 10)
              : `${(param.time as any).year}-${String((param.time as any).month).padStart(2, '0')}-${String((param.time as any).day).padStart(2, '0')}`;

        const entry: HoverEntry = {
          value: raw && 'value' in raw ? (raw as any).value : null,
          time: timeStr,
        };

        pendingHoverRef.current = { ...pendingHoverRef.current, [i]: entry };

        if (!isSyncingCrosshair.current) {
          isSyncingCrosshair.current = true;

          const dataItem = chartData.find(d => d.time === timeStr);

          chartsRef.current.forEach((targetChart, j) => {
            if (j === i) return;
            const targetSeries = mainSeriesRef.current[j];
            if (!targetSeries) return;
            try {
              if (dataItem) {
                const price = dataItem[CHART_CONFIGS[j].key] as number;
                targetChart.setCrosshairPosition(price, param.time!, targetSeries);

                // Manually update hover state for the synced chart
                pendingHoverRef.current[j] = {
                  value: price,
                  time: timeStr,
                };
              }
            } catch { }
          });

          isSyncingCrosshair.current = false;
        }

        if (hoverRafRef.current === null) {
          hoverRafRef.current = requestAnimationFrame(() => {
            setHoverValues({ ...pendingHoverRef.current });
            hoverRafRef.current = null;
          });
        }
      });
    });

    const ro = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const el = entry.target as HTMLDivElement;
        const idx = canvasRefs.current.indexOf(el);
        if (idx === -1) return;
        const chart = chartsRef.current[idx];
        if (!chart) return;
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w > 0 && h > 0) {
          chart.applyOptions({ width: w, height: h });
        }
      });
    });
    canvasRefs.current.forEach((el) => { if (el) ro.observe(el); });

    requestAnimationFrame(() => {
      chartsRef.current.forEach((chart, i) => {
        const el = canvasRefs.current[i];
        if (!el) return;
        const w = el.clientWidth || el.offsetWidth;
        const h = el.clientHeight || el.offsetHeight;
        if (w > 0 && h > 0) chart.applyOptions({ width: w, height: h });
      });
    });

    const rangeToRestore = savedRangeRef.current;
    if (rangeToRestore) {
      isRestoringRef.current = true;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          chartsRef.current.forEach((chart) => {
            try { chart.timeScale().setVisibleLogicalRange(rangeToRestore); }
            catch { chart.timeScale().fitContent(); }
          });
          setTimeout(() => { isRestoringRef.current = false; }, 100);
        });
      });
    } else {
      requestAnimationFrame(() => {
        chartsRef.current.forEach((c) => c.timeScale().fitContent());
      });
    }

    return () => {
      if (hoverRafRef.current !== null) { cancelAnimationFrame(hoverRafRef.current); hoverRafRef.current = null; }
      ro.disconnect();
      chartsRef.current.forEach((c) => {
        if (c) {
          try { c.remove(); } catch { }
        }
      });
      chartsRef.current = [];
    };
  }, [chartData, selectedAverages]);

  useEffect(() => { savedRangeRef.current = null; }, [period]);

  useEffect(() => {
    Object.entries(seriesVisible).forEach(([idx, vis]) => {
      const s = mainSeriesRef.current[Number(idx)];
      if (s) s.applyOptions({ visible: vis });
    });
  }, [seriesVisible]);

  const handleFullscreen = (i: number) => {
    setFullscreenIdx((prev) => (prev === i ? null : i));
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setFullscreenIdx(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const fitAll = () => {
    savedRangeRef.current = null;
    chartsRef.current.forEach((c) => c.timeScale().fitContent());
  };

  const today = () => new Date().toISOString().slice(0, 10);
  const notify = (msg: string) => { setExportStatus(msg); setTimeout(() => setExportStatus(null), 2500); };

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

  if (loading && rawData.length === 0)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center" style={{ fontFamily: '"DM Sans", sans-serif' }}>
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center" style={{ fontFamily: '"DM Sans", sans-serif' }}>
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

  return (
    <div className="w-full h-screen flex flex-col bg-slate-50 overflow-hidden mb-12" style={{ fontFamily: '"DM Sans", sans-serif' }}>
      <BreadthTabs>
        <div className="flex items-center gap-2.5 flex-shrink-0 mr-2">

          <div className="flex bg-slate-50 border border-slate-200 p-0.5 rounded-[9px] gap-0.5">
            {['5D', '1M', '6M', '1Y', '5Y', '10Y', 'ALL'].map((p) => (
              <button key={p} onClick={() => setPeriod(p)} disabled={loading}
                className={['px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-all border-none cursor-pointer',
                  period === p ? 'bg-white text-slate-900 shadow-sm' : 'bg-transparent text-slate-500 hover:text-slate-700',
                  loading ? 'opacity-50' : ''].join(' ')}>
                {p}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-[9px] px-2.5 py-1.5 text-[11px] text-slate-600">
            <span className="text-slate-400">From</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent border-none outline-none text-[11px] text-slate-700"
            />
          </label>

          <label className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-[9px] px-2.5 py-1.5 text-[11px] text-slate-600">
            <span className="text-slate-400">To</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent border-none outline-none text-[11px] text-slate-700"
            />
          </label>

          <button
            onClick={() => {
              setStartDate('');
              setEndDate('');
            }}
            className="px-2.5 py-1.5 rounded-[9px] border border-slate-200 bg-white text-[11px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Clear
          </button>

          <button onClick={fitAll} title="Fit all charts"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer">
            <Scan size={13} />
            Fit All
          </button>

          <MinerviniExportButton
            data={data}
            period={period}
            captureRef={pageRef}
          />

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
      </BreadthTabs>

      <main ref={pageRef} className="flex-1 min-h-0 flex flex-col w-full px-2 pt-1 pb-1 overflow-auto" style={{ flex: '1 1 0' }}>

        <div className="bg-white border border-slate-200 rounded-[9px] px-4 py-2 flex justify-between items-center mb-2 flex-shrink-0 flex-wrap gap-2"
          style={{ boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }}>
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
                  <span className={`flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded ${isUp ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'}`}>
                    <span className="w-1 h-1 rounded-full inline-block" style={{ background: isUp ? '#059669' : '#B02040' }} />
                    {isUp ? '▲' : '▼'} {delta}
                  </span>
                </div>
              );
            })}
          </div>
          <span className="text-[10px] text-slate-300 flex-shrink-0">{latest?.time || '—'}</span>
        </div>

        {/* ─── تغيير توزيع الشبكة: 2 في الأعلى و 2 في الأسفل ─── */}
        <div
          className="flex-1 min-h-0 grid grid-cols-6 gap-2"
          style={{ gridTemplateRows: 'repeat(2, minmax(0, 1fr))' }}
        >
          {Array.from({ length: GRID_ITEM_COUNT }, (_, gridIdx) => {
            /* ── cell 0: TASI Index ── */
            if (gridIdx === 0) {
              const gridCol = chartGridColClass(gridIdx);
              return (
                <div
                  key="tasi-chart"
                  className={`${gridCol} bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col relative min-h-0 h-full`}
                  style={{ boxShadow: '0 1px 3px rgba(15,23,42,0.05)' }}
                >
                  <TasiIndexChart
                    period={period}
                    startDate={startDate}
                    endDate={endDate}
                    onChartReady={handleTasiReady}
                  />
                </div>
              );
            }

            /* ── cells 1..3: المخططات الثلاثة Minervini ── */
            const i = gridIdx - 1;
            const cfg = CHART_CONFIGS[i];
            const gridCol = chartGridColClass(gridIdx);
            const Icon = cfg.icon;
            const isVisible = seriesVisible[i] !== false;
            const isFS = fullscreenIdx === i;
            const hover = hoverValues[i];

            const displayVal = hover?.value != null
              ? hover.value.toLocaleString()
              : latest ? latest[cfg.key].toLocaleString() : '—';

            const numVal = latest ? latest[cfg.key] : 0;
            const prev = data.length > 1 ? data[data.length - 2][cfg.key] : numVal;
            const delta = Math.abs(numVal - prev);
            const isUp = numVal >= prev;
            const maxVal = Math.max(...data.map((d) => d[cfg.key]), 1);
            const pct = Math.round((numVal / maxVal) * 100);

            return (
              <div key={gridIdx}
                ref={(el) => { cardRefs.current[i] = el; }}
                className={[
                  gridCol,
                  "bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col transition-all duration-200 h-full",
                  isFS
                    ? "fixed inset-0 z-[200] rounded-none"
                    : "relative min-h-0",
                ].join(" ")}
                style={{ borderLeft: `3px solid ${cfg.lineColor}`, boxShadow: isFS ? '0 0 0 4px rgba(0,0,0,0.15)' : '0 1px 3px rgba(15,23,42,0.05)' }}
              >
                <div className="px-4 pt-2.5 pb-1.5 flex justify-between items-start flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center flex-shrink-0" style={{ background: cfg.accentLight }}>
                      <Icon size={14} color={cfg.lineColor} strokeWidth={2} />
                    </div>
                    <div>
                      <div className="text-[12px] font-semibold text-slate-900 tracking-tight leading-none">{cfg.label} Trend</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 tracking-wide leading-none">{cfg.sublabel}</div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-0.5">
                    {isVisible && (
                      <>
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-[22px] font-bold leading-none tracking-tight"
                            style={{ color: hover?.value != null ? cfg.lineColor : '#0F172A' }}>
                            {displayVal}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium ml-0.5">stocks</span>
                        </div>
                        {hover?.time ? (
                          <span className="text-[10px] text-slate-400 font-medium">{hover.time}</span>
                        ) : (
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded tracking-wide ${isUp ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'}`}>
                            {isUp ? '▲' : '▼'} {delta}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="px-4 pb-1.5 flex-shrink-0">
                  <div className="flex justify-between mb-0.5">
                    <span className="text-[9px] text-slate-300 uppercase tracking-widest font-medium">0</span>
                    <span className="text-[9px] text-slate-300 uppercase tracking-widest font-medium">MAX · {maxVal}</span>
                  </div>
                  <div className="h-[4px] bg-slate-100 rounded-full relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${cfg.lineColor}44, ${cfg.lineColor})` }} />
                    {[25, 50, 75].map((t) => (
                      <div key={t} className="absolute top-0 bottom-0 w-px bg-white/70 z-10" style={{ left: `${t}%` }} />
                    ))}
                  </div>
                </div>

                <div className="px-3 py-1 flex items-center gap-1 border-y border-slate-100 flex-shrink-0">
                  <div className="flex-1" />

                  {(() => {
                    const selectedSet = selectedAverages[i] || new Set<string>();
                    const isAvg50 = selectedSet.has('avg50');
                    const isAvg200 = selectedSet.has('avg200');
                    return (
                      <>
                        <button onClick={() => toggleAvgKey(i, 'avg50')}
                          className="px-2 py-0.5 rounded text-[9px] font-semibold tracking-wide transition-all cursor-pointer border whitespace-nowrap"
                          style={{ borderColor: isAvg50 ? AVG50_COLOR : '#E2E8F0', background: isAvg50 ? AVG50_COLOR : 'transparent', color: isAvg50 ? '#FFFFFF' : '#64748B' }}>
                          AVG 50
                        </button>

                        <button onClick={() => toggleAvgKey(i, 'avg200')}
                          className="px-2 py-0.5 rounded text-[9px] font-semibold tracking-wide transition-all cursor-pointer border whitespace-nowrap"
                          style={{ borderColor: isAvg200 ? AVG200_COLOR : '#E2E8F0', background: isAvg200 ? AVG200_COLOR : 'transparent', color: isAvg200 ? '#FFFFFF' : '#64748B' }}>
                          AVG 200
                        </button>
                      </>
                    );
                  })()}

                  <button onClick={() => setSeriesVisible((prev) => ({ ...prev, [i]: !prev[i] }))}
                    title={isVisible ? 'Hide series' : 'Show series'}
                    className="px-2 py-0.5 rounded text-[9px] font-semibold tracking-wide transition-all cursor-pointer border flex items-center gap-1"
                    style={{
                      borderColor: !isVisible ? cfg.lineColor : '#E2E8F0',
                      background: !isVisible ? cfg.lineColor : 'transparent',
                      color: !isVisible ? '#FFFFFF' : '#64748B',
                    }}>
                    {isVisible ? <Eye size={9} /> : <EyeOff size={9} />}
                    <span>Data</span>
                  </button>

                  <button onClick={() => chartsRef.current[i]?.timeScale().fitContent()}
                    title="Fit to data"
                    className="w-[24px] h-[24px] flex items-center justify-center rounded border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer bg-transparent">
                    <Scan size={10} />
                  </button>

                  <button onClick={() => handleFullscreen(i)}
                    className="w-[24px] h-[24px] flex items-center justify-center rounded border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer bg-transparent">
                    {isFS ? <Minimize2 size={10} /> : <Maximize2 size={10} />}
                  </button>
                </div>

                <div className="flex-1 min-h-0 relative" style={{ minHeight: 0 }}>
                  <div ref={(el) => { canvasRefs.current[i] = el; }} style={{ position: 'absolute', inset: 0 }} />
                </div>

                <div className="px-4 py-1 border-t border-slate-50 flex justify-between items-center flex-shrink-0">
                  <span className="text-[9px] text-slate-300 leading-relaxed line-clamp-1">{cfg.desc}</span>
                  <span className="text-[9px] text-slate-300 ml-3 flex-shrink-0 font-medium">
                    {data.length.toLocaleString()} obs
                    {chartData.length < data.length ? ` · chart ${chartData.length}` : ''}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg flex justify-between items-center text-[9px] text-slate-300 tracking-wide flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <Radio size={9} color="#CBD5E1" />
            <span>Minervini Trend Screener · Historical stock count analysis · 1M · 4M · 5MW</span>
          </div>
          <span>{dateRange}</span>
        </div>
      </main>
    </div>
  );
}