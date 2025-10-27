'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

export default function Navbar() {
  const [activeMobile, setActiveMobile] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [language, setLanguage] = useState<'ar' | 'en'>('ar')
  const navbarRef = useRef<HTMLDivElement>(null)

  const menuItems = {
    home: {
      ar: 'الرئيسية',
      en: 'Home',
      href: '/',
      items: [
        { ar: 'لوحة التحكم', en: 'Dashboard', href: '/dashboard' },
        { ar: 'المحافظ', en: 'Portfolios', href: '/portfolios' },
        { ar: 'العضوية', en: 'Membership', href: '/membership' },
        { ar: 'عن الموقع', en: 'About Us', href: '/about' },
      ],
    },
    screeners: {
      ar: 'المصفيات',
      en: 'Screeners',
      href: '/screeners',
      items: [
        { ar: 'تحليل أساسي', en: 'Fundamental', href: '/screeners/fundamental' },
        { ar: 'تحليل فني', en: 'Technical', href: '/screeners/technical' },
        { ar: 'أفضل المتداولين', en: 'Top Traders', href: '/screeners/top-traders' },
        { ar: 'شاشاتي', en: 'My Screens', href: '/screeners/my-screens' },
      ],
    },
    gurus: {
      ar: 'الخبراء',
      en: 'Gurus',
      href: '/gurus',
      items: [
        { ar: 'كل الخبراء', en: 'All Gurus', href: '/gurus' },
        { ar: 'أفضل المستثمرين', en: 'Top Investors', href: '/gurus/top' },
        { ar: 'محافظ الخبراء', en: 'Guru Portfolios', href: '/gurus/portfolios' },
        { ar: 'تحليل الخبراء', en: 'Guru Analysis', href: '/gurus/analysis' },
      ],
    },
    insiders: {
      ar: 'المتعاملون',
      en: 'Insiders',
      href: '/insiders',
      items: [
        { ar: 'صفقات المطلعين', en: 'Insider Trades', href: '/insiders/trades' },
        { ar: 'ممتلكات المطلعين', en: 'Insider Holdings', href: '/insiders/holdings' },
        { ar: 'تحليل المطلعين', en: 'Insider Analysis', href: '/insiders/analysis' },
      ],
    },
    market: {
      ar: 'السوق',
      en: 'Market',
      href: '/market',
      items: [
        { ar: 'الاقتصاد', en: 'Economy', href: '/market/economy' },
        { ar: 'السوق الأمريكي', en: 'US Market', href: '/market/us' },
        { ar: 'السوق السعودي', en: 'Saudi Market', href: '/market/saudi' },
        { ar: 'القطاعات', en: 'Sectors', href: '/market/sectors' },
      ],
    },
    news: {
      ar: 'الأخبار',
      en: 'News',
      href: '/news',
      items: [
        { ar: 'كل الأخبار', en: 'All News', href: '/news' },
        { ar: 'تقارير الأرباح', en: 'Earning Reports', href: '/news/earnings' },
        { ar: 'الإفصاحات', en: 'Disclosures', href: '/news/disclosures' },
        { ar: 'تقارير المحللين', en: 'Analyst Reports', href: '/news/analyst' },
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

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'ar' ? 'en' : 'ar'))
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
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <nav
      className="navbar-gf"
      ref={navbarRef}
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      <div className="navbar-container">
        {/* Logo */}
        <Link href="/" className="navbar-logo">
          {language === 'ar' ? 'LUMIVST' : 'LUMIVST'}
        </Link>

        {/* Main Menu */}
        <div className={`navbar-menu ${activeMobile ? 'active' : ''}`}>
          {/* الأسعار يظهر هنا فقط لما اللغة عربية */}
          {language === 'ar' && (
            <Link href="/pricing" className="navbar-link">
              الأسعار
            </Link>
          )}

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
                {item[language]}
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
                    {subItem[language]}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Auth Actions */}
        <div className="navbar-actions">
          <div className="navbar-auth">
            {/* الأسعار هنا فقط لما اللغة إنجليزية */}
            {language === 'en' && (
              <Link href="/pricing" className="navbar-link">
                Pricing
              </Link>
            )}

            <Link href="/login" className="navbar-auth-link login">
              {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
            </Link>
            <Link href="/register" className="navbar-auth-link signup">
              {language === 'ar' ? 'إنشاء حساب' : 'Sign Up'}
            </Link>
          </div>

          {/* زر تغيير اللغة */}
          <button onClick={toggleLanguage} className="navbar-link">
            {language === 'ar' ? 'EN' : 'AR'}
          </button>

          {/* Mobile Toggle */}
          <button className="navbar-mobile-toggle" onClick={toggleMobile}>
            ☰
          </button>
        </div>
      </div>
    </nav>
  )
}
