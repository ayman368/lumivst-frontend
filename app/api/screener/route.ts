import { NextResponse } from 'next/server';
import { MOCK_STOCKS } from '@/app/screener/utils/screenerData';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { filters, sort, search } = body;

        // Simulate database processing delay
        await new Promise(resolve => setTimeout(resolve, 500));

        let result = [...MOCK_STOCKS];

        // 1. Search
        if (search) {
            const q = search.toLowerCase();
            result = result.filter(stock =>
                stock.symbol.toLowerCase().includes(q) ||
                stock.name.toLowerCase().includes(q)
            );
        }

        // 2. Filters (Mirroring client-side logic for now)
        if (filters?.marketCap) {
            if (filters.marketCap === 'mega') result = result.filter(s => s.marketCap >= 200000000000);
            else if (filters.marketCap === 'large') result = result.filter(s => s.marketCap >= 10000000000 && s.marketCap < 200000000000);
            else if (filters.marketCap === 'mid') result = result.filter(s => s.marketCap >= 2000000000 && s.marketCap < 10000000000);
            else if (filters.marketCap === 'small') result = result.filter(s => s.marketCap >= 300000000 && s.marketCap < 2000000000);
            else if (filters.marketCap === 'micro') result = result.filter(s => s.marketCap >= 50000000 && s.marketCap < 300000000);
            else if (filters.marketCap === 'nano') result = result.filter(s => s.marketCap < 50000000);
        }

        // ... add other filters logic if we were truly filtering on backend.

        // 3. Sorting
        if (sort) {
            result.sort((a: any, b: any) => {
                const aValue = a[sort.key];
                const bValue = b[sort.key];

                if (aValue === undefined) return 1;
                if (bValue === undefined) return -1;

                if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return NextResponse.json({
            data: result,
            total: result.length,
        });

    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch screener data' }, { status: 500 });
    }
}
