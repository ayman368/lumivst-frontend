'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { API_BASE_URL } from '@/lib/api/config';

/* ─── Types ───────────────────────────────────────── */
interface ChartPoint {
  date: string;
  naaim_index: number;
  sp500: number | null;
}

interface HistoryRow {
  date: string; naaim_index: number; sp500: number | null;
  bearish: number | null; quartile_1: number | null; quartile_2: number | null;
  quartile_3: number | null; bullish: number | null; std_deviation: number | null;
}

interface LatestData {
  current: { date: string; naaim_index: number };
  last_quarter_avg: number | null;
  last_quarter_label: string | null;  // e.g. "Q1" — now properly typed
  posted_on: string | null;
}

/* ─── Tooltip: NAAIM ─────────────────────────────── */
function NaaimTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const d = new Date(label + 'T12:00:00');
  const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return (
    <div className="bg-white text-[11px] px-3 py-1.5 border border-gray-300 rounded shadow-md text-left min-w-[160px]">
      <div className="font-bold text-gray-800 pb-1 mb-1 border-b border-gray-200">{dateStr}</div>
      <div className="text-gray-800">NAAIM Number: <span className="font-semibold">{Number(payload[0].value).toFixed(2)}</span></div>
    </div>
  );
}

/* ─── Tooltip: S&P 500 ───────────────────────────── */
function SP500Tooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const d = new Date(label + 'T12:00:00');
  const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return (
    <div className="bg-white text-[11px] px-3 py-1.5 border border-gray-300 rounded shadow-md text-left min-w-[160px]">
      <div className="font-bold text-gray-800 pb-1 mb-1 border-b border-gray-200">{dateStr}</div>
      <div className="text-gray-800">S&P 500: <span className="font-semibold">{Number(payload[0].value).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span></div>
    </div>
  );
}

/* ─── X-Axis: one tick per month ── */
function buildMonthTicks(data: ChartPoint[]): string[] {
  if (!data.length) return [];
  const ticks: string[] = [];
  let lastMonth = -1;
  for (const d of data) {
    const dt = new Date(d.date + 'T12:00:00');
    const m = dt.getMonth();
    if (m !== lastMonth) {
      ticks.push(d.date);
      lastMonth = m;
    }
  }
  return ticks;
}

/* ─── X-Axis label: first letter of month, year on January ── */
function formatMonthTick(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  const m = d.getMonth();
  const y = d.getFullYear();
  if (m === 0) return String(y);
  const monthLetters = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
  return monthLetters[m];
}

/* ─── Derive quarter label from a date string ── */
function quarterLabelFromDate(dateStr: string): string {
  const month = new Date(dateStr + 'T12:00:00').getMonth(); // 0-indexed
  return `Q${Math.floor(month / 3) + 1}`;
}

/* ─── Main Component ──────────────────────────────── */
export default function NaaimExposureView() {
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [tableData, setTableData] = useState<HistoryRow[]>([]);
  const [latest, setLatest] = useState<LatestData | null>(null);

  // Per-section error states so one failed fetch doesn't blank the whole page
  const [chartError, setChartError] = useState<string | null>(null);
  const [tableError, setTableError] = useState<string | null>(null);
  const [latestError, setLatestError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /* ── Fetch — use allSettled so a single failure doesn't hide the rest ── */
  useEffect(() => {
    async function fetchAll() {
      setLoading(true);

      const [chartResult, histResult, latestResult] = await Promise.allSettled([
        fetch(`${API_BASE_URL}/api/naaim/chart-data?limit=5000`),
        fetch(`${API_BASE_URL}/api/naaim/history?limit=10&offset=0`),
        fetch(`${API_BASE_URL}/api/naaim/latest`),
      ]);

      // Chart data
      if (chartResult.status === 'fulfilled' && chartResult.value.ok) {
        try {
          const cj = await chartResult.value.json();
          setChartData(cj.data || []);
        } catch {
          setChartError('Failed to parse chart data');
        }
      } else {
        setChartError('Failed to load chart data');
      }

      // History table
      if (histResult.status === 'fulfilled' && histResult.value.ok) {
        try {
          const hj = await histResult.value.json();
          setTableData(hj.data || []);
        } catch {
          setTableError('Failed to parse history data');
        }
      } else {
        setTableError('Failed to load history data');
      }

      // Latest / stats
      if (latestResult.status === 'fulfilled' && latestResult.value.ok) {
        try {
          setLatest(await latestResult.value.json());
        } catch {
          setLatestError('Failed to parse latest data');
        }
      } else {
        setLatestError('Failed to load latest data');
      }

      setLoading(false);
    }

    fetchAll();
  }, []);

  /* ── Filter last 2 years for charts ── */
  const chartFiltered = useMemo(() => {
    if (!chartData.length) return [];
    const last = chartData[chartData.length - 1];
    const cutoff = new Date(last.date + 'T12:00:00');
    cutoff.setMonth(cutoff.getMonth() - 24);
    const cutStr = cutoff.toISOString().split('T')[0];
    return chartData.filter(d => d.date >= cutStr);
  }, [chartData]);

  const xTicks = useMemo(() => buildMonthTicks(chartFiltered), [chartFiltered]);

  /* ── S&P 500 domain — derived dynamically from actual data ── */
  const sp500Domain = useMemo((): [number, number] => {
    const values = chartFiltered.map(d => d.sp500).filter((v): v is number => v !== null);
    if (!values.length) return [4000, 8000]; // safe fallback
    const min = Math.min(...values);
    const max = Math.max(...values);
    const pad = (max - min) * 0.05;
    // Round to nearest 500 for clean axis ticks
    return [
      Math.floor((min - pad) / 500) * 500,
      Math.ceil((max + pad) / 500) * 500,
    ];
  }, [chartFiltered]);

  const sp500Ticks = useMemo(() => {
    const [domMin, domMax] = sp500Domain;
    const ticks: number[] = [];
    for (let v = domMin; v <= domMax; v += 500) ticks.push(v);
    return ticks;
  }, [sp500Domain]);

  /* ── Quarter label: prefer API value, derive from date as fallback ── */
  const quarterLabel = useMemo(() => {
    if (latest?.last_quarter_label) return latest.last_quarter_label;
    if (latest?.current?.date) {
      // Last quarter = one quarter before the current data date
      const d = new Date(latest.current.date + 'T12:00:00');
      d.setMonth(d.getMonth() - 3);
      return quarterLabelFromDate(d.toISOString().split('T')[0]);
    }
    return '';
  }, [latest]);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Header row: Current Number + Last Quarter ── */}
      {latestError ? (
        <div className="text-red-500 bg-red-50 p-3 rounded-lg text-sm">{latestError}</div>
      ) : (
        <>
          <div className="flex items-baseline gap-8 mb-2">
            <div>
              <div className="text-sm text-gray-600 font-medium">This week's NAAIM Exposure Index number is*:</div>
              <div className="text-4xl font-bold text-[#003366]">{latest?.current?.naaim_index?.toFixed(2) || '—'}</div>
            </div>
            {latest?.last_quarter_avg && (
              <div>
                <div className="text-sm text-gray-600 font-medium">Last Quarter Average ({quarterLabel})</div>
                <div className="text-2xl font-bold text-[#003366]">{latest.last_quarter_avg.toFixed(2)}</div>
              </div>
            )}
          </div>
          <div className="text-xs text-gray-500 -mt-2">
            *Posted on {latest?.posted_on || (latest?.current?.date
              ? new Date(latest.current.date + 'T12:00:00').toLocaleDateString('en-US', {
                weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
              })
              : '—')}
          </div>
        </>
      )}

      {/* ── Main layout: Charts (left) + Table (right) ── */}
      <div className="flex flex-col lg:flex-row gap-4">

        {/* ── Left: Two Charts stacked ── */}
        <div className="flex-1 space-y-2">

          {/* Chart 1: NAAIM Number */}
          <div className="bg-white border border-gray-200 rounded p-3">
            <div className="text-sm font-bold text-gray-800 mb-1">NAAIM Number</div>
            {chartError ? (
              <div className="text-red-500 bg-red-50 p-3 rounded text-sm h-[250px] flex items-center justify-center">{chartError}</div>
            ) : (
              <div style={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartFiltered} margin={{ top: 5, right: 20, left: 5, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                    <XAxis
                      dataKey="date"
                      ticks={xTicks}
                      tickFormatter={formatMonthTick}
                      tick={{ fontSize: 11, fill: '#333' }}
                      tickMargin={6}
                      interval={0}
                      axisLine={{ stroke: '#999' }}
                      tickLine={{ stroke: '#999' }}
                      label={{
                        value: 'Date',
                        position: 'insideBottom',
                        offset: -12,
                        style: { fontSize: 11, fill: '#666' },
                      }}
                    />
                    <YAxis
                      domain={[0, 120]}
                      ticks={[0, 20, 40, 60, 80, 100, 120]}
                      tick={{ fontSize: 11, fill: '#333' }}
                      axisLine={{ stroke: '#999' }}
                      tickLine={{ stroke: '#999' }}
                      width={35}
                    />
                    <Tooltip content={<NaaimTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="naaim_index"
                      stroke="#2563eb"
                      strokeWidth={1.5}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Chart 2: S&P 500 */}
          <div className="bg-white border border-gray-200 rounded p-3">
            <div className="text-sm font-bold text-gray-800 mb-1">S&P 500</div>
            {chartError ? (
              <div className="text-red-500 bg-red-50 p-3 rounded text-sm h-[250px] flex items-center justify-center">{chartError}</div>
            ) : (
              <div style={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartFiltered} margin={{ top: 5, right: 20, left: 5, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                    <XAxis
                      dataKey="date"
                      ticks={xTicks}
                      tickFormatter={formatMonthTick}
                      tick={{ fontSize: 11, fill: '#333' }}
                      tickMargin={6}
                      interval={0}
                      axisLine={{ stroke: '#999' }}
                      tickLine={{ stroke: '#999' }}
                      label={{
                        value: 'Date',
                        position: 'insideBottom',
                        offset: -12,
                        style: { fontSize: 11, fill: '#666' },
                      }}
                    />
                    <YAxis
                      domain={sp500Domain}
                      ticks={sp500Ticks}
                      tickFormatter={(v) => Number(v).toLocaleString()}
                      tick={{ fontSize: 11, fill: '#333' }}
                      axisLine={{ stroke: '#999' }}
                      tickLine={{ stroke: '#999' }}
                      width={55}
                    />
                    <Tooltip content={<SP500Tooltip />} />
                    <Line
                      type="monotone"
                      dataKey="sp500"
                      stroke="#16a34a"
                      strokeWidth={1.5}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Table (last 10 weeks) ── */}
        <div className="lg:w-[480px] shrink-0">
          {tableError ? (
            <div className="text-red-500 bg-red-50 p-3 rounded text-sm">{tableError}</div>
          ) : (
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-[#003366] text-white">
                  <th className="px-2 py-2 text-center font-semibold border border-[#003366]">Date</th>
                  <th className="px-2 py-2 text-center font-semibold border border-[#003366]">
                    <div>NAAIM</div>
                    <div>Number</div>
                    <div>Mean/</div>
                    <div>Average</div>
                  </th>
                  <th className="px-2 py-2 text-center font-semibold border border-[#003366]">Bearish</th>
                  <th className="px-2 py-2 text-center font-semibold border border-[#003366]">Quart1</th>
                  <th className="px-2 py-2 text-center font-semibold border border-[#003366]">Quart2</th>
                  <th className="px-2 py-2 text-center font-semibold border border-[#003366]">Quart3</th>
                  <th className="px-2 py-2 text-center font-semibold border border-[#003366]">Bullish</th>
                  <th className="px-2 py-2 text-center font-semibold border border-[#003366]">Deviation</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, i) => {
                  const d = new Date(row.date + 'T12:00:00');
                  const dateStr = `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
                  return (
                    <tr key={row.date} className={i % 2 === 0 ? 'bg-white' : 'bg-[#dce6f0]'}>
                      <td className="px-2 py-1.5 text-center border border-gray-300 font-medium">{dateStr}</td>
                      <td className="px-2 py-1.5 text-center border border-gray-300 font-semibold">{row.naaim_index?.toFixed(2)}</td>
                      <td className="px-2 py-1.5 text-center border border-gray-300">{row.bearish?.toFixed(0) ?? '—'}</td>
                      <td className="px-2 py-1.5 text-center border border-gray-300">{row.quartile_1?.toFixed(2) ?? '—'}</td>
                      <td className="px-2 py-1.5 text-center border border-gray-300">{row.quartile_2?.toFixed(2) ?? '—'}</td>
                      <td className="px-2 py-1.5 text-center border border-gray-300">{row.quartile_3?.toFixed(2) ?? '—'}</td>
                      <td className="px-2 py-1.5 text-center border border-gray-300">{row.bullish?.toFixed(0) ?? '—'}</td>
                      <td className="px-2 py-1.5 text-center border border-gray-300">{row.std_deviation?.toFixed(2) ?? '—'}</td>
                    </tr>
                  );
                })}
                {tableData.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-400">No data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Description ── */}
      <div className="text-xs text-gray-600 leading-relaxed mt-8 space-y-4 max-w-5xl">
        <p>
          NAAIM member firms who are active money managers are asked each Wednesday to provide a number which represents their overall equity exposure at the market close. Responses can vary widely as indicated below. Responses are tallied and averaged to provide the average long (or short) position of all NAAIM managers, as a group.
        </p>

        <div>
          <p className="font-semibold text-gray-800 mb-1">Range of Responses:</p>
          <ul className="list-disc list-inside space-y-0.5 ml-2 text-gray-700">
            <li>-200% Leveraged Short</li>
            <li>-100% Fully Short</li>
            <li>0% (100% Cash or Hedged to Market Neutral)</li>
            <li>100% Fully Invested</li>
            <li>200% Leveraged Long</li>
          </ul>
        </div>

        <div>
          <p className="font-semibold text-gray-800 mb-1">Data collection issues that may affect the statistical significance of this data include:</p>
          <ul className="space-y-3 mt-2">
            <li>
              Use of a single, composite number for each adviser may not accurately represent the market view of a manager who has short term and long term strategies that are providing conflicting signals or a manager who uses both contra-trend and trend following strategies for different portfolios.
            </li>
            <li>
              Investment Styles very widely among managers participating in this survey. They may include managers that trade very frequently and can switch long and short positions daily. Other managers stay fully invested at all times and only change allocations among market segments or sectors. Still others trade around core positions and only a portion of their portfolios change, but that portion could potentially go from long to short very quickly.
            </li>
            <li>
              Sample size: Although the number of participating managers, known as NAAIM Trend Setters, is steadily growing the sample size is not large and therefore may be less reflective of actual market conditions.
            </li>
          </ul>
        </div>

        <p className="pt-2">
          NAAIM publishes this data for use in tracking only and reserves the right to the use and trademarks of the NAAIM Exposure Index and its underlying data. Express permission must be sought from NAAIM for use of this data for commercial purposes.
        </p>
      </div>

      {/* ── Source ── */}
      <div className="text-[10px] text-gray-400 mt-2">
        Source:{' '}
        <a
          href="https://naaim.org/programs/naaim-exposure-index/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          National Association of Active Investment Managers (NAAIM)
        </a>
      </div>
    </div>
  );
}