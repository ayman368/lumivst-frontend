import Link from 'next/link'
import styles from '../../../styles/Financials.module.css'
import { FinancialHeader } from '../../../../components/FinancialHeader'

// import Link from 'next/link'
// import styles from '../../../styles/Statistics.module.css'

function cleanSymbol(symbol: string): string {
  return symbol.split('.')[0]
}

// Function to fetch statistics data
async function getStatisticsData(symbol: string, country: string = "Saudi Arabia") {
  const cleanSym = cleanSymbol(symbol)
  
  // Fix: Properly encode country
  const encodedCountry = encodeURIComponent(country)
  
  console.log(`📊 Fetching statistics for ${symbol} - Country: ${country} - encoded: ${encodedCountry}`)
  
  const response = await fetch(
    `https://lumivstbackendv2-production.up.railway.app/statistics/${cleanSym}?country=${encodedCountry}`,
    { cache: 'no-store' }
  )

  if (!response.ok) {
    console.error(`❌ Response error: ${response.status} - ${response.statusText}`)
    throw new Error('Failed to fetch statistics data')
  }

  const data = await response.json()
  console.log('✅ Data received:', data)
  return data
}

// Function to format numbers - نفس دالة Financials
function formatNumber(value: any): string {
  if (!value && value !== 0) return 'N/A';
  
  const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
  
  if (isNaN(num)) return 'N/A';
  
  if (num < 0) {
    const absoluteValue = Math.abs(num);
    
    if (absoluteValue >= 1000000) {
      return `(${(absoluteValue / 1000000).toFixed(2)}-)`;
    }
    
    if (absoluteValue >= 1000) {
      return `(${(absoluteValue / 1000).toFixed(2)}-)`;
    }
    
    return `(${absoluteValue.toFixed(2)}-)`;
  }
  
  if (Math.abs(num) >= 1000000) {
    return (num / 1000000).toFixed(2);
  }
  
  if (Math.abs(num) >= 1000) {
    return (num / 1000).toFixed(2);
  }
  
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Function to format large numbers - محدثة
function formatLargeNumber(value: any): string {
  if (!value && value !== 0) return 'N/A';
  
  const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
  
  if (isNaN(num)) return 'N/A';
  
  if (num < 0) {
    const absoluteValue = Math.abs(num);
    
    if (absoluteValue >= 1000000000) {
      return `(${(absoluteValue / 1000000000).toFixed(2)}-)`;
    }
    
    if (absoluteValue >= 1000000) {
      return `(${(absoluteValue / 1000000).toFixed(2)}-)`;
    }
    
    if (absoluteValue >= 1000) {
      return `(${(absoluteValue / 1000).toFixed(2)}-)`;
    }
    
    return `(${absoluteValue.toFixed(2)}-)`;
  }
  
  if (Math.abs(num) >= 1000000000) {
    return (num / 1000000000).toFixed(2) ;
  }
  
  if (Math.abs(num) >= 1000000) {
    return (num / 1000000).toFixed(2) ;
  }
  
  if (Math.abs(num) >= 1000) {
    return (num / 1000).toFixed(2) ;
  }
  
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Function to format percentages - محدثة
function formatPercentage(value: any): string {
  if (!value && value !== 0) return 'N/A';
  
  const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
  
  if (isNaN(num)) return 'N/A';
  
  if (num < 0) {
    return `(-${(Math.abs(num) * 100).toFixed(2)}%)`;
  }
  
  return (num * 100).toFixed(2) + '%';
}

// Function to get color class - جديدة
function getColorClass(value: any, isAlwaysPositive: boolean = false) {
  if (isAlwaysPositive) return styles.textPositive;
  
  // التعامل مع القيم الرقمية مباشرة
  const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
  
  if (isNaN(num)) return '';
  
  return num < 0 ? styles.textNegative : styles.textPositive;
}

interface StatisticsItem {
  label: string;
  value: string;
  rawValue?: any;
  highlight?: boolean;
  isPercentage?: boolean;
  isAlwaysPositive?: boolean;
}

interface StatisticsSection {
  title: string;
  data: StatisticsItem[];
}

// Function to validate data structure
function validateStatisticsData(data: any) {
  console.log('🔍 Data structure received:', {
    hasMeta: !!data?.meta,
    hasStatistics: !!data?.statistics,
    statisticsKeys: data?.statistics ? Object.keys(data.statistics) : []
  });
  
  if (!data || !data.statistics) {
    console.error('❌ Statistics data not found');
    return false;
  }
  
  return true;
}

// Function to organize data into sections - محدثة
function organizeStatisticsData(statistics: any): StatisticsSection[] {
  if (!statistics) {
    return [];
  }

  return [
    {
      title: "Valuation Metrics",
      data: [
        { 
          label: "Market Cap", 
          value: formatLargeNumber(statistics.valuations_metrics?.market_capitalization), 
          rawValue: statistics.valuations_metrics?.market_capitalization,
          highlight: true,
          isAlwaysPositive: true
        },
        { 
          label: "Enterprise Value", 
          value: formatLargeNumber(statistics.valuations_metrics?.enterprise_value), 
          rawValue: statistics.valuations_metrics?.enterprise_value,
          highlight: true,
          isAlwaysPositive: true
        },
        { 
          label: "P/E (Trailing)", 
          value: formatNumber(statistics.valuations_metrics?.trailing_pe),
          rawValue: statistics.valuations_metrics?.trailing_pe,
          isAlwaysPositive: true
        },
        { 
          label: "P/E (Forward)", 
          value: formatNumber(statistics.valuations_metrics?.forward_pe),
          rawValue: statistics.valuations_metrics?.forward_pe,
          isAlwaysPositive: true
        },
        { 
          label: "PEG Ratio", 
          value: formatNumber(statistics.valuations_metrics?.peg_ratio),
          rawValue: statistics.valuations_metrics?.peg_ratio
        },
        { 
          label: "Price to Sales (TTM)", 
          value: formatNumber(statistics.valuations_metrics?.price_to_sales_ttm),
          rawValue: statistics.valuations_metrics?.price_to_sales_ttm,
          isAlwaysPositive: true
        },
        { 
          label: "Price to Book (MRQ)", 
          value: formatNumber(statistics.valuations_metrics?.price_to_book_mrq),
          rawValue: statistics.valuations_metrics?.price_to_book_mrq,
          isAlwaysPositive: true
        },
        { 
          label: "Enterprise to Revenue", 
          value: formatNumber(statistics.valuations_metrics?.enterprise_to_revenue),
          rawValue: statistics.valuations_metrics?.enterprise_to_revenue,
          isAlwaysPositive: true
        },
        { 
          label: "Enterprise to EBITDA", 
          value: formatNumber(statistics.valuations_metrics?.enterprise_to_ebitda) || 'N/A',
          rawValue: statistics.valuations_metrics?.enterprise_to_ebitda,
          isAlwaysPositive: true
        }
      ]
    },
    {
      title: "Financial Indicators",
      data: [
        { 
          label: "Fiscal Year Ends", 
          value: statistics.financials?.fiscal_year_ends || 'N/A',
          isAlwaysPositive: true
        },
        { 
          label: "Most Recent Quarter", 
          value: statistics.financials?.most_recent_quarter || 'N/A',
          isAlwaysPositive: true
        },
        { 
          label: "Gross Margin", 
          value: formatPercentage(statistics.financials?.gross_margin),
          rawValue: statistics.financials?.gross_margin,
          isPercentage: true,
          isAlwaysPositive: true
        },
        { 
          label: "Profit Margin", 
          value: formatPercentage(statistics.financials?.profit_margin),
          rawValue: statistics.financials?.profit_margin,
          isPercentage: true
        },
        { 
          label: "Operating Margin", 
          value: formatPercentage(statistics.financials?.operating_margin),
          rawValue: statistics.financials?.operating_margin,
          isPercentage: true
        },
        { 
          label: "Return on Assets (TTM)", 
          value: formatPercentage(statistics.financials?.return_on_assets_ttm),
          rawValue: statistics.financials?.return_on_assets_ttm,
          isPercentage: true
        },
        { 
          label: "Return on Equity (TTM)", 
          value: formatPercentage(statistics.financials?.return_on_equity_ttm),
          rawValue: statistics.financials?.return_on_equity_ttm,
          isPercentage: true
        }
      ]
    },
    {
      title: "Income Statement (TTM)",
      data: [
        { 
          label: "Revenue", 
          value: formatLargeNumber(statistics.financials?.income_statement?.revenue_ttm), 
          rawValue: statistics.financials?.income_statement?.revenue_ttm,
          highlight: true,
          isAlwaysPositive: true
        },
        { 
          label: "Revenue Per Share", 
          value: formatNumber(statistics.financials?.income_statement?.revenue_per_share_ttm),
          rawValue: statistics.financials?.income_statement?.revenue_per_share_ttm,
          isAlwaysPositive: true
        },
        { 
          label: "Quarterly Revenue Growth", 
          value: formatPercentage(statistics.financials?.income_statement?.quarterly_revenue_growth),
          rawValue: statistics.financials?.income_statement?.quarterly_revenue_growth,
          isPercentage: true
        },
        { 
          label: "Gross Profit", 
          value: formatLargeNumber(statistics.financials?.income_statement?.gross_profit_ttm), 
          rawValue: statistics.financials?.income_statement?.gross_profit_ttm,
          highlight: true
        },
        { 
          label: "EBITDA", 
          value: formatLargeNumber(statistics.financials?.income_statement?.ebitda),
          rawValue: statistics.financials?.income_statement?.ebitda
        },
        { 
          label: "Net Income", 
          value: formatLargeNumber(statistics.financials?.income_statement?.net_income_to_common_ttm), 
          rawValue: statistics.financials?.income_statement?.net_income_to_common_ttm,
          highlight: true
        },
        { 
          label: "EPS (Diluted)", 
          value: formatNumber(statistics.financials?.income_statement?.diluted_eps_ttm),
          rawValue: statistics.financials?.income_statement?.diluted_eps_ttm
        },
        { 
          label: "Quarterly Earnings Growth", 
          value: formatPercentage(statistics.financials?.income_statement?.quarterly_earnings_growth_yoy),
          rawValue: statistics.financials?.income_statement?.quarterly_earnings_growth_yoy,
          isPercentage: true
        }
      ]
    },
    {
      title: "Balance Sheet (MRQ)",
      data: [
        { 
          label: "Total Cash", 
          value: formatLargeNumber(statistics.financials?.balance_sheet?.total_cash_mrq), 
          rawValue: statistics.financials?.balance_sheet?.total_cash_mrq,
          highlight: true,
          isAlwaysPositive: true
        },
        { 
          label: "Cash Per Share", 
          value: formatNumber(statistics.financials?.balance_sheet?.total_cash_per_share_mrq),
          rawValue: statistics.financials?.balance_sheet?.total_cash_per_share_mrq,
          isAlwaysPositive: true
        },
        { 
          label: "Total Debt", 
          value: formatLargeNumber(statistics.financials?.balance_sheet?.total_debt_mrq),
          rawValue: statistics.financials?.balance_sheet?.total_debt_mrq,
          isAlwaysPositive: true
        },
        { 
          label: "Debt to Equity", 
          value: formatNumber(statistics.financials?.balance_sheet?.total_debt_to_equity_mrq),
          rawValue: statistics.financials?.balance_sheet?.total_debt_to_equity_mrq,
          isAlwaysPositive: true
        },
        { 
          label: "Current Ratio", 
          value: formatNumber(statistics.financials?.balance_sheet?.current_ratio_mrq) || 'N/A',
          rawValue: statistics.financials?.balance_sheet?.current_ratio_mrq,
          isAlwaysPositive: true
        },
        { 
          label: "Book Value Per Share", 
          value: formatNumber(statistics.financials?.balance_sheet?.book_value_per_share_mrq),
          rawValue: statistics.financials?.balance_sheet?.book_value_per_share_mrq,
          isAlwaysPositive: true
        }
      ]
    },
    {
      title: "Stock Statistics",
      data: [
        { 
          label: "Shares Outstanding", 
          value: formatLargeNumber(statistics.stock_statistics?.shares_outstanding),
          rawValue: statistics.stock_statistics?.shares_outstanding,
          isAlwaysPositive: true
        },
        { 
          label: "Float Shares", 
          value: formatLargeNumber(statistics.stock_statistics?.float_shares),
          rawValue: statistics.stock_statistics?.float_shares,
          isAlwaysPositive: true
        },
        { 
          label: "Avg Volume (10 days)", 
          value: formatLargeNumber(statistics.stock_statistics?.avg_10_volume),
          rawValue: statistics.stock_statistics?.avg_10_volume,
          isAlwaysPositive: true
        },
        { 
          label: "Avg Volume (90 days)", 
          value: formatLargeNumber(statistics.stock_statistics?.avg_90_volume),
          rawValue: statistics.stock_statistics?.avg_90_volume,
          isAlwaysPositive: true
        },
        { 
          label: "Held by Insiders %", 
          value: formatPercentage(statistics.stock_statistics?.percent_held_by_insiders),
          rawValue: statistics.stock_statistics?.percent_held_by_insiders,
          isPercentage: true,
          isAlwaysPositive: true
        },
        { 
          label: " Held by Institutions %", 
          value: formatPercentage(statistics.stock_statistics?.percent_held_by_institutions),
          rawValue: statistics.stock_statistics?.percent_held_by_institutions,
          isPercentage: true,
          isAlwaysPositive: true
        }
      ]
    },
    {
      title: "Stock Price Summary",
      data: [
        { 
          label: "52 Week Low", 
          value: formatNumber(statistics.stock_price_summary?.fifty_two_week_low),
          rawValue: statistics.stock_price_summary?.fifty_two_week_low,
          isAlwaysPositive: true
        },
        { 
          label: "52 Week High", 
          value: formatNumber(statistics.stock_price_summary?.fifty_two_week_high),
          rawValue: statistics.stock_price_summary?.fifty_two_week_high,
          isAlwaysPositive: true
        },
        { 
          label: "52 Week Change", 
          value: formatPercentage(statistics.stock_price_summary?.fifty_two_week_change),
          rawValue: statistics.stock_price_summary?.fifty_two_week_change,
          isPercentage: true
        },
        { 
          label: "Beta", 
          value: formatNumber(statistics.stock_price_summary?.beta),
          rawValue: statistics.stock_price_summary?.beta
        },
        { 
          label: "50 Day Moving Average", 
          value: formatNumber(statistics.stock_price_summary?.day_50_ma),
          rawValue: statistics.stock_price_summary?.day_50_ma,
          isAlwaysPositive: true
        },
        { 
          label: "200 Day Moving Average", 
          value: formatNumber(statistics.stock_price_summary?.day_200_ma),
          rawValue: statistics.stock_price_summary?.day_200_ma,
          isAlwaysPositive: true
        }
      ]
    },
    {
      title: "Dividends & Splits",
      data: [
        { 
          label: "Forward Annual Dividend Rate", 
          value: formatNumber(statistics.dividends_and_splits?.forward_annual_dividend_rate),
          rawValue: statistics.dividends_and_splits?.forward_annual_dividend_rate,
          isAlwaysPositive: true
        },
        { 
          label: "Forward Annual Dividend Yield", 
          value: formatPercentage(statistics.dividends_and_splits?.forward_annual_dividend_yield),
          rawValue: statistics.dividends_and_splits?.forward_annual_dividend_yield,
          isPercentage: true,
          isAlwaysPositive: true
        },
        { 
          label: "Trailing Annual Dividend Rate", 
          value: formatNumber(statistics.dividends_and_splits?.trailing_annual_dividend_rate),
          rawValue: statistics.dividends_and_splits?.trailing_annual_dividend_rate,
          isAlwaysPositive: true
        },
        { 
          label: "Trailing Annual Dividend Yield", 
          value: formatPercentage(statistics.dividends_and_splits?.trailing_annual_dividend_yield),
          rawValue: statistics.dividends_and_splits?.trailing_annual_dividend_yield,
          isPercentage: true,
          isAlwaysPositive: true
        },
        { 
          label: "5 Year Average Dividend Yield", 
          value: formatPercentage(statistics.dividends_and_splits?.five_year_average_dividend_yield),
          rawValue: statistics.dividends_and_splits?.five_year_average_dividend_yield,
          isPercentage: true,
          isAlwaysPositive: true
        },
        { 
          label: "Payout Ratio", 
          value: formatPercentage(statistics.dividends_and_splits?.payout_ratio),
          rawValue: statistics.dividends_and_splits?.payout_ratio,
          isPercentage: true,
          isAlwaysPositive: true
        },
        { 
          label: "Dividend Frequency", 
          value: statistics.dividends_and_splits?.dividend_frequency || 'N/A',
          isAlwaysPositive: true
        },
        { 
          label: "Ex-Dividend Date", 
          value: statistics.dividends_and_splits?.ex_dividend_date || 'N/A',
          isAlwaysPositive: true
        },
        { 
          label: "Last Split Factor", 
          value: statistics.dividends_and_splits?.last_split_factor || 'N/A',
          isAlwaysPositive: true
        },
        { 
          label: "Last Split Date", 
          value: statistics.dividends_and_splits?.last_split_date || 'N/A',
          isAlwaysPositive: true
        }
      ]
    }
  ]
}

function getSearchParams(searchParams: any) {
  return {
    country: searchParams.country || 'Saudi Arabia'
  }
}

function NavigationTabs({ symbol, country }: { symbol: string, country: string }) {
  const tabs = [
    { 
      label: 'Financial', 
      href: `/stocks/${symbol}/financials?country=${encodeURIComponent(country)}`,
      active: false
    },
    { 
      label: 'Statistics', 
      href: `/stocks/${symbol}/statistics?country=${encodeURIComponent(country)}`,
      active: true
    }
  ]

  return (
    <div className={styles.navTabs}>
      {tabs.map((tab) => (
        <Link
          key={tab.label}
          href={tab.href}
          className={`${styles.navTab} ${tab.active ? styles.active : ''}`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  )
}

function StatisticsHeader({ symbol, country }: { symbol: string, country: string }) {
  return (
    <div className={styles.financialHeader}>
      <div className={styles.headerContent}>
        {/* No period dropdown for statistics since it's always current data */}
        <div></div>
        <NavigationTabs symbol={symbol} country={country} />
      </div>
    </div>
  )
}

export default async function StatisticsPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ symbol: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { symbol } = await params
  const resolvedSearchParams = await searchParams
  const { country } = getSearchParams(resolvedSearchParams)
  
  const cleanSym = cleanSymbol(symbol)

  try {
    console.log(`🚀 Loading statistics for: ${symbol}, Country: ${country}`)
    
    const statisticsData = await getStatisticsData(symbol, country)
    
    console.log('📊 Data received from API:', statisticsData)
    
    // Validate data
    if (!statisticsData) {
      throw new Error('No data received from API')
    }
    
    // Some APIs return data directly, others inside data
    const actualData = statisticsData.data || statisticsData
    
    if (!actualData.meta) {
      console.error('❌ No meta in data:', actualData)
      throw new Error('Invalid data structure - no basic information')
    }

    const { meta, statistics } = actualData
    
    if (!statistics) {
      console.error('❌ No statistics in data:', actualData)
      throw new Error('No statistical data in response')
    }
    
    const organizedData = organizeStatisticsData(statistics)

    return (
      <div className={styles.container}>
        {/* Company Header - نفس تصميم Financials */}
        <div className={styles.companyHeader}>
          <span className={styles.companyName}>{meta.name || symbol}</span>
          <div className={styles.companyInfo}>
            <span className={styles.price}>Symbol: <span className={styles.bold}>{symbol}</span></span>
            <span className={styles.volume}>Country: <span className={styles.bold}>{country}</span></span>
            <span className={styles.volume}>Currency: <span className={styles.bold}>{meta.currency}</span></span>
          </div>
          <span className={styles.sector}>
            Financial Statistics and Indicators
          </span>
        </div>

        {/* Statistics Header - نفس تصميم FinancialHeader */}
        <StatisticsHeader symbol={symbol} country={country} />

        {/* Statistics Sections - بنفس نمط Financials Cards */}
        {organizedData.length > 0 ? (
          organizedData.map((section, sectionIndex) => (
            <div key={sectionIndex} className={styles.card}>
              <h2 className={styles.cardTitle}>{section.title}</h2>
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Metric</th>
                      <th>Value</th>
                    </tr>
                  </thead>
<tbody>
  {section.data.map((item: StatisticsItem, itemIndex: number) => (
    <tr 
      key={itemIndex} 
      className={item.highlight ? styles.highlightRow : ''}
    >
      <td className={item.highlight ? styles.bold : ''}>
        {item.label}
      </td>
      <td className={`${getColorClass(item.rawValue, item.isAlwaysPositive)} ${item.highlight ? styles.bold : ''}`}>
        {item.value}
      </td>
    </tr>
  ))}
</tbody>
                </table>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.noData}>
            No statistical data available
          </div>
        )}
      </div>
    )
  } catch (error) {
    console.error('❌ Error loading statistics data:', error)
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <div>Error loading statistical data</div>
          <div className={styles.textMuted}>
            Please try again later
          </div>
          <div className={styles.textMuted}>
            Error details: {(error as Error).message}
          </div>
          <div className={styles.textMuted}>
            Symbol: {symbol} | Country: {country}
          </div>
        </div>
      </div>
    )
  }
}