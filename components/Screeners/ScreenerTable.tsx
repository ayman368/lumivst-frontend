'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, ChevronRight, Download, ChevronDown, X, Loader } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { fetchBulkScreenerData } from '@/lib/utils/bulkExport';

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
  exportFileNamePrefix?: string;
  screenerName?: string;
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
  data, loading, screenerColor = '#374151', exportFileNamePrefix = 'REBH_Screeners', screenerName,
}: ScreenerTableProps) {
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(50);
  const [sortConfigs, setSortConfigs] = useState<SortConfig[]>([]);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [bulkExportLoading, setBulkExportLoading] = useState(false);
  const [bulkExportResult, setBulkExportResult] = useState<Record<string, number> | null>(null);
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

  // Auto-dismiss bulk export toast after 8 seconds
  useEffect(() => {
    if (!bulkExportResult) return;
    const timer = setTimeout(() => setBulkExportResult(null), 8000);
    return () => clearTimeout(timer);
  }, [bulkExportResult]);

  const handleSort = (key: keyof StockResult) => {
    setPage(0);
    setSortConfigs((prevConfigs) => {
      const existingConfigIndex = prevConfigs.findIndex((config) => config.key === key);

      if (existingConfigIndex === -1) {
        return [...prevConfigs, { key, direction: 'asc' }];
      }

      const currentDirection = prevConfigs[existingConfigIndex].direction;
      if (currentDirection === 'asc') {
        const newConfigs = [...prevConfigs];
        newConfigs[existingConfigIndex] = { ...newConfigs[existingConfigIndex], direction: 'desc' };
        return newConfigs;
      }

      return prevConfigs.filter((_, index) => index !== existingConfigIndex);
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

  // ── Single screener export (current tab data only) ──────────────────────────
  const handleExport = useCallback((format: 'csv' | 'xls' | 'xlsx' | 'txt' | 'tv' | 'pdf') => {
    const d = new Date();
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const plainFileName = `${exportFileNamePrefix}_${dateStr}`;
    const tvFileName = exportFileNamePrefix === 'Alrayan'
      ? `REBH_${exportFileNamePrefix}_${dateStr}_TradingView`
      : `${plainFileName}_TradingView`;

    if (format === 'tv') {
      const tvContent = sortedData.map(s => `TADAWUL:${s.symbol}`).join('\n');
      const link = document.createElement('a');
      link.href = URL.createObjectURL(new Blob([tvContent], { type: 'text/csv;charset=utf-8;' }));
      link.download = `${tvFileName}.csv`;
      link.click();
      setShowExportMenu(false);
      return;
    }

    const headers = ['Symbol', 'Company Name', 'Price', 'SMA 50', 'SMA 150', 'SMA 200', 'RS Rating', '1M', '3M', '6M', '9M', '12M', 'Off 52W High', 'Off 52W Low'];
    const rows = sortedData.map(s => [s.symbol, s.company_name, s.close, s.sma_50, s.sma_150, s.sma_200, s.rs_rating, s.rank_1m, s.rank_3m, s.rank_6m, s.rank_9m, s.rank_12m, s.percent_off_52w_high, s.percent_off_52w_low]);

    if (format === 'pdf') {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'A4' });
      doc.setFontSize(18);
      const title = screenerName ? `${exportFileNamePrefix}: ${screenerName}` : `${exportFileNamePrefix}`;
      doc.text(title, 40, 40);
      autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 60,
        theme: 'striped',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [17, 24, 39] },
      });
      doc.save(`${plainFileName}.pdf`);
      setShowExportMenu(false);
      return;
    }

    if (format === 'csv' || format === 'txt') {
      const sep = format === 'csv' ? ',' : '\t';
      const content = [headers.join(sep), ...rows.map(r => r.join(sep))].join('\n');
      const link = document.createElement('a');
      link.href = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8;' }));
      link.download = `${plainFileName}.${format}`;
      link.click();
    } else {
      const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Screener Data');
      XLSX.writeFile(wb, `${plainFileName}.${format}`, { bookType: format === 'xls' ? 'biff8' : 'xlsx' });
    }
    setShowExportMenu(false);
  }, [sortedData, exportFileNamePrefix]);

  // ── Bulk unified export (all screeners, deduplicated) ──────────────────────
  const handleBulkExport = useCallback(async (format: 'csv' | 'xlsx' | 'tv' | 'pdf') => {
    setBulkExportLoading(true);
    setBulkExportResult(null);
    setShowExportMenu(false);

    try {
      const result = await fetchBulkScreenerData();
      setBulkExportResult(result.screenerBreakdown);

      const d = new Date();
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const plainFileName = `REBH_Bulk_Unified_Export_${dateStr}`;
      const tvFileName = `REBH_Bulk_Unified_Export_${dateStr}_TradingView`;
      const exportData = result.data;

      if (format === 'tv') {
        const tvContent = result.groupedData
          .filter(group => group.items.length > 0)
          .map(group => {
            const header = `### ${group.label}: ${group.items.length} Company`;
            const symbols = group.items.map(s => `TADAWUL:${s.symbol}`).join('\n');
            return `${header}\n${symbols}`;
          }).join('\n\n');
        const link = document.createElement('a');
        link.href = URL.createObjectURL(new Blob([tvContent], { type: 'text/csv;charset=utf-8;' }));
        link.download = `${tvFileName}.csv`;
        link.click();
        return;
      }

      const headers = ['Symbol', 'Company Name', 'Price', 'SMA 50', 'SMA 150', 'SMA 200', 'RS Rating', '1M', '3M', '6M', '9M', '12M', 'Off 52W High', 'Off 52W Low'];

      if (format === 'pdf') {
        const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'A4' });
        const validGroups = result.groupedData.filter(g => g.items.length > 0);
        let startY = 30;

        doc.setFontSize(18);
        doc.text('All Screeners', 40, startY);
        startY += 20;

        for (const group of validGroups) {
          doc.setFontSize(14);
          doc.text(`${group.label}: ${group.items.length} Company`, 40, startY);
          startY += 10;

          const rows = group.items.map(s => [s.symbol, s.company_name, s.close, s.sma_50, s.sma_150, s.sma_200, s.rs_rating, s.rank_1m, s.rank_3m, s.rank_6m, s.rank_9m, s.rank_12m, s.percent_off_52w_high, s.percent_off_52w_low]);

          autoTable(doc, {
            head: [headers],
            body: rows,
            startY: startY,
            theme: 'striped',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [17, 24, 39] },
          });

          startY = (doc as any).lastAutoTable.finalY + 30;

          if (startY > doc.internal.pageSize.getHeight() - 40) {
            doc.addPage();
            startY = 40;
          }
        }

        doc.save(`${plainFileName}.pdf`);
        return;
      }

      if (format === 'csv') {
        let content = '';
        const validGroups = result.groupedData.filter(g => g.items.length > 0);
        for (const group of validGroups) {
          content += `${group.label}: ${group.items.length} Company\n`;
          content += headers.join(',') + '\n';
          const rows = group.items.map(s => [s.symbol, s.company_name, s.close, s.sma_50, s.sma_150, s.sma_200, s.rs_rating, s.rank_1m, s.rank_3m, s.rank_6m, s.rank_9m, s.rank_12m, s.percent_off_52w_high, s.percent_off_52w_low]);
          content += rows.map(r => r.join(',')).join('\n') + '\n\n';
        }
        content = content.trimEnd();
        const link = document.createElement('a');
        link.href = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8;' }));
        link.download = `${plainFileName}.csv`;
        link.click();
      } else {
        let aoa: any[][] = [];
        const validGroups = result.groupedData.filter(g => g.items.length > 0);
        for (const group of validGroups) {
          aoa.push([`${group.label}: ${group.items.length} Company`]);
          aoa.push(headers);
          const rows = group.items.map(s => [s.symbol, s.company_name, s.close, s.sma_50, s.sma_150, s.sma_200, s.rs_rating, s.rank_1m, s.rank_3m, s.rank_6m, s.rank_9m, s.rank_12m, s.percent_off_52w_high, s.percent_off_52w_low]);
          aoa.push(...rows);
          aoa.push([]); // empty row for spacing
        }
        const ws = XLSX.utils.aoa_to_sheet(aoa);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Bulk Export');
        XLSX.writeFile(wb, `${plainFileName}.xlsx`, { bookType: 'xlsx' });
      }
    } catch (error) {
      console.error('Error during bulk export:', error);
    } finally {
      setBulkExportLoading(false);
    }
  }, []);

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

          {/* ── Export Dropdown ── */}
          <div style={{ position: 'relative' }} ref={exportMenuRef}>
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              style={{
                height: '36px', padding: '0 16px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                backgroundColor: '#111827', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px',
                fontWeight: 700, fontSize: '12px', transition: 'all 0.2s',
              }}
            >
              {bulkExportLoading ? (
                <Loader key="loader" style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} />
              ) : (
                <Download key="download" style={{ width: '14px', height: '14px' }} />
              )}
              <span>{bulkExportLoading ? 'Exporting...' : 'Export'}</span>
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
                    width: '240px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px',
                    boxShadow: '0 8px 28px rgba(0,0,0,0.12)', padding: '6px', zIndex: 200,
                  }}
                >
                  {/* ── Section label: This screener ── */}
                  <div style={{ padding: '6px 14px 4px', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#9CA3AF' }}>
                    This Screener
                  </div>

                  {[
                    { label: 'comma delimited (.csv)', fmt: 'csv' as const, dot: '#111827' },
                    { label: 'excel 97-2003 (.xls)', fmt: 'xls' as const, dot: '#1A5276' },
                    { label: 'excel (.xlsx)', fmt: 'xlsx' as const, dot: '#15803D' },
                    { label: 'Text (.txt)', fmt: 'txt' as const, dot: '#6B7280' },
                    { label: 'TradingView Symbols (.csv)', fmt: 'tv' as const, dot: '#2962FF' },
                    { label: 'PDF Document (.pdf)', fmt: 'pdf' as const, dot: '#DC2626' },
                  ].map(item => (
                    <button key={item.fmt} onClick={() => handleExport(item.fmt)} style={{
                      width: '100%', textAlign: 'left', padding: '9px 14px', fontSize: '12px', color: '#4B5563', display: 'flex', alignItems: 'center', gap: '10px',
                      border: 'none', backgroundColor: 'transparent', cursor: 'pointer', borderRadius: '10px', transition: 'background-color 0.15s',
                    }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: item.dot, flexShrink: 0 }} />
                      {item.label}
                    </button>
                  ))}

                  {/* ── Divider ── */}
                  <div style={{ height: '1px', backgroundColor: '#E5E7EB', margin: '6px 0' }} />

                  {/* ── Section label: Bulk export ── */}
                  <div style={{ padding: '4px 14px 4px', fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#059669' }}>
                    Bulk Unified Export — All Screeners
                  </div>

                  {[
                    { label: 'Bulk Export (.csv)', fmt: 'csv' as const },
                    { label: 'Bulk Export (.xlsx)', fmt: 'xlsx' as const },
                    { label: 'Bulk TradingView (.csv)', fmt: 'tv' as const },
                    { label: 'Bulk Export (.pdf)', fmt: 'pdf' as const },
                  ].map(item => (
                    <button
                      key={`bulk-${item.fmt}`}
                      onClick={() => handleBulkExport(item.fmt)}
                      disabled={bulkExportLoading}
                      style={{
                        width: '100%', textAlign: 'left', padding: '9px 14px', fontSize: '12px',
                        color: bulkExportLoading ? '#D1D5DB' : '#059669',
                        display: 'flex', alignItems: 'center', gap: '10px',
                        border: 'none', backgroundColor: 'transparent',
                        cursor: bulkExportLoading ? 'not-allowed' : 'pointer',
                        borderRadius: '10px', transition: 'background-color 0.15s', fontWeight: 600,
                      }}
                      onMouseEnter={e => !bulkExportLoading && (e.currentTarget.style.backgroundColor = '#F0FDF4')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {bulkExportLoading ? (
                        <Loader style={{ width: '11px', height: '11px', animation: 'spin 1s linear infinite', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#059669', flexShrink: 0 }} />
                      )}
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
                {COLUMN_DEFS.map((col) => {
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
                        borderBottom: isSorted ? '2px solid #111827' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <span style={{
                          fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em',
                          color: isSorted ? '#111827' : '#9CA3AF',
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
                            fontSize: '9px', fontWeight: 900, borderRadius: '50%', flexShrink: 0,
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

      {/* ── Bulk Export Result Toast ── */}
      <AnimatePresence>
        {bulkExportResult && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            style={{
              position: 'fixed', bottom: '24px', right: '24px',
              backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '16px',
              boxShadow: '0 12px 32px rgba(0,0,0,0.15)', padding: '20px', zIndex: 300,
              maxWidth: '360px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
                  ✓ Bulk Export Complete
                </div>
                <div style={{ fontSize: '12px', color: '#4B5563', lineHeight: 1.7 }}>
                  {Object.entries(bulkExportResult).map(([label, count]) => (
                    <div key={label}>
                      <strong>{label}:</strong> {count} Company
                    </div>
                  ))}
                  <div style={{ marginTop: '8px', fontWeight: 700, color: '#059669' }}>
                    Total: {Object.values(bulkExportResult).reduce((a, b) => a + b, 0)} unique Company
                  </div>
                </div>
              </div>
              <button
                onClick={() => setBulkExportResult(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0', color: '#9CA3AF' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#111827')}
                onMouseLeave={e => (e.currentTarget.style.color = '#9CA3AF')}
              >
                <X style={{ width: '18px', height: '18px' }} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}