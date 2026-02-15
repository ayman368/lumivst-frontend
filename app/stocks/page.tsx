'use client';

import Link from 'next/link';
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Filter, ChevronLeft, ChevronRight, PanelLeft, Search } from 'lucide-react';
import RatingBadge from './components/RatingBadge';
import CustomMultiSelect from './components/CustomMultiSelect';
import RangeFilter from './components/RangeFilter';
import CustomDropdown from './components/CustomDropdown';
import CheckboxGroup from './components/CheckboxGroup';
import ActiveFilterBadge from './components/ActiveFilterBadge';
import FilterAccordion from './components/FilterAccordion';
import ExportMenu from './components/ExportMenu';
import ColumnSelector from './components/ColumnSelector';
import StockTable from './components/StockTable';
import useStocks from './hooks/useStocks';
import type { Stock, StockMetadata, FilterState } from './types';
import * as XLSX from 'xlsx';
import { cleanSymbol, cleanName, parseFormattedNumber, formatNumber, formatChange, formatChangePercent, formatText, displayRawValue } from './utils/formatters';

// Types and helpers moved to `types.ts` and `utils/formatters.ts`

// `CustomMultiSelect` moved to `components/CustomMultiSelect.tsx`

// `CustomDropdown` moved to `components/CustomDropdown.tsx`

// Helper functions moved to `utils/formatters.ts`

// Helper Component for Ratings
// `RatingBadge` moved to `components/RatingBadge.tsx`

// `FilterAccordion`, `CheckboxGroup`, and `ActiveFilterBadge` moved to `components/` folder

// ==================== Main Component ====================

export default function StockScreenerPage() {
    const { stocks, metadata, loading, error, setStocks, setMetadata, setLoading, setError, refetch } = useStocks();
    const [sortConfigs, setSortConfigs] = useState<Array<{ key: string; direction: 'asc' | 'desc' }>>([]);
    const [showColumnMenu, setShowColumnMenu] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [columnSearch, setColumnSearch] = useState('');
    const [collapseSignal, setCollapseSignal] = useState(0);
    const columnMenuRef = useRef<HTMLDivElement>(null);

    const selectStyles = `
        w-full pl-10 pr-8 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-lg 
        focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white
        outline-none appearance-none cursor-pointer
        transition-all hover:border-gray-300
    `;

    // Column Definitions
    const columnDefinitions = [
        { key: 'symbol', label: 'Symbol', visibleKey: 'symbol' },
        { key: 'name', label: 'Name', visibleKey: 'name' },
        { key: 'charts', label: 'Charts', visibleKey: 'charts' },
        { key: 'rs_rating', label: 'RS Rating', visibleKey: 'rs_rating' },
        { key: 'acc_dis_rating', label: 'Acc/Dis Rating', visibleKey: 'acc_dis_rating' },
        { key: 'industry_group_rs', label: 'Industry Group RS', visibleKey: 'industry_group_rs' },
        { key: 'sector_rs', label: 'Sector RS', visibleKey: 'sector_rs' },
        { key: 'industry_rs', label: 'Industry RS', visibleKey: 'industry_rs' },
        { key: 'sub_industry_rs', label: 'Sub Industry RS', visibleKey: 'sub_industry_rs' },
        { key: 'price', label: 'Price', visibleKey: 'price' },
        { key: 'change', label: 'Change', visibleKey: 'change' },
        { key: 'percent_change', label: '% Change', visibleKey: 'percent_change' },
        { key: 'volume', label: 'Volume', visibleKey: 'volume' },
        { key: 'turnover', label: 'Turnover', visibleKey: 'turnover' },
        { key: 'no_of_trades', label: 'No. of Trades', visibleKey: 'no_of_trades' },
        { key: 'market_cap', label: 'Market Cap', visibleKey: 'market_cap' },
        { key: 'industry_group', label: 'Industry Group', visibleKey: 'industry_group' },
        { key: 'sector', label: 'Sector', visibleKey: 'sector' },
        { key: 'industry', label: 'Industry', visibleKey: 'industry' },
        { key: 'sub_industry', label: 'Sub Industry', visibleKey: 'sub_industry' },
        { key: 'open', label: 'Open', visibleKey: 'open' },
        { key: 'high', label: 'High', visibleKey: 'high' },
        { key: 'low', label: 'Low', visibleKey: 'low' },
        { key: 'price_minus_sma_10', label: 'Price - SMA10', visibleKey: 'price_minus_sma_10' },
        { key: 'price_minus_sma_21', label: 'Price - SMA21', visibleKey: 'price_minus_sma_21' },
        { key: 'price_minus_sma_50', label: 'Price - SMA50', visibleKey: 'price_minus_sma_50' },
        { key: 'price_minus_sma_150', label: 'Price - SMA150', visibleKey: 'price_minus_sma_150' },
        { key: 'price_minus_sma_200', label: 'Price - SMA200', visibleKey: 'price_minus_sma_200' },
        { key: 'fifty_two_week_high_price', label: '52 Week High', visibleKey: 'fifty_two_week_high_price' },
        { key: 'fifty_two_week_low_price', label: '52 Week Low', visibleKey: 'fifty_two_week_low_price' },
        { key: 'average_volume_50', label: 'Avg Volume 50', visibleKey: 'average_volume_50' },
        { key: 'price_vs_sma_10_percent', label: 'Price vs SMA10 %', visibleKey: 'price_vs_sma_10_percent' },
        { key: 'price_vs_sma_21_percent', label: 'Price vs SMA21 %', visibleKey: 'price_vs_sma_21_percent' },
        { key: 'price_vs_sma_50_percent', label: 'Price vs SMA50 %', visibleKey: 'price_vs_sma_50_percent' },
        { key: 'price_vs_sma_150_percent', label: 'Price vs SMA150 %', visibleKey: 'price_vs_sma_150_percent' },
        { key: 'price_vs_sma_200_percent', label: 'Price vs SMA200 %', visibleKey: 'price_vs_sma_200_percent' },
        { key: 'percent_off_52w_high', label: '% Off 52W High', visibleKey: 'percent_off_52w_high' },
        { key: 'percent_off_52w_low', label: '% Off 52W Low', visibleKey: 'percent_off_52w_low' },
        { key: 'vol_diff_50_percent', label: 'Vol Diff 50 %', visibleKey: 'vol_diff_50_percent' },
    ];

    // Column visibility state
    const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('stocksVisibleColumns');
            if (saved) {
                return JSON.parse(saved);
            }
        }
        const defaultVisible: Record<string, boolean> = {};
        columnDefinitions.forEach((col, index) => {
            defaultVisible[col.visibleKey] = index < 15;
        });
        return defaultVisible;
    });

    // Filter State
    const [filters, setFilters] = useState<FilterState>({
        // SmartSelect Ratings
        rs_rating_min: '',
        rs_rating_max: '',
        acc_dis_rating: [],
        industry_group_rs: [],
        sector_rs: [],
        industry_rs: [],
        sub_industry_rs: [],

        // Price & Volume
        price_min: '',
        price_max: '',
        change_min: '',
        change_max: '',
        percent_change_min: '',
        percent_change_max: '',
        volume_min: '',
        volume_max: '',
        turnover_min: '',
        turnover_max: '',
        no_of_trades_min: '',
        no_of_trades_max: '',
        percent_off_52w_high_min: '',
        percent_off_52w_high_max: '',
        percent_off_52w_low_min: '',
        percent_off_52w_low_max: '',
        market_cap_min: '',
        market_cap_max: '',

        // Moving Averages - Absolute
        price_minus_sma_10_min: '',
        price_minus_sma_10_max: '',
        price_minus_sma_21_min: '',
        price_minus_sma_21_max: '',
        price_minus_sma_50_min: '',
        price_minus_sma_50_max: '',
        price_minus_sma_150_min: '',
        price_minus_sma_150_max: '',
        price_minus_sma_200_min: '',
        price_minus_sma_200_max: '',

        // Moving Averages - Percentage
        price_vs_sma_10_min: '',
        price_vs_sma_10_max: '',
        price_vs_sma_21_min: '',
        price_vs_sma_21_max: '',
        price_vs_sma_50_min: '',
        price_vs_sma_50_max: '',
        price_vs_sma_150_min: '',
        price_vs_sma_150_max: '',
        price_vs_sma_200_min: '',
        price_vs_sma_200_max: '',

        // 52 Week High/Low
        fifty_two_week_high_min: '',
        fifty_two_week_high_max: '',
        fifty_two_week_low_min: '',
        fifty_two_week_low_max: '',

        // Volume Analysis
        average_volume_50_min: '',
        average_volume_50_max: '',
        vol_diff_50_percent_min: '',
        vol_diff_50_percent_max: '',

        // Open/High/Low
        open_min: '',
        open_max: '',
        high_min: '',
        high_max: '',
        low_min: '',
        low_max: '',

        // Quick Filters
        symbol: '',
        name: '',
        industry_group: [],
        sector: [],
        industry: [],
        sub_industry: [],
    });

    // Close menus when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (columnMenuRef.current && !columnMenuRef.current.contains(event.target as Node)) {
                setShowColumnMenu(false);
            }
            // Logic for export menu if needed, but we can also use a Ref for it
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const exportMenuRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
                setShowExportMenu(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Toggle column visibility with useCallback
    const toggleColumn = useCallback((columnKey: string) => {
        setVisibleColumns(prev => {
            const updated = { ...prev, [columnKey]: !prev[columnKey] };
            localStorage.setItem('stocksVisibleColumns', JSON.stringify(updated));
            return updated;
        });
    }, []);

    // Clear specific filter
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

    // Clear all filters
    const clearAllFilters = useCallback(() => {
        setFilters({
            // SmartSelect Ratings
            rs_rating_min: '',
            rs_rating_max: '',
            acc_dis_rating: [],
            industry_group_rs: [],
            sector_rs: [],
            industry_rs: [],
            sub_industry_rs: [],

            // Price & Volume
            price_min: '',
            price_max: '',
            change_min: '',
            change_max: '',
            percent_change_min: '',
            percent_change_max: '',
            volume_min: '',
            volume_max: '',
            turnover_min: '',
            turnover_max: '',
            no_of_trades_min: '',
            no_of_trades_max: '',
            percent_off_52w_high_min: '',
            percent_off_52w_high_max: '',
            percent_off_52w_low_min: '',
            percent_off_52w_low_max: '',
            market_cap_min: '',
            market_cap_max: '',

            // Moving Averages - Absolute
            price_minus_sma_10_min: '',
            price_minus_sma_10_max: '',
            price_minus_sma_21_min: '',
            price_minus_sma_21_max: '',
            price_minus_sma_50_min: '',
            price_minus_sma_50_max: '',
            price_minus_sma_150_min: '',
            price_minus_sma_150_max: '',
            price_minus_sma_200_min: '',
            price_minus_sma_200_max: '',

            // Moving Averages - Percentage
            price_vs_sma_10_min: '',
            price_vs_sma_10_max: '',
            price_vs_sma_21_min: '',
            price_vs_sma_21_max: '',
            price_vs_sma_50_min: '',
            price_vs_sma_50_max: '',
            price_vs_sma_150_min: '',
            price_vs_sma_150_max: '',
            price_vs_sma_200_min: '',
            price_vs_sma_200_max: '',

            // 52 Week High/Low
            fifty_two_week_high_min: '',
            fifty_two_week_high_max: '',
            fifty_two_week_low_min: '',
            fifty_two_week_low_max: '',

            // Volume Analysis
            average_volume_50_min: '',
            average_volume_50_max: '',
            vol_diff_50_percent_min: '',
            vol_diff_50_percent_max: '',

            // Open/High/Low
            open_min: '',
            open_max: '',
            high_min: '',
            high_max: '',
            low_min: '',
            low_max: '',

            // Quick Filters
            symbol: '',
            name: '',
            industry_group: [],
            sector: [],
            industry: [],
            sub_industry: [],
        });
    }, []);

    // Fetch data
    useEffect(() => {
        async function fetchStocks() {
            try {
                setLoading(true);
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

                const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                const headers: HeadersInit = { 'Content-Type': 'application/json' };
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const [pricesRes, rsRes] = await Promise.all([
                    fetch(`${API_URL}/api/prices/latest`, { cache: 'no-store', headers }),
                    fetch(`${API_URL}/api/rs-v2/latest?limit=1000`, { cache: 'no-store', headers })
                ]);

                if (!pricesRes.ok) throw new Error(`Failed to fetch prices: ${pricesRes.status}`);

                const pricesData = await pricesRes.json();
                const rsData = rsRes.ok ? await rsRes.json() : { data: [] };

                const rsMap = new Map((rsData.data || []).map((item: any) => [String(item.symbol), item]));

                const mappedStocks = (pricesData.data || []).map((item: any) => {
                    const symbolStr = String(item.symbol);
                    const rsInfo: any = rsMap.get(symbolStr) || {};

                    return {
                        symbol: item.symbol,
                        name: item.company_name || '',
                        industry_group: item.industry_group || '',
                        sector: item.sector || '',
                        industry: item.industry || '',
                        sub_industry: item.sub_industry || '',
                        price: item.close,
                        change: item.change,
                        percent_change: item.change_percent,
                        volume: item.volume_traded,
                        turnover: item.value_traded_sar,
                        open: item.open,
                        high: item.high,
                        low: item.low,
                        no_of_trades: item.no_of_trades,
                        market_cap: item.market_cap,

                        // IBD Metrics
                        rs_rating: rsInfo.rs_rating || 0,
                        industry_group_rs: rsInfo.industry_group_rs_rating || '',
                        sector_rs: rsInfo.sector_rs_rating || '',
                        industry_rs: rsInfo.industry_rs_rating || '',
                        sub_industry_rs: rsInfo.sub_industry_rs_rating || '',
                        acc_dis_rating: rsInfo.acc_dis_rating || '',

                        // Technicals
                        price_minus_sma_10: item.price_minus_sma_10,
                        price_minus_sma_21: item.price_minus_sma_21,
                        price_minus_sma_50: item.price_minus_sma_50,
                        price_minus_sma_150: item.price_minus_sma_150,
                        price_minus_sma_200: item.price_minus_sma_200,
                        fifty_two_week_high_price: item.fifty_two_week_high,
                        fifty_two_week_low_price: item.fifty_two_week_low,
                        average_volume_50: item.average_volume_50,

                        // Percentage Technicals
                        price_vs_sma_10_percent: item.price_vs_sma_10_percent,
                        price_vs_sma_21_percent: item.price_vs_sma_21_percent,
                        price_vs_sma_50_percent: item.price_vs_sma_50_percent,
                        price_vs_sma_150_percent: item.price_vs_sma_150_percent,
                        price_vs_sma_200_percent: item.price_vs_sma_200_percent,
                        percent_off_52w_high: item.percent_off_52w_high,
                        percent_off_52w_low: item.percent_off_52w_low,
                        vol_diff_50_percent: item.vol_diff_50_percent,
                        trading_view_symbol: item.trading_view_symbol,
                    };
                });

                setStocks(mappedStocks);

                setMetadata({
                    exchange: 'Tadawul',
                    currency: 'SAR',
                    datetime: pricesData.date ? pricesData.date.toString() : new Date().toISOString().split('T')[0],
                    timezone: 'Asia/Riyadh'
                });

            } catch (err) {
                console.error('❌ Error fetching data:', err);
                setError(err instanceof Error ? err.message : 'Failed to connect to server');
            } finally {
                setLoading(false);
            }
        }

        fetchStocks();
    }, []);

    // Handle sort
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

    const getSortClass = useCallback((key: string): string => {
        const index = sortConfigs.findIndex(config => config.key === key);
        if (index === -1) return 'cursor-pointer hover:bg-gray-50';

        const direction = sortConfigs[index].direction;
        return `cursor-pointer ${direction === 'asc' ? 'bg-blue-50' : 'bg-blue-50'}`;
    }, [sortConfigs]);

    // Extract unique values for filters
    const filterOptions = useMemo(() => {
        const options = {
            industryGroups: new Set<string>(),
            sectors: new Set<string>(),
            industries: new Set<string>(),
            subIndustries: new Set<string>()
        };

        stocks.forEach(stock => {
            if (stock.industry_group) options.industryGroups.add(stock.industry_group);
            if (stock.sector) options.sectors.add(stock.sector);
            if (stock.industry) options.industries.add(stock.industry);
            if (stock.sub_industry) options.subIndustries.add(stock.sub_industry);
        });

        return {
            industryGroups: Array.from(options.industryGroups).sort(),
            sectors: Array.from(options.sectors).sort(),
            industries: Array.from(options.industries).sort(),
            subIndustries: Array.from(options.subIndustries).sort()
        };
    }, [stocks]);

    // Get active filters for display
    const activeFilters = useMemo(() => {
        const active: Array<{ label: string; value: string; key: keyof FilterState }> = [];

        // Helper function to add range filters
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

        // Helper function to add checkbox filters
        const addCheckboxFilter = (label: string, key: keyof FilterState) => {
            const values = filters[key] as string[];
            if (values.length > 0) {
                active.push({
                    label,
                    value: values.join(', '),
                    key
                });
            }
        };

        // RS Rating
        addRangeFilter('RS Rating', 'rs_rating_min', 'rs_rating_max');

        // Rating checkboxes
        addCheckboxFilter('A/D Rating', 'acc_dis_rating');
        addCheckboxFilter('Group RS', 'industry_group_rs');
        addCheckboxFilter('Sector RS', 'sector_rs');
        addCheckboxFilter('Industry RS', 'industry_rs');
        addCheckboxFilter('Sub Industry RS', 'sub_industry_rs');

        // Price & Volume ranges
        addRangeFilter('Price', 'price_min', 'price_max');
        addRangeFilter('Change', 'change_min', 'change_max');
        addRangeFilter('% Change', 'percent_change_min', 'percent_change_max');
        addRangeFilter('Volume', 'volume_min', 'volume_max');
        addRangeFilter('Turnover', 'turnover_min', 'turnover_max');
        addRangeFilter('Trades', 'no_of_trades_min', 'no_of_trades_max');
        addRangeFilter('% Off High', 'percent_off_52w_high_min', 'percent_off_52w_high_max');
        addRangeFilter('% Off Low', 'percent_off_52w_low_min', 'percent_off_52w_low_max');

        // Moving Averages - Absolute
        addRangeFilter('Price - SMA10', 'price_minus_sma_10_min', 'price_minus_sma_10_max');
        addRangeFilter('Price - SMA21', 'price_minus_sma_21_min', 'price_minus_sma_21_max');
        addRangeFilter('Price - SMA50', 'price_minus_sma_50_min', 'price_minus_sma_50_max');
        addRangeFilter('Price - SMA150', 'price_minus_sma_150_min', 'price_minus_sma_150_max');
        addRangeFilter('Price - SMA200', 'price_minus_sma_200_min', 'price_minus_sma_200_max');

        // Moving Averages - Percentage
        addRangeFilter('vs SMA10%', 'price_vs_sma_10_min', 'price_vs_sma_10_max');
        addRangeFilter('vs SMA21%', 'price_vs_sma_21_min', 'price_vs_sma_21_max');
        addRangeFilter('vs SMA50%', 'price_vs_sma_50_min', 'price_vs_sma_50_max');
        addRangeFilter('vs SMA150%', 'price_vs_sma_150_min', 'price_vs_sma_150_max');
        addRangeFilter('vs SMA200%', 'price_vs_sma_200_min', 'price_vs_sma_200_max');

        // 52 Week High/Low
        addRangeFilter('52W High', 'fifty_two_week_high_min', 'fifty_two_week_high_max');
        addRangeFilter('52W Low', 'fifty_two_week_low_min', 'fifty_two_week_low_max');

        // Volume Analysis
        addRangeFilter('Avg Vol 50', 'average_volume_50_min', 'average_volume_50_max');
        addRangeFilter('Vol Diff %', 'vol_diff_50_percent_min', 'vol_diff_50_percent_max');

        // Open/High/Low
        addRangeFilter('Open', 'open_min', 'open_max');
        addRangeFilter('High', 'high_min', 'high_max');
        addRangeFilter('Low', 'low_min', 'low_max');

        // Text filters
        if (filters.symbol) active.push({ label: 'Symbol', value: filters.symbol, key: 'symbol' });
        if (filters.name) active.push({ label: 'Name', value: filters.name, key: 'name' });

        // Multi-select filters
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
        if (filters.industry.length > 0) active.push({
            label: 'Industries',
            value: filters.industry.join(', '),
            key: 'industry'
        });
        if (filters.sub_industry.length > 0) active.push({
            label: 'Sub Industries',
            value: filters.sub_industry.join(', '),
            key: 'sub_industry'
        });

        return active;
    }, [filters]);

    // Filter and sort stocks
    const filteredAndSortedStocks = useMemo(() => {
        let filtered = stocks.filter(stock => {
            // Text filters
            if (filters.symbol && !cleanSymbol(stock.symbol).includes(filters.symbol)) return false;
            if (filters.name && !(stock.name || '').toLowerCase().includes(filters.name.toLowerCase())) return false;

            // Multi-select filters
            if (filters.industry_group.length > 0 && !filters.industry_group.includes(stock.industry_group || '')) return false;
            if (filters.sector.length > 0 && !filters.sector.includes(stock.sector || '')) return false;
            if (filters.industry.length > 0 && !filters.industry.includes(stock.industry || '')) return false;
            if (filters.sub_industry.length > 0 && !filters.sub_industry.includes(stock.sub_industry || '')) return false;

            // Helper function for range filters
            const checkRange = (value: any, minKey: keyof FilterState, maxKey: keyof FilterState, allowZero = false) => {
                const minValue = filters[minKey] as string;
                const maxValue = filters[maxKey] as string;
                const numValue = parseFormattedNumber(value, true);

                if (minValue && numValue < parseFloat(minValue)) return false;
                if (maxValue && numValue > parseFloat(maxValue)) return false;
                if (!allowZero && numValue === 0 && (minValue || maxValue)) return false;
                return true;
            };

            // Helper function for checkbox filters
            const checkCheckbox = (value: string | undefined, allowedValues: string[]) => {
                if (allowedValues.length === 0) return true;
                if (!value) return false;
                return allowedValues.some(rating => value.startsWith(rating));
            };

            // SmartSelect Ratings
            if (!checkRange(stock.rs_rating, 'rs_rating_min', 'rs_rating_max')) return false;
            if (!checkCheckbox(stock.acc_dis_rating, filters.acc_dis_rating)) return false;
            if (!checkCheckbox(stock.industry_group_rs, filters.industry_group_rs)) return false;
            if (!checkCheckbox(stock.sector_rs, filters.sector_rs)) return false;
            if (!checkCheckbox(stock.industry_rs, filters.industry_rs)) return false;
            if (!checkCheckbox(stock.sub_industry_rs, filters.sub_industry_rs)) return false;

            // Price & Volume
            if (!checkRange(stock.price, 'price_min', 'price_max')) return false;
            if (!checkRange(stock.change, 'change_min', 'change_max', true)) return false;
            if (!checkRange(stock.percent_change, 'percent_change_min', 'percent_change_max', true)) return false;
            if (!checkRange(stock.volume, 'volume_min', 'volume_max')) return false;
            if (!checkRange(stock.turnover, 'turnover_min', 'turnover_max')) return false;
            if (!checkRange(stock.market_cap, 'market_cap_min', 'market_cap_max')) return false;
            if (!checkRange(stock.no_of_trades, 'no_of_trades_min', 'no_of_trades_max')) return false;
            if (!checkRange(stock.percent_off_52w_high, 'percent_off_52w_high_min', 'percent_off_52w_high_max', true)) return false;
            if (!checkRange(stock.percent_off_52w_low, 'percent_off_52w_low_min', 'percent_off_52w_low_max', true)) return false;

            // Moving Averages - Absolute
            if (!checkRange(stock.price_minus_sma_10, 'price_minus_sma_10_min', 'price_minus_sma_10_max', true)) return false;
            if (!checkRange(stock.price_minus_sma_21, 'price_minus_sma_21_min', 'price_minus_sma_21_max', true)) return false;
            if (!checkRange(stock.price_minus_sma_50, 'price_minus_sma_50_min', 'price_minus_sma_50_max', true)) return false;
            if (!checkRange(stock.price_minus_sma_150, 'price_minus_sma_150_min', 'price_minus_sma_150_max', true)) return false;
            if (!checkRange(stock.price_minus_sma_200, 'price_minus_sma_200_min', 'price_minus_sma_200_max', true)) return false;

            // Moving Averages - Percentage
            if (!checkRange(stock.price_vs_sma_10_percent, 'price_vs_sma_10_min', 'price_vs_sma_10_max', true)) return false;
            if (!checkRange(stock.price_vs_sma_21_percent, 'price_vs_sma_21_min', 'price_vs_sma_21_max', true)) return false;
            if (!checkRange(stock.price_vs_sma_50_percent, 'price_vs_sma_50_min', 'price_vs_sma_50_max', true)) return false;
            if (!checkRange(stock.price_vs_sma_150_percent, 'price_vs_sma_150_min', 'price_vs_sma_150_max', true)) return false;
            if (!checkRange(stock.price_vs_sma_200_percent, 'price_vs_sma_200_min', 'price_vs_sma_200_max', true)) return false;

            // 52 Week High/Low
            if (!checkRange(stock.fifty_two_week_high_price, 'fifty_two_week_high_min', 'fifty_two_week_high_max')) return false;
            if (!checkRange(stock.fifty_two_week_low_price, 'fifty_two_week_low_min', 'fifty_two_week_low_max')) return false;

            // Volume Analysis
            if (!checkRange(stock.average_volume_50, 'average_volume_50_min', 'average_volume_50_max')) return false;
            if (!checkRange(stock.vol_diff_50_percent, 'vol_diff_50_percent_min', 'vol_diff_50_percent_max', true)) return false;

            // Open/High/Low
            if (!checkRange(stock.open, 'open_min', 'open_max')) return false;
            if (!checkRange(stock.high, 'high_min', 'high_max')) return false;
            if (!checkRange(stock.low, 'low_min', 'low_max')) return false;

            return true;
        });

        // Apply sorting
        if (sortConfigs.length > 0) {
            filtered = [...filtered].sort((a, b) => {
                for (const config of sortConfigs) {
                    const getValue = (stock: Stock, key: string): any => {
                        switch (key) {
                            case 'symbol': return cleanSymbol(stock.symbol);
                            case 'name': return stock.name || '';
                            case 'rs_rating': return stock.rs_rating || 0;
                            case 'acc_dis_rating': return stock.acc_dis_rating || '';
                            case 'industry_group_rs': return stock.industry_group_rs || '';
                            case 'sector_rs': return stock.sector_rs || '';
                            case 'industry_rs': return stock.industry_rs || '';
                            case 'sub_industry_rs': return stock.sub_industry_rs || '';
                            case 'price': return parseFormattedNumber(stock.price);
                            case 'change': return parseFormattedNumber(stock.change, true);
                            case 'percent_change': return parseFormattedNumber(stock.percent_change);
                            case 'volume': return parseFormattedNumber(stock.volume);
                            case 'turnover': return parseFormattedNumber(stock.turnover);
                            case 'market_cap': return parseFormattedNumber(stock.market_cap);
                            case 'no_of_trades': return stock.no_of_trades || 0;
                            case 'industry_group': return stock.industry_group || '';
                            case 'sector': return stock.sector || '';
                            case 'industry': return stock.industry || '';
                            case 'sub_industry': return stock.sub_industry || '';
                            case 'open': return parseFormattedNumber(stock.open);
                            case 'high': return parseFormattedNumber(stock.high);
                            case 'low': return parseFormattedNumber(stock.low);
                            case 'price_minus_sma_10': return stock.price_minus_sma_10 || 0;
                            case 'price_minus_sma_21': return stock.price_minus_sma_21 || 0;
                            case 'price_minus_sma_50': return stock.price_minus_sma_50 || 0;
                            case 'price_minus_sma_150': return stock.price_minus_sma_150 || 0;
                            case 'price_minus_sma_200': return stock.price_minus_sma_200 || 0;
                            case 'fifty_two_week_high_price': return stock.fifty_two_week_high_price || 0;
                            case 'fifty_two_week_low_price': return stock.fifty_two_week_low_price || 0;
                            case 'average_volume_50': return stock.average_volume_50 || 0;
                            case 'price_vs_sma_10_percent': return stock.price_vs_sma_10_percent || 0;
                            case 'price_vs_sma_21_percent': return stock.price_vs_sma_21_percent || 0;
                            case 'price_vs_sma_50_percent': return stock.price_vs_sma_50_percent || 0;
                            case 'price_vs_sma_150_percent': return stock.price_vs_sma_150_percent || 0;
                            case 'price_vs_sma_200_percent': return stock.price_vs_sma_200_percent || 0;
                            case 'percent_off_52w_high': return stock.percent_off_52w_high || 0;
                            case 'percent_off_52w_low': return stock.percent_off_52w_low || 0;
                            case 'vol_diff_50_percent': return stock.vol_diff_50_percent || 0;
                            case 'trading_view_symbol': return stock.trading_view_symbol || '';
                            default: return 0;
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
    }, [stocks, filters, sortConfigs]);

    // Multi-format Export Function
    const handleExport = useCallback((format: 'csv' | 'xlsx' | 'xls' | 'txt') => {
        const visibleCols = columnDefinitions.filter(col => visibleColumns[col.visibleKey]);
        const headerLabels = visibleCols.map(col => col.label);

        const dataRows = filteredAndSortedStocks.map(stock => {
            return visibleCols.map(col => {
                switch (col.key) {
                    case 'symbol': return cleanSymbol(stock.symbol);
                    case 'name': return cleanName(stock.name);
                    case 'charts': return 'View';
                    case 'rs_rating': return stock.rs_rating || '';
                    case 'acc_dis_rating': return stock.acc_dis_rating || '';
                    case 'industry_group_rs': return stock.industry_group_rs || '';
                    case 'sector_rs': return stock.sector_rs || '';
                    case 'industry_rs': return stock.industry_rs || '';
                    case 'sub_industry_rs': return stock.sub_industry_rs || '';
                    case 'price': return formatNumber(stock.price);
                    case 'change': return formatChange(stock.change);
                    case 'percent_change': return formatChangePercent(stock.percent_change);
                    case 'volume': return formatNumber(stock.volume);
                    case 'turnover': return formatNumber(stock.turnover);
                    case 'market_cap': return formatNumber(stock.market_cap);
                    case 'no_of_trades': return formatNumber(stock.no_of_trades);
                    case 'industry_group': return stock.industry_group || '';
                    case 'sector': return stock.sector || '';
                    case 'industry': return stock.industry || '';
                    case 'sub_industry': return stock.sub_industry || '';
                    case 'open': return formatNumber(stock.open);
                    case 'high': return formatNumber(stock.high);
                    case 'low': return formatNumber(stock.low);
                    case 'price_minus_sma_10': return formatNumber(stock.price_minus_sma_10);
                    case 'price_minus_sma_21': return formatNumber(stock.price_minus_sma_21);
                    case 'price_minus_sma_50': return formatNumber(stock.price_minus_sma_50);
                    case 'price_minus_sma_150': return formatNumber(stock.price_minus_sma_150);
                    case 'price_minus_sma_200': return formatNumber(stock.price_minus_sma_200);
                    case 'fifty_two_week_high_price': return formatNumber(stock.fifty_two_week_high_price);
                    case 'fifty_two_week_low_price': return formatNumber(stock.fifty_two_week_low_price);
                    case 'average_volume_50': return formatNumber(stock.average_volume_50);
                    case 'price_vs_sma_10_percent': return formatChangePercent(stock.price_vs_sma_10_percent);
                    case 'price_vs_sma_21_percent': return formatChangePercent(stock.price_vs_sma_21_percent);
                    case 'price_vs_sma_50_percent': return formatChangePercent(stock.price_vs_sma_50_percent);
                    case 'price_vs_sma_150_percent': return formatChangePercent(stock.price_vs_sma_150_percent);
                    case 'price_vs_sma_200_percent': return formatChangePercent(stock.price_vs_sma_200_percent);
                    case 'percent_off_52w_high': return formatChangePercent(stock.percent_off_52w_high);
                    case 'percent_off_52w_low': return formatChangePercent(stock.percent_off_52w_low);
                    case 'vol_diff_50_percent': return formatChangePercent(stock.vol_diff_50_percent);
                    case 'trading_view_symbol': return stock.trading_view_symbol || '';
                    default: return '';
                }
            });
        });

        const filename = `REBH_Stocks_${new Date().toISOString().split('T')[0]}`;

        if (format === 'csv' || format === 'txt') {
            const separator = format === 'csv' ? ',' : '\t';
            const content = [
                headerLabels.join(separator),
                ...dataRows.map(row => row.map(cell => {
                    const cellStr = String(cell);
                    if (cellStr.includes(separator) || cellStr.includes('"') || cellStr.includes('\n')) {
                        return `"${cellStr.replace(/"/g, '""')}"`;
                    }
                    return cellStr;
                }).join(separator))
            ].join('\n');

            const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${filename}.${format === 'csv' ? 'csv' : 'txt'}`;
            link.click();
        } else {
            // Excel Export
            const worksheet = XLSX.utils.aoa_to_sheet([headerLabels, ...dataRows]);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Stocks");

            if (format === 'xls') {
                XLSX.writeFile(workbook, `${filename}.xls`, { bookType: 'biff8' });
            } else {
                XLSX.writeFile(workbook, `${filename}.xlsx`, { bookType: 'xlsx' });
            }
        }
        setShowExportMenu(false);
    }, [filteredAndSortedStocks, visibleColumns, metadata]);

    // Filter columns based on search
    const filteredColumnDefinitions = useMemo(() => {
        if (!columnSearch.trim()) return columnDefinitions;

        const searchTerm = columnSearch.toLowerCase();
        return columnDefinitions.filter(col =>
            col.label.toLowerCase().includes(searchTerm) ||
            col.key.toLowerCase().includes(searchTerm)
        );
    }, [columnDefinitions, columnSearch]);

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <h2 className="mt-4 text-lg font-semibold text-gray-700">Loading Data...</h2>
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

    if (stocks.length === 0) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center text-gray-500">
                <h2 className="text-lg font-semibold">No Data Available</h2>
                <p>No stock data found</p>
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
                {/* Sidebar Filters */}
                <div
                    className={`
                        bg-white border-r border-gray-200 h-[calc(100vh-64px)] flex flex-col transition-all duration-300 ease-in-out overflow-hidden
                        ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full opacity-0'}
                    `}
                >
                    {/* Header with Export & Columns */}
                    <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 bg-white">
                        <div className="flex space-x-2">
                            <div className="relative flex-1" ref={exportMenuRef}>
                                <button
                                    onClick={() => setShowExportMenu(!showExportMenu)}
                                    className="w-full px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2 transition-all whitespace-nowrap"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span>Export</span>
                                    <svg className={`w-3 h-3 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                <ExportMenu
                                    show={showExportMenu}
                                    onExport={handleExport}
                                    onClose={() => setShowExportMenu(false)}
                                    filteredStocks={filteredAndSortedStocks}
                                />
                            </div>

                            <div className="relative flex-1">
                                <button
                                    onClick={() => setShowColumnMenu(!showColumnMenu)}
                                    className="w-full px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 flex items-center justify-center space-x-2 transition-all whitespace-nowrap"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    <span>Cols</span>
                                </button>

                                <ColumnSelector
                                    show={showColumnMenu}
                                    columnDefinitions={columnDefinitions}
                                    visibleColumns={visibleColumns}
                                    toggleColumn={toggleColumn}
                                    setVisibleColumns={setVisibleColumns}
                                    onClose={() => setShowColumnMenu(false)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Scrollable Filters Area */}
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                        {/* Quick Search */}
                        <div className="mb-4 space-y-2">
                            <div className="relative">
                                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search Symbol..."
                                    value={filters.symbol}
                                    onChange={(e) => setFilters(prev => ({ ...prev, symbol: e.target.value }))}
                                    className="w-full pl-10 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all outline-none"
                                />
                            </div>
                            <div className="relative">
                                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search Name..."
                                    value={filters.name}
                                    onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full pl-10 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all outline-none"
                                />
                            </div>
                        </div>

                        {/* Industry Filters - Multi-Select */}
                        <FilterAccordion title="INDUSTRY FILTERS" defaultOpen={false} collapseSignal={collapseSignal}>
                            <div className="space-y-3">
                                {/* Sector - Multi Select */}
                                <CustomMultiSelect
                                    options={filterOptions.sectors}
                                    selected={filters.sector}
                                    onChange={(value) => setFilters(prev => ({ ...prev, sector: value }))}
                                    placeholder={`Sectors (${filterOptions.sectors.length})`}
                                    icon={Filter}
                                />

                                {/* Industry Group - Multi Select */}
                                <CustomMultiSelect
                                    options={filterOptions.industryGroups}
                                    selected={filters.industry_group}
                                    onChange={(value) => setFilters(prev => ({ ...prev, industry_group: value }))}
                                    placeholder={`Industry Groups (${filterOptions.industryGroups.length})`}
                                    icon={Filter}
                                />

                                {/* Industry - Multi Select */}
                                <CustomMultiSelect
                                    options={filterOptions.industries}
                                    selected={filters.industry}
                                    onChange={(value) => setFilters(prev => ({ ...prev, industry: value }))}
                                    placeholder={`Industries (${filterOptions.industries.length})`}
                                    icon={Filter}
                                />

                                {/* Sub Industry - Multi Select */}
                                <CustomMultiSelect
                                    options={filterOptions.subIndustries}
                                    selected={filters.sub_industry}
                                    onChange={(value) => setFilters(prev => ({ ...prev, sub_industry: value }))}
                                    placeholder={`Sub Industries (${filterOptions.subIndustries.length})`}
                                    icon={Filter}
                                />
                            </div>
                        </FilterAccordion>

                        {/* SmartSelect Ratings */}
                        <FilterAccordion title="SMARTSELECT RATINGS" collapseSignal={collapseSignal}>
                            <RangeFilter
                                label="RS Rating (0-99)"
                                minValue={filters.rs_rating_min}
                                maxValue={filters.rs_rating_max}
                                onMinChange={(value) => setFilters(prev => ({ ...prev, rs_rating_min: value }))}
                                onMaxChange={(value) => setFilters(prev => ({ ...prev, rs_rating_max: value }))}
                            />
                            <CheckboxGroup
                                label="Acc/Dis Rating"
                                options={['A', 'B', 'C', 'D', 'E']}
                                selected={filters.acc_dis_rating}
                                onChange={(value) => setFilters(prev => ({ ...prev, acc_dis_rating: value }))}
                            />
                            <CheckboxGroup
                                label="Industry Group RS"
                                options={['A', 'B', 'C', 'D', 'E']}
                                selected={filters.industry_group_rs}
                                onChange={(value) => setFilters(prev => ({ ...prev, industry_group_rs: value }))}
                            />
                            <CheckboxGroup
                                label="Sector RS"
                                options={['A', 'B', 'C', 'D', 'E']}
                                selected={filters.sector_rs}
                                onChange={(value) => setFilters(prev => ({ ...prev, sector_rs: value }))}
                            />
                            <CheckboxGroup
                                label="Industry RS"
                                options={['A', 'B', 'C', 'D', 'E']}
                                selected={filters.industry_rs}
                                onChange={(value) => setFilters(prev => ({ ...prev, industry_rs: value }))}
                            />
                            <CheckboxGroup
                                label="Sub Industry RS"
                                options={['A', 'B', 'C', 'D', 'E']}
                                selected={filters.sub_industry_rs}
                                onChange={(value) => setFilters(prev => ({ ...prev, sub_industry_rs: value }))}
                            />
                        </FilterAccordion>

                        {/* Price & Volume */}
                        <FilterAccordion title="PRICE & VOLUME" collapseSignal={collapseSignal}>
                            <RangeFilter
                                label="Close Price"
                                minValue={filters.price_min}
                                maxValue={filters.price_max}
                                onMinChange={(value) => setFilters(prev => ({ ...prev, price_min: value }))}
                                onMaxChange={(value) => setFilters(prev => ({ ...prev, price_max: value }))}
                            />
                            <RangeFilter
                                label="Change"
                                minValue={filters.change_min}
                                maxValue={filters.change_max}
                                onMinChange={(value) => setFilters(prev => ({ ...prev, change_min: value }))}
                                onMaxChange={(value) => setFilters(prev => ({ ...prev, change_max: value }))}
                            />
                            <RangeFilter
                                label="% Change"
                                minValue={filters.percent_change_min}
                                maxValue={filters.percent_change_max}
                                onMinChange={(value) => setFilters(prev => ({ ...prev, percent_change_min: value }))}
                                onMaxChange={(value) => setFilters(prev => ({ ...prev, percent_change_max: value }))}
                            />
                            <RangeFilter
                                label="Volume"
                                minValue={filters.volume_min}
                                maxValue={filters.volume_max}
                                onMinChange={(value) => setFilters(prev => ({ ...prev, volume_min: value }))}
                                onMaxChange={(value) => setFilters(prev => ({ ...prev, volume_max: value }))}
                            />
                            <RangeFilter
                                label="Turnover"
                                minValue={filters.turnover_min}
                                maxValue={filters.turnover_max}
                                onMinChange={(value) => setFilters(prev => ({ ...prev, turnover_min: value }))}
                                onMaxChange={(value) => setFilters(prev => ({ ...prev, turnover_max: value }))}
                            />
                            <RangeFilter
                                label="Market Cap"
                                minValue={filters.market_cap_min}
                                maxValue={filters.market_cap_max}
                                onMinChange={(value) => setFilters(prev => ({ ...prev, market_cap_min: value }))}
                                onMaxChange={(value) => setFilters(prev => ({ ...prev, market_cap_max: value }))}
                            />
                            <RangeFilter
                                label="No. of Trades"
                                minValue={filters.no_of_trades_min}
                                maxValue={filters.no_of_trades_max}
                                onMinChange={(value) => setFilters(prev => ({ ...prev, no_of_trades_min: value }))}
                                onMaxChange={(value) => setFilters(prev => ({ ...prev, no_of_trades_max: value }))}
                            />
                        </FilterAccordion>

                        {/* Moving Averages - Percentage */}
                        <FilterAccordion title="MOVING AVERAGES %" collapseSignal={collapseSignal}>
                            <RangeFilter
                                label="vs SMA 10%"
                                minValue={filters.price_vs_sma_10_min}
                                maxValue={filters.price_vs_sma_10_max}
                                onMinChange={(value) => setFilters(prev => ({ ...prev, price_vs_sma_10_min: value }))}
                                onMaxChange={(value) => setFilters(prev => ({ ...prev, price_vs_sma_10_max: value }))}
                            />
                            <RangeFilter
                                label="vs SMA 21%"
                                minValue={filters.price_vs_sma_21_min}
                                maxValue={filters.price_vs_sma_21_max}
                                onMinChange={(value) => setFilters(prev => ({ ...prev, price_vs_sma_21_min: value }))}
                                onMaxChange={(value) => setFilters(prev => ({ ...prev, price_vs_sma_21_max: value }))}
                            />
                            <RangeFilter
                                label="vs SMA 50%"
                                minValue={filters.price_vs_sma_50_min}
                                maxValue={filters.price_vs_sma_50_max}
                                onMinChange={(value) => setFilters(prev => ({ ...prev, price_vs_sma_50_min: value }))}
                                onMaxChange={(value) => setFilters(prev => ({ ...prev, price_vs_sma_50_max: value }))}
                            />
                            <RangeFilter
                                label="vs SMA 150%"
                                minValue={filters.price_vs_sma_150_min}
                                maxValue={filters.price_vs_sma_150_max}
                                onMinChange={(value) => setFilters(prev => ({ ...prev, price_vs_sma_150_min: value }))}
                                onMaxChange={(value) => setFilters(prev => ({ ...prev, price_vs_sma_150_max: value }))}
                            />
                            <RangeFilter
                                label="vs SMA 200%"
                                minValue={filters.price_vs_sma_200_min}
                                maxValue={filters.price_vs_sma_200_max}
                                onMinChange={(value) => setFilters(prev => ({ ...prev, price_vs_sma_200_min: value }))}
                                onMaxChange={(value) => setFilters(prev => ({ ...prev, price_vs_sma_200_max: value }))}
                            />
                        </FilterAccordion>

                        {/* 52 Week Analysis */}
                        <FilterAccordion title="52 WEEK ANALYSIS" collapseSignal={collapseSignal}>
                            <RangeFilter
                                label="52W High"
                                minValue={filters.fifty_two_week_high_min}
                                maxValue={filters.fifty_two_week_high_max}
                                onMinChange={(value) => setFilters(prev => ({ ...prev, fifty_two_week_high_min: value }))}
                                onMaxChange={(value) => setFilters(prev => ({ ...prev, fifty_two_week_high_max: value }))}
                            />
                            <RangeFilter
                                label="52W Low"
                                minValue={filters.fifty_two_week_low_min}
                                maxValue={filters.fifty_two_week_low_max}
                                onMinChange={(value) => setFilters(prev => ({ ...prev, fifty_two_week_low_min: value }))}
                                onMaxChange={(value) => setFilters(prev => ({ ...prev, fifty_two_week_low_max: value }))}
                            />
                            <RangeFilter
                                label="% Off 52W High"
                                minValue={filters.percent_off_52w_high_min}
                                maxValue={filters.percent_off_52w_high_max}
                                onMinChange={(value) => setFilters(prev => ({ ...prev, percent_off_52w_high_min: value }))}
                                onMaxChange={(value) => setFilters(prev => ({ ...prev, percent_off_52w_high_max: value }))}
                            />
                            <RangeFilter
                                label="% Off 52W Low"
                                minValue={filters.percent_off_52w_low_min}
                                maxValue={filters.percent_off_52w_low_max}
                                onMinChange={(value) => setFilters(prev => ({ ...prev, percent_off_52w_low_min: value }))}
                                onMaxChange={(value) => setFilters(prev => ({ ...prev, percent_off_52w_low_max: value }))}
                            />
                        </FilterAccordion>

                        {/* Volume Analysis */}
                        <FilterAccordion title="VOLUME ANALYSIS" collapseSignal={collapseSignal}>
                            <RangeFilter
                                label="Avg Volume 50"
                                minValue={filters.average_volume_50_min}
                                maxValue={filters.average_volume_50_max}
                                onMinChange={(value) => setFilters(prev => ({ ...prev, average_volume_50_min: value }))}
                                onMaxChange={(value) => setFilters(prev => ({ ...prev, average_volume_50_max: value }))}
                            />
                            <RangeFilter
                                label="Vol Diff 50%"
                                minValue={filters.vol_diff_50_percent_min}
                                maxValue={filters.vol_diff_50_percent_max}
                                onMinChange={(value) => setFilters(prev => ({ ...prev, vol_diff_50_percent_min: value }))}
                                onMaxChange={(value) => setFilters(prev => ({ ...prev, vol_diff_50_percent_max: value }))}
                            />
                        </FilterAccordion>

                        {/* Open/High/Low */}
                        <FilterAccordion title="OPEN/HIGH/LOW" collapseSignal={collapseSignal}>
                            <RangeFilter
                                label="Open"
                                minValue={filters.open_min}
                                maxValue={filters.open_max}
                                onMinChange={(value) => setFilters(prev => ({ ...prev, open_min: value }))}
                                onMaxChange={(value) => setFilters(prev => ({ ...prev, open_max: value }))}
                            />
                            <RangeFilter
                                label="High"
                                minValue={filters.high_min}
                                maxValue={filters.high_max}
                                onMinChange={(value) => setFilters(prev => ({ ...prev, high_min: value }))}
                                onMaxChange={(value) => setFilters(prev => ({ ...prev, high_max: value }))}
                            />
                            <RangeFilter
                                label="Low"
                                minValue={filters.low_min}
                                maxValue={filters.low_max}
                                onMinChange={(value) => setFilters(prev => ({ ...prev, low_min: value }))}
                                onMaxChange={(value) => setFilters(prev => ({ ...prev, low_max: value }))}
                            />
                        </FilterAccordion>
                    </div>

                    {/* Sticky Footer - Collapse All & Clear All Filters */}
                    <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                        <div className="flex flex-col space-y-3">
                            <button
                                onClick={() => setCollapseSignal(prev => prev + 1)}
                                className="w-full px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all flex items-center justify-center space-x-2 border border-gray-200"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                                <span>Collapse All Sections</span>
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

                {/* Main Content */}
                <div className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden">
                    {/* Active Filters Bar */}
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
                                        Market Results: <span className="font-bold">{filteredAndSortedStocks.length}</span> stocks
                                    </span>
                                    {activeFilters.length > 0 && (
                                        <span className="text-sm text-blue-600">• {activeFilters.length} filters active</span>
                                    )}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {metadata?.datetime}
                                </div>
                            </div>
                        </div>

                        {/* Active Filters */}
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

                    {/* Table Container - Compact View */}
                    <div className="flex-1 overflow-auto border-t border-gray-200 bg-white">
                        <table className="min-w-full bg-white text-[10px] border-separate border-spacing-0">
                            <thead className="bg-gray-50 sticky top-0 z-40 shadow-sm">
                                <tr>
                                    {columnDefinitions
                                        .filter(col => visibleColumns[col.visibleKey])
                                        .map((col) => {
                                            const sortIndex = sortConfigs.findIndex(c => c.key === col.key);
                                            const isSorted = sortIndex !== -1;
                                            const sortPriority = sortIndex + 1;
                                            const sortDir = isSorted ? sortConfigs[sortIndex].direction : null;

                                            let stickyClass = '';
                                            let stickyStyle: React.CSSProperties = {};

                                            if (col.key === 'symbol') {
                                                stickyClass = 'sticky left-0 z-50 bg-gray-50 border-r border-gray-200 min-w-[70px] w-[70px] max-w-[70px]';
                                            } else if (col.key === 'name') {
                                                stickyClass = 'sticky z-50 bg-gray-50 border-r border-gray-200 min-w-[180px] w-[180px] max-w-[180px]';
                                                if (visibleColumns['symbol']) {
                                                    stickyClass += ' left-[70px]';
                                                } else {
                                                    stickyClass += ' left-0';
                                                }
                                            }

                                            return (
                                                <th
                                                    key={col.key}
                                                    className={`
                                                        px-1 py-1 text-center text-[12px] font-sans font-bold text-gray-900 border-b border-gray-200 cursor-pointer 
                                                        hover:bg-gray-100 transition-colors whitespace-nowrap overflow-hidden text-ellipsis
                                                        ${stickyClass}
                                                        ${isSorted ? 'bg-blue-50 text-blue-900 border-b-2 border-b-blue-500' : ''}
                                                    `}
                                                    style={stickyStyle}
                                                    onClick={() => handleSort(col.key)}
                                                >
                                                    <div className="flex items-center justify-center space-x-1">
                                                        <span className="font-semibold">{col.label}</span>
                                                        <div className="flex flex-col">
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
                                                        {isSorted && (
                                                            <span className="ml-1 inline-flex items-center justify-center w-4 h-4 bg-blue-600 text-white text-[10px] font-bold rounded-full flex-shrink-0">
                                                                {sortPriority}
                                                            </span>
                                                        )}
                                                    </div>
                                                </th>
                                            );
                                        })
                                    }
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredAndSortedStocks.map((stock) => {
                                    const cleanSym = cleanSymbol(stock.symbol);
                                    const changeNum = parseFormattedNumber(stock.change, true);
                                    const changePercentNum = parseFormattedNumber(stock.percent_change);
                                    const isChangeNegative = changeNum < 0;
                                    const isPercentNegative = changePercentNum < 0;

                                    return (
                                        <tr key={stock.symbol} className="hover:bg-gray-50 transition-colors group">
                                            {columnDefinitions
                                                .filter(col => visibleColumns[col.visibleKey])
                                                .map((col) => {
                                                    let content;
                                                    let stickyClass = '';

                                                    if (col.key === 'symbol') {
                                                        stickyClass = 'sticky left-0 z-30 bg-white group-hover:bg-gray-50 border-r border-gray-100 min-w-[70px] w-[70px] max-w-[70px]';
                                                    } else if (col.key === 'name') {
                                                        stickyClass = 'sticky z-30 bg-white group-hover:bg-gray-50 border-r border-gray-100 min-w-[180px] w-[180px] max-w-[180px]';
                                                        if (visibleColumns['symbol']) {
                                                            stickyClass += ' left-[70px]';
                                                        } else {
                                                            stickyClass += ' left-0';
                                                        }
                                                    }

                                                    switch (col.key) {
                                                        case 'symbol':
                                                            content = (
                                                                <Link
                                                                    href={`/stocks/${cleanSym}/financials?period=annual&country=Saudi Arabia`}
                                                                    className="font-bold text-blue-600 hover:text-blue-800 hover:underline block truncate"
                                                                >
                                                                    {cleanSym}
                                                                </Link>
                                                            );
                                                            break;

                                                        case 'name':
                                                            content = (
                                                                <Link
                                                                    href={`/stocks/${cleanSym}/financials?period=annual&country=Saudi Arabia`}
                                                                    className="text-gray-900 font-medium hover:text-blue-600 block truncate"
                                                                    title={cleanName(stock.name)}
                                                                >
                                                                    {cleanName(stock.name)}
                                                                </Link>
                                                            );
                                                            break;

                                                        case 'charts':
                                                            content = (
                                                                <button className="text-gray-400 hover:text-blue-600">
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                                    </svg>
                                                                </button>
                                                            );
                                                            break;

                                                        case 'rs_rating':
                                                            content = (
                                                                <span className={`
                                  font-bold
                                  ${(stock.rs_rating || 0) >= 80 ? 'text-green-600' :
                                                                        (stock.rs_rating || 0) >= 70 ? 'text-yellow-600' : 'text-gray-500'}
                                `}>
                                                                    {stock.rs_rating || '-'}
                                                                </span>
                                                            );
                                                            break;

                                                        case 'acc_dis_rating':
                                                            content = <RatingBadge value={stock.acc_dis_rating} />;
                                                            break;

                                                        case 'industry_group_rs':
                                                            content = <RatingBadge value={stock.industry_group_rs} />;
                                                            break;

                                                        case 'sector_rs':
                                                            content = <RatingBadge value={stock.sector_rs} />;
                                                            break;

                                                        case 'industry_rs':
                                                            content = <RatingBadge value={stock.industry_rs} />;
                                                            break;

                                                        case 'sub_industry_rs':
                                                            content = <RatingBadge value={stock.sub_industry_rs} />;
                                                            break;

                                                        case 'price':
                                                            content = <span className="font-medium">{formatNumber(stock.price)}</span>;
                                                            break;

                                                        case 'change':
                                                            content = <span className={isChangeNegative ? 'text-red-600' : 'text-green-600'}>
                                                                {formatChange(stock.change)}
                                                            </span>;
                                                            break;

                                                        case 'percent_change':
                                                            content = <span className={isPercentNegative ? 'text-red-600' : 'text-green-600'}>
                                                                {formatChangePercent(stock.percent_change)}
                                                            </span>;
                                                            break;

                                                        case 'volume':
                                                            content = <span>{formatNumber(stock.volume)}</span>;
                                                            break;

                                                        case 'turnover':
                                                            content = <span className="text-gray-900">{formatNumber(stock.turnover)}</span>;
                                                            break;

                                                        case 'no_of_trades':
                                                            content = <span className="text-gray-900">{formatNumber(stock.no_of_trades)}</span>;
                                                            break;

                                                        case 'market_cap':
                                                            content = <span className="text-gray-900">{displayRawValue(stock.market_cap)}</span>;
                                                            break;

                                                        case 'industry_group':
                                                            content = <span className="text-gray-900">{formatText(stock.industry_group)}</span>;
                                                            break;

                                                        case 'sector':
                                                            content = <span className="text-gray-900">{formatText(stock.sector)}</span>;
                                                            break;

                                                        case 'industry':
                                                            content = <span className="text-gray-900">{formatText(stock.industry)}</span>;
                                                            break;

                                                        case 'sub_industry':
                                                            content = <span className="text-gray-900">{formatText(stock.sub_industry)}</span>;
                                                            break;

                                                        case 'open':
                                                            content = <span className="text-gray-900">{formatNumber(stock.open)}</span>;
                                                            break;

                                                        case 'high':
                                                            content = <span className="text-gray-900">{formatNumber(stock.high)}</span>;
                                                            break;

                                                        case 'low':
                                                            content = <span className="text-gray-900">{formatNumber(stock.low)}</span>;
                                                            break;

                                                        case 'price_minus_sma_10':
                                                            content = <span className="text-gray-900">{formatNumber(stock.price_minus_sma_10)}</span>;
                                                            break;

                                                        case 'price_minus_sma_21':
                                                            content = <span className="text-gray-900">{formatNumber(stock.price_minus_sma_21)}</span>;
                                                            break;

                                                        case 'price_minus_sma_50':
                                                            content = <span className="text-gray-900">{formatNumber(stock.price_minus_sma_50)}</span>;
                                                            break;

                                                        case 'price_minus_sma_150':
                                                            content = <span className="text-gray-900">{formatNumber(stock.price_minus_sma_150)}</span>;
                                                            break;

                                                        case 'price_minus_sma_200':
                                                            content = <span className="text-gray-900">{formatNumber(stock.price_minus_sma_200)}</span>;
                                                            break;

                                                        case 'fifty_two_week_high_price':
                                                            content = <span className="text-gray-900">{formatNumber(stock.fifty_two_week_high_price)}</span>;
                                                            break;

                                                        case 'fifty_two_week_low_price':
                                                            content = <span className="text-gray-900">{formatNumber(stock.fifty_two_week_low_price)}</span>;
                                                            break;

                                                        case 'average_volume_50':
                                                            content = <span className="text-gray-900">{formatNumber(stock.average_volume_50)}</span>;
                                                            break;

                                                        case 'price_vs_sma_10_percent':
                                                            content = <span className="text-gray-900">{formatChangePercent(stock.price_vs_sma_10_percent)}</span>;
                                                            break;

                                                        case 'price_vs_sma_21_percent':
                                                            content = <span className="text-gray-900">{formatChangePercent(stock.price_vs_sma_21_percent)}</span>;
                                                            break;

                                                        case 'price_vs_sma_50_percent':
                                                            content = <span className="text-gray-900">{formatChangePercent(stock.price_vs_sma_50_percent)}</span>;
                                                            break;

                                                        case 'price_vs_sma_150_percent':
                                                            content = <span className="text-gray-900">{formatChangePercent(stock.price_vs_sma_150_percent)}</span>;
                                                            break;

                                                        case 'price_vs_sma_200_percent':
                                                            content = <span className="text-gray-900">{formatChangePercent(stock.price_vs_sma_200_percent)}</span>;
                                                            break;

                                                        case 'percent_off_52w_high':
                                                            content = <span className={(stock.percent_off_52w_high || 0) < 0 ? 'text-red-600' : 'text-gray-900'}>
                                                                {formatChangePercent(stock.percent_off_52w_high)}
                                                            </span>;
                                                            break;

                                                        case 'percent_off_52w_low':
                                                            content = <span className="text-gray-900">{formatChangePercent(stock.percent_off_52w_low)}</span>;
                                                            break;

                                                        case 'vol_diff_50_percent':
                                                            content = <span className="text-gray-900">{formatChangePercent(stock.vol_diff_50_percent)}</span>;
                                                            break;

                                                        default:
                                                            content = <span>-</span>;
                                                    }

                                                    return (
                                                        <td key={col.key} className={`px-1 py-0.5 text-center ${stickyClass}`}>
                                                            {content}
                                                        </td>
                                                    );
                                                })
                                            }
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Footer Spacer Removed */}
        </div>
    );
}