"use client";

import { useHistoricalPE } from "@/hooks/useValuation";
import type { PeHistoryRow } from "@/types/valuation";

export default function HistoricalPEPage() {
  const { data, error, isLoading } = useHistoricalPE(10);

  if (isLoading) return <div className="p-8 text-black text-center">Loading historical P/E data…</div>;
  if (error || !data) return <div className="p-8 text-red-600 text-center">Failed to load data.</div>;

  return (
    <div className="min-h-screen bg-white text-black p-6 w-full flex flex-col items-center">
      <div className="w-full max-w-5xl">
        <h1 className="text-xl font-bold text-[#4472C4] mb-4">SP-PE (Historical P/E Analysis)</h1>
        
        {/* P/E Stats & Target Prices */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <table className="w-full text-sm border-collapse border border-black text-center font-bold" dir="ltr">
              <tbody>
                <tr>
                  <td className="border border-black px-2 py-1 bg-gray-200">Min</td>
                  <td className="border border-black px-2 py-1 text-red-600">{data.pe_stats.min.toFixed(2)}x</td>
                </tr>
                <tr>
                  <td className="border border-black px-2 py-1 bg-gray-200">Median</td>
                  <td className="border border-black px-2 py-1 text-yellow-600">{data.pe_stats.median.toFixed(2)}x</td>
                </tr>
                <tr>
                  <td className="border border-black px-2 py-1 bg-gray-200">Average</td>
                  <td className="border border-black px-2 py-1 text-blue-600">{data.pe_stats.average.toFixed(2)}x</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <table className="w-full text-sm border-collapse border border-black text-center font-bold" dir="ltr">
              <tbody>
                <tr>
                  <td className="border border-black px-2 py-1 bg-gray-200">A-Bond Yield</td>
                  <td className="border border-black px-2 py-1">{data.a_yield_pct.toFixed(2)}%</td>
                </tr>
                <tr>
                  <td className="border border-black px-2 py-1 bg-gray-200">Required EY</td>
                  <td className="border border-black px-2 py-1">{data.required_ey_pct.toFixed(2)}%</td>
                </tr>
                <tr>
                  <td className="border border-black px-2 py-1 bg-gray-200">Target P/E</td>
                  <td className="border border-black px-2 py-1 text-[#C00000]">{data.target_pe?.toFixed(2)}x</td>
                </tr>
                <tr>
                  <td className="border border-black px-2 py-1 bg-gray-200">Target Price (2027F)</td>
                  <td className="border border-black px-2 py-1 text-[#00B050]">{data.target_price ? `$${data.target_price.toLocaleString()}` : '—'}</td>
                </tr>
                <tr>
                  <td className="border border-black px-2 py-1 bg-gray-200">Target P/E (Adj)</td>
                  <td className="border border-black px-2 py-1 text-[#C00000]">{data.target_pe_adj?.toFixed(2)}x</td>
                </tr>
                <tr>
                  <td className="border border-black px-2 py-1 bg-gray-200">Target Price Adj (2027F)</td>
                  <td className="border border-black px-2 py-1 text-[#00B050]">{data.target_price_adj ? `$${data.target_price_adj.toLocaleString()}` : '—'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Historical PE Table */}
        <h2 className="font-bold text-lg mb-2">Historical P/E Ratios</h2>
        <table className="w-full text-sm border-collapse border border-black text-center font-bold mb-8" dir="ltr">
          <thead>
            <tr className="bg-[#4472C4] text-white">
              <th className="border border-black px-2 py-1">Year</th>
              <th className="border border-black px-2 py-1">P/E Ratio</th>
              <th className="border border-black px-2 py-1">Earnings Yield</th>
              <th className="border border-black px-2 py-1">EY / A</th>
              <th className="border border-black px-2 py-1">EY / A (Adj)</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row) => (
              <tr key={row.label} className={row.label === 'TTM' ? 'bg-[#D9E1F2]' : row.is_estimate ? 'italic text-gray-600' : ''}>
                <td className="border border-black px-2 py-1">{row.label}</td>
                <td className="border border-black px-2 py-1 text-[#C00000]">{row.pe.toFixed(2)}</td>
                <td className="border border-black px-2 py-1">{row.ey_pct.toFixed(2)}%</td>
                <td className="border border-black px-2 py-1 text-blue-800">{row.ey_a_ratio.toFixed(2)}</td>
                <td className="border border-black px-2 py-1 text-blue-800">{row.ey_a_ratio_adj.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Deviation Table */}
        {data.deviations && (
          <>
            <h2 className="font-bold text-lg mb-2">P/E v Historical</h2>
            <table className="w-full text-sm border-collapse border border-black text-center font-bold" dir="ltr">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-black px-2 py-1">Metric</th>
                  <th className="border border-black px-2 py-1">vs TTM</th>
                  <th className="border border-black px-2 py-1">vs 2026F</th>
                  <th className="border border-black px-2 py-1">vs 2027F</th>
                  <th className="border border-black px-2 py-1">vs Target P/E</th>
                  <th className="border border-black px-2 py-1">vs Target Adj</th>
                </tr>
              </thead>
              <tbody>
                {['min', 'median', 'average'].map(stat => (
                  <tr key={stat}>
                    <td className="border border-black px-2 py-1 capitalize bg-gray-100">{stat}</td>
                    {['ttm', 'f2026', 'f2027', 'target', 'target_adj'].map(col => {
                      const val = (data.deviations as any)[stat][col];
                      return (
                        <td key={col} className={`border border-black px-2 py-1 ${val > 0 ? 'text-[#C00000]' : 'text-[#00B050]'}`}>
                          {val != null ? `${(val * 100).toFixed(1)}%` : '—'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}
