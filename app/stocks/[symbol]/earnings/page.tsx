import { MOCK_STOCK_DATA } from "../../data/mockData";
import { EarningsSummary } from "../../_components/EarningsSummary";
import { RevisionsTable } from "../../_components/RevisionsTable";
import { EarningsChart } from "../../_components/EarningsChart";
import { EstimatesTable } from "../../_components/EstimatesTable";
import { EarningsHistory } from "../../_components/EarningsHistory";
import { EarningsTabs } from "../../_components/EarningsTabs";

export default async function EarningsPage({
    params
}: {
    params: Promise<{ symbol: string }>
}) {
    const { symbol } = await params;
    const data = MOCK_STOCK_DATA.earnings;

    return (
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6 space-y-8">

            <EarningsTabs symbol={symbol} />

            {/* 1. Summary Cards */}
            <EarningsSummary
                lastQuarter={data.lastQuarter}
                upcomingQuarter={data.upcomingQuarter}
            />

            {/* 2. Revisions Grade */}
            <RevisionsTable
                data={data.revisionsGrade}
                symbol={symbol.toUpperCase()}
            />

            {/* 3. EPS Surprise & Estimates Chart */}
            <EarningsChart data={data.chartData.surprise} />

            {/* 4. Annual EPS Estimate Table */}
            <EstimatesTable
                title="Annual EPS Estimate"
                headers={['EPS Estimate', 'Forward PE', 'Low', 'High', '# of Analysts']}
                rows={data.estimates.eps}
            />

            {/* 5. Annual Revenue Estimate Table */}
            <EstimatesTable
                title="Annual Revenue Estimate"
                headers={['Revenue Estimate', 'Forward P/S', 'Low', 'High', '# of Analysts']}
                rows={data.estimates.revenue}
            />

            {/* 6. Earnings History */}
            <EarningsHistory history={data.history} />

        </div>
    );
}
