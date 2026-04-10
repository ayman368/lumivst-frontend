'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, ChevronRight, Download, TrendingUp, ChevronDown } from 'lucide-react';
import * as XLSX from 'xlsx';

// ─── DESIGN TOKENS: Black & White ────────────────────────────────
// Page bg: #FFFFFF  |  Card bg: #FFFFFF  |  Border: #E5E7EB  |  Border-light: #F3F4F6
// Accent dark: #111827  |  Accent mid: #374151
// Text primary: #111827  |  secondary: #4B5563  |  muted: #9CA3AF
// Positive: #15803D bg #DCFCE7  |  Negative: #B91C1C bg #FEE2E2
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

interface ScreenerTableProps {
  data: StockResult[];
  loading: boolean;
  screenerColor?: string;
}

type SortDirection = 'asc' | 'desc';
interface SortConfig {
  key: keyof StockResult;
  direction: SortDirection;
}

const COLUMN_DEFS: { key: keyof StockResult | '#'; label: string; sortable: boolean }[] = [
  { key: '#', label: '#', sortable: false },
  { key: 'symbol', label: 'Symbol', sortable: true },
  { key: 'company_name', label: 'Company Name', sortable: true },
  { key: 'close', label: 'Price', sortable: true },
  { key: 'sma_50', label: 'SMA 50', sortable: true },
  { key: 'sma_150', label: 'SMA 150', sortable: true },
  { key: 'sma_200', label: 'SMA 200', sortable: true },
  { key: 'rs_rating', label: 'RS Rating', sortable: true },
  { key: 'rank_1m', label: '1M', sortable: true },
  { key: 'rank_3m', label: '3M', sortable: true },
  { key: 'rank_6m', label: '6M', sortable: true },
  { key: 'rank_9m', label: '9M', sortable: true },
  { key: 'rank_12m', label: '12M', sortable: true },
  { key: 'percent_off_52w_high', label: 'Off 52W High', sortable: true },
  { key: 'percent_off_52w_low', label: 'Off 52W Low', sortable: true },
];

export default function ScreenerTable({
  data, loading, screenerColor = '#374151',
}: ScreenerTableProps) {
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(50);
  const [sortConfigs, setSortConfigs] = useState<SortConfig[]>([]);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node))
        setShowExportMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Reset page when data changes
  useEffect(() => {
    setPage(0);
  }, [data]);

  const handleSort = (key: keyof StockResult) => {
    setSortConfigs((prevConfigs) => {
      const existingConfigIndex = prevConfigs.findIndex((config) => config.key === key);
      const isShiftPressed = (window.event as MouseEvent)?.shiftKey;

      if (!isShiftPressed) {
        if (existingConfigIndex !== -1) {
          const currentDirection = prevConfigs[existingConfigIndex].direction;
          if (currentDirection === 'desc') {
            return []; // Third click removes single sort
          }
          return [{ key, direction: 'desc' }]; // Toggle to desc
        }
        return [{ key, direction: 'asc' }]; // First click asc
      }

      const newConfigs = [...prevConfigs];
      if (existingConfigIndex !== -1) {
        const currentDirection = newConfigs[existingConfigIndex].direction;
        if (currentDirection === 'desc') {
          newConfigs.splice(existingConfigIndex, 1);
        } else {
          newConfigs[existingConfigIndex].direction = 'desc';
        }
      } else {
        newConfigs.push({ key, direction: 'asc' });
      }
      return newConfigs;
    });
  };

  const sortedData = React.useMemo(() => {
    if (sortConfigs.length === 0) return data;
    return [...data].sort((a: any, b: any) => {
      for (let i = 0; i < sortConfigs.length; i++) {
        const { key, direction } = sortConfigs[i];
        let valA = a[key] ?? -Infinity;
        let valB = b[key] ?? -Infinity;

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return direction === 'asc' ? -1 : 1;
        if (valA > valB) return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfigs]);

  const total = sortedData.length;
  const totalPages = Math.ceil(total / limit);
  const paginatedData = sortedData.slice(page * limit, page * limit + limit);

  const formatNumber = (v: number | null | undefined, d = 2) => {
    if (v === null || v === undefined) return 'N/A';
    return v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
  };

  const formatPercent = (v: number | null | undefined) => {
    if (v === null || v === undefined) return '0.00%';
    const val = v.toFixed(2);
    return `${parseFloat(val) > 0 ? '+' : ''}${val}%`;
  };

  const handleExport = useCallback((format: 'csv' | 'xls' | 'xlsx' | 'txt' | 'tv') => {
    const d = new Date();
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const filename = `REBH_Screeners_${dateStr}`;

    if (format === 'tv') {
      const tvContent = sortedData.map(s => `TADAWUL:${s.symbol}`).join('\n');
      const link = document.createElement('a');
      link.href = URL.createObjectURL(new Blob([tvContent], { type: 'text/csv;charset=utf-8;' }));
      link.download = `${filename}_TradingView.csv`;
      link.click();
      setShowExportMenu(false);
      return;
    }

    const headers = ['Symbol', 'Company Name', 'Price', 'SMA 50', 'SMA 150', 'SMA 200', 'RS Rating', '1M', '3M', '6M', '9M', '12M', 'Off 52W High', 'Off 52W Low'];
    const rows = sortedData.map(s => [s.symbol, s.company_name, s.close, s.sma_50, s.sma_150, s.sma_200, s.rs_rating, s.rank_1m, s.rank_3m, s.rank_6m, s.rank_9m, s.rank_12m, s.percent_off_52w_high, s.percent_off_52w_low]);
    
    if (format === 'csv' || format === 'txt') {
      const sep = format === 'csv' ? ',' : '\t';
      const content = [headers.join(sep), ...rows.map(r => r.join(sep))].join('\n');
      const link = document.createElement('a');
      link.href = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8;' }));
      link.download = `${filename}.${format}`;
      link.click();
    } else {
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Screener Data');
      XLSX.writeFile(wb, `${filename}.${format}`, { bookType: format === 'xls' ? 'biff8' : 'xlsx' });
    }
    setShowExportMenu(false);
  }, [sortedData]);

  if (loading && data.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '384px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '20px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
        <div style={{ position: 'relative', width: '64px', height: '64px', marginBottom: '20px' }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid #F3F4F6' }} />
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid transparent', borderTopColor: '#374151', animation: 'spin 1s linear infinite' }} />
        </div>
        <p style={{ color: '#9CA3AF', fontWeight: 500, letterSpacing: '0.05em', animation: 'pulse 2s infinite' }}>Syncing Data Assets...</p>
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ── Control Bar ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px',
        padding: '14px 20px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)', position: 'relative', zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Records per page buttons */}
          <div style={{ display: 'flex', backgroundColor: '#F9FAFB', borderRadius: '10px', padding: '3px', border: '1px solid #F3F4F6' }}>
            {[25, 50, 100].map(val => (
              <button key={val} onClick={() => { setLimit(val); setPage(0); }} style={{
                padding: '6px 14px', fontSize: '11px', fontWeight: 700, borderRadius: '8px', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                backgroundColor: limit === val ? '#FFFFFF' : 'transparent',
                color: limit === val ? '#111827' : '#9CA3AF',
                boxShadow: limit === val ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                borderColor: limit === val ? '#E5E7EB' : 'transparent',
                borderStyle: 'solid', borderWidth: '1px',
              }}>
                {val}
              </button>
            ))}
          </div>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#9CA3AF' }}>Records Per Page</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#4B5563', backgroundColor: '#F9FAFB', padding: '6px 12px', borderRadius: '8px', border: '1px solid #F3F4F6' }}>
            MATCHED: <span style={{ color: '#111827', fontWeight: 700 }}>{total}</span>
          </div>

          {/* Export button */}
          <div style={{ position: 'relative' }} ref={exportMenuRef}>
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              style={{
                height: '36px', padding: '0 16px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                backgroundColor: '#111827', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px',
                fontWeight: 700, fontSize: '12px', transition: 'all 0.2s',
              }}
            >
              <Download style={{ width: '14px', height: '14px' }} />
              Export
              <ChevronDown style={{ width: '12px', height: '12px', transform: showExportMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            <AnimatePresence>
              {showExportMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                    width: '220px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px',
                    boxShadow: '0 8px 28px rgba(0,0,0,0.12)', padding: '6px', zIndex: 200,
                  }}
                >
                  {[
                    { label: 'comma delimited (.csv)', fmt: 'csv' as const, dot: '#111827' },
                    { label: 'excel 97-2003 (.xls)', fmt: 'xls' as const, dot: '#1A5276' },
                    { label: 'excel (.xlsx)', fmt: 'xlsx' as const, dot: '#15803D' },
                    { label: 'Text (.txt)', fmt: 'txt' as const, dot: '#6B7280' },
                    { label: 'TradingView Symbols (.csv)', fmt: 'tv' as const, dot: '#2962FF' },
                  ].map(item => (
                    <button key={item.fmt} onClick={() => handleExport(item.fmt)} style={{
                      width: '100%', textAlign: 'left', padding: '10px 14px', fontSize: '12px', color: '#4B5563', display: 'flex', alignItems: 'center', gap: '10px',
                      border: 'none', backgroundColor: 'transparent', cursor: 'pointer', borderRadius: '10px', transition: 'background-color 0.15s',
                    }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.dot, flexShrink: 0 }} />
                      {item.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Main Table ── */}
      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
        <div style={{ overflowX: 'auto' }}>
          <Table>
            <TableHeader>
              <TableRow style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                {COLUMN_DEFS.map((col, i) => {
                  const sortIndex = sortConfigs.findIndex(config => config.key === col.key);
                  const isSorted = sortIndex !== -1;
                  const sortPriority = sortIndex + 1;
                  const sortDir = isSorted ? sortConfigs[sortIndex].direction : null;

                  return (
                    <TableHead 
                      key={col.key} 
                      onClick={() => col.sortable && handleSort(col.key as keyof StockResult)}
                      style={{ 
                        padding: '16px 20px', 
                        textAlign: 'center', 
                        whiteSpace: 'nowrap',
                        cursor: col.sortable ? 'pointer' : 'default',
                        userSelect: 'none',
                        backgroundColor: isSorted ? '#F3F4F6' : 'transparent',
                        borderBottom: isSorted ? '2px solid #111827' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <span style={{ 
                          fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', 
                          color: isSorted ? '#111827' : '#9CA3AF' 
                        }}>
                          {col.label}
                        </span>
                        
                        {col.sortable && (
                          <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '2px', lineHeight: 1 }}>
                            {isSorted ? (
                              <span style={{ fontSize: '10px', fontWeight: 900, color: '#111827' }}>
                                {sortDir === 'asc' ? '▲' : '▼'}
                              </span>
                            ) : (
                              <span style={{ fontSize: '7px', color: '#9CA3AF', opacity: 0.5, display: 'block', lineHeight: 1 }}>
                                ▲<br />▼
                              </span>
                            )}
                          </div>
                        )}
                        
                        {isSorted && (
                          <span style={{ 
                            marginLeft: '4px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', 
                            width: '14px', height: '14px', backgroundColor: '#111827', color: '#FFFFFF', 
                            fontSize: '9px', fontWeight: 900, borderRadius: '50%', flexShrink: 0 
                          }}>
                            {sortPriority}
                          </span>
                        )}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence initial={false}>
                {paginatedData.map((stock, index) => (
                  <motion.tr
                    key={stock.symbol}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.015 }}
                    style={{ borderBottom: '1px solid #F3F4F6', cursor: 'pointer', transition: 'background-color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#FFFFFF' : '#F9FAFB')}
                  >
                    {/* Row number */}
                    <TableCell style={{ padding: '14px 20px', fontSize: '11px', fontFamily: 'monospace', color: '#9CA3AF', whiteSpace: 'nowrap' }}>
                      {(page * limit + index + 1).toString().padStart(3, '0')}
                    </TableCell>

                    {/* Symbol */}
                    <TableCell style={{ padding: '14px 20px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '13px', fontWeight: 900, letterSpacing: '-0.02em', color: screenerColor }}>
                        {stock.symbol}
                      </span>
                    </TableCell>

                    {/* Company name */}
                    <TableCell style={{ padding: '14px 20px', textAlign: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: 500, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.03em', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px', margin: '0 auto' }}>
                        {stock.company_name}
                      </span>
                    </TableCell>

                    {/* Price */}
                    <TableCell style={{ padding: '14px 20px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827', fontVariantNumeric: 'tabular-nums' }}>{formatNumber(stock.close)}</span>
                        <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#9CA3AF' }}>SAR</span>
                      </div>
                    </TableCell>

                    {/* SMAs */}
                    {[stock.sma_50, stock.sma_150, stock.sma_200].map((sma, i) => (
                      <TableCell key={i} style={{ padding: '14px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 500, color: '#4B5563', fontVariantNumeric: 'tabular-nums' }}>{formatNumber(sma)}</span>
                      </TableCell>
                    ))}

                    {/* RS Rating badge */}
                    <TableCell style={{ padding: '14px 20px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                        <span className={`font-bold ${(stock.rs_rating || 0) >= 80 ? 'text-green-600' : (stock.rs_rating || 0) >= 70 ? 'text-yellow-600' : 'text-gray-500'}`}>
                          {stock.rs_rating !== undefined && stock.rs_rating !== null ? Math.round(stock.rs_rating) : '-'}
                        </span>
                      </div>
                    </TableCell>

                    {/* Additional RS timeframes */}
                    {[stock.rank_1m, stock.rank_3m, stock.rank_6m, stock.rank_9m, stock.rank_12m].map((rank, i) => (
                      <TableCell key={`rank-${i}`} style={{ padding: '14px 20px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <span className={`font-bold ${(rank || 0) >= 80 ? 'text-green-600' : (rank || 0) >= 70 ? 'text-yellow-600' : 'text-gray-500'}`}>
                          {rank !== undefined && rank !== null ? Math.round(rank) : '-'}
                        </span>
                      </TableCell>
                    ))}

                    {/* Off 52W High */}
                    <TableCell style={{ padding: '14px 20px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                        fontWeight: 700, fontSize: '12px', fontVariantNumeric: 'tabular-nums',
                        color: stock.percent_off_52w_high > -5 ? '#B91C1C' : '#15803D',
                      }}>
                        {formatPercent(stock.percent_off_52w_high)}
                      </div>
                    </TableCell>

                    {/* Off 52W Low */}
                    <TableCell style={{ padding: '14px 20px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                        fontWeight: 700, fontSize: '12px', fontVariantNumeric: 'tabular-nums',
                        color: stock.percent_off_52w_low > 100 ? '#15803D' : '#0369A1',
                      }}>
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

      {/* ── Pagination ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', padding: '4px 0' }}>
        {/* Page number pills */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => (
            <button key={i} onClick={() => setPage(i)} style={{
              width: '36px', height: '36px', borderRadius: '10px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', border: '1px solid',
              backgroundColor: page === i ? '#111827' : '#FFFFFF',
              color: page === i ? '#FFFFFF' : '#6B7280',
              borderColor: page === i ? '#111827' : '#E5E7EB',
            }}>
              {i + 1}
            </button>
          ))}
          {totalPages > 5 && <span style={{ padding: '0 8px', color: '#9CA3AF', alignSelf: 'center' }}>...</span>}
        </div>

        {/* Prev / Forward */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            onClick={() => setPage(page - 1)}
            disabled={page === 0}
            variant="outline"
            style={{
              height: '36px', padding: '0 16px', borderRadius: '10px', border: '1px solid #E5E7EB',
              backgroundColor: '#FFFFFF', color: '#4B5563', opacity: page === 0 ? 0.35 : 1,
              display: 'flex', alignItems: 'center', gap: '4px', cursor: page === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            <ChevronLeft style={{ width: '14px', height: '14px' }} />
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Prev</span>
          </Button>

          <Button
            onClick={() => setPage(page + 1)}
            disabled={page >= totalPages - 1}
            style={{
              height: '36px', padding: '0 20px', borderRadius: '10px', border: 'none',
              backgroundColor: '#111827', color: '#FFFFFF', opacity: page >= totalPages - 1 ? 0.4 : 1,
              display: 'flex', alignItems: 'center', gap: '4px', cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
              fontWeight: 700,
            }}
          >
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Forward</span>
            <ChevronRight style={{ width: '14px', height: '14px' }} />
          </Button>
        </div>
      </div>
    </div>
  );
}