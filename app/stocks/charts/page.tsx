'use client';
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Search } from 'lucide-react';
import useStocks from '../hooks/useStocks';
import type { Stock, FilterState } from '../types';
import * as XLSX from 'xlsx';
import { cleanSymbol, cleanName, parseFormattedNumber, formatNumber, formatChange, formatChangePercent } from '../utils/formatters';
import LightweightChart from '../components/LightweightChart';
import SymbolSearchModal from '../components/SymbolSearchModal';
import ActiveFilterBadge from '../components/ActiveFilterBadge';
const initialFilterState: FilterState = {
    rs_rating_min: '', rs_rating_max: '',
    acc_dis_rating: [], industry_group_rs: [], sector_rs: [], industry_rs: [], sub_industry_rs: [],
    price_min: '', price_max: '',
    change_min: '', change_max: '',
    percent_change_min: '', percent_change_max: '',
    volume_min: '', volume_max: '',
    turnover_min: '', turnover_max: '',
    no_of_trades_min: '', no_of_trades_max: '',
    percent_off_52w_high_min: '', percent_off_52w_high_max: '',
    percent_off_52w_low_min: '', percent_off_52w_low_max: '',
    market_cap_min: '', market_cap_max: '',
    price_minus_sma_10_min: '', price_minus_sma_10_max: '',
    price_minus_sma_21_min: '', price_minus_sma_21_max: '',
    price_minus_sma_50_min: '', price_minus_sma_50_max: '',
    price_minus_sma_150_min: '', price_minus_sma_150_max: '',
    price_minus_sma_200_min: '', price_minus_sma_200_max: '',
    price_vs_ema_10_min: '', price_vs_ema_10_max: '',
    price_vs_ema_21_min: '', price_vs_ema_21_max: '',
    price_vs_sma_50_min: '', price_vs_sma_50_max: '',
    price_vs_sma_150_min: '', price_vs_sma_150_max: '',
    price_vs_sma_200_min: '', price_vs_sma_200_max: '',
    fifty_two_week_high_min: '', fifty_two_week_high_max: '',
    fifty_two_week_low_min: '', fifty_two_week_low_max: '',
    average_volume_50_min: '', average_volume_50_max: '',
    vol_diff_50_percent_min: '', vol_diff_50_percent_max: '',
    open_min: '', open_max: '',
    high_min: '', high_max: '',
    low_min: '', low_max: '',
    symbol: '',
    name: '',
    industry_group: [],
    sector: [],
    industry: [],
    sub_industry: [],
    rsi_14_min: '', rsi_14_max: '',
    sma9_rsi_min: '', sma9_rsi_max: '',
    wma45_rsi_min: '', wma45_rsi_max: '',
    sma9_close_min: '', sma9_close_max: '',
    the_number_min: '', the_number_max: '',
    the_number_hl_min: '', the_number_hl_max: '',
    the_number_ll_min: '', the_number_ll_max: '',
    stamp_s9rsi_min: '', stamp_s9rsi_max: '',
    stamp_e45cfg_min: '', stamp_e45cfg_max: '',
    stamp_e45rsi_min: '', stamp_e45rsi_max: '',
    stamp_e20sma3_min: '', stamp_e20sma3_max: '',
    cfg_daily_min: '', cfg_daily_max: '',
    cfg_sma4_min: '', cfg_sma4_max: '',
    cfg_ema45_min: '', cfg_ema45_max: '',
    sma4_min: '', sma4_max: '',
    sma9_price_min: '', sma9_price_max: '',
    sma18_min: '', sma18_max: '',
    wma45_close_min: '', wma45_close_max: '',
    cci_min: '', cci_max: '',
    cci_ema20_min: '', cci_ema20_max: '',
    aroon_up_min: '', aroon_up_max: '',
    aroon_down_min: '', aroon_down_max: '',
    rsi_w_min: '', rsi_w_max: '',
    sma9_rsi_w_min: '', sma9_rsi_w_max: '',
    wma45_rsi_w_min: '', wma45_rsi_w_max: '',
    sma9_close_w_min: '', sma9_close_w_max: '',
    the_number_w_min: '', the_number_w_max: '',
    the_number_hl_w_min: '', the_number_hl_w_max: '',
    the_number_ll_w_min: '', the_number_ll_w_max: '',
    stamp_s9rsi_w_min: '', stamp_s9rsi_w_max: '',
    stamp_e45cfg_w_min: '', stamp_e45cfg_w_max: '',
    stamp_e45rsi_w_min: '', stamp_e45rsi_w_max: '',
    stamp_e20sma3_w_min: '', stamp_e20sma3_w_max: '',
    cfg_w_min: '', cfg_w_max: '',
    cfg_sma4_w_min: '', cfg_sma4_w_max: '',
    cfg_ema45_w_min: '', cfg_ema45_w_max: '',
    close_w_min: '', close_w_max: '',
    sma4_w_min: '', sma4_w_max: '',
    sma9_w_min: '', sma9_w_max: '',
    sma18_w_min: '', sma18_w_max: '',
    wma45_close_w_min: '', wma45_close_w_max: '',
    cci_w_min: '', cci_w_max: '',
    cci_ema20_w_min: '', cci_ema20_w_max: '',
    aroon_up_w_min: '', aroon_up_w_max: '',
    aroon_down_w_min: '', aroon_down_w_max: '',
    ma_10_21_50: 'any',
    ma_50_150_200: 'any',
    ema_10_21_50: 'any',
    ema_10_21: 'any',
    price_gt_30w: 'any',
    price_gt_40w: 'any',
    // === Moving Average Comparison Boolean Filters ===
    ema10_gt_sma50: 'any',
    ema10_gt_sma200: 'any',
    ema21_gt_sma50: 'any',
    ema21_gt_sma200: 'any',
    sma50_gt_sma150: 'any',
    sma50_gt_sma200: 'any',
    sma150_gt_sma200: 'any',
    sma200_gt_sma200_1m_ago: 'any',
    sma200_gt_sma200_2m_ago: 'any',
    sma200_gt_sma200_3m_ago: 'any',
    sma200_gt_sma200_4m_ago: 'any',
    sma200_gt_sma200_5m_ago: 'any',
    wma30_gt_wma40: 'any',
    price_gt_ema10: 'any',
    price_gt_ema21: 'any',
    ma_comparison_type: '',
    ma_comparison_value: 'any',
    ma_200_1m_2m: 'any',
    ma_200_2m_3m: 'any',
    ma_200_3m_4m: 'any',
    ma_200_4m_5m: 'any',
    ma_200_now_1m: 'any',
    ma_200_now_2m: 'any',
    ma_200_now_3m: 'any',
    ma_200_now_4m: 'any',
    price_gt_18sma_daily: 'any',
    price_gt_9sma_weekly: 'any',
    sma_4_9_18_daily: 'any',
    sma_4_9_18_weekly: 'any',
    cci_gt_100: 'any',
    cci_ema20_gt_0_daily: 'any',
    cci_ema20_gt_0_weekly: 'any',
    aroon_up_gt_70: 'any',
    aroon_down_lt_30: 'any',
    ema_10_gt_50sma: 'any',
    ema_21_gt_50sma: 'any',
    sma_50_gt_150sma: 'any',
    sma_50_gt_200sma: 'any',
    sma_150_gt_200sma: 'any',
    stamp_sma9_gt_wma45: 'any',
    stamp_sma9rsi_gt_wma45: 'any',
    stamp_ema45rsi_gt_50: 'any',
    stamp_ema45cfg_gt_50: 'any',
    stamp_ema20sma3_gt_50: 'any',
    stamp_ema45rsi_lt_stamp_lines: 'any',
    stamp_sma9_gt_wma45_weekly: 'any',
    stamp_sma9rsi_gt_wma45_weekly: 'any',
    stamp_ema45rsi_gt_50_weekly: 'any',
    stamp_ema45cfg_gt_50_weekly: 'any',
    stamp_ema20sma3_gt_50_weekly: 'any',
    stamp_ema45rsi_lt_stamp_lines_weekly: 'any',
    price_gt_the_number_daily: 'any',
    price_gt_the_number_hl_daily: 'any',
    price_gt_the_number_ll_daily: 'any',
    sma9_gt_the_number_daily: 'any',
    sma9_gt_the_number_hl_daily: 'any',
    sma9_gt_the_number_ll_daily: 'any',
    sma9_gt_wma45_daily: 'any',
    rsi_gt_sma9rsi_daily: 'any',
    rsi_gt_wma45rsi_daily: 'any',
    sma9rsi_gt_wma45_daily: 'any',
    wma45rsi_lt_sma9rsi_daily: 'any',
    wma45rsi_lt_wma45_daily: 'any',
    wma45rsi_lt_cfgwma45_daily: 'any',
    wma45rsi_lt_ema20sma3_daily: 'any',
    ema20_sma3_min: '', ema20_sma3_max: '',
    price_gt_the_number_weekly: 'any',
    price_gt_the_number_hl_weekly: 'any',
    price_gt_the_number_ll_weekly: 'any',
    sma9_gt_the_number_weekly: 'any',
    sma9_gt_the_number_hl_weekly: 'any',
    sma9_gt_the_number_ll_weekly: 'any',
    sma9_gt_wma45_weekly: 'any',
    rsi_gt_sma9rsi_weekly: 'any',
    rsi_gt_wma45rsi_weekly: 'any',
    sma9rsi_gt_wma45_weekly: 'any',
    wma45rsi_lt_sma9rsi_weekly: 'any',
    wma45rsi_lt_wma45_weekly: 'any',
    wma45rsi_lt_cfgwma45_weekly: 'any',
    wma45rsi_lt_ema20sma3_weekly: 'any',
    ema20_sma3_w_min: '', ema20_sma3_w_max: '',
    ema_10_min: '', ema_10_max: '',
    ema_21_min: '', ema_21_max: '',
    sma_3_min: '', sma_3_max: '',
    sma_4w_min: '', sma_4w_max: '',
    sma_9w_min: '', sma_9w_max: '',
    sma_18w_min: '', sma_18w_max: '',
    sma_30w_min: '', sma_30w_max: '',
    sma_40w_min: '', sma_40w_max: '',
    sma_200_1m_min: '', sma_200_1m_max: '',
    sma_200_2m_min: '', sma_200_2m_max: '',
    sma_200_3m_min: '', sma_200_3m_max: '',
    sma_200_4m_min: '', sma_200_4m_max: '',
    sma_200_5m_min: '', sma_200_5m_max: '',
    price_vs_sma_10_min: '',
    price_vs_sma_10_max: '',
    price_vs_sma_21_min: '',
    price_vs_sma_21_max: ''
};
export default function StockScreenerPage() {
    const { stocks, metadata, loading, error, setStocks, setMetadata, setLoading, setError, refetch } = useStocks();
    const [sortConfigs, setSortConfigs] = useState<Array<{ key: string; direction: 'asc' | 'desc' }>>([]);
    const [showColumnMenu, setShowColumnMenu] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [columnSearch, setColumnSearch] = useState('');
    const [collapseSignal, setCollapseSignal] = useState(0);
    const [selectedSymbol, setSelectedSymbol] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const exportMenuRef = useRef<HTMLDivElement>(null);

    const selectStyles = `
        w-full pl-10 pr-8 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-lg 
        focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white
        outline-none appearance-none cursor-pointer
        transition-all hover:border-gray-300
    `;
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
        { key: 'fifty_two_week_high_price', label: '52 Week High', visibleKey: 'fifty_two_week_high_price' },
        { key: 'fifty_two_week_low_price', label: '52 Week Low', visibleKey: 'fifty_two_week_low_price' },
        { key: 'average_volume_50', label: 'Avg Volume 50', visibleKey: 'average_volume_50' },
        { key: 'price_vs_ema_10_percent', label: 'Price vs EMA10 %', visibleKey: 'price_vs_ema_10_percent' },
        { key: 'price_vs_ema_21_percent', label: 'Price vs EMA21 %', visibleKey: 'price_vs_ema_21_percent' },
        { key: 'price_vs_sma_50_percent', label: 'Price vs SMA50 %', visibleKey: 'price_vs_sma_50_percent' },
        { key: 'price_vs_sma_150_percent', label: 'Price vs SMA150 %', visibleKey: 'price_vs_sma_150_percent' },
        { key: 'price_vs_sma_200_percent', label: 'Price vs SMA200 %', visibleKey: 'price_vs_sma_200_percent' },
        { key: 'percent_off_52w_high', label: '% Off 52W High', visibleKey: 'percent_off_52w_high' },
        { key: 'percent_off_52w_low', label: '% Off 52W Low', visibleKey: 'percent_off_52w_low' },
        { key: 'vol_diff_50_percent', label: 'Vol Diff 50 %', visibleKey: 'vol_diff_50_percent' },
        { key: 'rsi_14', label: 'RSI(14)', visibleKey: 'rsi_14' },
        { key: 'sma9_rsi', label: 'SMA9(RSI)', visibleKey: 'sma9_rsi' },
        { key: 'wma45_rsi', label: 'WMA45(RSI)', visibleKey: 'wma45_rsi' },
        { key: 'sma9_close', label: 'SMA9(Close)', visibleKey: 'sma9_close' },
        { key: 'the_number', label: 'THE.NUMBER', visibleKey: 'the_number' },
        { key: 'the_number_hl', label: 'THE.NUMBER.HIGH', visibleKey: 'the_number_hl' },
        { key: 'the_number_ll', label: 'THE.NUMBER.LOW', visibleKey: 'the_number_ll' },
        { key: 'stamp_s9rsi', label: 'STAMP.SMA9(RSI)', visibleKey: 'stamp_s9rsi' },
        { key: 'stamp_e45cfg', label: 'STAMP.EMA45(CFG)', visibleKey: 'stamp_e45cfg' },
        { key: 'stamp_e45rsi', label: 'STAMP.EMA45(RSI)', visibleKey: 'stamp_e45rsi' },
        { key: 'stamp_e20sma3', label: 'STAMP.EMA20(SMA3)', visibleKey: 'stamp_e20sma3' },
        { key: 'cfg_daily', label: 'CFG', visibleKey: 'cfg_daily' },
        { key: 'cfg_sma4', label: 'CFG.SMA4', visibleKey: 'cfg_sma4' },
        { key: 'cfg_ema45', label: 'CFG.EMA45', visibleKey: 'cfg_ema45' },
        { key: 'sma4', label: 'SMA4', visibleKey: 'sma4' },
        { key: 'sma9_price', label: 'SMA9', visibleKey: 'sma9_price' },
        { key: 'sma18', label: 'SMA18', visibleKey: 'sma18' },
        { key: 'wma45_close', label: 'WMA45(Price)', visibleKey: 'wma45_close' },
        { key: 'cci_14', label: 'CCI(14)', visibleKey: 'cci_14' },
        { key: 'cci_ema_20', label: 'CCI.EMA20', visibleKey: 'cci_ema_20' },
        { key: 'aroon_up', label: 'AROON.UP', visibleKey: 'aroon_up' },
        { key: 'aroon_down', label: 'AROON.DOWN', visibleKey: 'aroon_down' },
        { key: 'ema_10', label: 'EMA10', visibleKey: 'ema_10' },
        { key: 'ema_21', label: 'EMA21', visibleKey: 'ema_21' },
        { key: 'sma_4', label: 'SMA4', visibleKey: 'sma_4' },
        { key: 'sma_9', label: 'SMA9', visibleKey: 'sma_9' },
        { key: 'sma_18', label: 'SMA18', visibleKey: 'sma_18' },
        { key: 'sma_30w', label: 'SMA30W', visibleKey: 'sma_30w' },
        { key: 'sma_40w', label: 'SMA40W', visibleKey: 'sma_40w' },
        { key: 'sma_3', label: 'SMA3', visibleKey: 'sma_3' },
        { key: 'ema_20_sma3', label: 'EMA20(SMA3)', visibleKey: 'ema_20_sma3' },
        { key: 'sma_4w', label: 'SMA4W', visibleKey: 'sma_4w' },
        { key: 'sma_9w', label: 'SMA9W', visibleKey: 'sma_9w' },
        { key: 'sma_18w', label: 'SMA18W', visibleKey: 'sma_18w' },
        { key: 'sma_200_1m_ago', label: '200MA(1M)', visibleKey: 'sma_200_1m_ago' },
        { key: 'sma_200_2m_ago', label: '200MA(2M)', visibleKey: 'sma_200_2m_ago' },
        { key: 'sma_200_3m_ago', label: '200MA(3M)', visibleKey: 'sma_200_3m_ago' },
        { key: 'sma_200_4m_ago', label: '200MA(4M)', visibleKey: 'sma_200_4m_ago' },
        { key: 'sma_200_5m_ago', label: '200MA(5M)', visibleKey: 'sma_200_5m_ago' },
        { key: 'rsi_w', label: 'RSI(14)(W)', visibleKey: 'rsi_w' },
        { key: 'sma9_rsi_w', label: 'SMA9(RSI)(W)', visibleKey: 'sma9_rsi_w' },
        { key: 'wma45_rsi_w', label: 'WMA45(RSI)(W)', visibleKey: 'wma45_rsi_w' },
        { key: 'sma9_close_w', label: 'SMA9(Close)(W)', visibleKey: 'sma9_close_w' },
        { key: 'the_number_w', label: 'THE.NUMBER(W)', visibleKey: 'the_number_w' },
        { key: 'the_number_hl_w', label: 'THE.NUMBER.HIGH(W)', visibleKey: 'the_number_hl_w' },
        { key: 'the_number_ll_w', label: 'THE.NUMBER.LOW(W)', visibleKey: 'the_number_ll_w' },
        { key: 'stamp_s9rsi_w', label: 'STAMP.SMA9(RSI)(W)', visibleKey: 'stamp_s9rsi_w' },
        { key: 'stamp_e45cfg_w', label: 'STAMP.EMA45(CFG)(W)', visibleKey: 'stamp_e45cfg_w' },
        { key: 'stamp_e45rsi_w', label: 'STAMP.EMA45(RSI)(W)', visibleKey: 'stamp_e45rsi_w' },
        { key: 'stamp_e20sma3_w', label: 'STAMP.EMA20(SMA3)(W)', visibleKey: 'stamp_e20sma3_w' },
        { key: 'cfg_w', label: 'CFG(W)', visibleKey: 'cfg_w' },
        { key: 'cfg_sma4_w', label: 'CFG.SMA4(W)', visibleKey: 'cfg_sma4_w' },
        { key: 'cfg_ema45_w', label: 'CFG.EMA45(W)', visibleKey: 'cfg_ema45_w' },
        { key: 'close_w', label: 'Close(W)', visibleKey: 'close_w' },
        { key: 'sma4_w', label: 'SMA4(W)', visibleKey: 'sma4_w' },
        { key: 'sma9_w', label: 'SMA9(W)', visibleKey: 'sma9_w' },
        { key: 'sma18_w', label: 'SMA18(W)', visibleKey: 'sma18_w' },
        { key: 'wma45_close_w', label: 'WMA45(Price)(W)', visibleKey: 'wma45_close_w' },
        { key: 'cci_w', label: 'CCI(14)(W)', visibleKey: 'cci_w' },
        { key: 'cci_ema20_w', label: 'CCI.EMA20(W)', visibleKey: 'cci_ema20_w' },
        { key: 'aroon_up_w', label: 'AROON.UP(W)', visibleKey: 'aroon_up_w' },
        { key: 'aroon_down_w', label: 'AROON.DOWN(W)', visibleKey: 'aroon_down_w' },
    ];
    const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
        const defaultVisible: Record<string, boolean> = {};
        columnDefinitions.forEach((col, index) => {
            defaultVisible[col.visibleKey] = index < 15;
        });
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('stocksVisibleColumns');
            if (saved) {
                try {
                    const parsed: Record<string, boolean> = JSON.parse(saved);
                    return { ...defaultVisible, ...parsed };
                } catch { }
            }
        }
        return defaultVisible;
    });
    const [filters, setFilters] = useState<FilterState>(initialFilterState);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
                setShowExportMenu(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleColumn = useCallback((columnKey: string) => {
        setVisibleColumns(prev => {
            const updated = { ...prev, [columnKey]: !prev[columnKey] };
            localStorage.setItem('stocksVisibleColumns', JSON.stringify(updated));
            return updated;
        });
    }, []);
    const clearFilter = useCallback((key: keyof FilterState) => {
        if (Array.isArray(filters[key])) {
            setFilters(prev => ({ ...prev, [key]: [] }));
        } else if (key.endsWith('_min') || key.endsWith('_max')) {
            const baseKey = key.replace(/(_min|_max)$/, '');
            setFilters(prev => ({ ...prev, [`${baseKey}_min`]: '', [`${baseKey}_max`]: '' }));
        } else {
            setFilters(prev => ({ ...prev, [key]: '' }));
        }
    }, [filters]);
    const clearAllFilters = useCallback(() => { setFilters(initialFilterState); }, []);

    const handleSort = useCallback((key: string) => {
        setSortConfigs(prev => {
            const existingIndex = prev.findIndex(config => config.key === key);
            if (existingIndex === -1) return [...prev, { key, direction: 'asc' }];
            const existing = prev[existingIndex];
            if (existing.direction === 'asc') {
                const newConfigs = [...prev];
                newConfigs[existingIndex] = { ...existing, direction: 'desc' };
                return newConfigs;
            }
            return prev.filter((_, index) => index !== existingIndex);
        });
    }, []);
    const filterOptions = useMemo(() => {
        const options = { industryGroups: new Set<string>(), sectors: new Set<string>(), industries: new Set<string>(), subIndustries: new Set<string>() };
        stocks.forEach(stock => {
            if (stock.industry_group) options.industryGroups.add(stock.industry_group);
            if (stock.sector) options.sectors.add(stock.sector);
            if (stock.industry) options.industries.add(stock.industry);
            if (stock.sub_industry) options.subIndustries.add(stock.sub_industry);
        });
        return { industryGroups: Array.from(options.industryGroups).sort(), sectors: Array.from(options.sectors).sort(), industries: Array.from(options.industries).sort(), subIndustries: Array.from(options.subIndustries).sort() };
    }, [stocks]);
    const activeFilters = useMemo(() => {
        const active: Array<{ label: string; value: string; key: keyof FilterState }> = [];
        const addRangeFilter = (label: string, minKey: keyof FilterState, maxKey: keyof FilterState) => {
            const minValue = filters[minKey]; const maxValue = filters[maxKey];
            if (minValue || maxValue) active.push({ label, value: `${minValue || 'Min'} - ${maxValue || 'Max'}`, key: minKey });
        };
        const addCheckboxFilter = (label: string, key: keyof FilterState) => {
            const values = filters[key] as string[];
            if (values.length > 0) active.push({ label, value: values.join(', '), key });
        };
        const addBoolFilter = (label: string, key: keyof FilterState) => {
            const v = filters[key] as string;
            if (v && v !== 'any') active.push({ label, value: v.toUpperCase(), key });
        };

        // SmartSelect
        addRangeFilter('RS Rating', 'rs_rating_min', 'rs_rating_max');
        addCheckboxFilter('A/D Rating', 'acc_dis_rating');
        addCheckboxFilter('Group RS', 'industry_group_rs');
        addCheckboxFilter('Sector RS', 'sector_rs');
        addCheckboxFilter('Industry RS', 'industry_rs');
        addCheckboxFilter('Sub Industry RS', 'sub_industry_rs');

        // Price & Volume
        addRangeFilter('Price', 'price_min', 'price_max');
        addRangeFilter('Change', 'change_min', 'change_max');
        addRangeFilter('% Change', 'percent_change_min', 'percent_change_max');
        addRangeFilter('Volume', 'volume_min', 'volume_max');
        addRangeFilter('Turnover', 'turnover_min', 'turnover_max');
        addRangeFilter('Market Cap', 'market_cap_min', 'market_cap_max');
        addRangeFilter('Trades', 'no_of_trades_min', 'no_of_trades_max');
        addRangeFilter('% Off 52W High', 'percent_off_52w_high_min', 'percent_off_52w_high_max');
        addRangeFilter('% Off 52W Low', 'percent_off_52w_low_min', 'percent_off_52w_low_max');
        addRangeFilter('Open', 'open_min', 'open_max');
        addRangeFilter('High', 'high_min', 'high_max');
        addRangeFilter('Low', 'low_min', 'low_max');
        addRangeFilter('52W High', 'fifty_two_week_high_min', 'fifty_two_week_high_max');
        addRangeFilter('52W Low', 'fifty_two_week_low_min', 'fifty_two_week_low_max');
        addRangeFilter('Avg Vol 50', 'average_volume_50_min', 'average_volume_50_max');
        addRangeFilter('Vol Diff 50%', 'vol_diff_50_percent_min', 'vol_diff_50_percent_max');

        // Moving Averages — ranges
        addRangeFilter('EMA10', 'ema_10_min', 'ema_10_max');
        addRangeFilter('EMA21', 'ema_21_min', 'ema_21_max');
        addRangeFilter('SMA4(W)', 'sma_4w_min', 'sma_4w_max');
        addRangeFilter('SMA9(W)', 'sma_9w_min', 'sma_9w_max');
        addRangeFilter('SMA18(W)', 'sma_18w_min', 'sma_18w_max');
        addRangeFilter('SMA30(W)', 'sma_30w_min', 'sma_30w_max');
        addRangeFilter('SMA40(W)', 'sma_40w_min', 'sma_40w_max');
        addRangeFilter('200MA(1M)', 'sma_200_1m_min', 'sma_200_1m_max');
        addRangeFilter('200MA(2M)', 'sma_200_2m_min', 'sma_200_2m_max');
        addRangeFilter('200MA(3M)', 'sma_200_3m_min', 'sma_200_3m_max');
        addRangeFilter('200MA(4M)', 'sma_200_4m_min', 'sma_200_4m_max');
        addRangeFilter('200MA(5M)', 'sma_200_5m_min', 'sma_200_5m_max');

        // Moving Averages — booleans
        addBoolFilter('MA 10>21>50', 'ma_10_21_50');
        addBoolFilter('MA 50>150>200', 'ma_50_150_200');
        addBoolFilter('200MA(1M)>(2M)', 'ma_200_1m_2m');
        addBoolFilter('200MA(2M)>(3M)', 'ma_200_2m_3m');
        addBoolFilter('200MA(3M)>(4M)', 'ma_200_3m_4m');
        addBoolFilter('200MA(4M)>(5M)', 'ma_200_4m_5m');
        addBoolFilter('200MA Now>(1M)', 'ma_200_now_1m');
        addBoolFilter('200MA Now>(2M)', 'ma_200_now_2m');
        addBoolFilter('200MA Now>(3M)', 'ma_200_now_3m');
        addBoolFilter('200MA Now>(4M)', 'ma_200_now_4m');
        addBoolFilter('EMA10>21>50', 'ema_10_21_50');
        addBoolFilter('EMA10>EMA21', 'ema_10_21');
        addBoolFilter('Price>30W', 'price_gt_30w');
        addBoolFilter('Price>40W', 'price_gt_40w');
        addBoolFilter('EMA10>50SMA', 'ema_10_gt_50sma');
        addBoolFilter('Price>18SMA(D)', 'price_gt_18sma_daily');
        addBoolFilter('Price>9SMA(W)', 'price_gt_9sma_weekly');
        addBoolFilter('SMA4>9>18(D)', 'sma_4_9_18_daily');
        addBoolFilter('SMA4>9>18(W)', 'sma_4_9_18_weekly');

        // RSI Daily — ranges
        addRangeFilter('RSI(14)', 'rsi_14_min', 'rsi_14_max');
        addRangeFilter('SMA9(RSI)', 'sma9_rsi_min', 'sma9_rsi_max');
        addRangeFilter('WMA45(RSI)', 'wma45_rsi_min', 'wma45_rsi_max');
        addRangeFilter('EMA20(SMA3)', 'ema20_sma3_min', 'ema20_sma3_max');
        addRangeFilter('THE.NUMBER', 'the_number_min', 'the_number_max');
        addRangeFilter('THE.NUMBER.HIGH', 'the_number_hl_min', 'the_number_hl_max');
        addRangeFilter('THE.NUMBER.LOW', 'the_number_ll_min', 'the_number_ll_max');
        addRangeFilter('CFG', 'cfg_daily_min', 'cfg_daily_max');
        addRangeFilter('CFG.SMA4', 'cfg_sma4_min', 'cfg_sma4_max');
        addRangeFilter('CFG.EMA45', 'cfg_ema45_min', 'cfg_ema45_max');

        // RSI Daily — booleans (The Number crosses)
        addBoolFilter('Price>The Number', 'price_gt_the_number_daily');
        addBoolFilter('Price>The Number High', 'price_gt_the_number_hl_daily');
        addBoolFilter('Price>The Number Low', 'price_gt_the_number_ll_daily');
        addBoolFilter('9SMA>The Number', 'sma9_gt_the_number_daily');
        addBoolFilter('9SMA>The Number High', 'sma9_gt_the_number_hl_daily');
        addBoolFilter('9SMA>The Number Low', 'sma9_gt_the_number_ll_daily');
        addBoolFilter('9SMA>WMA45(D)', 'sma9_gt_wma45_daily');

        // RSI Daily — indicator crosses
        addBoolFilter('RSI>9SMA(RSI)(D)', 'rsi_gt_sma9rsi_daily');
        addBoolFilter('RSI>WMA45(RSI)(D)', 'rsi_gt_wma45rsi_daily');
        addBoolFilter('9SMA(RSI)>WMA45(D)', 'sma9rsi_gt_wma45_daily');
        addBoolFilter('WMA45(RSI)<9SMA(RSI)(D)', 'wma45rsi_lt_sma9rsi_daily');
        addBoolFilter('WMA45(RSI)<WMA45(D)', 'wma45rsi_lt_wma45_daily');
        addBoolFilter('WMA45(RSI)<CFG.WMA45(D)', 'wma45rsi_lt_cfgwma45_daily');
        addBoolFilter('WMA45(RSI)<EMA20(SMA3)(D)', 'wma45rsi_lt_ema20sma3_daily');

        // RSI Weekly — ranges
        addRangeFilter('RSI(14)(W)', 'rsi_w_min', 'rsi_w_max');
        addRangeFilter('SMA9(RSI)(W)', 'sma9_rsi_w_min', 'sma9_rsi_w_max');
        addRangeFilter('WMA45(RSI)(W)', 'wma45_rsi_w_min', 'wma45_rsi_w_max');
        addRangeFilter('EMA20(SMA3)(W)', 'ema20_sma3_w_min', 'ema20_sma3_w_max');
        addRangeFilter('THE.NUMBER(W)', 'the_number_w_min', 'the_number_w_max');
        addRangeFilter('CFG(W)', 'cfg_w_min', 'cfg_w_max');

        // RSI Weekly — booleans
        addBoolFilter('Price>The Number(W)', 'price_gt_the_number_weekly');
        addBoolFilter('Price>The Number High(W)', 'price_gt_the_number_hl_weekly');
        addBoolFilter('Price>The Number Low(W)', 'price_gt_the_number_ll_weekly');
        addBoolFilter('9SMA>The Number(W)', 'sma9_gt_the_number_weekly');
        addBoolFilter('9SMA>The Number High(W)', 'sma9_gt_the_number_hl_weekly');
        addBoolFilter('9SMA>The Number Low(W)', 'sma9_gt_the_number_ll_weekly');
        addBoolFilter('9SMA>WMA45(W)', 'sma9_gt_wma45_weekly');
        addBoolFilter('RSI>9SMA(RSI)(W)', 'rsi_gt_sma9rsi_weekly');
        addBoolFilter('RSI>WMA45(RSI)(W)', 'rsi_gt_wma45rsi_weekly');
        addBoolFilter('9SMA(RSI)>WMA45(W)', 'sma9rsi_gt_wma45_weekly');
        addBoolFilter('WMA45(RSI)<9SMA(RSI)(W)', 'wma45rsi_lt_sma9rsi_weekly');
        addBoolFilter('WMA45(RSI)<WMA45(W)', 'wma45rsi_lt_wma45_weekly');
        addBoolFilter('WMA45(RSI)<CFG.WMA45(W)', 'wma45rsi_lt_cfgwma45_weekly');
        addBoolFilter('WMA45(RSI)<EMA20(SMA3)(W)', 'wma45rsi_lt_ema20sma3_weekly');

        // Alrayan — ranges
        addRangeFilter('SMA4(D)', 'sma4_min', 'sma4_max');
        addRangeFilter('SMA9(D)', 'sma9_price_min', 'sma9_price_max');
        addRangeFilter('SMA18(D)', 'sma18_min', 'sma18_max');
        addRangeFilter('WMA45(Price)', 'wma45_close_min', 'wma45_close_max');
        addRangeFilter('SMA9(Close)', 'sma9_close_min', 'sma9_close_max');
        addRangeFilter('CCI(14)', 'cci_min', 'cci_max');
        addRangeFilter('CCI.EMA20', 'cci_ema20_min', 'cci_ema20_max');
        addRangeFilter('AROON.UP', 'aroon_up_min', 'aroon_up_max');
        addRangeFilter('AROON.DOWN', 'aroon_down_min', 'aroon_down_max');
        addRangeFilter('SMA4(W)', 'sma4_w_min', 'sma4_w_max');
        addRangeFilter('SMA9(W)', 'sma9_w_min', 'sma9_w_max');
        addRangeFilter('SMA18(W)', 'sma18_w_min', 'sma18_w_max');
        addRangeFilter('CCI(14)(W)', 'cci_w_min', 'cci_w_max');
        addRangeFilter('CCI.EMA20(W)', 'cci_ema20_w_min', 'cci_ema20_w_max');
        addRangeFilter('AROON.UP(W)', 'aroon_up_w_min', 'aroon_up_w_max');
        addRangeFilter('AROON.DOWN(W)', 'aroon_down_w_min', 'aroon_down_w_max');

        // Alrayan — booleans
        addBoolFilter('Aroon Up>70', 'aroon_up_gt_70');
        addBoolFilter('Aroon Down<30', 'aroon_down_lt_30');
        addBoolFilter('CCI>100', 'cci_gt_100');

        // STAMP — booleans
        addBoolFilter('9SMA(Price)>WMA45', 'stamp_sma9_gt_wma45');
        addBoolFilter('9SMA(RSI)>WMA45(STAMP)', 'stamp_sma9rsi_gt_wma45');
        addBoolFilter('EMA45(RSI)>50', 'stamp_ema45rsi_gt_50');
        addBoolFilter('EMA45(CFG)>50', 'stamp_ema45cfg_gt_50');
        addBoolFilter('EMA20(SMA3)>50', 'stamp_ema20sma3_gt_50');
        addBoolFilter('EMA45(RSI)<Lines', 'stamp_ema45rsi_lt_stamp_lines');

        // Industry / Symbol / Name
        if (filters.symbol) active.push({ label: 'Symbol', value: filters.symbol, key: 'symbol' });
        if (filters.name) active.push({ label: 'Name', value: filters.name, key: 'name' });
        if (filters.industry_group.length > 0) active.push({ label: 'Industry Groups', value: filters.industry_group.join(', '), key: 'industry_group' });
        if (filters.sector.length > 0) active.push({ label: 'Sectors', value: filters.sector.join(', '), key: 'sector' });
        if (filters.industry.length > 0) active.push({ label: 'Industries', value: filters.industry.join(', '), key: 'industry' });
        if (filters.sub_industry.length > 0) active.push({ label: 'Sub Industries', value: filters.sub_industry.join(', '), key: 'sub_industry' });
        return active;
    }, [filters]);
    const filteredAndSortedStocks = useMemo(() => {
        let filtered = stocks.filter(stock => {
            if (filters.symbol && !cleanSymbol(stock.symbol).includes(filters.symbol)) return false;
            if (filters.name && !(stock.name || '').toLowerCase().includes(filters.name.toLowerCase())) return false;
            if (filters.industry_group.length > 0 && !filters.industry_group.includes(stock.industry_group || '')) return false;
            if (filters.sector.length > 0 && !filters.sector.includes(stock.sector || '')) return false;
            if (filters.industry.length > 0 && !filters.industry.includes(stock.industry || '')) return false;
            if (filters.sub_industry.length > 0 && !filters.sub_industry.includes(stock.sub_industry || '')) return false;
            const checkRange = (value: any, minKey: keyof FilterState, maxKey: keyof FilterState, allowZero = false) => {
                const minValue = filters[minKey] as string;
                const maxValue = filters[maxKey] as string;

                // If value is null/undefined and no filters are active, pass the stock
                if ((value === null || value === undefined) && !minValue && !maxValue) return true;

                // If value is null/undefined but filters ARE active, fail the stock
                if ((value === null || value === undefined) && (minValue || maxValue)) return false;

                const numValue = parseFormattedNumber(value, true);
                if (minValue && numValue < parseFloat(minValue)) return false;
                if (maxValue && numValue > parseFloat(maxValue)) return false;
                if (!allowZero && numValue === 0 && (minValue || maxValue)) return false;
                return true;
            };
            const checkCheckbox = (value: string | undefined, allowedValues: string[]) => {
                if (allowedValues.length === 0) return true;
                if (!value) return false;
                return allowedValues.some(rating => value.startsWith(rating));
            };
            if (!checkRange(stock.rs_rating, 'rs_rating_min', 'rs_rating_max')) return false;
            if (!checkCheckbox(stock.acc_dis_rating, filters.acc_dis_rating)) return false;
            if (!checkCheckbox(stock.industry_group_rs, filters.industry_group_rs)) return false;
            if (!checkCheckbox(stock.sector_rs, filters.sector_rs)) return false;
            if (!checkCheckbox(stock.industry_rs, filters.industry_rs)) return false;
            if (!checkCheckbox(stock.sub_industry_rs, filters.sub_industry_rs)) return false;
            if (!checkRange(stock.price, 'price_min', 'price_max')) return false;
            if (!checkRange(stock.change, 'change_min', 'change_max', true)) return false;
            if (!checkRange(stock.percent_change, 'percent_change_min', 'percent_change_max', true)) return false;
            if (!checkRange(stock.volume, 'volume_min', 'volume_max')) return false;
            if (!checkRange(stock.turnover, 'turnover_min', 'turnover_max')) return false;
            if (!checkRange(stock.market_cap, 'market_cap_min', 'market_cap_max')) return false;
            if (!checkRange(stock.no_of_trades, 'no_of_trades_min', 'no_of_trades_max')) return false;
            if (!checkRange(stock.percent_off_52w_high, 'percent_off_52w_high_min', 'percent_off_52w_high_max', true)) return false;
            if (!checkRange(stock.percent_off_52w_low, 'percent_off_52w_low_min', 'percent_off_52w_low_max', true)) return false;
            if (!checkRange(stock.price_minus_sma_10, 'price_minus_sma_10_min', 'price_minus_sma_10_max', true)) return false;
            if (!checkRange(stock.price_minus_sma_21, 'price_minus_sma_21_min', 'price_minus_sma_21_max', true)) return false;
            if (!checkRange(stock.price_minus_sma_50, 'price_minus_sma_50_min', 'price_minus_sma_50_max', true)) return false;
            if (!checkRange(stock.price_minus_sma_150, 'price_minus_sma_150_min', 'price_minus_sma_150_max', true)) return false;
            if (!checkRange(stock.price_minus_sma_200, 'price_minus_sma_200_min', 'price_minus_sma_200_max', true)) return false;
            if (!checkRange(stock.price_vs_ema_10_percent, 'price_vs_ema_10_min', 'price_vs_ema_10_max', true)) return false;
            if (!checkRange(stock.price_vs_ema_21_percent, 'price_vs_ema_21_min', 'price_vs_ema_21_max', true)) return false;
            if (!checkRange(stock.price_vs_sma_50_percent, 'price_vs_sma_50_min', 'price_vs_sma_50_max', true)) return false;
            if (!checkRange(stock.price_vs_sma_150_percent, 'price_vs_sma_150_min', 'price_vs_sma_150_max', true)) return false;
            if (!checkRange(stock.price_vs_sma_200_percent, 'price_vs_sma_200_min', 'price_vs_sma_200_max', true)) return false;
            if (!checkRange(stock.fifty_two_week_high_price, 'fifty_two_week_high_min', 'fifty_two_week_high_max')) return false;
            if (!checkRange(stock.fifty_two_week_low_price, 'fifty_two_week_low_min', 'fifty_two_week_low_max')) return false;
            if (!checkRange(stock.average_volume_50, 'average_volume_50_min', 'average_volume_50_max')) return false;
            if (!checkRange(stock.vol_diff_50_percent, 'vol_diff_50_percent_min', 'vol_diff_50_percent_max', true)) return false;
            if (!checkRange(stock.open, 'open_min', 'open_max')) return false;
            if (!checkRange(stock.high, 'high_min', 'high_max')) return false;
            if (!checkRange(stock.low, 'low_min', 'low_max')) return false;
            if (!checkRange(stock.rsi_14, 'rsi_14_min', 'rsi_14_max', true)) return false;
            if (!checkRange(stock.sma9_rsi, 'sma9_rsi_min', 'sma9_rsi_max', true)) return false;
            if (!checkRange(stock.wma45_rsi, 'wma45_rsi_min', 'wma45_rsi_max', true)) return false;
            if (!checkRange(stock.the_number, 'the_number_min', 'the_number_max', true)) return false;
            if (!checkRange(stock.cfg_daily, 'cfg_daily_min', 'cfg_daily_max', true)) return false;
            if (!checkRange(stock.rsi_w, 'rsi_w_min', 'rsi_w_max', true)) return false;
            if (!checkRange(stock.ema_10, 'ema_10_min', 'ema_10_max', true)) return false;
            if (!checkRange(stock.ema_21, 'ema_21_min', 'ema_21_max', true)) return false;
            if (!checkRange(stock.sma_4w, 'sma_4w_min', 'sma_4w_max', true)) return false;
            if (!checkRange(stock.sma_9w, 'sma_9w_min', 'sma_9w_max', true)) return false;
            if (!checkRange(stock.sma_18w, 'sma_18w_min', 'sma_18w_max', true)) return false;
            if (!checkRange(stock.sma_30w, 'sma_30w_min', 'sma_30w_max', true)) return false;
            if (!checkRange(stock.sma_40w, 'sma_40w_min', 'sma_40w_max', true)) return false;
            if (!checkRange(stock.sma_200_1m_ago, 'sma_200_1m_min', 'sma_200_1m_max', true)) return false;
            if (!checkRange(stock.sma_200_2m_ago, 'sma_200_2m_min', 'sma_200_2m_max', true)) return false;
            if (!checkRange(stock.sma_200_3m_ago, 'sma_200_3m_min', 'sma_200_3m_max', true)) return false;
            if (!checkRange(stock.sma_200_4m_ago, 'sma_200_4m_min', 'sma_200_4m_max', true)) return false;
            if (!checkRange(stock.sma_200_5m_ago, 'sma_200_5m_min', 'sma_200_5m_max', true)) return false;
            if (!checkRange(stock.sma_3, 'sma_3_min', 'sma_3_max', true)) return false;
            if (!checkRange(stock.sma_4, 'sma4_min', 'sma4_max', true)) return false;
            if (!checkRange(stock.sma9_price, 'sma9_price_min', 'sma9_price_max', true)) return false;
            if (!checkRange(stock.sma_18, 'sma18_min', 'sma18_max', true)) return false;
            if (!checkRange(stock.cci_14, 'cci_min', 'cci_max', true)) return false;
            if (!checkRange(stock.cci_ema_20, 'cci_ema20_min', 'cci_ema20_max', true)) return false;
            if (!checkRange(stock.aroon_up, 'aroon_up_min', 'aroon_up_max', true)) return false;
            if (!checkRange(stock.aroon_down, 'aroon_down_min', 'aroon_down_max', true)) return false;
            if (!checkRange(stock.cfg_sma4, 'cfg_sma4_min', 'cfg_sma4_max', true)) return false;
            if (!checkRange(stock.cfg_ema45, 'cfg_ema45_min', 'cfg_ema45_max', true)) return false;
            if (!checkRange(stock.cfg_sma4_w, 'cfg_sma4_w_min', 'cfg_sma4_w_max', true)) return false;
            if (!checkRange(stock.cfg_ema45_w, 'cfg_ema45_w_min', 'cfg_ema45_w_max', true)) return false;
            if (!checkRange(stock.stamp_s9rsi, 'stamp_s9rsi_min', 'stamp_s9rsi_max', true)) return false;
            if (!checkRange(stock.stamp_e45cfg, 'stamp_e45cfg_min', 'stamp_e45cfg_max', true)) return false;
            if (!checkRange(stock.stamp_s9rsi_w, 'stamp_s9rsi_w_min', 'stamp_s9rsi_w_max', true)) return false;
            if (!checkRange(stock.stamp_e45cfg_w, 'stamp_e45cfg_w_min', 'stamp_e45cfg_w_max', true)) return false;
            if (!checkRange(stock.cci_w, 'cci_w_min', 'cci_w_max', true)) return false;
            if (!checkRange(stock.cci_ema20_w, 'cci_ema20_w_min', 'cci_ema20_w_max', true)) return false;
            if (!checkRange(stock.aroon_up_w, 'aroon_up_w_min', 'aroon_up_w_max', true)) return false;
            if (!checkRange(stock.aroon_down_w, 'aroon_down_w_min', 'aroon_down_w_max', true)) return false;
            if (!checkRange(stock.ema20_sma3, 'ema20_sma3_min', 'ema20_sma3_max', true)) return false;
            if (!checkRange(stock.ema20_sma3_w, 'ema20_sma3_w_min', 'ema20_sma3_w_max', true)) return false;
            if (!checkRange(stock.sma9_rsi_w, 'sma9_rsi_w_min', 'sma9_rsi_w_max', true)) return false;
            if (!checkRange(stock.wma45_rsi_w, 'wma45_rsi_w_min', 'wma45_rsi_w_max', true)) return false;
            if (!checkRange(stock.the_number_hl, 'the_number_hl_min', 'the_number_hl_max', true)) return false;
            if (!checkRange(stock.the_number_ll, 'the_number_ll_min', 'the_number_ll_max', true)) return false;
            if (!checkRange(stock.the_number_hl_w, 'the_number_hl_w_min', 'the_number_hl_w_max', true)) return false;
            if (!checkRange(stock.the_number_ll_w, 'the_number_ll_w_min', 'the_number_ll_w_max', true)) return false;
            if (!checkRange(stock.cfg_w, 'cfg_w_min', 'cfg_w_max', true)) return false;

            const c = (state: string, isValid: boolean) => {
                if (state === 'any') return true; // 'any' means no filter applied
                if (state === 'yes' && !isValid) return false;
                if (state === 'no' && isValid) return false;
                return true;
            };
            if (filters.ma_10_21_50 !== 'any') { if (!c(filters.ma_10_21_50, (stock.price_minus_sma_10 ?? 0) < (stock.price_minus_sma_21 ?? 0) && (stock.price_minus_sma_21 ?? 0) < (stock.price_minus_sma_50 ?? 0))) return false; }
            if (filters.ma_50_150_200 !== 'any') { if (!c(filters.ma_50_150_200, (stock.price_minus_sma_50 ?? 0) < (stock.price_minus_sma_150 ?? 0) && (stock.price_minus_sma_150 ?? 0) < (stock.price_minus_sma_200 ?? 0))) return false; }
            if (filters.ma_200_1m_2m !== 'any') { if (!c(filters.ma_200_1m_2m, (stock.sma_200_1m_ago ?? 0) > (stock.sma_200_2m_ago ?? 0))) return false; }
            if (filters.ma_200_2m_3m !== 'any') { if (!c(filters.ma_200_2m_3m, (stock.sma_200_2m_ago ?? 0) > (stock.sma_200_3m_ago ?? 0))) return false; }
            if (filters.ma_200_3m_4m !== 'any') { if (!c(filters.ma_200_3m_4m, (stock.sma_200_3m_ago ?? 0) > (stock.sma_200_4m_ago ?? 0))) return false; }
            if (filters.ma_200_4m_5m !== 'any') { if (!c(filters.ma_200_4m_5m, (stock.sma_200_4m_ago ?? 0) > (stock.sma_200_5m_ago ?? 0))) return false; }
            if (filters.ma_200_now_1m !== 'any') { if (!c(filters.ma_200_now_1m, (stock.sma_200 ?? 0) > (stock.sma_200_1m_ago ?? 0))) return false; }
            if (filters.ma_200_now_2m !== 'any') { if (!c(filters.ma_200_now_2m, (stock.sma_200 ?? 0) > (stock.sma_200_2m_ago ?? 0))) return false; }
            if (filters.ma_200_now_3m !== 'any') { if (!c(filters.ma_200_now_3m, (stock.sma_200 ?? 0) > (stock.sma_200_3m_ago ?? 0))) return false; }
            if (filters.ma_200_now_4m !== 'any') { if (!c(filters.ma_200_now_4m, (stock.sma_200 ?? 0) > (stock.sma_200_4m_ago ?? 0))) return false; }
            if (filters.ema_10_21_50 !== 'any') { if (!c(filters.ema_10_21_50, (stock.ema_10 ?? 0) > (stock.ema_21 ?? 0) && (stock.ema_21 ?? 0) > (stock.sma_50 ?? 0))) return false; }
            if (filters.ema_10_21 !== 'any') { if (!c(filters.ema_10_21, (stock.ema_10 ?? 0) > (stock.ema_21 ?? 0))) return false; }
            if (filters.price_gt_30w !== 'any') { if (!c(filters.price_gt_30w, parseFormattedNumber(stock.price) > (stock.sma_30w ?? 0))) return false; }
            if (filters.price_gt_40w !== 'any') { if (!c(filters.price_gt_40w, parseFormattedNumber(stock.price) > (stock.sma_40w ?? 0))) return false; }
            if (filters.ema_10_gt_50sma !== 'any') { if (!c(filters.ema_10_gt_50sma, (stock.ema_10 ?? 0) > (stock.sma_50 ?? 0))) return false; }
            if (filters.ema_21_gt_50sma !== 'any') { if (!c(filters.ema_21_gt_50sma, (stock.ema_21 ?? 0) > (stock.sma_50 ?? 0))) return false; }
            if (filters.sma_50_gt_150sma !== 'any') { if (!c(filters.sma_50_gt_150sma, (stock.price_minus_sma_50 ?? 0) < (stock.price_minus_sma_150 ?? 0))) return false; }
            if (filters.sma_50_gt_200sma !== 'any') { if (!c(filters.sma_50_gt_200sma, (stock.price_minus_sma_50 ?? 0) < (stock.price_minus_sma_200 ?? 0))) return false; }
            if (filters.sma_150_gt_200sma !== 'any') { if (!c(filters.sma_150_gt_200sma, (stock.price_minus_sma_150 ?? 0) < (stock.price_minus_sma_200 ?? 0))) return false; }
            if (filters.price_gt_18sma_daily !== 'any') { if (!c(filters.price_gt_18sma_daily, parseFormattedNumber(stock.price) > (stock.sma_18 ?? 0))) return false; }
            if (filters.price_gt_9sma_weekly !== 'any') { if (!c(filters.price_gt_9sma_weekly, parseFormattedNumber(stock.price) > (stock.sma_9w ?? 0))) return false; }
            if (filters.sma_4_9_18_daily !== 'any') { if (!c(filters.sma_4_9_18_daily, (stock.sma_4 ?? 0) > (stock.sma_9 ?? 0) && (stock.sma_9 ?? 0) > (stock.sma_18 ?? 0))) return false; }
            if (filters.sma_4_9_18_weekly !== 'any') { if (!c(filters.sma_4_9_18_weekly, (stock.sma_4w ?? 0) > (stock.sma_9w ?? 0) && (stock.sma_9w ?? 0) > (stock.sma_18w ?? 0))) return false; }
            if (filters.cci_gt_100 !== 'any') { if (!c(filters.cci_gt_100, (stock.cci_14 ?? 0) > 100)) return false; }

            // CCI EMA20 > 0 (Daily) - REQUIRES CCI > 100
            if (filters.cci_ema20_gt_0_daily !== 'any') {
                const cci100Valid = (stock.cci_14 ?? 0) > 100;
                const cciEma20Valid = (stock.cci_ema_20 ?? 0) > 0;
                const isValid = cci100Valid && cciEma20Valid;
                if (!c(filters.cci_ema20_gt_0_daily, isValid)) return false;
            }

            // CCI EMA20 > 0 (Weekly) - REQUIRES CCI > 100
            if (filters.cci_ema20_gt_0_weekly !== 'any') {
                const cci100Valid = (stock.cci_14 ?? 0) > 100;
                const cciEma20Valid = (stock.cci_ema_20 ?? 0) > 0;
                const isValid = cci100Valid && cciEma20Valid;
                if (!c(filters.cci_ema20_gt_0_weekly, isValid)) return false;
            }

            // AROON FILTERS (values are already 0-100 from backend)
            if (filters.aroon_up_gt_70 !== 'any') {
                const isValid = (stock.aroon_up ?? 0) > 70;
                if (!c(filters.aroon_up_gt_70, isValid)) return false;
            }

            // Aroon Down < 30 - REQUIRES Aroon Up > 70%
            if (filters.aroon_down_lt_30 !== 'any') {
                const aroonUpValid = (stock.aroon_up ?? 0) > 70;
                const aroonDownValid = (stock.aroon_down ?? 0) < 30;
                const isValid = aroonUpValid && aroonDownValid;
                if (!c(filters.aroon_down_lt_30, isValid)) return false;
            }

            if (filters.stamp_sma9_gt_wma45 !== 'any') { if (!c(filters.stamp_sma9_gt_wma45, (stock.sma9_price ?? 0) > (stock.wma45_close ?? 0))) return false; }
            if (filters.stamp_sma9rsi_gt_wma45 !== 'any') { if (!c(filters.stamp_sma9rsi_gt_wma45, (stock.sma9_rsi ?? 0) > (stock.wma45_rsi ?? 0))) return false; }
            if (filters.stamp_ema45rsi_gt_50 !== 'any') { if (!c(filters.stamp_ema45rsi_gt_50, (stock.stamp_e45rsi ?? 0) > 50)) return false; }
            if (filters.stamp_ema45cfg_gt_50 !== 'any') { if (!c(filters.stamp_ema45cfg_gt_50, (stock.stamp_e45cfg ?? 0) > 50)) return false; }
            if (filters.stamp_ema20sma3_gt_50 !== 'any') { if (!c(filters.stamp_ema20sma3_gt_50, (stock.stamp_e20sma3 ?? 0) > 50)) return false; }
            if (filters.stamp_ema45rsi_lt_stamp_lines !== 'any') { if (!c(filters.stamp_ema45rsi_lt_stamp_lines, (stock.stamp_e45rsi ?? 0) < (stock.sma9_rsi ?? 0) && (stock.stamp_e45rsi ?? 0) < (stock.wma45_rsi ?? 0))) return false; }

            // STAMP Filters (Weekly)
            if (filters.stamp_sma9_gt_wma45_weekly !== 'any') { if (!c(filters.stamp_sma9_gt_wma45_weekly, (stock.sma9_w ?? 0) > (stock.wma45_close_w ?? 0))) return false; }
            if (filters.stamp_sma9rsi_gt_wma45_weekly !== 'any') { if (!c(filters.stamp_sma9rsi_gt_wma45_weekly, (stock.sma9_rsi_w ?? 0) > (stock.wma45_rsi_w ?? 0))) return false; }
            if (filters.stamp_ema45rsi_gt_50_weekly !== 'any') { if (!c(filters.stamp_ema45rsi_gt_50_weekly, (stock.stamp_e45rsi_w ?? 0) > 50)) return false; }
            if (filters.stamp_ema45cfg_gt_50_weekly !== 'any') { if (!c(filters.stamp_ema45cfg_gt_50_weekly, (stock.stamp_e45cfg_w ?? 0) > 50)) return false; }
            if (filters.stamp_ema20sma3_gt_50_weekly !== 'any') { if (!c(filters.stamp_ema20sma3_gt_50_weekly, (stock.stamp_e20sma3_w ?? 0) > 50)) return false; }
            if (filters.stamp_ema45rsi_lt_stamp_lines_weekly !== 'any') { if (!c(filters.stamp_ema45rsi_lt_stamp_lines_weekly, (stock.stamp_e45rsi_w ?? 0) < (stock.sma9_rsi_w ?? 0) && (stock.stamp_e45rsi_w ?? 0) < (stock.wma45_rsi_w ?? 0))) return false; }

            const p = parseFormattedNumber(stock.price);
            const p_w = stock.close_w ?? p;
            const s9 = stock.sma9_price ?? 0; const s9_w = stock.sma9_w ?? 0;
            const t = stock.the_number ?? 0; const th = stock.the_number_hl ?? 0; const tl = stock.the_number_ll ?? 0;
            const t_w = stock.the_number_w ?? 0; const th_w = stock.the_number_hl_w ?? 0; const tl_w = stock.the_number_ll_w ?? 0;
            const w45 = stock.wma45_close ?? 0; const w45_w = stock.wma45_close_w ?? 0;
            const rsi = stock.rsi_14 ?? 0; const rsi_w_val = stock.rsi_w ?? 0;
            const s9rsi = stock.sma9_rsi ?? 0; const w45rsi = stock.wma45_rsi ?? 0;
            const s9rsi_w = stock.sma9_rsi_w ?? 0; const w45rsi_w = stock.wma45_rsi_w ?? 0;
            const cfgw45 = stock.cfg_wma45 ?? 0; const cfgw45_w = stock.cfg_wma45_w ?? 0;
            const e20s3 = stock.ema20_sma3 ?? 0; const e20s3_w = stock.ema20_sma3_w ?? 0;

            if (!c(filters.price_gt_the_number_daily, p > t)) return false;
            if (!c(filters.price_gt_the_number_hl_daily, p > th)) return false;
            if (!c(filters.price_gt_the_number_ll_daily, p > tl)) return false;
            if (!c(filters.sma9_gt_the_number_daily, s9 > t)) return false;
            if (!c(filters.sma9_gt_the_number_hl_daily, s9 > th)) return false;
            if (!c(filters.sma9_gt_the_number_ll_daily, s9 > tl)) return false;
            if (!c(filters.sma9_gt_wma45_daily, s9 > w45)) return false;
            if (!c(filters.rsi_gt_sma9rsi_daily, rsi > s9rsi)) return false;
            if (!c(filters.rsi_gt_wma45rsi_daily, rsi > w45rsi)) return false;
            if (!c(filters.sma9rsi_gt_wma45_daily, s9rsi > w45rsi)) return false;
            if (!c(filters.wma45rsi_lt_sma9rsi_daily, w45rsi < s9rsi)) return false;
            if (!c(filters.wma45rsi_lt_wma45_daily, w45rsi < w45)) return false;
            if (!c(filters.wma45rsi_lt_cfgwma45_daily, w45rsi < cfgw45)) return false;
            if (!c(filters.wma45rsi_lt_ema20sma3_daily, w45rsi < e20s3)) return false;
            if (!c(filters.price_gt_the_number_weekly, p_w > t_w)) return false;
            if (!c(filters.price_gt_the_number_hl_weekly, p_w > th_w)) return false;
            if (!c(filters.price_gt_the_number_ll_weekly, p_w > tl_w)) return false;
            if (!c(filters.sma9_gt_the_number_weekly, s9_w > t_w)) return false;
            if (!c(filters.sma9_gt_the_number_hl_weekly, s9_w > th_w)) return false;
            if (!c(filters.sma9_gt_the_number_ll_weekly, s9_w > tl_w)) return false;
            if (!c(filters.sma9_gt_wma45_weekly, s9_w > w45_w)) return false;
            if (!c(filters.rsi_gt_sma9rsi_weekly, rsi_w_val > s9rsi_w)) return false;
            if (!c(filters.rsi_gt_wma45rsi_weekly, rsi_w_val > w45rsi_w)) return false;
            if (!c(filters.sma9rsi_gt_wma45_weekly, s9rsi_w > w45rsi_w)) return false;
            if (!c(filters.wma45rsi_lt_sma9rsi_weekly, w45rsi_w < s9rsi_w)) return false;
            if (!c(filters.wma45rsi_lt_wma45_weekly, w45rsi_w < w45_w)) return false;
            if (!c(filters.wma45rsi_lt_cfgwma45_weekly, w45rsi_w < cfgw45_w)) return false;
            if (!c(filters.wma45rsi_lt_ema20sma3_weekly, w45rsi_w < e20s3_w)) return false;
            // === Moving Average Comparison Boolean Filters (live-calculated) ===
            const _ema10 = parseFloat(String(stock.ema10 ?? stock.ema_10 ?? 0)) || 0;
            const _ema21 = parseFloat(String(stock.ema21 ?? stock.ema_21 ?? 0)) || 0;
            const _sma50 = parseFloat(String(stock.sma50 ?? stock.sma_50 ?? 0)) || 0;
            const _sma150 = parseFloat(String(stock.sma150 ?? stock.sma_150 ?? 0)) || 0;
            const _sma200 = parseFloat(String(stock.sma200 ?? stock.sma_200 ?? 0)) || 0;
            const _sma200_1m = parseFloat(String(stock.sma_200_1m_ago ?? 0)) || 0;
            const _sma200_2m = parseFloat(String(stock.sma_200_2m_ago ?? 0)) || 0;
            const _sma200_3m = parseFloat(String(stock.sma_200_3m_ago ?? 0)) || 0;
            const _sma200_4m = parseFloat(String(stock.sma_200_4m_ago ?? 0)) || 0;
            const _sma200_5m = parseFloat(String(stock.sma_200_5m_ago ?? 0)) || 0;
            if (filters.ema10_gt_sma50 !== 'any' && !c(filters.ema10_gt_sma50, _ema10 > _sma50)) return false;
            if (filters.ema10_gt_sma200 !== 'any' && !c(filters.ema10_gt_sma200, _ema10 > _sma200)) return false;
            if (filters.ema21_gt_sma50 !== 'any' && !c(filters.ema21_gt_sma50, _ema21 > _sma50)) return false;
            if (filters.ema21_gt_sma200 !== 'any' && !c(filters.ema21_gt_sma200, _ema21 > _sma200)) return false;
            if (filters.sma50_gt_sma150 !== 'any' && !c(filters.sma50_gt_sma150, _sma50 > _sma150)) return false;
            if (filters.sma50_gt_sma200 !== 'any' && !c(filters.sma50_gt_sma200, _sma50 > _sma200)) return false;
            if (filters.sma150_gt_sma200 !== 'any' && !c(filters.sma150_gt_sma200, _sma150 > _sma200)) return false;
            if (filters.sma200_gt_sma200_1m_ago !== 'any' && !c(filters.sma200_gt_sma200_1m_ago, _sma200 > _sma200_1m)) return false;
            if (filters.sma200_gt_sma200_2m_ago !== 'any' && !c(filters.sma200_gt_sma200_2m_ago, _sma200 > _sma200_2m)) return false;
            if (filters.sma200_gt_sma200_3m_ago !== 'any' && !c(filters.sma200_gt_sma200_3m_ago, _sma200 > _sma200_3m)) return false;
            if (filters.sma200_gt_sma200_4m_ago !== 'any' && !c(filters.sma200_gt_sma200_4m_ago, _sma200 > _sma200_4m)) return false;
            if (filters.sma200_gt_sma200_5m_ago !== 'any' && !c(filters.sma200_gt_sma200_5m_ago, _sma200 > _sma200_5m)) return false;
            if (!c(filters.wma30_gt_wma40, parseFloat(String(stock.sma_30w ?? 0)) > parseFloat(String(stock.sma_40w ?? 0)))) return false;
            if (!c(filters.price_gt_ema10, p > _ema10)) return false;
            if (!c(filters.price_gt_ema21, p > _ema21)) return false;
            return true;
        });
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
                            default: return (stock as any)[key] || 0;
                        }
                    };
                    const aValue = getValue(a, config.key); const bValue = getValue(b, config.key);
                    if (aValue === bValue) continue;
                    if (typeof aValue === 'string' && typeof bValue === 'string') {
                        const comparison = aValue.localeCompare(bValue);
                        if (comparison !== 0) return config.direction === 'asc' ? comparison : -comparison;
                    } else {
                        const aNum = Number(aValue); const bNum = Number(bValue);
                        if (aNum !== bNum) return config.direction === 'asc' ? aNum - bNum : bNum - aNum;
                    }
                }
                return 0;
            });
        }
        return filtered;
    }, [stocks, filters, sortConfigs]);
    const handleExport = useCallback((format: 'csv' | 'xlsx' | 'xls' | 'txt') => {
        const visibleCols = columnDefinitions.filter(col => visibleColumns[col.visibleKey]);
        const headerLabels = visibleCols.map(col => col.label);
        const dataRows = filteredAndSortedStocks.map(stock => visibleCols.map(col => {
            switch (col.key) {
                case 'symbol': return cleanSymbol(stock.symbol);
                case 'name': return cleanName(stock.name);
                case 'charts': return 'View';
                case 'price': return formatNumber(stock.price);
                case 'change': return formatChange(stock.change);
                case 'percent_change': return formatChangePercent(stock.percent_change);
                default: { const val = (stock as any)[col.key]; if (val === null || val === undefined) return '-'; const num = Number(val); return Number.isNaN(num) ? String(val) : num.toFixed(2); }
            }
        }));
        const filename = `REBH_Stocks_${new Date().toISOString().split('T')[0]}`;
        if (format === 'csv' || format === 'txt') {
            const separator = format === 'csv' ? ',' : '\t';
            const content = [headerLabels.join(separator), ...dataRows.map(row => row.join(separator))].join('\n');
            const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
            const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `${filename}.${format}`; link.click();
        } else {
            const worksheet = XLSX.utils.aoa_to_sheet([headerLabels, ...dataRows]);
            const workbook = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(workbook, worksheet, "Stocks");
            XLSX.writeFile(workbook, `${filename}.${format}`, { bookType: format === 'xls' ? 'biff8' : 'xlsx' });
        }
        setShowExportMenu(false);
    }, [filteredAndSortedStocks, visibleColumns]);

    // Automatically select the first stock if the filtered list changes and the selected symbol is not in it
    useEffect(() => {
        if (filteredAndSortedStocks.length > 0) {
            const isCurrentlySelectedValid = filteredAndSortedStocks.some(s => s.symbol === selectedSymbol);
            if (!isCurrentlySelectedValid) {
                // Default to symbol 1010 on initial load (if present), otherwise pick first available
                const defaultSymbol = filteredAndSortedStocks.find(s => s.symbol === '1010')?.symbol;
                setSelectedSymbol(defaultSymbol || filteredAndSortedStocks[0].symbol);
            }
        } else {
            setSelectedSymbol('');
        }
    }, [filteredAndSortedStocks, selectedSymbol]);

    // ── Keyboard shortcut "/" to open search ─────────────────────────────────
    useEffect(() => {
        const handleGlobalKey = (e: KeyboardEvent) => {
            if (e.key === '/' && !isSearchModalOpen) {
                const target = e.target as HTMLElement;
                if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    setIsSearchModalOpen(true);
                }
            }
        };
        document.addEventListener('keydown', handleGlobalKey);
        return () => document.removeEventListener('keydown', handleGlobalKey);
    }, [isSearchModalOpen]);

    if (loading) return (<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div><h2 className="mt-4 text-lg font-semibold text-gray-700">Loading Data...</h2><p className="text-gray-500">Please wait</p></div></div>);
    if (error) return (<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-center text-red-600"><h2 className="text-lg font-semibold">Error fetching data</h2><p>{error}</p></div></div>);
    if (stocks.length === 0) return (<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-center text-gray-500"><h2 className="text-lg font-semibold">No Data Available</h2><p>No stock data found</p></div></div>);

    const activeChartStock = filteredAndSortedStocks.find(s => s.symbol === selectedSymbol) || filteredAndSortedStocks[0];
    const tradingViewSymbol = activeChartStock ? (activeChartStock.trading_view_symbol || `TADAWUL:${cleanSymbol(activeChartStock.symbol)}`) : '';

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col h-screen">
            <style jsx global>{`
                /* ── Refined Scrollbars ── */
                .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; }
                .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
                /* ── Font imports ── */
                @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&display=swap');
            `}</style>

            {/* ═══ CONTENT AREA ═══ */}
            <div className="flex-1 flex overflow-hidden">

                {/* ── MAIN CONTENT ── */}
                <div className="flex-1 flex flex-col overflow-hidden">

                    {/* ── Toolbar ── */}
                    <div className="bg-white border-b border-slate-100 px-4 py-2 flex-shrink-0">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                {/* Market stats */}
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Market</span>
                                    <span className="font-mono font-bold text-slate-800 text-sm tabular-nums">
                                        {filteredAndSortedStocks.length}
                                    </span>
                                    <span className="text-[11px] text-slate-400">stocks</span>
                                    {activeFilters.length > 0 && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold border border-blue-100">
                                            {activeFilters.length} filter{activeFilters.length !== 1 ? 's' : ''} active
                                        </span>
                                    )}
                                </div>
                                {/* Datetime */}
                                {metadata?.datetime && (
                                    <span className="font-mono text-[11px] text-slate-400 tabular-nums">{metadata.datetime}</span>
                                )}
                            </div>

                            {/* Search shortcut hint */}
                            <button
                                onClick={() => setIsSearchModalOpen(true)}
                                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-[12px] text-slate-400 hover:text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all group"
                            >
                                <Search className="w-3.5 h-3.5" />
                                <span className="font-medium">Search symbol</span>
                                <kbd className="ml-1 px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono group-hover:bg-white transition-colors">/</kbd>
                            </button>
                        </div>
                    </div>

                    {/* ── Active Filter Badges ── */}
                    {activeFilters.length > 0 && (
                        <div className="px-4 py-2 flex flex-wrap gap-1.5 border-b border-slate-100 bg-white flex-shrink-0">
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

                    {/* ── Chart Container ── */}
                    <div className="flex-1 bg-slate-50 p-3 overflow-hidden flex flex-col">
                        {activeChartStock ? (
                            <div className="flex-1 bg-white rounded-xl overflow-hidden border border-slate-200 shadow-[0_1px_4px_0_rgba(15,23,42,0.06)] flex flex-col">

                                {/* ── Premium Chart Header ── */}
                                <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between gap-4 whitespace-nowrap overflow-hidden shrink-0">

                                    {/* Left: Symbol badge + company name + exchange */}
                                    <button
                                        onClick={() => setIsSearchModalOpen(true)}
                                        className="flex items-center gap-2.5 group focus:outline-none min-w-0"
                                        title="Search for a symbol (press /)"
                                    >
                                        {/* Symbol Badge */}
                                        <div className="flex items-center justify-center h-8 px-3 rounded-lg shrink-0 bg-slate-100 group-hover:bg-blue-600 transition-colors duration-150">
                                            <span className="font-mono font-bold text-[13px] tracking-tight leading-none text-slate-700 group-hover:text-white transition-colors">
                                                {cleanSymbol(activeChartStock.symbol)}
                                            </span>
                                        </div>

                                        {/* Company name */}
                                        <span className="text-[13px] font-semibold text-slate-700 group-hover:text-blue-600 truncate transition-colors max-w-[240px]">
                                            {cleanName(activeChartStock.name || '')}
                                        </span>

                                        {/* Exchange pill */}
                                        <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded shrink-0 tracking-wider uppercase">
                                            TADAWUL
                                        </span>

                                        {/* Hover hint */}
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                            <Search className="w-3 h-3 text-blue-400" />
                                            <span className="text-[10px] font-medium text-blue-400">Change</span>
                                        </div>
                                    </button>

                                    {/* Right: Price + change */}
                                    <div className="flex items-center gap-3 shrink-0">
                                        {/* Current price */}
                                        <span className="font-mono font-bold text-[17px] text-slate-900 tabular-nums tracking-tight">
                                            {formatNumber(activeChartStock.price)}
                                            <span className="text-[11px] font-semibold text-slate-400 ml-1.5">SAR</span>
                                        </span>

                                        {/* Change badge */}
                                        <div className={`
                                            flex items-center gap-1 px-2.5 py-1 rounded-lg
                                            font-mono font-semibold text-[12px] tabular-nums shrink-0
                                            ${parseFormattedNumber(activeChartStock.change, true) < 0
                                                ? 'text-rose-600 bg-rose-50 border border-rose-100'
                                                : 'text-emerald-600 bg-emerald-50 border border-emerald-100'
                                            }
                                        `}>
                                            <span>
                                                {parseFormattedNumber(activeChartStock.change, true) >= 0 ? '+' : ''}
                                                {formatChange(activeChartStock.change)}
                                            </span>
                                            <span className="opacity-60 text-[10px]">
                                                ({formatChangePercent(activeChartStock.percent_change)})
                                            </span>
                                        </div>

                                        {/* Keyboard shortcut */}
                                        <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 border border-slate-200 rounded shadow-sm">
                                            /
                                        </kbd>
                                    </div>
                                </div>

                                {/* ── Chart body ── */}
                                <div className="flex-1 w-full min-h-0 relative">
                                    <LightweightChart
                                        key={cleanSymbol(activeChartStock.symbol)}
                                        symbol={cleanSymbol(activeChartStock.symbol)}
                                        height={undefined}
                                        showVolume={true}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <p className="text-sm font-medium text-slate-500">No stocks match the current filters</p>
                                <p className="text-xs text-slate-400">Try adjusting your filter criteria</p>
                            </div>
                        )}
                    </div>

                </div>
                {/* ─── END MAIN CONTENT ─── */}

                {/* ── Symbol Search Modal ── */}
                <SymbolSearchModal
                    isOpen={isSearchModalOpen}
                    onClose={() => setIsSearchModalOpen(false)}
                    stocks={filteredAndSortedStocks}
                    onSelect={(symbol) => {
                        setSelectedSymbol(symbol);
                        setIsSearchModalOpen(false);
                    }}
                />

            </div>
            {/* ─── END CONTENT AREA ─── */}

        </div>
    );
}