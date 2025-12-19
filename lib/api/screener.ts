import { StockData } from '@/app/screener/utils/screenerData';
import { SortConfig } from '@/lib/hooks/useScreener';

interface FetchScreenerParams {
    filters: Record<string, any>;
    sort: SortConfig;
    search: string;
}

interface FetchScreenerResponse {
    data: StockData[];
    total: number;
}

export const fetchScreenerData = async (params: FetchScreenerParams): Promise<FetchScreenerResponse> => {
    const response = await fetch('/api/screener', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
    });

    if (!response.ok) {
        throw new Error('Failed to fetch screener data');
    }

    return response.json();
};
