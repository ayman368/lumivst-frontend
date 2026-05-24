'use client';

import RSScreener from '@/components/Screener/RSScreener';
import { ShariahFilterPage } from '@/components/Watchlist/WatchlistShariahContext';

export default function RSScreenerPage() {
    return (
        <ShariahFilterPage variant="light" className="min-h-[calc(100vh-64px)]">
            <RSScreener />
        </ShariahFilterPage>
    );
}
