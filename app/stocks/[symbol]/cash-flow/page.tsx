import { MOCK_STOCK_DATA } from "../../data/mockData";
import { FinancialsTable } from "../../_components/FinancialsTable";

export default async function CashFlowPage({
    params
}: {
    params: Promise<{ symbol: string }>
}) {
    const { symbol } = await params;
    const data = MOCK_STOCK_DATA.financials;

    return (
        <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <FinancialsTable data={data} activeTab="Cash Flow" symbol={symbol} />
        </div>
    );
}
