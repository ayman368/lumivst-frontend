import { MOCK_STOCK_DATA } from "../data/mockData";
import { StockHeader } from "../_components/StockHeader";
import { StockTabs } from "../_components/StockTabs";
import { StocksTopBar } from "../_components/StocksTopBar";

export default async function StockLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ symbol: string }>;
}) {
    const resolvedParams = await params;
    const data = { ...MOCK_STOCK_DATA, symbol: resolvedParams.symbol?.toUpperCase() || MOCK_STOCK_DATA.symbol };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <StocksTopBar />

            <StockHeader
                symbol={data.symbol}
                name={data.name}
                price={data.price}
                change={data.change}
                changePercent={data.changePercent}
                marketTime={data.marketTime}
                exchange={data.exchange}
                currency={data.currency}
            />

            <StockTabs />

            <main className="flex-1">
                {children}
            </main>
        </div>
    );
}
