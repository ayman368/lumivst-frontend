import Link from 'next/link'
import styles from '../../../styles/Financials.module.css'
import PeriodDropdown from '../../../../components/PeriodDropdown'
import { notFound } from 'next/navigation'

function cleanSymbol(symbol: string): string {
  return symbol.split('.')[0]
}

// دالة مساعدة للوصول للقيم المتداخلة بأمان
function getNestedValue(obj: any, path: string): any {
  if (!obj) return null;
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// جلب اسم الشركة من قاعدة البيانات
async function getCompanyName(symbol: string, country: string): Promise<string> {
  try {
    const cleanSym = cleanSymbol(symbol);
    const response = await fetch(
      `http://localhost:8000/stocks/${cleanSym}/name?country=${encodeURIComponent(country)}`,
      { cache: 'no-store' }
    );
    if (!response.ok) throw new Error('Failed to fetch');
    const data = await response.json();
    return data.name || symbol;
  } catch (error) {
    console.error('Error fetching company name:', error);
    return symbol;
  }
}

// جلب البيانات المالية
async function getFinancialData(symbol: string, period: string = "annual", country: string = "Saudi Arabia") {
  const cleanSym = cleanSymbol(symbol)
  
  console.log(`💰 Fetching financial data for ${symbol} - Country: ${country} - Period: ${period}`)
  
  const [incomeRes, balanceRes, cashflowRes] = await Promise.all([
    fetch(`http://localhost:8000/financials/income_statement/${cleanSym}?country=${country}&period=${period}&limit=6`, { cache: 'no-store' }),
    fetch(`http://localhost:8000/financials/balance_sheet/${cleanSym}?country=${country}&period=${period}&limit=6`, { cache: 'no-store' }),
    fetch(`http://localhost:8000/financials/cash_flow/${cleanSym}?country=${country}&period=${period}&limit=6`, { cache: 'no-store' })
  ])

  const [quarterlyIncomeRes, quarterlyCashflowRes] = await Promise.all([
    fetch(`http://localhost:8000/financials/income_statement/${cleanSym}?country=${country}&period=quarterly&limit=8`, { cache: 'no-store' }),
    fetch(`http://localhost:8000/financials/cash_flow/${cleanSym}?country=${country}&period=quarterly&limit=8`, { cache: 'no-store' })
  ])

  if (!incomeRes.ok) throw new Error('Failed to fetch income statement')
  if (!balanceRes.ok) throw new Error('Failed to balance sheet')
  if (!cashflowRes.ok) throw new Error('Failed to fetch cash flow')
  if (!quarterlyIncomeRes.ok) throw new Error('Failed to fetch quarterly income')
  if (!quarterlyCashflowRes.ok) throw new Error('Failed to fetch quarterly cash flow')

  const income = await incomeRes.json()
  const balance = await balanceRes.json()
  const cashflow = await cashflowRes.json()
  const quarterlyIncome = await quarterlyIncomeRes.json()
  const quarterlyCashflow = await quarterlyCashflowRes.json()

  return { 
    income, 
    balance, 
    cashflow, 
    quarterlyIncome, 
    quarterlyCashflow,
    period, 
    country 
  }
}

// حساب TTM باستخدام المسارات المتداخلة
function calculateTTM(data: any[], path: string) {
  if (!data || data.length < 4) return null;
  
  const last4Quarters = data.slice(0, 4);
  const sum = last4Quarters.reduce((acc, item) => {
    const value = getNestedValue(item, path) || 0;
    return acc + value;
  }, 0);
  
  return sum;
}

// حساب جميع قيم TTM
function calculateAllTTM(quarterlyIncome: any, quarterlyCashflow: any, annualBalance: any) {
  const incomeData = quarterlyIncome.income_statement;
  const cashflowData = quarterlyCashflow.cash_flow;
  
  if (!incomeData || incomeData.length < 4) return null;
  
  return {
    // Income Statement TTM
    sales: calculateTTM(incomeData, 'sales'),
    cost_of_goods: calculateTTM(incomeData, 'cost_of_goods'),
    gross_profit: calculateTTM(incomeData, 'gross_profit'),
    operating_expense: calculateTTM(incomeData, 'operating_expense.selling_general_and_administrative'),
    operating_income: calculateTTM(incomeData, 'operating_income'),
    non_operating_interest: calculateTTM(incomeData, 'non_operating_interest.expense'),
    other_income_expense: calculateTTM(incomeData, 'other_income_expense'),
    pretax_income: calculateTTM(incomeData, 'pretax_income'),
    income_tax: calculateTTM(incomeData, 'income_tax'),
    net_income: calculateTTM(incomeData, 'net_income'),
    net_income_continuous_operations: calculateTTM(incomeData, 'net_income_continuous_operations'),
    minority_interests: calculateTTM(incomeData, 'minority_interests'),
    preferred_stock_dividends: calculateTTM(incomeData, 'preferred_stock_dividends'),
    eps_basic: calculateTTM(incomeData, 'eps_basic'),
    eps_diluted: calculateTTM(incomeData, 'eps_diluted'),
    basic_shares_outstanding: calculateTTM(incomeData, 'basic_shares_outstanding'),
    diluted_shares_outstanding: calculateTTM(incomeData, 'diluted_shares_outstanding'),
    ebit: calculateTTM(incomeData, 'ebit'),
    ebitda: calculateTTM(incomeData, 'ebitda'),
    
    // Balance Sheet (آخر فترة فقط)
    cash_and_equivalents: getNestedValue(annualBalance.balance_sheet?.[0], 'assets.current_assets.cash_and_cash_equivalents') || 0,
    accounts_receivable: getNestedValue(annualBalance.balance_sheet?.[0], 'assets.current_assets.accounts_receivable') || 0,
    inventory: getNestedValue(annualBalance.balance_sheet?.[0], 'assets.current_assets.inventory') || 0,
    prepaid_assets: getNestedValue(annualBalance.balance_sheet?.[0], 'assets.current_assets.prepaid_assets') || 0,
    other_current_assets: getNestedValue(annualBalance.balance_sheet?.[0], 'assets.current_assets.other_current_assets') || 0,
    total_current_assets: getNestedValue(annualBalance.balance_sheet?.[0], 'assets.current_assets.total_current_assets') || 0,
    
    properties: getNestedValue(annualBalance.balance_sheet?.[0], 'assets.non_current_assets.properties') || 0,
    machinery_furniture_equipment: getNestedValue(annualBalance.balance_sheet?.[0], 'assets.non_current_assets.machinery_furniture_equipment') || 0,
    goodwill: getNestedValue(annualBalance.balance_sheet?.[0], 'assets.non_current_assets.goodwill') || 0,
    other_non_current_assets: getNestedValue(annualBalance.balance_sheet?.[0], 'assets.non_current_assets.other_non_current_assets') || 0,
    total_non_current_assets: getNestedValue(annualBalance.balance_sheet?.[0], 'assets.non_current_assets.total_non_current_assets') || 0,
    total_assets: getNestedValue(annualBalance.balance_sheet?.[0], 'assets.total_assets') || 0,
    
    accounts_payable: getNestedValue(annualBalance.balance_sheet?.[0], 'liabilities.current_liabilities.accounts_payable') || 0,
    short_term_debt: getNestedValue(annualBalance.balance_sheet?.[0], 'liabilities.current_liabilities.short_term_debt') || 0,
    deferred_revenue: getNestedValue(annualBalance.balance_sheet?.[0], 'liabilities.current_liabilities.deferred_revenue') || 0,
    other_current_liabilities: getNestedValue(annualBalance.balance_sheet?.[0], 'liabilities.current_liabilities.other_current_liabilities') || 0,
    total_current_liabilities: getNestedValue(annualBalance.balance_sheet?.[0], 'liabilities.current_liabilities.total_current_liabilities') || 0,
    
    long_term_debt: getNestedValue(annualBalance.balance_sheet?.[0], 'liabilities.non_current_liabilities.long_term_debt') || 0,
    other_non_current_liabilities: getNestedValue(annualBalance.balance_sheet?.[0], 'liabilities.non_current_liabilities.other_non_current_liabilities') || 0,
    total_non_current_liabilities: getNestedValue(annualBalance.balance_sheet?.[0], 'liabilities.non_current_liabilities.total_non_current_liabilities') || 0,
    total_liabilities: getNestedValue(annualBalance.balance_sheet?.[0], 'liabilities.total_liabilities') || 0,
    
    common_stock: getNestedValue(annualBalance.balance_sheet?.[0], 'shareholders_equity.common_stock') || 0,
    retained_earnings: getNestedValue(annualBalance.balance_sheet?.[0], 'shareholders_equity.retained_earnings') || 0,
    minority_interest: getNestedValue(annualBalance.balance_sheet?.[0], 'shareholders_equity.minority_interest') || 0,
    total_shareholders_equity: getNestedValue(annualBalance.balance_sheet?.[0], 'shareholders_equity.total_shareholders_equity') || 0,
    
    // Cash Flow TTM
    operating_cash_flow: calculateTTM(cashflowData, 'operating_activities.operating_cash_flow'),
    investing_cash_flow: calculateTTM(cashflowData, 'investing_activities.investing_cash_flow'),
    financing_cash_flow: calculateTTM(cashflowData, 'financing_activities.financing_cash_flow'),
    depreciation: calculateTTM(cashflowData, 'operating_activities.depreciation'),
    stock_based_compensation: calculateTTM(cashflowData, 'operating_activities.stock_based_compensation'),
    accounts_receivable_change: calculateTTM(cashflowData, 'operating_activities.accounts_receivable'),
    accounts_payable_change: calculateTTM(cashflowData, 'operating_activities.accounts_payable'),
    capital_expenditures: calculateTTM(cashflowData, 'investing_activities.capital_expenditures'),
    net_acquisitions: calculateTTM(cashflowData, 'investing_activities.net_acquisitions'),
    free_cash_flow: calculateTTM(cashflowData, 'free_cash_flow'),
    income_tax_paid: calculateTTM(cashflowData, 'income_tax_paid'),
    interest_paid: calculateTTM(cashflowData, 'interest_paid'),
    end_cash_position: getNestedValue(cashflowData?.[0], 'end_cash_position') || 0,
  };
}

// تنسيق الأرقام
function formatNumber(value: any, isPercentage: boolean = false): string {
  if (value === null || value === undefined || value === '') return 'N/A';
  
  // إذا كانت القيمة أصلاً نص تحتوي على % أو تم تحديدها كنسبة
  if (isPercentage || (typeof value === 'string' && value.includes('%'))) {
    if (typeof value === 'number') {
      return `${(value * 100).toFixed(2)}%`;
    }
    return value;
  }
  
  const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
  
  if (isNaN(num) || num === 0) return num === 0 ? '0' : 'N/A';
  
  // تحويل إلى المليون
  const millionValue = num / 1000000;
  
  // تقريب إلى أقرب عدد صحيح
  const roundedValue = Math.round(millionValue);
  
  // تنسيق القيمة المطلقة مع فواصل آلاف
  const absValue = Math.abs(roundedValue);
  const formattedValue = absValue.toLocaleString('en-US', { maximumFractionDigits: 0 });
  
  // إذا كانت القيمة سالبة
  if (roundedValue < 0) {
    return `(${formattedValue})`;
  }
  
  // القيم الموجبة
  return `${formattedValue}`;
}

function getPeriodDisplay(item: any) {
  if (!item) return 'N/A'
  if (item.quarter) {
    return `Q${item.quarter} ${item.year}`
  }
  return item.fiscal_date || item.year || 'N/A'
}

function getColorClass(value: any, isAlwaysPositive: boolean = false) {
  if (value === null || value === undefined) return '';
  
  const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
  if (isNaN(num)) return '';
  
  return num < 0 ? styles.textNegative : styles.textPositive;
}

function NavigationTabs({ symbol, period, country }: { symbol: string, period: string, country: string }) {
  return (
    <div className={styles.navTabs}>
      <Link href={`/stocks/${symbol}/financials?period=${period}&country=${country}`} 
            className={`${styles.navTab} ${styles.active}`}>
        Financial
      </Link>
      <Link href={`/stocks/${symbol}/statistics?country=${country}`} 
            className={styles.navTab}>
        Statistics
      </Link>
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
    const companyName = await getCompanyName(cleanSym, country);
    const { income, balance, cashflow, quarterlyIncome, quarterlyCashflow } = await getFinancialData(symbol, period, country)
    
    const ttmData = period === 'annual' ? calculateAllTTM(quarterlyIncome, quarterlyCashflow, balance) : null
    const showTTM = period === 'annual' && ttmData

    return (
      <div className={styles.container}>
        {/* Company Header */}
        <div className={styles.companyHeader}>
          <span className={styles.companyName}>{companyName.replace(/\.$/, '')}</span>
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

        {/* Income Statement - جميع الـ Parameters */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Income Statement</h2>
          {income.income_statement && income.income_statement.length > 0 ? (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Item</th>
                    {showTTM && <th>TTM</th>}
                    {income.income_statement.map((item: any) => (
                      <th key={item.fiscal_date}>
                        {getPeriodDisplay(item)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className={styles.bold}>Revenues / Sales</td>
                    {showTTM && <td className={getColorClass(ttmData.sales, true)}>{formatNumber(ttmData.sales)}</td>}
                    {income.income_statement.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(item.sales, true)}>
                        {formatNumber(item.sales)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Cost of Goods Sold</td>
                    {showTTM && <td className={getColorClass(ttmData.cost_of_goods)}>{formatNumber(ttmData.cost_of_goods)}</td>}
                    {income.income_statement.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(item.cost_of_goods)}>
                        {formatNumber(item.cost_of_goods)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className={styles.bold}>Gross Profit</td>
                    {showTTM && <td className={getColorClass(ttmData.gross_profit)}>{formatNumber(ttmData.gross_profit)}</td>}
                    {income.income_statement.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(item.gross_profit)}>
                        {formatNumber(item.gross_profit)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Operating Expenses (SG&A)</td>
                    {showTTM && <td className={getColorClass(ttmData.operating_expense)}>{formatNumber(ttmData.operating_expense)}</td>}
                    {income.income_statement.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(getNestedValue(item, 'operating_expense.selling_general_and_administrative'))}>
                        {formatNumber(getNestedValue(item, 'operating_expense.selling_general_and_administrative') || 0)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className={styles.bold}>Operating Income (EBIT)</td>
                    {showTTM && <td className={getColorClass(ttmData.operating_income)}>{formatNumber(ttmData.operating_income)}</td>}
                    {income.income_statement.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(item.operating_income)}>
                        {formatNumber(item.operating_income)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Non-Operating Interest Expense</td>
                    {showTTM && <td className={getColorClass(ttmData.non_operating_interest)}>{formatNumber(ttmData.non_operating_interest)}</td>}
                    {income.income_statement.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(getNestedValue(item, 'non_operating_interest.expense'))}>
                        {formatNumber(getNestedValue(item, 'non_operating_interest.expense') || 0)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Other Income/Expense</td>
                    {showTTM && <td className={getColorClass(ttmData.other_income_expense)}>{formatNumber(ttmData.other_income_expense)}</td>}
                    {income.income_statement.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(item.other_income_expense)}>
                        {formatNumber(item.other_income_expense)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className={styles.bold}>Pretax Income</td>
                    {showTTM && <td className={getColorClass(ttmData.pretax_income)}>{formatNumber(ttmData.pretax_income)}</td>}
                    {income.income_statement.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(item.pretax_income)}>
                        {formatNumber(item.pretax_income)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Income Tax</td>
                    {showTTM && <td className={getColorClass(ttmData.income_tax)}>{formatNumber(ttmData.income_tax)}</td>}
                    {income.income_statement.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(item.income_tax)}>
                        {formatNumber(item.income_tax)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className={styles.bold}>Net Income</td>
                    {showTTM && <td className={getColorClass(ttmData.net_income)}>{formatNumber(ttmData.net_income)}</td>}
                    {income.income_statement.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(item.net_income)}>
                        {formatNumber(item.net_income)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Net Income (Continuous Operations)</td>
                    {showTTM && <td className={getColorClass(ttmData.net_income_continuous_operations)}>{formatNumber(ttmData.net_income_continuous_operations)}</td>}
                    {income.income_statement.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(item.net_income_continuous_operations)}>
                        {formatNumber(item.net_income_continuous_operations)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Minority Interests</td>
                    {showTTM && <td className={getColorClass(ttmData.minority_interests)}>{formatNumber(ttmData.minority_interests)}</td>}
                    {income.income_statement.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(item.minority_interests)}>
                        {formatNumber(item.minority_interests)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Preferred Stock Dividends</td>
                    {showTTM && <td className={getColorClass(ttmData.preferred_stock_dividends)}>{formatNumber(ttmData.preferred_stock_dividends)}</td>}
                    {income.income_statement.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(item.preferred_stock_dividends)}>
                        {formatNumber(item.preferred_stock_dividends)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className={styles.bold}>EBIT</td>
                    {showTTM && <td className={getColorClass(ttmData.ebit)}>{formatNumber(ttmData.ebit)}</td>}
                    {income.income_statement.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(item.ebit)}>
                        {formatNumber(item.ebit)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className={styles.bold}>EBITDA</td>
                    {showTTM && <td className={getColorClass(ttmData.ebitda)}>{formatNumber(ttmData.ebitda)}</td>}
                    {income.income_statement.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(item.ebitda)}>
                        {formatNumber(item.ebitda)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className={styles.bold}>Basic EPS</td>
                    {showTTM && <td className={getColorClass(ttmData.eps_basic, true)}>{formatNumber(ttmData.eps_basic)}</td>}
                    {income.income_statement.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(item.eps_basic, true)}>
                        {formatNumber(item.eps_basic)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Diluted EPS</td>
                    {showTTM && <td className={getColorClass(ttmData.eps_diluted, true)}>{formatNumber(ttmData.eps_diluted)}</td>}
                    {income.income_statement.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(item.eps_diluted, true)}>
                        {formatNumber(item.eps_diluted)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Basic Shares Outstanding</td>
                    {showTTM && <td className={getColorClass(ttmData.basic_shares_outstanding, true)}>{formatNumber(ttmData.basic_shares_outstanding)}</td>}
                    {income.income_statement.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(item.basic_shares_outstanding, true)}>
                        {formatNumber(item.basic_shares_outstanding)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Diluted Shares Outstanding</td>
                    {showTTM && <td className={getColorClass(ttmData.diluted_shares_outstanding, true)}>{formatNumber(ttmData.diluted_shares_outstanding)}</td>}
                    {income.income_statement.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(item.diluted_shares_outstanding, true)}>
                        {formatNumber(item.diluted_shares_outstanding)}
                      </td>
                    ))}
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

        {/* Balance Sheet - جميع الـ Parameters */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Balance Sheet</h2>
          {balance.balance_sheet && balance.balance_sheet.length > 0 ? (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Item</th>
                    {showTTM && <th>TTM</th>}
                    {balance.balance_sheet.map((item: any) => (
                      <th key={item.fiscal_date}>
                        {getPeriodDisplay(item)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Current Assets */}
                  <tr><td colSpan={showTTM ? balance.balance_sheet.length + 2 : balance.balance_sheet.length + 1} className={`${styles.sectionHeader} ${styles.bold}`}>Current Assets</td></tr>
                  <tr>
                    <td>Cash & Equivalents</td>
                    {showTTM && <td className={getColorClass(ttmData.cash_and_equivalents, true)}>{formatNumber(ttmData.cash_and_equivalents)}</td>}
                    {balance.balance_sheet.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(getNestedValue(item, 'assets.current_assets.cash_and_cash_equivalents'), true)}>
                        {formatNumber(getNestedValue(item, 'assets.current_assets.cash_and_cash_equivalents') || 0)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Accounts Receivable</td>
                    {showTTM && <td className={getColorClass(ttmData.accounts_receivable, true)}>{formatNumber(ttmData.accounts_receivable)}</td>}
                    {balance.balance_sheet.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(getNestedValue(item, 'assets.current_assets.accounts_receivable'), true)}>
                        {formatNumber(getNestedValue(item, 'assets.current_assets.accounts_receivable') || 0)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Inventory</td>
                    {showTTM && <td className={getColorClass(ttmData.inventory, true)}>{formatNumber(ttmData.inventory)}</td>}
                    {balance.balance_sheet.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(getNestedValue(item, 'assets.current_assets.inventory'), true)}>
                        {formatNumber(getNestedValue(item, 'assets.current_assets.inventory') || 0)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Prepaid Assets</td>
                    {showTTM && <td className={getColorClass(ttmData.prepaid_assets, true)}>{formatNumber(ttmData.prepaid_assets)}</td>}
                    {balance.balance_sheet.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(getNestedValue(item, 'assets.current_assets.prepaid_assets'), true)}>
                        {formatNumber(getNestedValue(item, 'assets.current_assets.prepaid_assets') || 0)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Other Current Assets</td>
                    {showTTM && <td className={getColorClass(ttmData.other_current_assets, true)}>{formatNumber(ttmData.other_current_assets)}</td>}
                    {balance.balance_sheet.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(getNestedValue(item, 'assets.current_assets.other_current_assets'), true)}>
                        {formatNumber(getNestedValue(item, 'assets.current_assets.other_current_assets') || 0)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className={styles.bold}>Total Current Assets</td>
                    {showTTM && <td className={getColorClass(ttmData.total_current_assets, true)}>{formatNumber(ttmData.total_current_assets)}</td>}
                    {balance.balance_sheet.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(getNestedValue(item, 'assets.current_assets.total_current_assets'), true)}>
                        {formatNumber(getNestedValue(item, 'assets.current_assets.total_current_assets') || 0)}
                      </td>
                    ))}
                  </tr>
                  
                  {/* Non-Current Assets */}
                  <tr><td colSpan={showTTM ? balance.balance_sheet.length + 2 : balance.balance_sheet.length + 1} className={`${styles.sectionHeader} ${styles.bold}`}>Non-Current Assets</td></tr>
                  <tr>
                    <td>Properties</td>
                    {showTTM && <td className={getColorClass(ttmData.properties, true)}>{formatNumber(ttmData.properties)}</td>}
                    {balance.balance_sheet.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(getNestedValue(item, 'assets.non_current_assets.properties'), true)}>
                        {formatNumber(getNestedValue(item, 'assets.non_current_assets.properties') || 0)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Machinery & Equipment</td>
                    {showTTM && <td className={getColorClass(ttmData.machinery_furniture_equipment, true)}>{formatNumber(ttmData.machinery_furniture_equipment)}</td>}
                    {balance.balance_sheet.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(getNestedValue(item, 'assets.non_current_assets.machinery_furniture_equipment'), true)}>
                        {formatNumber(getNestedValue(item, 'assets.non_current_assets.machinery_furniture_equipment') || 0)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Goodwill</td>
                    {showTTM && <td className={getColorClass(ttmData.goodwill, true)}>{formatNumber(ttmData.goodwill)}</td>}
                    {balance.balance_sheet.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(getNestedValue(item, 'assets.non_current_assets.goodwill'), true)}>
                        {formatNumber(getNestedValue(item, 'assets.non_current_assets.goodwill') || 0)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Other Non-Current Assets</td>
                    {showTTM && <td className={getColorClass(ttmData.other_non_current_assets, true)}>{formatNumber(ttmData.other_non_current_assets)}</td>}
                    {balance.balance_sheet.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(getNestedValue(item, 'assets.non_current_assets.other_non_current_assets'), true)}>
                        {formatNumber(getNestedValue(item, 'assets.non_current_assets.other_non_current_assets') || 0)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className={styles.bold}>Total Non-Current Assets</td>
                    {showTTM && <td className={getColorClass(ttmData.total_non_current_assets, true)}>{formatNumber(ttmData.total_non_current_assets)}</td>}
                    {balance.balance_sheet.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(getNestedValue(item, 'assets.non_current_assets.total_non_current_assets'), true)}>
                        {formatNumber(getNestedValue(item, 'assets.non_current_assets.total_non_current_assets') || 0)}
                      </td>
                    ))}
                  </tr>
                  
                  {/* Total Assets */}
                  <tr>
                    <td className={styles.bold}>Total Assets</td>
                    {showTTM && <td className={getColorClass(ttmData.total_assets, true)}>{formatNumber(ttmData.total_assets)}</td>}
                    {balance.balance_sheet.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(getNestedValue(item, 'assets.total_assets'), true)}>
                        {formatNumber(getNestedValue(item, 'assets.total_assets') || 0)}
                      </td>
                    ))}
                  </tr>
                  
                  {/* Current Liabilities */}
                  <tr><td colSpan={showTTM ? balance.balance_sheet.length + 2 : balance.balance_sheet.length + 1} className={`${styles.sectionHeader} ${styles.bold}`}>Current Liabilities</td></tr>
                  <tr>
                    <td>Accounts Payable</td>
                    {showTTM && <td className={getColorClass(ttmData.accounts_payable)}>{formatNumber(ttmData.accounts_payable)}</td>}
                    {balance.balance_sheet.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(getNestedValue(item, 'liabilities.current_liabilities.accounts_payable'))}>
                        {formatNumber(getNestedValue(item, 'liabilities.current_liabilities.accounts_payable') || 0)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Short-term Debt</td>
                    {showTTM && <td className={getColorClass(ttmData.short_term_debt)}>{formatNumber(ttmData.short_term_debt)}</td>}
                    {balance.balance_sheet.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(getNestedValue(item, 'liabilities.current_liabilities.short_term_debt'))}>
                        {formatNumber(getNestedValue(item, 'liabilities.current_liabilities.short_term_debt') || 0)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Deferred Revenue</td>
                    {showTTM && <td className={getColorClass(ttmData.deferred_revenue)}>{formatNumber(ttmData.deferred_revenue)}</td>}
                    {balance.balance_sheet.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(getNestedValue(item, 'liabilities.current_liabilities.deferred_revenue'))}>
                        {formatNumber(getNestedValue(item, 'liabilities.current_liabilities.deferred_revenue') || 0)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Other Current Liabilities</td>
                    {showTTM && <td className={getColorClass(ttmData.other_current_liabilities)}>{formatNumber(ttmData.other_current_liabilities)}</td>}
                    {balance.balance_sheet.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(getNestedValue(item, 'liabilities.current_liabilities.other_current_liabilities'))}>
                        {formatNumber(getNestedValue(item, 'liabilities.current_liabilities.other_current_liabilities') || 0)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className={styles.bold}>Total Current Liabilities</td>
                    {showTTM && <td className={getColorClass(ttmData.total_current_liabilities)}>{formatNumber(ttmData.total_current_liabilities)}</td>}
                    {balance.balance_sheet.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(getNestedValue(item, 'liabilities.current_liabilities.total_current_liabilities'))}>
                        {formatNumber(getNestedValue(item, 'liabilities.current_liabilities.total_current_liabilities') || 0)}
                      </td>
                    ))}
                  </tr>
                  
                  {/* Non-Current Liabilities */}
                  <tr><td colSpan={showTTM ? balance.balance_sheet.length + 2 : balance.balance_sheet.length + 1} className={`${styles.sectionHeader} ${styles.bold}`}>Non-Current Liabilities</td></tr>
                  <tr>
                    <td>Long-term Debt</td>
                    {showTTM && <td className={getColorClass(ttmData.long_term_debt)}>{formatNumber(ttmData.long_term_debt)}</td>}
                    {balance.balance_sheet.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(getNestedValue(item, 'liabilities.non_current_liabilities.long_term_debt'))}>
                        {formatNumber(getNestedValue(item, 'liabilities.non_current_liabilities.long_term_debt') || 0)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Other Non-Current Liabilities</td>
                    {showTTM && <td className={getColorClass(ttmData.other_non_current_liabilities)}>{formatNumber(ttmData.other_non_current_liabilities)}</td>}
                    {balance.balance_sheet.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(getNestedValue(item, 'liabilities.non_current_liabilities.other_non_current_liabilities'))}>
                        {formatNumber(getNestedValue(item, 'liabilities.non_current_liabilities.other_non_current_liabilities') || 0)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className={styles.bold}>Total Non-Current Liabilities</td>
                    {showTTM && <td className={getColorClass(ttmData.total_non_current_liabilities)}>{formatNumber(ttmData.total_non_current_liabilities)}</td>}
                    {balance.balance_sheet.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(getNestedValue(item, 'liabilities.non_current_liabilities.total_non_current_liabilities'))}>
                        {formatNumber(getNestedValue(item, 'liabilities.non_current_liabilities.total_non_current_liabilities') || 0)}
                      </td>
                    ))}
                  </tr>
                  
                  {/* Total Liabilities */}
                  <tr>
                    <td className={styles.bold}>Total Liabilities</td>
                    {showTTM && <td className={getColorClass(ttmData.total_liabilities)}>{formatNumber(ttmData.total_liabilities)}</td>}
                    {balance.balance_sheet.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(getNestedValue(item, 'liabilities.total_liabilities'))}>
                        {formatNumber(getNestedValue(item, 'liabilities.total_liabilities') || 0)}
                      </td>
                    ))}
                  </tr>
                  
                  {/* Shareholders Equity */}
                  <tr><td colSpan={showTTM ? balance.balance_sheet.length + 2 : balance.balance_sheet.length + 1} className={`${styles.sectionHeader} ${styles.bold}`}>Shareholders' Equity</td></tr>
                  <tr>
                    <td>Common Stock</td>
                    {showTTM && <td className={getColorClass(ttmData.common_stock, true)}>{formatNumber(ttmData.common_stock)}</td>}
                    {balance.balance_sheet.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(getNestedValue(item, 'shareholders_equity.common_stock'), true)}>
                        {formatNumber(getNestedValue(item, 'shareholders_equity.common_stock') || 0)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Retained Earnings</td>
                    {showTTM && <td className={getColorClass(ttmData.retained_earnings)}>{formatNumber(ttmData.retained_earnings)}</td>}
                    {balance.balance_sheet.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(getNestedValue(item, 'shareholders_equity.retained_earnings'))}>
                        {formatNumber(getNestedValue(item, 'shareholders_equity.retained_earnings') || 0)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Minority Interest</td>
                    {showTTM && <td className={getColorClass(ttmData.minority_interest)}>{formatNumber(ttmData.minority_interest)}</td>}
                    {balance.balance_sheet.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(getNestedValue(item, 'shareholders_equity.minority_interest'))}>
                        {formatNumber(getNestedValue(item, 'shareholders_equity.minority_interest') || 0)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className={styles.bold}>Total Shareholders Equity</td>
                    {showTTM && <td className={getColorClass(ttmData.total_shareholders_equity)}>{formatNumber(ttmData.total_shareholders_equity)}</td>}
                    {balance.balance_sheet.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(getNestedValue(item, 'shareholders_equity.total_shareholders_equity'))}>
                        {formatNumber(getNestedValue(item, 'shareholders_equity.total_shareholders_equity') || 0)}
                      </td>
                    ))}
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

        {/* Cash Flow Statement - جميع الـ Parameters */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Cash Flow Statement</h2>
          {cashflow.cash_flow && cashflow.cash_flow.length > 0 ? (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Item</th>
                    {showTTM && <th>TTM</th>}
                    {cashflow.cash_flow.map((item: any) => (
                      <th key={item.fiscal_date}>
                        {getPeriodDisplay(item)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Operating Activities */}
                  <tr><td colSpan={showTTM ? cashflow.cash_flow.length + 2 : cashflow.cash_flow.length + 1} className={`${styles.sectionHeader} ${styles.bold}`}>Operating Activities</td></tr>
                  <tr>
                    <td>Net Income</td>
                    {showTTM && <td className={getColorClass(ttmData.net_income)}>{formatNumber(ttmData.net_income)}</td>}
                    {cashflow.cash_flow.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(getNestedValue(item, 'operating_activities.net_income'))}>
                        {formatNumber(getNestedValue(item, 'operating_activities.net_income') || 0)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Depreciation</td>
                    {showTTM && <td className={getColorClass(ttmData.depreciation, true)}>{formatNumber(ttmData.depreciation)}</td>}
                    {cashflow.cash_flow.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(getNestedValue(item, 'operating_activities.depreciation'), true)}>
                        {formatNumber(getNestedValue(item, 'operating_activities.depreciation') || 0)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Stock-Based Compensation</td>
                    {showTTM && <td className={getColorClass(ttmData.stock_based_compensation, true)}>{formatNumber(ttmData.stock_based_compensation)}</td>}
                    {cashflow.cash_flow.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(getNestedValue(item, 'operating_activities.stock_based_compensation'), true)}>
                        {formatNumber(getNestedValue(item, 'operating_activities.stock_based_compensation') || 0)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Accounts Receivable Change</td>
                    {showTTM && <td className={getColorClass(ttmData.accounts_receivable_change)}>{formatNumber(ttmData.accounts_receivable_change)}</td>}
                    {cashflow.cash_flow.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(getNestedValue(item, 'operating_activities.accounts_receivable'))}>
                        {formatNumber(getNestedValue(item, 'operating_activities.accounts_receivable') || 0)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Accounts Payable Change</td>
                    {showTTM && <td className={getColorClass(ttmData.accounts_payable_change)}>{formatNumber(ttmData.accounts_payable_change)}</td>}
                    {cashflow.cash_flow.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(getNestedValue(item, 'operating_activities.accounts_payable'))}>
                        {formatNumber(getNestedValue(item, 'operating_activities.accounts_payable') || 0)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className={styles.bold}>Operating Cash Flow</td>
                    {showTTM && <td className={getColorClass(ttmData.operating_cash_flow)}>{formatNumber(ttmData.operating_cash_flow)}</td>}
                    {cashflow.cash_flow.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(getNestedValue(item, 'operating_activities.operating_cash_flow'))}>
                        {formatNumber(getNestedValue(item, 'operating_activities.operating_cash_flow') || 0)}
                      </td>
                    ))}
                  </tr>
                  
                  {/* Investing Activities */}
                  <tr><td colSpan={showTTM ? cashflow.cash_flow.length + 2 : cashflow.cash_flow.length + 1} className={`${styles.sectionHeader} ${styles.bold}`}>Investing Activities</td></tr>
                  <tr>
                    <td>Capital Expenditures</td>
                    {showTTM && <td className={getColorClass(ttmData.capital_expenditures)}>{formatNumber(ttmData.capital_expenditures)}</td>}
                    {cashflow.cash_flow.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(getNestedValue(item, 'investing_activities.capital_expenditures'))}>
                        {formatNumber(getNestedValue(item, 'investing_activities.capital_expenditures') || 0)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Net Acquisitions</td>
                    {showTTM && <td className={getColorClass(ttmData.net_acquisitions)}>{formatNumber(ttmData.net_acquisitions)}</td>}
                    {cashflow.cash_flow.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(getNestedValue(item, 'investing_activities.net_acquisitions'))}>
                        {formatNumber(getNestedValue(item, 'investing_activities.net_acquisitions') || 0)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className={styles.bold}>Investing Cash Flow</td>
                    {showTTM && <td className={getColorClass(ttmData.investing_cash_flow)}>{formatNumber(ttmData.investing_cash_flow)}</td>}
                    {cashflow.cash_flow.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(getNestedValue(item, 'investing_activities.investing_cash_flow'))}>
                        {formatNumber(getNestedValue(item, 'investing_activities.investing_cash_flow') || 0)}
                      </td>
                    ))}
                  </tr>
                  
                  {/* Financing Activities */}
                  <tr><td colSpan={showTTM ? cashflow.cash_flow.length + 2 : cashflow.cash_flow.length + 1} className={`${styles.sectionHeader} ${styles.bold}`}>Financing Activities</td></tr>
                  <tr>
                    <td className={styles.bold}>Financing Cash Flow</td>
                    {showTTM && <td className={getColorClass(ttmData.financing_cash_flow)}>{formatNumber(ttmData.financing_cash_flow)}</td>}
                    {cashflow.cash_flow.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(getNestedValue(item, 'financing_activities.financing_cash_flow'))}>
                        {formatNumber(getNestedValue(item, 'financing_activities.financing_cash_flow') || 0)}
                      </td>
                    ))}
                  </tr>
                  
                  {/* Net Change & End Position */}
                  <tr><td colSpan={showTTM ? cashflow.cash_flow.length + 2 : cashflow.cash_flow.length + 1} className={`${styles.sectionHeader} ${styles.bold}`}>Summary</td></tr>
                  <tr>
                    <td className={styles.bold}>Net Change in Cash</td>
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
                    {cashflow.cash_flow.map((item: any) => {
                      const netChange = 
                        (getNestedValue(item, 'operating_activities.operating_cash_flow') || 0) +
                        (getNestedValue(item, 'investing_activities.investing_cash_flow') || 0) +
                        (getNestedValue(item, 'financing_activities.financing_cash_flow') || 0);
                      return (
                        <td key={item.fiscal_date} className={getColorClass(netChange)}>
                          {formatNumber(netChange)}
                        </td>
                      );
                    })}
                  </tr>
                  <tr>
                    <td className={styles.bold}>Free Cash Flow</td>
                    {showTTM && <td className={getColorClass(ttmData.free_cash_flow)}>{formatNumber(ttmData.free_cash_flow)}</td>}
                    {cashflow.cash_flow.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(item.free_cash_flow)}>
                        {formatNumber(item.free_cash_flow || 0)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>End Cash Position</td>
                    {showTTM && <td className={getColorClass(ttmData.end_cash_position, true)}>{formatNumber(ttmData.end_cash_position)}</td>}
                    {cashflow.cash_flow.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(item.end_cash_position, true)}>
                        {formatNumber(item.end_cash_position || 0)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Income Tax Paid</td>
                    {showTTM && <td className={getColorClass(ttmData.income_tax_paid)}>{formatNumber(ttmData.income_tax_paid)}</td>}
                    {cashflow.cash_flow.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(item.income_tax_paid)}>
                        {formatNumber(item.income_tax_paid || 0)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Interest Paid</td>
                    {showTTM && <td className={getColorClass(ttmData.interest_paid)}>{formatNumber(ttmData.interest_paid)}</td>}
                    {cashflow.cash_flow.map((item: any) => (
                      <td key={item.fiscal_date} className={getColorClass(item.interest_paid)}>
                        {formatNumber(item.interest_paid || 0)}
                      </td>
                    ))}
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
//     fetch(`http://localhost:8000/financials/income_statement/${cleanSym}?country=${country}&period=${period}&limit=6`, { cache: 'no-store' }),
//     fetch(`http://localhost:8000/financials/balance_sheet/${cleanSym}?country=${country}&period=${period}&limit=6`, { cache: 'no-store' }),
//     fetch(`http://localhost:8000/financials/cash_flow/${cleanSym}?country=${country}&period=${period}&limit=6`, { cache: 'no-store' })
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