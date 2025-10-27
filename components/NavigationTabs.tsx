'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function NavigationTabs({ symbol, period }: { symbol: string, period: string }) {
  const pathname = usePathname()
  
  const getActiveTab = () => {
    if (pathname.includes('/financials')) return 'financials'
    if (pathname.includes('/analysis')) return 'analysis'
    return 'overview'
  }

  const activeTab = getActiveTab()

  return (
    <div className="nav-tabs-modern">
      <Link 
        href={`/stocks/${symbol}?period=${period}`}
        className={`nav-tab-modern ${activeTab === 'overview' ? 'nav-tab-modern-active' : ''}`}
      >
        النظرة العامة
      </Link>
      <Link 
        href={`/stocks/${symbol}/financials?period=${period}`}
        className={`nav-tab-modern ${activeTab === 'financials' ? 'nav-tab-modern-active' : ''}`}
      >
        القوائم المالية
      </Link>
      {/* <Link 
        href={`/stocks/${symbol}/analysis?period=${period}`}
        className={`nav-tab-modern ${activeTab === 'analysis' ? 'nav-tab-modern-active' : ''}`}
      >
        التحليل
      </Link> */}
    </div>
  )
}