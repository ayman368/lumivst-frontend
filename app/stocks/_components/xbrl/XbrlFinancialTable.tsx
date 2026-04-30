'use client'

import clsx from 'clsx'
import { useEffect, useMemo, useState } from 'react'

import { fmtNum, periodLabel } from '@/lib/xbrl-format'
import type { FinancialItem, PeriodMeta, SectionKey } from '@/types/xbrl-financials'

interface Props {
  items: FinancialItem[]
  periods: string[]
  periodMeta?: PeriodMeta[]
  sectionKey?: SectionKey
  loading?: boolean
}

const TOTAL_FRAGS = [
  'total assets',
  'total liabilities',
  'total equity',
  'total liabilities and equity',
  'total current assets',
  'total non-current assets',
  'total current liabilities',
  'total non-current liabilities',
  'gross profit',
  'operating profit',
  'profit for the period',
  'net profit',
  'total operating income',
  'total operating expenses',
  'net cash from operating',
  'net cash from investing',
  'net cash from financing',
  'net change in cash',
]

function isTotal(label: string) {
  const l = label.toLowerCase()
  return TOTAL_FRAGS.some((f) => l.includes(f))
}

export function XbrlFinancialTable({ items, periods, periodMeta, sectionKey, loading }: Props) {
  const [search, setSearch] = useState('')
  const [activePeriods, setActivePeriods] = useState<Set<string>>(new Set(periods.slice(-5)))

  useEffect(() => {
    setActivePeriods((prev) => {
      const next = new Set(periods.slice(-5))
      periods.forEach((p) => {
        if (prev.has(p)) next.add(p)
      })
      return next
    })
  }, [periods])

  const shownPeriods = useMemo(() => periods.filter((p) => activePeriods.has(p)), [periods, activePeriods])

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items
    const q = search.toLowerCase()
    return items.filter((item) => item.is_header || item.label.toLowerCase().includes(q))
  }, [items, search])

  function togglePeriod(period: string) {
    setActivePeriods((prev) => {
      const next = new Set(prev)
      if (next.has(period)) {
        if (next.size > 1) next.delete(period)
      } else {
        next.add(period)
      }
      return next
    })
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-bg2">
      <div className="flex flex-wrap items-center gap-3 border-b border-[var(--border)] px-4 py-3">
        <input
          type="text"
          placeholder="Search line items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 w-52 rounded-md border border-[var(--border)] bg-bg3 px-3 text-[12px] text-text placeholder:text-text3 focus:border-accent focus:outline-none"
        />
        <div className="ml-auto flex flex-wrap gap-1.5">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => togglePeriod(p)}
              className={clsx(
                'rounded-full border px-2.5 py-0.5 text-[10px] font-semibold transition-colors',
                activePeriods.has(p)
                  ? 'border-accent/40 bg-accent/15 text-accent'
                  : 'border-[var(--border)] bg-bg3 text-text3 hover:text-text2',
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="min-w-[220px] px-3 py-2 text-left font-semibold text-text3">Line Item</th>
              {shownPeriods.map((p) => (
                <th key={p} className="whitespace-nowrap px-3 py-2 text-right font-semibold text-text3">
                  {periodLabel(p)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={shownPeriods.length + 1} className="px-4 py-8 text-center text-text3">
                  Loading...
                </td>
              </tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan={shownPeriods.length + 1} className="px-4 py-10 text-center text-text3">
                  No results for "{search}"
                </td>
              </tr>
            ) : (
              filteredItems.map((item, idx) => {
                if (item.is_header) {
                  return (
                    <tr key={`${item.label}-${idx}`} className="bg-bg3/50">
                      <td colSpan={shownPeriods.length + 1} className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-text3">
                        {item.label}
                      </td>
                    </tr>
                  )
                }
                const total = isTotal(item.label)
                return (
                  <tr
                    key={`${item.label}-${idx}`}
                    className={clsx(
                      'last:border-0 border-b border-[var(--border)] transition-colors hover:bg-bg3/40',
                      total && 'bg-bg3/20',
                    )}
                  >
                    <td
                      className={clsx(
                        'max-w-[280px] overflow-hidden px-3 py-1.5 text-ellipsis whitespace-nowrap',
                        total ? 'font-semibold text-text' : 'text-text2',
                      )}
                      title={item.label}
                    >
                      {item.label}
                    </td>
                    {shownPeriods.map((p) => {
                      const v = item.values[p]
                      const isNum = typeof v === 'number'
                      const isNeg = isNum && v < 0
                      return (
                        <td
                          key={`${item.label}-${p}`}
                          className={clsx(
                            'num whitespace-nowrap px-3 py-1.5 text-right',
                            total && 'font-semibold text-text',
                            isNeg && !total && 'text-[var(--accent-r)]',
                            !total && !isNeg && isNum && 'text-text2',
                            v == null && 'text-text3',
                          )}
                        >
                          {v != null ? fmtNum(isNum ? v : null) : '—'}
                        </td>
                      )
                    })}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
