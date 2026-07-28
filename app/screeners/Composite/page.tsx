'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Layers,
  Activity,
  BarChart3,
  ShieldCheck,
  Zap,
  Target,
  MousePointer2,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  Search,
  Download,
  Loader,
  ArrowUp,
  ArrowDown,
  FileText,
  FileSpreadsheet,
  FileDown,
  TrendingUp,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { fetchBulkScreenerData } from '@/lib/utils/bulkExport';
import { buildShariahMap } from '@/lib/watchlist/shariah';
import { API_BASE_URL } from '@/lib/api/config';
import { authFetch } from '@/lib/api/authFetch';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
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

interface GroupedData {
  label: string;
  items: StockResult[];
}

type SortDirection = 'asc' | 'desc';
interface SortConfig {
  key: keyof StockResult;
  direction: SortDirection;
}

type CurrentViewFormat = 'csv' | 'xls' | 'xlsx' | 'txt' | 'tv' | 'pdf';
type BulkFormat = 'csv' | 'xlsx' | 'tv' | 'pdf';
type ExportScope = 'current' | 'bulk';

// ─────────────────────────────────────────────
// Screener Config
// ─────────────────────────────────────────────
interface ScreenerConfig {
  icon: React.ReactNode;
  accentColor: string;
  lightBg: string;
  border: string;
}

const DEFAULT_CONFIG: ScreenerConfig = {
  icon: <Layers className="w-4 h-4" />,
  accentColor: '#6B7280',
  lightBg: '#F9FAFB',
  border: '#E5E7EB',
};

const SCREENER_CONFIG_ENTRIES: Array<[string, ScreenerConfig]> = [
  ['5 Months Wide', { icon: <Target className="w-4 h-4" />, accentColor: '#0369A1', lightBg: '#E0F2FE', border: '#7DD3FC' }],
  ['Power Play', { icon: <MousePointer2 className="w-4 h-4" />, accentColor: '#DC2626', lightBg: '#FEF2F2', border: '#FECACA' }],
  ['Alrayan', { icon: <Target className="w-4 h-4" />, accentColor: '#059669', lightBg: '#ECFDF5', border: '#A7F3D0' }],
  ['Alhussain', { icon: <Target className="w-4 h-4" />, accentColor: '#7C3AED', lightBg: '#F5F3FF', border: '#DDD6FE' }],
  ['RSI Momentum', { icon: <Activity className="w-4 h-4" />, accentColor: '#10B981', lightBg: '#D1FAE5', border: '#A7F3D0' }],
  ['1 Month', { icon: <Activity className="w-4 h-4" />, accentColor: '#6366F1', lightBg: '#EEF2FF', border: '#C7D2FE' }],
  ['2 Month', { icon: <Zap className="w-4 h-4" />, accentColor: '#7C3AED', lightBg: '#F5F3FF', border: '#DDD6FE' }],
  ['4 Month', { icon: <ShieldCheck className="w-4 h-4" />, accentColor: '#0284C7', lightBg: '#F0F9FF', border: '#BAE6FD' }],
  ['5 Month', { icon: <BarChart3 className="w-4 h-4" />, accentColor: '#B45309', lightBg: '#FFFBEB', border: '#FDE68A' }],
];

const configCache = new Map<string, ScreenerConfig>();

function getConfig(label: string): ScreenerConfig {
  const cached = configCache.get(label);
  if (cached) return cached;
  for (const [token, cfg] of SCREENER_CONFIG_ENTRIES) {
    if (label.includes(token)) {
      configCache.set(label, cfg);
      return cfg;
    }
  }
  configCache.set(label, DEFAULT_CONFIG);
  return DEFAULT_CONFIG;
}

// ─────────────────────────────────────────────
// Export format definitions
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const formatNumber = (v: number | null | undefined, d = 2) => {
  if (v === null || v === undefined) return 'N/A';
  return v.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
};

const formatPercent = (v: number | null | undefined) => {
  if (v === null || v === undefined) return '0.00%';
  const val = v.toFixed(2);
  return `${parseFloat(val) > 0 ? '+' : ''}${val}%`;
};

const TABLE_COLUMNS: { key: keyof StockResult; label: string; width?: string; sortable: boolean }[] = [
  { key: 'symbol', label: 'SYMBOL', width: '200px', sortable: true },
  { key: 'close', label: 'PRICE', width: '80px', sortable: true },
  { key: 'rs_rating', label: 'RS RATING', width: '65px', sortable: true },
  { key: 'rank_1m', label: '1M', width: '50px', sortable: true },
  { key: 'rank_3m', label: '3M', width: '50px', sortable: true },
  { key: 'rank_6m', label: '6M', width: '50px', sortable: true },
  { key: 'rank_9m', label: '9M', width: '50px', sortable: true },
  { key: 'rank_12m', label: '12M', width: '55px', sortable: true },
  { key: 'sma_50', label: 'SMA 50', width: '80px', sortable: true },
  { key: 'sma_150', label: 'SMA 150', width: '80px', sortable: true },
  { key: 'sma_200', label: 'SMA 200', width: '80px', sortable: true },
  { key: 'percent_off_52w_high', label: 'OFF 52W HIGH', width: '95px', sortable: true },
  { key: 'percent_off_52w_low', label: 'OFF 52W LOW', width: '95px', sortable: true },
];

function ListSkeleton() {
  return (
    <div style={{ padding: '0 0 20px', display: 'flex', flexDirection: 'column', gap: 0 }}>
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div
          key={i}
          style={{
            height: 42,
            background: i % 2 === 0 ? '#FAFBFC' : '#FFFFFF',
            borderBottom: '1px solid #F3F4F6',
            animation: `shimmer 1.5s ease-in-out ${i * 0.07}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export default function CompositePage() {
  const [groupedData, setGroupedData] = useState<GroupedData[]>([]);
  const [totalUnique, setTotalUnique] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [search, setSearch] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Sorting state (global for all tables)
  const [sortConfigs, setSortConfigs] = useState<SortConfig[]>([]);

  // Export state
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [bulkExportLoading, setBulkExportLoading] = useState(false);
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

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchBulkScreenerData();
      setGroupedData(result.groupedData);
      setTotalUnique(result.data.length);
      const first = result.groupedData.find((g) => g.items.length > 0);
      if (first) setExpandedGroups(new Set([first.label]));
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const configMap = useMemo(() => {
    const m = new Map<string, ScreenerConfig>();
    groupedData.forEach((g) => m.set(g.label, getConfig(g.label)));
    return m;
  }, [groupedData]);

  const toggleGroup = useCallback((label: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }, []);

  const handleSort = (key: keyof StockResult) => {
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

  const getSortIcon = (key: keyof StockResult) => {
    const configIndex = sortConfigs.findIndex(config => config.key === key);
    if (configIndex === -1) return null;

    const config = sortConfigs[configIndex];
    return (
      <div style={{ display: 'flex', alignItems: 'center', marginLeft: '4px' }}>
        {config.direction === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
        <span style={{ fontSize: '9px', marginLeft: '2px', color: '#6366F1' }}>{configIndex + 1}</span>
      </div>
    );
  };

  // Filter and Sort items per group
  const processedGroupedData = useMemo(() => {
    let data = groupedData;

    // Apply search
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.map((g) => ({
        ...g,
        items: g.items.filter(
          (s) =>
            s.symbol.toLowerCase().includes(q) ||
            s.company_name.toLowerCase().includes(q)
        ),
      }));
    }

    // Apply sorting
    if (sortConfigs.length > 0) {
      data = data.map(group => {
        const sortedItems = [...group.items].sort((a: any, b: any) => {
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
        return { ...group, items: sortedItems };
      });
    }

    return data;
  }, [groupedData, search, sortConfigs]);

  const nonEmptyCount = processedGroupedData.filter((g) => g.items.length > 0).length;

  // ── Single View Export (Current Visible Data Flattened) ──
  const handleExport = useCallback((format: CurrentViewFormat) => {
    const d = new Date();
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const plainFileName = `Current_View_${dateStr}`;
    const tvFileName = `Current_View_${dateStr}_TradingView`;

    // Flatten only visible/expanded groups
    const flatData: StockResult[] = [];
    const seen = new Set<string>();
    processedGroupedData.forEach(g => {
      if (expandedGroups.has(g.label)) {
        g.items.forEach(item => {
          if (!seen.has(item.symbol)) {
            seen.add(item.symbol);
            flatData.push(item);
          }
        });
      }
    });

    if (format === 'tv') {
      const tvContent = flatData.map(s => `TADAWUL:${s.symbol}`).join('\n');
      const link = document.createElement('a');
      link.href = URL.createObjectURL(new Blob([tvContent], { type: 'text/csv;charset=utf-8;' }));
      link.download = `${tvFileName}.csv`;
      link.click();
      setShowExportMenu(false);
      return;
    }

    const headers = ['SYMBOL', 'COMPANY NAME', 'PRICE', 'SMA 50', 'SMA 150', 'SMA 200', 'RS RATING', '1M', '3M', '6M', '9M', '12M', 'OFF 52W HIGH', 'OFF 52W LOW'];
    const rows = flatData.map(s => [s.symbol, s.company_name, s.close, s.sma_50, s.sma_150, s.sma_200, s.rs_rating, s.rank_1m, s.rank_3m, s.rank_6m, s.rank_9m, s.rank_12m, s.percent_off_52w_high, s.percent_off_52w_low]);

    if (format === 'pdf') {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'A4' });
      doc.setFontSize(18);
      doc.text(`Current View`, 40, 40);
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
  }, [processedGroupedData, expandedGroups]);


  // ── Bulk Export ──
  const handleBulkExport = useCallback(async (format: BulkFormat, shariahOnlyFlag?: boolean) => {
    setBulkExportLoading(true);
    setShowExportMenu(false);

    try {
      const result = await fetchBulkScreenerData();

      const desiredOrder = [
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

      let sortedGroupedData = [...result.groupedData].sort((a, b) => {
        const idxA = desiredOrder.indexOf(a.label);
        const idxB = desiredOrder.indexOf(b.label);
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

      const d = new Date();
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const plainFileName = shariahOnlyFlag ? `REBH_Bulk_Unified_Export_Shariah_${dateStr}` : `REBH_Bulk_Unified_Export_${dateStr}`;
      const tvFileName = shariahOnlyFlag ? `REBH_Bulk_Unified_Export_Shariah_${dateStr}_TradingView` : `REBH_Bulk_Unified_Export_${dateStr}_TradingView`;

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

      const headers = ['SYMBOL', 'COMPANY NAME', 'PRICE', 'SMA 50', 'SMA 150', 'SMA 200', 'RS RATING', '1M', '3M', '6M', '9M', '12M', 'OFF 52W HIGH', 'OFF 52W LOW'];

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

  // ── Export scope switch: keep the chosen format valid for the new scope ──
  const handleScopeChange = useCallback((scope: ExportScope) => {
    setExportScope(scope);
    const validValues = (scope === 'current' ? CURRENT_VIEW_FORMATS : BULK_FORMATS).map(f => f.value);
    if (!validValues.includes(exportFormat as any)) {
      setExportFormat('xlsx');
    }
  }, [exportFormat]);

  // ── Single confirm action for the export panel ──
  const handleExportConfirm = useCallback(() => {
    if (exportScope === 'current') {
      handleExport(exportFormat as CurrentViewFormat);
    } else {
      handleBulkExport(exportFormat as BulkFormat, shariahOnly);
    }
  }, [exportScope, exportFormat, shariahOnly, handleExport, handleBulkExport]);

  const renderCellValue = (stock: StockResult, key: keyof StockResult, cfg: ScreenerConfig) => {
    switch (key) {
      case 'symbol':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: cfg.accentColor, flexShrink: 0 }} />
            <span style={{ fontWeight: 800, fontSize: 13, color: cfg.accentColor, letterSpacing: '-0.01em' }}>
              {stock.symbol}
            </span>
            <span style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>
              {stock.company_name}
            </span>
          </div>
        );
      case 'close':
        return (
          <span style={{ fontWeight: 700, fontSize: 13, color: '#111827', fontVariantNumeric: 'tabular-nums' }}>
            {formatNumber(stock.close)}
          </span>
        );
      case 'rs_rating':
      case 'rank_1m':
      case 'rank_3m':
      case 'rank_6m':
      case 'rank_9m':
      case 'rank_12m': {
        const val = stock[key] as number;
        const color = val >= 80 ? '#15803D' : val >= 70 ? '#A16207' : '#6B7280';
        return (
          <span style={{ fontWeight: 700, fontSize: 12, color, fontVariantNumeric: 'tabular-nums' }}>
            {val !== undefined && val !== null ? Math.round(val) : '-'}
          </span>
        );
      }
      case 'sma_50':
      case 'sma_150':
      case 'sma_200':
        return (
          <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 500, color: '#4B5563', fontVariantNumeric: 'tabular-nums' }}>
            {formatNumber(stock[key] as number)}
          </span>
        );
      case 'percent_off_52w_high':
        return (
          <span style={{ fontWeight: 700, fontSize: 12, fontVariantNumeric: 'tabular-nums', color: (stock.percent_off_52w_high) > -5 ? '#B91C1C' : '#15803D' }}>
            {formatPercent(stock.percent_off_52w_high)}
          </span>
        );
      case 'percent_off_52w_low':
        return (
          <span style={{ fontWeight: 700, fontSize: 12, fontVariantNumeric: 'tabular-nums', color: (stock.percent_off_52w_low) > 100 ? '#15803D' : '#0369A1' }}>
            {formatPercent(stock.percent_off_52w_low)}
          </span>
        );
      default:
        return <span>{String(stock[key])}</span>;
    }
  };

  const activeFormatList = exportScope === 'current' ? CURRENT_VIEW_FORMATS : BULK_FORMATS;

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { opacity: 1; }
          50%  { opacity: 0.4; }
          100% { opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Scrollbar */
        .composite-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
        .composite-scroll::-webkit-scrollbar-track { background: transparent; }
        .composite-scroll::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 3px; }
        .composite-scroll::-webkit-scrollbar-thumb:hover { background: #9CA3AF; }

        /* Group header */
        .group-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 16px;
          height: 40px;
          cursor: pointer;
          user-select: none;
          border: none;
          width: 100%;
          text-align: left;
          transition: background-color 0.12s;
          border-bottom: 1px solid #F3F4F6;
          border-top: 1px solid #E5E7EB;
        }
        .group-header:hover {
          background-color: #FAFBFC;
        }

        .group-container:first-child .group-header {
          border-top: none;
        }

        /* Table header row */
        .table-header-row {
          display: flex;
          align-items: center;
          height: 34px;
          backgroundColor: #F9FAFB;
          border-bottom: 1px solid #E5E7EB;
          padding: 0 16px;
        }

        /* Stock row */
        .stock-row {
          display: flex;
          align-items: center;
          height: 38px;
          border-bottom: 1px solid #F3F4F6;
          transition: background-color 0.1s;
          cursor: default;
          padding: 0 16px;
        }
        .stock-row:hover {
          background-color: #FAFBFC;
        }

        /* Search */
        .composite-search-wrap { position: relative; }
        .composite-search-icon {
          position: absolute; left: 10px; top: 50%;
          transform: translateY(-50%);
          color: #9CA3AF; pointer-events: none;
          width: 14px; height: 14px;
        }
        .composite-search-input {
          width: 220px; box-sizing: border-box;
          height: 32px; padding: 0 12px 0 32px;
          font-size: 12px;
          border: 1px solid #E5E7EB; border-radius: 6px;
          background: #F9FAFB; color: #111827;
          outline: none; transition: border-color 0.15s, background 0.15s;
        }
        .composite-search-input:focus { border-color: #6366F1; background: #fff; }
        .composite-search-input::placeholder { color: #9CA3AF; }

        /* Export panel */
        .export-scope-btn {
          flex: 1;
          padding: 6px 0;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          transition: background-color 0.15s, color 0.15s;
        }
        .export-format-row {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 8px 10px;
          border-radius: 8px;
          border: 1px solid transparent;
          background-color: transparent;
          cursor: pointer;
          text-align: left;
          transition: background-color 0.12s, border-color 0.12s;
        }
        .export-format-row:hover {
          background-color: #F9FAFB;
        }

        /* Center screen */
        .center-screen {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          min-height: 360px; gap: 14px; text-align: center; padding: 40px;
        }
      `}</style>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          backgroundColor: '#FFFFFF',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          overflow: 'hidden',
        }}
      >
        {/* ── Top Header Bar ── */}
        <header
          style={{
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E5E7EB',
            padding: '0 20px',
            height: 48,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            zIndex: 10,
            gap: 16,
          }}
        >
          {/* Left: Screeners info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Layers className="w-4 h-4" color="#111827" />
              <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Screeners</span>
            </div>

            <div style={{ width: 1, height: 18, backgroundColor: '#E5E7EB' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: '#6B7280' }}>
              <span>
                Strategies <strong style={{ color: '#111827' }}>{isLoading ? '–' : processedGroupedData.length}</strong>
              </span>
              <span>
                Active <strong style={{ color: '#15803D' }}>{isLoading ? '–' : nonEmptyCount}</strong>
              </span>
              <span>
                Total <strong style={{ color: '#111827' }}>{isLoading ? '–' : totalUnique}</strong>
              </span>
            </div>
          </div>

          {/* Right: Search & Export */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="composite-search-wrap">
              <Search className="composite-search-icon" />
              <input
                className="composite-search-input"
                type="text"
                placeholder="Search symbol/name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Export Dropdown */}
            <div style={{ position: 'relative' }} ref={exportMenuRef}>
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                style={{
                  height: '32px', padding: '0 14px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                  backgroundColor: '#111827', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px',
                  fontWeight: 600, fontSize: '12px', transition: 'all 0.2s',
                }}
              >
                {bulkExportLoading ? (
                  <Loader key="loader" style={{ width: '13px', height: '13px', animation: 'spin 1s linear infinite' }} />
                ) : (
                  <Download key="download" style={{ width: '13px', height: '13px' }} />
                )}
                <span>Export</span>
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
                        className="export-scope-btn"
                        onClick={() => handleScopeChange('current')}
                        style={{
                          backgroundColor: exportScope === 'current' ? '#FFFFFF' : 'transparent',
                          color: exportScope === 'current' ? '#111827' : '#6B7280',
                          boxShadow: exportScope === 'current' ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                        }}
                      >
                        Current View
                      </button>
                      <button
                        className="export-scope-btn"
                        onClick={() => handleScopeChange('bulk')}
                        style={{
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
                            className="export-format-row"
                            onClick={() => setExportFormat(opt.value)}
                            style={{
                              borderColor: selected ? '#111827' : 'transparent',
                              backgroundColor: selected ? '#F9FAFB' : 'transparent',
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
        </header>

        {/* ── Main Scrollable List ── */}
        <div
          className="composite-scroll"
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'auto',
            minWidth: 0,
            paddingBottom: '20px'
          }}
        >
          {isLoading ? (
            <ListSkeleton />
          ) : error ? (
            <div className="center-screen">
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AlertCircle className="w-6 h-6" color="#DC2626" />
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 4 }}>
                  Failed to load data
                </div>
                <div style={{ fontSize: 13, color: '#6B7280' }}>
                  Something went wrong while fetching screener data.
                </div>
              </div>
              <button
                onClick={loadData}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 18px',
                  borderRadius: 9,
                  backgroundColor: '#111827',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                  border: 'none',
                }}
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          ) : (
            <div style={{ minWidth: 'fit-content' }}>
              {processedGroupedData.map((group) => {
                const cfg = configMap.get(group.label) ?? DEFAULT_CONFIG;
                const isExpanded = expandedGroups.has(group.label);
                const isEmpty = group.items.length === 0;

                return (
                  <div key={group.label} className="group-container">
                    {/* ── Group Header ── */}
                    <button
                      className="group-header"
                      style={{
                        backgroundColor: isExpanded ? '#FAFBFC' : '#FFFFFF',
                        opacity: isEmpty && !search ? 0.5 : 1,
                      }}
                      onClick={() => toggleGroup(group.label)}
                    >
                      <ChevronDown
                        style={{
                          width: 14,
                          height: 14,
                          color: cfg.accentColor,
                          transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                          transition: 'transform 0.2s ease',
                          flexShrink: 0,
                        }}
                      />
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: cfg.accentColor,
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: '#374151',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {group.label}:
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: cfg.accentColor,
                          textTransform: 'uppercase',
                        }}
                      >
                        {group.items.length} {group.items.length === 1 ? 'COMPANY' : 'COMPANIES'}
                      </span>
                    </button>

                    {/* ── Expanded Table Content ── */}
                    {isExpanded && group.items.length > 0 && (
                      <div style={{ paddingBottom: '16px' }}>
                        {/* ── Column Headers (Inside Group) ── */}
                        <div className="table-header-row">
                          {TABLE_COLUMNS.map((col) => (
                            <div
                              key={col.key}
                              onClick={() => col.sortable && handleSort(col.key)}
                              style={{
                                width: col.width,
                                minWidth: col.width,
                                flexShrink: 0,
                                flexGrow: col.key === 'symbol' ? 1 : 0,
                                fontSize: 10,
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                color: '#6B7280',
                                padding: '0 8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: col.key === 'symbol' ? 'flex-start' : 'center',
                                cursor: col.sortable ? 'pointer' : 'default',
                                userSelect: 'none'
                              }}
                            >
                              {col.label}
                              {getSortIcon(col.key)}
                            </div>
                          ))}
                        </div>

                        {/* ── Stock Rows ── */}
                        {group.items.map((stock, idx) => (
                          <div
                            key={stock.symbol}
                            className="stock-row"
                            style={{
                              backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFBFC',
                            }}
                          >
                            {TABLE_COLUMNS.map((col) => (
                              <div
                                key={col.key}
                                style={{
                                  width: col.width,
                                  minWidth: col.width,
                                  flexShrink: 0,
                                  flexGrow: col.key === 'symbol' ? 1 : 0,
                                  padding: '0 8px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: col.key === 'symbol' ? 'flex-start' : 'center',
                                }}
                              >
                                {renderCellValue(stock, col.key, cfg)}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Empty state when expanded */}
                    {isExpanded && group.items.length === 0 && (
                      <div
                        style={{
                          padding: '16px 40px',
                          fontSize: 12,
                          color: '#9CA3AF',
                          borderBottom: '1px solid #F3F4F6',
                          backgroundColor: '#FAFBFC',
                        }}
                      >
                        No companies currently meet the {group.label} criteria.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}