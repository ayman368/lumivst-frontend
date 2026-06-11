'use client'

import { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: ReactNode
  subtitle?: ReactNode
  icon: ReactNode
  onEdit?: () => void
}

export default function StatCard({ title, value, subtitle, icon, onEdit }: StatCardProps) {
  return (
    <div className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-[8px] p-4 flex flex-col justify-between h-full font-tajawal shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-[var(--text-secondary)]">{title}</h3>
        <div className="flex items-center gap-2">
          {onEdit && (
            <button 
              onClick={onEdit}
              className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          )}
          <div className="text-[var(--text-muted)] w-5 h-5 flex items-center justify-center">
            {icon}
          </div>
        </div>
      </div>
      <div>
        <div className="text-2xl font-bold text-[var(--text-primary)] mb-1">{value}</div>
        {subtitle && (
          <div className="text-xs text-[var(--text-muted)]">{subtitle}</div>
        )}
      </div>
    </div>
  )
}
