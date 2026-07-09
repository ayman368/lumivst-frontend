"use client";

import { useBondDashboard, useEconomyAssessment } from "@/hooks/useValuation";

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
    <div className="p-8 w-full flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Valuation System Overview</h1>
          <p className="text-gray-500 text-sm">
            Select a tab above to navigate through the valuation models and data views.
          </p>
        </div>

        {/* Quick stats from live data */}
        {bond && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
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
          <div className="mb-8 px-6 py-4 rounded-xl border border-gray-200 bg-white shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Current S&P 500 Zone</p>
              <p className="text-lg font-bold text-gray-900">{currentZone.label}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-1">Expected Return</p>
              <p className="text-lg font-bold text-green-700">
                {currentZone.return_pct_low}% – {currentZone.return_pct_high}%
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}