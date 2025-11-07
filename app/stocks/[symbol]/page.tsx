import Link from 'next/link'

import { FinancialHeader } from '../../../components/FinancialHeader'



// دالة محسنة لتنظيف الرموز - تتعامل مع جميع الحالات
function cleanSymbol(symbol: string): string {
  if (!symbol) return '';
  
  // إذا كان الرمز يحتوي على نقطة، نأخذ الجزء قبل النقطة
  if (symbol.includes('.')) {
    return symbol.split('.')[0].toUpperCase().trim();
  }
  
  // إذا كان الرمز يحتوي على حروف بعد الأرقام (مثل 1120SABE)، نأخذ الأرقام فقط
  const match = symbol.match(/^\d+/);
  if (match) {
    return match[0]; // يرجع فقط الأرقام من البداية
  }
  
  // إذا لم يكن هناك أرقام في البداية، نرجع الرمز كما هو
  return symbol.toUpperCase().trim();
}

// دالة محسنة لجلب جميع الأسهم مع إزالة التكرار من الخادم
async function getAllStocks() {
  console.log('🔍 جلب جميع الأسهم من جميع الصفحات...')
  
  let allStocks: any[] = []
  let currentPage = 1
  
  try {
    while (true) {
      console.log(`📄 جلب الصفحة ${currentPage}...`)
      // إضافة remove_duplicates=true لتفعيل التصفية من الخادم
      const response = await fetch(`http://lumivst-frontend-v2-git-main-youssefs-projects-c6c3030a.vercel.app/stocks?page=${currentPage}&limit=100&remove_duplicates=true`, {
        cache: 'no-store'
      })
      
      if (!response.ok) {
        console.warn(`⚠️ فشل جلب الصفحة ${currentPage}: ${response.status}`)
        break
      }
      
      const data = await response.json()
      
      if (!data.data || data.data.length === 0) {
        console.log('✅ لا توجد بيانات في هذه الصفحة')
        break
      }
      
      // إضافة البيانات للقائمة (البيانات ستكون مصفاة من الخادم)
      allStocks = [...allStocks, ...data.data]
      
      // استخدام معلومات الـ pagination من الـ backend
      if (data.pagination) {
        const hasNext = data.pagination.has_next
        
        console.log(`📊 الصفحة ${currentPage}: ${data.data.length} سهم - المجموع: ${allStocks.length} - الصفحة التالية: ${hasNext}`)
        
        // إذا مافيش صفحة تالية، نوقف
        if (!hasNext) {
          console.log('✅ وصلنا لآخر صفحة')
          break
        }
      } else {
        console.log(`📊 الصفحة ${currentPage}: ${data.data.length} سهم - المجموع: ${allStocks.length}`)
        // إذا مفيش pagination data، نتوقف بعد الصفحة الأولى
        break
      }
      
      currentPage++
      
      // حد أقصى للسلامة
      if (currentPage > 50) {
        console.log('⚠️ وصل للحد الأقصى من الصفحات')
        break
      }
    }
    
    console.log(`🎯 تم جلب ${allStocks.length} سهم من ${currentPage - 1} صفحة (مصفاة من الخادم)`)
    return allStocks;
  } catch (error) {
    console.error('❌ خطأ في جلب جميع الأسهم:', error)
    return []
  }
}

// دالة محسنة لجلب البيانات المالية مع اختيار الفترة
// دالة محسنة لجلب البيانات المالية مع اختيار الفترة والبلد
async function getStockData(symbol: string, period: string = "annual", country: string = "Saudi Arabia") {
  const cleanSym = cleanSymbol(symbol)
  
  console.log('🔍 Frontend - Fetching data for symbol:', symbol, 'Clean:', cleanSym, 'Period:', period, 'Country:', country)

  try {
    // استخدم الـ endpoint الجديد للبحث المباشر مع البلد
    let stock = null
    
    try {
      const directRes = await fetch(`http://localhost:8000/stocks/${cleanSym}?country=${encodeURIComponent(country)}`, {
        cache: 'no-store'
      })
      
      if (directRes.ok) {
        stock = await directRes.json()
        console.log('✅ تم العثور على الشركة عبر البحث المباشر:', stock.name)
      } else if (directRes.status === 404) {
        console.log('⚠️ الشركة غير موجودة في البحث المباشر')
      }
    } catch (directError) {
      console.log('⚠️ البحث المباشر فشل:', directError)
    }
    
    // جلب البيانات المالية مع الفترة المحددة والبلد - 6 فترات
    console.log(`💰 جلب البيانات المالية لـ 6 ${period === 'annual' ? 'سنوات' : 'أرباع'} في ${country}...`)
    const [incomeRes, balanceRes, cashflowRes] = await Promise.all([
      fetch(`http://localhost:8000/financials/income_statement/${cleanSym}?country=${encodeURIComponent(country)}&period=${period}&limit=6`),
      fetch(`http://localhost:8000/financials/balance_sheet/${cleanSym}?country=${encodeURIComponent(country)}&period=${period}&limit=6`),
      fetch(`http://localhost:8000/financials/cash_flow/${cleanSym}?country=${encodeURIComponent(country)}&period=${period}&limit=6`)
    ])

    // تحقق من الردود
    console.log('📊 حالة الردود:', {
      income: incomeRes.status,
      balance: balanceRes.status, 
      cashflow: cashflowRes.status,
      period: period,
      country: country
    })

    const income = incomeRes.ok ? await incomeRes.json() : {}
    const balance = balanceRes.ok ? await balanceRes.json() : {}
    const cashflow = cashflowRes.ok ? await cashflowRes.json() : {}
    
    console.log('✅ Frontend - Financial data loaded:')
    console.log('   Income periods:', income.income_statement?.length || 0)
    console.log('   Balance periods:', balance.balance_sheet?.length || 0)
    console.log('   Cashflow periods:', cashflow.cash_flow?.length || 0)
    console.log('   Period type:', income.meta?.period || 'N/A')
    console.log('   Country:', country)

    // إذا مفيش بيانات شركة لكن في بيانات مالية، استخدم البيانات من القوائم المالية
    if (!stock && income.meta) {
      console.log('🔄 استخدام البيانات من القوائم المالية')
      stock = {
        symbol: cleanSym,
        name: income.meta.name || 'Unknown',
        currency: income.meta.currency || 'USD',
        exchange: income.meta.exchange || 'Unknown',
        type: 'Common Stock',
        country: country
      }
    }

    return { stock, income, balance, cashflow, period, country }
  } catch (error) {
    console.error('❌ Frontend - Error fetching data:', error)
    return { stock: null, income: {}, balance: {}, cashflow: {}, period: 'annual', country: country }
  }
}

// مكون لاختيار الفترة
// مكون لاختيار الفترة
function PeriodSelector({ currentPeriod, symbol, country }: { currentPeriod: string, symbol: string, country: string }) {
  return (
    <div className="flex gap-2 items-center bg-gray-100 p-2 rounded-lg">
      <span className="text-sm font-medium text-gray-700">الفترة:</span>
      <Link 
        href={`/stocks/${symbol}?period=annual&country=${encodeURIComponent(country)}`}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          currentPeriod === 'annual' 
            ? 'bg-blue-600 text-white' 
            : 'bg-white text-gray-700 hover:bg-gray-200'
        }`}
      >
        سنوي
      </Link>
      <Link 
        href={`/stocks/${symbol}?period=quarterly&country=${encodeURIComponent(country)}`}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
          currentPeriod === 'quarterly' 
            ? 'bg-blue-600 text-white' 
            : 'bg-white text-gray-700 hover:bg-gray-200'
        }`}
      >
        ربع سنوي
      </Link>
    </div>
  )
}

// دالة لاستخراج البارامترات من الـ URL
function getSearchParams(searchParams: any) {
  return {
    period: searchParams.period === 'quarterly' ? 'quarterly' : 'annual',
    country: searchParams.country || 'Saudi Arabia' // ⭐ إضافة البلد
  }
}

export default async function StockDetailPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ symbol: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { symbol } = await params
  const resolvedSearchParams = await searchParams
  const { period, country } = getSearchParams(resolvedSearchParams) // ⭐ إضافة country
  
  console.log('🚀 Frontend - Page loaded with symbol:', symbol, 'Period:', period, 'Country:', country)
  
  const { stock, income, balance, cashflow } = await getStockData(symbol, period, country) // ⭐ إضافة country


  console.log('🎯 Frontend - After fetching:')
  console.log('   Stock:', stock)
  console.log('   Income available:', !!income.income_statement)
  console.log('   Balance available:', !!balance.balance_sheet)
  console.log('   Cashflow available:', !!cashflow.cash_flow)
  console.log('   Period type:', income.meta?.period || 'N/A')

  if (!stock) {
    console.log('❌ Frontend - Stock not found')
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="card text-center py-8">
          <div className="text-muted">الشركة غير موجودة: {symbol}</div>
          <div className="text-sm text-muted mt-2">
            جرب البحث في <Link href="/stocks" className="text-blue-600">قائمة الأسهم</Link>
          </div>
        </div>
      </div>
    )
  }

  const latestIncome = income.income_statement?.[0]
  const latestBalance = balance.balance_sheet?.[0]
  const latestCashflow = cashflow.cash_flow?.[0]

  // دالة لعرض اسم الفترة بشكل جميل
  const getPeriodDisplay = (item: any) => {
    if (!item) return 'N/A'
    if (item.quarter) {
      return `Q${item.quarter} ${item.year}`
    }
    return item.fiscal_date || item.year || 'N/A'
  }

  console.log('💰 Frontend - Latest income:', latestIncome)
  console.log('💰 Frontend - Latest balance:', latestBalance)
  console.log('💰 Frontend - Latest cashflow:', latestCashflow)

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Stock Header */}
      <div className="card">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">{stock.name}</h1>
            <p className="text-muted text-lg">
              {stock.symbol} {/* • {stock.exchange} */}
              {cleanSymbol(stock.symbol) !== stock.symbol && (
                <span className="text-sm text-gray-500 mr-2">({cleanSymbol(stock.symbol)})</span>
              )}
            </p>
            {/* عرض الرمز الأصلي إذا كان مختلفاً */}
            {stock.original_symbol && stock.original_symbol !== stock.symbol && (
              <p className="text-xs text-gray-500 mt-1">الرمز الأصلي: {stock.original_symbol}</p>
            )}
          </div>
          {/* <div className="text-right">
            <div className="text-lg font-semibold">{stock.currency}</div>
            <div className="text-muted text-sm">{stock.type}</div>
          </div> */}
        </div>
      </div>

      {/* Period Selector
      <div className="card mt-4">
        <div className="flex justify-between items-center">
          <h3 className="card-title">القوائم المالية</h3>
          <PeriodSelector currentPeriod={period} symbol={symbol} />
        </div>
      </div> */}

      {/* Navigation Tabs - Modern GuruFocus Style */}
      <FinancialHeader symbol={symbol} period={period} country={country} page="overview" />

      {/* Debug Info */}
      {/* <div className="card mt-4 bg-blue-50">
        <h3 className="card-title text-blue-800">معلومات التصحيح</h3>
        <div className="text-sm text-blue-700 space-y-2">
          <p><strong>الرمز:</strong> {symbol}</p>
          <p><strong>اسم الشركة:</strong> {stock.name}</p>
          <p><strong>نوع الفترة:</strong> {income.meta?.period === 'Quarterly' ? 'ربع سنوي' : 'سنوي'}</p>
          <p><strong>بيانات الدخل:</strong> {income.income_statement?.length || 0} فترة</p>
          <p><strong>بيانات الميزانية:</strong> {balance.balance_sheet?.length || 0} فترة</p>
          <p><strong>بيانات التدفقات:</strong> {cashflow.cash_flow?.length || 0} فترة</p>
          <p><strong>أحدث إيرادات:</strong> {latestIncome?.sales ? latestIncome.sales.toLocaleString() : 'N/A'}</p>
          <p><strong>أحدث صافي دخل:</strong> {latestIncome?.net_income ? latestIncome.net_income.toLocaleString() : 'N/A'}</p>
          <p><strong>مصدر البيانات:</strong> ✅ مصفاة من الخادم</p>
        </div>
      </div> */}

  

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="card text-center">
          <div className="text-muted text-sm">الإيرادات</div>
          <div className="text-xl font-bold mt-1">
            {latestIncome?.sales ? (latestIncome.sales / 1000000).toFixed(0) + 'M' : 'N/A'}
          </div>
        </div>
        
        <div className="card text-center">
          <div className="text-muted text-sm">صافي الدخل</div>
          <div className={`text-xl font-bold mt-1 ${(latestIncome?.net_income || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {latestIncome?.net_income ? (latestIncome.net_income / 1000000).toFixed(0) + 'M' : 'N/A'}
          </div>
        </div>
        
        <div className="card text-center">
          <div className="text-muted text-sm">إجمالي الأصول</div>
          <div className="text-xl font-bold mt-1">
            {latestBalance?.assets?.total_assets ? (latestBalance.assets.total_assets / 1000000).toFixed(0) + 'M' : 'N/A'}
          </div>
        </div>
        
        <div className="card text-center">
          <div className="text-muted text-sm">EPS</div>
          <div className="text-xl font-bold mt-1">
            {latestIncome?.eps_basic || 'N/A'}
          </div>
        </div>
      </div>

      {/* Simple Data Display */}
      <div className="card mt-6   ">
        <h3 className="card-title">بيانات أساسية</h3>
        <div className="space-y-2">
          {/* <div className="flex justify-between">
            <span>الفترة</span>
            <span>{getPeriodDisplay(latestIncome)}</span>
          </div> */}
          <div className="flex justify-between">
            <span>نوع التقرير</span>
            <span>{income.meta?.period === 'Quarterly' ? 'ربع سنوي' : 'سنوي'}</span>
          </div>
          <div className="flex justify-between">
            <span>عدد الفترات المتاحة</span>
            <span>{income.income_statement?.length || 0}</span>
          </div>
          {/* <div className="flex justify-between">
            <span>حالة البيانات</span>
            <span className="text-green-600">✅ مصفاة من الخادم</span>
          </div> */}
        </div>
      </div>

      {/* Recent Periods List */}
      {income.income_statement && income.income_statement.length > 0 && (
        <div className="card mt-6">
          <h3 className="card-title">آخر {income.income_statement.length} فترة</h3>
          <div className="space-y-2">
            {income.income_statement.slice(0, 6).map((item: any, index: number) => (
              <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                <span className="font-medium">{getPeriodDisplay(item)}</span>
                <div className="text-right">
                  <div className="font-semibold">
                    {item.sales ? (item.sales / 1000000).toFixed(0) + 'M' : 'N/A'}
                  </div>
                  <div className={`text-sm ${(item.net_income || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.net_income ? (item.net_income / 1000000).toFixed(0) + 'M' : 'N/A'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
