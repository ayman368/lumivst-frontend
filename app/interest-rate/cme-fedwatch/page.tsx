"use client";

import { useEffect, useState } from "react";
import { format, parse } from "date-fns";
import { API_BASE_URL } from '@/lib/api/config';

export interface FedwatchData {
  id: number;
  scrape_date: string;
  meeting_date: string;
  rate_range: string;
  probability: number;
}

export default function CMEFedwatchPage() {
  const [data, setData] = useState<FedwatchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeDate, setActiveDate] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/economic-indicators/cme-fedwatch/latest`);
      if (!response.ok) throw new Error("Failed to fetch CME FedWatch data");
      const json: FedwatchData[] = await response.json();
      setData(json);
      if (json.length > 0) {
        const uniqueDates = Array.from(new Set(json.map(d => d.meeting_date))).sort();
        if (uniqueDates.length > 0) setActiveDate(uniqueDates[0]);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const groupedData = data.reduce((acc: { [key: string]: FedwatchData[] }, curr) => {
    if (!acc[curr.meeting_date]) acc[curr.meeting_date] = [];
    acc[curr.meeting_date].push(curr);
    return acc;
  }, {});

  const meetingDates = Object.keys(groupedData).sort();

  const formatTabDate = (dateStr: string) => {
    try {
      return format(parse(dateStr, 'yyyy-MM-dd', new Date()), "dd MMM yy");
    } catch { return dateStr; }
  };

  const formatTitleDate = (dateStr: string) => {
    try {
      return format(parse(dateStr, 'yyyy-MM-dd', new Date()), "dd MMM yyyy");
    } catch { return dateStr; }
  };

  const currentData = activeDate ? groupedData[activeDate] || [] : [];

  const targetRates = currentData
    .filter(d => d.rate_range.includes("-") && d.probability > 0)
    .sort((a, b) => (parseInt(a.rate_range.split("-")[0]) || 0) - (parseInt(b.rate_range.split("-")[0]) || 0));

  const yTicks = [100, 80, 60, 40, 20, 0];

  return (
    <div className="p-4 md:p-6 bg-slate-100 min-h-screen font-sans">
      <div className="max-w-[1400px] mx-auto bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">

        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">FedWatch Tool</h1>
          <div className="text-sm text-gray-500">
            {data.length > 0 && `Data as of: ${format(new Date(data[0].scrape_date), "dd MMM yyyy")}`}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-8 text-center text-red-500">
            <p>Error: {error}</p>
          </div>
        )}

        {/* Main */}
        {!loading && !error && meetingDates.length > 0 && (
          <div className="flex flex-col">

            {/* Tabs */}
            <div className="flex overflow-x-auto border-b border-gray-200 bg-gray-50 px-2 pt-2 hide-scrollbar">
              {meetingDates.map(date => (
                <button
                  key={date}
                  onClick={() => setActiveDate(date)}
                  className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-t border-l border-r rounded-t-md transition-colors mr-1 ${activeDate === date
                    ? 'bg-white border-gray-200 text-indigo-600 border-b-white'
                    : 'bg-gray-50 border-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                    }`}
                  style={{ marginBottom: activeDate === date ? '-1px' : '0' }}
                >
                  {formatTabDate(date)}
                </button>
              ))}
            </div>

            {/* Content */}
            {activeDate && (
              <div className="p-4 md:p-6 lg:p-8 bg-white">

                <h2 className="text-lg font-semibold text-gray-800 mb-6">
                  Target Rate Probabilities for {formatTitleDate(activeDate)} Fed Meeting
                </h2>

                {/* Chart */}
                <div className="relative bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6 shadow-inner">

                  {/* Y-axis label */}
                  <div className="absolute top-1/2 -left-5 -rotate-90 -translate-y-1/2 text-xs text-gray-400 tracking-widest uppercase select-none">
                    Probability
                  </div>

                  <div className="relative h-[380px] ml-6 flex">

                    {/* Grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                      {yTicks.map(tick => (
                        <div key={tick} className="flex items-center w-full relative">
                          <div className="absolute -left-8 w-6 text-right text-xs text-gray-400">{tick}%</div>
                          <div className="w-full border-b border-dashed border-gray-200 h-0" />
                        </div>
                      ))}
                    </div>

                    {/* Bars */}
                    <div className="relative w-full h-full flex items-end justify-center gap-2 lg:gap-6 px-4 z-10 pt-4">
                      {targetRates.map((d, i) => (
                        <div key={i} className="flex flex-col items-center justify-end h-full w-full max-w-[120px] group">
                          {d.probability > 0 && (
                            <div className="text-gray-700 font-semibold text-sm mb-2">
                              {d.probability.toFixed(1)}%
                            </div>
                          )}
                          <div
                            className="w-full rounded-t-sm transition-all duration-700 cursor-pointer hover:brightness-95"
                            style={{
                              height: `${d.probability}%`,
                              minHeight: d.probability > 0 ? '4px' : '0',
                              background: 'linear-gradient(to top, #4338ca, #818cf8)',
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* X-axis labels */}
                  <div className="ml-6 mt-3 flex justify-center gap-2 lg:gap-6 px-4">
                    {targetRates.map((d, i) => (
                      <div key={i} className="w-full max-w-[120px] text-center text-xs font-medium text-gray-600">
                        {d.rate_range}
                      </div>
                    ))}
                  </div>

                  <div className="text-center text-xs text-gray-400 mt-3 tracking-widest uppercase">
                    Target Rate (in bps)
                  </div>
                </div>

              </div>
            )}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}