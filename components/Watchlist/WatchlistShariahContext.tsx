'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { API_BASE_URL } from '@/lib/api/config';
import { authFetch } from '@/lib/api/authFetch';
import { buildShariahMap, applyShariahFilter } from '@/lib/watchlist/shariah';

type WatchlistShariahContextValue = {
    selected: string[];
    setSelected: (values: string[]) => void;
    options: string[];
    bySymbol: Map<string, string>;
    loading: boolean;
    filterStocks: <T extends { symbol: string }>(items: T[]) => T[];
};

const WatchlistShariahContext = createContext<WatchlistShariahContextValue | null>(null);

export function WatchlistShariahProvider({ children }: { children: ReactNode }) {
    const [selected, setSelected] = useState<string[]>([]);
    const [options, setOptions] = useState<string[]>([]);
    const [bySymbol, setBySymbol] = useState<Map<string, string>>(new Map());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                const res = await authFetch(`${API_BASE_URL}/api/prices/latest?limit=1000`, {
                    credentials: 'include',
                    cache: 'no-store',
                });
                if (!res.ok) return;
                const json = await res.json();
                if (cancelled) return;
                const { bySymbol: map, options: opts } = buildShariahMap(json.data || []);
                setBySymbol(map);
                setOptions(opts);
            } catch (err) {
                console.error('Failed to load Shariah statuses', err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => { cancelled = true; };
    }, []);

    const filterStocks = useCallback(
        <T extends { symbol: string }>(items: T[]) => applyShariahFilter(items, bySymbol, selected),
        [bySymbol, selected]
    );

    return (
        <WatchlistShariahContext.Provider
            value={{ selected, setSelected, options, bySymbol, loading, filterStocks }}
        >
            {children}
        </WatchlistShariahContext.Provider>
    );
}

const noopShariah: WatchlistShariahContextValue = {
    selected: [],
    setSelected: () => {},
    options: [],
    bySymbol: new Map(),
    loading: false,
    filterStocks: (items) => items,
};

export function useWatchlistShariah() {
    const ctx = useContext(WatchlistShariahContext);
    return ctx ?? noopShariah;
}

function ShariahFilterBar({ variant }: { variant?: 'light' | 'dark' }) {
    const { selected, setSelected, options, loading } = useWatchlistShariah();
    const isLight = variant === 'light';

    return (
        <div
            className="flex items-center gap-2 px-4 py-1 shrink-0"
            style={{
                backgroundColor: isLight ? '#f8fafc' : '#1e222d',
                borderBottom: `1px solid ${isLight ? '#e2e8f0' : '#2a2e39'}`,
            }}
        >
            <div className="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={isLight ? '#2962ff' : '#2962ff'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
                <span
                    className="text-[10px] font-bold uppercase tracking-wider whitespace-nowrap"
                    style={{ color: isLight ? '#64748b' : '#d1d4dc' }}
                >
                    Shariah & Margin
                </span>
            </div>

            <div className="h-3 w-[1px]" style={{ backgroundColor: isLight ? '#cbd5e1' : '#434651' }} />

            {loading ? (
                <span className="text-[10px]" style={{ color: isLight ? '#94a3b8' : '#787b86' }}>Loading...</span>
            ) : (
                <div className="flex items-center gap-1 flex-wrap">
                    {options.map((opt) => {
                        const isActive = selected.includes(opt);
                        return (
                            <button
                                key={opt}
                                type="button"
                                onClick={() =>
                                    isActive
                                        ? setSelected(selected.filter((x) => x !== opt))
                                        : setSelected([...selected, opt])
                                }
                                className="transition-all text-[10px] font-medium rounded px-2 py-0.5 border cursor-pointer whitespace-nowrap"
                                style={{
                                    backgroundColor: isActive
                                        ? (isLight ? '#2962ff' : '#2962ff')
                                        : (isLight ? '#ffffff' : '#2a2e39'),
                                    color: isActive
                                        ? '#ffffff'
                                        : (isLight ? '#475569' : '#94a3b8'),
                                    borderColor: isActive
                                        ? '#2962ff'
                                        : (isLight ? '#e2e8f0' : '#363c4b'),
                                }}
                            >
                                {opt}
                            </button>
                        );
                    })}
                </div>
            )}

            {selected.length > 0 && (
                <>
                    <div className="h-3 w-[1px]" style={{ backgroundColor: isLight ? '#cbd5e1' : '#434651' }} />
                    <button
                        type="button"
                        onClick={() => setSelected([])}
                        className="text-[10px] font-medium whitespace-nowrap transition-colors px-1.5 py-0.5 rounded cursor-pointer border-none"
                        style={{
                            color: '#ef5350',
                            backgroundColor: isLight ? '#fef2f2' : 'rgba(239,83,80,0.1)',
                        }}
                    >
                        Clear
                    </button>
                </>
            )}
        </div>
    );
}

export function ShariahFilterPage({
    children,
    variant,
    className,
}: {
    children: ReactNode;
    variant?: 'light' | 'dark';
    className?: string;
}) {
    return (
        <WatchlistShariahProvider>
            <div className={className} style={{ display: 'flex', flexDirection: 'column' }}>
                <ShariahFilterBar variant={variant} />
                <div style={{ flex: 1, minHeight: 0 }}>
                    {children}
                </div>
            </div>
        </WatchlistShariahProvider>
    );
}