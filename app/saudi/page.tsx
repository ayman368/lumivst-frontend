'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, ChevronDown } from 'lucide-react'

interface SidebarItem {
  en: string
  href: string
  items?: SidebarItem[]
}

export default function SaudiMarketPage() {
  const [sidebarOpen, setOpenSidebar] = useState(true)
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})

  const menuItems: SidebarItem[] = [
    // {
    //   en: 'Bonds',
    //   href: '/saudi/bonds',
    //   items: [
    //     { en: 'Daily Treasury Yield Curve', href: '/bonds/daily-treasury-yield-curve' },
    //     { en: 'Treasury Yield Curve', href: '/bonds/treasury-yield-curve' },
    //     { en: 'Yield Curve', href: '/bonds/yield-curve' },
    //   ],
    // },
    {
      en: 'Economic Indicators',
      href: '/saudi/economic-indicators',
      items: [
        { en: 'Unemployment Rate (UNRATE)', href: '/economic-indicators/unrate' },
        { en: 'Nonfarm Payroll (PAYEMS)', href: '/economic-indicators/payems' },
        { en: 'Initial Claims (IC4WSA)', href: '/economic-indicators/ic4wsa' },
        { en: 'NFP Change', href: '/economic-indicators/nfp-change' },
      ],
    },
    // {
    //   en: 'Market',
    //   href: '/saudi/market',
    //   items: [
    //     { en: 'YRI Earnings Outlook', href: '/market/yri-earnings-outlook' },
    //     { en: 'S&P 500 A Effective Yield', href: '/market/sp500-a-effective-yield' },
    //     { en: 'S&P 500 P/E Ratio', href: '/market/sp500-pe-ratio' },
    //   ],
    // },
    {
      en: 'Interest Rate',
      href: '/saudi/interest-rate',
      items: [
        { en: 'CME FedWatch', href: '/interest-rate/cme-fedwatch' },
        { en: 'SOFR Futures', href: '/interest-rate/sofr-futures' },
      ],
    },
    {
      en: 'Spread',
      href: '/saudi/spread',
      items: [
        { en: 'BBB Corporate Spread', href: '/spread/bbb-corporate' },
        { en: 'A Corporate Spread', href: '/spread/a-corporate' },
      ],
    },
  ]

  const toggleExpanded = (key: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const SidebarItemComponent = ({ item, index }: { item: SidebarItem; index: number }) => {
    const key = `item-${index}`
    const isExpanded = expandedItems[key]

    if (item.items && item.items.length > 0) {
      return (
        <div key={key}>
          <button
            onClick={() => toggleExpanded(key)}
            className="w-full flex items-center justify-between px-4 py-3 text-gray-800 hover:bg-gray-100 rounded-lg transition-colors font-medium text-sm"
          >
            <div className="flex items-center gap-3">
              {sidebarOpen && <span>{item.en}</span>}
            </div>
            {sidebarOpen && (
              <ChevronDown
                size={16}
                className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              />
            )}
          </button>
          {sidebarOpen && isExpanded && (
            <div className="pl-4 space-y-1 mt-1">
              {item.items.map((subItem, subIndex) => (
                <Link
                  key={subIndex}
                  href={subItem.href}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-xs font-medium"
                >
                  {subItem.en}
                </Link>
              ))}
            </div>
          )}
        </div>
      )
    }

    return (
      <Link
        key={key}
        href={item.href}
        className="flex items-center gap-3 px-4 py-3 text-gray-800 hover:bg-gray-100 rounded-lg transition-colors font-medium text-sm"
      >
        {sidebarOpen && <span>{item.en}</span>}
      </Link>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? 'w-64' : 'w-20'
          } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {sidebarOpen && (
            <span className="font-bold text-gray-900">Saudi</span>
          )}
          <button
            onClick={() => setOpenSidebar(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Sidebar Menu */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {menuItems.map((item, index) => (
            <SidebarItemComponent key={index} item={item} index={index} />
          ))}
        </nav>

        {/* Back Button */}
        <div className="p-4 border-t border-gray-200">
          <Link
            href="/market"
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium text-sm"
          >
            {sidebarOpen && <span>Back to Market</span>}
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8 h-full flex items-center justify-center text-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🇸🇦 Saudi Market Center
            </h1>
            <p className="text-gray-600 text-lg">
              Select a section from the sidebar to explore market data
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
