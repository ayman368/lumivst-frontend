'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, ChevronRight, Download, ChevronDown, X, Loader, Check, FileText, FileSpreadsheet, FileDown, TrendingUp } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { fetchBulkScreenerData } from '@/lib/utils/bulkExport';
import { buildShariahMap } from '@/lib/watchlist/shariah';
import { API_BASE_URL } from '@/lib/api/config';
import { authFetch } from '@/lib/api/authFetch';

// ─── TYPES ──────────────────────────────────────────────────────────
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

// ─── EXPORT FORMATS ──────────────────────────────────────────────
type CurrentViewFormat = 'csv' | 'xls' | 'xlsx' | 'txt' | 'tv' | 'pdf';
type BulkFormat = 'csv' | 'xlsx' | 'tv' | 'pdf';
type ExportScope = 'current' | 'bulk';

const CURRENT_VIEW_FORMATS: { value: CurrentViewFormat; label: string; icon: React.ElementType }[] = [
  { value: 'xlsx', label: 'Excel (.xlsx)', icon: FileSpreadsheet },
  { value: 'csv', label: 'CSV (.csv)', icon: FileText },
  { value: 'xls', label: 'Excel 97–2003 (.xls)', icon: FileSpreadsheet },
  { value: 'txt', label: 'Text (.txt)', icon: FileText },
  { value: 'tv', label: 'TradingView symbols', icon: TrendingUp },
  { value: 'pdf', label: 'PDF document', icon: FileDown },
];

const BULK_FORMATS: { value: BulkFormat; label: string; icon: React.ElementType }[] = [
  { value: 'xlsx', label: 'Excel (.xlsx)', icon: FileSpreadsheet },
  { value: 'csv', label: 'CSV (.csv)', icon: FileText },
  { value: 'tv', label: 'TradingView symbols', icon: TrendingUp },
  { value: 'pdf', label: 'PDF document', icon: FileDown },
];

// ─── CONSTANTS ────────────────────────────────────────────────────
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

const DESIRED_ORDER = [
  'Trend - 5 Months',
  'Trend - 4 Months',
  'Trend - 2 Months',
  'Trend - 1 Month',
  'Trend - 5 Months Wide',
  'Alhussain',
  'Alrayan',
  'RSI Momentum',
  'Power Play'
];

// ─── COMPONENT ────────────────────────────────────────────────────
export default function ScreenerTable({
  data, loading, screenerColor = '#374151', exportFileNamePrefix = 'REBH_Screeners', screenerName,
}: ScreenerTableProps) {
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(50);
  const [sortConfigs, setSortConfigs] = useState<SortConfig[]>([]);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [bulkExportLoading, setBulkExportLoading] = useState(false);
  const [bulkExportResult, setBulkExportResult] = useState<Record<string, number> | null>(null);

  // New export state (matching CompositePage)
  const [exportScope, setExportScope] = useState<ExportScope>('current');
  const [exportFormat, setExportFormat] = useState<CurrentViewFormat | BulkFormat>('xlsx');
  const [shariahOnly, setShariahOnly] = useState(false);

  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node))
        setShowExportMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    setPage(0);
  }, [data]);

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

  // ── Scope change handler ──
  const handleScopeChange = useCallback((scope: ExportScope) => {
    setExportScope(scope);
    const validValues = (scope === 'current' ? CURRENT_VIEW_FORMATS : BULK_FORMATS).map(f => f.value);
    if (!validValues.includes(exportFormat as any)) {
      setExportFormat('xlsx');
    }
  }, [exportFormat]);

  // ── Single screener export (current tab data only) ──
  const handleExport = useCallback((format: CurrentViewFormat) => {
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
  }, [sortedData, exportFileNamePrefix, screenerName]);

  // ── Bulk unified export ──
  const handleBulkExport = useCallback(async (format: BulkFormat, shariahOnlyFlag?: boolean) => {
    setBulkExportLoading(true);
    setBulkExportResult(null);
    setShowExportMenu(false);

    try {
      const result = await fetchBulkScreenerData();

      const d = new Date();
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const plainFileName = shariahOnlyFlag ? `REBH_Bulk_Unified_Export_Shariah_${dateStr}` : `REBH_Bulk_Unified_Export_${dateStr}`;
      const tvFileName = shariahOnlyFlag ? `REBH_Bulk_Unified_Export_Shariah_${dateStr}_TradingView` : `REBH_Bulk_Unified_Export_${dateStr}_TradingView`;

      let sortedGroupedData = [...result.groupedData].sort((a, b) => {
        const idxA = DESIRED_ORDER.indexOf(a.label);
        const idxB = DESIRED_ORDER.indexOf(b.label);
        return (idxA !== -1 ? idxA : 99) - (idxB !== -1 ? idxB : 99);
      });

      if (shariahOnlyFlag) {
        try {
          const res = await authFetch(`${API_BASE_URL}/api/prices/latest?limit=1000`, {
            credentials: 'include',
            cache: 'no-store',
          });
          const json = await res.json();
          const { bySymbol } = buildShariahMap(json.data || []);

          sortedGroupedData = sortedGroupedData.map(group => ({
            ...group,
            items: group.items.filter(item => {
              const status = bySymbol.get(String(item.symbol)) || '';
              return status.includes('متوافق') || status.includes('نقي');
            })
          }));
        } catch (err) {
          console.error("Failed to apply shariah filter", err);
        }
      }

      const newBreakdown: Record<string, number> = {};
      for (const g of sortedGroupedData) {
        newBreakdown[g.label] = g.items.length;
      }
      setBulkExportResult(newBreakdown);

      if (format === 'tv') {
        const tvContent = sortedGroupedData
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
        const validGroups = sortedGroupedData.filter(g => g.items.length > 0);
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
        const validGroups = sortedGroupedData.filter(g => g.items.length > 0);
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
        const validGroups = sortedGroupedData.filter(g => g.items.length > 0);
        for (const group of validGroups) {
          aoa.push([`${group.label}: ${group.items.length} Company`]);
          aoa.push(headers);
          const rows = group.items.map(s => [s.symbol, s.company_name, s.close, s.sma_50, s.sma_150, s.sma_200, s.rs_rating, s.rank_1m, s.rank_3m, s.rank_6m, s.rank_9m, s.rank_12m, s.percent_off_52w_high, s.percent_off_52w_low]);
          aoa.push(...rows);
          aoa.push([]);
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

  // ── Single confirm action ──
  const handleExportConfirm = useCallback(() => {
    if (exportScope === 'current') {
      handleExport(exportFormat as CurrentViewFormat);
    } else {
      handleBulkExport(exportFormat as BulkFormat, shariahOnly);
    }
  }, [exportScope, exportFormat, shariahOnly, handleExport, handleBulkExport]);

  const activeFormatList = exportScope === 'current' ? CURRENT_VIEW_FORMATS : BULK_FORMATS;

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

          {/* ── NEW Export Dropdown (same as CompositePage) ── */}
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
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.97 }}
                  transition={{ duration: 0.14 }}
                  style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                    width: '260px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '12px',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.12)', padding: '12px', zIndex: 200,
                  }}
                >
                  {/* ── Scope segmented control ── */}
                  <div style={{ display: 'flex', gap: 4, padding: 3, backgroundColor: '#F3F4F6', borderRadius: 8, marginBottom: 12 }}>
                    <button
                      onClick={() => handleScopeChange('current')}
                      style={{
                        flex: 1,
                        padding: '6px 0',
                        borderRadius: 6,
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 600,
                        transition: 'background-color 0.15s, color 0.15s',
                        backgroundColor: exportScope === 'current' ? '#FFFFFF' : 'transparent',
                        color: exportScope === 'current' ? '#111827' : '#6B7280',
                        boxShadow: exportScope === 'current' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                      }}
                    >
                      Current View
                    </button>
                    <button
                      onClick={() => handleScopeChange('bulk')}
                      style={{
                        flex: 1,
                        padding: '6px 0',
                        borderRadius: 6,
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 600,
                        transition: 'background-color 0.15s, color 0.15s',
                        backgroundColor: exportScope === 'bulk' ? '#FFFFFF' : 'transparent',
                        color: exportScope === 'bulk' ? '#111827' : '#6B7280',
                        boxShadow: exportScope === 'bulk' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                      }}
                    >
                      All Screeners
                    </button>
                  </div>

                  {/* ── Format list ── */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: exportScope === 'bulk' ? 10 : 14 }}>
                    {activeFormatList.map((opt) => {
                      const selected = exportFormat === opt.value;
                      const Icon = opt.icon;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setExportFormat(opt.value)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            width: '100%',
                            padding: '8px 10px',
                            borderRadius: 8,
                            border: '1px solid transparent',
                            backgroundColor: selected ? '#F9FAFB' : 'transparent',
                            borderColor: selected ? '#111827' : 'transparent',
                            cursor: 'pointer',
                            textAlign: 'left',
                            transition: 'background-color 0.12s, border-color 0.12s',
                          }}
                        >
                          <Icon size={15} color={selected ? '#111827' : '#9CA3AF'} />
                          <span style={{ fontSize: 12.5, fontWeight: selected ? 600 : 500, color: selected ? '#111827' : '#4B5563', flex: 1 }}>
                            {opt.label}
                          </span>
                          {selected && <Check size={14} color="#111827" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* ── Shariah toggle (bulk only) ── */}
                  {exportScope === 'bulk' && (
                    <button
                      onClick={() => setShariahOnly((s) => !s)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
                        padding: '8px 10px', borderRadius: 8, border: '1px solid #E5E7EB', backgroundColor: '#FAFBFC',
                        marginBottom: 12, cursor: 'pointer',
                      }}
                    >
                      <span style={{ fontSize: 12, fontWeight: 500, color: '#374151' }}>Shariah-compliant only</span>
                      <div
                        style={{
                          width: 32, height: 18, borderRadius: 99,
                          backgroundColor: shariahOnly ? '#059669' : '#D1D5DB',
                          position: 'relative', transition: 'background-color 0.15s', flexShrink: 0,
                        }}
                      >
                        <div
                          style={{
                            width: 14, height: 14, borderRadius: '50%', backgroundColor: '#FFFFFF',
                            position: 'absolute', top: 2, left: shariahOnly ? 16 : 2, transition: 'left 0.15s',
                          }}
                        />
                      </div>
                    </button>
                  )}

                  {/* ── Confirm ── */}
                  <button
                    onClick={handleExportConfirm}
                    disabled={bulkExportLoading}
                    style={{
                      width: '100%', padding: '10px 0', borderRadius: 8, border: 'none',
                      backgroundColor: '#111827', color: '#FFFFFF', fontWeight: 600, fontSize: 12.5,
                      cursor: bulkExportLoading ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      opacity: bulkExportLoading ? 0.6 : 1, transition: 'opacity 0.15s',
                    }}
                  >
                    {bulkExportLoading ? (
                      <>
                        <Loader style={{ width: 13, height: 13, animation: 'spin 1s linear infinite' }} />
                        Exporting…
                      </>
                    ) : (
                      <>
                        <Download size={13} />
                        Export
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Rest of the table (unchanged) ── */}
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
                    <TableCell style={{ padding: '14px 20px', fontSize: '11px', fontFamily: 'monospace', color: '#9CA3AF', whiteSpace: 'nowrap' }}>
                      {(page * limit + index + 1).toString().padStart(3, '0')}
                    </TableCell>
                    <TableCell style={{ padding: '14px 20px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <span style={{ fontSize: '13px', fontWeight: 900, letterSpacing: '-0.02em', color: screenerColor }}>
                        {stock.symbol}
                      </span>
                    </TableCell>
                    <TableCell style={{ padding: '14px 20px', textAlign: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: 500, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.03em', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px', margin: '0 auto' }}>
                        {stock.company_name}
                      </span>
                    </TableCell>
                    <TableCell style={{ padding: '14px 20px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#111827', fontVariantNumeric: 'tabular-nums' }}>{formatNumber(stock.close)}</span>
                        <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#9CA3AF' }}>SAR</span>
                      </div>
                    </TableCell>
                    {[stock.sma_50, stock.sma_150, stock.sma_200].map((sma, i) => (
                      <TableCell key={i} style={{ padding: '14px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 500, color: '#4B5563', fontVariantNumeric: 'tabular-nums' }}>{formatNumber(sma)}</span>
                      </TableCell>
                    ))}
                    <TableCell style={{ padding: '14px 20px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                        <span className={`font-bold ${(stock.rs_rating || 0) >= 80 ? 'text-green-600' : (stock.rs_rating || 0) >= 70 ? 'text-yellow-600' : 'text-gray-500'}`}>
                          {stock.rs_rating !== undefined && stock.rs_rating !== null ? Math.round(stock.rs_rating) : '-'}
                        </span>
                      </div>
                    </TableCell>
                    {[stock.rank_1m, stock.rank_3m, stock.rank_6m, stock.rank_9m, stock.rank_12m].map((rank, i) => (
                      <TableCell key={`rank-${i}`} style={{ padding: '14px 20px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <span className={`font-bold ${(rank || 0) >= 80 ? 'text-green-600' : (rank || 0) >= 70 ? 'text-yellow-600' : 'text-gray-500'}`}>
                          {rank !== undefined && rank !== null ? Math.round(rank) : '-'}
                        </span>
                      </TableCell>
                    ))}
                    <TableCell style={{ padding: '14px 20px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                        fontWeight: 700, fontSize: '12px', fontVariantNumeric: 'tabular-nums',
                        color: stock.percent_off_52w_high > -5 ? '#B91C1C' : '#15803D',
                      }}>
                        {formatPercent(stock.percent_off_52w_high)}
                      </div>
                    </TableCell>
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

      {/* ── Bulk Export Result Toast (unchanged) ── */}
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
                  {Object.entries(bulkExportResult)
                    .sort(([labelA], [labelB]) => {
                      const idxA = DESIRED_ORDER.indexOf(labelA);
                      const idxB = DESIRED_ORDER.indexOf(labelB);
                      return (idxA !== -1 ? idxA : 99) - (idxB !== -1 ? idxB : 99);
                    })
                    .map(([label, count]) => (
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

      {/* ── Pagination (unchanged) ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', padding: '4px 0' }}>
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