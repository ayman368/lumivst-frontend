"use client";

import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useTableSort } from '../_components/useTableSort';
import { SortableHeader } from '../_components/SortableHeader';
import { ExportDropdown } from '../_components/ExportDropdown';
import { API_BASE_URL } from '@/lib/api/config';

type HistoricalReport = {
  id: number;
  report_date: string;
  open_price: string;
  high_price: string;
  low_price: string;
  close_price: string;
  volume_traded: string;
  value_traded: string;
  no_of_trades: string;
};

const ROW_HEIGHT = 45;
const TABLE_BODY_HEIGHT = ROW_HEIGHT * 20;

function parseNum(val: string): number | null {
  const n = parseFloat(val.replace(/,/g, ''));
  return isNaN(n) ? null : n;
}

export default function HistoricalReportsPage() {
  const [data, setData] = useState<HistoricalReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { sortConfigs, handleSort, clearSort, sortedData } = useTableSort<HistoricalReport>();

  // Date range
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Numeric range filters
  const numericFilters = [
    { key: 'open_price', label: 'Open' },
    { key: 'high_price', label: 'High' },
    { key: 'low_price', label: 'Low' },
    { key: 'close_price', label: 'Close' },
    { key: 'volume_traded', label: 'Volume' },
    { key: 'value_traded', label: 'Value Traded' },
    { key: 'no_of_trades', label: 'No. Trades' },
  ];

  const [rangeValues, setRangeValues] = useState<Record<string, { min: string; max: string }>>({});

  const handleRangeChange = (key: string, min: string, max: string) => {
    setRangeValues((prev) => ({ ...prev, [key]: { min, max } }));
  };

  const handleClearAll = () => {
    setDateFrom('');
    setDateTo('');
    setRangeValues({});
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_URL = API_BASE_URL;
        const response = await axios.get(`${API_URL}/api/market-reports/historical-reports`);
        setData(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      // Date range
      if (dateFrom && row.report_date < dateFrom) return false;
      if (dateTo && row.report_date > dateTo) return false;

      // Numeric filters
      for (const { key } of numericFilters) {
        const range = rangeValues[key];
        if (!range) continue;
        const { min, max } = range;
        if (!min && !max) continue;
        const val = parseNum(String((row as any)[key] ?? ''));
        if (val === null) continue;
        if (min && parseNum(min) !== null && val < parseNum(min)!) return false;
        if (max && parseNum(max) !== null && val > parseNum(max)!) return false;
      }
      return true;
    });
  }, [data, dateFrom, dateTo, rangeValues]);

  const hasActiveFilters =
    dateFrom !== '' ||
    dateTo !== '' ||
    Object.values(rangeValues).some((v) => v.min !== '' || v.max !== '');

  if (loading) return <div className="text-gray-700 p-4">Loading...</div>;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;
  if (data.length === 0) return <div className="text-gray-500 p-4">No data available. Run the scraper first.</div>;

  const displayed = sortedData(filteredData);

  return (
    <div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

        .hist-filter-panel {
          font-family: 'DM Sans', sans-serif;
          background: linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%);
          border: 1px solid #dde4f5;
          border-radius: 16px;
          padding: 20px 24px;
          box-shadow: 0 2px 12px rgba(59, 100, 220, 0.06), inset 0 1px 0 rgba(255,255,255,0.9);
          position: relative;
          overflow: hidden;
          margin-bottom: 24px;
        }

        .hist-filter-panel::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #3b64dc, #6c8ef5, #3b64dc);
          background-size: 200% 100%;
          animation: shimmer 3s ease infinite;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .hist-filter-top {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }

        .filter-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #3b64dc;
          color: white;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 5px 12px;
          border-radius: 20px;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .date-range-section {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .date-section-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #3b64dc;
          background: rgba(59,100,220,0.08);
          padding: 4px 10px;
          border-radius: 6px;
          white-space: nowrap;
        }

        .date-input-wrapper {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .date-input-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: #6b7db3;
        }

        .date-input {
          padding: 7px 10px;
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          background: white;
          border: 1.5px solid #dde4f5;
          border-radius: 8px;
          color: #1e2a4a;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          cursor: pointer;
        }

        .date-input:focus {
          border-color: #3b64dc;
          box-shadow: 0 0 0 3px rgba(59,100,220,0.12);
        }

        .date-arrow {
          color: #b0bbda;
          font-size: 16px;
          font-weight: 600;
          align-self: flex-end;
          padding-bottom: 8px;
        }

        .divider {
          width: 1px;
          height: 40px;
          background: #dde4f5;
          align-self: flex-end;
          margin: 0 4px;
        }

        .numeric-filters-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: flex-end;
          padding-top: 14px;
          border-top: 1px solid #eaeffa;
        }

        .num-filter-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
          min-width: 150px;
        }

        .num-filter-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: #6b7db3;
        }

        .num-inputs {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .num-input {
          width: 72px;
          padding: 7px 8px;
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          background: white;
          border: 1.5px solid #dde4f5;
          border-radius: 8px;
          color: #1e2a4a;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          text-align: center;
        }

        .num-input::placeholder { color: #c5cce0; font-size: 11px; }

        .num-input:focus {
          border-color: #3b64dc;
          box-shadow: 0 0 0 3px rgba(59,100,220,0.12);
        }

        .range-sep { color: #b0bbda; font-size: 11px; font-weight: 600; }

        .clear-all-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 7px 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #e05252;
          background: #fff5f5;
          border: 1.5px solid #fac5c5;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          margin-left: auto;
        }

        .clear-all-btn:hover {
          background: #fee2e2;
          border-color: #e05252;
          transform: translateY(-1px);
        }

        .active-dot {
          width: 6px; height: 6px;
          background: #5ddd8a;
          border-radius: 50%;
          display: inline-block;
          box-shadow: 0 0 0 2px rgba(93,221,138,0.3);
        }

        .date-quick-btns {
          display: flex;
          gap: 6px;
          align-items: flex-end;
          padding-bottom: 1px;
        }

        .quick-btn {
          padding: 5px 10px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          border: 1.5px solid #dde4f5;
          border-radius: 7px;
          background: white;
          color: #6b7db3;
          cursor: pointer;
          transition: all 0.18s;
          white-space: nowrap;
        }

        .quick-btn:hover, .quick-btn.active {
          background: #3b64dc;
          border-color: #3b64dc;
          color: white;
        }
      `}</style>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Historical Reports (TASI)</h2>
        <div className="flex items-center gap-4">
          {sortConfigs.length > 0 && (
            <button
              onClick={clearSort}
              className="text-xs text-gray-500 hover:text-gray-800 border border-gray-300 hover:border-gray-400 px-3 py-1.5 rounded-lg transition-colors"
            >
              Clear Sort ({sortConfigs.length})
            </button>
          )}
          <ExportDropdown
            data={displayed}
            filename="historical_reports_tasi"
            headers={[
              { label: 'Date', key: 'report_date' },
              { label: 'Open', key: 'open_price' },
              { label: 'High', key: 'high_price' },
              { label: 'Low', key: 'low_price' },
              { label: 'Close', key: 'close_price' },
              { label: 'Volume Traded', key: 'volume_traded' },
              { label: 'Value Traded', key: 'value_traded' },
              { label: 'No. of Trades', key: 'no_of_trades' },
            ]}
          />
          <span className="text-green-600 font-medium text-sm">
            {displayed.length} of {data.length} records
            {displayed.length > 0 && ` · ${displayed[displayed.length - 1]?.report_date} → ${displayed[0]?.report_date}`}
          </span>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="hist-filter-panel">
        {/* Top row: badge + date range + clear */}
        <div className="hist-filter-top">
          <span className="filter-badge">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 4h12M4 8h8M6 12h4" strokeLinecap="round" />
            </svg>
            Filters
            {hasActiveFilters && <span className="active-dot" />}
          </span>

          <div className="date-range-section">
            <span className="date-section-label">Date Range</span>

            <div className="date-input-wrapper">
              <span className="date-input-label">From</span>
              <input
                type="date"
                className="date-input"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <span className="date-arrow">→</span>

            <div className="date-input-wrapper">
              <span className="date-input-label">To</span>
              <input
                type="date"
                className="date-input"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>

            <div className="divider" />

            {/* Quick select buttons */}
            <div className="date-quick-btns">
              {[
                { label: '1M', months: 1 },
                { label: '3M', months: 3 },
                { label: '6M', months: 6 },
                { label: '1Y', months: 12 },
                { label: '3Y', months: 36 },
                { label: '5Y', months: 60 },
              ].map(({ label, months }) => {
                const toDate = new Date();
                const fromDate = new Date();
                fromDate.setMonth(fromDate.getMonth() - months);
                const toStr = toDate.toISOString().split('T')[0];
                const fromStr = fromDate.toISOString().split('T')[0];
                const isActive = dateFrom === fromStr && dateTo === toStr;
                return (
                  <button
                    key={label}
                    className={`quick-btn ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      setDateFrom(fromStr);
                      setDateTo(toStr);
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {hasActiveFilters && (
            <button className="clear-all-btn" onClick={handleClearAll}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
              </svg>
              Clear All
            </button>
          )}
        </div>

        {/* Numeric range filters */}
        <div className="numeric-filters-grid">
          {numericFilters.map((nf) => (
            <div key={nf.key} className="num-filter-group">
              <span className="num-filter-label">{nf.label}</span>
              <div className="num-inputs">
                <input
                  className="num-input"
                  placeholder="Min"
                  value={rangeValues[nf.key]?.min ?? ''}
                  onChange={(e) => handleRangeChange(nf.key, e.target.value, rangeValues[nf.key]?.max ?? '')}
                />
                <span className="range-sep">→</span>
                <input
                  className="num-input"
                  placeholder="Max"
                  value={rangeValues[nf.key]?.max ?? ''}
                  onChange={(e) => handleRangeChange(nf.key, rangeValues[nf.key]?.min ?? '', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: TABLE_BODY_HEIGHT }}>
          <table className="min-w-full text-sm text-left border-collapse">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs sticky top-0 z-10 shadow-[0_1px_0_0_#e5e7eb]">
              <tr>
                <SortableHeader label="Date" sortKey="report_date" sortConfigs={sortConfigs} onSort={handleSort} />
                <SortableHeader label="Open" sortKey="open_price" sortConfigs={sortConfigs} onSort={handleSort} className="text-center" />
                <SortableHeader label="High" sortKey="high_price" sortConfigs={sortConfigs} onSort={handleSort} className="text-center" />
                <SortableHeader label="Low" sortKey="low_price" sortConfigs={sortConfigs} onSort={handleSort} className="text-center" />
                <SortableHeader label="Close" sortKey="close_price" sortConfigs={sortConfigs} onSort={handleSort} className="text-center" />
                <SortableHeader label="Volume Traded" sortKey="volume_traded" sortConfigs={sortConfigs} onSort={handleSort} className="text-center" />
                <SortableHeader label="Value Traded" sortKey="value_traded" sortConfigs={sortConfigs} onSort={handleSort} className="text-center" />
                <SortableHeader label="No. of Trades" sortKey="no_of_trades" sortConfigs={sortConfigs} onSort={handleSort} className="text-center" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {displayed.map((row, idx) => (
                <tr key={row.id} className={`hover:bg-blue-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`} style={{ height: ROW_HEIGHT }}>
                  <td className="px-4 py-3 text-blue-600 font-medium whitespace-nowrap">{row.report_date}</td>
                  <td className="px-4 py-3 text-center">{row.open_price}</td>
                  <td className="px-4 py-3 text-center">{row.high_price}</td>
                  <td className="px-4 py-3 text-center">{row.low_price}</td>
                  <td className="px-4 py-3 text-center">{row.close_price}</td>
                  <td className="px-4 py-3 text-center">{row.volume_traded}</td>
                  <td className="px-4 py-3 text-center">{row.value_traded}</td>
                  <td className="px-4 py-3 text-center">{row.no_of_trades}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-gray-400 text-xs mt-2">
        {displayed.length} rows · Scroll to see more · Click header to sort · Click again to reverse
      </p>
    </div>
  );
}