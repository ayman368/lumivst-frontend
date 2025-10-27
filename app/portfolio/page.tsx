'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<any[]>([])

  return (
    <div>

      <main className="container">
        <div className="card mt-6">
          <div className="card-header">
            <h1 className="card-title">محفظتي الاستثمارية</h1>
            <p className="text-muted mt-2">تابع أداء استثماراتك</p>
          </div>

          <div className="p-4">
            {portfolio.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-muted mb-4">لا توجد أسهم في محفظتك</div>
                <Link href="/stocks" className="btn btn-primary">
                  ابدأ بإضافة الأسهم
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>السهم</th>
                      <th>الكمية</th>
                      <th>سعر الشراء</th>
                      <th>القيمة الحالية</th>
                      <th>الأرباح/الخسائر</th>
                      <th>الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* بيانات المحفظة */}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}