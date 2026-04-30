import clsx from 'clsx'

import { fmtNum, fmtPct } from '@/lib/xbrl-format'
import type { KPI } from '@/types/xbrl-financials'

interface Props {
  kpi: KPI
  loading?: boolean
}

export function XbrlKpiCard({ kpi, loading }: Props) {
  if (loading) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-bg2 p-4">
        <div className="skeleton mb-2 h-3 w-24" />
        <div className="skeleton h-7 w-32" />
        <div className="skeleton mt-2 h-3 w-16" />
      </div>
    )
  }

  const pct = fmtPct(kpi.value, kpi.prev_value)
  const isUp = pct?.startsWith('+')
  const isDown = pct?.startsWith('-')

  return (
    <div className="rounded-lg border border-[var(--border)] bg-bg2 p-4 transition-colors hover:border-[var(--border2)]">
      <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-text3">{kpi.label}</p>
      <p className="num text-[22px] font-bold leading-none text-text">{fmtNum(kpi.value)}</p>
      <div className="mt-2 flex items-center gap-2">
        {pct && (
          <span
            className={clsx(
              'text-[11px] font-semibold',
              isUp && 'text-[var(--accent-g)]',
              isDown && 'text-[var(--accent-r)]',
              !isUp && !isDown && 'text-text2',
            )}
          >
            {isUp ? '▲' : isDown ? '▼' : ''} {pct}
          </span>
        )}
        {kpi.prev_period && <span className="text-[10px] text-text3">vs {kpi.prev_period}</span>}
      </div>
    </div>
  )
}

export function XbrlKpiGrid({ kpis, loading }: { kpis?: KPI[]; loading?: boolean }) {
  const items = loading ? Array(4).fill(null) : kpis ?? []
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((kpi, i) => (loading ? <XbrlKpiCard key={i} kpi={{} as KPI} loading /> : <XbrlKpiCard key={`${kpi.label}-${i}`} kpi={kpi} />))}
    </div>
  )
}
