'use client'
import Link from 'next/link'
import styles from '../styles/Stocks.module.css'
import { useState, useMemo, useEffect } from 'react'

function cleanSymbol(symbol: string): string {
  if (!symbol) return '';
  return symbol.replace(/\D/g, '');
}

function formatNumber(value: any): string {
  if (!value || value === 'N/A') return 'N/A';
  
  const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
  
  if (isNaN(num)) return 'N/A';
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2);
  }
  
  if (num >= 1000) {
    return (num / 1000).toFixed(2);
  }
  
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatPercent(value: any): string {
  if (!value || value === 'N/A') return 'N/A';
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) return 'N/A';
  
  return num.toFixed(2) + '%';
}

function formatChange(value: any): string {
  if (!value || value === 'N/A') return 'N/A';
  
  const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
  
  if (isNaN(num)) return 'N/A';
  
  if (num < 0) {
    if (Math.abs(num) >= 1000000) {
      return `(-${(Math.abs(num) / 1000000).toFixed(2)}M)`;
    }
    
    if (Math.abs(num) >= 1000) {
      return `(-${(Math.abs(num) / 1000).toFixed(2)}K)`;
    }
    
    return `(-${Math.abs(num).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })})`;
  }
  
  return formatNumber(value);
}

function formatChangePercent(value: any): string {
  if (!value || value === 'N/A') return 'N/A';
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) return 'N/A';
  
  if (num < 0) {
    return `(-${Math.abs(num).toFixed(2)}%)`;
  }
  
  return formatPercent(value);
}

function formatText(value: any): string {
  if (!value || value === 'N/A') return 'N/A';
  return value.length > 20 ? value.substring(0, 20) + '...' : value;
}

// دالة لاستخراج أعلى 52 أسبوع كرقم للترتيب
function get52WeekHighValue(stock: Stock): number {
  if (stock.fifty_two_week?.high && stock.fifty_two_week.high !== 'N/A') {
    return parseFloat(stock.fifty_two_week.high);
  }
  
  if (stock.fifty_two_week_high && stock.fifty_two_week_high !== 'N/A') {
    return parseFloat(stock.fifty_two_week_high);
  }
  
  return 0;
}

// دالة لاستخراج أدنى 52 أسبوع كرقم للترتيب
function get52WeekLowValue(stock: Stock): number {
  if (stock.fifty_two_week?.low && stock.fifty_two_week.low !== 'N/A') {
    return parseFloat(stock.fifty_two_week.low);
  }
  
  if (stock.fifty_two_week_low && stock.fifty_two_week_low !== 'N/A') {
    return parseFloat(stock.fifty_two_week_low);
  }
  
  return 0;
}

// دالة لعرض أعلى 52 أسبوع
function get52WeekHighDisplay(stock: Stock): string {
  const value = get52WeekHighValue(stock);
  return value > 0 ? formatNumber(value) : 'N/A';
}

// دالة لعرض أدنى 52 أسبوع
function get52WeekLowDisplay(stock: Stock): string {
  const value = get52WeekLowValue(stock);
  return value > 0 ? formatNumber(value) : 'N/A';
}

interface Stock {
  symbol: string;
  name: string;
  exchange: string;
  sector: string;
  industry: string;
  employees: number | string;
  website: string;
  country: string;
  state: string;
  currency: string;
  price: string | number;
  change: string | number;
  change_percent: string | number;
  previous_close: string | number;
  volume: string | number;
  turnover: string | number;
  open: string | number;
  high: string | number;
  low: string | number;
  average_volume: string | number;
  is_market_open: boolean;
  fifty_two_week?: {
    low: string;
    high: string;
    low_change: string;
    high_change: string;
    low_change_percent: string;
    high_change_percent: string;
    range: string;
  };
  fifty_two_week_range?: string;
  fifty_two_week_low?: string;
  fifty_two_week_high?: string;
  last_updated: string;
}

export default function StocksPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    async function fetchStocks() {
      try {
        setLoading(true);
        const res = await fetch(`http://web-production-e66c2.up.railway.app/api/stocks/saudi/bulk?country=Saudi%20Arabia`, {
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`فشل في جلب البيانات: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        setStocks(data.data || []);
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
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedStocks = useMemo(() => {
    if (!sortConfig) return stocks;

    return [...stocks].sort((a, b) => {
      let aValue: any, bValue: any;

      if (sortConfig.key === 'fifty_two_week_high') {
        aValue = get52WeekHighValue(a);
        bValue = get52WeekHighValue(b);
      } else if (sortConfig.key === 'fifty_two_week_low') {
        aValue = get52WeekLowValue(a);
        bValue = get52WeekLowValue(b);
      } else {
        return 0;
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [stocks, sortConfig]);

  const getSortClass = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return '';
    return sortConfig.direction === 'asc' ? styles.sortAsc : styles.sortDesc;
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
          {/* <p>تأكد من تشغيل الخادم على localhost:8000</p> */}
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

  const activeStocks = stocks.filter((s: Stock) => s.is_market_open).length;



  // دالة للاسم - بدون قص
function formatName(value: any): string {
  if (!value || value === 'N/A') return 'N/A';
  return value;
}

// دالة للصناعة - بدون قص
function formatIndustry(value: any): string {
  if (!value || value === 'N/A') return 'N/A';
  return value;
}

// دالة للقطاع - بدون قص
function formatSector(value: any): string {
  if (!value || value === 'N/A') return 'N/A';
  return value;
}

  return (
    <div className={styles.container}>
      {/* Header
      <div className={styles.header}>
        <h1 className={styles.title}>أسهم Tadawul</h1>
        <p className={styles.subtitle}>بيانات الأسهم السعودية المحدثة - Profile & Quote</p>
        <div className={styles.countryBadge}>
          🇸🇦 السعودية
        </div>
        <span className={styles.stockCount}>
          {stocks.length} سهم من {total} رمز سعودي
        </span>
      </div>
      
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>إجمالي الأسهم</div>
          <div className={styles.statValue}>{total}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>العناصر المعروضة</div>
          <div className={styles.statValue}>{stocks.length}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>الأسهم النشطة</div>
          <div className={styles.statValue}>{activeStocks}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>أحدث تحديث</div>
          <div className={styles.statValue}>الآن</div>
        </div>
      </div>

      <div className={styles.infoBox}>
        <div className={styles.infoIcon}>⚠️</div>
        <div className={styles.infoContent}>
          <h3>عرض كل الأسهم السعودية مرة واحدة</h3>
          <p>
            يتم عرض جميع الأسهم السعودية ({total} سهم) مع بيانات Profile و Quote
            <br />
            <strong>البلد: السعودية 🇸🇦</strong>
          </p>
        </div>
      </div> */}

      {/* Stocks Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Name</th>
              <th>Sector</th>
              <th>Industry</th>
              <th>Price</th>
              <th>Change</th>
              <th>Change %</th>
              <th>Volume</th>
              <th>Turnover</th>
              {/* أعمدة 52 أسبوع مع إمكانية الترتيب */}
              <th 
                className={`${getSortClass('fifty_two_week_high')} ${styles.sortable}`}
                onClick={() => handleSort('fifty_two_week_high')}
              >
                52 week_high
              </th>
              <th 
                className={`${getSortClass('fifty_two_week_low')} ${styles.sortable}`}
                onClick={() => handleSort('fifty_two_week_low')}
              >
                52 week_low
              </th>
            </tr>
          </thead>
          <tbody>
  {sortedStocks.map((stock: Stock) => {
    const cleanSym = cleanSymbol(stock.symbol)
    const changeNum = typeof stock.change === 'string' ? parseFloat(stock.change) : stock.change
    const changePercentNum = typeof stock.change_percent === 'string' ? parseFloat(stock.change_percent) : stock.change_percent
    
    const isChangeNegative = changeNum < 0
    const isPercentNegative = changePercentNum < 0
    
    return (
      <tr key={stock.symbol}>
        <td>
          <Link 
            href={`/stocks/${cleanSym}/financials?period=annual&country=Saudi Arabia`} 
            className={styles.stockLink}
          >
            {cleanSym}   
          </Link>
        </td>
        
        {/* ⭐ الاسم - متعدد الأسطر */}
        <td>
          <Link 
            href={`/stocks/${cleanSym}/financials?period=annual&country=Saudi Arabia`} 
            className={styles.stockLink}
          >
            {formatName(stock.name)}
          </Link>
        </td>
        
        {/* ⭐ القطاع - متعدد الأسطر */}
        <td>
          {formatSector(stock.sector)}
        </td>
        
        {/* ⭐ الصناعة - متعددة الأسطر زي الاسم */}
        <td>
          {formatIndustry(stock.industry)}
        </td>
        
        <td>
          {formatNumber(stock.price)}
        </td>
        
        <td className={isChangeNegative ? styles.negative : ''}>
          {formatChange(stock.change)}
        </td>

        <td className={isPercentNegative ? styles.negative : ''}>
          {formatChangePercent(stock.change_percent)}
        </td>
        
        <td>{formatNumber(stock.volume)}</td>
        <td>{formatNumber(stock.turnover)}</td>
        
        <td>{get52WeekHighDisplay(stock)}</td>
        <td>{get52WeekLowDisplay(stock)}</td>
      </tr>
    )
  })}
</tbody>
        </table>
      </div>

      {/* Summary */}
      {/* <div className={styles.summary}>
        <p>تم عرض جميع الأسهم السعودية ({total} سهم) في صفحة واحدة مع بيانات Profile و Quote</p>
        <p>البلد: <strong>السعودية 🇸🇦</strong></p>
        <p>آخر تحديث: {new Date().toLocaleString('ar-SA')}</p>
        <p>API: <code>/api/stocks/saudi/bulk?country=Saudi Arabia</code></p>
      </div> */}
    </div>
  )
}