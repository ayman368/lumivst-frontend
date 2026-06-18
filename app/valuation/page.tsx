"use client";

import Link from "next/link";
import { useBondDashboard, useEconomyAssessment } from "@/hooks/useValuation";

type TabItem = {
  href: string;
  label: string;
  label_ar: string;
  desc: string;
  highlight?: boolean;
};

const TABS: TabItem[] = [
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
    highlight: true,
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

function QuickStat({ label, value, color = "text-gray-900" }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
      <p className="text-xs text-gray-500 mb-1 font-medium">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

export default function ValuationIndexPage() {
  const { data: bond } = useBondDashboard();
  const { data: econ } = useEconomyAssessment();

  const currentZone = econ?.sp500_zones?.find((z) => z.is_current);
  const positiveCount = econ?.indicators?.filter((i) => i.verdict === "Positive").length ?? 0;
  const totalCount = econ?.indicators?.length ?? 0;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6 w-full flex flex-col justify-between">

      <div>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Valuation System</h1>
          <p className="text-gray-500 text-sm">
            S&P 500 &amp; TASI comprehensive valuation — 8 analytical tabs
          </p>
        </div>

        {/* Excel Sheet Style Tabs (Moved to Top) */}
        <div className="mb-8 w-full">
          <div className="flex items-center overflow-x-auto bg-[#f3f3f3] border border-gray-300 rounded-t-lg scrollbar-none w-full">
            <div className="flex items-center space-x-1 px-3 text-gray-400 border-r border-gray-300 text-xs select-none">
              <span>◀</span><span>▶</span>
            </div>

            <div className="flex flex-1">
              {TABS.map((tab) => (
                <Link
                  key={tab.href}
                  href={tab.href}
                  title={tab.desc}
                  className={`group relative block flex-1 text-center py-3 text-xs font-medium border-r border-gray-300 transition-all duration-150 whitespace-nowrap ${tab.highlight
                    ? "bg-white text-emerald-700 shadow-[0_-2px_6px_rgba(0,0,0,0.05)]"
                    : "text-gray-600 bg-[#f3f3f3] hover:bg-[#eaeaea] hover:text-gray-900"
                    }`}
                >
                  {/* Excel Indicator Line */}
                  <div className={`absolute bottom-0 left-0 right-0 h-[3px] ${tab.highlight ? "bg-emerald-600" : "bg-transparent group-hover:bg-gray-300"
                    }`} />

                  <div className="flex flex-col items-center justify-center">
                    <span className="font-semibold">{tab.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Excel Top Status / Formula Bar Line */}
          <div className="bg-[#f3f3f3] border-x border-b border-gray-300 p-1.5 flex justify-between items-center rounded-b-lg w-full">
            <span className="text-[10px] text-gray-400 font-mono pl-2 select-none">fx</span>
            <span className="text-[10px] text-gray-400 font-mono pr-2 select-none">Ready</span>
          </div>
        </div>

        {/* Quick stats from live data */}
        {bond && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <QuickStat
              label="S&P 500"
              value={bond.sp500_price ? `$${bond.sp500_price.toLocaleString()}` : "—"}
            />
            <QuickStat
              label="A-Bond Yield"
              value={bond.a_yield ? `${bond.a_yield.toFixed(2)}%` : "—"}
            />
            <QuickStat
              label="EY / A Ratio"
              value={bond.sp_ey_a_ratio ? bond.sp_ey_a_ratio.toFixed(3) : "—"}
              color={
                bond.sp_ey_a_ratio
                  ? bond.sp_ey_a_ratio >= 1.5
                    ? "text-green-600"
                    : bond.sp_ey_a_ratio >= 1.0
                      ? "text-yellow-600"
                      : "text-red-600"
                  : "text-gray-900"
              }
            />
            <QuickStat
              label="Macro Score"
              value={totalCount > 0 ? `${positiveCount}/${totalCount}` : "—"}
              color={positiveCount >= totalCount * 0.6 ? "text-green-600" : "text-yellow-600"}
            />
          </div>
        )}

        {/* Current zone banner */}
        {currentZone && (
          <div className="mb-8 px-5 py-3 rounded-xl border border-gray-200 bg-white shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Current S&P 500 Zone</p>
              <p className="font-bold text-gray-900">{currentZone.label}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Expected Return</p>
              <p className="font-bold text-green-700">
                {currentZone.return_pct_low}% – {currentZone.return_pct_high}%
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Admin Link */}
      <div className="mt-12 pt-4 border-t border-gray-200 flex justify-end w-full">
        <Link
          href="/admin"
          className="text-xs text-gray-400 hover:text-emerald-700 transition-colors"
        >
          ⚙ Admin Panel
        </Link>
      </div>

    </div>
  );
}