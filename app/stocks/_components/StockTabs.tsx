'use client';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';

const TABS = [
    { name: "Summary", path: "" },
    { name: "Ratings", path: "/ratings" },
    { name: "Financials", path: "/income-statement" },
    { name: "Earnings", path: "/earnings" },
    { name: "Dividends", path: "/dividends" },
    { name: "Valuation", path: "/valuation" },
    { name: "Growth", path: "/growth" },
    { name: "Profitability", path: "/profitability" },
    { name: "Momentum", path: "/momentum" },
    { name: "Peers", path: "/peers" },
    { name: "Options", path: "/options" },
    { name: "Charting", path: "/charting" }
];

export function StockTabs() {
    const pathname = usePathname();
    const params = useParams();
    const symbol = params.symbol as string;

    // Helper to check if tab is active
    // Summary is active if pathname ends with symbol (e.g. /stocks/NVDA)
    // Others are active if pathname includes the subpath (e.g. /stocks/NVDA/financials)
    const isActive = (path: string) => {
        if (path === "") {
            return pathname?.endsWith(`/${symbol}`) || pathname === `/stocks/${symbol}`;
        }
        // Special case for Financials tab to be active for all financial sub-pages
        if (path === "/income-statement") {
            return pathname?.includes("/income-statement") || pathname?.includes("/balance-sheet") || pathname?.includes("/cash-flow");
        }
        return pathname?.startsWith(`/stocks/${symbol}${path}`);
    };

    return (
        <div className="border-b border-gray-200 bg-white">
            <div className="flex overflow-x-auto no-scrollbar">
                {TABS.map((tab) => (
                    <Link
                        key={tab.name}
                        href={`/stocks/${symbol}${tab.path}`}
                        className={`
                            px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors relative
                            ${isActive(tab.path)
                                ? 'text-gray-900 border-b-2 border-black'
                                : 'text-gray-500 hover:text-gray-700'
                            }
                        `}
                    >
                        {tab.name}
                    </Link>
                ))}
            </div>
        </div>
    );
}
