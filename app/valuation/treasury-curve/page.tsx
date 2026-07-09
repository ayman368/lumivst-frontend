"use client";

import { useMonthlyCurve } from "@/hooks/useValuation";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LabelList
} from "recharts";
import React from "react";

const MATURITY_LABELS: Record<string, string> = {
  yr_1: "1 Yr",
  yr_2: "2 Yr",
  yr_3: "3 Yr",
  yr_5: "5 Yr",
  yr_7: "7 Yr",
  yr_10: "10 Yr",
  yr_20: "20 Yr",
  yr_30: "30 Yr",
};

const FIELDS = Object.keys(MATURITY_LABELS);

export default function TreasuryCurvePage() {
  const { data, isLoading, error } = useMonthlyCurve();

  if (isLoading) return <LoadingSpinner className="h-[50vh]" />;
  if (error || !data)
    return <div className="p-8 text-red-500 text-center">Failed to load.</div>;

  const { months } = data;
  if (months.length < 2) return <div className="p-8 text-black text-center">Not enough data to construct curve.</div>;

  // Take the latest 2 months
  const m1 = months[months.length - 2]; // e.g., May (Older) -> Green
  const m2 = months[months.length - 1]; // e.g., Jun (Newer) -> Blue

  // Chart data format
  const chartData = FIELDS.map(f => ({
    name: MATURITY_LABELS[f],
    [m1.month]: m1.curve[f] ? Number(m1.curve[f]?.toFixed(2)) : null,
    [m2.month]: m2.curve[f] ? Number(m2.curve[f]?.toFixed(2)) : null,
  }));

  // Custom label renderer: compares the two series at each point
  // and places the label above the higher value, below the lower one.
  // This fixes overlapping labels when the two lines cross each other.
  const makeLabelRenderer = (
    thisMonthKey: string,
    otherMonthKey: string,
    color: string
  ) => {
    return (props: any) => {
      const { x, y, index, value } = props;
      if (value === null || value === undefined) return null;

      const otherValue = chartData[index]?.[otherMonthKey];
      const thisValue = chartData[index]?.[thisMonthKey];

      // If the other series has no value at this point, default to top
      const isHigher =
        otherValue === null || otherValue === undefined
          ? true
          : Number(thisValue) >= Number(otherValue);

      const dy = isHigher ? -10 : 16; // above vs below the line

      return (
        <text
          x={x}
          y={y + dy}
          textAnchor="middle"
          fontSize={11}
          fontWeight="bold"
          fill={color}
        >
          {value}
        </text>
      );
    };
  };

  return (
    <div className="min-h-screen bg-white text-black p-6 w-full flex flex-col items-center">

      {/* Excel Chart Container */}
      <div className="w-[800px] border border-gray-300 bg-white p-4 mb-6 relative shadow-sm">
        <h2 className="text-center text-gray-600 text-xl mb-6 mt-2" style={{ fontFamily: "Arial, sans-serif" }}>
          Treasury Yield Curve
        </h2>

        <div className="h-[300px] w-full mb-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 30, bottom: 5 }}
            >
              <CartesianGrid stroke="#d9d9d9" vertical={false} />
              <XAxis dataKey="name" hide={true} />
              <YAxis domain={['auto', 'auto']} hide={true} />

              <Line
                type="linear"
                dataKey={m2.month}
                stroke="#1f497d"
                strokeWidth={3}
                dot={false}
                isAnimationActive={false}
              >
                <LabelList
                  dataKey={m2.month}
                  content={makeLabelRenderer(m2.month, m1.month, "#1f497d")}
                />
              </Line>
              <Line
                type="linear"
                dataKey={m1.month}
                stroke="#70ad47"
                strokeWidth={3}
                dot={false}
                isAnimationActive={false}
              >
                <LabelList
                  dataKey={m1.month}
                  content={makeLabelRenderer(m1.month, m2.month, "#70ad47")}
                />
              </Line>
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Data Table Attached to Chart */}
        <div className="px-8 mt-2">
          <table className="w-full text-[11px] text-center border-collapse border border-gray-300" style={{ fontFamily: "Arial, sans-serif" }}>
            <tbody>
              <tr>
                <td className="w-24 border border-gray-300"></td>
                {FIELDS.map(f => (
                  <td key={f} className="border border-gray-300 text-gray-600 py-1 font-bold">{MATURITY_LABELS[f]}</td>
                ))}
              </tr>
              <tr>
                <td className="border border-gray-300 py-1 px-2 text-left">
                  <div className="flex items-center space-x-1">
                    <div className="w-4 h-[3px] bg-[#1f497d]"></div>
                    <span className="font-bold text-[#1f497d] text-[10px] uppercase">{m2.month}</span>
                  </div>
                </td>
                {FIELDS.map(f => (
                  <td key={f} className="border border-gray-300 text-gray-800 font-bold">{m2.curve[f]?.toFixed(2)}</td>
                ))}
              </tr>
              <tr>
                <td className="border border-gray-300 py-1 px-2 text-left">
                  <div className="flex items-center space-x-1">
                    <div className="w-4 h-[3px] bg-[#70ad47]"></div>
                    <span className="font-bold text-[#70ad47] text-[10px] uppercase">{m1.month}</span>
                  </div>
                </td>
                {FIELDS.map(f => (
                  <td key={f} className="border border-gray-300 text-gray-800 font-bold">{m1.curve[f]?.toFixed(2)}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Excel Data Cells */}
      <div className="w-[800px]">
        <table className="w-full text-xs text-center border-collapse border-2 border-black" style={{ fontFamily: "Arial, sans-serif" }}>
          <thead>
            <tr className="bg-white border-b-2 border-black font-extrabold text-sm">
              <th className="border border-black px-2 py-1 text-left">
                Month
              </th>
              {FIELDS.map(f => (
                <th key={f} className="border border-black px-2 py-1">
                  {MATURITY_LABELS[f].replace(" Yr", " Y")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black px-2 py-1 font-extrabold text-left">{m1.month}</td>
              {FIELDS.map(f => (
                <td key={f} className="border border-black px-2 py-1 text-[#604A7B] font-semibold">
                  {m1.curve[f] !== null ? m1.curve[f]?.toFixed(2) : "—"}
                </td>
              ))}
            </tr>
            <tr>
              <td className="border border-black px-2 py-1 font-extrabold text-left">{m2.month}</td>
              {FIELDS.map(f => (
                <td key={f} className="border border-black px-2 py-1 text-[#604A7B] font-semibold">
                  {m2.curve[f] !== null ? m2.curve[f]?.toFixed(2) : "—"}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
}