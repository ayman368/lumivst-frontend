'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Clock } from 'lucide-react';
import ScreenerTable from '@/components/Screeners/ScreenerTable';
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
  volume_traded?: number;
}

const PERIODS = [
  { value: '1-week', label: '1 Week High' },
  { value: '1-month', label: '1 Month High' },
  { value: '3-months', label: '3 Months High' },
  { value: '6-months', label: '6 Months High' },
  { value: '52-weeks', label: '52 Weeks High' },
];

function NewHighsScreenerContent() {
  const [data, setData] = useState<StockResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('1-month');
  const [lastUpdate, setLastUpdate] = useState('');

  const { filterStocks } = useWatchlistShariah();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const response = await authFetch(
          `${API_BASE_URL}/api/screeners/new-highs?period=${selectedPeriod}&limit=5000`, 
          { cache: 'no-store', credentials: 'include' }
        );
        
        if (!response.ok) throw new Error('Failed to fetch new highs');
        
        const result = await response.json();
        
        if (result.date) {
          setLastUpdate(result.date.toString());
        }
        
        setData(result.results || []);
      } catch (error) {
        console.error("Error fetching New Highs:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedPeriod]);

  // Apply Shariah / Watchlist filtering
  const filteredData = filterStocks(data) as StockResult[];

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Rocket className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">New Highs & RS Rating</h1>
          </div>
          <p className="text-sm text-gray-500 max-w-2xl">
            Stocks breaking out to new highs over your selected timeframe, sorted by their Relative Strength (RS) rating. 
            A classic momentum and strength screener.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <ShariahFilterBar variant="light" />
        </div>
      </div>

      {/* CONTROLS SECTION */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Timeframe:</span>
          <div className="flex bg-gray-100 p-1 rounded-xl">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setSelectedPeriod(p.value)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  selectedPeriod === p.value
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="text-gray-500">Results: </span>
            <span className="font-semibold text-gray-900">{filteredData.length}</span>
          </div>
          {lastUpdate && (
            <div className="text-sm">
              <span className="text-gray-500">Updated: </span>
              <span className="font-semibold text-gray-900">{lastUpdate}</span>
            </div>
          )}
        </div>
      </div>

      {/* RESULTS TABLE */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm"
          >
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
            <p className="text-gray-500">Scanning market for new highs...</p>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm"
          >
            <ScreenerTable data={filteredData} loading={false} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function NewHighsScreenerPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500 animate-pulse">Loading Screener...</div>}>
      <WatchlistShariahProvider>
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
          <div className="max-w-[1600px] mx-auto">
            <NewHighsScreenerContent />
          </div>
        </div>
      </WatchlistShariahProvider>
    </Suspense>
  );
}
