import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import type { Stock } from '../types';
import { cleanSymbol, cleanName } from '../utils/formatters';

interface SymbolSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    stocks: Stock[];
    onSelect: (symbol: string) => void;
}

export default function SymbolSearchModal({ isOpen, onClose, stocks, onSelect }: SymbolSearchModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input on open
    useEffect(() => {
        if (isOpen) {
            setSearchQuery('');
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Handle Esc key to close
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const filteredStocks = useMemo(() => {
        if (!searchQuery) return stocks.slice(0, 100); // limit empty state
        const query = searchQuery.toLowerCase();
        return stocks.filter(s =>
            cleanSymbol(s.symbol).toLowerCase().includes(query) ||
            cleanName(s.name || '').toLowerCase().includes(query)
        ).slice(0, 100);
    }, [searchQuery, stocks]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/40 backdrop-blur-sm"
            onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100"
                onClick={e => e.stopPropagation()}>

                {/* Search Header */}
                <div className="flex items-center px-4 py-4 border-b border-gray-100 bg-gray-50/50">
                    <Search className="w-5 h-5 text-blue-500 mr-3 shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Symbol Search (e.g., 2222 or Aramco)..."
                        className="flex-1 bg-transparent text-xl font-medium text-gray-800 focus:outline-none placeholder-gray-400"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button
                        onClick={onClose}
                        className="p-1.5 hover:bg-gray-200 rounded-md text-gray-500 hover:text-gray-800 transition-colors shrink-0 ml-2"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Results List */}
                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {filteredStocks.length > 0 ? (
                        <div className="divide-y divide-gray-50">
                            {filteredStocks.map(stock => (
                                <button
                                    key={stock.symbol}
                                    className="w-full text-left px-5 py-3 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors flex items-center justify-between group"
                                    onClick={() => onSelect(stock.symbol)}
                                >
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="flex items-center justify-center w-12 h-8 bg-blue-100 text-blue-700 font-bold rounded">
                                            {cleanSymbol(stock.symbol)}
                                        </div>
                                        <div className="flex flex-col min-w-0 flex-1">
                                            <span className="font-semibold text-gray-800 truncate">{cleanName(stock.name || '')}</span>
                                            <span className="text-xs text-gray-500 truncate">{stock.sector || 'TADAWUL'}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0 pl-4">
                                        <span className="text-sm font-medium text-gray-400 group-hover:text-blue-600 transition-colors">
                                            Select ↵
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="px-8 py-12 text-center">
                            <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">No symbols found</h3>
                            <p className="text-gray-500">We couldn't find anything matching "{searchQuery}"</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
