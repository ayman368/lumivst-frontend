"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTableSort } from '../_components/useTableSort';
import { SortableHeader } from '../_components/SortableHeader';
import { ExportDropdown } from '../_components/ExportDropdown';

type ForeignHeadroom = {
  id: number;
  report_date: string;
  symbol: string;
  company: string;
  foreign_limit: string;
  actual_foreign_ownership: string;
  ownership_room: string;
};

const ROW_HEIGHT = 45;
const TABLE_BODY_HEIGHT = ROW_HEIGHT * 20;

export default function ForeignHeadroomPage() {
  const [data, setData] = useState<ForeignHeadroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { sortConfigs, handleSort, clearSort, sortedData } = useTableSort<ForeignHeadroom>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
        const response = await axios.get(`${API_URL}/api/market-reports/foreign-headroom`);
        setData(response.data);
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
  if (data.length === 0) return <div className="text-gray-500 p-4">No data available. Run the scraper first.</div>;

  const displayed = sortedData(data);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Foreign Headroom</h2>
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
            data={data} 
            filename="foreign_headroom" 
            headers={[
              { label: 'Symbol', key: 'symbol' },
              { label: 'Company', key: 'company' },
              { label: 'Foreign Limit', key: 'foreign_limit' },
              { label: 'Actual Foreign Ownership', key: 'actual_foreign_ownership' },
              { label: 'Ownership Room', key: 'ownership_room' }
            ]}
          />
          <span className="text-green-600 font-medium">Last Update Date: {data[0]?.report_date}</span>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: TABLE_BODY_HEIGHT }}>
          <table className="min-w-full text-sm text-left border-collapse">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs sticky top-0 z-10 shadow-[0_1px_0_0_#e5e7eb]">
              <tr>
                <SortableHeader label="Symbol" sortKey="symbol" sortConfigs={sortConfigs} onSort={handleSort} />
                <SortableHeader label="Company" sortKey="company" sortConfigs={sortConfigs} onSort={handleSort} />
                <SortableHeader label="Foreign Ownership Limit" sortKey="foreign_limit" sortConfigs={sortConfigs} onSort={handleSort} className="text-center" />
                <SortableHeader label="Actual Foreign Ownership" sortKey="actual_foreign_ownership" sortConfigs={sortConfigs} onSort={handleSort} className="text-center" />
                <SortableHeader label="Ownership Room" sortKey="ownership_room" sortConfigs={sortConfigs} onSort={handleSort} className="text-center" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {displayed.map((row, idx) => (
                <tr key={row.id} className={`hover:bg-blue-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`} style={{ height: ROW_HEIGHT }}>
                  <td className="px-4 py-3 text-blue-600 font-medium">{row.symbol}</td>
                  <td className="px-4 py-3">{row.company}</td>
                  <td className="px-4 py-3 text-center">{row.foreign_limit}</td>
                  <td className="px-4 py-3 text-center">{row.actual_foreign_ownership}</td>
                  <td className="px-4 py-3 text-center">{row.ownership_room}</td>
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