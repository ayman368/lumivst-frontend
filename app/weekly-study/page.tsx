"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import type { WeeklyStudyResponse, MarketComponent } from "@/types/wallet";
import { getWeeklyStudy, updateWeeklyStudy } from "@/lib/api/wallet";

const DEFAULT_COMPONENTS: MarketComponent[] = [
  { name: "Major Indexes", status: "Neutral" },
  { name: "UP/Down Volume", status: "Neutral" },
  { name: "New Highs/New Lows", status: "Neutral" },
  { name: "Individual Stock Participation", status: "Neutral" },
];

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
      } catch (e: any) {
        setError(e.message);
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
      } catch (e: any) {
        setError(e.message);
      }
    });
  };

  const updateComponent = (index: number, status: string) => {
    const newComps = [...form.market_components];
    newComps[index].status = status as any;
    setForm({ ...form, market_components: newComps });
  };

  const getStemColor = (stem: string | null) => {
    if (stem === "GREEN") return "var(--green)";
    if (stem === "RED") return "var(--red)";
    return "var(--amber)";
  };

  const getStatusColor = (status: string) => {
    if (status === "Positive") return "var(--green)";
    if (status === "Negative") return "var(--red)";
    return "var(--muted)";
  };

  return (
    <>
      <style>{`
        :root {
          --bg: #0a0d14; --surface: #111827; --border: #1f2937;
          --accent: #3b82f6; --accent-dim: #1d4ed8; --text: #f1f5f9;
          --muted: #64748b; --green: #22c55e; --red: #ef4444; --amber: #f59e0b;
          --radius: 12px;
          --font-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
          --font-ui: 'DM Sans', 'Inter', system-ui, sans-serif;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg); color: var(--text); font-family: var(--font-ui); min-height: 100vh; }
        .page { max-width: 900px; margin: 0 auto; padding: 48px 24px; }
        .header { margin-bottom: 40px; display: flex; justify-content: space-between; align-items: center; }
        .header h1 { font-size: 28px; font-weight: 700; background: linear-gradient(135deg, #60a5fa, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .header p { color: var(--muted); margin-top: 6px; font-size: 14px; }
        .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 28px; margin-bottom: 24px; }
        .card-title { font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: var(--muted); margin-bottom: 24px; border-bottom: 1px solid var(--border); padding-bottom: 12px; }
        
        .field { margin-bottom: 20px; }
        .field label { display: block; font-size: 12px; font-weight: 500; color: var(--muted); margin-bottom: 8px; text-transform: uppercase; }
        input, select { width: 100%; background: var(--bg); border: 1px solid var(--border); color: var(--text); font-size: 14px; padding: 11px 14px; border-radius: 8px; outline: none; }
        input:focus, select:focus { border-color: var(--accent); }
        
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        
        button.btn { padding: 10px 20px; background: var(--border); color: white; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: 0.15s; }
        button.btn.primary { background: linear-gradient(135deg, var(--accent), var(--accent-dim)); }
        button.btn:hover { opacity: 0.9; transform: translateY(-1px); }

        .stem-display { text-align: center; padding: 32px; background: var(--bg); border-radius: 12px; border: 1px solid var(--border); margin-bottom: 24px; }
        .stem-display h2 { font-size: 48px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; margin: 0; text-shadow: 0 0 20px currentColor; }
        .stem-date { font-size: 12px; color: var(--muted); margin-top: 8px; font-family: var(--font-mono); }

        table { width: 100%; border-collapse: collapse; font-size: 14px; }
        td { padding: 16px 14px; border-bottom: 1px solid var(--border); }
        tr:last-child td { border-bottom: none; }
        .status-pill { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; }
      `}</style>

      <div className="page">
        <div className="header">
          <div>
            <h1>Weekly Market Study</h1>
            <p>Log and track STEM readings and broad market health indicators.</p>
          </div>
          {!isEditing && (
            <button className="btn" onClick={() => setIsEditing(true)}>Edit Reading</button>
          )}
        </div>

        {error && <div style={{ color: "var(--red)", marginBottom: "20px" }}>⚠ {error}</div>}

        {isEditing ? (
          <div className="card">
            <div className="card-title">Update Weekly Data</div>
            
            <div className="grid-2">
              <div className="field">
                <label>STEM Reading</label>
                <select value={form.stem_reading || ""} onChange={e => setForm({...form, stem_reading: e.target.value})}>
                  <option value="GREEN">GREEN</option>
                  <option value="YELLOW">YELLOW</option>
                  <option value="RED">RED</option>
                </select>
              </div>
              <div className="field">
                <label>Date</label>
                <input type="date" value={form.stem_date || ""} onChange={e => setForm({...form, stem_date: e.target.value})} />
              </div>
              <div className="field">
                <label>SPY Model 25 Signal</label>
                <input type="text" value={form.spy_model_25 || ""} onChange={e => setForm({...form, spy_model_25: e.target.value})} placeholder="e.g. +2.5" />
              </div>
              <div className="field">
                <label>SPY Model 33 Signal</label>
                <input type="text" value={form.spy_model_33 || ""} onChange={e => setForm({...form, spy_model_33: e.target.value})} placeholder="e.g. -1.2" />
              </div>
            </div>

            <div className="card-title" style={{ marginTop: "24px" }}>Market Components</div>
            {form.market_components.map((comp, idx) => (
              <div className="field grid-2" key={idx} style={{ alignItems: "center", marginBottom: "12px" }}>
                <div style={{ fontWeight: 500 }}>{comp.name}</div>
                <select value={comp.status} onChange={e => updateComponent(idx, e.target.value)}>
                  <option value="Positive">Positive</option>
                  <option value="Neutral">Neutral</option>
                  <option value="Negative">Negative</option>
                </select>
              </div>
            ))}

            <div style={{ display: "flex", gap: "12px", marginTop: "32px", justifyContent: "flex-end" }}>
              <button className="btn" onClick={() => { setIsEditing(false); loadData(); }}>Cancel</button>
              <button className="btn primary" onClick={handleSave} disabled={isPending}>
                {isPending ? "Saving..." : "Save Reading"}
              </button>
            </div>
          </div>
        ) : data ? (
          <div style={{ background: "white", padding: "40px", color: "black", fontFamily: "Arial, sans-serif", borderRadius: "4px", minHeight: "400px" }}>
            <div style={{ color: "#002060", fontWeight: "bold", borderBottom: "2px solid black", marginBottom: "16px", paddingBottom: "4px", fontSize: "16px" }}>
              SPY ADVISOR MODEL
            </div>

            <div style={{ marginBottom: "24px" }}>
              <div style={{ color: "#00b050", fontWeight: "bold", fontSize: "15px", marginBottom: "4px" }}>
                25 Model - {data.spy_model_25 || "Buy signal November 17,2023"}
              </div>
              <div style={{ color: "#002060", fontSize: "15px" }}>
                Model Reading: 100% - Allocation:100%
              </div>
            </div>

            <div style={{ marginBottom: "40px" }}>
              <div style={{ color: "#00b050", fontWeight: "bold", fontSize: "15px", marginBottom: "4px" }}>
                33 Model - {data.spy_model_33 || "Buy signal January 13"}
              </div>
              <div style={{ color: "#002060", fontSize: "15px" }}>
                Model Reading: 100% - Allocation:100%
              </div>
            </div>

            <div style={{ color: "#002060", fontWeight: "bold", borderBottom: "2px solid black", marginBottom: "12px", paddingBottom: "4px", fontSize: "16px", width: "450px" }}>
              KEY COMPONENTS OF THE MARKET HEALTH
            </div>
            <table style={{ width: "450px", marginBottom: "40px", fontSize: "15px" }}>
              <tbody>
                {data.market_components?.map((comp, i) => (
                  <tr key={i}>
                    <td style={{ padding: "4px 0" }}>{comp.name}</td>
                    <td style={{ padding: "4px 0", textAlign: "right", color: comp.status === "Positive" || comp.status === "GREEN" ? "#00b050" : comp.status === "Negative" || comp.status === "RED" ? "red" : "black" }}>{comp.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ color: "#002060", fontWeight: "bold", borderBottom: "2px solid black", marginBottom: "12px", paddingBottom: "4px", fontSize: "16px", width: "450px" }}>
              Stock Trading Environment Model - STEM
            </div>
            <table style={{ width: "450px", fontSize: "15px" }}>
              <tbody>
                <tr>
                  <td>Current Reading:</td>
                  <td style={{ textAlign: "right", fontWeight: "bold", color: data.stem_reading === "GREEN" ? "#00b050" : data.stem_reading === "RED" ? "red" : "inherit" }}>
                    {data.stem_reading} on {data.stem_date}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card" style={{ textAlign: "center", padding: "40px" }}>Loading data...</div>
        )}
      </div>
    </>
  );
}
