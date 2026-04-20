"use client";

import { useEffect, useState } from "react";
import { format, parse } from "date-fns";

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
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8000'}/api/economic-indicators/cme-fedwatch/latest`);
      if (!response.ok) throw new Error("Failed to fetch CME FedWatch data");
      const json: FedwatchData[] = await response.json();
      setData(json);
      
      // Auto-select first date
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

  // Group data by meeting date
  const groupedData = data.reduce((acc: { [key: string]: FedwatchData[] }, curr) => {
    if (!acc[curr.meeting_date]) acc[curr.meeting_date] = [];
    acc[curr.meeting_date].push(curr);
    return acc;
  }, {});

  const meetingDates = Object.keys(groupedData).sort();

  // Helper to format date like "29 Apr 26", parsing from "YYYY-MM-DD"
  const formatTabDate = (dateStr: string) => {
    try {
      const d = parse(dateStr, 'yyyy-MM-dd', new Date());
      return format(d, "dd MMM yy");
    } catch {
      return dateStr;
    }
  };

  const formatTitleDate = (dateStr: string) => {
    try {
      const d = parse(dateStr, 'yyyy-MM-dd', new Date());
      return format(d, "dd MMM yyyy");
    } catch {
      return dateStr;
    }
  };

  // Extract current active data
  const currentData = activeDate ? groupedData[activeDate] || [] : [];
  
  // Separate into Target Rate (e.g., "350-375") and Aggregated (e.g. "Ease", "Hike")
  const targetRates = currentData.filter(d => d.rate_range.includes("-") && d.probability > 0).sort((a,b) => {
      // sort numerically based on the first number in range
      const aVal = parseInt(a.rate_range.split("-")[0]) || 0;
      const bVal = parseInt(b.rate_range.split("-")[0]) || 0;
      return aVal - bVal;
  });

  const aggregated = currentData.filter(d => !d.rate_range.includes("-")); // Ease, No Change, Hike
  const ease = aggregated.find(d => d.rate_range.toLowerCase().includes("ease"))?.probability || 0;
  const noChange = aggregated.find(d => d.rate_range.toLowerCase().includes("change"))?.probability || 0;
  const hike = aggregated.find(d => d.rate_range.toLowerCase().includes("hike"))?.probability || 0;

  // Formatting Y-Axis ticks
  const yTicks = [100, 80, 60, 40, 20, 0];

  return (
    <div className="p-4 md:p-6 bg-[#0B1120] min-h-screen text-slate-300 font-sans">
      
      <div className="max-w-[1400px] mx-auto bg-[#151E32] rounded-lg shadow-xl overflow-hidden border border-[#2A364F]">
        
        {/* Header Title */}
        <div className="bg-[#1E293B] border-b border-[#2A364F] px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-white">FedWatch Tool</h1>
          <div className="text-sm text-slate-400">
            {data.length > 0 && `Data as of: ${format(new Date(data[0].scrape_date), "dd MMM yyyy")}`}
          </div>
        </div>

        {/* Status Messages */}
        {loading && (
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
          </div>
        )}

        {error && (
          <div className="p-8 text-center text-red-400">
            <p>Error: {error}</p>
          </div>
        )}

        {/* Main Interface */}
        {!loading && !error && meetingDates.length > 0 && (
          <div className="flex flex-col">
            
            {/* Meeting Dates Tabs */}
            <div className="flex overflow-x-auto border-b border-[#2A364F] hide-scrollbar bg-[#151E32] px-2 pt-2">
              {meetingDates.map(date => (
                <button
                  key={date}
                  onClick={() => setActiveDate(date)}
                  className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-t border-l border-r rounded-t-md transition-colors mr-1 ${
                    activeDate === date 
                      ? 'bg-[#0F172A] border-[#2A364F] text-indigo-400 border-b-transparent' 
                      : 'bg-[#1E293B] border-transparent text-slate-400 border-b-[#2A364F] hover:bg-[#273548]'
                  }`}
                  style={{ marginBottom: activeDate === date ? '-1px' : '0' }}
                >
                  {formatTabDate(date)}
                </button>
              ))}
            </div>

            {/* Data Content */}
            {activeDate && (
              <div className="p-4 md:p-6 lg:p-8 flex-1 bg-[#0F172A]">

                {/* Chart Title */}
                <h2 className="text-xl font-bold text-white mb-6">Target Rate Probabilities for {formatTitleDate(activeDate)} Fed Meeting</h2>

                  {/* Vertical Bar Chart Container */}
                  <div className="relative bg-[#0F172F] border border-[#2A364F] rounded-lg p-6 mb-8 shadow-inner">
                    <div className="absolute top-4 left-0 -rotate-90 origin-top-left -translate-x-4 translate-y-16 text-sm text-slate-400 tracking-widest uppercase">
                      Probability
                    </div>
                    
                    <div className="relative h-[400px] ml-8 flex">
                      
                      {/* Y-Axis Grid & Labels */}
                      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                        {yTicks.map(tick => (
                          <div key={tick} className="flex items-center w-full relative">
                            <div className="absolute -left-8 w-6 text-right text-xs text-slate-400">{tick}%</div>
                            <div className="w-full border-b border-dashed border-[#2A364F] h-0"></div>
                          </div>
                        ))}
                      </div>

                      {/* Bars Container */}
                      <div className="relative w-full h-full flex items-end justify-center gap-2 lg:gap-8 px-4 z-10 pt-4 pb-0">
                        {targetRates.map((d, i) => (
                          <div key={i} className="flex flex-col items-center justify-end h-full w-full max-w-[120px] group">
                            
                            {/* Bar Label (top of bar) */}
                            {d.probability > 0 && (
                              <div className="text-white font-bold text-sm mb-2 opacity-90 transition-opacity group-hover:opacity-100">
                                {d.probability.toFixed(1)}%
                              </div>
                            )}
                            
                            {/* The Bar */}
                            <div 
                              className="w-full bg-gradient-to-t from-indigo-700 to-indigo-500 rounded-t-sm transition-all duration-700 hover:brightness-110 hover:shadow-[0_0_15px_rgba(99,102,241,0.5)] cursor-pointer"
                              style={{ 
                                height: `${d.probability}%`,
                                minHeight: d.probability > 0 ? '4px' : '0' 
                              }}
                            ></div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* X-Axis Labels */}
                    <div className="ml-8 mt-2 flex justify-center gap-2 lg:gap-8 px-4">
                      {targetRates.map((d, i) => (
                        <div key={i} className="w-full max-w-[120px] text-center text-sm font-semibold text-slate-300">
                          {d.rate_range}
                        </div>
                      ))}
                    </div>
                    
                    <div className="text-center text-sm text-slate-500 mt-4 tracking-widest uppercase">
                      Target Rate (in bps)
                    </div>
                  </div>


                </div>
              )}
          </div>
        )}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
