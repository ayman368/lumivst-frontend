'use client'

import { usePortfolioData } from '../../../hooks/usePortfolio'
import { formatSAR } from '../../../utils/formatters'

export default function TransactionsTab() {
  const { transactions } = usePortfolioData()

  // Sort transactions by date desc
  const sortedTransactions = [...transactions].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="space-y-6 font-tajawal animate-in fade-in duration-300">

      <div className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-[8px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="text-xs text-[var(--text-secondary)] bg-[var(--bg-surface)] border-b border-[var(--border)]">
              <tr>
                <th className="px-4 py-3 font-medium whitespace-nowrap">الرمز</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">التاريخ</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">نوع العملية</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">الكمية</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">سعر التنفيذ</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">إجمالي المبلغ</th>
              </tr>
            </thead>
            <tbody>
              {sortedTransactions.length > 0 ? sortedTransactions.map((t: any) => (
                <tr key={t.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-surface)] transition-colors h-[48px]">
                  <td className="px-4 py-2 whitespace-nowrap font-medium text-[var(--text-primary)]">{t.symbol}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-[var(--text-secondary)]">{t.date}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span className={`px-2 py-0.5 text-xs rounded border ${t.type === 'buy' || t.type === 'add' ? 'bg-[var(--green-bg)] text-[var(--green)] border-[var(--green)]' : 'bg-[var(--red-bg)] text-[var(--red)] border-[var(--red)]'
                      }`}>
                      {t.type === 'buy' ? 'شراء' : t.type === 'add' ? 'إضافة' : 'بيع'}
                    </span>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-[var(--text-primary)]">{t.qty}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-[var(--text-primary)]">﷼{t.price.toFixed(2)}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-[var(--text-primary)]">{formatSAR(t.value || (t.qty * t.price))}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[var(--text-muted)]">
                    لا توجد عمليات حالياً. ابدأ بإضافة عمليات.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
