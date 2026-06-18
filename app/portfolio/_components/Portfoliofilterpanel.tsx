'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, RotateCcw, SlidersHorizontal, Search, X } from 'lucide-react';

// ── Filter State — covers every column in the portfolio table ─────────────────
export interface PortfolioFilterState {
    // Identity
    symbol: string;
    name: string;
    pfl: string;
    // Allocation
    pflPct_min: string; pflPct_max: string;
    mgnPct_min: string; mgnPct_max: string;
    shortPct_min: string; shortPct_max: string;
    // Price
    pctChg_min: string; pctChg_max: string;
    last_min: string; last_max: string;
    cost_min: string; cost_max: string;
    // RS
    rsRating_min: string; rsRating_max: string;
    rank1m_min: string; rank1m_max: string;
    rank3m_min: string; rank3m_max: string;
    rank6m_min: string; rank6m_max: string;
    rank9m_min: string; rank9m_max: string;
    rank12m_min: string; rank12m_max: string;
    // Signal
    trend: 'any' | 'yes' | 'no';
    sRs_min: string; sRs_max: string;
    sRs3m_min: string; sRs3m_max: string;
    sRs1m_min: string; sRs1m_max: string;
    s150ma_min: string; s150ma_max: string;
    // Position cols
    qty_min: string; qty_max: string;
    tCost_min: string; tCost_max: string;
    sellValue_min: string; sellValue_max: string;
    sell_min: string; sell_max: string;
    tSold_min: string; tSold_max: string;
    // Performance
    return_min: string; return_max: string;
    returnPct_min: string; returnPct_max: string;
    days_min: string; days_max: string;
    stopPrice_min: string; stopPrice_max: string;
    cRRR_min: string; cRRR_max: string;
    cLossPct_min: string; cLossPct_max: string;
    pctOfPtf_min: string; pctOfPtf_max: string;
    // Risk Financed
    rf100_min: string; rf100_max: string;
    rf75_min: string; rf75_max: string;
    rf50_min: string; rf50_max: string;
    rf25_min: string; rf25_max: string;
    // Effective Stop
    es100_min: string; es100_max: string;
    es75_min: string; es75_max: string;
    es50_min: string; es50_max: string;
    es25_min: string; es25_max: string;
    // Plan
    position: 'any' | 'BUY' | 'HOLD';
    category: string;
    pPrice_min: string; pPrice_max: string;
    amount_min: string; amount_max: string;
    qtyPlan_min: string; qtyPlan_max: string;
    gain_min: string; gain_max: string;
    loss_min: string; loss_max: string;
    rrr_min: string; rrr_max: string;
    // P&L
    pandl_min: string; pandl_max: string;
    pandlPct_min: string; pandlPct_max: string;
    tCostFull_min: string; tCostFull_max: string;
    sector: string;
    sellMnthNum_min: string; sellMnthNum_max: string;
    sellAllMnth_min: string; sellAllMnth_max: string;
    // Summary
    allPandl_min: string; allPandl_max: string;
    pct_min: string; pct_max: string;
    cGain_min: string; cGain_max: string;
    ptTV_min: string; ptTV_max: string;
    ptV_min: string; ptV_max: string;
    ptPct_min: string; ptPct_max: string;
    pflCost_min: string; pflCost_max: string;
}

export const initialPortfolioFilterState: PortfolioFilterState = {
    symbol: '', name: '', pfl: '',
    pflPct_min: '', pflPct_max: '',
    mgnPct_min: '', mgnPct_max: '',
    shortPct_min: '', shortPct_max: '',
    pctChg_min: '', pctChg_max: '',
    last_min: '', last_max: '',
    cost_min: '', cost_max: '',
    rsRating_min: '', rsRating_max: '',
    rank1m_min: '', rank1m_max: '',
    rank3m_min: '', rank3m_max: '',
    rank6m_min: '', rank6m_max: '',
    rank9m_min: '', rank9m_max: '',
    rank12m_min: '', rank12m_max: '',
    trend: 'any',
    sRs_min: '', sRs_max: '',
    sRs3m_min: '', sRs3m_max: '',
    sRs1m_min: '', sRs1m_max: '',
    s150ma_min: '', s150ma_max: '',
    qty_min: '', qty_max: '',
    tCost_min: '', tCost_max: '',
    sellValue_min: '', sellValue_max: '',
    sell_min: '', sell_max: '',
    tSold_min: '', tSold_max: '',
    return_min: '', return_max: '',
    returnPct_min: '', returnPct_max: '',
    days_min: '', days_max: '',
    stopPrice_min: '', stopPrice_max: '',
    cRRR_min: '', cRRR_max: '',
    cLossPct_min: '', cLossPct_max: '',
    pctOfPtf_min: '', pctOfPtf_max: '',
    rf100_min: '', rf100_max: '',
    rf75_min: '', rf75_max: '',
    rf50_min: '', rf50_max: '',
    rf25_min: '', rf25_max: '',
    es100_min: '', es100_max: '',
    es75_min: '', es75_max: '',
    es50_min: '', es50_max: '',
    es25_min: '', es25_max: '',
    position: 'any',
    category: '',
    pPrice_min: '', pPrice_max: '',
    amount_min: '', amount_max: '',
    qtyPlan_min: '', qtyPlan_max: '',
    gain_min: '', gain_max: '',
    loss_min: '', loss_max: '',
    rrr_min: '', rrr_max: '',
    pandl_min: '', pandl_max: '',
    pandlPct_min: '', pandlPct_max: '',
    tCostFull_min: '', tCostFull_max: '',
    sector: '',
    sellMnthNum_min: '', sellMnthNum_max: '',
    sellAllMnth_min: '', sellAllMnth_max: '',
    allPandl_min: '', allPandl_max: '',
    pct_min: '', pct_max: '',
    cGain_min: '', cGain_max: '',
    ptTV_min: '', ptTV_max: '',
    ptV_min: '', ptV_max: '',
    ptPct_min: '', ptPct_max: '',
    pflCost_min: '', pflCost_max: '',
};

// ── Tab IDs — one per COL_GROUP ───────────────────────────────────────────────
type TabId =
    | 'identity'
    | 'price'
    | 'rs_signal'
    | 'position'
    | 'performance'
    | 'risk'
    | 'plan'
    | 'pnl_summary';

const TABS: { id: TabId; label: string }[] = [
    { id: 'identity', label: 'Identity & Allocation' },
    { id: 'price', label: 'Price' },
    { id: 'rs_signal', label: 'RS & Signal' },
    { id: 'position', label: 'Position' },
    { id: 'performance', label: 'Performance' },
    { id: 'risk', label: 'Risk Financed & Eff. Stop' },
    { id: 'plan', label: 'Plan' },
    { id: 'pnl_summary', label: 'P&L & Summary' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Primitive UI components
// ─────────────────────────────────────────────────────────────────────────────

function StepperInput({ value, onChange, placeholder, inputWidth = 'w-[52px]' }: {
    value: string; onChange: (v: string) => void; placeholder: string; inputWidth?: string;
}) {
    const [local, setLocal] = useState(value ?? '');
    useEffect(() => { setLocal(value ?? ''); }, [value]);
    const active = value !== '';
    const commit = (v: string) => { if (v !== value) onChange(v); };
    const step = (dir: number) => {
        const n = (parseFloat(local) || 0) + dir;
        const dec = local.includes('.') ? local.split('.')[1].length : 0;
        const next = dec > 0 ? n.toFixed(dec) : String(n);
        setLocal(next); commit(next);
    };
    return (
        <div className={`inline-flex items-center h-[22px] border rounded-sm overflow-hidden transition-all ${active ? 'border-blue-400' : 'border-gray-200 hover:border-gray-300'}`}>
            <button type="button" onClick={() => step(-1)}
                className={`w-[18px] h-full flex items-center justify-center text-[12px] font-bold flex-shrink-0 select-none transition-colors ${active ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}>−</button>
            <input type="number" value={local} placeholder={placeholder}
                style={{ MozAppearance: 'textfield' } as React.CSSProperties}
                className={`${inputWidth} h-full px-1 text-[11px] outline-none text-center tabular-nums border-x [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${active ? 'bg-blue-50 text-blue-800 font-semibold border-blue-300' : 'bg-white text-gray-700 placeholder:text-gray-300 border-gray-200 focus:bg-blue-50/30 focus:border-blue-300'}`}
                onChange={e => setLocal(e.target.value)}
                onBlur={() => commit(local)}
                onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur(); }}
            />
            <button type="button" onClick={() => step(1)}
                className={`w-[18px] h-full flex items-center justify-center text-[12px] font-bold flex-shrink-0 select-none transition-colors ${active ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}>+</button>
        </div>
    );
}

function RangeRow({ label, minVal, maxVal, onMin, onMax, labelWidth = 'w-[130px]', inputWidth }: {
    label: string; minVal: string; maxVal: string;
    onMin: (v: string) => void; onMax: (v: string) => void;
    labelWidth?: string; inputWidth?: string;
}) {
    const active = minVal !== '' || maxVal !== '';
    return (
        <div className="flex items-center gap-2 py-[3px] group">
            <span title={label} className={`text-[11px] ${labelWidth} flex-shrink-0 truncate leading-tight transition-colors ${active ? 'text-blue-700 font-semibold' : 'text-gray-500 group-hover:text-gray-700'}`}>{label}</span>
            <StepperInput value={minVal} onChange={onMin} placeholder="Min" inputWidth={inputWidth} />
            <span className="text-[10px] text-gray-400 select-none font-medium">to</span>
            <StepperInput value={maxVal} onChange={onMax} placeholder="Max" inputWidth={inputWidth} />
        </div>
    );
}

function SectionHead({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-2 mt-[14px] mb-[5px] first:mt-0">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.1em] whitespace-nowrap leading-none">{children}</span>
            <div className="flex-1 h-px bg-gray-100" />
        </div>
    );
}

function ColDivider() {
    return <div className="self-stretch w-px bg-gray-100 flex-shrink-0 mx-3" />;
}

function BooleanRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    const active = value !== 'any';
    return (
        <div className="flex items-start gap-2 py-[3px] group">
            <span className={`text-[11px] min-w-[130px] flex-shrink-0 leading-tight transition-colors ${active ? 'text-blue-700 font-semibold' : 'text-gray-500 group-hover:text-gray-700'}`}>{label}</span>
            <div className="flex items-center h-[22px] rounded-sm p-[2px] bg-gray-100/80 border border-gray-200 mt-[1px]">
                <button type="button" onClick={() => onChange(value === 'yes' ? 'any' : 'yes')}
                    className={`px-2.5 h-full rounded-[2px] text-[10px] font-bold uppercase tracking-wider transition-all ${value === 'yes' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'}`}>Yes</button>
                <button type="button" onClick={() => onChange(value === 'no' ? 'any' : 'no')}
                    className={`px-2.5 h-full rounded-[2px] text-[10px] font-bold uppercase tracking-wider transition-all ${value === 'no' ? 'bg-red-500 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'}`}>No</button>
            </div>
        </div>
    );
}

function PositionToggle({ value, onChange }: { value: 'any' | 'BUY' | 'HOLD'; onChange: (v: 'any' | 'BUY' | 'HOLD') => void }) {
    const active = value !== 'any';
    return (
        <div className="flex items-center gap-2 py-[3px] group">
            <span className={`text-[11px] min-w-[130px] flex-shrink-0 leading-tight transition-colors ${active ? 'text-blue-700 font-semibold' : 'text-gray-500 group-hover:text-gray-700'}`}>Signal</span>
            <div className="flex items-center h-[22px] rounded-sm p-[2px] bg-gray-100/80 border border-gray-200">
                {(['any', 'BUY', 'HOLD'] as const).map(opt => (
                    <button key={opt} type="button" onClick={() => onChange(opt)}
                        className={`px-2.5 h-full rounded-[2px] text-[10px] font-bold uppercase tracking-wider transition-all ${value === opt ? (opt === 'BUY' ? 'bg-emerald-600 text-white shadow-sm' : opt === 'HOLD' ? 'bg-amber-500 text-white shadow-sm' : 'bg-slate-600 text-white shadow-sm') : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'}`}>
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    );
}

function TextFilterRow({ label, value, onChange, placeholder, labelWidth = 'w-[130px]' }: {
    label: string; value: string; onChange: (v: string) => void; placeholder?: string; labelWidth?: string;
}) {
    const active = value !== '';
    return (
        <div className="flex items-center gap-2 py-[3px] group">
            <span className={`text-[11px] ${labelWidth} flex-shrink-0 truncate leading-tight transition-colors ${active ? 'text-blue-700 font-semibold' : 'text-gray-500 group-hover:text-gray-700'}`}>{label}</span>
            <div className={`flex items-center gap-1 h-[22px] px-2 border rounded-sm transition-all ${active ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white focus-within:border-blue-400'}`}>
                <input type="text" value={value} placeholder={placeholder ?? `Filter ${label}…`}
                    onChange={e => onChange(e.target.value)}
                    className={`w-[120px] text-[11px] outline-none bg-transparent ${active ? 'text-blue-800 font-semibold' : 'text-gray-700 placeholder:text-gray-300'}`}
                />
                {active && <button onClick={() => onChange('')}><X size={9} className="text-gray-400 hover:text-gray-700" /></button>}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Count active filters
// ─────────────────────────────────────────────────────────────────────────────
export function countActiveFilters(f: PortfolioFilterState): number {
    let n = 0;
    if (f.symbol) n++;
    if (f.name) n++;
    if (f.pfl) n++;
    if (f.category) n++;
    if (f.sector) n++;
    if (f.trend !== 'any') n++;
    if (f.position !== 'any') n++;
    const rangeKeys = [
        'pflPct', 'mgnPct', 'shortPct',
        'pctChg', 'last', 'cost',
        'rsRating', 'rank1m', 'rank3m', 'rank6m', 'rank9m', 'rank12m',
        'sRs', 'sRs3m', 'sRs1m', 's150ma',
        'qty', 'tCost', 'sellValue', 'sell', 'tSold',
        'return', 'returnPct', 'days', 'stopPrice', 'cRRR', 'cLossPct', 'pctOfPtf',
        'rf100', 'rf75', 'rf50', 'rf25',
        'es100', 'es75', 'es50', 'es25',
        'pPrice', 'amount', 'qtyPlan', 'gain', 'loss', 'rrr',
        'pandl', 'pandlPct', 'tCostFull', 'sellMnthNum', 'sellAllMnth',
        'allPandl', 'pct', 'cGain', 'ptTV', 'ptV', 'ptPct', 'pflCost',
    ];
    rangeKeys.forEach(k => {
        if ((f as any)[`${k}_min`] || (f as any)[`${k}_max`]) n++;
    });
    return n;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
interface PortfolioFilterPanelProps {
    filters: PortfolioFilterState;
    setFilters: React.Dispatch<React.SetStateAction<PortfolioFilterState>>;
    portfolios: string[];
    activeFiltersCount: number;
    clearAllFilters: () => void;
}

export default function PortfolioFilterPanel({ filters, setFilters, portfolios, activeFiltersCount, clearAllFilters }: PortfolioFilterPanelProps) {
    const [activeTab, setActiveTab] = useState<TabId>('identity');
    const [collapsed, setCollapsed] = useState(true);

    const f = filters;
    const s = (patch: Partial<PortfolioFilterState>) => setFilters(prev => ({ ...prev, ...patch }));

    // ── Tab content ─────────────────────────────────────────────────────────────

    // TAB 1: Identity & Allocation
    function TabIdentity() {
        return (
            <>
                <div className="flex-shrink-0">
                    <SectionHead>Identity</SectionHead>
                    <div className="flex items-center gap-2 py-[3px] group">
                        <span className="text-[11px] w-[130px] flex-shrink-0 text-gray-500 group-hover:text-gray-700">Portfolio</span>
                        <select value={f.pfl} onChange={e => s({ pfl: e.target.value })}
                            className={`h-[22px] px-2 text-[11px] border rounded-sm outline-none transition-all ${f.pfl ? 'border-blue-400 bg-blue-50 text-blue-800 font-semibold' : 'border-gray-200 bg-white text-gray-700'}`}>
                            <option value="">All Portfolios</option>
                            {portfolios.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                </div>
                <ColDivider />
                <div className="flex-shrink-0">
                    <SectionHead>Allocation</SectionHead>
                    <RangeRow label="Pfl. %" minVal={f.pflPct_min} maxVal={f.pflPct_max} onMin={v => s({ pflPct_min: v })} onMax={v => s({ pflPct_max: v })} />
                    <RangeRow label="Mgn %" minVal={f.mgnPct_min} maxVal={f.mgnPct_max} onMin={v => s({ mgnPct_min: v })} onMax={v => s({ mgnPct_max: v })} />
                    <RangeRow label="Short %" minVal={f.shortPct_min} maxVal={f.shortPct_max} onMin={v => s({ shortPct_min: v })} onMax={v => s({ shortPct_max: v })} />
                </div>
            </>
        );
    }

    // TAB 2: Price
    function TabPrice() {
        return (
            <div className="flex-shrink-0">
                <SectionHead>Price</SectionHead>
                <RangeRow label="% Change" minVal={f.pctChg_min} maxVal={f.pctChg_max} onMin={v => s({ pctChg_min: v })} onMax={v => s({ pctChg_max: v })} />
                <RangeRow label="Last Price" minVal={f.last_min} maxVal={f.last_max} onMin={v => s({ last_min: v })} onMax={v => s({ last_max: v })} />
                <RangeRow label="Cost (Avg)" minVal={f.cost_min} maxVal={f.cost_max} onMin={v => s({ cost_min: v })} onMax={v => s({ cost_max: v })} />
            </div>
        );
    }

    // TAB 3: RS & Signal
    function TabRsSignal() {
        return (
            <>
                <div className="flex-shrink-0">
                    <SectionHead>Relative Strength</SectionHead>
                    <RangeRow label="RS Rating" minVal={f.rsRating_min} maxVal={f.rsRating_max} onMin={v => s({ rsRating_min: v })} onMax={v => s({ rsRating_max: v })} />
                    <RangeRow label="RS 1M" minVal={f.rank1m_min} maxVal={f.rank1m_max} onMin={v => s({ rank1m_min: v })} onMax={v => s({ rank1m_max: v })} />
                    <RangeRow label="RS 3M" minVal={f.rank3m_min} maxVal={f.rank3m_max} onMin={v => s({ rank3m_min: v })} onMax={v => s({ rank3m_max: v })} />
                    <RangeRow label="RS 6M" minVal={f.rank6m_min} maxVal={f.rank6m_max} onMin={v => s({ rank6m_min: v })} onMax={v => s({ rank6m_max: v })} />
                    <RangeRow label="RS 9M" minVal={f.rank9m_min} maxVal={f.rank9m_max} onMin={v => s({ rank9m_min: v })} onMax={v => s({ rank9m_max: v })} />
                    <RangeRow label="RS 12M" minVal={f.rank12m_min} maxVal={f.rank12m_max} onMin={v => s({ rank12m_min: v })} onMax={v => s({ rank12m_max: v })} />
                </div>
                <ColDivider />
                <div className="flex-shrink-0">
                    <SectionHead>Signal</SectionHead>
                    <BooleanRow label="Trend (UP)" value={f.trend} onChange={v => s({ trend: v as any })} />
                    <RangeRow label="S-RS" minVal={f.sRs_min} maxVal={f.sRs_max} onMin={v => s({ sRs_min: v })} onMax={v => s({ sRs_max: v })} />
                    <RangeRow label="S-RS-3M" minVal={f.sRs3m_min} maxVal={f.sRs3m_max} onMin={v => s({ sRs3m_min: v })} onMax={v => s({ sRs3m_max: v })} />
                    <RangeRow label="S-RS-1M" minVal={f.sRs1m_min} maxVal={f.sRs1m_max} onMin={v => s({ sRs1m_min: v })} onMax={v => s({ sRs1m_max: v })} />
                    <RangeRow label="S-150 MA" minVal={f.s150ma_min} maxVal={f.s150ma_max} onMin={v => s({ s150ma_min: v })} onMax={v => s({ s150ma_max: v })} />
                </div>
            </>
        );
    }

    // TAB 4: Position
    function TabPosition() {
        return (
            <>
                <div className="flex-shrink-0">
                    <SectionHead>Size & Cost</SectionHead>
                    <RangeRow label="Quantity" minVal={f.qty_min} maxVal={f.qty_max} onMin={v => s({ qty_min: v })} onMax={v => s({ qty_max: v })} />
                    <RangeRow label="T.Cost" minVal={f.tCost_min} maxVal={f.tCost_max} onMin={v => s({ tCost_min: v })} onMax={v => s({ tCost_max: v })} />
                </div>
                <ColDivider />
                <div className="flex-shrink-0">
                    <SectionHead>Sell Activity</SectionHead>
                    <RangeRow label="Sell Value" minVal={f.sellValue_min} maxVal={f.sellValue_max} onMin={v => s({ sellValue_min: v })} onMax={v => s({ sellValue_max: v })} />
                    <RangeRow label="Sell (Qty)" minVal={f.sell_min} maxVal={f.sell_max} onMin={v => s({ sell_min: v })} onMax={v => s({ sell_max: v })} />
                    <RangeRow label="T.Sold" minVal={f.tSold_min} maxVal={f.tSold_max} onMin={v => s({ tSold_min: v })} onMax={v => s({ tSold_max: v })} />
                </div>
            </>
        );
    }

    // TAB 5: Performance
    function TabPerformance() {
        return (
            <>
                <div className="flex-shrink-0">
                    <SectionHead>Returns</SectionHead>
                    <RangeRow label="Return" minVal={f.return_min} maxVal={f.return_max} onMin={v => s({ return_min: v })} onMax={v => s({ return_max: v })} />
                    <RangeRow label="Return %" minVal={f.returnPct_min} maxVal={f.returnPct_max} onMin={v => s({ returnPct_min: v })} onMax={v => s({ returnPct_max: v })} />
                    <RangeRow label="Days Held" minVal={f.days_min} maxVal={f.days_max} onMin={v => s({ days_min: v })} onMax={v => s({ days_max: v })} />
                    <RangeRow label="% of Ptf." minVal={f.pctOfPtf_min} maxVal={f.pctOfPtf_max} onMin={v => s({ pctOfPtf_min: v })} onMax={v => s({ pctOfPtf_max: v })} />
                </div>
                <ColDivider />
                <div className="flex-shrink-0">
                    <SectionHead>Risk</SectionHead>
                    <RangeRow label="Stop Price" minVal={f.stopPrice_min} maxVal={f.stopPrice_max} onMin={v => s({ stopPrice_min: v })} onMax={v => s({ stopPrice_max: v })} />
                    <RangeRow label="C.RRR" minVal={f.cRRR_min} maxVal={f.cRRR_max} onMin={v => s({ cRRR_min: v })} onMax={v => s({ cRRR_max: v })} />
                    <RangeRow label="C.Loss %" minVal={f.cLossPct_min} maxVal={f.cLossPct_max} onMin={v => s({ cLossPct_min: v })} onMax={v => s({ cLossPct_max: v })} />
                </div>
            </>
        );
    }

    // TAB 6: Risk Financed & Effective Stop
    function TabRisk() {
        return (
            <>
                <div className="flex-shrink-0">
                    <SectionHead>Risk Financed (shares to sell)</SectionHead>
                    <RangeRow label="RF-100%" minVal={f.rf100_min} maxVal={f.rf100_max} onMin={v => s({ rf100_min: v })} onMax={v => s({ rf100_max: v })} />
                    <RangeRow label="RF-75%" minVal={f.rf75_min} maxVal={f.rf75_max} onMin={v => s({ rf75_min: v })} onMax={v => s({ rf75_max: v })} />
                    <RangeRow label="RF-50%" minVal={f.rf50_min} maxVal={f.rf50_max} onMin={v => s({ rf50_min: v })} onMax={v => s({ rf50_max: v })} />
                    <RangeRow label="RF-25%" minVal={f.rf25_min} maxVal={f.rf25_max} onMin={v => s({ rf25_min: v })} onMax={v => s({ rf25_max: v })} />
                </div>
                <ColDivider />
                <div className="flex-shrink-0">
                    <SectionHead>Effective Stop (% loss after partial sell)</SectionHead>
                    <RangeRow label="ES-100%" minVal={f.es100_min} maxVal={f.es100_max} onMin={v => s({ es100_min: v })} onMax={v => s({ es100_max: v })} />
                    <RangeRow label="ES-75%" minVal={f.es75_min} maxVal={f.es75_max} onMin={v => s({ es75_min: v })} onMax={v => s({ es75_max: v })} />
                    <RangeRow label="ES-50%" minVal={f.es50_min} maxVal={f.es50_max} onMin={v => s({ es50_min: v })} onMax={v => s({ es50_max: v })} />
                    <RangeRow label="ES-25%" minVal={f.es25_min} maxVal={f.es25_max} onMin={v => s({ es25_min: v })} onMax={v => s({ es25_max: v })} />
                </div>
            </>
        );
    }

    // TAB 7: Plan
    function TabPlan() {
        return (
            <>
                <div className="flex-shrink-0">
                    <SectionHead>Signal & Category</SectionHead>
                    <PositionToggle value={f.position} onChange={v => s({ position: v })} />
                    <TextFilterRow label="Category" value={f.category} onChange={v => s({ category: v })} placeholder="e.g. Technology" />
                    <TextFilterRow label="Sector" value={f.sector} onChange={v => s({ sector: v })} placeholder="e.g. Energy" />
                </div>
                <ColDivider />
                <div className="flex-shrink-0">
                    <SectionHead>Plan Targets</SectionHead>
                    <RangeRow label="P.Price" minVal={f.pPrice_min} maxVal={f.pPrice_max} onMin={v => s({ pPrice_min: v })} onMax={v => s({ pPrice_max: v })} />
                    <RangeRow label="Amount" minVal={f.amount_min} maxVal={f.amount_max} onMin={v => s({ amount_min: v })} onMax={v => s({ amount_max: v })} />
                    <RangeRow label="Qty (plan)" minVal={f.qtyPlan_min} maxVal={f.qtyPlan_max} onMin={v => s({ qtyPlan_min: v })} onMax={v => s({ qtyPlan_max: v })} />
                    <RangeRow label="Gain %" minVal={f.gain_min} maxVal={f.gain_max} onMin={v => s({ gain_min: v })} onMax={v => s({ gain_max: v })} />
                    <RangeRow label="Loss %" minVal={f.loss_min} maxVal={f.loss_max} onMin={v => s({ loss_min: v })} onMax={v => s({ loss_max: v })} />
                    <RangeRow label="RRR" minVal={f.rrr_min} maxVal={f.rrr_max} onMin={v => s({ rrr_min: v })} onMax={v => s({ rrr_max: v })} />
                </div>
            </>
        );
    }

    // TAB 8: P&L & Summary
    function TabPnlSummary() {
        return (
            <>
                <div className="flex-shrink-0">
                    <SectionHead>P&L</SectionHead>
                    <RangeRow label="P&L" minVal={f.pandl_min} maxVal={f.pandl_max} onMin={v => s({ pandl_min: v })} onMax={v => s({ pandl_max: v })} />
                    <RangeRow label="P&L %" minVal={f.pandlPct_min} maxVal={f.pandlPct_max} onMin={v => s({ pandlPct_min: v })} onMax={v => s({ pandlPct_max: v })} />
                    <RangeRow label="T.Cost (full)" minVal={f.tCostFull_min} maxVal={f.tCostFull_max} onMin={v => s({ tCostFull_min: v })} onMax={v => s({ tCostFull_max: v })} />
                    <RangeRow label="Sell Mnth #" minVal={f.sellMnthNum_min} maxVal={f.sellMnthNum_max} onMin={v => s({ sellMnthNum_min: v })} onMax={v => s({ sellMnthNum_max: v })} />
                    <RangeRow label="Sell All Mnth" minVal={f.sellAllMnth_min} maxVal={f.sellAllMnth_max} onMin={v => s({ sellAllMnth_min: v })} onMax={v => s({ sellAllMnth_max: v })} />
                </div>
                <ColDivider />
                <div className="flex-shrink-0">
                    <SectionHead>Summary</SectionHead>
                    <RangeRow label="All.P&L" minVal={f.allPandl_min} maxVal={f.allPandl_max} onMin={v => s({ allPandl_min: v })} onMax={v => s({ allPandl_max: v })} />
                    <RangeRow label="%" minVal={f.pct_min} maxVal={f.pct_max} onMin={v => s({ pct_min: v })} onMax={v => s({ pct_max: v })} />
                    <RangeRow label="C.Gain" minVal={f.cGain_min} maxVal={f.cGain_max} onMin={v => s({ cGain_min: v })} onMax={v => s({ cGain_max: v })} />
                    <RangeRow label="PT-T.V" minVal={f.ptTV_min} maxVal={f.ptTV_max} onMin={v => s({ ptTV_min: v })} onMax={v => s({ ptTV_max: v })} />
                    <RangeRow label="PT-V" minVal={f.ptV_min} maxVal={f.ptV_max} onMin={v => s({ ptV_min: v })} onMax={v => s({ ptV_max: v })} />
                    <RangeRow label="PT%" minVal={f.ptPct_min} maxVal={f.ptPct_max} onMin={v => s({ ptPct_min: v })} onMax={v => s({ ptPct_max: v })} />
                    <RangeRow label="Pfl.Cost" minVal={f.pflCost_min} maxVal={f.pflCost_max} onMin={v => s({ pflCost_min: v })} onMax={v => s({ pflCost_max: v })} />
                </div>
            </>
        );
    }

    const tabContent: Record<TabId, React.ReactNode> = {
        identity: <TabIdentity />,
        price: <TabPrice />,
        rs_signal: <TabRsSignal />,
        position: <TabPosition />,
        performance: <TabPerformance />,
        risk: <TabRisk />,
        plan: <TabPlan />,
        pnl_summary: <TabPnlSummary />,
    };

    return (
        <div className="bg-white border-b-2 border-slate-200 flex-shrink-0 select-none shadow-sm">

            {/* ══ HEADER BAR ══════════════════════════════════════════════════════ */}
            <div className="flex items-stretch border-b border-slate-200" style={{ height: 38 }}>

                {/* Brand badge */}
                <div className="flex items-center gap-2 px-4 bg-slate-50 border-r border-slate-200 flex-shrink-0">
                    <SlidersHorizontal size={14} className="text-slate-600" strokeWidth={2.2} />
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-[0.08em]">Filters</span>
                    {activeFiltersCount > 0 && (
                        <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 bg-slate-800 text-white text-[9px] font-bold rounded-full leading-none shadow-sm">
                            {activeFiltersCount}
                        </span>
                    )}
                </div>

                {/* Tab strip */}
                <div className="flex items-stretch flex-1 overflow-x-auto">
                    {TABS.map(tab => {
                        const isActive = activeTab === tab.id && !collapsed;
                        return (
                            <button key={tab.id}
                                onClick={() => { setActiveTab(tab.id); setCollapsed(false); }}
                                className={`relative flex items-center px-4 text-[11px] font-semibold whitespace-nowrap border-r border-slate-200 transition-all outline-none ${isActive ? 'text-slate-900 bg-white' : 'text-slate-500 bg-slate-50 hover:text-slate-800 hover:bg-white'}`}>
                                <span className="relative">
                                    {tab.label}
                                    {isActive && <span className="absolute -bottom-[9px] left-0 right-0 h-[2.5px] bg-slate-800 rounded-t-sm" />}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-2 px-3 border-l border-slate-200 bg-slate-50 flex-shrink-0">
                    <button onClick={clearAllFilters}
                        className={`flex items-center gap-1 px-2.5 h-[24px] text-[10.5px] font-semibold rounded border transition-all shadow-sm ${activeFiltersCount > 0 ? 'text-red-600 bg-white border-red-200 hover:bg-red-50 hover:border-red-300' : 'text-slate-400 bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'}`}>
                        <RotateCcw size={10} strokeWidth={2.5} />
                        <span>Reset</span>
                    </button>
                    <button onClick={() => setCollapsed(v => !v)}
                        title={collapsed ? 'Expand filters' : 'Collapse filters'}
                        className="flex items-center justify-center w-[24px] h-[24px] rounded border border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-800 hover:bg-slate-50 transition-all shadow-sm">
                        {collapsed ? <ChevronDown size={13} strokeWidth={2.2} /> : <ChevronUp size={13} strokeWidth={2.2} />}
                    </button>
                </div>
            </div>

            {/* ══ FILTER BODY ═════════════════════════════════════════════════════ */}
            {!collapsed && (
                <div className="flex" style={{ minHeight: 0 }}>

                    {/* Search panel — always visible on the left */}
                    <div className="flex-shrink-0 border-r border-slate-200 bg-slate-50/70 px-4 py-3" style={{ minWidth: 220 }}>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.12em] mb-2.5">Search</p>
                        <div className="space-y-2">
                            {([
                                { key: 'symbol' as const, label: 'Symbol', placeholder: 'e.g. 2222' },
                                { key: 'name' as const, label: 'Name', placeholder: 'Company name…' },
                            ]).map(({ key, label, placeholder }) => {
                                const val = f[key];
                                return (
                                    <div key={key} className="flex items-center gap-2">
                                        <span className="text-[11px] text-slate-500 w-[44px] flex-shrink-0 font-medium">{label}</span>
                                        <div className={`flex items-center flex-1 gap-1.5 h-[22px] px-2 border rounded-sm transition-all ${val ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-white focus-within:border-blue-400'}`}>
                                            <Search size={10} className="text-slate-400 flex-shrink-0" />
                                            <input type="text" value={val} onChange={e => s({ [key]: e.target.value })} placeholder={placeholder}
                                                className={`flex-1 min-w-0 text-[11px] outline-none bg-transparent ${val ? 'text-blue-800 font-semibold' : 'text-slate-700 placeholder:text-slate-300'}`}
                                            />
                                            {val && <button onClick={() => s({ [key]: '' })}><X size={10} className="text-slate-400 hover:text-slate-700 transition-colors" /></button>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Tab filter columns — horizontally scrollable */}
                    <div className="flex-1 overflow-x-auto bg-white" style={{ scrollbarWidth: 'thin' }}>
                        <div className="flex gap-0 px-4 py-3 min-w-max h-full">
                            {tabContent[activeTab]}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}