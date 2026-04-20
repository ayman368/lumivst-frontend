'use client';

import React, { useEffect, useState } from 'react';
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
  previous: number | null;
  volume: number | null;
  open_interest: number | null;
  updated_time: string | null;
}

export default function SofrFuturesPage() {
  const [data, setData] = useState<SofrRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/economic-indicators/sofr-futures/latest`)
      .then(res => res.json())
      .then((json) => {
        setData(Array.isArray(json) ? json : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching SOFR futures:", err);
        setLoading(false);
      });
  }, []);

  const fmt = (val: number | null) => {
    if (val === null || val === undefined) return 'N/A';
    return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const fmtInt = (val: number | null) => {
    if (val === null || val === undefined) return 'N/A';
    return val.toLocaleString('en-US');
  };

  const changeColor = (val: number | null) => {
    if (val === null || val === undefined) return 'text-gray-500';
    if (val > 0) return 'text-green-600';
    if (val < 0) return 'text-red-600';
    return 'text-gray-700';
  };

  const latestDate = data.length > 0 ? data[0].scrape_date : '';

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-slate-50">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          💹 SOFR Futures Prices
        </h1>
        <p className="text-gray-600 mt-2 text-lg">
          Secured Overnight Financing Rate (SOFR) Futures — Source: Barchart
        </p>
        {latestDate && (
          <p className="text-sm text-gray-400 mt-1">Last updated: {latestDate}</p>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          </div>
        ) : data.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center text-gray-500 flex-col gap-4">
            <p className="text-xl">No SOFR futures data available yet.</p>
            <p className="text-sm">Please visit the Admin page to trigger the scraper.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-semibold text-gray-700">Contract</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-700">Latest</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-700">Change</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-700">Open</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-700">High</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-700">Low</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-700">Previous</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-700">Volume</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-700">Open Int</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-700">Time</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr
                    key={row.id}
                    className={`border-b border-gray-100 hover:bg-blue-50/40 transition ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}
                  >
                    <td className="px-4 py-2.5 font-medium text-blue-700">{row.contract}</td>
                    <td className="px-4 py-2.5 text-right text-gray-900 font-medium">{fmt(row.last_price)}</td>
                    <td className={`px-4 py-2.5 text-right font-semibold ${changeColor(row.change)}`}>
                      {row.change !== null && row.change > 0 ? '+' : ''}{fmt(row.change)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-gray-700">{fmt(row.open_price)}</td>
                    <td className="px-4 py-2.5 text-right text-gray-700">{fmt(row.high)}</td>
                    <td className="px-4 py-2.5 text-right text-gray-700">{fmt(row.low)}</td>
                    <td className="px-4 py-2.5 text-right text-gray-700">{fmt(row.previous)}</td>
                    <td className="px-4 py-2.5 text-right text-gray-700">{fmtInt(row.volume)}</td>
                    <td className="px-4 py-2.5 text-right text-gray-700">{fmtInt(row.open_interest)}</td>
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
