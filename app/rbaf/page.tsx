"use client";

import { useState, useTransition, useCallback, useEffect } from "react";
import type { RBAFResponse, RBAFRequest } from "@/types/wallet";
import { calcRBAF, getRbafSettings } from "@/lib/api/wallet";

interface FormState {
  portfolio_size: string;
  portfolio_pct: string;
  desired_return: string;
  avg_pct_gain: string;
  avg_pct_loss: string;
  win_rate: string;
  risk_of_rote: string;
  optimal_f: string;
}

const INITIAL_FORM: FormState = {
  portfolio_size: "700000",
  portfolio_pct: "25%",
  desired_return: "100%",
  avg_pct_gain: "20%",
  avg_pct_loss: "4%",
  win_rate: "40%",
  risk_of_rote: "1%",
  optimal_f: "25%",
};

const fmt = (n?: number, decimals = 2) =>
  n === undefined ? "0" : n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
const pct = (n?: number) => (n === undefined ? "0.00%" : `${(n * 100).toFixed(2)}%`);

const parseInput = (val: string, isPct: boolean = false): number => {
  const clean = val.replace(/,/g, "").trim();
  if (clean.endsWith("%")) return parseFloat(clean.slice(0, -1)) / 100;
  const num = parseFloat(clean);
  return isPct ? num / 100 : num;
};

function Field({
  label,
  name,
  value,
  onChange,
  prefix,
}: {
  label: string;
  name: keyof FormState;
  value: string;
  onChange: (n: keyof FormState, v: string) => void;
  prefix?: string;
}) {
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
        {label}
      </label>
      <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-shadow">
        {prefix && (
          <span className="px-3 py-2.5 text-sm text-slate-500 bg-slate-50 border-r border-slate-200 font-mono shrink-0">
            {prefix}
          </span>
        )}
        <input
          id={name}
          type="text"
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          className="flex-1 w-full px-3 py-2.5 text-sm text-slate-900 outline-none bg-transparent font-mono"
        />
      </div>
    </div>
  );
}

export default function RBAFPage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [result, setResult] = useState<RBAFResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await getRbafSettings();
      setForm({
        portfolio_size: saved.portfolio_size.toString(),
        portfolio_pct: pct(saved.portfolio_pct),
        desired_return: pct(saved.desired_return),
        avg_pct_gain: pct(saved.avg_pct_gain),
        avg_pct_loss: pct(saved.avg_pct_loss),
        win_rate: pct(saved.win_rate),
        risk_of_rote: pct(saved.risk_of_rote),
        optimal_f: pct(saved.optimal_f),
      });
      handleSubmitWithData(saved);
    } catch (e) {
      console.error("Failed to load RBAF settings", e);
    }
  };

  const handleChange = useCallback(
    (name: keyof FormState, value: string) => setForm((prev) => ({ ...prev, [name]: value })),
    []
  );

  const handleSubmitWithData = (data: RBAFRequest) => {
    setError(null);
    startTransition(async () => {
      try {
        const res = await calcRBAF(data);
        setResult(res);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Unknown error");
      }
    });
  };

  const handleSubmit = () => {
    handleSubmitWithData({
      portfolio_size: parseInput(form.portfolio_size),
      portfolio_pct: parseInput(form.portfolio_pct, true),
      desired_return: parseInput(form.desired_return, true),
      avg_pct_gain: parseInput(form.avg_pct_gain, true),
      avg_pct_loss: parseInput(form.avg_pct_loss, true),
      win_rate: parseInput(form.win_rate, true),
      risk_of_rote: parseInput(form.risk_of_rote, true),
      optimal_f: parseInput(form.optimal_f, true),
    });
  };

  return (
    <div className="min-h-full bg-slate-50 text-slate-900">
      <div className="max-w-5xl mx-auto px-6 py-8 pb-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Risk-Based Allocation Framework (RBAF)</h1>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed">
            Calculates optimal position sizing, expected returns, and path to your portfolio goal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[minmax(280px,340px)_1fr] gap-6 items-start">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-5">Inputs</div>
            <Field label="Portfolio Size" name="portfolio_size" value={form.portfolio_size} onChange={handleChange} prefix="SAR" />
            <Field label="Portfolio % to Deploy" name="portfolio_pct" value={form.portfolio_pct} onChange={handleChange} />
            <Field label="Desired Return Multiplier" name="desired_return" value={form.desired_return} onChange={handleChange} />
            <Field label="Avg % Gain (Winners)" name="avg_pct_gain" value={form.avg_pct_gain} onChange={handleChange} />
            <Field label="Avg % Loss (Losers)" name="avg_pct_loss" value={form.avg_pct_loss} onChange={handleChange} />
            <Field label="Win Rate" name="win_rate" value={form.win_rate} onChange={handleChange} />
            <Field label="Risk of ROTE" name="risk_of_rote" value={form.risk_of_rote} onChange={handleChange} />
            <Field label="Optimal f" name="optimal_f" value={form.optimal_f} onChange={handleChange} />

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
              className="w-full py-3 mt-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold shadow-sm shadow-blue-600/20 transition-colors"
            >
              {isPending ? "Calculating…" : "Calculate RBAF"}
            </button>
            {error && (
              <div className="mt-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                ⚠ {error}
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-5">Analysis Results</div>

            {isPending && (
              <div className="flex flex-col items-center justify-center min-h-[260px] text-slate-500 gap-3">
                <div className="w-9 h-9 border-[3px] border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-sm">Analyzing system edge…</p>
              </div>
            )}

            {!isPending && !result && (
              <div className="flex flex-col items-center justify-center min-h-[260px] text-slate-500">
                <p className="text-sm">Enter parameters and click Calculate</p>
              </div>
            )}

            {!isPending && result && (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-7">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col gap-2">
                    <span className="text-[11px] uppercase tracking-wide text-slate-500">Goal</span>
                    <span className="text-xl font-bold font-mono text-green-600">{fmt(result.goal, 0)}</span>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col gap-2">
                    <span className="text-[11px] uppercase tracking-wide text-slate-500"># of trades Needed to Reach Goal</span>
                    <span className="text-xl font-bold font-mono text-blue-600">{result.trades_to_reach_goal}</span>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col gap-2">
                    <span className="text-[11px] uppercase tracking-wide text-slate-500">Optimal f</span>
                    <span className="text-xl font-bold font-mono text-amber-600">{pct(result.optimal_f)}</span>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex flex-col gap-2">
                    <span className="text-[11px] uppercase tracking-wide text-slate-500">Adjusted Gain / Loss Ratio</span>
                    <span className="text-xl font-bold font-mono text-slate-900">{result.adjusted_gain_loss_ratio.toFixed(2)}</span>
                  </div>
                </div>

                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-3 mt-6">Position Sizing Strategy</div>
                <table className="w-full text-sm border-collapse mb-6">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left py-2.5 px-3.5 text-[11px] font-semibold uppercase text-slate-500">Size Type</th>
                      <th className="text-left py-2.5 px-3.5 text-[11px] font-semibold uppercase text-slate-500">Allocation (%)</th>
                      <th className="text-left py-2.5 px-3.5 text-[11px] font-semibold uppercase text-slate-500">Amount (SAR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3.5 px-3.5 text-slate-700">Quarter Position</td>
                      <td className="py-3.5 px-3.5 font-mono text-slate-900">{pct(parseInput(form.portfolio_pct, true) / 4)}</td>
                      <td className="py-3.5 px-3.5 font-mono font-semibold text-blue-600">{fmt(result.quarter_position_sar, 0)}</td>
                    </tr>
                    <tr className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3.5 px-3.5 text-slate-700">Half Position</td>
                      <td className="py-3.5 px-3.5 font-mono text-slate-900">{pct(parseInput(form.portfolio_pct, true) / 2)}</td>
                      <td className="py-3.5 px-3.5 font-mono font-semibold text-blue-600">{fmt(result.half_position_sar, 0)}</td>
                    </tr>
                    <tr className="hover:bg-slate-50">
                      <td className="py-3.5 px-3.5 text-slate-700">Full Position</td>
                      <td className="py-3.5 px-3.5 font-mono text-slate-900">{pct(parseInput(form.portfolio_pct, true))}</td>
                      <td className="py-3.5 px-3.5 font-mono font-semibold text-blue-600">{fmt(result.full_position_sar, 0)}</td>
                    </tr>
                  </tbody>
                </table>

                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-3">Expectancy Metrics</div>
                <table className="w-full text-sm border-collapse">
                  <tbody>
                    {[
                      ["Average Gain on Winning Trades", fmt(result.avg_gain_on_winners, 0)],
                      ["# of Winning Trades", fmt(result.num_winning_trades, 0)],
                      ["Average Loss on Losing Trades", fmt(result.avg_loss_on_losers, 0)],
                      ["# of Losing Trades", fmt(result.num_losing_trades, 0)],
                      ["Gain / Loss Ratio", fmt(result.gain_loss_ratio, 2)],
                      ["Position Size", fmt(result.position_size, 0)],
                      ["Expected Net % Return per Trade", pct(result.expected_net_pct_per_trade)],
                      ["Expected Net Return per Trade", fmt(result.expected_net_return_per_trade, 0)],
                      ["Stop Loss", pct(result.stop_loss)],
                      ["# of monthly trades Needed to Reach Goal", fmt(result.monthly_trades_to_goal, 0)],
                    ].map(([label, val]) => (
                      <tr key={label} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                        <td className="py-3.5 px-3.5 text-slate-700">{label}</td>
                        <td className="py-3.5 px-3.5 font-mono font-semibold text-blue-600 text-right">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
