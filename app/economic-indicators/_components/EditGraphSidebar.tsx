'use client';

import React, { useState, useRef, useEffect } from 'react';

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
export interface GraphFormatSettings {
    graphType: 'Line' | 'Area' | 'Bar' | 'Scatter';
    showTitle: boolean;
    showAxisTitles: boolean;
    showTooltip: boolean;
    showRecessionShading: boolean;
    logScaleLeft: boolean;
    height: number;
    width: number;
    lineStyle: 'Solid' | 'Dashed' | 'Dotted';
    lineWidth: number;
    lineColor: string;
    markType: 'None' | 'Circle' | 'Square' | 'Diamond';
    markWidth: number;
    yAxisPosition: 'Left' | 'Right';
}

export interface LineInfo {
    seriesId: string;
    label: string;
    units: string;
    frequency: string;
    seasonalAdjustment?: string;
}

interface EditGraphSidebarProps {
    lineInfo: LineInfo;
    formatSettings: GraphFormatSettings;
    onFormatChange: (settings: GraphFormatSettings) => void;
    onSizeApply?: (height: number, width: number) => void;
    onUnitsChange?: (units: string) => void;
    onFrequencyChange?: (frequency: string) => void;
    onFormulaApply?: (formula: string) => void;
    onOutputUnitsChange?: (outputUnits: string) => void;
    onAddSeries?: (seriesId: string) => void;
}

/* ─────────────────────────────────────────────
   Constants
───────────────────────────────────────────── */
const UNITS_OPTIONS = [
    'Thousands of Persons',
    'Change, Thousands of Persons',
    'Change from Year Ago, Thousands of Persons',
    'Percent Change',
    'Percent Change from Year Ago',
    'Compounded Annual Rate of Change',
    'Continuously Compounded Rate of Change',
    'Continuously Compounded Annual Rate of Change',
    'Index (Scale value to 100 for chosen date)',
];

const UNITS_OPTIONS_PERCENT = [
    'Percent',
    'Change',
    'Change from Year Ago',
    'Percent Change',
    'Percent Change from Year Ago',
    'Compounded Annual Rate of Change',
    'Continuously Compounded Rate of Change',
    'Continuously Compounded Annual Rate of Change',
    'Index (Scale value to 100 for chosen date)',
];

const UNITS_OPTIONS_NUMBER = [
    'Number',
    'Change',
    'Change from Year Ago',
    'Percent Change',
    'Percent Change from Year Ago',
    'Compounded Annual Rate of Change',
    'Continuously Compounded Rate of Change',
    'Continuously Compounded Annual Rate of Change',
    'Index (Scale value to 100 for chosen date)',
];

const FREQUENCY_OPTIONS = ['Monthly', 'Quarterly', 'Semiannual', 'Annual'];

const OUTPUT_UNITS_OPTIONS = [
    'Select',
    'Change',
    'Change from Year Ago',
    'Percent Change',
    'Percent Change from Year Ago',
    'Compounded Annual Rate of Change',
    'Continuously Compounded Rate of Change',
    'Continuously Compounded Annual Rate of Change',
    'Natural Log',
    'Index (Scale value to 100 for chosen date)',
];

const GRAPH_TYPES = ['Line', 'Area', 'Bar', 'Scatter'] as const;
const LINE_STYLE_OPTIONS = ['Solid', 'Dashed', 'Dotted'] as const;
const MARK_TYPE_OPTIONS = ['None', 'Circle', 'Square', 'Diamond'] as const;
const LINE_WIDTH_OPTIONS = [1, 2, 3, 4, 5] as const;

/* ─────────────────────────────────────────────
   Helper: pick units list based on current units
───────────────────────────────────────────── */
function getUnitsOptions(currentUnits: string): string[] {
    if (currentUnits.toLowerCase().includes('percent') || currentUnits === 'Percent') {
        return UNITS_OPTIONS_PERCENT;
    }
    if (currentUnits === 'Number') {
        return UNITS_OPTIONS_NUMBER;
    }
    return UNITS_OPTIONS;
}

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
export default function EditGraphSidebar({
    lineInfo,
    formatSettings,
    onFormatChange,
    onSizeApply,
    onUnitsChange,
    onFrequencyChange,
    onFormulaApply,
    onOutputUnitsChange,
    onAddSeries,
}: EditGraphSidebarProps) {
    const [open, setOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'EDIT LINE' | 'ADD LINE' | 'FORMAT'>('EDIT LINE');

    // EDIT LINE local state – stays in sync with parent via useEffect
    const [selectedUnits, setSelectedUnits] = useState(lineInfo.units);
    const [selectedFrequency, setSelectedFrequency] = useState(lineInfo.frequency);

    // FORMAT tab – local until Apply is clicked
    const [localHeight, setLocalHeight] = useState(formatSettings.height);
    const [localWidth, setLocalWidth] = useState(formatSettings.width);

    // Customize data
    const [searchKeyword, setSearchKeyword] = useState('');
    const [formula, setFormula] = useState('a');
    const [formulaError, setFormulaError] = useState('');

    // FIX: outputUnits must track the real current value, not always start at 'Select'
    const [localOutputUnits, setLocalOutputUnits] = useState('Select');
    const [showNeedHelp, setShowNeedHelp] = useState(false);

    // ADD LINE
    const [addLineSearch, setAddLineSearch] = useState('');

    const sidebarRef = useRef<HTMLDivElement>(null);

    /* ── Close panel on outside click ── */
    useEffect(() => {
        if (!open) return;
        function handle(e: MouseEvent) {
            if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handle);
        return () => document.removeEventListener('mousedown', handle);
    }, [open]);

    /* ── Sync local size when parent updates ── */
    useEffect(() => {
        setLocalHeight(formatSettings.height);
        setLocalWidth(formatSettings.width);
    }, [formatSettings.height, formatSettings.width]);

    /* ── Sync units/frequency when lineInfo changes ── */
    useEffect(() => { setSelectedUnits(lineInfo.units); }, [lineInfo.units]);
    useEffect(() => { setSelectedFrequency(lineInfo.frequency); }, [lineInfo.frequency]);

    /* ────────────────────────
       Handlers
    ──────────────────────── */

    // FIX: guard toggle so it only fires on boolean fields
    const toggle = (key: keyof GraphFormatSettings) => {
        if (typeof formatSettings[key] === 'boolean') {
            onFormatChange({ ...formatSettings, [key]: !formatSettings[key] });
        }
    };

    const handleUnitsChange = (val: string) => {
        setSelectedUnits(val);
        onUnitsChange?.(val);
    };

    const handleFrequencyChange = (val: string) => {
        setSelectedFrequency(val);
        onFrequencyChange?.(val);
    };

    // FIX: validate formula before calling parent; only safe chars allowed
    const handleFormulaApply = () => {
        const trimmed = formula.trim();
        if (!trimmed) {
            setFormulaError('Formula cannot be empty.');
            return;
        }
        // Allow: letters, digits, spaces, operators, parentheses, decimal points
        const safePattern = /^[a-zA-Z0-9\s+\-*/.()\^]+$/;
        if (!safePattern.test(trimmed)) {
            setFormulaError('Only letters, numbers, and +  -  *  /  ( ) are allowed.');
            return;
        }
        setFormulaError('');
        onFormulaApply?.(trimmed);
    };

    // FIX: outputUnits change keeps local state and notifies parent
    const handleOutputUnitsChange = (val: string) => {
        setLocalOutputUnits(val);
        onOutputUnitsChange?.(val);
    };

    const handleAddSeries = () => {
        if (searchKeyword.trim()) {
            onAddSeries?.(searchKeyword.trim());
            setSearchKeyword('');
        }
    };

    const handleAddLineSearch = () => {
        const code = addLineSearch.trim().toUpperCase();
        if (code) {
            onAddSeries?.(code);
            setAddLineSearch('');
        }
    };

    const unitsOptions = getUnitsOptions(lineInfo.units);
    const TABS = ['EDIT LINE', 'ADD LINE', 'FORMAT'] as const;

    /* ────────────────────────
       Render
    ──────────────────────── */
    return (
        <div className="relative inline-block" ref={sidebarRef}>

            {/* ── Trigger Button ── */}
            <button
                onClick={() => setOpen((p) => !p)}
                className={[
                    'inline-flex items-center gap-1.5 text-[12px] font-semibold border rounded px-3 py-1.5 transition-colors select-none',
                    open
                        ? 'bg-[#1a5276] text-white border-[#1a5276]'
                        : 'bg-[#2874a6] text-white border-[#2874a6] hover:bg-[#1a5276]',
                ].join(' ')}
            >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit Graph
            </button>

            {/* ── Sidebar Panel ── */}
            {open && (
                <div
                    className="absolute right-0 top-[calc(100%+6px)] z-50 bg-white border border-[#ccc] shadow-[0_4px_16px_rgba(0,0,0,0.15)] w-[370px] text-[13px] text-[#333]"
                    style={{ fontFamily: 'Arial, sans-serif' }}
                >
                    {/* ── Tab Bar ── */}
                    <div className="flex border-b border-[#ccc]">
                        {TABS.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={[
                                    'flex-1 py-2.5 text-[11px] font-bold tracking-wide transition-colors',
                                    activeTab === tab
                                        ? 'bg-white border-b-2 border-b-[#333] text-[#333]'
                                        : 'bg-[#f5f5f5] text-[#555] hover:bg-[#ebebeb]',
                                ].join(' ')}
                            >
                                {tab}
                            </button>
                        ))}
                        <button
                            onClick={() => setOpen(false)}
                            className="px-3 bg-[#f5f5f5] text-[#777] hover:text-[#333] hover:bg-[#e0e0e0] text-[16px] font-light border-l border-[#ccc]"
                            aria-label="Close"
                        >
                            ×
                        </button>
                    </div>

                    {/* ════════════════════════════════
              TAB: EDIT LINE
          ════════════════════════════════ */}
                    {activeTab === 'EDIT LINE' && (
                        <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">

                            {/* Header */}
                            <div>
                                <div className="font-bold text-[13px] mb-0.5">Line 1</div>
                                <div className="text-[11px] text-[#555] leading-snug">
                                    (a) {lineInfo.label}, {lineInfo.units},{' '}
                                    {lineInfo.seasonalAdjustment ?? 'Seasonally Adjusted'} ({lineInfo.seriesId})
                                </div>
                            </div>

                            {/* Units dropdown – fires onUnitsChange immediately */}
                            <div>
                                <label className="block text-[12px] font-bold text-[#333] mb-1">Units</label>
                                <select
                                    value={selectedUnits}
                                    onChange={(e) => handleUnitsChange(e.target.value)}
                                    className="w-full border border-[#4d7eb2] rounded px-2 py-2 text-[12px] bg-white focus:outline-none focus:border-[#2874a6] focus:ring-1 focus:ring-[#2874a6]"
                                >
                                    {unitsOptions.map((opt) => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Frequency dropdown – fires onFrequencyChange immediately */}
                            <div>
                                <label className="block text-[12px] font-bold text-[#333] mb-1">Modify frequency</label>
                                <select
                                    value={selectedFrequency}
                                    onChange={(e) => handleFrequencyChange(e.target.value)}
                                    className="w-full border border-[#4d7eb2] rounded px-2 py-2 text-[12px] bg-white focus:outline-none focus:border-[#2874a6] focus:ring-1 focus:ring-[#2874a6]"
                                >
                                    {FREQUENCY_OPTIONS.map((opt) => (
                                        <option key={opt} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>

                            {/* ── Customize data ── */}
                            <div className="border-t border-[#e5e5e5] pt-3">
                                <div className="font-bold text-[12px] mb-1">Customize data</div>
                                <div className="text-[11px] text-[#555] leading-snug mb-2">
                                    Write a custom formula to transform one or more series or combine two or more series.
                                </div>
                                <div className="text-[11px] text-[#555] leading-snug mb-2">
                                    You can begin by adding a series to combine with your existing series.
                                </div>

                                {/* Series search + Add button */}
                                <div className="flex items-center gap-2 mb-3">
                                    <select
                                        value={searchKeyword}
                                        onChange={(e) => setSearchKeyword(e.target.value)}
                                        className="flex-1 border border-[#4d7eb2] rounded px-2 py-2 text-[11px] bg-white focus:outline-none focus:border-[#2874a6] focus:ring-1 focus:ring-[#2874a6]"
                                    >
                                        <option value="">Type keywords to search for data</option>
                                        <option value="GDP">GDP – Gross Domestic Product</option>
                                        <option value="CPIAUCSL">CPI – Consumer Price Index</option>
                                        <option value="UNRATE">UNRATE – Unemployment Rate</option>
                                        <option value="PAYEMS">PAYEMS – Total Nonfarm</option>
                                        <option value="IC4WSA">IC4WSA – Initial Claims</option>
                                        <option value="DFF">DFF – Federal Funds Rate</option>
                                        <option value="T10Y2Y">T10Y2Y – 10Y-2Y Spread</option>
                                    </select>
                                    <button
                                        onClick={handleAddSeries}
                                        disabled={!searchKeyword}
                                        className="inline-flex items-center gap-1 text-[#2874a6] border border-[#2874a6] rounded px-2.5 py-1.5 text-[11px] font-bold hover:bg-[#2874a6] hover:text-white transition-colors whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        Add
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="text-[11px] text-[#555] leading-snug mb-1">
                                    Now create a custom formula to combine or transform the series.
                                </div>

                                {/* Need help toggle */}
                                <button
                                    onClick={() => setShowNeedHelp(!showNeedHelp)}
                                    className="text-[#2874a6] text-[11px] font-medium hover:underline mb-2 flex items-center gap-0.5"
                                >
                                    Need help?{' '}
                                    <svg width="8" height="8" viewBox="0 0 12 12" fill="currentColor">
                                        <path d={showNeedHelp ? 'M2 8L6 4L10 8' : 'M2 4L6 8L10 4'} />
                                    </svg>
                                </button>

                                {showNeedHelp && (
                                    <div className="bg-[#f8f9fa] border border-[#e0e0e0] rounded p-2 mb-2 text-[10px] text-[#555] leading-relaxed">
                                        <p className="mb-1"><strong>Variables:</strong> &apos;a&apos; = Line 1, &apos;b&apos; = Line 2, etc.</p>
                                        <p className="mb-1"><strong>Operators:</strong> +  -  *  /</p>
                                        <p className="mb-1"><strong>Examples:</strong></p>
                                        <p className="ml-2">a → Line 1 unchanged</p>
                                        <p className="ml-2">a * 2 → multiply Line 1 by 2</p>
                                        <p className="ml-2">a + b → sum of Line 1 and Line 2</p>
                                        <p className="ml-2">a / b * 100 → ratio as percent</p>
                                        <p className="ml-2">a - b → difference</p>
                                    </div>
                                )}

                                {/* Formula input */}
                                <div className="mb-1">
                                    <label className="block text-[12px] font-bold text-[#333] mb-1">Formula</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={formula}
                                            onChange={(e) => { setFormula(e.target.value); setFormulaError(''); }}
                                            onKeyDown={(e) => { if (e.key === 'Enter') handleFormulaApply(); }}
                                            className={`flex-1 border rounded px-3 py-2 text-[12px] bg-white focus:outline-none focus:ring-1 ${formulaError
                                                ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                                                : 'border-[#4d7eb2] focus:border-[#2874a6] focus:ring-[#2874a6]'
                                                }`}
                                            placeholder="a"
                                        />
                                        <button
                                            onClick={handleFormulaApply}
                                            className="inline-flex items-center gap-1 bg-white text-[#2874a6] border border-[#2874a6] rounded px-3 py-1.5 text-[11px] font-bold hover:bg-[#2874a6] hover:text-white transition-colors whitespace-nowrap"
                                        >
                                            Apply Formula
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
                                            </svg>
                                        </button>
                                    </div>
                                    {formulaError && (
                                        <p className="text-[10px] text-red-500 mt-1">{formulaError}</p>
                                    )}
                                </div>

                                {/* Output Units – uses localOutputUnits (FIX: was stale 'Change') */}
                                <div className="mt-3">
                                    <div className="text-[11px] text-[#555] leading-snug mb-1">
                                        Finally, you can change the units of your new series.
                                    </div>
                                    <label className="block text-[12px] font-bold text-[#333] mb-1">Units</label>
                                    <select
                                        value={localOutputUnits}
                                        onChange={(e) => handleOutputUnitsChange(e.target.value)}
                                        className="w-full border border-[#4d7eb2] rounded px-2 py-2 text-[12px] bg-white focus:outline-none focus:border-[#2874a6] focus:ring-1 focus:ring-[#2874a6]"
                                    >
                                        {OUTPUT_UNITS_OPTIONS.map((opt) => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ════════════════════════════════
              TAB: ADD LINE
          ════════════════════════════════ */}
                    {activeTab === 'ADD LINE' && (
                        <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
                            <div className="font-bold text-[12px]">Add data series to graph</div>

                            {/* Free-text search */}
                            <div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={addLineSearch}
                                        onChange={(e) => setAddLineSearch(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') handleAddLineSearch(); }}
                                        className="flex-1 border border-[#4d7eb2] rounded px-3 py-2 text-[12px] bg-white focus:outline-none focus:border-[#2874a6] focus:ring-1 focus:ring-[#2874a6]"
                                        placeholder="Type keywords to search for data"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleAddLineSearch}
                                disabled={!addLineSearch.trim()}
                                className="inline-flex items-center gap-1 bg-[#2874a6] text-white border border-[#2874a6] rounded px-3 py-1.5 text-[11px] font-bold hover:bg-[#1a5276] transition-colors whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                Add data series
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
                                </svg>
                            </button>

                            <div>
                                <button className="text-[#2874a6] text-[11px] font-medium hover:underline flex items-center gap-0.5">
                                    Create user-defined line{' '}
                                    <svg width="8" height="8" viewBox="0 0 12 12" fill="currentColor"><path d="M2 4L6 8L10 4" /></svg>
                                </button>
                            </div>

                            {/* Popular series */}
                            <div className="border-t border-[#e5e5e5] pt-3">
                                <div className="text-[11px] font-bold text-[#555] mb-2">Popular series</div>
                                <div className="space-y-1.5">
                                    {[
                                        { id: 'PAYEMS', name: 'All Employees, Total Nonfarm' },
                                        { id: 'UNRATE', name: 'Unemployment Rate' },
                                        { id: 'GDP', name: 'Gross Domestic Product' },
                                        { id: 'CPIAUCSL', name: 'Consumer Price Index' },
                                        { id: 'DFF', name: 'Federal Funds Effective Rate' },
                                        { id: 'IC4WSA', name: '4-Week Moving Avg of Initial Claims' },
                                        { id: 'T10Y2Y', name: '10-Year Treasury Minus 2-Year Treasury' },
                                    ].map((series) => (
                                        <button
                                            key={series.id}
                                            onClick={() => onAddSeries?.(series.id)}
                                            className="w-full text-left px-2 py-1.5 text-[11px] rounded hover:bg-[#f0f5fa] transition-colors flex items-center justify-between group"
                                        >
                                            <span>
                                                <span className="font-bold text-[#2874a6]">{series.id}</span>
                                                <span className="text-[#555] ml-1.5">– {series.name}</span>
                                            </span>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2874a6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
                                            </svg>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ════════════════════════════════
              TAB: FORMAT
          ════════════════════════════════ */}
                    {activeTab === 'FORMAT' && (
                        <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">

                            {/* Graph type */}
                            <div>
                                <label className="block text-[11px] font-bold text-[#333] mb-1">Graph type</label>
                                <select
                                    value={formatSettings.graphType}
                                    onChange={(e) =>
                                        onFormatChange({ ...formatSettings, graphType: e.target.value as GraphFormatSettings['graphType'] })
                                    }
                                    className="w-[120px] border border-[#bbb] rounded px-2 py-1.5 text-[12px] bg-white focus:outline-none focus:border-[#4d7eb2]"
                                >
                                    {GRAPH_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>

                            {/* Details */}
                            <div className="border-t border-[#e5e5e5] pt-3">
                                <div className="font-bold text-[12px] mb-2">Details</div>
                                <div className="text-[11px] font-bold text-[#555] mb-1.5">Display</div>
                                {(
                                    [
                                        { key: 'showTitle', label: 'Title' },
                                        { key: 'showAxisTitles', label: 'Axis titles' },
                                        { key: 'showTooltip', label: 'Tooltip' },
                                        { key: 'showRecessionShading', label: 'Recession shading' },
                                        { key: 'logScaleLeft', label: 'Log scale left' },
                                    ] as { key: keyof GraphFormatSettings; label: string }[]
                                ).map(({ key, label }) => (
                                    <label key={key} className="flex items-center gap-1.5 mb-1 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={!!formatSettings[key]}
                                            onChange={() => toggle(key)}
                                            className="w-3 h-3 accent-[#2874a6]"
                                        />
                                        <span className="text-[11px] text-[#333]">{label}</span>
                                    </label>
                                ))}

                                {/* Height + Width + Apply – FIX: passes both h and w */}
                                <div className="flex items-center gap-3 mt-3 flex-wrap">
                                    <div className="flex items-center gap-1.5">
                                        <label className="text-[11px] font-bold text-[#333]">Height</label>
                                        <input
                                            type="number" min={100} max={2000}
                                            value={localHeight}
                                            onChange={(e) => setLocalHeight(Number(e.target.value))}
                                            className="w-16 border border-[#bbb] rounded px-1.5 py-1 text-[11px] text-center focus:outline-none focus:border-[#4d7eb2]"
                                        />
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <label className="text-[11px] font-bold text-[#333]">Width</label>
                                        <input
                                            type="number" min={200} max={4000}
                                            value={localWidth}
                                            onChange={(e) => setLocalWidth(Number(e.target.value))}
                                            className="w-16 border border-[#bbb] rounded px-1.5 py-1 text-[11px] text-center focus:outline-none focus:border-[#4d7eb2]"
                                        />
                                    </div>
                                    <button
                                        onClick={() => onSizeApply?.(localHeight, localWidth)}
                                        className="bg-[#2874a6] text-white text-[11px] font-bold px-3 py-1 rounded hover:bg-[#1a5276] transition-colors"
                                    >
                                        Apply
                                    </button>
                                </div>
                            </div>

                            {/* Line details & color */}
                            <div className="border-t border-[#e5e5e5] pt-3">
                                <div className="text-[11px] font-bold text-[#333] mb-0.5">Line 1</div>
                                <div className="text-[11px] text-[#555] mb-1">{lineInfo.label}</div>
                                <div className="text-[11px] font-bold text-[#555] mb-1">Line details &amp; color</div>
                                <div className="text-[10px] text-[#888] mb-2">Line style, thickness, color and position</div>

                                <div className="border border-[#4d7eb2] rounded p-3 bg-[#fafcff] space-y-3">
                                    <div className="text-[11px] font-bold text-[#333]">Customize</div>

                                    {/* Style controls row */}
                                    <div className="flex items-end gap-2 flex-wrap">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[10px] text-[#555]">Line style</span>
                                            <select
                                                value={formatSettings.lineStyle}
                                                onChange={(e) => onFormatChange({ ...formatSettings, lineStyle: e.target.value as GraphFormatSettings['lineStyle'] })}
                                                className="border border-[#bbb] rounded px-1.5 py-1 text-[11px] bg-white focus:outline-none focus:border-[#4d7eb2] w-[75px]"
                                            >
                                                {LINE_STYLE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>

                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[10px] text-[#555]">Width</span>
                                            <select
                                                value={formatSettings.lineWidth}
                                                onChange={(e) => onFormatChange({ ...formatSettings, lineWidth: Number(e.target.value) })}
                                                className="border border-[#bbb] rounded px-1 py-1 text-[11px] bg-white focus:outline-none focus:border-[#4d7eb2] w-[46px]"
                                            >
                                                {LINE_WIDTH_OPTIONS.map((w) => <option key={w} value={w}>{w}</option>)}
                                            </select>
                                        </div>

                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[10px] text-[#555]">Color</span>
                                            <input
                                                type="color"
                                                value={formatSettings.lineColor}
                                                onChange={(e) => onFormatChange({ ...formatSettings, lineColor: e.target.value })}
                                                className="w-8 h-[26px] border border-[#bbb] rounded cursor-pointer p-0.5 bg-white"
                                                title="Pick line color"
                                            />
                                        </div>

                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[10px] text-[#555]">Mark type</span>
                                            <select
                                                value={formatSettings.markType}
                                                onChange={(e) => onFormatChange({ ...formatSettings, markType: e.target.value as GraphFormatSettings['markType'] })}
                                                className="border border-[#bbb] rounded px-1.5 py-1 text-[11px] bg-white focus:outline-none focus:border-[#4d7eb2] w-[70px]"
                                            >
                                                {MARK_TYPE_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
                                            </select>
                                        </div>

                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[10px] text-[#555]">Width</span>
                                            <select
                                                value={formatSettings.markWidth}
                                                onChange={(e) => onFormatChange({ ...formatSettings, markWidth: Number(e.target.value) })}
                                                className="border border-[#bbb] rounded px-1 py-1 text-[11px] bg-white focus:outline-none focus:border-[#4d7eb2] w-[46px]"
                                            >
                                                {LINE_WIDTH_OPTIONS.map((w) => <option key={w} value={w}>{w}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Y-Axis position */}
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] text-[#555] font-bold">Y-Axis position</span>
                                        {(['Left', 'Right'] as const).map((pos) => (
                                            <label key={pos} className="flex items-center gap-1 cursor-pointer select-none">
                                                <input
                                                    type="radio"
                                                    name="yAxisPosition"
                                                    value={pos}
                                                    checked={formatSettings.yAxisPosition === pos}
                                                    onChange={() => onFormatChange({ ...formatSettings, yAxisPosition: pos })}
                                                    className="accent-[#2874a6]"
                                                />
                                                <span className="text-[11px] text-[#333]">{pos}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

/* ─────────────────────────────────────────────
   Default format settings export
───────────────────────────────────────────── */
export const defaultFormatSettings: GraphFormatSettings = {
    graphType: 'Line',
    showTitle: true,
    showAxisTitles: true,
    showTooltip: true,
    showRecessionShading: true,
    logScaleLeft: false,
    height: 450,
    width: 1320,
    lineStyle: 'Solid',
    lineWidth: 3,
    lineColor: '#0066cc',
    markType: 'None',
    markWidth: 3,
    yAxisPosition: 'Left',
};