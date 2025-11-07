import Link from 'next/link'
import NavigationTabs from './NavigationTabs'

export function PeriodSelector({ 
  currentPeriod, 
  symbol, 
  country,
  page = 'financials'
}: { 
  currentPeriod: string, 
  symbol: string,
  country: string, // ⭐ إضافة البلد
  page?: 'overview' | 'financials' | 'analysis'
}) {
  // تحديد الـ URL بناءً على الصفحة مع البلد
  const getHref = (periodType: string) => {
    if (page === 'overview') {
      return `/stocks/${symbol}?period=${periodType}&country=${encodeURIComponent(country)}`
    } else {
      return `/stocks/${symbol}/${page}?period=${periodType}&country=${encodeURIComponent(country)}`
    }
  }

  return (
    <div className="nav-tabs-modern">
      <Link 
        href={getHref('annual')}
        className={`nav-tab-modern ${currentPeriod === 'annual' ? 'nav-tab-modern-active' : ''}`}
      >
        Annual
      </Link>
      <Link 
        href={getHref('quarterly')}
        className={`nav-tab-modern ${currentPeriod === 'quarterly' ? 'nav-tab-modern-active' : ''}`}
      >
         Quarterly
      </Link>
    </div>
  )
}

export function FinancialHeader({ 
  symbol, 
  period,
  country, // ⭐ إضافة البلد
  page = 'financials'
}: { 
  symbol: string, 
  period: string,
  country: string, // ⭐ إضافة البلد
  page?: 'overview' | 'financials' | 'analysis'
}) {
  return (
    <div className="card mt-6">
      <div className="flex justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <PeriodSelector currentPeriod={period} symbol={symbol} country={country} page={page} />
        </div>
        <NavigationTabs symbol={symbol} period={period} country={country} />
      </div>
    </div>
  )
}