import { MOCK_STOCK_DATA } from "../../../data/mockData";
import { EarningsTabs } from "../../../_components/EarningsTabs";
import { SurprisePageContent } from "../../../_components/SurprisePageContent";

export default async function EarningsSurprisePage({
    params
}: {
    params: Promise<{ symbol: string }>
}) {
    const { symbol } = await params;
    const data = MOCK_STOCK_DATA.earnings;

    return (
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6">
            <EarningsTabs symbol={symbol} />
            <SurprisePageContent data={data} />
        </div>
    );
}
