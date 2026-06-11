'use client'

import { MagnifyingGlassIcon, PlusIcon, ChevronDownIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import ThemeToggle from '../shared/ThemeToggle'

interface TopBarProps {
  onAddTransaction: () => void
}

export default function TopBar({ onAddTransaction }: TopBarProps) {
  return (
    <header className="h-[56px] bg-[var(--bg-surface)] border-b border-[var(--border)] flex items-center justify-between px-6 shrink-0">
      
      {/* Right side (User removed as requested) */}
      <div className="flex items-center w-[120px]">
        {/* Placeholder to keep layout balanced */}
      </div>

      {/* Center (Search) */}
      <div className="flex-1 max-w-md mx-6">
        <div className="relative">
          <MagnifyingGlassIcon className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input 
            type="text" 
            placeholder="ابحث بالاسم أو رمز التداول" 
            className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-md py-1.5 pr-10 pl-4 text-sm focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)] placeholder-[var(--text-muted)] font-tajawal"
          />
        </div>
      </div>

      {/* Left side (Actions) */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onAddTransaction}
          className="flex items-center gap-1.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors font-tajawal"
        >
          <PlusIcon className="w-4 h-4" />
          <span>إضافة عملية</span>
        </button>
        <ThemeToggle />
      </div>

    </header>
  )
}
