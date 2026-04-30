import type { ReactNode } from 'react'
import Link from 'next/link'

import type { CompanyMeta } from '@/types/xbrl-financials'

interface Props {
  meta?: CompanyMeta
}

export function XbrlTopBar({ meta }: Props) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-[var(--border)] bg-bg2 px-5">
      <Link href="/" className="whitespace-nowrap text-[15px] font-bold tracking-tight text-accent">
        XBRL Viewer
      </Link>
      <div className="h-5 w-px bg-[var(--border)]" />
      {meta ? (
        <>
          <span className="truncate text-[13px] font-semibold text-text">{meta.company_name}</span>
          <div className="flex flex-wrap items-center gap-2">
            {meta.symbol && (
              <span className="text-[12px] text-text2">
                <span className="text-text3">Symbol: </span>
                <span className="font-mono font-semibold">{meta.symbol}</span>
              </span>
            )}
            {meta.sector && <span className="hidden text-[11px] text-text3 sm:inline">{meta.sector}</span>}
            {meta.currency && <Badge>{meta.currency}</Badge>}
            {meta.rounding && <Badge variant="amber">{meta.rounding}</Badge>}
            {meta.status && <Badge variant="green">{meta.status}</Badge>}
          </div>
        </>
      ) : (
        <span className="text-[13px] text-text3">No company selected</span>
      )}
      <div className="ml-auto">
        <Link
          href="/stocks"
          className="rounded-md border border-[var(--border2)] bg-bg3 px-3 py-1.5 text-[12px] text-text hover:bg-bg4"
        >
          Back to Stocks
        </Link>
      </div>
    </header>
  )
}

function Badge({
  children,
  variant = 'blue',
}: {
  children: ReactNode
  variant?: 'blue' | 'green' | 'amber'
}) {
  const cls = {
    blue: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
    green: 'border-green-500/20 bg-green-500/10 text-green-400',
    amber: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
  }[variant]

  return <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${cls}`}>{children}</span>
}
