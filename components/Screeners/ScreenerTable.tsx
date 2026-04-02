'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, ChevronRight, Download, TrendingUp, ChevronDown } from 'lucide-react';
import * as XLSX from 'xlsx';

// ─── DESIGN TOKENS: Warm Cream × Forest Green ────────────────────────────────
// Page bg: #EDE8DC  |  Card bg: #FDFAF5  |  Border: #D9D2C3  |  Border-light: #E8E2D5
// Accent dark: #1C3D2E  |  Accent mid: #2D6A4F
// Text primary: #2C2416  |  secondary: #7A7060  |  muted: #A09880
// Positive: #1C7A3F bg #D4EDDA  |  Negative: #C0392B bg #FADADD
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
  data, loading, total, page, limit, onPageChange, onLimitChange, screenerColor = '#2D6A4F',
}: ScreenerTableProps) {
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

  const totalPages = Math.ceil(total / limit);

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
      const tvContent = data.map(s => `TADAWUL:${s.symbol}`).join(',');
      const link = document.createElement('a');
      link.href = URL.createObjectURL(new Blob([tvContent], { type: 'text/csv;charset=utf-8;' }));
      link.download = `${filename}_TradingView.csv`;
      link.click();
      setShowExportMenu(false);
      return;
    }

    const headers = ['Symbol', 'Company Name', 'Price', 'SMA 50', 'SMA 150', 'SMA 200', 'RS 12M', 'Off 52W High', 'Off 52W Low'];
    const rows = data.map(s => [s.symbol, s.company_name, s.close, s.sma_50, s.sma_150, s.sma_200, s.rs_12m, s.percent_off_52w_high, s.percent_off_52w_low]);
    
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
  }, [data]);

  if (loading && data.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '384px', backgroundColor: '#FDFAF5', border: '1px solid #D9D2C3', borderRadius: '20px', boxShadow: '0 1px 6px rgba(44,36,22,0.06)' }}>
        <div style={{ position: 'relative', width: '64px', height: '64px', marginBottom: '20px' }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid #E8E2D5' }} />
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid transparent', borderTopColor: '#2D6A4F', animation: 'spin 1s linear infinite' }} />
        </div>
        <p style={{ color: '#A09880', fontWeight: 500, letterSpacing: '0.05em', animation: 'pulse 2s infinite' }}>Syncing Data Assets...</p>
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* ── Control Bar ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px',
        padding: '14px 20px', backgroundColor: '#FDFAF5', border: '1px solid #D9D2C3', borderRadius: '16px',
        boxShadow: '0 1px 4px rgba(44,36,22,0.05)', position: 'relative', zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Records per page buttons */}
          <div style={{ display: 'flex', backgroundColor: '#F5F0E8', borderRadius: '10px', padding: '3px', border: '1px solid #E8E2D5' }}>
            {[25, 50, 100].map(val => (
              <button key={val} onClick={() => onLimitChange(val)} style={{
                padding: '6px 14px', fontSize: '11px', fontWeight: 700, borderRadius: '8px', border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                backgroundColor: limit === val ? '#FDFAF5' : 'transparent',
                color: limit === val ? '#2C2416' : '#A09880',
                boxShadow: limit === val ? '0 1px 3px rgba(44,36,22,0.1)' : 'none',
                borderColor: limit === val ? '#D9D2C3' : 'transparent',
                borderStyle: 'solid', borderWidth: '1px',
              }}>
                {val}
              </button>
            ))}
          </div>
          <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#A09880' }}>Records Per Page</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#7A7060', backgroundColor: '#F5F0E8', padding: '6px 12px', borderRadius: '8px', border: '1px solid #E8E2D5' }}>
            MATCHED: <span style={{ color: '#2C2416', fontWeight: 700 }}>{total}</span>
          </div>

          {/* Export button */}
          <div style={{ position: 'relative' }} ref={exportMenuRef}>
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              style={{
                height: '36px', padding: '0 16px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                backgroundColor: '#2D6A4F', color: '#D4EDDA', display: 'flex', alignItems: 'center', gap: '6px',
                fontWeight: 700, fontSize: '12px', boxShadow: '0 1px 4px rgba(28,61,46,0.3)', transition: 'all 0.2s',
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
                    width: '220px', backgroundColor: '#FDFAF5', border: '1px solid #D9D2C3', borderRadius: '16px',
                    boxShadow: '0 8px 28px rgba(44,36,22,0.12)', padding: '6px', zIndex: 200,
                  }}
                >
                  {[
                    { label: 'comma delimited (.csv)', fmt: 'csv' as const, dot: '#2D6A4F' },
                    { label: 'excel 97-2003 (.xls)', fmt: 'xls' as const, dot: '#1A5276' },
                    { label: 'excel (.xlsx)', fmt: 'xlsx' as const, dot: '#1C5C40' },
                    { label: 'Text (.txt)', fmt: 'txt' as const, dot: '#7A7060' },
                    { label: 'TradingView Symbols (.csv)', fmt: 'tv' as const, dot: '#2962FF' },
                  ].map(item => (
                    <button key={item.fmt} onClick={() => handleExport(item.fmt)} style={{
                      width: '100%', textAlign: 'left', padding: '10px 14px', fontSize: '12px', color: '#7A7060', display: 'flex', alignItems: 'center', gap: '10px',
                      border: 'none', backgroundColor: 'transparent', cursor: 'pointer', borderRadius: '10px', transition: 'background-color 0.15s',
                    }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F5F0E8')}
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
      <div style={{ backgroundColor: '#FDFAF5', border: '1px solid #D9D2C3', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 1px 6px rgba(44,36,22,0.06)' }}>
        <div style={{ overflowX: 'auto' }}>
          <Table>
            <TableHeader>
              <TableRow style={{ backgroundColor: '#F5F0E8', borderBottom: '1px solid #D9D2C3' }}>
                {['#', 'Symbol', 'Company Name', 'Price', 'SMA 50', 'SMA 150', 'SMA 200', 'RS 12M', 'Off 52W High', 'Off 52W Low'].map((h, i) => (
                  <TableHead key={h} style={{ padding: '16px 20px', textAlign: i >= 3 ? 'right' : 'left', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#A09880' }}>{h}</span>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence initial={false}>
                {data.map((stock, index) => (
                  <motion.tr
                    key={stock.symbol}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.015 }}
                    style={{ borderBottom: '1px solid #E8E2D5', cursor: 'pointer', transition: 'background-color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F5F0E8')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#FDFAF5' : '#FAF7F0')}
                  >
                    {/* Row number */}
                    <TableCell style={{ padding: '14px 20px', fontSize: '11px', fontFamily: 'monospace', color: '#A09880', whiteSpace: 'nowrap' }}>
                      {(page * limit + index + 1).toString().padStart(3, '0')}
                    </TableCell>

                    {/* Symbol */}
                    <TableCell style={{ padding: '14px 20px', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '13px', fontWeight: 900, letterSpacing: '-0.02em', color: screenerColor }}>
                        {stock.symbol}
                      </span>
                    </TableCell>

                    {/* Company name */}
                    <TableCell style={{ padding: '14px 20px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 500, color: '#7A7060', textTransform: 'uppercase', letterSpacing: '0.03em', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>
                        {stock.company_name}
                      </span>
                    </TableCell>

                    {/* Price */}
                    <TableCell style={{ padding: '14px 20px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#2C2416', fontVariantNumeric: 'tabular-nums' }}>{formatNumber(stock.close)}</span>
                        <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#A09880' }}>SAR</span>
                      </div>
                    </TableCell>

                    {/* SMAs */}
                    {[stock.sma_50, stock.sma_150, stock.sma_200].map((sma, i) => (
                      <TableCell key={i} style={{ padding: '14px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 500, color: '#7A7060', fontVariantNumeric: 'tabular-nums' }}>{formatNumber(sma)}</span>
                      </TableCell>
                    ))}

                    {/* RS 12M badge */}
                    <TableCell style={{ padding: '14px 20px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', padding: '4px 10px', borderRadius: '10px', fontSize: '12px', fontWeight: 900,
                        backgroundColor: stock.rs_12m > 85 ? '#D4EDDA' : '#FEF3C7',
                        color: stock.rs_12m > 85 ? '#1C7A3F' : '#92400E',
                        border: `1px solid ${stock.rs_12m > 85 ? '#A8D5B5' : '#FCD37A'}`,
                      }}>
                        {formatNumber(stock.rs_12m, 1)}
                      </div>
                    </TableCell>

                    {/* Off 52W High */}
                    <TableCell style={{ padding: '14px 20px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px',
                        fontWeight: 700, fontSize: '12px', fontVariantNumeric: 'tabular-nums',
                        color: stock.percent_off_52w_high > -5 ? '#C0392B' : '#1C7A3F',
                      }}>
                        {formatPercent(stock.percent_off_52w_high)}
                      </div>
                    </TableCell>

                    {/* Off 52W Low */}
                    <TableCell style={{ padding: '14px 20px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px',
                        fontWeight: 700, fontSize: '12px', fontVariantNumeric: 'tabular-nums',
                        color: stock.percent_off_52w_low > 100 ? '#1C7A3F' : '#1A5276',
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
            <button key={i} onClick={() => onPageChange(i)} style={{
              width: '36px', height: '36px', borderRadius: '10px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', border: '1px solid',
              backgroundColor: page === i ? '#1C3D2E' : '#FDFAF5',
              color: page === i ? '#D4EDDA' : '#7A7060',
              borderColor: page === i ? '#1C3D2E' : '#D9D2C3',
              boxShadow: page === i ? '0 1px 4px rgba(28,61,46,0.3)' : 'none',
            }}>
              {i + 1}
            </button>
          ))}
          {totalPages > 5 && <span style={{ padding: '0 8px', color: '#A09880', alignSelf: 'center' }}>...</span>}
        </div>

        {/* Prev / Forward */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 0}
            variant="outline"
            style={{
              height: '36px', padding: '0 16px', borderRadius: '10px', border: '1px solid #D9D2C3',
              backgroundColor: '#FDFAF5', color: '#7A7060', opacity: page === 0 ? 0.35 : 1,
              display: 'flex', alignItems: 'center', gap: '4px', cursor: page === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            <ChevronLeft style={{ width: '14px', height: '14px' }} />
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Prev</span>
          </Button>

          <Button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages - 1}
            style={{
              height: '36px', padding: '0 20px', borderRadius: '10px', border: 'none',
              backgroundColor: '#1C3D2E', color: '#D4EDDA', opacity: page >= totalPages - 1 ? 0.4 : 1,
              display: 'flex', alignItems: 'center', gap: '4px', cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
              fontWeight: 700, boxShadow: '0 1px 4px rgba(28,61,46,0.3)',
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