import Link from 'next/link'

function cleanSymbol(symbol: string): string {
  return symbol.split('.')[0]
}

async function getStockData(symbol: string) {
  const cleanSym = cleanSymbol(symbol)
  
  const [stockRes, incomeRes, balanceRes] = await Promise.all([
    fetch(`https://lumivst-frontend.vercel.app/stocks`),
    fetch(`https://lumivst-frontend.vercel.app/financials/income_statement/${cleanSym}`),
    fetch(`https://lumivst-frontend.vercel.app/financials/balance_sheet/${cleanSym}`)
  ])

  const stocksData = await stockRes.json()
  const stock = stocksData.data.find((s: any) => s.symbol === symbol)
  
  const income = await incomeRes.json()
  const balance = await balanceRes.json()

  return { stock, income, balance }
}

export default async function ValuationPage({ 
  params 
}: { 
  params: Promise<{ symbol: string }>
}) {
  const { symbol } = await params
  const { stock, income, balance } = await getStockData(symbol)

  if (!stock) {
    return <div>Stock not found</div>
  }

  const latestIncome = income.income_statement?.[0]
  const latestBalance = balance.balance_sheet?.[0]

  return (
    <div className="min-h-screen bg-gray-50">

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stock Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{stock.name}</h1>
              <p className="text-gray-600 mt-1">{stock.exchange} | {stock.type}</p>
            </div>
            <div className="mt-4 lg:mt-0 lg:text-right">
              <div className="text-2xl font-bold text-gray-900">-- ريال سعودي</div>
              <div className="text-gray-600 text-sm mt-1">الحجم: --</div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - Valuation Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
              <h3 className="font-semibold text-gray-900 mb-4">التقييم</h3>
              <nav className="space-y-2">
                <Link 
                  href={`/stocks/${symbol}/valuation`}
                  className="block py-2 px-3 bg-blue-50 text-blue-700 rounded-lg font-medium"
                >
                  النظرة العامة
                </Link>
                <Link 
                  href={`/stocks/${symbol}/financials`}
                  className="block py-2 px-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  القوائم المالية
                </Link>
                <Link 
                  href={`/stocks/${symbol}/forecasts`}
                  className="block py-2 px-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  التوقعات
                </Link>
                <Link 
                  href={`/stocks/${symbol}/analysis`}
                  className="block py-2 px-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  التحليل
                </Link>
                <Link 
                  href={`/stocks/${symbol}/dividends`}
                  className="block py-2 px-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                >
                  الأرباح
                </Link>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Valuation Summary */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">ملخص التقييم</h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">خصم التدفقات النقدية</h3>
                  <div className="text-2xl font-bold text-blue-600">--</div>
                  <div className="text-sm text-gray-600">القيمة العادلة</div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">مضاعفات التداول</h3>
                  <div className="text-2xl font-bold text-green-600">--</div>
                  <div className="text-sm text-gray-600">التقييم النسبي</div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">نموذج لينش</h3>
                  <div className="text-2xl font-bold text-purple-600">--</div>
                  <div className="text-sm text-gray-600">بيتر لينش</div>
                </div>
              </div>
            </div>

            {/* DCF Valuation */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-semibold text-gray-900">تقييم خصم التدفقات النقدية - نموذج النمو</h2>
                <div className="text-sm text-gray-500">آخر تحديث: --</div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">المدخلات</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">معدل الخصم (WACC)</label>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-semibold">9.0%</span>
                        <span className="text-sm text-gray-500">7.8% - 10.3%</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">معدل النمو طويل الأجل</label>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-semibold">4.0%</span>
                        <span className="text-sm text-gray-500">3.0% - 5.0%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">النتائج</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">السعر العادل</label>
                      <div className="text-2xl font-bold text-blue-600">-- ريال</div>
                      <div className="text-sm text-gray-500">-- - -- نطاق</div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">الربح/الخسارة المحتملة</label>
                      <div className="text-lg font-semibold text-red-600">--%</div>
                      <div className="text-sm text-gray-500">--% - --% نطاق</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue & Expense Forecasts */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">توقعات الإيرادات والمصروفات</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 bg-gray-50">(بالمليون ريال)</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 bg-gray-50">2024</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 bg-gray-50">2025</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 bg-gray-50">2026</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900 bg-gray-50">2027</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">الإيرادات</td>
                      <td className="px-4 py-3 text-sm text-center text-gray-900">--</td>
                      <td className="px-4 py-3 text-sm text-center text-gray-900">--</td>
                      <td className="px-4 py-3 text-sm text-center text-gray-900">--</td>
                      <td className="px-4 py-3 text-sm text-center text-gray-900">--</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">نمو الإيرادات</td>
                      <td className="px-4 py-3 text-sm text-center text-green-600">--%</td>
                      <td className="px-4 py-3 text-sm text-center text-green-600">--%</td>
                      <td className="px-4 py-3 text-sm text-center text-green-600">--%</td>
                      <td className="px-4 py-3 text-sm text-center text-green-600">--%</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">تكلفة البضاعة المباعة</td>
                      <td className="px-4 py-3 text-sm text-center text-gray-900">(--)</td>
                      <td className="px-4 py-3 text-sm text-center text-gray-900">(--)</td>
                      <td className="px-4 py-3 text-sm text-center text-gray-900">(--)</td>
                      <td className="px-4 py-3 text-sm text-center text-gray-900">(--)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Similar Stocks */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">أسهم مشابهة</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* هنا بيكون فيه قائمة بالأسهم المشابهة */}
                <div className="border rounded-lg p-4">
                  <div className="font-semibold text-gray-900">--</div>
                  <div className="text-sm text-gray-600">--</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}