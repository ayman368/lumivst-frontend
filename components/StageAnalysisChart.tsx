"use client";
import { useEffect, useState, useMemo } from "react";
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface StagePoint {
  date: string; open: number | null; high: number | null; low: number | null;
  close: number; sma_30w: number | null; sma_40w: number | null;
  sata_score: number; stage: string;
}
interface StageSummary {
  last_date: string; sata_score: number; stage: string; stage_label: string;
  stage_emoji: string; mansfield_rs: number | null; rsi: number | null;
}
interface StageResponse {
  symbol: string; benchmark: string; summary: StageSummary;
  data: StagePoint[]; total_bars: number;
}
interface Props { symbol: string; benchmark?: string; startDate?: string; }

const STAGE_COLORS: Record<string, string> = {
  stage_1: "#d97706", stage_2: "#16a34a", stage_3: "#ea580c", stage_4: "#dc2626",
};
const STAGE_NAMES: Record<string, string> = {
  stage_1: "S1 — Accumulation", stage_2: "S2 — Advancing",
  stage_3: "S3 — Distribution", stage_4: "S4 — Declining",
};

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

function StageDot(props: any) {
  const { cx, cy, payload } = props;
  if (!cx || !cy || !payload) return null;
  const color = STAGE_COLORS[payload.stage] || "#94a3b8";
  return <circle cx={cx} cy={cy} r={4} fill={color} stroke="#fff" strokeWidth={1.5} />;
}

function StageActiveDot(props: any) {
  const { cx, cy, payload } = props;
  if (!cx || !cy || !payload) return null;
  const color = STAGE_COLORS[payload.stage] || "#94a3b8";
  return (
    <>
      <circle cx={cx} cy={cy} r={10} fill={color} fillOpacity={0.15} />
      <circle cx={cx} cy={cy} r={5} fill={color} stroke="#fff" strokeWidth={2} />
    </>
  );
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d: StagePoint = payload[0]?.payload;
  if (!d) return null;
  const stageColor = STAGE_COLORS[d.stage] || "#94a3b8";
  return (
    <div style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", borderRadius: 12, padding: "12px 14px", minWidth: 190, fontSize: 12 }}>
      <p style={{ color: "#94a3b8", marginBottom: 8, fontWeight: 500 }}>{d.date} (Weekly)</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px", marginBottom: 8 }}>
        <span style={{ color: "#94a3b8" }}>Open</span><span style={{ color: "#334155", fontFamily: "monospace", textAlign: "right" }}>{d.open?.toFixed(2) ?? "—"}</span>
        <span style={{ color: "#94a3b8" }}>High</span><span style={{ color: "#334155", fontFamily: "monospace", textAlign: "right" }}>{d.high?.toFixed(2) ?? "—"}</span>
        <span style={{ color: "#94a3b8" }}>Low</span><span style={{ color: "#334155", fontFamily: "monospace", textAlign: "right" }}>{d.low?.toFixed(2) ?? "—"}</span>
        <span style={{ color: "#94a3b8" }}>Close</span><span style={{ color: "#1e293b", fontFamily: "monospace", fontWeight: 700, textAlign: "right" }}>{d.close.toFixed(2)}</span>
      </div>
      <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 8, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 16px", marginBottom: 8 }}>
        <span style={{ color: "#94a3b8" }}>30w WMA</span><span style={{ color: "#3b82f6", fontFamily: "monospace", textAlign: "right" }}>{d.sma_30w?.toFixed(2) ?? "—"}</span>
        <span style={{ color: "#94a3b8" }}>40w WMA</span><span style={{ color: "#a855f7", fontFamily: "monospace", textAlign: "right" }}>{d.sma_40w?.toFixed(2) ?? "—"}</span>
        <span style={{ color: "#94a3b8" }}>SATA Score</span><span style={{ fontFamily: "monospace", fontWeight: 700, color: stageColor, textAlign: "right" }}>{d.sata_score}/10</span>
      </div>
      <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: stageColor, display: "inline-block" }} />
        <span style={{ fontWeight: 700, color: stageColor }}>{STAGE_NAMES[d.stage] || d.stage}</span>
      </div>
    </div>
  );
};

export default function StageAnalysisChart({ symbol, benchmark = "^TASI.SR", startDate = "2018-01-01" }: Props) {
  const [data, setData] = useState<StagePoint[]>([]);
  const [summary, setSummary] = useState<StageSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); setError(null);
      try {
        const params = new URLSearchParams({ symbol, benchmark, start_date: startDate });
        const res = await fetch(`/api/indicators/sata?${params}`, { credentials: "include" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: StageResponse = await res.json();
        setData(json.data); setSummary(json.summary);
      } catch (e: any) { setError(e.message); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [symbol, benchmark, startDate]);

  const displayData = useMemo(() => {
    const d = data.length > 150 ? data.slice(-150) : data;
    return d.map(p => ({ ...p, dotY: p.sma_30w }));
  }, [data]);

  const { yMin, yMax } = useMemo(() => {
    const prices = displayData.flatMap(d => [d.high, d.low, d.sma_30w, d.sma_40w].filter(v => v != null)) as number[];
    if (!prices.length) return { yMin: 0, yMax: 100 };
    return { yMin: Math.min(...prices) * 0.95, yMax: Math.max(...prices) * 1.05 };
  }, [displayData]);

  if (loading) return (
    <div className="flex items-center justify-center h-96 bg-white rounded-2xl border border-slate-200 shadow-sm">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-400 text-sm">Loading Stage Analysis...</p>
      </div>
    </div>
  );
  if (error) return (
    <div className="flex items-center justify-center h-96 bg-white rounded-2xl border border-red-200 shadow-sm">
      <p className="text-red-500 text-sm">❌ {error}</p>
    </div>
  );

  const stageColor = summary ? STAGE_COLORS[summary.stage] || "#94a3b8" : "#94a3b8";
  const sparkData = displayData.slice(-30).map(d => d.close);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <style>{`@keyframes fadeSlideUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}.chart-enter{animation:fadeSlideUp 0.4s ease-out}`}</style>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-slate-900 font-bold text-base">Stage Analysis — <span className="text-cyan-600">{symbol}</span></h2>
        </div>
        {summary && (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wide">Current Stage</p>
              <p className="font-bold text-sm mt-0.5" style={{ color: stageColor }}>{summary.stage_emoji} {summary.stage_label}</p>
            </div>
            <div className="w-14 h-14 rounded-xl flex flex-col items-center justify-center border" style={{ background: `${stageColor}0d`, borderColor: `${stageColor}30` }}>
              <span className="text-xl font-bold" style={{ color: stageColor }}>{summary.sata_score}</span>
              <span className="text-[9px] text-slate-400">/10</span>
            </div>
          </div>
        )}
      </div>
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
            <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wide mb-1">Mansfield RS</p>
            <p className={`text-base font-mono font-bold ${(summary.mansfield_rs ?? 0) > 0 ? "text-emerald-600" : "text-red-500"}`}>{summary.mansfield_rs != null ? (summary.mansfield_rs > 0 ? "+" : "") + summary.mansfield_rs.toFixed(2) : "—"}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
            <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wide mb-1">RSI (14w)</p>
            <p className={`text-base font-mono font-bold ${(summary.rsi ?? 0) > 50 ? "text-emerald-600" : "text-red-500"}`}>{summary.rsi?.toFixed(1) ?? "—"}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
            <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wide mb-1">SATA Score</p>
            <p className="text-base font-mono font-bold" style={{ color: stageColor }}>{summary.sata_score} / 10</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
            <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wide mb-1">Price (Close)</p>
            <div className="flex items-end justify-between">
              <p className="text-slate-700 text-sm font-mono font-semibold">{summary.last_date}</p>
              <Sparkline values={sparkData} color={stageColor} />
            </div>
          </div>
        </div>
      )}
      <div className="chart-enter">
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={displayData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 10 }} tickLine={false} axisLine={false} interval={Math.floor(displayData.length / 6)} tickFormatter={formatTick} />
            <YAxis domain={[yMin, yMax]} tick={{ fill: "#94a3b8", fontSize: 10 }} tickLine={false} axisLine={false} width={55} tickFormatter={(v: number) => v.toFixed(0)} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#94a3b8", strokeWidth: 1, strokeDasharray: "4 4" }} />
            <Line type="monotone" dataKey="close" stroke="#94a3b8" strokeWidth={1.5} dot={false} activeDot={false} name="Close" />
            <Line type="monotone" dataKey="sma_40w" stroke="#a855f7" strokeWidth={1.5} dot={false} strokeDasharray="6 3" activeDot={false} name="40w WMA" connectNulls />
            <Line type="monotone" dataKey="sma_30w" stroke="#3b82f6" strokeWidth={2} dot={<StageDot />} activeDot={<StageActiveDot />} name="30w WMA" connectNulls />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-4 mt-3 text-[11px] text-slate-400 flex-wrap">
        <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-slate-400 inline-block rounded" /> Close</span>
        <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-blue-500 inline-block rounded" /> 30w WMA</span>
        <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-violet-500 inline-block rounded opacity-70" /> 40w WMA</span>
        <span className="text-slate-300">|</span>
        {Object.entries(STAGE_NAMES).map(([key, label]) => (
          <span key={key} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full inline-block border-2 border-white shadow-sm" style={{ background: STAGE_COLORS[key] }} />
            {label}
          </span>
        ))}
        <span className="ml-auto">{displayData.length} Weeks</span>
      </div>
    </div>
  );
}