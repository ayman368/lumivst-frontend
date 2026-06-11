import { create } from 'zustand'

export type TabType = 'overview' | 'holdings' | 'events' | 'transactions'

interface PortfolioStore {
  activeTab: TabType
  setActiveTab: (tab: TabType) => void
}

export const usePortfolioStore = create<PortfolioStore>((set) => ({
  activeTab: 'overview',
  setActiveTab: (tab) => set({ activeTab: tab }),
}))
