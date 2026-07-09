"use client";

import { useTasiMarketWeight } from "@/hooks/useValuation";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import React from "react";

export default function ReportPage() {
  const { data, error, isLoading } = useTasiMarketWeight();

  if (isLoading) return <LoadingSpinner className="h-[50vh]" />;
  if (error || !data) return <div className="p-8 text-red-600 text-center">Failed to load data.</div>;

  const current = data.summary_current;
  const top70 = data.summary_top70;

  const renderVal = (val: number | null | undefined, decimals = 2) => {
    if (val == null) return "—";
    return val.toFixed(decimals);
  };

  return (
    <div className="min-h-screen bg-white text-black p-6 w-full flex justify-center items-start pt-10">
      
      <div className="w-[400px]">
        {/* Table container matching the simple excel look */}
        <table className="w-full text-center border-collapse border border-gray-300 shadow-sm" style={{ fontFamily: "Arial, sans-serif" }}>
          <thead>
            <tr>
              <th className="border border-gray-300 p-2 bg-white w-1/3"></th>
              <th className="border border-gray-300 p-2 bg-white text-[#C00000] font-bold w-1/3 leading-tight">
                Current<br/>weight
              </th>
              <th className="border border-gray-300 p-2 bg-white text-[#C00000] font-bold w-1/3 leading-tight">
                Weight Adj.<br/>top 70%
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2 text-left text-[#C00000] font-bold bg-white">Index Adj.</td>
              <td className="border border-gray-300 p-2 text-[#C00000] font-bold bg-white">
                {renderVal(current.index_adj, 2)}
              </td>
              <td className="border border-gray-300 p-2 text-[#C00000] font-bold bg-white">
                {renderVal(top70.index_adj, 2)}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 text-left text-[#C00000] font-bold bg-white">Earnings</td>
              <td className="border border-gray-300 p-2 text-[#C00000] font-bold bg-white">
                {renderVal(current.weighted_eps, 2)}
              </td>
              <td className="border border-gray-300 p-2 text-[#C00000] font-bold bg-white">
                {renderVal(top70.weighted_eps, 2)}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 text-left text-[#C00000] font-bold bg-white">P/E</td>
              <td className="border border-gray-300 p-2 text-[#C00000] font-bold bg-white">
                {renderVal(current.pe, 2)}
              </td>
              <td className="border border-gray-300 p-2 text-[#C00000] font-bold bg-white">
                {renderVal(top70.pe, 2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
    </div>
  );
}
