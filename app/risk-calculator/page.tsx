"use client";

import { useState, useTransition, useCallback } from "react";
import type { RiskFinanceResponse, RiskFinanceRow } from "@/types/wallet";
import { calcRiskFinance, getLatestPrice } from "@/lib/api/wallet";
import { useToast } from "@/components/ui/Toast";

interface FormState {
  symbol: string;
  buy_price: string;
  num_shares: string;
  stop_price: string;
  current_price: string;
}

const INITIAL_FORM: FormState = {
  symbol: "",
  buy_price: "100",
  num_shares: "1000",
  stop_price: "92",
  current_price: "115",
};

const fmt = (n: number, decimals = 2) =>
  n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

const pct = (n: number) => `${(n * 100).toFixed(2)}%`;

const LEVEL_LABELS: Record<number, string> = {
  1: "Breakeven (100%)",
  0.75: "75%",
  0.5: "50%",
  0.25: "25%",
};

const EFFECTIVE_STOP_COLOR = (eff: number): string => {
  if (eff <= 0) return "#16a34a";
  if (eff < 0.03) return "#d97706";
  return "#dc2626";
};

function Field({
  label,
  name,
  value,
  onChange,
  onBlur,
  prefix,
  type = "number",
}: {
  label: string;
  name: keyof FormState;
  value: string;
  onChange: (n: keyof FormState, v: string) => void;
  onBlur?: () => void;
  prefix?: string;
  type?: string;
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
          type={type}
          step="any"
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          onBlur={onBlur}
          min={type === "number" ? "0" : undefined}
          className="flex-1 w-full px-3 py-2.5 text-sm text-slate-900 outline-none bg-transparent font-mono"
        />
      </div>
    </div>
  );
}

function ResultsTable({ data }: { data: RiskFinanceResponse }) {
  return (
    <div className="pt-1">
      <div className="flex items-baseline gap-3 px-5 py-4 mb-5 bg-slate-50 border border-slate-200 rounded-lg">
        <span className="text-[11px] uppercase tracking-wide text-slate-500">Stop-Loss %</span>
        <span className="text-3xl font-bold font-mono text-red-600">{pct(data.stop_loss_pct)}</span>
      </div>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left py-2.5 px-3.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Risk Financed</th>
            <th className="text-left py-2.5 px-3.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500"># Shares to Sell</th>
            <th className="text-left py-2.5 px-3.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Effective Stop</th>
            <th className="text-left py-2.5 px-3.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row: RiskFinanceRow) => {
            const color = EFFECTIVE_STOP_COLOR(row.effective_stop);
            const isBreakeven = row.effective_stop <= 0;
            return (
              <tr key={row.risk_financed_pct} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="py-4 px-3.5 font-medium text-slate-800">{LEVEL_LABELS[row.risk_financed_pct]}</td>
                <td className="py-4 px-3.5 font-mono text-[15px] text-blue-600">{fmt(row.shares_to_sell, 2)}</td>
                <td className="py-4 px-3.5 font-mono text-[15px] font-semibold" style={{ color }}>
                  {pct(row.effective_stop)}
                </td>
                <td className="py-4 px-3.5">
                  <span
                    className="inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide"
                    style={{ background: color + "18", color }}
                  >
                    {isBreakeven ? "Breakeven" : row.effective_stop < 0.03 ? "Near Safe" : "At Risk"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function RiskCalculatorPage() {
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [result, setResult] = useState<RiskFinanceResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleChange = useCallback(
    (name: keyof FormState, value: string) => setForm((prev) => ({ ...prev, [name]: value })),
    []
  );

  const handleSymbolBlur = async () => {
    if (!form.symbol) return;
    try {
      const priceData = await getLatestPrice(form.symbol);
      setForm((prev) => ({ ...prev, current_price: priceData.close.toString() }));
      toast(`Fetched latest price for ${form.symbol}: ${priceData.close} SAR`, "success");
    } catch {
      toast(`No price found for symbol ${form.symbol}.`, "error");
    }
  };

  const handleSubmit = () => {
    setError(null);
    startTransition(async () => {
      try {
        const res = await calcRiskFinance({
          buy_price: parseFloat(form.buy_price),
          num_shares: parseFloat(form.num_shares),
          stop_price: parseFloat(form.stop_price),
          current_price: parseFloat(form.current_price),
        });
        setResult(res);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Unknown error");
      }
    });
  };

  const gain =
    form.current_price && form.buy_price
      ? ((parseFloat(form.current_price) - parseFloat(form.buy_price)) / parseFloat(form.buy_price)) * 100
      : null;

  return (
    <div className="min-h-full bg-slate-50 text-slate-900">
      <div className="max-w-5xl mx-auto px-6 py-8 pb-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Risk Finance Calculator</h1>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed max-w-2xl">
            Determines how many shares to sell at each profit-lock level (100/75/50/25 %) to achieve
            breakeven or reduce effective risk — extracted from the <em>Risk Finance Calculator</em> workbook sheet.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[minmax(280px,340px)_1fr] gap-6 items-start">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-5">Inputs</div>

            {gain !== null && (
              <div
                className={`flex items-center gap-2 mb-5 px-3.5 py-2.5 rounded-lg text-sm font-mono border ${
                  gain > 0
                    ? "bg-green-50 border-green-200 text-green-700"
                    : gain < 0
                    ? "bg-red-50 border-red-200 text-red-700"
                    : "bg-slate-50 border-slate-200 text-slate-500"
                }`}
              >
                <span>Current gain:</span>
                <strong>
                  {gain >= 0 ? "+" : ""}
                  {fmt(gain, 2)}%
                </strong>
              </div>
            )}

            <Field label="Symbol (Auto-fetch)" name="symbol" value={form.symbol} onChange={handleChange} onBlur={handleSymbolBlur} type="text" />
            <Field label="Buy Price" name="buy_price" value={form.buy_price} onChange={handleChange} prefix="SAR" />
            <Field label="# Shares" name="num_shares" value={form.num_shares} onChange={handleChange} />
            <Field label="Stop Price" name="stop_price" value={form.stop_price} onChange={handleChange} prefix="SAR" />
            <Field label="Current Price" name="current_price" value={form.current_price} onChange={handleChange} prefix="SAR" />

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
              className="w-full py-3 mt-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold shadow-sm shadow-blue-600/20 transition-colors"
            >
              {isPending ? "Calculating…" : "Calculate"}
            </button>

            {error && (
              <div className="mt-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                ⚠ {error}
              </div>
            )}

            <div className="mt-6 p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500 font-mono leading-relaxed">
              <strong className="text-blue-600">Formula (shares to sell at X%):</strong>
              <br />
              {"((buy - stop) × shares × X%) ÷ (current - stop)"}
              <br />
              <br />
              <strong className="text-blue-600">Effective stop after partial exit:</strong>
              <br />
              {"(buy − ((sold×current + (n−sold)×stop) / n)) ÷ buy"}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-5">Results</div>

            {isPending && (
              <div className="flex flex-col items-center justify-center min-h-[260px] text-slate-500 gap-3">
                <div className="w-9 h-9 border-[3px] border-slate-200 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-sm">Running calculations…</p>
              </div>
            )}

            {!isPending && !result && (
              <div className="flex flex-col items-center justify-center min-h-[260px] text-slate-500 gap-3 text-center">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-30">
                  <path d="M9 7H6a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-3" />
                  <path d="M9 15h3l8.5-8.5a1.5 1.5 0 00-3-3L9 12v3" />
                  <path d="M16 5l3 3" />
                </svg>
                <p className="text-sm">Enter your position details and click Calculate</p>
              </div>
            )}

            {!isPending && result && <ResultsTable data={result} />}
          </div>
        </div>
      </div>
    </div>
  );
}
