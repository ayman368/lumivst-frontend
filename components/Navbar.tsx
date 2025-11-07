'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

export default function Navbar() {
  const [activeMobile, setActiveMobile] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const navbarRef = useRef<HTMLDivElement>(null)

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
        { en: 'Technical', href: '/screeners/technical' },
        { en: 'Top Traders', href: '/screeners/top-traders' },
        { en: 'My Screens', href: '/screeners/my-screens' },
      ],
    },

    market: {
      en: 'Market',
      href: '/market',
      items: [
        { en: 'Economy', href: '/market/economy' },
        { en: 'US Market', href: '/market/us' },
        { en: 'Saudi Market', href: '/market/saudi' },
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

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (navbarRef.current && !navbarRef.current.contains(event.target as Node)) {
        setActiveDropdown(null)
        setActiveMobile(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    setIsMounted(true)
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Prevent hydration mismatch by not rendering until mounted
  if (!isMounted) {
    return (
      <nav className="navbar-gf" dir="ltr">
        <div className="navbar-container">
          <Link href="/" className="navbar-logo">
            LUMIVST
          </Link>
          <div className="navbar-actions">
            <button className="navbar-mobile-toggle">☰</button>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav
      className="navbar-gf"
      ref={navbarRef}
      dir="ltr"
    >
      <div className="navbar-container">
        {/* Logo */}
        <Link href="/" className="navbar-logo">
          LUMIVST
        </Link>

        {/* Main Menu */}
        <div className={`navbar-menu ${activeMobile ? 'active' : ''}`}>
          {Object.entries(menuItems).map(([key, item]) => (
            <div
              key={key}
              className={`navbar-item ${activeDropdown === key ? 'active' : ''}`}
              onMouseEnter={() => !activeMobile && setActiveDropdown(key)}
              onMouseLeave={() => !activeMobile && setActiveDropdown(null)}
            >
              <button
                className="navbar-link"
                onClick={() => activeMobile && toggleDropdown(key)}
              >
                {item.en}
                <svg
                  className="navbar-arrow"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              <div className="navbar-dropdown">
                {item.items.map((subItem, index) => (
                  <Link
                    key={index}
                    href={subItem.href}
                    className="navbar-dropdown-link"
                    onClick={() => {
                      setActiveMobile(false)
                      setActiveDropdown(null)
                    }}
                  >
                    {subItem.en}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Auth Actions */}
        <div className="navbar-actions">
          <div className="navbar-auth">
            {/* Pricing هنا جنب الـ Login */}
            <Link href="/pricing" className="navbar-link">
              Pricing
            </Link>
            <Link href="/login" className="navbar-auth-link login">
              Login
            </Link>
            <Link href="/register" className="navbar-auth-link signup">
              Sign Up
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button className="navbar-mobile-toggle" onClick={toggleMobile}>
            ☰
          </button>
        </div>
      </div>
    </nav>
  )
}