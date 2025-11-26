'use client';

import Link from 'next/link';
import styles from '../styles/Stocks.module.css';
import { useState, useMemo, useEffect } from 'react';

// ==================== الواجهات ====================

interface StockMetadata {
  exchange: string;
  mic_code: string;
  currency: string;
  datetime: string;
  timestamp: number;
  timezone: string;
}

interface Stock {
  symbol: string;
  name: string;
  exchange: string;
  sector: string;
  industry: string;
  
  price: string | number;
  change: string | number;
  percent_change: string | number;
  volume: string | number;
  turnover: string | number;
  
  fifty_two_week?: { 
    low: string; 
    high: string;
    low_change_percent?: string | number;
    high_change_percent?: string | number;
  };
  fifty_two_week_high?: string;
  fifty_two_week_low?: string;
  fifty_two_week_low_change_percent?: string | number;
  fifty_two_week_high_change_percent?: string | number;
  
  is_market_open: boolean;
  datetime?: string;
  timestamp?: number;
  timezone?: string;
  
  rs_12m?: number | string | null;
  rs_9m?: number | string | null;
  rs_6m?: number | string | null;
  rs_3m?: number | string | null;
  rs_1m?: number | string | null;
  rs_2w?: number | string | null;
  rs_1w?: number | string | null;
  rs_calculated?: number | null;
  
  change_12m?: number | null;
  change_9m?: number | null;
  change_6m?: number | null;
  change_3m?: number | null;
  change_1m?: number | null;
  change_2w?: number | null;
  change_1w?: number | null;
}

interface ApiResponse {
  data: Stock[];
  total: number;
  metadata?: StockMetadata;
  timestamp?: string;
  country?: string;
}

interface FilterState {
  symbol: string;
  name: string;
  exchange: string;
  sector: string;
  industry: string;
  price: string;
  change: string;
  percent_change: string;
  volume: string;
  turnover: string;
  fifty_two_week_high: string;
  fifty_two_week_low: string;
  fifty_two_week_high_change_percent: string;
  fifty_two_week_low_change_percent: string;
  
  rs_12m: string;
  rs_9m: string;
  rs_6m: string;
  rs_3m: string;
  rs_1m: string;
  rs_2w: string;
  rs_1w: string;
  rs_calculated: string;
  
  change_12m: string;
  change_9m: string;
  change_6m: string;
  change_3m: string;
  change_1m: string;
  change_2w: string;
  change_1w: string;
}

// ==================== دوال المساعدة ====================

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

// دالة لعرض القيم كما هي من الـ API
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
  
  // محاولة تحويل إلى رقم وعرضه بدون كسور
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
  if (!value || value === 'N/A') return 'N/A';
  
  const num = parseFormattedNumber(value);
  if (isNaN(num) || num === 0) return 'N/A';
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + 'M';
  }
  
  if (num >= 1000) {
    return (num / 1000).toFixed(2) + 'K';
  }
  
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatChange(value: any): string {
  if (!value || value === 'N/A') return 'N/A';
  
  const num = parseFormattedNumber(value, true);
  if (isNaN(num) || num === 0) return 'N/A';
  
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
  if (!value || value === 'N/A') return 'N/A';
  
  const num = parseFormattedNumber(value);
  if (isNaN(num) || num === 0) return 'N/A';
  
  const absNum = Math.abs(num);
  return num < 0 ? `(${absNum.toFixed(2)}%)` : `${absNum.toFixed(2)}%`;
}

function formatText(value: any): string {
  if (!value || value === 'N/A') return 'N/A';
  return String(value);
}

function get52WeekHighValue(stock: Stock): number {
  if (stock.fifty_two_week?.high && stock.fifty_two_week.high !== 'N/A') {
    return parseFormattedNumber(stock.fifty_two_week.high);
  }
  if (stock.fifty_two_week_high && stock.fifty_two_week_high !== 'N/A') {
    return parseFormattedNumber(stock.fifty_two_week_high);
  }
  return 0;
}

function get52WeekLowValue(stock: Stock): number {
  if (stock.fifty_two_week?.low && stock.fifty_two_week.low !== 'N/A') {
    return parseFormattedNumber(stock.fifty_two_week.low);
  }
  if (stock.fifty_two_week_low && stock.fifty_two_week_low !== 'N/A') {
    return parseFormattedNumber(stock.fifty_two_week_low);
  }
  return 0;
}

function get52WeekLowChangePercentValue(stock: Stock): number {
  if (stock.fifty_two_week?.low_change_percent && stock.fifty_two_week.low_change_percent !== 'N/A') {
    return parseFormattedNumber(stock.fifty_two_week.low_change_percent);
  }
  if (stock.fifty_two_week_low_change_percent && stock.fifty_two_week_low_change_percent !== 'N/A') {
    return parseFormattedNumber(stock.fifty_two_week_low_change_percent);
  }
  return 0;
}

function get52WeekHighChangePercentValue(stock: Stock): number {
  if (stock.fifty_two_week?.high_change_percent && stock.fifty_two_week.high_change_percent !== 'N/A') {
    return parseFormattedNumber(stock.fifty_two_week.high_change_percent);
  }
  if (stock.fifty_two_week_high_change_percent && stock.fifty_two_week_high_change_percent !== 'N/A') {
    return parseFormattedNumber(stock.fifty_two_week_high_change_percent);
  }
  return 0;
}

function get52WeekHighDisplay(stock: Stock): string {
  const value = get52WeekHighValue(stock);
  return value > 0 ? formatNumber(value) : 'N/A';
}

function get52WeekLowDisplay(stock: Stock): string {
  const value = get52WeekLowValue(stock);
  return value > 0 ? formatNumber(value) : 'N/A';
}

function get52WeekLowChangePercentDisplay(stock: Stock): string {
  const value = get52WeekLowChangePercentValue(stock);
  return value !== 0 ? formatChangePercent(value) : 'N/A';
}

function get52WeekHighChangePercentDisplay(stock: Stock): string {
  const value = get52WeekHighChangePercentValue(stock);
  return value !== 0 ? formatChangePercent(value) : 'N/A';
}

function formatRSCell(rsValue: number | string | null | undefined): string {
  if (rsValue === null || rsValue === undefined) return 'N/A';
  
  const numValue = typeof rsValue === 'string' 
    ? parseFloat(rsValue) 
    : rsValue;
  
  if (isNaN(numValue)) return 'N/A';
  
  const rounded = Math.round(numValue);
  const finalValue = Math.min(rounded, 99);
  
  return `<span>${finalValue}</span>`;
}

function formatChangePeriod(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  
  const formatted = `${value.toFixed(2)}%`;
  const className = value < 0 ? styles.changeNegative : styles.changePositive;
  
  return `<span class="${className}">${formatted}</span>`;
}

function getRSValueForSorting(stock: Stock, period: string): number {
  switch(period) {
    case 'rs_12m': return stock.rs_12m ? parseFloat(String(stock.rs_12m)) : 0;
    case 'rs_9m': return stock.rs_9m ? parseFloat(String(stock.rs_9m)) : 0;
    case 'rs_6m': return stock.rs_6m ? parseFloat(String(stock.rs_6m)) : 0;
    case 'rs_3m': return stock.rs_3m ? parseFloat(String(stock.rs_3m)) : 0;
    case 'rs_1m': return stock.rs_1m ? parseFloat(String(stock.rs_1m)) : 0;
    case 'rs_2w': return stock.rs_2w ? parseFloat(String(stock.rs_2w)) : 0;
    case 'rs_1w': return stock.rs_1w ? parseFloat(String(stock.rs_1w)) : 0;
    case 'rs_calculated': return stock.rs_calculated || 0;
    default: return 0;
  }
}

function getChangeValueForSorting(stock: Stock, period: string): number {
  switch(period) {
    case '12m': return stock.change_12m || 0;
    case '9m': return stock.change_9m || 0;
    case '6m': return stock.change_6m || 0;
    case '3m': return stock.change_3m || 0;
    case '1m': return stock.change_1m || 0;
    case '2w': return stock.change_2w || 0;
    case '1w': return stock.change_1w || 0;
    default: return 0;
  }
}

function calculateCombinedRS(stock: Stock): number {
  try {
    const weights = {
      rs_12m: 0.20,
      rs_9m: 0.20, 
      rs_6m: 0.20,
      rs_3m: 0.40
    };

    let totalScore = 0;
    let totalWeight = 0;

    for (const [period, weight] of Object.entries(weights)) {
      const rawValue = stock[period as keyof Stock];
      
      if (rawValue === null || rawValue === undefined) continue;
      
      const rsValue = typeof rawValue === 'string' 
        ? parseFloat(rawValue) 
        : Number(rawValue);
      
      if (isNaN(rsValue)) continue;

      totalScore += rsValue * weight;
      totalWeight += weight;
    }

    if (totalWeight === 0) return 0;

    const finalScore = Math.ceil(totalScore);
    return Math.min(finalScore, 99);
    
  } catch (error) {
    console.error(`Error calculating combined RS for ${stock.symbol}:`, error);
    return 0;
  }
}

// ==================== المكون الرئيسي ====================

export default function StocksPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [metadata, setMetadata] = useState<StockMetadata | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfigs, setSortConfigs] = useState<Array<{ key: string; direction: 'asc' | 'desc' }>>([]);

  const [filters, setFilters] = useState<FilterState>({
    symbol: '',
    name: '',
    exchange: '',
    sector: '',
    industry: '',
    price: '',
    change: '',
    percent_change: '',
    volume: '',
    turnover: '',
    fifty_two_week_high: '',
    fifty_two_week_low: '',
    fifty_two_week_high_change_percent: '',
    fifty_two_week_low_change_percent: '',
    
    rs_12m: '',
    rs_9m: '',
    rs_6m: '',
    rs_3m: '',
    rs_1m: '',
    rs_2w: '',
    rs_1w: '',
    rs_calculated: '',
    
    change_12m: '',
    change_9m: '',
    change_6m: '',
    change_3m: '',
    change_1m: '',
    change_2w: '',
    change_1w: '',
  });

  useEffect(() => {
    async function fetchStocks() {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:8000/stocks/saudi/bulk?country=Saudi%20Arabia`, {
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!res.ok) {
          throw new Error(`فشل في جلب البيانات: ${res.status} ${res.statusText}`);
        }

        const data: ApiResponse = await res.json();
        
        if (data.metadata) {
          setMetadata(data.metadata);
          console.log('📊 Saudi Time Metadata:', data.metadata);
        }
        
        const stocksWithCalculatedRS = (data.data || []).map((stock: Stock) => ({
          ...stock,
          rs_calculated: calculateCombinedRS(stock)
        }));
        
        setStocks(stocksWithCalculatedRS);
        setTotal(data.total || 0);
      } catch (err) {
        console.error('❌ خطأ في جلب البيانات:', err);
        setError(err instanceof Error ? err.message : 'فشل في الاتصال بالخادم');
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
    switch(key) {
      case 'symbol': return cleanSymbol(stock.symbol);
      case 'name': return stock.name || '';
      case 'exchange': return stock.exchange || '';
      case 'sector': return stock.sector || '';
      case 'industry': return stock.industry || '';
      case 'price': return parseFormattedNumber(stock.price);
      case 'change': return parseFormattedNumber(stock.change, true);
      case 'percent_change': return parseFormattedNumber(stock.percent_change);
      case 'volume': return parseFormattedNumber(stock.volume);
      case 'turnover': return parseFormattedNumber(stock.turnover);
      case 'fifty_two_week_high': return get52WeekHighValue(stock);
      case 'fifty_two_week_low': return get52WeekLowValue(stock);
      case 'fifty_two_week_high_change_percent': return get52WeekHighChangePercentValue(stock);
      case 'fifty_two_week_low_change_percent': return get52WeekLowChangePercentValue(stock);
      
      case 'rs_12m': return getRSValueForSorting(stock, 'rs_12m');
      case 'rs_9m': return getRSValueForSorting(stock, 'rs_9m');
      case 'rs_6m': return getRSValueForSorting(stock, 'rs_6m');
      case 'rs_3m': return getRSValueForSorting(stock, 'rs_3m');
      case 'rs_1m': return getRSValueForSorting(stock, 'rs_1m');
      case 'rs_2w': return getRSValueForSorting(stock, 'rs_2w');
      case 'rs_1w': return getRSValueForSorting(stock, 'rs_1w');
      case 'rs_calculated': return getRSValueForSorting(stock, 'rs_calculated');
      
      case 'change_12m': return getChangeValueForSorting(stock, '12m');
      case 'change_9m': return getChangeValueForSorting(stock, '9m');
      case 'change_6m': return getChangeValueForSorting(stock, '6m');
      case 'change_3m': return getChangeValueForSorting(stock, '3m');
      case 'change_1m': return getChangeValueForSorting(stock, '1m');
      case 'change_2w': return getChangeValueForSorting(stock, '2w');
      case 'change_1w': return getChangeValueForSorting(stock, '1w');
      
      default: return '';
    }
  };

  const filteredAndSortedStocks = useMemo(() => {
    let filtered = stocks.filter(stock => {
      const symbolMatch = !filters.symbol || cleanSymbol(stock.symbol).includes(filters.symbol);
      const nameMatch = !filters.name || (stock.name || '').toLowerCase().includes(filters.name.toLowerCase());
      const exchangeMatch = !filters.exchange || (stock.exchange || '').toLowerCase().includes(filters.exchange.toLowerCase());
      const sectorMatch = !filters.sector || (stock.sector || '').toLowerCase().includes(filters.sector.toLowerCase());
      const industryMatch = !filters.industry || (stock.industry || '').toLowerCase().includes(filters.industry.toLowerCase());
      const priceMatch = !filters.price || displayRawValue(stock.price).includes(filters.price);
      const changeMatch = !filters.change || displayRawValue(stock.change).includes(filters.change);
      const changePercentMatch = !filters.percent_change || displayRawValue(stock.percent_change).includes(filters.percent_change);
      const volumeMatch = !filters.volume || displayRawValue(stock.volume).includes(filters.volume);
      const turnoverMatch = !filters.turnover || displayRawValue(stock.turnover).includes(filters.turnover);
      const highMatch = !filters.fifty_two_week_high || displayRawValue(stock.fifty_two_week_high || stock.fifty_two_week?.high).includes(filters.fifty_two_week_high);
      const lowMatch = !filters.fifty_two_week_low || displayRawValue(stock.fifty_two_week_low || stock.fifty_two_week?.low).includes(filters.fifty_two_week_low);
      const highChangePercentMatch = !filters.fifty_two_week_high_change_percent || displayRawValue(stock.fifty_two_week_high_change_percent || stock.fifty_two_week?.high_change_percent).includes(filters.fifty_two_week_high_change_percent);
      const lowChangePercentMatch = !filters.fifty_two_week_low_change_percent || displayRawValue(stock.fifty_two_week_low_change_percent || stock.fifty_two_week?.low_change_percent).includes(filters.fifty_two_week_low_change_percent);
      
      const rs12mMatch = !filters.rs_12m || displayRawValue(stock.rs_12m).includes(filters.rs_12m);
      const rs9mMatch = !filters.rs_9m || displayRawValue(stock.rs_9m).includes(filters.rs_9m);
      const rs6mMatch = !filters.rs_6m || displayRawValue(stock.rs_6m).includes(filters.rs_6m);
      const rs3mMatch = !filters.rs_3m || displayRawValue(stock.rs_3m).includes(filters.rs_3m);
      const rs1mMatch = !filters.rs_1m || displayRawValue(stock.rs_1m).includes(filters.rs_1m);
      const rs2wMatch = !filters.rs_2w || displayRawValue(stock.rs_2w).includes(filters.rs_2w);
      const rs1wMatch = !filters.rs_1w || displayRawValue(stock.rs_1w).includes(filters.rs_1w);
      const rsCalculatedMatch = !filters.rs_calculated || displayRawValue(stock.rs_calculated).includes(filters.rs_calculated);
      
      const change12mMatch = !filters.change_12m || displayRawValue(stock.change_12m).includes(filters.change_12m);
      const change9mMatch = !filters.change_9m || displayRawValue(stock.change_9m).includes(filters.change_9m);
      const change6mMatch = !filters.change_6m || displayRawValue(stock.change_6m).includes(filters.change_6m);
      const change3mMatch = !filters.change_3m || displayRawValue(stock.change_3m).includes(filters.change_3m);
      const change1mMatch = !filters.change_1m || displayRawValue(stock.change_1m).includes(filters.change_1m);
      const change2wMatch = !filters.change_2w || displayRawValue(stock.change_2w).includes(filters.change_2w);
      const change1wMatch = !filters.change_1w || displayRawValue(stock.change_1w).includes(filters.change_1w);

      return symbolMatch && nameMatch && exchangeMatch && sectorMatch && industryMatch &&
             priceMatch && changeMatch && changePercentMatch && volumeMatch && turnoverMatch &&
             highMatch && lowMatch && highChangePercentMatch && lowChangePercentMatch &&
             rs12mMatch && rs9mMatch && rs6mMatch && rs3mMatch && 
             rs1mMatch && rs2wMatch && rs1wMatch && rsCalculatedMatch && change12mMatch && 
             change9mMatch && change6mMatch && change3mMatch && change1mMatch && change2wMatch && change1wMatch;
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

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <h2>جاري تحميل البيانات...</h2>
          <p>يرجى الانتظار</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>خطأ في جلب البيانات</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (stocks.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.noData}>
          <h2>لا توجد بيانات</h2>
          <p>لم يتم العثور على أي بيانات للأسهم</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* ⭐ عرض Metadata */}
      {metadata && (
        <div className={styles.metadataBar}>
          <div className={styles.metadataItem}>
            <strong>Exchange:</strong> {metadata.exchange}
          </div>
          <div className={styles.metadataItem}>
            <strong>Currency:</strong> {metadata.currency}
          </div>
          <div className={styles.metadataItem}>
            <strong>Time:</strong> {metadata.datetime}
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
        </div>
      
        <table className={styles.table}>
          <thead>
            <tr>
              {[
                { key: 'symbol', label: 'Symbol' },
                { key: 'name', label: 'Name' },
                { key: 'exchange', label: 'Exchange' },
                { key: 'sector', label: 'Sector' },
                { key: 'industry', label: 'Industry' },
                { key: 'price', label: 'Price' },
                { key: 'change', label: 'Change' },
                { key: 'percent_change', label: 'Change %' },
                { key: 'volume', label: 'Volume' },
                { key: 'turnover', label: 'Turnover' },
                { key: 'fifty_two_week_high', label: '52W High' },
                { key: 'fifty_two_week_low', label: '52W Low' },
                { key: 'fifty_two_week_high_change_percent', label: '52W High %' },
                { key: 'fifty_two_week_low_change_percent', label: '52W Low %' },
                
                { key: 'rs_12m', label: 'RS 12M' },
                { key: 'rs_9m', label: 'RS 9M' },
                { key: 'rs_6m', label: 'RS 6M' },
                { key: 'rs_3m', label: 'RS 3M' },
                { key: 'rs_1m', label: 'RS 1M' },
                { key: 'rs_2w', label: 'RS 2W' },
                { key: 'rs_1w', label: 'RS 1W' },
                { key: 'rs_calculated', label: 'RS' },
                
                { key: 'change_12m', label: 'Change 12M' },
                { key: 'change_9m', label: 'Change 9M' },
                { key: 'change_6m', label: 'Change 6M' },
                { key: 'change_3m', label: 'Change 3M' },
                { key: 'change_1m', label: 'Change 1M' },
                { key: 'change_2w', label: 'Change 2W' },
                { key: 'change_1w', label: 'Change 1W' },
              ].map(col => {
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
            
            {/* ⭐ الـ Filter Row */}
            <tr className={styles.filterRow}>
              <td><input type="text" placeholder="Filter..." value={filters.symbol} onChange={(e) => handleFilterChange('symbol', e.target.value)} className={styles.filterInput} /></td>
              <td><input type="text" placeholder="Filter..." value={filters.name} onChange={(e) => handleFilterChange('name', e.target.value)} className={styles.filterInput} /></td>
              <td><input type="text" placeholder="Filter..." value={filters.exchange} onChange={(e) => handleFilterChange('exchange', e.target.value)} className={styles.filterInput} /></td>
              <td><input type="text" placeholder="Filter..." value={filters.sector} onChange={(e) => handleFilterChange('sector', e.target.value)} className={styles.filterInput} /></td>
              <td><input type="text" placeholder="Filter..." value={filters.industry} onChange={(e) => handleFilterChange('industry', e.target.value)} className={styles.filterInput} /></td>
              <td><input type="text" placeholder="Filter..." value={filters.price} onChange={(e) => handleFilterChange('price', e.target.value)} className={styles.filterInput} /></td>
              <td><input type="text" placeholder="Filter..." value={filters.change} onChange={(e) => handleFilterChange('change', e.target.value)} className={styles.filterInput} /></td>
              <td><input type="text" placeholder="Filter..." value={filters.percent_change} onChange={(e) => handleFilterChange('percent_change', e.target.value)} className={styles.filterInput} /></td>
              <td><input type="text" placeholder="Filter..." value={filters.volume} onChange={(e) => handleFilterChange('volume', e.target.value)} className={styles.filterInput} /></td>
              <td><input type="text" placeholder="Filter..." value={filters.turnover} onChange={(e) => handleFilterChange('turnover', e.target.value)} className={styles.filterInput} /></td>
              <td><input type="text" placeholder="Filter..." value={filters.fifty_two_week_high} onChange={(e) => handleFilterChange('fifty_two_week_high', e.target.value)} className={styles.filterInput} /></td>
              <td><input type="text" placeholder="Filter..." value={filters.fifty_two_week_low} onChange={(e) => handleFilterChange('fifty_two_week_low', e.target.value)} className={styles.filterInput} /></td>
              <td><input type="text" placeholder="Filter..." value={filters.fifty_two_week_high_change_percent} onChange={(e) => handleFilterChange('fifty_two_week_high_change_percent', e.target.value)} className={styles.filterInput} /></td>
              <td><input type="text" placeholder="Filter..." value={filters.fifty_two_week_low_change_percent} onChange={(e) => handleFilterChange('fifty_two_week_low_change_percent', e.target.value)} className={styles.filterInput} /></td>
              
              <td><input type="text" placeholder="Filter..." value={filters.rs_12m} onChange={(e) => handleFilterChange('rs_12m', e.target.value)} className={styles.filterInput} /></td>
              <td><input type="text" placeholder="Filter..." value={filters.rs_9m} onChange={(e) => handleFilterChange('rs_9m', e.target.value)} className={styles.filterInput} /></td>
              <td><input type="text" placeholder="Filter..." value={filters.rs_6m} onChange={(e) => handleFilterChange('rs_6m', e.target.value)} className={styles.filterInput} /></td>
              <td><input type="text" placeholder="Filter..." value={filters.rs_3m} onChange={(e) => handleFilterChange('rs_3m', e.target.value)} className={styles.filterInput} /></td>
              <td><input type="text" placeholder="Filter..." value={filters.rs_1m} onChange={(e) => handleFilterChange('rs_1m', e.target.value)} className={styles.filterInput} /></td>
              <td><input type="text" placeholder="Filter..." value={filters.rs_2w} onChange={(e) => handleFilterChange('rs_2w', e.target.value)} className={styles.filterInput} /></td>
              <td><input type="text" placeholder="Filter..." value={filters.rs_1w} onChange={(e) => handleFilterChange('rs_1w', e.target.value)} className={styles.filterInput} /></td>
              <td><input type="text" placeholder="Filter..." value={filters.rs_calculated} onChange={(e) => handleFilterChange('rs_calculated', e.target.value)} className={styles.filterInput} /></td>
              
              <td><input type="text" placeholder="Filter..." value={filters.change_12m} onChange={(e) => handleFilterChange('change_12m', e.target.value)} className={styles.filterInput} /></td>
              <td><input type="text" placeholder="Filter..." value={filters.change_9m} onChange={(e) => handleFilterChange('change_9m', e.target.value)} className={styles.filterInput} /></td>
              <td><input type="text" placeholder="Filter..." value={filters.change_6m} onChange={(e) => handleFilterChange('change_6m', e.target.value)} className={styles.filterInput} /></td>
              <td><input type="text" placeholder="Filter..." value={filters.change_3m} onChange={(e) => handleFilterChange('change_3m', e.target.value)} className={styles.filterInput} /></td>
              <td><input type="text" placeholder="Filter..." value={filters.change_1m} onChange={(e) => handleFilterChange('change_1m', e.target.value)} className={styles.filterInput} /></td>
              <td><input type="text" placeholder="Filter..." value={filters.change_2w} onChange={(e) => handleFilterChange('change_2w', e.target.value)} className={styles.filterInput} /></td>
              <td><input type="text" placeholder="Filter..." value={filters.change_1w} onChange={(e) => handleFilterChange('change_1w', e.target.value)} className={styles.filterInput} /></td>
            </tr>
          </thead>
          
          <tbody>
            {filteredAndSortedStocks.map((stock: Stock) => {
              const cleanSym = cleanSymbol(stock.symbol);
              const changeNum = parseFormattedNumber(stock.change, true);
              const changePercentNum = parseFormattedNumber(stock.percent_change);
              const isChangeNegative = changeNum < 0;
              const isPercentNegative = changePercentNum < 0;
              
              const weekHighChangePercentNum = get52WeekHighChangePercentValue(stock);
              const weekLowChangePercentNum = get52WeekLowChangePercentValue(stock);
              const isWeekHighChangeNegative = weekHighChangePercentNum < 0;
              const isWeekLowChangeNegative = weekLowChangePercentNum < 0;
              
              return (
                <tr key={stock.symbol}>
                  <td><Link href={`/stocks/${cleanSym}/financials?period=annual&country=Saudi Arabia`} className={styles.stockLink}>{cleanSym}</Link></td>
                  <td><Link href={`/stocks/${cleanSym}/financials?period=annual&country=Saudi Arabia`} className={styles.stockLink}>{cleanName(stock.name)}</Link></td>
                  <td>{formatText(stock.exchange)}</td>
                  <td>{formatText(stock.sector)}</td>
                  <td>{formatText(stock.industry)}</td>
                  <td>{formatNumber(stock.price)}</td>
                  <td className={isChangeNegative ? styles.negative : ''}>{formatChange(stock.change)}</td>
                  <td className={isPercentNegative ? styles.negative : ''}>{formatChangePercent(stock.percent_change)}</td>
                  <td>{displayRawValue(stock.volume)}</td>
                  <td>{displayRawValue(stock.turnover)}</td>
                  <td>{get52WeekHighDisplay(stock)}</td>
                  <td>{get52WeekLowDisplay(stock)}</td>
                  <td className={isWeekHighChangeNegative ? styles.negative : ''}>{get52WeekHighChangePercentDisplay(stock)}</td>
                  <td className={isWeekLowChangeNegative ? styles.negative : ''}>{get52WeekLowChangePercentDisplay(stock)}</td>
                  
                  <td className={styles.rsCell} dangerouslySetInnerHTML={{ __html: formatRSCell(stock.rs_12m) }} />
                  <td className={styles.rsCell} dangerouslySetInnerHTML={{ __html: formatRSCell(stock.rs_9m) }} />
                  <td className={styles.rsCell} dangerouslySetInnerHTML={{ __html: formatRSCell(stock.rs_6m) }} />
                  <td className={styles.rsCell} dangerouslySetInnerHTML={{ __html: formatRSCell(stock.rs_3m) }} />
                  <td className={styles.rsCell} dangerouslySetInnerHTML={{ __html: formatRSCell(stock.rs_1m) }} />
                  <td className={styles.rsCell} dangerouslySetInnerHTML={{ __html: formatRSCell(stock.rs_2w) }} />
                  <td className={styles.rsCell} dangerouslySetInnerHTML={{ __html: formatRSCell(stock.rs_1w) }} />
                  <td className={styles.rsCell} dangerouslySetInnerHTML={{ __html: formatRSCell(stock.rs_calculated) }} />
                  
                  <td className={styles.changeCell} dangerouslySetInnerHTML={{ __html: formatChangePeriod(stock.change_12m) }} />
                  <td className={styles.changeCell} dangerouslySetInnerHTML={{ __html: formatChangePeriod(stock.change_9m) }} />
                  <td className={styles.changeCell} dangerouslySetInnerHTML={{ __html: formatChangePeriod(stock.change_6m) }} />
                  <td className={styles.changeCell} dangerouslySetInnerHTML={{ __html: formatChangePeriod(stock.change_3m) }} />
                  <td className={styles.changeCell} dangerouslySetInnerHTML={{ __html: formatChangePeriod(stock.change_1m) }} />
                  <td className={styles.changeCell} dangerouslySetInnerHTML={{ __html: formatChangePeriod(stock.change_2w) }} />
                  <td className={styles.changeCell} dangerouslySetInnerHTML={{ __html: formatChangePeriod(stock.change_1w) }} />
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}






















// ************* before Filters **********//

// 'use client'
// import Link from 'next/link'
// import styles from '../styles/Stocks.module.css'
// import { useState, useMemo, useEffect } from 'react'

// function cleanSymbol(symbol: string): string {
//   if (!symbol) return '';
//   return symbol.replace(/\D/g, '');
// }

// function formatNumber(value: any): string {
//   if (!value || value === 'N/A') return 'N/A';
  
//   const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
  
//   if (isNaN(num)) return 'N/A';
  
//   if (num >= 1000000) {
//     return (num / 1000000).toFixed(2);
//   }
  
//   if (num >= 1000) {
//     return (num / 1000).toFixed(2);
//   }
  
//   return num.toLocaleString('en-US', {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2
//   });
// }

// function formatPercent(value: any): string {
//   if (!value || value === 'N/A') return 'N/A';
  
//   const num = typeof value === 'string' ? parseFloat(value) : value;
  
//   if (isNaN(num)) return 'N/A';
  
//   return num.toFixed(2) + '%';
// }

// function formatChange(value: any): string {
//   if (!value || value === 'N/A') return 'N/A';
  
//   const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
  
//   if (isNaN(num)) return 'N/A';
  
//   if (num < 0) {
//     if (Math.abs(num) >= 1000000) {
//       return `(${(Math.abs(num) / 1000000).toFixed(2)}M)`;
//     }
    
//     if (Math.abs(num) >= 1000) {
//       return `(${(Math.abs(num) / 1000).toFixed(2)}K)`;
//     }
    
//     return `(${Math.abs(num).toLocaleString('en-US', {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2
//     })})`;
//   }
  
//   return formatNumber(value);
// }

// function formatChangePercent(value: any): string {
//   if (!value || value === 'N/A') return 'N/A';
  
//   const num = typeof value === 'string' ? parseFloat(value) : value;
  
//   if (isNaN(num)) return 'N/A';
  
//   if (num < 0) {
//     return `(${Math.abs(num).toFixed(2)}%)`;
//   }
  
//   return formatPercent(value);
// }

// function formatText(value: any): string {
//   if (!value || value === 'N/A') return 'N/A';
//   return value.length > 20 ? value.substring(0, 20) + '...' : value;
// }

// // دالة لاستخراج أعلى 52 أسبوع كرقم للترتيب
// function get52WeekHighValue(stock: Stock): number {
//   if (stock.fifty_two_week?.high && stock.fifty_two_week.high !== 'N/A') {
//     return parseFloat(stock.fifty_two_week.high);
//   }
  
//   if (stock.fifty_two_week_high && stock.fifty_two_week_high !== 'N/A') {
//     return parseFloat(stock.fifty_two_week_high);
//   }
  
//   return 0;
// }

// // دالة لاستخراج أدنى 52 أسبوع كرقم للترتيب
// function get52WeekLowValue(stock: Stock): number {
//   if (stock.fifty_two_week?.low && stock.fifty_two_week.low !== 'N/A') {
//     return parseFloat(stock.fifty_two_week.low);
//   }
  
//   if (stock.fifty_two_week_low && stock.fifty_two_week_low !== 'N/A') {
//     return parseFloat(stock.fifty_two_week_low);
//   }
  
//   return 0;
// }

// // دالة لعرض أعلى 52 أسبوع
// function get52WeekHighDisplay(stock: Stock): string {
//   const value = get52WeekHighValue(stock);
//   return value > 0 ? formatNumber(value) : 'N/A';
// }

// // دالة لعرض أدنى 52 أسبوع
// function get52WeekLowDisplay(stock: Stock): string {
//   const value = get52WeekLowValue(stock);
//   return value > 0 ? formatNumber(value) : 'N/A';
// }

// interface Stock {
//   symbol: string;
//   name: string;
//   exchange: string;
//   sector: string;
//   industry: string;
//   employees: number | string;
//   website: string;
//   country: string;
//   state: string;
//   currency: string;
//   price: string | number;
//   change: string | number;
//   change_percent: string | number;
//   previous_close: string | number;
//   volume: string | number;
//   turnover: string | number;
//   open: string | number;
//   high: string | number;
//   low: string | number;
//   average_volume: string | number;
//   is_market_open: boolean;
//   fifty_two_week?: {
//     low: string;
//     high: string;
//     low_change: string;
//     high_change: string;
//     low_change_percent: string;
//     high_change_percent: string;
//     range: string;
//   };
//   fifty_two_week_range?: string;
//   fifty_two_week_low?: string;
//   fifty_two_week_high?: string;
//   last_updated: string;
// }

// export default function StocksPage() {
//   const [stocks, setStocks] = useState<Stock[]>([]);
//   const [total, setTotal] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

//   useEffect(() => {
//     async function fetchStocks() {
//       try {
//         setLoading(true);
//         const res = await fetch(`http://localhost:8000/api/stocks/saudi/bulk?country=Saudi%20Arabia`, {
//           cache: 'no-store',
//           headers: {
//             'Content-Type': 'application/json',
//           }
//         });

//         if (!res.ok) {
//           const errorText = await res.text();
//           throw new Error(`فشل في جلب البيانات: ${res.status} ${res.statusText}`);
//         }

//         const data = await res.json();
//         setStocks(data.data || []);
//         setTotal(data.total || 0);
//       } catch (err) {
//         console.error('❌ خطأ في جلب البيانات:', err);
//         setError(err instanceof Error ? err.message : 'فشل في الاتصال بالخادم');
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchStocks();
//   }, []);

//   const handleSort = (key: string) => {
//     let direction: 'asc' | 'desc' = 'asc';
//     if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
//       direction = 'desc';
//     }
//     setSortConfig({ key, direction });
//   };

//   const sortedStocks = useMemo(() => {
//     if (!sortConfig) return stocks;

//     return [...stocks].sort((a, b) => {
//       let aValue: any, bValue: any;

//       if (sortConfig.key === 'fifty_two_week_high') {
//         aValue = get52WeekHighValue(a);
//         bValue = get52WeekHighValue(b);
//       } else if (sortConfig.key === 'fifty_two_week_low') {
//         aValue = get52WeekLowValue(a);
//         bValue = get52WeekLowValue(b);
//       } else {
//         return 0;
//       }

//       if (aValue < bValue) {
//         return sortConfig.direction === 'asc' ? -1 : 1;
//       }
//       if (aValue > bValue) {
//         return sortConfig.direction === 'asc' ? 1 : -1;
//       }
//       return 0;
//     });
//   }, [stocks, sortConfig]);

//   const getSortClass = (key: string) => {
//     if (!sortConfig || sortConfig.key !== key) return '';
//     return sortConfig.direction === 'asc' ? styles.sortAsc : styles.sortDesc;
//   };

//   if (loading) {
//     return (
//       <div className={styles.container}>
//         <div className={styles.loading}>
//           <h2>جاري تحميل البيانات...</h2>
//           <p>يرجى الانتظار</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className={styles.container}>
//         <div className={styles.error}>
//           <h2>خطأ في جلب البيانات</h2>
//           <p>{error}</p>
//           {/* <p>تأكد من تشغيل الخادم على localhost:8000</p> */}
//         </div>
//       </div>
//     );
//   }

//   if (stocks.length === 0) {
//     return (
//       <div className={styles.container}>
//         <div className={styles.noData}>
//           <h2>لا توجد بيانات</h2>
//           <p>لم يتم العثور على أي بيانات للأسهم</p>
//         </div>
//       </div>
//     );
//   }

//   const activeStocks = stocks.filter((s: Stock) => s.is_market_open).length;



//   // دالة للاسم - بدون قص
// function formatName(value: any): string {
//   if (!value || value === 'N/A') return 'N/A';
//   return value.replace(/\.$/,'');
// }

// // دالة للصناعة - بدون قص
// function formatIndustry(value: any): string {
//   if (!value || value === 'N/A') return 'N/A';
//   return value;
// }

// // دالة للقطاع - بدون قص
// function formatSector(value: any): string {
//   if (!value || value === 'N/A') return 'N/A';
//   return value;
// }


// // دالة لتنظيف وعرض Exchange
// function formatExchange(value: any): string {
//   if (!value || value === 'N/A') return 'N/A';
//   return value;
// }

//   return (
//     <div className={styles.container}>
//       {/* Header
//       <div className={styles.header}>
//         <h1 className={styles.title}>أسهم Tadawul</h1>
//         <p className={styles.subtitle}>بيانات الأسهم السعودية المحدثة - Profile & Quote</p>
//         <div className={styles.countryBadge}>
//           🇸🇦 السعودية
//         </div>
//         <span className={styles.stockCount}>
//           {stocks.length} سهم من {total} رمز سعودي
//         </span>
//       </div>
      
//       <div className={styles.statsGrid}>
//         <div className={styles.statCard}>
//           <div className={styles.statLabel}>إجمالي الأسهم</div>
//           <div className={styles.statValue}>{total}</div>
//         </div>
//         <div className={styles.statCard}>
//           <div className={styles.statLabel}>العناصر المعروضة</div>
//           <div className={styles.statValue}>{stocks.length}</div>
//         </div>
//         <div className={styles.statCard}>
//           <div className={styles.statLabel}>الأسهم النشطة</div>
//           <div className={styles.statValue}>{activeStocks}</div>
//         </div>
//         <div className={styles.statCard}>
//           <div className={styles.statLabel}>أحدث تحديث</div>
//           <div className={styles.statValue}>الآن</div>
//         </div>
//       </div>

//       <div className={styles.infoBox}>
//         <div className={styles.infoIcon}>⚠️</div>
//         <div className={styles.infoContent}>
//           <h3>عرض كل الأسهم السعودية مرة واحدة</h3>
//           <p>
//             يتم عرض جميع الأسهم السعودية ({total} سهم) مع بيانات Profile و Quote
//             <br />
//             <strong>البلد: السعودية 🇸🇦</strong>
//           </p>
//         </div>
//       </div> */}

//       {/* Stocks Table */}
//       <div className={styles.tableContainer}>
//         <table className={styles.table}>
//           <thead>
//             <tr>
//               <th>Symbol</th>
//               <th>Name</th>
//               <th>Exchange</th>
//               <th>Sector</th>
//               <th>Industry</th>
//               <th>Price</th>
//               <th>Change</th>
//               <th>Change %</th>
//               <th>Volume</th>
//               <th>Turnover</th>
//               {/* أعمدة 52 أسبوع مع إمكانية الترتيب */}
//               <th 
//                 className={`${getSortClass('fifty_two_week_high')} ${styles.sortable}`}
//                 onClick={() => handleSort('fifty_two_week_high')}
//               >
//                 52Week High
//               </th>
//               <th 
//                 className={`${getSortClass('fifty_two_week_low')} ${styles.sortable}`}
//                 onClick={() => handleSort('fifty_two_week_low')}
//               >
//                 52Week Low
//               </th>
//             </tr>
//           </thead>
//           <tbody>
//   {sortedStocks.map((stock: Stock) => {
//     const cleanSym = cleanSymbol(stock.symbol)
//     const changeNum = typeof stock.change === 'string' ? parseFloat(stock.change) : stock.change
//     const changePercentNum = typeof stock.change_percent === 'string' ? parseFloat(stock.change_percent) : stock.change_percent
    
//     const isChangeNegative = changeNum < 0
//     const isPercentNegative = changePercentNum < 0
    
//     return (
//       <tr key={stock.symbol}>
//         <td>
//           <Link 
//             href={`/stocks/${cleanSym}/financials?period=annual&country=Saudi Arabia`} 
//             className={styles.stockLink}
//           >
//             {cleanSym}   
//           </Link>
//         </td>
        
//         {/* ⭐ الاسم - متعدد الأسطر */}
//         <td>
//           <Link 
//             href={`/stocks/${cleanSym}/financials?period=annual&country=Saudi Arabia`} 
//             className={styles.stockLink}
//           >
//             {formatName(stock.name)}
//           </Link>
//         </td>
//         <td>{formatExchange(stock.exchange)}</td>
//         {/* ⭐ القطاع - متعدد الأسطر */}
//         <td>
//           {formatSector(stock.sector)}
//         </td>
        
//         {/* ⭐ الصناعة - متعددة الأسطر زي الاسم */}
//         <td>
//           {formatIndustry(stock.industry)}
//         </td>
        
//         <td>
//           {formatNumber(stock.price)}
//         </td>
        
//         <td className={isChangeNegative ? styles.negative : ''}>
//           {formatChange(stock.change)}
//         </td>

//         <td className={isPercentNegative ? styles.negative : ''}>
//           {formatChangePercent(stock.change_percent)}
//         </td>
        
//         <td>{formatNumber(stock.volume)}</td>
//         <td>{formatNumber(stock.turnover)}</td>
        
//         <td>{get52WeekHighDisplay(stock)}</td>
//         <td>{get52WeekLowDisplay(stock)}</td>
//       </tr>
//     )
//   })}
// </tbody>
//         </table>
//       </div>

//       {/* Summary */}
//       {/* <div className={styles.summary}>
//         <p>تم عرض جميع الأسهم السعودية ({total} سهم) في صفحة واحدة مع بيانات Profile و Quote</p>
//         <p>البلد: <strong>السعودية 🇸🇦</strong></p>
//         <p>آخر تحديث: {new Date().toLocaleString('ar-SA')}</p>
//         <p>API: <code>/api/stocks/saudi/bulk?country=Saudi Arabia</code></p>
//       </div> */}
//     </div>
//   )
// }