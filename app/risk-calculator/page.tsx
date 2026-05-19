"use client";

/**
 * app/risk-calculator/page.tsx
 * Risk Finance Calculator  –  mirrors the "Risk Finance Calculator" Excel sheet.
 *
 * State management: local useState (no server state needed — pure computation).
 * For global shared state across pages, use Zustand (see note at bottom).
 */

import { useState, useTransition, useCallback } from "react";
import type { RiskFinanceResponse, RiskFinanceRow } from "@/types/wallet";
import { calcRiskFinance, getLatestPrice } from "@/lib/api/wallet";
import { useToast } from "@/components/ui/Toast";

// ─────────────────────────────────────────────────────────────
//  TYPES
// ─────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────

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
  if (eff <= 0) return "#22c55e";     // green — breakeven or better
  if (eff < 0.03) return "#f59e0b";  // amber
  return "#ef4444";                   // red
};

// ─────────────────────────────────────────────────────────────
//  FIELD COMPONENT
// ─────────────────────────────────────────────────────────────

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
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <div className="input-wrap">
        {prefix && <span className="prefix">{prefix}</span>}
        <input
          id={name}
          type={type}
          step="any"
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          onBlur={onBlur}
          min={type === "number" ? "0" : undefined}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  RESULTS TABLE
// ─────────────────────────────────────────────────────────────

function ResultsTable({ data }: { data: RiskFinanceResponse }) {
  return (
    <div className="results">
      <div className="stop-badge">
        <span className="stop-label">Stop-Loss %</span>
        <span className="stop-value">{pct(data.stop_loss_pct)}</span>
      </div>

      <table>
        <thead>
          <tr>
            <th>Risk Financed</th>
            <th># Shares to Sell</th>
            <th>Effective Stop</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row: RiskFinanceRow) => {
            const color = EFFECTIVE_STOP_COLOR(row.effective_stop);
            const isBreakeven = row.effective_stop <= 0;
            return (
              <tr key={row.risk_financed_pct}>
                <td className="level">{LEVEL_LABELS[row.risk_financed_pct]}</td>
                <td className="shares">{fmt(row.shares_to_sell, 2)}</td>
                <td className="eff-stop" style={{ color }}>
                  {pct(row.effective_stop)}
                </td>
                <td>
                  <span className="pill" style={{ background: color + "22", color }}>
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

// ─────────────────────────────────────────────────────────────
//  MAIN PAGE
// ─────────────────────────────────────────────────────────────

export default function RiskCalculatorPage() {
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [result, setResult] = useState<RiskFinanceResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleChange = useCallback(
    (name: keyof FormState, value: string) =>
      setForm((prev) => ({ ...prev, [name]: value })),
    []
  );

  const handleSymbolBlur = async () => {
    if (!form.symbol) return;
    try {
      const priceData = await getLatestPrice(form.symbol);
      setForm(prev => ({ ...prev, current_price: priceData.close.toString() }));
      toast(`Fetched latest price for ${form.symbol}: ${priceData.close} SAR`, "success");
    } catch (e) {
      console.log("No price found for symbol:", form.symbol);
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
      ? ((parseFloat(form.current_price) - parseFloat(form.buy_price)) /
          parseFloat(form.buy_price)) *
        100
      : null;

  return (
    <>
      <style>{`
        /* ── Design System ── */
        :root {
          --bg:         #0a0d14;
          --surface:    #111827;
          --border:     #1f2937;
          --accent:     #3b82f6;
          --accent-dim: #1d4ed8;
          --text:       #f1f5f9;
          --muted:      #64748b;
          --green:      #22c55e;
          --red:        #ef4444;
          --amber:      #f59e0b;
          --radius:     12px;
          --font-mono:  'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
          --font-ui:    'DM Sans', 'Inter', system-ui, sans-serif;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: var(--bg);
          color: var(--text);
          font-family: var(--font-ui);
          min-height: 100vh;
        }

        .page {
          max-width: 960px;
          margin: 0 auto;
          padding: 48px 24px;
        }

        /* ── Header ── */
        .header {
          margin-bottom: 40px;
        }
        .header h1 {
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.5px;
          background: linear-gradient(135deg, #60a5fa, #818cf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .header p {
          color: var(--muted);
          margin-top: 6px;
          font-size: 14px;
          line-height: 1.6;
        }

        /* ── Layout ── */
        .layout {
          display: grid;
          grid-template-columns: 340px 1fr;
          gap: 24px;
          align-items: start;
        }
        @media (max-width: 700px) {
          .layout { grid-template-columns: 1fr; }
        }

        /* ── Card ── */
        .card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 28px;
        }
        .card-title {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 24px;
        }

        /* ── Form fields ── */
        .field { margin-bottom: 20px; }
        .field label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: var(--muted);
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }
        .input-wrap {
          display: flex;
          align-items: center;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 8px;
          overflow: hidden;
          transition: border-color 0.15s;
        }
        .input-wrap:focus-within { border-color: var(--accent); }
        .prefix {
          padding: 0 12px;
          font-size: 13px;
          color: var(--muted);
          border-right: 1px solid var(--border);
          height: 100%;
          display: flex;
          align-items: center;
          font-family: var(--font-mono);
        }
        input {
          background: transparent;
          border: none;
          color: var(--text);
          font-size: 15px;
          font-family: var(--font-mono);
          padding: 11px 14px;
          width: 100%;
          outline: none;
        }
        input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; }

        /* ── Gain badge ── */
        .gain-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 24px;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 13px;
          font-family: var(--font-mono);
        }
        .gain-badge.positive { background: #22c55e11; border: 1px solid #22c55e33; color: var(--green); }
        .gain-badge.negative { background: #ef444411; border: 1px solid #ef444433; color: var(--red); }
        .gain-badge.neutral  { background: #64748b11; border: 1px solid var(--border); color: var(--muted); }

        /* ── Button ── */
        button.calc-btn {
          width: 100%;
          padding: 13px;
          background: linear-gradient(135deg, var(--accent), var(--accent-dim));
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          letter-spacing: 0.5px;
          transition: opacity 0.15s, transform 0.1s;
        }
        button.calc-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        button.calc-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        /* ── Error ── */
        .error-msg {
          margin-top: 16px;
          padding: 12px 16px;
          background: #ef444411;
          border: 1px solid #ef444433;
          border-radius: 8px;
          color: var(--red);
          font-size: 13px;
        }

        /* ── Results ── */
        .results { padding-top: 4px; }
        .stop-badge {
          display: flex;
          align-items: baseline;
          gap: 12px;
          padding: 20px 24px;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 10px;
          margin-bottom: 20px;
        }
        .stop-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--muted);
        }
        .stop-value {
          font-size: 28px;
          font-family: var(--font-mono);
          font-weight: 700;
          color: var(--red);
        }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 14px;
        }
        th {
          text-align: left;
          padding: 10px 14px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: var(--muted);
          border-bottom: 1px solid var(--border);
        }
        td {
          padding: 16px 14px;
          border-bottom: 1px solid var(--border);
          vertical-align: middle;
        }
        tr:last-child td { border-bottom: none; }
        tr:hover td { background: rgba(255,255,255,0.02); }
        .level { font-weight: 500; }
        .shares { font-family: var(--font-mono); font-size: 15px; color: var(--accent); }
        .eff-stop { font-family: var(--font-mono); font-size: 15px; font-weight: 600; }
        .pill {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        /* ── Empty state ── */
        .empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 280px;
          color: var(--muted);
          text-align: center;
          gap: 12px;
        }
        .empty svg { opacity: 0.3; }
        .empty p { font-size: 14px; }

        /* ── Loading ── */
        .spinner {
          width: 36px;
          height: 36px;
          border: 3px solid var(--border);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          margin: 0 auto 12px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Formula note ── */
        .formula-note {
          margin-top: 24px;
          padding: 16px;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 10px;
          font-size: 12px;
          color: var(--muted);
          font-family: var(--font-mono);
          line-height: 1.8;
        }
        .formula-note strong { color: var(--accent); }
      `}</style>

      <div className="page">
        <div className="header">
          <h1>Risk Finance Calculator</h1>
          <p>
            Determines how many shares to sell at each profit-lock level (100/75/50/25 %) to achieve
            breakeven or reduce effective risk — extracted from the{" "}
            <em>Risk Finance Calculator</em> workbook sheet.
          </p>
        </div>

        <div className="layout">
          {/* ── INPUT PANEL ── */}
          <div className="card">
            <div className="card-title">Inputs</div>

            {gain !== null && (
              <div className={`gain-badge ${gain > 0 ? "positive" : gain < 0 ? "negative" : "neutral"}`}>
                <span>Current gain:</span>
                <strong>{gain >= 0 ? "+" : ""}{fmt(gain, 2)}%</strong>
              </div>
            )}

            <Field label="Symbol (Auto-fetch)" name="symbol" value={form.symbol} onChange={handleChange} onBlur={handleSymbolBlur} type="text" />
            <Field label="Buy Price"     name="buy_price"     value={form.buy_price}     onChange={handleChange} prefix="SAR" />
            <Field label="# Shares"      name="num_shares"    value={form.num_shares}    onChange={handleChange} />
            <Field label="Stop Price"    name="stop_price"    value={form.stop_price}    onChange={handleChange} prefix="SAR" />
            <Field label="Current Price" name="current_price" value={form.current_price} onChange={handleChange} prefix="SAR" />

            <button className="calc-btn" onClick={handleSubmit} disabled={isPending}>
              {isPending ? "Calculating…" : "Calculate"}
            </button>

            {error && <div className="error-msg">⚠ {error}</div>}

            <div className="formula-note">
              <strong>Formula (shares to sell at X%):</strong><br />
              {"((buy - stop) × shares × X%) ÷ (current - stop)"}<br /><br />
              <strong>Effective stop after partial exit:</strong><br />
              {"(buy − ((sold×current + (n−sold)×stop) / n)) ÷ buy"}
            </div>
          </div>

          {/* ── RESULTS PANEL ── */}
          <div className="card">
            <div className="card-title">Results</div>

            {isPending && (
              <div className="empty">
                <div className="spinner" />
                <p>Running calculations…</p>
              </div>
            )}

            {!isPending && !result && (
              <div className="empty">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 7H6a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-3" />
                  <path d="M9 15h3l8.5-8.5a1.5 1.5 0 00-3-3L9 12v3" />
                  <path d="M16 5l3 3" />
                </svg>
                <p>Enter your position details and click Calculate</p>
              </div>
            )}

            {!isPending && result && <ResultsTable data={result} />}
          </div>
        </div>
      </div>
    </>
  );
}

/*
 * ─────────────────────────────────────────────────────────────
 *  STATE MANAGEMENT RECOMMENDATION
 * ─────────────────────────────────────────────────────────────
 *
 *  This page uses local useState — sufficient for a single-page calculator.
 *
 *  For cross-page state sharing (e.g., RBAF results feeding into Portfolio page),
 *  use Zustand:
 *
 *    // store/useFinanceStore.ts
 *    import { create } from "zustand"
 *    import type { RBAFResponse, RiskFinanceResponse } from "@/types/api"
 *
 *    interface FinanceStore {
 *      rbafResult: RBAFResponse | null
 *      riskResult: RiskFinanceResponse | null
 *      setRBAF: (r: RBAFResponse) => void
 *      setRisk: (r: RiskFinanceResponse) => void
 *    }
 *
 *    export const useFinanceStore = create<FinanceStore>((set) => ({
 *      rbafResult: null,
 *      riskResult: null,
 *      setRBAF: (r) => set({ rbafResult: r }),
 *      setRisk: (r) => set({ riskResult: r }),
 *    }))
 *
 *  Access anywhere with:
 *    const { rbafResult, setRBAF } = useFinanceStore()
 *
 *  Persist to localStorage if needed:
 *    import { persist } from "zustand/middleware"
 *    create(persist(…, { name: "finance-store" }))
 */
