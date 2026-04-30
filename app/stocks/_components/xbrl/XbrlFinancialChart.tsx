'use client'

import clsx from 'clsx'
import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { fmtAxisNum, fmtNum, periodLabel } from '@/lib/xbrl-format'
import type { FinancialItem, PeriodMeta } from '@/types/xbrl-financials'

const COLORS = ['#3b82f6', '#1d9e75', '#f59e0b', '#e24b4a', '#a855f7', '#06b6d4']

const DEFAULT_METRICS: Record<string, string[]> = {
  balance_sheet: ['total assets', 'total equity', 'total liabilities'],
  income_statement: ['total operating income', 'profit (loss) for the period', 'total operating expenses'],
  cash_flow: ['net cash from operating', 'net cash from investing', 'net cash from financing'],
}

interface Props {
  items: FinancialItem[]
  periods: string[]
  periodMeta?: PeriodMeta[]
  sectionKey: string
  loading?: boolean
}

function findItem(items: FinancialItem[], frag: string): FinancialItem | undefined {
  return items.find((i) => !i.is_header && i.label.toLowerCase().includes(frag.toLowerCase()))
}

export function XbrlFinancialChart({ items, periods, periodMeta, sectionKey, loading }: Props) {
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar')
  const [activeMetrics, setActiveMetrics] = useState<Set<string>>(new Set(DEFAULT_METRICS[sectionKey] ?? []))

  useEffect(() => {
    setActiveMetrics(new Set(DEFAULT_METRICS[sectionKey] ?? []))
  }, [sectionKey])

  const chartableItems = useMemo(
    () => items.filter((i) => !i.is_header && Object.values(i.values).some((v) => typeof v === 'number')),
    [items],
  )

  const selectedItems = useMemo(() => {
    const result: FinancialItem[] = []
    activeMetrics.forEach((frag) => {
      const item = findItem(items, frag)
      if (item) result.push(item)
    })
    if (result.length === 0) {
      const defaults = DEFAULT_METRICS[sectionKey] ?? []
      defaults.forEach((frag) => {
        const item = findItem(items, frag)
        if (item) result.push(item)
      })
    }
    return result
  }, [items, activeMetrics, sectionKey])

  const chartData = useMemo(
    () =>
      periods.map((p) => {
        const row: Record<string, string | number | null> = { period: periodLabel(p) }
        selectedItems.forEach((item) => {
          const v = item.values[p]
          row[item.label] = typeof v === 'number' ? v : null
        })
        return row
      }),
    [periods, selectedItems],
  )

  function toggleMetric(label: string) {
    const frag = label.toLowerCase().slice(0, 40)
    setActiveMetrics((prev) => {
      const next = new Set(prev)
      const existing = [...next].find(
        (m) => label.toLowerCase().includes(m) || m.includes(label.toLowerCase().slice(0, 20)),
      )
      if (existing) {
        next.delete(existing)
      } else {
        if (next.size >= 4) {
          const first = next.values().next().value
          if (first) next.delete(first)
        }
        next.add(frag)
      }
      return next
    })
  }

  function isActive(label: string) {
    return [...activeMetrics].some(
      (m) => label.toLowerCase().includes(m) || m.includes(label.toLowerCase().slice(0, 20)),
    )
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-bg2 p-5">
        <div className="mb-4 h-4 w-40 animate-pulse rounded bg-bg3" />
        <div className="h-[240px] w-full animate-pulse rounded bg-bg3" />
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-[var(--border)] bg-bg2 p-5">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="text-[13px] font-semibold text-text">Chart</span>
        <div className="flex overflow-hidden rounded-md border border-[var(--border)]">
          {(['bar', 'line'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setChartType(t)}
              className={clsx(
                'px-3 py-1 text-[11px] font-medium capitalize transition-colors',
                chartType === t ? 'bg-accent text-white' : 'bg-transparent text-text2 hover:text-text',
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {chartableItems.slice(0, 18).map((item) => (
          <button
            key={item.label}
            onClick={() => toggleMetric(item.label)}
            className={clsx(
              'whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[10px] font-medium transition-colors',
              isActive(item.label)
                ? 'border-accent/40 bg-accent/15 text-accent'
                : 'border-[var(--border)] bg-bg3 text-text3 hover:text-text2',
            )}
          >
            {item.label.length > 32 ? `${item.label.slice(0, 30)}...` : item.label}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={260}>
        {chartType === 'bar' ? (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="period" tick={{ fill: 'var(--text3)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fill: 'var(--text3)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => fmtAxisNum(v)}
              width={56}
            />
            <Tooltip />
            {selectedItems.map((item, i) => (
              <Bar key={item.label} dataKey={item.label} fill={COLORS[i % COLORS.length]} fillOpacity={0.85} />
            ))}
          </BarChart>
        ) : (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="period" tick={{ fill: 'var(--text3)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fill: 'var(--text3)', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => fmtAxisNum(v)}
              width={56}
            />
            <Tooltip />
            {selectedItems.map((item, i) => (
              <Line
                key={item.label}
                dataKey={item.label}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 3, fill: COLORS[i % COLORS.length] }}
                activeDot={{ r: 5 }}
                connectNulls
              />
            ))}
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  )
}
