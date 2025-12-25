import { StockHeader } from '../_components/StockHeader';
import { StockChart } from '../_components/StockChart';
import { AnalysisList } from '../_components/AnalysisList';
import { NewsList } from '../_components/NewsList';
import { Seasonality } from '../_components/Seasonality';
import { CompanyProfile } from '../_components/CompanyProfile';
import { RevenueChart } from '../_components/RevenueChart';
import { StockFinancialSummary } from '../_components/StockFinancialSummary';
import { InsiderTrading } from '../_components/InsiderTrading';
import { MOCK_STOCK_DATA } from '../data/mockData';
import Link from 'next/link';
import { StockSubTabs } from '../_components/StockSubTabs';

export default async function StockDetailPage({
  params
}: {
  params: Promise<{ symbol: string }>
}) {
  const { symbol } = await params;

  // For now, we use the mock data to match the provided design exactly
  const data = { ...MOCK_STOCK_DATA, symbol: symbol.toUpperCase() };

  return (
    <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-4">

      {/* Secondary Navigation & Action Header */}
      <StockSubTabs symbol={symbol} activeTab="All" />

      <div className="space-y-5">
        <div className="space-y-5">
          <StockChart />

          {/* Analysis & News Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <AnalysisList items={data.analysis} />
            <NewsList items={data.news} />
          </div>

          {/* Seasonality */}
          <Seasonality data={data.seasonality} />


          {/* Company Profile */}
          <CompanyProfile
            profile={data.companyProfile}
            symbol={data.symbol}
            name={data.name}
          />

          {/* Revenue Chart */}
          <RevenueChart data={data.revenue} />

          {/* Detailed Financial Summary */}
          <StockFinancialSummary data={data} />

          {/* Insider Trading */}
          <InsiderTrading data={data.insiderTrading} />



        </div>

      </div>
    </div>
  );
}
