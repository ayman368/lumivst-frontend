'use client'

import { useState } from 'react'
import { usePortfolioData } from '../../../hooks/usePortfolio'

export default function EventsTab() {
  const [activeTab, setActiveTab] = useState<'financials' | 'dividends'>('dividends')
  const { events } = usePortfolioData()

  return (
    <div className="space-y-6 font-tajawal animate-in fade-in duration-300">
      
      <div className="flex gap-4 border-b border-[var(--border)]">
        <button 
          onClick={() => setActiveTab('dividends')}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 px-2 ${activeTab === 'dividends' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
        >
          التوزيعات النقدية
        </button>
        <button 
          onClick={() => setActiveTab('financials')}
          className={`pb-3 text-sm font-medium transition-colors border-b-2 px-2 ${activeTab === 'financials' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
        >
          النتائج المالية
        </button>
      </div>

      <div className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-[8px] shadow-sm overflow-hidden">
        {activeTab === 'dividends' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="text-xs text-[var(--text-secondary)] bg-[var(--bg-surface)] border-b border-[var(--border)]">
                <tr>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">الرمز</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">التاريخ</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">النوع</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">المبلغ/القيمة</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {events?.dividends && events.dividends.length > 0 ? events.dividends.map((row: any, i: number) => (
                  <tr key={i} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-surface)] transition-colors h-[48px]">
                    <td className="px-4 py-2 whitespace-nowrap font-medium text-[var(--text-primary)]">{row.symbol}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-[var(--text-secondary)]">{row.date}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-[var(--text-secondary)]">{row.title}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-[var(--text-primary)] font-medium">{row.amount ? `﷼${row.amount}` : '—'}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-[var(--text-primary)]">{row.status === 'upcoming' ? 'قادم' : 'سابق'}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-[var(--text-muted)]">
                      لا توجد توزيعات نقدية قادمة
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="text-xs text-[var(--text-secondary)] bg-[var(--bg-surface)] border-b border-[var(--border)]">
                <tr>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">الرمز</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">التاريخ</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">الحدث</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">الفترة</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {events?.financials && events.financials.length > 0 ? events.financials.map((row: any, i: number) => (
                  <tr key={i} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-surface)] transition-colors h-[48px]">
                    <td className="px-4 py-2 whitespace-nowrap font-medium text-[var(--text-primary)]">{row.symbol}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-[var(--text-secondary)]">{row.date}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-[var(--text-secondary)]">{row.title}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-[var(--text-primary)] font-medium">{row.period || '—'}</td>
                    <td className="px-4 py-2 whitespace-nowrap text-[var(--text-primary)]">{row.status === 'upcoming' ? 'قادم' : 'سابق'}</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-[var(--text-muted)]">
                      لا توجد نتائج مالية حديثة للشركات المستثمر فيها
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}
