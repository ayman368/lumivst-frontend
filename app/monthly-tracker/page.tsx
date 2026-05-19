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
    } catch (e: any) {
      setError(e.message);
      toast(e.message, "error");
    }
  };

  // Chart data derived from result
  const chartData = result?.rows.map(r => {
    const netReturn = r.total_gain - r.total_loss;
    const returnPct = r.investment > 0 ? netReturn / r.investment : 0;
    return {
      name: r.label,
      returnPct: parseFloat((returnPct * 100).toFixed(2)),
      trades: r.total_trades,
    };
  }) || [];

  // Add "Portfolio" total row to chart
  const totalInvst = result?.rows.reduce((s, r) => s + r.investment, 0) || 0;
  const totalNetReturn = result?.rows.reduce((s, r) => s + r.total_gain - r.total_loss, 0) || 0;
  const portfolioReturnPct = totalInvst > 0 ? parseFloat(((totalNetReturn / totalInvst) * 100).toFixed(2)) : 0;
  const chartDataWithPortfolio = [...chartData, { name: "Portfolio", returnPct: portfolioReturnPct, trades: result?.rows.reduce((s, r) => s + r.total_trades, 0) || 0 }];

  return (
    <>
      <style>{`
        :root {
          --bg: #0a0d14; --surface: #111827; --border: #1f2937;
          --accent: #3b82f6; --accent-dim: #1d4ed8; --text: #f1f5f9;
          --muted: #64748b; --green: #22c55e; --red: #ef4444; --amber: #f59e0b;
          --radius: 12px;
          --font-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
          --font-ui: 'DM Sans', 'Inter', system-ui, sans-serif;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg); color: var(--text); font-family: var(--font-ui); min-height: 100vh; }
        .page { max-width: 1400px; margin: 0 auto; padding: 48px 24px; }
        .header { margin-bottom: 32px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
        .header h1 { font-size: 28px; font-weight: 700; background: linear-gradient(135deg, #60a5fa, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .header p { color: var(--muted); margin-top: 4px; font-size: 14px; }
        .year-select { display: flex; align-items: center; gap: 8px; }
        .year-select button { background: var(--border); color: white; border: none; border-radius: 6px; padding: 8px 14px; cursor: pointer; font-size: 14px; font-weight: 600; }
        .year-select button:hover { background: var(--accent-dim); }
        .year-select span { font-family: var(--font-mono); font-size: 20px; font-weight: 700; min-width: 60px; text-align: center; }

        .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; overflow-x: auto; margin-bottom: 24px; }
        .card-title { font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: var(--muted); margin-bottom: 16px; }

        .summary-row { display: flex; gap: 24px; flex-wrap: wrap; padding: 16px 0; }
        .summary-item { display: flex; align-items: center; gap: 8px; font-size: 14px; }
        .summary-label { color: var(--muted); font-weight: 500; }
        .summary-value { font-family: var(--font-mono); font-weight: 700; padding: 2px 8px; border-radius: 4px; }
        .summary-value.green { color: var(--green); }
        .summary-value.red { color: var(--red); }

        .excel-table { width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 11px; background: white; color: black; text-align: right; }
        .excel-table th, .excel-table td { border: 1px solid #ccc; padding: 4px 6px; white-space: nowrap; }
        .excel-table th { background: white; font-weight: bold; text-align: center; text-transform: uppercase; }
        .excel-table td:first-child, .excel-table th:first-child { text-align: left; }
        .bg-gray { background: #f0f0f0; }
        .bg-peach { background: #ffe4e1; }
        .bg-red { background: #ffb6c1; }
        .bold { font-weight: bold; }
        .text-left { text-align: left; }

        .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
        @media (max-width: 900px) { .charts-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="page">
        <div className="header">
          <div>
            <h1>Monthly Tracker</h1>
            <p>Aggregates closed trades from your portfolio into monthly statistics.</p>
          </div>
          <div className="year-select">
            <button onClick={() => setYear(y => y - 1)}>◀</button>
            <span>{year}</span>
            <button onClick={() => setYear(y => y + 1)}>▶</button>
          </div>
        </div>

        {error && <div style={{ color: "var(--red)", marginBottom: "20px" }}>⚠ {error}</div>}

        {result ? (
          <>
            {/* ── Summary Stats ── */}
            <div className="card">
              <div className="summary-row">
                <div className="summary-item">
                  <span className="summary-label">Winning Percentage</span>
                  <span className={`summary-value ${(result.summary_win_rate || 0) >= 0.5 ? "green" : "red"}`}>{pct(result.summary_win_rate)}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Average Gain</span>
                  <span className="summary-value green">{pct(result.summary_avg_gain)}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Average Loss</span>
                  <span className="summary-value red">{pct(result.summary_avg_loss)}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Win/Loss Ratio</span>
                  <span className="summary-value">{fmt(result.summary_wl_ratio)}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Adjusted Win/Lo</span>
                  <span className="summary-value" style={{ background: "#1a1a2e", borderRadius: "4px" }}>{fmt(result.summary_adj_wl_ratio)}</span>
                </div>
              </div>
            </div>

            {/* ── Charts ── */}
            <div className="charts-grid">
              <div className="card">
                <div className="card-title">Bell Curve — Monthly Return %</div>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={chartDataWithPortfolio} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                    <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} tickFormatter={v => `${v}%`} />
                    <Tooltip
                      contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: "8px", color: "#f1f5f9", fontSize: "12px" }}
                      formatter={(value: any) => [`${value}%`, "Return"]}
                    />
                    <ReferenceLine y={0} stroke="#f59e0b" strokeDasharray="6 3" />
                    <Line type="monotone" dataKey="returnPct" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: "#3b82f6" }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="card">
                <div className="card-title">Trade Count Per Month</div>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                    <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} />
                    <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ background: "#111827", border: "1px solid #374151", borderRadius: "8px", color: "#f1f5f9", fontSize: "12px" }}
                    />
                    <Bar dataKey="trades" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={index} fill={entry.trades > 0 ? "#3b82f6" : "#1f2937"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ── Excel-style Table ── */}
            <div className="card">
              <div className="card-title">Monthly Summary</div>
              <table className="excel-table">
                <thead>
                  <tr>
                    <th style={{ width: "20px" }}></th>
                    <th className="text-left">MONTHLY TRACKER</th>
                    <th>INVST</th>
                    <th>T.GAIN</th>
                    <th>T.LOSS</th>
                    <th>TRADES.GAIN</th>
                    <th>TRADES.LOSS</th>
                    <th>LARGE GAIN</th>
                    <th>LARGE LOSS</th>
                    <th>AVG GAIN</th>
                    <th>AVG LOSS</th>
                    <th>WIN %</th>
                    <th>TOTAL TRADE</th>
                    <th>LG GAIN%</th>
                    <th>LG LOSS%</th>
                    <th>AVG DAYS GAINS</th>
                    <th>AVG DAYS LOSS</th>
                    <th>Win/Loss Ratio</th>
                    <th>Adjusted Win/Lo</th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((r, i) => {
                    const lgGainPct = r.investment > 0 && r.large_gain > 0 ? r.large_gain / r.investment : 0;
                    const lgLossPct = r.investment > 0 && r.large_loss > 0 ? r.large_loss / r.investment : 0;
                    return (
                      <tr key={i}>
                        <td className="text-left">{i + 1}</td>
                        <td className="text-left">{r.label}</td>
                        <td className="bg-gray">{r.investment === 0 ? "0" : fmt(r.investment, 0)}</td>
                        <td className="bg-peach">{r.total_gain === 0 ? "0" : fmt(r.total_gain, 0)}</td>
                        <td className="bg-peach">{r.total_loss === 0 ? "0" : fmt(r.total_loss, 0)}</td>
                        <td className="bg-peach">{r.trades_gain}</td>
                        <td className="bg-peach">{r.trades_loss}</td>
                        <td className="bg-peach">{r.large_gain === 0 ? "0" : fmt(r.large_gain, 0)}</td>
                        <td className="bg-peach">{r.large_loss === 0 ? "0" : fmt(r.large_loss, 0)}</td>
                        <td>{pct(r.avg_gain)}</td>
                        <td>{pct(r.avg_loss)}</td>
                        <td>{pct(r.win_pct)}</td>
                        <td className="bg-peach">{r.total_trades}</td>
                        <td className="bg-peach">{pct(lgGainPct)}</td>
                        <td className="bg-peach">{pct(lgLossPct)}</td>
                        <td className="bg-peach">{fmt(r.avg_days_gain, 0)}</td>
                        <td className="bg-peach">{fmt(r.avg_days_loss, 0)}</td>
                        <td className="bg-red">{fmt(r.win_loss_ratio, 2)}</td>
                        <td className="bg-red">{fmt(r.adjusted_wl_ratio, 2)}</td>
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
                    const max_lg = Math.max(...result.rows.map(r => r.large_gain), 0);
                    const max_ll = Math.max(...result.rows.map(r => r.large_loss), 0);
                    const lgGainPctTotal = sum_invst > 0 ? max_lg / sum_invst : 0;
                    const lgLossPctTotal = sum_invst > 0 ? max_ll / sum_invst : 0;
                    const activeMonths = result.rows.filter(r => r.total_trades > 0).length || 1;

                    return (
                      <>
                        <tr className="bold">
                          <td className="text-left">13</td>
                          <td className="text-left">Portfolio</td>
                          <td className="bg-gray">{fmt(sum_invst, 0)}</td>
                          <td className="bg-peach">{fmt(sum_tg, 0)}</td>
                          <td className="bg-peach">{fmt(sum_tl, 0)}</td>
                          <td className="bg-peach">{sum_trg}</td>
                          <td className="bg-peach">{sum_trl}</td>
                          <td className="bg-peach">{fmt(max_lg, 0)}</td>
                          <td className="bg-peach">{fmt(max_ll, 0)}</td>
                          <td>{pct(result.summary_avg_gain)}</td>
                          <td>{pct(result.summary_avg_loss)}</td>
                          <td>{pct(result.summary_win_rate)}</td>
                          <td className="bg-peach">{sum_tt}</td>
                          <td className="bg-peach">{pct(lgGainPctTotal)}</td>
                          <td className="bg-peach">{pct(lgLossPctTotal)}</td>
                          <td className="bg-peach">{fmt(result.rows.reduce((s, r) => s + r.avg_days_gain, 0) / activeMonths, 0)}</td>
                          <td className="bg-peach">{fmt(result.rows.reduce((s, r) => s + r.avg_days_loss, 0) / activeMonths, 0)}</td>
                          <td className="bg-red">{fmt(result.summary_wl_ratio, 2)}</td>
                          <td className="bg-red">{fmt(result.summary_adj_wl_ratio, 2)}</td>
                        </tr>
                        <tr className="bold">
                          <td></td>
                          <td className="text-left">AVG.</td>
                          <td className="bg-gray">{fmt(sum_invst / activeMonths, 0)}</td>
                          <td className="bg-peach">{fmt(sum_tg / activeMonths, 0)}</td>
                          <td className="bg-peach">{fmt(sum_tl / activeMonths, 0)}</td>
                          <td className="bg-peach">{fmt(sum_trg / activeMonths, 0)}</td>
                          <td className="bg-peach">{fmt(sum_trl / activeMonths, 0)}</td>
                          <td className="bg-peach">{fmt(max_lg / activeMonths, 0)}</td>
                          <td className="bg-peach">{fmt(max_ll / activeMonths, 0)}</td>
                          <td>{pct(result.summary_avg_gain)}</td>
                          <td>{pct(result.summary_avg_loss)}</td>
                          <td>{pct(result.summary_win_rate)}</td>
                          <td className="bg-peach">{fmt(sum_tt / activeMonths, 0)}</td>
                          <td className="bg-peach">{pct(lgGainPctTotal)}</td>
                          <td className="bg-peach">{pct(lgLossPctTotal)}</td>
                          <td className="bg-peach">{fmt(result.rows.reduce((s, r) => s + r.avg_days_gain, 0) / activeMonths, 0)}</td>
                          <td className="bg-peach">{fmt(result.rows.reduce((s, r) => s + r.avg_days_loss, 0) / activeMonths, 0)}</td>
                          <td className="bg-red">{fmt(result.summary_wl_ratio, 2)}</td>
                          <td className="bg-red">{fmt(result.summary_adj_wl_ratio, 2)}</td>
                        </tr>
                        <tr className="bold">
                          <td></td>
                          <td className="text-left">TOTAL</td>
                          <td className="bg-gray">{fmt(sum_invst, 0)}</td>
                          <td className="bg-peach">{fmt(sum_tg, 0)}</td>
                          <td className="bg-peach">{fmt(sum_tl, 0)}</td>
                          <td className="bg-peach">{sum_trg}</td>
                          <td className="bg-peach">{sum_trl}</td>
                          <td className="bg-peach">{fmt(max_lg, 0)}</td>
                          <td className="bg-peach">{fmt(max_ll, 0)}</td>
                          <td>{pct(result.summary_avg_gain)}</td>
                          <td>{pct(result.summary_avg_loss)}</td>
                          <td>{pct(result.summary_win_rate)}</td>
                          <td className="bg-peach">{sum_tt}</td>
                          <td className="bg-peach">{pct(lgGainPctTotal)}</td>
                          <td className="bg-peach">{pct(lgLossPctTotal)}</td>
                          <td className="bg-peach">{fmt(result.rows.reduce((s, r) => s + r.avg_days_gain, 0), 0)}</td>
                          <td className="bg-peach">{fmt(result.rows.reduce((s, r) => s + r.avg_days_loss, 0), 0)}</td>
                          <td className="bg-red">{fmt(result.summary_wl_ratio, 2)}</td>
                          <td className="bg-red">{fmt(result.summary_adj_wl_ratio, 2)}</td>
                        </tr>
                      </>
                    );
                  })()}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="card" style={{ textAlign: "center", padding: "80px", color: "var(--muted)" }}>
            {isPending ? "Loading..." : "No closed trades found for this year. Close positions from your Portfolio to populate this page."}
          </div>
        )}
      </div>
    </>
  );
}
