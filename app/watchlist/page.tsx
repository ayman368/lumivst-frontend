'use client';

import { useState } from 'react';
import { Filter } from 'lucide-react';
import RSScreener from '@/components/Screener/RSScreener';
import MarketOverview from '@/components/Watchlist/MarketOverview';
import RSMatrix from '@/components/Watchlist/RSMatrix';
import MatrixChart from '@/components/Watchlist/MatrixChart';
import {
    WatchlistShariahProvider,
    useWatchlistShariah,
} from '@/components/Watchlist/WatchlistShariahContext';
import CustomMultiSelect from '@/app/stocks/components/CustomMultiSelect';
import ActiveFilterBadge from '@/app/stocks/components/ActiveFilterBadge';

// ── Shariah filter مضغوط يتحط جوه شريط الـ tabs ──────────────────────────────
function ShariahInlineFilter() {
    const { selected, setSelected, options, loading } = useWatchlistShariah();

    return (
        <div className="flex items-center gap-2 ml-auto bg-[#2a2e39] px-2 py-0.5 rounded border border-[#363c4b] shadow-sm my-0 mr-1">
            <div className="flex items-center gap-1">
                <Filter size={12} className="text-[#2962ff]" />
                <span className="text-[#d1d4dc] text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                    Shariah & Margin
                </span>
            </div>

            <div className="h-3 w-[1px] bg-[#434651]"></div>

            {loading ? (
                <span className="text-[#787b86] text-[10px]">Loading...</span>
            ) : (
                <div className="w-[170px]">
                    <CustomMultiSelect
                        options={options}
                        selected={selected}
                        onChange={setSelected}
                        placeholder="Status"
                        size="sm"
                    />
                </div>
            )}

            {selected.length > 0 && (
                <>
                    <div className="h-3 w-[1px] bg-[#434651]"></div>
                    <div className="flex items-center gap-1">
                        {selected.map((v) => (
                            <ActiveFilterBadge
                                key={v}
                                label=""
                                value={v}
                                onRemove={() => setSelected(selected.filter((x) => x !== v))}
                            />
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={() => setSelected([])}
                        className="text-[10px] font-medium text-[#ef5350] hover:text-[#ff8a80] whitespace-nowrap transition-colors bg-[#ef5350]/10 hover:bg-[#ef5350]/20 px-1.5 py-0.5 rounded"
                    >
                        Clear
                    </button>
                </>
            )}
        </div>
    );
}

// ── الصفحة الرئيسية ───────────────────────────────────────────────────────────
function WatchlistContent() {
    const [activeTab, setActiveTab] = useState('Overview');
    const tabs = ['Overview', 'RS Matrix', 'Matrix Chart', 'RS Screener'];

    return (
        <div className="flex flex-col min-h-[calc(100vh-64px)] bg-[#131722]">

            {/* ── Tabs + Shariah filter في نفس الشريط ── */}
            <div className="border-b border-[#2a2e39] bg-[#1e222d] px-4 shrink-0 flex items-center relative z-40">
                {/* Tabs */}
                <div className="flex space-x-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${
                                activeTab === tab
                                    ? 'border-[#2962ff] text-[#2962ff]'
                                    : 'border-transparent text-[#787b86] hover:text-[#d1d4dc] hover:border-[#787b86]'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Shariah filter — يمين الشريط */}
                <ShariahInlineFilter />
            </div>

            {/* ── Content ── */}
            <div className="flex-1">
                {activeTab === 'Overview'      && <MarketOverview />}
                {activeTab === 'RS Matrix'     && <RSMatrix />}
                {activeTab === 'Matrix Chart'  && <MatrixChart />}
                {activeTab === 'RS Screener'   && <RSScreener />}
            </div>
        </div>
    );
}

// ── Export: Provider يلف كل حاجة ─────────────────────────────────────────────
export default function WatchlistPage() {
    return (
        <WatchlistShariahProvider>
            <WatchlistContent />
        </WatchlistShariahProvider>
    );
}