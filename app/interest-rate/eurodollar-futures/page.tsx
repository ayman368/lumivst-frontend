'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { API_BASE_URL } from '@/lib/api/config';

interface SofrRow {
  id: number;
  scrape_date: string;
  contract: string;
  last_price: number | null;
  change: number | null;
  open_price: number | null;
  high: number | null;
  low: number | null;
  volume: number | null;
  updated_time: string | null;
}

type SortDir = 'asc' | 'desc';
type SortRule = { key: keyof SofrRow; dir: SortDir };

const COLS: { key: keyof SofrRow; label: string; align: 'left' | 'right' }[] = [
  { key: 'contract', label: 'Month', align: 'left' },
  { key: 'last_price', label: 'Last', align: 'right' },
  { key: 'change', label: 'Chg.', align: 'right' },
  { key: 'open_price', label: 'Open', align: 'right' },
  { key: 'high', label: 'High', align: 'right' },
  { key: 'low', label: 'Low', align: 'right' },
  { key: 'volume', label: 'Volume', align: 'right' },
  { key: 'updated_time', label: 'Time', align: 'right' },
];

// ✅ function عادية مش component
function renderArrow(col: typeof COLS[0], sortRules: SortRule[]) {
  const rule = sortRules.find(r => r.key === col.key);
  const idx = rule ? sortRules.indexOf(rule) : -1;
  const arrow = !rule ? '⇅' : rule.dir === 'asc' ? '↑' : '↓';
  const arrowColor = rule ? '#2563eb' : '#9ca3af';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
      <span style={{ color: arrowColor, fontSize: 13 }}>{arrow}</span>
      {rule && (
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: 15, height: 15, borderRadius: '50%', background: '#2563eb',
          color: '#fff', fontSize: 9, fontWeight: 700, lineHeight: 1,
        }}>
          {idx + 1}
        </span>
      )}
    </span>
  );
}

export default function SofrFuturesPage() {
  const [rawData, setRawData] = useState<SofrRow[]>([]);
  const [sortRules, setSortRules] = useState<SortRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/economic-indicators/eurodollar-futures/latest`)
      .then(res => res.json())
      .then(json => { setRawData(Array.isArray(json) ? json : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleHeaderClick = useCallback((key: keyof SofrRow) => {
    setSortRules(prev => {
      const existing = prev.find(r => r.key === key);
      if (!existing) return [...prev, { key, dir: 'asc' }];
      if (existing.dir === 'asc') return prev.map(r => r.key === key ? { ...r, dir: 'desc' } : r);
      return prev.filter(r => r.key !== key);
    });
  }, []);

  const sortedData = React.useMemo(() => {
    if (!sortRules.length) return rawData;
    return [...rawData].sort((a, b) => {
      for (const { key, dir } of sortRules) {
        const av = a[key], bv = b[key];
        if (av === null && bv === null) continue;
        if (av === null) return 1;
        if (bv === null) return -1;
        const cmp =
          typeof av === 'string' && typeof bv === 'string'
            ? av.localeCompare(bv)
            : (av as number) - (bv as number);
        if (cmp !== 0) return dir === 'asc' ? cmp : -cmp;
      }
      return 0;
    });
  }, [rawData, sortRules]);

  const fmt = (v: number | null) =>
    v == null ? 'N/A' : v.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  const fmtC = (v: number | null) =>
    v == null ? '0.00' : (v >= 0 ? '+' : '') + v.toFixed(2);
  const fmtI = (v: number | null) =>
    v == null ? '0' : v.toLocaleString('en-US');

  const latestDate = rawData.length > 0 ? rawData[0].scrape_date : '';

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-slate-50">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Eurodollar Contracts</h1>
        <p className="text-gray-600 mt-2 text-lg">Eurodollar Futures — Source: Investing.com</p>
        {latestDate && <p className="text-sm text-gray-400 mt-1">Last updated: {latestDate}</p>}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
          </div>
        ) : rawData.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center text-gray-500">
            <p className="text-xl">No data available yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {COLS.map(col => {
                    const sorted = sortRules.some(r => r.key === col.key);
                    return (
                      <th
                        key={col.key}
                        onClick={() => handleHeaderClick(col.key)}
                        className={[
                          'px-4 py-3 font-semibold cursor-pointer select-none whitespace-nowrap',
                          col.align === 'right' ? 'text-right' : 'text-left',
                          sorted ? 'text-blue-700' : 'text-gray-700 hover:text-gray-900',
                        ].join(' ')}
                      >
                        <span className="inline-flex items-center gap-1">
                          {col.align === 'right' && renderArrow(col, sortRules)}
                          {col.label}
                          {col.align === 'left' && renderArrow(col, sortRules)}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {sortedData.map((row, i) => (
                  <tr
                    key={row.id}
                    className={`border-b border-gray-100 hover:bg-blue-50/40 transition ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                      }`}
                  >
                    <td className="px-4 py-2.5 font-medium text-blue-700">{row.contract}</td>
                    <td className="px-4 py-2.5 text-right text-gray-900 font-medium">{fmt(row.last_price)}</td>
                    <td className={`px-4 py-2.5 text-right font-semibold ${row.change == null ? 'text-gray-500'
                      : row.change > 0 ? 'text-green-600'
                        : row.change < 0 ? 'text-red-600'
                          : 'text-gray-700'
                      }`}>
                      {fmtC(row.change)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-gray-700">{fmt(row.open_price)}</td>
                    <td className="px-4 py-2.5 text-right text-gray-700">{fmt(row.high)}</td>
                    <td className="px-4 py-2.5 text-right text-gray-700">{fmt(row.low)}</td>
                    <td className="px-4 py-2.5 text-right text-gray-700">{fmtI(row.volume)}</td>
                    <td className="px-4 py-2.5 text-right text-gray-500 text-xs">{row.updated_time || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}