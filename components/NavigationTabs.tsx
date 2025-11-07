'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function NavigationTabs({ 
  symbol, 
  period, 
  country 
}: { 
  symbol: string, 
  period: string,
  country: string
}) {
  const pathname = usePathname()
  
  const getActiveTab = () => {
    if (pathname.includes('/financials')) return 'financials'
    if (pathname.includes('/analysis')) return 'analysis'
    if (pathname.includes('/statistics')) return 'statistics'
    return 'overview'
  }

  const activeTab = getActiveTab()

  const tabs = [
    { 
      label: 'النظرة العامة', 
      href: `/stocks/${symbol}?period=${period}&country=${encodeURIComponent(country)}`,
      active: activeTab === 'overview'
    },
    { 
      label: 'القوائم المالية', 
      href: `/stocks/${symbol}/financials?period=${period}&country=${encodeURIComponent(country)}`,
      active: activeTab === 'financials'
    },
    { 
      label: 'الإحصائيات', 
      href: `/stocks/${symbol}/statistics?country=${encodeURIComponent(country)}`, // ⭐ بدون period
      active: activeTab === 'statistics'
    },
    // { 
    //   label: 'التحليل', 
    //   href: `/stocks/${symbol}/analysis?period=${period}&country=${encodeURIComponent(country)}`,
    //   active: activeTab === 'analysis'
    // }
  ]

  return (
    <div className="nav-tabs-modern">
      {tabs.map((tab) => (
        <Link 
          key={tab.label}
          href={tab.href}
          className={`nav-tab-modern ${tab.active ? 'nav-tab-modern-active' : ''}`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  )
}