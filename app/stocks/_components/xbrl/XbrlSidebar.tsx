'use client'

import clsx from 'clsx'

import { NAVIGABLE_SECTIONS, SECTION_LABELS, type SectionKey } from '@/types/xbrl-financials'

const SECTION_ICONS: Record<string, string> = {
  balance_sheet: '🏛',
  income_statement: '📈',
  cash_flow: '💧',
  other_comprehensive_income: '📋',
  equity_changes: '⚖',
}

interface Props {
  availableSections: string[]
  currentSection: SectionKey
  onSelect: (s: SectionKey) => void
}

export function XbrlSidebar({ availableSections, currentSection, onSelect }: Props) {
  const sections = NAVIGABLE_SECTIONS.filter((s) => availableSections.includes(s))

  return (
    <aside className="w-[196px] min-w-[196px] overflow-y-auto border-r border-[var(--border)] bg-bg2 py-4">
      <p className="px-4 pb-2 text-[10px] font-bold uppercase tracking-widest text-text3">Statements</p>
      {sections.map((sec) => (
        <button
          key={sec}
          onClick={() => onSelect(sec)}
          className={clsx(
            'flex w-full items-center gap-2 px-4 py-2 text-left text-[12px] font-medium transition-colors',
            currentSection === sec ? 'bg-accent/10 text-accent' : 'text-text2 hover:bg-bg3 hover:text-text',
          )}
        >
          <span className="text-[14px]">{SECTION_ICONS[sec] ?? '📄'}</span>
          {SECTION_LABELS[sec] ?? sec}
        </button>
      ))}
    </aside>
  )
}
