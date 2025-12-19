import React, { useState, useRef, useEffect } from 'react';
import { FilterConfig, FILTERS_CONFIG } from '@/app/screener/utils/filtersConfig';
import { Search, ChevronDown, X, SlidersHorizontal, Trash2 } from 'lucide-react';

interface FiltersPanelProps {
    filters: Record<string, any>;
    onFilterChange: (id: string, value: any) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

const FilterDropdown: React.FC<{
    config: FilterConfig;
    value: any;
    onChange: (value: any) => void;
}> = ({ config, value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getLabel = () => {
        if (!value || value === 'all') return config.label;
        const option = config.options?.find(opt => opt.value === value);
        return `${config.label}: ${option ? option.label : value}`;
    };

    const hasValue = value && value !== 'all';

    return (
        <div className="relative" ref={ref}>
            <button
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border
          ${hasValue
                        ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-[#2a2e39] dark:border-[#2a2e39] dark:text-gray-300 dark:hover:bg-[#363a45]'
                    }`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{getLabel()}</span>
                {hasValue ? (
                    <span onClick={(e) => { e.stopPropagation(); onChange('all'); }} className="p-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full">
                        <X size={12} />
                    </span>
                ) : (
                    <ChevronDown size={14} />
                )}
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 p-2 bg-white dark:bg-[#1e222d] border border-gray-100 dark:border-[#2a2e39] rounded-lg shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
                    {/* Search (Visual) */}
                    <div className="mb-2">
                        <input type="text" placeholder="Search" className="w-full px-2 py-1.5 text-xs bg-gray-50 dark:bg-[#2a2e39] border border-gray-200 dark:border-gray-700 rounded text-gray-900 dark:text-gray-200 focus:outline-none focus:border-blue-500" />
                    </div>

                    <div className="flex flex-col gap-0.5 max-h-60 overflow-y-auto custom-scrollbar">
                        {config.options?.map((option) => (
                            <button
                                key={option.value}
                                className={`text-left px-2 py-1.5 text-sm rounded cursor-pointer transition-colors
                            ${value === option.value
                                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 font-medium'
                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2a2e39]'
                                    }`}
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-100 dark:border-[#2a2e39] flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
                        <SlidersHorizontal size={12} />
                        <span>Manual setup...</span>
                    </div>
                </div>
            )}
        </div>
    );
};


export const FiltersPanel: React.FC<FiltersPanelProps> = ({ filters, onFilterChange, searchQuery, onSearchChange }) => {
    return (
        <div className="w-full bg-white dark:bg-[#131722] py-3 px-4 border-b border-gray-200 dark:border-[#2a2e39]">
            <div className="flex items-center flex-wrap gap-2">

                {/* Search */}
                <div className="relative group mr-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search ticker, company..."
                        className="pl-9 pr-4 h-8 w-64 rounded-full border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all dark:bg-[#2a2e39] dark:border-[#2a2e39] dark:text-gray-200 dark:focus:ring-blue-900/30"
                    />
                </div>

                <div className="h-6 w-px bg-gray-200 dark:bg-[#2a2e39] mx-1" />

                {/* Filters */}
                {FILTERS_CONFIG.map((config) => (
                    <FilterDropdown
                        key={config.id}
                        config={config}
                        value={filters[config.id]}
                        onChange={(val) => onFilterChange(config.id, val)}
                    />
                ))}

                {/* Add Filter & Clear Actions */}
                <button className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-[#2a2e39] dark:hover:bg-[#363a45] dark:text-gray-400 transition-colors ml-auto">
                    <SlidersHorizontal size={14} />
                </button>
                {Object.keys(filters).length > 0 && (
                    <button onClick={() => { /* clear logic needs robust implementation in parent or strict types */ }} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 ml-1">
                        <Trash2 size={12} />
                        Clear
                    </button>
                )}

            </div>
        </div>
    );
};
