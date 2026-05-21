"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  fetchPortfolioPositions, 
  createPortfolioPosition, 
  closePortfolioPosition,
  updatePortfolioPosition,
  addSharesToPosition,
  partialSellPosition
} from "@/lib/api/wallet";
import type { WalletPositionDB } from "@/types/wallet";
import { useToast } from "@/components/ui/Toast";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Position {
  id: number;
  pfl: string;          // A  - Portfolio name (Arabic)
  sym: number | string; // B  - Symbol
  name: string;         // C  - Name
  pflPct: number;       // D  - Pfl.%
  mgnPct: number;       // E  - Mgn%
  shortPct: number;     // F  - Short%
  pctChg: number;       // G  - %Chg
  last: number;         // H  - Last (current price)
  cost: number;         // I  - Cost (avg cost)
  growth: number;       // J  - Growth
  rsGrade: string;      // K  - RS-Grade
  rs: number;           // L  - RS
  rs6m: number;         // M  - RS-6M
  rs3m: number;         // N  - RS-3M
  rs1m: number;         // O  - RS-1M
  rs1w: number;         // P  - RS-1W
  trend: string;        // Q  - Trend
  sRs: number;          // R  - S-RS
  sRs3m: number;        // S  - S-RS-3M
  sRs1m: number;        // T  - S-RS-1M
  s150ma: number;       // U  - S-150 MA
  entryDate: string;    // V  - Entry date
  addDate1: string;     // W  - Add date 1
  addDate2: string;     // X  - Add date 2
  addDate3: string;     // Y  - Add date 3
  qty: number;          // Z  - Qty
  tCost: number;        // AA - T.Cost
  sellValue: number;    // AB - Sell Value
  sell: number;         // AC - Sell
  exitDate: string;     // AD - Exit date
  tSold: number;        // AE - T.Sold
  return_: number;      // AF - Return
  returnPct: number;    // AG - Return%
  days: number;         // AH - Days
  stopPrice: number;    // AI - Stop Price
  cRRR: number;         // AJ - C.RRR
  cLossPct: number;     // AK - C.Loss%
  pctOfPtf: number;     // AL - % of Ptf.
  rf100: number;        // AM - RF-100%
  rf75: number;         // AN - RF-75%
  rf50: number;         // AO - RF-50%
  rf25: number;         // AP - RF-25%
  es100: number;        // AQ - ES-100%
  es75: number;         // AR - ES-75%
  es50: number;         // AS - ES-50%
  es25: number;         // AT - ES-25%
  position: string;     // AU - Position
  category: string;     // AV - Category
  pPrice: number;       // AW - P.Price
  amount: number;       // AX - Amount
  qtyPlan: number;      // AY - Qty (plan)
  gain: number;         // AZ - Gain
  loss: number;         // BA - Loss
  rrr: number;          // BB - RRR
  pandl: number;        // BC - P&L
  pandlPct: number;     // BD - P&L%
  tCostFull: number;    // BE - T.Cost (full)
  sector: string;       // BF - Sector
  sellMnth: string;     // BG - Sell.Mnth
  sellMnthNum: number;  // BH - Sell Mnth
  sellAllMnth: number;  // BI - Sell All.Mnth
  allPandl: number;     // BJ - All.P&L
  pct: number;          // BK - %
  cGain: number;        // BL - C.Gain
  ptTV: number;         // BM - PT-T.V
  ptV: number;          // BN - PT-V
  ptPct: number;        // BO - PT%
  pflCost: number;      // BP - Pfl.Cost
}

// ── Column groups (matching Excel layout) ────────────────────────────────────
const COL_GROUPS = [
  { label: "Identity", cols: ["Pfl.", "Sym", "Name"] },
  { label: "Allocation", cols: ["Pfl.%", "Mgn%", "Short%"] },
  { label: "Price", cols: ["%Chg", "Last", "Cost", "Growth"] },
  { label: "RS", cols: ["RS-Grade", "RS", "RS-6M", "RS-3M", "RS-1M", "RS-1W"] },
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

// All flat columns in Excel order
const ALL_COLS = [
  "Pfl.", "Sym", "Name",
  "Pfl.%", "Mgn%", "Short%",
  "%Chg", "Last", "Cost", "Growth",
  "RS-Grade", "RS", "RS-6M", "RS-3M", "RS-1M", "RS-1W",
  "Trend", "S-RS", "S-RS-3M", "S-RS-1M", "S-150 MA",
  "Entry date", "Add date 1", "Add date 2", "Add date 3",
  "Qty", "T.Cost", "Sell Value", "Sell", "Exit date", "T.Sold",
  "Return", "Return%", "Days", "Stop Price", "C.RRR", "C.Loss%", "% of Ptf.",
  "RF-100%", "RF-75%", "RF-50%", "RF-25%",
  "ES-100%", "ES-75%", "ES-50%", "ES-25%",
  "Position", "Category", "P.Price", "Amount", "Qty(plan)", "Gain", "Loss", "RRR",
  "P&L", "P&L%", "T.Cost(full)", "Sector", "Sell.Mnth", "Sell Mnth", "Sell All.Mnth",
  "All.P&L", "%", "C.Gain", "PT-T.V", "PT-V", "PT%", "Pfl.Cost",
];

// ── Mock data (from Excel row 3 — the real EAST PIPES position) ──────────────


// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (v: number | null | undefined, decimals = 2) =>
  v == null || Number.isNaN(v) || v === 0 ? "—" : v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
const pct = (v: number | null | undefined) =>
  v == null || Number.isNaN(v) || v === 0 ? "—" : `${(v * 100).toFixed(2)}%`;
const color = (v: number | null | undefined) =>
  v != null && v > 0 ? "text-emerald-600" : v != null && v < 0 ? "text-red-600" : "text-slate-500";

const mapWalletPosition = (pos: any, totalCost: number): Position => {
  const cost = Number(pos.buy_price) || 0;
  const last = Number(pos.current_price || pos.buy_price) || cost;
  const qty = Number(pos.qty) || 0;
  const stop = Number(pos.stop_price) || cost;

  // Days held
  const entryDate = pos.entry_date ? new Date(pos.entry_date) : new Date();
  const today = new Date();
  const days = Math.max(Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)), 0);

  // Basic math
  const tCost = cost * qty;
  const return_ = (last - cost) * qty;
  const returnPct = tCost > 0 ? return_ / tCost : 0;
  const pflPct = totalCost > 0 ? tCost / totalCost : 0;
  const pctChg = pos.change_percent ?? (cost > 0 ? (last - cost) / cost : 0);
  const growth = last - cost;
  const mgnPct = pos.marginable_percent != null ? Number(pos.marginable_percent) / 100 : 0;

  // RS from percent_change fields (approximate relative strength)
  const rs6m = pos.percent_change_126d ? pos.percent_change_126d / 100 : 0;
  const rs1m = pos.percent_change_20d ? pos.percent_change_20d / 100 : 0;
  const rs1w = pos.percent_change_15d ? pos.percent_change_15d / 100 : 0;
  const rs3m = rs6m && rs1m ? (rs6m + rs1m) / 2 : rs6m || rs1m;
  const rsTotal = rs6m + rs1m + rs1w;
  const rsGrade = rsTotal > 0.3 ? "A" : rsTotal > 0.15 ? "B" : rsTotal > 0 ? "C" : rsTotal > -0.15 ? "D" : "F";

  // Trend & Signals
  const trendSignal = pos.trend_signal ?? false;
  const finalSignal = pos.final_signal ?? false;
  const score = pos.score ?? 0;
  const trend = trendSignal ? "UP" : "—";

  // S-RS (Score-based RS proxy)
  const sRs = score;
  const sma150 = pos.sma_150 ?? 0;
  const s150ma = sma150 > 0 && last > 0 ? (last - sma150) / sma150 : 0;

  // Risk & Reward
  const cLossPct = cost > 0 ? (cost - stop) / cost : 0;
  const riskAmount = cost - stop;
  const cRRR = riskAmount > 0 ? (last - cost) / riskAmount : 0;

  // Risk Financed Shares
  const denom = last - stop;
  const rfShares = (pctNum: number) => denom > 0 ? (riskAmount * qty * pctNum) / denom : 0;
  const rf100 = rfShares(1.0);
  const rf75 = rfShares(0.75);
  const rf50 = rfShares(0.50);
  const rf25 = rfShares(0.25);

  // Effective Stop
  const effStop = (sharesSold: number) => {
    if (qty === 0 || cost === 0) return 0;
    const newStopValue = (sharesSold * last + (qty - sharesSold) * stop) / qty;
    return (cost - newStopValue) / cost;
  };

  // Parse Transactions
  let addDate1 = "";
  let addDate2 = "";
  let addDate3 = "";
  let sellValue = 0; // Last sell price
  let sellQty = 0; // Total quantity sold
  let tSold = 0; // Total cash from sold shares
  let exitDate = "";

  if (pos.transactions && Array.isArray(pos.transactions)) {
    const adds = pos.transactions.filter((t: any) => t.type === 'add');
    const sells = pos.transactions.filter((t: any) => t.type === 'sell');

    if (adds[0]) addDate1 = adds[0].date;
    if (adds[1]) addDate2 = adds[1].date;
    if (adds[2]) addDate3 = adds[2].date;

    if (sells.length > 0) {
      const lastSell = sells[sells.length - 1];
      exitDate = lastSell.date;
      sellValue = Number(lastSell.price) || 0; 
      sellQty = sells.reduce((acc: number, t: any) => acc + Number(t.qty || 0), 0);
      tSold = sells.reduce((acc: number, t: any) => acc + (Number(t.qty || 0) * Number(t.price || 0)), 0);
    }
  }

  return {
    id: pos.id,
    pfl: pos.portfolio_name || "Default",
    sym: pos.symbol,
    name: pos.name || "",
    pflPct,
    mgnPct,
    shortPct: 0,
    pctChg,
    last,
    cost,
    growth,
    rsGrade,
    rs: rsTotal,
    rs6m,
    rs3m,
    rs1m,
    rs1w,
    trend,
    sRs,
    sRs3m: score,
    sRs1m: score,
    s150ma,
    entryDate: pos.entry_date || "",
    addDate1,
    addDate2,
    addDate3,
    qty,
    tCost,
    sellValue,
    sell: sellQty,
    exitDate,
    tSold,
    return_,
    returnPct,
    days,
    stopPrice: stop,
    cRRR,
    cLossPct,
    pctOfPtf: pflPct,
    rf100,
    rf75,
    rf50,
    rf25,
    es100: effStop(rf100),
    es75: effStop(rf75),
    es50: effStop(rf50),
    es25: effStop(rf25),
    position: finalSignal ? "BUY" : "HOLD",
    category: pos.industry_group || "",
    pPrice: last,
    amount: tCost,
    qtyPlan: qty,
    gain: returnPct > 0 ? returnPct : 0,
    loss: returnPct < 0 ? -returnPct : 0,
    rrr: cRRR,
    pandl: return_,
    pandlPct: returnPct,
    tCostFull: tCost,
    sector: pos.sector || "",
    sellMnth: "",
    sellMnthNum: 0,
    sellAllMnth: 13,
    allPandl: return_,
    pct: returnPct,
    cGain: last,
    ptTV: last * qty,
    ptV: return_,
    ptPct: returnPct,
    pflCost: tCost,
  };
};

function getCellValue(pos: Position, col: string): { display: string; className?: string } {
  switch (col) {
    case "Pfl.": return { display: pos.pfl };
    case "Sym": return { display: String(pos.sym) };
    case "Name": return { display: pos.name };
    case "Pfl.%": return { display: pct(pos.pflPct), className: "text-sky-700" };
    case "Mgn%": return { display: fmt(pos.mgnPct), className: "text-slate-600" };
    case "Short%": return { display: fmt(pos.shortPct) };
    case "%Chg": return { display: pct(pos.pctChg), className: color(pos.pctChg) };
    case "Last": return { display: fmt(pos.last), className: "font-semibold text-slate-900" };
    case "Cost": return { display: fmt(pos.cost) };
    case "Growth": return { display: fmt(pos.growth) };
    case "RS-Grade": return { display: pos.rsGrade || "—" };
    case "RS": return { display: fmt(pos.rs) };
    case "RS-6M": return { display: fmt(pos.rs6m) };
    case "RS-3M": return { display: fmt(pos.rs3m) };
    case "RS-1M": return { display: fmt(pos.rs1m) };
    case "RS-1W": return { display: fmt(pos.rs1w) };
    case "Trend": return { display: pos.trend || "—" };
    case "S-RS": return { display: fmt(pos.sRs) };
    case "S-RS-3M": return { display: fmt(pos.sRs3m) };
    case "S-RS-1M": return { display: fmt(pos.sRs1m) };
    case "S-150 MA": return { display: fmt(pos.s150ma) };
    case "Entry date": return { display: pos.entryDate || "—" };
    case "Add date 1": return { display: pos.addDate1 || "—" };
    case "Add date 2": return { display: pos.addDate2 || "—" };
    case "Add date 3": return { display: pos.addDate3 || "—" };
    case "Qty": return { display: fmt(pos.qty, 0), className: "text-sky-700" };
    case "T.Cost": return { display: fmt(pos.tCost, 0) };
    case "Sell Value": return { display: fmt(pos.sellValue, 0) };
    case "Sell": return { display: fmt(pos.sell, 0) };
    case "Exit date": return { display: pos.exitDate || "—" };
    case "T.Sold": return { display: fmt(pos.tSold, 0) };
    case "Return": return { display: fmt(pos.return_, 0), className: color(pos.return_) };
    case "Return%": return { display: pct(pos.returnPct), className: color(pos.returnPct) };
    case "Days": return { display: String(pos.days), className: "text-slate-600" };
    case "Stop Price": return { display: fmt(pos.stopPrice), className: "text-amber-700" };
    case "C.RRR": return { display: fmt(pos.cRRR) };
    case "C.Loss%": return { display: pct(pos.cLossPct), className: "text-red-600" };
    case "% of Ptf.": return { display: pct(pos.pctOfPtf), className: "text-violet-700" };
    case "RF-100%": return { display: fmt(pos.rf100, 0), className: "text-emerald-700" };
    case "RF-75%": return { display: fmt(pos.rf75, 0), className: "text-emerald-600" };
    case "RF-50%": return { display: fmt(pos.rf50, 0), className: "text-emerald-600" };
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
    case "Loss": return { display: pct(pos.loss), className: "text-red-600" };
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

// ── Column group colors ───────────────────────────────────────────────────────
const GROUP_COLORS: Record<string, string> = {
  "Identity": "bg-slate-100 text-slate-700",
  "Allocation": "bg-sky-50 text-sky-800",
  "Price": "bg-slate-100 text-slate-700",
  "RS": "bg-violet-50 text-violet-800",
  "Signal": "bg-indigo-50 text-indigo-800",
  "Dates": "bg-slate-50 text-slate-600",
  "Position": "bg-slate-100 text-slate-700",
  "Performance": "bg-slate-50 text-slate-700",
  "Risk Financed": "bg-emerald-50 text-emerald-800",
  "Effective Stop": "bg-amber-50 text-amber-800",
  "Plan": "bg-slate-50 text-slate-600",
  "P&L": "bg-slate-100 text-slate-700",
  "Summary": "bg-slate-50 text-slate-600",
};

const GROUP_HEADER_COLORS: Record<string, string> = {
  "Identity": "bg-slate-200 text-slate-800",
  "Allocation": "bg-sky-200 text-sky-900",
  "Price": "bg-slate-200 text-slate-800",
  "RS": "bg-violet-200 text-violet-900",
  "Signal": "bg-indigo-200 text-indigo-900",
  "Dates": "bg-slate-200 text-slate-700",
  "Position": "bg-slate-200 text-slate-800",
  "Performance": "bg-slate-200 text-slate-800",
  "Risk Financed": "bg-emerald-200 text-emerald-900",
  "Effective Stop": "bg-amber-200 text-amber-900",
  "Plan": "bg-slate-200 text-slate-700",
  "P&L": "bg-slate-200 text-slate-800",
  "Summary": "bg-slate-200 text-slate-700",
};

// ── Component ─────────────────────────────────────────────────────────────────
export default function PortfolioPage() {
  const { toast } = useToast();
  const [activeGroups, setActiveGroups] = useState<Set<string>>(
    new Set(["Identity", "Price", "Position", "Performance", "Risk Financed", "Effective Stop", "P&L"])
  );
  const [search, setSearch] = useState("");
  const [data, setData] = useState<Position[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newPosition, setNewPosition] = useState({
    symbol: "",
    name: "",
    qty: 0,
    buy_price: 0,
    stop_price: 0,
    portfolio_name: "Default",
    entry_date: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    loadPositions();
  }, []);

  const loadPositions = async () => {
    try {
      const positions = await fetchPortfolioPositions();
      const totalCost = positions.reduce((sum, p) => sum + (Number(p.qty) * Number(p.buy_price)), 0);
      setData(positions.map(p => mapWalletPosition(p, totalCost)));
    } catch (error) {
      console.error("Failed to load wallet positions", error);
    }
  };

  const handleAddPosition = async () => {
    try {
      await createPortfolioPosition(newPosition);
      setIsAdding(false);
      setNewPosition({
        symbol: "",
        name: "",
        qty: 0,
        buy_price: 0,
        stop_price: 0,
        portfolio_name: "Default",
        entry_date: new Date().toISOString().slice(0, 10),
      });
      await loadPositions();
      toast("Position added successfully!", "success");
    } catch (error) {
      console.error("Failed to create position", error);
      toast("Failed to add position.", "error");
    }
  };

  const handleClosePosition = async (id: number) => {
    if (!confirm("Are you sure you want to close this position? It will be moved to the Monthly Tracker.")) return;
    try {
      await closePortfolioPosition(id);
      await loadPositions();
      toast("Position closed and moved to Monthly Tracker.", "success");
    } catch (error) {
      console.error("Failed to close position", error);
      toast("Failed to close position.", "error");
    }
  };

  // ── Action Handlers ──
  const [editingPos, setEditingPos] = useState<any>(null);
  const [addingPos, setAddingPos] = useState<any>(null);
  const [sellingPos, setSellingPos] = useState<any>(null);

  const handleUpdateSubmit = async () => {
    try {
      await updatePortfolioPosition(editingPos.id, {
        name: editingPos.name,
        qty: Number(editingPos.qty),
        buy_price: Number(editingPos.buy_price),
        stop_price: editingPos.stop_price ? Number(editingPos.stop_price) : null,
      });
      setEditingPos(null);
      await loadPositions();
      toast("Position updated", "success");
    } catch (e) { toast("Update failed", "error"); }
  };

  const handleAddSubmit = async () => {
    try {
      await addSharesToPosition(addingPos.id, {
        qty: Number(addingPos.add_qty),
        buy_price: Number(addingPos.add_price),
        trade_date: addingPos.add_date,
      });
      setAddingPos(null);
      await loadPositions();
      toast("Shares added successfully", "success");
    } catch (e) { toast("Failed to add shares", "error"); }
  };

  const handleSellSubmit = async () => {
    try {
      await partialSellPosition(sellingPos.id, {
        qty: Number(sellingPos.sell_qty),
        sell_price: Number(sellingPos.sell_price),
        trade_date: sellingPos.sell_date,
      });
      setSellingPos(null);
      await loadPositions();
      toast("Shares sold successfully", "success");
    } catch (e) { toast("Failed to sell shares", "error"); }
  };

  const toggleGroup = (g: string) => {
    setActiveGroups(prev => {
      const next = new Set(prev);
      next.has(g) ? next.delete(g) : next.add(g);
      return next;
    });
  };

  const visibleCols = useMemo(() => {
    return COL_GROUPS
      .filter(g => activeGroups.has(g.label))
      .flatMap(g => g.cols.map(c => ({ col: c, group: g.label })));
  }, [activeGroups]);

  const filtered = useMemo(() =>
    data.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      String(p.sym).includes(search)
    ), [data, search]);

  // Summary stats
  const totalReturn = filtered.reduce((s, p) => s + p.return_, 0);
  const totalCost = filtered.reduce((s, p) => s + p.tCost, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">

      {/* ── Header ── */}
      <div className="border-b border-slate-200 bg-white px-6 py-4 flex items-center justify-between gap-4 flex-wrap shadow-sm">
        <div>
          <h1 className="text-slate-900 text-xl font-semibold tracking-tight">Portfolio</h1>
          <p className="text-slate-500 text-sm mt-1">
            {filtered.length} position{filtered.length !== 1 ? "s" : ""} &nbsp;·&nbsp;
            Total cost: <span className="text-slate-700 font-medium">{fmt(totalCost, 0)} SAR</span> &nbsp;·&nbsp;
            Total return: <span className={`font-medium ${color(totalReturn)}`}>{fmt(totalReturn, 0)} SAR</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 w-52"
            placeholder="Search symbol / name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
            onClick={() => setIsAdding(prev => !prev)}
          >
            {isAdding ? "Cancel" : "+ Add Position"}
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="border-b border-slate-200 px-6 py-4 bg-slate-50">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Symbol</label>
              <input
                className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="e.g. 2222"
                value={newPosition.symbol}
                onChange={e => setNewPosition({ ...newPosition, symbol: e.target.value.toUpperCase() })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</label>
              <input
                className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="e.g. ARAMCO"
                value={newPosition.name}
                onChange={e => setNewPosition({ ...newPosition, name: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Entry Date</label>
              <input
                type="date"
                className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                value={newPosition.entry_date}
                onChange={e => setNewPosition({ ...newPosition, entry_date: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Quantity</label>
              <input
                type="number"
                className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="e.g. 100"
                value={newPosition.qty}
                onChange={e => setNewPosition({ ...newPosition, qty: Number(e.target.value) })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Buy Price (SAR)</label>
              <input
                type="number"
                className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="e.g. 35.50"
                value={newPosition.buy_price}
                onChange={e => setNewPosition({ ...newPosition, buy_price: Number(e.target.value) })}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Stop Price (SAR)</label>
              <input
                type="number"
                className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="e.g. 32.00"
                value={newPosition.stop_price}
                onChange={e => setNewPosition({ ...newPosition, stop_price: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg font-medium shadow-sm"
              onClick={handleAddPosition}
            >
              Save Position
            </button>
          </div>
        </div>
      )}

      {/* ── Column group toggles ── */}
      <div className="px-6 py-3 border-b border-slate-200 bg-white flex flex-wrap gap-2">
        <span className="text-slate-500 text-xs self-center font-medium">Columns:</span>
        {COL_GROUPS.map(g => (
          <button
            key={g.label}
            onClick={() => toggleGroup(g.label)}
            className={`text-xs px-2.5 py-1 rounded-md border transition-all ${activeGroups.has(g.label)
              ? `${GROUP_HEADER_COLORS[g.label]} border-transparent shadow-sm`
              : "bg-white border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-50"
              }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto bg-white">
        <table className="w-full text-xs border-collapse min-w-max">
          <thead>
            {/* Group header row */}
            <tr className="border-b border-slate-200">
              {COL_GROUPS.filter(g => activeGroups.has(g.label)).map(g => (
                <th
                  key={g.label}
                  colSpan={g.cols.length}
                  className={`px-2 py-1.5 text-center text-[10px] font-semibold tracking-widest uppercase border-r border-slate-200 ${GROUP_HEADER_COLORS[g.label]}`}
                >
                  {g.label}
                </th>
              ))}
            </tr>
            {/* Column header row */}
            <tr className="border-b border-slate-300 sticky top-0 z-10 shadow-sm">
              {visibleCols.map(({ col, group }) => (
                <th
                  key={`${group}-${col}`}
                  className={`px-2 py-2 text-center whitespace-nowrap font-medium tracking-tight border-r border-slate-200 ${GROUP_COLORS[group]}`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={visibleCols.length} className="text-center py-16 text-slate-500">
                  No positions found
                </td>
              </tr>
            )}
            {filtered.map((pos, i) => (
              <tr
                key={i}
                className="border-b border-slate-100 hover:bg-slate-50 transition-colors even:bg-slate-50/40"
              >
                {visibleCols.map(({ col, group }) => {
                  const { display, className } = getCellValue(pos, col);
                  return (
                    <td
                      key={`${group}-${col}`}
                      className={`px-2 py-2.5 text-center whitespace-nowrap border-r border-slate-100 tabular-nums relative group ${className ?? "text-slate-600"}`}
                    >
                      {col === "Sym" ? (
                        <div className="flex items-center justify-between relative group/sym">
                          <span>{display}</span>
                          <div className="opacity-0 group-hover/sym:opacity-100 flex items-center gap-1 absolute -right-1 bg-white/90 backdrop-blur-sm px-1 py-0.5 rounded shadow-sm border border-slate-200 transition-all z-20">
                            <button
                              onClick={() => setEditingPos({ id: pos.id, name: pos.name, qty: pos.qty, buy_price: pos.cost, stop_price: pos.stopPrice })}
                              title="Edit Position"
                              className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded px-1.5 py-0.5 text-[10px] transition-colors"
                            >
                              E
                            </button>
                            <button
                              onClick={() => setAddingPos({ id: pos.id, symbol: pos.sym, add_qty: "", add_price: pos.last, add_date: new Date().toISOString().slice(0, 10) })}
                              title="Add Shares"
                              className="bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded px-1.5 py-0.5 text-[10px] transition-colors"
                            >
                              +
                            </button>
                            <button
                              onClick={() => setSellingPos({ id: pos.id, symbol: pos.sym, max_qty: pos.qty, sell_qty: "", sell_price: pos.last, sell_date: new Date().toISOString().slice(0, 10) })}
                              title="Partial Sell"
                              className="bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white rounded px-1.5 py-0.5 text-[10px] transition-colors"
                            >
                              -
                            </button>
                            <button
                              onClick={() => handleClosePosition(pos.id)}
                              title="Close Fully"
                              className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded px-1.5 py-0.5 text-[10px] transition-colors"
                            >
                              x
                            </button>
                          </div>
                        </div>
                      ) : display}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>

          {/* ── Totals footer ── */}
          <tfoot>
            <tr className="border-t-2 border-slate-300 bg-slate-100 font-semibold">
              {visibleCols.map(({ col, group }, i) => {
                let val = "—";
                let cls = "text-slate-500";
                if (col === "T.Cost") { val = fmt(totalCost, 0); cls = "text-slate-800 font-semibold"; }
                if (col === "Return") { val = fmt(totalReturn, 0); cls = `font-semibold ${color(totalReturn)}`; }
                if (col === "Name" || col === "Pfl.") { val = "TOTAL"; cls = "text-slate-700 font-semibold text-left"; }
                return (
                  <td key={`${group}-${col}`} className={`px-2 py-2.5 text-center border-r border-slate-200 tabular-nums ${cls}`}>
                    {val}
                  </td>
                );
              })}
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ── Empty state prompt ── */}
      {data.length <= 1 && (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-50">
          <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mb-4 text-2xl">📊</div>
          <p className="text-slate-600 text-sm mb-1">Connect the backend to load your full portfolio</p>
          <p className="text-slate-400 text-xs font-mono">POST /api/wallet/portfolio/positions</p>
        </div>
      )}

      {/* ── Modals ── */}
      {editingPos && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-slate-800">Edit Position</h3>
              <button onClick={() => setEditingPos(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Name</label>
                <input value={editingPos.name} onChange={e => setEditingPos({...editingPos, name: e.target.value})} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Quantity</label>
                  <input type="number" value={editingPos.qty} onChange={e => setEditingPos({...editingPos, qty: e.target.value})} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Buy Price</label>
                  <input type="number" value={editingPos.buy_price} onChange={e => setEditingPos({...editingPos, buy_price: e.target.value})} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Stop Price</label>
                <input type="number" value={editingPos.stop_price} onChange={e => setEditingPos({...editingPos, stop_price: e.target.value})} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-blue-500 outline-none" />
              </div>
              <button onClick={handleUpdateSubmit} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded transition-colors mt-2">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {addingPos && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-emerald-100 flex justify-between items-center bg-emerald-50 text-emerald-800">
              <h3 className="font-semibold">Add Shares (Scale In) - {addingPos.symbol}</h3>
              <button onClick={() => setAddingPos(null)} className="opacity-70 hover:opacity-100">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Add Qty</label>
                  <input type="number" value={addingPos.add_qty} onChange={e => setAddingPos({...addingPos, add_qty: e.target.value})} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none" placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Buy Price</label>
                  <input type="number" value={addingPos.add_price} onChange={e => setAddingPos({...addingPos, add_price: e.target.value})} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Date</label>
                <input type="date" value={addingPos.add_date} onChange={e => setAddingPos({...addingPos, add_date: e.target.value})} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-emerald-500 outline-none" />
              </div>
              <button onClick={handleAddSubmit} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded transition-colors mt-2">Confirm Add</button>
            </div>
          </div>
        </div>
      )}

      {sellingPos && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-amber-100 flex justify-between items-center bg-amber-50 text-amber-800">
              <h3 className="font-semibold">Partial Sell - {sellingPos.symbol}</h3>
              <button onClick={() => setSellingPos(null)} className="opacity-70 hover:opacity-100">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">Available to sell: <span className="font-bold">{sellingPos.max_qty}</span> shares</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Sell Qty</label>
                  <input type="number" value={sellingPos.sell_qty} onChange={e => setSellingPos({...sellingPos, sell_qty: e.target.value})} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-amber-500 outline-none" placeholder="0" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Sell Price</label>
                  <input type="number" value={sellingPos.sell_price} onChange={e => setSellingPos({...sellingPos, sell_price: e.target.value})} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-amber-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Date</label>
                <input type="date" value={sellingPos.sell_date} onChange={e => setSellingPos({...sellingPos, sell_date: e.target.value})} className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:border-amber-500 outline-none" />
              </div>
              <button onClick={handleSellSubmit} className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 rounded transition-colors mt-2">Confirm Sell</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}