import React from 'react';
import { StockData } from '@/app/screener/utils/screenerData';
import { ColumnDef, TABLE_COLUMNS } from '@/app/screener/utils/tableColumns';
import { SortConfig } from '@/lib/hooks/useScreener';
import { ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// Formatting utilities
const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
const formatPercent = (val: number) => `${val > 0 ? '+' : ''}${val.toFixed(2)}%`;
const formatCompact = (val: number) => new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 2 }).format(val);

interface ScreenerTableProps {
    data: StockData[];
    loading: boolean;
    sortConfig: SortConfig;
    onSort: (key: string) => void;
    count: number;
    onRefresh: () => void;
}

export const ScreenerTable: React.FC<ScreenerTableProps> = ({ data, loading, sortConfig, onSort, count, onRefresh }) => {

    const renderCell = (stock: StockData, col: ColumnDef) => {
        const value = (stock as any)[col.key];

        // Custom Cell Rendering
        if (col.key === 'symbol') {
            return (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-gray-100 dark:bg-[#2a2e39] flex items-center justify-center text-xs font-bold text-gray-500 dark:text-gray-400">
                        {value[0]}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-blue-600 dark:text-blue-500 font-bold text-sm hover:underline cursor-pointer">{value}</span>
                        <span className="text-gray-400 text-xs truncate max-w-[120px]">{stock.name}</span>
                    </div>
                </div>
            );
        }
        if (col.key === 'price') return <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(value)}</span>;
        if (col.key === 'change' || col.key === 'changeAmount') {
            const isPos = value > 0;
            const color = isPos ? 'text-emerald-500' : value < 0 ? 'text-rose-500' : 'text-gray-500';
            return <span className={`font-medium ${color}`}>{col.key === 'change' ? formatPercent(value) : value.toFixed(2)}</span>;
        }
        if (col.key === 'marketCap' || col.key === 'volume') return <span className="text-gray-700 dark:text-gray-300">{formatCompact(value)}</span>;

        // Default
        return <span className="text-gray-700 dark:text-gray-300">{value}</span>;
    };

    return (
        <div className="flex flex-col flex-1 min-h-0 bg-white dark:bg-[#131722]">
            {/* Table Area */}
            <div className="flex-1 overflow-auto custom-scrollbar relative">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-white dark:bg-[#131722] sticky top-0 z-10 shadow-sm">
                        <tr>
                            {TABLE_COLUMNS.map((col) => (
                                <th
                                    key={col.key}
                                    onClick={() => col.sortable && onSort(col.key)}
                                    className={`
                                py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-[#2a2e39] whitespace-nowrap
                                ${col.sortable ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2a2e39] select-none' : ''}
                                ${col.key === 'symbol' ? 'sticky left-0 bg-white dark:bg-[#131722] z-20 border-r border-gray-100 dark:border-[#2a2e39]' : ''}
                            `}
                                    style={{ textAlign: col.align || 'left' }}
                                >
                                    <div className={`flex items-center gap-1 ${col.align === 'right' ? 'justify-end' : ''}`}>
                                        {col.label}
                                        {sortConfig?.key === col.key && (
                                            sortConfig.direction === 'asc' ? <ArrowUp size={12} className="text-blue-600" /> : <ArrowDown size={12} className="text-blue-600" />
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-[#2a2e39]">
                        {loading ? (
                            <tr>
                                <td colSpan={TABLE_COLUMNS.length} className="py-20 text-center">
                                    <LoadingSpinner />
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={TABLE_COLUMNS.length} className="py-20 text-center text-gray-500">
                                    No matching stocks found.
                                </td>
                            </tr>
                        ) : (
                            data.map((stock) => (
                                <tr key={stock.symbol} className="hover:bg-gray-50 dark:hover:bg-[#2a2e39]/50 transition-colors group">
                                    {TABLE_COLUMNS.map((col) => (
                                        <td
                                            key={col.key}
                                            className={`
                                        py-3 px-4 text-sm whitespace-nowrap
                                        ${col.key === 'symbol' ? 'sticky left-0 bg-white dark:bg-[#131722] group-hover:bg-gray-50 dark:group-hover:bg-[#1e222d] z-20 border-r border-gray-100 dark:border-[#2a2e39]' : ''}
                                    `}
                                            style={{ textAlign: col.align || 'left' }}
                                        >
                                            {renderCell(stock, col)}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer Controls */}
            <div className="border-t border-gray-200 dark:border-[#2a2e39] p-3 bg-white dark:bg-[#131722] flex items-center justify-between z-20">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                    Sorted by <span className="font-medium text-gray-900 dark:text-gray-200">{sortConfig?.key || 'Default'}</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{count} matches</span>
                    <button onClick={onRefresh} className="p-2 hover:bg-gray-100 dark:hover:bg-[#2a2e39] rounded-full text-gray-500 transition-colors" title="Refresh Data">
                        <RefreshCw size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};
