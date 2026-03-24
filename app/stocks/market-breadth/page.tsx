'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, AreaSeries, IChartApi, CrosshairMode } from 'lightweight-charts';
import { TrendingUp, Activity, BarChart2, Layers } from 'lucide-react';

interface BreadthItem {
  time: string;
  total: number;
  pct_above_20: number;
  pct_above_50: number;
  pct_above_150: number;
  pct_above_200: number;
}

export default function MarketBreadthPage() {
  const [data, setData] = useState<BreadthItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refs for chart containers
  const chart20Ref = useRef<HTMLDivElement>(null);
  const chart50Ref = useRef<HTMLDivElement>(null);
  const chart150Ref = useRef<HTMLDivElement>(null);
  const chart200Ref = useRef<HTMLDivElement>(null);

  // Refs for chart instances
  const chartsRef = useRef<IChartApi[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${API_URL}/api/market-breadth/percent-above-ma?limit=5000`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const json = await res.json();
        
        if (json.data && Array.isArray(json.data)) {
            setData(json.data);
        } else {
            throw new Error('Invalid data format received from API');
        }
      } catch (e: any) {
        console.error("Failed to fetch market breadth data:", e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (loading || data.length === 0) return;

    const chartOptions = {
        layout: {
            background: { type: ColorType.Solid, color: 'transparent' },
            textColor: '#9ca3af', // Gray-400
            fontFamily: "'Inter', sans-serif",
            fontSize: 12,
        },
        grid: {
            vertLines: { color: 'rgba(55, 65, 81, 0.4)' }, // Subtle gray-700
            horzLines: { color: 'rgba(55, 65, 81, 0.4)' },
        },
        rightPriceScale: {
            borderColor: 'rgba(75, 85, 99, 0.5)', // Gray-600
            autoScale: true,
            scaleMargins: { top: 0.1, bottom: 0.1 },
        },
        timeScale: {
            borderColor: 'rgba(75, 85, 99, 0.5)',
            timeVisible: true,
            fixLeftEdge: true,
            fixRightEdge: true,
        },
        crosshair: {
            mode: CrosshairMode.Normal,
            vertLine: {
                width: 1 as any,
                color: '#6b7280',
                style: 3 as any,
                labelBackgroundColor: '#374151',
            },
            horzLine: {
                width: 1 as any,
                color: '#6b7280',
                style: 3 as any,
                labelBackgroundColor: '#374151',
            },
        },
        height: 240,
    };

    // Clean up old charts
    chartsRef.current.forEach(chart => chart.remove());
    chartsRef.current = [];

    const syncCrosshair = (sourceChart: IChartApi, targetCharts: IChartApi[]) => {
        sourceChart.subscribeCrosshairMove((param) => {
            if (!param.point) {
                targetCharts.forEach((c) => c.clearCrosshairPosition());
                return;
            }
            // timeScale sync handles logical zoom sync below
        });
        
        sourceChart.timeScale().subscribeVisibleLogicalRangeChange(range => {
            if (range) {
                targetCharts.forEach(c => {
                    c.timeScale().setVisibleLogicalRange(range);
                });
            }
        });
    };

    const createBreadthChart = (
        container: HTMLDivElement | null, 
        dataKey: keyof BreadthItem, 
        lineColor: string, 
        topColor: string,
        bottomColor: string,
        title: string
    ) => {
        if (!container) return null;
        
        container.innerHTML = ''; // Clear container

        const chart = createChart(container, chartOptions);
        chartsRef.current.push(chart);

        const series = chart.addSeries(AreaSeries, {
            lineColor: lineColor,
            topColor: topColor,
            bottomColor: bottomColor,
            lineWidth: 2 as any,
            title: title,
            crosshairMarkerVisible: true,
            lastValueVisible: true,
            priceLineVisible: false,
            autoscaleInfoProvider: () => ({
                priceRange: {
                    minValue: 0,
                    maxValue: 100,
                },
            }),
        });

        const formattedData = data.map(item => ({
            time: item.time,
            value: item[dataKey] as number
        }));

        series.setData(formattedData as any);
        
        // Oversold / Overbought Zones with visible labels
        [20, 50, 80].forEach(level => {
            series.createPriceLine({
                price: level,
                color: 'rgba(107, 114, 128, 0.4)', // Gray-500
                lineWidth: 1,
                lineStyle: 2,
                axisLabelVisible: true,
            });
        });

        chart.timeScale().fitContent();
        return chart;
    };

    const c1 = createBreadthChart(chart20Ref.current, 'pct_above_20', '#3b82f6', 'rgba(59, 130, 246, 0.4)', 'rgba(59, 130, 246, 0.0)', 'TASI % Above 20 MA');
    const c2 = createBreadthChart(chart50Ref.current, 'pct_above_50', '#ef4444', 'rgba(239, 68, 68, 0.4)', 'rgba(239, 68, 68, 0.0)', 'TASI % Above 50 MA');
    const c3 = createBreadthChart(chart150Ref.current, 'pct_above_150', '#f59e0b', 'rgba(245, 158, 11, 0.4)', 'rgba(245, 158, 11, 0.0)', 'TASI % Above 150 MA');
    const c4 = createBreadthChart(chart200Ref.current, 'pct_above_200', '#10b981', 'rgba(16, 185, 129, 0.4)', 'rgba(16, 185, 129, 0.0)', 'TASI % Above 200 MA');

    const allCharts = [c1, c2, c3, c4].filter(Boolean) as IChartApi[];

    // Sync charts (Logical Zoom)
    allCharts.forEach(chart => {
        syncCrosshair(chart, allCharts.filter(c => c !== chart));
    });

    const handleResize = () => {
        if (chart20Ref.current && c1) c1.applyOptions({ width: chart20Ref.current.clientWidth });
        if (chart50Ref.current && c2) c2.applyOptions({ width: chart50Ref.current.clientWidth });
        if (chart150Ref.current && c3) c3.applyOptions({ width: chart150Ref.current.clientWidth });
        if (chart200Ref.current && c4) c4.applyOptions({ width: chart200Ref.current.clientWidth });
    };

    window.addEventListener('resize', handleResize);

    return () => {
        window.removeEventListener('resize', handleResize);
        chartsRef.current.forEach(chart => chart.remove());
        chartsRef.current = [];
    };

  }, [data, loading]);

  if (loading) {
      return (
          <div className="flex h-screen items-center justify-center bg-[#070B14]">
              <div className="flex flex-col items-center gap-4">
                  <div className="relative w-12 h-12">
                      <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"></div>
                      <div className="absolute inset-2 rounded-full border-r-2 border-indigo-400 animate-ping"></div>
                  </div>
                  <p className="text-gray-400 font-medium tracking-widest uppercase text-xs">Loading Breadth Index</p>
              </div>
          </div>
      );
  }

  if (error) {
      return (
          <div className="flex h-screen items-center justify-center bg-[#070B14]">
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-8 rounded-2xl max-w-md text-center backdrop-blur-md">
                  <Activity className="w-10 h-10 mx-auto mb-4 text-red-400/80" />
                  <h3 className="text-xl font-bold mb-2">Signal Error</h3>
                  <p className="text-sm text-red-300 opacity-80">{error}</p>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#070B14] text-white selection:bg-blue-500/30">
      
      {/* Header Profile */}
      <div className="relative border-b border-gray-800/80 bg-[#0B1120]/80 backdrop-blur-xl sticky top-0 z-20 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-indigo-500/5 to-purple-600/5 pointer-events-none"></div>
        <div className="max-w-[1600px] mx-auto px-6 py-6 sm:px-8">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                    <Layers className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                        Market Breadth <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/20">LIVE METRICS</span>
                    </h1>
                    <p className="text-sm text-gray-400 mt-1 max-w-2xl leading-relaxed">
                        Percentage of constituents currently trading above their respective moving averages. A critical indicator for identifying overbought/oversold extremes and confirming the underlying strength of market trends.
                    </p>
                </div>
            </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 py-8 sm:px-8 space-y-8 pb-16">
        
        {/* Short Term */}
        <div className="group relative bg-[#0f172a] border border-gray-800 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:shadow-[0_8px_30px_rgba(59,130,246,0.1)] hover:border-blue-500/30 transition-all duration-500">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500/40 to-transparent"></div>
            <div className="px-6 py-4 bg-[#0B1120]/40 border-b border-gray-800/80 flex items-center justify-between backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-blue-500/10 rounded-lg">
                        <Activity className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="font-semibold text-gray-200 tracking-wide">20-Day Moving Average</span>
                </div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest bg-gray-900/80 px-4 py-1.5 rounded-full border border-gray-800 shadow-inner">Short-Term Momentum</div>
            </div>
            <div className="p-4 bg-gradient-to-b from-[#0f172a]/50 to-[#0B1120]/50">
                <div ref={chart20Ref} className="w-full rounded-xl overflow-hidden [&_.tv-lightweight-charts]:rounded-xl" />
            </div>
        </div>

        {/* Medium Term */}
        <div className="group relative bg-[#0f172a] border border-gray-800 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:shadow-[0_8px_30px_rgba(239,68,68,0.1)] hover:border-red-500/30 transition-all duration-500">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500/40 to-transparent"></div>
            <div className="px-6 py-4 bg-[#0B1120]/40 border-b border-gray-800/80 flex items-center justify-between backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-red-500/10 rounded-lg">
                        <TrendingUp className="w-4 h-4 text-red-400" />
                    </div>
                    <span className="font-semibold text-gray-200 tracking-wide">50-Day Moving Average</span>
                </div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest bg-gray-900/80 px-4 py-1.5 rounded-full border border-gray-800 shadow-inner">Intermediate Trend</div>
            </div>
            <div className="p-4 bg-gradient-to-b from-[#0f172a]/50 to-[#0B1120]/50">
                <div ref={chart50Ref} className="w-full rounded-xl overflow-hidden [&_.tv-lightweight-charts]:rounded-xl" />
            </div>
        </div>

        {/* Long Term 150 */}
        <div className="group relative bg-[#0f172a] border border-gray-800 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:shadow-[0_8px_30px_rgba(245,158,11,0.1)] hover:border-amber-500/30 transition-all duration-500">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500/40 to-transparent"></div>
            <div className="px-6 py-4 bg-[#0B1120]/40 border-b border-gray-800/80 flex items-center justify-between backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-amber-500/10 rounded-lg">
                        <BarChart2 className="w-4 h-4 text-amber-500" />
                    </div>
                    <span className="font-semibold text-gray-200 tracking-wide">150-Day Moving Average</span>
                </div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest bg-gray-900/80 px-4 py-1.5 rounded-full border border-gray-800 shadow-inner">Long-Term Foundation</div>
            </div>
            <div className="p-4 bg-gradient-to-b from-[#0f172a]/50 to-[#0B1120]/50">
                <div ref={chart150Ref} className="w-full rounded-xl overflow-hidden [&_.tv-lightweight-charts]:rounded-xl" />
            </div>
        </div>

        {/* Long Term 200 */}
        <div className="group relative bg-[#0f172a] border border-gray-800 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.1)] hover:border-emerald-500/30 transition-all duration-500">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/40 to-transparent"></div>
            <div className="px-6 py-4 bg-[#0B1120]/40 border-b border-gray-800/80 flex items-center justify-between backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                        <BarChart2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="font-semibold text-gray-200 tracking-wide">200-Day Moving Average</span>
                </div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest bg-gray-900/80 px-4 py-1.5 rounded-full border border-gray-800 shadow-inner">Primary Trend Core</div>
            </div>
            <div className="p-4 bg-gradient-to-b from-[#0f172a]/50 to-[#0B1120]/50">
                <div ref={chart200Ref} className="w-full rounded-xl overflow-hidden [&_.tv-lightweight-charts]:rounded-xl" />
            </div>
        </div>
      </div>
    </div>
  );
}
