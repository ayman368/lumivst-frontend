'use client'

import clsx from 'clsx'
import { useMemo, useState } from 'react'

import { buildPeriodMap, filterPeriodsByType, fmtNum, periodLabel } from '@/lib/xbrl-format'
import {
  PERIOD_FILTER_LABELS,
  type EquityMatrixItem,
  type PeriodFilter,
  type PeriodMeta,
} from '@/types/xbrl-financials'

interface Props {
  items: EquityMatrixItem[]
  periods: string[]
  periodMeta?: PeriodMeta[]
  components: string[]
  loading?: boolean
}

const TOTAL_FRAGS = ['total equity', 'total changes', 'equity balance']

function isTotal(label: string) {
  const l = label.toLowerCase()
  return TOTAL_FRAGS.some((f) => l.includes(f))
}

export function XbrlEquityTable({ items, periods, periodMeta, components, loading }: Props) {
  const [selectedPeriod, setSelectedPeriod] = useState<string>(periods[periods.length - 1] ?? '')
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all')
  const [search, setSearch] = useState('')

  const periodMap = useMemo(() => buildPeriodMap(periods, periodMeta), [periods, periodMeta])

  const availableFilters = useMemo(() => {
    const types = new Set<string>()
    periodMap.forEach((m) => types.add(m.period_type))
    const filters: PeriodFilter[] = []
    if (types.has('Q')) filters.push('Q')
    if (types.has('H1') || types.has('9M') || types.has('FY')) filters.push('ytd')
    filters.push('all')
    return filters
  }, [periodMap])

  const filteredPeriods = useMemo(
    () => filterPeriodsByType(periods, periodMap, periodFilter),
    [periods, periodMap, periodFilter],
  )

  // Auto-select last period when filter changes
  useMemo(() => {
    if (filteredPeriods.length > 0 && !filteredPeriods.includes(selectedPeriod)) {
      setSelectedPeriod(filteredPeriods[filteredPeriods.length - 1])
    }
  }, [filteredPeriods, selectedPeriod])

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items
    const q = search.toLowerCase()
    return items.filter((item) => item.is_header || item.label.toLowerCase().includes(q))
  }, [items, search])

  if (loading) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-bg2 p-5">
        <div className="mb-4 h-4 w-40 animate-pulse rounded bg-bg3" />
        <div className="h-[300px] w-full animate-pulse rounded bg-bg3" />
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-bg2">
      {/* Top Bar: Search + Period Type Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
        <input
          type="text"
          placeholder="Search line items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 w-48 rounded-md border border-[var(--border)] bg-bg3 px-3 text-[12px] text-text placeholder:text-text3 focus:border-accent focus:outline-none"
        />
        {availableFilters.length > 1 && (
          <div className="flex overflow-hidden rounded-md border border-[var(--border)]">
            {availableFilters.map((f) => (
              <button
                key={f}
                onClick={() => setPeriodFilter(f)}
                className={clsx(
                  'px-3 py-1 text-[11px] font-medium transition-colors',
                  periodFilter === f
                    ? 'bg-accent text-white'
                    : 'hover:bg-bg3 text-text2',
                )}
              >
                {PERIOD_FILTER_LABELS[f]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Period Selector Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-[var(--border)] px-4 py-2">
        <span className="text-[10px] uppercase font-bold text-text3 tracking-wider mr-2 self-center">Period:</span>
        {filteredPeriods.map((p) => (
          <button
            key={p}
            onClick={() => setSelectedPeriod(p)}
            className={clsx(
              'rounded-full border px-2.5 py-0.5 text-[10px] font-semibold transition-colors',
              selectedPeriod === p
                ? 'border-accent/40 bg-accent/15 text-accent'
                : 'border-[var(--border)] bg-bg3 text-text3 hover:text-text2',
            )}
          >
            {periodLabel(p)}
          </button>
        ))}
      </div>

      {/* Pivot Table: rows=items, cols=components */}
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="sticky left-0 z-10 min-w-[220px] bg-bg2 px-3 py-2 text-left font-semibold text-text3">
                Line Item
              </th>
              {components.map((comp) => (
                <th
                  key={comp}
                  className="whitespace-nowrap px-3 py-2 text-right font-semibold text-text3"
                >
                  {comp}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td
                  colSpan={components.length + 1}
                  className="px-4 py-10 text-center text-text3"
                >
                  {search ? `No results for "${search}"` : 'No data available'}
                </td>
              </tr>
            ) : (
              filteredItems.map((item, idx) => {
                if (item.is_header) {
                  return (
                    <tr key={`${item.label}-${idx}`} className="bg-bg3/50">
                      <td
                        colSpan={components.length + 1}
                        className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-text3"
                      >
                        {item.label}
                      </td>
                    </tr>
                  )
                }

                const periodValues = item.values?.[selectedPeriod] ?? {}
                const total = isTotal(item.label)

                return (
                  <tr
                    key={`${item.label}-${idx}`}
                    className={clsx(
                      'border-b border-[var(--border)] transition-colors hover:bg-bg3/40',
                      total && 'bg-bg3/20',
                    )}
                  >
                    <td
                      className={clsx(
                        'sticky left-0 z-10 bg-bg2 max-w-[280px] overflow-hidden px-3 py-1.5 text-ellipsis whitespace-nowrap',
                        total ? 'font-semibold text-text' : 'text-text2',
                      )}
                      title={item.label}
                    >
                      {item.label}
                    </td>
                    {components.map((comp) => {
                      const v = periodValues[comp] ?? null
                      const isNeg = typeof v === 'number' && v < 0
                      return (
                        <td
                          key={`${item.label}-${comp}`}
                          className={clsx(
                            'num whitespace-nowrap px-3 py-1.5 text-right',
                            total && 'font-semibold text-text',
                            isNeg && !total && 'text-[var(--accent-r)]',
                            v == null && 'text-text3',
                          )}
                        >
                          {v != null ? fmtNum(v) : '—'}
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
