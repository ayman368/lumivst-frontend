"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import RSLineChart from "@/components/RSLineChart";
import RSMACrossoverChart from "@/components/RSMACrossoverChart";
import MansfieldRSChart from "@/components/MansfieldRSChart";
import SATAChart from "@/components/SATAChart";
import StageAnalysisChart from "@/components/StageAnalysisChart";

// ─── Types ────────────────────────────────────────────────
interface StockOption { symbol: string; name: string; }

// ─── Icons ────────────────────────────────────────────────
const IconAll = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
  </svg>
);
const IconRS = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);
const IconCrossover = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6l6 6 4-4 8 8" /><path d="M3 18l6-6 4 4 8-8" />
  </svg>
);
const IconMansfield = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="20" x2="12" y2="4" /><polyline points="6 10 12 4 18 10" />
    <line x1="6" y1="20" x2="18" y2="20" />
  </svg>
);
const IconSATA = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);
const IconStage = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="2 20 7 10 12 16 16 8 22 4" />
  </svg>
);
const IconMenu = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);
const IconChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const IconClose = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ─── Nav Config ───────────────────────────────────────────
const NAV_ITEMS = [
  { key: "all", label: "Overview", icon: <IconAll />, accent: "#64748b", dot: "bg-slate-400" },
  { key: "traderlion", label: "TraderLion RS", icon: <IconRS />, accent: "#3b82f6", dot: "bg-blue-500" },
  { key: "crossover", label: "RS MA Crossover", icon: <IconCrossover />, accent: "#f97316", dot: "bg-orange-500" },
  { key: "mansfield", label: "Mansfield RS", icon: <IconMansfield />, accent: "#8b5cf6", dot: "bg-violet-500" },
  { key: "sata", label: "SATA Score", icon: <IconSATA />, accent: "#f59e0b", dot: "bg-amber-500" },
  { key: "stage", label: "Stage Analysis", icon: <IconStage />, accent: "#06b6d4", dot: "bg-cyan-500" },
] as const;

type NavKey = typeof NAV_ITEMS[number]["key"];

// ─── Stock Search ─────────────────────────────────────────
function StockSearch({ value, onChange }: { value: string; onChange: (sym: string) => void }) {
  const [query, setQuery] = useState(value);
  const [stocks, setStocks] = useState<StockOption[]>([]);
  const [filtered, setFiltered] = useState<StockOption[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/prices/latest", { credentials: "include" });
        if (!res.ok) return;
        const json = await res.json();
        const list: StockOption[] = (json.data || []).map((p: any) => ({
          symbol: String(p.symbol),
          name: p.company_name || "",
        }));
        list.sort((a, b) => a.symbol.localeCompare(b.symbol));
        setStocks(list);
        const match = list.find(s => s.symbol === value.replace(".SR", ""));
        if (match) setQuery(`${match.symbol} — ${match.name}`);
      } catch { } finally { setLoading(false); }
    })();
  }, []);

  useEffect(() => {
    if (!query.trim()) { setFiltered(stocks.slice(0, 30)); return; }
    const q = query.toLowerCase();
    const matches = stocks.filter(s =>
      s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
    ).slice(0, 30);
    setFiltered(matches);
  }, [query, stocks]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const select = (s: StockOption) => {
    setQuery(`${s.symbol} — ${s.name}`);
    onChange(`${s.symbol}.SR`);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={loading ? "Loading..." : "Search by symbol or name..."}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-sm pr-8 transition-all"
        />
        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-[100] w-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto divide-y divide-slate-100">
          {filtered.map(s => (
            <button key={s.symbol} onClick={() => select(s)}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors flex justify-between items-center">
              <span className="text-slate-900 font-mono font-semibold">{s.symbol}</span>
              <span className="text-slate-500 text-xs truncate ml-2 max-w-[60%]">{s.name}</span>
            </button>
          ))}
        </div>
      )}
      {open && filtered.length === 0 && query && !loading && (
        <div className="absolute z-[100] w-full mt-1.5 bg-white border border-slate-200 rounded-xl p-4 text-center text-slate-500 text-sm shadow-2xl">No results found</div>
      )}
    </div>
  );
}

// ─── Section Label ─────────────────────────────────────────
function SectionLabel({ color, text }: { color: string; text: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-1 h-4 rounded-full" style={{ background: color }} />
      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">{text}</span>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────
interface SidebarProps {
  activeKey: NavKey;
  onSelect: (key: NavKey) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

function Sidebar({
  activeKey, onSelect, collapsed, onToggleCollapse,
  mobileOpen, onMobileClose,
}: SidebarProps) {
  const activeItem = NAV_ITEMS.find(n => n.key === activeKey);

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white">
      {/* Logo + Collapse Toggle */}
      <div className={`flex items-center h-14 border-b border-slate-100 px-4 flex-shrink-0 ${collapsed ? "justify-center" : "justify-between"}`}>
        {!collapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
            </div>
            <div className="leading-tight overflow-hidden">
              <p className="text-[13px] font-bold text-slate-900 truncate">RS Indicators</p>
              <p className="text-[10px] text-slate-500">Saudi Market · TASI</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          </div>
        )}

        {/* Mobile close button */}
        <button
          onClick={onMobileClose}
          className="md:hidden flex w-7 h-7 rounded-lg items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all"
        >
          <IconClose />
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {!collapsed && (
          <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest px-3 pt-1 pb-2">Navigation</p>
        )}
        {NAV_ITEMS.map(item => {
          const isActive = activeKey === item.key;
          return (
            <button
              key={item.key}
              onClick={() => { onSelect(item.key); onMobileClose(); }}
              title={collapsed ? item.label : undefined}
              className={`
                w-full flex items-center rounded-xl transition-all duration-150 group relative
                ${collapsed ? "justify-center px-2 py-3" : "gap-3 px-3 py-2.5"}
                ${isActive
                  ? "bg-slate-100 text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }
              `}
              style={isActive ? { boxShadow: `inset 3px 0 0 ${item.accent}` } : {}}
            >
              {/* Active left accent bar (absolute for collapsed mode) */}
              {isActive && collapsed && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full"
                  style={{ background: item.accent }}
                />
              )}
              <span
                className="flex-shrink-0 transition-colors"
                style={isActive ? { color: item.accent } : {}}
              >
                {item.icon}
              </span>
              {!collapsed && (
                <div className="flex-1 text-left overflow-hidden">
                  <p className="text-[13px] font-semibold truncate leading-tight">{item.label}</p>
                </div>
              )}
              {!collapsed && isActive && (
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: item.accent }}
                />
              )}
            </button>
          );
        })}
      </nav>


    </div>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={onMobileClose}
        />
      )}
      
      {/* Sidebar Container */}
      <aside className={`
        fixed md:sticky top-0 h-screen bg-white border-r border-slate-200 z-50 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-xl md:shadow-none
        ${collapsed ? "w-16" : "w-72"}
        ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        {sidebarContent}
        
        {/* Toggle Button for Desktop (MarketSurge style) */}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex absolute top-1/2 -right-3.5 -translate-y-1/2 w-3.5 h-14 bg-white border border-slate-200 border-l-0 rounded-r-md items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all shadow-sm z-50 cursor-pointer"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <div className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
        </button>
      </aside>
    </>
  );
}

export default function RSLinePage() {
  const [activeTab, setActiveTab] = useState<NavKey>("all");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [symbol, setSymbol] = useState("2222.SR");
  const [startDate, setStartDate] = useState("2022-01-01");
  const [ma1Type, setMa1Type] = useState<"EMA" | "SMA">("EMA");
  const [ma1Period, setMa1Period] = useState(8);
  const [ma2Type, setMa2Type] = useState<"EMA" | "SMA">("SMA");
  const [ma2Period, setMa2Period] = useState(50);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar
        activeKey={activeTab}
        onSelect={setActiveTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-h-screen transition-all duration-300">
        {/* Top Header */}
        <div className="bg-white border-b border-slate-200 min-h-[64px] flex items-center px-4 md:px-6 sticky top-0 z-30 shadow-sm flex-shrink-0 gap-3 overflow-visible">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 flex-shrink-0"
          >
            <IconMenu />
          </button>
          
          <div className="flex-1 flex flex-row flex-wrap xl:flex-nowrap items-center gap-2 md:gap-4 py-2">
            <div className="w-[180px] md:w-[220px] flex-shrink-0 z-[100]">
              <StockSearch value={symbol} onChange={setSymbol} />
            </div>

            <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3 md:pl-4">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest hidden md:block w-12 text-right">Start</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all shadow-sm"
              />
            </div>

            {/*
            <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3 md:pl-4">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest hidden md:block w-14 text-right">Fast MA</label>
              <div className="flex gap-1">
                <select
                  value={ma1Type}
                  onChange={e => setMa1Type(e.target.value as "EMA" | "SMA")}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-1.5 py-1.5 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all shadow-sm"
                >
                  <option value="EMA">EMA</option>
                  <option value="SMA">SMA</option>
                </select>
                <input
                  type="number"
                  value={ma1Period}
                  onChange={e => setMa1Period(Number(e.target.value))}
                  min={2} max={200}
                  className="w-14 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all shadow-sm text-center"
                />
              </div>
            </div>

            <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3 md:pl-4">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest hidden md:block w-14 text-right">Slow MA</label>
              <div className="flex gap-1">
                <select
                  value={ma2Type}
                  onChange={e => setMa2Type(e.target.value as "EMA" | "SMA")}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-1.5 py-1.5 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all shadow-sm"
                >
                  <option value="EMA">EMA</option>
                  <option value="SMA">SMA</option>
                </select>
                <input
                  type="number"
                  value={ma2Period}
                  onChange={e => setMa2Period(Number(e.target.value))}
                  min={2} max={200}
                  className="w-14 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all shadow-sm text-center"
                />
              </div>
            </div>
            */}

          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto max-w-[1600px] w-full mx-auto">
          <div className="space-y-6">
            {(activeTab === "all" || activeTab === "traderlion") && (
              <section>
                <SectionLabel color="#3b82f6" text="Indicator 1 — TraderLion RS Line · Daily" />
                <RSLineChart symbol={symbol} benchmark="^TASI.SR" startDate={startDate} ma1Type="EMA" ma1Period={21} ma2Type="SMA" ma2Period={50} />
              </section>
            )}
            {(activeTab === "all" || activeTab === "crossover") && (
              <section>
                <SectionLabel color="#f97316" text="Indicator 2 — RS MA Crossover · LevelUp · Daily" />
                <RSMACrossoverChart symbol={symbol} benchmark="^TASI.SR" startDate={startDate} ma1Type={ma1Type} ma1Period={ma1Period} ma2Type={ma2Type} ma2Period={ma2Period} />
              </section>
            )}
            {(activeTab === "all" || activeTab === "mansfield") && (
              <section>
                <SectionLabel color="#8b5cf6" text="Indicator 3 — Mansfield RS · Weekly" />
                <MansfieldRSChart symbol={symbol} benchmark="^TASI.SR" startDate="2018-01-01" maLength={52} />
              </section>
            )}
            {(activeTab === "all" || activeTab === "sata") && (
              <section>
                <SectionLabel color="#f59e0b" text="Indicator 4 — SATA 10-Band Score · Weekly" />
                <SATAChart symbol={symbol} benchmark="^TASI.SR" startDate="2018-01-01" />
              </section>
            )}
            {(activeTab === "all" || activeTab === "stage") && (
              <section>
                <SectionLabel color="#06b6d4" text="Indicator 5 — Stage Analysis Price Overlay · Weekly" />
                <StageAnalysisChart symbol={symbol} benchmark="^TASI.SR" startDate="2018-01-01" />
              </section>
            )}
          </div>

          <footer className="mt-12 pt-6 border-t border-slate-200 text-center text-xs text-slate-400 font-medium">
            RS Indicators · Saudi Market Relative Strength Analysis
          </footer>
        </main>
      </div>
    </div>
  );
}