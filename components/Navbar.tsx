'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '../app/providers/AuthProvider'
import styles from '../app/styles/Navbar.module.css'
import { User, LogOut } from 'lucide-react'

export default function Navbar() {
  const [activeMobile, setActiveMobile] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
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
        { en: 'Technical', href: '/screeners/technical' },
        { en: 'Top Traders', href: '/screeners/top-traders' },
        { en: 'Screeners', href: '/screeners/my-screens' },
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

  const handleLogout = async () => {
    try {
      await logout()
      setShowUserMenu(false)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  // Close dropdown when clicking outside
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
    setIsMounted(true)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])



  return (
    <nav
      className={styles['navbar-gf']}
      ref={navbarRef}
      dir="ltr"
    >
      <div className={styles['navbar-container']}>
        {/* Logo */}
        <Link href="/" className={styles['navbar-logo']}>
          LUMIVST
        </Link>

        {/* Main Menu */}
        <div className={`${styles['navbar-menu']} ${activeMobile ? styles.active : ''}`}>
          {Object.entries(menuItems).map(([key, item]) => (
            <div
              key={key}
              className={`${styles['navbar-item']} ${activeDropdown === key ? styles.active : ''}`}
              onMouseEnter={() => !activeMobile && setActiveDropdown(key)}
              onMouseLeave={() => !activeMobile && setActiveDropdown(null)}
            >
              <button
                className={styles['navbar-link']}
                onClick={() => activeMobile && toggleDropdown(key)}
              >
                {item.en}
                <svg
                  className={styles['navbar-arrow']}
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
              <div className={styles['navbar-dropdown']}>
                {item.items.map((subItem, index) => (
                  <Link
                    key={index}
                    href={subItem.href}
                    className={styles['navbar-dropdown-link']}
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
        <div className={styles['navbar-actions']}>
          <div className={styles['navbar-auth']}>
            <Link href="/stocks" className={styles['navbar-link']}>
              Stocks
            </Link>
            <Link href="/pricing" className={styles['navbar-link']}>
              Pricing
            </Link>
            <Link href="/contact" className={styles['navbar-link']}>
              Contact Us
            </Link>

            {/* Conditional Rendering based on user login status */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-200"
                >
                  <User size={20} className="text-blue-600" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100 transform origin-top-right">
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
              <Link href="/login" className={`${styles['navbar-auth-link']} ${styles.login}`}>
                Login
              </Link>
            )}
          </div>

          {/* Mobile Toggle */}
          <button className={styles['navbar-mobile-toggle']} onClick={toggleMobile}>
            ☰
          </button>
        </div>
      </div>
    </nav>
  )
}