"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

type TabItem = {
  href: string;
  label: string;
  label_ar: string;
  desc: string;
};

const TABS: TabItem[] = [
  {
    href: "/valuation",
    label: "Overview",
    label_ar: "نظرة عامة",
    desc: "Valuation dashboard overview",
  },
  {
    href: "/valuation/bond",
    label: "Bond Dashboard",
    label_ar: "لوحة البوند",
    desc: "Bond yields, SP-EY ratios, labor market, treasury spreads",
  },
  {
    href: "/valuation/treasury-daily",
    label: "Daily Treasury (TRD)",
    label_ar: "بيانات الخزانة اليومية",
    desc: "Daily yield curve data for all maturities 1M–30Y",
  },
  {
    href: "/valuation/treasury-curve",
    label: "Yield Curve (TYC)",
    label_ar: "منحنى الفائدة الشهري",
    desc: "Monthly yield curve averages and shape analysis",
  },
  {
    href: "/valuation/economy",
    label: "Economy Assessment",
    label_ar: "التقييم الاقتصادي",
    desc: "Macro scorecard with verdicts and S&P 500 price zones",
  },
  {
    href: "/valuation/sp500-scenarios",
    label: "S&P 500 Scenarios",
    label_ar: "سيناريوهات التقييم",
    desc: "10 fair value scenarios with TVM return calculations",
  },
  {
    href: "/valuation/historical-pe",
    label: "Historical P/E (SP-PE)",
    label_ar: "المكرر التاريخي",
    desc: "Year-by-year P/E ratios, EY/A ratios, and target prices",
  },
  {
    href: "/valuation/market-weight",
    label: "TASI Market Weight",
    label_ar: "أوزان تاسي",
    desc: "Weighted EPS and P/E calculation for all TASI components",
  },
  {
    href: "/valuation/report",
    label: "Report",
    label_ar: "التقرير التنفيذي",
    desc: "Executive summary of TASI valuation — printable",
  },
];

export default function ValuationLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isTabActive = (href: string) => {
    if (href === "/valuation") return pathname === "/valuation";
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col w-full">
      {/* Excel Sheet Style Tabs */}
      <div className="w-full bg-[#f3f3f3] pt-4 px-4 pb-4 shadow-sm border-b border-gray-300">
        <div className="w-full">
          <div className="flex items-center overflow-x-auto rounded-t-lg scrollbar-none w-full border border-gray-300 border-b-0 bg-[#f3f3f3]">
            <div className="flex flex-1">
              {TABS.map((tab) => {
                const isActive = isTabActive(tab.href);
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    title={tab.desc}
                    className={`group relative block flex-1 text-center py-2 px-2 text-xs font-medium border-r border-gray-300 transition-all duration-150 whitespace-nowrap ${isActive
                        ? "bg-white text-[#4c8a34] shadow-[0_-2px_6px_rgba(0,0,0,0.05)]"
                        : "text-gray-600 hover:bg-[#eaeaea] hover:text-gray-900"
                      }`}
                  >
                    {/* Active Indicator Line */}
                    <div
                      className={`absolute bottom-0 left-0 right-0 h-[3px] ${isActive ? "bg-[#70AD47]" : "bg-transparent group-hover:bg-gray-300"
                        }`}
                    />

                    <div className="flex flex-col items-center justify-center">
                      <span className={`font-semibold ${isActive ? "text-[#4c8a34]" : ""}`}>
                        {tab.label}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full bg-white min-h-[80vh] shadow-sm border-x border-gray-200">
        {children}
      </main>

    </div>
  );
}