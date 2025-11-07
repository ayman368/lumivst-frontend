'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from '../styles/statistics.module.css'

export default function StatisticsNavigationTabs({ 
  symbol, 
  country 
}: { 
  symbol: string, 
  country: string
}) {
  const pathname = usePathname()
  
  const getActiveTab = () => {
    if (pathname.includes('/financials')) return 'financials'
    if (pathname.includes('/statistics')) return 'statistics'
    return 'overview'
  }
  
  const activeTab = getActiveTab()
  
  const tabs = [
    { 
      label: 'البيانات المالية', 
      href: `/stocks/${symbol}/financials?country=${encodeURIComponent(country)}`,
      active: activeTab === 'financials'
    },
    { 
      label: 'الإحصائيات', 
      href: `/stocks/${symbol}/statistics?country=${encodeURIComponent(country)}`,
      active: activeTab === 'statistics'
    }
  ]
  
  return (
    <div className={styles.navTabs}>
      {tabs.map((tab) => (
        <Link 
          key={tab.label}
          href={tab.href}
          className={`${styles.navTab} ${tab.active ? styles.active : ''}`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  )
}