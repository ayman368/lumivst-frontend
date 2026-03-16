'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ScreenerTable from '@/components/Screeners/ScreenerTable';
import { useApi } from '@/hooks/useApi';

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
    color: '#3B82F6',
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
    color: '#8B5CF6',
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
    color: '#EC4899',
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
    color: '#F59E0B',
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
    color: '#06B6D4',
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
    color: '#EF4444',
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
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-700 px-8 py-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
          📊 Stock Screeners
        </h1>
        <p className="text-slate-400">
          فلترة الأسهم السعودية حسب معايير التحليل الفني المختلفة
        </p>
      </div>

      {/* Main Content */}
      <div className="p-8 overflow-auto h-[calc(100vh-140px)]">
        <div className="max-w-7xl mx-auto">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); setPage(0); }} className="w-full">
            <TabsList className="grid grid-cols-2 lg:grid-cols-6 gap-2 mb-6 bg-slate-800 p-1 rounded-lg border border-slate-700 h-auto">
              {SCREENERS.map((screener) => (
                <TabsTrigger
                  key={screener.id}
                  value={screener.id}
                  className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-xs lg:text-sm font-medium py-2"
                >
                  {screener.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Screener Info Box */}
            {activeScreener && (
              <div
                className="mb-6 rounded-lg border-l-4 overflow-hidden"
                style={{
                  borderColor: activeScreener.color,
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                }}
              >
                {/* Title Row */}
                <div
                  className="px-5 py-3 flex items-center justify-between"
                  style={{ backgroundColor: 'rgba(30, 41, 59, 0.9)' }}
                >
                  <h2 className="text-lg font-bold text-white">
                    {activeScreener.label}
                  </h2>
                  <span
                    className="text-sm font-semibold px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: `${activeScreener.color}22`,
                      color: activeScreener.color,
                      border: `1px solid ${activeScreener.color}44`,
                    }}
                  >
                    📈 {total} matching stocks
                  </span>
                </div>

                {/* Conditions Grid */}
                <div className="px-5 py-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {activeScreener.conditions.map((cond, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-md"
                      style={{ backgroundColor: 'rgba(30, 41, 59, 0.6)' }}
                    >
                      <span className="text-slate-400 text-xs truncate">{cond.label}</span>
                      <span
                        className="text-xs font-bold whitespace-nowrap"
                        style={{ color: activeScreener.color }}
                      >
                        {cond.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Each Screener Content */}
            {SCREENERS.map((screener) => (
              <TabsContent key={screener.id} value={screener.id} className="w-full">
                <ScreenerTable
                  data={data}
                  loading={loading}
                  total={total}
                  page={page}
                  limit={limit}
                  onPageChange={setPage}
                  onLimitChange={setLimit}
                  screenerColor={screener.color}
                />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
