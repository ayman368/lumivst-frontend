"use client";

import { useState, useEffect, useTransition } from "react";
import type { WeeklyStudyResponse, MarketComponent } from "@/types/wallet";
import { getWeeklyStudy, updateWeeklyStudy } from "@/lib/api/wallet";

const DEFAULT_COMPONENTS: MarketComponent[] = [
  { name: "Major Indexes", status: "Neutral" },
  { name: "UP/Down Volume", status: "Neutral" },
  { name: "New Highs/New Lows", status: "Neutral" },
  { name: "Individual Stock Participation", status: "Neutral" },
];

const inputClass =
  "w-full px-3 py-2.5 text-sm text-slate-900 border border-slate-300 rounded-lg bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

const labelClass = "block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2";

export default function WeeklyStudyPage() {
  const [data, setData] = useState<WeeklyStudyResponse | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<WeeklyStudyResponse>({
    spy_model_25: "",
    spy_model_33: "",
    stem_reading: "YELLOW",
    stem_date: new Date().toISOString().split("T")[0],
    market_components: DEFAULT_COMPONENTS,
  });

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    startTransition(async () => {
      try {
        const res = await getWeeklyStudy();
        setData(res);
        if (res) {
          setForm({
            spy_model_25: res.spy_model_25 || "",
            spy_model_33: res.spy_model_33 || "",
            stem_reading: res.stem_reading || "YELLOW",
            stem_date: res.stem_date || new Date().toISOString().split("T")[0],
            market_components: res.market_components?.length ? res.market_components : DEFAULT_COMPONENTS,
          });
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load weekly study");
      }
    });
  };

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      try {
        const res = await updateWeeklyStudy(form);
        setData(res);
        setIsEditing(false);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to save");
      }
    });
  };

  const updateComponent = (index: number, status: string) => {
    const newComps = [...form.market_components];
    newComps[index].status = status as MarketComponent["status"];
    setForm({ ...form, market_components: newComps });
  };

  const statusColorClass = (status: string) => {
    if (status === "Positive" || status === "GREEN") return "text-green-600";
    if (status === "Negative" || status === "RED") return "text-red-600";
    return "text-slate-900";
  };

  const stemColorClass = (stem: string | null) => {
    if (stem === "GREEN") return "text-green-600";
    if (stem === "RED") return "text-red-600";
    return "text-amber-600";
  };

  return (
    <div className="min-h-full bg-slate-50 text-slate-900">
      <div className="max-w-3xl mx-auto px-6 py-8 pb-12">
        <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Weekly Market Study</h1>
            <p className="mt-2 text-sm text-slate-500">Log and track STEM readings and broad market health indicators.</p>
          </div>
          {!isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-colors"
            >
              Edit Reading
            </button>
          )}
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            ⚠ {error}
          </div>
        )}

        {isEditing ? (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-5 pb-3 border-b border-slate-200">
              Update Weekly Data
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>STEM Reading</label>
                <select
                  className={inputClass}
                  value={form.stem_reading || ""}
                  onChange={(e) => setForm({ ...form, stem_reading: e.target.value })}
                >
                  <option value="GREEN">GREEN</option>
                  <option value="YELLOW">YELLOW</option>
                  <option value="RED">RED</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Date</label>
                <input
                  type="date"
                  className={inputClass}
                  value={form.stem_date || ""}
                  onChange={(e) => setForm({ ...form, stem_date: e.target.value })}
                />
              </div>
              <div>
                <label className={labelClass}>SPY Model 25 Signal</label>
                <input
                  type="text"
                  className={inputClass}
                  value={form.spy_model_25 || ""}
                  onChange={(e) => setForm({ ...form, spy_model_25: e.target.value })}
                  placeholder="e.g. +2.5"
                />
              </div>
              <div>
                <label className={labelClass}>SPY Model 33 Signal</label>
                <input
                  type="text"
                  className={inputClass}
                  value={form.spy_model_33 || ""}
                  onChange={(e) => setForm({ ...form, spy_model_33: e.target.value })}
                  placeholder="e.g. -1.2"
                />
              </div>
            </div>

            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mt-6 mb-4">Market Components</div>
            {form.market_components.map((comp, idx) => (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center mb-3" key={idx}>
                <div className="font-medium text-slate-800">{comp.name}</div>
                <select className={inputClass} value={comp.status} onChange={(e) => updateComponent(idx, e.target.value)}>
                  <option value="Positive">Positive</option>
                  <option value="Neutral">Neutral</option>
                  <option value="Negative">Negative</option>
                </select>
              </div>
            ))}

            <div className="flex gap-3 mt-8 justify-end">
              <button
                type="button"
                className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50"
                onClick={() => {
                  setIsEditing(false);
                  loadData();
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold disabled:opacity-50"
                onClick={handleSave}
                disabled={isPending}
              >
                {isPending ? "Saving..." : "Save Reading"}
              </button>
            </div>
          </div>
        ) : data ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 md:p-10 shadow-sm text-[#111] font-[Arial,sans-serif]">
            <div className="text-[#002060] font-bold border-b-2 border-slate-900 mb-4 pb-1 text-base">SPY ADVISOR MODEL</div>

            <div className="mb-6">
              <div className="text-[#00b050] font-bold text-[15px] mb-1">
                25 Model - {data.spy_model_25 || "Buy signal November 17,2023"}
              </div>
              <div className="text-[#002060] text-[15px]">Model Reading: 100% - Allocation:100%</div>
            </div>

            <div className="mb-10">
              <div className="text-[#00b050] font-bold text-[15px] mb-1">
                33 Model - {data.spy_model_33 || "Buy signal January 13"}
              </div>
              <div className="text-[#002060] text-[15px]">Model Reading: 100% - Allocation:100%</div>
            </div>

            <div className="text-[#002060] font-bold border-b-2 border-slate-900 mb-3 pb-1 text-base max-w-md">
              KEY COMPONENTS OF THE MARKET HEALTH
            </div>
            <table className="w-full max-w-md mb-10 text-[15px]">
              <tbody>
                {data.market_components?.map((comp, i) => (
                  <tr key={i}>
                    <td className="py-1">{comp.name}</td>
                    <td className={`py-1 text-right font-semibold ${statusColorClass(comp.status as string)}`}>
                      {comp.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="text-[#002060] font-bold border-b-2 border-slate-900 mb-3 pb-1 text-base max-w-md">
              Stock Trading Environment Model - STEM
            </div>
            <table className="w-full max-w-md text-[15px]">
              <tbody>
                <tr>
                  <td>Current Reading:</td>
                  <td className={`text-right font-bold ${stemColorClass(data.stem_reading)}`}>
                    {data.stem_reading} on {data.stem_date}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-12 shadow-sm flex flex-col items-center justify-center text-slate-500 gap-3">
            <div className="w-9 h-9 border-[3px] border-slate-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-sm">Loading data...</p>
          </div>
        )}
      </div>
    </div>
  );
}
