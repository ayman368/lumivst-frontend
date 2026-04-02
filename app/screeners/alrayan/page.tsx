'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import ScreenerTable from '@/components/Screeners/ScreenerTable';
import { motion } from 'framer-motion';
import { Target, ShieldCheck } from 'lucide-react';

interface StockResult {
  symbol: string;
  company_name: string;
  close: number;
  sma_50: number;
  sma_150: number;
  sma_200: number;
  rs_12m: number;
  percent_off_52w_high: number;
  percent_off_52w_low: number;
}

const ALRAYAN_CONDITIONS = [
  { label: 'Price > 18 SMA (Daily)', value: 'Yes' },
  { label: 'SMA 4 > SMA 9 > SMA 18 (Daily)', value: 'Yes' },
  { label: 'Price > 9 SMA (Weekly)', value: 'Yes' },
  { label: 'SMA 4 > SMA 9 > SMA 18 (Weekly)', value: 'Yes' },
  { label: 'CCI(14) > 100', value: 'Yes' },
  { label: 'CCI(14) EMA(20) > 0 (Daily) (same day or after CCI > 100)', value: 'Yes' },
  { label: 'CCI(14) EMA(20) > 0 (Weekly) (same day CCI > 100)', value: 'Yes' },
  { label: 'Aroon Up > 70%', value: 'Yes' },
  { label: 'Aroon Down < 30% after/same as Aroon Up', value: 'Yes' },
];

function AlrayanScreenerContent() {
  const [data, setData] = useState<StockResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(50);
  const [lastUpdate, setLastUpdate] = useState('');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const [pricesRes, rsRes, techRes] = await Promise.all([
          fetch(`${API_URL}/api/prices/latest`, { cache: 'no-store', headers }),
          fetch(`${API_URL}/api/rs-v2/latest?limit=1000`, { cache: 'no-store', headers }),
          fetch(`${API_URL}/api/technical-screener/screener?limit=1000`, { cache: 'no-store', headers })
        ]);

        if (!pricesRes.ok) throw new Error('Failed to fetch prices');

        const pricesData = await pricesRes.json();
        const rsData = rsRes.ok ? await rsRes.json() : { data: [] };
        const techData = techRes.ok ? await techRes.json() : { data: [] };

        if (pricesData.date) {
          setLastUpdate(pricesData.date.toString());
        }

        const rsMap = new Map((rsData.data || []).map((item: any) => [String(item.symbol), item]));
        const techMap = new Map((techData.data || []).map((item: any) => [String(item.symbol), item]));

        const filteredStocks: StockResult[] = [];

        for (const item of (pricesData.data || [])) {
          const sym = String(item.symbol);
          const tech: any = techMap.get(sym) || {};
          const rs: any = rsMap.get(sym) || {};

          const p = parseFloat(item.close || 0);

          // Daily SMA
          const sma18 = parseFloat(tech.sma18 || 0);
          const sma4 = parseFloat(tech.sma4 || 0);
          const sma9 = parseFloat(tech.sma9_close || tech.sma9 || 0);
          
          // Weekly SMA
          const sma9w = parseFloat(tech.sma_9w || tech.sma9_w || 0);
          const sma4w = parseFloat(tech.sma_4w || tech.sma4_w || 0);
          const sma18w = parseFloat(tech.sma_18w || tech.sma18_w || 0);

          // CCI
          const cci14 = parseFloat(tech.cci || 0);
          const cci_ema20 = parseFloat(tech.cci_ema20 || 0);
          const cci14_w = parseFloat(tech.cci_w || 0);
          const cci_ema20_w = parseFloat(tech.cci_ema20_w || 0);

          // Aroon
          const aroon_up = parseFloat(tech.aroon_up || 0);
          const aroon_down = parseFloat(tech.aroon_down || 0);

          // ─ 1. Price > 18 SMA (Daily) ─
          if (!(p > sma18)) continue;
          
          // ─ 2. SMA 4 > SMA 9 > SMA 18 (Daily) ─
          if (!(sma4 > sma9 && sma9 > sma18)) continue;
          
          // ─ 3. Price > 9 SMA (Weekly) ─
          if (!(p > sma9w)) continue;
          
          // ─ 4. SMA 4 > SMA 9 > SMA 18 (Weekly) ─
          if (!(sma4w > sma9w && sma9w > sma18w)) continue;
          
          // ─ 5. CCI(14) > 100 ─
          if (!(cci14 > 100)) continue;
          
          // ─ 6. CCI(14) EMA(20) > 0 (Daily) ─
          if (!(cci_ema20 > 0)) continue;
          
          // ─ 7. CCI(14) EMA(20) > 0 (Weekly) & CCI(14) W > 100 ─
          if (!(cci14_w > 100 && cci_ema20_w > 0)) continue;
          
          // ─ 8. Aroon Up > 70% ─
          if (!(aroon_up > 70)) continue;
          
          // ─ 9. Aroon Down < 30% ─
          if (!(aroon_down < 30)) continue;

          filteredStocks.push({
            symbol: item.symbol,
            company_name: item.company_name || '',
            close: p,
            sma_50: parseFloat(tech.sma50 || tech.sma_50 || 0),
            sma_150: parseFloat(tech.sma150 || tech.sma_150 || 0),
            sma_200: parseFloat(tech.sma200 || tech.sma_200 || 0),
            rs_12m: parseFloat(rs.rs_rating || 0),
            percent_off_52w_high: parseFloat(tech.percent_off_52w_high || 0),
            percent_off_52w_low: parseFloat(tech.percent_off_52w_low || 0)
          });
        }

        // Sort by RS Rating internally so top RS stocks show first
        filteredStocks.sort((a, b) => b.rs_12m - a.rs_12m);
        
        setData(filteredStocks);
      } catch (error) {
        console.error('Error fetching Alrayan screener data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const total = data.length;
  
  // Client-side pagination slicing
  const paginatedData = useMemo(() => {
    const start = page * limit;
    return data.slice(start, start + limit);
  }, [data, page, limit]);

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#EDE8DC', color: '#2C2416', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* ── Hero Header ── */}
      <div style={{ padding: '40px 32px 32px', borderBottom: '1px solid #D9D2C3', backgroundColor: '#1C3D2E', boxShadow: '0 2px 8px rgba(28,61,46,0.2)' }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ padding: '3px 12px', borderRadius: '999px', backgroundColor: 'rgba(212,237,218,0.15)', color: '#A8D5B5', fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', border: '1px solid rgba(168,213,181,0.3)' }}>
                Data Intel • Fixed Strategy
              </span>
            </div>
            <h1 style={{ fontSize: '40px', fontWeight: 900, letterSpacing: '-0.02em', color: '#F5F0E8', marginBottom: '8px' }}>
              <span style={{ color: '#A8D5B5' }}>Alrayan</span> Screener
            </h1>
            <p style={{ fontSize: '14px', color: 'rgba(212,237,218,0.7)', maxWidth: '480px', lineHeight: 1.6 }}>
              A specialized multi-timeframe strategy tracking moving average alliances, CCI momentum triggers, and dominant Aroon trends logic dynamically.
            </p>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <div style={{ fontSize: '10px', color: 'rgba(212,237,218,0.5)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '4px' }}>Last Data Sync</div>
            <div style={{ fontSize: '13px', fontFamily: 'monospace', color: '#A8D5B5' }}>{lastUpdate || 'Real-time'} • Client Calculation</div>
          </motion.div>
        </div>
      </div>

      {/* ── Main Body ── */}
      <div style={{ padding: '40px 32px 80px' }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto', display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
          
          {/* Strategy Details Sidebar Card */}
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              width: '360px', flexShrink: 0,
              backgroundColor: '#FDFAF5', border: '1px solid #D9D2C3', borderRadius: '20px',
              boxShadow: '0 2px 12px rgba(44,36,22,0.08)', overflow: 'hidden',
              position: 'sticky', top: '32px', alignSelf: 'flex-start',
            }}
          >
            <div style={{ height: '4px', backgroundColor: '#2962FF' }} />
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2962FF18', color: '#2962FF', border: '1px solid #2962FF30' }}>
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#2C2416', lineHeight: 1.2 }}>Alrayan Active</div>
                    <div style={{ fontSize: '12px', color: '#A09880' }}>Meets Criteria</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '30px', fontWeight: 900, color: '#2C2416', lineHeight: 1 }}>{total}</div>
                  <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#A09880', marginTop: '2px' }}>Assets</div>
                </div>
              </div>

              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', backgroundColor: '#D4EDDA', border: '1px solid #A8D5B5', color: '#1C7A3F', fontSize: '11px', fontWeight: 700, width: 'fit-content' }}>
                <ShieldCheck style={{ width: '13px', height: '13px' }} />
                Strict Check Passed
              </div>
              <div style={{ height: '1px', backgroundColor: '#E8E2D5' }} />

              {/* Conditions List */}
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#A09880', marginBottom: '10px' }}>
                  Fixed Active Filters ({ALRAYAN_CONDITIONS.length})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {ALRAYAN_CONDITIONS.map((cond, idx) => (
                    <div key={idx} style={{ padding: '5px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#F5F0E8', border: '1px solid #E8E2D5' }}>
                      <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#7A7060', fontWeight: 700 }}>{cond.label}</span>
                      <span style={{ fontSize: '10px', fontFamily: 'monospace', fontWeight: 900, color: '#2962FF' }}>{cond.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Table Results */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <ScreenerTable
                data={paginatedData}
                loading={loading}
                total={total}
                page={page}
                limit={limit}
                onPageChange={setPage}
                onLimitChange={setLimit}
                screenerColor="#2962FF"
              />
            </motion.div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default function AlrayanPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', backgroundColor: '#EDE8DC' }} />}>
      <AlrayanScreenerContent />
    </Suspense>
  );
}
