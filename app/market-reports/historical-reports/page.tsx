"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTableSort } from '../_components/useTableSort';
import { SortableHeader } from '../_components/SortableHeader';
import { ExportDropdown } from '../_components/ExportDropdown';

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

export default function HistoricalReportsPage() {
  const [data, setData] = useState<HistoricalReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { sortConfigs, handleSort, clearSort, sortedData } = useTableSort<HistoricalReport>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
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

  if (loading) return <div className="text-gray-700 p-4">Loading...</div>;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;
  if (data.length === 0) return <div className="text-gray-500 p-4">No data available. Run the scraper first.</div>;

  const displayed = sortedData(data);

  return (
    <div>
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
            data={data} 
            filename="historical_reports_tasi" 
            headers={[
              { label: 'Date', key: 'report_date' },
              { label: 'Open', key: 'open_price' },
              { label: 'High', key: 'high_price' },
              { label: 'Low', key: 'low_price' },
              { label: 'Close', key: 'close_price' },
              { label: 'Volume Traded', key: 'volume_traded' },
              { label: 'Value Traded', key: 'value_traded' },
              { label: 'No. of Trades', key: 'no_of_trades' }
            ]}
          />
          <span className="text-green-600 font-medium text-sm">
            {data.length} records · {data[data.length - 1]?.report_date} → {data[0]?.report_date}
          </span>
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
        {displayed.length} rows · Scroll to see more · Click header to sort · Click again to reverse · Click third time to remove
      </p>
    </div>
  );
}
