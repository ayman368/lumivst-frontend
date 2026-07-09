"use client";

import { useValuationCopy, useTreasuryLatest, useBondDashboard } from "@/hooks/useValuation";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import React from "react";

export default function ValuationCopyPage() {
  const { data, isLoading, error } = useValuationCopy();
  const { data: treasuryLatest } = useTreasuryLatest();
  const { data: bondDashboard } = useBondDashboard();

  if (isLoading) return <LoadingSpinner className="h-[50vh]" />;
  if (error || !data) return <div className="p-8 text-red-500 text-center">Failed to load data.</div>;

  const rowCount = 10;
  const rows = Array.from({ length: rowCount }, (_, i) => i);

  const safeVal = (arr: any[] | undefined, index: number, key: string) => {
    if (!arr || arr.length <= index) return "";
    return arr[index][key];
  };

  const safeFormat = (arr: any[] | undefined, index: number, key: string, isPct: boolean = false, isDate: boolean = false) => {
    const val = safeVal(arr, index, key);
    if (!val) return "";
    if (isDate) {
      return new Date(val).toISOString().split('T')[0];
    }
    if (typeof val === 'number') {
      return isPct ? `${val.toFixed(2)}%` : val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return val;
  };

  const getStats = (arr: any[] | undefined) => {
    if (!arr || arr.length === 0) return null;
    const last = arr[0].value;
    const prev = arr.length > 1 ? arr[1].value : null;
    const changePrev = prev != null ? last - prev : null;
    const oneYearAgo = arr[arr.length - 1].value;
    const change1Y = oneYearAgo != null ? last - oneYearAgo : null;
    const avg = arr.reduce((sum: number, item: any) => sum + item.value, 0) / arr.length;

    // Calculate CAGR from the time span of available data
    let cagr: number | null = null;
    if (arr.length >= 2) {
      const lastDate = new Date(arr[0].date);
      const firstDate = new Date(arr[arr.length - 1].date);
      const years = (lastDate.getTime() - firstDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      const first = arr[arr.length - 1].value;
      if (first > 0 && years > 0) {
        cagr = (Math.pow(last / first, 1 / years) - 1) * 100;
      }
    }

    return {
      name: "",
      lastValue: last,
      latestPeriod: arr[0].date.split('T')[0],
      longTermAverage: avg,
      avgAnnGrowth: cagr,
      valPrev: prev,
      changePrev: changePrev,
      val1Y: oneYearAgo,
      change1Y: change1Y,
      frequency: "Daily",
      unit: "%"
    };
  };

  const earnStats = getStats(data.sp_ey);
  const divStats = getStats(data.dividend);

  // Common classes
  const headerGreen = "bg-[#70AD47] text-white font-bold text-center px-2 py-1 border border-gray-300";
  const headerGray = "bg-[#f3f3f3] text-gray-700 font-bold text-center px-2 py-1 border border-gray-300";
  const cell = "px-2 py-1 border border-gray-300 whitespace-nowrap text-right";
  const cellLeft = "px-2 py-1 border border-gray-300 whitespace-nowrap text-left font-semibold";
  const cellDate = "px-2 py-1 border border-gray-300 whitespace-nowrap text-center text-gray-600";
  const sep = "w-2 bg-white"; // Separator column

  return (
    <div className="min-h-screen bg-white text-black p-4 w-full flex flex-col gap-6" style={{ fontFamily: "Arial, sans-serif", fontSize: "11px" }}>

      {/* Row 1: Bond Yields + A, BBB, BB, B, Earning, Dividend, SP500 */}
      <div className="flex overflow-x-auto w-full items-start">
        <table className="border-collapse">
          <thead>
            <tr>
              <th className={headerGray} colSpan={2}>Bond / Yield</th>
              <th className={sep}></th>
              <th className={headerGreen} colSpan={2}>A</th>
              <th className={sep}></th>
              <th className={headerGreen} colSpan={2}>BBB</th>
              <th className={sep}></th>
              <th className={headerGreen} colSpan={2}>BB</th>
              <th className={sep}></th>
              <th className={headerGreen} colSpan={2}>B</th>
              <th className={sep}></th>
              <th className={headerGreen} colSpan={2}>Earning</th>
              <th className={sep}></th>
              <th className={headerGreen} colSpan={2}>Dividend</th>
              <th className={sep}></th>
              <th className={headerGreen} colSpan={2}>SP 500</th>
            </tr>
            <tr className={headerGray}>
              <th className="border px-2">Bond</th>
              <th className="border px-2">Yield</th>
              <th className={sep}></th>
              <th className="border px-2">Date</th>
              <th className="border px-2">Value</th>
              <th className={sep}></th>
              <th className="border px-2">Date</th>
              <th className="border px-2">Value</th>
              <th className={sep}></th>
              <th className="border px-2">Date</th>
              <th className="border px-2">Value</th>
              <th className={sep}></th>
              <th className="border px-2">Date</th>
              <th className="border px-2">Value</th>
              <th className={sep}></th>
              <th className="border px-2">Metric</th>
              <th className="border px-2 w-[120px]">Value</th>
              <th className={sep}></th>
              <th className="border px-2">Metric</th>
              <th className="border px-2 w-[120px]">Value</th>
              <th className={sep}></th>
              <th className="border px-2">Date</th>
              <th className="border px-2">Value</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((i) => (
              <tr key={i} className="hover:bg-gray-50">
                {/* Fixed stats column on the left */}
                <td className={cellLeft}>{i === 0 ? "A" : i === 1 ? "BBB" : i === 2 ? "BB" : i === 3 ? "B" : i === 4 ? "SP-EY" : i === 5 ? "SP-EY/A" : i === 6 ? "SP-EY/BBB" : i === 7 ? "Growth-KSA" : ""}</td>
                <td className={cell}>
                  {i === 0 ? (bondDashboard?.a_yield ? `${bondDashboard.a_yield.toFixed(2)}%` : "") :
                    i === 1 ? (bondDashboard?.bbb_yield ? `${bondDashboard.bbb_yield.toFixed(2)}%` : "") :
                      i === 2 ? (bondDashboard?.bb_yield ? `${bondDashboard.bb_yield.toFixed(2)}%` : "") :
                        i === 3 ? (bondDashboard?.b_yield ? `${bondDashboard.b_yield.toFixed(2)}%` : "") :
                          i === 4 ? (bondDashboard?.sp500_ey ? `${bondDashboard.sp500_ey.toFixed(2)}%` : "") :
                            i === 5 ? (bondDashboard?.sp_ey_a_ratio ? bondDashboard.sp_ey_a_ratio.toFixed(2) : "") :
                              i === 6 ? (bondDashboard?.sp_ey_bbb_ratio ? bondDashboard.sp_ey_bbb_ratio.toFixed(2) : "") :
                                i === 7 ? (data.growth_ksa ? `${data.growth_ksa}X` : "4X") : ""}
                </td>
                <td className={sep}></td>
                {/* A */}
                <td className={cellDate}>{safeFormat(data.a_yield, i, 'date', false, true)}</td>
                <td className={cell}>{safeFormat(data.a_yield, i, 'value')}</td>
                <td className={sep}></td>
                {/* BBB */}
                <td className={cellDate}>{safeFormat(data.bbb_yield, i, 'date', false, true)}</td>
                <td className={cell}>{safeFormat(data.bbb_yield, i, 'value')}</td>
                <td className={sep}></td>
                {/* BB */}
                <td className={cellDate}>{safeFormat(data.bb_yield, i, 'date', false, true)}</td>
                <td className={cell}>{safeFormat(data.bb_yield, i, 'value')}</td>
                <td className={sep}></td>
                {/* B */}
                <td className={cellDate}>{safeFormat(data.b_yield, i, 'date', false, true)}</td>
                <td className={cell}>{safeFormat(data.b_yield, i, 'value')}</td>
                <td className={sep}></td>
                {/* Earning Stats */}
                <td className={`${cellLeft} bg-[#e2efda]`}>
                  {i === 0 ? "Name" :
                    i === 1 ? "Last Value" :
                      i === 2 ? "Latest Period" :
                        i === 3 ? "Long Term Average" :
                          i === 4 ? "Average Annualized Growth Rate" :
                            i === 5 ? "Value from The Previous Market Day" :
                              i === 6 ? "Change from The Previous Market Day" :
                                i === 7 ? "Value from 1 year ago" :
                                  i === 8 ? "Change from 1 year ago" :
                                    i === 9 ? "Frequency" :
                                      i === 10 ? "Unit" : ""}
                </td>
                <td className={`${cell} bg-[#e2efda]`}>
                  {i === 0 ? "SP500_EY" :
                    i === 1 ? (earnStats?.lastValue ? `${earnStats.lastValue.toFixed(3)}%` : "") :
                      i === 2 ? earnStats?.latestPeriod :
                        i === 3 ? (earnStats?.longTermAverage ? `${earnStats.longTermAverage.toFixed(2)}%` : "") :
                          i === 4 ? (earnStats?.avgAnnGrowth != null ? `${earnStats.avgAnnGrowth.toFixed(2)}%` : "") :
                            i === 5 ? (earnStats?.valPrev != null ? `${earnStats.valPrev.toFixed(3)}%` : "") :
                              i === 6 ? (earnStats?.changePrev ? `${earnStats.changePrev > 0 ? '+' : ''}${earnStats.changePrev.toFixed(2)}%` : "") :
                                i === 7 ? (earnStats?.val1Y ? `${earnStats.val1Y.toFixed(3)}%` : "") :
                                  i === 8 ? (earnStats?.change1Y ? `${earnStats.change1Y > 0 ? '+' : ''}${earnStats.change1Y.toFixed(2)}%` : "") :
                                    i === 9 ? earnStats?.frequency :
                                      i === 10 ? earnStats?.unit : ""}
                </td>
                <td className={sep}></td>
                {/* Dividend Stats */}
                <td className={`${cellLeft} bg-[#e2efda]`}>
                  {i === 0 ? "Name" :
                    i === 1 ? "Last Value" :
                      i === 2 ? "Latest Period" :
                        i === 3 ? "Long Term Average" :
                          i === 4 ? "Average Annualized Growth Rate" :
                            i === 5 ? "Value from The Previous Market Day" :
                              i === 6 ? "Change from The Previous Market Day" :
                                i === 7 ? "Value from 1 year ago" :
                                  i === 8 ? "Change from 1 year ago" :
                                    i === 9 ? "Frequency" :
                                      i === 10 ? "Unit" : ""}
                </td>
                <td className={`${cell} bg-[#e2efda]`}>
                  {i === 0 ? "SP500_DIV_YIELD" :
                    i === 1 ? (divStats?.lastValue ? `${divStats.lastValue.toFixed(3)}%` : "") :
                      i === 2 ? divStats?.latestPeriod :
                        i === 3 ? (divStats?.longTermAverage ? `${divStats.longTermAverage.toFixed(2)}%` : "") :
                          i === 4 ? (divStats?.avgAnnGrowth != null ? `${divStats.avgAnnGrowth.toFixed(2)}%` : "") :
                            i === 5 ? (divStats?.valPrev != null ? `${divStats.valPrev.toFixed(3)}%` : "") :
                              i === 6 ? (divStats?.changePrev ? `${divStats.changePrev > 0 ? '+' : ''}${divStats.changePrev.toFixed(2)}%` : "") :
                                i === 7 ? (divStats?.val1Y ? `${divStats.val1Y.toFixed(3)}%` : "") :
                                  i === 8 ? (divStats?.change1Y ? `${divStats.change1Y > 0 ? '+' : ''}${divStats.change1Y.toFixed(2)}%` : "") :
                                    i === 9 ? divStats?.frequency :
                                      i === 10 ? divStats?.unit : ""}
                </td>
                <td className={sep}></td>
                {/* SP500 */}
                <td className={cellDate}>{safeFormat(data.sp500_price, i, 'date', false, true)}</td>
                <td className={cell}>{safeFormat(data.sp500_price, i, 'value')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Row 2: Macros and Yields */}
      <div className="flex overflow-x-auto w-full items-start mt-4">
        <table className="border-collapse">
          <thead>
            <tr>
              <th className={headerGreen} colSpan={2}>Unemployment Rate</th>
              <th className={sep}></th>
              <th className={headerGreen} colSpan={2}>All Employees, Total Nonfarm</th>
              <th className={sep}></th>
              <th className={headerGreen} colSpan={2}>4-Week Moving Average of Initial Claims</th>
              <th className={sep}></th>
              <th className={headerGreen} colSpan={2}>10Y-2Y</th>
              <th className={sep}></th>
              <th className={headerGray} colSpan={2}>0% Yields</th>
              <th className={sep}></th>
              <th className={headerGreen} colSpan={2}>ICE BofA Single-A US Corporate Index Option-Adjusted</th>
              <th className={sep}></th>
              <th className={headerGreen} colSpan={2}>ICE BofA BBB US Corporate Index Option-Adjusted</th>
              <th className={sep}></th>
              <th className={headerGreen} colSpan={5}>Related</th>
            </tr>
            <tr className={headerGray}>
              <th className="border px-2">Date</th>
              <th className="border px-2">Value</th>
              <th className={sep}></th>
              <th className="border px-2">Date</th>
              <th className="border px-2">Value</th>
              <th className={sep}></th>
              <th className="border px-2">Date</th>
              <th className="border px-2">Value</th>
              <th className={sep}></th>
              <th className="border px-2">Date</th>
              <th className="border px-2">Value</th>
              <th className={sep}></th>
              <th className="border px-2">Metric</th>
              <th className="border px-2">Value</th>
              <th className={sep}></th>
              <th className="border px-2">Date</th>
              <th className="border px-2">Value</th>
              <th className={sep}></th>
              <th className="border px-2">Date</th>
              <th className="border px-2">Value</th>
              <th className={sep}></th>
              <th className="border px-2">Name</th>
              <th className="border px-2">Last</th>
              <th className="border px-2">Previous</th>
              <th className="border px-2">Unit</th>
              <th className="border px-2">Reference</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((i) => (
              <tr key={i} className="hover:bg-gray-50">
                {/* UNRATE */}
                <td className={cellDate}>{safeFormat(data.unemployment, i, 'date', false, true)}</td>
                <td className={cell}>{safeFormat(data.unemployment, i, 'value')}</td>
                <td className={sep}></td>
                {/* PAYEMS */}
                <td className={cellDate}>{safeFormat(data.nonfarm, i, 'date', false, true)}</td>
                <td className={cell}>{safeFormat(data.nonfarm, i, 'value')}</td>
                <td className={sep}></td>
                {/* IC4WSA */}
                <td className={cellDate}>{safeFormat(data.claims, i, 'date', false, true)}</td>
                <td className={cell}>{safeFormat(data.claims, i, 'value')}</td>
                <td className={sep}></td>
                {/* 10Y-2Y */}
                <td className={cellDate}>{safeFormat(data.spread, i, 'date', false, true)}</td>
                <td className={cell}>{safeFormat(data.spread, i, 'value')}</td>
                <td className={sep}></td>

                {/* Yields (only 5 rows) */}
                <td className={cellLeft}>
                  {i === 0 ? "1-month yield" :
                    i === 1 ? "1-year yield" :
                      i === 2 ? "2-year yield" :
                        i === 3 ? "10-year yield" :
                          i === 4 ? "30-year yield" : ""}
                </td>
                <td className={cell}>
                  {i === 0 ? (treasuryLatest?.month_1 ? `${treasuryLatest.month_1.toFixed(4)}%` : "") :
                    i === 1 ? (treasuryLatest?.year_1 ? `${treasuryLatest.year_1.toFixed(4)}%` : "") :
                      i === 2 ? (treasuryLatest?.year_2 ? `${treasuryLatest.year_2.toFixed(4)}%` : "") :
                        i === 3 ? (treasuryLatest?.year_10 ? `${treasuryLatest.year_10.toFixed(4)}%` : "") :
                          i === 4 ? (treasuryLatest?.year_30 ? `${treasuryLatest.year_30.toFixed(4)}%` : "") : ""}
                </td>
                <td className={sep}></td>

                {/* Option Adjusted A */}
                <td className={cellDate}>{safeFormat(data.a_oas, i, 'date', false, true)}</td>
                <td className={cell}>{safeFormat(data.a_oas, i, 'value')}</td>
                <td className={sep}></td>

                {/* Option Adjusted BBB */}
                <td className={cellDate}>{safeFormat(data.bbb_oas, i, 'date', false, true)}</td>
                <td className={cell}>{safeFormat(data.bbb_oas, i, 'value')}</td>
                <td className={sep}></td>

                {/* Related Data Block */}
                <td className={`${cellLeft} bg-[#e2efda]`}>
                  {i === 0 ? "Banks Balance Sheet" :
                    i === 1 ? "Fed Balance Sheet" :
                      i === 2 ? "Foreign Exchange Reserves" :
                        i === 3 ? "Inflation Rate YoY" :
                          i === 4 ? "Fed Interest Rate" :
                            i === 5 ? "Loans to Private Sector" :
                              i === 6 ? "Money Supply M0" :
                                i === 7 ? "Money Supply M1" :
                                  i === 8 ? "Money Supply M2" :
                                    i === 9 ? "Unemployment Rate" : ""}
                </td>
                <td className={`${cell} bg-[#e2efda]`}>
                  {i === 0 ? (data.banks_balance_sheet && data.banks_balance_sheet[0] ? data.banks_balance_sheet[0].value : "") :
                    i === 1 ? (data.fed_balance_sheet && data.fed_balance_sheet[0] ? data.fed_balance_sheet[0].value : "") :
                      i === 2 ? (data.fx_reserves && data.fx_reserves[0] ? data.fx_reserves[0].value : "") :
                        i === 3 ? (data.inflation && data.inflation[0] ? data.inflation[0].value : "") :
                          i === 4 ? (data.fed_rate && data.fed_rate[0] ? data.fed_rate[0].value : "") :
                            i === 5 ? (data.loans && data.loans[0] ? data.loans[0].value : "") :
                              i === 6 ? (data.m0 && data.m0[0] ? data.m0[0].value : "") :
                                i === 7 ? (data.m1 && data.m1[0] ? data.m1[0].value : "") :
                                  i === 8 ? (data.m2 && data.m2[0] ? data.m2[0].value : "") :
                                    i === 9 ? (data.unemployment && data.unemployment[0] ? data.unemployment[0].value : "") : ""}
                </td>
                <td className={`${cell} bg-[#e2efda]`}>
                  {i === 0 ? (data.banks_balance_sheet && data.banks_balance_sheet.length > 1 ? data.banks_balance_sheet[1].value : "") :
                    i === 1 ? (data.fed_balance_sheet && data.fed_balance_sheet.length > 1 ? data.fed_balance_sheet[1].value : "") :
                      i === 2 ? (data.fx_reserves && data.fx_reserves.length > 1 ? data.fx_reserves[1].value : "") :
                        i === 3 ? (data.inflation && data.inflation.length > 1 ? data.inflation[1].value : "") :
                          i === 4 ? (data.fed_rate && data.fed_rate.length > 1 ? data.fed_rate[1].value : "") :
                            i === 5 ? (data.loans && data.loans.length > 1 ? data.loans[1].value : "") :
                              i === 6 ? (data.m0 && data.m0.length > 1 ? data.m0[1].value : "") :
                                i === 7 ? (data.m1 && data.m1.length > 1 ? data.m1[1].value : "") :
                                  i === 8 ? (data.m2 && data.m2.length > 1 ? data.m2[1].value : "") :
                                    i === 9 ? (data.unemployment && data.unemployment.length > 1 ? data.unemployment[1].value : "") : ""}
                </td>
                <td className={`${cellDate} bg-[#e2efda]`}>
                  {i === 0 ? "USD Billion" :
                    i === 1 ? "USD Million" :
                      i === 2 ? "USD Million" :
                        i === 3 ? "percent" :
                          i === 4 ? "percent" :
                            i === 5 ? "USD Billion" :
                              i === 6 ? "USD Million" :
                                i === 7 ? "USD Billion" :
                                  i === 8 ? "USD Billion" :
                                    i === 9 ? "percent" : ""}
                </td>
                <td className={`${cellDate} bg-[#e2efda]`}>
                  {i === 0 ? (data.banks_balance_sheet && data.banks_balance_sheet[0] ? safeFormat(data.banks_balance_sheet, 0, 'date', false, true) : "") :
                    i === 1 ? (data.fed_balance_sheet && data.fed_balance_sheet[0] ? safeFormat(data.fed_balance_sheet, 0, 'date', false, true) : "") :
                      i === 2 ? (data.fx_reserves && data.fx_reserves[0] ? safeFormat(data.fx_reserves, 0, 'date', false, true) : "") :
                        i === 3 ? (data.inflation && data.inflation[0] ? safeFormat(data.inflation, 0, 'date', false, true) : "") :
                          i === 4 ? (data.fed_rate && data.fed_rate[0] ? safeFormat(data.fed_rate, 0, 'date', false, true) : "") :
                            i === 5 ? (data.loans && data.loans[0] ? safeFormat(data.loans, 0, 'date', false, true) : "") :
                              i === 6 ? (data.m0 && data.m0[0] ? safeFormat(data.m0, 0, 'date', false, true) : "") :
                                i === 7 ? (data.m1 && data.m1[0] ? safeFormat(data.m1, 0, 'date', false, true) : "") :
                                  i === 8 ? (data.m2 && data.m2[0] ? safeFormat(data.m2, 0, 'date', false, true) : "") :
                                    i === 9 ? (data.unemployment && data.unemployment[0] ? safeFormat(data.unemployment, 0, 'date', false, true) : "") : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}