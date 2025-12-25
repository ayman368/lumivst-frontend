'use client';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';

const TABS = [
    { name: "Dividend Scorecard", path: "" },
    { name: "Dividend Yield", path: "/dividends/yield" },
    { name: "Dividend Growth", path: "/dividends/growth" },
    { name: "Dividend Safety", path: "/dividends/safety" },
    { name: "Dividend History", path: "/dividends/history" },
    { name: "Dividend Estimates", path: "/dividends/estimates" }
];

export function DividendSubTabs() {
    const pathname = usePathname();
    const params = useParams();
    const symbol = params.symbol as string;
    const basePath = `/stocks/${symbol}/dividends`;

    const isActive = (path: string) => {
        const currentPath = pathname?.endsWith('/') ? pathname.slice(0, -1) : pathname;

        if (path === "") {
            return currentPath === basePath;
        }
        return currentPath?.includes(path);
    };

    return (
        <div className="flex border-b border-gray-200 mb-6 bg-white overflow-x-auto no-scrollbar">
            {TABS.map((tab) => (
                <div key={tab.name} className="flex items-center shrink-0">
                    <Link
                        href={tab.path === "" ? basePath : `/stocks/${symbol}${tab.path}`}
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
                    <span className="text-gray-300 mx-1 font-light last:hidden">|</span>
                </div>
            ))}
        </div>
    );
}
