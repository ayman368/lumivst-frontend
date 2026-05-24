"use client";
import { useEffect, useState } from "react";
import { authFetch } from '@/lib/api/authFetch';
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Cell,
} from "recharts";

type ZoneType = "positive" | "neutral_rising" | "neutral_falling" | "negative";

interface MansfieldPoint {
  date: string; stock_close: number; bench_close: number;
  stock_div_bench: number; zero_line: number | null;
  mansfield_rs: number | null; zone: ZoneType; ma_rising: boolean;
  cross_above_zero: boolean; cross_below_zero: boolean; rs_up: boolean;
}

interface MansfieldSummary {
  last_date: string; mansfield_rs: number; stock_div_bench: number;
  zero_line: number; zone: ZoneType; ma_rising: boolean;
  above_zero: boolean; rs_up: boolean;
  last_cross_above: string | null; last_cross_below: string | null;
}

interface MansfieldRSResponse {
  symbol: string; benchmark: string; ma_length: number;
  timeframe: string; summary: MansfieldSummary;
  data: MansfieldPoint[]; total_bars: number;
}

interface Props {
  symbol: string; benchmark?: string; startDate?: string;
  maLength?: number; mode?: "flattened" | "unflattened";
}

const ZONE_CONFIG: Record<ZoneType, { color: string; bg: string; label: string; emoji: string; gradId: string }> = {
  positive: { color: "#22c55e", bg: "rgba(34,197,94,0.12)", label: "Outperforming Market", emoji: "🟢", gradId: "barGradPos" },
  neutral_rising: { color: "#3b82f6", bg: "rgba(59,130,246,0.12)", label: "Gradual Improvement", emoji: "🔵", gradId: "barGradNeutRise" },
  neutral_falling: { color: "#6b7280", bg: "rgba(107,114,128,0.08)", label: "Gradual Decline", emoji: "⚫", gradId: "barGradNeutFall" },
  negative: { color: "#ef4444", bg: "rgba(239,68,68,0.12)", label: "Underperforming Market", emoji: "🔴", gradId: "barGradNeg" },
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

const PremiumActiveDot = (props: any) => {
  const { cx, cy } = props;
  if (!cx || !cy) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={10} fill="#1e293b" fillOpacity={0.12} />
      <circle cx={cx} cy={cy} r={5} fill="#1e293b" stroke="#fff" strokeWidth={2} />
    </g>
  );
};

const CustomTooltip = ({ active, payload, mode }: any) => {
  if (!active || !payload?.length) return null;
  const d: MansfieldPoint = payload[0]?.payload;
  if (!d) return null;
  if (mode === "flattened" && d.mansfield_rs == null) return null;
  const zone = ZONE_CONFIG[d.zone];
  const isPos = mode === "unflattened" ? d.stock_div_bench > (d.zero_line ?? 0) : (d.mansfield_rs ?? 0) > 0;
  return (
    <div style={{
      background: "rgba(255,255,255,0.92)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      border: "1px solid rgba(0,0,0,0.08)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
      borderRadius: 12,
      padding: "12px 14px",
      minWidth: 190,
      fontSize: 12,
    }}>
      <p style={{ color: "#94a3b8", marginBottom: 8, fontWeight: 500 }}>{d.date} (Weekly)</p>
      {mode === "unflattened" ? (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 4 }}>
            <span style={{ color: "#94a3b8" }}>Stock / Bench</span>
            <span style={{ fontFamily: "monospace", fontWeight: 700, color: isPos ? "#059669" : "#ef4444" }}>{d.stock_div_bench.toFixed(2)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
            <span style={{ color: "#3b82f6", fontWeight: 500 }}>Zero Line (SMA)</span>
            <span style={{ color: "#3b82f6", fontFamily: "monospace" }}>{d.zero_line?.toFixed(2)}</span>
          </div>
        </>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 4 }}>
            <span style={{ color: "#64748b", fontWeight: 500 }}>Mansfield RS</span>
            <span style={{ fontFamily: "monospace", fontWeight: 700, color: isPos ? "#059669" : "#ef4444" }}>{(d.mansfield_rs ?? 0) > 0 ? "+" : ""}{d.mansfield_rs?.toFixed(2)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 4 }}>
            <span style={{ color: "#64748b" }}>Zero Line</span>
            <span style={{ color: "#3b82f6", fontFamily: "monospace" }}>{d.zero_line?.toFixed(2)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
            <span style={{ color: "#64748b" }}>Stock/Bench</span>
            <span style={{ color: "#475569", fontFamily: "monospace" }}>{d.stock_div_bench.toFixed(2)}</span>
          </div>
        </>
      )}
      <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #f1f5f9", display: "flex", flexWrap: "wrap", gap: 4 }}>
        <span style={{ background: zone.bg, color: zone.color, padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>{zone.emoji} {zone.label}</span>
        {d.cross_above_zero && <span style={{ background: "#dcfce7", color: "#15803d", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>↑ Crossed above Zero</span>}
        {d.cross_below_zero && <span style={{ background: "#fee2e2", color: "#dc2626", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>↓ Crossed below Zero</span>}
      </div>
    </div>
  );
};

const SummaryCards = ({ summary, maLength, sparkData }: { summary: MansfieldSummary; maLength: number; sparkData: number[] }) => {
  const zone = ZONE_CONFIG[summary.zone];
  const sparkColor = summary.above_zero ? "#22c55e" : "#ef4444";
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
        <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wide mb-1">Mansfield RS</p>
        <div className="flex items-end justify-between">
          <p className={`text-xl font-mono font-bold ${summary.above_zero ? "text-emerald-600" : "text-red-500"}`}>
            {summary.mansfield_rs > 0 ? "+" : ""}{summary.mansfield_rs.toFixed(2)}
          </p>
          <Sparkline values={sparkData} color={sparkColor} />
        </div>
      </div>
      <div className="rounded-xl p-3 border" style={{ background: zone.bg.replace("0.12", "0.04").replace("0.08", "0.04"), borderColor: zone.color + "30" }}>
        <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wide mb-1">Zone</p>
        <p className="font-bold text-sm" style={{ color: zone.color }}>{zone.emoji} {zone.label}</p>
      </div>
      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
        <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wide mb-1">Last Cross Above Zero</p>
        <p className="text-emerald-600 text-sm font-mono font-semibold">{summary.last_cross_above || "—"}</p>
      </div>
      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
        <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wide mb-1">Last Cross Below Zero</p>
        <p className="text-red-500 text-sm font-mono font-semibold">{summary.last_cross_below || "—"}</p>
      </div>
      <div className="col-span-2 md:col-span-4 bg-slate-50 rounded-xl p-3 border border-slate-200 flex flex-wrap items-center gap-4 text-sm">
        <span className="text-slate-500 font-medium">Zero Line ({maLength}w SMA):</span>
        <span className={`font-bold ${summary.ma_rising ? "text-emerald-600" : "text-red-500"}`}>{summary.ma_rising ? "📈 Rising" : "📉 Falling"}</span>
        <span className="text-slate-300">|</span>
        <span className="text-slate-500 font-medium">Position:</span>
        <span className={`font-bold ${summary.above_zero ? "text-emerald-600" : "text-red-500"}`}>{summary.above_zero ? "✅ Above Zero" : "⚠️ Below Zero"}</span>
        <span className="text-slate-300">|</span>
        <span className="text-slate-500 font-medium">Trend:</span>
        <span className={`font-bold ${summary.rs_up ? "text-blue-600" : "text-pink-600"}`}>{summary.rs_up ? "↑ Up" : "↓ Down"}</span>
      </div>
    </div>
  );
};

function getBarGradId(d: MansfieldPoint): string {
  if (d.mansfield_rs == null) return "barGradNeutFall";
  return ZONE_CONFIG[d.zone].gradId;
}

export default function MansfieldRSChart({
  symbol, benchmark = "^TASI.SR", startDate = "2018-01-01", maLength = 52, mode = "flattened",
}: Props) {
  const [data, setData] = useState<MansfieldPoint[]>([]);
  const [summary, setSummary] = useState<MansfieldSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<"flattened" | "unflattened">(mode);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); setError(null);
      try {
        const params = new URLSearchParams({ symbol, benchmark, start_date: startDate, ma_length: maLength.toString() });
        const res = await authFetch(`/api/indicators/mansfield-rs?${params}`, { credentials: "include" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: MansfieldRSResponse = await res.json();
        setData(json.data); setSummary(json.summary);
      } catch (e: any) { setError(e.message); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [symbol, benchmark, startDate, maLength]);

  if (loading) return (
    <div className="flex items-center justify-center h-72 bg-white rounded-2xl border border-slate-200 shadow-sm">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-400 text-sm">Loading Mansfield RS...</p>
      </div>
    </div>
  );
  if (error) return (
    <div className="flex items-center justify-center h-72 bg-white rounded-2xl border border-red-200 shadow-sm">
      <p className="text-red-500 text-sm">❌ {error}</p>
    </div>
  );

  const displayData = data.length > 300 ? data.slice(-300) : data;
  const isUnflattened = activeMode === "unflattened";
  const yValues = isUnflattened
    ? [...displayData.map(d => d.stock_div_bench), ...displayData.map(d => d.zero_line).filter((v): v is number => v != null)]
    : displayData.map(d => d.mansfield_rs).filter((v): v is number => v != null);
  const yMin = isUnflattened ? Math.min(...yValues) * 0.99 : Math.min(...yValues, 0) * 1.1;
  const yMax = isUnflattened ? Math.max(...yValues) * 1.01 : Math.max(...yValues, 0) * 1.1;
  const sparkData = displayData.slice(-30).map(d => d.mansfield_rs).filter((v): v is number => v != null);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <style>{`@keyframes fadeSlideUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}.chart-enter{animation:fadeSlideUp 0.4s ease-out}`}</style>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-slate-900 font-bold text-base">Mansfield RS — <span className="text-violet-600">{symbol}</span></h2>
        </div>
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 border border-slate-200 shadow-sm">
          <button onClick={() => setActiveMode("flattened")} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${!isUnflattened ? "bg-white text-slate-900 border border-slate-200 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>Flattened</button>
          <button onClick={() => setActiveMode("unflattened")} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${isUnflattened ? "bg-white text-slate-900 border border-slate-200 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>Original</button>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 text-[11px] font-medium mb-5">
        {Object.entries(ZONE_CONFIG).map(([key, val]) => (
          <span key={key} className="flex items-center gap-1.5" style={{ color: val.color }}>
            <span className="w-2 h-2 rounded-full" style={{ background: val.color }} /> {val.label}
          </span>
        ))}
      </div>
      {summary && <SummaryCards summary={summary} maLength={maLength} sparkData={sparkData} />}
      <div className="chart-enter">
        <ResponsiveContainer width="100%" height={380}>
          <ComposedChart data={displayData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              {/* Gradient bars for each zone */}
              <linearGradient id="barGradPos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0.2} />
              </linearGradient>
              <linearGradient id="barGradNeutRise" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.2} />
              </linearGradient>
              <linearGradient id="barGradNeutFall" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6b7280" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#6b7280" stopOpacity={0.2} />
              </linearGradient>
              <linearGradient id="barGradNeg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 10 }} tickLine={false} axisLine={false} interval={Math.floor(displayData.length / 6)} tickFormatter={formatTick} />
            <YAxis domain={[yMin, yMax]} tick={{ fill: "#94a3b8", fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => v.toFixed(1)} width={45} />
            <Tooltip content={<CustomTooltip mode={activeMode} />} cursor={{ stroke: "#94a3b8", strokeWidth: 1, strokeDasharray: "4 4" }} />
            {isUnflattened ? (
              <>
                <Line type="monotone" dataKey="zero_line" stroke="#3b82f6" strokeWidth={2} dot={false} name={`SMA(${maLength}) Zero Line`} connectNulls strokeDasharray="6 3" />
                <Line type="monotone" dataKey="stock_div_bench" stroke="#1e293b" strokeWidth={2} dot={false} activeDot={<PremiumActiveDot />} name="Stock / Bench × 100" connectNulls />
              </>
            ) : (
              <>
                <ReferenceLine y={0} stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="6 3" label={{ value: "Zero", fill: "#3b82f6", fontSize: 10, position: "insideTopRight" }} />
                <Bar dataKey="mansfield_rs" name="Mansfield RS" maxBarSize={8} radius={[3, 3, 0, 0]}>
                  {displayData.map((d, i) => (
                    <Cell key={i} fill={`url(#${getBarGradId(d)})`} />
                  ))}
                </Bar>
                <Line type="monotone" dataKey="mansfield_rs" stroke="#1e293b" strokeWidth={1.5} dot={false} activeDot={{ r: 3 }} name="RS Line" connectNulls />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-4 mt-4 text-[11px] text-slate-400">
        {isUnflattened ? (
          <>
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-slate-800 inline-block rounded" /> Stock/Bench</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-blue-500 inline-block rounded" /> Zero Line (SMA)</span>
          </>
        ) : null}
        <span className="ml-auto font-medium">{displayData.length} Weeks</span>
      </div>
    </div>
  );
}