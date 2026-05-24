"use client";

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/axiosClient';
import { useTableSort } from '../_components/useTableSort';
import { SortableHeader } from '../_components/SortableHeader';
import { ExportDropdown } from '../_components/ExportDropdown';
import FilterBar from '../_components/FilterBar';
import { useFilters } from '../_components/useFilters';
type SBLPosition = {
  id: number;
  report_date: string;
  symbol: string;
  company: string;
  total_issued_shares: string;
  lent_asset_quantity: string;
  percent_of_lent_asset: string;
};

const ROW_HEIGHT = 45;
const TABLE_BODY_HEIGHT = ROW_HEIGHT * 20;

export default function SBLPositionsPage() {
  const [data, setData] = useState<SBLPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { sortConfigs, handleSort, clearSort, sortedData } = useTableSort<SBLPosition>();

  const {
    searchValue,
    rangeValues,
    filteredData,
    setSearchValue,
    handleRangeChange,
    handleClearAll,
  } = useFilters<SBLPosition>(
    data,
    ['symbol', 'company'],
    ['total_issued_shares', 'lent_asset_quantity', 'percent_of_lent_asset']
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.get('/api/market-reports/sbl-positions');
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
        <h2 className="text-2xl font-bold text-gray-900">SBL Positions</h2>
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
            filename="sbl_positions"
            headers={[
              { label: 'Symbol', key: 'symbol' },
              { label: 'Company', key: 'company' },
              { label: 'Total Issued Shares Quantity', key: 'total_issued_shares' },
              { label: 'Lent Asset Quantity', key: 'lent_asset_quantity' },
              { label: '% of Lent Asset', key: 'percent_of_lent_asset' },
            ]}
          />
          <span className="text-green-600 font-medium">Last Update Date: {data[0]?.report_date}</span>
        </div>
      </div>

      <FilterBar
        searchKeys={['symbol', 'company']}
        searchPlaceholder="Search by symbol or company name..."
        rangeFilters={[
          { key: 'total_issued_shares', label: 'Total Issued Shares' },
          { key: 'lent_asset_quantity', label: 'Lent Asset Quantity' },
          { key: 'percent_of_lent_asset', label: '% of Lent Asset' },
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
                <SortableHeader label="Total Issued Shares Quantity" sortKey="total_issued_shares" sortConfigs={sortConfigs} onSort={handleSort} className="text-center" />
                <SortableHeader label="Lent Asset Quantity" sortKey="lent_asset_quantity" sortConfigs={sortConfigs} onSort={handleSort} className="text-center" />
                <SortableHeader label="% of Lent Asset" sortKey="percent_of_lent_asset" sortConfigs={sortConfigs} onSort={handleSort} className="text-center" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {displayed.map((row, idx) => (
                <tr key={row.id} className={`hover:bg-blue-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`} style={{ height: ROW_HEIGHT }}>
                  <td className="px-4 py-3 text-blue-600 font-medium">{row.symbol}</td>
                  <td className="px-4 py-3">{row.company}</td>
                  <td className="px-4 py-3 text-center">{row.total_issued_shares}</td>
                  <td className="px-4 py-3 text-center">{row.lent_asset_quantity}</td>
                  <td className="px-4 py-3 text-center">{row.percent_of_lent_asset}</td>
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