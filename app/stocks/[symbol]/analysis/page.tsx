import Link from 'next/link'


function cleanSymbol(symbol: string): string {
  return symbol.split('.')[0]
}

async function getAnalysisData(symbol: string) {
  const cleanSym = cleanSymbol(symbol)
  const [incomeRes, balanceRes] = await Promise.all([
    fetch(`http://localhost:8000/financials/income_statement?symbol=${symbol}`),
    fetch(`http://localhost:8000/financials/balance_sheet?symbol=${symbol}`)
  ])

  const income = await incomeRes.json()
  const balance = await balanceRes.json()

  return { income, balance }
}

function calculateRatios(income: any, balance: any) {
  const latestIncome = income.income_statement?.[0]
  const prevIncome = income.income_statement?.[1]
  const latestBalance = balance.balance_sheet?.[0]
  const prevBalance = balance.balance_sheet?.[1]

  if (!latestIncome || !latestBalance) {
    return null
  }

  // نسب الربحية
  const grossMargin = latestIncome ? (latestIncome.gross_profit / latestIncome.sales) * 100 : 0
  const netMargin = latestIncome ? (latestIncome.net_income / latestIncome.sales) * 100 : 0
  const operatingMargin = latestIncome ? (latestIncome.operating_income / latestIncome.sales) * 100 : 0

  // نسب السيولة
  const currentAssets = latestBalance?.assets?.current_assets?.total_current_assets || 0
  const currentLiabilities = latestBalance?.liabilities?.current_liabilities?.total_current_liabilities || 0
  const currentRatio = currentLiabilities > 0 ? currentAssets / currentLiabilities : 0

  const cash = latestBalance?.assets?.current_assets?.cash_and_cash_equivalents || 0
  const quickRatio = currentLiabilities > 0 ? (currentAssets - (latestBalance?.assets?.current_assets?.inventory || 0)) / currentLiabilities : 0

  // نسب المديونية
  const totalDebt = (latestBalance?.liabilities?.current_liabilities?.short_term_debt || 0) + 
                   (latestBalance?.liabilities?.non_current_liabilities?.long_term_debt || 0)
  const totalEquity = latestBalance?.shareholders_equity?.total_shareholders_equity || 0
  const debtToEquity = totalEquity > 0 ? totalDebt / totalEquity : 0

  const totalAssets = latestBalance?.assets?.total_assets || 0
  const debtToAssets = totalAssets > 0 ? totalDebt / totalAssets : 0

  // نسب الكفاءة
  const prevTotalAssets = prevBalance?.assets?.total_assets || totalAssets
  const avgTotalAssets = (totalAssets + prevTotalAssets) / 2
  const assetTurnover = avgTotalAssets > 0 ? latestIncome.sales / avgTotalAssets : 0

  // العوائد
  const prevTotalEquity = prevBalance?.shareholders_equity?.total_shareholders_equity || totalEquity
  const avgEquity = (totalEquity + prevTotalEquity) / 2
  const roe = avgEquity > 0 ? (latestIncome.net_income / avgEquity) * 100 : 0

  const ebit = latestIncome.ebit || 0
  const roa = avgTotalAssets > 0 ? (ebit / avgTotalAssets) * 100 : 0

  // النمو
  const revenueGrowth = prevIncome ? ((latestIncome.sales - prevIncome.sales) / prevIncome.sales) * 100 : 0
  const netIncomeGrowth = prevIncome ? ((latestIncome.net_income - prevIncome.net_income) / prevIncome.net_income) * 100 : 0

  return {
    profitability: {
      grossMargin,
      netMargin,
      operatingMargin
    },
    liquidity: {
      currentRatio,
      quickRatio
    },
    leverage: {
      debtToEquity,
      debtToAssets
    },
    efficiency: {
      assetTurnover
    },
    returns: {
      roe,
      roa
    },
    growth: {
      revenueGrowth,
      netIncomeGrowth
    }
  }
}

export default async function AnalysisPage({ 
  params 
}: { 
  params: Promise<{ symbol: string }>
}) {
  const { symbol } = await params
  const cleanSym = cleanSymbol(symbol)
  const { income, balance } = await getAnalysisData(symbol)
  const ratios = calculateRatios(income, balance)

  if (!ratios) {
    return (
      <div>
        <main className="container">
          <div className="card mt-6 text-center py-8">
            <div className="text-muted">لا توجد بيانات كافية للتحليل</div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div>
      <nav className="navbar">
        <div className="container nav-content">
          <div className="logo">سهم Invest</div>
          <div className="nav-links">
            <Link href="/">الرئيسية</Link>
            <Link href="/stocks">الأسهم</Link>
            <Link href="/compare">مقارنة</Link>
            <Link href="/portfolio">المحفظة</Link>
          </div>
        </div>
      </nav>

      <main className="container">
        {/* Header */}
        <div className="card mt-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">{income.meta?.name}</h1>
              <p className="text-muted text-lg">{symbol} • التحليل المالي</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold">{income.meta?.currency}</div>
              <div className="text-muted text-sm">أحدث بيانات: {income.income_statement?.[0]?.year}</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="card mt-4">
          <div className="flex gap-4 border-b">
            <Link 
              href={`/stocks/${symbol}`}
              className="pb-2 px-1 text-muted hover:text-gray-700"
            >
              النظرة العامة
            </Link>
            <Link 
              href={`/stocks/${symbol}/financials`}
              className="pb-2 px-1 text-muted hover:text-gray-700"
            >
              القوائم المالية
            </Link>
            <Link 
              href={`/stocks/${symbol}/analysis`}
              className="pb-2 px-1 border-b-2 border-blue-500 font-semibold"
            >
              التحليل
            </Link>
          </div>
        </div>

        {/* Key Ratios */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* نسب الربحية */}
          <div className="card">
            <h3 className="card-title">نسب الربحية</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted">هامش الربح الإجمالي</span>
                <span className="font-semibold text-positive">
                  {ratios.profitability.grossMargin.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted">هامش الربح التشغيلي</span>
                <span className="font-semibold text-positive">
                  {ratios.profitability.operatingMargin.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted">هامش الربح الصافي</span>
                <span className="font-semibold text-positive">
                  {ratios.profitability.netMargin.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          {/* نسب السيولة */}
          <div className="card">
            <h3 className="card-title">نسب السيولة</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted">النسبة المتداولة</span>
                <span className={`font-semibold ${
                  ratios.liquidity.currentRatio > 1.5 ? 'text-positive' : 
                  ratios.liquidity.currentRatio > 1 ? 'text-yellow-500' : 'text-negative'
                }`}>
                  {ratios.liquidity.currentRatio.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted">النسبة السريعة</span>
                <span className={`font-semibold ${
                  ratios.liquidity.quickRatio > 1 ? 'text-positive' : 
                  ratios.liquidity.quickRatio > 0.5 ? 'text-yellow-500' : 'text-negative'
                }`}>
                  {ratios.liquidity.quickRatio.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* نسب المديونية */}
          <div className="card">
            <h3 className="card-title">نسب المديونية</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted">الديون إلى حقوق الملكية</span>
                <span className={`font-semibold ${
                  ratios.leverage.debtToEquity < 1 ? 'text-positive' : 
                  ratios.leverage.debtToEquity < 2 ? 'text-yellow-500' : 'text-negative'
                }`}>
                  {ratios.leverage.debtToEquity.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted">الديون إلى الأصول</span>
                <span className={`font-semibold ${
                  ratios.leverage.debtToAssets < 0.5 ? 'text-positive' : 
                  ratios.leverage.debtToAssets < 0.7 ? 'text-yellow-500' : 'text-negative'
                }`}>
                  {(ratios.leverage.debtToAssets * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* نسب العوائد */}
          <div className="card">
            <h3 className="card-title">نسب العوائد</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted">العائد على حقوق المساهمين (ROE)</span>
                <span className={`font-semibold ${
                  ratios.returns.roe > 15 ? 'text-positive' : 
                  ratios.returns.roe > 8 ? 'text-yellow-500' : 'text-negative'
                }`}>
                  {ratios.returns.roe.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted">العائد على الأصول (ROA)</span>
                <span className={`font-semibold ${
                  ratios.returns.roa > 5 ? 'text-positive' : 
                  ratios.returns.roa > 2 ? 'text-yellow-500' : 'text-negative'
                }`}>
                  {ratios.returns.roa.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          {/* نسب النمو */}
          <div className="card">
            <h3 className="card-title">مؤشرات النمو</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted">نمو الإيرادات</span>
                <span className={`font-semibold ${
                  ratios.growth.revenueGrowth > 10 ? 'text-positive' : 
                  ratios.growth.revenueGrowth > 0 ? 'text-yellow-500' : 'text-negative'
                }`}>
                  {ratios.growth.revenueGrowth.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted">نمو صافي الدخل</span>
                <span className={`font-semibold ${
                  ratios.growth.netIncomeGrowth > 10 ? 'text-positive' : 
                  ratios.growth.netIncomeGrowth > 0 ? 'text-yellow-500' : 'text-negative'
                }`}>
                  {ratios.growth.netIncomeGrowth.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>

          {/* نسب الكفاءة */}
          <div className="card">
            <h3 className="card-title">نسب الكفاءة</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted">دوران الأصول</span>
                <span className={`font-semibold ${
                  ratios.efficiency.assetTurnover > 0.5 ? 'text-positive' : 
                  ratios.efficiency.assetTurnover > 0.2 ? 'text-yellow-500' : 'text-negative'
                }`}>
                  {ratios.efficiency.assetTurnover.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Health Assessment */}
        <div className="card mt-6">
          <h3 className="card-title">التقييم الصحي للشركة</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl mb-2">💰</div>
              <div className="font-semibold text-positive">ربحية جيدة</div>
              <div className="text-sm text-muted mt-1">
                هوامش ربح مستقرة ونمو إيجابي
              </div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl mb-2">⚖️</div>
              <div className="font-semibold text-yellow-600">مديونية متوسطة</div>
              <div className="text-sm text-muted mt-1">
                مستوى مديونية مقبول يحتاج للمراقبة
              </div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl mb-2">📈</div>
              <div className="font-semibold text-blue-600">سيولة كافية</div>
              <div className="text-sm text-muted mt-1">
                مقدرة جيدة على الوفاء بالالتزامات
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}