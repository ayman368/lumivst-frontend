import { Bell, Copy, Plus } from "lucide-react";

interface StockHeaderProps {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    marketTime: string;
    exchange: string;
    currency: string;
}

export function StockHeader({
    symbol,
    name,
    price,
    change,
    changePercent,
    marketTime,
    exchange,
    currency
}: StockHeaderProps) {
    const isPositive = change >= 0;

    return (
        <div className="bg-white p-6 border-b border-gray-100">
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-2xl font-bold text-gray-900">{symbol} - {name}</h1>
                        <button className="text-xs font-semibold text-orange-600 border border-orange-200 bg-orange-50 px-3 py-1 rounded hover:bg-orange-100 transition-colors">
                            Analyze With AI
                        </button>
                    </div>

                    <div className="flex items-baseline gap-3 mb-1">
                        <span className="text-4xl font-bold text-gray-900">${price.toFixed(2)}</span>
                        <span className={`text-lg font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {change > 0 ? '+' : ''}{change.toFixed(2)} ({changePercent > 0 ? '+' : ''}{changePercent.toFixed(2)}%)
                        </span>
                        <span className="text-sm text-gray-500">{marketTime}</span>
                    </div>

                    <div className="text-xs text-gray-400 uppercase font-medium">
                        {exchange} | {currency} | Realtime
                    </div>
                </div>

                <div></div>
            </div>
        </div>
    );
}
