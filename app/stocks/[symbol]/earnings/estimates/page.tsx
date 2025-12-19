import { MOCK_STOCK_DATA } from "../../../data/mockData";
import { EarningsTabs } from "../../../_components/EarningsTabs";
import { EstimatesPageContent } from "../../../_components/EstimatesPageContent";

export default async function EarningsEstimatesPage({
    params
}: {
    params: Promise<{ symbol: string }>
}) {
    const { symbol } = await params;
    const data = MOCK_STOCK_DATA.earnings;

    return (
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6">

            <EarningsTabs symbol={symbol} />

            <EstimatesPageContent data={data} />

        </div>
    );
}
