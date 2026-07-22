'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ArrowUpCircle, ArrowDownCircle, Star } from 'lucide-react';
import { authFetch } from '@/lib/api/authFetch';
import { API_BASE_URL } from '@/lib/api/config';
import AporiaChartModal from './_components/AporiaChartModal';

interface AporiaRow {
  ticker: string;
  name: string;
  sector: string;
  market_cap: string;
  val_avg_3mo: string;
  trailingPE: string;
  last: string;
  mtd_rtn: string;
  mo3_rtn: string;
  year_rtn: string;
  daily_trend: string;
  weekly_trend: string;
  monthly_trend: string;
  trend_rank: string;
  pfh_250: string;
  days_since_high_250: string;
  breakout: string;
  longest_consolidation_window: string;
  position: string;
  price_extreme: string;
  vol_5_day_chng: string;
  vol_20_day_chng: string;
}

type SortKey = keyof AporiaRow;
type SortDirection = 'asc' | 'desc';
interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

const FILTER_OPTIONS = [
  { value: 'all_analytics', label: 'All Analytics' },
  { value: 'largest_market_cap', label: 'Largest Market Cap' },
  { value: 'strongest_uptrends', label: 'Strongest Uptrends' },
  { value: 'strongest_downtrends', label: 'Strongest Downtrends' },
  { value: 'breakouts', label: 'Breakouts' },
  { value: 'consolidations', label: 'Consolidations' },
];

// Rows visible before the table scrolls
const VISIBLE_ROWS = 16;
const ROW_HEIGHT_PX = 32; // matches h-8 row height
const HEADER_HEIGHT_PX = 56; // matches the two-line header block

// Parses a cell value into something comparable. Numeric-looking strings
// (including percentages, ranks, and "up:20,10" trend strings) sort
// numerically; everything else falls back to a case-insensitive string sort.
function toComparable(raw: string | undefined): { num: number | null; str: string } {
  if (raw === undefined || raw === null || raw === '' || raw === '-') {
    return { num: null, str: '' };
  }

  // Handle trend values BEFORE stripping commas to preserve split(',') logic
  const directionMatch = raw.match(/^(up|down):(.+)$/i);
  if (directionMatch) {
    const sign = directionMatch[1].toLowerCase() === 'up' ? 1 : -1;
    const firstNum = parseFloat(directionMatch[2].split(',')[0]);
    return { num: Number.isNaN(firstNum) ? null : sign * firstNum, str: raw.toLowerCase() };
  }

  // Strip commas and percentages for regular numbers
  const cleaned = raw.replace(/[%,]/g, '').trim();
  const num = parseFloat(cleaned);
  return { num: Number.isNaN(num) ? null : num, str: cleaned.toLowerCase() };
}

function compareRows(a: AporiaRow, b: AporiaRow, key: SortKey, direction: SortDirection): number {
  const av = toComparable(a[key]);
  const bv = toComparable(b[key]);
  let result: number;

  if (av.num !== null && bv.num !== null) {
    result = av.num - bv.num;
  } else if (av.num !== null) {
    result = -1; // numbers sort before non-numeric/blank values
  } else if (bv.num !== null) {
    result = 1;
  } else {
    result = av.str.localeCompare(bv.str);
  }

  return direction === 'asc' ? result : -result;
}

export default function SaudiAnalyticsPage() {
  const [data, setData] = useState<AporiaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterBy, setFilterBy] = useState('all_analytics');
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }));
  const [selectedStock, setSelectedStock] = useState<{ ticker: string; name: string } | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  useEffect(() => {
    fetchData(filterBy);
  }, [filterBy]);

  const fetchData = async (filter: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch(`${API_BASE_URL}/api/aporia/saudi-analytics?filter_by=${filter}`);
      if (!res.ok) {
        throw new Error('Failed to fetch data');
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: SortKey) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;
    const { key, direction } = sortConfig;
    return [...data].sort((a, b) => compareRows(a, b, key, direction));
  }, [data, sortConfig]);

  const sortIndicator = (key: SortKey) => {
    if (sortConfig?.key !== key) {
      return <span className="text-gray-400 text-[8px]">◆</span>;
    }
    return (
      <span className="text-gray-700 text-[8px]">
        {sortConfig.direction === 'asc' ? '▲' : '▼'}
      </span>
    );
  };

  const renderTrendBadge = (trendStr: string) => {
    if (!trendStr || trendStr === '-' || trendStr === 'flat') {
      return (
        <div className="flex justify-center items-center h-6 bg-gray-200 rounded px-2 w-full max-w-[60px] mx-auto">
        </div>
      );
    }

    // e.g., "up:20,10" or "down:46,1" or "up:54,*"
    const [direction, valuesStr] = trendStr.split(':');
    const values = valuesStr ? valuesStr.split(',') : [];

    const isUp = direction === 'up';
    const bgColor = isUp ? 'bg-green-600' : 'bg-red-600';

    return (
      <div className={`flex justify-between items-center h-6 ${bgColor} text-white rounded px-1.5 w-full max-w-[70px] mx-auto text-[10px] font-bold`}>
        {isUp ? <ArrowUpCircle size={12} className="text-white fill-green-600 bg-white rounded-full" /> : <ArrowDownCircle size={12} className="text-white fill-red-600 bg-white rounded-full" />}
        {values.map((v, i) => (
          <span key={i} className="mx-0.5">
            {v === '*' ? <Star size={10} className="fill-current" /> : v}
          </span>
        ))}
      </div>
    );
  };

  const formatPercentage = (val: string) => {
    if (!val) return val;
    const isNegative = val.startsWith('-');
    return (
      <span className={isNegative ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
        {val}
      </span>
    );
  };

  // Price Extreme cells carry semantic color words from the backend (e.g. "green",
  // "red,red"). Render each token in its own color instead of flat black text.
  const renderPriceExtreme = (val: string) => {
    if (!val || val === '-') return <span className="text-gray-300">–</span>;
    const tokens = val.split(',').map((t) => t.trim()).filter(Boolean);
    return (
      <span className="inline-flex items-center justify-center gap-1">
        {tokens.map((t, i) => {
          const key = t.toLowerCase();
          const colorClass =
            key === 'green' ? 'text-green-600' :
              key === 'red' ? 'text-red-600' :
                'text-gray-900';
          return (
            <span key={i} className={`font-semibold capitalize ${colorClass}`}>
              {t}
            </span>
          );
        })}
      </span>
    );
  };

  // Breakout cells signal direction ("up"/"green" or "down"/"red"); show a
  // colored triangle marker instead of plain text so it pops the way the
  // reference design does.
  const renderBreakout = (val: string) => {
    if (!val || val === '-') return <span className="text-gray-300">–</span>;
    const key = val.trim().toLowerCase();
    if (key === 'up' || key === 'green') {
      return <span className="text-green-600 font-bold">▲</span>;
    }
    if (key === 'down' || key === 'red') {
      return <span className="text-red-600 font-bold">▼</span>;
    }
    return <span className="text-gray-900 font-medium">{val}</span>;
  };

  // Longest consolidation window as a solid badge, matching the reference's
  // dark pill treatment instead of a flat number.
  const renderConsolidationBadge = (val: string) => {
    if (!val || val === '-') return <span className="text-gray-300">–</span>;
    return (
      <span className="inline-block bg-gray-700 text-white text-[10px] font-bold rounded px-2 py-0.5 min-w-[32px]">
        {val}
      </span>
    );
  };

  // Range position as a small filled bar (red near the low, green near the
  // high) with the percentage label, instead of plain colored text.
  const renderPositionBar = (val: string) => {
    if (!val || val === '-') return <span className="text-gray-300">–</span>;
    const pct = parseFloat(val.replace('%', ''));
    if (Number.isNaN(pct)) return <span className="text-gray-900 font-medium">{val}</span>;
    const clamped = Math.max(0, Math.min(100, pct));
    const isHigh = clamped >= 50;
    return (
      <div className="flex items-center justify-center gap-1.5">
        <div className="relative w-9 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`absolute top-0 left-0 h-full ${isHigh ? 'bg-green-600' : 'bg-red-600'}`}
            style={{ width: `${clamped}%` }}
          />
        </div>
        <span className={`text-[10px] font-semibold ${isHigh ? 'text-green-600' : 'text-red-600'}`}>{val}</span>
      </div>
    );
  };

  // Sortable header cell — click anywhere on the label to sort by that column.
  const SortableTh = ({
    sortKey,
    className,
    children,
  }: {
    sortKey: SortKey;
    className?: string;
    children: React.ReactNode;
  }) => (
    <th
      className={`py-2 px-2 cursor-pointer select-none hover:bg-gray-50 ${className ?? ''}`}
      onClick={() => handleSort(sortKey)}
    >
      {children} {sortIndicator(sortKey)}
    </th>
  );

  const tableMaxHeight = HEADER_HEIGHT_PX + VISIBLE_ROWS * ROW_HEIGHT_PX;

  return (
    <div className="p-6 bg-white min-h-screen text-xs" style={{ fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>

      {/* Header section */}
      <div className="mb-6 border-b pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-green-700 p-2 rounded-full text-white font-bold text-lg leading-none">
            Aporia
          </div>
          <h1 className="text-2xl font-normal text-slate-800">Saudi Stock Analytics</h1>
        </div>

        <div className="text-gray-600 text-[11px] mb-4 flex gap-2">
          <span>Last updated: {lastUpdated}</span>
          <span className="text-gray-400">|</span>
          <span>Number of monitored stocks: {data.length}</span>
        </div>

        <div className="text-gray-600 text-[11px] italic mb-4">
          Click on a row to view chart.
        </div>

        <div className="flex items-center gap-2 relative z-10">
          <span className="text-gray-700 font-medium text-[11px]">Filter By:</span>
          <select
            className="border border-gray-300 rounded px-2 py-1 text-[11px] bg-gray-100 shadow-sm outline-none focus:border-gray-400"
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
          >
            {FILTER_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table section */}
      <div className="rounded shadow-sm border border-gray-200">
        <div
          className="overflow-auto"
          style={{ maxHeight: `${tableMaxHeight}px` }}
        >
          <table className="w-full text-center whitespace-nowrap bg-white border-collapse">
            <thead>
              {/* Main Header Row */}
              <tr className="bg-white text-[10px] font-bold text-gray-900 border-b-2 border-gray-200">
                <SortableTh sortKey="ticker" className="text-left sticky left-0 top-0 bg-white z-30 w-16 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Ticker</SortableTh>
                <SortableTh sortKey="name" className="text-left sticky top-0 bg-white z-20 w-32">Name</SortableTh>
                <SortableTh sortKey="sector" className="text-left sticky top-0 bg-white z-20 w-32">Sector</SortableTh>
                <SortableTh sortKey="market_cap" className="sticky top-0 bg-white z-20 w-16">Market Cap<br />Rank</SortableTh>
                <SortableTh sortKey="val_avg_3mo" className="sticky top-0 bg-white z-20 w-16">Value Traded<br />Rank</SortableTh>
                <SortableTh sortKey="trailingPE" className="sticky top-0 bg-white z-20 w-16">PE Ratio<br />(TTM)</SortableTh>
                <SortableTh sortKey="last" className="sticky top-0 bg-white z-20 w-16">Last<br />Price</SortableTh>
                <th className="py-1 px-1 border-x border-gray-200 sticky top-0 bg-white z-20" colSpan={3}>
                  <div className="border-b border-gray-200 pb-1 mb-1">Performance</div>
                  <div className="grid grid-cols-3 gap-1">
                    <div className="cursor-pointer select-none hover:text-gray-900" onClick={() => handleSort('mtd_rtn')}>MTD {sortIndicator('mtd_rtn')}</div>
                    <div className="cursor-pointer select-none hover:text-gray-900" onClick={() => handleSort('mo3_rtn')}>3-Month {sortIndicator('mo3_rtn')}</div>
                    <div className="cursor-pointer select-none hover:text-gray-900" onClick={() => handleSort('year_rtn')}>1-Year {sortIndicator('year_rtn')}</div>
                  </div>
                </th>
                <SortableTh sortKey="daily_trend" className="sticky top-0 bg-white z-20 w-16">Daily<br />Trend</SortableTh>
                <SortableTh sortKey="weekly_trend" className="sticky top-0 bg-white z-20 w-16">Weekly<br />Trend</SortableTh>
                <SortableTh sortKey="monthly_trend" className="sticky top-0 bg-white z-20 w-16">Monthly<br />Trend</SortableTh>
                <SortableTh sortKey="trend_rank" className="sticky top-0 bg-white z-20 w-16">Trend<br />Rank</SortableTh>
                <SortableTh sortKey="pfh_250" className="sticky top-0 bg-white z-20 w-16">% Below<br />250-Day High</SortableTh>
                <SortableTh sortKey="days_since_high_250" className="sticky top-0 bg-white z-20 w-16">Days Since<br />250-Day High</SortableTh>
                <SortableTh sortKey="breakout" className="sticky top-0 bg-white z-20 w-16">Breakout</SortableTh>
                <SortableTh sortKey="longest_consolidation_window" className="sticky top-0 bg-white z-20 w-16">Longest Cons.<br />Window</SortableTh>
                <SortableTh sortKey="position" className="sticky top-0 bg-white z-20 w-16">Position</SortableTh>
                <SortableTh sortKey="price_extreme" className="sticky top-0 bg-white z-20 w-16">Price<br />Extreme</SortableTh>
                <SortableTh sortKey="vol_5_day_chng" className="sticky top-0 bg-white z-20 w-16">Vol 5-Day<br />Chng</SortableTh>
                <SortableTh sortKey="vol_20_day_chng" className="sticky top-0 bg-white z-20 w-16">Vol 20-Day<br />Chng</SortableTh>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={21} className="py-10 text-center text-gray-500">Loading data...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={21} className="py-10 text-center text-red-500">Error: {error}</td>
                </tr>
              ) : sortedData.length === 0 ? (
                <tr>
                  <td colSpan={21} className="py-10 text-center text-gray-500">No data available for this filter.</td>
                </tr>
              ) : (
                sortedData.map((row, idx) => {
                  const isActive = selectedStock?.ticker === row.ticker;
                  return (
                    <tr
                      key={idx}
                      onClick={() => setSelectedStock({ ticker: row.ticker, name: row.name })}
                      className={`border-b border-gray-100 text-[11px] text-gray-900 h-8 cursor-pointer transition-colors ${isActive ? 'bg-blue-50 hover:bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                    >
                      <td className={`py-1 px-2 text-left sticky left-0 font-medium text-blue-600 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] ${isActive ? 'bg-blue-50' : 'bg-white'}`}>
                        {row.ticker}
                      </td>
                      <td className="py-1 px-2 text-left truncate max-w-[120px] text-blue-600" title={row.name}>
                        {row.name}
                      </td>
                      <td className="py-1 px-2 text-left truncate max-w-[120px]" title={row.sector}>{row.sector}</td>
                      <td className="py-1 px-2">{row.market_cap}</td>
                      <td className="py-1 px-2">{row.val_avg_3mo}</td>
                      <td className="py-1 px-2 text-orange-600 font-medium">{row.trailingPE}</td>
                      <td className="py-1 px-2">{row.last}</td>

                      {/* Performance */}
                      <td className="py-1 px-2 border-l border-gray-200">{formatPercentage(row.mtd_rtn)}</td>
                      <td className="py-1 px-2">{formatPercentage(row.mo3_rtn)}</td>
                      <td className="py-1 px-2 border-r border-gray-200">{formatPercentage(row.year_rtn)}</td>

                      {/* Trends */}
                      <td className="py-1 px-1">{renderTrendBadge(row.daily_trend)}</td>
                      <td className="py-1 px-1">{renderTrendBadge(row.weekly_trend)}</td>
                      <td className="py-1 px-1">{renderTrendBadge(row.monthly_trend)}</td>

                      <td className="py-1 px-2">{row.trend_rank}</td>
                      <td className="py-1 px-2">{row.pfh_250}</td>
                      <td className="py-1 px-2">{row.days_since_high_250}</td>

                      <td className="py-1 px-2">{renderBreakout(row.breakout)}</td>
                      <td className="py-1 px-2">{renderConsolidationBadge(row.longest_consolidation_window)}</td>
                      <td className="py-1 px-2">{renderPositionBar(row.position)}</td>
                      <td className="py-1 px-2">{renderPriceExtreme(row.price_extreme)}</td>
                      <td className="py-1 px-2">{formatPercentage(row.vol_5_day_chng)}</td>
                      <td className="py-1 px-2">{formatPercentage(row.vol_20_day_chng)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {selectedStock && (
        <AporiaChartModal
          ticker={selectedStock.ticker}
          name={selectedStock.name}
          onClose={() => setSelectedStock(null)}
        />
      )}
    </div>
  );
}