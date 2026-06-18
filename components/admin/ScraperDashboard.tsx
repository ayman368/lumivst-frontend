"use client";

import { useSystemStats } from "@/hooks/useValuation";
import { triggerScraper } from "@/lib/api/valuation";
import { useState } from "react";

interface ScraperStatus {
  name:     string;
  success:  boolean;
  detail:   string;
  ran_at:   string;
}

const SCRAPERS = [
  { key: "fred",         label: "FRED Indicators",         mode: "incremental" },
  { key: "sp500_price",  label: "S&P 500 Price",           mode: "incremental" },
  { key: "sp500_pe",     label: "S&P 500 P/E",             mode: null },
  { key: "sp500_ey",     label: "S&P 500 Earnings Yield",  mode: null },
  { key: "treasury_gov", label: "Treasury.gov Yields",     mode: "incremental" },
  { key: "tasi",         label: "TASI Components",         mode: null },
  { key: "daily_all",    label: "▶ Run All Daily",         mode: null },
  { key: "full_backfill",label: "⚠ Full Historical Backfill", mode: null },
];

function TableStatRow({ label, data }: { label: string; data: Record<string, any> }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0 text-sm">
      <span className="text-gray-400">{label}</span>
      <div className="text-right text-xs">
        {data.row_count !== undefined && (
          <span className="text-white mr-3">{data.row_count?.toLocaleString()} rows</span>
        )}
        {data.active !== undefined && (
          <span className="text-green-300 mr-3">{data.active} active</span>
        )}
        {data.latest_date && (
          <span className="text-gray-400">latest: {data.latest_date}</span>
        )}
      </div>
    </div>
  );
}

export default function ScraperDashboard() {
  const { data, error, isLoading, refresh } = useSystemStats();
  const [running, setRunning] = useState<string | null>(null);
  const [msg, setMsg]         = useState("");

  const run = async (scraper: string, mode?: string | null) => {
    setRunning(scraper);
    setMsg("");
    try {
      await triggerScraper(scraper, mode ? { mode } : undefined);
      setMsg(`▶ ${scraper} started in background. Refresh in a moment.`);
      setTimeout(() => refresh(), 5000);
    } catch (e: any) {
      setMsg(`❌ ${e.message}`);
    } finally {
      setRunning(null);
    }
  };

  if (isLoading)
    return <div className="text-gray-400 text-sm p-4">Loading system stats…</div>;

  const stats: Record<string, any> = (data as any)?.table_stats ?? {};
  const scraperStatuses: ScraperStatus[] = (data as any)?.scraper_status?.scrapers ?? [];

  return (
    <div className="space-y-6">

      {/* Data freshness */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-4">Database Status</h2>
        {Object.entries(stats).map(([table, d]) => (
          <TableStatRow key={table} label={table.replace(/_/g, " ")} data={d as Record<string, any>} />
        ))}
        <button
          onClick={() => refresh()}
          className="mt-3 text-xs text-blue-400 hover:text-blue-300"
        >
          Refresh stats
        </button>
      </div>

      {/* Run scrapers */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-4">Run Scrapers</h2>
        {msg && <p className="text-xs mb-3 text-gray-300">{msg}</p>}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SCRAPERS.map((s) => (
            <button
              key={s.key}
              onClick={() => run(s.key, s.mode)}
              disabled={running !== null}
              className={`text-xs px-3 py-2 rounded-lg border font-medium transition-colors ${
                s.key === "full_backfill"
                  ? "bg-red-900 border-red-700 text-red-200 hover:bg-red-800"
                  : s.key === "daily_all"
                  ? "bg-green-900 border-green-700 text-green-200 hover:bg-green-800"
                  : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {running === s.key ? "Running…" : s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scraper status */}
      {scraperStatuses.length > 0 && (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">Last Run Status</h2>
          <div className="space-y-1">
            {scraperStatuses.map((s) => (
              <div
                key={s.name}
                className="flex items-center justify-between text-xs py-1.5 border-b border-gray-800 last:border-0"
              >
                <div className="flex items-center gap-2">
                  <span>{s.success ? "✅" : "❌"}</span>
                  <span className="text-gray-300">{s.name}</span>
                </div>
                <span className="text-gray-500">
                  {new Date(s.ran_at).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
