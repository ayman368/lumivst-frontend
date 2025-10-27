import Link from 'next/link'
import NavigationTabs from './NavigationTabs'

export function PeriodSelector({ 
  currentPeriod, 
  symbol, 
  page = 'financials'
}: { 
  currentPeriod: string, 
  symbol: string,
  page?: 'overview' | 'financials' | 'analysis'
}) {
  // تحديد الـ URL بناءً على الصفحة
  const getHref = (periodType: string) => {
    if (page === 'overview') {
      return `/stocks/${symbol}?period=${periodType}`
    } else {
      return `/stocks/${symbol}/${page}?period=${periodType}`
    }
  }

  return (
    <div className="nav-tabs-modern">
      <Link 
        href={getHref('annual')}
        className={`nav-tab-modern ${currentPeriod === 'annual' ? 'nav-tab-modern-active' : ''}`}
      >
        سنوي
      </Link>
      <Link 
        href={getHref('quarterly')}
        className={`nav-tab-modern ${currentPeriod === 'quarterly' ? 'nav-tab-modern-active' : ''}`}
      >
        ربع سنوي
      </Link>
    </div>
  )
}

export function FinancialHeader({ 
  symbol, 
  period,
  page = 'financials'
}: { 
  symbol: string, 
  period: string,
  page?: 'overview' | 'financials' | 'analysis'
}) {
  return (
    <div className="card mt-6">
      <div className="flex justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          {/* <span className="text-sm font-medium text-gray-700">الفترة:</span> */}
          <PeriodSelector currentPeriod={period} symbol={symbol} page={page} />
        </div>
        <NavigationTabs symbol={symbol} period={period} />
      </div>
    </div>
  )
}