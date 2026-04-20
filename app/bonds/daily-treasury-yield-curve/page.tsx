'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { API_BASE_URL } from '@/lib/api/config';

interface YCRow {
  report_date: string;
  month_1: number | null; month_1_5: number | null; month_2: number | null; month_3: number | null;
  month_4: number | null; month_6: number | null; year_1: number | null; year_2: number | null;
  year_3: number | null; year_5: number | null; year_7: number | null; year_10: number | null;
  year_20: number | null; year_30: number | null;
}

type SortKey = 'report_date' | keyof Omit<YCRow, 'report_date'>;
type SortDir = 'asc' | 'desc';

const COLUMNS: { key: SortKey; label: string; priority: number }[] = [
  { key: 'month_1', label: '1 Mo', priority: 1 },
  { key: 'month_1_5', label: '1.5 Mo', priority: 2 },
  { key: 'month_2', label: '2 Mo', priority: 3 },
  { key: 'month_3', label: '3 Mo', priority: 4 },
  { key: 'month_4', label: '4 Mo', priority: 5 },
  { key: 'month_6', label: '6 Mo', priority: 6 },
  { key: 'year_1', label: '1 Yr', priority: 7 },
  { key: 'year_2', label: '2 Yr', priority: 8 },
  { key: 'year_3', label: '3 Yr', priority: 9 },
  { key: 'year_5', label: '5 Yr', priority: 10 },
  { key: 'year_7', label: '7 Yr', priority: 11 },
  { key: 'year_10', label: '10 Yr', priority: 12 },
  { key: 'year_20', label: '20 Yr', priority: 13 },
  { key: 'year_30', label: '30 Yr', priority: 14 },
];

const MONTHS = [
  { value: 'ALL', label: 'All Months' },
  { value: '01', label: 'January' }, { value: '02', label: 'February' },
  { value: '03', label: 'March' }, { value: '04', label: 'April' },
  { value: '05', label: 'May' }, { value: '06', label: 'June' },
  { value: '07', label: 'July' }, { value: '08', label: 'August' },
  { value: '09', label: 'September' }, { value: '10', label: 'October' },
  { value: '11', label: 'November' }, { value: '12', label: 'December' },
];

/** Animated sort icon — shows both arrows, highlights the active one */
function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  const base = 'transition-all duration-150';
  return (
    <span className="inline-flex flex-col items-center gap-[1px] ml-1.5 select-none">
      {/* up arrow */}
      <svg width="8" height="5" viewBox="0 0 8 5" fill="none">
        <path
          d="M4 0L8 5H0L4 0Z"
          className={`${base} ${active && dir === 'asc' ? 'fill-blue-600' : 'fill-gray-300 dark:fill-gray-600'}`}
        />
      </svg>
      {/* down arrow */}
      <svg width="8" height="5" viewBox="0 0 8 5" fill="none">
        <path
          d="M4 5L0 0H8L4 5Z"
          className={`${base} ${active && dir === 'desc' ? 'fill-blue-600' : 'fill-gray-300 dark:fill-gray-600'}`}
        />
      </svg>
    </span>
  );
}

/** Priority badge — small numbered pill beside column header */
function PriorityBadge({ n, active }: { n: number; active: boolean }) {
  return (
    <span
      className={`
        inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-semibold
        ml-1 transition-all duration-150
        ${active
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'}
      `}
    >
      {n}
    </span>
  );
}

export default function DailyTreasuryYieldRatesPage() {
  const [data, setData] = useState<YCRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString().padStart(2, '0'));

  // ── Sort state ──────────────────────────────────────────────────────────────
  const [sortKey, setSortKey] = useState<SortKey>('report_date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  // Multi-column sort priority queue: [{ key, dir, priority }]
  const [sortQueue, setSortQueue] = useState<{ key: SortKey; dir: SortDir; priority: number }[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/economic-indicators/yield-curve?limit=10000`)
      .then(r => r.json())
      .then((json: YCRow[]) => { setData(json); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const availableYears = useMemo(
    () => Array.from(new Set(data.map(d => d.report_date.substring(0, 4)))).sort((a, b) => +b - +a),
    [data],
  );

  const filteredData = useMemo(() => data.filter(d => {
    if (!d.report_date.startsWith(selectedYear)) return false;
    if (selectedMonth !== 'ALL' && d.report_date.substring(5, 7) !== selectedMonth) return false;
    return true;
  }), [data, selectedYear, selectedMonth]);

  // ── Click a column header → cycle: off → asc → desc → off ────────────────
  const handleSort = useCallback((key: SortKey) => {
    setSortQueue(prev => {
      const existing = prev.find(s => s.key === key);
      if (!existing) {
        // Not in queue → add at end with highest priority number, direction asc
        const maxPriority = prev.length ? Math.max(...prev.map(s => s.priority)) : 0;
        return [...prev, { key, dir: 'asc', priority: maxPriority + 1 }];
      }
      if (existing.dir === 'asc') {
        // asc → desc
        return prev.map(s => s.key === key ? { ...s, dir: 'desc' as SortDir } : s);
      }
      // desc → remove from queue, re-number remaining
      const next = prev.filter(s => s.key !== key);
      return next.map((s, i) => ({ ...s, priority: i + 1 }));
    });
  }, []);

  // ── Sort the filtered rows by the queue ────────────────────────────────────
  const sortedData = useMemo(() => {
    if (sortQueue.length === 0) return filteredData;
    return [...filteredData].sort((a, b) => {
      for (const { key, dir } of sortQueue) {
        let valA: string | number | null;
        let valB: string | number | null;
        if (key === 'report_date') {
          valA = a.report_date;
          valB = b.report_date;
        } else {
          valA = (a as any)[key] as number | null;
          valB = (b as any)[key] as number | null;
        }
        // nulls always last
        if (valA === null && valB === null) continue;
        if (valA === null) return 1;
        if (valB === null) return -1;

        const cmp = valA < valB ? -1 : valA > valB ? 1 : 0;
        if (cmp !== 0) return dir === 'asc' ? cmp : -cmp;
      }
      return 0;
    });
  }, [filteredData, sortQueue]);

  const getSortInfo = (key: SortKey) => sortQueue.find(s => s.key === key);

  const selectStyle =
    'h-9 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 ' +
    'text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer';

  const thBase =
    'px-3 py-3 text-right text-[11px] font-semibold tracking-wide uppercase ' +
    'bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700 ' +
    'select-none cursor-pointer whitespace-nowrap ' +
    'hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors duration-100';

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-10 font-sans">

      {/* ── Header ── */}
      <div className="mb-6 pb-5 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1.5">
          Daily Treasury Par Yield Curve Rates
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl">
          Daily par yield curve rates computed by the US Treasury from closing market bid yields on actively traded Treasury securities.
        </p>
      </div>

      {/* ── Filters bar ── */}
      <div className="flex flex-wrap items-center gap-3 mb-5 px-4 py-3.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl">
        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Period:</span>

        <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className={selectStyle}>
          {availableYears.map(y => <option key={y}>{y}</option>)}
        </select>

        <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className={selectStyle}>
          {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>

        {/* Active sorts pill list */}
        {sortQueue.length > 0 && (
          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-xs text-gray-400 dark:text-gray-500">Sorted by:</span>
            {[...sortQueue].sort((a, b) => a.priority - b.priority).map(s => (
              <span
                key={s.key}
                onClick={() => handleSort(s.key)}
                className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
              >
                <span className="w-3.5 h-3.5 rounded-full bg-blue-600 text-white text-[8px] flex items-center justify-center font-bold">{s.priority}</span>
                {s.key === 'report_date' ? 'Date' : COLUMNS.find(c => c.key === s.key)?.label}
                {s.dir === 'asc' ? ' ↑' : ' ↓'}
                <span className="ml-0.5 opacity-60">×</span>
              </span>
            ))}
            <button
              onClick={() => setSortQueue([])}
              className="text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 underline ml-1 transition-colors"
            >
              Reset
            </button>
          </div>
        )}

        <span className="ml-auto text-xs text-gray-400 dark:text-gray-500 tabular-nums">
          {sortedData.length.toLocaleString()} records
        </span>
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="flex flex-col items-center gap-3 py-24 text-gray-400">
          <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
          </svg>
          <span className="text-sm">Loading yield curve data…</span>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <table className="w-full border-collapse whitespace-nowrap text-sm">
            <thead>
              <tr>
                {/* Date column */}
                <th
                  onClick={() => handleSort('report_date')}
                  className={`${thBase} text-left pl-4 pr-3 sticky left-0 z-10 bg-gray-50 dark:bg-gray-800/60`}
                >
                  <span className="inline-flex items-center gap-0.5 text-gray-600 dark:text-gray-400">
                    Date
                    {(() => { const s = getSortInfo('report_date'); return s ? <PriorityBadge n={s.priority} active /> : null; })()}
                    <SortIcon active={!!getSortInfo('report_date')} dir={getSortInfo('report_date')?.dir ?? 'asc'} />
                  </span>
                </th>

                {COLUMNS.map(col => {
                  const s = getSortInfo(col.key);
                  return (
                    <th key={col.key} onClick={() => handleSort(col.key)} className={thBase}>
                      <span className="inline-flex items-center justify-end gap-0.5 text-gray-600 dark:text-gray-400">
                        {col.label}
                        {s ? <PriorityBadge n={s.priority} active /> : null}
                        <SortIcon active={!!s} dir={s?.dir ?? 'asc'} />
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody>
              {sortedData.length === 0 ? (
                <tr>
                  <td colSpan={COLUMNS.length + 1} className="py-16 text-center text-sm text-gray-400">
                    No data available for the selected period.
                  </td>
                </tr>
              ) : (
                sortedData.map((row, i) => (
                  <tr
                    key={row.report_date}
                    className={`
                      group transition-colors duration-100
                      ${i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/60 dark:bg-gray-800/30'}
                      hover:bg-blue-50/70 dark:hover:bg-blue-950/30
                    `}
                  >
                    <td className="pl-4 pr-3 py-2.5 font-medium text-gray-800 dark:text-gray-200 sticky left-0 bg-inherit group-hover:bg-blue-50/70 dark:group-hover:bg-blue-950/30 border-b border-gray-100 dark:border-gray-800">
                      {new Date(row.report_date).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                    </td>
                    {COLUMNS.map(col => {
                      const val = (row as any)[col.key] as number | null;
                      const isActive = !!getSortInfo(col.key);
                      return (
                        <td
                          key={col.key}
                          className={`
                            px-3 py-2.5 text-right tabular-nums border-b border-gray-100 dark:border-gray-800
                            ${val === null ? 'text-gray-300 dark:text-gray-600' : isActive ? 'text-blue-700 dark:text-blue-400 font-medium' : 'text-gray-700 dark:text-gray-300'}
                          `}
                        >
                          {val === null ? '—' : val.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}