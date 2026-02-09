'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Search, Filter, Download, ChevronLeft, ChevronRight } from 'lucide-react';

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
    industry_group: string[];
    sector: string[];
    rank_min: string;
    rank_max: string;
    number_of_stocks_min: string;
    number_of_stocks_max: string;
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
    industry: string[];
    sub_industry: string[];
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
                                <span className="text-gray-400 text-xs">All {placeholder}</span>
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
                                            +{selected.length - 2} more
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
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
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

function StockFilterAccordion({
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

export default function IndustryGroupsPage() {
    const [data, setData] = useState<IndustryGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [collapseSignal, setCollapseSignal] = useState(0);

    const [filters, setFilters] = useState<FilterState>({
        industry_group: [],
        sector: [],
        rank_min: '',
        rank_max: '',
        number_of_stocks_min: '',
        number_of_stocks_max: '',
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
        industry: [],
        sub_industry: [],
    });

    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
    const [stocksCache, setStocksCache] = useState<Record<string, StockSummary[]>>({});
    const [loadingStocks, setLoadingStocks] = useState<Set<string>>(new Set());
    const [sortConfigs, setSortConfigs] = useState<SortConfig[]>([]);
    const [stockSortConfigs, setStockSortConfigs] = useState<Record<string, StockSortConfig[]>>({});

    const [stats, setStats] = useState({
        topPerformer: { group: '', change: 0 },
        worstPerformer: { group: '', change: 0 }
    });

    const filterOptions = useMemo(() => {
        const options = {
            industryGroups: new Set<string>(),
            sectors: new Set<string>()
        };

        data.forEach(item => {
            if (item.industry_group) options.industryGroups.add(item.industry_group);
            if (item.sector) options.sectors.add(item.sector);
        });

        return {
            industryGroups: Array.from(options.industryGroups).sort(),
            sectors: Array.from(options.sectors).sort()
        };
    }, [data]);

    const stockFilterOptions = useMemo(() => {
        const options = {
            industries: new Set<string>(),
            subIndustries: new Set<string>()
        };

        Object.values(stocksCache).forEach(stocks => {
            stocks.forEach(stock => {
                if (stock.industry) options.industries.add(stock.industry);
                if (stock.sub_industry) options.subIndustries.add(stock.sub_industry);
            });
        });

        return {
            industries: Array.from(options.industries).sort(),
            subIndustries: Array.from(options.subIndustries).sort()
        };
    }, [stocksCache]);

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
        { key: 'rs_rating_1_week_ago', label: '1 Week Ago', sortable: true },
        { key: 'rs_rating_4_weeks_ago', label: '4 Weeks Ago', sortable: true },
        { key: 'rs_rating_3_months_ago', label: '3 Months Ago', sortable: true },
        { key: 'rs_rating_6_months_ago', label: '6 Months Ago', sortable: true },
        { key: 'rs_rating_1_year_ago', label: '1 Year Ago', sortable: true },
        { key: 'industry', label: 'Industry', sortable: true },
        { key: 'sub_industry', label: 'Sub Industry', sortable: true },
    ];

    useEffect(() => {
        async function fetchData() {
            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

                const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                const headers: HeadersInit = { 'Content-Type': 'application/json' };
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const res = await fetch(`${API_URL}/api/industry-groups/latest`, {
                    headers,
                    cache: 'no-store'
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
        if (!allowZero && numValue === 0 && (minValue || maxValue)) return false;
        return true;
    };

    const checkStockRange = (value: any, minKey: keyof StockFilterState, maxKey: keyof StockFilterState, allowZero = false) => {
        const minValue = stockFilters[minKey] as string;
        const maxValue = stockFilters[maxKey] as string;
        const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;

        if (minValue && numValue < parseFloat(minValue)) return false;
        if (maxValue && numValue > parseFloat(maxValue)) return false;
        if (!allowZero && numValue === 0 && (minValue || maxValue)) return false;
        return true;
    };

    const activeFilters = useMemo(() => {
        const active: Array<{ label: string; value: string; key: keyof FilterState }> = [];

        const addRangeFilter = (label: string, minKey: keyof FilterState, maxKey: keyof FilterState) => {
            const minValue = filters[minKey];
            const maxValue = filters[maxKey];
            if (minValue || maxValue) {
                active.push({
                    label,
                    value: `${minValue || 'Min'} - ${maxValue || 'Max'}`,
                    key: minKey
                });
            }
        };

        if (filters.industry_group.length > 0) active.push({
            label: 'Industry Groups',
            value: filters.industry_group.join(', '),
            key: 'industry_group'
        });
        if (filters.sector.length > 0) active.push({
            label: 'Sectors',
            value: filters.sector.join(', '),
            key: 'sector'
        });

        addRangeFilter('Rank', 'rank_min', 'rank_max');
        addRangeFilter('Num Stocks', 'number_of_stocks_min', 'number_of_stocks_max');
        addRangeFilter('Rank 1W Ago', 'rank_1_week_ago_min', 'rank_1_week_ago_max');
        addRangeFilter('Rank 3M Ago', 'rank_3_months_ago_min', 'rank_3_months_ago_max');
        addRangeFilter('Rank 6M Ago', 'rank_6_months_ago_min', 'rank_6_months_ago_max');
        addRangeFilter('% Chg YTD', 'ytd_change_percent_min', 'ytd_change_percent_max');
        addRangeFilter('Market Value', 'market_value_min', 'market_value_max');

        return active;
    }, [filters]);

    const filteredData = useMemo(() => {
        let filtered = data.filter(item => {
            if (filters.industry_group.length > 0 && !filters.industry_group.includes(item.industry_group)) return false;
            if (filters.sector.length > 0 && !filters.sector.includes(item.sector)) return false;

            if (!checkRange(item.rank, 'rank_min', 'rank_max')) return false;
            if (!checkRange(item.number_of_stocks, 'number_of_stocks_min', 'number_of_stocks_max')) return false;
            if (!checkRange(item.rank_1_week_ago, 'rank_1_week_ago_min', 'rank_1_week_ago_max', true)) return false;
            if (!checkRange(item.rank_3_months_ago, 'rank_3_months_ago_min', 'rank_3_months_ago_max', true)) return false;
            if (!checkRange(item.rank_6_months_ago, 'rank_6_months_ago_min', 'rank_6_months_ago_max', true)) return false;
            if (!checkRange(item.ytd_change_percent, 'ytd_change_percent_min', 'ytd_change_percent_max', true)) return false;
            if (!checkRange(item.market_value, 'market_value_min', 'market_value_max')) return false;

            return true;
        });

        if (sortConfigs.length > 0) {
            filtered = [...filtered].sort((a, b) => {
                for (const config of sortConfigs) {
                    const getValue = (item: IndustryGroup, key: string): any => {
                        switch (key) {
                            case 'display_order':
                                return 0;
                            case 'rank':
                            case 'group_rank':
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
            if (stockFilters.symbol && !stock.symbol.toLowerCase().includes(stockFilters.symbol.toLowerCase())) return false;
            if (stockFilters.company_name && !stock.company_name.toLowerCase().includes(stockFilters.company_name.toLowerCase())) return false;

            if (!checkStockRange(stock.rs_rating, 'rs_rating_min', 'rs_rating_max', true)) return false;
            if (!checkStockRange(stock.rs_rating_1_week_ago, 'rs_rating_1_week_ago_min', 'rs_rating_1_week_ago_max', true)) return false;
            if (!checkStockRange(stock.rs_rating_4_weeks_ago, 'rs_rating_4_weeks_ago_min', 'rs_rating_4_weeks_ago_max', true)) return false;
            if (!checkStockRange(stock.rs_rating_3_months_ago, 'rs_rating_3_months_ago_min', 'rs_rating_3_months_ago_max', true)) return false;

            if (stockFilters.industry.length > 0 && !stockFilters.industry.includes(stock.industry)) return false;
            if (stockFilters.sub_industry.length > 0 && !stockFilters.sub_industry.includes(stock.sub_industry)) return false;

            return true;
        });

        const currentSorts = stockSortConfigs[groupName] || [];
        if (currentSorts.length > 0) {
            filtered = [...filtered].sort((a, b) => {
                for (const config of currentSorts) {
                    const getValue = (item: StockSummary, key: string): any => {
                        switch (key) {
                            case 'symbol':
                                return item.symbol.toLowerCase();
                            case 'company_name':
                                return item.company_name.toLowerCase();
                            case 'rs_rating':
                                return item.rs_rating || 0;
                            case 'rs_rating_1_week_ago':
                                return item.rs_rating_1_week_ago || 0;
                            case 'rs_rating_4_weeks_ago':
                                return item.rs_rating_4_weeks_ago || 0;
                            case 'rs_rating_3_months_ago':
                                return item.rs_rating_3_months_ago || 0;
                            case 'rs_rating_6_months_ago':
                                return item.rs_rating_6_months_ago || 0;
                            case 'rs_rating_1_year_ago':
                                return item.rs_rating_1_year_ago || 0;
                            case 'industry':
                                return item.industry.toLowerCase();
                            case 'sub_industry':
                                return item.sub_industry.toLowerCase();
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
    }, [stocksCache, stockFilters, stockSortConfigs]);

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
            industry_group: [],
            sector: [],
            rank_min: '',
            rank_max: '',
            number_of_stocks_min: '',
            number_of_stocks_max: '',
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
        });
    }, []);

    const clearStockFilters = useCallback(() => {
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
            industry: [],
            sub_industry: [],
        });
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

    const fetchGroupStocks = async (groupName: string) => {
        if (loadingStocks.has(groupName)) return;

        setLoadingStocks(prev => new Set(prev).add(groupName));
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const encodedGroup = encodeURIComponent(groupName);

            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch(`${API_URL}/api/industry-groups/stocks?industry_group=${encodedGroup}`, {
                headers,
                cache: 'no-store'
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

    const exportToCSV = () => {
        if (filteredData.length === 0) return;

        const headers = [
            'Rank',
            'Industry Group',
            'Sector',
            'Num Stocks',
            'Ind Mkt Val (Bil)',
            'Rank 1 Week Ago',
            'Rank 3 Months Ago',
            'Rank 6 Months Ago',
            'YTD Change %'
        ];

        const rows: (string | number)[][] = [];

        filteredData.forEach(item => {
            rows.push([
                item.rank,
                `"${item.industry_group}"`,
                `"${item.sector}"`,
                item.number_of_stocks,
                item.market_value ? item.market_value.toFixed(2) : '-',
                item.rank_1_week_ago || '-',
                item.rank_3_months_ago || '-',
                item.rank_6_months_ago || '-',
                item.ytd_change_percent.toFixed(2)
            ]);
        });

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `industry_groups_ranking_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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

            <div className="flex">
                <div
                    className={`
                        bg-white border-r border-gray-200 h-[calc(100vh-64px)] flex flex-col transition-all duration-300 ease-in-out overflow-hidden
                        ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full opacity-0'}
                    `}
                >
                    <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 bg-white">
                        <div className="flex space-x-2">
                            <button
                                onClick={exportToCSV}
                                className="w-full px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2 transition-all whitespace-nowrap"
                            >
                                <Download className="w-4 h-4" />
                                <span>Export</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        <div className="mb-4 space-y-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search Industry Group..."
                                    value={filters.industry_group.join(', ')}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value.trim() === '') {
                                            setFilters(prev => ({ ...prev, industry_group: [] }));
                                        }
                                    }}
                                    className="w-full pl-10 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all outline-none"
                                />
                            </div>
                        </div>

                        <FilterAccordion title="INDUSTRY FILTERS" defaultOpen={false} collapseSignal={collapseSignal}>
                            <div className="space-y-3">
                                <CustomMultiSelect
                                    options={filterOptions.industryGroups}
                                    selected={filters.industry_group}
                                    onChange={(value) => setFilters(prev => ({ ...prev, industry_group: value }))}
                                    placeholder={`Industry Groups (${filterOptions.industryGroups.length})`}
                                    icon={Filter}
                                />
                                <CustomMultiSelect
                                    options={filterOptions.sectors}
                                    selected={filters.sector}
                                    onChange={(value) => setFilters(prev => ({ ...prev, sector: value }))}
                                    placeholder={`Sectors (${filterOptions.sectors.length})`}
                                    icon={Filter}
                                />
                            </div>
                        </FilterAccordion>

                        <FilterAccordion title="RANK FILTERS" collapseSignal={collapseSignal}>
                            <RangeFilter
                                label="Rank"
                                minValue={filters.rank_min}
                                maxValue={filters.rank_max}
                                onMinChange={(value) => setFilters(prev => ({ ...prev, rank_min: value }))}
                                onMaxChange={(value) => setFilters(prev => ({ ...prev, rank_max: value }))}
                                minPlaceholder="1"
                                maxPlaceholder="197"
                            />
                            <RangeFilter
                                label="Rank 1 Week Ago"
                                minValue={filters.rank_1_week_ago_min}
                                maxValue={filters.rank_1_week_ago_max}
                                onMinChange={(value) => setFilters(prev => ({ ...prev, rank_1_week_ago_min: value }))}
                                onMaxChange={(value) => setFilters(prev => ({ ...prev, rank_1_week_ago_max: value }))}
                                minPlaceholder="Min"
                                maxPlaceholder="Max"
                            />
                            <RangeFilter
                                label="Rank 3 Months Ago"
                                minValue={filters.rank_3_months_ago_min}
                                maxValue={filters.rank_3_months_ago_max}
                                onMinChange={(value) => setFilters(prev => ({ ...prev, rank_3_months_ago_min: value }))}
                                onMaxChange={(value) => setFilters(prev => ({ ...prev, rank_3_months_ago_max: value }))}
                                minPlaceholder="Min"
                                maxPlaceholder="Max"
                            />
                            <RangeFilter
                                label="Rank 6 Months Ago"
                                minValue={filters.rank_6_months_ago_min}
                                maxValue={filters.rank_6_months_ago_max}
                                onMinChange={(value) => setFilters(prev => ({ ...prev, rank_6_months_ago_min: value }))}
                                onMaxChange={(value) => setFilters(prev => ({ ...prev, rank_6_months_ago_max: value }))}
                                minPlaceholder="Min"
                                maxPlaceholder="Max"
                            />
                        </FilterAccordion>

                        <FilterAccordion title="STOCK STATISTICS" collapseSignal={collapseSignal}>
                            <RangeFilter
                                label="Number of Stocks"
                                minValue={filters.number_of_stocks_min}
                                maxValue={filters.number_of_stocks_max}
                                onMinChange={(value) => setFilters(prev => ({ ...prev, number_of_stocks_min: value }))}
                                onMaxChange={(value) => setFilters(prev => ({ ...prev, number_of_stocks_max: value }))}
                                minPlaceholder="Min"
                                maxPlaceholder="Max"
                            />
                            <RangeFilter
                                label="Market Value (Bil)"
                                minValue={filters.market_value_min}
                                maxValue={filters.market_value_max}
                                onMinChange={(value) => setFilters(prev => ({ ...prev, market_value_min: value }))}
                                onMaxChange={(value) => setFilters(prev => ({ ...prev, market_value_max: value }))}
                                minPlaceholder="Min"
                                maxPlaceholder="Max"
                            />
                        </FilterAccordion>

                        <FilterAccordion title="PERFORMANCE FILTERS" collapseSignal={collapseSignal}>
                            <RangeFilter
                                label="YTD Change %"
                                minValue={filters.ytd_change_percent_min}
                                maxValue={filters.ytd_change_percent_max}
                                onMinChange={(value) => setFilters(prev => ({ ...prev, ytd_change_percent_min: value }))}
                                onMaxChange={(value) => setFilters(prev => ({ ...prev, ytd_change_percent_max: value }))}
                                minPlaceholder="Min"
                                maxPlaceholder="Max"
                            />
                        </FilterAccordion>

                        {/* Stock Table Filters Section */}
                        <StockFilterAccordion title="STOCKS TABLE FILTERS" collapseSignal={collapseSignal}>
                            <div className="space-y-3">
                                <div className="space-y-2">
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
                                </div>

                                <div className="space-y-2">
                                    <RangeFilter
                                        label="RS Rating"
                                        minValue={stockFilters.rs_rating_min}
                                        maxValue={stockFilters.rs_rating_max}
                                        onMinChange={(value) => setStockFilters(prev => ({ ...prev, rs_rating_min: value }))}
                                        onMaxChange={(value) => setStockFilters(prev => ({ ...prev, rs_rating_max: value }))}
                                        minPlaceholder="Min"
                                        maxPlaceholder="Max"
                                    />
                                    <RangeFilter
                                        label="RS 1 Week Ago"
                                        minValue={stockFilters.rs_rating_1_week_ago_min}
                                        maxValue={stockFilters.rs_rating_1_week_ago_max}
                                        onMinChange={(value) => setStockFilters(prev => ({ ...prev, rs_rating_1_week_ago_min: value }))}
                                        onMaxChange={(value) => setStockFilters(prev => ({ ...prev, rs_rating_1_week_ago_max: value }))}
                                        minPlaceholder="Min"
                                        maxPlaceholder="Max"
                                    />
                                    <RangeFilter
                                        label="RS 4 Weeks Ago"
                                        minValue={stockFilters.rs_rating_4_weeks_ago_min}
                                        maxValue={stockFilters.rs_rating_4_weeks_ago_max}
                                        onMinChange={(value) => setStockFilters(prev => ({ ...prev, rs_rating_4_weeks_ago_min: value }))}
                                        onMaxChange={(value) => setStockFilters(prev => ({ ...prev, rs_rating_4_weeks_ago_max: value }))}
                                        minPlaceholder="Min"
                                        maxPlaceholder="Max"
                                    />
                                    <RangeFilter
                                        label="RS 3 Months Ago"
                                        minValue={stockFilters.rs_rating_3_months_ago_min}
                                        maxValue={stockFilters.rs_rating_3_months_ago_max}
                                        onMinChange={(value) => setStockFilters(prev => ({ ...prev, rs_rating_3_months_ago_min: value }))}
                                        onMaxChange={(value) => setStockFilters(prev => ({ ...prev, rs_rating_3_months_ago_max: value }))}
                                        minPlaceholder="Min"
                                        maxPlaceholder="Max"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <CustomMultiSelect
                                        options={stockFilterOptions.industries}
                                        selected={stockFilters.industry}
                                        onChange={(value) => setStockFilters(prev => ({ ...prev, industry: value }))}
                                        placeholder={`Industry (${stockFilterOptions.industries.length})`}
                                        icon={Filter}
                                    />
                                    <CustomMultiSelect
                                        options={stockFilterOptions.subIndustries}
                                        selected={stockFilters.sub_industry}
                                        onChange={(value) => setStockFilters(prev => ({ ...prev, sub_industry: value }))}
                                        placeholder={`Sub Industry (${stockFilterOptions.subIndustries.length})`}
                                        icon={Filter}
                                    />
                                </div>

                                <button
                                    onClick={clearStockFilters}
                                    className="w-full px-3 py-1.5 text-xs font-medium text-red-600 bg-white border border-red-200 hover:bg-red-50 rounded-md transition-all flex items-center justify-center space-x-1"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    <span>Clear Stock Filters</span>
                                </button>
                            </div>
                        </StockFilterAccordion>
                    </div>

                    <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                        <div className="flex flex-col space-y-3">
                            <button
                                onClick={() => setCollapseSignal(prev => prev + 1)}
                                className="w-full px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all flex items-center justify-center space-x-2 border border-gray-200"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                <span>Collapse All Groups</span>
                            </button>

                            <button
                                onClick={clearAllFilters}
                                className="w-full px-4 py-2.5 text-sm font-semibold text-red-600 bg-white border border-red-200 hover:bg-red-50 rounded-lg transition-all flex items-center justify-center space-x-2 shadow-sm"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span>Reset All Filters</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden">
                    <div className="bg-white border-b border-gray-200 px-4 py-2 flex-shrink-0">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                    className="p-1 hover:bg-gray-100 rounded text-gray-500"
                                >
                                    {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                </button>
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

                        {activeFilters.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {activeFilters.map((filter, index) => (
                                    <ActiveFilterBadge
                                        key={index}
                                        label={filter.label}
                                        value={filter.value}
                                        onRemove={() => clearFilter(filter.key)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

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
                                                                            {filteredStocks.map(stock => (
                                                                                <tr key={stock.symbol} className="hover:bg-gray-50">
                                                                                    <td className="px-3 py-2 font-medium text-blue-600">
                                                                                        <Link href={`/stocks/${stock.symbol}`} className="hover:underline">
                                                                                            {stock.symbol}
                                                                                        </Link>
                                                                                    </td>
                                                                                    <td className="px-3 py-2 truncate max-w-[150px]" title={stock.company_name}>{stock.company_name}</td>
                                                                                    <td className={`px-3 py-2 text-center font-bold ${(stock.rs_rating || 0) >= 80 ? 'text-green-600' :
                                                                                        (stock.rs_rating || 0) >= 70 ? 'text-yellow-600' : 'text-gray-500'
                                                                                        }`}>
                                                                                        {stock.rs_rating || '-'}
                                                                                    </td>
                                                                                    <td className="px-3 py-2 text-center text-gray-600">{stock.rs_rating_1_week_ago || '-'}</td>
                                                                                    <td className="px-3 py-2 text-center text-gray-600">{stock.rs_rating_4_weeks_ago || '-'}</td>
                                                                                    <td className="px-3 py-2 text-center text-gray-600">{stock.rs_rating_3_months_ago || '-'}</td>
                                                                                    <td className="px-3 py-2 text-center text-gray-600">{stock.rs_rating_6_months_ago || '-'}</td>
                                                                                    <td className="px-3 py-2 text-center text-gray-600">{stock.rs_rating_1_year_ago || '-'}</td>
                                                                                    <td className="px-3 py-2 text-gray-500">{stock.industry}</td>
                                                                                    <td className="px-3 py-2 text-gray-500">{stock.sub_industry}</td>
                                                                                </tr>
                                                                            ))}
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