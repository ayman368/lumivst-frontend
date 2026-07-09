"use client";

import { useState } from "react";
import { useTasiMarketWeight } from "@/hooks/useValuation";
import type { TasiComponentRow } from "@/types/valuation";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function MarketWeightPage() {
  const { data, error, isLoading, refresh } = useTasiMarketWeight();
  const [showTop70Only, setShowTop70Only] = useState(false);

  if (isLoading) return <LoadingSpinner className="h-[50vh]" />;
  if (error || !data) return <div className="p-8 text-red-600 text-center">Failed to load TASI data.</div>;

  const { components, summary_current, summary_top70 } = data;
  const visible = showTop70Only ? components.filter(c => c.is_in_top70) : components;

  const fmt = (v: number | null | undefined, d = 2) => v != null ? v.toFixed(d) : "—";
  const fmtPct = (v: number | null | undefined, d = 2) => v != null ? `${v.toFixed(d)}%` : "—";

  // Color for EPS: red if negative, green if positive, black if zero
  const epsColor = (eps: number | null) => {
    if (eps == null) return "";
    if (eps < 0) return "text-red-600";
    if (eps > 0) return "text-green-700";
    return "";
  };

  // Color for weighted EPS: blue brackets for negative
  const wtdEpsDisplay = (v: number | null | undefined) => {
    if (v == null) return "—";
    if (v < 0) return <span className="text-blue-700">[{Math.abs(v).toFixed(2)}]</span>;
    return v.toFixed(2);
  };

  const maxCapPct = 10.22; // Display value for header

  return (
    <div className="min-h-screen bg-white text-black p-4 w-full flex flex-col items-center" style={{ fontFamily: "Arial, sans-serif", fontSize: "11px" }}>
      <div className="w-full max-w-[1200px]">
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-lg font-bold text-[#4472C4]">Market Weight (TASI)</h1>
          <div className="flex gap-4 items-center">
            <label className="flex items-center gap-2 text-xs cursor-pointer">
              <input 
                type="checkbox" 
                checked={showTop70Only} 
                onChange={(e) => setShowTop70Only(e.target.checked)} 
              />
              Show Top 70 only
            </label>
            <button onClick={() => refresh()} className="bg-gray-200 border border-black px-3 py-1 text-xs font-bold">Refresh</button>
          </div>
        </div>

        {/* Summary Boxes */}
        <div className="grid grid-cols-2 gap-6 mb-4">
          <table className="w-full text-xs border-collapse border border-black text-center font-bold" dir="ltr">
            <tbody>
              <tr>
                <td className="border border-black px-2 py-1 bg-gray-200" colSpan={2}>Full Index Calculation</td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1 bg-[#D9E1F2]">Index Adj.</td>
                <td className="border border-black px-2 py-1 text-blue-700">{fmt(summary_current.index_adj)}</td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1 bg-[#D9E1F2]">Weighted EPS</td>
                <td className="border border-black px-2 py-1">{fmt(summary_current.weighted_eps)}</td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1 bg-[#D9E1F2]">P/E Ratio</td>
                <td className="border border-black px-2 py-1 text-red-600">{summary_current.pe ? `${fmt(summary_current.pe)}` : "×"}</td>
              </tr>
            </tbody>
          </table>

          <table className="w-full text-xs border-collapse border border-black text-center font-bold" dir="ltr">
            <tbody>
              <tr>
                <td className="border border-black px-2 py-1 bg-gray-200" colSpan={2}>Top 70 Companies Calculation</td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1 bg-[#D9E1F2]">Index Adj.</td>
                <td className="border border-black px-2 py-1 text-blue-700">{fmt(summary_top70.index_adj)}</td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1 bg-[#D9E1F2]">Weighted EPS (Top 70)</td>
                <td className="border border-black px-2 py-1">{fmt(summary_top70.weighted_eps)}</td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1 bg-[#D9E1F2]">P/E Ratio (Top 70)</td>
                <td className="border border-black px-2 py-1 text-red-600">{summary_top70.pe ? `${fmt(summary_top70.pe)}` : "×"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Main Components Table - matching Excel exactly */}
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] border-collapse text-center font-semibold" dir="ltr">
            {/* Sub-header row showing cap and totals */}
            <thead>
              <tr>
                <th colSpan={3} className="border border-black px-1 py-1 bg-white"></th>
                <th className="border border-black px-1 py-1 bg-white"></th>
                <th className="border border-black px-1 py-1 bg-[#FFFF00] text-[#C00000] font-bold">{maxCapPct}%</th>
                <th colSpan={2} className="border border-black px-1 py-1 bg-white"></th>
                <th className="border border-black px-1 py-1 bg-[#FFFF00] text-[#C00000] font-bold">{fmt(summary_current.weighted_eps)}</th>
                {/* Top 70 section header */}
                <th className="border border-black px-1 py-1 bg-[#FFFF00] text-black font-bold">70</th>
                <th className="border border-black px-1 py-1 bg-[#FFFF00] text-black font-bold">100%</th>
              </tr>
              <tr className="bg-[#4472C4] text-white">
                <th className="border border-black px-1 py-1">Sym</th>
                <th className="border border-black px-1 py-1">Sht Name</th>
                <th className="border border-black px-1 py-1">Weight in<br/>Index</th>
                <th className="border border-black px-1 py-1">Weight<br/>Adj.Max.</th>
                <th className="border border-black px-1 py-1">Weight Adj.</th>
                <th className="border border-black px-1 py-1">EPS</th>
                <th className="border border-black px-1 py-1">EPS<br/>Weighted</th>
                {/* Top 70 columns */}
                <th className="border border-black px-1 py-1 bg-[#FFFF00] text-black">Top 70 %</th>
                <th className="border border-black px-1 py-1 bg-[#FFFF00] text-black">Top 70 %<br/>Adj.</th>
                <th className="border border-black px-1 py-1 bg-[#FFFF00] text-black">EPS<br/>Weighted</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((c: TasiComponentRow) => {
                const isNeg = c.eps != null && c.eps < 0;
                return (
                  <tr key={c.symbol} className={c.is_in_top70 ? "bg-white" : "bg-white"}>
                    <td className="border border-black px-1 py-0.5">{c.symbol}</td>
                    <td className="border border-black px-1 py-0.5 text-left whitespace-nowrap">{c.company_name}</td>
                    <td className="border border-black px-1 py-0.5">{fmtPct(c.weight_in_index)}</td>
                    <td className="border border-black px-1 py-0.5">{fmtPct(c.weight_adjusted)}</td>
                    <td className="border border-black px-1 py-0.5">{fmtPct(c.weight_norm)}</td>
                    <td className={`border border-black px-1 py-0.5 ${epsColor(c.eps)}`}>
                      {c.eps != null ? (c.eps < 0 ? `(${Math.abs(c.eps).toFixed(2)})` : c.eps.toFixed(2)) : "—"}
                    </td>
                    <td className="border border-black px-1 py-0.5">{wtdEpsDisplay(c.weighted_eps)}</td>
                    {/* Top 70 columns */}
                    <td className={`border border-black px-1 py-0.5 bg-[#FFFFCC] ${c.is_in_top70 ? "" : "text-gray-400"}`}>
                      {c.is_in_top70 ? fmtPct(c.top70_raw) : "0%"}
                    </td>
                    <td className={`border border-black px-1 py-0.5 bg-[#FFFFCC] ${c.is_in_top70 ? "" : "text-gray-400"}`}>
                      {c.is_in_top70 ? fmtPct(c.top70_adj) : "0%"}
                    </td>
                    <td className={`border border-black px-1 py-0.5 bg-[#FFFFCC]`}>
                      {wtdEpsDisplay(c.weighted_eps_top70)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
