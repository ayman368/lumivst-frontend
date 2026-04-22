'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Filter, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatShariahApproval, formatPurgeAmount, formatMarginable } from '../stocks/utils/formatters';
import * as XLSX from 'xlsx';
import { API_BASE_URL } from '@/lib/api/config';

interface IndustryGroup {
    id: number;
    date: string;
    industry_group: string;
    sector: string;
    number_of_stocks: number;
    market_value: number;
    rs_score: number;
    rank: number;
    rank_1_week_ago?: number;
    rank_3_months_ago?: number;
    rank_6_months_ago?: number;
    ytd_change_percent: number;
    letter_grade?: string;
    change_vs_last_week?: number;
}

interface StockSummary {
    symbol: string;
    company_name: string;
    close: number;
    change_percent: number;
    market_cap: number;
    industry_group: string;
    sector: string;
    industry: string;
    sub_industry: string;
    date: string;
    rs_rating?: number;
    rs_rating_1_week_ago?: number;
    rs_rating_4_weeks_ago?: number;
    rs_rating_3_months_ago?: number;
    rs_rating_6_months_ago?: number;
    rs_rating_1_year_ago?: number;
    approval_with_controls?: string;
    purge_amount?: number | null;
    marginable_percent?: number | null;
}

interface SortConfig {
    key: string;
    direction: 'asc' | 'desc';
}

interface StockSortConfig {
    key: string;
    direction: 'asc' | 'desc';
}

interface FilterState {
    // Industry Filters
    sector: string[];
    industry_group: string[];
    industry: string[];
    sub_industry: string[];

    // Main Table Filters
    number_of_stocks_min: string;
    number_of_stocks_max: string;
    rank_min: string;
    rank_max: string;
    rank_1_week_ago_min: string;
    rank_1_week_ago_max: string;
    rank_3_months_ago_min: string;
    rank_3_months_ago_max: string;
    rank_6_months_ago_min: string;
    rank_6_months_ago_max: string;
    ytd_change_percent_min: string;
    ytd_change_percent_max: string;
    market_value_min: string;
    market_value_max: string;
    change_vs_last_week_min: string;
    change_vs_last_week_max: string;
    letter_grade: string[];
}

interface StockFilterState {
    symbol: string;
    company_name: string;
    rs_rating_min: string;
    rs_rating_max: string;
    rs_rating_1_week_ago_min: string;
    rs_rating_1_week_ago_max: string;
    rs_rating_4_weeks_ago_min: string;
    rs_rating_4_weeks_ago_max: string;
    rs_rating_3_months_ago_min: string;
    rs_rating_3_months_ago_max: string;
    rs_rating_6_months_ago_min: string;
    rs_rating_6_months_ago_max: string;
    rs_rating_1_year_ago_min: string;
    rs_rating_1_year_ago_max: string;
    approval_with_controls: string[];
    purge_amount_min: string;
    purge_amount_max: string;
    marginable_percent_min: string;
    marginable_percent_max: string;
}

function CustomMultiSelect({
    options,
    selected,
    onChange,
    placeholder,
    icon: Icon
}: {
    options: string[];
    selected: string[];
    onChange: (values: string[]) => void;
    placeholder: string;
    icon?: any;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const filteredOptions = options.filter(option =>
        option.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelect = (option: string) => {
        if (selected.includes(option)) {
            onChange(selected.filter(item => item !== option));
        } else {
            onChange([...selected, option]);
        }
    };

    const handleClearAll = () => {
        onChange([]);
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full pl-10 pr-8 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-lg 
                    focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white
                    outline-none transition-all hover:border-gray-300 text-left
                    flex items-center justify-between min-h-[42px]
                `}
            >
                <div className="flex items-center w-full">
                    {Icon && <Icon className="absolute left-3 w-4 h-4 text-gray-400" />}
                    <div className="flex flex-col items-start truncate w-full">
                        <span className="font-medium text-gray-700 text-xs">
                            {placeholder}
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {selected.length === 0 ? (
                                <span className="text-gray-400 text-xs">All</span>
                            ) : (
                                <>
                                    {selected.slice(0, 2).map((item) => (
                                        <span
                                            key={item}
                                            className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded-full"
                                        >
                                            {item}
                                        </span>
                                    ))}
                                    {selected.length > 2 && (
                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-full">
                                            +{selected.length - 2}
                                        </span>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden">
                    <div className="p-2 border-b border-gray-100">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-semibold text-gray-700">
                                Selected: {selected.length}
                            </span>
                            {selected.length > 0 && (
                                <button
                                    type="button"
                                    onClick={handleClearAll}
                                    className="text-xs text-red-600 hover:text-red-800"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-3 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="overflow-y-auto max-h-60 custom-scrollbar">
                        {filteredOptions.length > 0 ? (
                            <>
                                {filteredOptions.map((option) => (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() => handleSelect(option)}
                                        className={`
                                            w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center
                                            ${selected.includes(option)
                                                ? 'bg-blue-50 text-blue-600'
                                                : 'text-gray-700'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center w-full">
                                            <div className={`w-4 h-4 border rounded mr-2 flex items-center justify-center
                                                ${selected.includes(option)
                                                    ? 'bg-blue-600 border-blue-600'
                                                    : 'border-gray-300'
                                                }
                                            `}>
                                                {selected.includes(option) && (
                                                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                            <span className="truncate">{option}</span>
                                        </div>
                                    </button>
                                ))}
                            </>
                        ) : (
                            <div className="px-3 py-2 text-sm text-gray-500 text-center">No options found</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function FilterAccordion({
    title,
    children,
    defaultOpen = false,
    collapseSignal = 0
}: {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
    collapseSignal?: number;
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    useEffect(() => {
        if (collapseSignal > 0) {
            setIsOpen(false);
        }
    }, [collapseSignal]);

    return (
        <div className="border-b border-gray-200 pb-3">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center py-2 text-xs font-semibold text-gray-700 hover:text-gray-900"
            >
                <span>{title}</span>
                <svg
                    className={`w-4 h-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && (
                <div className="mt-2 space-y-3">
                    {children}
                </div>
            )}
        </div>
    );
}

function RangeFilter({
    label,
    minValue,
    maxValue,
    onMinChange,
    onMaxChange,
    minPlaceholder = "Min",
    maxPlaceholder = "Max"
}: {
    label: string;
    minValue: string;
    maxValue: string;
    onMinChange: (value: string) => void;
    onMaxChange: (value: string) => void;
    minPlaceholder?: string;
    maxPlaceholder?: string;
}) {
    return (
        <div className="space-y-1">
            <label className="block text-[10px] font-medium text-gray-600">{label}</label>
            <div className="flex space-x-2">
                <input
                    type="number"
                    placeholder={minPlaceholder}
                    value={minValue}
                    onChange={(e) => onMinChange(e.target.value)}
                    className="w-full px-2 py-1 text-[10px] bg-gray-50 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all outline-none"
                />
                <span className="self-center text-[10px] text-gray-400">-</span>
                <input
                    type="number"
                    placeholder={maxPlaceholder}
                    value={maxValue}
                    onChange={(e) => onMaxChange(e.target.value)}
                    className="w-full px-2 py-1 text-[10px] bg-gray-50 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all outline-none"
                />
            </div>
        </div>
    );
}

function ActiveFilterBadge({
    label,
    value,
    onRemove
}: {
    label: string;
    value: string;
    onRemove: () => void;
}) {
    return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700 border border-blue-200">
            {label}: {value}
            <button
                onClick={onRemove}
                className="ml-1 text-blue-500 hover:text-blue-700"
            >
                ×
            </button>
        </span>
    );
}

/**
 * Calculates a heatmap background + text color for a single RS cell.
 * Colors are relative to the stock's own min/max across all time periods,
 * so we see the momentum trend (red old → green new = accumulation phase).
 */
function getRSHeatmapStyle(value: number | null | undefined, rowMin: number, rowMax: number): React.CSSProperties {
    if (value == null) return {};

    const range = rowMax - rowMin;
    // If all values are identical, render neutral amber
    const pct = range === 0 ? 0.5 : (value - rowMin) / range;

    // Interpolate: 0% → red (220,38,38)  50% → amber (251,191,36)  100% → green (22,163,74)
    let r: number, g: number, b: number;
    if (pct <= 0.5) {
        const t = pct / 0.5;
        r = Math.round(220 + (251 - 220) * t);
        g = Math.round(38 + (191 - 38) * t);
        b = Math.round(38 + (36 - 38) * t);
    } else {
        const t = (pct - 0.5) / 0.5;
        r = Math.round(251 + (22 - 251) * t);
        g = Math.round(191 + (163 - 191) * t);
        b = Math.round(36 + (74 - 36) * t);
    }

    // Use white text on dark backgrounds (roughly pct < 0.25 or pct > 0.75)
    const textColor = pct < 0.25 || pct > 0.72 ? '#ffffff' : '#1a1a1a';

    return {
        backgroundColor: `rgb(${r},${g},${b})`,
        color: textColor,
    };
}

/** Extracts the min & max RS values across all 6 time periods for a stock row */
function getRSRowExtremes(stock: StockSummary): { rowMin: number; rowMax: number } {
    const vals = [
        stock.rs_rating,
        stock.rs_rating_1_week_ago,
        stock.rs_rating_4_weeks_ago,
        stock.rs_rating_3_months_ago,
        stock.rs_rating_6_months_ago,
        stock.rs_rating_1_year_ago,
    ].filter((v): v is number => v != null);

    if (vals.length === 0) return { rowMin: 0, rowMax: 100 };
    return { rowMin: Math.min(...vals), rowMax: Math.max(...vals) };
}

export default function IndustryGroupsPage() {
    const [data, setData] = useState<IndustryGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [collapseSignal, setCollapseSignal] = useState(0);

    const [filters, setFilters] = useState<FilterState>({
        // Industry Filters
        sector: [],
        industry_group: [],
        industry: [],
        sub_industry: [],

        // Main Table Filters
        number_of_stocks_min: '',
        number_of_stocks_max: '',
        rank_min: '',
        rank_max: '',
        rank_1_week_ago_min: '',
        rank_1_week_ago_max: '',
        rank_3_months_ago_min: '',
        rank_3_months_ago_max: '',
        rank_6_months_ago_min: '',
        rank_6_months_ago_max: '',
        ytd_change_percent_min: '',
        ytd_change_percent_max: '',
        market_value_min: '',
        market_value_max: '',
        change_vs_last_week_min: '',
        change_vs_last_week_max: '',
        letter_grade: [],
    });

    const [stockFilters, setStockFilters] = useState<StockFilterState>({
        symbol: '',
        company_name: '',
        rs_rating_min: '',
        rs_rating_max: '',
        rs_rating_1_week_ago_min: '',
        rs_rating_1_week_ago_max: '',
        rs_rating_4_weeks_ago_min: '',
        rs_rating_4_weeks_ago_max: '',
        rs_rating_3_months_ago_min: '',
        rs_rating_3_months_ago_max: '',
        rs_rating_6_months_ago_min: '',
        rs_rating_6_months_ago_max: '',
        rs_rating_1_year_ago_min: '',
        rs_rating_1_year_ago_max: '',
        approval_with_controls: [],
        purge_amount_min: '',
        purge_amount_max: '',
        marginable_percent_min: '',
        marginable_percent_max: '',
    });

    const [rsMomentumFilters, setRsMomentumFilters] = useState<string[]>([]);

    const RS_MOMENTUM_OPTIONS = [
        { key: 'full_chain', label: 'RS > 1W > 4W > 3M > 6M > 1Y', check: (s: StockSummary) => (s.rs_rating ?? 0) > (s.rs_rating_1_week_ago ?? 0) && (s.rs_rating_1_week_ago ?? 0) > (s.rs_rating_4_weeks_ago ?? 0) && (s.rs_rating_4_weeks_ago ?? 0) > (s.rs_rating_3_months_ago ?? 0) && (s.rs_rating_3_months_ago ?? 0) > (s.rs_rating_6_months_ago ?? 0) && (s.rs_rating_6_months_ago ?? 0) > (s.rs_rating_1_year_ago ?? 0) },
        { key: 'rs_gt_1w', label: 'RS > 1W', check: (s: StockSummary) => (s.rs_rating ?? 0) > (s.rs_rating_1_week_ago ?? 0) },
        { key: '1w_gt_4w', label: 'RS 1W > 4W', check: (s: StockSummary) => (s.rs_rating_1_week_ago ?? 0) > (s.rs_rating_4_weeks_ago ?? 0) },
        { key: '3m_gt_6m', label: 'RS 3M > 6M', check: (s: StockSummary) => (s.rs_rating_3_months_ago ?? 0) > (s.rs_rating_6_months_ago ?? 0) },
        { key: '6m_gt_1y', label: 'RS 6M > 1Y', check: (s: StockSummary) => (s.rs_rating_6_months_ago ?? 0) > (s.rs_rating_1_year_ago ?? 0) },
    ];

    const toggleRsMomentumFilter = (key: string) => {
        setRsMomentumFilters(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
    const [stocksCache, setStocksCache] = useState<Record<string, StockSummary[]>>({});
    const [loadingStocks, setLoadingStocks] = useState<Set<string>>(new Set());
    const [sortConfigs, setSortConfigs] = useState<SortConfig[]>([]);
    const [stockSortConfigs, setStockSortConfigs] = useState<Record<string, StockSortConfig[]>>({});

    const [stats, setStats] = useState({
        topPerformer: { group: '', change: 0 },
        worstPerformer: { group: '', change: 0 }
    });

    // Letter grade options
    const letterGradeOptions = ['A+', 'A', 'B', 'C', 'D', 'F'];

    // Filter options from data
    const filterOptions = useMemo(() => {
        const options = {
            sectors: new Set<string>(),
            industryGroups: new Set<string>(),
            industries: new Set<string>(),
            subIndustries: new Set<string>(),
            letterGrades: new Set<string>(letterGradeOptions)
        };

        data.forEach(item => {
            if (item.sector) options.sectors.add(item.sector);
            if (item.industry_group) options.industryGroups.add(item.industry_group);
        });

        Object.values(stocksCache).forEach(stocks => {
            stocks.forEach(stock => {
                if (stock.industry) options.industries.add(stock.industry);
                if (stock.sub_industry) options.subIndustries.add(stock.sub_industry);
            });
        });

        return {
            sectors: Array.from(options.sectors).sort(),
            industryGroups: Array.from(options.industryGroups).sort(),
            industries: Array.from(options.industries).sort(),
            subIndustries: Array.from(options.subIndustries).sort(),
            letterGrades: Array.from(options.letterGrades).sort()
        };
    }, [data, stocksCache]);

    const columnDefinitions = [
        { key: 'display_order', label: 'Order', sortable: false },
        { key: 'industry_group', label: 'Industry Group', sortable: true },
        { key: 'number_of_stocks', label: 'Num Stocks', sortable: true },
        { key: 'rank', label: 'Ind Group Rank', sortable: true },
        { key: 'rank_1_week_ago', label: 'Last Week', sortable: true },
        { key: 'rank_3_months_ago', label: '3 Mo Ago', sortable: true },
        { key: 'rank_6_months_ago', label: '6 Mo Ago', sortable: true },
        { key: 'ytd_change_percent', label: '% Chg YTD', sortable: true },
        { key: 'market_value', label: 'Ind Mkt Val (Bil)', sortable: true },
        { key: 'change_vs_last_week', label: 'Change v last week', sortable: true },
    ];

    const stockColumnDefinitions = [
        { key: 'symbol', label: 'Symbol', sortable: true },
        { key: 'company_name', label: 'Name', sortable: true },
        { key: 'rs_rating', label: 'RS Rating', sortable: true },
        { key: 'rs_rating_1_week_ago', label: '1W Ago', sortable: true },
        { key: 'rs_rating_4_weeks_ago', label: '4W Ago', sortable: true },
        { key: 'rs_rating_3_months_ago', label: '3M Ago', sortable: true },
        { key: 'rs_rating_6_months_ago', label: '6M Ago', sortable: true },
        { key: 'rs_rating_1_year_ago', label: '1Y Ago', sortable: true },
        { key: 'industry', label: 'Industry', sortable: true },
        { key: 'sub_industry', label: 'Sub Industry', sortable: true },
        { key: 'approval_with_controls', label: 'Shariah', sortable: true },
        { key: 'purge_amount', label: 'Purge Amt', sortable: true },
        { key: 'marginable_percent', label: 'Marginable%', sortable: true },
    ];

    useEffect(() => {
        async function fetchData() {
            try {
                const API_URL = API_BASE_URL;

                const res = await fetch(`${API_URL}/api/industry-groups/latest`, {
                    cache: 'no-store',
                    credentials: 'include'
                });

                if (!res.ok) throw new Error('Failed to fetch data');
                const jsonData = await res.json();
                setData(jsonData);

                if (jsonData.length > 0) {
                    let top = jsonData[0];
                    let worst = jsonData[0];

                    jsonData.forEach((item: IndustryGroup) => {
                        if (item.ytd_change_percent > top.ytd_change_percent) {
                            top = item;
                        }
                        if (item.ytd_change_percent < worst.ytd_change_percent) {
                            worst = item;
                        }
                    });

                    setStats({
                        topPerformer: { group: top.industry_group, change: top.ytd_change_percent },
                        worstPerformer: { group: worst.industry_group, change: worst.ytd_change_percent }
                    });
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load industry groups.');
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleSort = useCallback((key: string) => {
        setSortConfigs(prev => {
            const existingIndex = prev.findIndex(config => config.key === key);

            if (existingIndex === -1) {
                return [...prev, { key, direction: 'asc' }];
            }

            const existing = prev[existingIndex];
            if (existing.direction === 'asc') {
                const newConfigs = [...prev];
                newConfigs[existingIndex] = { ...existing, direction: 'desc' };
                return newConfigs;
            }

            return prev.filter((_, index) => index !== existingIndex);
        });
    }, []);

    const handleStockSort = useCallback((groupName: string, key: string) => {
        setStockSortConfigs(prev => {
            const currentSorts = prev[groupName] || [];
            const existingIndex = currentSorts.findIndex(config => config.key === key);

            if (existingIndex === -1) {
                return {
                    ...prev,
                    [groupName]: [...currentSorts, { key, direction: 'asc' }]
                };
            }

            const existing = currentSorts[existingIndex];
            if (existing.direction === 'asc') {
                const newSorts = [...currentSorts];
                newSorts[existingIndex] = { ...existing, direction: 'desc' };
                return { ...prev, [groupName]: newSorts };
            }

            const filteredSorts = currentSorts.filter((_, index) => index !== existingIndex);
            return { ...prev, [groupName]: filteredSorts };
        });
    }, []);

    const getSortClass = useCallback((key: string): string => {
        const index = sortConfigs.findIndex(config => config.key === key);
        if (index === -1) return 'cursor-pointer hover:bg-gray-50';

        const direction = sortConfigs[index].direction;
        return `cursor-pointer ${direction === 'asc' ? 'bg-blue-50' : 'bg-blue-50'}`;
    }, [sortConfigs]);

    const getStockSortClass = useCallback((groupName: string, key: string): string => {
        const currentSorts = stockSortConfigs[groupName] || [];
        const index = currentSorts.findIndex(config => config.key === key);
        if (index === -1) return 'cursor-pointer hover:bg-gray-50';

        const direction = currentSorts[index].direction;
        return `cursor-pointer ${direction === 'asc' ? 'bg-blue-50' : 'bg-blue-50'}`;
    }, [stockSortConfigs]);

    const checkRange = (value: any, minKey: keyof FilterState, maxKey: keyof FilterState, allowZero = false) => {
        const minValue = filters[minKey] as string;
        const maxValue = filters[maxKey] as string;
        const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;

        if (minValue && numValue < parseFloat(minValue)) return false;
        if (maxValue && numValue > parseFloat(maxValue)) return false;
        return true;
    };

    const checkStockRange = (value: any, minKey: keyof StockFilterState, maxKey: keyof StockFilterState) => {
        const minValue = stockFilters[minKey] as string;
        const maxValue = stockFilters[maxKey] as string;
        const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;

        if (minValue && numValue < parseFloat(minValue)) return false;
        if (maxValue && numValue > parseFloat(maxValue)) return false;
        return true;
    };

    const filteredData = useMemo(() => {
        let filtered = data.filter(item => {
            // Industry Filters
            if (filters.sector.length > 0 && !filters.sector.includes(item.sector)) return false;
            if (filters.industry_group.length > 0 && !filters.industry_group.includes(item.industry_group)) return false;
            if (filters.letter_grade.length > 0 && !filters.letter_grade.includes(item.letter_grade || '')) return false;

            // Range Filters
            if (!checkRange(item.number_of_stocks, 'number_of_stocks_min', 'number_of_stocks_max')) return false;
            if (!checkRange(item.rank, 'rank_min', 'rank_max')) return false;
            if (!checkRange(item.rank_1_week_ago, 'rank_1_week_ago_min', 'rank_1_week_ago_max', true)) return false;
            if (!checkRange(item.rank_3_months_ago, 'rank_3_months_ago_min', 'rank_3_months_ago_max', true)) return false;
            if (!checkRange(item.rank_6_months_ago, 'rank_6_months_ago_min', 'rank_6_months_ago_max', true)) return false;
            if (!checkRange(item.ytd_change_percent, 'ytd_change_percent_min', 'ytd_change_percent_max', true)) return false;
            if (!checkRange(item.market_value, 'market_value_min', 'market_value_max')) return false;
            if (!checkRange(item.change_vs_last_week, 'change_vs_last_week_min', 'change_vs_last_week_max', true)) return false;

            return true;
        });

        // Apply sorting
        if (sortConfigs.length > 0) {
            filtered = [...filtered].sort((a, b) => {
                for (const config of sortConfigs) {
                    const getValue = (item: IndustryGroup, key: string): any => {
                        switch (key) {
                            case 'display_order':
                                return 0;
                            case 'rank':
                                return item.rank;
                            case 'industry_group':
                                return item.industry_group.toLowerCase();
                            case 'number_of_stocks':
                                return item.number_of_stocks;
                            case 'rank_1_week_ago':
                                return item.rank_1_week_ago || 999;
                            case 'rank_3_months_ago':
                                return item.rank_3_months_ago || 999;
                            case 'rank_6_months_ago':
                                return item.rank_6_months_ago || 999;
                            case 'ytd_change_percent':
                                return item.ytd_change_percent;
                            case 'market_value':
                                return item.market_value || 0;
                            case 'change_vs_last_week':
                                return item.change_vs_last_week || 0;
                            default:
                                return 0;
                        }
                    };

                    const aValue = getValue(a, config.key);
                    const bValue = getValue(b, config.key);

                    if (aValue === bValue) continue;

                    if (typeof aValue === 'string' && typeof bValue === 'string') {
                        const comparison = aValue.localeCompare(bValue);
                        if (comparison !== 0) {
                            return config.direction === 'asc' ? comparison : -comparison;
                        }
                    } else {
                        const aNum = Number(aValue);
                        const bNum = Number(bValue);
                        if (aNum !== bNum) {
                            return config.direction === 'asc' ? aNum - bNum : bNum - aNum;
                        }
                    }
                }
                return 0;
            });
        }

        return filtered;
    }, [data, filters, sortConfigs]);

    const getFilteredStocks = useCallback((groupName: string) => {
        const stocks = stocksCache[groupName] || [];
        if (!stocks) return [];

        let filtered = stocks.filter(stock => {
            if (filters.industry.length > 0 && !filters.industry.includes(stock.industry)) return false;
            if (filters.sub_industry.length > 0 && !filters.sub_industry.includes(stock.sub_industry)) return false;
            if (stockFilters.symbol && !stock.symbol.toLowerCase().includes(stockFilters.symbol.toLowerCase())) return false;
            if (stockFilters.company_name && !stock.company_name.toLowerCase().includes(stockFilters.company_name.toLowerCase())) return false;
            if (!checkStockRange(stock.rs_rating, 'rs_rating_min', 'rs_rating_max')) return false;
            if (!checkStockRange(stock.rs_rating_1_week_ago, 'rs_rating_1_week_ago_min', 'rs_rating_1_week_ago_max')) return false;
            if (!checkStockRange(stock.rs_rating_4_weeks_ago, 'rs_rating_4_weeks_ago_min', 'rs_rating_4_weeks_ago_max')) return false;
            if (!checkStockRange(stock.rs_rating_3_months_ago, 'rs_rating_3_months_ago_min', 'rs_rating_3_months_ago_max')) return false;
            if (!checkStockRange(stock.rs_rating_6_months_ago, 'rs_rating_6_months_ago_min', 'rs_rating_6_months_ago_max')) return false;
            if (!checkStockRange(stock.rs_rating_1_year_ago, 'rs_rating_1_year_ago_min', 'rs_rating_1_year_ago_max')) return false;

            // RS Momentum Filters — each active key must pass (AND logic)
            for (const key of rsMomentumFilters) {
                const option = RS_MOMENTUM_OPTIONS.find(o => o.key === key);
                if (option && !option.check(stock)) return false;
            }

            if (stockFilters.approval_with_controls.length > 0) {
                const stockShariah = formatShariahApproval(stock.approval_with_controls) || '';
                if (!stockFilters.approval_with_controls.includes(stockShariah)) return false;
            }
            if (!checkStockRange(stock.purge_amount, 'purge_amount_min', 'purge_amount_max')) return false;
            if (!checkStockRange(stock.marginable_percent, 'marginable_percent_min', 'marginable_percent_max')) return false;

            return true;
        });

        const currentSorts = stockSortConfigs[groupName] || [];
        // Default sort: rs_rating descending
        const effectiveSorts = currentSorts.length > 0 ? currentSorts : [{ key: 'rs_rating', direction: 'desc' as const }];

        filtered = [...filtered].sort((a, b) => {
            for (const config of effectiveSorts) {
                const getValue = (item: StockSummary, key: string): any => {
                    switch (key) {
                        case 'symbol': return item.symbol.toLowerCase();
                        case 'company_name': return item.company_name.toLowerCase();
                        case 'rs_rating': return item.rs_rating ?? 0;
                        case 'rs_rating_1_week_ago': return item.rs_rating_1_week_ago ?? 0;
                        case 'rs_rating_4_weeks_ago': return item.rs_rating_4_weeks_ago ?? 0;
                        case 'rs_rating_3_months_ago': return item.rs_rating_3_months_ago ?? 0;
                        case 'rs_rating_6_months_ago': return item.rs_rating_6_months_ago ?? 0;
                        case 'rs_rating_1_year_ago': return item.rs_rating_1_year_ago ?? 0;
                        case 'industry': return item.industry.toLowerCase();
                        case 'sub_industry': return item.sub_industry.toLowerCase();
                        case 'approval_with_controls': return (item.approval_with_controls || '').toLowerCase();
                        case 'purge_amount': return item.purge_amount ?? 0;
                        case 'marginable_percent': return item.marginable_percent ?? 0;
                        default: return 0;
                    }
                };
                const aValue = getValue(a, config.key);
                const bValue = getValue(b, config.key);
                if (aValue === bValue) continue;
                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    const comparison = aValue.localeCompare(bValue);
                    if (comparison !== 0) return config.direction === 'asc' ? comparison : -comparison;
                } else {
                    const aNum = Number(aValue);
                    const bNum = Number(bValue);
                    if (aNum !== bNum) return config.direction === 'asc' ? aNum - bNum : bNum - aNum;
                }
            }
            return 0;
        });

        return filtered;
    }, [stocksCache, stockFilters, stockSortConfigs, filters.industry, filters.sub_industry, rsMomentumFilters]);

    const clearFilter = useCallback((key: keyof FilterState) => {
        if (Array.isArray(filters[key])) {
            setFilters(prev => ({ ...prev, [key]: [] }));
        } else if (key.endsWith('_min') || key.endsWith('_max')) {
            const baseKey = key.replace(/(_min|_max)$/, '');
            setFilters(prev => ({
                ...prev,
                [`${baseKey}_min`]: '',
                [`${baseKey}_max`]: ''
            }));
        } else {
            setFilters(prev => ({ ...prev, [key]: '' }));
        }
    }, [filters]);

    const clearAllFilters = useCallback(() => {
        setFilters({
            sector: [],
            industry_group: [],
            industry: [],
            sub_industry: [],
            number_of_stocks_min: '',
            number_of_stocks_max: '',
            rank_min: '',
            rank_max: '',
            rank_1_week_ago_min: '',
            rank_1_week_ago_max: '',
            rank_3_months_ago_min: '',
            rank_3_months_ago_max: '',
            rank_6_months_ago_min: '',
            rank_6_months_ago_max: '',
            ytd_change_percent_min: '',
            ytd_change_percent_max: '',
            market_value_min: '',
            market_value_max: '',
            change_vs_last_week_min: '',
            change_vs_last_week_max: '',
            letter_grade: [],
        });

        setStockFilters({
            symbol: '',
            company_name: '',
            rs_rating_min: '',
            rs_rating_max: '',
            rs_rating_1_week_ago_min: '',
            rs_rating_1_week_ago_max: '',
            rs_rating_4_weeks_ago_min: '',
            rs_rating_4_weeks_ago_max: '',
            rs_rating_3_months_ago_min: '',
            rs_rating_3_months_ago_max: '',
            rs_rating_6_months_ago_min: '',
            rs_rating_6_months_ago_max: '',
            rs_rating_1_year_ago_min: '',
            rs_rating_1_year_ago_max: '',
            approval_with_controls: [],
            purge_amount_min: '',
            purge_amount_max: '',
            marginable_percent_min: '',
            marginable_percent_max: '',
        });

        setSortConfigs([]);
        setStockSortConfigs({});
        setRsMomentumFilters([]);
    }, []);

    const toggleGroup = async (groupName: string) => {
        const newExpanded = new Set(expandedGroups);
        if (newExpanded.has(groupName)) {
            newExpanded.delete(groupName);
            setExpandedGroups(newExpanded);
        } else {
            newExpanded.add(groupName);
            setExpandedGroups(newExpanded);
            if (!stocksCache[groupName]) {
                await fetchGroupStocks(groupName);
            }
        }
    };

    const expandAllGroups = async () => {
        const allGroups = filteredData.map(item => item.industry_group);
        const newExpanded = new Set(allGroups);
        setExpandedGroups(newExpanded);
        // Fetch stocks for groups not yet cached
        const toFetch = allGroups.filter(g => !stocksCache[g] && !loadingStocks.has(g));
        await Promise.all(toFetch.map(g => fetchGroupStocks(g)));
    };

    const collapseAllGroups = () => {
        setExpandedGroups(new Set());
    };

    const fetchGroupStocks = async (groupName: string) => {
        if (loadingStocks.has(groupName)) return;

        setLoadingStocks(prev => new Set(prev).add(groupName));
        try {
            const API_URL = API_BASE_URL;
            const encodedGroup = encodeURIComponent(groupName);

            const res = await fetch(`${API_URL}/api/industry-groups/stocks?industry_group=${encodedGroup}`, {
                cache: 'no-store',
                credentials: 'include'
            });

            if (res.ok) {
                const stocks = await res.json();
                setStocksCache(prev => ({ ...prev, [groupName]: stocks }));
            }
        } catch (err) {
            console.error(`Failed to fetch stocks for group ${groupName}`, err);
        } finally {
            setLoadingStocks(prev => {
                const next = new Set(prev);
                next.delete(groupName);
                return next;
            });
        }
    };

    const formatNumber = (num: number, decimals = 2) => {
        if (num === undefined || num === null) return '-';
        return num.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    };

    const getChangeColor = (val: number) => {
        if (val > 0) return 'text-green-600 font-medium';
        if (val < 0) return 'text-red-600 font-medium';
        return '';
    };

    const activeFilters = useMemo(() => {
        const active: Array<{ label: string; value: string; key: keyof FilterState }> = [];

        if (filters.sector.length > 0) active.push({ label: 'Sectors', value: filters.sector.join(', '), key: 'sector' });
        if (filters.industry_group.length > 0) active.push({ label: 'Industry Groups', value: filters.industry_group.join(', '), key: 'industry_group' });
        if (filters.industry.length > 0) active.push({ label: 'Industries', value: filters.industry.join(', '), key: 'industry' });
        if (filters.sub_industry.length > 0) active.push({ label: 'Sub Industries', value: filters.sub_industry.join(', '), key: 'sub_industry' });
        if (filters.letter_grade.length > 0) active.push({ label: 'Letter Grade', value: filters.letter_grade.join(', '), key: 'letter_grade' });

        if (filters.number_of_stocks_min || filters.number_of_stocks_max) active.push({ label: 'Num Stocks', value: `${filters.number_of_stocks_min || 'Min'} - ${filters.number_of_stocks_max || 'Max'}`, key: 'number_of_stocks_min' });
        if (filters.rank_min || filters.rank_max) active.push({ label: 'Rank', value: `${filters.rank_min || 'Min'} - ${filters.rank_max || 'Max'}`, key: 'rank_min' });
        if (filters.rank_1_week_ago_min || filters.rank_1_week_ago_max) active.push({ label: 'Rank 1W Ago', value: `${filters.rank_1_week_ago_min || 'Min'} - ${filters.rank_1_week_ago_max || 'Max'}`, key: 'rank_1_week_ago_min' });
        if (filters.rank_3_months_ago_min || filters.rank_3_months_ago_max) active.push({ label: 'Rank 3M Ago', value: `${filters.rank_3_months_ago_min || 'Min'} - ${filters.rank_3_months_ago_max || 'Max'}`, key: 'rank_3_months_ago_min' });
        if (filters.rank_6_months_ago_min || filters.rank_6_months_ago_max) active.push({ label: 'Rank 6M Ago', value: `${filters.rank_6_months_ago_min || 'Min'} - ${filters.rank_6_months_ago_max || 'Max'}`, key: 'rank_6_months_ago_min' });
        if (filters.ytd_change_percent_min || filters.ytd_change_percent_max) active.push({ label: '% Chg YTD', value: `${filters.ytd_change_percent_min || 'Min'} - ${filters.ytd_change_percent_max || 'Max'}`, key: 'ytd_change_percent_min' });
        if (filters.market_value_min || filters.market_value_max) active.push({ label: 'Market Value', value: `${filters.market_value_min || 'Min'} - ${filters.market_value_max || 'Max'}`, key: 'market_value_min' });
        if (filters.change_vs_last_week_min || filters.change_vs_last_week_max) active.push({ label: 'Change v last week', value: `${filters.change_vs_last_week_min || 'Min'} - ${filters.change_vs_last_week_max || 'Max'}`, key: 'change_vs_last_week_min' });

        return active;
    }, [filters]);

    const exportData = (format: 'csv' | 'xls' | 'xlsx' | 'txt' | 'pdf') => {
        if (filteredData.length === 0) return;

        // Group rows and tables
        const groupHeaders = [
            'Order', 'Letter Grade', 'Industry Group', 'Sector', 'Num Stocks',
            'Ind Group Rank', 'Last Week', '3 Mo Ago', '6 Mo Ago',
            '% Chg YTD', 'Ind Mkt Val (Bil)', 'Change v Last Week'
        ];

        const groupRows = filteredData.map((item, index) => [
            index + 1,
            item.letter_grade || '',
            item.industry_group,
            item.sector,
            item.number_of_stocks,
            item.rank ?? '',
            item.rank_1_week_ago ?? '-',
            item.rank_3_months_ago ?? '-',
            item.rank_6_months_ago ?? '-',
            item.ytd_change_percent != null ? item.ytd_change_percent.toFixed(2) : '-',
            item.market_value ? item.market_value.toFixed(2) : '-',
            item.change_vs_last_week ?? '-'
        ]);

        const stockHeaders = [
            'Symbol', 'Name', 'RS Rating',
            '1W Ago', '4W Ago', '3M Ago', '6M Ago', '1Y Ago',
            'Industry', 'Sub Industry',
            'Shariah Status', 'Purge Amount', 'Marginable %'
        ];

        const expandedStockTables: { title: string; rows: any[][] }[] = [];

        filteredData.forEach(item => {
            if (expandedGroups.has(item.industry_group) && stocksCache[item.industry_group]) {
                const stocks = getFilteredStocks(item.industry_group);
                if (stocks.length > 0) {
                    const sRows = stocks.map(stock => [
                        stock.symbol,
                        stock.company_name,
                        stock.rs_rating ?? '-',
                        stock.rs_rating_1_week_ago ?? '-',
                        stock.rs_rating_4_weeks_ago ?? '-',
                        stock.rs_rating_3_months_ago ?? '-',
                        stock.rs_rating_6_months_ago ?? '-',
                        stock.rs_rating_1_year_ago ?? '-',
                        stock.industry,
                        stock.sub_industry,
                        formatShariahApproval(stock.approval_with_controls),
                        formatPurgeAmount(stock.purge_amount),
                        formatMarginable(stock.marginable_percent)
                    ]);
                    expandedStockTables.push({
                        title: `Stocks in ${item.industry_group}`,
                        rows: sRows
                    });
                }
            }
        });

        if (format === 'pdf') {
            import('jspdf').then(({ default: jsPDF }) => {
                import('jspdf-autotable').then(({ default: autoTable }) => {
                    const doc = new jsPDF({ orientation: 'landscape' });

                    doc.setFontSize(14);
                    doc.text("Industry Groups Ranking", 14, 15);

                    autoTable(doc, {
                        startY: 20,
                        head: [groupHeaders],
                        body: groupRows,
                        theme: 'striped',
                        styles: { fontSize: 8 },
                        headStyles: { fillColor: [41, 128, 185] }
                    });

                    expandedStockTables.forEach(table => {
                        autoTable(doc, {
                            margin: { top: 20 },
                            head: [[table.title]],
                            body: [],
                            theme: 'plain',
                            styles: { fontSize: 10, fontStyle: 'bold', fillColor: [240, 240, 240] }
                        });
                        autoTable(doc, {
                            head: [stockHeaders],
                            body: table.rows,
                            theme: 'striped',
                            styles: { fontSize: 8 },
                            headStyles: { fillColor: [52, 73, 94] }
                        });
                    });

                    doc.save(`industry_groups_${new Date().toISOString().split('T')[0]}.pdf`);
                });
            });
            return;
        }

        // For Excel/CSV/TXT: build a massive combined 2D array
        const allSheetRows: any[][] = [];
        allSheetRows.push(groupHeaders);
        groupRows.forEach(r => allSheetRows.push(r));

        expandedStockTables.forEach(table => {
            allSheetRows.push([]); // blank line
            allSheetRows.push([table.title]); // title
            allSheetRows.push(stockHeaders); // cols
            table.rows.forEach(r => allSheetRows.push(r));
        });

        if (format === 'csv' || format === 'txt') {
            const sep = format === 'csv' ? ',' : '\t';
            const esc = (val: any) => {
                if (val === null || val === undefined) return '';
                const s = String(val);
                if (s.includes(sep) || s.includes('"') || s.includes('\n')) {
                    return `"${s.replace(/"/g, '""')}"`;
                }
                return s;
            };

            const content = allSheetRows.map(row => row.map(esc).join(sep)).join('\n');
            const blob = new Blob([content], { type: format === 'csv' ? 'text/csv;charset=utf-8;' : 'text/plain;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `industry_groups_${new Date().toISOString().split('T')[0]}.${format}`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return;
        }

        // XLS / XLSX
        if (format === 'xls' || format === 'xlsx') {
            const worksheet = XLSX.utils.aoa_to_sheet(allSheetRows);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Industry Groups");
            XLSX.writeFile(workbook, `industry_groups_${new Date().toISOString().split('T')[0]}.${format}`);
            return;
        }
    };

    if (isLoading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <h2 className="mt-4 text-lg font-semibold text-gray-700">Loading Industry Groups...</h2>
                <p className="text-gray-500">Please wait</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center text-red-600">
                <h2 className="text-lg font-semibold">Error fetching data</h2>
                <p>{error}</p>
            </div>
        </div>
    );

    if (data.length === 0) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center text-gray-500">
                <h2 className="text-lg font-semibold">No Data Available</h2>
                <p>No industry group data found</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <style jsx global>{`
                .custom-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: #cbd5e0 #f7fafc;
                }

                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                    height: 6px;
                }

                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f7fafc;
                    border-radius: 3px;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #cbd5e0;
                    border-radius: 3px;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: #a0aec0;
                }
            `}</style>

            <div className="flex relative">
                {/* Sidebar */}
                <div
                    className={`
                        bg-white border-r border-gray-200 h-[calc(100vh-64px)] flex flex-col transition-all duration-300 ease-in-out flex-shrink-0
                        ${isSidebarOpen ? 'w-80 opacity-100' : 'w-0 overflow-hidden opacity-0 pointer-events-none'}
                    `}
                >
                    <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 bg-white relative">
                        <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            className="w-full px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2 transition-all"
                        >
                            <Download className="w-4 h-4" />
                            <span>Export Data</span>
                        </button>

                        {showExportMenu && (
                            <div className="absolute top-full left-4 right-4 mt-1 bg-white rounded-md shadow-lg z-50 border border-gray-200 py-1">
                                <button
                                    onClick={() => { exportData('pdf'); setShowExportMenu(false); }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                                >
                                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                    <span>PDF Document (.pdf)</span>
                                </button>
                                <button
                                    onClick={() => { exportData('csv'); setShowExportMenu(false); }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                                >
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    <span>comma delimited (.csv)</span>
                                </button>
                                <button
                                    onClick={() => { exportData('xls'); setShowExportMenu(false); }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                                >
                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                    <span>excel 97-2003 (.xls)</span>
                                </button>
                                <button
                                    onClick={() => { exportData('xlsx'); setShowExportMenu(false); }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                                >
                                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                                    <span>excel (.xlsx)</span>
                                </button>
                                <button
                                    onClick={() => { exportData('txt'); setShowExportMenu(false); }}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                                >
                                    <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                                    <span>Text (.txt)</span>
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {/* INDUSTRY FILTERS SECTION - 4 filters together */}
                        <FilterAccordion title="INDUSTRY FILTERS" defaultOpen={true} collapseSignal={collapseSignal}>
                            <div className="space-y-3">
                                <CustomMultiSelect
                                    options={filterOptions.sectors}
                                    selected={filters.sector}
                                    onChange={(value) => setFilters(prev => ({ ...prev, sector: value }))}
                                    placeholder="Sectors"
                                    icon={Filter}
                                />
                                <CustomMultiSelect
                                    options={filterOptions.industryGroups}
                                    selected={filters.industry_group}
                                    onChange={(value) => setFilters(prev => ({ ...prev, industry_group: value }))}
                                    placeholder="Industry Groups"
                                    icon={Filter}
                                />
                                <CustomMultiSelect
                                    options={filterOptions.industries}
                                    selected={filters.industry}
                                    onChange={(value) => setFilters(prev => ({ ...prev, industry: value }))}
                                    placeholder="Industries"
                                    icon={Filter}
                                />
                                <CustomMultiSelect
                                    options={filterOptions.subIndustries}
                                    selected={filters.sub_industry}
                                    onChange={(value) => setFilters(prev => ({ ...prev, sub_industry: value }))}
                                    placeholder="Sub Industries"
                                    icon={Filter}
                                />
                            </div>
                        </FilterAccordion>

                        {/* MAIN TABLE FILTERS - Each column has its own filter */}
                        <FilterAccordion title="MAIN TABLE FILTERS" defaultOpen={false} collapseSignal={collapseSignal}>
                            <div className="space-y-4">
                                {/* Letter Grade Filter */}
                                <CustomMultiSelect
                                    options={letterGradeOptions}
                                    selected={filters.letter_grade}
                                    onChange={(value) => setFilters(prev => ({ ...prev, letter_grade: value }))}
                                    placeholder="Letter Grade"
                                    icon={Filter}
                                />

                                {/* Number of Stocks */}
                                <RangeFilter
                                    label="Number of Stocks"
                                    minValue={filters.number_of_stocks_min}
                                    maxValue={filters.number_of_stocks_max}
                                    onMinChange={(value) => setFilters(prev => ({ ...prev, number_of_stocks_min: value }))}
                                    onMaxChange={(value) => setFilters(prev => ({ ...prev, number_of_stocks_max: value }))}
                                />

                                {/* Rank */}
                                <RangeFilter
                                    label="Rank"
                                    minValue={filters.rank_min}
                                    maxValue={filters.rank_max}
                                    onMinChange={(value) => setFilters(prev => ({ ...prev, rank_min: value }))}
                                    onMaxChange={(value) => setFilters(prev => ({ ...prev, rank_max: value }))}
                                />

                                {/* Rank 1 Week Ago */}
                                <RangeFilter
                                    label="Rank 1 Week Ago"
                                    minValue={filters.rank_1_week_ago_min}
                                    maxValue={filters.rank_1_week_ago_max}
                                    onMinChange={(value) => setFilters(prev => ({ ...prev, rank_1_week_ago_min: value }))}
                                    onMaxChange={(value) => setFilters(prev => ({ ...prev, rank_1_week_ago_max: value }))}
                                />

                                {/* Rank 3 Months Ago */}
                                <RangeFilter
                                    label="Rank 3 Months Ago"
                                    minValue={filters.rank_3_months_ago_min}
                                    maxValue={filters.rank_3_months_ago_max}
                                    onMinChange={(value) => setFilters(prev => ({ ...prev, rank_3_months_ago_min: value }))}
                                    onMaxChange={(value) => setFilters(prev => ({ ...prev, rank_3_months_ago_max: value }))}
                                />

                                {/* Rank 6 Months Ago */}
                                <RangeFilter
                                    label="Rank 6 Months Ago"
                                    minValue={filters.rank_6_months_ago_min}
                                    maxValue={filters.rank_6_months_ago_max}
                                    onMinChange={(value) => setFilters(prev => ({ ...prev, rank_6_months_ago_min: value }))}
                                    onMaxChange={(value) => setFilters(prev => ({ ...prev, rank_6_months_ago_max: value }))}
                                />

                                {/* YTD Change % */}
                                <RangeFilter
                                    label="YTD Change %"
                                    minValue={filters.ytd_change_percent_min}
                                    maxValue={filters.ytd_change_percent_max}
                                    onMinChange={(value) => setFilters(prev => ({ ...prev, ytd_change_percent_min: value }))}
                                    onMaxChange={(value) => setFilters(prev => ({ ...prev, ytd_change_percent_max: value }))}
                                />

                                {/* Market Value */}
                                <RangeFilter
                                    label="Market Value (Bil)"
                                    minValue={filters.market_value_min}
                                    maxValue={filters.market_value_max}
                                    onMinChange={(value) => setFilters(prev => ({ ...prev, market_value_min: value }))}
                                    onMaxChange={(value) => setFilters(prev => ({ ...prev, market_value_max: value }))}
                                />

                                {/* Change vs Last Week */}
                                <RangeFilter
                                    label="Change vs Last Week"
                                    minValue={filters.change_vs_last_week_min}
                                    maxValue={filters.change_vs_last_week_max}
                                    onMinChange={(value) => setFilters(prev => ({ ...prev, change_vs_last_week_min: value }))}
                                    onMaxChange={(value) => setFilters(prev => ({ ...prev, change_vs_last_week_max: value }))}
                                />
                            </div>
                        </FilterAccordion>

                        {/* STOCKS TABLE FILTERS - Appears when a row is expanded */}
                        <FilterAccordion title="STOCKS TABLE FILTERS" defaultOpen={false} collapseSignal={collapseSignal}>
                            <div className="space-y-4">
                                {/* Symbol Filter */}
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-medium text-gray-600">Symbol</label>
                                    <input
                                        type="text"
                                        placeholder="Search symbol..."
                                        value={stockFilters.symbol}
                                        onChange={(e) => setStockFilters(prev => ({ ...prev, symbol: e.target.value }))}
                                        className="w-full px-2 py-1 text-[10px] bg-gray-50 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all outline-none"
                                    />
                                </div>

                                {/* Company Name Filter */}
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-medium text-gray-600">Company Name</label>
                                    <input
                                        type="text"
                                        placeholder="Search company..."
                                        value={stockFilters.company_name}
                                        onChange={(e) => setStockFilters(prev => ({ ...prev, company_name: e.target.value }))}
                                        className="w-full px-2 py-1 text-[10px] bg-gray-50 border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all outline-none"
                                    />
                                </div>

                                {/* RS Rating */}
                                <RangeFilter
                                    label="RS Rating"
                                    minValue={stockFilters.rs_rating_min}
                                    maxValue={stockFilters.rs_rating_max}
                                    onMinChange={(value) => setStockFilters(prev => ({ ...prev, rs_rating_min: value }))}
                                    onMaxChange={(value) => setStockFilters(prev => ({ ...prev, rs_rating_max: value }))}
                                />

                                {/* RS Rating 1 Week Ago */}
                                <RangeFilter
                                    label="RS Rating 1 Week Ago"
                                    minValue={stockFilters.rs_rating_1_week_ago_min}
                                    maxValue={stockFilters.rs_rating_1_week_ago_max}
                                    onMinChange={(value) => setStockFilters(prev => ({ ...prev, rs_rating_1_week_ago_min: value }))}
                                    onMaxChange={(value) => setStockFilters(prev => ({ ...prev, rs_rating_1_week_ago_max: value }))}
                                />

                                {/* RS Rating 4 Weeks Ago */}
                                <RangeFilter
                                    label="RS Rating 4 Weeks Ago"
                                    minValue={stockFilters.rs_rating_4_weeks_ago_min}
                                    maxValue={stockFilters.rs_rating_4_weeks_ago_max}
                                    onMinChange={(value) => setStockFilters(prev => ({ ...prev, rs_rating_4_weeks_ago_min: value }))}
                                    onMaxChange={(value) => setStockFilters(prev => ({ ...prev, rs_rating_4_weeks_ago_max: value }))}
                                />

                                {/* RS Rating 3 Months Ago */}
                                <RangeFilter
                                    label="RS Rating 3 Months Ago"
                                    minValue={stockFilters.rs_rating_3_months_ago_min}
                                    maxValue={stockFilters.rs_rating_3_months_ago_max}
                                    onMinChange={(value) => setStockFilters(prev => ({ ...prev, rs_rating_3_months_ago_min: value }))}
                                    onMaxChange={(value) => setStockFilters(prev => ({ ...prev, rs_rating_3_months_ago_max: value }))}
                                />

                                {/* RS Rating 6 Months Ago */}
                                <RangeFilter
                                    label="RS Rating 6 Months Ago"
                                    minValue={stockFilters.rs_rating_6_months_ago_min}
                                    maxValue={stockFilters.rs_rating_6_months_ago_max}
                                    onMinChange={(value) => setStockFilters(prev => ({ ...prev, rs_rating_6_months_ago_min: value }))}
                                    onMaxChange={(value) => setStockFilters(prev => ({ ...prev, rs_rating_6_months_ago_max: value }))}
                                />

                                {/* RS Rating 1 Year Ago */}
                                <RangeFilter
                                    label="RS Rating 1 Year Ago"
                                    minValue={stockFilters.rs_rating_1_year_ago_min}
                                    maxValue={stockFilters.rs_rating_1_year_ago_max}
                                    onMinChange={(value) => setStockFilters(prev => ({ ...prev, rs_rating_1_year_ago_min: value }))}
                                    onMaxChange={(value) => setStockFilters(prev => ({ ...prev, rs_rating_1_year_ago_max: value }))}
                                />

                                {/* RS MOMENTUM TREND FILTERS */}
                                <div className="pt-2 border-t border-gray-100">
                                    <h4 className="text-[10px] font-bold text-gray-400 mb-2 tracking-wider uppercase">RS Momentum Trend</h4>
                                    <div className="space-y-1.5">
                                        {RS_MOMENTUM_OPTIONS.map(option => {
                                            const isChecked = rsMomentumFilters.includes(option.key);
                                            return (
                                                <label
                                                    key={option.key}
                                                    className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors text-[11px]
                                                        ${isChecked ? 'bg-green-50 text-green-800 border border-green-200' : 'hover:bg-gray-50 text-gray-700 border border-transparent'}`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => toggleRsMomentumFilter(option.key)}
                                                        className="w-3.5 h-3.5 accent-green-600 flex-shrink-0"
                                                    />
                                                    <span className="font-medium">{option.label}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-gray-100">
                                    <h4 className="text-[10px] font-bold text-gray-400 mb-3 tracking-wider uppercase">Shariah & Margin</h4>

                                    <div className="space-y-4">
                                        <CustomMultiSelect
                                            options={['Compliant', 'Non-compliant', 'Brokerage Compliant']}
                                            selected={stockFilters.approval_with_controls}
                                            onChange={(value) => setStockFilters(prev => ({ ...prev, approval_with_controls: value }))}
                                            placeholder="Shariah Status"
                                            icon={Filter}
                                        />

                                        <RangeFilter
                                            label="Purge Amount"
                                            minValue={stockFilters.purge_amount_min}
                                            maxValue={stockFilters.purge_amount_max}
                                            onMinChange={(value) => setStockFilters(prev => ({ ...prev, purge_amount_min: value }))}
                                            onMaxChange={(value) => setStockFilters(prev => ({ ...prev, purge_amount_max: value }))}
                                        />

                                        <RangeFilter
                                            label="Marginable %"
                                            minValue={stockFilters.marginable_percent_min}
                                            maxValue={stockFilters.marginable_percent_max}
                                            onMinChange={(value) => setStockFilters(prev => ({ ...prev, marginable_percent_min: value }))}
                                            onMaxChange={(value) => setStockFilters(prev => ({ ...prev, marginable_percent_max: value }))}
                                        />
                                    </div>
                                </div>
                            </div>
                        </FilterAccordion>
                    </div>

                    {/* Sidebar Footer */}
                    <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200 bg-white">
                        <div className="flex flex-col space-y-2">
                            <button
                                onClick={expandAllGroups}
                                className="w-full px-4 py-2.5 text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg transition-all flex items-center justify-center space-x-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                </svg>
                                <span>Expand All Groups</span>
                            </button>

                            <button
                                onClick={collapseAllGroups}
                                className="w-full px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all flex items-center justify-center space-x-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                <span>Collapse All Groups</span>
                            </button>

                            <button
                                onClick={clearAllFilters}
                                className="w-full px-4 py-2.5 text-sm font-semibold text-red-600 bg-white border border-red-200 hover:bg-red-50 rounded-lg transition-all flex items-center justify-center space-x-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span>Reset All Filters</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar Toggle Button - Center Edge */}
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="absolute top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-5 h-14 bg-white border border-gray-200 border-l-0 rounded-r-md shadow-sm text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-all duration-300 ease-in-out cursor-pointer outline-none focus:ring-0"
                    style={{ left: isSidebarOpen ? '320px' : '0px' }}
                    title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
                >
                    {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>

                {/* Main Content */}
                <div className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden">
                    {/* Header */}
                    <div className="bg-white border-b border-gray-200 px-4 py-2 flex-shrink-0">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium text-gray-700">
                                        Industry Groups: <span className="font-bold">{filteredData.length}</span> groups
                                    </span>
                                    {activeFilters.length > 0 && (
                                        <span className="text-sm text-blue-600">• {activeFilters.length} filters active</span>
                                    )}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {data.length > 0 ? data[0].date : '-'}
                                </div>
                            </div>
                        </div>

                        {/* Active Filters */}
                        {(activeFilters.length > 0 || rsMomentumFilters.length > 0) && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {activeFilters.map((filter, index) => (
                                    <ActiveFilterBadge
                                        key={index}
                                        label={filter.label}
                                        value={filter.value}
                                        onRemove={() => clearFilter(filter.key)}
                                    />
                                ))}
                                {rsMomentumFilters.map(key => {
                                    const option = RS_MOMENTUM_OPTIONS.find(o => o.key === key);
                                    if (!option) return null;
                                    return (
                                        <span key={key} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 border border-green-300">
                                            {option.label}
                                            <button onClick={() => toggleRsMomentumFilter(key)} className="ml-1 text-green-600 hover:text-green-900">×</button>
                                        </span>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Stats Cards */}
                    <div className="px-4 py-4 border-b border-gray-200 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">Top Performer</p>
                                        <p className="text-lg font-bold text-gray-900 truncate">
                                            {stats.topPerformer.group}
                                        </p>
                                        <p className="text-sm text-green-600 font-medium">
                                            +{formatNumber(stats.topPerformer.change)}%
                                        </p>
                                    </div>
                                    <TrendingUp className="w-8 h-8 text-green-500" />
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">Worst Performer</p>
                                        <p className="text-lg font-bold text-gray-900 truncate">
                                            {stats.worstPerformer.group}
                                        </p>
                                        <p className="text-sm text-red-600 font-medium">
                                            {formatNumber(stats.worstPerformer.change)}%
                                        </p>
                                    </div>
                                    <TrendingDown className="w-8 h-8 text-red-500" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Table */}
                    <div className="flex-1 overflow-auto border-t border-gray-200 bg-white">
                        <table className="min-w-full bg-white text-sm border-separate border-spacing-0">
                            <thead className="bg-gray-50 sticky top-0 z-40 shadow-sm">
                                <tr>
                                    <th className="px-4 py-3 w-8"></th>
                                    {columnDefinitions.map((col) => {
                                        const sortIndex = sortConfigs.findIndex(config => config.key === col.key);
                                        const isSorted = sortIndex !== -1;
                                        const sortPriority = sortIndex + 1;
                                        const sortDir = isSorted ? sortConfigs[sortIndex].direction : null;

                                        return (
                                            <th
                                                key={col.key}
                                                className={`
                                                    px-4 py-3 font-medium text-gray-600 cursor-pointer 
                                                    hover:bg-gray-100 transition-colors whitespace-nowrap
                                                    ${getSortClass(col.key)}
                                                    ${col.key.includes('rank') || col.key === 'number_of_stocks' || col.key === 'market_value' ? 'text-center' : ''}
                                                    ${col.key === 'ytd_change_percent' || col.key === 'market_value' ? 'text-right' : ''}
                                                    ${isSorted ? 'bg-blue-50 text-blue-900 border-b-2 border-b-blue-500' : ''}
                                                `}
                                                onClick={() => col.sortable && handleSort(col.key)}
                                            >
                                                <div className={`flex items-center ${col.key === 'ytd_change_percent' || col.key === 'market_value' ? 'justify-end' : col.key.includes('rank') || col.key === 'number_of_stocks' ? 'justify-center' : 'justify-start'}`}>
                                                    <span className="font-semibold">{col.label}</span>
                                                    {col.sortable && (
                                                        <div className="flex flex-col ml-1">
                                                            {isSorted ? (
                                                                <span className="text-xs font-bold">
                                                                    {sortDir === 'asc' ? '▲' : '▼'}
                                                                </span>
                                                            ) : (
                                                                <span className="text-[10px] text-gray-400 opacity-50 block leading-[8px]">
                                                                    ▲<br />▼
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                    {isSorted && (
                                                        <span className="ml-1 inline-flex items-center justify-center w-4 h-4 bg-blue-600 text-white text-[10px] font-bold rounded-full flex-shrink-0">
                                                            {sortPriority}
                                                        </span>
                                                    )}
                                                </div>
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredData.map((item, index) => {
                                    const isExpanded = expandedGroups.has(item.industry_group);
                                    const filteredStocks = getFilteredStocks(item.industry_group);

                                    return (
                                        <React.Fragment key={item.id}>
                                            <tr
                                                className={`hover:bg-gray-50 transition-colors cursor-pointer ${isExpanded ? 'bg-gray-50' : ''}`}
                                                onClick={() => toggleGroup(item.industry_group)}
                                            >
                                                <td className="px-4 py-3 text-center text-gray-400">
                                                    <svg
                                                        className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </td>

                                                <td className="px-4 py-3 font-semibold text-gray-700 text-center">
                                                    {index + 1}
                                                </td>

                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <span className={`
                                                            px-2 py-1 rounded text-xs font-bold min-w-[30px] text-center
                                                            ${item.letter_grade === 'A+' ? 'bg-green-100 text-green-800' :
                                                                item.letter_grade === 'A' ? 'bg-green-50 text-green-700' :
                                                                    item.letter_grade === 'B' ? 'bg-blue-50 text-blue-700' :
                                                                        item.letter_grade === 'C' ? 'bg-yellow-50 text-yellow-700' :
                                                                            item.letter_grade === 'D' ? 'bg-orange-50 text-orange-700' :
                                                                                'bg-red-50 text-red-700'}
                                                        `}>
                                                            {item.letter_grade || '-'}
                                                        </span>
                                                        <div>
                                                            <div className="font-medium text-blue-600 hover:underline">
                                                                {item.industry_group}
                                                            </div>
                                                            <div className="text-xs text-gray-400 mt-0.5">{item.sector}</div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-3 text-center">
                                                    {item.number_of_stocks}
                                                </td>

                                                <td className="px-4 py-3 text-center font-bold text-gray-800">
                                                    {item.rank}
                                                </td>

                                                <td className="px-4 py-3 text-center">
                                                    {item.rank_1_week_ago || '-'}
                                                </td>

                                                <td className="px-4 py-3 text-center">
                                                    {item.rank_3_months_ago || '-'}
                                                </td>

                                                <td className="px-4 py-3 text-center">
                                                    {item.rank_6_months_ago || '-'}
                                                </td>

                                                <td className={`px-4 py-3 text-right font-medium ${getChangeColor(item.ytd_change_percent)}`}>
                                                    {formatNumber(item.ytd_change_percent)}%
                                                </td>

                                                <td className="px-4 py-3 text-right text-gray-600">
                                                    {item.market_value > 0 ? formatNumber(item.market_value) : '-'}
                                                </td>

                                                <td className="px-4 py-3 text-center">
                                                    {item.change_vs_last_week !== undefined && item.change_vs_last_week !== null ? (
                                                        <span className={`font-medium ${item.change_vs_last_week > 0 ? 'text-green-600' :
                                                            item.change_vs_last_week < 0 ? 'text-red-600' : 'text-gray-500'
                                                            }`}>
                                                            {item.change_vs_last_week > 0 ? '+' : ''}{item.change_vs_last_week}
                                                        </span>
                                                    ) : '-'}
                                                </td>
                                            </tr>

                                            {isExpanded && (
                                                <tr className="bg-gray-50">
                                                    <td colSpan={11} className="px-4 pb-4 pt-2">
                                                        <div className="bg-white rounded border border-gray-200 p-4 ml-8 shadow-inner">
                                                            <div className="flex justify-between items-center mb-3">
                                                                <h3 className="text-sm font-bold text-gray-700">
                                                                    Stocks in {item.industry_group}
                                                                </h3>
                                                                <div className="text-xs text-gray-500">
                                                                    Showing {filteredStocks.length} of {stocksCache[item.industry_group]?.length || 0} stocks
                                                                </div>
                                                            </div>

                                                            {loadingStocks.has(item.industry_group) ? (
                                                                <div className="text-center py-4 text-gray-500 text-sm">Loading stocks...</div>
                                                            ) : !stocksCache[item.industry_group] || stocksCache[item.industry_group].length === 0 ? (
                                                                <div className="text-center py-4 text-gray-500 text-sm">No stocks found in this group.</div>
                                                            ) : (
                                                                <div className="overflow-x-auto">
                                                                    <table className="w-full text-xs text-left">
                                                                        <thead className="bg-gray-100 text-gray-500 font-medium border-b border-gray-200">
                                                                            <tr>
                                                                                {stockColumnDefinitions.map((col) => {
                                                                                    const currentSorts = stockSortConfigs[item.industry_group] || [];
                                                                                    const sortIndex = currentSorts.findIndex(config => config.key === col.key);
                                                                                    const isSorted = sortIndex !== -1;
                                                                                    const sortPriority = sortIndex + 1;
                                                                                    const sortDir = isSorted ? currentSorts[sortIndex].direction : null;

                                                                                    return (
                                                                                        <th
                                                                                            key={col.key}
                                                                                            className={`
                                                                                                px-3 py-2 cursor-pointer hover:bg-gray-200 transition-colors whitespace-nowrap
                                                                                                ${getStockSortClass(item.industry_group, col.key)}
                                                                                                ${col.key.includes('rating') ? 'text-center' : 'text-left'}
                                                                                                ${isSorted ? 'bg-blue-50 text-blue-900 border-b-2 border-b-blue-500' : ''}
                                                                                            `}
                                                                                            onClick={() => col.sortable && handleStockSort(item.industry_group, col.key)}
                                                                                        >
                                                                                            <div className={`flex items-center ${col.key.includes('rating') ? 'justify-center' : 'justify-start'}`}>
                                                                                                <span className="font-semibold">{col.label}</span>
                                                                                                {col.sortable && (
                                                                                                    <div className="flex flex-col ml-1">
                                                                                                        {isSorted ? (
                                                                                                            <span className="text-xs font-bold">
                                                                                                                {sortDir === 'asc' ? '▲' : '▼'}
                                                                                                            </span>
                                                                                                        ) : (
                                                                                                            <span className="text-[10px] text-gray-400 opacity-50 block leading-[8px]">
                                                                                                                ▲<br />▼
                                                                                                            </span>
                                                                                                        )}
                                                                                                    </div>
                                                                                                )}
                                                                                                {isSorted && (
                                                                                                    <span className="ml-1 inline-flex items-center justify-center w-3 h-3 bg-blue-600 text-white text-[8px] font-bold rounded-full flex-shrink-0">
                                                                                                        {sortPriority}
                                                                                                    </span>
                                                                                                )}
                                                                                            </div>
                                                                                        </th>
                                                                                    );
                                                                                })}
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody className="divide-y divide-gray-100">
                                                                            {filteredStocks.map(stock => {
                                                                                const { rowMin, rowMax } = getRSRowExtremes(stock);
                                                                                return (
                                                                                    <tr key={stock.symbol} className="hover:bg-gray-50">
                                                                                        <td className="px-2 py-1.5 font-medium text-blue-600 whitespace-nowrap">
                                                                                            <Link href={`/stocks/${stock.symbol}`} className="hover:underline">
                                                                                                {stock.symbol}
                                                                                            </Link>
                                                                                        </td>
                                                                                        <td className="px-2 py-1.5 truncate max-w-[130px]" title={stock.company_name}>{stock.company_name}</td>
                                                                                        {/* RS Rating — current (leftmost = most recent) */}
                                                                                        <td
                                                                                            className="px-2 py-1.5 text-center font-bold rounded-sm"
                                                                                            style={getRSHeatmapStyle(stock.rs_rating, rowMin, rowMax)}
                                                                                        >
                                                                                            {stock.rs_rating ?? '-'}
                                                                                        </td>
                                                                                        <td
                                                                                            className="px-2 py-1.5 text-center font-semibold rounded-sm"
                                                                                            style={getRSHeatmapStyle(stock.rs_rating_1_week_ago, rowMin, rowMax)}
                                                                                        >
                                                                                            {stock.rs_rating_1_week_ago ?? '-'}
                                                                                        </td>
                                                                                        <td
                                                                                            className="px-2 py-1.5 text-center font-semibold rounded-sm"
                                                                                            style={getRSHeatmapStyle(stock.rs_rating_4_weeks_ago, rowMin, rowMax)}
                                                                                        >
                                                                                            {stock.rs_rating_4_weeks_ago ?? '-'}
                                                                                        </td>
                                                                                        <td
                                                                                            className="px-2 py-1.5 text-center font-semibold rounded-sm"
                                                                                            style={getRSHeatmapStyle(stock.rs_rating_3_months_ago, rowMin, rowMax)}
                                                                                        >
                                                                                            {stock.rs_rating_3_months_ago ?? '-'}
                                                                                        </td>
                                                                                        <td
                                                                                            className="px-2 py-1.5 text-center font-semibold rounded-sm"
                                                                                            style={getRSHeatmapStyle(stock.rs_rating_6_months_ago, rowMin, rowMax)}
                                                                                        >
                                                                                            {stock.rs_rating_6_months_ago ?? '-'}
                                                                                        </td>
                                                                                        <td
                                                                                            className="px-2 py-1.5 text-center font-semibold rounded-sm"
                                                                                            style={getRSHeatmapStyle(stock.rs_rating_1_year_ago, rowMin, rowMax)}
                                                                                        >
                                                                                            {stock.rs_rating_1_year_ago ?? '-'}
                                                                                        </td>
                                                                                        <td className="px-2 py-1.5 text-gray-500 whitespace-nowrap">{stock.industry}</td>
                                                                                        <td className="px-2 py-1.5 text-gray-500 whitespace-nowrap">{stock.sub_industry}</td>
                                                                                        <td className="px-2 py-1.5 text-center text-gray-600 whitespace-nowrap">{formatShariahApproval(stock.approval_with_controls)}</td>
                                                                                        <td className="px-2 py-1.5 text-center text-gray-600">{formatPurgeAmount(stock.purge_amount)}</td>
                                                                                        <td className="px-2 py-1.5 text-center text-gray-600">{formatMarginable(stock.marginable_percent)}</td>
                                                                                    </tr>
                                                                                );
                                                                            })}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}