import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X, TrendingUp, BarChart2 } from 'lucide-react';
import type { Stock } from '../types';
import { cleanSymbol, cleanName } from '../utils/formatters';

interface SymbolSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    stocks: Stock[];
    onSelect: (symbol: string) => void;
}

export default function SymbolSearchModal({
    isOpen,
    onClose,
    stocks,
    onSelect,
}: SymbolSearchModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [hoveredIndex, setHoveredIndex] = useState<number>(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    // ── Focus & reset on open ─────────────────────────────────────────────────
    useEffect(() => {
        if (isOpen) {
            setSearchQuery('');
            setHoveredIndex(-1);
            const t = setTimeout(() => inputRef.current?.focus(), 80);
            return () => clearTimeout(t);
        }
    }, [isOpen]);

    // ── Keyboard: Esc + arrow navigation ─────────────────────────────────────
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === 'Escape') {
                onClose();
                return;
            }

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setHoveredIndex(prev => Math.min(prev + 1, filteredStocks.length - 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setHoveredIndex(prev => Math.max(prev - 1, 0));
            } else if (e.key === 'Enter' && hoveredIndex >= 0) {
                const stock = filteredStocks[hoveredIndex];
                if (stock) onSelect(stock.symbol);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, onClose, hoveredIndex]);

    // ── Filtered results ──────────────────────────────────────────────────────
    const filteredStocks = useMemo(() => {
        if (!searchQuery.trim()) return stocks.slice(0, 80);
        const q = searchQuery.toLowerCase().trim();
        return stocks
            .filter(s =>
                cleanSymbol(s.symbol).toLowerCase().includes(q) ||
                cleanName(s.name || '').toLowerCase().includes(q)
            )
            .slice(0, 80);
    }, [searchQuery, stocks]);

    // ── Scroll active row into view ───────────────────────────────────────────
    useEffect(() => {
        if (hoveredIndex < 0) return;
        const list = listRef.current;
        const item = list?.children[hoveredIndex] as HTMLElement | undefined;
        item?.scrollIntoView({ block: 'nearest' });
    }, [hoveredIndex]);

    if (!isOpen) return null;

    const hasQuery = searchQuery.trim().length > 0;

    return (
        <>
            {/* ── Backdrop ─────────────────────────────────────────────────── */}
            <div
                className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-sm"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* ── Modal ────────────────────────────────────────────────────── */}
            <div
                className="fixed inset-0 z-50 flex items-start justify-center pointer-events-none"
                style={{ paddingTop: '12vh' }}
            >
                <div
                    className="
                        pointer-events-auto
                        w-full max-w-[600px] mx-4
                        bg-white rounded-2xl
                        shadow-[0_24px_80px_-12px_rgba(15,23,42,0.18),0_0_0_1px_rgba(15,23,42,0.06)]
                        overflow-hidden
                        flex flex-col
                    "
                    style={{ maxHeight: '72vh' }}
                    onClick={e => e.stopPropagation()}
                >
                    {/* ── Search Header ──────────────────────────────────── */}
                    <div className="flex items-center px-4 py-3 border-b border-slate-100">
                        {/* Search icon */}
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 mr-3 shrink-0">
                            <Search className="w-4 h-4 text-blue-600" strokeWidth={2.5} />
                        </div>

                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Search symbol or company name…"
                            className="
                                flex-1 text-[15px] font-medium text-slate-800
                                placeholder-slate-400 bg-transparent
                                focus:outline-none
                            "
                            value={searchQuery}
                            onChange={e => {
                                setSearchQuery(e.target.value);
                                setHoveredIndex(-1);
                            }}
                            autoComplete="off"
                            spellCheck={false}
                        />

                        {/* Clear / Close */}
                        {hasQuery ? (
                            <button
                                onClick={() => { setSearchQuery(''); setHoveredIndex(-1); inputRef.current?.focus(); }}
                                className="
                                    w-6 h-6 flex items-center justify-center
                                    rounded-md text-slate-400 hover:text-slate-600
                                    hover:bg-slate-100 transition-colors ml-2 shrink-0
                                "
                                title="Clear search"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        ) : (
                            <button
                                onClick={onClose}
                                className="
                                    flex items-center gap-1 px-2 py-0.5 ml-2 shrink-0
                                    rounded-md border border-slate-200 text-[10px] font-semibold
                                    text-slate-400 hover:text-slate-600 hover:bg-slate-50
                                    transition-colors
                                "
                                title="Close (Esc)"
                            >
                                ESC
                            </button>
                        )}
                    </div>

                    {/* ── Meta bar ──────────────────────────────────────── */}
                    <div className="flex items-center justify-between px-4 py-1.5 bg-slate-50 border-b border-slate-100">
                        <span className="text-[11px] text-slate-400 font-medium">
                            {hasQuery
                                ? `${filteredStocks.length} result${filteredStocks.length !== 1 ? 's' : ''}`
                                : `${stocks.length} symbols · TADAWUL`
                            }
                        </span>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400">
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[9px] font-mono shadow-sm">↑↓</kbd>
                                Navigate
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[9px] font-mono shadow-sm">↵</kbd>
                                Select
                            </span>
                        </div>
                    </div>

                    {/* ── Results List ──────────────────────────────────── */}
                    <div
                        ref={listRef}
                        className="overflow-y-auto overscroll-contain"
                        style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}
                    >
                        {filteredStocks.length > 0 ? (
                            filteredStocks.map((stock, index) => {
                                const sym = cleanSymbol(stock.symbol);
                                const name = cleanName(stock.name || '');
                                const sector = stock.sector || 'TADAWUL';
                                const active = index === hoveredIndex;

                                return (
                                    <button
                                        key={stock.symbol}
                                        className={`
                                            w-full text-left px-4 py-2.5
                                            flex items-center gap-3
                                            transition-colors duration-75
                                            focus:outline-none
                                            ${active
                                                ? 'bg-blue-50'
                                                : 'hover:bg-slate-50'
                                            }
                                        `}
                                        onClick={() => onSelect(stock.symbol)}
                                        onMouseEnter={() => setHoveredIndex(index)}
                                    >
                                        {/* Symbol badge */}
                                        <div
                                            className={`
                                                flex items-center justify-center
                                                w-11 h-8 rounded-lg shrink-0
                                                font-mono font-bold text-[12px] tracking-tight
                                                transition-colors
                                                ${active
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-slate-100 text-slate-600'
                                                }
                                            `}
                                        >
                                            {sym}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-baseline gap-2">
                                                <span className={`font-semibold text-[13px] truncate ${active ? 'text-blue-900' : 'text-slate-800'}`}>
                                                    {name || sym}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <span className={`text-[11px] truncate ${active ? 'text-blue-500' : 'text-slate-400'}`}>
                                                    {sector}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Right action hint */}
                                        <div className={`flex items-center gap-1.5 shrink-0 transition-opacity ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                            {active && (
                                                <div className="flex items-center gap-1 text-[10px] font-semibold text-blue-500">
                                                    <BarChart2 className="w-3.5 h-3.5" />
                                                    <span>View</span>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })
                        ) : (
                            /* ── Empty State ──────────────────────────────── */
                            <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                                    <Search className="w-5 h-5 text-slate-400" />
                                </div>
                                <p className="text-[14px] font-semibold text-slate-700 mb-1">No symbols found</p>
                                <p className="text-[12px] text-slate-400">
                                    No results for&nbsp;
                                    <span className="font-mono font-semibold text-slate-600">"{searchQuery}"</span>
                                </p>
                                <button
                                    onClick={() => { setSearchQuery(''); inputRef.current?.focus(); }}
                                    className="mt-4 text-[11px] text-blue-600 hover:underline font-medium"
                                >
                                    Clear search
                                </button>
                            </div>
                        )}
                    </div>

                    {/* ── Footer hint ───────────────────────────────────── */}
                    {filteredStocks.length > 0 && (
                        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                                <TrendingUp className="w-3 h-3" />
                                <span>TADAWUL — Saudi Exchange</span>
                            </div>
                            {filteredStocks.length >= 80 && (
                                <span className="text-[10px] text-slate-400">
                                    Showing top 80 · refine search for more
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}