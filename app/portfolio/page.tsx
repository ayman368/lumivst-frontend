"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  fetchPortfolioPositions,
  createPortfolioPosition,
  closePortfolioPosition,
  updatePortfolioPosition,
  addSharesToPosition,
  partialSellPosition,
  deletePortfolioPosition,
} from "@/lib/api/wallet";
import type { WalletPositionDB } from "@/types/wallet";
import { useToast } from "@/components/ui/Toast";
import PortfolioExportButton from "./_components/PortfolioExportButton";
import PortfolioFilterPanel, {
  PortfolioFilterState,
  initialPortfolioFilterState,
} from "./_components/Portfoliofilterpanel";

// ── Icons ─────────────────────────────────────────────────────────────────────
const Icon = {
  Edit: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Plus: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Minus: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Close: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  Trash: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  ),
  X: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Warning: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  Search: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Portfolio: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    </svg>
  ),
};

// ── Types ─────────────────────────────────────────────────────────────────────
interface Position {
  id: number;
  pfl: string;
  sym: number | string;
  name: string;
  pflPct: number;
  mgnPct: number;
  shortPct: number;
  pctChg: number;
  last: number;
  cost: number;
  rsRating: number | null;
  rank1m: number | null;
  rank3m: number | null;
  rank6m: number | null;
  rank9m: number | null;
  rank12m: number | null;
  trend: string;
  sRs: number;
  sRs3m: number;
  sRs1m: number;
  s150ma: number;
  entryDate: string;
  addDate1: string;
  addDate2: string;
  addDate3: string;
  qty: number;
  tCost: number;
  sellValue: number;
  sell: number;
  exitDate: string;
  tSold: number;
  return_: number;
  returnPct: number;
  days: number;
  stopPrice: number;
  cRRR: number;
  cLossPct: number;
  pctOfPtf: number;
  rf100: number;
  rf75: number;
  rf50: number;
  rf25: number;
  es100: number;
  es75: number;
  es50: number;
  es25: number;
  position: string;
  category: string;
  pPrice: number;
  amount: number;
  qtyPlan: number;
  gain: number;
  loss: number;
  rrr: number;
  pandl: number;
  pandlPct: number;
  tCostFull: number;
  sector: string;
  sellMnth: string;
  sellMnthNum: number;
  sellAllMnth: number;
  allPandl: number;
  pct: number;
  cGain: number;
  ptTV: number;
  ptV: number;
  ptPct: number;
  pflCost: number;
}

// ── Sort config ───────────────────────────────────────────────────────────────
interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

type ActionType = "edit" | "add" | "sell" | "close" | "delete";
interface ConfirmState {
  type: "close" | "delete";
  positionId: number;
  symbol: string | number;
  name: string;
}

// ── Column groups ─────────────────────────────────────────────────────────────
const COL_GROUPS = [
  { label: "Identity", cols: ["Pfl.", "Sym", "Name"] },
  { label: "Allocation", cols: ["Pfl.%", "Mgn%", "Short%"] },
  { label: "Price", cols: ["%Chg", "Last", "Cost"] },
  { label: "RS", cols: ["RS Rating", "RS 1M", "RS 3M", "RS 6M", "RS 9M", "RS 12M"] },
  { label: "Signal", cols: ["Trend", "S-RS", "S-RS-3M", "S-RS-1M", "S-150 MA"] },
  { label: "Dates", cols: ["Entry date", "Add date 1", "Add date 2", "Add date 3"] },
  { label: "Position", cols: ["Qty", "T.Cost", "Sell Value", "Sell", "Exit date", "T.Sold"] },
  { label: "Performance", cols: ["Return", "Return%", "Days", "Stop Price", "C.RRR", "C.Loss%", "% of Ptf."] },
  { label: "Risk Financed", cols: ["RF-100%", "RF-75%", "RF-50%", "RF-25%"] },
  { label: "Effective Stop", cols: ["ES-100%", "ES-75%", "ES-50%", "ES-25%"] },
  { label: "Plan", cols: ["Position", "Category", "P.Price", "Amount", "Qty(plan)", "Gain", "Loss", "RRR"] },
  { label: "P&L", cols: ["P&L", "P&L%", "T.Cost(full)", "Sector", "Sell.Mnth", "Sell Mnth", "Sell All.Mnth"] },
  { label: "Summary", cols: ["All.P&L", "%", "C.Gain", "PT-T.V", "PT-V", "PT%", "Pfl.Cost"] },
];

// ── Column → sort key mapping ─────────────────────────────────────────────────
const COL_SORT_KEY: Record<string, string> = {
  "Pfl.": "pfl", "Sym": "sym", "Name": "name",
  "Pfl.%": "pflPct", "Mgn%": "mgnPct", "Short%": "shortPct",
  "%Chg": "pctChg", "Last": "last", "Cost": "cost",
  "RS Rating": "rsRating", "RS 1M": "rank1m", "RS 3M": "rank3m",
  "RS 6M": "rank6m", "RS 9M": "rank9m", "RS 12M": "rank12m",
  "Trend": "trend", "S-RS": "sRs", "S-RS-3M": "sRs3m", "S-RS-1M": "sRs1m", "S-150 MA": "s150ma",
  "Entry date": "entryDate", "Add date 1": "addDate1", "Add date 2": "addDate2", "Add date 3": "addDate3",
  "Qty": "qty", "T.Cost": "tCost", "Sell Value": "sellValue", "Sell": "sell",
  "Exit date": "exitDate", "T.Sold": "tSold",
  "Return": "return_", "Return%": "returnPct", "Days": "days",
  "Stop Price": "stopPrice", "C.RRR": "cRRR", "C.Loss%": "cLossPct", "% of Ptf.": "pctOfPtf",
  "RF-100%": "rf100", "RF-75%": "rf75", "RF-50%": "rf50", "RF-25%": "rf25",
  "ES-100%": "es100", "ES-75%": "es75", "ES-50%": "es50", "ES-25%": "es25",
  "Position": "position", "Category": "category", "P.Price": "pPrice",
  "Amount": "amount", "Qty(plan)": "qtyPlan", "Gain": "gain", "Loss": "loss", "RRR": "rrr",
  "P&L": "pandl", "P&L%": "pandlPct", "T.Cost(full)": "tCostFull",
  "Sector": "sector", "Sell.Mnth": "sellMnth", "Sell Mnth": "sellMnthNum", "Sell All.Mnth": "sellAllMnth",
  "All.P&L": "allPandl", "%": "pct", "C.Gain": "cGain",
  "PT-T.V": "ptTV", "PT-V": "ptV", "PT%": "ptPct", "Pfl.Cost": "pflCost",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (v: number | null | undefined, decimals = 2) =>
  v == null || Number.isNaN(v) || v === 0 ? "—" : v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
const pct = (v: number | null | undefined) =>
  v == null || Number.isNaN(v) || v === 0 ? "—" : `${(v * 100).toFixed(2)}%`;
const color = (v: number | null | undefined) =>
  v != null && v > 0 ? "text-emerald-600" : v != null && v < 0 ? "text-red-500" : "text-slate-400";

const mapWalletPosition = (pos: any, totalCost: number): Position => {
  const cost = Number(pos.buy_price) || 0;
  const last = Number(pos.current_price || pos.buy_price) || cost;
  const qty = Number(pos.qty) || 0;
  const stop = Number(pos.stop_price) || cost;
  const entryDate = pos.entry_date ? new Date(pos.entry_date) : new Date();
  const today = new Date();
  const days = Math.max(Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)), 0);
  const tCost = cost * qty;
  const return_ = (last - cost) * qty;
  const returnPct = tCost > 0 ? return_ / tCost : 0;
  const pflPct = totalCost > 0 ? tCost / totalCost : 0;
  const pctChg = pos.change_percent ?? (cost > 0 ? (last - cost) / cost : 0);
  const mgnPct = pos.marginable_percent != null ? Number(pos.marginable_percent) / 100 : 0;
  const trendSignal = pos.trend_signal ?? false;
  const finalSignal = pos.final_signal ?? false;
  const score = pos.score ?? 0;
  const trend = trendSignal ? "UP" : "—";
  const sRs = score;
  const sma150 = pos.sma_150 ?? 0;
  const s150ma = sma150 > 0 && last > 0 ? (last - sma150) / sma150 : 0;
  const cLossPct = cost > 0 ? (cost - stop) / cost : 0;
  const riskAmount = cost - stop;
  const cRRR = riskAmount > 0 ? (last - cost) / riskAmount : 0;
  const denom = last - stop;
  const rfShares = (pctNum: number) => denom > 0 ? (riskAmount * qty * pctNum) / denom : 0;
  const rf100 = rfShares(1.0), rf75 = rfShares(0.75), rf50 = rfShares(0.50), rf25 = rfShares(0.25);
  const effStop = (sharesSold: number) => {
    if (qty === 0 || cost === 0) return 0;
    const newStopValue = (sharesSold * last + (qty - sharesSold) * stop) / qty;
    return (cost - newStopValue) / cost;
  };
  let addDate1 = "", addDate2 = "", addDate3 = "";
  let sellValue = 0, sellQty = 0, tSold = 0, exitDate = "";
  if (pos.transactions && Array.isArray(pos.transactions)) {
    const adds = pos.transactions.filter((t: any) => t.type === "add");
    const sells = pos.transactions.filter((t: any) => t.type === "sell");
    if (adds[0]) addDate1 = adds[0].date;
    if (adds[1]) addDate2 = adds[1].date;
    if (adds[2]) addDate3 = adds[2].date;
    if (sells.length > 0) {
      const lastSell = sells[sells.length - 1];
      exitDate = lastSell.date;
      sellValue = Number(lastSell.price) || 0;
      sellQty = sells.reduce((acc: number, t: any) => acc + Number(t.qty || 0), 0);
      tSold = sells.reduce((acc: number, t: any) => acc + Number(t.qty || 0) * Number(t.price || 0), 0);
    }
  }
  return {
    id: pos.id, pfl: pos.portfolio_name || "Default", sym: pos.symbol,
    name: pos.name || "", pflPct, mgnPct,
    shortPct: pos.short_percent != null ? Number(pos.short_percent) / 100 : 0,
    pctChg, last, cost,
    rsRating: pos.rs_rating, rank1m: pos.rank_1m, rank3m: pos.rank_3m,
    rank6m: pos.rank_6m, rank9m: pos.rank_9m, rank12m: pos.rank_12m,
    trend, sRs, sRs3m: score, sRs1m: score, s150ma,
    entryDate: pos.entry_date || "", addDate1, addDate2, addDate3,
    qty, tCost, sellValue, sell: sellQty, exitDate, tSold,
    return_, returnPct, days, stopPrice: stop, cRRR, cLossPct, pctOfPtf: pflPct,
    rf100, rf75, rf50, rf25,
    es100: effStop(rf100), es75: effStop(rf75), es50: effStop(rf50), es25: effStop(rf25),
    position: finalSignal ? "BUY" : "HOLD", category: pos.industry_group || "",
    pPrice: last, amount: tCost, qtyPlan: qty,
    gain: returnPct > 0 ? returnPct : 0, loss: returnPct < 0 ? -returnPct : 0, rrr: cRRR,
    pandl: return_, pandlPct: returnPct, tCostFull: tCost,
    sector: pos.sector || "", sellMnth: "", sellMnthNum: 0, sellAllMnth: 13,
    allPandl: return_, pct: returnPct, cGain: last,
    ptTV: last * qty, ptV: return_, ptPct: returnPct, pflCost: tCost,
  };
};

function getCellValue(pos: Position, col: string): { display: string; className?: string } {
  switch (col) {
    case "Pfl.": return { display: pos.pfl };
    case "Sym": return { display: String(pos.sym) };
    case "Name": return { display: pos.name };
    case "Pfl.%": return { display: pct(pos.pflPct), className: "text-sky-600" };
    case "Mgn%": return { display: pct(pos.mgnPct), className: "text-slate-500" };
    case "Short%": return { display: pct(pos.shortPct) };
    case "%Chg": return { display: pct(pos.pctChg), className: color(pos.pctChg) };
    case "Last": return { display: fmt(pos.last), className: "font-semibold text-slate-900" };
    case "Cost": return { display: fmt(pos.cost) };
    case "RS Rating": return { display: pos.rsRating != null ? String(pos.rsRating) : "—" };
    case "RS 1M": return { display: pos.rank1m != null ? String(pos.rank1m) : "—" };
    case "RS 3M": return { display: pos.rank3m != null ? String(pos.rank3m) : "—" };
    case "RS 6M": return { display: pos.rank6m != null ? String(pos.rank6m) : "—" };
    case "RS 9M": return { display: pos.rank9m != null ? String(pos.rank9m) : "—" };
    case "RS 12M": return { display: pos.rank12m != null ? String(pos.rank12m) : "—" };
    case "Trend": return { display: pos.trend || "—" };
    case "S-RS": return { display: fmt(pos.sRs) };
    case "S-RS-3M": return { display: fmt(pos.sRs3m) };
    case "S-RS-1M": return { display: fmt(pos.sRs1m) };
    case "S-150 MA": return { display: fmt(pos.s150ma) };
    case "Entry date": return { display: pos.entryDate || "—" };
    case "Add date 1": return { display: pos.addDate1 || "—" };
    case "Add date 2": return { display: pos.addDate2 || "—" };
    case "Add date 3": return { display: pos.addDate3 || "—" };
    case "Qty": return { display: fmt(pos.qty, 0), className: "text-sky-600 font-medium" };
    case "T.Cost": return { display: fmt(pos.tCost, 0) };
    case "Sell Value": return { display: fmt(pos.sellValue, 0) };
    case "Sell": return { display: fmt(pos.sell, 0) };
    case "Exit date": return { display: pos.exitDate || "—" };
    case "T.Sold": return { display: fmt(pos.tSold, 0) };
    case "Return": return { display: fmt(pos.return_, 0), className: color(pos.return_) };
    case "Return%": return { display: pct(pos.returnPct), className: color(pos.returnPct) };
    case "Days": return { display: String(pos.days), className: "text-slate-500" };
    case "Stop Price": return { display: fmt(pos.stopPrice), className: "text-amber-600 font-medium" };
    case "C.RRR": return { display: fmt(pos.cRRR) };
    case "C.Loss%": return { display: pct(pos.cLossPct), className: "text-red-500" };
    case "% of Ptf.": return { display: pct(pos.pctOfPtf), className: "text-violet-600" };
    case "RF-100%": return { display: fmt(pos.rf100, 0), className: "text-emerald-600" };
    case "RF-75%": return { display: fmt(pos.rf75, 0), className: "text-emerald-600" };
    case "RF-50%": return { display: fmt(pos.rf50, 0), className: "text-emerald-500" };
    case "RF-25%": return { display: fmt(pos.rf25, 0), className: "text-emerald-500" };
    case "ES-100%": return { display: pct(pos.es100), className: color(pos.es100) };
    case "ES-75%": return { display: pct(pos.es75), className: color(-pos.es75) };
    case "ES-50%": return { display: pct(pos.es50), className: color(-pos.es50) };
    case "ES-25%": return { display: pct(pos.es25), className: color(-pos.es25) };
    case "Position": return { display: pos.position || "—" };
    case "Category": return { display: pos.category || "—" };
    case "P.Price": return { display: fmt(pos.pPrice) };
    case "Amount": return { display: fmt(pos.amount, 0) };
    case "Qty(plan)": return { display: fmt(pos.qtyPlan, 0) };
    case "Gain": return { display: pct(pos.gain), className: "text-emerald-600" };
    case "Loss": return { display: pct(pos.loss), className: "text-red-500" };
    case "RRR": return { display: fmt(pos.rrr) };
    case "P&L": return { display: fmt(pos.pandl, 0), className: color(pos.pandl) };
    case "P&L%": return { display: pct(pos.pandlPct), className: color(pos.pandlPct) };
    case "T.Cost(full)": return { display: fmt(pos.tCostFull, 0) };
    case "Sector": return { display: pos.sector || "—" };
    case "Sell.Mnth": return { display: pos.sellMnth || "—" };
    case "Sell Mnth": return { display: fmt(pos.sellMnthNum, 0) };
    case "Sell All.Mnth": return { display: fmt(pos.sellAllMnth, 0) };
    case "All.P&L": return { display: fmt(pos.allPandl, 0), className: color(pos.allPandl) };
    case "%": return { display: pct(pos.pct), className: color(pos.pct) };
    case "C.Gain": return { display: fmt(pos.cGain) };
    case "PT-T.V": return { display: fmt(pos.ptTV, 0) };
    case "PT-V": return { display: fmt(pos.ptV, 0) };
    case "PT%": return { display: pct(pos.ptPct) };
    case "Pfl.Cost": return { display: fmt(pos.pflCost, 0) };
    default: return { display: "—" };
  }
}

const GROUP_COLORS: Record<string, string> = {
  "Identity": "bg-slate-50 text-slate-700",
  "Allocation": "bg-sky-50/60 text-sky-800",
  "Price": "bg-slate-50 text-slate-700",
  "RS": "bg-violet-50/60 text-violet-800",
  "Signal": "bg-indigo-50/60 text-indigo-800",
  "Dates": "bg-slate-50/40 text-slate-600",
  "Position": "bg-slate-50 text-slate-700",
  "Performance": "bg-slate-50/40 text-slate-700",
  "Risk Financed": "bg-emerald-50/60 text-emerald-800",
  "Effective Stop": "bg-amber-50/60 text-amber-800",
  "Plan": "bg-slate-50/40 text-slate-600",
  "P&L": "bg-slate-50 text-slate-700",
  "Summary": "bg-slate-50/40 text-slate-600",
};

const GROUP_HEADER_COLORS: Record<string, string> = {
  "Identity": "bg-slate-200/80 text-slate-700",
  "Allocation": "bg-sky-100 text-sky-800",
  "Price": "bg-slate-200/80 text-slate-700",
  "RS": "bg-violet-100 text-violet-800",
  "Signal": "bg-indigo-100 text-indigo-800",
  "Dates": "bg-slate-200/60 text-slate-600",
  "Position": "bg-slate-200/80 text-slate-700",
  "Performance": "bg-slate-200/80 text-slate-700",
  "Risk Financed": "bg-emerald-100 text-emerald-800",
  "Effective Stop": "bg-amber-100 text-amber-800",
  "Plan": "bg-slate-200/60 text-slate-600",
  "P&L": "bg-slate-200/80 text-slate-700",
  "Summary": "bg-slate-200/60 text-slate-600",
};

// ── Action Menu ───────────────────────────────────────────────────────────────
interface ActionMenuProps {
  pos: Position;
  onEdit: () => void; onAdd: () => void; onSell: () => void;
  onClose: () => void; onDelete: () => void;
}

const MENU_WIDTH = 208;
const MENU_HEIGHT = 240;
const VIEWPORT_PADDING = 8;

function ActionMenu({ pos, onEdit, onAdd, onSell, onClose, onDelete }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const calcPosition = useCallback(() => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const vw = window.innerWidth, vh = window.innerHeight;
    const spaceBelow = vh - rect.bottom - VIEWPORT_PADDING;
    const spaceAbove = rect.top - VIEWPORT_PADDING;
    const openUp = spaceBelow < MENU_HEIGHT && spaceAbove > MENU_HEIGHT;
    let left = rect.left;
    if (left + MENU_WIDTH > vw - VIEWPORT_PADDING) left = vw - MENU_WIDTH - VIEWPORT_PADDING;
    setMenuStyle({
      position: "fixed", zIndex: 9999, width: MENU_WIDTH, left,
      ...(openUp ? { bottom: vh - rect.top + 4 } : { top: rect.bottom + 4 }),
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onScroll = () => setOpen(false);
    document.addEventListener("mousedown", close);
    window.addEventListener("scroll", onScroll, true);
    return () => { document.removeEventListener("mousedown", close); window.removeEventListener("scroll", onScroll, true); };
  }, [open]);

  const actions = [
    { id: "edit", label: "Edit Position", description: "Modify qty, price, stop", icon: <Icon.Edit />, color: "text-blue-600", hoverBg: "hover:bg-blue-50", action: onEdit },
    { id: "add", label: "Add Shares", description: "Scale in to position", icon: <Icon.Plus />, color: "text-emerald-600", hoverBg: "hover:bg-emerald-50", action: onAdd },
    { id: "sell", label: "Partial Sell", description: "Trim position size", icon: <Icon.Minus />, color: "text-amber-600", hoverBg: "hover:bg-amber-50", action: onSell },
    { type: "divider" as const },
    { id: "close", label: "Close Position", description: "Move to Monthly Tracker", icon: <Icon.Close />, color: "text-purple-600", hoverBg: "hover:bg-purple-50", action: onClose },
    { id: "delete", label: "Delete Permanently", description: "Cannot be undone", icon: <Icon.Trash />, color: "text-red-600", hoverBg: "hover:bg-red-50", action: onDelete, danger: true },
  ];

  const dropdown = open ? (
    <div ref={menuRef} role="menu"
      style={{ ...menuStyle, animation: "menuFadeIn 0.12s ease-out forwards" }}
      className="bg-white rounded-xl shadow-2xl border border-slate-200/80 overflow-hidden">
      <div className="px-3 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-slate-800 flex items-center justify-center text-white"><Icon.Portfolio /></div>
        <div>
          <p className="text-[11px] font-semibold text-slate-800 leading-tight">{String(pos.sym)}</p>
          <p className="text-[10px] text-slate-500 leading-tight truncate max-w-[130px]">{pos.name}</p>
        </div>
      </div>
      <div className="py-1">
        {actions.map((action, idx) =>
          action.type === "divider" ? <div key={idx} className="my-1 border-t border-slate-100" /> : (
            <button key={action.id} role="menuitem"
              onClick={() => { setOpen(false); action.action(); }}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${action.hoverBg} ${action.danger ? "group/danger" : ""}`}>
              <span className={`flex-shrink-0 ${action.color} ${action.danger ? "group-hover/danger:text-red-700" : ""}`}>{action.icon}</span>
              <div>
                <p className={`text-xs font-medium leading-tight ${action.color} ${action.danger ? "group-hover/danger:text-red-700" : ""}`}>{action.label}</p>
                <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{action.description}</p>
              </div>
            </button>
          )
        )}
      </div>
    </div>
  ) : null;

  return (
    <div className="flex items-center gap-1.5">
      <span className="font-mono text-[11px] font-semibold text-slate-700 tracking-tight cursor-default">{String(pos.sym)}</span>
      <button ref={btnRef} onClick={() => { calcPosition(); setOpen(true); }}
        className={`flex items-center rounded-md px-1.5 py-1 transition-all duration-150 ${open ? "bg-slate-800 text-white shadow-sm" : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"}`}
        aria-label="Position actions" aria-expanded={open} aria-haspopup="menu">
        <span className="flex gap-[3px] items-center">
          {[0, 1, 2].map(i => <span key={i} className={`w-[3px] h-[3px] rounded-full transition-colors ${open ? "bg-white" : "bg-slate-400"}`} />)}
        </span>
      </button>
      {typeof document !== "undefined" && createPortal(
        <>{dropdown}<style>{`@keyframes menuFadeIn{from{opacity:0;transform:translateY(-4px) scale(0.97)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style></>,
        document.body
      )}
    </div>
  );
}

// ── Confirm Dialog ────────────────────────────────────────────────────────────
function ConfirmDialog({ state, onConfirm, onCancel }: { state: ConfirmState; onConfirm: () => void; onCancel: () => void }) {
  const isDelete = state.type === "delete";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-200" style={{ animation: "modalSlideIn 0.18s ease-out" }}>
        <div className={`h-1 w-full ${isDelete ? "bg-red-500" : "bg-purple-500"}`} />
        <div className="px-6 pt-6 pb-5">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isDelete ? "bg-red-50 text-red-500" : "bg-purple-50 text-purple-500"}`}>
            {isDelete ? <Icon.Trash /> : <Icon.Close />}
          </div>
          <h3 className="text-[15px] font-semibold text-slate-900 mb-1.5">{isDelete ? "Delete Position" : "Close Position"}</h3>
          <p className="text-sm text-slate-500 leading-relaxed mb-1">
            {isDelete
              ? <></>
              : <>This will close <span className="font-semibold text-slate-700">{state.symbol} — {state.name}</span> and move it to the Monthly Tracker.</>}
          </p>
          {isDelete && (
            <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-100 flex items-start gap-2">
              <span className="text-red-500 mt-0.5 flex-shrink-0"><Icon.Warning /></span>
              <p className="text-xs text-red-700 leading-relaxed">All transaction history for this position will be permanently erased.</p>
            </div>
          )}
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">Cancel</button>
          <button onClick={onConfirm} className={`flex-1 py-2.5 rounded-xl text-sm font-medium text-white transition-colors shadow-sm ${isDelete ? "bg-red-500 hover:bg-red-600" : "bg-purple-500 hover:bg-purple-600"}`}>
            {isDelete ? "Yes, Delete" : "Close & Move"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal Shell ───────────────────────────────────────────────────────────────
function ModalShell({ title, subtitle, accentColor, onClose, children }: {
  title: string; subtitle?: string; accentColor: string; onClose: () => void; children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100" style={{ animation: "modalSlideIn 0.18s ease-out" }}>
        <div className={`h-1 w-full ${accentColor}`} />
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-semibold text-slate-900">{title}</h3>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"><Icon.X /></button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
      <style>{`@keyframes modalSlideIn{from{opacity:0;transform:translateY(12px) scale(0.98)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>
    </div>
  );
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">{label}</label>
      {children}
      {hint && <p className="text-[10px] text-slate-400">{hint}</p>}
    </div>
  );
}

const inputCls = "w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 bg-white placeholder-slate-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/15 transition-all";
const disabledInputCls = "w-full border border-slate-100 rounded-xl px-3.5 py-2.5 text-sm text-slate-400 bg-slate-50 cursor-not-allowed";

// ── Active filter count helper ─────────────────────────────────────────────────
function countActiveFilters(f: PortfolioFilterState): number {
  let count = 0;
  if (f.symbol) count++;
  if (f.name) count++;
  if (f.pfl) count++;
  if (f.trend !== 'any') count++;
  if (f.position !== 'any') count++;
  const ranges = [
    'pflPct', 'mgnPct', 'last', 'cost', 'pctChg',
    'rsRating', 'rank1m', 'rank3m', 'rank6m', 'rank9m', 'rank12m',
    'qty', 'tCost', 'days', 'stopPrice',
    'returnPct', 'cRRR', 'cLossPct', 'pctOfPtf',
  ];
  ranges.forEach(key => {
    if ((f as any)[`${key}_min`] || (f as any)[`${key}_max`]) count++;
  });
  return count;
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function PortfolioPage() {
  const { toast } = useToast();

  const [data, setData] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [activeGroups, setActiveGroups] = useState<Set<string>>(
    new Set(["Identity", "Allocation", "Price", "Position", "Performance", "Risk Financed", "Effective Stop", "P&L"])
  );

  // ── FILTER STATE ──────────────────────────────────────────────────────────
  const [filters, setFilters] = useState<PortfolioFilterState>(initialPortfolioFilterState);

  // ── SORT STATE — priority multi-sort ─────────────────────────────────────
  const [sortConfigs, setSortConfigs] = useState<SortConfig[]>([]);

  // Add new position form
  const [isAdding, setIsAdding] = useState(false);
  const [newPosition, setNewPosition] = useState({
    symbol: "", name: "", qty: 0, total_cost: 0, buy_price: 0,
    stop_price: 0, portfolio_name: "Default",
    entry_date: new Date().toISOString().slice(0, 10),
  });

  // Modal states
  const [editingPos, setEditingPos] = useState<any>(null);
  const [addingPos, setAddingPos] = useState<any>(null);
  const [sellingPos, setSellingPos] = useState<any>(null);
  const [closingPos, setClosingPos] = useState<any>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  const tableContainerRef = useRef<HTMLDivElement>(null);

  // ── Data loading ──────────────────────────────────────────────────────────
  const loadPositions = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const positions = await fetchPortfolioPositions();
      const totalCost = positions.reduce((sum: number, p: any) => sum + Number(p.qty) * Number(p.buy_price), 0);
      setData(positions.map((p: any) => mapWalletPosition(p, totalCost)));
    } catch (error) {
      setLoadError("Failed to load positions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadPositions(); }, [loadPositions]);

  // ── Sort handler — priority cycling ──────────────────────────────────────
  const handleSort = useCallback((colLabel: string) => {
    const key = COL_SORT_KEY[colLabel];
    if (!key) return;
    setSortConfigs(prev => {
      const existingIdx = prev.findIndex(c => c.key === key);
      if (existingIdx === -1) {
        // Not sorted yet → add as lowest priority, asc
        return [...prev, { key, direction: 'asc' }];
      }
      const existing = prev[existingIdx];
      if (existing.direction === 'asc') {
        // asc → desc
        const next = [...prev];
        next[existingIdx] = { key, direction: 'desc' };
        return next;
      }
      // desc → remove
      return prev.filter((_, i) => i !== existingIdx);
    });
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleAddPosition = async () => {
    try {
      await createPortfolioPosition(newPosition);
      setIsAdding(false);
      setNewPosition({ symbol: "", name: "", qty: 0, total_cost: 0, buy_price: 0, stop_price: 0, portfolio_name: newPosition.portfolio_name, entry_date: new Date().toISOString().slice(0, 10) });
      await loadPositions();
      toast("Position added successfully!", "success");
    } catch { toast("Failed to add position.", "error"); }
  };

  const handleConfirmAction = async () => {
    if (!confirmState) return;
    try {
      if (confirmState.type === "close") {
        // Obsolete, close moved to closingPos modal
      } else {
        await deletePortfolioPosition(confirmState.positionId);
        toast("Position deleted successfully.", "success");
      }
      await loadPositions();
    } catch { toast(`Failed to ${confirmState.type} position.`, "error"); }
    finally { setConfirmState(null); }
  };

  const handleUpdateSubmit = async () => {
    try {
      await updatePortfolioPosition(editingPos.id, {
        name: editingPos.name, qty: Number(editingPos.qty),
        buy_price: Number(editingPos.buy_price),
        stop_price: editingPos.stop_price ? Number(editingPos.stop_price) : null,
        entry_date: editingPos.entry_date || null,
        portfolio_name: editingPos.portfolio_name || "Default",
      });
      setEditingPos(null); await loadPositions(); toast("Position updated", "success");
    } catch { toast("Update failed", "error"); }
  };

  const handleAddSubmit = async () => {
    try {
      await addSharesToPosition(addingPos.id, { qty: Number(addingPos.add_qty), buy_price: Number(addingPos.add_price), trade_date: addingPos.add_date });
      setAddingPos(null); await loadPositions(); toast("Shares added successfully", "success");
    } catch { toast("Failed to add shares", "error"); }
  };

  const handleSellSubmit = async () => {
    try {
      await partialSellPosition(sellingPos.id, { qty: Number(sellingPos.sell_qty), sell_price: Number(sellingPos.sell_price), trade_date: sellingPos.sell_date });
      setSellingPos(null); await loadPositions(); toast("Shares sold successfully", "success");
    } catch { toast("Failed to sell shares", "error"); }
  };

  const handleCloseSubmit = async () => {
    try {
      await closePortfolioPosition(closingPos.id, { sell_price: Number(closingPos.sell_price), exit_date: closingPos.exit_date });
      setClosingPos(null); await loadPositions(); toast("Position closed and moved to Monthly Tracker.", "success");
    } catch { toast("Failed to close position", "error"); }
  };

  // ── Derived state ─────────────────────────────────────────────────────────
  const portfolios = useMemo(() =>
    Array.from(new Set(data.map(p => p.pfl))), [data]);

  const visibleCols = useMemo(() =>
    COL_GROUPS
      .filter(g => activeGroups.has(g.label))
      .flatMap(g => g.cols.map(c => ({ col: c, group: g.label }))),
    [activeGroups]);

  // ── Filtered + sorted positions ───────────────────────────────────────────
  const filtered = useMemo(() => {
    const f = filters;
    const inRange = (val: number, minKey: string, maxKey: string) => {
      const min = parseFloat((f as any)[minKey]);
      const max = parseFloat((f as any)[maxKey]);
      if (!isNaN(min) && val < min) return false;
      if (!isNaN(max) && val > max) return false;
      return true;
    };

    let result = data.filter(p => {
      if (f.symbol && !String(p.sym).toLowerCase().includes(f.symbol.toLowerCase())) return false;
      if (f.name && !p.name.toLowerCase().includes(f.name.toLowerCase())) return false;
      if (f.pfl && p.pfl !== f.pfl) return false;
      if (f.trend !== 'any' && ((f.trend === 'yes') !== (p.trend === 'UP'))) return false;
      if (f.position !== 'any' && p.position !== f.position) return false;
      if (!inRange(p.pflPct * 100, 'pflPct_min', 'pflPct_max')) return false;
      if (!inRange(p.mgnPct * 100, 'mgnPct_min', 'mgnPct_max')) return false;
      if (!inRange(p.last, 'last_min', 'last_max')) return false;
      if (!inRange(p.cost, 'cost_min', 'cost_max')) return false;
      if (!inRange(p.pctChg * 100, 'pctChg_min', 'pctChg_max')) return false;
      if (!inRange(p.rsRating ?? 0, 'rsRating_min', 'rsRating_max')) return false;
      if (!inRange(p.rank1m ?? 0, 'rank1m_min', 'rank1m_max')) return false;
      if (!inRange(p.rank3m ?? 0, 'rank3m_min', 'rank3m_max')) return false;
      if (!inRange(p.rank6m ?? 0, 'rank6m_min', 'rank6m_max')) return false;
      if (!inRange(p.rank9m ?? 0, 'rank9m_min', 'rank9m_max')) return false;
      if (!inRange(p.rank12m ?? 0, 'rank12m_min', 'rank12m_max')) return false;
      if (!inRange(p.qty, 'qty_min', 'qty_max')) return false;
      if (!inRange(p.tCost, 'tCost_min', 'tCost_max')) return false;
      if (!inRange(p.days, 'days_min', 'days_max')) return false;
      if (!inRange(p.stopPrice, 'stopPrice_min', 'stopPrice_max')) return false;
      if (!inRange(p.returnPct * 100, 'returnPct_min', 'returnPct_max')) return false;
      if (!inRange(p.cRRR, 'cRRR_min', 'cRRR_max')) return false;
      if (!inRange(p.cLossPct * 100, 'cLossPct_min', 'cLossPct_max')) return false;
      if (!inRange(p.pctOfPtf * 100, 'pctOfPtf_min', 'pctOfPtf_max')) return false;
      return true;
    });

    // ── Multi-key priority sort ───────────────────────────────────────────
    if (sortConfigs.length > 0) {
      result = [...result].sort((a, b) => {
        for (const cfg of sortConfigs) {
          const aVal = (a as any)[cfg.key];
          const bVal = (b as any)[cfg.key];
          if (aVal === bVal) continue;
          if (typeof aVal === 'string' && typeof bVal === 'string') {
            const cmp = aVal.localeCompare(bVal);
            if (cmp !== 0) return cfg.direction === 'asc' ? cmp : -cmp;
          } else {
            const aN = Number(aVal ?? 0), bN = Number(bVal ?? 0);
            if (aN !== bN) return cfg.direction === 'asc' ? aN - bN : bN - aN;
          }
        }
        return 0;
      });
    }

    return result;
  }, [data, filters, sortConfigs]);

  const totalReturn = filtered.reduce((s, p) => s + p.return_, 0);
  const totalCost = filtered.reduce((s, p) => s + p.tCost, 0);
  const activeFiltersCount = useMemo(() => countActiveFilters(filters), [filters]);

  return (
    <div className="h-screen flex flex-col bg-[#f8f9fb] text-slate-900 font-sans overflow-hidden">

      {/* ── Header ── */}
      <div className="flex-none border-b border-slate-200 bg-white px-6 py-4 flex items-center justify-between gap-4 flex-wrap z-30 shadow-sm">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-slate-900 text-lg font-semibold tracking-tight">Portfolio</h1>
            <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
              <span>{filtered.length} position{filtered.length !== 1 ? "s" : ""}</span>
              <span className="text-slate-300">·</span>
              <span>Cost: <span className="text-slate-700 font-medium">{fmt(totalCost, 0)} SAR</span></span>
              <span className="text-slate-300">·</span>
              <span>Return: <span className={`font-medium ${color(totalReturn)}`}>{fmt(totalReturn, 0)} SAR</span></span>
              {isLoading && <span className="text-slate-400 animate-pulse">Refreshing…</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <PortfolioExportButton
            data={filtered}
            tableRef={tableContainerRef}
            activeColumns={visibleCols.map(vc => vc.col)}
          />
          <button
            className={`text-sm px-4 py-2 rounded-lg font-medium transition-all shadow-sm ${isAdding ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "bg-slate-900 text-white hover:bg-slate-800"}`}
            onClick={() => setIsAdding(v => !v)}>
            {isAdding ? "Cancel" : "+ New Position"}
          </button>
        </div>
      </div>

      {/* ── Filter Panel ── */}
      <PortfolioFilterPanel
        filters={filters}
        setFilters={setFilters}
        portfolios={portfolios}
        activeFiltersCount={activeFiltersCount}
        clearAllFilters={() => setFilters(initialPortfolioFilterState)}
      />

      {/* ── Add Position Form ── */}
      {isAdding && (
        <div className="flex-none border-b border-slate-200 px-6 py-5 bg-white shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4">New Position</p>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            <Field label="Symbol">
              <input className={inputCls} placeholder="e.g. 2222"
                value={newPosition.symbol}
                onChange={e => setNewPosition({ ...newPosition, symbol: e.target.value.toUpperCase() })} />
            </Field>
            <Field label="Name">
              <input className={inputCls} placeholder="e.g. Aramco"
                value={newPosition.name}
                onChange={e => setNewPosition({ ...newPosition, name: e.target.value })} />
            </Field>
            <Field label="Entry Date">
              <input type="date" className={inputCls} value={newPosition.entry_date}
                onChange={e => setNewPosition({ ...newPosition, entry_date: e.target.value })} />
            </Field>
            <Field label="Portfolio">
              <input className={inputCls} placeholder="Default" value={newPosition.portfolio_name}
                onChange={e => setNewPosition({ ...newPosition, portfolio_name: e.target.value })} />
            </Field>
            <Field label="Quantity">
              <input type="number" className={inputCls} placeholder="0" value={newPosition.qty || ""}
                onChange={e => {
                  const qty = Number(e.target.value);
                  const buy_price = qty > 0 ? Number((newPosition.total_cost / qty).toFixed(4)) : 0;
                  setNewPosition({ ...newPosition, qty, buy_price });
                }} />
            </Field>
            <Field label="Total Cost (SAR)">
              <input type="number" className={inputCls} placeholder="0.00" value={newPosition.total_cost || ""}
                onChange={e => {
                  const total_cost = Number(e.target.value);
                  const buy_price = newPosition.qty > 0 ? Number((total_cost / newPosition.qty).toFixed(4)) : 0;
                  setNewPosition({ ...newPosition, total_cost, buy_price });
                }} />
            </Field>
            <Field label="Avg. Price" hint="Auto-calculated">
              <input type="number" disabled className={disabledInputCls} value={newPosition.buy_price} />
            </Field>
            <Field label="Stop Price (SAR)">
              <input type="number" className={inputCls} placeholder="0.00" value={newPosition.stop_price || ""}
                onChange={e => setNewPosition({ ...newPosition, stop_price: Number(e.target.value) })} />
            </Field>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button className="bg-slate-900 hover:bg-slate-800 text-white text-sm px-5 py-2.5 rounded-xl font-medium shadow-sm transition-colors" onClick={handleAddPosition}>Save Position</button>
            <button className="text-slate-500 text-sm px-4 py-2.5 rounded-xl hover:bg-slate-100 transition-colors" onClick={() => setIsAdding(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* ── Column group toggles ── */}
      <div className="flex-none px-6 py-3 border-b border-slate-200 bg-white flex flex-wrap gap-2 z-20 items-center">
        <span className="text-slate-400 text-xs font-medium mr-1">Columns</span>
        {COL_GROUPS.map(g => {
          const isActive = activeGroups.has(g.label);
          return (
            <button key={g.label}
              onClick={() => setActiveGroups(prev => {
                const next = new Set(prev);
                next.has(g.label) ? next.delete(g.label) : next.add(g.label);
                return next;
              })}
              className={`text-[11px] px-3.5 py-1.5 rounded-full border transition-all ${isActive ? "bg-[#1E293B] text-white border-transparent font-semibold shadow-sm" : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700 font-medium"}`}>
              {g.label}
            </button>
          );
        })}
        {/* Sort indicators */}
        {sortConfigs.length > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-slate-400">Sorted by:</span>
            {sortConfigs.map((cfg, i) => (
              <span key={cfg.key}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium">
                <span className="inline-flex items-center justify-center w-4 h-4 bg-slate-800 text-white text-[9px] font-bold rounded-full">{i + 1}</span>
                {Object.entries(COL_SORT_KEY).find(([, v]) => v === cfg.key)?.[0] ?? cfg.key}
                <span className="text-slate-400">{cfg.direction === 'asc' ? '▲' : '▼'}</span>
                <button onClick={() => setSortConfigs(prev => prev.filter(c => c.key !== cfg.key))}
                  className="text-slate-400 hover:text-red-500 transition-colors leading-none">×</button>
              </span>
            ))}
            <button onClick={() => setSortConfigs([])}
              className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors">
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ── Error state ── */}
      {loadError && (
        <div className="flex-none mx-6 mt-3 mb-1 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-sm text-red-700">
          <Icon.Warning />{loadError}
          <button onClick={loadPositions} className="ml-auto text-red-600 font-medium hover:underline">Retry</button>
        </div>
      )}

      {/* ── Table ── */}
      <div ref={tableContainerRef} className="flex-1 overflow-auto bg-white">
        <table className="w-full text-xs border-collapse min-w-max">
          <thead className="sticky top-0 z-20">
            <tr className="border-b border-slate-200">
              {COL_GROUPS.filter(g => activeGroups.has(g.label)).map(g => (
                <th key={g.label} colSpan={g.cols.length}
                  className={`px-2 py-1.5 text-center text-[10px] font-semibold tracking-widest uppercase border-r border-slate-200 ${GROUP_HEADER_COLORS[g.label]}`}>
                  {g.label}
                </th>
              ))}
            </tr>

            {/* ── Column header row with sort indicators ── */}
            <tr className="border-b border-slate-200 shadow-sm">
              {visibleCols.map(({ col, group }) => {
                const sortKey = COL_SORT_KEY[col];
                const sortIdx = sortKey ? sortConfigs.findIndex(c => c.key === sortKey) : -1;
                const isSorted = sortIdx !== -1;
                const sortDir = isSorted ? sortConfigs[sortIdx].direction : null;
                const sortPriority = sortIdx + 1;
                const isSortable = !!sortKey;

                return (
                  <th key={`${group}-${col}`}
                    onClick={isSortable ? () => handleSort(col) : undefined}
                    className={`px-2.5 py-2 text-center whitespace-nowrap tracking-tight border-r border-slate-100 select-none transition-colors
                      ${isSortable ? 'cursor-pointer hover:bg-slate-100' : ''}
                      ${isSorted ? 'bg-blue-50/80 text-blue-900 border-b-2 border-b-blue-400' : GROUP_COLORS[group]}
                      font-medium`}>
                    <div className="flex items-center justify-center gap-1">
                      <span>{col}</span>
                      {isSortable && (
                        <div className="flex flex-col items-center leading-none ml-0.5">
                          {isSorted ? (
                            <span className="text-blue-600 text-[10px] font-bold leading-none">
                              {sortDir === 'asc' ? '▲' : '▼'}
                            </span>
                          ) : (
                            <span className="text-slate-300 text-[9px] leading-none opacity-60">▲<br />▼</span>
                          )}
                        </div>
                      )}
                      {isSorted && (
                        <span className="inline-flex items-center justify-center w-[14px] h-[14px] bg-blue-600 text-white text-[8px] font-bold rounded-full flex-shrink-0">
                          {sortPriority}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {isLoading && data.length === 0 && (
              <tr><td colSpan={visibleCols.length} className="text-center py-20">
                <div className="flex flex-col items-center gap-3 text-slate-400">
                  <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-500 rounded-full animate-spin" />
                  <span className="text-sm">Loading positions…</span>
                </div>
              </td></tr>
            )}
            {!isLoading && filtered.length === 0 && (
              <tr><td colSpan={visibleCols.length} className="text-center py-20 text-slate-400 text-sm">No positions found</td></tr>
            )}
            {filtered.map((pos) => (
              <tr key={pos.id} className="border-b border-slate-100 hover:bg-blue-50/30 transition-colors even:bg-slate-50/30">
                {visibleCols.map(({ col, group }) => {
                  const { display, className } = getCellValue(pos, col);
                  return (
                    <td key={`${group}-${col}`}
                      className={`px-2.5 py-2.5 text-center whitespace-nowrap border-r border-slate-100 tabular-nums ${className ?? "text-slate-600"}`}>
                      {col === "Sym" ? (
                        <ActionMenu pos={pos}
                          onEdit={() => setEditingPos({ id: pos.id, name: pos.name, qty: pos.qty, buy_price: pos.cost, total_cost: pos.cost * pos.qty, stop_price: pos.stopPrice, entry_date: pos.entryDate, portfolio_name: pos.pfl })}
                          onAdd={() => setAddingPos({ id: pos.id, symbol: pos.sym, add_qty: "", add_price: pos.last, add_date: new Date().toISOString().slice(0, 10) })}
                          onSell={() => setSellingPos({ id: pos.id, symbol: pos.sym, max_qty: pos.qty, sell_qty: "", sell_price: pos.last, sell_date: new Date().toISOString().slice(0, 10) })}
                          onClose={() => setClosingPos({ id: pos.id, symbol: pos.sym, name: pos.name, qty: pos.qty, cost: pos.cost, sell_price: pos.last, exit_date: new Date().toISOString().slice(0, 10) })}
                          onDelete={() => setConfirmState({ type: "delete", positionId: pos.id, symbol: pos.sym, name: pos.name })}
                        />
                      ) : display}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>

          <tfoot>
            <tr className="border-t-2 border-slate-300 bg-slate-50 font-semibold sticky bottom-0 z-10">
              {visibleCols.map(({ col, group }) => {
                let val = "—", cls = "text-slate-400";
                if (col === "T.Cost") { val = fmt(totalCost, 0); cls = "text-slate-800 font-bold"; }
                if (col === "Return") { val = fmt(totalReturn, 0); cls = `font-bold ${color(totalReturn)}`; }
                if (col === "Name" || col === "Pfl.") { val = "TOTAL"; cls = "text-slate-600 font-semibold text-left text-[11px] tracking-wider uppercase"; }
                return (
                  <td key={`${group}-${col}`} className={`px-2.5 py-2.5 text-center border-r border-slate-200 tabular-nums ${cls}`}>{val}</td>
                );
              })}
            </tr>
          </tfoot>
        </table>

        {!isLoading && data.length === 0 && !loadError && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-5 text-3xl shadow-inner">📊</div>
            <p className="text-slate-600 font-medium mb-1">No positions yet</p>
            <p className="text-slate-400 text-sm mb-5">Connect the backend or add your first position</p>
            <p className="text-slate-300 text-xs font-mono">POST /api/wallet/portfolio/positions</p>
          </div>
        )}
      </div>

      {/* ── Confirm Dialog ── */}
      {confirmState && <ConfirmDialog state={confirmState} onConfirm={handleConfirmAction} onCancel={() => setConfirmState(null)} />}

      {/* ── Edit Modal ── */}
      {editingPos && (
        <ModalShell title="Edit Position" subtitle={`ID #${editingPos.id}`} accentColor="bg-blue-500" onClose={() => setEditingPos(null)}>
          <div className="space-y-4">
            <Field label="Name"><input className={inputCls} value={editingPos.name} onChange={e => setEditingPos({ ...editingPos, name: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Portfolio"><input className={inputCls} value={editingPos.portfolio_name} onChange={e => setEditingPos({ ...editingPos, portfolio_name: e.target.value })} /></Field>
              <Field label="Entry Date"><input type="date" className={inputCls} value={editingPos.entry_date?.slice(0, 10) || ""} onChange={e => setEditingPos({ ...editingPos, entry_date: e.target.value })} /></Field>
              <Field label="Quantity"><input type="number" className={inputCls} value={editingPos.qty}
                onChange={e => { const qty = Number(e.target.value); const buy_price = qty > 0 ? Number((editingPos.total_cost / qty).toFixed(4)) : 0; setEditingPos({ ...editingPos, qty, buy_price }); }} /></Field>
              <Field label="Total Cost (SAR)"><input type="number" className={inputCls} value={editingPos.total_cost}
                onChange={e => { const total_cost = Number(e.target.value); const buy_price = editingPos.qty > 0 ? Number((total_cost / editingPos.qty).toFixed(4)) : 0; setEditingPos({ ...editingPos, total_cost, buy_price }); }} /></Field>
              <Field label="Avg. Price" hint="Auto-calculated"><input type="number" disabled className={disabledInputCls} value={editingPos.buy_price} /></Field>
              <Field label="Stop Price"><input type="number" className={inputCls} value={editingPos.stop_price} onChange={e => setEditingPos({ ...editingPos, stop_price: e.target.value })} /></Field>
            </div>
            <button onClick={handleUpdateSubmit} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 rounded-xl transition-colors mt-1 text-sm">Save Changes</button>
          </div>
        </ModalShell>
      )}

      {/* ── Add Shares Modal ── */}
      {addingPos && (
        <ModalShell title="Add Shares" subtitle={`Scale in — ${addingPos.symbol}`} accentColor="bg-emerald-500" onClose={() => setAddingPos(null)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Quantity to Add"><input type="number" className={inputCls} placeholder="0" value={addingPos.add_qty} onChange={e => setAddingPos({ ...addingPos, add_qty: e.target.value })} /></Field>
              <Field label="Buy Price (SAR)"><input type="number" className={inputCls} value={addingPos.add_price} onChange={e => setAddingPos({ ...addingPos, add_price: e.target.value })} /></Field>
            </div>
            <Field label="Trade Date"><input type="date" className={inputCls} value={addingPos.add_date} onChange={e => setAddingPos({ ...addingPos, add_date: e.target.value })} /></Field>
            {addingPos.add_qty && addingPos.add_price && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-xs text-emerald-700">Total cost: <span className="font-semibold">{fmt(Number(addingPos.add_qty) * Number(addingPos.add_price), 0)} SAR</span></p>
              </div>
            )}
            <button onClick={handleAddSubmit} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-xl transition-colors text-sm">Confirm Add</button>
          </div>
        </ModalShell>
      )}

      {/* ── Partial Sell Modal ── */}
      {sellingPos && (
        <ModalShell title="Partial Sell" subtitle={`Trim position — ${sellingPos.symbol}`} accentColor="bg-amber-500" onClose={() => setSellingPos(null)}>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-100">
              <span className="text-xs text-amber-700">Available to sell</span>
              <span className="text-sm font-bold text-amber-800">{sellingPos.max_qty} shares</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Qty to Sell"><input type="number" className={inputCls} placeholder="0" value={sellingPos.sell_qty} onChange={e => setSellingPos({ ...sellingPos, sell_qty: e.target.value })} /></Field>
              <Field label="Sell Price (SAR)"><input type="number" className={inputCls} value={sellingPos.sell_price} onChange={e => setSellingPos({ ...sellingPos, sell_price: e.target.value })} /></Field>
            </div>
            <Field label="Trade Date"><input type="date" className={inputCls} value={sellingPos.sell_date} onChange={e => setSellingPos({ ...sellingPos, sell_date: e.target.value })} /></Field>
            {sellingPos.sell_qty && sellingPos.sell_price && (() => {
              const sellTotal = Number(sellingPos.sell_qty) * Number(sellingPos.sell_price);
              const remainingQty = sellingPos.max_qty - Number(sellingPos.sell_qty);
              return (
                <div className="p-4 rounded-xl border space-y-2 bg-amber-50 border-amber-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-amber-700">Total Sell Value</span>
                    <span className="text-sm font-bold text-amber-800">{fmt(sellTotal, 0)} SAR</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-amber-600">Remaining Shares</span>
                    <span className="text-sm font-semibold text-amber-700">{remainingQty >= 0 ? remainingQty : 0}</span>
                  </div>
                </div>
              );
            })()}
            <button onClick={handleSellSubmit} className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2.5 rounded-xl transition-colors text-sm">Confirm Sell</button>
          </div>
        </ModalShell>
      )}

      {/* ── Close Position Modal ── */}
      {closingPos && (() => {
        const sellTotal = Number(closingPos.sell_price) * Number(closingPos.qty);
        const costTotal = Number(closingPos.cost) * Number(closingPos.qty);
        const pnl = sellTotal - costTotal;
        const pnlPct = costTotal > 0 ? (pnl / costTotal) * 100 : 0;
        return (
          <ModalShell title="Close Position" subtitle={`${closingPos.symbol} — ${closingPos.name}`} accentColor="bg-purple-500" onClose={() => setClosingPos(null)}>
            <div className="space-y-4">
              {/* Position info summary */}
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl border border-purple-100">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-purple-500 uppercase tracking-wider font-medium">Position Size</span>
                  <span className="text-sm font-bold text-purple-800">{closingPos.qty} shares</span>
                </div>
                <div className="flex flex-col gap-0.5 text-right">
                  <span className="text-[10px] text-purple-500 uppercase tracking-wider font-medium">Avg. Cost</span>
                  <span className="text-sm font-bold text-purple-800">{fmt(closingPos.cost)} SAR</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Sell Price (SAR)"><input type="number" className={inputCls} value={closingPos.sell_price} onChange={e => setClosingPos({ ...closingPos, sell_price: e.target.value })} /></Field>
                <Field label="Exit Date"><input type="date" className={inputCls} value={closingPos.exit_date} onChange={e => setClosingPos({ ...closingPos, exit_date: e.target.value })} /></Field>
              </div>

              {/* Total proceeds & P&L */}
              {closingPos.sell_price && (
                <div className="p-4 rounded-xl border space-y-2 bg-slate-50 border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Total Cost</span>
                    <span className="text-sm font-semibold text-slate-700">{fmt(costTotal, 0)} SAR</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Total Sell Value</span>
                    <span className="text-sm font-semibold text-slate-700">{fmt(sellTotal, 0)} SAR</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-600">Realized P&L</span>
                    <span className={`text-sm font-bold ${pnl >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                      {pnl >= 0 ? "+" : ""}{fmt(pnl, 0)} SAR ({pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              )}

              <button onClick={handleCloseSubmit} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 rounded-xl transition-colors text-sm">Close & Move to Tracker</button>
            </div>
          </ModalShell>
        );
      })()}
    </div>
  );
}