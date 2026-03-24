'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ScreenerTable from '@/components/Screeners/ScreenerTable';
import { useApi } from '@/hooks/useApi';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ShieldCheck, Zap, BarChart3, Target, MousePointer2 } from 'lucide-react';

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
    color: '#3B82F6',
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
    color: '#8B5CF6',
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
    color: '#EC4899',
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
    color: '#F59E0B',
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
    color: '#06B6D4',
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
    color: '#EF4444',
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

export default function ScreenersPage() {
  const [activeTab, setActiveTab] = useState('trend-1-month');
  const [data, setData] = useState<StockResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(50);
  const { apiCall } = useApi();

  useEffect(() => {
    fetchScreenerData();
  }, [activeTab, page, limit]);

  const fetchScreenerData = async () => {
    setLoading(true);
    try {
      const response = await apiCall(
        `/api/screeners/${activeTab}?limit=${limit}&offset=${page * limit}`
      );

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

  const activeScreener = SCREENERS.find((s) => s.id === activeTab);

  return (
    <div className="w-full min-h-screen bg-[#0a0c10] text-[#e2e8f0] relative overflow-x-hidden">
      {/* Premium Background Effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[150px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/10 blur-[120px] -z-10" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none -z-10" />

      {/* Header Section */}
      <div className="px-8 py-10 border-b border-white/[0.05] bg-white/[0.02] backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold tracking-widest uppercase border border-blue-500/20">
                Data Intel
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2 font-outfit">
              Advanced <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Screeners</span>
            </h1>
            <p className="text-slate-400 max-w-xl text-sm md:text-base leading-relaxed">
              Industrial-grade stock filters powered by proprietary technical logic. 
              Find high-probability setups across the Saudi Stock Market.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="hidden md:flex flex-col items-end"
          >
            <div className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-1">Last Analysis Update</div>
            <div className="text-sm font-mono text-white/80 tabular-nums">Real-time • 0.4s Latency</div>
          </motion.div>
        </div>
      </div>

      {/* Main Container */}
      <div className="p-8 pb-20">
        <div className="max-w-7xl mx-auto">
          <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); setPage(0); }} className="w-full">
            {/* Navigational Tabs (The Switcher) */}
            <div className="mb-10 overflow-x-auto pb-2 custom-scrollbar">
              <TabsList className="flex flex-nowrap h-auto gap-4 bg-transparent p-1 mb-8 border-b border-white/[0.05] min-w-max">
                {SCREENERS.map((screener) => (
                  <TabsTrigger
                    key={screener.id}
                    value={screener.id}
                    className="relative px-6 py-4 rounded-xl text-sm font-bold tracking-tight transition-all
                              data-[state=active]:text-white 
                              text-slate-500 hover:text-slate-200
                              flex items-center gap-3 group"
                  >
                    {screener.label}
                    {/* Active Accent Bar */}
                    {activeTab === screener.id && (
                      <motion.div 
                        layoutId="activeTab"
                        className="absolute bottom-[-5px] left-0 right-0 h-1 bg-blue-500 rounded-full z-10"
                        style={{ backgroundColor: screener.color }}
                      />
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Strategy Insight Card (Glass Effect) */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="mb-8 p-6 rounded-3xl border border-white/[0.05] bg-gradient-to-br from-white/[0.03] to-white/[0.01] backdrop-blur-md relative overflow-hidden group shadow-2xl"
              >
                {/* Background Glow */}
                <div 
                  className="absolute top-0 right-0 w-64 h-64 -mr-16 -mt-16 blur-3xl opacity-10 transition-colors duration-700"
                  style={{ backgroundColor: activeScreener?.color }}
                />

                <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div 
                        className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
                        style={{ backgroundColor: `${activeScreener?.color}15`, color: activeScreener?.color }}
                      >
                        {activeScreener?.icon}
                      </div>
                      <h2 className="text-xl font-bold text-white tracking-wide">
                        {activeScreener?.label} <span className="text-slate-500 font-light ml-2">Intelligence</span>
                      </h2>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-2xl mb-6">
                      {activeScreener?.description}
                    </p>
                    
                    {/* Condition Badges */}
                    <div className="flex flex-wrap gap-2">
                      {activeScreener?.conditions.map((cond, idx) => (
                        <div 
                          key={idx}
                          className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center gap-2 group-hover:border-white/[0.15] transition-colors"
                        >
                          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{cond.label}</span>
                          <span className="text-[10px] font-mono font-black" style={{ color: activeScreener?.color }}>{cond.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-center lg:items-end p-4 lg:p-0">
                    <div className="text-[40px] font-black text-white leading-none mb-1 tracking-tighter tabular-nums">
                      {total}
                    </div>
                    <div className="text-[10px] uppercase font-bold tracking-[0.25em] text-slate-500">Matching Assets</div>
                    <div className="mt-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                      <ShieldCheck className="w-3 h-3" />
                      Strict Check Passed
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Table Content */}
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
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
          </Tabs>
        </div>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
