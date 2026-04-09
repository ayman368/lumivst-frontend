"use client";

import { useState, useCallback } from 'react';

export type RangeValues = Record<string, { min: string; max: string }>;

function parseNum(val: string): number | null {
    const n = parseFloat(val.replace(/,/g, ''));
    return isNaN(n) ? null : n;
}

function extractNum(val: string): number | null {
    if (!val) return null;
    const cleaned = val.replace(/[%,\s]/g, '');
    return parseNum(cleaned);
}

export function useFilters<T extends Record<string, any>>(
    data: T[],
    searchKeys: (keyof T)[],
    rangeKeys: (keyof T)[]
) {
    const [searchValue, setSearchValue] = useState('');
    const [rangeValues, setRangeValues] = useState<RangeValues>({});

    const handleRangeChange = useCallback((key: string, min: string, max: string) => {
        setRangeValues((prev) => ({ ...prev, [key]: { min, max } }));
    }, []);

    const handleClearAll = useCallback(() => {
        setSearchValue('');
        setRangeValues({});
    }, []);

    const filteredData = data.filter((row) => {
        // Search filter
        if (searchValue.trim()) {
            const q = searchValue.toLowerCase();
            const matches = searchKeys.some((k) =>
                String(row[k] ?? '').toLowerCase().includes(q)
            );
            if (!matches) return false;
        }

        // Range filters
        for (const key of rangeKeys) {
            const range = rangeValues[key as string];
            if (!range) continue;
            const { min, max } = range;
            if (!min && !max) continue;

            const cellVal = extractNum(String(row[key] ?? ''));
            if (cellVal === null) continue;

            if (min && parseNum(min) !== null && cellVal < parseNum(min)!) return false;
            if (max && parseNum(max) !== null && cellVal > parseNum(max)!) return false;
        }

        return true;
    });

    return {
        searchValue,
        rangeValues,
        filteredData,
        setSearchValue,
        handleRangeChange,
        handleClearAll,
    };
}