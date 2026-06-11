'use client'

import { useState } from 'react'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { usePortfolioMutations, usePortfolioData } from '../../../hooks/usePortfolio'

interface AddTransactionModalProps {
  onClose: () => void
}

export default function AddTransactionModal({ onClose }: AddTransactionModalProps) {
  const { positions, cash } = usePortfolioData()
  const { addPosition, updateCash, partialSell } = usePortfolioMutations()

  const [type, setType] = useState<'buy' | 'sell' | 'deposit' | 'withdraw'>('buy')
  
  // Fields for stock operations
  const [search, setSearch] = useState('')
  const [selectedPositionId, setSelectedPositionId] = useState<number | ''>('')
  const [quantity, setQuantity] = useState('')
  const [price, setPrice] = useState('')
  const [fee, setFee] = useState('0')
  
  // Fields for cash operations
  const [amount, setAmount] = useState('')
  
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (type === 'deposit' || type === 'withdraw') {
      if (!amount || !date) {
        setError('جميع الحقول مطلوبة')
        return
      }
      const val = Number(amount)
      if (val <= 0) {
        setError('المبلغ يجب أن يكون أكبر من صفر')
        return
      }
      const newCash = type === 'deposit' ? cash + val : cash - val
      if (newCash < 0) {
        setError('لا يوجد رصيد نقد كافٍ للسحب')
        return
      }
      updateCash.mutate(newCash)
      onClose()
      return
    }

    if (type === 'buy') {
      if (!search || !quantity || !price || !date) {
        setError('جميع الحقول مطلوبة')
        return
      }
      const q = Number(quantity)
      const p = Number(price)
      const f = Number(fee) || 0
      if (q <= 0 || p <= 0) {
        setError('الكمية والسعر يجب أن يكونا أكبر من صفر')
        return
      }
      if (f < 0) {
        setError('لا يمكن أن تكون العمولة بالسالب')
        return
      }
      
      const totalCost = (q * p) + f
      if (totalCost > cash) {
        // Optional: warn or prevent? We'll just auto-deduct cash.
        const newCash = cash - totalCost
        updateCash.mutate(newCash)
      } else {
        const newCash = cash - totalCost
        updateCash.mutate(newCash)
      }

      const symbolMatch = search.match(/^\d+/)
      const stockSymbol = symbolMatch ? symbolMatch[0] : (search.length <= 4 ? search : '0000')
      const stockName = search

      addPosition.mutate({
        symbol: stockSymbol,
        name: stockName,
        qty: q,
        buy_price: p, // Not storing fee in position table for now since schema might not support it, but it deducts from cash properly!
        entry_date: date
      })
      onClose()
      return
    }

    if (type === 'sell') {
      if (!selectedPositionId || !quantity || !price || !date) {
        setError('جميع الحقول مطلوبة')
        return
      }
      const q = Number(quantity)
      const p = Number(price)
      const f = Number(fee) || 0
      if (q <= 0 || p <= 0) {
        setError('الكمية والسعر يجب أن يكونا أكبر من صفر')
        return
      }

      const position = positions.find((pos: any) => pos.id === Number(selectedPositionId))
      if (!position) {
        setError('المركز غير موجود')
        return
      }
      if (q > position.qty) {
        setError(`لا يمكنك بيع أكثر من ${position.qty} سهم`)
        return
      }

      const proceeds = (q * p) - f
      updateCash.mutate(cash + proceeds)

      partialSell.mutate({
        id: Number(selectedPositionId),
        data: {
          qty: q,
          sell_price: p,
          trade_date: date
        }
      })
      onClose()
      return
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 font-tajawal" dir="rtl">
      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-6 w-[480px] max-w-[90vw] shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">أضف عملية</h2>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">نوع العملية</label>
            <div className="flex bg-[var(--bg-primary)] border border-[var(--border)] rounded-[6px] p-1">
              <button 
                type="button"
                onClick={() => setType('buy')}
                className={`flex-1 py-1.5 text-sm rounded ${type === 'buy' ? 'bg-[var(--green)] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              >
                شراء
              </button>
              <button 
                type="button"
                onClick={() => setType('sell')}
                className={`flex-1 py-1.5 text-sm rounded ${type === 'sell' ? 'bg-[var(--red)] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              >
                بيع
              </button>
              <button 
                type="button"
                onClick={() => setType('deposit')}
                className={`flex-1 py-1.5 text-sm rounded ${type === 'deposit' ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              >
                إيداع
              </button>
              <button 
                type="button"
                onClick={() => setType('withdraw')}
                className={`flex-1 py-1.5 text-sm rounded ${type === 'withdraw' ? 'bg-orange-500 text-white' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              >
                سحب
              </button>
            </div>
          </div>

          {(type === 'buy') && (
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">اسم الشركة أو الرمز</label>
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input 
                  type="text" 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="ابحث بالاسم أو رمز التداول" 
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-[6px] py-2 pr-10 pl-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                />
              </div>
            </div>
          )}

          {(type === 'sell') && (
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">اختر المركز</label>
              <select 
                value={selectedPositionId}
                onChange={e => setSelectedPositionId(Number(e.target.value))}
                className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-[6px] py-2 px-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
              >
                <option value="">-- اختر سهماً للبيع --</option>
                {positions.map((pos: any) => (
                  <option key={pos.id} value={pos.id}>
                    {pos.symbol} - {pos.name} (المتاح: {pos.qty})
                  </option>
                ))}
              </select>
            </div>
          )}

          {(type === 'buy' || type === 'sell') && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">عدد الأسهم</label>
                  <input 
                    type="number" 
                    min="1"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-[6px] py-2 px-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">سعر {type === 'buy' ? 'الشراء' : 'البيع'}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">﷼</span>
                    <input 
                      type="number" 
                      step="0.01"
                      min="0.01"
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-[6px] py-2 pl-8 pr-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] text-left"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">العمولة أو الضرائب (اختياري)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">﷼</span>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    value={fee}
                    onChange={e => setFee(e.target.value)}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-[6px] py-2 pl-8 pr-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] text-left"
                    dir="ltr"
                  />
                </div>
              </div>
            </>
          )}

          {(type === 'deposit' || type === 'withdraw') && (
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">المبلغ</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">﷼</span>
                <input 
                  type="number" 
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-[6px] py-2 pl-8 pr-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] text-left"
                  dir="ltr"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">تاريخ العملية</label>
            <input 
              type="date" 
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-[6px] py-2 px-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button 
            type="submit" 
            className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium py-2 rounded-[6px] transition-colors mt-2"
          >
            تأكيد العملية
          </button>
        </form>
      </div>
    </div>
  )
}
