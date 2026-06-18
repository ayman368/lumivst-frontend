"use client";

import { useState } from "react";
import { useTasiMarketWeight } from "@/hooks/useValuation";
import type { TasiComponentRow } from "@/types/valuation";

export default function MarketWeightPage() {
  const { data, error, isLoading, refresh } = useTasiMarketWeight();
  const [showTop70Only, setShowTop70Only] = useState(false);

  if (isLoading) return <div className="p-8 text-black text-center">Loading TASI components…</div>;
  if (error || !data) return <div className="p-8 text-red-600 text-center">Failed to load TASI data.</div>;

  const { components, summary_current, summary_top70 } = data;
  const visible = showTop70Only ? components.filter(c => c.is_in_top70) : components;

  return (
    <div className="min-h-screen bg-white text-black p-6 w-full flex flex-col items-center">
      <div className="w-full max-w-6xl">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-[#4472C4]">Market Weight (TASI)</h1>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input 
                type="checkbox" 
                checked={showTop70Only} 
                onChange={(e) => setShowTop70Only(e.target.checked)} 
              />
              Show Top 70 only
            </label>
            <button onClick={() => refresh()} className="bg-gray-200 border border-black px-4 py-1 text-sm font-bold">Refresh</button>
          </div>
        </div>

        {/* Top Summary Info */}
        <div className="grid grid-cols-2 gap-8 mb-6">
          <table className="w-full text-sm border-collapse border border-black text-center font-bold" dir="ltr">
            <tbody>
              <tr>
                <td className="border border-black px-2 py-1 bg-gray-200" colSpan={2}>Full Index Calculation</td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1 bg-[#D9E1F2]">Index Level</td>
                <td className="border border-black px-2 py-1 text-blue-700">{summary_current.tasi_level?.toLocaleString()}</td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1 bg-[#D9E1F2]">Weighted EPS</td>
                <td className="border border-black px-2 py-1">{summary_current.weighted_eps.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1 bg-[#D9E1F2]">P/E Ratio</td>
                <td className="border border-black px-2 py-1 text-red-600">{summary_current.pe?.toFixed(2)}x</td>
              </tr>
            </tbody>
          </table>

          <table className="w-full text-sm border-collapse border border-black text-center font-bold" dir="ltr">
            <tbody>
              <tr>
                <td className="border border-black px-2 py-1 bg-gray-200" colSpan={2}>Top 70 Companies Calculation</td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1 bg-[#D9E1F2]">Index Level</td>
                <td className="border border-black px-2 py-1 text-blue-700">{summary_top70.tasi_level?.toLocaleString()}</td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1 bg-[#D9E1F2]">Weighted EPS (Top 70)</td>
                <td className="border border-black px-2 py-1">{summary_top70.weighted_eps.toFixed(2)}</td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1 bg-[#D9E1F2]">P/E Ratio (Top 70)</td>
                <td className="border border-black px-2 py-1 text-red-600">{summary_top70.pe?.toFixed(2)}x</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Components Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse border border-black text-center font-bold" dir="ltr">
            <thead>
              <tr className="bg-[#4472C4] text-white">
                <th className="border border-black px-2 py-1">Symbol</th>
                <th className="border border-black px-2 py-1">Company</th>
                <th className="border border-black px-2 py-1">Current Price</th>
                <th className="border border-black px-2 py-1">Weight (%)</th>
                <th className="border border-black px-2 py-1">Adj Weight (%)</th>
                <th className="border border-black px-2 py-1">EPS</th>
                <th className="border border-black px-2 py-1">P/E Ratio</th>
                <th className="border border-black px-2 py-1">Weighted EPS</th>
                <th className="border border-black px-2 py-1">Wtd EPS Top70</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((c: TasiComponentRow) => (
                <tr key={c.symbol} className={c.is_in_top70 ? 'bg-[#E2EFDA]' : ''}>
                  <td className="border border-black px-2 py-1">{c.symbol}</td>
                  <td className="border border-black px-2 py-1">{c.company_name}</td>
                  <td className="border border-black px-2 py-1">{c.current_price?.toFixed(2)}</td>
                  <td className="border border-black px-2 py-1">{(c.weight_in_index || 0).toFixed(4)}%</td>
                  <td className="border border-black px-2 py-1">{c.weight_adjusted?.toFixed(4) ?? '—'}%</td>
                  <td className="border border-black px-2 py-1">{c.eps !== null ? c.eps.toFixed(2) : '—'}</td>
                  <td className="border border-black px-2 py-1 text-purple-700">{c.pe_ratio ? `${c.pe_ratio.toFixed(2)}` : '—'}</td>
                  <td className="border border-black px-2 py-1 text-blue-700">{c.weighted_eps?.toFixed(4)}</td>
                  <td className="border border-black px-2 py-1 text-green-700">{c.weighted_eps_top70?.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
