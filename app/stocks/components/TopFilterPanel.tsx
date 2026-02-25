'use client';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, RotateCcw, SlidersHorizontal, X, ChevronUp } from 'lucide-react';
import type { FilterState } from '../types';

// Hide number input spin buttons globally for this component
const hideSpinStyle: React.CSSProperties = {
    MozAppearance: 'textfield' as any,
};

interface TopFilterPanelProps {
    filters: FilterState;
    setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
    filterOptions: {
        sectors: string[];
        industryGroups: string[];
        industries: string[];
        subIndustries: string[];
    };
    activeFiltersCount: number;
    clearAllFilters: () => void;
}

type TabId =
    | 'smartselect'
    | 'price_volume'
    | 'moving_averages'
    | 'technical_daily'
    | 'technical_weekly'
    | 'industry';

const TABS: { id: TabId; label: string; shortLabel: string }[] = [
    { id: 'smartselect', label: 'SmartSelect Ratings', shortLabel: 'SmartSelect' },
    { id: 'price_volume', label: 'Price & Volume', shortLabel: 'Price & Vol' },
    { id: 'moving_averages', label: 'Moving Averages', shortLabel: 'MAs' },
    { id: 'technical_daily', label: 'Technical — Daily', shortLabel: 'Tech Daily' },
    { id: 'technical_weekly', label: 'Technical — Weekly', shortLabel: 'Tech Weekly' },
    { id: 'industry', label: 'Industry / Sector', shortLabel: 'Industry' },
];

// ─── Stepper input ────────────────────────────────────────────────────────────
function StepperInput({
    value, onChange, placeholder,
}: {
    value: string; onChange: (v: string) => void; placeholder: string;
}) {
    const active = value !== '';
    const step = (dir: number) => {
        const current = parseFloat(value) || 0;
        const decimals = value.includes('.') ? value.split('.')[1].length : 0;
        const next = current + dir;
        onChange(decimals > 0 ? next.toFixed(decimals) : String(next));
    };
    return (
        <div className={`inline-flex items-center h-[22px] border rounded-sm overflow-hidden transition-all
            ${active ? 'border-blue-400' : 'border-gray-200 hover:border-gray-300'}`}>
            <button
                type="button"
                onClick={() => step(-1)}
                className={`w-[18px] h-full flex items-center justify-center text-[12px] font-bold flex-shrink-0 transition-colors select-none
                    ${active ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
            >−</button>
            <input
                type="number"
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                style={{ MozAppearance: 'textfield' } as any}
                className={`w-[48px] h-full px-1 text-[11px] outline-none text-center tabular-nums border-x
                    [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                    ${active
                        ? 'bg-blue-50 text-blue-800 font-semibold border-blue-300'
                        : 'bg-white text-gray-700 placeholder:text-gray-300 border-gray-200 focus:bg-blue-50/30 focus:border-blue-300'
                    }`}
            />
            <button
                type="button"
                onClick={() => step(1)}
                className={`w-[18px] h-full flex items-center justify-center text-[12px] font-bold flex-shrink-0 transition-colors select-none
                    ${active ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
            >+</button>
        </div>
    );
}

// ─── Minimal range input row ──────────────────────────────────────────────────
function RangeRow({
    label, minVal, maxVal, onMin, onMax,
}: {
    label: string; minVal: string; maxVal: string;
    onMin: (v: string) => void; onMax: (v: string) => void;
}) {
    const active = minVal !== '' || maxVal !== '';
    return (
        <div className="flex items-center gap-2 py-[3px] group">
            <span
                title={label}
                className={`text-[11px] w-[120px] flex-shrink-0 truncate leading-tight transition-colors
                    ${active ? 'text-blue-700 font-semibold' : 'text-gray-500 group-hover:text-gray-700'}`}
            >
                {label}
            </span>
            <StepperInput value={minVal} onChange={onMin} placeholder="Min" />
            <span className="text-[10px] text-gray-400 select-none font-medium leading-none">to</span>
            <StepperInput value={maxVal} onChange={onMax} placeholder="Max" />
        </div>
    );
}

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHead({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-2 mt-[14px] mb-[5px] first:mt-0">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.1em] whitespace-nowrap leading-none">
                {children}
            </span>
            <div className="flex-1 h-px bg-gray-100" />
        </div>
    );
}

// ─── Vertical column separator ────────────────────────────────────────────────
function ColDivider() {
    return <div className="self-stretch w-px bg-gray-100 flex-shrink-0 mx-3" />;
}

// ─── A / B / C / D / E rating toggle row ─────────────────────────────────────
function RatingRow({
    label, selected, onChange,
}: {
    label: string; selected: string[]; onChange: (v: string[]) => void;
}) {
    const opts = ['A', 'B', 'C', 'D', 'E'];
    const palette: Record<string, string> = {
        A: '#15803d', B: '#1d4ed8', C: '#b45309', D: '#b91c1c', E: '#7c3aed',
    };
    const toggle = (v: string) =>
        onChange(selected.includes(v) ? selected.filter(s => s !== v) : [...selected, v]);
    const active = selected.length > 0;

    return (
        <div className="flex items-center gap-2 py-[3px] group">
            <span className={`text-[11px] w-[120px] flex-shrink-0 truncate leading-tight transition-colors
        ${active ? 'text-blue-700 font-semibold' : 'text-gray-500 group-hover:text-gray-700'}`}>
                {label}
            </span>
            <div className="flex gap-[3px]">
                {opts.map(o => (
                    <button
                        key={o}
                        onClick={() => toggle(o)}
                        className="w-[20px] h-[20px] text-[9.5px] font-bold rounded-sm border transition-all leading-none"
                        style={
                            selected.includes(o)
                                ? { background: palette[o], borderColor: palette[o], color: '#fff' }
                                : { background: '#fff', borderColor: '#e5e7eb', color: '#9ca3af' }
                        }
                    >
                        {o}
                    </button>
                ))}
            </div>
        </div>
    );
}

// ─── Multi-select dropdown ────────────────────────────────────────────────────
function MultiSelect({
    label, options, selected, onChange,
}: {
    label: string; options: string[]; selected: string[]; onChange: (v: string[]) => void;
}) {
    const [open, setOpen] = useState(false);
    const [q, setQ] = useState('');
    const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 });
    const ref = useRef<HTMLDivElement>(null);
    const btnRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        if (open) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const handleOpen = () => {
        if (!open && btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect();
            setDropPos({ top: rect.bottom + window.scrollY + 4, left: rect.left + window.scrollX, width: Math.max(rect.width, 240) });
        }
        setOpen(v => !v);
    };

    const visible = options.filter(o => o.toLowerCase().includes(q.toLowerCase()));
    const toggle = (v: string) =>
        onChange(selected.includes(v) ? selected.filter(s => s !== v) : [...selected, v]);
    const active = selected.length > 0;

    return (
        <div ref={ref} className="relative">
            <button
                ref={btnRef}
                onClick={handleOpen}
                className={`inline-flex items-center gap-1.5 h-[26px] px-2.5 text-[11px] rounded-sm border transition-all whitespace-nowrap font-medium
          ${active
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    }`}
            >
                {active ? (
                    <span className="inline-flex items-center justify-center w-[15px] h-[15px] bg-white/20 text-white text-[8px] font-bold rounded-full">
                        {selected.length}
                    </span>
                ) : null}
                <span>{label}</span>
                <ChevronDown size={10} className={`transition-transform duration-150 ${open ? 'rotate-180' : ''} ${active ? 'text-white/70' : 'text-gray-400'}`} />
            </button>

            {open ? (
                <div style={{ position: 'fixed', top: dropPos.top, left: dropPos.left, width: dropPos.width, zIndex: 99999 }} className="bg-white border border-gray-200 rounded-md shadow-2xl overflow-hidden">
                    {/* Search */}
                    <div className="p-2 border-b border-gray-100 bg-gray-50">
                        <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded px-2 h-[26px] focus-within:border-blue-400 transition-colors">
                            <Search size={10} className="text-gray-400 flex-shrink-0" />
                            <input
                                autoFocus value={q} onChange={e => setQ(e.target.value)}
                                placeholder={`Search ${label.toLowerCase()}...`}
                                className="flex-1 text-[11px] outline-none bg-transparent text-gray-700 placeholder:text-gray-400"
                            />
                        </div>
                    </div>
                    {/* List */}
                    <div className="max-h-[200px] overflow-y-auto">
                        {visible.length === 0 ? (
                            <div className="px-3 py-5 text-center text-[11px] text-gray-400">No results found</div>
                        ) : null}
                        {visible.map(opt => (
                            <label key={opt} onClick={() => toggle(opt)} className="flex items-center gap-2.5 px-3 py-[7px] hover:bg-blue-50 cursor-pointer group">
                                <div className={`w-[13px] h-[13px] rounded-[2px] border flex items-center justify-center flex-shrink-0 transition-all
                  ${selected.includes(opt)
                                        ? 'bg-blue-600 border-blue-600'
                                        : 'border-gray-300 group-hover:border-blue-400'
                                    }`}>
                                    {selected.includes(opt) ? (
                                        <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                                            <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    ) : null}
                                </div>
                                <span className="text-[11px] text-gray-700 truncate group-hover:text-gray-900">{opt}</span>
                            </label>
                        ))}
                    </div>
                    {/* Footer */}
                    {selected.length > 0 ? (
                        <div className="px-3 py-2 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                            <span className="text-[10px] text-gray-400">{selected.length} selected</span>
                            <button
                                onClick={() => onChange([])}
                                className="text-[10px] font-semibold text-red-500 hover:text-red-700 transition-colors"
                            >
                                Clear all
                            </button>
                        </div>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
export default function TopFilterPanel({
    filters, setFilters, filterOptions, activeFiltersCount, clearAllFilters,
}: TopFilterPanelProps) {
    const [activeTab, setActiveTab] = useState<TabId>('smartselect');
    const [collapsed, setCollapsed] = useState(false);

    const f = filters;
    const s = (patch: Partial<FilterState>) => setFilters(prev => ({ ...prev, ...patch }));

    // ── Column blocks ──────────────────────────────────────────────────────────

    function ColSmartSelect() {
        return (
            <div className="flex-shrink-0">
                <SectionHead>Relative Strength</SectionHead>
                <RangeRow label="RS Rating (0–99)"
                    minVal={f.rs_rating_min} maxVal={f.rs_rating_max}
                    onMin={v => s({ rs_rating_min: v })} onMax={v => s({ rs_rating_max: v })} />
                <SectionHead>Accumulation / Distribution</SectionHead>
                <RatingRow label="Acc/Dis Rating" selected={f.acc_dis_rating} onChange={v => s({ acc_dis_rating: v })} />
                <RatingRow label="Industry Group RS" selected={f.industry_group_rs} onChange={v => s({ industry_group_rs: v })} />
                <RatingRow label="Sector RS" selected={f.sector_rs} onChange={v => s({ sector_rs: v })} />
                <RatingRow label="Industry RS" selected={f.industry_rs} onChange={v => s({ industry_rs: v })} />
                <RatingRow label="Sub Industry RS" selected={f.sub_industry_rs} onChange={v => s({ sub_industry_rs: v })} />
            </div>
        );
    }

    function ColPriceLeft() {
        return (
            <div className="flex-shrink-0">
                <SectionHead>Price</SectionHead>
                <RangeRow label="Close" minVal={f.price_min} maxVal={f.price_max} onMin={v => s({ price_min: v })} onMax={v => s({ price_max: v })} />
                <RangeRow label="Change" minVal={f.change_min} maxVal={f.change_max} onMin={v => s({ change_min: v })} onMax={v => s({ change_max: v })} />
                <RangeRow label="% Change" minVal={f.percent_change_min} maxVal={f.percent_change_max} onMin={v => s({ percent_change_min: v })} onMax={v => s({ percent_change_max: v })} />
                <RangeRow label="Open" minVal={f.open_min} maxVal={f.open_max} onMin={v => s({ open_min: v })} onMax={v => s({ open_max: v })} />
                <RangeRow label="High" minVal={f.high_min} maxVal={f.high_max} onMin={v => s({ high_min: v })} onMax={v => s({ high_max: v })} />
                <RangeRow label="Low" minVal={f.low_min} maxVal={f.low_max} onMin={v => s({ low_min: v })} onMax={v => s({ low_max: v })} />
            </div>
        );
    }

    function ColPriceRight() {
        return (
            <div className="flex-shrink-0">
                <SectionHead>Volume & Liquidity</SectionHead>
                <RangeRow label="Volume" minVal={f.volume_min} maxVal={f.volume_max} onMin={v => s({ volume_min: v })} onMax={v => s({ volume_max: v })} />
                <RangeRow label="Turnover" minVal={f.turnover_min} maxVal={f.turnover_max} onMin={v => s({ turnover_min: v })} onMax={v => s({ turnover_max: v })} />
                <RangeRow label="No. of Trades" minVal={f.no_of_trades_min} maxVal={f.no_of_trades_max} onMin={v => s({ no_of_trades_min: v })} onMax={v => s({ no_of_trades_max: v })} />
                <RangeRow label="Market Cap" minVal={f.market_cap_min} maxVal={f.market_cap_max} onMin={v => s({ market_cap_min: v })} onMax={v => s({ market_cap_max: v })} />
                <RangeRow label="Avg Volume 50" minVal={f.average_volume_50_min} maxVal={f.average_volume_50_max} onMin={v => s({ average_volume_50_min: v })} onMax={v => s({ average_volume_50_max: v })} />
                <RangeRow label="Vol Diff 50%" minVal={f.vol_diff_50_percent_min} maxVal={f.vol_diff_50_percent_max} onMin={v => s({ vol_diff_50_percent_min: v })} onMax={v => s({ vol_diff_50_percent_max: v })} />
            </div>
        );
    }

    function ColMAsVsSma() {
        return (
            <div className="flex-shrink-0">
                <SectionHead>Price vs SMA %</SectionHead>
                <RangeRow label="vs SMA 10%" minVal={f.price_vs_sma_10_min} maxVal={f.price_vs_sma_10_max} onMin={v => s({ price_vs_sma_10_min: v })} onMax={v => s({ price_vs_sma_10_max: v })} />
                <RangeRow label="vs SMA 21%" minVal={f.price_vs_sma_21_min} maxVal={f.price_vs_sma_21_max} onMin={v => s({ price_vs_sma_21_min: v })} onMax={v => s({ price_vs_sma_21_max: v })} />
                <RangeRow label="vs SMA 50%" minVal={f.price_vs_sma_50_min} maxVal={f.price_vs_sma_50_max} onMin={v => s({ price_vs_sma_50_min: v })} onMax={v => s({ price_vs_sma_50_max: v })} />
                <RangeRow label="vs SMA 150%" minVal={f.price_vs_sma_150_min} maxVal={f.price_vs_sma_150_max} onMin={v => s({ price_vs_sma_150_min: v })} onMax={v => s({ price_vs_sma_150_max: v })} />
                <RangeRow label="vs SMA 200%" minVal={f.price_vs_sma_200_min} maxVal={f.price_vs_sma_200_max} onMin={v => s({ price_vs_sma_200_min: v })} onMax={v => s({ price_vs_sma_200_max: v })} />
            </div>
        );
    }

    function ColMAsMinusSma() {
        return (
            <div className="flex-shrink-0">
                <SectionHead>Price − SMA (Distance)</SectionHead>
                <RangeRow label="Price − SMA10" minVal={f.price_minus_sma_10_min} maxVal={f.price_minus_sma_10_max} onMin={v => s({ price_minus_sma_10_min: v })} onMax={v => s({ price_minus_sma_10_max: v })} />
                <RangeRow label="Price − SMA21" minVal={f.price_minus_sma_21_min} maxVal={f.price_minus_sma_21_max} onMin={v => s({ price_minus_sma_21_min: v })} onMax={v => s({ price_minus_sma_21_max: v })} />
                <RangeRow label="Price − SMA50" minVal={f.price_minus_sma_50_min} maxVal={f.price_minus_sma_50_max} onMin={v => s({ price_minus_sma_50_min: v })} onMax={v => s({ price_minus_sma_50_max: v })} />
                <RangeRow label="Price − SMA150" minVal={f.price_minus_sma_150_min} maxVal={f.price_minus_sma_150_max} onMin={v => s({ price_minus_sma_150_min: v })} onMax={v => s({ price_minus_sma_150_max: v })} />
                <RangeRow label="Price − SMA200" minVal={f.price_minus_sma_200_min} maxVal={f.price_minus_sma_200_max} onMin={v => s({ price_minus_sma_200_min: v })} onMax={v => s({ price_minus_sma_200_max: v })} />
                <SectionHead>52-Week Range</SectionHead>
                <RangeRow label="52W High" minVal={f.fifty_two_week_high_min} maxVal={f.fifty_two_week_high_max} onMin={v => s({ fifty_two_week_high_min: v })} onMax={v => s({ fifty_two_week_high_max: v })} />
                <RangeRow label="52W Low" minVal={f.fifty_two_week_low_min} maxVal={f.fifty_two_week_low_max} onMin={v => s({ fifty_two_week_low_min: v })} onMax={v => s({ fifty_two_week_low_max: v })} />
                <RangeRow label="% Off 52W High" minVal={f.percent_off_52w_high_min} maxVal={f.percent_off_52w_high_max} onMin={v => s({ percent_off_52w_high_min: v })} onMax={v => s({ percent_off_52w_high_max: v })} />
                <RangeRow label="% Off 52W Low" minVal={f.percent_off_52w_low_min} maxVal={f.percent_off_52w_low_max} onMin={v => s({ percent_off_52w_low_min: v })} onMax={v => s({ percent_off_52w_low_max: v })} />
            </div>
        );
    }

    function ColTechD_RSI() {
        return (
            <div className="flex-shrink-0">
                <SectionHead>RSI</SectionHead>
                <RangeRow label="RSI(14)" minVal={f.rsi_14_min} maxVal={f.rsi_14_max} onMin={v => s({ rsi_14_min: v })} onMax={v => s({ rsi_14_max: v })} />
                <RangeRow label="SMA9(RSI)" minVal={f.sma9_rsi_min} maxVal={f.sma9_rsi_max} onMin={v => s({ sma9_rsi_min: v })} onMax={v => s({ sma9_rsi_max: v })} />
                <RangeRow label="WMA45(RSI)" minVal={f.wma45_rsi_min} maxVal={f.wma45_rsi_max} onMin={v => s({ wma45_rsi_min: v })} onMax={v => s({ wma45_rsi_max: v })} />
                <SectionHead>Price MAs</SectionHead>
                <RangeRow label="SMA4" minVal={f.sma4_min} maxVal={f.sma4_max} onMin={v => s({ sma4_min: v })} onMax={v => s({ sma4_max: v })} />
                <RangeRow label="SMA9" minVal={f.sma9_price_min} maxVal={f.sma9_price_max} onMin={v => s({ sma9_price_min: v })} onMax={v => s({ sma9_price_max: v })} />
                <RangeRow label="SMA18" minVal={f.sma18_min} maxVal={f.sma18_max} onMin={v => s({ sma18_min: v })} onMax={v => s({ sma18_max: v })} />
                <RangeRow label="WMA45(Price)" minVal={f.wma45_close_min} maxVal={f.wma45_close_max} onMin={v => s({ wma45_close_min: v })} onMax={v => s({ wma45_close_max: v })} />
                <RangeRow label="SMA9(Close)" minVal={f.sma9_close_min} maxVal={f.sma9_close_max} onMin={v => s({ sma9_close_min: v })} onMax={v => s({ sma9_close_max: v })} />
            </div>
        );
    }

    function ColTechD_CFG() {
        return (
            <div className="flex-shrink-0">
                <SectionHead>CFG</SectionHead>
                <RangeRow label="CFG" minVal={f.cfg_daily_min} maxVal={f.cfg_daily_max} onMin={v => s({ cfg_daily_min: v })} onMax={v => s({ cfg_daily_max: v })} />
                <RangeRow label="CFG.SMA4" minVal={f.cfg_sma4_min} maxVal={f.cfg_sma4_max} onMin={v => s({ cfg_sma4_min: v })} onMax={v => s({ cfg_sma4_max: v })} />
                <RangeRow label="CFG.EMA45" minVal={f.cfg_ema45_min} maxVal={f.cfg_ema45_max} onMin={v => s({ cfg_ema45_min: v })} onMax={v => s({ cfg_ema45_max: v })} />
                <SectionHead>The Number</SectionHead>
                <RangeRow label="THE.NUMBER" minVal={f.the_number_min} maxVal={f.the_number_max} onMin={v => s({ the_number_min: v })} onMax={v => s({ the_number_max: v })} />
                <RangeRow label="THE.NUMBER.HIGH" minVal={f.the_number_hl_min} maxVal={f.the_number_hl_max} onMin={v => s({ the_number_hl_min: v })} onMax={v => s({ the_number_hl_max: v })} />
                <RangeRow label="THE.NUMBER.LOW" minVal={f.the_number_ll_min} maxVal={f.the_number_ll_max} onMin={v => s({ the_number_ll_min: v })} onMax={v => s({ the_number_ll_max: v })} />
                <SectionHead>CCI & Aroon</SectionHead>
                <RangeRow label="CCI(14)" minVal={f.cci_min} maxVal={f.cci_max} onMin={v => s({ cci_min: v })} onMax={v => s({ cci_max: v })} />
                <RangeRow label="CCI.EMA20" minVal={f.cci_ema20_min} maxVal={f.cci_ema20_max} onMin={v => s({ cci_ema20_min: v })} onMax={v => s({ cci_ema20_max: v })} />
                <RangeRow label="AROON.UP" minVal={f.aroon_up_min} maxVal={f.aroon_up_max} onMin={v => s({ aroon_up_min: v })} onMax={v => s({ aroon_up_max: v })} />
                <RangeRow label="AROON.DOWN" minVal={f.aroon_down_min} maxVal={f.aroon_down_max} onMin={v => s({ aroon_down_min: v })} onMax={v => s({ aroon_down_max: v })} />
            </div>
        );
    }

    function ColTechD_Stamp() {
        return (
            <div className="flex-shrink-0">
                <SectionHead>Stamp</SectionHead>
                <RangeRow label="STAMP.SMA9(RSI)" minVal={f.stamp_s9rsi_min} maxVal={f.stamp_s9rsi_max} onMin={v => s({ stamp_s9rsi_min: v })} onMax={v => s({ stamp_s9rsi_max: v })} />
                <RangeRow label="STAMP.EMA45(CFG)" minVal={f.stamp_e45cfg_min} maxVal={f.stamp_e45cfg_max} onMin={v => s({ stamp_e45cfg_min: v })} onMax={v => s({ stamp_e45cfg_max: v })} />
            </div>
        );
    }

    function ColTechW_RSI() {
        return (
            <div className="flex-shrink-0">
                <SectionHead>RSI (Weekly)</SectionHead>
                <RangeRow label="RSI(14)(W)" minVal={f.rsi_w_min} maxVal={f.rsi_w_max} onMin={v => s({ rsi_w_min: v })} onMax={v => s({ rsi_w_max: v })} />
                <RangeRow label="SMA9(RSI)(W)" minVal={f.sma9_rsi_w_min} maxVal={f.sma9_rsi_w_max} onMin={v => s({ sma9_rsi_w_min: v })} onMax={v => s({ sma9_rsi_w_max: v })} />
                <RangeRow label="WMA45(RSI)(W)" minVal={f.wma45_rsi_w_min} maxVal={f.wma45_rsi_w_max} onMin={v => s({ wma45_rsi_w_min: v })} onMax={v => s({ wma45_rsi_w_max: v })} />
                <SectionHead>Price MAs (Weekly)</SectionHead>
                <RangeRow label="Close(W)" minVal={f.close_w_min} maxVal={f.close_w_max} onMin={v => s({ close_w_min: v })} onMax={v => s({ close_w_max: v })} />
                <RangeRow label="SMA4(W)" minVal={f.sma4_w_min} maxVal={f.sma4_w_max} onMin={v => s({ sma4_w_min: v })} onMax={v => s({ sma4_w_max: v })} />
                <RangeRow label="SMA9(W)" minVal={f.sma9_w_min} maxVal={f.sma9_w_max} onMin={v => s({ sma9_w_min: v })} onMax={v => s({ sma9_w_max: v })} />
                <RangeRow label="SMA18(W)" minVal={f.sma18_w_min} maxVal={f.sma18_w_max} onMin={v => s({ sma18_w_min: v })} onMax={v => s({ sma18_w_max: v })} />
                <RangeRow label="WMA45(Price)(W)" minVal={f.wma45_close_w_min} maxVal={f.wma45_close_w_max} onMin={v => s({ wma45_close_w_min: v })} onMax={v => s({ wma45_close_w_max: v })} />
                <RangeRow label="SMA9(Close)(W)" minVal={f.sma9_close_w_min} maxVal={f.sma9_close_w_max} onMin={v => s({ sma9_close_w_min: v })} onMax={v => s({ sma9_close_w_max: v })} />
            </div>
        );
    }

    function ColTechW_NUM() {
        return (
            <div className="flex-shrink-0">
                <SectionHead>The Number (Weekly)</SectionHead>
                <RangeRow label="THE.NUMBER(W)" minVal={f.the_number_w_min} maxVal={f.the_number_w_max} onMin={v => s({ the_number_w_min: v })} onMax={v => s({ the_number_w_max: v })} />
                <RangeRow label="THE.NUMBER.HIGH(W)" minVal={f.the_number_hl_w_min} maxVal={f.the_number_hl_w_max} onMin={v => s({ the_number_hl_w_min: v })} onMax={v => s({ the_number_hl_w_max: v })} />
                <RangeRow label="THE.NUMBER.LOW(W)" minVal={f.the_number_ll_w_min} maxVal={f.the_number_ll_w_max} onMin={v => s({ the_number_ll_w_min: v })} onMax={v => s({ the_number_ll_w_max: v })} />
                <SectionHead>CFG (Weekly)</SectionHead>
                <RangeRow label="CFG(W)" minVal={f.cfg_w_min} maxVal={f.cfg_w_max} onMin={v => s({ cfg_w_min: v })} onMax={v => s({ cfg_w_max: v })} />
                <RangeRow label="CFG.SMA4(W)" minVal={f.cfg_sma4_w_min} maxVal={f.cfg_sma4_w_max} onMin={v => s({ cfg_sma4_w_min: v })} onMax={v => s({ cfg_sma4_w_max: v })} />
                <RangeRow label="CFG.EMA45(W)" minVal={f.cfg_ema45_w_min} maxVal={f.cfg_ema45_w_max} onMin={v => s({ cfg_ema45_w_min: v })} onMax={v => s({ cfg_ema45_w_max: v })} />
                <SectionHead>CCI & Aroon (Weekly)</SectionHead>
                <RangeRow label="CCI(14)(W)" minVal={f.cci_w_min} maxVal={f.cci_w_max} onMin={v => s({ cci_w_min: v })} onMax={v => s({ cci_w_max: v })} />
                <RangeRow label="CCI.EMA20(W)" minVal={f.cci_ema20_w_min} maxVal={f.cci_ema20_w_max} onMin={v => s({ cci_ema20_w_min: v })} onMax={v => s({ cci_ema20_w_max: v })} />
                <RangeRow label="AROON.UP(W)" minVal={f.aroon_up_w_min} maxVal={f.aroon_up_w_max} onMin={v => s({ aroon_up_w_min: v })} onMax={v => s({ aroon_up_w_max: v })} />
                <RangeRow label="AROON.DOWN(W)" minVal={f.aroon_down_w_min} maxVal={f.aroon_down_w_max} onMin={v => s({ aroon_down_w_min: v })} onMax={v => s({ aroon_down_w_max: v })} />
            </div>
        );
    }

    function ColTechW_Stamp() {
        return (
            <div className="flex-shrink-0">
                <SectionHead>Stamp (Weekly)</SectionHead>
                <RangeRow label="STAMP.SMA9(RSI)(W)" minVal={f.stamp_s9rsi_w_min} maxVal={f.stamp_s9rsi_w_max} onMin={v => s({ stamp_s9rsi_w_min: v })} onMax={v => s({ stamp_s9rsi_w_max: v })} />
                <RangeRow label="STAMP.EMA45(CFG)(W)" minVal={f.stamp_e45cfg_w_min} maxVal={f.stamp_e45cfg_w_max} onMin={v => s({ stamp_e45cfg_w_min: v })} onMax={v => s({ stamp_e45cfg_w_max: v })} />
            </div>
        );
    }

    const tabContent: Record<TabId, React.ReactNode> = {
        smartselect: <><ColSmartSelect /></>,
        price_volume: <><ColPriceLeft /><ColDivider /><ColPriceRight /></>,
        moving_averages: <><ColMAsVsSma /><ColDivider /><ColMAsMinusSma /></>,
        technical_daily: <><ColTechD_RSI /><ColDivider /><ColTechD_CFG /><ColDivider /><ColTechD_Stamp /></>,
        technical_weekly: <><ColTechW_RSI /><ColDivider /><ColTechW_NUM /><ColDivider /><ColTechW_Stamp /></>,
        industry: (
            <div className="flex flex-wrap gap-2 items-start">
                <MultiSelect label="Sectors" options={filterOptions.sectors} selected={f.sector} onChange={v => s({ sector: v })} />
                <MultiSelect label="Industry Groups" options={filterOptions.industryGroups} selected={f.industry_group} onChange={v => s({ industry_group: v })} />
                <MultiSelect label="Industries" options={filterOptions.industries} selected={f.industry} onChange={v => s({ industry: v })} />
                <MultiSelect label="Sub Industries" options={filterOptions.subIndustries} selected={f.sub_industry} onChange={v => s({ sub_industry: v })} />
            </div>
        ),
    };

    return (
        <div className="bg-white border-b-2 border-gray-200 flex-shrink-0 select-none shadow-sm">

            {/* ══════════════════════════════════════════════════
          HEADER BAR  —  icon · tabs · controls
      ══════════════════════════════════════════════════ */}
            <div className="flex items-stretch border-b border-gray-200" style={{ height: 38 }}>

                {/* Brand badge */}
                <div className="flex items-center gap-2 px-4 bg-gray-50 border-r border-gray-200 flex-shrink-0">
                    <SlidersHorizontal size={14} className="text-blue-600" strokeWidth={2.2} />
                    <span className="text-[11px] font-bold text-gray-700 uppercase tracking-[0.08em]">Screener</span>
                    {activeFiltersCount > 0 ? (
                        <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 bg-blue-600 text-white text-[9px] font-bold rounded-full leading-none shadow-sm">
                            {activeFiltersCount}
                        </span>
                    ) : null}
                </div>

                {/* Tab strip */}
                <div className="flex items-stretch flex-1 overflow-x-auto">
                    {TABS.map(tab => {
                        const isActive = activeTab === tab.id && !collapsed;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => { setActiveTab(tab.id); setCollapsed(false); }}
                                className={`
                                    relative flex items-center px-4 text-[11px] font-semibold whitespace-nowrap
                                    border-r border-gray-200 transition-all outline-none
                                    ${isActive
                                        ? 'text-blue-700 bg-white'
                                        : 'text-gray-500 bg-gray-50 hover:text-gray-800 hover:bg-white'
                                    }
                                `}
                            >
                                <span className="relative">
                                    {tab.label}
                                    {isActive ? (
                                        <span className="absolute -bottom-[9px] left-0 right-0 h-[2.5px] bg-blue-600 rounded-t-sm" />
                                    ) : null}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-2 px-3 border-l border-gray-200 bg-gray-50 flex-shrink-0">
                    <button
                        onClick={clearAllFilters}
                        className={`flex items-center gap-1 px-2.5 h-[24px] text-[10.5px] font-semibold rounded border transition-all shadow-sm
                            ${activeFiltersCount > 0
                                ? 'text-red-600 bg-white border-red-200 hover:bg-red-50 hover:border-red-300'
                                : 'text-gray-400 bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                            }`}
                    >
                        <RotateCcw size={10} strokeWidth={2.5} />
                        <span>Reset All</span>
                    </button>
                    <button
                        onClick={() => setCollapsed(v => !v)}
                        title={collapsed ? 'Expand filters' : 'Collapse filters'}
                        className="flex items-center justify-center w-[24px] h-[24px] rounded border border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-800 hover:bg-gray-50 transition-all shadow-sm"
                    >
                        {collapsed
                            ? <ChevronDown size={13} strokeWidth={2.2} />
                            : <ChevronUp size={13} strokeWidth={2.2} />
                        }
                    </button>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════
          FILTER BODY
      ══════════════════════════════════════════════════ */}
            {!collapsed && (
                <div className="flex" style={{ minHeight: 0 }}>

                    {/* ── Search panel — always visible ─────────────────────────── */}
                    <div
                        className="flex-shrink-0 border-r border-gray-200 bg-gray-50/70 px-4 py-3"
                        style={{ minWidth: 230 }}
                    >
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.12em] mb-2.5">
                            Search
                        </p>
                        <div className="space-y-2">
                            {([
                                { key: 'symbol', label: 'Symbol', placeholder: 'e.g. 2222' },
                                { key: 'name', label: 'Company', placeholder: 'Company name...' },
                            ] as const).map(({ key, label, placeholder }) => {
                                const val = f[key];
                                return (
                                    <div key={key} className="flex items-center gap-2">
                                        <span className="text-[11px] text-gray-500 w-[54px] flex-shrink-0 font-medium">{label}</span>
                                        <div className={`
                      flex items-center flex-1 gap-1.5 h-[22px] px-2 border rounded-sm transition-all
                      ${val
                                                ? 'border-blue-400 bg-blue-50'
                                                : 'border-gray-200 bg-white focus-within:border-blue-400 focus-within:bg-blue-50/30'
                                            }
                    `}>
                                            <Search size={10} className="text-gray-400 flex-shrink-0" />
                                            <input
                                                type="text"
                                                value={val}
                                                onChange={e => s({ [key]: e.target.value } as any)}
                                                placeholder={placeholder}
                                                className={`flex-1 min-w-0 text-[11px] outline-none bg-transparent
                          ${val ? 'text-blue-800 font-semibold' : 'text-gray-700 placeholder:text-gray-300'}`}
                                            />
                                            {val ? (
                                                <button onClick={() => s({ [key]: '' } as any)} className="flex-shrink-0">
                                                    <X size={10} className="text-gray-400 hover:text-gray-700 transition-colors" />
                                                </button>
                                            ) : null}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── Tab filter columns — horizontally scrollable ────────── */}
                    <div className="flex-1 overflow-x-auto custom-scrollbar bg-white">
                        <div className="flex gap-0 px-4 py-3 min-w-max h-full">
                            {tabContent[activeTab]}
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
}