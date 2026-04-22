'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'

interface NavItem {
  en: string
  href: string
  items?: NavItem[]
}

function DropdownItem({
  item,
  index,
  activeMobile,
  setActiveMobile,
  setActiveDropdown,
  parentShowNested,
}: any) {
  const [showNested, setShowNested] = useState(false)

  useEffect(() => {
    if (parentShowNested === false) {
      setShowNested(false)
    }
  }, [parentShowNested])

  if (item.items) {
    return (
      <div
        key={index}
        className="relative flex flex-col"
        onMouseEnter={() => !activeMobile && setShowNested(true)}
        onMouseLeave={() => !activeMobile && setShowNested(false)}
      >
        <button
          className="w-full flex justify-between items-center px-4 py-3 text-[13px] border-b border-gray-100 transition-colors duration-200 hover:bg-black/[0.02] text-left bg-none border-l-0 border-r-0 border-t-0 cursor-pointer text-gray-800 font-medium"
          style={{ color: '#1f2937' }}
        >
          {item.en}
          <svg
            className="w-4 h-4 ml-2 transition-transform duration-300"
            style={{ transform: showNested ? 'translateX(4px)' : 'translateX(0)' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Nested Dropdown */}
        <div
          className="absolute top-0 left-full ml-2 rounded-md border z-[1002] min-w-[200px] transition-all duration-300"
          style={{
            background: '#ffffff',
            borderColor: '#d1d5db',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            opacity: showNested ? 1 : 0,
            visibility: showNested ? 'visible' : 'hidden',
            transform: showNested ? 'translateX(0)' : 'translateX(-10px)',
          }}
        >
          {item.items.map((nestedItem: any, nestedIndex: number) => (
            <DropdownItem
              key={nestedIndex}
              item={nestedItem}
              index={nestedIndex}
              activeMobile={activeMobile}
              setActiveMobile={setActiveMobile}
              setActiveDropdown={setActiveDropdown}
              parentShowNested={showNested}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <Link
      href={item.href}
      className="block px-4 py-3 text-[13px] border-b border-gray-100 transition-colors duration-200 hover:bg-black/[0.02] last:border-b-0 text-gray-800 font-medium"
      style={{ color: '#1f2937' }}
      onClick={() => {
        setActiveMobile(false)
        setActiveDropdown(null)
      }}
    >
      {item.en}
    </Link>
  )
}

export default function SaudiMarketNavbar() {
  const [activeMobile, setActiveMobile] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const navbarRef = useRef<HTMLDivElement>(null)

  const menuItems: Record<string, NavItem> = {
    // bonds: {
    //   en: 'Bonds',
    //   href: '/market/saudi/bonds',
    //   items: [
    //     { en: 'Daily Treasury Yield Curve', href: '/bonds/daily-treasury-yield-curve' },
    //     { en: 'Treasury Yield Curve', href: '/bonds/treasury-yield-curve' },
    //     { en: 'Yield Curve', href: '/bonds/yield-curve' },
    //   ],
    // },
    economicIndicators: {
      en: 'Economic Indicators',
      href: '/market/saudi/economic-indicators',
      items: [
        { en: 'Unemployment Rate (UNRATE)', href: '/economic-indicators/unrate' },
        { en: 'Nonfarm Payroll (PAYEMS)', href: '/economic-indicators/payems' },
        { en: 'Initial Claims (IC4WSA)', href: '/economic-indicators/ic4wsa' },
        { en: 'NFP Change', href: '/economic-indicators/nfp-change' },
      ],
    },
    // market: {
    //   en: 'Market',
    //   href: '/market/saudi/market',
    //   items: [
    //     { en: 'YRI Earnings Outlook', href: '/market/yri-earnings-outlook' },
    //     { en: 'S&P 500 A Effective Yield', href: '/market/sp500-a-effective-yield' },
    //     { en: 'S&P 500 P/E Ratio', href: '/market/sp500-pe-ratio' },
    //   ],
    // },
    interestRate: {
      en: 'Interest Rate',
      href: '/market/saudi/interest-rate',
      items: [
        { en: 'CME FedWatch', href: '/interest-rate/cme-fedwatch' },
        { en: 'SOFR Futures', href: '/interest-rate/sofr-futures' },
      ],
    },
    spread: {
      en: 'Spread',
      href: '/market/saudi/spread',
      items: [
        { en: 'BBB Corporate Spread', href: '/spread/bbb-corporate' },
        { en: 'A Corporate Spread', href: '/spread/a-corporate' },
      ],
    },
  }

  const toggleMobile = () => {
    setActiveMobile(!activeMobile)
    setActiveDropdown(null)
  }

  const toggleDropdown = (key: string) => {
    setActiveDropdown(activeDropdown === key ? null : key)
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navbarRef.current && !navbarRef.current.contains(event.target as Node)) {
        setActiveDropdown(null)
        setActiveMobile(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav
      ref={navbarRef}
      dir="ltr"
      className="w-full sticky top-0 z-[1000] font-[Inter,arial,helvetica,sans-serif] transition-all duration-500"
      style={{
        backgroundColor: 'var(--navbar-bg, #ffffff)',
        boxShadow: 'var(--navbar-shadow, 0 1px 3px rgba(0,0,0,0.1))',
        minHeight: '56px',
        maxHeight: '56px',
      }}
    >
      <div className="max-w-[1600px] mx-auto px-1 flex items-center justify-start gap-5 h-14">
        {/* Back Button */}
        <Link
          href="/market"
          className="flex items-center gap-2 no-underline p-2 rounded-lg transition-all duration-300 hover:-translate-y-px"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ color: 'var(--navbar-text, #374151)' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-[14px] font-semibold" style={{ color: 'var(--navbar-text, #374151)' }}>
            Back
          </span>
        </Link>

        {/* Title */}
        <div className="flex items-center gap-3 px-3 border-l border-gray-200">
          <span className="text-[18px] font-bold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
            🇸🇦 Saudi Market
          </span>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden ml-auto p-2 rounded-lg transition-all duration-300 hover:bg-gray-100"
          onClick={toggleMobile}
          style={{ color: 'var(--navbar-text, #374151)' }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Main Menu */}
        <div
          className={`flex items-center h-full md:flex-row md:static md:overflow-visible md:max-h-none
            ${activeMobile
              ? 'flex-col items-stretch absolute top-14 left-0 right-0 overflow-hidden max-h-[500px]'
              : 'max-md:max-h-0 max-md:overflow-hidden max-md:flex-col max-md:items-stretch max-md:absolute max-md:top-14 max-md:left-0 max-md:right-0'
            }
          `}
          style={{
            backgroundColor: 'var(--navbar-bg, #ffffff)',
            transition: 'max-height 0.5s ease-in-out',
          }}
        >
          {Object.entries(menuItems).map(([key, item]) => (
            <div
              key={key}
              className={`relative h-full flex items-center max-md:h-auto max-md:border-b`}
              style={{ borderColor: 'var(--navbar-border, #e5e7eb)' }}
              onMouseEnter={() => !activeMobile && setActiveDropdown(key)}
              onMouseLeave={() => !activeMobile && setActiveDropdown(null)}
            >
              <button
                className="flex items-center gap-1.5 px-3 h-full text-[14px] font-medium whitespace-nowrap border-none bg-transparent cursor-pointer transition-all duration-300 max-md:px-4 max-md:py-4 max-md:justify-between max-md:w-full text-gray-800"
                style={{ color: '#1f2937' }}
                onClick={() => activeMobile && toggleDropdown(key)}
              >
                {item.en}
                <svg
                  className="w-4 h-4 transition-transform duration-300"
                  style={{ transform: activeDropdown === key ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown */}
              {item.items && (
                <div
                  className="absolute top-full left-0 rounded-md border z-[1001] min-w-[250px] transition-all duration-300 max-md:static max-md:rounded-none max-md:border-0 max-md:z-0"
                  style={{
                    background: '#ffffff',
                    borderColor: '#d1d5db',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    opacity: activeDropdown === key ? 1 : 0,
                    visibility: activeDropdown === key ? 'visible' : 'hidden',
                    transform: activeDropdown === key ? 'translateY(0)' : 'translateY(-10px)',
                    maxHeight: activeDropdown === key ? 'auto' : '0',
                  }}
                >
                  {item.items.map((nestedItem: any, nestedIndex: number) => (
                    <DropdownItem
                      key={nestedIndex}
                      item={nestedItem}
                      index={nestedIndex}
                      activeMobile={activeMobile}
                      setActiveMobile={setActiveMobile}
                      setActiveDropdown={setActiveDropdown}
                      parentShowNested={activeDropdown === key}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </nav>
  )
}
