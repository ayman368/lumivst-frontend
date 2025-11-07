'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import styles from '../app/styles/Financials.module.css'

interface PeriodDropdownProps {
  currentPeriod: string
  symbol: string
  country: string
}

export default function PeriodDropdown({ currentPeriod, symbol, country }: PeriodDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const periodOptions = [
    { value: 'annual', label: 'Annual ' },
    { value: 'quarterly', label: ' Quarterly' }
  ]
  
  const currentLabel = periodOptions.find(opt => opt.value === currentPeriod)?.label || 'الفترة'
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={styles.periodDropdown} ref={dropdownRef}>
      <button
        className={styles.dropdownToggle}
        onClick={() => setIsOpen(!isOpen)}
      >
        {currentLabel}
        <span>▼</span>
      </button>
      <div className={`${styles.dropdownMenu} ${isOpen ? styles.show : ''}`}>
        {periodOptions.map((option) => (
          <Link
            key={option.value}
            href={`/stocks/${symbol}/financials?period=${option.value}&country=${encodeURIComponent(country)}`}
            className={`${styles.dropdownItem} ${currentPeriod === option.value ? styles.active : ''}`}
            onClick={() => setIsOpen(false)}
          >
            {option.label}
          </Link>
        ))}
      </div>
    </div>
  )
}