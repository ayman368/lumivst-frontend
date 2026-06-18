"use client";

import { useState } from "react";
import { useEpsEstimates } from "@/hooks/useValuation";
import { upsertEpsEstimate } from "@/lib/api/valuation";

interface EditRow {
  year:   number;
  value:  string;
  type:   string;
  source: string;
}

export default function EpsEstimatesManager() {
  const { data, error, isLoading, refresh } = useEpsEstimates();
  const [saving, setSaving] = useState<number | null>(null);
  const [edits, setEdits]   = useState<Record<number, EditRow>>({});
  const [newRow, setNewRow] = useState<EditRow>({ year: new Date().getFullYear() + 1, value: "", type: "estimate", source: "Yardeni" });
  const [msg, setMsg]       = useState("");

  if (isLoading) return <div className="text-gray-400 text-sm">Loading…</div>;
  if (error || !data) return <div className="text-red-400 text-sm">Failed to load EPS estimates.</div>;

  const startEdit = (id: number, row: EditRow) => {
    setEdits((prev) => ({ ...prev, [id]: { ...row } }));
  };

  const cancelEdit = (id: number) => {
    setEdits((prev) => { const n = { ...prev }; delete n[id]; return n; });
  };

  const save = async (year: number) => {
    const edit = edits[year];
    if (!edit) return;
    setSaving(year);
    try {
      await upsertEpsEstimate({ year, value: parseFloat(edit.value), type: edit.type, source: edit.source });
      cancelEdit(year);
      setMsg(`✅ Saved EPS for ${year}`);
      refresh();
    } catch (e: any) {
      setMsg(`❌ Error: ${e.message}`);
    } finally {
      setSaving(null);
    }
  };

  const saveNew = async () => {
    if (!newRow.value) return;
    setSaving(-1);
    try {
      await upsertEpsEstimate({ year: newRow.year, value: parseFloat(newRow.value), type: newRow.type, source: newRow.source });
      setNewRow({ year: new Date().getFullYear() + 2, value: "", type: "estimate", source: "Yardeni" });
      setMsg(`✅ Added EPS for ${newRow.year}`);
      refresh();
    } catch (e: any) {
      setMsg(`❌ Error: ${e.message}`);
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-white mb-4">EPS Estimates</h2>

      {msg && (
        <div className="text-xs mb-3 text-gray-300">{msg}</div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-500 uppercase border-b border-gray-800">
              <th className="text-left pb-2">Year</th>
              <th className="text-right pb-2">EPS Value</th>
              <th className="text-left pb-2 pl-4">Type</th>
              <th className="text-left pb-2 pl-4">Source</th>
              <th className="text-right pb-2">Updated</th>
              <th className="pb-2" />
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const isEditing = row.year in edits;
              const edit      = edits[row.year];
              return (
                <tr key={row.year} className="border-b border-gray-800 last:border-0">
                  <td className="py-2 font-bold text-white">{row.year}</td>
                  <td className="py-2 text-right">
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.01"
                        value={edit.value}
                        onChange={(e) => setEdits((p) => ({ ...p, [row.year]: { ...edit, value: e.target.value } }))}
                        className="bg-gray-800 border border-gray-600 rounded px-2 py-1 w-28 text-right text-white text-xs focus:outline-none focus:border-blue-500"
                      />
                    ) : (
                      <span className="font-mono text-green-300">${Number(row.value).toFixed(2)}</span>
                    )}
                  </td>
                  <td className="py-2 pl-4">
                    {isEditing ? (
                      <select
                        value={edit.type}
                        onChange={(e) => setEdits((p) => ({ ...p, [row.year]: { ...edit, type: e.target.value } }))}
                        className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-white focus:outline-none"
                      >
                        <option value="actual">actual</option>
                        <option value="estimate">estimate</option>
                      </select>
                    ) : (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${row.type === "actual" ? "bg-green-900 text-green-300" : "bg-yellow-900 text-yellow-300"}`}>
                        {row.type}
                      </span>
                    )}
                  </td>
                  <td className="py-2 pl-4 text-gray-400 text-xs">
                    {isEditing ? (
                      <input
                        value={edit.source}
                        onChange={(e) => setEdits((p) => ({ ...p, [row.year]: { ...edit, source: e.target.value } }))}
                        className="bg-gray-800 border border-gray-600 rounded px-2 py-1 w-24 text-white text-xs focus:outline-none"
                      />
                    ) : (
                      row.source ?? "—"
                    )}
                  </td>
                  <td className="py-2 text-right text-xs text-gray-500">
                    {row.updated_at ? new Date(row.updated_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="py-2 text-right">
                    {isEditing ? (
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => save(row.year)}
                          disabled={saving === row.year}
                          className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded disabled:opacity-50"
                        >
                          {saving === row.year ? "…" : "Save"}
                        </button>
                        <button
                          onClick={() => cancelEdit(row.year)}
                          className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit(row.year, { year: row.year, value: String(row.value), type: row.type, source: row.source ?? "" })}
                        className="text-xs text-blue-400 hover:text-blue-300"
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}

            {/* Add new row */}
            <tr className="border-t border-gray-700 bg-gray-950">
              <td className="py-3">
                <input
                  type="number"
                  value={newRow.year}
                  onChange={(e) => setNewRow((p) => ({ ...p, year: parseInt(e.target.value) }))}
                  className="bg-gray-800 border border-gray-600 rounded px-2 py-1 w-20 text-white text-xs focus:outline-none"
                />
              </td>
              <td className="py-3 text-right">
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newRow.value}
                  onChange={(e) => setNewRow((p) => ({ ...p, value: e.target.value }))}
                  className="bg-gray-800 border border-gray-600 rounded px-2 py-1 w-28 text-right text-white text-xs focus:outline-none"
                />
              </td>
              <td className="py-3 pl-4">
                <select
                  value={newRow.type}
                  onChange={(e) => setNewRow((p) => ({ ...p, type: e.target.value }))}
                  className="bg-gray-800 border border-gray-600 rounded px-2 py-1 text-xs text-white focus:outline-none"
                >
                  <option value="estimate">estimate</option>
                  <option value="actual">actual</option>
                </select>
              </td>
              <td className="py-3 pl-4">
                <input
                  value={newRow.source}
                  onChange={(e) => setNewRow((p) => ({ ...p, source: e.target.value }))}
                  className="bg-gray-800 border border-gray-600 rounded px-2 py-1 w-24 text-white text-xs focus:outline-none"
                />
              </td>
              <td />
              <td className="py-3 text-right">
                <button
                  onClick={saveNew}
                  disabled={!newRow.value || saving === -1}
                  className="text-xs bg-green-700 hover:bg-green-600 text-white px-3 py-1 rounded disabled:opacity-50"
                >
                  {saving === -1 ? "…" : "+ Add"}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
