'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '../app/providers/AuthProvider'
import { User } from 'lucide-react'

// Recursive Dropdown Component for nested menus
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
          className="w-full flex justify-between items-center px-4 py-3 text-[13px] border-b border-gray-100 transition-colors duration-200 hover:bg-black/[0.02] text-left bg-none border-l-0 border-r-0 border-t-0 cursor-pointer"
          style={{ color: 'var(--dropdown-text, #374151)' }}
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
            background: 'var(--dropdown-bg, #ffffff)',
            borderColor: 'var(--dropdown-border, #e5e7eb)',
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
      className="block px-4 py-3 text-[13px] border-b border-gray-100 transition-colors duration-200 hover:bg-black/[0.02] last:border-b-0"
      style={{ color: 'var(--dropdown-text, #374151)' }}
      onClick={() => {
        setActiveMobile(false)
        setActiveDropdown(null)
      }}
    >
      {item.en}
    </Link>
  )
}

export default function Navbar() {
  const [activeMobile, setActiveMobile] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const navbarRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const { user, logout } = useAuth()

  const menuItems = {
    home: {
      en: 'Home',
      href: '/',
      items: [
        { en: 'Dashboard', href: '/dashboard' },
        { en: 'Portfolios', href: '/portfolios' },
        { en: 'Membership', href: '/membership' },
        { en: 'About Us', href: '/about' },
      ],
    },
    screeners: {
      en: 'Screeners',
      href: '/screeners',
      items: [
        { en: 'Fundamental', href: '/screeners/fundamental' },
        { en: 'Technical Screener', href: '/technical-screener' },
        { en: 'My Screeners', href: '/screeners/my-screens' },
        {
          en: 'Top Trader',
          href: '#',
          items: [
            {
              en: 'Rebh',
              href: '#',
              items: [
                { en: 'Composite', href: '/screeners/Composite' },
              ],
            },
            {
              en: 'Mark Minervini',
              href: '#',
              items: [
                { en: 'Trend - 1 Month', href: '/screeners?tab=trend-1-month' },
                { en: 'Trend - 2 Months', href: '/screeners?tab=trend-2-months' },
                { en: 'Trend - 4 Months', href: '/screeners?tab=trend-4-months' },
                { en: 'Trend - 5 Months', href: '/screeners?tab=trend-5-months' },
                { en: 'Trend - 5 Month Wide', href: '/screeners?tab=trend-5-months-wide' },
                { en: 'Power Play', href: '/screeners?tab=power-play' },
              ],
            },
            {
              en: 'Meeshal',
              href: '#',
              items: [
                { en: 'RSI', href: '/screeners/rsi' },
                { en: 'Alrayan', href: '/screeners/alrayan' },
              ],
            },
          ],
        },
      ],
    },
    watchlist: {
      en: 'Watchlist',
      href: '/watchlist',
      items: [
        { en: 'My Watchlist', href: '/watchlist' },
        { en: 'RS Screener', href: '/rs-screener' },
        { en: 'RS Analysis', href: '/rs-analysis' },
      ],
    },
    learn: {
      en: 'Learn',
      href: '/learn',
      items: [
        {
          en: 'Dan Zanger',
          href: '#',
          items: [
            { en: "Dan's 10 Golden Rules", href: '/learn/golden-rules' },
            { en: 'Understanding Chart Patterns', href: '/learn/chart-patterns' },
            { en: 'Useful Stock Resources', href: '/learn/useful-stock-sources' },
            { en: 'Recommended Reading', href: '/learn/recommended-reading' },
          ],
        },
      ],
    },
    market: {
      en: 'Market',
      href: '/market',
      items: [
        { en: 'Economy', href: '/market/economy' },
        { en: 'US Market', href: '/market/us' },
        { en: 'Saudi Market', href: '/saudi' },
        { en: 'Sectors', href: '/market/sectors' },
      ],
    },
    news: {
      en: 'News',
      href: '/news',
      items: [
        { en: 'All News', href: '/news' },
        { en: 'Earning Reports', href: '/news/earnings' },
        { en: 'Disclosures', href: '/news/disclosures' },
        { en: 'Analyst Reports', href: '/news/analyst' },
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

  const handleLogout = async () => {
    try {
      await logout()
      setShowUserMenu(false)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navbarRef.current && !navbarRef.current.contains(event.target as Node)) {
        setActiveDropdown(null)
        setActiveMobile(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
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
      <div
        className="max-w-[1600px] mx-auto px-1 flex items-center justify-start gap-5 h-14"
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 no-underline p-1 pr-0 rounded-lg transition-all duration-300 hover:-translate-y-px"
          style={{ ['--tw-bg-opacity' as any]: '0.05' }}
        >
          <div
            className="flex items-center justify-center w-8 h-8 bg-white rounded-lg transition-all duration-300 border"
            style={{
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              borderColor: 'rgba(0,0,0,0.05)',
            }}
          >
            <img src="/favicon.ico" alt="REBH Logo" className="w-[22px] h-[22px] object-contain" />
          </div>
          <span
            className="text-[22px] font-extrabold tracking-[-0.04em] bg-gradient-to-br from-blue-800 to-blue-500 bg-clip-text text-transparent flex items-center"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            REBH
          </span>
        </Link>

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
                className="flex items-center gap-1.5 px-3 h-full text-[14px] font-medium whitespace-nowrap border-none bg-transparent cursor-pointer transition-all duration-300 max-md:px-4 max-md:py-4 max-md:justify-between max-md:w-full"
                style={{ color: 'var(--navbar-text, #374151)' }}
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
              <div
                className="absolute top-full left-0 rounded-md border min-w-[200px] z-[1001] transition-all duration-300
                  max-md:static max-md:rounded-none max-md:border-none max-md:shadow-none max-md:overflow-hidden"
                style={{
                  background: 'var(--dropdown-bg, #ffffff)',
                  borderColor: 'var(--dropdown-border, #e5e7eb)',
                  boxShadow: activeMobile ? 'none' : '0 4px 20px rgba(0,0,0,0.15)',
                  opacity: activeMobile ? 1 : (activeDropdown === key ? 1 : 0),
                  visibility: activeMobile
                    ? (activeDropdown === key ? 'visible' : 'hidden')
                    : (activeDropdown === key ? 'visible' : 'hidden'),
                  transform: activeMobile ? 'none' : (activeDropdown === key ? 'translateY(0)' : 'translateY(-10px)'),
                  maxHeight: activeMobile ? (activeDropdown === key ? '300px' : '0') : undefined,
                  backgroundColor: activeMobile ? 'var(--navbar-active-bg, #f9fafb)' : 'var(--dropdown-bg, #ffffff)',
                }}
              >
                {item.items.map((subItem: any, index: number) => (
                  <DropdownItem
                    key={index}
                    item={subItem}
                    index={index}
                    activeMobile={activeMobile}
                    setActiveMobile={setActiveMobile}
                    setActiveDropdown={setActiveDropdown}
                    parentShowNested={activeDropdown === key}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Auth Actions */}
        <div className="flex items-center gap-3 ml-auto">
          <div className="flex items-center gap-1">
            {[
              { href: '/stocks', label: 'Stocks' },
              { href: '/market-reports', label: 'Market Reports' },
              { href: '/stocks/market-breadth', label: 'Market Breadth' },
              { href: '/stocks/charts', label: 'Charts' },
              { href: '/industry-groups', label: 'Industry Groups' },
              { href: '/pricing', label: 'Pricing' },
              { href: '/contact', label: 'Contact Us' },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center px-3 h-14 text-[14px] font-medium whitespace-nowrap no-underline transition-all duration-300 hover:bg-black/5"
                style={{ color: 'var(--navbar-text, #374151)' }}
              >
                {label}
              </Link>
            ))}

            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-200"
                >
                  <User size={20} className="text-blue-600" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100 origin-top-right">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user.full_name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="text-[13px] font-medium px-4 py-2 rounded transition-all duration-300 border no-underline"
                style={{
                  color: 'var(--navbar-text, #374151)',
                  borderColor: 'var(--navbar-border, #e5e7eb)',
                  background: 'transparent',
                }}
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden bg-transparent border-none cursor-pointer p-2 text-xl"
            style={{ color: 'var(--navbar-text, #374151)' }}
            onClick={toggleMobile}
          >
            ☰
          </button>
        </div>
      </div>
    </nav>
  )
}