'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';

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
  ChevronRight,
  Search,
} from 'lucide-react';
import ScreenerTable from '@/components/Screeners/ScreenerTable';
import { fetchBulkScreenerData } from '@/lib/utils/bulkExport';

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

/**
 * Ordered from most-specific to least-specific so that
 * "5 Months Wide" is matched before "5 Month".
 * Keys are substring tokens; the Map is built once at module load.
 */
const SCREENER_CONFIG_ENTRIES: Array<[string, ScreenerConfig]> = [
  ['5 Months Wide', { icon: <Target className="w-4 h-4" />, accentColor: '#0369A1', lightBg: '#E0F2FE', border: '#7DD3FC' }],
  ['Power Play', { icon: <MousePointer2 className="w-4 h-4" />, accentColor: '#DC2626', lightBg: '#FEF2F2', border: '#FECACA' }],
  ['Alrayan', { icon: <Target className="w-4 h-4" />, accentColor: '#059669', lightBg: '#ECFDF5', border: '#A7F3D0' }],
  ['1 Month', { icon: <Activity className="w-4 h-4" />, accentColor: '#6366F1', lightBg: '#EEF2FF', border: '#C7D2FE' }],
  ['2 Month', { icon: <Zap className="w-4 h-4" />, accentColor: '#7C3AED', lightBg: '#F5F3FF', border: '#DDD6FE' }],
  ['4 Month', { icon: <ShieldCheck className="w-4 h-4" />, accentColor: '#0284C7', lightBg: '#F0F9FF', border: '#BAE6FD' }],
  ['5 Month', { icon: <BarChart3 className="w-4 h-4" />, accentColor: '#B45309', lightBg: '#FFFBEB', border: '#FDE68A' }],
];

// Module-level Map for O(1) exact-key lookup after the first call.
const configCache = new Map<string, ScreenerConfig>();

/**
 * Resolves a screener label → ScreenerConfig.
 * First checks the cache (exact label), then walks the ordered
 * entries for a substring match and memoises the result.
 */
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
// Skeleton Loaders
// ─────────────────────────────────────────────
function SidebarSkeleton() {
  return (
    <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div
          key={i}
          style={{
            height: 40,
            borderRadius: 9,
            background: '#F3F4F6',
            animation: `shimmer 1.5s ease-in-out ${i * 0.07}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 6 }}>
      {[100, 85, 92, 78, 96, 70, 88, 82].map((_, i) => (
        <div
          key={i}
          style={{
            height: 44,
            borderRadius: 8,
            background: '#F3F4F6',
            animation: `shimmer 1.5s ease-in-out ${i * 0.05}s infinite`,
            opacity: 1 - i * 0.07,
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
  const [activeLabel, setActiveLabel] = useState<string>('');
  const [search, setSearch] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);


  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchBulkScreenerData();
      setGroupedData(result.groupedData);
      setTotalUnique(result.data.length);
      // Auto-select first non-empty strategy only
      const first = result.groupedData.find((g) => g.items.length > 0);
      if (first) setActiveLabel(first.label);
      else if (result.groupedData.length > 0) setActiveLabel(result.groupedData[0].label);
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

  const activeGroup = useMemo(
    () => groupedData.find((g) => g.label === activeLabel) ?? null,
    [groupedData, activeLabel]
  );

  const activeConfig = useMemo(
    () => (activeLabel ? (configMap.get(activeLabel) ?? DEFAULT_CONFIG) : DEFAULT_CONFIG),
    [configMap, activeLabel]
  );

  const filteredItems = useMemo(() => {
    if (!activeGroup) return [];
    if (!search.trim()) return activeGroup.items;
    const q = search.toLowerCase();
    return activeGroup.items.filter(
      (s) =>
        s.symbol.toLowerCase().includes(q) ||
        s.company_name.toLowerCase().includes(q)
    );
  }, [activeGroup, search]);

  const nonEmptyCount = groupedData.filter((g) => g.items.length > 0).length;

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0%   { opacity: 1; }
          50%  { opacity: 0.4; }
          100% { opacity: 1; }
        }

        /* Nav item */
        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 9px;
          cursor: pointer;
          transition: background 0.15s;
          user-select: none;
          border: 1px solid transparent;
          background: transparent;
          width: 100%;
          text-align: left;
        }
        .nav-item:hover:not(.nav-item--active) {
          background: #F3F4F6;
        }
        .nav-item--active {
          background: var(--item-bg);
          border-color: var(--item-border);
        }
        .nav-item--empty { opacity: 0.45; }

        /* Count badge */
        .count-badge {
          margin-left: auto;
          font-size: 11px;
          font-weight: 700;
          padding: 1px 7px;
          border-radius: 9px;
          flex-shrink: 0;
          transition: background 0.15s, color 0.15s;
        }

        /* Search */
        .search-wrap { position: relative; flex: 1; max-width: 280px; }
        .search-icon {
          position: absolute; left: 10px; top: 50%;
          transform: translateY(-50%);
          color: #9CA3AF; pointer-events: none;
          width: 14px; height: 14px;
        }
        .search-input {
          width: 100%; box-sizing: border-box;
          height: 34px; padding: 0 12px 0 32px;
          font-size: 13px;
          border: 1px solid #E5E7EB; border-radius: 8px;
          background: #F9FAFB; color: #111827;
          outline: none; transition: border-color 0.15s, background 0.15s;
        }
        .search-input:focus { border-color: #6366F1; background: #fff; }
        .search-input::placeholder { color: #9CA3AF; }


        .icon-btn {
          display: flex; align-items: center; justify-content: center;
          width: 34px; height: 34px; border-radius: 8px;
          border: 1px solid #E5E7EB; background: #fff;
          cursor: pointer; color: #6B7280; flex-shrink: 0;
          transition: background 0.15s, color 0.15s;
        }
        .icon-btn:hover { background: #F3F4F6; color: #111827; }

        /* Collapse button */
        .collapse-btn {
          display: flex; align-items: center; justify-content: center;
          width: 22px; height: 22px; border-radius: 6px;
          border: 1px solid #E5E7EB; background: #fff;
          cursor: pointer; color: #9CA3AF; flex-shrink: 0;
          transition: background 0.15s, color 0.15s;
        }
        .collapse-btn:hover { background: #F3F4F6; color: #111827; }

        /* Empty/error screen */
        .center-screen {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          min-height: 360px; gap: 14px; text-align: center; padding: 40px;
        }

        /* Stat pill */
        .stat-pill {
          display: flex; flex-direction: column; align-items: center;
          padding: 8px 14px; border-radius: 10px; min-width: 72px;
        }
        .stat-pill-label {
          font-size: 10px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.06em; margin-bottom: 1px;
        }
        .stat-pill-value {
          font-size: 19px; font-weight: 800; line-height: 1;
        }
      `}</style>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          backgroundColor: '#F8FAFC',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          overflow: 'hidden',
        }}
      >
        {/* ── Top Header ── */}
        <header
          style={{
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E5E7EB',
            padding: '0 20px',
            height: 58,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            zIndex: 10,
            gap: 16,
          }}
        >
          {/* Logo + Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                backgroundColor: '#111827',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Layers className="w-4 h-4" color="#FFFFFF" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', lineHeight: 1.15 }}>
                Composite Screeners
              </div>
              <div style={{ fontSize: 11, color: '#9CA3AF', lineHeight: 1.15 }}>
                All active strategies
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div
              className="stat-pill"
              style={{ background: '#F9FAFB', border: '1px solid #E5E7EB' }}
            >
              <span className="stat-pill-label" style={{ color: '#9CA3AF' }}>Strategies</span>
              <span className="stat-pill-value" style={{ color: '#111827' }}>
                {isLoading ? '–' : groupedData.length}
              </span>
            </div>

            <div
              className="stat-pill"
              style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}
            >
              <span className="stat-pill-label" style={{ color: '#16A34A' }}>Active</span>
              <span className="stat-pill-value" style={{ color: '#15803D' }}>
                {isLoading ? '–' : nonEmptyCount}
              </span>
            </div>

            <div
              className="stat-pill"
              style={{ background: '#EEF2FF', border: '1px solid #C7D2FE' }}
            >
              <span className="stat-pill-label" style={{ color: '#4F46E5' }}>Total</span>
              <span className="stat-pill-value" style={{ color: '#3730A3' }}>
                {isLoading ? '–' : totalUnique}
              </span>
            </div>
          </div>
        </header>

        {/* ── Body ── */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

          {/* ── Sidebar ── */}
          <aside
            style={{
              width: sidebarCollapsed ? 52 : 232,
              minWidth: sidebarCollapsed ? 52 : 232,
              backgroundColor: '#FFFFFF',
              borderRight: '1px solid #E5E7EB',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              flexShrink: 0,
              transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1), min-width 0.22s cubic-bezier(0.4,0,0.2,1)',
            }}
          >
            {/* Sidebar toolbar */}
            <div
              style={{
                height: 44,
                padding: '0 10px',
                borderBottom: '1px solid #F3F4F6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: sidebarCollapsed ? 'center' : 'space-between',
                flexShrink: 0,
              }}
            >
              {!sidebarCollapsed && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#9CA3AF',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  Strategies
                </span>
              )}
              <button
                className="collapse-btn"
                onClick={() => setSidebarCollapsed((v) => !v)}
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <ChevronRight
                  style={{
                    width: 12,
                    height: 12,
                    transform: sidebarCollapsed ? 'rotate(0deg)' : 'rotate(180deg)',
                    transition: 'transform 0.22s',
                  }}
                />
              </button>
            </div>

            {/* Nav */}
            <nav
              style={{
                flex: 1,
                overflowY: 'auto',
                overflowX: 'hidden',
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              {isLoading ? (
                sidebarCollapsed ? null : <SidebarSkeleton />
              ) : (
                groupedData.map((group) => {
                  const cfg = configMap.get(group.label) ?? DEFAULT_CONFIG;
                  const isActive = group.label === activeLabel;
                  const isEmpty = group.items.length === 0;

                  return (
                    <button
                      key={group.label}
                      className={[
                        'nav-item',
                        isActive ? 'nav-item--active' : '',
                        isEmpty ? 'nav-item--empty' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      style={
                        {
                          '--item-bg': cfg.lightBg,
                          '--item-border': cfg.border,
                          justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                        } as React.CSSProperties
                      }
                      onClick={() => {
                        setActiveLabel(group.label);
                        setSearch('');
                      }}
                      title={sidebarCollapsed ? `${group.label} (${group.items.length})` : undefined}
                    >
                      {/* Icon */}
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 7,
                          backgroundColor: isActive ? '#FFFFFF' : cfg.lightBg,
                          color: cfg.accentColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: `1px solid ${cfg.border}`,
                          flexShrink: 0,
                          transition: 'background 0.15s',
                        }}
                      >
                        {cfg.icon}
                      </div>

                      {!sidebarCollapsed && (
                        <>
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: isActive ? 700 : 500,
                              color: isActive ? cfg.accentColor : '#374151',
                              flex: 1,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              transition: 'color 0.15s',
                            }}
                          >
                            {group.label}
                          </span>

                          <span
                            className="count-badge"
                            style={{
                              backgroundColor: isActive
                                ? cfg.accentColor
                                : isEmpty
                                  ? '#F3F4F6'
                                  : cfg.lightBg,
                              color: isActive
                                ? '#FFFFFF'
                                : isEmpty
                                  ? '#9CA3AF'
                                  : cfg.accentColor,
                            }}
                          >
                            {group.items.length}
                          </span>
                        </>
                      )}
                    </button>
                  );
                })
              )}
            </nav>
          </aside>

          {/* ── Main Pane ── */}
          <main
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              minWidth: 0,
            }}
          >
            {isLoading ? (
              <>
                {/* Fake toolbar */}
                <div
                  style={{
                    height: 58,
                    borderBottom: '1px solid #E5E7EB',
                    backgroundColor: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 20px',
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      width: 180,
                      height: 32,
                      borderRadius: 8,
                      background: '#F3F4F6',
                      animation: 'shimmer 1.5s ease-in-out infinite',
                    }}
                  />
                  <div
                    style={{
                      width: 220,
                      height: 32,
                      borderRadius: 8,
                      background: '#F3F4F6',
                      animation: 'shimmer 1.5s ease-in-out 0.1s infinite',
                    }}
                  />
                </div>
                <TableSkeleton />
              </>
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
            ) : !activeGroup ? (
              <div className="center-screen">
                <div style={{ color: '#9CA3AF', fontSize: 14 }}>
                  Select a strategy from the sidebar
                </div>
              </div>
            ) : (
              <>
                {/* ── Toolbar ── */}
                <div
                  style={{
                    height: 58,
                    padding: '0 20px',
                    borderBottom: '1px solid #E5E7EB',
                    backgroundColor: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    flexShrink: 0,
                  }}
                >
                  {/* Active strategy badge */}
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 7,
                      padding: '5px 11px',
                      borderRadius: 8,
                      backgroundColor: activeConfig.lightBg,
                      border: `1px solid ${activeConfig.border}`,
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ color: activeConfig.accentColor, display: 'flex' }}>
                      {activeConfig.icon}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: activeConfig.accentColor,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {activeGroup.label}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '1px 7px',
                        borderRadius: 8,
                        backgroundColor: activeConfig.accentColor,
                        color: '#FFFFFF',
                      }}
                    >
                      {activeGroup.items.length}
                    </span>
                  </div>

                  {/* Divider */}
                  <div
                    style={{
                      width: 1,
                      height: 22,
                      backgroundColor: '#E5E7EB',
                      flexShrink: 0,
                    }}
                  />

                  {/* Search */}
                  <div className="search-wrap">
                    <Search className="search-icon" />
                    <input
                      className="search-input"
                      type="text"
                      placeholder="Search symbol or name..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>




                </div>

                {/* ── Table / Empty states ── */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
                  {activeGroup.items.length === 0 ? (
                    <div className="center-screen">
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          backgroundColor: '#F9FAFB',
                          border: '1px solid #E5E7EB',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Layers className="w-5 h-5" color="#D1D5DB" />
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: 15,
                            fontWeight: 600,
                            color: '#374151',
                            marginBottom: 4,
                          }}
                        >
                          No matches found
                        </div>
                        <div style={{ fontSize: 13, color: '#9CA3AF' }}>
                          No companies currently meet the {activeGroup.label} criteria.
                        </div>
                      </div>
                    </div>
                  ) : filteredItems.length === 0 ? (
                    <div className="center-screen">
                      <div style={{ fontSize: 14, color: '#6B7280' }}>
                        No results for <strong>"{search}"</strong>
                      </div>
                      <button
                        onClick={() => setSearch('')}
                        style={{
                          padding: '7px 16px',
                          borderRadius: 8,
                          border: '1px solid #E5E7EB',
                          background: '#fff',
                          fontSize: 13,
                          cursor: 'pointer',
                          color: '#374151',
                          fontWeight: 500,
                        }}
                      >
                        Clear search
                      </button>
                    </div>
                  ) : (
                    <ScreenerTable
                      data={filteredItems}
                      loading={false}
                      screenerColor={activeConfig.accentColor}
                      screenerName={activeGroup.label}
                      exportFileNamePrefix={activeGroup.label.replace(/\s+/g, '')}
                    />
                  )}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </>
  );
}