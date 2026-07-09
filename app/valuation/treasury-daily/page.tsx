// ─────────────────────────────────────────────────────────────────────────────
// Tab 2: TRD — Daily Treasury Yields (treasury-daily/page.tsx)
// ─────────────────────────────────────────────────────────────────────────────
"use client";

import { useState } from "react";
import { useTreasuryDaily } from "@/hooks/useValuation";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const COLUMNS = [
  { key: "month_1", label: "1M" },
  { key: "month_3", label: "3M" },
  { key: "month_6", label: "6M" },
  { key: "year_1",  label: "1Y" },
  { key: "year_2",  label: "2Y" },
  { key: "year_3",  label: "3Y" },
  { key: "year_5",  label: "5Y" },
  { key: "year_7",  label: "7Y" },
  { key: "year_10", label: "10Y" },
  { key: "year_20", label: "20Y" },
  { key: "year_30", label: "30Y" },
] as const;

// Colour cells by yield level — higher = warmer
function yieldColor(v: number | null): string {
  if (v === null) return "text-gray-600";
  if (v >= 5.5) return "text-orange-400";
  if (v >= 5.0) return "text-yellow-300";
  if (v >= 4.0) return "text-green-300";
  if (v >= 3.0) return "text-blue-300";
  return "text-gray-300";
}

export function TreasuryDailyPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useTreasuryDaily({ page, page_size: 30 });

  if (isLoading) return <LoadingSpinner className="h-[50vh]" />;
  if (error || !data) return <div className="p-8 text-red-400 text-center">Failed to load.</div>;

  return (
    <div className="min-h-screen bg-white text-black p-6 w-full">
      <h1 className="text-2xl font-bold mb-1">Daily Treasury Yield Data (TRD)</h1>
      <p className="text-sm text-gray-600 mb-5">
        {data.total.toLocaleString()} trading days in database
      </p>

      <div className="overflow-x-auto border border-gray-300 shadow-sm">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-[#70AD47] text-white font-semibold border-b border-gray-300">
              <th className="text-left px-3 py-2 border-r border-gray-300 sticky left-0 bg-[#70AD47] z-10">Date</th>
              {COLUMNS.map((c) => (
                <th key={c.key} className="text-right px-3 py-2 border-r border-gray-300">{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.data.map((row, i) => (
              <tr
                key={row.date}
                className={`border-b border-gray-200 ${i % 2 === 0 ? "bg-white" : "bg-[#f9f9f9]"}`}
              >
                <td className="px-3 py-1 border-r border-gray-300 text-black sticky left-0 bg-inherit">{row.date}</td>
                {COLUMNS.map((c) => {
                  const v = row[c.key as keyof typeof row] as number | null;
                  return (
                    <td key={c.key} className={`px-3 py-1 text-right tabular-nums border-r border-gray-300`}>
                      {v !== null ? v.toFixed(2) : "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
        <span>Page {data.page} of {data.pages}</span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 bg-white hover:bg-gray-100 rounded border border-gray-300 disabled:opacity-40"
          >
            ← Prev
          </button>
          <button
            onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
            disabled={page === data.pages}
            className="px-3 py-1 bg-white hover:bg-gray-100 rounded border border-gray-300 disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

export default TreasuryDailyPage;
