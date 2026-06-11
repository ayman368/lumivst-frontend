'use client'

import { useState } from 'react'
import TopBar from '../../components/portfolio/layout/TopBar'
import OverviewTab from '../../components/portfolio/tabs/OverviewTab'
import HoldingsTab from '../../components/portfolio/tabs/HoldingsTab'
import EventsTab from '../../components/portfolio/tabs/EventsTab'
import TransactionsTab from '../../components/portfolio/tabs/TransactionsTab'
import AddTransactionModal from '../../components/portfolio/shared/AddTransactionModal'
import { usePortfolioStore } from '../../store/portfolioStore'
import { usePortfolioData } from '../../hooks/usePortfolio'

export default function PortfolioApp() {
  const { activeTab, setActiveTab } = usePortfolioStore()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  
  const { isLoading, error, refetchAll } = usePortfolioData()

  return (
    <div className="flex w-full min-h-screen font-tajawal bg-[var(--bg-surface)] text-[var(--text-primary)] relative z-50" dir="rtl">
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg-surface)]">
        <TopBar onAddTransaction={() => setIsAddModalOpen(true)} />

        <main className="flex-1 overflow-auto p-6 bg-[var(--bg-surface)]">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Tab Bar */}
            <div className="flex gap-6 border-b border-[var(--border)]">
              {[
                { id: 'overview', label: 'نظرة عامة' },
                { id: 'holdings', label: 'الحيازات' },
                { id: 'events', label: 'الأحداث' },
                { id: 'transactions', label: 'العمليات' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                    activeTab === tab.id 
                      ? 'border-[var(--accent)] text-[var(--accent)]' 
                      : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Loading & Error States */}
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent)]"></div>
              </div>
            ) : error ? (
              <div className="bg-[var(--red-bg)] text-[var(--red)] p-4 rounded-lg flex flex-col items-center justify-center h-64 gap-4">
                <p>تعذر تحميل البيانات، يرجى المحاولة مجدداً</p>
                <button 
                  onClick={refetchAll}
                  className="px-4 py-2 bg-[var(--red)] text-white rounded hover:bg-[var(--red-light)] transition-colors"
                >
                  إعادة المحاولة
                </button>
              </div>
            ) : (
              /* Tab Content */
              <div className="pt-2">
                {activeTab === 'overview' && <OverviewTab />}
                {activeTab === 'holdings' && <HoldingsTab />}
                {activeTab === 'events' && <EventsTab />}
                {activeTab === 'transactions' && <TransactionsTab />}
              </div>
            )}

          </div>
        </main>
      </div>

      {isAddModalOpen && (
        <AddTransactionModal onClose={() => setIsAddModalOpen(false)} />
      )}
    </div>
  )
}
