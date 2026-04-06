import { useState, useCallback } from 'react';

export type SortDirection = 'asc' | 'desc';

export type SortConfig = {
    key: string;
    direction: SortDirection;
    priority: number;
};

export function useTableSort<T extends Record<string, any>>() {
    const [sortConfigs, setSortConfigs] = useState<SortConfig[]>([]);

    const handleSort = useCallback((key: string) => {
        setSortConfigs((prev) => {
            const existing = prev.find((s) => s.key === key);
            if (!existing) {
                return [...prev, { key, direction: 'asc', priority: prev.length + 1 }];
            }
            if (existing.direction === 'asc') {
                return prev.map((s) => s.key === key ? { ...s, direction: 'desc' } : s);
            }
            // Remove and re-number
            const removed = prev.filter((s) => s.key !== key);
            return removed.map((s, i) => ({ ...s, priority: i + 1 }));
        });
    }, []);

    const clearSort = useCallback(() => setSortConfigs([]), []);

    const sortedData = useCallback(
        (data: T[]): T[] => {
            if (sortConfigs.length === 0) return data;
            return [...data].sort((a, b) => {
                for (const config of [...sortConfigs].sort((x, y) => x.priority - y.priority)) {
                    const aVal = a[config.key];
                    const bVal = b[config.key];
                    const aNum = parseFloat(String(aVal).replace(/[%,]/g, ''));
                    const bNum = parseFloat(String(bVal).replace(/[%,]/g, ''));
                    let cmp = 0;
                    if (!isNaN(aNum) && !isNaN(bNum)) {
                        cmp = aNum - bNum;
                    } else {
                        cmp = String(aVal ?? '').localeCompare(String(bVal ?? ''));
                    }
                    if (cmp !== 0) return config.direction === 'asc' ? cmp : -cmp;
                }
                return 0;
            });
        },
        [sortConfigs]
    );

    return { sortConfigs, handleSort, clearSort, sortedData };
}