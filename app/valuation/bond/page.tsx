"use client";

import { useValuationCopy } from "@/hooks/useValuation";
import React from "react";

export default function ValuationCopyPage() {
  const { data, isLoading, error } = useValuationCopy();

  if (isLoading) return <div className="p-8 text-black text-center">Loading Valuation - Copy...</div>;
  if (error || !data) return <div className="p-8 text-red-500 text-center">Failed to load data.</div>;

  const rowCount = 10;
  const rows = Array.from({ length: rowCount }, (_, i) => i);

  const safeVal = (arr: any[] | undefined, index: number, key: string) => {
    if (!arr || arr.length <= index) return "";
    return arr[index][key];
  };

  return (
    <div className="min-h-screen bg-white text-black p-4 w-full">
      <h1 className="text-2xl font-bold mb-4">Valuation - Copy (Bonds)</h1>
      <div className="overflow-x-auto border border-gray-300 shadow-sm">
        <table className="text-xs border-collapse whitespace-nowrap">
          <thead>
            {/* Header row with labels */}
            <tr className="bg-white">
              <th className="border p-1" colSpan={2}>Bond</th>
              <th className="p-1"></th>
              <th className="border bg-[#70AD47] text-white p-1 text-center" colSpan={2}>DIVIDEND</th>
              <th className="p-1"></th>
              <th className="border bg-[#70AD47] text-white p-1 text-center" colSpan={2}>EARNING</th>
              <th className="p-1"></th>
              <th className="border bg-[#70AD47] text-white p-1 text-center" colSpan={2}>BB</th>
              <th className="p-1"></th>
              <th className="border bg-[#70AD47] text-white p-1 text-center" colSpan={2}>B</th>
              <th className="p-1"></th>
              <th className="border bg-[#70AD47] text-white p-1 text-center" colSpan={2}>BBB</th>
              <th className="p-1"></th>
              <th className="border bg-[#70AD47] text-white p-1 text-center" colSpan={2}>A</th>
              <th className="p-1"></th>
              <th className="border bg-[#70AD47] text-white p-1 text-center" colSpan={2}>SP 500</th>
              <th className="p-1"></th>
              <th className="border bg-[#70AD47] text-white p-1 text-center" colSpan={2}>UNRATE</th>
              <th className="p-1"></th>
              <th className="border bg-[#70AD47] text-white p-1 text-center" colSpan={2}>PAYEMS</th>
              <th className="p-1"></th>
              <th className="border bg-[#70AD47] text-white p-1 text-center" colSpan={2}>IC4WSA</th>
              <th className="p-1"></th>
              <th className="border bg-[#70AD47] text-white p-1 text-center" colSpan={2}>10Y-2Y</th>
              <th className="p-1"></th>
              <th className="border bg-[#70AD47] text-white p-1 text-center" colSpan={2}>A OPTION ADJ</th>
              <th className="p-1"></th>
              <th className="border bg-[#70AD47] text-white p-1 text-center" colSpan={2}>BBB OPTION ADJ</th>
              <th className="p-1"></th>
              <th className="border bg-[#70AD47] text-white p-1 text-center" colSpan={2}>Fed int Rate</th>
            </tr>
            {/* Column sub-headers */}
            <tr className="bg-[#f0f0f0] font-semibold text-center border-b">
              <td className="border p-1">Bond</td>
              <td className="border p-1">Yield</td>
              <td className="p-1"></td>
              {Array.from({ length: 14 }).map((_, i) => (
                <React.Fragment key={i}>
                  <td className="border p-1">Date</td>
                  <td className="border p-1">Value</td>
                  <td className="p-1"></td>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((i) => (
              <tr key={i} className="hover:bg-gray-100 text-center">
                {/* Fixed stats column on the left */}
                <td className="border p-1 text-left">{i === 0 ? "A" : i === 1 ? "BBB" : i === 2 ? "BB" : i === 3 ? "B" : ""}</td>
                <td className="border p-1">{i === 0 ? safeVal(data.a_yield, 0, 'value') : i === 1 ? safeVal(data.bbb_yield, 0, 'value') : i === 2 ? safeVal(data.bb_yield, 0, 'value') : i === 3 ? safeVal(data.b_yield, 0, 'value') : ""}</td>
                
                <td className="p-1"></td>
                
                {/* DIVIDEND */}
                <td className="border p-1 text-green-700">{safeVal(data.dividend, i, 'date')}</td>
                <td className="border p-1">{safeVal(data.dividend, i, 'value')}</td>
                <td className="p-1"></td>

                {/* EARNING */}
                <td className="border p-1 text-green-700">{safeVal(data.sp_ey, i, 'date')}</td>
                <td className="border p-1">{safeVal(data.sp_ey, i, 'value')}</td>
                <td className="p-1"></td>

                {/* BB */}
                <td className="border p-1 text-green-700">{safeVal(data.bb_yield, i, 'date')}</td>
                <td className="border p-1">{safeVal(data.bb_yield, i, 'value')}</td>
                <td className="p-1"></td>
                
                {/* B */}
                <td className="border p-1 text-green-700">{safeVal(data.b_yield, i, 'date')}</td>
                <td className="border p-1">{safeVal(data.b_yield, i, 'value')}</td>
                <td className="p-1"></td>
                
                {/* BBB */}
                <td className="border p-1 text-green-700">{safeVal(data.bbb_yield, i, 'date')}</td>
                <td className="border p-1">{safeVal(data.bbb_yield, i, 'value')}</td>
                <td className="p-1"></td>
                
                {/* A */}
                <td className="border p-1 text-green-700">{safeVal(data.a_yield, i, 'date')}</td>
                <td className="border p-1">{safeVal(data.a_yield, i, 'value')}</td>
                <td className="p-1"></td>

                {/* SP500 */}
                <td className="border p-1 text-green-700">{safeVal(data.sp500_price, i, 'date')}</td>
                <td className="border p-1">{safeVal(data.sp500_price, i, 'value')}</td>
                <td className="p-1"></td>
                
                {/* UNRATE */}
                <td className="border p-1 text-green-700">{safeVal(data.unemployment, i, 'date')}</td>
                <td className="border p-1">{safeVal(data.unemployment, i, 'value')}</td>
                <td className="p-1"></td>

                {/* PAYEMS */}
                <td className="border p-1 text-green-700">{safeVal(data.nonfarm, i, 'date')}</td>
                <td className="border p-1">{safeVal(data.nonfarm, i, 'value')}</td>
                <td className="p-1"></td>

                {/* IC4WSA */}
                <td className="border p-1 text-green-700">{safeVal(data.claims, i, 'date')}</td>
                <td className="border p-1">{safeVal(data.claims, i, 'value')}</td>
                <td className="p-1"></td>

                {/* 10Y-2Y Spread */}
                <td className="border p-1 text-green-700">{safeVal(data.spread, i, 'date')}</td>
                <td className="border p-1">{safeVal(data.spread, i, 'value')}</td>
                <td className="p-1"></td>

                {/* A OPTION ADJ */}
                <td className="border p-1 text-green-700">{safeVal(data.a_yield, i, 'date')}</td>
                <td className="border p-1">{safeVal(data.a_yield, i, 'value')}</td>
                <td className="p-1"></td>

                {/* BBB OPTION ADJ */}
                <td className="border p-1 text-green-700">{safeVal(data.bbb_yield, i, 'date')}</td>
                <td className="border p-1">{safeVal(data.bbb_yield, i, 'value')}</td>
                <td className="p-1"></td>

                {/* Fed int Rate */}
                <td className="border p-1 text-green-700">{safeVal(data.fed_rate, i, 'date')}</td>
                <td className="border p-1">{safeVal(data.fed_rate, i, 'value')}</td>
                <td className="p-1"></td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
