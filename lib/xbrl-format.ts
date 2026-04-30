import type { PeriodMeta, PeriodType } from '@/types/xbrl-financials'

export function fmtNum(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—'
  return value.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

/** Abbreviated format for chart Y-axis only */
export function fmtAxisNum(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return ''
  const abs = Math.abs(value)
  if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${(value / 1_000).toFixed(0)}K`
  return value.toString()
}

export function fmtPct(current: number | null, previous: number | null): string | null {
  if (current == null || previous == null || previous === 0) return null
  const pct = ((current - previous) / Math.abs(previous)) * 100
  const sign = pct > 0 ? '+' : ''
  return `${sign}${pct.toFixed(2)}%`
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/**
 * Convert a period key to a human-readable label.
 *
 * Snapshot:  "2021-06"          → "Jun 2021"
 * Flow Q:   "2021-04_2021-06"  → "Q2 2021"
 * Flow H1:  "2021-01_2021-06"  → "H1 2021"
 * Flow 9M:  "2021-01_2021-09"  → "9M 2021"
 * Flow FY:  "2021-01_2021-12"  → "FY 2021"
 */
export function periodLabel(period: string): string {
  // Snapshot format: "2021-06"
  const snap = /^(\d{4})-(\d{2})$/.exec(period)
  if (snap) {
    const [, year, month] = snap
    const mi = parseInt(month, 10) - 1
    return `${MONTH_NAMES[mi] ?? month}/${year}`
  }

  // Flow format: "2021-04_2021-06"
  const flow = /^(\d{4})-(\d{2})_(\d{4})-(\d{2})$/.exec(period)
  if (flow) {
    const [, , sm, ey, em] = flow
    const startMonth = parseInt(sm, 10)
    const endMonth = parseInt(em, 10)
    const startYear = parseInt(flow[1], 10)
    const endYear = parseInt(ey, 10)
    const months = (endYear - startYear) * 12 + (endMonth - startMonth) + 1

    if (months <= 3) {
      const q = Math.ceil(endMonth / 3)
      return `Q${q} ${ey}`
    }
    if (months <= 6) return `H1 ${ey}`
    if (months <= 9) return `9M ${ey}`
    return `FY ${ey}`
  }

  return period
}

/**
 * Determine the period type from a period key string.
 * Used as fallback when period_meta is not available.
 */
export function inferPeriodType(key: string): PeriodType {
  if (!key.includes('_')) return 'snapshot'
  const flow = /^(\d{4})-(\d{2})_(\d{4})-(\d{2})$/.exec(key)
  if (!flow) return 'unknown'
  const months =
    (parseInt(flow[3], 10) - parseInt(flow[1], 10)) * 12 +
    (parseInt(flow[4], 10) - parseInt(flow[2], 10)) +
    1
  if (months <= 3) return 'Q'
  if (months <= 6) return 'H1'
  if (months <= 9) return '9M'
  return 'FY'
}

/**
 * Build a Map<key, PeriodMeta> from period_meta array.
 * Falls back to inferring from key if period_meta is missing.
 */
export function buildPeriodMap(
  periods: string[],
  periodMeta?: PeriodMeta[],
): Map<string, PeriodMeta> {
  const map = new Map<string, PeriodMeta>()

  if (periodMeta?.length) {
    for (const pm of periodMeta) map.set(pm.key, pm)
  }

  // Fill in any missing keys with inferred values
  for (const key of periods) {
    if (!map.has(key)) {
      map.set(key, { key, start: '', end: '', period_type: inferPeriodType(key) })
    }
  }

  return map
}

/**
 * Filter periods by period type.
 * 'all'      → everything
 * 'Q'        → quarterly only
 * 'ytd'      → H1 + 9M + FY
 * 'snapshot'  → snapshot only (balance sheet dates)
 */
export function filterPeriodsByType(
  periods: string[],
  periodMap: Map<string, PeriodMeta>,
  filter: string,
): string[] {
  if (filter === 'all') return periods
  if (filter === 'ytd') {
    return periods.filter((p) => {
      const t = periodMap.get(p)?.period_type
      return t === 'H1' || t === '9M' || t === 'FY'
    })
  }
  return periods.filter((p) => periodMap.get(p)?.period_type === filter)
}
