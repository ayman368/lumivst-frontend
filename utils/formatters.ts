export const formatSAR = (value: number): string => {
  if (value >= 1000) return `﷼${(value / 1000).toFixed(1)}K`
  return `﷼${value.toLocaleString('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export const formatPct = (value: number): string =>
  `${value > 0 ? '+' : ''}${value.toFixed(2)}%`
