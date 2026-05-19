'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ScreenerTable from '@/components/Screeners/ScreenerTable';
import ScreenerFilterPanel, { initialScreenerFilters, ScreenerFilters } from '@/components/Screeners/ScreenerFilterPanel';
import { useApi } from '@/hooks/useApi';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ShieldCheck, Zap, BarChart3, Target, MousePointer2 } from 'lucide-react';

// ─── DESIGN TOKENS: Black & White ────────────────────────────────
// Page bg: #FFFFFF  |  Card/Panel bg: #FFFFFF  |  Border: #E5E7EB
// Navbar/Accent dark: #111827  |  Accent mid: #374151
// Text primary: #111827  |  Text secondary: #4B5563  |  Text muted: #9CA3AF
// Badge green: #DCFCE7 / #15803D  |  Badge red: #FEE2E2 / #B91C1C
// ─────────────────────────────────────────────────────────────────────────────

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

interface FilterCondition {
  label: string;
  value: string;
}

const SCREENERS = [
  {
    id: 'trend-1-month',
    label: 'Trend - 1 Month',
    icon: <Activity className="w-4 h-4" />,
    color: '#374151',
    description: 'Comprehensive trend analysis focusing on stocks with institutional quality technical setups over a 1-month period.',
    conditions: [
      { label: '50 Day > 150 Day', value: 'Yes' },
      { label: '50 Day > 200 Day', value: 'Yes' },
      { label: '150 Day > 200 Day', value: 'Yes' },
      { label: '200 Day > 200 Day 1 Month Ago', value: 'Yes' },
      { label: 'RS Rating', value: '> 69' },
      { label: '% Off 52 Wk Low', value: '> 30.00%' },
      { label: '% Off 52 Wk High', value: '> -25.00%' },
      { label: 'Price Vs 50d SMA', value: '> 0.00%' },
      { label: 'Price Vs 150d SMA', value: '> 0.00%' },
      { label: 'Price Vs 200d SMA', value: '> 0.00%' },
      { label: 'Price Vs 30w SMA', value: '> 0.00%' },
      { label: 'Price Vs 40w SMA', value: '> 0.00%' },
    ] as FilterCondition[],
  },
  {
    id: 'trend-2-months',
    label: 'Trend - 2 Months',
    icon: <Zap className="w-4 h-4" />,
    color: '#4B5563',
    description: 'Stabilizing trends with confirmed upward trajectory maintained over a 2-month window.',
    conditions: [
      { label: '50 Day > 150 Day', value: 'Yes' },
      { label: '50 Day > 200 Day', value: 'Yes' },
      { label: '150 Day > 200 Day', value: 'Yes' },
      { label: '200 Day > 200 Day 2 Month Ago', value: 'Yes' },
      { label: '% Off 52 Wk High', value: '> -25.00%' },
      { label: 'RS Rating', value: '> 69' },
      { label: '% Off 52 Wk Low', value: '> 30.00%' },
      { label: '200 Day > 200 Day 1 Month Ago', value: 'Yes' },
      { label: '200 Day 1M Ago > 200 Day 2M Ago', value: 'Yes' },
      { label: 'Price Vs 50d SMA', value: '> 0.00%' },
      { label: 'Price Vs 150d SMA', value: '> 0.00%' },
      { label: 'Price Vs 200d SMA', value: '> 0.00%' },
      { label: 'Price Vs 30w SMA', value: '> 0.00%' },
      { label: 'Price Vs 40w SMA', value: '> 0.00%' },
    ] as FilterCondition[],
  },
  {
    id: 'trend-4-months',
    label: 'Trend - 4 Months',
    icon: <ShieldCheck className="w-4 h-4" />,
    color: '#111827',
    description: 'Long-term core positions showing sustained market outperformance over a 4-month period.',
    conditions: [
      { label: '50 Day > 150 Day', value: 'Yes' },
      { label: '50 Day > 200 Day', value: 'Yes' },
      { label: '150 Day > 200 Day', value: 'Yes' },
      { label: '200 Day > 200 Day 4 Month Ago', value: 'Yes' },
      { label: '% Off 52 Wk High', value: '> -25.00%' },
      { label: 'RS Rating', value: '> 69' },
      { label: '200 Day > 200 Day 1 Month Ago', value: 'Yes' },
      { label: '200 Day > 200 Day 2 Month Ago', value: 'Yes' },
      { label: '200 Day > 200 Day 3 Month Ago', value: 'Yes' },
      { label: '% Off 52 Wk Low', value: '> 30.00%' },
      { label: '200 Day 1M Ago > 200 Day 2M Ago', value: 'Yes' },
      { label: '200 Day 2M Ago > 200 Day 3M Ago', value: 'Yes' },
      { label: '200 Day 3M Ago > 200 Day 4M Ago', value: 'Yes' },
      { label: 'Price Vs 50d SMA', value: '> 0.00%' },
      { label: 'Price Vs 150d SMA', value: '> 0.00%' },
      { label: 'Price Vs 200d SMA', value: '> 0.00%' },
      { label: 'Price Vs 30w SMA', value: '> 0.00%' },
      { label: 'Price Vs 40w SMA', value: '> 0.00%' },
    ] as FilterCondition[],
  },
  {
    id: 'trend-5-months',
    label: 'Trend - 5 Months',
    icon: <BarChart3 className="w-4 h-4" />,
    color: '#B45309',
    description: 'Elite trend setups with exceptional technical consistency spanning five full months.',
    conditions: [
      { label: '50 Day > 150 Day', value: 'Yes' },
      { label: '50 Day > 200 Day', value: 'Yes' },
      { label: '150 Day > 200 Day', value: 'Yes' },
      { label: '200 Day > 200 Day 5 Month Ago', value: 'Yes' },
      { label: '% Off 52 Wk High', value: '> -25.00%' },
      { label: 'RS Rating', value: '> 69' },
      { label: '200 Day > 200 Day 1 Month Ago', value: 'Yes' },
      { label: '200 Day > 200 Day 2 Month Ago', value: 'Yes' },
      { label: '200 Day > 200 Day 3 Month Ago', value: 'Yes' },
      { label: '200 Day > 200 Day 4 Month Ago', value: 'Yes' },
      { label: '% Off 52 Wk Low', value: '> 30.00%' },
      { label: '200 Day 1M Ago > 200 Day 2M Ago', value: 'Yes' },
      { label: '200 Day 2M Ago > 200 Day 3M Ago', value: 'Yes' },
      { label: '200 Day 3M Ago > 200 Day 4M Ago', value: 'Yes' },
      { label: '200 Day 4M Ago > 200 Day 5M Ago', value: 'Yes' },
      { label: 'Price Vs 50d SMA', value: '> 0.00%' },
      { label: 'Price Vs 150d SMA', value: '> 0.00%' },
      { label: 'Price Vs 200d SMA', value: '> 0.00%' },
      { label: 'Price Vs 30w SMA', value: '> 0.00%' },
      { label: 'Price Vs 40w SMA', value: '> 0.00%' },
    ] as FilterCondition[],
  },
  {
    id: 'trend-5-months-wide',
    label: 'Trend - 5 Months Wide',
    icon: <Target className="w-4 h-4" />,
    color: '#0369A1',
    description: 'Extended base breakouts and recovery setups following long-term institutional buying.',
    conditions: [
      { label: '50 Day > 150 Day', value: 'Yes' },
      { label: '50 Day > 200 Day', value: 'Yes' },
      { label: '150 Day > 200 Day', value: 'Yes' },
      { label: '200 Day > 200 Day 5 Month Ago', value: 'Yes' },
      { label: '% Off 52 Wk High', value: '> -25.00%' },
      { label: '200 Day > 200 Day 1 Month Ago', value: 'Yes' },
      { label: '200 Day > 200 Day 2 Month Ago', value: 'Yes' },
      { label: '200 Day > 200 Day 3 Month Ago', value: 'Yes' },
      { label: '200 Day > 200 Day 4 Month Ago', value: 'Yes' },
      { label: '% Off 52 Wk Low', value: '> 30.00%' },
      { label: '200 Day 1M Ago > 200 Day 2M Ago', value: 'Yes' },
      { label: '200 Day 2M Ago > 200 Day 3M Ago', value: 'Yes' },
      { label: '200 Day 3M Ago > 200 Day 4M Ago', value: 'Yes' },
      { label: '200 Day 4M Ago > 200 Day 5M Ago', value: 'Yes' },
      { label: 'Price Vs 50d SMA', value: '> 0.00%' },
      { label: 'Price Vs 150d SMA', value: '> 0.00%' },
      { label: 'Price Vs 200d SMA', value: '> 0.00%' },
      { label: 'Price Vs 30w SMA', value: '> 0.00%' },
      { label: 'Price Vs 40w SMA', value: '> 0.00%' },
    ] as FilterCondition[],
  },
  {
    id: 'power-play',
    label: 'Power Play',
    icon: <MousePointer2 className="w-4 h-4" />,
    color: '#B91C1C',
    description: 'High-velocity momentum bursts following a major volume injection and tight consolidation.',
    conditions: [
      { label: '% Change - 20d', value: '> -25.00%' },
      { label: '% Change - 15d', value: '-15.00% — +5.00%' },
      { label: '% Change - 126d', value: '> 85.00%' },
      { label: 'Price Vs 50d SMA', value: '> 0.00%' },
      { label: 'Price Vs 200d SMA', value: '> 0.00%' },
    ] as FilterCondition[],
  },
];

function ScreenersContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');

  const [activeTab, setActiveTab] = useState(
    tabParam && SCREENERS.find(s => s.id === tabParam) ? tabParam : 'trend-1-month'
  );
  const [data, setData] = useState<StockResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<ScreenerFilters>(initialScreenerFilters);
  const { apiCall } = useApi();

  useEffect(() => {
    if (tabParam && SCREENERS.find(s => s.id === tabParam)) {
      setActiveTab(tabParam);
      setFilters(initialScreenerFilters);
    }
  }, [tabParam]);

  useEffect(() => { fetchScreenerData(); }, [activeTab]);

  const fetchScreenerData = async () => {
    setLoading(true);
    try {
      // Fetch all matches for the active screener to allow client-side filtering and pagination
      const response = await apiCall(`/api/screeners/${activeTab}?limit=5000&offset=0`);
      if (response && response.data && Array.isArray(response.data.data)) {
        const mapped = response.data.data.map((s: any) => ({
          ...s,
          rs_rating: s.rs_rating ?? s.rs_12m ?? 0,
          rank_1m: s.rank_1m ?? 0,
          rank_3m: s.rank_3m ?? 0,
          rank_6m: s.rank_6m ?? 0,
          rank_9m: s.rank_9m ?? 0,
          rank_12m: s.rank_12m ?? 0
        }));
        setData(mapped);
      }
    } catch (error) {
      console.error('Error fetching screener data:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeScreener = SCREENERS.find(s => s.id === activeTab);

  // Apply filters locally
  const filteredData = React.useMemo(() => {
    return data.filter(stock => {
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

      {/* ── Tab Navigation ── */}
      <div style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5E7EB', padding: '0 32px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: '1920px', margin: '0 auto', display: 'flex', gap: '4px', overflowX: 'auto', padding: '10px 0' }}>
          {SCREENERS.map(screener => {
            const active = activeTab === screener.id;
            return (
              <button
                key={screener.id}
                onClick={() => { setActiveTab(screener.id); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid',
                  backgroundColor: active ? '#111827' : 'transparent',
                  color: active ? '#FFFFFF' : '#6B7280',
                  borderColor: active ? '#111827' : 'transparent',
                  boxShadow: active ? '0 1px 4px rgba(17,24,39,0.25)' : 'none',
                }}
              >
                <span style={{ color: active ? '#FFFFFF' : '#9CA3AF' }}>{screener.icon}</span>
                {screener.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main Body ── */}
      <div style={{ padding: '32px', paddingBottom: '80px' }}>
        <div style={{ maxWidth: '1920px', margin: '0 auto', display: 'flex', gap: '32px', flexWrap: 'wrap' }}>

          {/* Strategy Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              style={{
                width: '360px', flexShrink: 0,
                backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '20px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)', overflow: 'hidden',
                position: 'sticky', top: '32px', alignSelf: 'flex-start',
              }}
            >
              {/* Color accent top bar */}
              <div style={{ height: '4px', backgroundColor: activeScreener?.color }} />

              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      backgroundColor: `${activeScreener?.color}18`, color: activeScreener?.color,
                      border: `1px solid ${activeScreener?.color}30`,
                    }}>
                      {activeScreener?.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>{activeScreener?.label}</div>
                      <div style={{ fontSize: '12px', color: '#9CA3AF' }}>Intelligence</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '30px', fontWeight: 900, color: '#111827', lineHeight: 1 }}>{filteredData.length}</div>
                    <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#9CA3AF', marginTop: '2px' }}>Assets</div>
                  </div>
                </div>

                {/* Description */}
                <p style={{ fontSize: '13px', color: '#4B5563', lineHeight: 1.65 }}>{activeScreener?.description}</p>

                {/* Verified badge */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', backgroundColor: '#DCFCE7', border: '1px solid #BBF7D0', color: '#15803D', fontSize: '11px', fontWeight: 700, width: 'fit-content' }}>
                  <ShieldCheck style={{ width: '13px', height: '13px' }} />
                  Strict Check Passed
                </div>

                {/* Divider */}
                <div style={{ height: '1px', backgroundColor: '#F3F4F6' }} />

                {/* Conditions */}
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#9CA3AF', marginBottom: '10px' }}>Technical Conditions</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {activeScreener?.conditions.map((cond, idx) => (
                      <div key={idx} style={{
                        padding: '5px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px',
                        backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB',
                      }}>
                        <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6B7280', fontWeight: 700 }}>{cond.label}</span>
                        <span style={{ fontSize: '10px', fontFamily: 'monospace', fontWeight: 900, color: activeScreener?.color }}>{cond.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Table */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <ScreenerTable
                  data={filteredData}
                  loading={loading}
                  screenerColor={activeScreener?.color}
                  screenerName={activeScreener?.label}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
      `}</style>
    </div>
  );
}

export default function ScreenersPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '4px solid #E5E7EB', borderTopColor: '#374151', animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
        <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9CA3AF' }}>Loading Screener Engine</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <ScreenersContent />
    </Suspense>
  );
}