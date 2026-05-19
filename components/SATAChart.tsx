"use client";
import { useEffect, useState } from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";

interface BandInfo { label: string; score: number; status: "positive" | "negative"; }
interface SATASummary {
  last_date: string; sata_score: number; stage: string; stage_label: string;
  stage_emoji: string; mansfield_rs: number | null; rsi: number | null;
  bands: Record<string, BandInfo>;
}
interface SATAPoint {
  date: string; close: number; sata_score: number; stage: string;
  b10_breakout: number; b09_above_30w: number; b08_above_40w: number;
  b07_30w_rising: number; b06_40w_rising: number; b05_mrs_positive: number;
  b04_macd_bull: number; b03_rsi_above50: number; b02_vol_expand: number;
  b01_resistance_clear: number;
}
interface SATAResponse {
  symbol: string; benchmark: string; timeframe: string;
  summary: SATASummary; data: SATAPoint[]; total_bars: number;
}
interface Props { symbol: string; benchmark?: string; startDate?: string; }

const BAND_KEYS = [
  "b10_breakout", "b09_above_30w", "b08_above_40w", "b07_30w_rising",
  "b06_40w_rising", "b05_mrs_positive", "b04_macd_bull", "b03_rsi_above50",
  "b02_vol_expand", "b01_resistance_clear",
] as const;

const BAND_LABELS: Record<string, string> = {
  b10_breakout: "Breakout", b09_above_30w: "Close > 30w WMA",
  b08_above_40w: "Close > 40w WMA", b07_30w_rising: "30w WMA Rising",
  b06_40w_rising: "30w > 40w WMA", b05_mrs_positive: "Mansfield RS > 0",
  b04_macd_bull: "MACD Bullish", b03_rsi_above50: "RSI > 50",
  b02_vol_expand: "Volume > Avg", b01_resistance_clear: "New 52w High",
};

const STAGE_COLORS: Record<string, string> = {
  stage_1: "#d97706", stage_2: "#16a34a", stage_3: "#ea580c", stage_4: "#dc2626",
};

function getScoreColor(score: number): string {
  if (score >= 7) return "#16a34a";
  if (score >= 4) return "#d97706";
  return "#dc2626";
}

function formatTick(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`;
}

function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (!values.length) return null;
  const w = 40, h = 24;
  const min = Math.min(...values), max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} className="opacity-80">
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ScoreGauge({ score, stage, stageLabel, stageEmoji }: { score: number; stage: string; stageLabel: string; stageEmoji: string }) {
  const pct = (score / 10) * 100;
  const color = getScoreColor(score);
  const stageColor = STAGE_COLORS[stage] || "#94a3b8";
  return (
    <div className="flex items-center gap-6">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="8" />
          <circle cx="50" cy="50" r="42" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${pct * 2.64} 264`} className="transition-all duration-700" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-900">{score}</span>
          <span className="text-[10px] text-slate-400">/ 10</span>
        </div>
      </div>
      <div>
        <p className="text-slate-400 text-xs mb-1 font-medium">Current Stage</p>
        <p className="text-lg font-bold" style={{ color: stageColor }}>{stageEmoji} {stageLabel}</p>
        <div className="flex items-center gap-2 mt-2">
          <div className="w-32 bg-slate-100 rounded-full h-2">
            <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
          </div>
          <span className="text-xs text-slate-400">{score}/10</span>
        </div>
      </div>
    </div>
  );
}

function BandsGrid({ bands }: { bands: Record<string, BandInfo> }) {
  return (
    <div className="grid grid-cols-5 md:grid-cols-10 gap-1.5">
      {BAND_KEYS.map((key) => {
        const band = bands[key];
        if (!band) return null;
        const isPos = band.score === 1;
        return (
          <div key={key} className="flex flex-col items-center gap-1 p-2 rounded-xl border transition-all" style={{ background: isPos ? "rgba(22,163,74,0.06)" : "rgba(220,38,38,0.05)", borderColor: isPos ? "rgba(22,163,74,0.2)" : "rgba(220,38,38,0.15)" }}>
            <div className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold" style={{ background: isPos ? "#16a34a" : "#dc2626", color: "#fff" }}>{isPos ? "✓" : "✗"}</div>
            <span className="text-[9px] text-slate-400 text-center leading-tight">{BAND_LABELS[key] || key}</span>
          </div>
        );
      })}
    </div>
  );
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d: SATAPoint = payload[0]?.payload;
  if (!d) return null;
  const stageColor = STAGE_COLORS[d.stage] || "#94a3b8";
  return (
    <div style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", borderRadius: 12, padding: "12px 14px", minWidth: 210, fontSize: 12 }}>
      <p style={{ color: "#94a3b8", marginBottom: 8 }}>{formatTick(d.date)} (Weekly)</p>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 6 }}>
        <span style={{ color: "#94a3b8" }}>SATA Score</span>
        <span style={{ fontFamily: "monospace", fontWeight: 700, color: getScoreColor(d.sata_score) }}>{d.sata_score} / 10</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 8 }}>
        <span style={{ color: "#94a3b8" }}>Close</span>
        <span style={{ color: "#334155", fontFamily: "monospace", fontWeight: 600 }}>{d.close.toFixed(2)}</span>
      </div>
      <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 8, marginBottom: 8 }}>
        <span style={{ fontWeight: 700, fontSize: 11, color: stageColor }}>{d.stage.replace("_", " ").toUpperCase()}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px 12px" }}>
        {BAND_KEYS.map(key => {
          const val = d[key as keyof SATAPoint] as number;
          return (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: val === 1 ? "#16a34a" : "#dc2626", display: "inline-block" }} />
              <span style={{ color: "#94a3b8", fontSize: 10 }}>{BAND_LABELS[key]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function SATAChart({ symbol, benchmark = "^TASI.SR", startDate = "2018-01-01" }: Props) {
  const [data, setData] = useState<SATAPoint[]>([]);
  const [summary, setSummary] = useState<SATASummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); setError(null);
      try {
        const params = new URLSearchParams({ symbol, benchmark, start_date: startDate });
        const res = await fetch(`/api/indicators/sata?${params}`, { credentials: "include" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: SATAResponse = await res.json();
        setData(json.data); setSummary(json.summary);
      } catch (e: any) { setError(e.message); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [symbol, benchmark, startDate]);

  if (loading) return (
    <div className="flex items-center justify-center h-72 bg-white rounded-2xl border border-slate-200 shadow-sm">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-400 text-sm">Loading SATA...</p>
      </div>
    </div>
  );
  if (error) return (
    <div className="flex items-center justify-center h-72 bg-white rounded-2xl border border-red-200 shadow-sm">
      <p className="text-red-500 text-sm">❌ {error}</p>
    </div>
  );

  const displayData = data.length > 150 ? data.slice(-150) : data;
  const sparkData = displayData.slice(-30).map(d => d.sata_score);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <style>{`@keyframes fadeSlideUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}.chart-enter{animation:fadeSlideUp 0.4s ease-out}`}</style>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-slate-900 font-bold text-base">SATA & Stage Analysis — <span className="text-amber-600">{symbol}</span></h2>
        </div>
      </div>
      {summary && (
        <div className="space-y-4 mb-6">
          <div className="flex flex-col md:flex-row gap-6 items-start p-4 bg-slate-50 rounded-xl border border-slate-200">
            <ScoreGauge score={summary.sata_score} stage={summary.stage} stageLabel={summary.stage_label} stageEmoji={summary.stage_emoji} />
            <div className="flex-1">
              <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-widest mb-2">The 10 Components (Bands)</p>
              <BandsGrid bands={summary.bands} />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
              <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wide mb-1">Mansfield RS</p>
              <p className={`text-lg font-mono font-bold ${(summary.mansfield_rs ?? 0) > 0 ? "text-emerald-600" : "text-red-500"}`}>{summary.mansfield_rs != null ? (summary.mansfield_rs > 0 ? "+" : "") + summary.mansfield_rs.toFixed(2) : "—"}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
              <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wide mb-1">RSI (14w)</p>
              <p className={`text-lg font-mono font-bold ${(summary.rsi ?? 0) > 50 ? "text-emerald-600" : "text-red-500"}`}>{summary.rsi?.toFixed(1) ?? "—"}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
              <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wide mb-1">SATA Score</p>
              <div className="flex items-end justify-between">
                <p className="text-lg font-mono font-bold" style={{ color: getScoreColor(summary.sata_score) }}>{summary.sata_score} / 10</p>
                <Sparkline values={sparkData} color={getScoreColor(summary.sata_score)} />
              </div>
            </div>
            <div className="rounded-xl p-3 border border-slate-200" style={{ background: `${STAGE_COLORS[summary.stage]}08`, borderColor: `${STAGE_COLORS[summary.stage]}25` }}>
              <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wide mb-1">Last Date</p>
              <p className="text-slate-700 text-sm font-mono font-semibold">{summary.last_date}</p>
            </div>
          </div>
        </div>
      )}
      <div className="chart-enter">
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={displayData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="sataBars1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d97706" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#d97706" stopOpacity={0.2} />
              </linearGradient>
              <linearGradient id="sataBars2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#16a34a" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#16a34a" stopOpacity={0.2} />
              </linearGradient>
              <linearGradient id="sataBars3" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ea580c" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#ea580c" stopOpacity={0.2} />
              </linearGradient>
              <linearGradient id="sataBars4" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#dc2626" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#dc2626" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 10 }} tickLine={false} axisLine={false} interval={Math.floor(displayData.length / 6)} tickFormatter={formatTick} />
            <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} tick={{ fill: "#94a3b8", fontSize: 10 }} tickLine={false} axisLine={false} width={28} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#94a3b8", strokeWidth: 1, strokeDasharray: "4 4" }} />
            <ReferenceLine y={7} stroke="#16a34a" strokeDasharray="6 3" strokeOpacity={0.5} />
            <ReferenceLine y={3} stroke="#dc2626" strokeDasharray="6 3" strokeOpacity={0.5} />
            <Bar dataKey="sata_score" name="SATA Score" maxBarSize={10} radius={[3, 3, 0, 0]}>
              {displayData.map((d, i) => {
                const gradMap: Record<string, string> = { stage_1: "url(#sataBars1)", stage_2: "url(#sataBars2)", stage_3: "url(#sataBars3)", stage_4: "url(#sataBars4)" };
                return <Cell key={i} fill={gradMap[d.stage] || "url(#sataBars1)"} />;
              })}
            </Bar>
            <Line type="monotone" dataKey="sata_score" stroke="#1e293b" strokeWidth={1.5} dot={false} activeDot={{ r: 3 }} name="Score" connectNulls />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-4 mt-3 text-[11px] text-slate-400 flex-wrap">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: "#d97706" }} /> Stage 1 — Accumulation</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: "#16a34a" }} /> Stage 2 — Advancing</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: "#ea580c" }} /> Stage 3 — Distribution</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: "#dc2626" }} /> Stage 4 — Declining</span>
        <span className="ml-auto">{displayData.length} Weeks</span>
      </div>
    </div>
  );
}