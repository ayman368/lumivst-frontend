'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '../app/providers/AuthProvider'
import styles from '../app/styles/Navbar.module.css'

export default function Navbar() {
  const [activeMobile, setActiveMobile] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const navbarRef = useRef<HTMLDivElement>(null)
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

  const handleLogout = async () => {
    try {
      await logout()
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
      <nav className={styles['navbar-gf']} dir="ltr">
        <div className={styles['navbar-container']}>
          <Link href="/" className={styles['navbar-logo']}>
            LUMIVST
          </Link>
          <div className={styles['navbar-actions']}>
            <button className={styles['navbar-mobile-toggle']}>☰</button>
          </div>
        </div>
      </nav>
    )
  }

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
              <button
                onClick={handleLogout}
                className={`${styles['navbar-auth-link']} ${styles.login}`}
              >
                Logout
              </button>
            ) : (
              <>
                <Link href="/login" className={`${styles['navbar-auth-link']} ${styles.login}`}>
                  Login
                </Link>
                <Link href="/register" className={`${styles['navbar-auth-link']} ${styles.signup}`}>
                  Sign Up
                </Link>
              </>
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