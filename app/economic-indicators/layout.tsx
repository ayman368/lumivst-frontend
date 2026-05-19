'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { ticker: 'UNRATE', label: 'Unemployment Rate', href: '/economic-indicators/unrate' },
  { ticker: 'PAYEMS', label: 'Nonfarm Payrolls', href: '/economic-indicators/payems' },
  { ticker: 'IC4WSA', label: 'Initial Claims', href: '/economic-indicators/ic4wsa' },
  { ticker: 'NFP ΔM', label: 'NFP Monthly Change', href: '/economic-indicators/nfp-change' },
  { ticker: 'NAAIM', label: 'Exposure Index', href: '/economic-indicators/naaim' },
];

export default function EconomicIndicatorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="w-full px-4 py-8">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium tracking-widest uppercase text-blue-600 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-400 px-2.5 py-1 rounded-full mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            FRED Data
          </span>
          <h1 className="text-[22px] font-semibold text-gray-900 dark:text-gray-100 mb-1 leading-tight">
            Economic Indicators
          </h1>
        </div>

        <time className="hidden sm:block font-mono text-[11px] text-gray-400 bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 shrink-0">
          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </time>
      </div>

      {/* ── Tab Bar ── */}
      <nav
        className="flex gap-1 bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/60 rounded-xl p-1 mb-6 overflow-x-auto"
        aria-label="Economic indicator tabs"
      >
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={[
                'flex flex-col flex-1 min-w-[130px] px-3.5 py-2.5 rounded-[10px] transition-all duration-150',
                isActive
                  ? 'bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-700'
                  : 'hover:bg-white/60 dark:hover:bg-gray-900/40',
              ].join(' ')}
            >
              <span
                className={[
                  'font-mono text-[11px] font-medium mb-0.5',
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-400 dark:text-gray-500',
                ].join(' ')}
              >
                {tab.ticker}
              </span>
              <span
                className={[
                  'text-[12px] font-medium leading-snug',
                  isActive
                    ? 'text-gray-900 dark:text-gray-100'
                    : 'text-gray-500 dark:text-gray-400',
                ].join(' ')}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* ── Content ── */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700/60 rounded-xl p-6 shadow-sm">
        {children}
      </div>
    </div>
  );
}