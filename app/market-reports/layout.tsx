import Link from 'next/link';

import ReportsTabs from './_components/ReportsTabs';

export default function MarketReportsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Tadawul Market Reports</h1>

      <ReportsTabs />

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        {children}
      </div>
    </div>
  );
}