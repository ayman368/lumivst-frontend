// ─────────────────────────────────────────────────────────────────────────────
// Tab 8: Report (report/page.tsx)
// ─────────────────────────────────────────────────────────────────────────────
"use client";

import { useReport } from "@/hooks/useValuation";

export default function ReportPage() {
  const { data, error, isLoading } = useReport();

  if (isLoading)
    return <div className="p-8 text-gray-400 text-center">Generating report…</div>;
  if (error || !data)
    return <div className="p-8 text-red-400 text-center">Failed to load report.</div>;

  const { summary_current, summary_top70 } = data;

  const rows = [
    {
      label:   "Index Level",
      current: summary_current.tasi_level?.toLocaleString() ?? "—",
      top70:   summary_top70.tasi_level?.toLocaleString() ?? "—",
    },
    {
      label:   "Weighted EPS",
      current: summary_current.weighted_eps.toFixed(4),
      top70:   summary_top70.weighted_eps.toFixed(4),
    },
    {
      label:   "P/E Ratio",
      current: summary_current.pe ? `${summary_current.pe.toFixed(2)}x` : "—",
      top70:   summary_top70.pe ? `${summary_top70.pe.toFixed(2)}x` : "—",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">TASI Valuation Report</h1>
      <p className="text-xs text-gray-500 mb-8">
        Generated {new Date().toLocaleDateString("en-US", { dateStyle: "long" })}
      </p>

      <div className="bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-800 text-xs uppercase text-gray-400 tracking-wide">
              <th className="text-left px-6 py-4">Metric</th>
              <th className="text-right px-6 py-4">Current Weights</th>
              <th className="text-right px-6 py-4">Top 70% Adjusted</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.label}
                className={`border-t border-gray-800 ${i % 2 === 0 ? "" : "bg-gray-900/50"}`}
              >
                <td className="px-6 py-5 text-gray-400 text-sm">{row.label}</td>
                <td className="px-6 py-5 text-right">
                  <span className="text-white font-bold text-xl">{row.current}</span>
                </td>
                <td className="px-6 py-5 text-right">
                  <span className="text-yellow-300 font-bold text-xl">{row.top70}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={() => window.print()}
        className="mt-8 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium text-sm"
      >
        Download / Print Report
      </button>
    </div>
  );
}
