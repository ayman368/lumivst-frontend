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

// ==================== Main Component ====================

export default function StocksPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [metadata, setMetadata] = useState<StockMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfigs, setSortConfigs] = useState<Array<{ key: string; direction: 'asc' | 'desc' }>>([]);

  const [filters, setFilters] = useState<FilterState>({
    symbol: '',
    name: '',
    industry_group: '',
    sector: '',
    industry: '',
    sub_industry: '',
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
  });

  useEffect(() => {
    async function fetchStocks() {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:8000/api/prices/latest`, {
          cache: 'no-store',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch data: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();

        // Map PriceResponse to Stock interface
        const mappedStocks = (data.data || []).map((item: any) => ({
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
        }));

        setStocks(mappedStocks);

        // Set metadata from response data or defaults
        setMetadata({
          exchange: 'Tadawul',
          currency: 'SAR',
          datetime: data.date ? data.date.toString() : new Date().toISOString().split('T')[0],
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

      return symbolMatch && nameMatch && industryGroupMatch && sectorMatch && industryMatch && subIndustryMatch &&
        openMatch && highMatch && lowMatch &&
        priceMatch && changeMatch && changePercentMatch && volumeMatch && turnoverMatch && noOfTradesMatch &&
        sma10Match && sma21Match && sma50Match && sma150Match && sma200Match &&
        high52wMatch && low52wMatch && avgVol50Match;
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

                // { key: 'change', label: 'Change' },
                { key: 'percent_change', label: 'Change %' },

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

                // Percentage Technicals (Commented Out)
                // { key: 'price_vs_sma_10_percent', label: 'Price vs 10-Day' },
                // { key: 'price_vs_sma_21_percent', label: 'Price vs 21-Day' },
                // { key: 'price_vs_sma_50_percent', label: 'Price vs 50-Day' },
                // { key: 'price_vs_sma_150_percent', label: 'Price vs 150-Day' },
                // { key: 'price_vs_sma_200_percent', label: 'Price vs 200-Day' },
                // { key: 'percent_off_52w_high', label: '% Off High' },
                // { key: 'percent_off_52w_low', label: '% Off Low' },
                // { key: 'vol_diff_50_percent', label: 'Vol % Chg vs 50-Day' },
              ].map((col: any) => {
                const priority = getSortPriorityNumber(col.key);
                return (
                  <th
                    key={col.key}
                    className={`${styles.sortable} ${getSortClass(col.key)}`}
                    onClick={() => handleSort(col.key)}
                    title={`Click to sort by ${col.label}`}
                    data-priority={priority > 0 ? priority : undefined}
                    style={{ textAlign: 'center' }}
                  >
                    {col.label}
                  </th>
                );
              })}
            </tr>

            {/* Filter Row */}
            <tr className={styles.filterRow}>
              <td><input type="text" placeholder="Filter..." value={filters.symbol} onChange={(e) => handleFilterChange('symbol', e.target.value)} className={styles.filterInput} /></td>
              <td><input type="text" placeholder="Filter..." value={filters.name} onChange={(e) => handleFilterChange('name', e.target.value)} className={styles.filterInput} /></td>
              <td><input type="text" placeholder="Filter..." value={filters.industry_group} onChange={(e) => handleFilterChange('industry_group', e.target.value)} className={styles.filterInput} /></td>
              <td><input type="text" placeholder="Filter..." value={filters.sector} onChange={(e) => handleFilterChange('sector', e.target.value)} className={styles.filterInput} /></td>
              <td><input type="text" placeholder="Filter..." value={filters.industry} onChange={(e) => handleFilterChange('industry', e.target.value)} className={styles.filterInput} /></td>
              <td><input type="text" placeholder="Filter..." value={filters.sub_industry} onChange={(e) => handleFilterChange('sub_industry', e.target.value)} className={styles.filterInput} /></td>

              <td><input type="text" placeholder="Filter..." value={filters.open} onChange={(e) => handleFilterChange('open', e.target.value)} className={styles.filterInput} /></td>
              <td><input type="text" placeholder="Filter..." value={filters.high} onChange={(e) => handleFilterChange('high', e.target.value)} className={styles.filterInput} /></td>
              <td><input type="text" placeholder="Filter..." value={filters.low} onChange={(e) => handleFilterChange('low', e.target.value)} className={styles.filterInput} /></td>

              <td><input type="text" placeholder="Filter..." value={filters.price} onChange={(e) => handleFilterChange('price', e.target.value)} className={styles.filterInput} /></td>
              {/* <td><input type="text" placeholder="Filter..." value={filters.change} onChange={(e) => handleFilterChange('change', e.target.value)} className={styles.filterInput} /></td> */}
              <td><input type="text" placeholder="Filter..." value={filters.percent_change} onChange={(e) => handleFilterChange('percent_change', e.target.value)} className={styles.filterInput} /></td>
              <td><input type="text" placeholder="Filter..." value={filters.volume} onChange={(e) => handleFilterChange('volume', e.target.value)} className={styles.filterInput} /></td>
              <td><input type="text" placeholder="Filter..." value={filters.turnover} onChange={(e) => handleFilterChange('turnover', e.target.value)} className={styles.filterInput} /></td>
              <td><input type="text" placeholder="Filter..." value={filters.no_of_trades} onChange={(e) => handleFilterChange('no_of_trades', e.target.value)} className={styles.filterInput} /></td>

              {/* Technical Filters */}
              <td><input type="text" placeholder="Filter..." value={filters.price_minus_sma_10} onChange={(e) => handleFilterChange('price_minus_sma_10', e.target.value)} className={styles.filterInput} /></td>
              <td><input type="text" placeholder="Filter..." value={filters.price_minus_sma_21} onChange={(e) => handleFilterChange('price_minus_sma_21', e.target.value)} className={styles.filterInput} /></td>
              <td><input type="text" placeholder="Filter..." value={filters.price_minus_sma_50} onChange={(e) => handleFilterChange('price_minus_sma_50', e.target.value)} className={styles.filterInput} /></td>
              <td><input type="text" placeholder="Filter..." value={filters.price_minus_sma_150} onChange={(e) => handleFilterChange('price_minus_sma_150', e.target.value)} className={styles.filterInput} /></td>
              <td><input type="text" placeholder="Filter..." value={filters.price_minus_sma_200} onChange={(e) => handleFilterChange('price_minus_sma_200', e.target.value)} className={styles.filterInput} /></td>
              <td><input type="text" placeholder="Filter..." value={filters.fifty_two_week_high_price} onChange={(e) => handleFilterChange('fifty_two_week_high_price', e.target.value)} className={styles.filterInput} /></td>
              <td><input type="text" placeholder="Filter..." value={filters.fifty_two_week_low_price} onChange={(e) => handleFilterChange('fifty_two_week_low_price', e.target.value)} className={styles.filterInput} /></td>
              <td><input type="text" placeholder="Filter..." value={filters.average_volume_50} onChange={(e) => handleFilterChange('average_volume_50', e.target.value)} className={styles.filterInput} /></td>

              {/* Technical Filters (Percentage) - Commented Out */}
              {/* <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td>
              <td></td> */}
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
                  <td><Link href={`/stocks/${cleanSym}/financials?period=annual&country=Saudi Arabia`} className={styles.stockLink}>{cleanSym}</Link></td>
                  <td><Link href={`/stocks/${cleanSym}/financials?period=annual&country=Saudi Arabia`} className={styles.stockLink}>{cleanName(stock.name)}</Link></td>
                  <td>{formatText(stock.industry_group)}</td>
                  <td>{formatText(stock.sector)}</td>
                  <td>{formatText(stock.industry)}</td>
                  <td>{formatText(stock.sub_industry)}</td>

                  <td>{formatNumber(stock.open)}</td>
                  <td>{formatNumber(stock.high)}</td>
                  <td>{formatNumber(stock.low)}</td>
                  <td>{formatNumber(stock.price)}</td>

                  {/* <td className={isChangeNegative ? styles.negative : ''}>{formatChange(stock.change)}</td> */}
                  <td className={isPercentNegative ? styles.negative : ''}>{formatChangePercent(stock.percent_change)}</td>

                  <td>{displayRawValue(stock.volume)}</td>
                  <td>{displayRawValue(stock.turnover)}</td>
                  <td>{displayRawValue(stock.no_of_trades)}</td>

                  <td style={{ textAlign: 'center' }}>{formatNumber(stock.price_minus_sma_10)}</td>
                  <td style={{ textAlign: 'center' }}>{formatNumber(stock.price_minus_sma_21)}</td>
                  <td style={{ textAlign: 'center' }}>{formatNumber(stock.price_minus_sma_50)}</td>
                  <td style={{ textAlign: 'center' }}>{formatNumber(stock.price_minus_sma_150)}</td>
                  <td style={{ textAlign: 'center' }}>{formatNumber(stock.price_minus_sma_200)}</td>
                  <td style={{ textAlign: 'center' }}>{formatNumber(stock.fifty_two_week_high_price)}</td>
                  <td style={{ textAlign: 'center' }}>{formatNumber(stock.fifty_two_week_low_price)}</td>
                  <td style={{ textAlign: 'center' }}>{displayRawValue(stock.average_volume_50)}</td>

                  {/* Percentage Technicals - Commented Out */}
                  {/* <td style={{ textAlign: 'center' }}>{formatChangePercent(stock.price_vs_sma_10_percent)}</td>
                  <td style={{ textAlign: 'center' }}>{formatChangePercent(stock.price_vs_sma_21_percent)}</td>
                  <td style={{ textAlign: 'center' }}>{formatChangePercent(stock.price_vs_sma_50_percent)}</td>
                  <td style={{ textAlign: 'center' }}>{formatChangePercent(stock.price_vs_sma_150_percent)}</td>
                  <td style={{ textAlign: 'center' }}>{formatChangePercent(stock.price_vs_sma_200_percent)}</td>
                  <td style={{ textAlign: 'center' }}>{formatChangePercent(stock.percent_off_52w_high)}</td>
                  <td style={{ textAlign: 'center' }}>{formatChangePercent(stock.percent_off_52w_low)}</td>
                  <td style={{ textAlign: 'center' }}>{formatChangePercent(stock.vol_diff_50_percent)}</td> */}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
