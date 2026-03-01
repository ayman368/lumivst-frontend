'use client';
import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Columns3, ChevronDown, ChevronUp } from 'lucide-react';

type ColumnDef = { key: string; label: string; visibleKey: string };

// Group definitions for columns
const COLUMN_GROUPS: { id: string; label: string; keys: string[] }[] = [
    {
        id: 'profile',
        label: 'Company & Profile',
        keys: ['symbol', 'name', 'charts', 'industry_group', 'sector', 'industry', 'sub_industry'],
    },
    {
        id: 'price_volume',
        label: 'Price & Volume',
        keys: [
            'price', 'change', 'percent_change', 'open', 'high', 'low',
            'volume', 'turnover', 'no_of_trades', 'market_cap',
            'average_volume_50', 'vol_diff_50_percent',
            'fifty_two_week_high_price', 'fifty_two_week_low_price',
            'percent_off_52w_high', 'percent_off_52w_low',
        ],
    },
    {
        id: 'technicals_rs',
        label: 'Technicals & RS',
        keys: [
            'rs_rating', 'acc_dis_rating', 'industry_group_rs', 'sector_rs', 'industry_rs', 'sub_industry_rs',
            'price_vs_ema_10_percent', 'price_vs_ema_21_percent',
            'price_vs_sma_50_percent', 'price_vs_sma_150_percent', 'price_vs_sma_200_percent',
        ],
    },
    {
        id: 'ma_daily',
        label: 'Moving Averages (Daily)',
        keys: [
            'ema_10', 'ema_21', 'sma_3', 'ema_20_sma3',
            'sma_4', 'sma_9', 'sma_18',
            'sma_200_1m_ago', 'sma_200_2m_ago', 'sma_200_3m_ago', 'sma_200_4m_ago', 'sma_200_5m_ago',
        ],
    },
    {
        id: 'ma_weekly',
        label: 'Moving Averages (Weekly)',
        keys: [
            'sma_4w', 'sma_9w', 'sma_18w', 'sma_30w', 'sma_40w',
            'close_w', 'sma4_w', 'sma9_w', 'sma18_w', 'wma45_close_w',
        ],
    },
    {
        id: 'rsi_daily',
        label: 'RSI Daily',
        keys: [
            'rsi_14', 'sma9_rsi', 'wma45_rsi',
            'sma9_close', 'the_number', 'the_number_hl', 'the_number_ll',
            'cfg_daily', 'cfg_sma4', 'cfg_ema45',
            'sma4', 'sma9_price', 'sma18', 'wma45_close',
            'cci_14', 'cci_ema_20', 'aroon_up', 'aroon_down',
        ],
    },
    {
        id: 'rsi_weekly',
        label: 'RSI Weekly',
        keys: [
            'rsi_w', 'sma9_rsi_w', 'wma45_rsi_w',
            'sma9_close_w', 'the_number_w', 'the_number_hl_w', 'the_number_ll_w',
            'cfg_w', 'cfg_sma4_w', 'cfg_ema45_w',
            'cci_w', 'cci_ema20_w', 'aroon_up_w', 'aroon_down_w',
        ],
    },
    {
        id: 'stamp',
        label: 'STAMP',
        keys: [
            'stamp_s9rsi', 'stamp_e45cfg', 'stamp_e45rsi', 'stamp_e20sma3',
            'stamp_s9rsi_w', 'stamp_e45cfg_w', 'stamp_e45rsi_w', 'stamp_e20sma3_w',
        ],
    },
];

export default function ColumnSelector({
    show,
    columnDefinitions,
    visibleColumns,
    toggleColumn,
    setVisibleColumns,
    onClose,
    triggerRef,
}: {
    show: boolean;
    columnDefinitions: ColumnDef[];
    visibleColumns: Record<string, boolean>;
    toggleColumn: (key: string) => void;
    setVisibleColumns: (v: Record<string, boolean>) => void;
    onClose: () => void;
    triggerRef?: React.RefObject<HTMLElement>;
}) {
    const [search, setSearch] = useState('');
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
    const panelRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        if (!show) return;
        function handler(e: MouseEvent) {
            // Ignore if click is inside panel
            if (panelRef.current && panelRef.current.contains(e.target as Node)) return;
            // Ignore if click is on trigger button
            if (triggerRef?.current && triggerRef.current.contains(e.target as Node)) return;

            onClose();
        }
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [show, onClose, triggerRef]);

    // Build a lookup: visibleKey -> columnDef
    const colByVisibleKey = Object.fromEntries(columnDefinitions.map(c => [c.visibleKey, c]));

    const toggleGroup = (id: string) =>
        setOpenGroups(prev => ({ ...prev, [id]: !prev[id] }));

    // Filter columns by search
    const searchLower = search.toLowerCase();
    const matchesSearch = (col: ColumnDef) =>
        !search || col.label.toLowerCase().includes(searchLower) || col.key.toLowerCase().includes(searchLower);

    const totalVisible = columnDefinitions.filter(c => visibleColumns[c.visibleKey]).length;

    const selectAll = () => {
        const all: Record<string, boolean> = {};
        columnDefinitions.forEach(c => { all[c.visibleKey] = true; });
        setVisibleColumns(all);
        if (typeof window !== 'undefined') localStorage.setItem('stocksVisibleColumns', JSON.stringify(all));
    };

    const clearAll = () => {
        const none: Record<string, boolean> = {};
        columnDefinitions.forEach(c => { none[c.visibleKey] = false; });
        setVisibleColumns(none);
        if (typeof window !== 'undefined') localStorage.setItem('stocksVisibleColumns', JSON.stringify(none));
    };

    if (!show) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/20 z-[200]" onClick={onClose} />

            {/* Side Panel */}
            <div
                ref={panelRef}
                className="fixed top-0 right-0 h-full w-[340px] bg-white shadow-2xl z-[210] flex flex-col"
                style={{ animation: 'slideInRight 0.22s ease-out' }}
            >
                <style>{`
                    @keyframes slideInRight {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                `}</style>

                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100 flex-shrink-0 bg-gradient-to-r from-blue-50 to-white">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Columns3 size={16} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-sm font-bold text-gray-800 leading-none">Columns</h2>
                        <p className="text-[11px] text-gray-500 mt-0.5">Choose visible columns</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                        <X size={14} />
                    </button>
                </div>

                {/* Search */}
                <div className="px-4 py-3 border-b border-gray-100 flex-shrink-0">
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 h-9 focus-within:border-blue-400 focus-within:bg-white transition-all">
                        <Search size={13} className="text-gray-400 flex-shrink-0" />
                        <input
                            type="text"
                            placeholder="Search columns..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="flex-1 bg-transparent text-[12px] outline-none text-gray-700 placeholder:text-gray-400"
                        />
                        {search && (
                            <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600">
                                <X size={12} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Select All / Clear All */}
                <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 flex-shrink-0">
                    <button
                        onClick={selectAll}
                        className="flex-1 h-8 rounded-lg bg-blue-600 text-white text-[11px] font-bold hover:bg-blue-700 transition-colors"
                    >
                        Select All
                    </button>
                    <button
                        onClick={clearAll}
                        className="flex-1 h-8 rounded-lg border border-gray-200 text-gray-600 text-[11px] font-bold hover:bg-gray-50 transition-colors"
                    >
                        Clear All
                    </button>
                    <span className="text-[11px] text-gray-400 flex-shrink-0 ml-1">
                        {totalVisible}/{columnDefinitions.length}
                    </span>
                </div>

                {/* Groups list */}
                <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
                    {COLUMN_GROUPS.map(group => {
                        // Get column defs for this group that exist in columnDefinitions
                        const groupCols = group.keys
                            .map(k => colByVisibleKey[k])
                            .filter(Boolean)
                            .filter(matchesSearch);

                        if (groupCols.length === 0) return null;

                        const visibleCount = groupCols.filter(c => visibleColumns[c.visibleKey]).length;
                        const isOpen = search ? true : (openGroups[group.id] ?? false);

                        return (
                            <div key={group.id} className="mx-3 mb-1 rounded-xl border border-gray-100 overflow-hidden">
                                {/* Group Header */}
                                <button
                                    onClick={() => !search && toggleGroup(group.id)}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                                >
                                    <span className="flex-1 text-[12px] font-semibold text-gray-700">{group.label}</span>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[28px] text-center ${visibleCount > 0
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-500'
                                        }`}>
                                        {visibleCount}/{groupCols.length}
                                    </span>
                                    {!search && (
                                        isOpen
                                            ? <ChevronUp size={13} className="text-gray-400 flex-shrink-0" />
                                            : <ChevronDown size={13} className="text-gray-400 flex-shrink-0" />
                                    )}
                                </button>

                                {/* Column items */}
                                {isOpen && (
                                    <div className="bg-white divide-y divide-gray-50">
                                        {groupCols.map(col => {
                                            const checked = visibleColumns[col.visibleKey] || false;
                                            return (
                                                <label
                                                    key={col.visibleKey}
                                                    className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-blue-50/40 transition-colors group"
                                                >
                                                    <div
                                                        onClick={() => toggleColumn(col.visibleKey)}
                                                        className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${checked
                                                            ? 'bg-blue-600 border-blue-600'
                                                            : 'border-gray-300 group-hover:border-blue-400'
                                                            }`}
                                                    >
                                                        {checked && (
                                                            <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                                                                <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <span
                                                        onClick={() => toggleColumn(col.visibleKey)}
                                                        className={`text-[12px] flex-1 leading-tight transition-colors ${checked ? 'text-gray-900 font-medium' : 'text-gray-500 group-hover:text-gray-800'
                                                            }`}
                                                    >
                                                        {col.label}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Ungrouped columns (fallback) */}
                    {(() => {
                        const groupedKeys = new Set(COLUMN_GROUPS.flatMap(g => g.keys));
                        const ungrouped = columnDefinitions
                            .filter(c => !groupedKeys.has(c.visibleKey))
                            .filter(matchesSearch);

                        if (ungrouped.length === 0) return null;

                        const visibleCount = ungrouped.filter(c => visibleColumns[c.visibleKey]).length;
                        const isOpen = search ? true : (openGroups['__other'] ?? false);

                        return (
                            <div className="mx-3 mb-1 rounded-xl border border-gray-100 overflow-hidden">
                                <button
                                    onClick={() => !search && toggleGroup('__other')}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                                >
                                    <span className="flex-1 text-[12px] font-semibold text-gray-700">Other</span>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[28px] text-center ${visibleCount > 0 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                                        }`}>
                                        {visibleCount}/{ungrouped.length}
                                    </span>
                                    {!search && (isOpen ? <ChevronUp size={13} className="text-gray-400" /> : <ChevronDown size={13} className="text-gray-400" />)}
                                </button>
                                {isOpen && (
                                    <div className="bg-white divide-y divide-gray-50">
                                        {ungrouped.map(col => {
                                            const checked = visibleColumns[col.visibleKey] || false;
                                            return (
                                                <label key={col.visibleKey} className="flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-blue-50/40 group">
                                                    <div
                                                        onClick={() => toggleColumn(col.visibleKey)}
                                                        className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${checked ? 'bg-blue-600 border-blue-600' : 'border-gray-300 group-hover:border-blue-400'
                                                            }`}
                                                    >
                                                        {checked && (
                                                            <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                                                                <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <span
                                                        onClick={() => toggleColumn(col.visibleKey)}
                                                        className={`text-[12px] flex-1 ${checked ? 'text-gray-900 font-medium' : 'text-gray-500 group-hover:text-gray-800'}`}
                                                    >
                                                        {col.label}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </div>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-gray-100 flex-shrink-0 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="w-full h-9 rounded-lg bg-blue-600 text-white text-[12px] font-bold hover:bg-blue-700 transition-colors"
                    >
                        Done
                    </button>
                </div>
            </div>
        </>
    );
}