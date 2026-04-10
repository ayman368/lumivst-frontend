"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTableSort } from '../_components/useTableSort';
import { SortableHeader } from '../_components/SortableHeader';
import { ExportDropdown } from '../_components/ExportDropdown';
import FilterBar from '../_components/FilterBar';
import { useFilters } from '../_components/useFilters';
import { API_BASE_URL } from '@/lib/api/config';

type Shareholder = {
  id: number;
  report_date: string;
  company_name: string;
  shareholder_name: string;
  holding_percent_last_day: string;
  holding_percent_previous_day: string;
  change: string;
  managed_by_authorized_trading_day: string;
  managed_by_authorized_previous_day: string;
};

const ROW_HEIGHT = 45;
const TABLE_BODY_HEIGHT = ROW_HEIGHT * 20;

export default function SubstantialShareholdersPage() {
  const [data, setData] = useState<Shareholder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { sortConfigs, handleSort, clearSort, sortedData } = useTableSort<Shareholder>();

  const {
    searchValue,
    rangeValues,
    filteredData,
    setSearchValue,
    handleRangeChange,
    handleClearAll,
  } = useFilters<Shareholder>(
    data,
    ['company_name', 'shareholder_name'],
    ['holding_percent_last_day', 'holding_percent_previous_day', 'change', 'managed_by_authorized_trading_day', 'managed_by_authorized_previous_day']
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_URL = API_BASE_URL;
        const response = await axios.get(`${API_URL}/api/market-reports/substantial-shareholders`);
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
        <h2 className="text-2xl font-bold text-gray-900">Substantial Shareholders</h2>
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
            filename="substantial_shareholders"
            headers={[
              { label: 'Company Name', key: 'company_name' },
              { label: 'Shareholder Name', key: 'shareholder_name' },
              { label: '% Last Trading Day', key: 'holding_percent_last_day' },
              { label: '% Previous Trading Day', key: 'holding_percent_previous_day' },
              { label: 'Change', key: 'change' },
              { label: 'Managed By Authorized (Day)', key: 'managed_by_authorized_trading_day' },
              { label: 'Managed By Authorized (Prev)', key: 'managed_by_authorized_previous_day' },
            ]}
          />
          <span className="text-green-600 font-medium">Last Update Date: {data[0]?.report_date}</span>
        </div>
      </div>

      <FilterBar
        searchKeys={['company_name', 'shareholder_name']}
        searchPlaceholder="Search by company or shareholder name..."
        rangeFilters={[
          { key: 'holding_percent_last_day', label: 'Holding % (Last Day)' },
          { key: 'holding_percent_previous_day', label: 'Holding % (Prev Day)' },
          { key: 'change', label: 'Change %' },
          { key: 'managed_by_authorized_trading_day', label: 'Managed Auth. (Trading Day)' },
          { key: 'managed_by_authorized_previous_day', label: 'Managed Auth. (Prev Day)' },
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
                <SortableHeader label="Company Name" sortKey="company_name" sortConfigs={sortConfigs} onSort={handleSort} />
                <SortableHeader label="Shareholder Name" sortKey="shareholder_name" sortConfigs={sortConfigs} onSort={handleSort} />
                <SortableHeader label="Holding % (Last Trading Day)" sortKey="holding_percent_last_day" sortConfigs={sortConfigs} onSort={handleSort} className="text-center" />
                <SortableHeader label="Holding % (Previous Trading Day)" sortKey="holding_percent_previous_day" sortConfigs={sortConfigs} onSort={handleSort} className="text-center" />
                <SortableHeader label="Change" sortKey="change" sortConfigs={sortConfigs} onSort={handleSort} className="text-center" />
                <SortableHeader label="Managed by Authorized (Trading Day)" sortKey="managed_by_authorized_trading_day" sortConfigs={sortConfigs} onSort={handleSort} className="text-center" />
                <SortableHeader label="Managed by Authorized (Previous Day)" sortKey="managed_by_authorized_previous_day" sortConfigs={sortConfigs} onSort={handleSort} className="text-center" />
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {(() => {
                // Group consecutive rows by company_name to compute rowspans
                const groups: { company: string; rows: typeof displayed }[] = [];
                displayed.forEach((row) => {
                  const last = groups[groups.length - 1];
                  if (last && last.company === row.company_name) {
                    last.rows.push(row);
                  } else {
                    groups.push({ company: row.company_name, rows: [row] });
                  }
                });

                let globalIdx = 0;
                return groups.map((group) =>
                  group.rows.map((row, rowIdx) => {
                    const isFirstInGroup = rowIdx === 0;
                    const rowSpan = group.rows.length;
                    const bgClass = globalIdx++ % 2 === 0 ? 'bg-white' : 'bg-gray-50/50';
                    return (
                      <tr
                        key={row.id}
                        className={`hover:bg-blue-50 transition-colors ${bgClass} border-t border-gray-100`}
                        style={{ height: ROW_HEIGHT }}
                      >
                        {isFirstInGroup && (
                          <td
                            rowSpan={rowSpan}
                            className="px-4 py-3 font-semibold text-gray-900 align-middle border-r border-gray-200 bg-gray-50/80"
                            style={{ verticalAlign: 'middle' }}
                          >
                            {row.company_name}
                          </td>
                        )}
                        <td className="px-4 py-3 font-arabic" dir="rtl">{row.shareholder_name}</td>
                        <td className="px-4 py-3 text-center">{row.holding_percent_last_day}</td>
                        <td className="px-4 py-3 text-center">{row.holding_percent_previous_day}</td>
                        <td className="px-4 py-3 text-center">{row.change}</td>
                        <td className="px-4 py-3 text-center">{row.managed_by_authorized_trading_day}</td>
                        <td className="px-4 py-3 text-center">{row.managed_by_authorized_previous_day}</td>
                      </tr>
                    );
                  })
                );
              })()}
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