'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Target, ShieldCheck } from 'lucide-react';
import ScreenerTable from '@/components/Screeners/ScreenerTable';
import ScreenerFilterPanel, { initialScreenerFilters, ScreenerFilters } from '@/components/Screeners/ScreenerFilterPanel';
import { API_BASE_URL } from '@/lib/api/config';

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
  price_vs_sma_50_percent: number;
  average_volume_50: number;
}

const ALHUSSAIN_CONDITIONS = [
  { label: '50 SMA > 150 SMA', value: 'Yes' },
  { label: '50 SMA > 200 SMA', value: 'Yes' },
  { label: '150 SMA > 200 SMA', value: 'Yes' },
  { label: 'vs SMA 50% ≥ 0', value: 'Yes' },
  { label: 'Avg Volume 50 ≥ 100,000', value: 'Yes' },
];

function AlhussainScreenerContent() {
  const [data, setData] = useState<StockResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<ScreenerFilters>(initialScreenerFilters);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [pricesRes, rsRes, techRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/prices/latest`, { cache: 'no-store', credentials: 'include' }),
          fetch(`${API_BASE_URL}/api/rs-v2/latest?limit=1000`, { cache: 'no-store', credentials: 'include' }),
          fetch(`${API_BASE_URL}/api/technical-screener/screener?limit=1000`, { cache: 'no-store', credentials: 'include' }),
        ]);

        if (!pricesRes.ok) throw new Error('Failed to fetch prices');

        const pricesData = await pricesRes.json();
        const rsData = rsRes.ok ? await rsRes.json() : { data: [] };
        const techData = techRes.ok ? await techRes.json() : { data: [] };

        const rsMap = new Map((rsData.data || []).map((item: any) => [String(item.symbol), item]));
        const techMap = new Map((techData.data || []).map((item: any) => [String(item.symbol), item]));

        const filteredStocks: StockResult[] = [];

        for (const item of (pricesData.data || [])) {
          const sym = String(item.symbol);
          const tech: any = techMap.get(sym) || {};
          const rs: any = rsMap.get(sym) || {};

          const p = parseFloat(item.close || 0);
          const sma50 = parseFloat(tech.sma50 || tech.sma_50 || 0);
          const sma150 = parseFloat(tech.sma150 || tech.sma_150 || 0);
          const sma200 = parseFloat(tech.sma200 || tech.sma_200 || 0);
          const priceVsSma50 = parseFloat(tech.price_vs_sma_50_percent || tech.price_vs_sma_50 || 0);
          const avgVolume50 = parseFloat(tech.average_volume_50 || 0);

          if (!(sma50 > sma150)) continue;
          if (!(sma50 > sma200)) continue;
          if (!(sma150 > sma200)) continue;
          if (!(priceVsSma50 >= 0)) continue;
          if (!(avgVolume50 >= 100000)) continue;

          filteredStocks.push({
            symbol: item.symbol,
            company_name: item.company_name || '',
            close: p,
            sma_50: sma50,
            sma_150: sma150,
            sma_200: sma200,
            rs_rating: parseFloat(rs.rs_rating || 0),
            rank_1m: parseFloat(rs.rank_1m || 0),
            rank_3m: parseFloat(rs.rank_3m || 0),
            rank_6m: parseFloat(rs.rank_6m || 0),
            rank_9m: parseFloat(rs.rank_9m || 0),
            rank_12m: parseFloat(rs.rank_12m || 0),
            percent_off_52w_high: parseFloat(tech.percent_off_52w_high || 0),
            percent_off_52w_low: parseFloat(tech.percent_off_52w_low || 0),
            price_vs_sma_50_percent: priceVsSma50,
            average_volume_50: avgVolume50,
          });
        }

        filteredStocks.sort((a, b) => b.rs_rating - a.rs_rating);
        setData(filteredStocks);
      } catch (error) {
        console.error('Error fetching Alhussain screener data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter(stock => {
      if (filters.price_min && stock.close < parseFloat(filters.price_min)) return false;
      if (filters.price_max && stock.close > parseFloat(filters.price_max)) return false;

      if (filters.sma_50_min && stock.sma_50 < parseFloat(filters.sma_50_min)) return false;
      if (filters.sma_50_max && stock.sma_50 > parseFloat(filters.sma_50_max)) return false;

      if (filters.sma_150_min && stock.sma_150 < parseFloat(filters.sma_150_min)) return false;
      if (filters.sma_150_max && stock.sma_150 > parseFloat(filters.sma_150_max)) return false;

      if (filters.sma_200_min && stock.sma_200 < parseFloat(filters.sma_200_min)) return false;
      if (filters.sma_200_max && stock.sma_200 > parseFloat(filters.sma_200_max)) return false;

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

      if (filters.percent_off_52w_high_min && stock.percent_off_52w_high < parseFloat(filters.percent_off_52w_high_min)) return false;
      if (filters.percent_off_52w_high_max && stock.percent_off_52w_high > parseFloat(filters.percent_off_52w_high_max)) return false;

      if (filters.percent_off_52w_low_min && stock.percent_off_52w_low < parseFloat(filters.percent_off_52w_low_min)) return false;
      if (filters.percent_off_52w_low_max && stock.percent_off_52w_low > parseFloat(filters.percent_off_52w_low_max)) return false;

      return true;
    });
  }, [data, filters]);

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#FFFFFF', color: '#111827', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ padding: '32px 32px 0 32px', maxWidth: '1920px', margin: '0 auto' }}>
        <ScreenerFilterPanel
          filters={filters}
          setFilters={setFilters}
          clearAllFilters={() => setFilters(initialScreenerFilters)}
        />
      </div>

      <div style={{ padding: '0 32px 80px' }}>
        <div style={{ maxWidth: '1920px', margin: '0 auto', display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
          <motion.div
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              width: '360px',
              flexShrink: 0,
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '20px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              overflow: 'hidden',
              position: 'sticky',
              top: '32px',
              alignSelf: 'flex-start',
            }}
          >
            <div style={{ height: '4px', backgroundColor: '#7C3AED' }} />
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#7C3AED18', color: '#7C3AED', border: '1px solid #7C3AED30' }}>
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>Alhussain Screener</div>
                    <div style={{ fontSize: '12px', color: '#9CA3AF' }}>SMA & Volume Rules</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '30px', fontWeight: 900, color: '#111827', lineHeight: 1 }}>{filteredData.length}</div>
                  <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#9CA3AF', marginTop: '2px' }}>Assets</div>
                </div>
              </div>

              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', backgroundColor: '#EEF2FF', border: '1px solid #C7D2FE', color: '#3730A3', fontSize: '11px', fontWeight: 700, width: 'fit-content' }}>
                <ShieldCheck style={{ width: '13px', height: '13px' }} />
                Strict Criteria Active
              </div>
              <div style={{ height: '1px', backgroundColor: '#F3F4F6' }} />

              <div>
                <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#9CA3AF', marginBottom: '10px' }}>
                  Fixed Active Filters ({ALHUSSAIN_CONDITIONS.length})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {ALHUSSAIN_CONDITIONS.map((cond, idx) => (
                    <div key={idx} style={{ padding: '5px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                      <span style={{ fontSize: '10px', color: '#374151', fontWeight: 600 }}>{cond.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <ScreenerTable data={filteredData} loading={loading} screenerColor="#7C3AED" exportFileNamePrefix="Alhussain" />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AlhussainPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF' }} />}>
      <AlhussainScreenerContent />
    </Suspense>
  );
}
