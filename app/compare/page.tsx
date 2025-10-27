'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function ComparePage() {
  const [selectedStocks, setSelectedStocks] = useState<string[]>([])

  return (
    <div>
      <main className="container">
        <div className="card mt-6">
          <div className="card-header">
            <h1 className="card-title">مقارنة الأسهم</h1>
            <p className="text-muted mt-2">قارن بين أداء multiple stocks</p>
          </div>

          <div className="p-4">
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                اختر الأسهم للمقارنة (حد أقصى 4)
              </label>
              <div className="flex gap-2 flex-wrap">
                {/* هنا بيكون dropdown لاختيار الأسهم */}
                <select className="border rounded px-3 py-2">
                  <option>اختر السهم</option>
                </select>
              </div>
            </div>

            {selectedStocks.length > 0 ? (
              <div className="grid gap-4">
                {/* جدول المقارنة */}
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>المؤشر</th>
                        {selectedStocks.map(symbol => (
                          <th key={symbol}>{symbol}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>الإيرادات (أحدث سنة)</td>
                        {selectedStocks.map(symbol => (
                          <td key={symbol}>--</td>
                        ))}
                      </tr>
                      <tr>
                        <td>صافي الدخل</td>
                        {selectedStocks.map(symbol => (
                          <td key={symbol}>--</td>
                        ))}
                      </tr>
                      <tr>
                        <td>إجمالي الأصول</td>
                        {selectedStocks.map(symbol => (
                          <td key={symbol}>--</td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted">
                اختر أسهم للمقارنة لعرض النتائج
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}