import Link from 'next/link'
import styles from '../../../styles/Financials.module.css'
import PeriodDropdown from '../../../../components/PeriodDropdown'

function cleanSymbol(symbol: string): string {
  return symbol.split('.')[0]
}

// Enhanced function to fetch financial data with period and country selection
async function getFinancialData(symbol: string, period: string = "annual", country: string = "Saudi Arabia") {
  const cleanSym = cleanSymbol(symbol)
  
  console.log(`💰 Fetching financial data for ${symbol} - Country: ${country} - Period: ${period}`)
  
  const [incomeRes, balanceRes, cashflowRes] = await Promise.all([
    fetch(`http://web-production-e66c2.up.railway.app/financials/income_statement/${cleanSym}?country=${country}&period=${period}&limit=6`, { cache: 'no-store' }),
    fetch(`http://web-production-e66c2.up.railway.app/financials/balance_sheet/${cleanSym}?country=${country}&period=${period}&limit=6`, { cache: 'no-store' }),
    fetch(`http://web-production-e66c2.up.railway.app/financials/cash_flow/${cleanSym}?country=${country}&period=${period}&limit=6`, { cache: 'no-store' })
  ])

  if (!incomeRes.ok) throw new Error('Failed to fetch income statement')
  if (!balanceRes.ok) throw new Error('Failed to fetch balance sheet')
  if (!cashflowRes.ok) throw new Error('Failed to fetch cash flow')

  const income = await incomeRes.json()
  const balance = await balanceRes.json()
  const cashflow = await cashflowRes.json()

  return { income, balance, cashflow, period, country }
}

//  New function: Calculate TTM from last 4 quarters
function calculateTTM(data: any[], field: string, isNested: boolean = false) {
  if (!data || data.length < 4) return null
  
  const last4Quarters = data.slice(0, 4)
  
  let sum = 0
  for (const quarter of last4Quarters) {
    let value = 0
    
    if (isNested) {
      // For nested values like operating_activities.operating_cash_flow
      const fields = field.split('.')
      let temp = quarter
      for (const f of fields) {
        temp = temp?.[f]
        if (temp === undefined || temp === null) break
      }
      value = temp || 0
    } else {
      value = quarter[field] || 0
    }
    
    sum += value
  }
  
  return sum
}

//  Function to calculate all TTM values for the three tables
function calculateAllTTM(income: any, balance: any, cashflow: any) {
  const incomeData = income.income_statement
  const balanceData = balance.balance_sheet
  const cashflowData = cashflow.cash_flow
  
  if (!incomeData || incomeData.length < 4) return null
  
  return {
    // Income Statement TTM
    sales: calculateTTM(incomeData, 'sales'),
    cost_of_goods: calculateTTM(incomeData, 'cost_of_goods'),
    gross_profit: calculateTTM(incomeData, 'gross_profit'),
    operating_expense: calculateTTM(incomeData, 'operating_expense.selling_general_and_administrative', true),
    operating_income: calculateTTM(incomeData, 'operating_income'),
    net_income: calculateTTM(incomeData, 'net_income'),
    ebitda: calculateTTM(incomeData, 'ebitda'),
    
    // Balance Sheet TTM (latest value only, not sum)
    cash_and_equivalents: balanceData?.[0]?.assets?.current_assets?.cash_and_cash_equivalents || 0,
    inventory: balanceData?.[0]?.assets?.current_assets?.inventory || 0,
    total_current_assets: balanceData?.[0]?.assets?.current_assets?.total_current_assets || 0,
    total_non_current_assets: balanceData?.[0]?.assets?.non_current_assets?.total_non_current_assets || 0,
    total_assets: balanceData?.[0]?.assets?.total_assets || 0,
    short_term_debt: balanceData?.[0]?.liabilities?.current_liabilities?.short_term_debt || 0,
    total_current_liabilities: balanceData?.[0]?.liabilities?.current_liabilities?.total_current_liabilities || 0,
    long_term_debt: balanceData?.[0]?.liabilities?.non_current_liabilities?.long_term_debt || 0,
    total_liabilities: balanceData?.[0]?.liabilities?.total_liabilities || 0,
    total_shareholders_equity: balanceData?.[0]?.shareholders_equity?.total_shareholders_equity || 0,
    
    // Cash Flow TTM
    operating_cash_flow: calculateTTM(cashflowData, 'operating_activities.operating_cash_flow', true),
    investing_cash_flow: calculateTTM(cashflowData, 'investing_activities.investing_cash_flow', true),
    financing_cash_flow: calculateTTM(cashflowData, 'financing_activities.financing_cash_flow', true),
    free_cash_flow: calculateTTM(cashflowData, 'free_cash_flow')
  }
}

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

function getPeriodDisplay(item: any) {
  if (!item) return 'N/A'
  if (item.quarter) {
    return `Q${item.quarter} ${item.year}`
  }
  return item.fiscal_date || item.year || 'N/A'
}

function getColorClass(value: any, isAlwaysPositive: boolean = false) {
  if (isAlwaysPositive) return styles.textPositive;
  
  const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
  if (isNaN(num)) return '';
  
  return num < 0 ? styles.textNegative : styles.textPositive;
}

function NavigationTabs({ symbol, period, country }: { symbol: string, period: string, country: string }) {
  const tabs = [
    // { label: 'Overview', href: `/stocks/${symbol}?period=${period}&country=${country}` },
    { label: 'Financial ', href: `/stocks/${symbol}/financials?period=${period}&country=${country}`, active: true },
    // { label: 'Analysis', href: `/stocks/${symbol}/analysis?period=${period}&country=${country}` },
    { label: 'Statistics', href: `/stocks/${symbol}/statistics?country=${country}` }

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

function FinancialHeader({ symbol, period, country }: { symbol: string, period: string, country: string }) {
  return (
    <div className={styles.financialHeader}>
      <div className={styles.headerContent}>
        <PeriodDropdown currentPeriod={period} symbol={symbol} country={country} />
        <NavigationTabs symbol={symbol} period={period} country={country} />
      </div>
    </div>
  )
}

function getSearchParams(searchParams: any) {
  return {
    period: searchParams.period === 'quarterly' ? 'quarterly' : 'annual',
    country: searchParams.country || 'Saudi Arabia'
  }
}

export default async function FinancialsPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ symbol: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { symbol } = await params
  const resolvedSearchParams = await searchParams
  const { period, country } = getSearchParams(resolvedSearchParams)
  
  const cleanSym = cleanSymbol(symbol)

  try {
    const { income, balance, cashflow } = await getFinancialData(symbol, period, country)
    
    //  Calculate TTM only for quarterly period
    const ttmData = period === 'quarterly' ? calculateAllTTM(income, balance, cashflow) : null
    const showTTM = period === 'quarterly' && ttmData

    return (
      <div className={styles.container}>
        {/* Company Header */}
        <div className={styles.companyHeader}>
          <span className={styles.companyName}>{income.meta?.name || symbol}</span>
          <div className={styles.companyInfo}>
            <span className={styles.price}>Symbol: <span className={styles.bold}>{symbol}</span></span>
            <span className={styles.volume}>Country: <span className={styles.bold}>{country}</span></span>
            <span className={styles.volume}>Period: <span className={styles.bold}>{period === 'quarterly' ? 'Quarterly' : 'Annual'}</span></span>
          </div>
          <span className={styles.sector}>
            Financial
          </span>
        </div>

        <FinancialHeader symbol={symbol} period={period} country={country} />

        {/*  Income Statement with TTM */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Income Statement</h2>
          {income.income_statement && income.income_statement.length > 0 ? (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Item</th>
                    {income.income_statement.map((item: any) => (
                      <th key={item.fiscal_date}>
                        {getPeriodDisplay(item)}
                      </th>
                    ))}
                    {showTTM && <th>TTM</th>}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className={styles.bold}>Revenues</td>
                    {income.income_statement.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(item.sales, true)}>
                        {formatNumber(item.sales)}
                      </td>
                    ))}
                    {showTTM && (
                      <td className={getColorClass(ttmData.sales, true)}>
                        {formatNumber(ttmData.sales)}
                      </td>
                    )}
                  </tr>
                  <tr>
                    <td className={styles.bold}>Cost of Goods Sold</td>
                    {income.income_statement.map((item: any) => (
                      <td key={item.fiscal_date}>
                        {formatNumber(item.cost_of_goods)}
                      </td>
                    ))}
                    {showTTM && (
                      <td>
                        {formatNumber(ttmData.cost_of_goods)}
                      </td>
                    )}
                  </tr>
                  <tr>
                    <td className={styles.bold}>Gross Profit</td>
                    {income.income_statement.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(item.gross_profit)}>
                        {formatNumber(item.gross_profit)}
                      </td>
                    ))}
                    {showTTM && (
                      <td className={getColorClass(ttmData.gross_profit)}>
                        {formatNumber(ttmData.gross_profit)}
                      </td>
                    )}
                  </tr>
                  <tr>
                    <td className={styles.bold}>Operating Expenses</td>
                    {income.income_statement.map((item: any) => (
                      <td key={item.fiscal_date}>
                        {formatNumber(item.operating_expense?.selling_general_and_administrative || 0)}
                      </td>
                    ))}
                    {showTTM && (
                      <td>
                        {formatNumber(ttmData.operating_expense)}
                      </td>
                    )}
                  </tr>
                  <tr>
                    <td className={styles.bold}>Operating Income</td>
                    {income.income_statement.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(item.operating_income)}>
                        {formatNumber(item.operating_income)}
                      </td>
                    ))}
                    {showTTM && (
                      <td className={getColorClass(ttmData.operating_income)}>
                        {formatNumber(ttmData.operating_income)}
                      </td>
                    )}
                  </tr>
                  <tr>
                    <td className={styles.bold}>Net Income</td>
                    {income.income_statement.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(item.net_income)}>
                        {formatNumber(item.net_income)}
                      </td>
                    ))}
                    {showTTM && (
                      <td className={getColorClass(ttmData.net_income)}>
                        {formatNumber(ttmData.net_income)}
                      </td>
                    )}
                  </tr>
                  <tr>
                    <td className={styles.bold}>EBITDA</td>
                    {income.income_statement.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(item.ebitda)}>
                        {formatNumber(item.ebitda)}
                      </td>
                    ))}
                    {showTTM && (
                      <td className={getColorClass(ttmData.ebitda)}>
                        {formatNumber(ttmData.ebitda)}
                      </td>
                    )}
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className={styles.noData}>
              No income statement data available
            </div>
          )}
        </div>

        {/*  Balance Sheet with TTM - Modified */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Balance Sheet</h2>
          {balance.balance_sheet && balance.balance_sheet.length > 0 ? (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Item</th>
                    {balance.balance_sheet.map((item: any) => (
                      <th key={item.fiscal_date}>
                        {getPeriodDisplay(item)}
                      </th>
                    ))}
                    {showTTM && <th>TTM</th>}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className={styles.bold}>Cash and Equivalents</td>
                    {balance.balance_sheet.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(item.assets?.current_assets?.cash_and_cash_equivalents, true)}>
                        {formatNumber(item.assets?.current_assets?.cash_and_cash_equivalents || 0)}
                      </td>
                    ))}
                    {showTTM && (
                      <td className={getColorClass(ttmData.cash_and_equivalents, true)}>
                        {formatNumber(ttmData.cash_and_equivalents)}
                      </td>
                    )}
                  </tr>
                  <tr>
                    <td className={styles.bold}>Inventory</td>
                    {balance.balance_sheet.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(item.assets?.current_assets?.inventory, true)}>
                        {formatNumber(item.assets?.current_assets?.inventory || 0)}
                      </td>
                    ))}
                    {showTTM && (
                      <td className={getColorClass(ttmData.inventory, true)}>
                        {formatNumber(ttmData.inventory)}
                      </td>
                    )}
                  </tr>
                  <tr>
                    <td className={styles.bold}>Total Current Assets</td>
                    {balance.balance_sheet.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(item.assets?.current_assets?.total_current_assets, true)}>
                        {formatNumber(item.assets?.current_assets?.total_current_assets || 0)}
                      </td>
                    ))}
                    {showTTM && (
                      <td className={getColorClass(ttmData.total_current_assets, true)}>
                        {formatNumber(ttmData.total_current_assets)}
                      </td>
                    )}
                  </tr>
                  <tr>
                    <td className={styles.bold}>Total Non-Current Assets</td>
                    {balance.balance_sheet.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(item.assets?.non_current_assets?.total_non_current_assets, true)}>
                        {formatNumber(item.assets?.non_current_assets?.total_non_current_assets || 0)}
                      </td>
                    ))}
                    {showTTM && (
                      <td className={getColorClass(ttmData.total_non_current_assets, true)}>
                        {formatNumber(ttmData.total_non_current_assets)}
                      </td>
                    )}
                  </tr>
                  <tr>
                    <td className={styles.bold}>Total Assets</td>
                    {balance.balance_sheet.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(item.assets?.total_assets, true)}>
                        {formatNumber(item.assets?.total_assets || 0)}
                      </td>
                    ))}
                    {showTTM && (
                      <td className={getColorClass(ttmData.total_assets, true)}>
                        {formatNumber(ttmData.total_assets)}
                      </td>
                    )}
                  </tr>
                  
                  <tr>
                    <td className={styles.bold}>Short-term Debt</td>
                    {balance.balance_sheet.map((item: any) => (
                      <td key={item.fiscal_date}>
                        {formatNumber(item.liabilities?.current_liabilities?.short_term_debt || 0)}
                      </td>
                    ))}
                    {showTTM && (
                      <td>
                        {formatNumber(ttmData.short_term_debt)}
                      </td>
                    )}
                  </tr>
                  <tr>
                    <td className={styles.bold}>Total Current Liabilities</td>
                    {balance.balance_sheet.map((item: any) => (
                      <td key={item.fiscal_date}>
                        {formatNumber(item.liabilities?.current_liabilities?.total_current_liabilities || 0)}
                      </td>
                    ))}
                    {showTTM && (
                      <td>
                        {formatNumber(ttmData.total_current_liabilities)}
                      </td>
                    )}
                  </tr>
                  <tr>
                    <td className={styles.bold}>Long-term Debt</td>
                    {balance.balance_sheet.map((item: any) => (
                      <td key={item.fiscal_date}>
                        {formatNumber(item.liabilities?.non_current_liabilities?.long_term_debt || 0)}
                      </td>
                    ))}
                    {showTTM && (
                      <td>
                        {formatNumber(ttmData.long_term_debt)}
                      </td>
                    )}
                  </tr>
                  <tr>
                    <td className={styles.bold}>Total Liabilities</td>
                    {balance.balance_sheet.map((item: any) => (
                      <td key={item.fiscal_date}>
                        {formatNumber(item.liabilities?.total_liabilities || 0)}
                      </td>
                    ))}
                    {showTTM && (
                      <td>
                        {formatNumber(ttmData.total_liabilities)}
                      </td>
                    )}
                  </tr>
                  
                  <tr>
                    <td className={styles.bold}>Shareholders Equity</td>
                    {balance.balance_sheet.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(item.shareholders_equity?.total_shareholders_equity)}>
                        {formatNumber(item.shareholders_equity?.total_shareholders_equity || 0)}
                      </td>
                    ))}
                    {showTTM && (
                      <td className={getColorClass(ttmData.total_shareholders_equity)}>
                        {formatNumber(ttmData.total_shareholders_equity)}
                      </td>
                    )}
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className={styles.noData}>
              No balance sheet data available
            </div>
          )}
        </div>

        {/*  Cash Flow with TTM - Modified */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Cash Flow Statement</h2>
          {cashflow.cash_flow && cashflow.cash_flow.length > 0 ? (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Item</th>
                    {cashflow.cash_flow.map((item: any) => (
                      <th key={item.fiscal_date}>
                        {getPeriodDisplay(item)}
                      </th>
                    ))}
                    {showTTM && <th>TTM</th>}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className={styles.bold}>Cash Flow from Operations</td>
                    {cashflow.cash_flow.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(item.operating_activities?.operating_cash_flow)}>
                        {formatNumber(item.operating_activities?.operating_cash_flow || 0)}
                      </td>
                    ))}
                    {showTTM && (
                      <td className={getColorClass(ttmData.operating_cash_flow)}>
                        {formatNumber(ttmData.operating_cash_flow)}
                      </td>
                    )}
                  </tr>
                  <tr>
                    <td className={styles.bold}>Cash Flow from Investing</td>
                    {cashflow.cash_flow.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(item.investing_activities?.investing_cash_flow)}>
                        {formatNumber(item.investing_activities?.investing_cash_flow || 0)}
                      </td>
                    ))}
                    {showTTM && (
                      <td className={getColorClass(ttmData.investing_cash_flow)}>
                        {formatNumber(ttmData.investing_cash_flow)}
                      </td>
                    )}
                  </tr>
                  <tr>
                    <td className={styles.bold}>Cash Flow from Financing</td>
                    {cashflow.cash_flow.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(item.financing_activities?.financing_cash_flow)}>
                        {formatNumber(item.financing_activities?.financing_cash_flow || 0)}
                      </td>
                    ))}
                    {showTTM && (
                      <td className={getColorClass(ttmData.financing_cash_flow)}>
                        {formatNumber(ttmData.financing_cash_flow)}
                      </td>
                    )}
                  </tr>
                  <tr>
                    <td className={styles.bold}>Net Change in Cash</td>
                    {cashflow.cash_flow.map((item: any) => {
                      const netChange = 
                        (item.operating_activities?.operating_cash_flow || 0) +
                        (item.investing_activities?.investing_cash_flow || 0) +
                        (item.financing_activities?.financing_cash_flow || 0);
                      return (
                        <td key={item.fiscal_date} className={getColorClass(netChange)}>
                          {formatNumber(netChange)}
                        </td>
                      );
                    })}
                    {showTTM && (
                      <td className={getColorClass(
                        (ttmData.operating_cash_flow || 0) + 
                        (ttmData.investing_cash_flow || 0) + 
                        (ttmData.financing_cash_flow || 0)
                      )}>
                        {formatNumber(
                          (ttmData.operating_cash_flow || 0) + 
                          (ttmData.investing_cash_flow || 0) + 
                          (ttmData.financing_cash_flow || 0)
                        )}
                      </td>
                    )}
                  </tr>
                  <tr>
                    <td className={styles.bold}>Free Cash Flow</td>
                    {cashflow.cash_flow.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(item.free_cash_flow)}>
                        {formatNumber(item.free_cash_flow || 0)}
                      </td>
                    ))}
                    {showTTM && (
                      <td className={getColorClass(ttmData.free_cash_flow)}>
                        {formatNumber(ttmData.free_cash_flow)}
                      </td>
                    )}
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className={styles.noData}>
              No cash flow data available
            </div>
          )}
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading financial data:', error)
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <div>Error loading financial data</div>
          <div className={styles.textMuted}>
            Please try again later
          </div>
        </div>
      </div>
    )
  }
}









































// import Link from 'next/link'
// import styles from '../../../styles/Financials.module.css'
// import PeriodDropdown from '../../../../components/PeriodDropdown'

// function cleanSymbol(symbol: string): string {
//   return symbol.split('.')[0]
// }

// // Enhanced function to fetch financial data with period and country selection
// async function getFinancialData(symbol: string, period: string = "annual", country: string = "Saudi Arabia") {
//   const cleanSym = cleanSymbol(symbol)
  
//   console.log(`💰 Fetching financial data for ${symbol} - Country: ${country} - Period: ${period}`)
  
//   const [incomeRes, balanceRes, cashflowRes] = await Promise.all([
//     fetch(`http://web-production-e66c2.up.railway.app/financials/income_statement/${cleanSym}?country=${country}&period=${period}&limit=6`, { cache: 'no-store' }),
//     fetch(`http://web-production-e66c2.up.railway.app/financials/balance_sheet/${cleanSym}?country=${country}&period=${period}&limit=6`, { cache: 'no-store' }),
//     fetch(`http://web-production-e66c2.up.railway.app/financials/cash_flow/${cleanSym}?country=${country}&period=${period}&limit=6`, { cache: 'no-store' })
//   ])

//   if (!incomeRes.ok) throw new Error('Failed to fetch income statement')
//   if (!balanceRes.ok) throw new Error('Failed to fetch balance sheet')
//   if (!cashflowRes.ok) throw new Error('Failed to fetch cash flow')

//   const income = await incomeRes.json()
//   const balance = await balanceRes.json()
//   const cashflow = await cashflowRes.json()

//   return { income, balance, cashflow, period, country }
// }

// //  New function: Calculate TTM from last 4 quarters
// function calculateTTM(data: any[], field: string, isNested: boolean = false) {
//   if (!data || data.length < 4) return null
  
//   const last4Quarters = data.slice(0, 4)
  
//   let sum = 0
//   for (const quarter of last4Quarters) {
//     let value = 0
    
//     if (isNested) {
//       // For nested values like operating_activities.operating_cash_flow
//       const fields = field.split('.')
//       let temp = quarter
//       for (const f of fields) {
//         temp = temp?.[f]
//         if (temp === undefined || temp === null) break
//       }
//       value = temp || 0
//     } else {
//       value = quarter[field] || 0
//     }
    
//     sum += value
//   }
  
//   return sum
// }

// //  Function to calculate all TTM values for the three tables
// function calculateAllTTM(income: any, balance: any, cashflow: any) {
//   const incomeData = income.income_statement
//   const balanceData = balance.balance_sheet
//   const cashflowData = cashflow.cash_flow
  
//   if (!incomeData || incomeData.length < 4) return null
  
//   return {
//     // Income Statement TTM
//     sales: calculateTTM(incomeData, 'sales'),
//     cost_of_goods: calculateTTM(incomeData, 'cost_of_goods'),
//     gross_profit: calculateTTM(incomeData, 'gross_profit'),
//     operating_expense: calculateTTM(incomeData, 'operating_expense.selling_general_and_administrative', true),
//     operating_income: calculateTTM(incomeData, 'operating_income'),
//     net_income: calculateTTM(incomeData, 'net_income'),
//     ebitda: calculateTTM(incomeData, 'ebitda'),
    
//     // Balance Sheet TTM (latest value only, not sum)
//     cash_and_equivalents: balanceData?.[0]?.assets?.current_assets?.cash_and_cash_equivalents || 0,
//     inventory: balanceData?.[0]?.assets?.current_assets?.inventory || 0,
//     total_current_assets: balanceData?.[0]?.assets?.current_assets?.total_current_assets || 0,
//     total_non_current_assets: balanceData?.[0]?.assets?.non_current_assets?.total_non_current_assets || 0,
//     total_assets: balanceData?.[0]?.assets?.total_assets || 0,
//     short_term_debt: balanceData?.[0]?.liabilities?.current_liabilities?.short_term_debt || 0,
//     total_current_liabilities: balanceData?.[0]?.liabilities?.current_liabilities?.total_current_liabilities || 0,
//     long_term_debt: balanceData?.[0]?.liabilities?.non_current_liabilities?.long_term_debt || 0,
//     total_liabilities: balanceData?.[0]?.liabilities?.total_liabilities || 0,
//     total_shareholders_equity: balanceData?.[0]?.shareholders_equity?.total_shareholders_equity || 0,
    
//     // Cash Flow TTM
//     operating_cash_flow: calculateTTM(cashflowData, 'operating_activities.operating_cash_flow', true),
//     investing_cash_flow: calculateTTM(cashflowData, 'investing_activities.investing_cash_flow', true),
//     financing_cash_flow: calculateTTM(cashflowData, 'financing_activities.financing_cash_flow', true),
//     free_cash_flow: calculateTTM(cashflowData, 'free_cash_flow')
//   }
// }

// function formatNumber(value: any): string {
//   if (!value && value !== 0) return 'N/A';
  
//   const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
  
//   if (isNaN(num)) return 'N/A';
  
//   if (num < 0) {
//     const absoluteValue = Math.abs(num);
    
//     if (absoluteValue >= 1000000) {
//       return `(${(absoluteValue / 1000000).toFixed(2)}-)`;
//     }
    
//     if (absoluteValue >= 1000) {
//       return `(${(absoluteValue / 1000).toFixed(2)}-)`;
//     }
    
//     return `(${absoluteValue.toFixed(2)}-)`;
//   }
  
//   if (Math.abs(num) >= 1000000) {
//     return (num / 1000000).toFixed(2);
//   }
  
//   if (Math.abs(num) >= 1000) {
//     return (num / 1000).toFixed(2);
//   }
  
//   return num.toLocaleString('en-US', {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2
//   });
// }

// function getPeriodDisplay(item: any) {
//   if (!item) return 'N/A'
//   if (item.quarter) {
//     return `Q${item.quarter} ${item.year}`
//   }
//   return item.fiscal_date || item.year || 'N/A'
// }

// function getColorClass(value: any, isAlwaysPositive: boolean = false) {
//   if (isAlwaysPositive) return styles.textPositive;
  
//   const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
//   if (isNaN(num)) return '';
  
//   return num < 0 ? styles.textNegative : styles.textPositive;
// }

// function NavigationTabs({ symbol, period, country }: { symbol: string, period: string, country: string }) {
//   const tabs = [
//     { label: 'Overview', href: `/stocks/${symbol}?period=${period}&country=${country}` },
//     { label: 'Financial Statements', href: `/stocks/${symbol}/financials?period=${period}&country=${country}`, active: true },
//     { label: 'Analysis', href: `/stocks/${symbol}/analysis?period=${period}&country=${country}` }
//   ]

//   return (
//     <div className={styles.navTabs}>
//       {tabs.map((tab) => (
//         <Link
//           key={tab.label}
//           href={tab.href}
//           className={`${styles.navTab} ${tab.active ? styles.active : ''}`}
//         >
//           {tab.label}
//         </Link>
//       ))}
//     </div>
//   )
// }

// function FinancialHeader({ symbol, period, country }: { symbol: string, period: string, country: string }) {
//   return (
//     <div className={styles.financialHeader}>
//       <div className={styles.headerContent}>
//         <PeriodDropdown currentPeriod={period} symbol={symbol} country={country} />
//         <NavigationTabs symbol={symbol} period={period} country={country} />
//       </div>
//     </div>
//   )
// }

// function getSearchParams(searchParams: any) {
//   return {
//     period: searchParams.period === 'quarterly' ? 'quarterly' : 'annual',
//     country: searchParams.country || 'Saudi Arabia'
//   }
// }

// export default async function FinancialsPage({ 
//   params,
//   searchParams 
// }: { 
//   params: Promise<{ symbol: string }>
//   searchParams: Promise<{ [key: string]: string | string[] | undefined }>
// }) {
//   const { symbol } = await params
//   const resolvedSearchParams = await searchParams
//   const { period, country } = getSearchParams(resolvedSearchParams)
  
//   const cleanSym = cleanSymbol(symbol)

//   try {
//     const { income, balance, cashflow } = await getFinancialData(symbol, period, country)
    
//     //  Calculate TTM only for quarterly period
//     const ttmData = period === 'quarterly' ? calculateAllTTM(income, balance, cashflow) : null
//     const showTTM = period === 'quarterly' && ttmData

//     return (
//       <div className={styles.container}>
//         {/* Company Header */}
//         <div className={styles.companyHeader}>
//           <span className={styles.companyName}>{income.meta?.name || symbol}</span>
//           <div className={styles.companyInfo}>
//             <span className={styles.price}>Symbol: <span className={styles.bold}>{symbol}</span></span>
//             <span className={styles.volume}>Country: <span className={styles.bold}>{country}</span></span>
//             <span className={styles.volume}>Period: <span className={styles.bold}>{period === 'quarterly' ? 'Quarterly' : 'Annual'}</span></span>
//           </div>
//           <span className={styles.sector}>
//             Financial Statements
//           </span>
//         </div>

//         <FinancialHeader symbol={symbol} period={period} country={country} />

//         {/*  Income Statement with TTM */}
//         <div className={styles.card}>
//           <h2 className={styles.cardTitle}>Income Statement</h2>
//           {income.income_statement && income.income_statement.length > 0 ? (
//             <div className={styles.tableContainer}>
//               <table className={styles.table}>
//                 <thead>
//                   <tr>
//                     <th>Item</th>
//                     {income.income_statement.map((item: any) => (
//                       <th key={item.fiscal_date}>
//                         {getPeriodDisplay(item)}
//                       </th>
//                     ))}
//                     {showTTM && <th>TTM</th>}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   <tr>
//                     <td className={styles.bold}>Revenues</td>
//                     {income.income_statement.map((item: any) => (
//                       <td key={item.fiscal_date} className={getColorClass(item.sales, true)}>
//                         {formatNumber(item.sales)}
//                       </td>
//                     ))}
//                     {showTTM && (
//                       <td className={getColorClass(ttmData.sales, true)}>
//                         {formatNumber(ttmData.sales)}
//                       </td>
//                     )}
//                   </tr>
//                   <tr>
//                     <td className={styles.bold}>Cost of Goods Sold</td>
//                     {income.income_statement.map((item: any) => (
//                       <td key={item.fiscal_date}>
//                         {formatNumber(item.cost_of_goods)}
//                       </td>
//                     ))}
//                     {showTTM && (
//                       <td>
//                         {formatNumber(ttmData.cost_of_goods)}
//                       </td>
//                     )}
//                   </tr>
//                   <tr>
//                     <td className={styles.bold}>Gross Profit</td>
//                     {income.income_statement.map((item: any) => (
//                       <td key={item.fiscal_date} className={getColorClass(item.gross_profit)}>
//                         {formatNumber(item.gross_profit)}
//                       </td>
//                     ))}
//                     {showTTM && (
//                       <td className={getColorClass(ttmData.gross_profit)}>
//                         {formatNumber(ttmData.gross_profit)}
//                       </td>
//                     )}
//                   </tr>
//                   <tr>
//                     <td className={styles.bold}>Operating Expenses</td>
//                     {income.income_statement.map((item: any) => (
//                       <td key={item.fiscal_date}>
//                         {formatNumber(item.operating_expense?.selling_general_and_administrative || 0)}
//                       </td>
//                     ))}
//                     {showTTM && (
//                       <td>
//                         {formatNumber(ttmData.operating_expense)}
//                       </td>
//                     )}
//                   </tr>
//                   <tr>
//                     <td className={styles.bold}>Operating Income</td>
//                     {income.income_statement.map((item: any) => (
//                       <td key={item.fiscal_date} className={getColorClass(item.operating_income)}>
//                         {formatNumber(item.operating_income)}
//                       </td>
//                     ))}
//                     {showTTM && (
//                       <td className={getColorClass(ttmData.operating_income)}>
//                         {formatNumber(ttmData.operating_income)}
//                       </td>
//                     )}
//                   </tr>
//                   <tr>
//                     <td className={styles.bold}>Net Income</td>
//                     {income.income_statement.map((item: any) => (
//                       <td key={item.fiscal_date} className={getColorClass(item.net_income)}>
//                         {formatNumber(item.net_income)}
//                       </td>
//                     ))}
//                     {showTTM && (
//                       <td className={getColorClass(ttmData.net_income)}>
//                         {formatNumber(ttmData.net_income)}
//                       </td>
//                     )}
//                   </tr>
//                   <tr>
//                     <td className={styles.bold}>EBITDA</td>
//                     {income.income_statement.map((item: any) => (
//                       <td key={item.fiscal_date} className={getColorClass(item.ebitda)}>
//                         {formatNumber(item.ebitda)}
//                       </td>
//                     ))}
//                     {showTTM && (
//                       <td className={getColorClass(ttmData.ebitda)}>
//                         {formatNumber(ttmData.ebitda)}
//                       </td>
//                     )}
//                   </tr>
//                 </tbody>
//               </table>
//             </div>
//           ) : (
//             <div className={styles.noData}>
//               No income statement data available
//             </div>
//           )}
//         </div>

//         {/*  Balance Sheet with TTM - Modified */}
//         <div className={styles.card}>
//           <h2 className={styles.cardTitle}>Balance Sheet</h2>
//           {balance.balance_sheet && balance.balance_sheet.length > 0 ? (
//             <div className={styles.tableContainer}>
//               <table className={styles.table}>
//                 <thead>
//                   <tr>
//                     <th>Item</th>
//                     {balance.balance_sheet.map((item: any) => (
//                       <th key={item.fiscal_date}>
//                         {getPeriodDisplay(item)}
//                       </th>
//                     ))}
//                     {showTTM && <th>TTM</th>}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   <tr>
//                     <td className={styles.bold}>Cash and Equivalents</td>
//                     {balance.balance_sheet.map((item: any) => (
//                       <td key={item.fiscal_date} className={getColorClass(item.assets?.current_assets?.cash_and_cash_equivalents, true)}>
//                         {formatNumber(item.assets?.current_assets?.cash_and_cash_equivalents || 0)}
//                       </td>
//                     ))}
//                     {showTTM && (
//                       <td className={getColorClass(ttmData.cash_and_equivalents, true)}>
//                         {formatNumber(ttmData.cash_and_equivalents)}
//                       </td>
//                     )}
//                   </tr>
//                   <tr>
//                     <td className={styles.bold}>Inventory</td>
//                     {balance.balance_sheet.map((item: any) => (
//                       <td key={item.fiscal_date} className={getColorClass(item.assets?.current_assets?.inventory, true)}>
//                         {formatNumber(item.assets?.current_assets?.inventory || 0)}
//                       </td>
//                     ))}
//                     {showTTM && (
//                       <td className={getColorClass(ttmData.inventory, true)}>
//                         {formatNumber(ttmData.inventory)}
//                       </td>
//                     )}
//                   </tr>
//                   <tr>
//                     <td className={styles.bold}>Total Current Assets</td>
//                     {balance.balance_sheet.map((item: any) => (
//                       <td key={item.fiscal_date} className={getColorClass(item.assets?.current_assets?.total_current_assets, true)}>
//                         {formatNumber(item.assets?.current_assets?.total_current_assets || 0)}
//                       </td>
//                     ))}
//                     {showTTM && (
//                       <td className={getColorClass(ttmData.total_current_assets, true)}>
//                         {formatNumber(ttmData.total_current_assets)}
//                       </td>
//                     )}
//                   </tr>
//                   <tr>
//                     <td className={styles.bold}>Total Non-Current Assets</td>
//                     {balance.balance_sheet.map((item: any) => (
//                       <td key={item.fiscal_date} className={getColorClass(item.assets?.non_current_assets?.total_non_current_assets, true)}>
//                         {formatNumber(item.assets?.non_current_assets?.total_non_current_assets || 0)}
//                       </td>
//                     ))}
//                     {showTTM && (
//                       <td className={getColorClass(ttmData.total_non_current_assets, true)}>
//                         {formatNumber(ttmData.total_non_current_assets)}
//                       </td>
//                     )}
//                   </tr>
//                   <tr>
//                     <td className={styles.bold}>Total Assets</td>
//                     {balance.balance_sheet.map((item: any) => (
//                       <td key={item.fiscal_date} className={getColorClass(item.assets?.total_assets, true)}>
//                         {formatNumber(item.assets?.total_assets || 0)}
//                       </td>
//                     ))}
//                     {showTTM && (
//                       <td className={getColorClass(ttmData.total_assets, true)}>
//                         {formatNumber(ttmData.total_assets)}
//                       </td>
//                     )}
//                   </tr>
                  
//                   <tr>
//                     <td className={styles.bold}>Short-term Debt</td>
//                     {balance.balance_sheet.map((item: any) => (
//                       <td key={item.fiscal_date}>
//                         {formatNumber(item.liabilities?.current_liabilities?.short_term_debt || 0)}
//                       </td>
//                     ))}
//                     {showTTM && (
//                       <td>
//                         {formatNumber(ttmData.short_term_debt)}
//                       </td>
//                     )}
//                   </tr>
//                   <tr>
//                     <td className={styles.bold}>Total Current Liabilities</td>
//                     {balance.balance_sheet.map((item: any) => (
//                       <td key={item.fiscal_date}>
//                         {formatNumber(item.liabilities?.current_liabilities?.total_current_liabilities || 0)}
//                       </td>
//                     ))}
//                     {showTTM && (
//                       <td>
//                         {formatNumber(ttmData.total_current_liabilities)}
//                       </td>
//                     )}
//                   </tr>
//                   <tr>
//                     <td className={styles.bold}>Long-term Debt</td>
//                     {balance.balance_sheet.map((item: any) => (
//                       <td key={item.fiscal_date}>
//                         {formatNumber(item.liabilities?.non_current_liabilities?.long_term_debt || 0)}
//                       </td>
//                     ))}
//                     {showTTM && (
//                       <td>
//                         {formatNumber(ttmData.long_term_debt)}
//                       </td>
//                     )}
//                   </tr>
//                   <tr>
//                     <td className={styles.bold}>Total Liabilities</td>
//                     {balance.balance_sheet.map((item: any) => (
//                       <td key={item.fiscal_date}>
//                         {formatNumber(item.liabilities?.total_liabilities || 0)}
//                       </td>
//                     ))}
//                     {showTTM && (
//                       <td>
//                         {formatNumber(ttmData.total_liabilities)}
//                       </td>
//                     )}
//                   </tr>
                  
//                   <tr>
//                     <td className={styles.bold}>Shareholders Equity</td>
//                     {balance.balance_sheet.map((item: any) => (
//                       <td key={item.fiscal_date} className={getColorClass(item.shareholders_equity?.total_shareholders_equity)}>
//                         {formatNumber(item.shareholders_equity?.total_shareholders_equity || 0)}
//                       </td>
//                     ))}
//                     {showTTM && (
//                       <td className={getColorClass(ttmData.total_shareholders_equity)}>
//                         {formatNumber(ttmData.total_shareholders_equity)}
//                       </td>
//                     )}
//                   </tr>
//                 </tbody>
//               </table>
//             </div>
//           ) : (
//             <div className={styles.noData}>
//               No balance sheet data available
//             </div>
//           )}
//         </div>

//         {/*  Cash Flow with TTM - Modified */}
//         <div className={styles.card}>
//           <h2 className={styles.cardTitle}>Cash Flow Statement</h2>
//           {cashflow.cash_flow && cashflow.cash_flow.length > 0 ? (
//             <div className={styles.tableContainer}>
//               <table className={styles.table}>
//                 <thead>
//                   <tr>
//                     <th>Item</th>
//                     {cashflow.cash_flow.map((item: any) => (
//                       <th key={item.fiscal_date}>
//                         {getPeriodDisplay(item)}
//                       </th>
//                     ))}
//                     {showTTM && <th>TTM</th>}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   <tr>
//                     <td className={styles.bold}>Cash Flow from Operations</td>
//                     {cashflow.cash_flow.map((item: any) => (
//                       <td key={item.fiscal_date} className={getColorClass(item.operating_activities?.operating_cash_flow)}>
//                         {formatNumber(item.operating_activities?.operating_cash_flow || 0)}
//                       </td>
//                     ))}
//                     {showTTM && (
//                       <td className={getColorClass(ttmData.operating_cash_flow)}>
//                         {formatNumber(ttmData.operating_cash_flow)}
//                       </td>
//                     )}
//                   </tr>
//                   <tr>
//                     <td className={styles.bold}>Cash Flow from Investing</td>
//                     {cashflow.cash_flow.map((item: any) => (
//                       <td key={item.fiscal_date} className={getColorClass(item.investing_activities?.investing_cash_flow)}>
//                         {formatNumber(item.investing_activities?.investing_cash_flow || 0)}
//                       </td>
//                     ))}
//                     {showTTM && (
//                       <td className={getColorClass(ttmData.investing_cash_flow)}>
//                         {formatNumber(ttmData.investing_cash_flow)}
//                       </td>
//                     )}
//                   </tr>
//                   <tr>
//                     <td className={styles.bold}>Cash Flow from Financing</td>
//                     {cashflow.cash_flow.map((item: any) => (
//                       <td key={item.fiscal_date} className={getColorClass(item.financing_activities?.financing_cash_flow)}>
//                         {formatNumber(item.financing_activities?.financing_cash_flow || 0)}
//                       </td>
//                     ))}
//                     {showTTM && (
//                       <td className={getColorClass(ttmData.financing_cash_flow)}>
//                         {formatNumber(ttmData.financing_cash_flow)}
//                       </td>
//                     )}
//                   </tr>
//                   <tr>
//                     <td className={styles.bold}>Net Change in Cash</td>
//                     {cashflow.cash_flow.map((item: any) => {
//                       const netChange = 
//                         (item.operating_activities?.operating_cash_flow || 0) +
//                         (item.investing_activities?.investing_cash_flow || 0) +
//                         (item.financing_activities?.financing_cash_flow || 0);
//                       return (
//                         <td key={item.fiscal_date} className={getColorClass(netChange)}>
//                           {formatNumber(netChange)}
//                         </td>
//                       );
//                     })}
//                     {showTTM && (
//                       <td className={getColorClass(
//                         (ttmData.operating_cash_flow || 0) + 
//                         (ttmData.investing_cash_flow || 0) + 
//                         (ttmData.financing_cash_flow || 0)
//                       )}>
//                         {formatNumber(
//                           (ttmData.operating_cash_flow || 0) + 
//                           (ttmData.investing_cash_flow || 0) + 
//                           (ttmData.financing_cash_flow || 0)
//                         )}
//                       </td>
//                     )}
//                   </tr>
//                   <tr>
//                     <td className={styles.bold}>Free Cash Flow</td>
//                     {cashflow.cash_flow.map((item: any) => (
//                       <td key={item.fiscal_date} className={getColorClass(item.free_cash_flow)}>
//                         {formatNumber(item.free_cash_flow || 0)}
//                       </td>
//                     ))}
//                     {showTTM && (
//                       <td className={getColorClass(ttmData.free_cash_flow)}>
//                         {formatNumber(ttmData.free_cash_flow)}
//                       </td>
//                     )}
//                   </tr>
//                 </tbody>
//               </table>
//             </div>
//           ) : (
//             <div className={styles.noData}>
//               No cash flow data available
//             </div>
//           )}
//         </div>
//       </div>
//     )
//   } catch (error) {
//     console.error('Error loading financial data:', error)
//     return (
//       <div className={styles.container}>
//         <div className={styles.errorState}>
//           <div>Error loading financial data</div>
//           <div className={styles.textMuted}>
//             Please try again later
//           </div>
//         </div>
//       </div>
//     )
//   }
// }