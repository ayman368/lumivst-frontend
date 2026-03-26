'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, ChevronRight, Download, FileSpreadsheet, Layers, TrendingUp, TrendingDown, ChevronDown, CheckCircle2 } from 'lucide-react';
import * as XLSX from 'xlsx';

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

interface ScreenerTableProps {
  data: StockResult[];
  loading: boolean;
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  screenerColor?: string;
}

export default function ScreenerTable({
  data,
  loading,
  total,
  page,
  limit,
  onPageChange,
  onLimitChange,
  screenerColor = '#3B82F6',
}: ScreenerTableProps) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalPages = Math.ceil(total / limit);
  const startRecord = page * limit + 1;
  const endRecord = Math.min((page + 1) * limit, total);

  const formatNumber = (value: number | null | undefined, decimals = 2) => {
    if (value === null || value === undefined) return 'N/A';
    return value.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  const formatPercent = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '0.00%';
    const val = value.toFixed(2);
    return `${parseFloat(val) > 0 ? '+' : ''}${val}%`;
  };

  const handleExport = useCallback((format: 'csv' | 'xls' | 'xlsx' | 'txt') => {
    const headers = ['Symbol', 'Company Name', 'Price', 'SMA 50', 'SMA 150', 'SMA 200', 'RS 12M', 'Off 52W High', 'Off 52W Low'];
    const rows = data.map(s => [s.symbol, s.company_name, s.close, s.sma_50, s.sma_150, s.sma_200, s.rs_12m, s.percent_off_52w_high, s.percent_off_52w_low]);
    const filename = `LUMI_SCREENER_${Date.now()}`;

    if (format === 'csv' || format === 'txt') {
      const separator = format === 'csv' ? ',' : '\t';
      const content = [headers.join(separator), ...rows.map(row => row.join(separator))].join('\n');
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${filename}.${format}`;
      link.click();
    } else {
      const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Screener Data");
      XLSX.writeFile(workbook, `${filename}.${format}`, { bookType: format === 'xls' ? 'biff8' : 'xlsx' });
    }
    setShowExportMenu(false);
  }, [data]);

  if (loading && data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-white/[0.02] border border-white/[0.05] rounded-3xl backdrop-blur-sm">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-slate-700"></div>
          <div className="absolute inset-0 rounded-full border-2 border-t-blue-500 animate-spin"></div>
        </div>
        <p className="mt-6 text-slate-500 font-medium tracking-wide animate-pulse">Syncing Global Data Assets...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Table Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-white/[0.03] border border-white/[0.05] rounded-2xl backdrop-blur-md shadow-xl relative z-50">
        <div className="flex items-center gap-3">
          <div className="flex bg-white/[0.05] rounded-lg p-0.5 border border-white/[0.05]">
            {[25, 50, 100].map((val) => (
              <button
                key={val}
                onClick={() => onLimitChange(val)}
                className={`px-4 py-1.5 text-[11px] font-bold transition-all rounded-md ${limit === val ? 'bg-white/[0.1] text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {val}
              </button>
            ))}
          </div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest hidden lg:inline">
            Records Per Page
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-[11px] font-mono text-slate-500 bg-white/[0.02] px-3 py-1.5 rounded-lg border border-white/[0.05]">
            MATCHED: <span className="text-white font-bold">{total}</span>
          </div>
          <div className="relative" ref={exportMenuRef}>
            <Button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-lg shadow-emerald-900/20 transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span className="text-xs font-bold tracking-tight">Export</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
            </Button>

            <AnimatePresence>
              {showExportMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-64 bg-slate-900 border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] py-2 z-[200] backdrop-blur-2xl"
                >
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:bg-white/5 flex items-center gap-3 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    comma delimited (.csv)
                  </button>
                  <button
                    onClick={() => handleExport('xls')}
                    className="w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:bg-white/5 flex items-center gap-3 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    excel 97-2003 (.xls)
                  </button>
                  <button
                    onClick={() => handleExport('xlsx')}
                    className="w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:bg-white/5 flex items-center gap-3 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-600 shadow-[0_0_8px_rgba(5,150,105,0.5)]" />
                    excel (.xlsx)
                  </button>
                  <button
                    onClick={() => handleExport('txt')}
                    className="w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:bg-white/5 flex items-center gap-3 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-slate-500 shadow-[0_0_8px_rgba(100,116,139,0.5)]" />
                    Text (.txt)
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white/[0.02] border border-white/[0.05] rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="overflow-x-auto custom-scrollbar">
          <Table>
            <TableHeader>
              <TableRow className="border-white/[0.05] bg-white/[0.03] hover:bg-white/[0.03]">
                <TableHead className="py-5 px-6 text-left whitespace-nowrap">
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">#</span>
                </TableHead>
                <TableHead className="py-5 px-6 text-left whitespace-nowrap">
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Symbol</span>
                </TableHead>
                <TableHead className="py-5 px-6 text-left whitespace-nowrap">
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Company Name</span>
                </TableHead>
                <TableHead className="py-5 px-6 text-right whitespace-nowrap">
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Price</span>
                </TableHead>
                <TableHead className="py-5 px-4 text-right whitespace-nowrap">
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">SMA 50</span>
                </TableHead>
                <TableHead className="py-5 px-4 text-right whitespace-nowrap">
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">SMA 150</span>
                </TableHead>
                <TableHead className="py-5 px-4 text-right whitespace-nowrap">
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">SMA 200</span>
                </TableHead>
                <TableHead className="py-5 px-6 text-right whitespace-nowrap">
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">RS 12M</span>
                </TableHead>
                <TableHead className="py-5 px-6 text-right whitespace-nowrap">
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Off 52W High</span>
                </TableHead>
                <TableHead className="py-5 px-6 text-right whitespace-nowrap">
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Off 52W Low</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence initial={false}>
                {data.map((stock, index) => (
                  <motion.tr
                    key={stock.symbol}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.02 }}
                    className="border-white/[0.05] hover:bg-white/[0.04] transition-all group cursor-pointer"
                  >
                    <TableCell className="py-4 px-6 text-[11px] font-mono text-slate-500 whitespace-nowrap">
                      {(page * limit + index + 1).toString().padStart(3, '0')}
                    </TableCell>
                    
                    <TableCell className="py-4 px-6 whitespace-nowrap">
                        <span className="text-sm font-black tracking-tighter text-white group-hover:text-blue-400 transition-colors" style={{ color: screenerColor }}>
                          {stock.symbol}
                        </span>
                    </TableCell>

                    <TableCell className="py-4 px-6">
                        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-tight line-clamp-1 max-w-[150px]">
                          {stock.company_name}
                        </span>
                    </TableCell>

                    <TableCell className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-bold text-white tabular-nums">
                          {formatNumber(stock.close)}
                        </span>
                        <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest text-right w-full">SAR</span>
                      </div>
                    </TableCell>

                    <TableCell className="py-4 px-4 text-right whitespace-nowrap">
                        <span className="text-[10px] font-mono font-bold text-slate-400 tabular-nums text-right">{formatNumber(stock.sma_50)}</span>
                    </TableCell>

                    <TableCell className="py-4 px-4 text-right whitespace-nowrap">
                        <span className="text-[10px] font-mono font-bold text-slate-400 tabular-nums text-right">{formatNumber(stock.sma_150)}</span>
                    </TableCell>

                    <TableCell className="py-4 px-4 text-right whitespace-nowrap">
                        <span className="text-[10px] font-mono font-bold text-slate-400 tabular-nums text-right">{formatNumber(stock.sma_200)}</span>
                    </TableCell>

                    <TableCell className="py-4 px-6 text-right whitespace-nowrap">
                      <div 
                        className="inline-flex items-center px-3 py-1.5 rounded-xl font-black text-xs shadow-inner"
                        style={{ 
                          backgroundColor: stock.rs_12m > 85 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.1)',
                          color: stock.rs_12m > 85 ? '#4ade80' : '#fbbf24'
                        }}
                      >
                        {formatNumber(stock.rs_12m, 1)}
                      </div>
                    </TableCell>

                    <TableCell className="py-4 px-6 text-right whitespace-nowrap">
                      <div className={`flex items-center justify-end gap-1.5 font-bold tabular-nums text-xs ${stock.percent_off_52w_high > -5 ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {stock.percent_off_52w_high > -5 ? <TrendingUp className="w-3 h-3" /> : null}
                        {formatPercent(stock.percent_off_52w_high)}
                      </div>
                    </TableCell>

                    <TableCell className="py-4 px-6 text-right whitespace-nowrap">
                      <div className={`flex items-center justify-end gap-1.5 font-bold tabular-nums text-xs ${stock.percent_off_52w_low > 100 ? 'text-emerald-500' : 'text-blue-500'}`}>
                        {formatPercent(stock.percent_off_52w_low)}
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-1 py-4">
        <div className="flex items-center gap-1">
           {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
             const pageNum = i; 
             return (
               <button 
                key={i}
                onClick={() => onPageChange(pageNum)}
                className={`w-10 h-10 rounded-xl text-[11px] font-black transition-all border ${page === pageNum ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-white/[0.03] border-white/[0.05] text-slate-500 hover:bg-white/[0.07] hover:border-white/[0.1]'}`}
               >
                 {pageNum + 1}
               </button>
             )
           })}
           {totalPages > 5 && <span className="px-2 text-slate-600">...</span>}
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 0}
            variant="outline"
            className="h-10 px-4 rounded-xl bg-white/[0.03] border-white/[0.05] hover:bg-white/[0.08] disabled:opacity-30 disabled:hover:bg-transparent transition-all"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            <span className="text-[11px] font-black uppercase tracking-widest">Prev</span>
          </Button>

          <Button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages - 1}
            className="h-10 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-blue-600/20 border-0 transition-all group"
          >
            <span className="text-[11px] font-black uppercase tracking-widest">Forward</span>
            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
}
