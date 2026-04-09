import React from 'react';
import { SortConfig } from './useTableSort';

type Props = {
    label: string;
    sortKey: string;
    sortConfigs: SortConfig[];
    onSort: (key: string) => void;
    className?: string;
    rowSpan?: number;
    colSpan?: number;
};

export function SortableHeader({ label, sortKey, sortConfigs, onSort, className = '', rowSpan, colSpan }: Props) {
    const config = sortConfigs.find((s) => s.key === sortKey);
    const isActive = !!config;

    let justifyClass = 'justify-start';
    if (className.includes('text-center')) justifyClass = 'justify-center';
    if (className.includes('text-right')) justifyClass = 'justify-end';

    return (
        <th
            className={`px-4 py-3 font-semibold cursor-pointer select-none group ${className}`}
            onClick={() => onSort(sortKey)}
            rowSpan={rowSpan}
            colSpan={colSpan}
        >
            <div className={`flex items-center gap-1.5 whitespace-nowrap ${justifyClass}`}>
                <span
                    className={
                        isActive
                            ? 'text-blue-600'
                            : 'text-gray-600 group-hover:text-gray-900 transition-colors'
                    }
                >
                    {label}
                </span>

                <div className="flex flex-col items-center gap-[1px]">
                    <svg
                        width="8" height="5" viewBox="0 0 8 5" fill="none"
                        className={`transition-colors ${isActive && config.direction === 'asc'
                            ? 'text-blue-500'
                            : 'text-gray-300 group-hover:text-gray-400'
                            }`}
                    >
                        <path d="M4 0L8 5H0L4 0Z" fill="currentColor" />
                    </svg>
                    <svg
                        width="8" height="5" viewBox="0 0 8 5" fill="none"
                        className={`transition-colors ${isActive && config.direction === 'desc'
                            ? 'text-blue-500'
                            : 'text-gray-300 group-hover:text-gray-400'
                            }`}
                    >
                        <path d="M4 5L0 0H8L4 5Z" fill="currentColor" />
                    </svg>
                </div>

                {isActive && (
                    <span className="ml-0.5 flex items-center justify-center w-4 h-4 rounded-full bg-blue-500 text-white text-[10px] font-bold leading-none">
                        {config.priority}
                    </span>
                )}
            </div>
        </th>
    );
}