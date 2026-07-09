"use client";

import { useSP500Scenarios } from "@/hooks/useValuation";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { ScenarioRow, IrrScenario } from "@/types/valuation";

export default function SP500ScenariosPage() {
  const { data, error, isLoading } = useSP500Scenarios(2);

  if (isLoading) return <LoadingSpinner className="h-[50vh]" />;
  if (error || !data) return <div className="p-8 text-red-500 text-center">Failed to load scenarios.</div>;

  const { scenarios, scenarios_n2, scenarios_n3, scenarios_adjusted, adj_details, irr_scenarios, inputs, historical_pe_stats, gold_silver_bronze } = data;

  const fmt = (v: number | null | undefined, d = 2) => (v != null ? v.toFixed(d) : "—");
  const fmtPct = (v: number | null | undefined, d = 2) => {
    if (v == null) return "—";
    if (v < 0) return <span className="text-red-600">({Math.abs(v).toFixed(d)}%)</span>;
    return `${v.toFixed(d)}%`;
  };
  const fmtNum = (v: number | null | undefined) => (v != null ? v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—");

  // Filter only FV scenarios (exclude Fed rate rows)
  const fvScenarios = scenarios.filter(s => s.name.startsWith("FV-"));
  const fvN2 = (scenarios_n2 || []).filter((s: ScenarioRow) => s.name.startsWith("FV-"));
  const fvN3 = (scenarios_n3 || []).filter((s: ScenarioRow) => s.name.startsWith("FV-"));

  // Current Scenario table rows
  const bbbYield = inputs.bbb_yield_pct;
  const aYield = inputs.a_yield_pct;
  const spEy = inputs.sp_ey_pct;
  const fedCurrent = inputs.fed_rate_current_pct;
  const fedExpected = inputs.fed_rate_expected_pct;

  const currentScenarioRows = [
    { label: "BBB", yield: bbbYield, pe: bbbYield ? (1 / (bbbYield / 100)).toFixed(2) : "—", eya: null, remark: "Market Range - BBB", highlight: false },
    { label: "A", yield: aYield, pe: aYield ? (1 / (aYield / 100)).toFixed(2) : "—", eya: null, remark: "Market Range - A", highlight: false },
    { label: "SP-EY", yield: spEy, pe: spEy ? (1 / (spEy / 100)).toFixed(2) : "—", eya: null, remark: "Market P/E", highlight: false },
    { label: "Current Interest rate", yield: fedCurrent, pe: fedCurrent ? (1 / (fedCurrent / 100)).toFixed(2) : "—", eya: null, remark: "Current", highlight: false },
    { label: "Estimated Interest rate", yield: fedExpected, pe: fedExpected ? (1 / (fedExpected / 100)).toFixed(2) : "—", eya: null, remark: `Expected: ${fedExpected}% 2026, 3% 2027`, highlight: true },
  ];

  const histRows = [
    { label: "Historical P/E- Min", yield: (1/historical_pe_stats.min*100), pe: historical_pe_stats.min, eya: aYield ? ((1/historical_pe_stats.min) / (aYield/100)) : null, remark: `Min-${historical_pe_stats.years_used} Years` },
    { label: "Historical P/E- Median", yield: (1/historical_pe_stats.median*100), pe: historical_pe_stats.median, eya: aYield ? ((1/historical_pe_stats.median) / (aYield/100)) : null, remark: `Median-${historical_pe_stats.years_used} Years` },
    { label: "Historical P/E- Avg", yield: (1/historical_pe_stats.average*100), pe: historical_pe_stats.average, eya: aYield ? ((1/historical_pe_stats.average) / (aYield/100)) : null, remark: `Avg-${historical_pe_stats.years_used} Years` },
  ];

  const peAssumptions = [
    { label: "P/E 15", yield: (1/15*100), pe: 15, eya: aYield ? ((1/15) / (aYield/100)) : null, remark: "The best P/E - Expected" },
    { label: "P/E 17", yield: (1/17*100), pe: 17, eya: aYield ? ((1/17) / (aYield/100)) : null, remark: "Assumption 1" },
    { label: "P/E 20", yield: (1/20*100), pe: 20, eya: aYield ? ((1/20) / (aYield/100)) : null, remark: "Assumption 2" },
    { label: "P/E 25", yield: (1/25*100), pe: 25, eya: aYield ? ((1/25) / (aYield/100)) : null, remark: "Assumption 3" },
  ];

  const cellBorder = "border border-black px-2 py-1";
  const yellowBg = "bg-[#FFFF00]";

  return (
    <div className="min-h-screen bg-white text-black p-4 w-full flex flex-col items-center" style={{ fontFamily: "Arial, sans-serif", fontSize: "12px" }}>
      <div className="w-full max-w-[900px]">

        {/* ═══════════ Page 1: نظرة عن وضع السوق ═══════════ */}
        <h2 className="text-center font-bold text-base mb-1 underline text-blue-700">نظرة عن وضع السوق</h2>

        {/* Current Scenario */}
        <h3 className="font-bold text-sm mb-1 text-center">Current Scenario</h3>
        <table className="w-full text-xs border-collapse font-bold mb-4" dir="ltr">
          <thead>
            <tr>
              <th className={`${cellBorder} bg-white text-left`}>Bond</th>
              <th className={`${cellBorder} bg-white`}>Yield</th>
              <th className={`${cellBorder} bg-white`}>P/E</th>
              <th className={`${cellBorder} bg-white`}>EY/A</th>
              <th className={`${cellBorder} bg-white text-left`}>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {currentScenarioRows.map((r, i) => (
              <tr key={i} className={r.highlight ? yellowBg : ""}>
                <td className={`${cellBorder} text-left ${r.highlight ? yellowBg : ""}`}>{r.label}</td>
                <td className={`${cellBorder} text-center ${r.highlight ? yellowBg : ""}`}>{r.yield != null ? `${typeof r.yield === 'number' ? r.yield.toFixed(2) : r.yield}%` : "—"}</td>
                <td className={`${cellBorder} text-center ${r.highlight ? yellowBg : ""}`}>{r.pe}</td>
                <td className={`${cellBorder} text-center`}></td>
                <td className={`${cellBorder} text-left text-[11px] ${r.highlight ? yellowBg : ""}`}>{r.remark}</td>
              </tr>
            ))}
            {/* Separator */}
            <tr><td colSpan={5} className="h-1"></td></tr>
            {histRows.map((r, i) => (
              <tr key={`h${i}`} className={yellowBg}>
                <td className={`${cellBorder} text-left ${yellowBg}`}>{r.label}</td>
                <td className={`${cellBorder} text-center ${yellowBg}`}>{r.yield.toFixed(2)}%</td>
                <td className={`${cellBorder} text-center ${yellowBg}`}>{r.pe.toFixed(2)}</td>
                <td className={`${cellBorder} text-center ${yellowBg}`}>{r.eya != null ? r.eya.toFixed(2) : "—"}</td>
                <td className={`${cellBorder} text-left text-[11px] ${yellowBg}`}>{r.remark}</td>
              </tr>
            ))}
            {/* Separator */}
            <tr><td colSpan={5} className="h-1"></td></tr>
            {peAssumptions.map((r, i) => (
              <tr key={`p${i}`}>
                <td className={`${cellBorder} text-left`}>{r.label}</td>
                <td className={`${cellBorder} text-center`}>{r.yield.toFixed(2)}%</td>
                <td className={`${cellBorder} text-center text-blue-700`}>{r.pe.toFixed(2)}</td>
                <td className={`${cellBorder} text-center`}>{r.eya != null ? r.eya.toFixed(2) : "—"}</td>
                <td className={`${cellBorder} text-left text-[11px]`}>{r.remark}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* EPS Estimates */}
        <table className="text-xs border-collapse font-bold mb-6" dir="ltr">
          <tbody>
            {inputs.eps_estimates && Object.entries(inputs.eps_estimates).sort(([a],[b]) => Number(a) - Number(b)).map(([year, val]) => (
              <tr key={year}>
                <td className={`${cellBorder} text-left ${yellowBg}`}>YRI Earnings-{year} {Number(year) <= 2025 ? "(a)" : "(e)"}</td>
                <td className={`${cellBorder} text-center`}>{val.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ═══════════ Page 2: FV Scenarios ═══════════ */}
        <table className="w-full text-xs border-collapse font-bold mb-4" dir="ltr">
          <thead>
            <tr className="bg-[#D9E1F2]">
              <th className={cellBorder}>Scenario</th>
              <th className={cellBorder}>Price</th>
              <th className={cellBorder}>P/E</th>
              <th className={cellBorder}>EY/A</th>
            </tr>
          </thead>
          <tbody>
            {fvScenarios.map((s: ScenarioRow) => (
              <tr key={s.name}>
                <td className={`${cellBorder} text-left`}>{s.name}</td>
                <td className={`${cellBorder} text-center ${yellowBg} text-blue-700`}>{fmtNum(s.fair_value)}</td>
                <td className={`${cellBorder} text-center`}>{fmt(s.pe)}</td>
                <td className={`${cellBorder} text-center`}>{fmt(s.ey_a_ratio)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Current Market Price */}
        <table className="text-xs border-collapse font-bold mb-4" dir="ltr">
          <tbody>
            <tr>
              <td className={`${cellBorder}`}>Current Market Price</td>
              <td className={`${cellBorder} ${yellowBg}`}>{fmtNum(inputs.current_price)}</td>
            </tr>
          </tbody>
        </table>

        {/* Market N: 2 Years */}
        <table className="w-full text-xs border-collapse font-bold mb-4" dir="ltr">
          <thead>
            <tr className="bg-[#D9E1F2]">
              <th className={cellBorder}>Market - N: 2 Years</th>
              <th className={cellBorder}>N</th>
              <th className={cellBorder}>I/Y</th>
              <th className={cellBorder}>PV</th>
              <th className={cellBorder}>PMT</th>
              <th className={cellBorder}>FV</th>
            </tr>
          </thead>
          <tbody>
            {fvN2.map((s: ScenarioRow, i: number) => (
              <tr key={s.name}>
                <td className={`${cellBorder} text-left`}>{s.name}</td>
                <td className={`${cellBorder} text-center ${i === 0 ? yellowBg : ""}`}>2</td>
                <td className={`${cellBorder} text-center`}>{fmtPct(s.irr)}</td>
                <td className={`${cellBorder} text-center`}>{fmtNum(inputs.current_price)}</td>
                <td className={`${cellBorder} text-center`}>{fmt(inputs.annual_dividend, 1)}</td>
                <td className={`${cellBorder} text-center`}>{fmtNum(s.fair_value)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Market N: 3 Years */}
        <table className="w-full text-xs border-collapse font-bold mb-4" dir="ltr">
          <thead>
            <tr className="bg-[#D9E1F2]">
              <th className={cellBorder}>Market - N: 3 Years</th>
              <th className={cellBorder}>N</th>
              <th className={cellBorder}>I/Y</th>
              <th className={cellBorder}>PV</th>
              <th className={cellBorder}>PMT</th>
              <th className={cellBorder}>FV</th>
            </tr>
          </thead>
          <tbody>
            {fvN3.map((s: ScenarioRow, i: number) => (
              <tr key={s.name}>
                <td className={`${cellBorder} text-left`}>{s.name}</td>
                <td className={`${cellBorder} text-center ${i === 0 ? yellowBg : ""}`}>3</td>
                <td className={`${cellBorder} text-center`}>{fmtPct(s.irr)}</td>
                <td className={`${cellBorder} text-center`}>{fmtNum(inputs.current_price)}</td>
                <td className={`${cellBorder} text-center`}>{fmt(inputs.annual_dividend, 1)}</td>
                <td className={`${cellBorder} text-center`}>{fmtNum(s.fair_value)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* IRR Calculation */}
        {irr_scenarios && irr_scenarios.length > 0 && (
          <table className="w-full text-xs border-collapse font-bold mb-6" dir="ltr">
            <thead>
              <tr className="bg-[#D9E1F2]">
                <th className={cellBorder}>IRR Calculation</th>
                <th className={cellBorder}>N</th>
                <th className={cellBorder}>I/Y</th>
                <th className={cellBorder}>PV</th>
                <th className={cellBorder}>PMT</th>
                <th className={cellBorder}>FV</th>
              </tr>
            </thead>
            <tbody>
              {irr_scenarios.map((s: IrrScenario) => (
                <tr key={s.name}>
                  <td className={`${cellBorder} text-left`}>{s.name}</td>
                  <td className={`${cellBorder} text-center ${yellowBg}`}>{s.n}</td>
                  <td className={`${cellBorder} text-center`}>{fmtPct(s.irr)}</td>
                  <td className={`${cellBorder} text-center`}>{fmtNum(s.pv)}</td>
                  <td className={`${cellBorder} text-center`}>{fmt(inputs.annual_dividend, 1)}</td>
                  <td className={`${cellBorder} text-center`}>{fmtNum(s.fv)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* ═══════════ Page 3: Yield adjusted for interest rate cut ═══════════ */}
        <h3 className="font-bold text-sm mb-1 text-center underline text-blue-700">
          Yield adjusted for interest rate cut to {inputs.fed_rate_expected_pct}% in 2 years
        </h3>
        <table className="text-xs border-collapse font-bold mb-4 mt-2" dir="ltr">
          <thead>
            <tr>
              <th className={`${cellBorder} bg-white text-left`}>Bond</th>
              <th className={`${cellBorder} bg-white`}>Yield</th>
              <th className={`${cellBorder} bg-white`}>P/E</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={`${cellBorder} text-left`}>CB-BBB-Int.Adjusted</td>
              <td className={cellBorder}>{adj_details?.adj_bbb_yield_pct != null ? `${adj_details.adj_bbb_yield_pct}%` : "—"}</td>
              <td className={cellBorder}>{adj_details?.adj_pe_bbb != null ? fmt(adj_details.adj_pe_bbb) : "—"}</td>
            </tr>
            <tr>
              <td className={`${cellBorder} text-left`}>CB-A-Int.Adjusted</td>
              <td className={cellBorder}>{adj_details?.adj_a_yield_pct != null ? `${adj_details.adj_a_yield_pct}%` : "—"}</td>
              <td className={cellBorder}>{adj_details?.adj_pe_a != null ? fmt(adj_details.adj_pe_a) : "—"}</td>
            </tr>
            <tr>
              <td className={`${cellBorder} text-left`}>Current Interest rate</td>
              <td className={cellBorder}>{fedCurrent != null ? `${fedCurrent}%` : "—"}</td>
              <td className={cellBorder}>{fedCurrent ? fmt(1/(fedCurrent/100)) : "—"}</td>
            </tr>
            <tr>
              <td className={`${cellBorder} text-left`}>Estimated Interest rate</td>
              <td className={cellBorder}>{fedExpected != null ? `${fedExpected}%` : "—"}</td>
              <td className={cellBorder}>{fedExpected ? fmt(1/(fedExpected/100)) : "—"}</td>
            </tr>
          </tbody>
        </table>

        {/* FV-1 and FV-2 adjusted with EPS 2027 */}
        <table className="text-xs border-collapse font-bold mb-4 w-[400px]" dir="ltr">
          <tbody>
            <tr>
              <td className={`${cellBorder} text-left`}>YRI Earnings-2027 (e)</td>
              <td className={`${cellBorder} text-center`}>{inputs.eps_estimates?.["2027"]?.toFixed(2) ?? fmt(inputs.eps)}</td>
              <td className={`${cellBorder} text-center`}>P/E</td>
            </tr>
            {scenarios_adjusted && scenarios_adjusted.length > 0 && scenarios_adjusted.map((s: ScenarioRow) => (
              <tr key={s.name}>
                <td className={`${cellBorder} text-left`}>{s.name.replace(" Adjusted (BBB)", "").replace(" Adjusted (A)", "")}</td>
                <td className={`${cellBorder} text-center`}>{fmtNum(s.fair_value)}</td>
                <td className={`${cellBorder} text-center`}>{fmt(s.pe)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Adjusted Market IRR */}
        <table className="text-xs border-collapse font-bold mb-2" dir="ltr">
          <tbody>
            <tr>
              <td className={cellBorder}>Current Market Price</td>
              <td className={`${cellBorder} ${yellowBg}`}>{fmtNum(inputs.current_price)}</td>
            </tr>
          </tbody>
        </table>
        {scenarios_adjusted && scenarios_adjusted.length > 0 && (
          <table className="text-xs border-collapse font-bold mb-6 w-full" dir="ltr">
            <thead>
              <tr className="bg-[#D9E1F2]">
                <th className={cellBorder}>Market</th>
                <th className={cellBorder}>N</th>
                <th className={cellBorder}>I/Y</th>
                <th className={cellBorder}>PV</th>
                <th className={cellBorder}>PMT</th>
                <th className={`${cellBorder} ${yellowBg}`}>FV</th>
              </tr>
            </thead>
            <tbody>
              {scenarios_adjusted.map((s: ScenarioRow) => {
                const returnKey = `return_${inputs.n_years}y` as keyof ScenarioRow;
                const returnVal = s[returnKey] as number | null;
                return (
                  <tr key={s.name} className={yellowBg}>
                    <td className={`${cellBorder} text-left ${yellowBg}`}>{s.name.replace(" Adjusted ", " ").replace("(BBB)", "").replace("(A)", "")}</td>
                    <td className={`${cellBorder} text-center ${yellowBg}`}>{inputs.n_years}</td>
                    <td className={`${cellBorder} text-center`}>{fmtPct(returnVal)}</td>
                    <td className={`${cellBorder} text-center`}>{fmtNum(inputs.current_price)}</td>
                    <td className={`${cellBorder} text-center`}>{fmt(inputs.annual_dividend, 1)}</td>
                    <td className={`${cellBorder} text-center ${yellowBg} font-bold`}>{fmtNum(s.fair_value)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* ═══════════ Gold / Silver / Bronze ═══════════ */}
        {gold_silver_bronze && (
          <>
            <table className="w-full text-xs border-collapse font-bold mb-6" dir="ltr">
              <tbody>
                <tr style={{ backgroundColor: "#D4AF37" }}>
                  <td className={`${cellBorder} text-white font-bold w-[80px]`}>Gold</td>
                  {gold_silver_bronze.gold.map((v, i) => (
                    <td key={i} className={`${cellBorder} text-center text-white`}>{fmtNum(v)}</td>
                  ))}
                </tr>
                <tr style={{ backgroundColor: "#C0C0C0" }}>
                  <td className={`${cellBorder} font-bold w-[80px]`}>Silver</td>
                  {gold_silver_bronze.silver.map((v, i) => (
                    <td key={i} className={`${cellBorder} text-center`}>{fmtNum(v)}</td>
                  ))}
                </tr>
                <tr style={{ backgroundColor: "#CD7F32" }}>
                  <td className={`${cellBorder} text-white font-bold w-[80px]`}>Bronze</td>
                  {gold_silver_bronze.bronze.map((v, i) => (
                    <td key={i} className={`${cellBorder} text-center text-white`}>{fmtNum(v)}</td>
                  ))}
                </tr>
              </tbody>
            </table>

            {/* Gold/Silver/Bronze Line Charts */}
            <div className="mb-8">
              {[
                { label: "BRONZE", values: gold_silver_bronze.bronze, color: "#CD7F32" },
                { label: "SILVER", values: gold_silver_bronze.silver, color: "#808080" },
                { label: "GOLD", values: gold_silver_bronze.gold, color: "#D4AF37" },
              ].map((zone) => (
                <div key={zone.label} className="mb-4">
                  <h4 className="font-bold text-center text-sm mb-1" style={{ color: zone.color }}>{zone.label}</h4>
                  <div className="flex items-center justify-center gap-0">
                    {zone.values.map((v, i) => (
                      <div key={i} className="flex items-center">
                        <span className="text-xs font-bold" style={{ color: zone.color }}>{fmtNum(v)}</span>
                        {i < zone.values.length - 1 && (
                          <div className="w-16 h-[2px] mx-1" style={{ backgroundColor: zone.color }}></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
