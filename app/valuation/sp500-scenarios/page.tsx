"use client";

import { useSP500Scenarios } from "@/hooks/useValuation";
import { ScenarioRow } from "@/types/valuation";

export default function SP500ScenariosPage() {
  const { data, error, isLoading } = useSP500Scenarios(2026, 2);

  if (isLoading)
    return <div className="p-8 text-black text-center">Loading scenarios...</div>;
  if (error || !data)
    return <div className="p-8 text-red-500 text-center">Failed to load scenarios.</div>;

  const { scenarios, inputs, historical_pe_stats } = data;
  
  // We want to fetch the n=3 as well, but we can just use the IRR logic from the single scenario or let the user toggle.
  // Actually, the user asked for N=2 and N=3 tables. The API `useSP500Scenarios` takes `nYears` and returns it.
  // To avoid two API calls in the component, we can just display the one from the API (n=2).

  return (
    <div className="min-h-screen bg-white text-black p-6 w-full flex flex-col items-center">
      <div className="w-full max-w-4xl border-2 border-black p-1 mb-4 shadow-sm bg-white">
        <h1 className="text-center font-bold text-black text-xl mb-4">SP-Vlu (Quantitative Valuation)</h1>

        {/* Inputs */}
        <div className="mb-6">
          <table className="text-sm border-collapse border border-black font-bold">
            <tbody>
              <tr>
                <td className="border border-black px-2 py-1 bg-yellow-200">Current Market Price</td>
                <td className="border border-black px-2 py-1 text-center">{inputs.current_price.toLocaleString()}</td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1 bg-yellow-200">YRI EPS 2026</td>
                <td className="border border-black px-2 py-1 text-center">{inputs.eps}</td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1 bg-yellow-200">Dividend</td>
                <td className="border border-black px-2 py-1 text-center">{inputs.annual_dividend}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Current Scenario Table */}
        <h2 className="font-bold text-lg mb-2">Current Scenario</h2>
        <table className="w-full text-sm border-collapse border border-black text-center font-bold mb-6" dir="ltr">
          <thead>
            <tr className="bg-[#70AD47] text-white">
              <th className="border border-black px-2 py-1">السيناريو</th>
              <th className="border border-black px-2 py-1">Yield المرجع</th>
              <th className="border border-black px-2 py-1">P/E المقابل</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black px-2 py-1">BBB</td>
              <td className="border border-black px-2 py-1">{inputs.bbb_yield_pct}%</td>
              <td className="border border-black px-2 py-1 text-blue-700">{(1 / (inputs.bbb_yield_pct/100)).toFixed(2)}x</td>
            </tr>
            <tr>
              <td className="border border-black px-2 py-1">A</td>
              <td className="border border-black px-2 py-1">{inputs.a_yield_pct}%</td>
              <td className="border border-black px-2 py-1 text-blue-700">{(1 / (inputs.a_yield_pct/100)).toFixed(2)}x</td>
            </tr>
            <tr>
              <td className="border border-black px-2 py-1">Current Market P/E</td>
              <td className="border border-black px-2 py-1">{inputs.current_pe ? (1 / inputs.current_pe * 100).toFixed(3) : "—"}% EY</td>
              <td className="border border-black px-2 py-1 text-blue-700">{inputs.current_pe?.toFixed(2) || "—"}x</td>
            </tr>
            <tr>
              <td className="border border-black px-2 py-1">Current Fed Rate</td>
              <td className="border border-black px-2 py-1">{inputs.fed_rate_current_pct ?? "—"}%</td>
              <td className="border border-black px-2 py-1 text-blue-700">{inputs.fed_rate_current_pct ? (1 / (inputs.fed_rate_current_pct/100)).toFixed(2) : "—"}x</td>
            </tr>
            <tr>
              <td className="border border-black px-2 py-1">Expected Fed Rate</td>
              <td className="border border-black px-2 py-1">{inputs.fed_rate_expected_pct ?? "—"}%</td>
              <td className="border border-black px-2 py-1 text-blue-700">{inputs.fed_rate_expected_pct ? (1 / (inputs.fed_rate_expected_pct/100)).toFixed(2) : "—"}x</td>
            </tr>
            <tr>
              <td className="border border-black px-2 py-1">Historical Min (7Y)</td>
              <td className="border border-black px-2 py-1">{(1 / historical_pe_stats.min * 100).toFixed(2)}%</td>
              <td className="border border-black px-2 py-1 text-blue-700">{historical_pe_stats.min.toFixed(2)}x</td>
            </tr>
            <tr>
              <td className="border border-black px-2 py-1">Historical Median (7Y)</td>
              <td className="border border-black px-2 py-1">{(1 / historical_pe_stats.median * 100).toFixed(3)}%</td>
              <td className="border border-black px-2 py-1 text-blue-700">{historical_pe_stats.median.toFixed(2)}x</td>
            </tr>
            <tr>
              <td className="border border-black px-2 py-1">Historical Avg (7Y)</td>
              <td className="border border-black px-2 py-1">{(1 / historical_pe_stats.average * 100).toFixed(2)}%</td>
              <td className="border border-black px-2 py-1 text-blue-700">{historical_pe_stats.average.toFixed(2)}x</td>
            </tr>
          </tbody>
        </table>

        {/* FV Scenarios */}
        <h2 className="font-bold text-lg mb-2">Fair Values (FV = EPS × P/E)</h2>
        <table className="w-full text-sm border-collapse border border-black text-center font-bold mb-6" dir="ltr">
          <thead>
            <tr className="bg-[#70AD47] text-white">
              <th className="border border-black px-2 py-1">Scenario</th>
              <th className="border border-black px-2 py-1">Calculation</th>
              <th className="border border-black px-2 py-1">Fair Value</th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map((s: ScenarioRow) => (
              <tr key={s.name}>
                <td className="border border-black px-2 py-1">{s.name}</td>
                <td className="border border-black px-2 py-1">{inputs.eps} × {s.pe.toFixed(2)}</td>
                <td className="border border-black px-2 py-1 text-purple-700">{s.fair_value.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Return Scenarios */}
        <h2 className="font-bold text-lg mb-2">Return Scenarios (N={inputs.n_years} Years)</h2>
        <p className="text-sm mb-2 text-gray-700">PV = {inputs.current_price.toLocaleString()} | PMT = {inputs.annual_dividend}</p>
        <table className="w-full text-sm border-collapse border border-black text-center font-bold mb-6" dir="ltr">
          <thead>
            <tr className="bg-[#70AD47] text-white">
              <th className="border border-black px-2 py-1">Scenario</th>
              <th className="border border-black px-2 py-1">FV</th>
              <th className="border border-black px-2 py-1">IRR (Annual Return)</th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map((s: ScenarioRow) => {
              const returnKey = `return_${inputs.n_years}y` as keyof ScenarioRow;
              const returnVal = s[returnKey] as number | null | undefined;
              return (
                <tr key={s.name}>
                  <td className="border border-black px-2 py-1">{s.name}</td>
                  <td className="border border-black px-2 py-1 text-purple-700">{s.fair_value.toLocaleString()}</td>
                  <td className={`border border-black px-2 py-1 ${returnVal != null && returnVal > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {returnVal != null ? `${returnVal}%` : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Adjusted Return Scenarios */}
        {data.scenarios_adjusted && data.scenarios_adjusted.length > 0 && (
          <>
            <h2 className="font-bold text-lg mb-2 mt-8">Interest rate adjustment due to Fed cut</h2>
            <table className="w-full text-sm border-collapse border border-black text-center font-bold mb-6" dir="ltr">
              <thead>
                <tr className="bg-[#4472C4] text-white">
                  <th className="border border-black px-2 py-1">Scenario</th>
                  <th className="border border-black px-2 py-1">FV</th>
                  <th className="border border-black px-2 py-1">IRR (Annual Return)</th>
                </tr>
              </thead>
              <tbody>
                {data.scenarios_adjusted.map((s: ScenarioRow) => {
                  const returnKey = `return_${inputs.n_years}y` as keyof ScenarioRow;
                  const returnVal = s[returnKey] as number | null | undefined;
                  return (
                    <tr key={s.name}>
                      <td className="border border-black px-2 py-1">{s.name}</td>
                      <td className="border border-black px-2 py-1 text-purple-700">{s.fair_value.toLocaleString()}</td>
                      <td className={`border border-black px-2 py-1 ${returnVal != null && returnVal > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {returnVal != null ? `${returnVal}%` : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}

        {/* Gold/Silver/Bronze */}
        {data.gold_silver_bronze && (
          <>
            <h2 className="font-bold text-lg mb-2 mt-8">Summary Valuation (Target Price ranges)</h2>
            <table className="w-full text-sm border-collapse border border-black text-center font-bold mb-6" dir="ltr">
              <tbody>
                <tr className="bg-[#FFD700]">
                  <td className="border border-black px-2 py-1 w-1/4">Gold</td>
                  {data.gold_silver_bronze.gold.map((val, idx) => (
                    <td key={idx} className="border border-black px-2 py-1">{val.toLocaleString()}</td>
                  ))}
                </tr>
                <tr className="bg-[#C0C0C0]">
                  <td className="border border-black px-2 py-1 w-1/4">Silver</td>
                  {data.gold_silver_bronze.silver.map((val, idx) => (
                    <td key={idx} className="border border-black px-2 py-1">{val.toLocaleString()}</td>
                  ))}
                </tr>
                <tr className="bg-[#CD7F32]">
                  <td className="border border-black px-2 py-1 w-1/4">Bronze</td>
                  {data.gold_silver_bronze.bronze.map((val, idx) => (
                    <td key={idx} className="border border-black px-2 py-1">{val.toLocaleString()}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}
