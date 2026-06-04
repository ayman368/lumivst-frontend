'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import Footer from './Footer'
import MarketSidebar, { shouldShowSidebar } from './MarketSidebar'

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showSidebar = shouldShowSidebar(pathname)
  const isFullBleedDashboard = pathname?.startsWith('/stocks/market-breadth')

  return (
    <div className={`bg-white flex flex-col ${isFullBleedDashboard ? 'h-[100dvh] overflow-hidden' : 'min-h-screen'}`}>
      <Navbar />
      {showSidebar ? (
        <div className="flex flex-1 min-h-0">
          <MarketSidebar />
          <main className="flex-1 min-w-0 min-h-0 flex flex-col">{children}</main>
        </div>
      ) : (
        <main className={`flex-1 min-h-0 flex flex-col ${isFullBleedDashboard ? 'overflow-hidden' : ''}`}>{children}</main>
      )}
      {!showSidebar && !isFullBleedDashboard && <Footer />}
    </div>
  )
}