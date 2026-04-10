"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTableSort } from '../_components/useTableSort';
import { SortableHeader } from '../_components/SortableHeader';
import { ExportDropdown } from '../_components/ExportDropdown';
import FilterBar from '../_components/FilterBar';
import { useFilters } from '../_components/useFilters';
import { API_BASE_URL } from '@/lib/api/config';

type NetShortPosition = {
  id: number;
  report_date: string;
  symbol: string;
  company: string;
  percent_over_outstanding: string;
  percent_over_free_float: string;
  ratio_over_avg_daily: string;
};

const ROW_HEIGHT = 45;
const TABLE_BODY_HEIGHT = ROW_HEIGHT * 20;

export default function NetShortPositionsPage() {
  const [data, setData] = useState<NetShortPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { sortConfigs, handleSort, clearSort, sortedData } = useTableSort<NetShortPosition>();

  const {
    searchValue,
    rangeValues,
    filteredData,
    setSearchValue,
    handleRangeChange,
    handleClearAll,
  } = useFilters<NetShortPosition>(
    data,
    ['symbol', 'company'],
    ['percent_over_outstanding', 'percent_over_free_float', 'ratio_over_avg_daily']
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_URL = API_BASE_URL;
        const response = await axios.get(`${API_URL}/api/market-reports/net-short-positions`);
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

  const displayed = sortedData(filteredData);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Aggregate Sum of Net Short Positions</h2>
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
            filename="net_short_positions"
            headers={[
              { label: 'Symbol', key: 'symbol' },
              { label: 'Company', key: 'company' },
              { label: '% Over Outstanding', key: 'percent_over_outstanding' },
              { label: '% Over Free Float', key: 'percent_over_free_float' },
              { label: 'Ratio Over Avg Daily', key: 'ratio_over_avg_daily' },
            ]}
          />
          <span className="text-green-600 font-medium">Last Update Date: {data[0]?.report_date}</span>
        </div>
      </div>

      <FilterBar
        searchKeys={['symbol', 'company']}
        searchPlaceholder="Search by symbol or company name..."
        rangeFilters={[
          { key: 'percent_over_outstanding', label: '% Over Outstanding' },
          { key: 'percent_over_free_float', label: '% Over Free Float' },
          { key: 'ratio_over_avg_daily', label: 'Ratio Over Avg Daily' },
        ]}
        searchValue={searchValue}
        rangeValues={rangeValues}
        onSearchChange={setSearchValue}
        onRangeChange={handleRangeChange}
        onClearAll={handleClearAll}
      />

      <div className="rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: TABLE_BODY_HEIGHT }}>
          <table className="min-w-full text-sm text-left border-collapse">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs sticky top-0 z-10 shadow-[0_1px_0_0_#e5e7eb]">
              <tr>
                <SortableHeader label="Symbol" sortKey="symbol" sortConfigs={sortConfigs} onSort={handleSort} />
                <SortableHeader label="Company" sortKey="company" sortConfigs={sortConfigs} onSort={handleSort} />
                <SortableHeader label="% of Net Short Positions Over Outstanding Shares" sortKey="percent_over_outstanding" sortConfigs={sortConfigs} onSort={handleSort} className="text-center" />
                <SortableHeader label="% of Net Short Positions Over Free Float" sortKey="percent_over_free_float" sortConfigs={sortConfigs} onSort={handleSort} className="text-center" />
                <SortableHeader label="Ratio of Net Short Positions to Avg Daily Volume (Last 60 Days)" sortKey="ratio_over_avg_daily" sortConfigs={sortConfigs} onSort={handleSort} className="text-center" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {displayed.map((row, idx) => (
                <tr key={row.id} className={`hover:bg-blue-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`} style={{ height: ROW_HEIGHT }}>
                  <td className="px-4 py-3 text-blue-600 font-medium">{row.symbol}</td>
                  <td className="px-4 py-3">{row.company}</td>
                  <td className="px-4 py-3 text-center">{row.percent_over_outstanding}</td>
                  <td className="px-4 py-3 text-center">{row.percent_over_free_float}</td>
                  <td className="px-4 py-3 text-center">{row.ratio_over_avg_daily}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-gray-400 text-xs mt-2">
        {displayed.length} of {data.length} rows · Scroll to see more · Click header to sort
      </p>
    </div>
  );
}