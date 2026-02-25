'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import type { FilterState } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────
type Operator = 'gt' | 'lt' | 'gte' | 'lte' | '';

interface ColFilterConfig {
    colKey: string;
    minKey: keyof FilterState;
    maxKey: keyof FilterState;
    type: 'numeric' | 'text' | 'none';
}

interface ColumnFilterRowProps {
    columnDefinitions: Array<{ key: string; label: string; visibleKey: string }>;
    visibleColumns: Record<string, boolean>;
    filters: FilterState;
    setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

// ─── Column → FilterState key mapping ────────────────────────────────────────
const COLUMN_FILTER_MAP: Record<string, { minKey: keyof FilterState; maxKey: keyof FilterState }> = {
    rs_rating: { minKey: 'rs_rating_min', maxKey: 'rs_rating_max' },
    price: { minKey: 'price_min', maxKey: 'price_max' },
    change: { minKey: 'change_min', maxKey: 'change_max' },
    percent_change: { minKey: 'percent_change_min', maxKey: 'percent_change_max' },
    volume: { minKey: 'volume_min', maxKey: 'volume_max' },
    turnover: { minKey: 'turnover_min', maxKey: 'turnover_max' },
    no_of_trades: { minKey: 'no_of_trades_min', maxKey: 'no_of_trades_max' },
    market_cap: { minKey: 'market_cap_min', maxKey: 'market_cap_max' },
    open: { minKey: 'open_min', maxKey: 'open_max' },
    high: { minKey: 'high_min', maxKey: 'high_max' },
    low: { minKey: 'low_min', maxKey: 'low_max' },
    price_minus_sma_10: { minKey: 'price_minus_sma_10_min', maxKey: 'price_minus_sma_10_max' },
    price_minus_sma_21: { minKey: 'price_minus_sma_21_min', maxKey: 'price_minus_sma_21_max' },
    price_minus_sma_50: { minKey: 'price_minus_sma_50_min', maxKey: 'price_minus_sma_50_max' },
    price_minus_sma_150: { minKey: 'price_minus_sma_150_min', maxKey: 'price_minus_sma_150_max' },
    price_minus_sma_200: { minKey: 'price_minus_sma_200_min', maxKey: 'price_minus_sma_200_max' },
    fifty_two_week_high_price: { minKey: 'fifty_two_week_high_min', maxKey: 'fifty_two_week_high_max' },
    fifty_two_week_low_price: { minKey: 'fifty_two_week_low_min', maxKey: 'fifty_two_week_low_max' },
    average_volume_50: { minKey: 'average_volume_50_min', maxKey: 'average_volume_50_max' },
    price_vs_sma_10_percent: { minKey: 'price_vs_sma_10_min', maxKey: 'price_vs_sma_10_max' },
    price_vs_sma_21_percent: { minKey: 'price_vs_sma_21_min', maxKey: 'price_vs_sma_21_max' },
    price_vs_sma_50_percent: { minKey: 'price_vs_sma_50_min', maxKey: 'price_vs_sma_50_max' },
    price_vs_sma_150_percent: { minKey: 'price_vs_sma_150_min', maxKey: 'price_vs_sma_150_max' },
    price_vs_sma_200_percent: { minKey: 'price_vs_sma_200_min', maxKey: 'price_vs_sma_200_max' },
    percent_off_52w_high: { minKey: 'percent_off_52w_high_min', maxKey: 'percent_off_52w_high_max' },
    percent_off_52w_low: { minKey: 'percent_off_52w_low_min', maxKey: 'percent_off_52w_low_max' },
    vol_diff_50_percent: { minKey: 'vol_diff_50_percent_min', maxKey: 'vol_diff_50_percent_max' },
    rsi_14: { minKey: 'rsi_14_min', maxKey: 'rsi_14_max' },
    sma9_rsi: { minKey: 'sma9_rsi_min', maxKey: 'sma9_rsi_max' },
    wma45_rsi: { minKey: 'wma45_rsi_min', maxKey: 'wma45_rsi_max' },
    sma9_close: { minKey: 'sma9_close_min', maxKey: 'sma9_close_max' },
    the_number: { minKey: 'the_number_min', maxKey: 'the_number_max' },
    the_number_hl: { minKey: 'the_number_hl_min', maxKey: 'the_number_hl_max' },
    the_number_ll: { minKey: 'the_number_ll_min', maxKey: 'the_number_ll_max' },
    stamp_s9rsi: { minKey: 'stamp_s9rsi_min', maxKey: 'stamp_s9rsi_max' },
    stamp_e45cfg: { minKey: 'stamp_e45cfg_min', maxKey: 'stamp_e45cfg_max' },
    cfg_daily: { minKey: 'cfg_daily_min', maxKey: 'cfg_daily_max' },
    cfg_sma4: { minKey: 'cfg_sma4_min', maxKey: 'cfg_sma4_max' },
    cfg_ema45: { minKey: 'cfg_ema45_min', maxKey: 'cfg_ema45_max' },
    sma4: { minKey: 'sma4_min', maxKey: 'sma4_max' },
    sma9_price: { minKey: 'sma9_price_min', maxKey: 'sma9_price_max' },
    sma18: { minKey: 'sma18_min', maxKey: 'sma18_max' },
    wma45_close: { minKey: 'wma45_close_min', maxKey: 'wma45_close_max' },
    cci: { minKey: 'cci_min', maxKey: 'cci_max' },
    cci_ema20: { minKey: 'cci_ema20_min', maxKey: 'cci_ema20_max' },
    aroon_up: { minKey: 'aroon_up_min', maxKey: 'aroon_up_max' },
    aroon_down: { minKey: 'aroon_down_min', maxKey: 'aroon_down_max' },
    rsi_w: { minKey: 'rsi_w_min', maxKey: 'rsi_w_max' },
    sma9_rsi_w: { minKey: 'sma9_rsi_w_min', maxKey: 'sma9_rsi_w_max' },
    wma45_rsi_w: { minKey: 'wma45_rsi_w_min', maxKey: 'wma45_rsi_w_max' },
    sma9_close_w: { minKey: 'sma9_close_w_min', maxKey: 'sma9_close_w_max' },
    the_number_w: { minKey: 'the_number_w_min', maxKey: 'the_number_w_max' },
    the_number_hl_w: { minKey: 'the_number_hl_w_min', maxKey: 'the_number_hl_w_max' },
    the_number_ll_w: { minKey: 'the_number_ll_w_min', maxKey: 'the_number_ll_w_max' },
    stamp_s9rsi_w: { minKey: 'stamp_s9rsi_w_min', maxKey: 'stamp_s9rsi_w_max' },
    stamp_e45cfg_w: { minKey: 'stamp_e45cfg_w_min', maxKey: 'stamp_e45cfg_w_max' },
    cfg_w: { minKey: 'cfg_w_min', maxKey: 'cfg_w_max' },
    cfg_sma4_w: { minKey: 'cfg_sma4_w_min', maxKey: 'cfg_sma4_w_max' },
    cfg_ema45_w: { minKey: 'cfg_ema45_w_min', maxKey: 'cfg_ema45_w_max' },
    close_w: { minKey: 'close_w_min', maxKey: 'close_w_max' },
    sma4_w: { minKey: 'sma4_w_min', maxKey: 'sma4_w_max' },
    sma9_w: { minKey: 'sma9_w_min', maxKey: 'sma9_w_max' },
    sma18_w: { minKey: 'sma18_w_min', maxKey: 'sma18_w_max' },
    wma45_close_w: { minKey: 'wma45_close_w_min', maxKey: 'wma45_close_w_max' },
    cci_w: { minKey: 'cci_w_min', maxKey: 'cci_w_max' },
    cci_ema20_w: { minKey: 'cci_ema20_w_min', maxKey: 'cci_ema20_w_max' },
    aroon_up_w: { minKey: 'aroon_up_w_min', maxKey: 'aroon_up_w_max' },
    aroon_down_w: { minKey: 'aroon_down_w_min', maxKey: 'aroon_down_w_max' },
};

// Columns that are text-searchable (not numeric operators)
const TEXT_FILTER_COLS = new Set(['symbol', 'name']);

// Columns with no filter (boolean signals, rating badges, charts)
const NO_FILTER_COLS = new Set([
    'charts', 'acc_dis_rating', 'industry_group_rs', 'sector_rs',
    'industry_rs', 'sub_industry_rs', 'industry_group', 'sector',
    'industry', 'sub_industry', 'final_signal', 'stamp_signal',
    'trend_signal', 'rsi_55_70', 'cfg_gt_50_daily', 'cfg_gt_50_w', 'tech_score',
]);

// ─── Operator labels ──────────────────────────────────────────────────────────
const OPERATORS: { value: Operator; label: string; short: string }[] = [
    { value: 'gt', label: '> Greater than', short: '>' },
    { value: 'gte', label: '≥ At least', short: '≥' },
    { value: 'lt', label: '< Less than', short: '<' },
    { value: 'lte', label: '≤ At most', short: '≤' },
];

// ─── Single cell filter (popover dropdown) ────────────────────────────────────
interface CellFilterProps {
    colKey: string;
    filters: FilterState;
    setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
    isSticky?: boolean;
    stickyClass?: string;
}

function CellFilter({ colKey, filters, setFilters, isSticky, stickyClass }: CellFilterProps) {
    const [open, setOpen] = useState(false);
    const [operator, setOperator] = useState<Operator>('');
    const [inputVal, setInputVal] = useState('');
    const ref = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const mapping = COLUMN_FILTER_MAP[colKey];
    const isText = TEXT_FILTER_COLS.has(colKey);
    const isNone = NO_FILTER_COLS.has(colKey) || (!mapping && !isText);

    // Sync state from external filters (e.g. sidebar reset)
    useEffect(() => {
        if (!mapping) return;
        const minVal = filters[mapping.minKey] as string;
        const maxVal = filters[mapping.maxKey] as string;
        if (!minVal && !maxVal) {
            setOperator('');
            setInputVal('');
        }
    }, [filters, mapping]);

    // Close on outside click
    useEffect(() => {
        function onOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        if (open) document.addEventListener('mousedown', onOutside);
        return () => document.removeEventListener('mousedown', onOutside);
    }, [open]);

    // Focus input when popover opens
    useEffect(() => {
        if (open && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [open]);

    const isActive = !!operator && inputVal !== '';

    // Apply filter to FilterState
    const applyNumericFilter = useCallback((op: Operator, val: string) => {
        if (!mapping) return;
        setFilters(prev => {
            const next = { ...prev } as FilterState;
            // Clear both first
            (next as any)[mapping.minKey] = '';
            (next as any)[mapping.maxKey] = '';
            if (op && val !== '') {
                if (op === 'gt' || op === 'gte') (next as any)[mapping.minKey] = val;
                if (op === 'lt' || op === 'lte') (next as any)[mapping.maxKey] = val;
            }
            return next;
        });
    }, [mapping, setFilters]);

    const handleOperatorSelect = (op: Operator) => {
        setOperator(op);
        if (inputVal) applyNumericFilter(op, inputVal);
    };

    const handleInputChange = (val: string) => {
        setInputVal(val);
        if (operator) applyNumericFilter(operator, val);
    };

    const handleClear = () => {
        setOperator('');
        setInputVal('');
        if (mapping) {
            setFilters(prev => ({
                ...prev,
                [mapping.minKey]: '',
                [mapping.maxKey]: '',
            }));
        }
        setOpen(false);
    };

    // Text filter (symbol / name)
    if (isText) {
        const textKey = colKey as keyof FilterState;
        const textVal = filters[textKey] as string;
        return (
            <td className={`px-1 py-0.5 ${stickyClass || ''}`} style={{ background: 'transparent' }}>
                <input
                    type="text"
                    value={textVal}
                    onChange={e => setFilters(prev => ({ ...prev, [textKey]: e.target.value }))}
                    placeholder="Search..."
                    className={`
            w-full px-1.5 py-0.5 text-[10px] rounded border outline-none transition-all
            placeholder:text-gray-300
            ${textVal
                            ? 'border-amber-400 bg-amber-50 text-gray-800 font-medium'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 focus:border-amber-400 focus:bg-amber-50'
                        }
          `}
                />
            </td>
        );
    }

    // No filter cell
    if (isNone) {
        return (
            <td className={`px-1 py-0.5 ${stickyClass || ''}`}>
                <div className="h-[22px]" />
            </td>
        );
    }

    // Numeric operator filter
    const activeOpLabel = OPERATORS.find(o => o.value === operator)?.short ?? '';

    return (
        <td className={`px-1 py-0.5 relative ${stickyClass || ''}`}>
            <div ref={ref} className="relative">
                {/* Trigger button */}
                <button
                    onClick={() => setOpen(v => !v)}
                    className={`
            w-full flex items-center justify-center gap-0.5 px-1 py-0.5 rounded text-[10px] border transition-all outline-none
            ${isActive
                            ? 'bg-amber-50 border-amber-400 text-amber-700 font-semibold shadow-sm'
                            : 'bg-white border-gray-200 text-gray-400 hover:border-amber-300 hover:text-amber-600'
                        }
          `}
                    title={isActive ? `${activeOpLabel} ${inputVal}` : 'Add filter'}
                >
                    {isActive ? (
                        <>
                            <span className="font-bold text-amber-600">{activeOpLabel}</span>
                            <span className="text-gray-700 ml-0.5 max-w-[48px] truncate">{inputVal}</span>
                        </>
                    ) : (
                        <span className="text-gray-300 text-[11px]">⊕</span>
                    )}
                </button>

                {/* Popover */}
                {open ? (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-[9999] w-[190px] bg-white border border-amber-200 rounded-lg shadow-xl shadow-amber-900/10 overflow-hidden">
                        {/* Header */}
                        <div className="bg-amber-50 border-b border-amber-100 px-3 py-1.5">
                            <span className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider">Filter</span>
                        </div>

                        {/* Operator list */}
                        <div className="p-2 flex flex-col gap-1">
                            {OPERATORS.map(op => (
                                <button
                                    key={op.value}
                                    onClick={() => handleOperatorSelect(op.value)}
                                    className={`
                    flex items-center gap-2 px-2.5 py-1.5 rounded text-[11px] text-left transition-all w-full
                    ${operator === op.value
                                            ? 'bg-amber-600 text-white font-semibold'
                                            : 'text-gray-600 hover:bg-amber-50 hover:text-amber-700'
                                        }
                  `}
                                >
                                    <span className={`inline-flex items-center justify-center w-5 h-5 rounded text-[11px] font-bold flex-shrink-0
                    ${operator === op.value ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                        {op.short}
                                    </span>
                                    <span>{op.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Value input */}
                        <div className="px-2 pb-2">
                            <div className={`flex items-center gap-1 px-2 py-1.5 rounded-md border transition-all
                ${operator ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-gray-50'}`}>
                                {operator ? (
                                    <span className="text-[11px] font-bold text-amber-600 flex-shrink-0 w-4 text-center">
                                        {activeOpLabel}
                                    </span>
                                ) : null}
                                <input
                                    ref={inputRef}
                                    type="number"
                                    value={inputVal}
                                    onChange={e => handleInputChange(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') setOpen(false); if (e.key === 'Escape') handleClear(); }}
                                    placeholder={operator ? 'Enter value...' : 'Select operator first'}
                                    disabled={!operator}
                                    className={`flex-1 min-w-0 text-[11px] outline-none bg-transparent
                    ${operator ? 'text-gray-800 placeholder:text-amber-300' : 'text-gray-400 placeholder:text-gray-300 cursor-not-allowed'}
                  `}
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-2 pb-2 flex gap-1.5">
                            <button
                                onClick={() => setOpen(false)}
                                className="flex-1 py-1 text-[10px] font-semibold bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
                            >
                                Apply
                            </button>
                            {isActive ? (
                                <button
                                    onClick={handleClear}
                                    className="px-2 py-1 text-[10px] font-medium text-gray-500 bg-gray-100 rounded hover:bg-red-50 hover:text-red-500 transition-colors"
                                >
                                    Clear
                                </button>
                            ) : null}
                        </div>
                    </div>
                ) : null}
            </div>
        </td>
    );
}

// ─── Main component: renders a full <tr> of filter cells ──────────────────────
export default function ColumnFilterRow({
    columnDefinitions,
    visibleColumns,
    filters,
    setFilters,
}: ColumnFilterRowProps) {
    const visibleCols = columnDefinitions.filter(col => visibleColumns[col.visibleKey]);

    return (
        <tr className="bg-[#fdf9f6] border-b-2 border-amber-200/60">
            {visibleCols.map(col => {
                // Replicate sticky logic from page.tsx
                let stickyClass = '';
                if (col.key === 'symbol') {
                    stickyClass = 'sticky left-0 z-50 bg-[#fdf9f6] border-r border-gray-200 min-w-[70px] w-[70px] max-w-[70px]';
                } else if (col.key === 'name') {
                    stickyClass = `sticky z-50 bg-[#fdf9f6] border-r border-gray-200 min-w-[180px] w-[180px] max-w-[180px]`;
                    if (visibleColumns['symbol']) stickyClass += ' left-[70px]';
                    else stickyClass += ' left-0';
                }

                return (
                    <CellFilter
                        key={col.key}
                        colKey={col.key}
                        filters={filters}
                        setFilters={setFilters}
                        stickyClass={stickyClass}
                    />
                );
            })}
        </tr>
    );
}