"use client";

import { useHistoricalPE } from "@/hooks/useValuation";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
  BarChart,
  Bar,
  Cell
} from "recharts";
import React from "react";

export default function HistoricalPEPage() {
  const { data, error, isLoading } = useHistoricalPE(10);

  if (isLoading) return <LoadingSpinner className="h-[50vh]" />;
  if (error || !data) return <div className="p-8 text-red-600 text-center">Failed to load data.</div>;

  // Format data for Line Chart
  const chartData = data.rows.map(r => ({
    name: r.label,
    pe: r.pe
  }));

  // Bar Chart Data (Overlapping logic: larger value is drawn in background, smaller in foreground)
  const barData = [
    {
      name: "2026F",
      target: data.target_price_2026 || 0,
      targetAdj: data.target_price_adj_2026 || 0,
      // The stacked trick: the gray part is just the difference if Adj > Target
      diff: (data.target_price_adj_2026 || 0) - (data.target_price_2026 || 0)
    },
    {
      name: "2027F",
      target: data.target_price_2027 || 0,
      targetAdj: data.target_price_adj_2027 || 0,
      diff: (data.target_price_adj_2027 || 0) - (data.target_price_2027 || 0)
    }
  ];

  // Helper for formatting percentages with parentheses for negative (for Deviation Table)
  const formatDev = (val: number | null | undefined, isPct = false) => {
    if (val == null) return "—";
    const num = isPct ? val : val * 100;
    if (num < 0) return <span className="text-[#C00000]">({Math.abs(num).toFixed(0)}%)</span>;
    return <span>{num.toFixed(0)}%</span>;
  };

  // Dynamically build columns based on data.rows
  const historicalRows = data.rows.filter(r => !r.is_estimate && r.label !== "TTM");
  historicalRows.sort((a, b) => a.year - b.year);
  const recentHistorical = historicalRows.slice(-7); // take up to last 7 years

  const cols: { id: string, label: string, isFuture?: boolean }[] = recentHistorical.map((r, i) => ({
    id: `Y${i + 1}`, label: r.label, isFuture: false
  }));

  let nextId = cols.length + 1;
  if (data.rows.some(r => r.label === "TTM")) {
    cols.push({ id: `Y${nextId++}`, label: "TTM", isFuture: false });
  }

  const futureRows = data.rows.filter(r => r.is_estimate);
  futureRows.sort((a, b) => a.year - b.year);
  futureRows.forEach(r => {
    cols.push({ id: `Y${nextId++}`, label: r.label, isFuture: true });
  });

  // Map rows by label for easy access in tables
  const rowMap = data.rows.reduce((acc, row) => {
    acc[row.label] = row;
    return acc;
  }, {} as Record<string, typeof data.rows[0]>);

  const renderCell = (colLabel: string, field: "pe" | "ey_pct" | "ey_a_ratio" | "ey_a_ratio_adj") => {
    const row = rowMap[colLabel];
    if (!row) return "";
    const val = row[field];
    if (val == null) return "";
    if (field === "pe") return val.toFixed(1).replace('.0', '');
    if (field === "ey_pct") return `${val.toFixed(2)}%`;
    return val.toFixed(2);
  };

  return (
    <div className="min-h-screen bg-white text-black p-6 w-full flex flex-col items-center">
      <div className="w-full max-w-[1000px] border border-gray-300 shadow-sm p-4 bg-white">
        
        {/* Title */}
        <div className="text-center border-t-2 border-b-2 border-dotted border-black py-2 mb-4">
          <h1 className="text-xl font-bold text-[#C00000]">مكرر الأرباح التاريخي</h1>
        </div>

        {/* Line Chart */}
        <div className="w-full h-[300px] border border-gray-300 p-2 mb-4 bg-white relative">
          <h2 className="text-center text-[#C00000] font-bold text-sm mb-2">Historical P/E</h2>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={chartData} margin={{ top: 20, right: 20, bottom: 0, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={true} stroke="#ccc" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#000", fontWeight: "bold" }} axisLine={false} tickLine={false} />
              <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
              <Line type="linear" dataKey="pe" stroke="#4472C4" strokeWidth={2} dot={{ r: 4, fill: "#4472C4" }}>
                <LabelList dataKey="pe" position="top" style={{ fontSize: 12, fill: "#000", fontWeight: "bold" }} formatter={(val: any) => val != null ? Number(val).toFixed(1).replace('.0', '') : ''} />
              </Line>
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Tables Section */}
        <div className="w-full overflow-x-auto mb-4">
          
          {/* Table 1: P/E and E/Y */}
          <table className="w-full text-[11px] border-collapse border-2 border-black text-center font-bold mb-4" dir="ltr">
            <thead>
              <tr>
                <th className="border border-black px-1 py-1 w-[12%] bg-white">S&P 500</th>
                {cols.map(c => (
                  <th key={c.id} className="border border-black px-1 py-1 w-[8.8%] bg-white">{c.id}</th>
                ))}
              </tr>
              <tr>
                <th className="border border-black px-1 py-1 text-left bg-white">Year</th>
                {cols.map(c => (
                  <th key={c.id} className={`border border-black px-1 py-1 ${c.isFuture ? 'text-[#C00000]' : 'text-black'} bg-white`}>{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black px-1 py-1 text-left bg-white">P/E</td>
                {cols.map(c => (
                  <td key={c.id} className={`border border-black px-1 py-1 bg-yellow-300 ${c.isFuture ? 'text-[#C00000]' : 'text-black'}`}>
                    {renderCell(c.label, "pe")}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border border-black px-1 py-1 text-left bg-white">E/Y</td>
                {cols.map(c => (
                  <td key={c.id} className={`border border-black px-1 py-1 bg-white ${c.isFuture ? 'text-[#C00000]' : 'text-black'}`}>
                    {renderCell(c.label, "ey_pct")}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>

          {/* Table 2: CB A Yield and Target Price */}
          <table className="w-full text-[11px] border-collapse border-2 border-black text-center font-bold mb-4" dir="ltr">
            <tbody>
              <tr>
                <td className="border border-black px-1 py-1 text-left w-[12%] bg-white">CB A Yield</td>
                {cols.map(c => (
                  <td key={c.id} className={`border border-black px-1 py-1 w-[8.8%] bg-white ${c.isFuture ? 'text-[#C00000]' : 'text-black'}`}>
                    {data.a_yield_pct.toFixed(2)}%
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border border-black px-1 py-1 text-left border-green-500 border-2 bg-white">EY/A</td>
                {cols.map(c => (
                  <td key={c.id} className={`border border-black px-1 py-1 bg-white ${c.isFuture ? 'text-[#C00000]' : 'text-black'}`}>
                    {renderCell(c.label, "ey_a_ratio")}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border border-black px-1 py-1 text-left bg-white">Required Yield</td>
                {cols.map(c => (
                  <td key={c.id} className={`border border-black px-1 py-1 bg-white ${c.isFuture ? 'text-[#C00000]' : 'text-black'}`}>
                    {c.isFuture ? `${data.required_ey_pct?.toFixed(2) ?? '—'}%` : ""}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border border-black px-1 py-1 text-left bg-white">Target Price</td>
                {cols.map(c => {
                  let tp = "";
                  if (c.id === "Y9" && data.target_price_2026) tp = data.target_price_2026.toLocaleString(undefined, {maximumFractionDigits:0});
                  if (c.id === "Y10" && data.target_price_2027) tp = data.target_price_2027.toLocaleString(undefined, {maximumFractionDigits:0});
                  return (
                    <td key={c.id} className={`border border-black px-1 py-1 bg-white ${c.isFuture ? 'text-[#C00000]' : 'text-black'}`}>
                      {tp}
                    </td>
                  );
                })}
              </tr>
              {/* Extra row for the "1.50" text below Target Price */}
              <tr>
                <td className="px-1 py-1 text-left bg-white border-0"></td>
                {cols.map(c => (
                  <td key={c.id} className="px-1 py-1 bg-white border-0 text-[9px] text-black">
                    {c.isFuture ? "1.50" : ""}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>

          {/* Table 3: CB A Yield Adj and Target Price Adj */}
          <table className="w-full text-[11px] border-collapse border-2 border-black text-center font-bold mb-4" dir="ltr">
            <tbody>
              <tr>
                <td className="border border-black px-1 py-1 text-left w-[12%] bg-white">CB A Yield Adj</td>
                {cols.map(c => (
                  <td key={c.id} className={`border border-black px-1 py-1 w-[8.8%] bg-white ${c.isFuture ? 'text-[#C00000]' : 'text-black'}`}>
                    {data.a_yield_3yr_avg_pct.toFixed(2)}%
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border border-black px-1 py-1 text-left bg-white">EY/A Adj.</td>
                {cols.map(c => (
                  <td key={c.id} className={`border border-black px-1 py-1 bg-white ${c.isFuture ? 'text-[#C00000]' : 'text-black'}`}>
                    {renderCell(c.label, "ey_a_ratio_adj")}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border border-black px-1 py-1 text-left bg-white">Required Yield Adj.</td>
                {cols.map(c => (
                  <td key={c.id} className={`border border-black px-1 py-1 bg-white ${c.isFuture ? 'text-[#C00000]' : 'text-black'}`}>
                    {c.isFuture ? `${data.required_ey_adj_pct?.toFixed(2) ?? '—'}%` : ""}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="border border-black px-1 py-1 text-left bg-white">Target Price Adj.</td>
                {cols.map(c => {
                  let tp = "";
                  if (c.id === "Y9" && data.target_price_adj_2026) tp = data.target_price_adj_2026.toLocaleString(undefined, {maximumFractionDigits:0});
                  if (c.id === "Y10" && data.target_price_adj_2027) tp = data.target_price_adj_2027.toLocaleString(undefined, {maximumFractionDigits:0});
                  return (
                    <td key={c.id} className={`border border-black px-1 py-1 bg-white ${c.isFuture ? 'text-[#C00000]' : 'text-black'}`}>
                      {tp}
                    </td>
                  );
                })}
              </tr>
              {/* Extra row for the "1.50" text below Target Price Adj */}
              <tr>
                <td className="px-1 py-1 text-left bg-white border-0"></td>
                {cols.map(c => (
                  <td key={c.id} className="px-1 py-1 bg-white border-0 text-[9px] text-black">
                    {c.isFuture ? "1.50" : ""}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>

          {/* Deviation Table */}
          <div className="w-[60%]">
            <table className="w-full text-[11px] border-collapse border-2 border-black text-center font-bold" dir="ltr">
              <thead>
                <tr>
                  <th className="border border-black px-1 py-1 bg-white text-left">P/E V Historical</th>
                  <th className="border border-black px-1 py-1 bg-white">P/E</th>
                  <th className="border border-black px-1 py-1 bg-white">TTM</th>
                  <th className="border border-black px-1 py-1 bg-white">2026F</th>
                  <th className="border border-black px-1 py-1 bg-white">2027F</th>
                  <th className="border border-black px-1 py-1 bg-white">Target</th>
                  <th className="border border-black px-1 py-1 bg-white">Target-Int Adj.</th>
                </tr>
              </thead>
              <tbody>
                {['max', 'min', 'median', 'average'].map(stat => {
                  const label = (stat === 'min' || stat === 'max') ? stat.toUpperCase() : stat.charAt(0).toUpperCase() + stat.slice(1);
                  return (
                    <tr key={stat}>
                      <td className="border border-black px-1 py-1 text-left bg-white">{label}</td>
                      <td className="border border-black px-1 py-1 bg-white">{(data?.pe_stats?.[stat as keyof typeof data.pe_stats] as number)?.toFixed(1) ?? ''}</td>
                      <td className="border border-black px-1 py-1 bg-white">{formatDev((data.deviations as any)[stat].ttm)}</td>
                      <td className="border border-black px-1 py-1 bg-white">{formatDev((data.deviations as any)[stat].f2026)}</td>
                      <td className="border border-black px-1 py-1 bg-white">{formatDev((data.deviations as any)[stat].f2027)}</td>
                      <td className="border border-black px-1 py-1 bg-white">{formatDev((data.deviations as any)[stat].target)}</td>
                      <td className="border border-black px-1 py-1 bg-white">{formatDev((data.deviations as any)[stat].target_adj)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>

        {/* Target Price Bar Chart */}
        <div className="w-full h-[250px] mt-8 pt-4 border-t border-gray-300">
          <h2 className="text-center text-gray-500 font-bold text-sm mb-4">Target Price</h2>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={barData} margin={{ top: 20, right: 150, bottom: 0, left: 150 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ccc" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#000", fontWeight: "bold" }} axisLine={true} tickLine={false} />
              <YAxis hide domain={[0, 'dataMax + 1000']} />
              
              {/* Stacked bar to simulate 100% overlap */}
              <Bar dataKey="target" stackId="a" fill="#D4AF37" barSize={350}>
                <LabelList dataKey="target" position="inside" style={{ fontSize: 10, fill: "#000", fontWeight: "bold" }} formatter={(val: any) => val != null ? Number(val).toLocaleString(undefined, {maximumFractionDigits:0}) : ''} />
              </Bar>
              <Bar dataKey="diff" stackId="a" fill="#D9D9D9" barSize={350}>
                <LabelList dataKey="targetAdj" position="top" offset={5} style={{ fontSize: 10, fill: "#000", fontWeight: "bold" }} formatter={(val: any) => val != null ? Number(val).toLocaleString(undefined, {maximumFractionDigits:0}) : ''} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          
          <div className="flex justify-center items-center gap-4 text-[10px] text-gray-600 mt-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-[#D4AF37]"></div>
              <span>Target Price</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-[#D9D9D9]"></div>
              <span>Target Price Adj.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
