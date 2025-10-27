import Link from 'next/link'

import { FinancialHeader } from '../../../../components/FinancialHeader'

function cleanSymbol(symbol: string): string {
  return symbol.split('.')[0]
}

// دالة محسنة لجلب البيانات المالية مع اختيار الفترة
async function getFinancialData(symbol: string, period: string = "annual") {
  const cleanSym = cleanSymbol(symbol)
  
  console.log(`💰 جلب البيانات المالية لـ ${symbol} - الفترة: ${period}`)
  
  const [incomeRes, balanceRes, cashflowRes] = await Promise.all([
    fetch(`https://lumivst-frontend.vercel.app/financials/income_statement/${cleanSym}?period=${period}&limit=6`),
    fetch(`https://lumivst-frontend.vercel.app/financials/balance_sheet/${cleanSym}?period=${period}&limit=6`),
    fetch(`https://lumivst-frontend.vercel.app/financials/cash_flow/${cleanSym}?period=${period}&limit=6`)
  ])

  // Check if responses are ok
  if (!incomeRes.ok) throw new Error('Failed to fetch income statement')
  if (!balanceRes.ok) throw new Error('Failed to fetch balance sheet')
  if (!cashflowRes.ok) throw new Error('Failed to fetch cash flow')

  const income = await incomeRes.json()
  const balance = await balanceRes.json()
  const cashflow = await cashflowRes.json()

  return { income, balance, cashflow, period }
}

function formatNumber(num: number): string {
  if (!num && num !== 0) return 'N/A'
  
  // عرض الرقم كما هو مع إضافة فواصل الآلاف
  return num.toLocaleString('en-US', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  })
}

// دالة لعرض اسم الفترة بشكل جميل
function getPeriodDisplay(item: any) {
  if (!item) return 'N/A'
  if (item.quarter) {
    return `Q${item.quarter} ${item.year}`
  }
  return item.fiscal_date || item.year || 'N/A'
}

// مكون لاختيار الفترة (رجعناها)
function PeriodSelector({ currentPeriod, symbol }: { currentPeriod: string, symbol: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-700">الفترة:</span>
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
        <Link 
          href={`/stocks/${symbol}/financials?period=annual`}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            currentPeriod === 'annual' 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-700 hover:bg-gray-200'
          }`}
        >
          سنوي
        </Link>
        <Link 
          href={`/stocks/${symbol}/financials?period=quarterly`}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
            currentPeriod === 'quarterly' 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-700 hover:bg-gray-200'
          }`}
        >
          ربع سنوي
        </Link>
      </div>
    </div>
  )
}

// دالة لاستخراج البارامترات من الـ URL
function getSearchParams(searchParams: any) {
  return {
    period: searchParams.period === 'quarterly' ? 'quarterly' : 'annual'
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
  const { period } = getSearchParams(resolvedSearchParams)
  
  const cleanSym = cleanSymbol(symbol)

  try {
    const { income, balance, cashflow } = await getFinancialData(symbol, period)

    return (
      <div>
        <main className="container">
          {/* Header */}
          <div className="card mt-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold">{income.meta?.name || symbol}</h1>
                <p className="text-muted text-lg">{symbol} </p>
                {/* <p className="text-muted text-lg">{symbol} • القوائم المالية</p> */}

              </div>
              {/* <div className="text-right">
                <div className="text-lg font-semibold">{income.meta?.currency || 'SAR'}</div>
                <div className="text-muted text-sm">
                  فترة: {income.meta?.period === 'Quarterly' ? 'ربع سنوي' : 'سنوي'}
                </div>
              </div> */}
            </div>
          </div>

          {/* Combined Card for Period Selector and Navigation Tabs */}
          <FinancialHeader symbol={symbol} period={period}  page="financials"/>

          {/* Income Statement */}
          <div className="card mt-6">
            <h2 className="card-title">قائمة الدخل</h2>
            {income.income_statement && income.income_statement.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>البند</th>
                      {income.income_statement.map((item: any) => (
                        <th key={item.fiscal_date} className="text-center">
                          {getPeriodDisplay(item)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="font-semibold">الإيرادات</td>
                      {income.income_statement.map((item: any) => (
                        <td key={item.fiscal_date} className="text-center">
                          {formatNumber(item.sales)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="font-semibold">تكلفة البضاعة المباعة</td>
                      {income.income_statement.map((item: any) => (
                        <td key={item.fiscal_date} className="text-center">
                          {formatNumber(item.cost_of_goods)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="font-semibold">إجمالي الربح</td>
                      {income.income_statement.map((item: any) => (
                        <td key={item.fiscal_date} className="text-center text-positive">
                          {formatNumber(item.gross_profit)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="font-semibold">المصاريف التشغيلية</td>
                      {income.income_statement.map((item: any) => (
                        <td key={item.fiscal_date} className="text-center">
                          {formatNumber(item.operating_expense?.selling_general_and_administrative || 0)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="font-semibold">الدخل التشغيلي</td>
                      {income.income_statement.map((item: any) => (
                        <td key={item.fiscal_date} className="text-center text-positive">
                          {formatNumber(item.operating_income)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="font-semibold">صافي الدخل</td>
                      {income.income_statement.map((item: any) => (
                        <td key={item.fiscal_date} className="text-center text-positive font-semibold">
                          {formatNumber(item.net_income)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="font-semibold">EPS (أساسي)</td>
                      {income.income_statement.map((item: any) => (
                        <td key={item.fiscal_date} className="text-center">
                          {item.eps_basic || 'N/A'}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="font-semibold">EBITDA</td>
                      {income.income_statement.map((item: any) => (
                        <td key={item.fiscal_date} className="text-center text-positive">
                          {formatNumber(item.ebitda)}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted">
                لا توجد بيانات قائمة الدخل متاحة
              </div>
            )}
          </div>

          {/* Balance Sheet */}
          <div className="card mt-6">
            <h2 className="card-title">الميزانية العمومية</h2>
            {balance.balance_sheet && balance.balance_sheet.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>البند</th>
                      {balance.balance_sheet.map((item: any) => (
                        <th key={item.fiscal_date} className="text-center">
                          {getPeriodDisplay(item)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="font-semibold">النقد وما يعادله</td>
                      {balance.balance_sheet.map((item: any) => (
                        <td key={item.fiscal_date} className="text-center">
                          {formatNumber(item.assets?.current_assets?.cash_and_cash_equivalents || 0)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="font-semibold">المخزون</td>
                      {balance.balance_sheet.map((item: any) => (
                        <td key={item.fiscal_date} className="text-center">
                          {formatNumber(item.assets?.current_assets?.inventory || 0)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="font-semibold">إجمالي الأصول المتداولة</td>
                      {balance.balance_sheet.map((item: any) => (
                        <td key={item.fiscal_date} className="text-center text-positive">
                          {formatNumber(item.assets?.current_assets?.total_current_assets || 0)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="font-semibold">إجمالي الأصول غير المتداولة</td>
                      {balance.balance_sheet.map((item: any) => (
                        <td key={item.fiscal_date} className="text-center">
                          {formatNumber(item.assets?.non_current_assets?.total_non_current_assets || 0)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="font-semibold">إجمالي الأصول</td>
                      {balance.balance_sheet.map((item: any) => (
                        <td key={item.fiscal_date} className="text-center text-positive font-semibold">
                          {formatNumber(item.assets?.total_assets || 0)}
                        </td>
                      ))}
                    </tr>
                    
                    <tr className="border-t-2">
                      <td className="font-semibold">الديون قصيرة الأجل</td>
                      {balance.balance_sheet.map((item: any) => (
                        <td key={item.fiscal_date} className="text-center">
                          {formatNumber(item.liabilities?.current_liabilities?.short_term_debt || 0)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="font-semibold">إجمالي المطلوبات المتداولة</td>
                      {balance.balance_sheet.map((item: any) => (
                        <td key={item.fiscal_date} className="text-center">
                          {formatNumber(item.liabilities?.current_liabilities?.total_current_liabilities || 0)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="font-semibold">الديون طويلة الأجل</td>
                      {balance.balance_sheet.map((item: any) => (
                        <td key={item.fiscal_date} className="text-center">
                          {formatNumber(item.liabilities?.non_current_liabilities?.long_term_debt || 0)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="font-semibold">إجمالي المطلوبات</td>
                      {balance.balance_sheet.map((item: any) => (
                        <td key={item.fiscal_date} className="text-center font-semibold">
                          {formatNumber(item.liabilities?.total_liabilities || 0)}
                        </td>
                      ))}
                    </tr>
                    
                    <tr className="border-t-2">
                      <td className="font-semibold">حقوق المساهمين</td>
                      {balance.balance_sheet.map((item: any) => (
                        <td key={item.fiscal_date} className="text-center text-positive font-semibold">
                          {formatNumber(item.shareholders_equity?.total_shareholders_equity || 0)}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted">
                لا توجد بيانات ميزانية عمومية متاحة
              </div>
            )}
          </div>

          {/* Cash Flow */}
          <div className="card mt-6">
            <h2 className="card-title">قائمة التدفقات النقدية</h2>
            {cashflow.cash_flow && cashflow.cash_flow.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>البند</th>
                      {cashflow.cash_flow.map((item: any) => (
                        <th key={item.fiscal_date} className="text-center">
                          {getPeriodDisplay(item)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="font-semibold">التدفق النقدي من التشغيل</td>
                      {cashflow.cash_flow.map((item: any) => (
                        <td key={item.fiscal_date} className="text-center text-positive">
                          {formatNumber(item.operating_activities?.operating_cash_flow || 0)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="font-semibold">التدفق النقدي من الاستثمار</td>
                      {cashflow.cash_flow.map((item: any) => (
                        <td key={item.fiscal_date} className="text-center text-negative">
                          {formatNumber(item.investing_activities?.investing_cash_flow || 0)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="font-semibold">التدفق النقدي من التمويل</td>
                      {cashflow.cash_flow.map((item: any) => (
                        <td key={item.fiscal_date} className="text-center">
                          {formatNumber(item.financing_activities?.financing_cash_flow || 0)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="font-semibold">صافي التغير في النقد</td>
                      {cashflow.cash_flow.map((item: any) => {
                        const netChange = 
                          (item.operating_activities?.operating_cash_flow || 0) +
                          (item.investing_activities?.investing_cash_flow || 0) +
                          (item.financing_activities?.financing_cash_flow || 0)
                        return (
                          <td key={item.fiscal_date} className="text-center font-semibold">
                            {formatNumber(netChange)}
                          </td>
                        )
                      })}
                    </tr>
                    <tr>
                      <td className="font-semibold">التدفق النقدي الحر</td>
                      {cashflow.cash_flow.map((item: any) => (
                        <td key={item.fiscal_date} className="text-center text-positive">
                          {formatNumber(item.free_cash_flow || 0)}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted">
                لا توجد بيانات تدفقات نقدية متاحة
              </div>
            )}
          </div>
        </main>
      </div>
    )
  } catch (error) {
    console.error('Error loading financial data:', error)
    return (
      <div>
        <main className="container">
          <div className="card mt-6 text-center py-8">
            <div className="text-muted">حدث خطأ في تحميل البيانات المالية</div>
            <div className="text-sm text-muted mt-2">
              يرجى المحاولة مرة أخرى لاحقاً
            </div>
          </div>
        </main>
      </div>
    )
  }
}






// لو عاوز الاحرف
// function formatNumber(num: number): string {
//   if (!num) return '0'
//   if (num >= 1000000000) {
//     return (num / 1000000000).toFixed(2) + 'B'
//   }
//   if (num >= 1000000) {
//     return (num / 1000000).toFixed(2) + 'M'
//   }
//   if (num >= 1000) {
//     return (num / 1000).toFixed(2) + 'K'
//   }
//   return num.toString()
// }

// // دالة لعرض اسم الفترة بشكل جميل
// function getPeriodDisplay(item: any) {
//   if (!item) return 'N/A'
//   if (item.quarter) {
//     return `Q${item.quarter} ${item.year}`
//   }
//   return item.fiscal_date || item.year || 'N/A'
// }