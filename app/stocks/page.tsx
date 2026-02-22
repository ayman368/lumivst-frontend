'use client';

import Link from 'next/link';
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Filter, ChevronLeft, ChevronRight, PanelLeft, Search, CheckCircle2, XCircle, Shield, TrendingUp as TrendingUpIcon } from 'lucide-react';
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

const initialFilterState: FilterState = {
    // SmartSelect Ratings
    rs_rating_min: '', rs_rating_max: '',
    acc_dis_rating: [], industry_group_rs: [], sector_rs: [], industry_rs: [], sub_industry_rs: [],

    // Price & Volume
    price_min: '', price_max: '',
    change_min: '', change_max: '',
    percent_change_min: '', percent_change_max: '',
    volume_min: '', volume_max: '',
    turnover_min: '', turnover_max: '',
    no_of_trades_min: '', no_of_trades_max: '',
    percent_off_52w_high_min: '', percent_off_52w_high_max: '',
    percent_off_52w_low_min: '', percent_off_52w_low_max: '',
    market_cap_min: '', market_cap_max: '',

    // Moving Averages - Absolute
    price_minus_sma_10_min: '', price_minus_sma_10_max: '',
    price_minus_sma_21_min: '', price_minus_sma_21_max: '',
    price_minus_sma_50_min: '', price_minus_sma_50_max: '',
    price_minus_sma_150_min: '', price_minus_sma_150_max: '',
    price_minus_sma_200_min: '', price_minus_sma_200_max: '',

    // Moving Averages - Percentage
    price_vs_sma_10_min: '', price_vs_sma_10_max: '',
    price_vs_sma_21_min: '', price_vs_sma_21_max: '',
    price_vs_sma_50_min: '', price_vs_sma_50_max: '',
    price_vs_sma_150_min: '', price_vs_sma_150_max: '',
    price_vs_sma_200_min: '', price_vs_sma_200_max: '',

    // 52 Week High/Low
    fifty_two_week_high_min: '', fifty_two_week_high_max: '',
    fifty_two_week_low_min: '', fifty_two_week_low_max: '',

    // Volume Analysis
    average_volume_50_min: '', average_volume_50_max: '',
    vol_diff_50_percent_min: '', vol_diff_50_percent_max: '',

    // Open/High/Low
    open_min: '', open_max: '',
    high_min: '', high_max: '',
    low_min: '', low_max: '',

    // Quick Filters
    symbol: '',
    name: '',
    industry_group: [],
    sector: [],
    industry: [],
    sub_industry: [],

    // === Technical Screener Filters ===
    tech_score_min: '', tech_score_max: '',
    final_signal: [], stamp_signal: [], trend_signal: [],
    rsi_55_70: [], cfg_gt_50_daily: [], cfg_gt_50_w: [],
    stamp_daily: [], stamp_weekly: [],

    rsi_14_min: '', rsi_14_max: '',
    rsi_3_min: '', rsi_3_max: '',
    sma9_rsi_min: '', sma9_rsi_max: '',
    wma45_rsi_min: '', wma45_rsi_max: '',
    ema45_rsi_min: '', ema45_rsi_max: '',
    sma3_rsi3_min: '', sma3_rsi3_max: '',
    ema20_sma3_min: '', ema20_sma3_max: '',

    sma9_close_min: '', sma9_close_max: '',
    high_sma13_min: '', high_sma13_max: '',
    low_sma13_min: '', low_sma13_max: '',
    high_sma65_min: '', high_sma65_max: '',
    low_sma65_min: '', low_sma65_max: '',
    the_number_min: '', the_number_max: '',
    the_number_hl_min: '', the_number_hl_max: '',
    the_number_ll_min: '', the_number_ll_max: '',

    rsi_14_9days_ago_min: '', rsi_14_9days_ago_max: '',
    stamp_a_value_min: '', stamp_a_value_max: '',
    stamp_s9rsi_min: '', stamp_s9rsi_max: '',
    stamp_e45cfg_min: '', stamp_e45cfg_max: '',
    stamp_e45rsi_min: '', stamp_e45rsi_max: '',
    stamp_e20sma3_min: '', stamp_e20sma3_max: '',

    cfg_daily_min: '', cfg_daily_max: '',
    cfg_sma4_min: '', cfg_sma4_max: '',
    cfg_sma9_min: '', cfg_sma9_max: '',
    cfg_sma20_min: '', cfg_sma20_max: '',
    cfg_ema20_min: '', cfg_ema20_max: '',
    cfg_ema45_min: '', cfg_ema45_max: '',
    cfg_wma45_min: '', cfg_wma45_max: '',

    sma4_min: '', sma4_max: '',
    sma9_price_min: '', sma9_price_max: '',
    sma18_min: '', sma18_max: '',
    wma45_close_min: '', wma45_close_max: '',
    cci_min: '', cci_max: '',
    cci_ema20_min: '', cci_ema20_max: '',
    aroon_up_min: '', aroon_up_max: '',
    aroon_down_min: '', aroon_down_max: '',

    rsi_w_min: '', rsi_w_max: '',
    rsi_3_w_min: '', rsi_3_w_max: '',
    sma9_rsi_w_min: '', sma9_rsi_w_max: '',
    wma45_rsi_w_min: '', wma45_rsi_w_max: '',
    ema45_rsi_w_min: '', ema45_rsi_w_max: '',
    sma3_rsi3_w_min: '', sma3_rsi3_w_max: '',
    ema20_sma3_w_min: '', ema20_sma3_w_max: '',

    sma9_close_w_min: '', sma9_close_w_max: '',
    high_sma13_w_min: '', high_sma13_w_max: '',
    low_sma13_w_min: '', low_sma13_w_max: '',
    high_sma65_w_min: '', high_sma65_w_max: '',
    low_sma65_w_min: '', low_sma65_w_max: '',
    the_number_w_min: '', the_number_w_max: '',
    the_number_hl_w_min: '', the_number_hl_w_max: '',
    the_number_ll_w_min: '', the_number_ll_w_max: '',

    rsi_14_9days_ago_w_min: '', rsi_14_9days_ago_w_max: '',
    stamp_a_value_w_min: '', stamp_a_value_w_max: '',
    stamp_s9rsi_w_min: '', stamp_s9rsi_w_max: '',
    stamp_e45cfg_w_min: '', stamp_e45cfg_w_max: '',
    stamp_e45rsi_w_min: '', stamp_e45rsi_w_max: '',
    stamp_e20sma3_w_min: '', stamp_e20sma3_w_max: '',

    cfg_w_min: '', cfg_w_max: '',
    cfg_sma4_w_min: '', cfg_sma4_w_max: '',
    cfg_sma9_w_min: '', cfg_sma9_w_max: '',
    cfg_ema20_w_min: '', cfg_ema20_w_max: '',
    cfg_ema45_w_min: '', cfg_ema45_w_max: '',
    cfg_wma45_w_min: '', cfg_wma45_w_max: '',

    close_w_min: '', close_w_max: '',
    sma4_w_min: '', sma4_w_max: '',
    sma9_w_min: '', sma9_w_max: '',
    sma18_w_min: '', sma18_w_max: '',
    wma45_close_w_min: '', wma45_close_w_max: '',
    cci_w_min: '', cci_w_max: '',
    cci_ema20_w_min: '', cci_ema20_w_max: '',
    aroon_up_w_min: '', aroon_up_w_max: '',
    aroon_down_w_min: '', aroon_down_w_max: '',
};

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

        // === Technical Screener Columns ===
        { key: 'tech_score', label: 'Tech Score', visibleKey: 'tech_score' },

        // Daily RSI
        { key: 'rsi_14', label: 'RSI(14)', visibleKey: 'rsi_14' },
        { key: 'rsi_3', label: 'RSI(3)', visibleKey: 'rsi_3' },
        { key: 'sma9_rsi', label: 'SMA9(RSI)', visibleKey: 'sma9_rsi' },
        { key: 'wma45_rsi', label: 'WMA45(RSI)', visibleKey: 'wma45_rsi' },
        { key: 'ema45_rsi', label: 'EMA45(RSI)', visibleKey: 'ema45_rsi' },
        { key: 'sma3_rsi3', label: 'SMA3(RSI3)', visibleKey: 'sma3_rsi3' },
        { key: 'ema20_sma3', label: 'EMA20(SMA3)', visibleKey: 'ema20_sma3' },

        // Daily The Number
        { key: 'sma9_close', label: 'SMA9(Close)', visibleKey: 'sma9_close' },
        { key: 'high_sma13', label: 'HIGH.SMA13', visibleKey: 'high_sma13' },
        { key: 'low_sma13', label: 'LOW.SMA13', visibleKey: 'low_sma13' },
        { key: 'high_sma65', label: 'HIGH.SMA65', visibleKey: 'high_sma65' },
        { key: 'low_sma65', label: 'LOW.SMA65', visibleKey: 'low_sma65' },
        { key: 'the_number', label: 'THE.NUMBER', visibleKey: 'the_number' },
        { key: 'the_number_hl', label: 'THE.NUMBER.HIGH', visibleKey: 'the_number_hl' },
        { key: 'the_number_ll', label: 'THE.NUMBER.LOW', visibleKey: 'the_number_ll' },

        // Daily STAMP
        { key: 'rsi_14_9days_ago', label: 'RSI[9]', visibleKey: 'rsi_14_9days_ago' },
        { key: 'stamp_a_value', label: 'STAMP.A', visibleKey: 'stamp_a_value' },
        { key: 'stamp_s9rsi', label: 'STAMP.SMA9(RSI)', visibleKey: 'stamp_s9rsi' },
        { key: 'stamp_e45cfg', label: 'STAMP.EMA45(CFG)', visibleKey: 'stamp_e45cfg' },
        { key: 'stamp_e45rsi', label: 'STAMP.EMA45(RSI)', visibleKey: 'stamp_e45rsi' },
        { key: 'stamp_e20sma3', label: 'STAMP.EMA20(SMA3)', visibleKey: 'stamp_e20sma3' },

        // Daily CFG
        { key: 'cfg_daily', label: 'CFG', visibleKey: 'cfg_daily' },
        { key: 'cfg_sma4', label: 'CFG.SMA4', visibleKey: 'cfg_sma4' },
        { key: 'cfg_sma9', label: 'CFG.SMA9', visibleKey: 'cfg_sma9' },
        { key: 'cfg_sma20', label: 'CFG.SMA20', visibleKey: 'cfg_sma20' },
        { key: 'cfg_ema20', label: 'CFG.EMA20', visibleKey: 'cfg_ema20' },
        { key: 'cfg_ema45', label: 'CFG.EMA45', visibleKey: 'cfg_ema45' },
        { key: 'cfg_wma45', label: 'CFG.WMA45', visibleKey: 'cfg_wma45' },

        // Daily Trend
        { key: 'sma4', label: 'SMA4', visibleKey: 'sma4' },
        { key: 'sma9_price', label: 'SMA9(Price)', visibleKey: 'sma9_price' },
        { key: 'sma18', label: 'SMA18', visibleKey: 'sma18' },
        { key: 'wma45_close', label: 'WMA45(Price)', visibleKey: 'wma45_close' },
        { key: 'cci', label: 'CCI(14)', visibleKey: 'cci' },
        { key: 'cci_ema20', label: 'CCI.EMA20', visibleKey: 'cci_ema20' },
        { key: 'aroon_up', label: 'AROON.UP', visibleKey: 'aroon_up' },
        { key: 'aroon_down', label: 'AROON.DOWN', visibleKey: 'aroon_down' },

        // Weekly RSI
        { key: 'rsi_w', label: 'RSI(14)(W)', visibleKey: 'rsi_w' },
        { key: 'rsi_3_w', label: 'RSI(3)(W)', visibleKey: 'rsi_3_w' },
        { key: 'sma9_rsi_w', label: 'SMA9(RSI)(W)', visibleKey: 'sma9_rsi_w' },
        { key: 'wma45_rsi_w', label: 'WMA45(RSI)(W)', visibleKey: 'wma45_rsi_w' },
        { key: 'ema45_rsi_w', label: 'EMA45(RSI)(W)', visibleKey: 'ema45_rsi_w' },
        { key: 'sma3_rsi3_w', label: 'SMA3(RSI3)(W)', visibleKey: 'sma3_rsi3_w' },
        { key: 'ema20_sma3_w', label: 'EMA20(SMA3)(W)', visibleKey: 'ema20_sma3_w' },

        // Weekly The Number
        { key: 'sma9_close_w', label: 'SMA9(Close)(W)', visibleKey: 'sma9_close_w' },
        { key: 'high_sma13_w', label: 'HIGH.SMA13(W)', visibleKey: 'high_sma13_w' },
        { key: 'low_sma13_w', label: 'LOW.SMA13(W)', visibleKey: 'low_sma13_w' },
        { key: 'high_sma65_w', label: 'HIGH.SMA65(W)', visibleKey: 'high_sma65_w' },
        { key: 'low_sma65_w', label: 'LOW.SMA65(W)', visibleKey: 'low_sma65_w' },
        { key: 'the_number_w', label: 'THE.NUMBER(W)', visibleKey: 'the_number_w' },
        { key: 'the_number_hl_w', label: 'THE.NUMBER.HIGH(W)', visibleKey: 'the_number_hl_w' },
        { key: 'the_number_ll_w', label: 'THE.NUMBER.LOW(W)', visibleKey: 'the_number_ll_w' },

        // Weekly STAMP
        { key: 'rsi_14_9days_ago_w', label: 'RSI[9](W)', visibleKey: 'rsi_14_9days_ago_w' },
        { key: 'stamp_a_value_w', label: 'STAMP.A(W)', visibleKey: 'stamp_a_value_w' },
        { key: 'stamp_s9rsi_w', label: 'STAMP.SMA9(RSI)(W)', visibleKey: 'stamp_s9rsi_w' },
        { key: 'stamp_e45cfg_w', label: 'STAMP.EMA45(CFG)(W)', visibleKey: 'stamp_e45cfg_w' },
        { key: 'stamp_e45rsi_w', label: 'STAMP.EMA45(RSI)(W)', visibleKey: 'stamp_e45rsi_w' },
        { key: 'stamp_e20sma3_w', label: 'STAMP.EMA20(SMA3)(W)', visibleKey: 'stamp_e20sma3_w' },

        // Weekly CFG
        { key: 'cfg_w', label: 'CFG(W)', visibleKey: 'cfg_w' },
        { key: 'cfg_sma4_w', label: 'CFG.SMA4(W)', visibleKey: 'cfg_sma4_w' },
        { key: 'cfg_sma9_w', label: 'CFG.SMA9(W)', visibleKey: 'cfg_sma9_w' },
        { key: 'cfg_ema20_w', label: 'CFG.EMA20(W)', visibleKey: 'cfg_ema20_w' },
        { key: 'cfg_ema45_w', label: 'CFG.EMA45(W)', visibleKey: 'cfg_ema45_w' },
        { key: 'cfg_wma45_w', label: 'CFG.WMA45(W)', visibleKey: 'cfg_wma45_w' },

        // Weekly Trend
        { key: 'close_w', label: 'Close(W)', visibleKey: 'close_w' },
        { key: 'sma4_w', label: 'SMA4(W)', visibleKey: 'sma4_w' },
        { key: 'sma9_w', label: 'SMA9(W)', visibleKey: 'sma9_w' },
        { key: 'sma18_w', label: 'SMA18(W)', visibleKey: 'sma18_w' },
        { key: 'wma45_close_w', label: 'WMA45(Price)(W)', visibleKey: 'wma45_close_w' },
        { key: 'cci_w', label: 'CCI(14)(W)', visibleKey: 'cci_w' },
        { key: 'cci_ema20_w', label: 'CCI.EMA20(W)', visibleKey: 'cci_ema20_w' },
        { key: 'aroon_up_w', label: 'AROON.UP(W)', visibleKey: 'aroon_up_w' },
        { key: 'aroon_down_w', label: 'AROON.DOWN(W)', visibleKey: 'aroon_down_w' },

        // Signals
        { key: 'final_signal', label: 'FINAL.SIGNAL', visibleKey: 'final_signal' },
        { key: 'stamp_signal', label: 'STAMP Signal', visibleKey: 'stamp_signal' },
        { key: 'trend_signal', label: 'TREND Signal', visibleKey: 'trend_signal' },
        { key: 'rsi_55_70', label: 'RSI 55-70', visibleKey: 'rsi_55_70' },
        { key: 'cfg_gt_50_daily', label: 'CFG>50 Daily', visibleKey: 'cfg_gt_50_daily' },
        { key: 'cfg_gt_50_w', label: 'CFG>50 Weekly', visibleKey: 'cfg_gt_50_w' },
    ];

    // Column visibility state
    const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
        // Build defaults: first 15 columns visible, all new tech screener columns hidden
        const defaultVisible: Record<string, boolean> = {};
        columnDefinitions.forEach((col, index) => {
            defaultVisible[col.visibleKey] = index < 15;
        });
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('stocksVisibleColumns');
            if (saved) {
                try {
                    const parsed: Record<string, boolean> = JSON.parse(saved);
                    // Merge: defaults provide fallback for any new columns not yet saved
                    return { ...defaultVisible, ...parsed };
                } catch { /* ignore corrupt data */ }
            }
        }
        return defaultVisible;
    });

    // Filter State
    const [filters, setFilters] = useState<FilterState>(initialFilterState);

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
        setFilters(initialFilterState);
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

                const [pricesRes, rsRes, techRes] = await Promise.all([
                    fetch(`${API_URL}/api/prices/latest`, { cache: 'no-store', headers }),
                    fetch(`${API_URL}/api/rs-v2/latest?limit=1000`, { cache: 'no-store', headers }),
                    fetch(`${API_URL}/api/technical-screener/screener?limit=1000`, { cache: 'no-store', headers })
                ]);

                if (!pricesRes.ok) throw new Error(`Failed to fetch prices: ${pricesRes.status}`);

                const pricesData = await pricesRes.json();
                const rsData = rsRes.ok ? await rsRes.json() : { data: [] };
                const techData = techRes.ok ? await techRes.json() : { data: [] };

                const rsMap = new Map((rsData.data || []).map((item: any) => [String(item.symbol), item]));
                const techMap = new Map((techData.data || []).map((item: any) => [String(item.symbol), item]));

                const mappedStocks = (pricesData.data || []).map((item: any) => {
                    const symbolStr = String(item.symbol);
                    const rsInfo: any = rsMap.get(symbolStr) || {};
                    const techInfo: any = techMap.get(symbolStr) || {};

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

                        // Technical Screener data
                        tech_score: techInfo.score ?? undefined,
                        rsi_14: techInfo.rsi_14 ?? null,
                        rsi_3: techInfo.rsi_3 ?? null,
                        sma9_rsi: techInfo.sma9_rsi ?? null,
                        wma45_rsi: techInfo.wma45_rsi ?? null,
                        ema45_rsi: techInfo.ema45_rsi ?? null,
                        sma3_rsi3: techInfo.sma3_rsi3 ?? null,
                        ema20_sma3: techInfo.ema20_sma3 ?? null,
                        sma9_close: techInfo.sma9_close ?? null,
                        high_sma13: techInfo.high_sma13 ?? null,
                        low_sma13: techInfo.low_sma13 ?? null,
                        high_sma65: techInfo.high_sma65 ?? null,
                        low_sma65: techInfo.low_sma65 ?? null,
                        the_number: techInfo.the_number ?? null,
                        the_number_hl: techInfo.the_number_hl ?? null,
                        the_number_ll: techInfo.the_number_ll ?? null,
                        rsi_14_9days_ago: techInfo.rsi_14_9days_ago ?? null,
                        stamp_a_value: techInfo.stamp_a_value ?? null,
                        stamp_s9rsi: techInfo.stamp_s9rsi ?? null,
                        stamp_e45cfg: techInfo.stamp_e45cfg ?? null,
                        stamp_e45rsi: techInfo.stamp_e45rsi ?? null,
                        stamp_e20sma3: techInfo.stamp_e20sma3 ?? null,
                        cfg_daily: techInfo.cfg_daily ?? null,
                        cfg_sma4: techInfo.cfg_sma4 ?? null,
                        cfg_sma9: techInfo.cfg_sma9 ?? null,
                        cfg_sma20: techInfo.cfg_sma20 ?? null,
                        cfg_ema20: techInfo.cfg_ema20 ?? null,
                        cfg_ema45: techInfo.cfg_ema45 ?? null,
                        cfg_wma45: techInfo.cfg_wma45 ?? null,
                        sma4: techInfo.sma4 ?? null,
                        sma9_price: techInfo.sma9 ?? null,
                        sma18: techInfo.sma18 ?? null,
                        wma45_close: techInfo.wma45_close ?? null,
                        cci: techInfo.cci ?? null,
                        cci_ema20: techInfo.cci_ema20 ?? null,
                        aroon_up: techInfo.aroon_up ?? null,
                        aroon_down: techInfo.aroon_down ?? null,
                        rsi_w: techInfo.rsi_w ?? null,
                        rsi_3_w: techInfo.rsi_3_w ?? null,
                        sma9_rsi_w: techInfo.sma9_rsi_w ?? null,
                        wma45_rsi_w: techInfo.wma45_rsi_w ?? null,
                        ema45_rsi_w: techInfo.ema45_rsi_w ?? null,
                        sma3_rsi3_w: techInfo.sma3_rsi3_w ?? null,
                        ema20_sma3_w: techInfo.ema20_sma3_w ?? null,
                        sma9_close_w: techInfo.sma9_close_w ?? null,
                        high_sma13_w: techInfo.high_sma13_w ?? null,
                        low_sma13_w: techInfo.low_sma13_w ?? null,
                        high_sma65_w: techInfo.high_sma65_w ?? null,
                        low_sma65_w: techInfo.low_sma65_w ?? null,
                        the_number_w: techInfo.the_number_w ?? null,
                        the_number_hl_w: techInfo.the_number_hl_w ?? null,
                        the_number_ll_w: techInfo.the_number_ll_w ?? null,
                        rsi_14_9days_ago_w: techInfo.rsi_14_9days_ago_w ?? null,
                        stamp_a_value_w: techInfo.stamp_a_value_w ?? null,
                        stamp_s9rsi_w: techInfo.stamp_s9rsi_w ?? null,
                        stamp_e45cfg_w: techInfo.stamp_e45cfg_w ?? null,
                        stamp_e45rsi_w: techInfo.stamp_e45rsi_w ?? null,
                        stamp_e20sma3_w: techInfo.stamp_e20sma3_w ?? null,
                        cfg_w: techInfo.cfg_w ?? null,
                        cfg_sma4_w: techInfo.cfg_sma4_w ?? null,
                        cfg_sma9_w: techInfo.cfg_sma9_w ?? null,
                        cfg_ema20_w: techInfo.cfg_ema20_w ?? null,
                        cfg_ema45_w: techInfo.cfg_ema45_w ?? null,
                        cfg_wma45_w: techInfo.cfg_wma45_w ?? null,
                        close_w: techInfo.close_w ?? techInfo.close ?? null,
                        sma4_w: techInfo.sma4_w ?? null,
                        sma9_w: techInfo.sma9_w ?? null,
                        sma18_w: techInfo.sma18_w ?? null,
                        wma45_close_w: techInfo.wma45_close_w ?? null,
                        cci_w: techInfo.cci_w ?? null,
                        cci_ema20_w: techInfo.cci_ema20_w ?? null,
                        aroon_up_w: techInfo.aroon_up_w ?? null,
                        aroon_down_w: techInfo.aroon_down_w ?? null,
                        stamp: techInfo.stamp ?? false,
                        stamp_daily: techInfo.stamp_daily ?? false,
                        stamp_weekly: techInfo.stamp_weekly ?? false,
                        trend_signal: techInfo.trend_signal ?? false,
                        final_signal: techInfo.final_signal ?? false,
                        rsi_55_70: techInfo.rsi_55_70 ?? false,
                        cfg_gt_50_daily: techInfo.cfg_gt_50_daily ?? false,
                        cfg_gt_50_w: techInfo.cfg_gt_50_w ?? false,
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

            // === Technical Screener Filters ===

            // Helper for Signal filters (YES/NO)
            const checkSignal = (val: boolean | undefined, selected: string[]) => {
                if (selected.length === 0) return true;
                const status = val ? 'YES' : 'NO';
                return selected.includes(status);
            };

            // Score
            if (!checkRange(stock.tech_score, 'tech_score_min', 'tech_score_max')) return false;

            // Signals
            if (!checkSignal(stock.final_signal, filters.final_signal)) return false;
            if (!checkSignal(stock.stamp, filters.stamp_signal)) return false;
            if (!checkSignal(stock.trend_signal, filters.trend_signal)) return false;
            if (!checkSignal(stock.rsi_55_70, filters.rsi_55_70)) return false;
            if (!checkSignal(stock.cfg_gt_50_daily, filters.cfg_gt_50_daily)) return false;
            if (!checkSignal(stock.cfg_gt_50_w, filters.cfg_gt_50_w)) return false;
            if (!checkSignal(stock.stamp_daily, filters.stamp_daily)) return false;
            if (!checkSignal(stock.stamp_weekly, filters.stamp_weekly)) return false;

            // Daily RSI
            if (!checkRange(stock.rsi_14, 'rsi_14_min', 'rsi_14_max', true)) return false;
            if (!checkRange(stock.rsi_3, 'rsi_3_min', 'rsi_3_max', true)) return false;
            if (!checkRange(stock.sma9_rsi, 'sma9_rsi_min', 'sma9_rsi_max', true)) return false;
            if (!checkRange(stock.wma45_rsi, 'wma45_rsi_min', 'wma45_rsi_max', true)) return false;
            if (!checkRange(stock.ema45_rsi, 'ema45_rsi_min', 'ema45_rsi_max', true)) return false;
            if (!checkRange(stock.sma3_rsi3, 'sma3_rsi3_min', 'sma3_rsi3_max', true)) return false;
            if (!checkRange(stock.ema20_sma3, 'ema20_sma3_min', 'ema20_sma3_max', true)) return false;

            // Daily The Number
            if (!checkRange(stock.sma9_close, 'sma9_close_min', 'sma9_close_max', true)) return false;
            if (!checkRange(stock.high_sma13, 'high_sma13_min', 'high_sma13_max', true)) return false;
            if (!checkRange(stock.low_sma13, 'low_sma13_min', 'low_sma13_max', true)) return false;
            if (!checkRange(stock.high_sma65, 'high_sma65_min', 'high_sma65_max', true)) return false;
            if (!checkRange(stock.low_sma65, 'low_sma65_min', 'low_sma65_max', true)) return false;
            if (!checkRange(stock.the_number, 'the_number_min', 'the_number_max', true)) return false;
            if (!checkRange(stock.the_number_hl, 'the_number_hl_min', 'the_number_hl_max', true)) return false;
            if (!checkRange(stock.the_number_ll, 'the_number_ll_min', 'the_number_ll_max', true)) return false;

            // Daily STAMP
            if (!checkRange(stock.rsi_14_9days_ago, 'rsi_14_9days_ago_min', 'rsi_14_9days_ago_max', true)) return false;
            if (!checkRange(stock.stamp_a_value, 'stamp_a_value_min', 'stamp_a_value_max', true)) return false;
            if (!checkRange(stock.stamp_s9rsi, 'stamp_s9rsi_min', 'stamp_s9rsi_max', true)) return false;
            if (!checkRange(stock.stamp_e45cfg, 'stamp_e45cfg_min', 'stamp_e45cfg_max', true)) return false;
            if (!checkRange(stock.stamp_e45rsi, 'stamp_e45rsi_min', 'stamp_e45rsi_max', true)) return false;
            if (!checkRange(stock.stamp_e20sma3, 'stamp_e20sma3_min', 'stamp_e20sma3_max', true)) return false;

            // Daily CFG
            if (!checkRange(stock.cfg_daily, 'cfg_daily_min', 'cfg_daily_max', true)) return false;
            if (!checkRange(stock.cfg_sma4, 'cfg_sma4_min', 'cfg_sma4_max', true)) return false;
            if (!checkRange(stock.cfg_sma9, 'cfg_sma9_min', 'cfg_sma9_max', true)) return false;
            if (!checkRange(stock.cfg_sma20, 'cfg_sma20_min', 'cfg_sma20_max', true)) return false;
            if (!checkRange(stock.cfg_ema20, 'cfg_ema20_min', 'cfg_ema20_max', true)) return false;
            if (!checkRange(stock.cfg_ema45, 'cfg_ema45_min', 'cfg_ema45_max', true)) return false;
            if (!checkRange(stock.cfg_wma45, 'cfg_wma45_min', 'cfg_wma45_max', true)) return false;

            // Daily Trend
            if (!checkRange(stock.sma4, 'sma4_min', 'sma4_max', true)) return false;
            if (!checkRange(stock.sma9_price, 'sma9_price_min', 'sma9_price_max', true)) return false;
            if (!checkRange(stock.sma18, 'sma18_min', 'sma18_max', true)) return false;
            if (!checkRange(stock.wma45_close, 'wma45_close_min', 'wma45_close_max', true)) return false;
            if (!checkRange(stock.cci, 'cci_min', 'cci_max', true)) return false;
            if (!checkRange(stock.cci_ema20, 'cci_ema20_min', 'cci_ema20_max', true)) return false;
            if (!checkRange(stock.aroon_up, 'aroon_up_min', 'aroon_up_max', true)) return false;
            if (!checkRange(stock.aroon_down, 'aroon_down_min', 'aroon_down_max', true)) return false;

            // Weekly RSI
            if (!checkRange(stock.rsi_w, 'rsi_w_min', 'rsi_w_max', true)) return false;
            if (!checkRange(stock.rsi_3_w, 'rsi_3_w_min', 'rsi_3_w_max', true)) return false;
            if (!checkRange(stock.sma9_rsi_w, 'sma9_rsi_w_min', 'sma9_rsi_w_max', true)) return false;
            if (!checkRange(stock.wma45_rsi_w, 'wma45_rsi_w_min', 'wma45_rsi_w_max', true)) return false;
            if (!checkRange(stock.ema45_rsi_w, 'ema45_rsi_w_min', 'ema45_rsi_w_max', true)) return false;
            if (!checkRange(stock.sma3_rsi3_w, 'sma3_rsi3_w_min', 'sma3_rsi3_w_max', true)) return false;
            if (!checkRange(stock.ema20_sma3_w, 'ema20_sma3_w_min', 'ema20_sma3_w_max', true)) return false;

            // Weekly The Number
            if (!checkRange(stock.sma9_close_w, 'sma9_close_w_min', 'sma9_close_w_max', true)) return false;
            if (!checkRange(stock.high_sma13_w, 'high_sma13_w_min', 'high_sma13_w_max', true)) return false;
            if (!checkRange(stock.low_sma13_w, 'low_sma13_w_min', 'low_sma13_w_max', true)) return false;
            if (!checkRange(stock.high_sma65_w, 'high_sma65_w_min', 'high_sma65_w_max', true)) return false;
            if (!checkRange(stock.low_sma65_w, 'low_sma65_w_min', 'low_sma65_w_max', true)) return false;
            if (!checkRange(stock.the_number_w, 'the_number_w_min', 'the_number_w_max', true)) return false;
            if (!checkRange(stock.the_number_hl_w, 'the_number_hl_w_min', 'the_number_hl_w_max', true)) return false;
            if (!checkRange(stock.the_number_ll_w, 'the_number_ll_w_min', 'the_number_ll_w_max', true)) return false;

            // Weekly STAMP
            if (!checkRange(stock.rsi_14_9days_ago_w, 'rsi_14_9days_ago_w_min', 'rsi_14_9days_ago_w_max', true)) return false;
            if (!checkRange(stock.stamp_a_value_w, 'stamp_a_value_w_min', 'stamp_a_value_w_max', true)) return false;
            if (!checkRange(stock.stamp_s9rsi_w, 'stamp_s9rsi_w_min', 'stamp_s9rsi_w_max', true)) return false;
            if (!checkRange(stock.stamp_e45cfg_w, 'stamp_e45cfg_w_min', 'stamp_e45cfg_w_max', true)) return false;
            if (!checkRange(stock.stamp_e45rsi_w, 'stamp_e45rsi_w_min', 'stamp_e45rsi_w_max', true)) return false;
            if (!checkRange(stock.stamp_e20sma3_w, 'stamp_e20sma3_w_min', 'stamp_e20sma3_w_max', true)) return false;

            // Weekly CFG
            if (!checkRange(stock.cfg_w, 'cfg_w_min', 'cfg_w_max', true)) return false;
            if (!checkRange(stock.cfg_sma4_w, 'cfg_sma4_w_min', 'cfg_sma4_w_max', true)) return false;
            if (!checkRange(stock.cfg_sma9_w, 'cfg_sma9_w_min', 'cfg_sma9_w_max', true)) return false;
            if (!checkRange(stock.cfg_ema20_w, 'cfg_ema20_w_min', 'cfg_ema20_w_max', true)) return false;
            if (!checkRange(stock.cfg_ema45_w, 'cfg_ema45_w_min', 'cfg_ema45_w_max', true)) return false;
            if (!checkRange(stock.cfg_wma45_w, 'cfg_wma45_w_min', 'cfg_wma45_w_max', true)) return false;

            // Weekly Trend
            if (!checkRange(stock.close_w, 'close_w_min', 'close_w_max', true)) return false;
            if (!checkRange(stock.sma4_w, 'sma4_w_min', 'sma4_w_max', true)) return false;
            if (!checkRange(stock.sma9_w, 'sma9_w_min', 'sma9_w_max', true)) return false;
            if (!checkRange(stock.sma18_w, 'sma18_w_min', 'sma18_w_max', true)) return false;
            if (!checkRange(stock.wma45_close_w, 'wma45_close_w_min', 'wma45_close_w_max', true)) return false;
            if (!checkRange(stock.cci_w, 'cci_w_min', 'cci_w_max', true)) return false;
            if (!checkRange(stock.cci_ema20_w, 'cci_ema20_w_min', 'cci_ema20_w_max', true)) return false;
            if (!checkRange(stock.aroon_up_w, 'aroon_up_w_min', 'aroon_up_w_max', true)) return false;
            if (!checkRange(stock.aroon_down_w, 'aroon_down_w_min', 'aroon_down_w_max', true)) return false;



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
                            // Technical Screener columns
                            case 'tech_score': return stock.tech_score || 0;
                            case 'rsi_14': return stock.rsi_14 || 0;
                            case 'rsi_3': return stock.rsi_3 || 0;
                            case 'sma9_rsi': return stock.sma9_rsi || 0;
                            case 'wma45_rsi': return stock.wma45_rsi || 0;
                            case 'ema45_rsi': return stock.ema45_rsi || 0;
                            case 'sma3_rsi3': return stock.sma3_rsi3 || 0;
                            case 'ema20_sma3': return stock.ema20_sma3 || 0;
                            case 'sma9_close': return stock.sma9_close || 0;
                            case 'high_sma13': return stock.high_sma13 || 0;
                            case 'low_sma13': return stock.low_sma13 || 0;
                            case 'high_sma65': return stock.high_sma65 || 0;
                            case 'low_sma65': return stock.low_sma65 || 0;
                            case 'the_number': return stock.the_number || 0;
                            case 'the_number_hl': return stock.the_number_hl || 0;
                            case 'the_number_ll': return stock.the_number_ll || 0;
                            case 'rsi_14_9days_ago': return stock.rsi_14_9days_ago || 0;
                            case 'stamp_a_value': return stock.stamp_a_value || 0;
                            case 'stamp_s9rsi': return stock.stamp_s9rsi || 0;
                            case 'stamp_e45cfg': return stock.stamp_e45cfg || 0;
                            case 'stamp_e45rsi': return stock.stamp_e45rsi || 0;
                            case 'stamp_e20sma3': return stock.stamp_e20sma3 || 0;
                            case 'cfg_daily': return stock.cfg_daily || 0;
                            case 'cfg_sma4': return stock.cfg_sma4 || 0;
                            case 'cfg_sma9': return stock.cfg_sma9 || 0;
                            case 'cfg_sma20': return stock.cfg_sma20 || 0;
                            case 'cfg_ema20': return stock.cfg_ema20 || 0;
                            case 'cfg_ema45': return stock.cfg_ema45 || 0;
                            case 'cfg_wma45': return stock.cfg_wma45 || 0;
                            case 'sma4': return stock.sma4 || 0;
                            case 'sma9_price': return stock.sma9_price || 0;
                            case 'sma18': return stock.sma18 || 0;
                            case 'wma45_close': return stock.wma45_close || 0;
                            case 'cci': return stock.cci || 0;
                            case 'cci_ema20': return stock.cci_ema20 || 0;
                            case 'aroon_up': return stock.aroon_up || 0;
                            case 'aroon_down': return stock.aroon_down || 0;
                            case 'rsi_w': return stock.rsi_w || 0;
                            case 'rsi_3_w': return stock.rsi_3_w || 0;
                            case 'sma9_rsi_w': return stock.sma9_rsi_w || 0;
                            case 'wma45_rsi_w': return stock.wma45_rsi_w || 0;
                            case 'ema45_rsi_w': return stock.ema45_rsi_w || 0;
                            case 'sma3_rsi3_w': return stock.sma3_rsi3_w || 0;
                            case 'ema20_sma3_w': return stock.ema20_sma3_w || 0;
                            case 'sma9_close_w': return stock.sma9_close_w || 0;
                            case 'high_sma13_w': return stock.high_sma13_w || 0;
                            case 'low_sma13_w': return stock.low_sma13_w || 0;
                            case 'high_sma65_w': return stock.high_sma65_w || 0;
                            case 'low_sma65_w': return stock.low_sma65_w || 0;
                            case 'the_number_w': return stock.the_number_w || 0;
                            case 'the_number_hl_w': return stock.the_number_hl_w || 0;
                            case 'the_number_ll_w': return stock.the_number_ll_w || 0;
                            case 'rsi_14_9days_ago_w': return stock.rsi_14_9days_ago_w || 0;
                            case 'stamp_a_value_w': return stock.stamp_a_value_w || 0;
                            case 'stamp_s9rsi_w': return stock.stamp_s9rsi_w || 0;
                            case 'stamp_e45cfg_w': return stock.stamp_e45cfg_w || 0;
                            case 'stamp_e45rsi_w': return stock.stamp_e45rsi_w || 0;
                            case 'stamp_e20sma3_w': return stock.stamp_e20sma3_w || 0;
                            case 'cfg_w': return stock.cfg_w || 0;
                            case 'cfg_sma4_w': return stock.cfg_sma4_w || 0;
                            case 'cfg_sma9_w': return stock.cfg_sma9_w || 0;
                            case 'cfg_ema20_w': return stock.cfg_ema20_w || 0;
                            case 'cfg_ema45_w': return stock.cfg_ema45_w || 0;
                            case 'cfg_wma45_w': return stock.cfg_wma45_w || 0;
                            case 'close_w': return stock.close_w || 0;
                            case 'sma4_w': return stock.sma4_w || 0;
                            case 'sma9_w': return stock.sma9_w || 0;
                            case 'sma18_w': return stock.sma18_w || 0;
                            case 'wma45_close_w': return stock.wma45_close_w || 0;
                            case 'cci_w': return stock.cci_w || 0;
                            case 'cci_ema20_w': return stock.cci_ema20_w || 0;
                            case 'aroon_up_w': return stock.aroon_up_w || 0;
                            case 'aroon_down_w': return stock.aroon_down_w || 0;
                            case 'final_signal': return stock.final_signal ? 1 : 0;
                            case 'stamp_signal': return stock.stamp ? 1 : 0;
                            case 'trend_signal': return stock.trend_signal ? 1 : 0;
                            case 'rsi_55_70': return stock.rsi_55_70 ? 1 : 0;
                            case 'cfg_gt_50_daily': return stock.cfg_gt_50_daily ? 1 : 0;
                            case 'cfg_gt_50_w': return stock.cfg_gt_50_w ? 1 : 0;
                            case 'stamp_daily': return stock.stamp_daily ? 1 : 0;
                            case 'stamp_weekly': return stock.stamp_weekly ? 1 : 0;
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
                    // Technical Screener exports
                    case 'tech_score': return stock.tech_score ?? '';
                    case 'final_signal': return stock.final_signal ? 'YES' : 'NO';
                    case 'stamp_signal': return stock.stamp ? 'YES' : 'NO';
                    case 'trend_signal': return stock.trend_signal ? 'YES' : 'NO';
                    case 'rsi_55_70': return stock.rsi_55_70 ? 'YES' : 'NO';
                    case 'cfg_gt_50_daily': return stock.cfg_gt_50_daily ? 'YES' : 'NO';
                    case 'cfg_gt_50_w': return stock.cfg_gt_50_w ? 'YES' : 'NO';
                    default: {
                        // All other technical columns - numeric values
                        const techVal = (stock as any)[col.key];
                        if (techVal === null || techVal === undefined) return '-';
                        const num = Number(techVal);
                        return Number.isNaN(num) ? '-' : num.toFixed(2);
                    }
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

                        {/* Technical Screener: Signals & Score */}
                        <FilterAccordion title="TECHNICAL: SIGNALS & SCORE" collapseSignal={collapseSignal}>
                            <RangeFilter label="Tech Score" minValue={filters.tech_score_min} maxValue={filters.tech_score_max}
                                onMinChange={(v) => setFilters(p => ({ ...p, tech_score_min: v }))}
                                onMaxChange={(v) => setFilters(p => ({ ...p, tech_score_max: v }))}
                            />
                            <div className="space-y-2 mt-2">
                                <CheckboxGroup label="Final Signal" options={['YES', 'NO']} selected={filters.final_signal} onChange={(v) => setFilters(p => ({ ...p, final_signal: v }))} />
                                <CheckboxGroup label="Stamp Signal" options={['YES', 'NO']} selected={filters.stamp_signal} onChange={(v) => setFilters(p => ({ ...p, stamp_signal: v }))} />
                                <CheckboxGroup label="Trend Signal" options={['YES', 'NO']} selected={filters.trend_signal} onChange={(v) => setFilters(p => ({ ...p, trend_signal: v }))} />
                                <CheckboxGroup label="Stamp Daily" options={['YES', 'NO']} selected={filters.stamp_daily} onChange={(v) => setFilters(p => ({ ...p, stamp_daily: v }))} />
                                <CheckboxGroup label="Stamp Weekly" options={['YES', 'NO']} selected={filters.stamp_weekly} onChange={(v) => setFilters(p => ({ ...p, stamp_weekly: v }))} />
                                <CheckboxGroup label="RSI 55-70" options={['YES', 'NO']} selected={filters.rsi_55_70} onChange={(v) => setFilters(p => ({ ...p, rsi_55_70: v }))} />
                                <CheckboxGroup label="CFG > 50 (Daily)" options={['YES', 'NO']} selected={filters.cfg_gt_50_daily} onChange={(v) => setFilters(p => ({ ...p, cfg_gt_50_daily: v }))} />
                                <CheckboxGroup label="CFG > 50 (Weekly)" options={['YES', 'NO']} selected={filters.cfg_gt_50_w} onChange={(v) => setFilters(p => ({ ...p, cfg_gt_50_w: v }))} />
                            </div>
                        </FilterAccordion>

                        {/* Technical Screener: Daily Indicators */}
                        <FilterAccordion title="TECHNICAL: DAILY INDICATORS" collapseSignal={collapseSignal}>
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-1">RSI Group</div>
                            <RangeFilter label="RSI (14)" minValue={filters.rsi_14_min} maxValue={filters.rsi_14_max} onMinChange={(v) => setFilters(p => ({ ...p, rsi_14_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, rsi_14_max: v }))} />
                            <RangeFilter label="RSI (3)" minValue={filters.rsi_3_min} maxValue={filters.rsi_3_max} onMinChange={(v) => setFilters(p => ({ ...p, rsi_3_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, rsi_3_max: v }))} />
                            <RangeFilter label="SMA9(RSI)" minValue={filters.sma9_rsi_min} maxValue={filters.sma9_rsi_max} onMinChange={(v) => setFilters(p => ({ ...p, sma9_rsi_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, sma9_rsi_max: v }))} />
                            <RangeFilter label="WMA45(RSI)" minValue={filters.wma45_rsi_min} maxValue={filters.wma45_rsi_max} onMinChange={(v) => setFilters(p => ({ ...p, wma45_rsi_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, wma45_rsi_max: v }))} />
                            <RangeFilter label="EMA45(RSI)" minValue={filters.ema45_rsi_min} maxValue={filters.ema45_rsi_max} onMinChange={(v) => setFilters(p => ({ ...p, ema45_rsi_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, ema45_rsi_max: v }))} />
                            <RangeFilter label="SMA3(RSI3)" minValue={filters.sma3_rsi3_min} maxValue={filters.sma3_rsi3_max} onMinChange={(v) => setFilters(p => ({ ...p, sma3_rsi3_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, sma3_rsi3_max: v }))} />
                            <RangeFilter label="EMA20(SMA3)" minValue={filters.ema20_sma3_min} maxValue={filters.ema20_sma3_max} onMinChange={(v) => setFilters(p => ({ ...p, ema20_sma3_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, ema20_sma3_max: v }))} />

                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-4">The Number Group</div>
                            <RangeFilter label="The Number" minValue={filters.the_number_min} maxValue={filters.the_number_max} onMinChange={(v) => setFilters(p => ({ ...p, the_number_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, the_number_max: v }))} />
                            <RangeFilter label="High/Low Used" minValue={filters.the_number_hl_min} maxValue={filters.the_number_hl_max} onMinChange={(v) => setFilters(p => ({ ...p, the_number_hl_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, the_number_hl_max: v }))} />
                            <RangeFilter label="SMA9(Close)" minValue={filters.sma9_close_min} maxValue={filters.sma9_close_max} onMinChange={(v) => setFilters(p => ({ ...p, sma9_close_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, sma9_close_max: v }))} />
                            <RangeFilter label="High SMA13" minValue={filters.high_sma13_min} maxValue={filters.high_sma13_max} onMinChange={(v) => setFilters(p => ({ ...p, high_sma13_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, high_sma13_max: v }))} />
                            <RangeFilter label="Low SMA13" minValue={filters.low_sma13_min} maxValue={filters.low_sma13_max} onMinChange={(v) => setFilters(p => ({ ...p, low_sma13_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, low_sma13_max: v }))} />
                            <RangeFilter label="High SMA65" minValue={filters.high_sma65_min} maxValue={filters.high_sma65_max} onMinChange={(v) => setFilters(p => ({ ...p, high_sma65_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, high_sma65_max: v }))} />
                            <RangeFilter label="Low SMA65" minValue={filters.low_sma65_min} maxValue={filters.low_sma65_max} onMinChange={(v) => setFilters(p => ({ ...p, low_sma65_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, low_sma65_max: v }))} />

                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-4">STAMP Components</div>
                            <RangeFilter label="RSI[9]" minValue={filters.rsi_14_9days_ago_min} maxValue={filters.rsi_14_9days_ago_max} onMinChange={(v) => setFilters(p => ({ ...p, rsi_14_9days_ago_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, rsi_14_9days_ago_max: v }))} />
                            <RangeFilter label="STAMP.A" minValue={filters.stamp_a_value_min} maxValue={filters.stamp_a_value_max} onMinChange={(v) => setFilters(p => ({ ...p, stamp_a_value_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, stamp_a_value_max: v }))} />
                            <RangeFilter label="STAMP.S9RSI" minValue={filters.stamp_s9rsi_min} maxValue={filters.stamp_s9rsi_max} onMinChange={(v) => setFilters(p => ({ ...p, stamp_s9rsi_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, stamp_s9rsi_max: v }))} />
                            <RangeFilter label="STAMP.E45CFG" minValue={filters.stamp_e45cfg_min} maxValue={filters.stamp_e45cfg_max} onMinChange={(v) => setFilters(p => ({ ...p, stamp_e45cfg_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, stamp_e45cfg_max: v }))} />
                            <RangeFilter label="STAMP.E45RSI" minValue={filters.stamp_e45rsi_min} maxValue={filters.stamp_e45rsi_max} onMinChange={(v) => setFilters(p => ({ ...p, stamp_e45rsi_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, stamp_e45rsi_max: v }))} />
                            <RangeFilter label="STAMP.E20SMA3" minValue={filters.stamp_e20sma3_min} maxValue={filters.stamp_e20sma3_max} onMinChange={(v) => setFilters(p => ({ ...p, stamp_e20sma3_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, stamp_e20sma3_max: v }))} />

                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-4">CFG Components</div>
                            <RangeFilter label="CFG Daily" minValue={filters.cfg_daily_min} maxValue={filters.cfg_daily_max} onMinChange={(v) => setFilters(p => ({ ...p, cfg_daily_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, cfg_daily_max: v }))} />
                            <RangeFilter label="CFG.SMA4" minValue={filters.cfg_sma4_min} maxValue={filters.cfg_sma4_max} onMinChange={(v) => setFilters(p => ({ ...p, cfg_sma4_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, cfg_sma4_max: v }))} />
                            <RangeFilter label="CFG.SMA9" minValue={filters.cfg_sma9_min} maxValue={filters.cfg_sma9_max} onMinChange={(v) => setFilters(p => ({ ...p, cfg_sma9_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, cfg_sma9_max: v }))} />
                            <RangeFilter label="CFG.SMA20" minValue={filters.cfg_sma20_min} maxValue={filters.cfg_sma20_max} onMinChange={(v) => setFilters(p => ({ ...p, cfg_sma20_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, cfg_sma20_max: v }))} />
                            <RangeFilter label="CFG.EMA20" minValue={filters.cfg_ema20_min} maxValue={filters.cfg_ema20_max} onMinChange={(v) => setFilters(p => ({ ...p, cfg_ema20_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, cfg_ema20_max: v }))} />
                            <RangeFilter label="CFG.EMA45" minValue={filters.cfg_ema45_min} maxValue={filters.cfg_ema45_max} onMinChange={(v) => setFilters(p => ({ ...p, cfg_ema45_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, cfg_ema45_max: v }))} />
                            <RangeFilter label="CFG.WMA45" minValue={filters.cfg_wma45_min} maxValue={filters.cfg_wma45_max} onMinChange={(v) => setFilters(p => ({ ...p, cfg_wma45_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, cfg_wma45_max: v }))} />

                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-4">Trend Components</div>
                            <RangeFilter label="SMA4" minValue={filters.sma4_min} maxValue={filters.sma4_max} onMinChange={(v) => setFilters(p => ({ ...p, sma4_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, sma4_max: v }))} />
                            <RangeFilter label="SMA9(Price)" minValue={filters.sma9_price_min} maxValue={filters.sma9_price_max} onMinChange={(v) => setFilters(p => ({ ...p, sma9_price_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, sma9_price_max: v }))} />
                            <RangeFilter label="SMA18" minValue={filters.sma18_min} maxValue={filters.sma18_max} onMinChange={(v) => setFilters(p => ({ ...p, sma18_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, sma18_max: v }))} />
                            <RangeFilter label="WMA45(Price)" minValue={filters.wma45_close_min} maxValue={filters.wma45_close_max} onMinChange={(v) => setFilters(p => ({ ...p, wma45_close_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, wma45_close_max: v }))} />
                            <RangeFilter label="CCI" minValue={filters.cci_min} maxValue={filters.cci_max} onMinChange={(v) => setFilters(p => ({ ...p, cci_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, cci_max: v }))} />
                            <RangeFilter label="CCI.EMA20" minValue={filters.cci_ema20_min} maxValue={filters.cci_ema20_max} onMinChange={(v) => setFilters(p => ({ ...p, cci_ema20_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, cci_ema20_max: v }))} />
                            <RangeFilter label="Aroon Up" minValue={filters.aroon_up_min} maxValue={filters.aroon_up_max} onMinChange={(v) => setFilters(p => ({ ...p, aroon_up_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, aroon_up_max: v }))} />
                            <RangeFilter label="Aroon Down" minValue={filters.aroon_down_min} maxValue={filters.aroon_down_max} onMinChange={(v) => setFilters(p => ({ ...p, aroon_down_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, aroon_down_max: v }))} />
                        </FilterAccordion>

                        {/* Technical Screener: Weekly Indicators */}
                        <FilterAccordion title="TECHNICAL: WEEKLY INDICATORS" collapseSignal={collapseSignal}>
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-1">RSI Group (W)</div>
                            <RangeFilter label="RSI(14)(W)" minValue={filters.rsi_w_min} maxValue={filters.rsi_w_max} onMinChange={(v) => setFilters(p => ({ ...p, rsi_w_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, rsi_w_max: v }))} />
                            <RangeFilter label="RSI(3)(W)" minValue={filters.rsi_3_w_min} maxValue={filters.rsi_3_w_max} onMinChange={(v) => setFilters(p => ({ ...p, rsi_3_w_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, rsi_3_w_max: v }))} />
                            <RangeFilter label="SMA9(RSI)(W)" minValue={filters.sma9_rsi_w_min} maxValue={filters.sma9_rsi_w_max} onMinChange={(v) => setFilters(p => ({ ...p, sma9_rsi_w_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, sma9_rsi_w_max: v }))} />
                            <RangeFilter label="WMA45(RSI)(W)" minValue={filters.wma45_rsi_w_min} maxValue={filters.wma45_rsi_w_max} onMinChange={(v) => setFilters(p => ({ ...p, wma45_rsi_w_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, wma45_rsi_w_max: v }))} />
                            <RangeFilter label="EMA45(RSI)(W)" minValue={filters.ema45_rsi_w_min} maxValue={filters.ema45_rsi_w_max} onMinChange={(v) => setFilters(p => ({ ...p, ema45_rsi_w_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, ema45_rsi_w_max: v }))} />
                            <RangeFilter label="SMA3(RSI3)(W)" minValue={filters.sma3_rsi3_w_min} maxValue={filters.sma3_rsi3_w_max} onMinChange={(v) => setFilters(p => ({ ...p, sma3_rsi3_w_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, sma3_rsi3_w_max: v }))} />
                            <RangeFilter label="EMA20(SMA3)(W)" minValue={filters.ema20_sma3_w_min} maxValue={filters.ema20_sma3_w_max} onMinChange={(v) => setFilters(p => ({ ...p, ema20_sma3_w_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, ema20_sma3_w_max: v }))} />

                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-4">The Number Group (W)</div>
                            <RangeFilter label="The Number(W)" minValue={filters.the_number_w_min} maxValue={filters.the_number_w_max} onMinChange={(v) => setFilters(p => ({ ...p, the_number_w_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, the_number_w_max: v }))} />
                            <RangeFilter label="High/Low Used(W)" minValue={filters.the_number_hl_w_min} maxValue={filters.the_number_hl_w_max} onMinChange={(v) => setFilters(p => ({ ...p, the_number_hl_w_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, the_number_hl_w_max: v }))} />
                            <RangeFilter label="SMA9(Close)(W)" minValue={filters.sma9_close_w_min} maxValue={filters.sma9_close_w_max} onMinChange={(v) => setFilters(p => ({ ...p, sma9_close_w_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, sma9_close_w_max: v }))} />
                            <RangeFilter label="High SMA13(W)" minValue={filters.high_sma13_w_min} maxValue={filters.high_sma13_w_max} onMinChange={(v) => setFilters(p => ({ ...p, high_sma13_w_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, high_sma13_w_max: v }))} />
                            <RangeFilter label="Low SMA13(W)" minValue={filters.low_sma13_w_min} maxValue={filters.low_sma13_w_max} onMinChange={(v) => setFilters(p => ({ ...p, low_sma13_w_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, low_sma13_w_max: v }))} />
                            <RangeFilter label="High SMA65(W)" minValue={filters.high_sma65_w_min} maxValue={filters.high_sma65_w_max} onMinChange={(v) => setFilters(p => ({ ...p, high_sma65_w_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, high_sma65_w_max: v }))} />
                            <RangeFilter label="Low SMA65(W)" minValue={filters.low_sma65_w_min} maxValue={filters.low_sma65_w_max} onMinChange={(v) => setFilters(p => ({ ...p, low_sma65_w_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, low_sma65_w_max: v }))} />

                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-4">STAMP Components (W)</div>
                            <RangeFilter label="RSI[9](W)" minValue={filters.rsi_14_9days_ago_w_min} maxValue={filters.rsi_14_9days_ago_w_max} onMinChange={(v) => setFilters(p => ({ ...p, rsi_14_9days_ago_w_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, rsi_14_9days_ago_w_max: v }))} />
                            <RangeFilter label="STAMP.A(W)" minValue={filters.stamp_a_value_w_min} maxValue={filters.stamp_a_value_w_max} onMinChange={(v) => setFilters(p => ({ ...p, stamp_a_value_w_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, stamp_a_value_w_max: v }))} />
                            <RangeFilter label="STAMP.S9RSI(W)" minValue={filters.stamp_s9rsi_w_min} maxValue={filters.stamp_s9rsi_w_max} onMinChange={(v) => setFilters(p => ({ ...p, stamp_s9rsi_w_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, stamp_s9rsi_w_max: v }))} />
                            <RangeFilter label="STAMP.E45CFG(W)" minValue={filters.stamp_e45cfg_w_min} maxValue={filters.stamp_e45cfg_w_max} onMinChange={(v) => setFilters(p => ({ ...p, stamp_e45cfg_w_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, stamp_e45cfg_w_max: v }))} />
                            <RangeFilter label="STAMP.E45RSI(W)" minValue={filters.stamp_e45rsi_w_min} maxValue={filters.stamp_e45rsi_w_max} onMinChange={(v) => setFilters(p => ({ ...p, stamp_e45rsi_w_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, stamp_e45rsi_w_max: v }))} />
                            <RangeFilter label="STAMP.E20SMA3(W)" minValue={filters.stamp_e20sma3_w_min} maxValue={filters.stamp_e20sma3_w_max} onMinChange={(v) => setFilters(p => ({ ...p, stamp_e20sma3_w_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, stamp_e20sma3_w_max: v }))} />

                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-4">CFG Components (W)</div>
                            <RangeFilter label="CFG(W)" minValue={filters.cfg_w_min} maxValue={filters.cfg_w_max} onMinChange={(v) => setFilters(p => ({ ...p, cfg_w_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, cfg_w_max: v }))} />
                            <RangeFilter label="CFG.SMA4(W)" minValue={filters.cfg_sma4_w_min} maxValue={filters.cfg_sma4_w_max} onMinChange={(v) => setFilters(p => ({ ...p, cfg_sma4_w_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, cfg_sma4_w_max: v }))} />
                            <RangeFilter label="CFG.SMA9(W)" minValue={filters.cfg_sma9_w_min} maxValue={filters.cfg_sma9_w_max} onMinChange={(v) => setFilters(p => ({ ...p, cfg_sma9_w_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, cfg_sma9_w_max: v }))} />
                            <RangeFilter label="CFG.EMA20(W)" minValue={filters.cfg_ema20_w_min} maxValue={filters.cfg_ema20_w_max} onMinChange={(v) => setFilters(p => ({ ...p, cfg_ema20_w_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, cfg_ema20_w_max: v }))} />
                            <RangeFilter label="CFG.EMA45(W)" minValue={filters.cfg_ema45_w_min} maxValue={filters.cfg_ema45_w_max} onMinChange={(v) => setFilters(p => ({ ...p, cfg_ema45_w_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, cfg_ema45_w_max: v }))} />
                            <RangeFilter label="CFG.WMA45(W)" minValue={filters.cfg_wma45_w_min} maxValue={filters.cfg_wma45_w_max} onMinChange={(v) => setFilters(p => ({ ...p, cfg_wma45_w_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, cfg_wma45_w_max: v }))} />

                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-4">Trend Components (W)</div>
                            <RangeFilter label="SMA4(W)" minValue={filters.sma4_w_min} maxValue={filters.sma4_w_max} onMinChange={(v) => setFilters(p => ({ ...p, sma4_w_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, sma4_w_max: v }))} />
                            <RangeFilter label="SMA9(W)" minValue={filters.sma9_w_min} maxValue={filters.sma9_w_max} onMinChange={(v) => setFilters(p => ({ ...p, sma9_w_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, sma9_w_max: v }))} />
                            <RangeFilter label="SMA18(W)" minValue={filters.sma18_w_min} maxValue={filters.sma18_w_max} onMinChange={(v) => setFilters(p => ({ ...p, sma18_w_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, sma18_w_max: v }))} />
                            <RangeFilter label="WMA45(Close)(W)" minValue={filters.wma45_close_w_min} maxValue={filters.wma45_close_w_max} onMinChange={(v) => setFilters(p => ({ ...p, wma45_close_w_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, wma45_close_w_max: v }))} />
                            <RangeFilter label="CCI(W)" minValue={filters.cci_w_min} maxValue={filters.cci_w_max} onMinChange={(v) => setFilters(p => ({ ...p, cci_w_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, cci_w_max: v }))} />
                            <RangeFilter label="CCI.EMA20(W)" minValue={filters.cci_ema20_w_min} maxValue={filters.cci_ema20_w_max} onMinChange={(v) => setFilters(p => ({ ...p, cci_ema20_w_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, cci_ema20_w_max: v }))} />
                            <RangeFilter label="Aroon Up(W)" minValue={filters.aroon_up_w_min} maxValue={filters.aroon_up_w_max} onMinChange={(v) => setFilters(p => ({ ...p, aroon_up_w_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, aroon_up_w_max: v }))} />
                            <RangeFilter label="Aroon Down(W)" minValue={filters.aroon_down_w_min} maxValue={filters.aroon_down_w_max} onMinChange={(v) => setFilters(p => ({ ...p, aroon_down_w_min: v }))} onMaxChange={(v) => setFilters(p => ({ ...p, aroon_down_w_max: v }))} />
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

                                                        // === Technical Screener columns ===
                                                        case 'tech_score':
                                                            content = (
                                                                <span className="px-2 py-0.5 rounded text-white text-xs font-bold" style={{
                                                                    background: (stock.tech_score || 0) >= 10 ? '#10B981' : (stock.tech_score || 0) >= 5 ? '#F59E0B' : '#EF4444'
                                                                }}>
                                                                    {stock.tech_score ?? '-'}
                                                                </span>
                                                            );
                                                            break;

                                                        case 'final_signal':
                                                            content = stock.final_signal ? <CheckCircle2 size={14} className="text-blue-600 inline" /> : <XCircle size={14} className="text-gray-300 inline" />;
                                                            break;
                                                        case 'stamp_signal':
                                                            content = stock.stamp ? <Shield size={14} className="text-amber-600 inline" /> : <XCircle size={14} className="text-gray-300 inline" />;
                                                            break;
                                                        case 'trend_signal':
                                                            content = stock.trend_signal ? <TrendingUpIcon size={14} className="text-green-600 inline" /> : <XCircle size={14} className="text-gray-300 inline" />;
                                                            break;
                                                        case 'rsi_55_70':
                                                            content = stock.rsi_55_70 ? <CheckCircle2 size={14} className="text-green-600 inline" /> : <XCircle size={14} className="text-red-500 inline" />;
                                                            break;
                                                        case 'cfg_gt_50_daily':
                                                            content = stock.cfg_gt_50_daily ? <CheckCircle2 size={14} className="text-green-600 inline" /> : <XCircle size={14} className="text-red-500 inline" />;
                                                            break;
                                                        case 'cfg_gt_50_w':
                                                            content = stock.cfg_gt_50_w ? <CheckCircle2 size={14} className="text-green-600 inline" /> : <XCircle size={14} className="text-red-500 inline" />;
                                                            break;

                                                        default: {
                                                            // All other technical numeric columns
                                                            const techVal = (stock as any)[col.key];
                                                            if (techVal === null || techVal === undefined) {
                                                                content = <span className="text-gray-400">-</span>;
                                                            } else {
                                                                const num = Number(techVal);
                                                                content = <span className="text-gray-900">{Number.isNaN(num) ? '-' : num.toFixed(2)}</span>;
                                                            }
                                                        }
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