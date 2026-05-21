"use client";

import { useState, useTransition, useEffect } from "react";
import type { MonthlyTrackerResponse } from "@/types/wallet";
import { getMonthlyTracker } from "@/lib/api/wallet";
import { useToast } from "@/components/ui/Toast";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Cell
} from "recharts";

const fmt = (n: number | null | undefined, dec = 2) =>
  n == null ? "-" : n.toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
const pct = (n: number | null | undefined) =>
  n == null ? "-" : `${(n * 100).toFixed(2)}%`;

const chartGridStroke = "#e2e8f0";
const chartTickFill = "#64748b";
const chartTooltipStyle = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  color: "#0f172a",
  fontSize: "12px",
  boxShadow: "0 4px 12px rgba(15,23,42,0.08)",
};

export default function MonthlyTrackerPage() {
  const { toast } = useToast();
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [result, setResult] = useState<MonthlyTrackerResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    refreshStats();
  }, [year]);

  const refreshStats = async () => {
    setError(null);
    try {
      const res = await getMonthlyTracker(year);
      setResult(res);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to load";
      setError(msg);
      toast(msg, "error");
    }
  };

  const chartData = result?.rows.map(r => {
    const netReturn = r.total_gain - r.total_loss;
    const returnPct = r.investment > 0 ? netReturn / r.investment : 0;
    return {
      name: r.label,
      returnPct: parseFloat((returnPct * 100).toFixed(2)),
      trades: r.total_trades,
    };
  }) || [];

  const totalInvst = result?.rows.reduce((s, r) => s + r.investment, 0) || 0;
  const totalNetReturn = result?.rows.reduce((s, r) => s + r.total_gain - r.total_loss, 0) || 0;
  const portfolioReturnPct = totalInvst > 0 ? parseFloat(((totalNetReturn / totalInvst) * 100).toFixed(2)) : 0;
  const chartDataWithPortfolio = [
    ...chartData,
    {
      name: "Portfolio",
      returnPct: portfolioReturnPct,
      trades: result?.rows.reduce((s, r) => s + r.total_trades, 0) || 0,
    },
  ];

  return (
    <div className="min-h-full bg-slate-50 text-slate-900">
      <div className="max-w-[1400px] mx-auto px-6 py-8 pb-12">
        <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Monthly Tracker</h1>
            <p className="mt-2 text-sm text-slate-500">
              Aggregates closed trades from your portfolio into monthly statistics.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-sm">
            <button
              type="button"
              onClick={() => setYear((y) => y - 1)}
              className="px-3 py-1.5 rounded-md border border-slate-300 bg-slate-50 text-slate-800 text-sm font-semibold hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors"
            >
              ◀
            </button>
            <span className="font-mono text-lg font-bold min-w-[56px] text-center">{year}</span>
            <button
              type="button"
              onClick={() => setYear((y) => y + 1)}
              className="px-3 py-1.5 rounded-md border border-slate-300 bg-slate-50 text-slate-800 text-sm font-semibold hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors"
            >
              ▶
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            ⚠ {error}
          </div>
        )}

        {result ? (
          <>
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-6">
              <div className="flex flex-wrap gap-6 py-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500 font-medium">Winning Percentage</span>
                  <span
                    className={`font-mono font-bold px-2.5 py-1 rounded-md border text-sm ${
                      (result.summary_win_rate || 0) >= 0.5
                        ? "text-green-700 bg-green-50 border-green-200"
                        : "text-red-700 bg-red-50 border-red-200"
                    }`}
                  >
                    {pct(result.summary_win_rate)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500 font-medium">Average Gain</span>
                  <span className="font-mono font-bold px-2.5 py-1 rounded-md border text-sm text-green-700 bg-green-50 border-green-200">
                    {pct(result.summary_avg_gain)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500 font-medium">Average Loss</span>
                  <span className="font-mono font-bold px-2.5 py-1 rounded-md border text-sm text-red-700 bg-red-50 border-red-200">
                    {pct(result.summary_avg_loss)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500 font-medium">Win/Loss Ratio</span>
                  <span className="font-mono font-bold px-2.5 py-1 rounded-md border text-sm bg-slate-50 border-slate-200">
                    {fmt(result.summary_wl_ratio)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500 font-medium">Adjusted Win/Lo</span>
                  <span className="font-mono font-bold px-2.5 py-1 rounded-md border text-sm bg-slate-50 border-slate-200">
                    {fmt(result.summary_adj_wl_ratio)}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-4">
                  Bell Curve — Monthly Return %
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={chartDataWithPortfolio} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} />
                    <XAxis dataKey="name" tick={{ fill: chartTickFill, fontSize: 10 }} />
                    <YAxis tick={{ fill: chartTickFill, fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                    <Tooltip contentStyle={chartTooltipStyle} formatter={(value: number) => [`${value}%`, "Return"]} />
                    <ReferenceLine y={0} stroke="#d97706" strokeDasharray="6 3" />
                    <Line type="monotone" dataKey="returnPct" stroke="#2563eb" strokeWidth={2} dot={{ r: 4, fill: "#2563eb" }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-4">
                  Trade Count Per Month
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} />
                    <XAxis dataKey="name" tick={{ fill: chartTickFill, fontSize: 10 }} />
                    <YAxis tick={{ fill: chartTickFill, fontSize: 10 }} allowDecimals={false} />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Bar dataKey="trades" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={index} fill={entry.trades > 0 ? "#2563eb" : "#cbd5e1"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm overflow-x-auto">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-4">Monthly Summary</div>
              <table className="w-full border-collapse text-[11px] bg-white text-slate-900 text-right font-[Arial,sans-serif]">
                <thead>
                  <tr>
                    <th className="border border-slate-300 px-2 py-1 w-5 bg-slate-50 font-bold text-center uppercase text-slate-600" />
                    <th className="border border-slate-300 px-2 py-1 text-left bg-slate-50 font-bold text-center uppercase text-slate-600">
                      MONTHLY TRACKER
                    </th>
                    <th className="border border-slate-300 px-2 py-1 whitespace-nowrap bg-slate-50 font-bold text-center uppercase text-slate-600">INVST</th>
                    <th className="border border-slate-300 px-2 py-1 whitespace-nowrap bg-slate-50 font-bold text-center uppercase text-slate-600">T.GAIN</th>
                    <th className="border border-slate-300 px-2 py-1 whitespace-nowrap bg-slate-50 font-bold text-center uppercase text-slate-600">T.LOSS</th>
                    <th className="border border-slate-300 px-2 py-1 whitespace-nowrap bg-slate-50 font-bold text-center uppercase text-slate-600">TRADES.GAIN</th>
                    <th className="border border-slate-300 px-2 py-1 whitespace-nowrap bg-slate-50 font-bold text-center uppercase text-slate-600">TRADES.LOSS</th>
                    <th className="border border-slate-300 px-2 py-1 whitespace-nowrap bg-slate-50 font-bold text-center uppercase text-slate-600">LARGE GAIN</th>
                    <th className="border border-slate-300 px-2 py-1 whitespace-nowrap bg-slate-50 font-bold text-center uppercase text-slate-600">LARGE LOSS</th>
                    <th className="border border-slate-300 px-2 py-1 whitespace-nowrap bg-slate-50 font-bold text-center uppercase text-slate-600">AVG GAIN</th>
                    <th className="border border-slate-300 px-2 py-1 whitespace-nowrap bg-slate-50 font-bold text-center uppercase text-slate-600">AVG LOSS</th>
                    <th className="border border-slate-300 px-2 py-1 whitespace-nowrap bg-slate-50 font-bold text-center uppercase text-slate-600">WIN %</th>
                    <th className="border border-slate-300 px-2 py-1 whitespace-nowrap bg-slate-50 font-bold text-center uppercase text-slate-600">TOTAL TRADE</th>
                    <th className="border border-slate-300 px-2 py-1 whitespace-nowrap bg-slate-50 font-bold text-center uppercase text-slate-600">LG GAIN%</th>
                    <th className="border border-slate-300 px-2 py-1 whitespace-nowrap bg-slate-50 font-bold text-center uppercase text-slate-600">LG LOSS%</th>
                    <th className="border border-slate-300 px-2 py-1 whitespace-nowrap bg-slate-50 font-bold text-center uppercase text-slate-600">AVG DAYS GAINS</th>
                    <th className="border border-slate-300 px-2 py-1 whitespace-nowrap bg-slate-50 font-bold text-center uppercase text-slate-600">AVG DAYS LOSS</th>
                    <th className="border border-slate-300 px-2 py-1 whitespace-nowrap bg-slate-50 font-bold text-center uppercase text-slate-600">Win/Loss Ratio</th>
                    <th className="border border-slate-300 px-2 py-1 whitespace-nowrap bg-slate-50 font-bold text-center uppercase text-slate-600">Adjusted Win/Lo</th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((r, i) => {
                    const lgGainPct = r.investment > 0 && r.large_gain > 0 ? r.large_gain / r.investment : 0;
                    const lgLossPct = r.investment > 0 && r.large_loss > 0 ? r.large_loss / r.investment : 0;
                    return (
                      <tr key={i}>
                        <td className="border border-slate-300 px-2 py-1 text-left">{i + 1}</td>
                        <td className="border border-slate-300 px-2 py-1 text-left">{r.label}</td>
                        <td className="border border-slate-300 px-2 py-1 bg-slate-100">{r.investment === 0 ? "0" : fmt(r.investment, 0)}</td>
                        <td className="border border-slate-300 px-2 py-1 bg-orange-50">{r.total_gain === 0 ? "0" : fmt(r.total_gain, 0)}</td>
                        <td className="border border-slate-300 px-2 py-1 bg-orange-50">{r.total_loss === 0 ? "0" : fmt(r.total_loss, 0)}</td>
                        <td className="border border-slate-300 px-2 py-1 bg-orange-50">{r.trades_gain}</td>
                        <td className="border border-slate-300 px-2 py-1 bg-orange-50">{r.trades_loss}</td>
                        <td className="border border-slate-300 px-2 py-1 bg-orange-50">{r.large_gain === 0 ? "0" : fmt(r.large_gain, 0)}</td>
                        <td className="border border-slate-300 px-2 py-1 bg-orange-50">{r.large_loss === 0 ? "0" : fmt(r.large_loss, 0)}</td>
                        <td className="border border-slate-300 px-2 py-1">{pct(r.avg_gain)}</td>
                        <td className="border border-slate-300 px-2 py-1">{pct(r.avg_loss)}</td>
                        <td className="border border-slate-300 px-2 py-1">{pct(r.win_pct)}</td>
                        <td className="border border-slate-300 px-2 py-1 bg-orange-50">{r.total_trades}</td>
                        <td className="border border-slate-300 px-2 py-1 bg-orange-50">{pct(lgGainPct)}</td>
                        <td className="border border-slate-300 px-2 py-1 bg-orange-50">{pct(lgLossPct)}</td>
                        <td className="border border-slate-300 px-2 py-1 bg-orange-50">{fmt(r.avg_days_gain, 0)}</td>
                        <td className="border border-slate-300 px-2 py-1 bg-orange-50">{fmt(r.avg_days_loss, 0)}</td>
                        <td className="border border-slate-300 px-2 py-1 bg-red-100">{fmt(r.win_loss_ratio, 2)}</td>
                        <td className="border border-slate-300 px-2 py-1 bg-red-100">{fmt(r.adjusted_wl_ratio, 2)}</td>
                      </tr>
                    );
                  })}

                  {(() => {
                    const sum_invst = result.rows.reduce((s, r) => s + r.investment, 0);
                    const sum_tg = result.rows.reduce((s, r) => s + r.total_gain, 0);
                    const sum_tl = result.rows.reduce((s, r) => s + r.total_loss, 0);
                    const sum_trg = result.rows.reduce((s, r) => s + r.trades_gain, 0);
                    const sum_trl = result.rows.reduce((s, r) => s + r.trades_loss, 0);
                    const sum_tt = result.rows.reduce((s, r) => s + r.total_trades, 0);
                    const max_lg = Math.max(...result.rows.map((r) => r.large_gain), 0);
                    const max_ll = Math.max(...result.rows.map((r) => r.large_loss), 0);
                    const lgGainPctTotal = sum_invst > 0 ? max_lg / sum_invst : 0;
                    const lgLossPctTotal = sum_invst > 0 ? max_ll / sum_invst : 0;
                    const activeMonths = result.rows.filter((r) => r.total_trades > 0).length || 1;

                    const footerRow = (
                      label: string,
                      rowNum: string,
                      invst: string,
                      tg: string,
                      tl: string,
                      trg: string | number,
                      trl: string | number,
                      lg: string,
                      ll: string,
                      tt: string | number
                    ) => (
                      <tr className="font-bold">
                        <td className="border border-slate-300 px-2 py-1 text-left">{rowNum}</td>
                        <td className="border border-slate-300 px-2 py-1 text-left">{label}</td>
                        <td className="border border-slate-300 px-2 py-1 bg-slate-100">{invst}</td>
                        <td className="border border-slate-300 px-2 py-1 bg-orange-50">{tg}</td>
                        <td className="border border-slate-300 px-2 py-1 bg-orange-50">{tl}</td>
                        <td className="border border-slate-300 px-2 py-1 bg-orange-50">{trg}</td>
                        <td className="border border-slate-300 px-2 py-1 bg-orange-50">{trl}</td>
                        <td className="border border-slate-300 px-2 py-1 bg-orange-50">{lg}</td>
                        <td className="border border-slate-300 px-2 py-1 bg-orange-50">{ll}</td>
                        <td className="border border-slate-300 px-2 py-1">{pct(result.summary_avg_gain)}</td>
                        <td className="border border-slate-300 px-2 py-1">{pct(result.summary_avg_loss)}</td>
                        <td className="border border-slate-300 px-2 py-1">{pct(result.summary_win_rate)}</td>
                        <td className="border border-slate-300 px-2 py-1 bg-orange-50">{tt}</td>
                        <td className="border border-slate-300 px-2 py-1 bg-orange-50">{pct(lgGainPctTotal)}</td>
                        <td className="border border-slate-300 px-2 py-1 bg-orange-50">{pct(lgLossPctTotal)}</td>
                        <td className="border border-slate-300 px-2 py-1 bg-orange-50">
                          {label === "AVG."
                            ? fmt(result.rows.reduce((s, r) => s + r.avg_days_gain, 0) / activeMonths, 0)
                            : fmt(result.rows.reduce((s, r) => s + r.avg_days_gain, 0), 0)}
                        </td>
                        <td className="border border-slate-300 px-2 py-1 bg-orange-50">
                          {label === "AVG."
                            ? fmt(result.rows.reduce((s, r) => s + r.avg_days_loss, 0) / activeMonths, 0)
                            : fmt(result.rows.reduce((s, r) => s + r.avg_days_loss, 0), 0)}
                        </td>
                        <td className="border border-slate-300 px-2 py-1 bg-red-100">{fmt(result.summary_wl_ratio, 2)}</td>
                        <td className="border border-slate-300 px-2 py-1 bg-red-100">{fmt(result.summary_adj_wl_ratio, 2)}</td>
                      </tr>
                    );

                    return (
                      <>
                        {footerRow("Portfolio", "13", fmt(sum_invst, 0), fmt(sum_tg, 0), fmt(sum_tl, 0), sum_trg, sum_trl, fmt(max_lg, 0), fmt(max_ll, 0), sum_tt)}
                        {footerRow("AVG.", "", fmt(sum_invst / activeMonths, 0), fmt(sum_tg / activeMonths, 0), fmt(sum_tl / activeMonths, 0), fmt(sum_trg / activeMonths, 0), fmt(sum_trl / activeMonths, 0), fmt(max_lg / activeMonths, 0), fmt(max_ll / activeMonths, 0), fmt(sum_tt / activeMonths, 0))}
                        {footerRow("TOTAL", "", fmt(sum_invst, 0), fmt(sum_tg, 0), fmt(sum_tl, 0), sum_trg, sum_trl, fmt(max_lg, 0), fmt(max_ll, 0), sum_tt)}
                      </>
                    );
                  })()}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-16 shadow-sm text-center text-slate-500 text-sm">
            {isPending ? "Loading..." : "No closed trades found for this year. Close positions from your Portfolio to populate this page."}
          </div>
        )}
      </div>
    </div>
  );
}
