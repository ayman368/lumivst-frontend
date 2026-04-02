'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ScreenerTable from '@/components/Screeners/ScreenerTable';
import { useApi } from '@/hooks/useApi';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ShieldCheck, Zap, BarChart3, Target, MousePointer2 } from 'lucide-react';

// ─── DESIGN TOKENS: Warm Cream × Forest Green ────────────────────────────────
// Page bg: #EDE8DC  |  Card/Panel bg: #FDFAF5  |  Border: #D9D2C3
// Navbar/Accent dark: #1C3D2E  |  Accent mid: #2D6A4F
// Text primary: #2C2416  |  Text secondary: #7A7060  |  Text muted: #A09880
// Badge green: #D4EDDA / #1C7A3F  |  Badge red: #FADADD / #C0392B
// ─────────────────────────────────────────────────────────────────────────────

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

interface FilterCondition {
  label: string;
  value: string;
}

const SCREENERS = [
  {
    id: 'trend-1-month',
    label: 'Trend - 1 Month',
    icon: <Activity className="w-4 h-4" />,
    color: '#2D6A4F',
    description: 'Comprehensive trend analysis focusing on stocks with institutional quality technical setups over a 1-month period.',
    conditions: [
      { label: '50 Day > 150 Day', value: 'Yes' },
      { label: '50 Day > 200 Day', value: 'Yes' },
      { label: '150 Day > 200 Day', value: 'Yes' },
      { label: '200 Day > 200 Day 1 Month Ago', value: 'Yes' },
      { label: 'RS 12M', value: '> 69' },
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
    color: '#3A7A5C',
    description: 'Stabilizing trends with confirmed upward trajectory maintained over a 2-month window.',
    conditions: [
      { label: '50 Day > 150 Day', value: 'Yes' },
      { label: '50 Day > 200 Day', value: 'Yes' },
      { label: '150 Day > 200 Day', value: 'Yes' },
      { label: '200 Day > 200 Day 2 Month Ago', value: 'Yes' },
      { label: '% Off 52 Wk High', value: '> -25.00%' },
      { label: 'RS 12M', value: '> 69' },
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
    color: '#1C5C40',
    description: 'Long-term core positions showing sustained market outperformance over a 4-month period.',
    conditions: [
      { label: '50 Day > 150 Day', value: 'Yes' },
      { label: '50 Day > 200 Day', value: 'Yes' },
      { label: '150 Day > 200 Day', value: 'Yes' },
      { label: '200 Day > 200 Day 4 Month Ago', value: 'Yes' },
      { label: '% Off 52 Wk High', value: '> -25.00%' },
      { label: 'RS 12M', value: '> 69' },
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
    color: '#92400E',
    description: 'Elite trend setups with exceptional technical consistency spanning five full months.',
    conditions: [
      { label: '50 Day > 150 Day', value: 'Yes' },
      { label: '50 Day > 200 Day', value: 'Yes' },
      { label: '150 Day > 200 Day', value: 'Yes' },
      { label: '200 Day > 200 Day 5 Month Ago', value: 'Yes' },
      { label: '% Off 52 Wk High', value: '> -25.00%' },
      { label: 'RS 12M', value: '> 69' },
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
    color: '#1A5276',
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
    color: '#C0392B',
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
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(50);
  const { apiCall } = useApi();

  useEffect(() => {
    if (tabParam && SCREENERS.find(s => s.id === tabParam)) {
      setActiveTab(tabParam);
      setPage(0);
    }
  }, [tabParam]);

  useEffect(() => { fetchScreenerData(); }, [activeTab, page, limit]);

  const fetchScreenerData = async () => {
    setLoading(true);
    try {
      const response = await apiCall(`/api/screeners/${activeTab}?limit=${limit}&offset=${page * limit}`);
      if (response && response.data && Array.isArray(response.data.data)) {
        setData(response.data.data);
        setTotal(response.data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching screener data:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeScreener = SCREENERS.find(s => s.id === activeTab);

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#EDE8DC', color: '#2C2416', fontFamily: 'system-ui, sans-serif' }}>

      {/* ── Hero Header ── */}
      <div style={{ padding: '40px 32px 32px', borderBottom: '1px solid #D9D2C3', backgroundColor: '#1C3D2E', boxShadow: '0 2px 8px rgba(28,61,46,0.2)' }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <div style={{ marginBottom: '8px' }}>
              <span style={{ padding: '3px 12px', borderRadius: '999px', backgroundColor: 'rgba(212,237,218,0.15)', color: '#A8D5B5', fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', border: '1px solid rgba(168,213,181,0.3)' }}>
                Data Intel
              </span>
            </div>
            <h1 style={{ fontSize: '40px', fontWeight: 900, letterSpacing: '-0.02em', color: '#F5F0E8', marginBottom: '8px' }}>
              Advanced <span style={{ color: '#A8D5B5' }}>Screeners</span>
            </h1>
            <p style={{ fontSize: '14px', color: 'rgba(212,237,218,0.7)', maxWidth: '480px', lineHeight: 1.6 }}>
              Industrial-grade stock filters powered by proprietary technical logic. Find high-probability setups across the Saudi Stock Market.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <div style={{ fontSize: '10px', color: 'rgba(212,237,218,0.5)', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '4px' }}>Last Analysis Update</div>
            <div style={{ fontSize: '13px', fontFamily: 'monospace', color: '#A8D5B5' }}>Real-time • 0.4s Latency</div>
          </motion.div>
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div style={{ backgroundColor: '#FDFAF5', borderBottom: '1px solid #D9D2C3', padding: '0 32px', boxShadow: '0 1px 4px rgba(44,36,22,0.06)' }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto', display: 'flex', gap: '4px', overflowX: 'auto', padding: '10px 0' }}>
          {SCREENERS.map(screener => {
            const active = activeTab === screener.id;
            return (
              <button
                key={screener.id}
                onClick={() => { setActiveTab(screener.id); setPage(0); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid',
                  backgroundColor: active ? '#1C3D2E' : 'transparent',
                  color: active ? '#D4EDDA' : '#7A7060',
                  borderColor: active ? '#1C3D2E' : 'transparent',
                  boxShadow: active ? '0 1px 4px rgba(28,61,46,0.25)' : 'none',
                }}
              >
                <span style={{ color: active ? '#A8D5B5' : '#A09880' }}>{screener.icon}</span>
                {screener.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main Body ── */}
      <div style={{ padding: '32px', paddingBottom: '80px' }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto', display: 'flex', gap: '32px', flexWrap: 'wrap' }}>

          {/* Strategy Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              style={{
                width: '360px', flexShrink: 0,
                backgroundColor: '#FDFAF5', border: '1px solid #D9D2C3', borderRadius: '20px',
                boxShadow: '0 2px 12px rgba(44,36,22,0.08)', overflow: 'hidden',
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
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#2C2416', lineHeight: 1.2 }}>{activeScreener?.label}</div>
                      <div style={{ fontSize: '12px', color: '#A09880' }}>Intelligence</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '30px', fontWeight: 900, color: '#2C2416', lineHeight: 1 }}>{total}</div>
                    <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#A09880', marginTop: '2px' }}>Assets</div>
                  </div>
                </div>

                {/* Description */}
                <p style={{ fontSize: '13px', color: '#7A7060', lineHeight: 1.65 }}>{activeScreener?.description}</p>

                {/* Verified badge */}
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px', backgroundColor: '#D4EDDA', border: '1px solid #A8D5B5', color: '#1C7A3F', fontSize: '11px', fontWeight: 700, width: 'fit-content' }}>
                  <ShieldCheck style={{ width: '13px', height: '13px' }} />
                  Strict Check Passed
                </div>

                {/* Divider */}
                <div style={{ height: '1px', backgroundColor: '#E8E2D5' }} />

                {/* Conditions */}
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#A09880', marginBottom: '10px' }}>Technical Conditions</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {activeScreener?.conditions.map((cond, idx) => (
                      <div key={idx} style={{
                        padding: '5px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px',
                        backgroundColor: '#F5F0E8', border: '1px solid #E8E2D5',
                      }}>
                        <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#7A7060', fontWeight: 700 }}>{cond.label}</span>
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
                  data={data}
                  loading={loading}
                  total={total}
                  page={page}
                  limit={limit}
                  onPageChange={setPage}
                  onLimitChange={setLimit}
                  screenerColor={activeScreener?.color}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #D9D2C3; border-radius: 10px; }
      `}</style>
    </div>
  );
}

export default function ScreenersPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', backgroundColor: '#EDE8DC', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '4px solid #D9D2C3', borderTopColor: '#2D6A4F', animation: 'spin 1s linear infinite', marginBottom: '16px' }} />
        <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#A09880' }}>Loading Screener Engine</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <ScreenersContent />
    </Suspense>
  );
}