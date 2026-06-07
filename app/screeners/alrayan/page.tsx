'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import ScreenerTable from '@/components/Screeners/ScreenerTable';
import ScreenerFilterPanel, { initialScreenerFilters, ScreenerFilters } from '@/components/Screeners/ScreenerFilterPanel';
import { motion } from 'framer-motion';
import { Target, ShieldCheck } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api/config';
import { authFetch } from '@/lib/api/authFetch';
import { WatchlistShariahProvider, useWatchlistShariah, ShariahFilterBar } from '@/components/Watchlist/WatchlistShariahContext';

interface StockResult {
  symbol: string;
  company_name: string;
  close: number;
  sma_50: number;
  sma_150: number;
  sma_200: number;
  rs_rating: number;
  rank_1m: number;
  rank_3m: number;
  rank_6m: number;
  rank_9m: number;
  rank_12m: number;
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
  const [filters, setFilters] = useState<ScreenerFilters>(initialScreenerFilters);
  const [lastUpdate, setLastUpdate] = useState('');

  const { filterStocks } = useWatchlistShariah();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const API_URL = API_BASE_URL;

        const [pricesRes, rsRes, techRes] = await Promise.all([
          authFetch(`${API_URL}/api/prices/latest`, { cache: 'no-store', credentials: 'include' }),
          authFetch(`${API_URL}/api/rs-v2/latest?limit=1000`, { cache: 'no-store', credentials: 'include' }),
          authFetch(`${API_URL}/api/technical-screener/screener?limit=1000`, { cache: 'no-store', credentials: 'include' })
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
            rs_rating: parseFloat(rs.rs_rating || 0),
            rank_1m: parseFloat(rs.rank_1m || 0),
            rank_3m: parseFloat(rs.rank_3m || 0),
            rank_6m: parseFloat(rs.rank_6m || 0),
            rank_9m: parseFloat(rs.rank_9m || 0),
            rank_12m: parseFloat(rs.rank_12m || 0),
            percent_off_52w_high: parseFloat(tech.percent_off_52w_high || 0),
            percent_off_52w_low: parseFloat(tech.percent_off_52w_low || 0)
          });
        }

        // Sort by RS Rating internally so top RS stocks show first
        filteredStocks.sort((a, b) => b.rs_rating - a.rs_rating);
        
        setData(filteredStocks);
      } catch (error) {
        console.error('Error fetching Alrayan screener data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Local filtering based on UI panel
  const filteredData = useMemo(() => {
    const localFiltered = data.filter(stock => {
      // Price
      if (filters.price_min && stock.close < parseFloat(filters.price_min)) return false;
      if (filters.price_max && stock.close > parseFloat(filters.price_max)) return false;

      // SMA 50
      if (filters.sma_50_min && stock.sma_50 < parseFloat(filters.sma_50_min)) return false;
      if (filters.sma_50_max && stock.sma_50 > parseFloat(filters.sma_50_max)) return false;

      // SMA 150
      if (filters.sma_150_min && stock.sma_150 < parseFloat(filters.sma_150_min)) return false;
      if (filters.sma_150_max && stock.sma_150 > parseFloat(filters.sma_150_max)) return false;

      // SMA 200
      if (filters.sma_200_min && stock.sma_200 < parseFloat(filters.sma_200_min)) return false;
      if (filters.sma_200_max && stock.sma_200 > parseFloat(filters.sma_200_max)) return false;

      // RS Rating
      if (filters.rs_12m_min && stock.rs_rating < parseFloat(filters.rs_12m_min)) return false;
      if (filters.rs_12m_max && stock.rs_rating > parseFloat(filters.rs_12m_max)) return false;

      if (filters.rank_1m_min && stock.rank_1m < parseFloat(filters.rank_1m_min)) return false;
      if (filters.rank_1m_max && stock.rank_1m > parseFloat(filters.rank_1m_max)) return false;

      if (filters.rank_3m_min && stock.rank_3m < parseFloat(filters.rank_3m_min)) return false;
      if (filters.rank_3m_max && stock.rank_3m > parseFloat(filters.rank_3m_max)) return false;

      if (filters.rank_6m_min && stock.rank_6m < parseFloat(filters.rank_6m_min)) return false;
      if (filters.rank_6m_max && stock.rank_6m > parseFloat(filters.rank_6m_max)) return false;

      if (filters.rank_9m_min && stock.rank_9m < parseFloat(filters.rank_9m_min)) return false;
      if (filters.rank_9m_max && stock.rank_9m > parseFloat(filters.rank_9m_max)) return false;

      if (filters.rank_12m_min && stock.rank_12m < parseFloat(filters.rank_12m_min)) return false;
      if (filters.rank_12m_max && stock.rank_12m > parseFloat(filters.rank_12m_max)) return false;

      // Off 52W High
      if (filters.percent_off_52w_high_min && stock.percent_off_52w_high < parseFloat(filters.percent_off_52w_high_min)) return false;
      if (filters.percent_off_52w_high_max && stock.percent_off_52w_high > parseFloat(filters.percent_off_52w_high_max)) return false;

      // Off 52W Low
      if (filters.percent_off_52w_low_min && stock.percent_off_52w_low < parseFloat(filters.percent_off_52w_low_min)) return false;
      if (filters.percent_off_52w_low_max && stock.percent_off_52w_low > parseFloat(filters.percent_off_52w_low_max)) return false;

      return true;
    });
    return filterStocks(localFiltered);
  }, [data, filters, filterStocks]);





  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#FFFFFF', color: '#111827', fontFamily: 'system-ui, sans-serif' }}>
      
      <ShariahFilterBar variant="light" />

      <div style={{ padding: '32px 32px 0 32px', maxWidth: '1920px', margin: '0 auto' }}>
        <ScreenerFilterPanel 
          filters={filters} 
          setFilters={setFilters} 
          clearAllFilters={() => setFilters(initialScreenerFilters)}
        />
      </div>

      {/* ── Main Body ── */}
      <div style={{ padding: '0 32px 80px' }}>
        <div style={{ maxWidth: '1920px', margin: '0 auto', display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
          
          {/* Strategy Details Sidebar Card */}
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              width: '360px', flexShrink: 0,
              backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '20px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)', overflow: 'hidden',
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
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>Alrayan Active</div>
                    <div style={{ fontSize: '12px', color: '#9CA3AF' }}>Meets Criteria</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '30px', fontWeight: 900, color: '#111827', lineHeight: 1 }}>{filteredData.length}</div>
                  <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#9CA3AF', marginTop: '2px' }}>Assets</div>
                </div>
              </div>

              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', backgroundColor: '#DCFCE7', border: '1px solid #BBF7D0', color: '#15803D', fontSize: '11px', fontWeight: 700, width: 'fit-content' }}>
                <ShieldCheck style={{ width: '13px', height: '13px' }} />
                Strict Check Passed
              </div>
              <div style={{ height: '1px', backgroundColor: '#F3F4F6' }} />

              {/* Conditions List */}
              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#9CA3AF', marginBottom: '10px' }}>
                  Fixed Active Filters ({ALRAYAN_CONDITIONS.length})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {ALRAYAN_CONDITIONS.map((cond, idx) => (
                    <div key={idx} style={{ padding: '5px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                      <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6B7280', fontWeight: 700 }}>{cond.label}</span>
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
                data={filteredData}
                loading={loading}
                screenerColor="#2962FF"
                exportFileNamePrefix="Alrayan"
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
    <WatchlistShariahProvider>
      <Suspense fallback={<div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF' }} />}>
        <AlrayanScreenerContent />
      </Suspense>
    </WatchlistShariahProvider>
  );
}
