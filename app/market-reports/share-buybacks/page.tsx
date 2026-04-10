"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTableSort } from '../_components/useTableSort';
import { SortableHeader } from '../_components/SortableHeader';
import { ExportDropdown } from '../_components/ExportDropdown';
import FilterBar from '../_components/FilterBar';
import { API_BASE_URL } from '@/lib/api/config';

type ShareBuyback = {
  id: number;
  report_date: string;
  symbol: string;
  company: string;
  data: {
    headers: string[];
    values: string[];
  };
};

const ROW_HEIGHT = 45;
const TABLE_BODY_HEIGHT = ROW_HEIGHT * 20;

function parseNum(val: string): number | null {
  const n = parseFloat(String(val).replace(/[%,\s]/g, ''));
  return isNaN(n) ? null : n;
}

export default function ShareBuybacksPage() {
  const [rawData, setRawData] = useState<ShareBuyback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state hoisted above early returns to satisfy Rules of Hooks
  const [searchValue, setSearchValue] = useState('');
  const [rangeValues, setRangeValues] = useState<Record<string, { min: string; max: string }>>({});

  const { sortConfigs, handleSort, clearSort, sortedData } = useTableSort<any>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_URL = API_BASE_URL;
        const response = await axios.get(`${API_URL}/api/market-reports/share-buybacks`);
        setRawData(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-gray-700 p-4">Loading...</div>;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;
  if (rawData.length === 0) return <div className="text-gray-500 p-4">No data available. Run the scraper first.</div>;

  // Original logic — untouched
  const headers = rawData[0]?.data?.headers || [];

  const flatData = rawData.map((row) => {
    const flat: Record<string, any> = { id: row.id, symbol: row.symbol, company: row.company };
    headers.forEach((h, i) => {
      flat[`col_${i}`] = row.data?.values?.[i + 2] ?? '';
    });
    return flat;
  });

  // Filter applied on top of flatData
  const filteredData = flatData.filter((row) => {
    if (searchValue.trim()) {
      const q = searchValue.toLowerCase();
      if (
        !String(row.symbol ?? '').toLowerCase().includes(q) &&
        !String(row.company ?? '').toLowerCase().includes(q)
      ) return false;
    }
    for (let i = 0; i < headers.length; i++) {
      const key = `col_${i}`;
      const range = rangeValues[key];
      if (!range) continue;
      const { min, max } = range;
      if (!min && !max) continue;
      const val = parseNum(String(row[key] ?? ''));
      if (val === null) continue;
      if (min && parseNum(min) !== null && val < parseNum(min)!) return false;
      if (max && parseNum(max) !== null && val > parseNum(max)!) return false;
    }
    return true;
  });

  const parentGroups = ['Employers Plan', 'Other Plan', 'Total'];
  const subGroups = ['Shares', '% Issued'];

  const generatedRangeFilters = headers.length > 0 ? headers.map((h, i) => {
    const N = Math.max(1, Math.floor(headers.length / 6));
    const parentIdx = Math.min(2, Math.floor(i / (2 * N)));
    const subIdx = Math.min(1, Math.floor((i % (2 * N)) / N));

    return {
      key: `col_${i}`,
      label: `${parentGroups[parentIdx]} - ${subGroups[subIdx]} (${h})`
    };
  }) : [];

  const handleRangeChange = (key: string, min: string, max: string) => {
    setRangeValues((prev) => ({ ...prev, [key]: { min, max } }));
  };

  const handleClearAll = () => {
    setSearchValue('');
    setRangeValues({});
  };

  const displayed = sortedData(filteredData);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Listed Companies Share Buy-back Ownership</h2>
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
            filename="share_buybacks"
            headers={[
              { label: 'Symbol', key: 'symbol' },
              { label: 'Company', key: 'company' },
              ...generatedRangeFilters.map(rf => ({ label: rf.label, key: rf.key }))
            ]}
          />
          <span className="text-green-600 font-medium">Last Update Date: {rawData[0]?.report_date}</span>
        </div>
      </div>

      <FilterBar
        searchKeys={['symbol', 'company']}
        searchPlaceholder="Search by symbol or company name..."
        rangeFilters={generatedRangeFilters}
        searchValue={searchValue}
        rangeValues={rangeValues}
        onSearchChange={setSearchValue}
        onRangeChange={handleRangeChange}
        onClearAll={handleClearAll}
      />

      <div className="rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: TABLE_BODY_HEIGHT }}>
          <table className="min-w-full text-sm text-left border-collapse">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[11px] font-semibold sticky top-0 z-10 shadow-[0_1px_0_0_#e5e7eb] leading-tight">
              {/* Row 1 */}
              <tr className="border-b border-gray-200">
                <SortableHeader rowSpan={headers.length > 0 ? 3 : 1} label="Symbol" sortKey="symbol" sortConfigs={sortConfigs} onSort={handleSort} className="border-r border-gray-200 align-middle text-center whitespace-nowrap bg-gray-50" />
                <SortableHeader rowSpan={headers.length > 0 ? 3 : 1} label="Company Name" sortKey="company" sortConfigs={sortConfigs} onSort={handleSort} className="border-r border-gray-200 align-middle text-center min-w-[200px] bg-gray-50" />
                {headers.length > 0 && (
                  <>
                    <th colSpan={Math.max(1, Math.floor(headers.length / 3))} className="px-4 py-3 border-r border-gray-200 text-center align-middle bg-gray-50">HOLDINGS FOR EMPLOYERS SHARES PLAN</th>
                    <th colSpan={Math.max(1, Math.floor(headers.length / 3))} className="px-4 py-3 border-r border-gray-200 text-center align-middle bg-gray-50">HOLDINGS FOR OTHER SHARE BUY-BACK PLAN</th>
                    <th colSpan={Math.max(1, Math.floor(headers.length / 3))} className="px-4 py-3 text-center align-middle bg-gray-50">TOTAL HOLDINGS</th>
                  </>
                )}
              </tr>
              {/* Row 2 */}
              {headers.length > 0 && (
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th colSpan={Math.max(1, Math.floor(headers.length / 6))} className="px-4 py-2 border-r border-gray-200 text-center align-middle bg-gray-50">NO. OF SHARES</th>
                  <th colSpan={Math.max(1, Math.floor(headers.length / 6))} className="px-4 py-2 border-r border-gray-200 text-center align-middle bg-gray-50">AS PERCENTAGE OF TOTAL ISSUED SHARES</th>
                  <th colSpan={Math.max(1, Math.floor(headers.length / 6))} className="px-4 py-2 border-r border-gray-200 text-center align-middle bg-gray-50">NO. OF SHARES</th>
                  <th colSpan={Math.max(1, Math.floor(headers.length / 6))} className="px-4 py-2 border-r border-gray-200 text-center align-middle bg-gray-50">AS PERCENTAGE OF TOTAL ISSUED SHARES</th>
                  <th colSpan={Math.max(1, Math.floor(headers.length / 6))} className="px-4 py-2 border-r border-gray-200 text-center align-middle bg-gray-50">NO. OF SHARES</th>
                  <th colSpan={Math.max(1, Math.floor(headers.length / 6))} className="px-4 py-2 text-center align-middle bg-gray-50">AS PERCENTAGE OF TOTAL ISSUED SHARES</th>
                </tr>
              )}
              {/* Row 3 */}
              {headers.length > 0 && (
                <tr className="bg-gray-50">
                  {headers.map((h, i) => (
                    <SortableHeader
                      key={i}
                      label={h}
                      sortKey={`col_${i}`}
                      sortConfigs={sortConfigs}
                      onSort={handleSort}
                      className={`text-center py-2 min-w-[85px] ${i < headers.length - 1 ? 'border-r border-gray-200' : ''} bg-gray-50 whitespace-nowrap`}
                    />
                  ))}
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {displayed.map((row, idx) => (
                <tr key={row.id} className={`hover:bg-blue-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`} style={{ height: ROW_HEIGHT }}>
                  <td className="px-4 py-3 text-blue-600 font-medium whitespace-nowrap">{row.symbol}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{row.company}</td>
                  {headers.map((_, i) => (
                    <td key={i} className="px-4 py-3 text-center whitespace-nowrap">{row[`col_${i}`]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-gray-400 text-xs mt-2">
        {displayed.length} rows · Scroll to see more · Click header to sort · Click again to reverse · Click third time to remove
      </p>
    </div>
  );
}