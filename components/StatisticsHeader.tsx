import Link from 'next/link'
import StatisticsNavigationTabs from './StatisticsNavigationTabs'

export function StatisticsHeader({ 
  symbol, 
  country
}: { 
  symbol: string, 
  country: string
}) {
  return (
    <div className="card mt-6">
      <div className="flex justify-between items-center gap-4">
        {/* ⭐ لا يوجد PeriodSelector في الإحصائيات */}
        <div></div>
        <StatisticsNavigationTabs symbol={symbol} country={country} />
      </div>
    </div>
  )
}