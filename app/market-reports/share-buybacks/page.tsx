"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTableSort } from '../_components/useTableSort';
import { SortableHeader } from '../_components/SortableHeader';
import { ExportDropdown } from '../_components/ExportDropdown';

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

export default function ShareBuybacksPage() {
  const [rawData, setRawData] = useState<ShareBuyback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { sortConfigs, handleSort, clearSort, sortedData } = useTableSort<any>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
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

  const headers = rawData[0]?.data?.headers || [];

  const flatData = rawData.map((row) => {
    const flat: Record<string, any> = { id: row.id, symbol: row.symbol, company: row.company };
    headers.forEach((h, i) => {
      flat[`col_${i}`] = row.data?.values?.[i + 2] ?? '';
    });
    return flat;
  });

  const displayed = sortedData(flatData);

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
              ...headers.map((h, i) => ({ label: h, key: `col_${i}` }))
            ]}
          />
          <span className="text-green-600 font-medium">Last Update Date: {rawData[0]?.report_date}</span>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: TABLE_BODY_HEIGHT }}>
          <table className="min-w-full text-sm text-left border-collapse">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs sticky top-0 z-10 shadow-[0_1px_0_0_#e5e7eb]">
              <tr>
                <SortableHeader label="Symbol" sortKey="symbol" sortConfigs={sortConfigs} onSort={handleSort} />
                <SortableHeader label="Company Name" sortKey="company" sortConfigs={sortConfigs} onSort={handleSort} />
                {headers.map((h, i) => (
                  <SortableHeader key={i} label={h} sortKey={`col_${i}`} sortConfigs={sortConfigs} onSort={handleSort} className="text-center" />
                ))}
              </tr>
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