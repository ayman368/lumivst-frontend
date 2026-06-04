'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '../app/providers/AuthProvider'
import { ChevronDown, ChevronRight, LogOut, UserCircle, Menu, X } from 'lucide-react'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface MenuItem {
  en: string
  href: string
  items?: MenuItem[]
}

interface MenuSection {
  en: string
  href: string
  items: MenuItem[]
}

interface MenuMap {
  [key: string]: MenuSection
}

// ─────────────────────────────────────────────
// REBH Logo — text-based wordmark
// ─────────────────────────────────────────────
function REBHLogo() {
  return (
    <Link href="/" className="flex items-center gap-0 select-none group no-underline" aria-label="REBH Home">
      {/* Accent dot */}
      <span
        className="inline-flex items-center justify-center w-[7px] h-[7px] rounded-full bg-blue-600 mr-2 mt-0.5 group-hover:scale-125 transition-transform duration-300 flex-shrink-0"
        aria-hidden="true"
      />
      <span
        className="text-[22px] font-black text-gray-900"
        style={{ fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif", letterSpacing: '-0.05em' }}
      >
        REBH
      </span>
    </Link>
  )
}

// ─────────────────────────────────────────────
// Desktop recursive dropdown item
// ─────────────────────────────────────────────
function DropdownItem({
  item,
  onClose,
}: {
  item: MenuItem
  onClose: () => void
}) {
  const [open, setOpen] = useState(false)

  if (!item.items) {
    return (
      <Link
        href={item.href}
        onClick={onClose}
        className="flex items-center px-4 py-2.5 text-[13px] text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-150 whitespace-nowrap no-underline"
      >
        {item.en}
      </Link>
    )
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        className="flex w-full items-center justify-between gap-6 px-4 py-2.5 text-[13px] text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-150 cursor-pointer border-none bg-transparent"
        type="button"
      >
        <span>{item.en}</span>
        <ChevronRight size={12} className="opacity-40 flex-shrink-0" />
      </button>

      {/* Nested flyout panel */}
      <div
        className="absolute top-0 left-full ml-1 rounded-lg border border-gray-100 bg-white min-w-[200px] py-1 z-[1010]"
        style={{
          boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
          opacity: open ? 1 : 0,
          visibility: open ? 'visible' : 'hidden',
          transform: open ? 'translateX(0)' : 'translateX(-6px)',
          transition: 'opacity 0.15s ease, transform 0.15s ease',
          pointerEvents: open ? 'auto' : 'none',
        }}
      >
        {item.items.map((child, i) => (
          <DropdownItem key={i} item={child} onClose={onClose} />
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Mobile accordion item (recursive)
// ─────────────────────────────────────────────
function MobileItem({
  item,
  depth,
  onClose,
}: {
  item: MenuItem
  depth: number
  onClose: () => void
}) {
  const [open, setOpen] = useState(false)

  if (!item.items) {
    return (
      <Link
        href={item.href}
        onClick={onClose}
        className="block px-3 py-2 text-[13px] text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors no-underline"
      >
        {item.en}
      </Link>
    )
  }

  return (
    <div>
      <button
        type="button"
        className="flex items-center justify-between w-full px-3 py-2 text-[13px] text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md cursor-pointer border-none bg-transparent transition-colors"
        onClick={() => setOpen(!open)}
      >
        {item.en}
        <ChevronDown
          size={12}
          className="text-gray-400 transition-transform duration-200 flex-shrink-0"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>
      {open && (
        <div
          className="mt-0.5 space-y-0.5"
          style={{ marginLeft: `${(depth + 1) * 12}px`, paddingLeft: '8px', borderLeft: '2px solid #EFF6FF' }}
        >
          {item.items.map((child, i) => (
            <MobileItem key={i} item={child} depth={depth + 1} onClose={onClose} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Main Navbar
// ─────────────────────────────────────────────
export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const { user, logout } = useAuth()

  // ── Menu data ────────────────────────────────
  const menuItems: MenuMap = {
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
        {
          en: 'My Screeners', href: '#',
          items: [
            { en: 'Stocks', href: '/stocks' },
            { en: 'Charts', href: '/stocks/charts' },
          ],
        },
        {
          en: 'Top Trader', href: '#',
          items: [
            {
              en: 'Rebh', href: '#',
              items: [
                { en: 'Composite', href: '/screeners/Composite' },
              ],
            },
            {
              en: 'Mark Minervini', href: '#',
              items: [
                { en: 'Trend - 1 Month', href: '/screeners?tab=trend-1-month' },
                { en: 'Trend - 2 Months', href: '/screeners?tab=trend-2-months' },
                { en: 'Trend - 4 Months', href: '/screeners?tab=trend-4-months' },
                { en: 'Trend - 5 Months', href: '/screeners?tab=trend-5-months' },
                { en: 'Trend - 5 Month Wide', href: '/screeners?tab=trend-5-months-wide' },
                { en: 'Power Play', href: '/screeners?tab=power-play' },
                { en: 'Minervini Trend', href: '/minervini-trend' },
              ],
            },
            {
              en: 'Meeshal', href: '#',
              items: [
                { en: 'RSI', href: '/screeners/rsi' },
                { en: 'Alrayan', href: '/screeners/alrayan' },
                { en: 'Alhussain', href: '/screeners/alhussain' },
                { en: 'A/D Rating', href: '/screeners/ad-rating' },
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
        {
          en: 'RS', href: '#',
          items: [
            { en: 'RS Analysis', href: '/rs-analysis' },
            { en: 'RS Line Indicators', href: '/rs-line' },
            { en: 'Market Overview', href: '/watchlist?tab=Overview' },
            { en: 'RS Matrix', href: '/watchlist?tab=RS Matrix' },
            { en: 'Matrix Chart', href: '/watchlist?tab=Matrix Chart' },
            { en: 'RS Screener', href: '/watchlist?tab=RS Screener' },
          ],
        },
      ],
    },
    learn: {
      en: 'Learn',
      href: '/learn',
      items: [
        {
          en: 'Dan Zanger', href: '#',
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
        {
          en: 'Saudi Market', href: '#',
          items: [
            { en: 'Market Reports', href: '/market-reports' },
            { en: 'Market Breadth', href: '/stocks/market-breadth' },
            { en: 'Market Pulse', href: '/market-pulse' },
          ],
        },
        {
          en: 'Sectors', href: '#',
          items: [
            { en: 'Industry Groups', href: '/industry-groups' },
          ],
        },
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
    wallet: {
      en: 'Wallet',
      href: '/portfolio',
      items: [
        { en: 'Portfolio', href: '/portfolio' },
        { en: 'Position Size', href: '/Positionsizecalculator' },
        { en: 'Risk Calculator', href: '/risk-calculator' },
        { en: 'RBAF', href: '/rbaf' },
        { en: 'Monthly Tracker', href: '/monthly-tracker' },
        { en: 'Weekly Study', href: '/weekly-study' },
      ],
    },
  }

  // ── Handlers ─────────────────────────────────
  const closeAll = useCallback(() => {
    setActiveDropdown(null)
    setMobileOpen(false)
    setShowUserMenu(false)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      closeAll()
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null)
        setMobileOpen(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close mobile menu on resize to desktop breakpoint
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 768) setMobileOpen(false) }
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  // ── Render ───────────────────────────────────
  return (
    <nav
      ref={navRef}
      dir="ltr"
      className="w-full sticky top-0 z-[1000] bg-white border-b border-gray-200"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}
    >
      {/* ── Top bar ── */}
      <div className="max-w-[1600px] mx-auto px-4 h-14 flex items-center gap-0">

        {/* Logo */}
        <div className="flex-shrink-0 pr-5 mr-1 border-r border-gray-100">
          <REBHLogo />
        </div>

        {/* Desktop nav items */}
        <div className="hidden md:flex items-center h-full flex-1 min-w-0">
          {Object.entries(menuItems).map(([key, section]) => (
            <div
              key={key}
              className="relative h-full flex items-center"
              onMouseEnter={() => setActiveDropdown(key)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                type="button"
                className="flex items-center gap-1 px-3 h-full text-[13.5px] font-medium text-gray-600 hover:text-gray-900 transition-colors duration-150 cursor-pointer border-none bg-transparent whitespace-nowrap outline-none"
                style={{
                  borderBottom: activeDropdown === key
                    ? '2px solid #1D4ED8'
                    : '2px solid transparent',
                }}
              >
                {section.en}
                <ChevronDown
                  size={12}
                  className="mt-px opacity-40 transition-transform duration-200 flex-shrink-0"
                  style={{ transform: activeDropdown === key ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </button>

              {/* Dropdown panel */}
              <div
                className="absolute top-full left-0 mt-0 rounded-lg border border-gray-100 bg-white min-w-[200px] py-1 z-[1001]"
                style={{
                  boxShadow: '0 8px 24px rgba(0,0,0,0.10)',
                  opacity: activeDropdown === key ? 1 : 0,
                  visibility: activeDropdown === key ? 'visible' : 'hidden',
                  transform: activeDropdown === key ? 'translateY(0)' : 'translateY(-8px)',
                  transition: 'opacity 0.18s ease, transform 0.18s ease',
                  pointerEvents: activeDropdown === key ? 'auto' : 'none',
                }}
              >
                {section.items.map((item, i) => (
                  <DropdownItem key={i} item={item} onClose={closeAll} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1 ml-auto flex-shrink-0">

          {/* Pricing & Contact — desktop only */}
          <div className="hidden md:flex items-center">
            <Link
              href="/pricing"
              className="px-3 h-14 flex items-center text-[13.5px] font-medium text-gray-500 hover:text-gray-900 transition-colors duration-150 no-underline"
            >
              Pricing
            </Link>
            <Link
              href="/contact"
              className="px-3 h-14 flex items-center text-[13.5px] font-medium text-gray-500 hover:text-gray-900 transition-colors duration-150 no-underline"
            >
              Contact
            </Link>
          </div>

          {/* Vertical divider */}
          <div className="hidden md:block w-px h-5 bg-gray-200 mx-2 flex-shrink-0" />

          {/* Auth section */}
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 pl-1 pr-2.5 py-1.5 rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                aria-label="Open user menu"
                aria-expanded={showUserMenu}
              >
                {/* Avatar initial */}
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-700 text-white text-[11px] font-bold flex-shrink-0">
                  {user.full_name?.charAt(0)?.toUpperCase() ?? 'U'}
                </div>
                <span className="hidden sm:block text-[13px] font-medium text-gray-700 max-w-[90px] truncate">
                  {user.full_name?.split(' ')[0] ?? 'Account'}
                </span>
                <ChevronDown
                  size={12}
                  className="text-gray-400 transition-transform duration-200"
                  style={{ transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </button>

              {/* User dropdown */}
              {showUserMenu && (
                <div
                  className="absolute right-0 mt-2 w-52 bg-white rounded-xl py-1.5 z-[1050] border border-gray-100"
                  style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
                >
                  <div className="px-4 py-2.5 border-b border-gray-100 mb-1">
                    <p className="text-[13px] font-semibold text-gray-900 truncate">{user.full_name}</p>
                    <p className="text-[11px] text-gray-400 truncate mt-0.5">{user.email}</p>
                  </div>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors no-underline"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <UserCircle size={15} className="text-gray-400 flex-shrink-0" />
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-[13px] text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer border-none bg-transparent"
                  >
                    <LogOut size={15} className="flex-shrink-0" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center px-3.5 py-1.5 text-[13px] font-medium text-gray-600 hover:text-gray-900 border border-gray-200 rounded-md hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 no-underline"
            >
              Login
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden flex items-center justify-center w-9 h-9 ml-1 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors border-none bg-transparent cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* ── Mobile menu panel ── */}
      <div
        className="md:hidden border-t border-gray-100 bg-white"
        style={{
          maxHeight: mobileOpen ? '80vh' : '0',
          overflowY: mobileOpen ? 'auto' : 'hidden',
          overflowX: 'hidden',
          transition: 'max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div className="px-4 py-3 space-y-0.5">

          {/* Nav sections */}
          {Object.entries(menuItems).map(([key, section]) => (
            <div key={key}>
              <button
                type="button"
                className="flex items-center justify-between w-full px-3 py-2.5 text-[14px] font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors cursor-pointer border-none bg-transparent"
                onClick={() => setMobileExpanded(mobileExpanded === key ? null : key)}
              >
                {section.en}
                <ChevronDown
                  size={14}
                  className="text-gray-400 transition-transform duration-200 flex-shrink-0"
                  style={{ transform: mobileExpanded === key ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </button>

              {mobileExpanded === key && (
                <div className="ml-3 pl-3 mt-0.5 mb-1 space-y-0.5" style={{ borderLeft: '2px solid #DBEAFE' }}>
                  {section.items.map((item, i) => (
                    <MobileItem key={i} item={item} depth={0} onClose={closeAll} />
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Extra links */}
          <div className="pt-3 mt-2 space-y-0.5" style={{ borderTop: '1px solid #F3F4F6' }}>
            <Link
              href="/pricing"
              onClick={closeAll}
              className="block px-3 py-2.5 text-[14px] font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors no-underline"
            >
              Pricing
            </Link>
            <Link
              href="/contact"
              onClick={closeAll}
              className="block px-3 py-2.5 text-[14px] font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors no-underline"
            >
              Contact
            </Link>
          </div>

          {/* Login button — only when logged out */}
          {!user && (
            <div className="pt-3 mt-2" style={{ borderTop: '1px solid #F3F4F6' }}>
              <Link
                href="/login"
                onClick={closeAll}
                className="block text-center py-2 text-[13px] font-medium text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 no-underline"
              >
                Login
              </Link>
            </div>
          )}

        </div>
      </div>
    </nav>
  )
}