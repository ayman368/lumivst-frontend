'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import Footer from './Footer'
import MarketSidebar, { shouldShowSidebar } from './MarketSidebar'

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showSidebar = shouldShowSidebar(pathname)

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />
      {showSidebar ? (
        <div className="flex flex-1">
          <MarketSidebar />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      ) : (
        <main className="flex-1">{children}</main>
      )}
      {!showSidebar && <Footer />}
    </div>
  )
}