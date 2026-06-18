"use client";

import { useMonthlyCurve } from "@/hooks/useValuation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const MATURITY_LABELS: Record<string, string> = {
  yr_1:  "1Y",
  yr_2:  "2Y",
  yr_3:  "3Y",
  yr_5:  "5Y",
  yr_7:  "7Y",
  yr_10: "10Y",
  yr_20: "20Y",
  yr_30: "30Y",
};

const FIELDS = Object.keys(MATURITY_LABELS);

export default function TreasuryCurvePage() {
  const { data, isLoading, error } = useMonthlyCurve();

  if (isLoading)
    return <div className="p-8 text-black text-center">Loading yield curve data...</div>;
  if (error || !data)
    return <div className="p-8 text-red-500 text-center">Failed to load.</div>;

  const { months } = data;
  if (months.length < 2) return <div className="p-8 text-black text-center">Not enough data to construct curve.</div>;

  // Take the latest 2 months
  const m1 = months[months.length - 2];
  const m2 = months[months.length - 1];

  // Chart data format
  const chartData = FIELDS.map(f => ({
    name: MATURITY_LABELS[f],
    [m1.month]: m1.curve[f],
    [m2.month]: m2.curve[f]
  }));

  return (
    <div className="min-h-screen bg-white text-black p-6 w-full flex flex-col items-center">
      <h1 className="text-xl font-bold mb-4">Treasury Yield Curve</h1>

      <div className="w-full max-w-4xl border border-gray-300 p-4 mb-4 shadow-sm">
        <h2 className="text-center font-bold text-lg mb-4">Treasury Yield Curve</h2>
        <div className="h-80 w-full mb-8">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} />
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
              <Line type="monotone" dataKey={m1.month} stroke="#82ca9d" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey={m2.month} stroke="#1f2937" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <table className="w-full text-sm border-collapse border border-gray-300 text-center">
          <thead>
            <tr className="bg-[#f0f0f0] font-semibold border-b-2 border-gray-400">
              <th className="border border-gray-300 px-3 py-2">Month</th>
              {FIELDS.map(f => (
                <th key={f} className="border border-gray-300 px-3 py-2">{MATURITY_LABELS[f]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...months].reverse().map((m, idx) => (
              <tr key={m.month}>
                <td className="border border-gray-300 px-3 py-2 font-bold">{m.month}</td>
                {FIELDS.map(f => (
                  <td key={f} className="border border-gray-300 px-3 py-2 text-purple-700">
                    {m.curve[f] !== null ? m.curve[f]?.toFixed(2) : "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
