"use client";

import { useState, useTransition, useCallback, useEffect } from "react";
import type { RBAFResponse } from "@/types/wallet";
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

const fmt = (n?: number, decimals = 2) => n === undefined ? "0" : n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
const pct = (n?: number) => n === undefined ? "0.00%" : `${(n * 100).toFixed(2)}%`;

const parseInput = (val: string): number => {
  const clean = val.replace(/,/g, "").trim();
  if (clean.endsWith("%")) {
    return parseFloat(clean.slice(0, -1)) / 100;
  }
  return parseFloat(clean);
};

function Field({ label, name, value, onChange, prefix }: any) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <div className="input-wrap">
        {prefix && <span className="prefix">{prefix}</span>}
        <input id={name} type="text" value={value} onChange={(e) => onChange(name, e.target.value)} />
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
      // Optionally auto-calculate on load
      handleSubmitWithData(saved);
    } catch (e) {
      console.error("Failed to load RBAF settings", e);
    }
  };

  const handleChange = useCallback((name: keyof FormState, value: string) => setForm((prev) => ({ ...prev, [name]: value })), []);

  const handleSubmitWithData = (data: any) => {
    setError(null);
    startTransition(async () => {
      try {
        const res = await calcRBAF(data);
        setResult(res);
      } catch (e: any) {
        setError(e.message || "Unknown error");
      }
    });
  };

  const handleSubmit = () => {
    handleSubmitWithData({
      portfolio_size: parseInput(form.portfolio_size),
      portfolio_pct: parseInput(form.portfolio_pct),
      desired_return: parseInput(form.desired_return),
      avg_pct_gain: parseInput(form.avg_pct_gain),
      avg_pct_loss: parseInput(form.avg_pct_loss),
      win_rate: parseInput(form.win_rate),
      risk_of_rote: parseInput(form.risk_of_rote),
      optimal_f: parseInput(form.optimal_f),
    });
  };

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
        .page { max-width: 1000px; margin: 0 auto; padding: 48px 24px; }
        .header { margin-bottom: 40px; }
        .header h1 { font-size: 28px; font-weight: 700; background: linear-gradient(135deg, #60a5fa, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .header p { color: var(--muted); margin-top: 6px; font-size: 14px; }
        .layout { display: grid; grid-template-columns: 340px 1fr; gap: 24px; align-items: start; }
        @media (max-width: 800px) { .layout { grid-template-columns: 1fr; } }
        .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 28px; }
        .card-title { font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: var(--muted); margin-bottom: 24px; }
        .field { margin-bottom: 20px; }
        .field label { display: block; font-size: 12px; font-weight: 500; color: var(--muted); margin-bottom: 8px; text-transform: uppercase; }
        .input-wrap { display: flex; align-items: center; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; overflow: hidden; transition: border-color 0.15s; }
        .input-wrap:focus-within { border-color: var(--accent); }
        .prefix { padding: 0 12px; font-size: 13px; color: var(--muted); border-right: 1px solid var(--border); height: 100%; display: flex; align-items: center; font-family: var(--font-mono); }
        input { background: transparent; border: none; color: var(--text); font-size: 15px; font-family: var(--font-mono); padding: 11px 14px; width: 100%; outline: none; }
        button.calc-btn { width: 100%; padding: 13px; background: linear-gradient(135deg, var(--accent), var(--accent-dim)); color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: opacity 0.15s, transform 0.1s; }
        button.calc-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .error-msg { margin-top: 16px; padding: 12px 16px; background: #ef444411; border: 1px solid #ef444433; border-radius: 8px; color: var(--red); font-size: 13px; }
        .empty { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 280px; color: var(--muted); text-align: center; gap: 12px; }
        .spinner { width: 36px; height: 36px; border: 3px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.7s linear infinite; margin: 0 auto 12px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        .results-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px; }
        .metric-box { background: var(--bg); border: 1px solid var(--border); border-radius: 10px; padding: 16px; display: flex; flex-direction: column; gap: 8px; }
        .metric-label { font-size: 11px; text-transform: uppercase; color: var(--muted); letter-spacing: 0.5px; }
        .metric-value { font-size: 24px; font-family: var(--font-mono); font-weight: 700; color: var(--text); }
        .metric-value.green { color: var(--green); }
        .metric-value.accent { color: var(--accent); }
        .metric-value.amber { color: var(--amber); }

        table { width: 100%; border-collapse: collapse; font-size: 14px; margin-top: 16px; }
        th { text-align: left; padding: 10px 14px; font-size: 11px; font-weight: 600; color: var(--muted); border-bottom: 1px solid var(--border); text-transform: uppercase; }
        td { padding: 16px 14px; border-bottom: 1px solid var(--border); }
        tr:last-child td { border-bottom: none; }
        .mono-val { font-family: var(--font-mono); font-weight: 600; color: var(--accent); }
      `}</style>

      <div className="page">
        <div className="header">
          <h1>Risk-Based Allocation Framework (RBAF)</h1>
          <p>Calculates optimal position sizing, expected returns, and path to your portfolio goal.</p>
        </div>

        <div className="layout">
          <div className="card">
            <div className="card-title">Inputs</div>
            <Field label="Portfolio Size" name="portfolio_size" value={form.portfolio_size} onChange={handleChange} prefix="SAR" />
            <Field label="Portfolio % to Deploy" name="portfolio_pct" value={form.portfolio_pct} onChange={handleChange} />
            <Field label="Desired Return Multiplier" name="desired_return" value={form.desired_return} onChange={handleChange} />
            <Field label="Avg % Gain (Winners)" name="avg_pct_gain" value={form.avg_pct_gain} onChange={handleChange} />
            <Field label="Avg % Loss (Losers)" name="avg_pct_loss" value={form.avg_pct_loss} onChange={handleChange} />
            <Field label="Win Rate" name="win_rate" value={form.win_rate} onChange={handleChange} />
            <Field label="Risk of ROTE" name="risk_of_rote" value={form.risk_of_rote} onChange={handleChange} />
            <Field label="Optimal f" name="optimal_f" value={form.optimal_f} onChange={handleChange} />
            
            <button className="calc-btn" onClick={handleSubmit} disabled={isPending}>
              {isPending ? "Calculating…" : "Calculate RBAF"}
            </button>
            {error && <div className="error-msg">⚠ {error}</div>}
          </div>

          <div className="card">
            <div className="card-title">Analysis Results</div>
            {isPending && <div className="empty"><div className="spinner" /><p>Analyzing system edge…</p></div>}
            {!isPending && !result && <div className="empty"><p>Enter parameters and click Calculate</p></div>}
            
            {!isPending && result && (
              <div>
                <div className="results-grid">
                  <div className="metric-box">
                    <span className="metric-label">Goal (Target Return)</span>
                    <span className="metric-value green">SAR {fmt(result.goal, 0)}</span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-label">Trades to Reach Goal</span>
                    <span className="metric-value accent">{result.trades_to_reach_goal}</span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-label">Optimal f (Kelly)</span>
                    <span className="metric-value amber">{pct(result.optimal_f)}</span>
                  </div>
                  <div className="metric-box">
                    <span className="metric-label">Adj. Gain/Loss Ratio</span>
                    <span className="metric-value">{result.adjusted_gain_loss_ratio.toFixed(2)}</span>
                  </div>
                </div>

                <div className="card-title" style={{ marginTop: '24px' }}>Position Sizing Strategy</div>
                <table>
                  <thead>
                    <tr><th>Size Type</th><th>Amount (SAR)</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>Quarter Position (25%)</td><td className="mono-val">{fmt(result.quarter_position_sar, 2)}</td></tr>
                    <tr><td>Half Position (50%)</td><td className="mono-val">{fmt(result.half_position_sar, 2)}</td></tr>
                    <tr><td>Full Position (100%)</td><td className="mono-val">{fmt(result.full_position_sar, 2)}</td></tr>
                  </tbody>
                </table>

                <div className="card-title" style={{ marginTop: '32px' }}>Expectancy Metrics</div>
                <table>
                  <tbody>
                    <tr><td>Avg Gain on Winning Trades</td><td className="mono-val">SAR {fmt(result.avg_gain_on_winners, 0)}</td></tr>
                    <tr><td>Avg Loss on Losing Trades</td><td className="mono-val">SAR {fmt(result.avg_loss_on_losers, 0)}</td></tr>
                    <tr><td>Win / Loss Ratio (Monetary)</td><td className="mono-val">{fmt(result.gain_loss_ratio, 2)}</td></tr>
                    <tr><td>Expected Net % Per Trade</td><td className="mono-val">{pct(result.expected_net_pct_per_trade)}</td></tr>
                    <tr><td>Expected Net Return Per Trade</td><td className="mono-val">SAR {fmt(result.expected_net_return_per_trade, 0)}</td></tr>
                    <tr><td>Avg Winners / Losers (Count)</td><td className="mono-val">{fmt(result.num_winning_trades, 0)} / {fmt(result.num_losing_trades, 0)}</td></tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
