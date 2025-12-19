import { useState, useMemo, useEffect, useCallback } from 'react';
import { StockData, MOCK_STOCKS } from '@/app/screener/utils/screenerData';

// Placeholder for API response structure
interface ScreenerResponse {
    data: StockData[];
    total: number;
}

export type SortDirection = 'asc' | 'desc';
export type SortConfig = { key: keyof StockData; direction: SortDirection } | null;

export const useScreener = () => {
    const [data, setData] = useState<StockData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<Record<string, any>>({});
    const [sortConfig, setSortConfig] = useState<SortConfig>(null);

    // When the API is ready, you will switch this flag to false or remove the mock logic.
    const USE_MOCK_DATA = true;

    // Real API Fetching Logic (Uncomment when Backend is ready)
    /*
    const fetchRealData = useCallback(async () => {
        setLoading(true);
        try {
            const result = await fetchScreenerData({ filters, sort: sortConfig, search: searchQuery });
            setData(result.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [filters, sortConfig, searchQuery]);
    */

    // TODO: REAPLCEMENT GUIDE
    // When API is ready:
    // 1. Replace the useEffect below with a data fetching function.
    // 2. Use `fetch('/api/screener', { method: 'POST', body: JSON.stringify({ filters, sort, search }) })`
    // 3. The filtering and sorting should ideally happen on the backend.
    // 4. For now, we do client-side filtering on MOCK_STOCKS.

    useEffect(() => {
        // Current MOCK Implementation
        if (USE_MOCK_DATA) {
            // client-side filtering logic below... (Keep the existing MOCK logic active)
        }
        // else {
        //    fetchRealData();
        // }

        // Simulate API delay
        const timer = setTimeout(() => {
            setData(MOCK_STOCKS);
            setLoading(false);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    const filteredData = useMemo(() => {
        let result = [...data];

        // 1. Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(stock =>
                stock.symbol.toLowerCase().includes(q) ||
                stock.name.toLowerCase().includes(q)
            );
        }

        // 2. Filters
        if (filters.marketCap) {
            if (filters.marketCap === 'mega') result = result.filter(s => s.marketCap >= 200000000000);
            else if (filters.marketCap === 'large') result = result.filter(s => s.marketCap >= 10000000000 && s.marketCap < 200000000000);
            else if (filters.marketCap === 'mid') result = result.filter(s => s.marketCap >= 2000000000 && s.marketCap < 10000000000);
            else if (filters.marketCap === 'small') result = result.filter(s => s.marketCap >= 300000000 && s.marketCap < 2000000000);
            else if (filters.marketCap === 'micro') result = result.filter(s => s.marketCap >= 50000000 && s.marketCap < 300000000);
            else if (filters.marketCap === 'nano') result = result.filter(s => s.marketCap < 50000000);
        }

        if (filters.change) {
            if (filters.change === 'up') result = result.filter(s => s.change > 0);
            else if (filters.change === 'down') result = result.filter(s => s.change < 0);
            else if (filters.change === 'up_10') result = result.filter(s => s.change > 10);
            else if (filters.change === 'down_10') result = result.filter(s => s.change < -10);
        }

        if (filters.sector && filters.sector !== 'all') {
            result = result.filter(s => s.sector === filters.sector);
        }

        if (filters.priceMin !== undefined) {
            result = result.filter(s => s.price >= filters.priceMin);
        }
        if (filters.priceMax !== undefined) {
            result = result.filter(s => s.price <= filters.priceMax);
        }

        // 3. Sorting
        if (sortConfig) {
            result.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                // Handle undefined
                if (aValue === undefined) return 1;
                if (bValue === undefined) return -1;

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [data, searchQuery, filters, sortConfig]);

    const handleSort = (key: keyof StockData) => {
        setSortConfig(current => {
            if (current?.key === key) {
                return current.direction === 'asc' ? { key, direction: 'desc' } : null;
            }
            return { key, direction: 'asc' };
        });
    };

    const updateFilter = (key: string, value: any) => {
        setFilters(prev => {
            const newFilters = { ...prev };
            if (value === 'all' || value === undefined || value === null) {
                delete newFilters[key];
            } else {
                newFilters[key] = value;
            }
            return newFilters;
        });
    };

    return {
        data: filteredData,
        loading,
        searchQuery,
        setSearchQuery,
        filters,
        updateFilter,
        sortConfig,
        handleSort,
    };
};
