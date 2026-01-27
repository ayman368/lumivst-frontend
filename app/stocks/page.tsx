'use client';

import Link from 'next/link';
import styles from '../styles/Stocks.module.css';
import { useState, useMemo, useEffect } from 'react';

// ==================== Interfaces ====================

interface StockMetadata {
  exchange: string;
  currency: string;
  datetime: string;
  timezone: string;
}

interface Stock {
  symbol: string;
  name: string;
  industry_group: string;
  sector: string;
  industry: string;
  sub_industry: string;

  price: string | number;
  change: string | number;
  percent_change: string | number;

  open: string | number;
  high: string | number;
  low: string | number;

  volume: string | number;
  turnover: string | number;
  no_of_trades: number;

  // IBD Metrics
  rs_rating?: number;
  industry_group_rs?: string;
  sector_rs?: string;
  industry_rs?: string;
  sub_industry_rs?: string;
  acc_dis_rating?: string;

  // Technical Indicators
  price_minus_sma_10?: number;
  price_minus_sma_21?: number;
  price_minus_sma_50?: number;
  price_minus_sma_150?: number;
  price_minus_sma_200?: number;
  fifty_two_week_high_price?: number;
  fifty_two_week_low_price?: number;
  average_volume_50?: number;

  // Percentage Technicals
  price_vs_sma_10_percent?: number;
  price_vs_sma_21_percent?: number;
  price_vs_sma_50_percent?: number;
  price_vs_sma_150_percent?: number;
  price_vs_sma_200_percent?: number;
  percent_off_52w_high?: number;
  percent_off_52w_low?: number;
  vol_diff_50_percent?: number;
}

interface FilterState {
  symbol: string;
  name: string;
  industry_group: string;
  sector: string;
  industry: string;
  sub_industry: string;
  open: string;
  high: string;
  low: string;
  price: string;
  change: string;
  percent_change: string;
  volume: string;
  turnover: string;
  no_of_trades: string;
  price_minus_sma_10: string;
  price_minus_sma_21: string;
  price_minus_sma_50: string;
  price_minus_sma_150: string;
  price_minus_sma_200: string;
  fifty_two_week_high_price: string;
  fifty_two_week_low_price: string;
  average_volume_50: string;
  price_vs_sma_10_percent: string;
  price_vs_sma_21_percent: string;
  price_vs_sma_50_percent: string;
  price_vs_sma_150_percent: string;
  price_vs_sma_200_percent: string;
  percent_off_52w_high: string;
  percent_off_52w_low: string;
  vol_diff_50_percent: string;
}

// ==================== Helper Functions ====================

function cleanSymbol(symbol: string): string {
  if (!symbol) return '';
  return symbol.replace(/\D/g, '');
}

function cleanName(value: any): string {
  if (!value || value === 'N/A') return 'N/A';
  return String(value).trim().replace(/\.$/, '');
}

function parseFormattedNumber(value: any, handleParentheses = false): number {
  if (!value || value === 'N/A' || value === '') return 0;

  if (typeof value === 'number') return value;

  const strValue = value.toString().trim();

  if (handleParentheses && strValue.startsWith('(') && strValue.endsWith(')')) {
    return -parseFloat(strValue.slice(1, -1).replace(/,/g, ''));
  }

  if (strValue.includes('%')) {
    return parseFloat(strValue.replace('%', ''));
  }

  return parseFloat(strValue.replace(/,/g, '')) || 0;
}

function displayRawValue(value: any): string {
  if (value === null || value === undefined || value === '') return 'N/A';

  if (typeof value === 'number') {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  const strValue = String(value).trim();
  if (strValue === 'N/A') return 'N/A';

  const num = parseFloat(strValue.replace(/,/g, ''));
  if (!isNaN(num)) {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  return strValue;
}

function formatNumber(value: any): string {
  if (value === null || value === undefined || value === 'N/A') return 'N/A';

  const num = parseFormattedNumber(value);
  if (isNaN(num)) return 'N/A';

  if (Math.abs(num) >= 1000000) {
    return (num / 1000000).toFixed(2) + 'M';
  }

  if (Math.abs(num) >= 1000) {
    return (num / 1000).toFixed(2) + 'K';
  }

  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatChange(value: any): string {
  if (value === null || value === undefined || value === 'N/A') return 'N/A';

  const num = parseFormattedNumber(value, true);
  if (isNaN(num)) return 'N/A';

  const absNum = Math.abs(num);
  let formatted: string;

  if (absNum >= 1000000) {
    formatted = (absNum / 1000000).toFixed(2) + 'M';
  } else if (absNum >= 1000) {
    formatted = (absNum / 1000).toFixed(2) + 'K';
  } else {
    formatted = absNum.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  return num < 0 ? `(${formatted})` : formatted;
}

function formatChangePercent(value: any): string {
  if (value === null || value === undefined || value === 'N/A') return 'N/A';

  const num = parseFormattedNumber(value);
  if (isNaN(num)) return 'N/A';

  const absNum = Math.abs(num);
  return num < 0 ? `(${absNum.toFixed(2)}%)` : `${absNum.toFixed(2)}%`;
}

function formatText(value: any): string {
  if (!value || value === 'N/A') return 'N/A';
  return String(value);
}

// Helper Component for Ratings
function RatingBadge({ value }: { value?: string }) {
  if (!value || value === 'N/A') return <span style={{ color: '#ccc' }}>-</span>;

  let bg = '#f3f4f6';
  let color = '#374151';
  let border = '#e5e7eb';

  if (value.startsWith('A')) { bg = '#dcfce7'; color = '#166534'; border = '#bbf7d0'; }
  else if (value.startsWith('B')) { bg = '#dbeafe'; color = '#1e40af'; border = '#bfdbfe'; }
  else if (value.startsWith('C')) { bg = '#fef9c3'; color = '#854d0e'; border = '#fef08a'; }
  else if (value.startsWith('D')) { bg = '#ffedd5'; color = '#9a3412'; border = '#fed7aa'; }
  else if (value.startsWith('E')) { bg = '#fee2e2'; color = '#991b1b'; border = '#fecaca'; }

  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: 'bold',
      backgroundColor: bg,
      color: color,
      border: `1px solid ${border}`,
      minWidth: '24px',
      textAlign: 'center'
    }}>
      {value}
    </span>
  );
}

// ==================== Main Component ====================

export default function StocksPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [metadata, setMetadata] = useState<StockMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfigs, setSortConfigs] = useState<Array<{ key: string; direction: 'asc' | 'desc' }>>([]);

  const [filters, setFilters] = useState<FilterState & {
    rs_rating: string;
    industry_group_rs: string;
    sector_rs: string;
    industry_rs: string;
    sub_industry_rs: string;
    acc_dis_rating: string;
  }>({
    symbol: '',
    name: '',
    industry_group: '',
    sector: '',
    industry: '',
    sub_industry: '',
    rs_rating: '',
    industry_group_rs: '',
    sector_rs: '',
    industry_rs: '',
    sub_industry_rs: '',
    acc_dis_rating: '',
    open: '',
    high: '',
    low: '',
    price: '',
    change: '',
    percent_change: '',
    volume: '',
    turnover: '',
    no_of_trades: '',
    price_minus_sma_10: '',
    price_minus_sma_21: '',
    price_minus_sma_50: '',
    price_minus_sma_150: '',
    price_minus_sma_200: '',
    fifty_two_week_high_price: '',
    fifty_two_week_low_price: '',
    average_volume_50: '',
    price_vs_sma_10_percent: '',
    price_vs_sma_21_percent: '',
    price_vs_sma_50_percent: '',
    price_vs_sma_150_percent: '',
    price_vs_sma_200_percent: '',
    percent_off_52w_high: '',
    percent_off_52w_low: '',
    vol_diff_50_percent: '',
  });

  // Column Visibility State
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('stocksVisibleColumns');
      if (saved) {
        return JSON.parse(saved);
      }
    }
    // Default visible columns
    return {
      symbol: true,
      name: true,
      price: true,
      change: true,
      percent_change: true,
      rs_rating: true,          // Default ON
      industry_group_rs: true,  // Default ON
      acc_dis_rating: true,     // Default ON
      sector_rs: false,
      industry_rs: false,
      sub_industry_rs: false,
      volume: true,
      turnover: true,
      industry_group: false,
      sector: false,
      industry: false,
      sub_industry: false,
      open: false,
      high: false,
      low: false,
      no_of_trades: false,
      price_minus_sma_10: false,
      price_minus_sma_21: false,
      price_minus_sma_50: false,
      price_minus_sma_150: false,
      price_minus_sma_200: false,
      fifty_two_week_high_price: false,
      fifty_two_week_low_price: false,
      average_volume_50: false,
      price_vs_sma_10_percent: false,
      price_vs_sma_21_percent: false,
      price_vs_sma_50_percent: false,
      price_vs_sma_150_percent: false,
      price_vs_sma_200_percent: false,
      percent_off_52w_high: false,
      percent_off_52w_low: false,
      vol_diff_50_percent: false,
    };
  });

  const [showColumnMenu, setShowColumnMenu] = useState(false);

  const toggleColumn = (columnKey: string) => {
    setVisibleColumns(prev => {
      const updated = { ...prev, [columnKey]: !prev[columnKey] };
      localStorage.setItem('stocksVisibleColumns', JSON.stringify(updated));
      return updated;
    });
  };

  const columnGroups = [
    {
      name: 'Basic Info',
      columns: [
        { key: 'symbol', label: 'Symbol' },
        { key: 'name', label: 'Company' },
        { key: 'industry_group', label: 'Industry Group' },
        { key: 'sector', label: 'Sector' },
        { key: 'industry', label: 'Industry' },
        { key: 'sub_industry', label: 'Sub-Industry' },
      ]
    },
    {
      name: 'Price Data',
      columns: [
        { key: 'price', label: 'Price' },
        { key: 'change', label: 'Change' },
        { key: 'percent_change', label: 'Change %' },
        { key: 'open', label: 'Open' },
        { key: 'high', label: 'High' },
        { key: 'low', label: 'Low' },
      ]
    },
    {
      name: 'Volume',
      columns: [
        { key: 'volume', label: 'Volume' },
        { key: 'turnover', label: 'Turnover' },
        { key: 'no_of_trades', label: 'Trades' },
        { key: 'average_volume_50', label: 'Avg Vol 50' },
        { key: 'vol_diff_50_percent', label: 'Vol vs 50D %' },
      ]
    },
    {
      name: 'Moving Averages (Absolute)',
      columns: [
        { key: 'price_minus_sma_10', label: 'Price - SMA10' },
        { key: 'price_minus_sma_21', label: 'Price - SMA21' },
        { key: 'price_minus_sma_50', label: 'Price - SMA50' },
        { key: 'price_minus_sma_150', label: 'Price - SMA150' },
        { key: 'price_minus_sma_200', label: 'Price - SMA200' },
      ]
    },
    {
      name: 'Moving Averages (%)',
      columns: [
        { key: 'price_vs_sma_10_percent', label: 'vs SMA10 %' },
        { key: 'price_vs_sma_21_percent', label: 'vs SMA21 %' },
        { key: 'price_vs_sma_50_percent', label: 'vs SMA50 %' },
        { key: 'price_vs_sma_150_percent', label: 'vs SMA150 %' },
        { key: 'price_vs_sma_200_percent', label: 'vs SMA200 %' },
      ]
    },
    {
      name: 'IBD Ratings (New)',
      columns: [
        { key: 'rs_rating', label: 'RS Rating' },
        { key: 'industry_group_rs', label: 'Ind Group RS' },
        { key: 'sector_rs', label: 'Sector RS' },
        { key: 'industry_rs', label: 'Industry RS' },
        { key: 'sub_industry_rs', label: 'Sub-Industry RS' },
        { key: 'acc_dis_rating', label: 'A/D Rating' },
      ]
    },
    {
      name: '52-Week Range',
      columns: [
        { key: 'fifty_two_week_high_price', label: '52W High' },
        { key: 'fifty_two_week_low_price', label: '52W Low' },
        { key: 'percent_off_52w_high', label: 'Off 52W High %' },
        { key: 'percent_off_52w_low', label: 'Off 52W Low %' },
      ]
    },
  ];

  useEffect(() => {
    async function fetchStocks() {
      try {
        setLoading(true);
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

        // Get Token
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        // Fetch Prices and RS Data in parallel
        const [pricesRes, rsRes] = await Promise.all([
          fetch(`${API_URL}/api/prices/latest`, { cache: 'no-store', headers }),
          fetch(`${API_URL}/api/rs-v2/latest?limit=1000`, { cache: 'no-store', headers })
        ]);

        if (!pricesRes.ok) throw new Error(`Failed to fetch prices: ${pricesRes.status}`);

        const pricesData = await pricesRes.json();
        const rsData = rsRes.ok ? await rsRes.json() : { data: [] };

        console.log('Prices Data:', pricesData.data?.length);
        console.log('RS Data:', rsData.data?.length);
        if (rsData.data?.length > 0) {
          console.log('Sample RS Item:', rsData.data[0]);
        }

        // Create RS Map for quick lookup
        const rsMap = new Map((rsData.data || []).map((item: any) => [String(item.symbol), item]));

        // Map PriceResponse to Stock interface
        const mappedStocks = (pricesData.data || []).map((item: any) => {
          // Normalize symbol to string
          const symbolStr = String(item.symbol);
          const rsInfo: any = rsMap.get(symbolStr) || {};

          if (!rsInfo.rs_rating) {
            // Debug missing RS
            // console.log(`Missing RS for ${symbolStr}`); 
          }

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
          };
        });

        setStocks(mappedStocks);

        // Set metadata
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

  const handleSort = (key: string) => {
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
  };

  const getSortPriorityNumber = (key: string): number => {
    return sortConfigs.findIndex(config => config.key === key) + 1;
  };

  const getSortClass = (key: string): string => {
    const index = sortConfigs.findIndex(config => config.key === key);
    if (index === -1) return styles.sortable;

    const direction = sortConfigs[index].direction;
    return `${styles.sortable} ${direction === 'asc' ? styles.sortAsc : styles.sortDesc} ${styles.sortPriority}`;
  };

  const getValueForSorting = (stock: Stock, key: string): any => {
    switch (key) {
      case 'symbol': return cleanSymbol(stock.symbol);
      case 'name': return stock.name || '';
      case 'industry_group': return stock.industry_group || '';
      case 'sector': return stock.sector || '';
      case 'industry': return stock.industry || '';
      case 'sub_industry': return stock.sub_industry || '';
      case 'price': return parseFormattedNumber(stock.price);
      case 'change': return parseFormattedNumber(stock.change, true);
      case 'percent_change': return parseFormattedNumber(stock.percent_change);
      case 'volume': return parseFormattedNumber(stock.volume);
      case 'turnover': return parseFormattedNumber(stock.turnover);

      // New IBD Metrics
      case 'rs_rating': return stock.rs_rating || 0;
      case 'industry_group_rs': return stock.industry_group_rs || '';
      case 'sector_rs': return stock.sector_rs || '';
      case 'industry_rs': return stock.industry_rs || '';
      case 'sub_industry_rs': return stock.sub_industry_rs || '';
      case 'acc_dis_rating': return stock.acc_dis_rating || '';

      case 'open': return parseFormattedNumber(stock.open);
      case 'high': return parseFormattedNumber(stock.high);
      case 'low': return parseFormattedNumber(stock.low);
      case 'no_of_trades': return stock.no_of_trades || 0;

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

      default: return '';
    }
  };

  const filteredAndSortedStocks = useMemo(() => {
    let filtered = stocks.filter(stock => {
      const symbolMatch = !filters.symbol || cleanSymbol(stock.symbol).includes(filters.symbol);
      const nameMatch = !filters.name || (stock.name || '').toLowerCase().includes(filters.name.toLowerCase());
      const industryGroupMatch = !filters.industry_group || (stock.industry_group || '').toLowerCase().includes(filters.industry_group.toLowerCase());
      const sectorMatch = !filters.sector || (stock.sector || '').toLowerCase().includes(filters.sector.toLowerCase());
      const industryMatch = !filters.industry || (stock.industry || '').toLowerCase().includes(filters.industry.toLowerCase());
      const subIndustryMatch = !filters.sub_industry || (stock.sub_industry || '').toLowerCase().includes(filters.sub_industry.toLowerCase());

      // IBD Filters
      const rsMatch = !filters.rs_rating || (stock.rs_rating?.toString() || '').includes(filters.rs_rating);
      const indGroupRsMatch = !filters.industry_group_rs || (stock.industry_group_rs || '').includes(filters.industry_group_rs.toUpperCase());
      const sectorRsMatch = !filters.sector_rs || (stock.sector_rs || '').includes(filters.sector_rs.toUpperCase());
      const industryRsMatch = !filters.industry_rs || (stock.industry_rs || '').includes(filters.industry_rs.toUpperCase());
      const subIndRsMatch = !filters.sub_industry_rs || (stock.sub_industry_rs || '').includes(filters.sub_industry_rs.toUpperCase());
      const accDisMatch = !filters.acc_dis_rating || (stock.acc_dis_rating || '').includes(filters.acc_dis_rating.toUpperCase());

      const openMatch = !filters.open || displayRawValue(stock.open).includes(filters.open);
      const highMatch = !filters.high || displayRawValue(stock.high).includes(filters.high);
      const lowMatch = !filters.low || displayRawValue(stock.low).includes(filters.low);

      const priceMatch = !filters.price || displayRawValue(stock.price).includes(filters.price);
      const changeMatch = !filters.change || displayRawValue(stock.change).includes(filters.change);
      const changePercentMatch = !filters.percent_change || displayRawValue(stock.percent_change).includes(filters.percent_change);
      const volumeMatch = !filters.volume || displayRawValue(stock.volume).includes(filters.volume);
      const turnoverMatch = !filters.turnover || displayRawValue(stock.turnover).includes(filters.turnover);
      const noOfTradesMatch = !filters.no_of_trades || displayRawValue(stock.no_of_trades).includes(filters.no_of_trades);
      const sma10Match = !filters.price_minus_sma_10 || displayRawValue(stock.price_minus_sma_10).includes(filters.price_minus_sma_10);
      const sma21Match = !filters.price_minus_sma_21 || displayRawValue(stock.price_minus_sma_21).includes(filters.price_minus_sma_21);
      const sma50Match = !filters.price_minus_sma_50 || displayRawValue(stock.price_minus_sma_50).includes(filters.price_minus_sma_50);
      const sma150Match = !filters.price_minus_sma_150 || displayRawValue(stock.price_minus_sma_150).includes(filters.price_minus_sma_150);
      const sma200Match = !filters.price_minus_sma_200 || displayRawValue(stock.price_minus_sma_200).includes(filters.price_minus_sma_200);
      const high52wMatch = !filters.fifty_two_week_high_price || displayRawValue(stock.fifty_two_week_high_price).includes(filters.fifty_two_week_high_price);
      const low52wMatch = !filters.fifty_two_week_low_price || displayRawValue(stock.fifty_two_week_low_price).includes(filters.fifty_two_week_low_price);
      const avgVol50Match = !filters.average_volume_50 || displayRawValue(stock.average_volume_50).includes(filters.average_volume_50);

      const vsSma10Match = !filters.price_vs_sma_10_percent || displayRawValue(stock.price_vs_sma_10_percent).includes(filters.price_vs_sma_10_percent);
      const vsSma21Match = !filters.price_vs_sma_21_percent || displayRawValue(stock.price_vs_sma_21_percent).includes(filters.price_vs_sma_21_percent);
      const vsSma50Match = !filters.price_vs_sma_50_percent || displayRawValue(stock.price_vs_sma_50_percent).includes(filters.price_vs_sma_50_percent);
      const vsSma150Match = !filters.price_vs_sma_150_percent || displayRawValue(stock.price_vs_sma_150_percent).includes(filters.price_vs_sma_150_percent);
      const vsSma200Match = !filters.price_vs_sma_200_percent || displayRawValue(stock.price_vs_sma_200_percent).includes(filters.price_vs_sma_200_percent);
      const off52wHighMatch = !filters.percent_off_52w_high || displayRawValue(stock.percent_off_52w_high).includes(filters.percent_off_52w_high);
      const off52wLowMatch = !filters.percent_off_52w_low || displayRawValue(stock.percent_off_52w_low).includes(filters.percent_off_52w_low);
      const volDiff50Match = !filters.vol_diff_50_percent || displayRawValue(stock.vol_diff_50_percent).includes(filters.vol_diff_50_percent);

      return symbolMatch && nameMatch && industryGroupMatch && sectorMatch && industryMatch && subIndustryMatch &&
        rsMatch && indGroupRsMatch && sectorRsMatch && industryRsMatch && subIndRsMatch && accDisMatch &&
        openMatch && highMatch && lowMatch &&
        priceMatch && changeMatch && changePercentMatch && volumeMatch && turnoverMatch && noOfTradesMatch &&
        sma10Match && sma21Match && sma50Match && sma150Match && sma200Match &&
        high52wMatch && low52wMatch && avgVol50Match &&
        vsSma10Match && vsSma21Match && vsSma50Match && vsSma150Match && vsSma200Match &&
        off52wHighMatch && off52wLowMatch && volDiff50Match;
    });

    if (sortConfigs.length === 0) return filtered;

    return [...filtered].sort((a, b) => {
      for (const config of sortConfigs) {
        const aValue = getValueForSorting(a, config.key);
        const bValue = getValueForSorting(b, config.key);

        if (!aValue && !bValue) continue;
        if (!aValue) return config.direction === 'asc' ? 1 : -1;
        if (!bValue) return config.direction === 'asc' ? -1 : 1;

        let comparison = 0;
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          comparison = config.direction === 'asc'
            ? aValue.localeCompare(bValue, 'en')
            : bValue.localeCompare(aValue, 'en');
        } else {
          const aNum = Number(aValue);
          const bNum = Number(bValue);

          if (isNaN(aNum) && isNaN(bNum)) continue;
          if (isNaN(aNum)) return config.direction === 'asc' ? 1 : -1;
          if (isNaN(bNum)) return config.direction === 'asc' ? -1 : 1;

          if (aNum === bNum) continue;

          comparison = config.direction === 'asc' ? aNum - bNum : bNum - aNum;
        }

        if (comparison !== 0) return comparison;
      }
      return 0;
    });
  }, [stocks, sortConfigs, filters]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const exportToCSV = () => {
    // Define all possible columns with their keys and labels
    const allColumns = [
      { key: 'symbol', label: 'Symbol', getValue: (s: Stock) => cleanSymbol(s.symbol) },
      { key: 'name', label: 'Name', getValue: (s: Stock) => cleanName(s.name) },
      { key: 'industry_group', label: 'Industry Group', getValue: (s: Stock) => s.industry_group || '' },
      { key: 'sector', label: 'Sector', getValue: (s: Stock) => s.sector || '' },
      { key: 'industry', label: 'Industry', getValue: (s: Stock) => s.industry || '' },
      { key: 'sub_industry', label: 'Sub-Industry', getValue: (s: Stock) => s.sub_industry || '' },
      { key: 'open', label: 'Open', getValue: (s: Stock) => parseFormattedNumber(s.open) },
      { key: 'high', label: 'High', getValue: (s: Stock) => parseFormattedNumber(s.high) },
      { key: 'low', label: 'Low', getValue: (s: Stock) => parseFormattedNumber(s.low) },
      { key: 'price', label: 'Close', getValue: (s: Stock) => parseFormattedNumber(s.price) },
      { key: 'change', label: 'Change', getValue: (s: Stock) => parseFormattedNumber(s.change, true) },
      { key: 'percent_change', label: 'Change %', getValue: (s: Stock) => parseFormattedNumber(s.percent_change) },
      { key: 'volume', label: 'Volume', getValue: (s: Stock) => parseFormattedNumber(s.volume) },
      { key: 'turnover', label: 'Turnover', getValue: (s: Stock) => parseFormattedNumber(s.turnover) },
      { key: 'no_of_trades', label: 'No. of Trades', getValue: (s: Stock) => s.no_of_trades || 0 },
      { key: 'price_minus_sma_10', label: 'Price - SMA 10', getValue: (s: Stock) => s.price_minus_sma_10 || '' },
      { key: 'price_minus_sma_21', label: 'Price - SMA 21', getValue: (s: Stock) => s.price_minus_sma_21 || '' },
      { key: 'price_minus_sma_50', label: 'Price - SMA 50', getValue: (s: Stock) => s.price_minus_sma_50 || '' },
      { key: 'price_minus_sma_150', label: 'Price - SMA 150', getValue: (s: Stock) => s.price_minus_sma_150 || '' },
      { key: 'price_minus_sma_200', label: 'Price - SMA 200', getValue: (s: Stock) => s.price_minus_sma_200 || '' },
      { key: 'fifty_two_week_high_price', label: '52W High', getValue: (s: Stock) => s.fifty_two_week_high_price || '' },
      { key: 'fifty_two_week_low_price', label: '52W Low', getValue: (s: Stock) => s.fifty_two_week_low_price || '' },
      { key: 'average_volume_50', label: 'Avg Vol 50', getValue: (s: Stock) => s.average_volume_50 || '' },
      { key: 'price_vs_sma_10_percent', label: 'Price vs SMA 10%', getValue: (s: Stock) => s.price_vs_sma_10_percent || '' },
      { key: 'price_vs_sma_21_percent', label: 'Price vs SMA 21%', getValue: (s: Stock) => s.price_vs_sma_21_percent || '' },
      { key: 'price_vs_sma_50_percent', label: 'Price vs SMA 50%', getValue: (s: Stock) => s.price_vs_sma_50_percent || '' },
      { key: 'price_vs_sma_150_percent', label: 'Price vs SMA 150%', getValue: (s: Stock) => s.price_vs_sma_150_percent || '' },
      { key: 'price_vs_sma_200_percent', label: 'Price vs SMA 200%', getValue: (s: Stock) => s.price_vs_sma_200_percent || '' },
      { key: 'percent_off_52w_high', label: '% Off 52W High', getValue: (s: Stock) => s.percent_off_52w_high || '' },
      { key: 'percent_off_52w_low', label: '% Off 52W Low', getValue: (s: Stock) => s.percent_off_52w_low || '' },
      { key: 'vol_diff_50_percent', label: 'Vol % Chg vs 50-Day Avg', getValue: (s: Stock) => s.vol_diff_50_percent || '' }
    ];

    // Filter to only visible columns
    const visibleColumnsData = allColumns.filter(col => visibleColumns[col.key] !== false);

    // Prepare CSV headers
    const headers = visibleColumnsData.map(col => col.label);

    // Prepare CSV rows
    const rows = filteredAndSortedStocks.map(stock =>
      visibleColumnsData.map(col => col.getValue(stock))
    );

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => {
        // Escape cells containing commas or quotes
        const cellStr = String(cell);
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `tadawul_stocks_${metadata?.datetime || new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <h2>Loading Data...</h2>
          <p>Please wait</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Error fetching data</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (stocks.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.noData}>
          <h2>No Data Available</h2>
          <p>No stock data found</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* ⭐ Metropolitan Display */}
      {metadata && (
        <div className={styles.metadataBar}>
          <div className={styles.metadataItem}>
            <strong>Exchange:</strong> {metadata.exchange}
          </div>
          <div className={styles.metadataItem}>
            <strong>Currency:</strong> {metadata.currency}
          </div>
          <div className={styles.metadataItem}>
            <strong>Date:</strong> {metadata.datetime}
          </div>
          <div className={styles.metadataItem}>
            <strong>Timezone:</strong> {metadata.timezone}
          </div>
        </div>
      )}

      <div className={styles.tableContainer}>
        <div className={styles.resultsCount}>
          Showing <strong>{filteredAndSortedStocks.length}</strong> of <strong>{stocks.length}</strong> stocks
          {Object.values(filters).some(filter => filter !== '') && (
            <span className={styles.filterActive}> • Filters active</span>
          )}

          {/* Export CSV Button */}
          <button
            onClick={exportToCSV}
            style={{
              padding: '6px 12px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              marginLeft: '12px'
            }}
            title="Export filtered data to CSV"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </button>

          {/* Column Visibility Button */}
          <div style={{ position: 'relative', display: 'inline-block', marginLeft: '20px' }}>
            <button
              onClick={() => setShowColumnMenu(!showColumnMenu)}
              style={{
                padding: '6px 12px',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
              Columns ({Object.values(visibleColumns).filter(Boolean).length})
            </button>

            {showColumnMenu && (
              <>
                {/* Backdrop */}
                <div
                  onClick={() => setShowColumnMenu(false)}
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 999
                  }}
                />

                {/* Dropdown Menu */}
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                    zIndex: 1000,
                    minWidth: '320px',
                    maxHeight: '500px',
                    overflowY: 'auto',
                    padding: '12px'
                  }}
                >
                  <div style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#6b7280',
                    marginBottom: '12px',
                    paddingBottom: '8px',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    SELECT COLUMNS TO DISPLAY
                  </div>

                  {columnGroups.map((group, idx) => (
                    <div key={idx} style={{ marginBottom: '16px' }}>
                      <div style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        color: '#374151',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {group.name}
                      </div>
                      {group.columns.map((col) => (
                        <label
                          key={col.key}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '6px 8px',
                            cursor: 'pointer',
                            borderRadius: '4px',
                            transition: 'background-color 0.15s',
                            fontSize: '13px'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <input
                            type="checkbox"
                            checked={visibleColumns[col.key] || false}
                            onChange={() => toggleColumn(col.key)}
                            style={{
                              marginRight: '8px',
                              cursor: 'pointer',
                              width: '16px',
                              height: '16px'
                            }}
                          />
                          <span style={{ color: '#374151' }}>{col.label}</span>
                        </label>
                      ))}
                    </div>
                  ))}

                  {/* Quick Actions */}
                  <div style={{
                    borderTop: '1px solid #e5e7eb',
                    paddingTop: '12px',
                    marginTop: '8px',
                    display: 'flex',
                    gap: '8px'
                  }}>
                    <button
                      onClick={() => {
                        const allVisible: Record<string, boolean> = {};
                        columnGroups.forEach(g => g.columns.forEach(c => allVisible[c.key] = true));
                        setVisibleColumns(allVisible);
                        localStorage.setItem('stocksVisibleColumns', JSON.stringify(allVisible));
                      }}
                      style={{
                        flex: 1,
                        padding: '6px 12px',
                        fontSize: '12px',
                        backgroundColor: '#f3f4f6',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                    >
                      Show All
                    </button>
                    <button
                      onClick={() => {
                        const defaultVisible: Record<string, boolean> = {
                          symbol: true,
                          name: true,
                          price: true,
                          change: true,
                          percent_change: true,
                          volume: true,
                          turnover: true
                        };
                        columnGroups.forEach(g => g.columns.forEach(c => {
                          if (!(c.key in defaultVisible)) defaultVisible[c.key] = false;
                        }));
                        setVisibleColumns(defaultVisible);
                        localStorage.setItem('stocksVisibleColumns', JSON.stringify(defaultVisible));
                      }}
                      style={{
                        flex: 1,
                        padding: '6px 12px',
                        fontSize: '12px',
                        backgroundColor: '#f3f4f6',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: '500'
                      }}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>



        <table className={styles.table}>
          <thead>
            <tr>
              {[
                { key: 'symbol', label: 'Symbol' },
                { key: 'name', label: 'Name' },
                { key: 'industry_group', label: 'Industry Group' },
                { key: 'sector', label: 'Sector' },
                { key: 'industry', label: 'Industry' },
                { key: 'sub_industry', label: 'Sub-Industry' },

                { key: 'open', label: 'Open' },
                { key: 'high', label: 'High' },
                { key: 'low', label: 'Low' },
                { key: 'price', label: 'Close' },

                { key: 'change', label: 'Change' },
                { key: 'percent_change', label: 'Change %' },

                // IBD Metrics
                { key: 'rs_rating', label: 'RS Rating' },
                { key: 'acc_dis_rating', label: 'A/D Rating' },
                { key: 'industry_group_rs', label: 'Grp RS' },
                { key: 'sector_rs', label: 'Sec RS' },
                { key: 'industry_rs', label: 'Ind RS' },
                { key: 'sub_industry_rs', label: 'Sub-Ind RS' },

                { key: 'volume', label: 'Volume' },
                { key: 'turnover', label: 'Turnover' },
                { key: 'no_of_trades', label: 'Trades' },

                // Technicals
                { key: 'price_minus_sma_10', label: 'Price - SMA (10-Day)' },
                { key: 'price_minus_sma_21', label: 'Price - SMA (21-Day)' },
                { key: 'price_minus_sma_50', label: 'Price - SMA (50-Day)' },
                { key: 'price_minus_sma_150', label: 'Price - SMA (150-Day)' },
                { key: 'price_minus_sma_200', label: 'Price - SMA (200-Day)' },
                { key: 'fifty_two_week_high_price', label: '52W High' },
                { key: 'fifty_two_week_low_price', label: '52W Low' },
                { key: 'average_volume_50', label: '50-Day Avg Vol' },

                // Percentage Technicals
                { key: 'price_vs_sma_10_percent', label: 'Price vs 10-Day' },
                { key: 'price_vs_sma_21_percent', label: 'Price vs 21-Day' },
                { key: 'price_vs_sma_50_percent', label: 'Price vs 50-Day' },
                { key: 'price_vs_sma_150_percent', label: 'Price vs 150-Day' },
                { key: 'price_vs_sma_200_percent', label: 'Price vs 200-Day' },
                { key: 'percent_off_52w_high', label: '% Off High' },
                { key: 'percent_off_52w_low', label: '% Off Low' },
                { key: 'vol_diff_50_percent', label: 'Vol % Chg vs 50-Day' },
              ].filter((col: any) => visibleColumns[col.key]).map((col: any) => {
                const priority = getSortPriorityNumber(col.key);
                return (
                  <th
                    key={col.key}
                    className={`${styles.sortable} ${getSortClass(col.key)}`}
                    onClick={() => handleSort(col.key)}
                    title={`Click to sort by ${col.label}`}
                    data-priority={priority > 0 ? priority : undefined}
                  >
                    {col.label}
                  </th>
                );
              })}
            </tr>

            {/* Filter Row */}
            <tr className={styles.filterRow}>
              {visibleColumns.symbol && <td><input type="text" placeholder="Filter..." value={filters.symbol} onChange={(e) => handleFilterChange('symbol', e.target.value)} className={styles.filterInput} /></td>}
              {visibleColumns.name && <td><input type="text" placeholder="Filter..." value={filters.name} onChange={(e) => handleFilterChange('name', e.target.value)} className={styles.filterInput} /></td>}
              {visibleColumns.industry_group && <td><input type="text" placeholder="Filter..." value={filters.industry_group} onChange={(e) => handleFilterChange('industry_group', e.target.value)} className={styles.filterInput} /></td>}
              {visibleColumns.sector && <td><input type="text" placeholder="Filter..." value={filters.sector} onChange={(e) => handleFilterChange('sector', e.target.value)} className={styles.filterInput} /></td>}
              {visibleColumns.industry && <td><input type="text" placeholder="Filter..." value={filters.industry} onChange={(e) => handleFilterChange('industry', e.target.value)} className={styles.filterInput} /></td>}
              {visibleColumns.sub_industry && <td><input type="text" placeholder="Filter..." value={filters.sub_industry} onChange={(e) => handleFilterChange('sub_industry', e.target.value)} className={styles.filterInput} /></td>}
              {visibleColumns.open && <td><input type="text" placeholder="Filter..." value={filters.open} onChange={(e) => handleFilterChange('open', e.target.value)} className={styles.filterInput} /></td>}
              {visibleColumns.high && <td><input type="text" placeholder="Filter..." value={filters.high} onChange={(e) => handleFilterChange('high', e.target.value)} className={styles.filterInput} /></td>}
              {visibleColumns.low && <td><input type="text" placeholder="Filter..." value={filters.low} onChange={(e) => handleFilterChange('low', e.target.value)} className={styles.filterInput} /></td>}
              {visibleColumns.price && <td><input type="text" placeholder="Filter..." value={filters.price} onChange={(e) => handleFilterChange('price', e.target.value)} className={styles.filterInput} /></td>}
              {visibleColumns.change && <td><input type="text" placeholder="Filter..." value={filters.change} onChange={(e) => handleFilterChange('change', e.target.value)} className={styles.filterInput} /></td>}
              {visibleColumns.percent_change && <td><input type="text" placeholder="Filter..." value={filters.percent_change} onChange={(e) => handleFilterChange('percent_change', e.target.value)} className={styles.filterInput} /></td>}

              {/* IBD Filters */}
              {visibleColumns.rs_rating && <td><input type="text" placeholder="> 80" value={filters.rs_rating} onChange={(e) => handleFilterChange('rs_rating', e.target.value)} className={styles.filterInput} /></td>}
              {visibleColumns.acc_dis_rating && <td><input type="text" placeholder="A" value={filters.acc_dis_rating} onChange={(e) => handleFilterChange('acc_dis_rating', e.target.value)} className={styles.filterInput} /></td>}
              {visibleColumns.industry_group_rs && <td><input type="text" placeholder="A" value={filters.industry_group_rs} onChange={(e) => handleFilterChange('industry_group_rs', e.target.value)} className={styles.filterInput} /></td>}
              {visibleColumns.sector_rs && <td><input type="text" placeholder="A" value={filters.sector_rs} onChange={(e) => handleFilterChange('sector_rs', e.target.value)} className={styles.filterInput} /></td>}
              {visibleColumns.industry_rs && <td><input type="text" placeholder="A" value={filters.industry_rs} onChange={(e) => handleFilterChange('industry_rs', e.target.value)} className={styles.filterInput} /></td>}
              {visibleColumns.sub_industry_rs && <td><input type="text" placeholder="A" value={filters.sub_industry_rs} onChange={(e) => handleFilterChange('sub_industry_rs', e.target.value)} className={styles.filterInput} /></td>}

              {visibleColumns.volume && <td><input type="text" placeholder="Filter..." value={filters.volume} onChange={(e) => handleFilterChange('volume', e.target.value)} className={styles.filterInput} /></td>}
              {visibleColumns.turnover && <td><input type="text" placeholder="Filter..." value={filters.turnover} onChange={(e) => handleFilterChange('turnover', e.target.value)} className={styles.filterInput} /></td>}
              {visibleColumns.no_of_trades && <td><input type="text" placeholder="Filter..." value={filters.no_of_trades} onChange={(e) => handleFilterChange('no_of_trades', e.target.value)} className={styles.filterInput} /></td>}
              {visibleColumns.price_minus_sma_10 && <td><input type="text" placeholder="Filter..." value={filters.price_minus_sma_10} onChange={(e) => handleFilterChange('price_minus_sma_10', e.target.value)} className={styles.filterInput} /></td>}
              {visibleColumns.price_minus_sma_21 && <td><input type="text" placeholder="Filter..." value={filters.price_minus_sma_21} onChange={(e) => handleFilterChange('price_minus_sma_21', e.target.value)} className={styles.filterInput} /></td>}
              {visibleColumns.price_minus_sma_50 && <td><input type="text" placeholder="Filter..." value={filters.price_minus_sma_50} onChange={(e) => handleFilterChange('price_minus_sma_50', e.target.value)} className={styles.filterInput} /></td>}
              {visibleColumns.price_minus_sma_150 && <td><input type="text" placeholder="Filter..." value={filters.price_minus_sma_150} onChange={(e) => handleFilterChange('price_minus_sma_150', e.target.value)} className={styles.filterInput} /></td>}
              {visibleColumns.price_minus_sma_200 && <td><input type="text" placeholder="Filter..." value={filters.price_minus_sma_200} onChange={(e) => handleFilterChange('price_minus_sma_200', e.target.value)} className={styles.filterInput} /></td>}
              {visibleColumns.fifty_two_week_high_price && <td><input type="text" placeholder="Filter..." value={filters.fifty_two_week_high_price} onChange={(e) => handleFilterChange('fifty_two_week_high_price', e.target.value)} className={styles.filterInput} /></td>}
              {visibleColumns.fifty_two_week_low_price && <td><input type="text" placeholder="Filter..." value={filters.fifty_two_week_low_price} onChange={(e) => handleFilterChange('fifty_two_week_low_price', e.target.value)} className={styles.filterInput} /></td>}
              {visibleColumns.average_volume_50 && <td><input type="text" placeholder="Filter..." value={filters.average_volume_50} onChange={(e) => handleFilterChange('average_volume_50', e.target.value)} className={styles.filterInput} /></td>}
              {visibleColumns.price_vs_sma_10_percent && <td><input type="text" placeholder="Filter..." value={filters.price_vs_sma_10_percent} onChange={(e) => handleFilterChange('price_vs_sma_10_percent', e.target.value)} className={styles.filterInput} /></td>}
              {visibleColumns.price_vs_sma_21_percent && <td><input type="text" placeholder="Filter..." value={filters.price_vs_sma_21_percent} onChange={(e) => handleFilterChange('price_vs_sma_21_percent', e.target.value)} className={styles.filterInput} /></td>}
              {visibleColumns.price_vs_sma_50_percent && <td><input type="text" placeholder="Filter..." value={filters.price_vs_sma_50_percent} onChange={(e) => handleFilterChange('price_vs_sma_50_percent', e.target.value)} className={styles.filterInput} /></td>}
              {visibleColumns.price_vs_sma_150_percent && <td><input type="text" placeholder="Filter..." value={filters.price_vs_sma_150_percent} onChange={(e) => handleFilterChange('price_vs_sma_150_percent', e.target.value)} className={styles.filterInput} /></td>}
              {visibleColumns.price_vs_sma_200_percent && <td><input type="text" placeholder="Filter..." value={filters.price_vs_sma_200_percent} onChange={(e) => handleFilterChange('price_vs_sma_200_percent', e.target.value)} className={styles.filterInput} /></td>}
              {visibleColumns.percent_off_52w_high && <td><input type="text" placeholder="Filter..." value={filters.percent_off_52w_high} onChange={(e) => handleFilterChange('percent_off_52w_high', e.target.value)} className={styles.filterInput} /></td>}
              {visibleColumns.percent_off_52w_low && <td><input type="text" placeholder="Filter..." value={filters.percent_off_52w_low} onChange={(e) => handleFilterChange('percent_off_52w_low', e.target.value)} className={styles.filterInput} /></td>}
              {visibleColumns.vol_diff_50_percent && <td><input type="text" placeholder="Filter..." value={filters.vol_diff_50_percent} onChange={(e) => handleFilterChange('vol_diff_50_percent', e.target.value)} className={styles.filterInput} /></td>}
            </tr>
          </thead>

          <tbody>
            {filteredAndSortedStocks.map((stock: Stock) => {
              const cleanSym = cleanSymbol(stock.symbol);
              const changeNum = parseFormattedNumber(stock.change, true);
              const changePercentNum = parseFormattedNumber(stock.percent_change);
              const isChangeNegative = changeNum < 0;
              const isPercentNegative = changePercentNum < 0;

              return (
                <tr key={stock.symbol}>
                  {visibleColumns.symbol && <td><Link href={`/stocks/${cleanSym}/financials?period=annual&country=Saudi Arabia`} className={styles.stockLink}>{cleanSym}</Link></td>}
                  {visibleColumns.name && <td><Link href={`/stocks/${cleanSym}/financials?period=annual&country=Saudi Arabia`} className={styles.stockLink}>{cleanName(stock.name)}</Link></td>}
                  {visibleColumns.industry_group && <td>{formatText(stock.industry_group)}</td>}
                  {visibleColumns.sector && <td>{formatText(stock.sector)}</td>}
                  {visibleColumns.industry && <td>{formatText(stock.industry)}</td>}
                  {visibleColumns.sub_industry && <td>{formatText(stock.sub_industry)}</td>}
                  {visibleColumns.open && <td>{formatNumber(stock.open)}</td>}
                  {visibleColumns.high && <td>{formatNumber(stock.high)}</td>}
                  {visibleColumns.low && <td>{formatNumber(stock.low)}</td>}
                  {visibleColumns.price && <td>{formatNumber(stock.price)}</td>}
                  {visibleColumns.change && <td className={isChangeNegative ? styles.negative : ''}>{formatChange(stock.change)}</td>}
                  {visibleColumns.percent_change && <td className={isPercentNegative ? styles.negative : ''}>{formatChangePercent(stock.percent_change)}</td>}

                  {/* IBD Metrics */}
                  {visibleColumns.rs_rating && (
                    <td>
                      <span style={{
                        fontWeight: 'bold',
                        color: (stock.rs_rating || 0) >= 80 ? '#16a34a' : (stock.rs_rating || 0) >= 70 ? '#ca8a04' : '#6b7280'
                      }}>
                        {stock.rs_rating || '-'}
                      </span>
                    </td>
                  )}

                  {visibleColumns.acc_dis_rating && <td><RatingBadge value={stock.acc_dis_rating} /></td>}
                  {visibleColumns.industry_group_rs && <td><RatingBadge value={stock.industry_group_rs} /></td>}
                  {visibleColumns.sector_rs && <td><RatingBadge value={stock.sector_rs} /></td>}
                  {visibleColumns.industry_rs && <td><RatingBadge value={stock.industry_rs} /></td>}
                  {visibleColumns.sub_industry_rs && <td><RatingBadge value={stock.sub_industry_rs} /></td>}

                  {visibleColumns.volume && <td>{displayRawValue(stock.volume)}</td>}
                  {visibleColumns.turnover && <td>{displayRawValue(stock.turnover)}</td>}
                  {visibleColumns.no_of_trades && <td>{displayRawValue(stock.no_of_trades)}</td>}
                  {visibleColumns.price_minus_sma_10 && <td>{formatNumber(stock.price_minus_sma_10)}</td>}
                  {visibleColumns.price_minus_sma_21 && <td>{formatNumber(stock.price_minus_sma_21)}</td>}
                  {visibleColumns.price_minus_sma_50 && <td>{formatNumber(stock.price_minus_sma_50)}</td>}
                  {visibleColumns.price_minus_sma_150 && <td>{formatNumber(stock.price_minus_sma_150)}</td>}
                  {visibleColumns.price_minus_sma_200 && <td>{formatNumber(stock.price_minus_sma_200)}</td>}
                  {visibleColumns.fifty_two_week_high_price && <td>{formatNumber(stock.fifty_two_week_high_price)}</td>}
                  {visibleColumns.fifty_two_week_low_price && <td>{formatNumber(stock.fifty_two_week_low_price)}</td>}
                  {visibleColumns.average_volume_50 && <td>{displayRawValue(stock.average_volume_50)}</td>}
                  {visibleColumns.price_vs_sma_10_percent && <td>{formatChangePercent(stock.price_vs_sma_10_percent)}</td>}
                  {visibleColumns.price_vs_sma_21_percent && <td>{formatChangePercent(stock.price_vs_sma_21_percent)}</td>}
                  {visibleColumns.price_vs_sma_50_percent && <td>{formatChangePercent(stock.price_vs_sma_50_percent)}</td>}
                  {visibleColumns.price_vs_sma_150_percent && <td>{formatChangePercent(stock.price_vs_sma_150_percent)}</td>}
                  {visibleColumns.price_vs_sma_200_percent && <td>{formatChangePercent(stock.price_vs_sma_200_percent)}</td>}
                  {visibleColumns.percent_off_52w_high && <td>{formatChangePercent(stock.percent_off_52w_high)}</td>}
                  {visibleColumns.percent_off_52w_low && <td>{formatChangePercent(stock.percent_off_52w_low)}</td>}
                  {visibleColumns.vol_diff_50_percent && <td>{formatChangePercent(stock.vol_diff_50_percent)}</td>}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
