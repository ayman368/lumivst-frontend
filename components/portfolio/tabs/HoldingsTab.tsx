'use client'

import { calcWeight } from '../../../utils/calculations'
import { formatSAR, formatPct } from '../../../utils/formatters'
import { usePortfolioData } from '../../../hooks/usePortfolio'

export default function HoldingsTab() {
  const { positions, cash } = usePortfolioData()
  
  const portfolioValue = positions.reduce((acc: number, s: any) => acc + s.qty * (s.current_price || s.buy_price), 0) + cash

  // Map data for heatmap and table
  const holdingsData = positions.map((s: any) => {
    const currentPrice = s.current_price || s.buy_price
    const currentValue = s.qty * currentPrice
    const totalCost = s.qty * s.buy_price
    
    // Calculate P/L
    const plValue = currentValue - totalCost
    const plPct = totalCost > 0 ? (plValue / totalCost) * 100 : 0
    
    // Weight
    const weight = calcWeight(currentValue, portfolioValue)
    
    // Mock attributes since these aren't returned currently
    const peRatio = "—"
    const rating = plPct > 5 ? 'شراء' : plPct < -5 ? 'بيع' : 'احتفاظ'

    // Real day change pct from backend
    const dayChangePct = s.change_percent ? (s.change_percent * 100) : 0

    return {
      stockSymbol: s.symbol,
      stockName: s.name || s.symbol,
      sector: s.sector || 'غير محدد',
      quantity: s.qty,
      avgCost: s.buy_price,
      currentPrice,
      currentValue,
      totalCost,
      plValue,
      plPct,
      weight,
      peRatio,
      rating,
      dayChangePct
    }
  }).sort((a: any, b: any) => b.weight - a.weight)

  return (
    <div className="space-y-6 font-tajawal animate-in fade-in duration-300">
      
      {/* Heatmap */}
      <div className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-[8px] p-4 shadow-sm">
        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">الخريطة الحرارية</h3>
        
        <div className="flex flex-wrap gap-1 rounded overflow-hidden" style={{ height: '240px' }}>
          {holdingsData.map((h, i) => {
            const isGreen = h.dayChangePct > 0
            const isRed = h.dayChangePct < 0
            const bgClass = isGreen ? 'bg-[var(--green)] text-white' : isRed ? 'bg-[var(--red)] text-white' : 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
            
            // Flex basis based on weight (min size for visibility)
            const flexBasis = Math.max(h.weight, 5)
            
            return (
              <div 
                key={i} 
                className={`flex-grow flex flex-col justify-center items-center rounded-sm transition-opacity hover:opacity-90 cursor-default ${bgClass}`}
                style={{ flexBasis: `${flexBasis}%` }}
                title={`${h.stockName}: ${formatPct(h.dayChangePct)}`}
              >
                <span className="font-bold text-sm truncate px-1 max-w-full">{h.stockName}</span>
                <span className={`text-xs ${isGreen || isRed ? 'text-white/90' : 'text-[var(--text-muted)]'}`}>
                  {formatPct(h.dayChangePct)}
                </span>
              </div>
            )
          })}
          {cash > 0 && (
            <div 
              className="flex-grow flex flex-col justify-center items-center bg-[var(--bg-elevated)] text-[var(--text-secondary)] rounded-sm"
              style={{ flexBasis: `${calcWeight(cash, portfolioValue)}%` }}
            >
              <span className="font-bold text-sm truncate px-1 max-w-full">النقد</span>
            </div>
          )}
        </div>
      </div>

      {/* Investments Table */}
      <div className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-[8px] shadow-sm overflow-hidden">
        <div className="px-4 py-4 border-b border-[var(--border)]">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">الاستثمارات</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="text-xs text-[var(--text-secondary)] bg-[var(--bg-surface)] border-b border-[var(--border)]">
              <tr>
                <th className="px-4 py-3 font-medium whitespace-nowrap">الاسم</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">القطاع</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">سعر السهم</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">الربح/الخسارة</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">الكمية</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">متوسط التكلفة</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">إجمالي التكلفة</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">نسبة المحفظة</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">القيمة الحالية</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">مكرر الربحية</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">تقييم المحللين</th>
              </tr>
            </thead>
            <tbody>
              {holdingsData.length > 0 ? holdingsData.map((row, i) => (
                <tr key={i} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-surface)] transition-colors h-[48px]">
                  <td className="px-4 py-2 whitespace-nowrap font-medium text-[var(--text-primary)]">{row.stockName}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-[var(--text-secondary)]">{row.sector}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-[var(--text-primary)]">{row.currentPrice.toFixed(2)}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded ${row.plValue >= 0 ? 'bg-[var(--green-bg)] text-[var(--green)]' : 'bg-[var(--red-bg)] text-[var(--red)]'}`}>
                      <span>{row.plValue >= 0 ? '+' : ''}{row.plPct.toFixed(2)}%</span>
                      <span className="text-xs opacity-80">({row.plValue >= 0 ? '+' : ''}{Math.round(row.plValue)})</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-[var(--text-primary)]">{row.quantity}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-[var(--text-primary)]">{formatSAR(row.avgCost)}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-[var(--text-primary)]">{formatSAR(row.totalCost)}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-[var(--text-primary)]">{row.weight.toFixed(2)}%</td>
                  <td className="px-4 py-2 whitespace-nowrap font-medium text-[var(--text-primary)]">{formatSAR(row.currentValue)}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-[var(--text-secondary)]">{row.peRatio}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <span className={`px-2 py-0.5 text-xs rounded font-medium
                      ${row.rating === 'شراء' ? 'bg-[var(--green-bg)] text-[var(--green)]' : 
                        row.rating === 'بيع' ? 'bg-[var(--red-bg)] text-[var(--red)]' : 
                        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-500'}
                    `}>
                      {row.rating}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-[var(--text-muted)]">
                    لا توجد حيازات حالياً. ابدأ بإضافة عمليات شراء.
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
