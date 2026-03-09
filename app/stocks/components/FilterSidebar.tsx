'use client';
import React from 'react';
import { Filter } from 'lucide-react';
import type { FilterState } from '../types';
import RangeFilter from './RangeFilter';
import CheckboxGroup from './CheckboxGroup';
import CustomMultiSelect from './CustomMultiSelect';
import FilterAccordion from './FilterAccordion';

interface FilterOptions {
    sectors: string[];
    industryGroups: string[];
    industries: string[];
    subIndustries: string[];
}

interface FilterSidebarProps {
    isOpen: boolean;
    filters: FilterState;
    setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
    filterOptions: FilterOptions;
    collapseSignal: number;
    onCollapseAll: () => void;
    onClearAll: () => void;
}

export default function FilterSidebar({
    isOpen,
    filters,
    setFilters,
    filterOptions,
    collapseSignal,
    onCollapseAll,
    onClearAll,
}: FilterSidebarProps) {
    const set = (partial: Partial<FilterState>) =>
        setFilters(prev => ({ ...prev, ...partial }));

    // Helper for boolean checkbox group (Yes/No toggle)
    const boolVal = (v: string) => v === 'yes' ? ['Yes'] : v === 'no' ? ['No'] : [];
    const boolSet = (key: keyof FilterState) => (v: string[]) =>
        set({ [key]: v.includes('Yes') ? 'yes' : v.includes('No') ? 'no' : 'any' } as any);

    return (
        <div className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out overflow-hidden flex-shrink-0 ${isOpen ? 'w-64' : 'w-0'}`}>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">

                {/* Quick Search */}
                <div className="mb-4 space-y-2">
                    <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search Symbol..."
                            value={filters.symbol}
                            onChange={(e) => set({ symbol: e.target.value })}
                            className="w-full pl-10 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all outline-none"
                        />
                    </div>
                    <div className="relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search Name..."
                            value={filters.name}
                            onChange={(e) => set({ name: e.target.value })}
                            className="w-full pl-10 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all outline-none"
                        />
                    </div>
                </div>

                {/* ── Industry / Sector ─────────────────────────────────────── */}
                <FilterAccordion title="INDUSTRY FILTERS" defaultOpen={false} collapseSignal={collapseSignal}>
                    <div className="space-y-3">
                        <CustomMultiSelect options={filterOptions.sectors} selected={filters.sector} onChange={(v) => set({ sector: v })} placeholder={`Sectors (${filterOptions.sectors.length})`} icon={Filter} />
                        <CustomMultiSelect options={filterOptions.industryGroups} selected={filters.industry_group} onChange={(v) => set({ industry_group: v })} placeholder={`Industry Groups (${filterOptions.industryGroups.length})`} icon={Filter} />
                        <CustomMultiSelect options={filterOptions.industries} selected={filters.industry} onChange={(v) => set({ industry: v })} placeholder={`Industries (${filterOptions.industries.length})`} icon={Filter} />
                        <CustomMultiSelect options={filterOptions.subIndustries} selected={filters.sub_industry} onChange={(v) => set({ sub_industry: v })} placeholder={`Sub Industries (${filterOptions.subIndustries.length})`} icon={Filter} />
                    </div>
                </FilterAccordion>

                {/* ── SmartSelect Ratings ───────────────────────────────────── */}
                <FilterAccordion title="SMARTSELECT RATINGS" collapseSignal={collapseSignal}>
                    <RangeFilter label="RS Rating (0-99)" minValue={filters.rs_rating_min} maxValue={filters.rs_rating_max} onMinChange={(v) => set({ rs_rating_min: v })} onMaxChange={(v) => set({ rs_rating_max: v })} />
                    <CheckboxGroup label="Acc/Dis Rating" options={['A', 'B', 'C', 'D', 'E']} selected={filters.acc_dis_rating} onChange={(v) => set({ acc_dis_rating: v })} />
                    <CheckboxGroup label="Industry Group RS" options={['A', 'B', 'C', 'D', 'E']} selected={filters.industry_group_rs} onChange={(v) => set({ industry_group_rs: v })} />
                    <CheckboxGroup label="Sector RS" options={['A', 'B', 'C', 'D', 'E']} selected={filters.sector_rs} onChange={(v) => set({ sector_rs: v })} />
                    <CheckboxGroup label="Industry RS" options={['A', 'B', 'C', 'D', 'E']} selected={filters.industry_rs} onChange={(v) => set({ industry_rs: v })} />
                    <CheckboxGroup label="Sub Industry RS" options={['A', 'B', 'C', 'D', 'E']} selected={filters.sub_industry_rs} onChange={(v) => set({ sub_industry_rs: v })} />
                </FilterAccordion>

                {/* ── Price & Volume ────────────────────────────────────────── */}
                <FilterAccordion title="PRICE & VOLUME" collapseSignal={collapseSignal}>
                    <RangeFilter label="Close Price" minValue={filters.price_min} maxValue={filters.price_max} onMinChange={(v) => set({ price_min: v })} onMaxChange={(v) => set({ price_max: v })} />
                    <RangeFilter label="Change" minValue={filters.change_min} maxValue={filters.change_max} onMinChange={(v) => set({ change_min: v })} onMaxChange={(v) => set({ change_max: v })} />
                    <RangeFilter label="% Change" minValue={filters.percent_change_min} maxValue={filters.percent_change_max} onMinChange={(v) => set({ percent_change_min: v })} onMaxChange={(v) => set({ percent_change_max: v })} />
                    <RangeFilter label="Open" minValue={filters.open_min} maxValue={filters.open_max} onMinChange={(v) => set({ open_min: v })} onMaxChange={(v) => set({ open_max: v })} />
                    <RangeFilter label="High" minValue={filters.high_min} maxValue={filters.high_max} onMinChange={(v) => set({ high_min: v })} onMaxChange={(v) => set({ high_max: v })} />
                    <RangeFilter label="Low" minValue={filters.low_min} maxValue={filters.low_max} onMinChange={(v) => set({ low_min: v })} onMaxChange={(v) => set({ low_max: v })} />
                    <RangeFilter label="Volume" minValue={filters.volume_min} maxValue={filters.volume_max} onMinChange={(v) => set({ volume_min: v })} onMaxChange={(v) => set({ volume_max: v })} />
                    <RangeFilter label="Turnover" minValue={filters.turnover_min} maxValue={filters.turnover_max} onMinChange={(v) => set({ turnover_min: v })} onMaxChange={(v) => set({ turnover_max: v })} />
                    <RangeFilter label="Market Cap" minValue={filters.market_cap_min} maxValue={filters.market_cap_max} onMinChange={(v) => set({ market_cap_min: v })} onMaxChange={(v) => set({ market_cap_max: v })} />
                    <RangeFilter label="No. of Trades" minValue={filters.no_of_trades_min} maxValue={filters.no_of_trades_max} onMinChange={(v) => set({ no_of_trades_min: v })} onMaxChange={(v) => set({ no_of_trades_max: v })} />
                    <RangeFilter label="Avg Volume 50" minValue={filters.average_volume_50_min} maxValue={filters.average_volume_50_max} onMinChange={(v) => set({ average_volume_50_min: v })} onMaxChange={(v) => set({ average_volume_50_max: v })} />
                    <RangeFilter label="Vol Diff 50%" minValue={filters.vol_diff_50_percent_min} maxValue={filters.vol_diff_50_percent_max} onMinChange={(v) => set({ vol_diff_50_percent_min: v })} onMaxChange={(v) => set({ vol_diff_50_percent_max: v })} />
                </FilterAccordion>

                {/* ── 52-Week Range ─────────────────────────────────────────── */}
                <FilterAccordion title="52-WEEK RANGE" collapseSignal={collapseSignal}>
                    <RangeFilter label="52W High" minValue={filters.fifty_two_week_high_min} maxValue={filters.fifty_two_week_high_max} onMinChange={(v) => set({ fifty_two_week_high_min: v })} onMaxChange={(v) => set({ fifty_two_week_high_max: v })} />
                    <RangeFilter label="52W Low" minValue={filters.fifty_two_week_low_min} maxValue={filters.fifty_two_week_low_max} onMinChange={(v) => set({ fifty_two_week_low_min: v })} onMaxChange={(v) => set({ fifty_two_week_low_max: v })} />
                    <RangeFilter label="% Off 52W High" minValue={filters.percent_off_52w_high_min} maxValue={filters.percent_off_52w_high_max} onMinChange={(v) => set({ percent_off_52w_high_min: v })} onMaxChange={(v) => set({ percent_off_52w_high_max: v })} />
                    <RangeFilter label="% Off 52W Low" minValue={filters.percent_off_52w_low_min} maxValue={filters.percent_off_52w_low_max} onMinChange={(v) => set({ percent_off_52w_low_min: v })} onMaxChange={(v) => set({ percent_off_52w_low_max: v })} />
                </FilterAccordion>

                {/* ── Moving Averages % ─────────────────────────────────────── */}
                <FilterAccordion title="MOVING AVERAGES %" collapseSignal={collapseSignal}>
                    <RangeFilter label="vs EMA 10%" minValue={filters.price_vs_ema_10_min} maxValue={filters.price_vs_ema_10_max} onMinChange={(v) => set({ price_vs_ema_10_min: v })} onMaxChange={(v) => set({ price_vs_ema_10_max: v })} />
                    <RangeFilter label="vs EMA 21%" minValue={filters.price_vs_ema_21_min} maxValue={filters.price_vs_ema_21_max} onMinChange={(v) => set({ price_vs_ema_21_min: v })} onMaxChange={(v) => set({ price_vs_ema_21_max: v })} />
                    <RangeFilter label="vs SMA 50%" minValue={filters.price_vs_sma_50_min} maxValue={filters.price_vs_sma_50_max} onMinChange={(v) => set({ price_vs_sma_50_min: v })} onMaxChange={(v) => set({ price_vs_sma_50_max: v })} />
                    <RangeFilter label="vs SMA 150%" minValue={filters.price_vs_sma_150_min} maxValue={filters.price_vs_sma_150_max} onMinChange={(v) => set({ price_vs_sma_150_min: v })} onMaxChange={(v) => set({ price_vs_sma_150_max: v })} />
                    <RangeFilter label="vs SMA 200%" minValue={filters.price_vs_sma_200_min} maxValue={filters.price_vs_sma_200_max} onMinChange={(v) => set({ price_vs_sma_200_min: v })} onMaxChange={(v) => set({ price_vs_sma_200_max: v })} />
                    <RangeFilter label="Price - SMA10" minValue={filters.price_minus_sma_10_min} maxValue={filters.price_minus_sma_10_max} onMinChange={(v) => set({ price_minus_sma_10_min: v })} onMaxChange={(v) => set({ price_minus_sma_10_max: v })} />
                    <RangeFilter label="Price - SMA21" minValue={filters.price_minus_sma_21_min} maxValue={filters.price_minus_sma_21_max} onMinChange={(v) => set({ price_minus_sma_21_min: v })} onMaxChange={(v) => set({ price_minus_sma_21_max: v })} />
                    <RangeFilter label="Price - SMA50" minValue={filters.price_minus_sma_50_min} maxValue={filters.price_minus_sma_50_max} onMinChange={(v) => set({ price_minus_sma_50_min: v })} onMaxChange={(v) => set({ price_minus_sma_50_max: v })} />
                    <RangeFilter label="Price - SMA150" minValue={filters.price_minus_sma_150_min} maxValue={filters.price_minus_sma_150_max} onMinChange={(v) => set({ price_minus_sma_150_min: v })} onMaxChange={(v) => set({ price_minus_sma_150_max: v })} />
                    <RangeFilter label="Price - SMA200" minValue={filters.price_minus_sma_200_min} maxValue={filters.price_minus_sma_200_max} onMinChange={(v) => set({ price_minus_sma_200_min: v })} onMaxChange={(v) => set({ price_minus_sma_200_max: v })} />
                </FilterAccordion>

                {/* ── MA Comparisons ────────────────────────────────────────── */}
                <FilterAccordion title="MA COMPARISONS" collapseSignal={collapseSignal}>
                    <CheckboxGroup label="EMA10 > EMA21 > SMA50" options={['Yes', 'No']} selected={boolVal(filters.ema_10_21_50)} onChange={boolSet('ema_10_21_50')} />
                    <CheckboxGroup label="EMA10 > EMA21" options={['Yes', 'No']} selected={boolVal(filters.ema_10_21)} onChange={boolSet('ema_10_21')} />
                    <CheckboxGroup label="EMA10 > SMA50" options={['Yes', 'No']} selected={boolVal(filters.ema_10_gt_50sma)} onChange={boolSet('ema_10_gt_50sma')} />
                    <CheckboxGroup label="SMA10 > SMA21 > SMA50" options={['Yes', 'No']} selected={boolVal(filters.ma_10_21_50)} onChange={boolSet('ma_10_21_50')} />
                    <CheckboxGroup label="SMA50 > SMA150 > SMA200" options={['Yes', 'No']} selected={boolVal(filters.ma_50_150_200)} onChange={boolSet('ma_50_150_200')} />
                    <CheckboxGroup label="Price > 30W SMA" options={['Yes', 'No']} selected={boolVal(filters.price_gt_30w)} onChange={boolSet('price_gt_30w')} />
                    <CheckboxGroup label="Price > 40W SMA" options={['Yes', 'No']} selected={boolVal(filters.price_gt_40w)} onChange={boolSet('price_gt_40w')} />
                    <CheckboxGroup label="200MA: Now > 1M Ago" options={['Yes', 'No']} selected={boolVal(filters.ma_200_now_1m)} onChange={boolSet('ma_200_now_1m')} />
                    <CheckboxGroup label="200MA: Now > 2M Ago" options={['Yes', 'No']} selected={boolVal(filters.ma_200_now_2m)} onChange={boolSet('ma_200_now_2m')} />
                    <CheckboxGroup label="200MA: Now > 3M Ago" options={['Yes', 'No']} selected={boolVal(filters.ma_200_now_3m)} onChange={boolSet('ma_200_now_3m')} />
                    <CheckboxGroup label="200MA: Now > 4M Ago" options={['Yes', 'No']} selected={boolVal(filters.ma_200_now_4m)} onChange={boolSet('ma_200_now_4m')} />
                    <CheckboxGroup label="200MA: 1M > 2M" options={['Yes', 'No']} selected={boolVal(filters.ma_200_1m_2m)} onChange={boolSet('ma_200_1m_2m')} />
                    <CheckboxGroup label="200MA: 2M > 3M" options={['Yes', 'No']} selected={boolVal(filters.ma_200_2m_3m)} onChange={boolSet('ma_200_2m_3m')} />
                    <CheckboxGroup label="200MA: 3M > 4M" options={['Yes', 'No']} selected={boolVal(filters.ma_200_3m_4m)} onChange={boolSet('ma_200_3m_4m')} />
                    <CheckboxGroup label="200MA: 4M > 5M" options={['Yes', 'No']} selected={boolVal(filters.ma_200_4m_5m)} onChange={boolSet('ma_200_4m_5m')} />
                </FilterAccordion>

                {/* ── EMA & SMA (Daily) ─────────────────────────────────────── */}
                <FilterAccordion title="EMA & SMA (DAILY)" collapseSignal={collapseSignal}>
                    <RangeFilter label="EMA10" minValue={filters.ema_10_min} maxValue={filters.ema_10_max} onMinChange={(v) => set({ ema_10_min: v })} onMaxChange={(v) => set({ ema_10_max: v })} />
                    <RangeFilter label="EMA21" minValue={filters.ema_21_min} maxValue={filters.ema_21_max} onMinChange={(v) => set({ ema_21_min: v })} onMaxChange={(v) => set({ ema_21_max: v })} />
                    <RangeFilter label="SMA3" minValue={filters.sma_3_min} maxValue={filters.sma_3_max} onMinChange={(v) => set({ sma_3_min: v })} onMaxChange={(v) => set({ sma_3_max: v })} />
                </FilterAccordion>

                {/* ── SMA (Weekly) ──────────────────────────────────────────── */}
                <FilterAccordion title="SMA (WEEKLY)" collapseSignal={collapseSignal}>
                    <RangeFilter label="SMA4(W)" minValue={filters.sma_4w_min} maxValue={filters.sma_4w_max} onMinChange={(v) => set({ sma_4w_min: v })} onMaxChange={(v) => set({ sma_4w_max: v })} />
                    <RangeFilter label="SMA9(W)" minValue={filters.sma_9w_min} maxValue={filters.sma_9w_max} onMinChange={(v) => set({ sma_9w_min: v })} onMaxChange={(v) => set({ sma_9w_max: v })} />
                    <RangeFilter label="SMA18(W)" minValue={filters.sma_18w_min} maxValue={filters.sma_18w_max} onMinChange={(v) => set({ sma_18w_min: v })} onMaxChange={(v) => set({ sma_18w_max: v })} />
                    <RangeFilter label="SMA30(W)" minValue={filters.sma_30w_min} maxValue={filters.sma_30w_max} onMinChange={(v) => set({ sma_30w_min: v })} onMaxChange={(v) => set({ sma_30w_max: v })} />
                    <RangeFilter label="SMA40(W)" minValue={filters.sma_40w_min} maxValue={filters.sma_40w_max} onMinChange={(v) => set({ sma_40w_min: v })} onMaxChange={(v) => set({ sma_40w_max: v })} />
                </FilterAccordion>

                {/* ── 200MA Historical ─────────────────────────────────────── */}
                <FilterAccordion title="200MA HISTORICAL" collapseSignal={collapseSignal}>
                    <RangeFilter label="200MA (1 Month Ago)" minValue={filters.sma_200_1m_min} maxValue={filters.sma_200_1m_max} onMinChange={(v) => set({ sma_200_1m_min: v })} onMaxChange={(v) => set({ sma_200_1m_max: v })} />
                    <RangeFilter label="200MA (2 Months Ago)" minValue={filters.sma_200_2m_min} maxValue={filters.sma_200_2m_max} onMinChange={(v) => set({ sma_200_2m_min: v })} onMaxChange={(v) => set({ sma_200_2m_max: v })} />
                    <RangeFilter label="200MA (3 Months Ago)" minValue={filters.sma_200_3m_min} maxValue={filters.sma_200_3m_max} onMinChange={(v) => set({ sma_200_3m_min: v })} onMaxChange={(v) => set({ sma_200_3m_max: v })} />
                    <RangeFilter label="200MA (4 Months Ago)" minValue={filters.sma_200_4m_min} maxValue={filters.sma_200_4m_max} onMinChange={(v) => set({ sma_200_4m_min: v })} onMaxChange={(v) => set({ sma_200_4m_max: v })} />
                    <RangeFilter label="200MA (5 Months Ago)" minValue={filters.sma_200_5m_min} maxValue={filters.sma_200_5m_max} onMinChange={(v) => set({ sma_200_5m_min: v })} onMaxChange={(v) => set({ sma_200_5m_max: v })} />
                </FilterAccordion>

                {/* ── RSI: Daily ───────────────────────────────────────────── */}
                <FilterAccordion title="RSI: DAILY" collapseSignal={collapseSignal}>
                    <div className="mb-3">
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">RSI</div>
                        <RangeFilter label="RSI(14)" minValue={filters.rsi_14_min} maxValue={filters.rsi_14_max} onMinChange={(v) => set({ rsi_14_min: v })} onMaxChange={(v) => set({ rsi_14_max: v })} />
                        <RangeFilter label="SMA9(RSI)" minValue={filters.sma9_rsi_min} maxValue={filters.sma9_rsi_max} onMinChange={(v) => set({ sma9_rsi_min: v })} onMaxChange={(v) => set({ sma9_rsi_max: v })} />
                        <RangeFilter label="WMA45(RSI)" minValue={filters.wma45_rsi_min} maxValue={filters.wma45_rsi_max} onMinChange={(v) => set({ wma45_rsi_min: v })} onMaxChange={(v) => set({ wma45_rsi_max: v })} />
                        <RangeFilter label="EMA20(SMA3)" minValue={filters.ema20_sma3_min} maxValue={filters.ema20_sma3_max} onMinChange={(v) => set({ ema20_sma3_min: v })} onMaxChange={(v) => set({ ema20_sma3_max: v })} />
                    </div>
                    <div className="mb-3">
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">The Number</div>
                        <RangeFilter label="THE.NUMBER" minValue={filters.the_number_min} maxValue={filters.the_number_max} onMinChange={(v) => set({ the_number_min: v })} onMaxChange={(v) => set({ the_number_max: v })} />
                        <RangeFilter label="THE.NUMBER.HIGH" minValue={filters.the_number_hl_min} maxValue={filters.the_number_hl_max} onMinChange={(v) => set({ the_number_hl_min: v })} onMaxChange={(v) => set({ the_number_hl_max: v })} />
                        <RangeFilter label="THE.NUMBER.LOW" minValue={filters.the_number_ll_min} maxValue={filters.the_number_ll_max} onMinChange={(v) => set({ the_number_ll_min: v })} onMaxChange={(v) => set({ the_number_ll_max: v })} />
                    </div>
                    <div className="mb-3">
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">CFG</div>
                        <RangeFilter label="CFG" minValue={filters.cfg_daily_min} maxValue={filters.cfg_daily_max} onMinChange={(v) => set({ cfg_daily_min: v })} onMaxChange={(v) => set({ cfg_daily_max: v })} />
                        <RangeFilter label="CFG.SMA4" minValue={filters.cfg_sma4_min} maxValue={filters.cfg_sma4_max} onMinChange={(v) => set({ cfg_sma4_min: v })} onMaxChange={(v) => set({ cfg_sma4_max: v })} />
                        <RangeFilter label="CFG.EMA45" minValue={filters.cfg_ema45_min} maxValue={filters.cfg_ema45_max} onMinChange={(v) => set({ cfg_ema45_min: v })} onMaxChange={(v) => set({ cfg_ema45_max: v })} />
                    </div>
                    <div className="border-t border-gray-200 my-3" />
                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">Cross Filters</div>
                    <CheckboxGroup label="Price > The Number" options={['Yes', 'No']} selected={boolVal(filters.price_gt_the_number_daily)} onChange={boolSet('price_gt_the_number_daily')} />
                    <CheckboxGroup label="Price > The Number High" options={['Yes', 'No']} selected={boolVal(filters.price_gt_the_number_hl_daily)} onChange={boolSet('price_gt_the_number_hl_daily')} />
                    <CheckboxGroup label="Price > The Number Low" options={['Yes', 'No']} selected={boolVal(filters.price_gt_the_number_ll_daily)} onChange={boolSet('price_gt_the_number_ll_daily')} />
                    <CheckboxGroup label="9SMA > The Number" options={['Yes', 'No']} selected={boolVal(filters.sma9_gt_the_number_daily)} onChange={boolSet('sma9_gt_the_number_daily')} />
                    <CheckboxGroup label="9SMA > The Number High" options={['Yes', 'No']} selected={boolVal(filters.sma9_gt_the_number_hl_daily)} onChange={boolSet('sma9_gt_the_number_hl_daily')} />
                    <CheckboxGroup label="9SMA > The Number Low" options={['Yes', 'No']} selected={boolVal(filters.sma9_gt_the_number_ll_daily)} onChange={boolSet('sma9_gt_the_number_ll_daily')} />
                    <CheckboxGroup label="9SMA > WMA45" options={['Yes', 'No']} selected={boolVal(filters.sma9_gt_wma45_daily)} onChange={boolSet('sma9_gt_wma45_daily')} />
                    <CheckboxGroup label="RSI > 9SMA(RSI)" options={['Yes', 'No']} selected={boolVal(filters.rsi_gt_sma9rsi_daily)} onChange={boolSet('rsi_gt_sma9rsi_daily')} />
                    <CheckboxGroup label="RSI > WMA45(RSI)" options={['Yes', 'No']} selected={boolVal(filters.rsi_gt_wma45rsi_daily)} onChange={boolSet('rsi_gt_wma45rsi_daily')} />
                    <CheckboxGroup label="9SMA(RSI) > WMA45" options={['Yes', 'No']} selected={boolVal(filters.sma9rsi_gt_wma45_daily)} onChange={boolSet('sma9rsi_gt_wma45_daily')} />
                    <CheckboxGroup label="WMA45(RSI) < SMA9(RSI)" options={['Yes', 'No']} selected={boolVal(filters.wma45rsi_lt_sma9rsi_daily)} onChange={boolSet('wma45rsi_lt_sma9rsi_daily')} />
                    <CheckboxGroup label="WMA45(RSI) < WMA45(Close)" options={['Yes', 'No']} selected={boolVal(filters.wma45rsi_lt_wma45_daily)} onChange={boolSet('wma45rsi_lt_wma45_daily')} />
                    <CheckboxGroup label="WMA45(RSI) < WMA45(CFG)" options={['Yes', 'No']} selected={boolVal(filters.wma45rsi_lt_cfgwma45_daily)} onChange={boolSet('wma45rsi_lt_cfgwma45_daily')} />
                    <CheckboxGroup label="WMA45(RSI) < EMA20(SMA3)" options={['Yes', 'No']} selected={boolVal(filters.wma45rsi_lt_ema20sma3_daily)} onChange={boolSet('wma45rsi_lt_ema20sma3_daily')} />
                </FilterAccordion>

                {/* ── RSI: Weekly ───────────────────────────────────────────── */}
                <FilterAccordion title="RSI: WEEKLY" collapseSignal={collapseSignal}>
                    <div className="mb-3">
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">RSI</div>
                        <RangeFilter label="RSI(14)(W)" minValue={filters.rsi_w_min} maxValue={filters.rsi_w_max} onMinChange={(v) => set({ rsi_w_min: v })} onMaxChange={(v) => set({ rsi_w_max: v })} />
                        <RangeFilter label="SMA9(RSI)(W)" minValue={filters.sma9_rsi_w_min} maxValue={filters.sma9_rsi_w_max} onMinChange={(v) => set({ sma9_rsi_w_min: v })} onMaxChange={(v) => set({ sma9_rsi_w_max: v })} />
                        <RangeFilter label="WMA45(RSI)(W)" minValue={filters.wma45_rsi_w_min} maxValue={filters.wma45_rsi_w_max} onMinChange={(v) => set({ wma45_rsi_w_min: v })} onMaxChange={(v) => set({ wma45_rsi_w_max: v })} />
                        <RangeFilter label="EMA20(SMA3)(W)" minValue={filters.ema20_sma3_w_min} maxValue={filters.ema20_sma3_w_max} onMinChange={(v) => set({ ema20_sma3_w_min: v })} onMaxChange={(v) => set({ ema20_sma3_w_max: v })} />
                    </div>
                    <div className="mb-3">
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">The Number (Weekly)</div>
                        <RangeFilter label="THE.NUMBER(W)" minValue={filters.the_number_w_min} maxValue={filters.the_number_w_max} onMinChange={(v) => set({ the_number_w_min: v })} onMaxChange={(v) => set({ the_number_w_max: v })} />
                        <RangeFilter label="THE.NUMBER.HIGH(W)" minValue={filters.the_number_hl_w_min} maxValue={filters.the_number_hl_w_max} onMinChange={(v) => set({ the_number_hl_w_min: v })} onMaxChange={(v) => set({ the_number_hl_w_max: v })} />
                        <RangeFilter label="THE.NUMBER.LOW(W)" minValue={filters.the_number_ll_w_min} maxValue={filters.the_number_ll_w_max} onMinChange={(v) => set({ the_number_ll_w_min: v })} onMaxChange={(v) => set({ the_number_ll_w_max: v })} />
                    </div>
                    <div className="mb-3">
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">CFG (Weekly)</div>
                        <RangeFilter label="CFG(W)" minValue={filters.cfg_w_min} maxValue={filters.cfg_w_max} onMinChange={(v) => set({ cfg_w_min: v })} onMaxChange={(v) => set({ cfg_w_max: v })} />
                        <RangeFilter label="CFG.SMA4(W)" minValue={filters.cfg_sma4_w_min} maxValue={filters.cfg_sma4_w_max} onMinChange={(v) => set({ cfg_sma4_w_min: v })} onMaxChange={(v) => set({ cfg_sma4_w_max: v })} />
                        <RangeFilter label="CFG.EMA45(W)" minValue={filters.cfg_ema45_w_min} maxValue={filters.cfg_ema45_w_max} onMinChange={(v) => set({ cfg_ema45_w_min: v })} onMaxChange={(v) => set({ cfg_ema45_w_max: v })} />
                    </div>
                    <div className="border-t border-gray-200 my-3" />
                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">Cross Filters</div>
                    <CheckboxGroup label="Price > The Number" options={['Yes', 'No']} selected={boolVal(filters.price_gt_the_number_weekly)} onChange={boolSet('price_gt_the_number_weekly')} />
                    <CheckboxGroup label="Price > The Number High" options={['Yes', 'No']} selected={boolVal(filters.price_gt_the_number_hl_weekly)} onChange={boolSet('price_gt_the_number_hl_weekly')} />
                    <CheckboxGroup label="Price > The Number Low" options={['Yes', 'No']} selected={boolVal(filters.price_gt_the_number_ll_weekly)} onChange={boolSet('price_gt_the_number_ll_weekly')} />
                    <CheckboxGroup label="9SMA > The Number" options={['Yes', 'No']} selected={boolVal(filters.sma9_gt_the_number_weekly)} onChange={boolSet('sma9_gt_the_number_weekly')} />
                    <CheckboxGroup label="9SMA > The Number High" options={['Yes', 'No']} selected={boolVal(filters.sma9_gt_the_number_hl_weekly)} onChange={boolSet('sma9_gt_the_number_hl_weekly')} />
                    <CheckboxGroup label="9SMA > The Number Low" options={['Yes', 'No']} selected={boolVal(filters.sma9_gt_the_number_ll_weekly)} onChange={boolSet('sma9_gt_the_number_ll_weekly')} />
                    <CheckboxGroup label="9SMA > WMA45" options={['Yes', 'No']} selected={boolVal(filters.sma9_gt_wma45_weekly)} onChange={boolSet('sma9_gt_wma45_weekly')} />
                    <CheckboxGroup label="RSI > 9SMA(RSI)" options={['Yes', 'No']} selected={boolVal(filters.rsi_gt_sma9rsi_weekly)} onChange={boolSet('rsi_gt_sma9rsi_weekly')} />
                    <CheckboxGroup label="RSI > WMA45(RSI)" options={['Yes', 'No']} selected={boolVal(filters.rsi_gt_wma45rsi_weekly)} onChange={boolSet('rsi_gt_wma45rsi_weekly')} />
                    <CheckboxGroup label="9SMA(RSI) > WMA45" options={['Yes', 'No']} selected={boolVal(filters.sma9rsi_gt_wma45_weekly)} onChange={boolSet('sma9rsi_gt_wma45_weekly')} />
                    <CheckboxGroup label="WMA45(RSI) < SMA9(RSI)" options={['Yes', 'No']} selected={boolVal(filters.wma45rsi_lt_sma9rsi_weekly)} onChange={boolSet('wma45rsi_lt_sma9rsi_weekly')} />
                    <CheckboxGroup label="WMA45(RSI) < WMA45(Close)" options={['Yes', 'No']} selected={boolVal(filters.wma45rsi_lt_wma45_weekly)} onChange={boolSet('wma45rsi_lt_wma45_weekly')} />
                    <CheckboxGroup label="WMA45(RSI) < WMA45(CFG)" options={['Yes', 'No']} selected={boolVal(filters.wma45rsi_lt_cfgwma45_weekly)} onChange={boolSet('wma45rsi_lt_cfgwma45_weekly')} />
                    <CheckboxGroup label="WMA45(RSI) < EMA20(SMA3)" options={['Yes', 'No']} selected={boolVal(filters.wma45rsi_lt_ema20sma3_weekly)} onChange={boolSet('wma45rsi_lt_ema20sma3_weekly')} />
                </FilterAccordion>

                {/* ── STAMP ────────────────────────────────────────────────── */}
                <FilterAccordion title="STAMP FILTERS" collapseSignal={collapseSignal}>
                    <div className="mb-3">
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">STAMP (Daily)</div>
                        <RangeFilter label="STAMP.EMA45(RSI)" minValue={filters.stamp_e45rsi_min} maxValue={filters.stamp_e45rsi_max} onMinChange={(v) => set({ stamp_e45rsi_min: v })} onMaxChange={(v) => set({ stamp_e45rsi_max: v })} />
                        <RangeFilter label="STAMP.EMA20(SMA3)" minValue={filters.stamp_e20sma3_min} maxValue={filters.stamp_e20sma3_max} onMinChange={(v) => set({ stamp_e20sma3_min: v })} onMaxChange={(v) => set({ stamp_e20sma3_max: v })} />
                    </div>
                    <div className="mb-3">
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">STAMP (Weekly)</div>
                        <RangeFilter label="STAMP.EMA45(RSI)(W)" minValue={filters.stamp_e45rsi_w_min} maxValue={filters.stamp_e45rsi_w_max} onMinChange={(v) => set({ stamp_e45rsi_w_min: v })} onMaxChange={(v) => set({ stamp_e45rsi_w_max: v })} />
                        <RangeFilter label="STAMP.EMA20(SMA3)(W)" minValue={filters.stamp_e20sma3_w_min} maxValue={filters.stamp_e20sma3_w_max} onMinChange={(v) => set({ stamp_e20sma3_w_min: v })} onMaxChange={(v) => set({ stamp_e20sma3_w_max: v })} />
                    </div>
                    <div className="border-t border-gray-200 my-3" />
                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">Boolean Indicators</div>
                    <CheckboxGroup label="SMA9 > WMA45" options={['Yes', 'No']} selected={boolVal(filters.stamp_sma9_gt_wma45)} onChange={boolSet('stamp_sma9_gt_wma45')} />
                    <CheckboxGroup label="SMA9 RSI > WMA45" options={['Yes', 'No']} selected={boolVal(filters.stamp_sma9rsi_gt_wma45)} onChange={boolSet('stamp_sma9rsi_gt_wma45')} />
                    <CheckboxGroup label="EMA45 RSI > 50" options={['Yes', 'No']} selected={boolVal(filters.stamp_ema45rsi_gt_50)} onChange={boolSet('stamp_ema45rsi_gt_50')} />
                    <CheckboxGroup label="EMA45 CFG > 50" options={['Yes', 'No']} selected={boolVal(filters.stamp_ema45cfg_gt_50)} onChange={boolSet('stamp_ema45cfg_gt_50')} />
                    <CheckboxGroup label="EMA20 SMA3 > 50" options={['Yes', 'No']} selected={boolVal(filters.stamp_ema20sma3_gt_50)} onChange={boolSet('stamp_ema20sma3_gt_50')} />
                    <CheckboxGroup label="EMA45 RSI < STAMP Lines" options={['Yes', 'No']} selected={boolVal(filters.stamp_ema45rsi_lt_stamp_lines)} onChange={boolSet('stamp_ema45rsi_lt_stamp_lines')} />
                </FilterAccordion>

                {/* ── Alrayan (Price) ───────────────────────────────────────── */}
                <FilterAccordion title="ALRAYAN: PRICE" collapseSignal={collapseSignal}>
                    <div className="mb-2">
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">Daily</div>
                        <RangeFilter label="SMA4" minValue={filters.sma4_min} maxValue={filters.sma4_max} onMinChange={(v) => set({ sma4_min: v })} onMaxChange={(v) => set({ sma4_max: v })} />
                        <RangeFilter label="SMA9" minValue={filters.sma9_price_min} maxValue={filters.sma9_price_max} onMinChange={(v) => set({ sma9_price_min: v })} onMaxChange={(v) => set({ sma9_price_max: v })} />
                        <RangeFilter label="SMA18" minValue={filters.sma18_min} maxValue={filters.sma18_max} onMinChange={(v) => set({ sma18_min: v })} onMaxChange={(v) => set({ sma18_max: v })} />
                        <RangeFilter label="WMA45(Price)" minValue={filters.wma45_close_min} maxValue={filters.wma45_close_max} onMinChange={(v) => set({ wma45_close_min: v })} onMaxChange={(v) => set({ wma45_close_max: v })} />
                        <CheckboxGroup label="Price > 18SMA (Daily)" options={['Yes', 'No']} selected={boolVal(filters.price_gt_18sma_daily)} onChange={boolSet('price_gt_18sma_daily')} />
                        <CheckboxGroup label="SMA4 > SMA9 > SMA18 (Daily)" options={['Yes', 'No']} selected={boolVal(filters.sma_4_9_18_daily)} onChange={boolSet('sma_4_9_18_daily')} />
                    </div>
                    <div className="border-t border-gray-200 my-3" />
                    <div className="mb-2">
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">Weekly</div>
                        <RangeFilter label="SMA4(W)" minValue={filters.sma4_w_min} maxValue={filters.sma4_w_max} onMinChange={(v) => set({ sma4_w_min: v })} onMaxChange={(v) => set({ sma4_w_max: v })} />
                        <RangeFilter label="SMA9(W)" minValue={filters.sma9_w_min} maxValue={filters.sma9_w_max} onMinChange={(v) => set({ sma9_w_min: v })} onMaxChange={(v) => set({ sma9_w_max: v })} />
                        <RangeFilter label="SMA18(W)" minValue={filters.sma18_w_min} maxValue={filters.sma18_w_max} onMinChange={(v) => set({ sma18_w_min: v })} onMaxChange={(v) => set({ sma18_w_max: v })} />
                        <RangeFilter label="WMA45(Price)(W)" minValue={filters.wma45_close_w_min} maxValue={filters.wma45_close_w_max} onMinChange={(v) => set({ wma45_close_w_min: v })} onMaxChange={(v) => set({ wma45_close_w_max: v })} />
                        <CheckboxGroup label="Price > 9SMA (Weekly)" options={['Yes', 'No']} selected={boolVal(filters.price_gt_9sma_weekly)} onChange={boolSet('price_gt_9sma_weekly')} />
                        <CheckboxGroup label="SMA4 > SMA9 > SMA18 (Weekly)" options={['Yes', 'No']} selected={boolVal(filters.sma_4_9_18_weekly)} onChange={boolSet('sma_4_9_18_weekly')} />
                    </div>
                </FilterAccordion>

                {/* ── Alrayan (CCI) ─────────────────────────────────────────── */}
                <FilterAccordion title="ALRAYAN: CCI" collapseSignal={collapseSignal}>
                    <div className="mb-2">
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">Daily</div>
                        <RangeFilter label="CCI(14)" minValue={filters.cci_min} maxValue={filters.cci_max} onMinChange={(v) => set({ cci_min: v })} onMaxChange={(v) => set({ cci_max: v })} />
                        <RangeFilter label="CCI.EMA20" minValue={filters.cci_ema20_min} maxValue={filters.cci_ema20_max} onMinChange={(v) => set({ cci_ema20_min: v })} onMaxChange={(v) => set({ cci_ema20_max: v })} />
                        <CheckboxGroup label="CCI(14) > 100" options={['Yes', 'No']} selected={boolVal(filters.cci_gt_100)} onChange={boolSet('cci_gt_100')} />
                        <CheckboxGroup label="CCI EMA(20) > 0 (Daily)" options={['Yes', 'No']} selected={boolVal(filters.cci_ema20_gt_0_daily)} onChange={boolSet('cci_ema20_gt_0_daily')} />
                    </div>
                    <div className="border-t border-gray-200 my-3" />
                    <div className="mb-2">
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">Weekly</div>
                        <RangeFilter label="CCI(14)(W)" minValue={filters.cci_w_min} maxValue={filters.cci_w_max} onMinChange={(v) => set({ cci_w_min: v })} onMaxChange={(v) => set({ cci_w_max: v })} />
                        <RangeFilter label="CCI.EMA20(W)" minValue={filters.cci_ema20_w_min} maxValue={filters.cci_ema20_w_max} onMinChange={(v) => set({ cci_ema20_w_min: v })} onMaxChange={(v) => set({ cci_ema20_w_max: v })} />
                        <CheckboxGroup label="CCI EMA(20) > 0 (Weekly)" options={['Yes', 'No']} selected={boolVal(filters.cci_ema20_gt_0_weekly)} onChange={boolSet('cci_ema20_gt_0_weekly')} />
                    </div>
                </FilterAccordion>

                {/* ── Alrayan (AROON) ───────────────────────────────────────── */}
                <FilterAccordion title="ALRAYAN: AROON" collapseSignal={collapseSignal}>
                    <div className="mb-2">
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">Daily</div>
                        <RangeFilter label="AROON.UP" minValue={filters.aroon_up_min} maxValue={filters.aroon_up_max} onMinChange={(v) => set({ aroon_up_min: v })} onMaxChange={(v) => set({ aroon_up_max: v })} />
                        <RangeFilter label="AROON.DOWN" minValue={filters.aroon_down_min} maxValue={filters.aroon_down_max} onMinChange={(v) => set({ aroon_down_min: v })} onMaxChange={(v) => set({ aroon_down_max: v })} />
                        <CheckboxGroup label="Aroon Up > 70%" options={['Yes', 'No']} selected={boolVal(filters.aroon_up_gt_70)} onChange={boolSet('aroon_up_gt_70')} />
                        <CheckboxGroup label="Aroon Down < 30%" options={['Yes', 'No']} selected={boolVal(filters.aroon_down_lt_30)} onChange={boolSet('aroon_down_lt_30')} />
                    </div>
                    <div className="border-t border-gray-200 my-3" />
                    <div className="mb-2">
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">Weekly</div>
                        <RangeFilter label="AROON.UP(W)" minValue={filters.aroon_up_w_min} maxValue={filters.aroon_up_w_max} onMinChange={(v) => set({ aroon_up_w_min: v })} onMaxChange={(v) => set({ aroon_up_w_max: v })} />
                        <RangeFilter label="AROON.DOWN(W)" minValue={filters.aroon_down_w_min} maxValue={filters.aroon_down_w_max} onMinChange={(v) => set({ aroon_down_w_min: v })} onMaxChange={(v) => set({ aroon_down_w_max: v })} />
                    </div>
                </FilterAccordion>

            </div>

            {/* Sidebar Footer */}
            <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="flex flex-col space-y-3">
                    <button
                        onClick={onCollapseAll}
                        className="w-full px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all flex items-center justify-center space-x-2 border border-gray-200"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <span>Collapse All Sections</span>
                    </button>
                    <button
                        onClick={onClearAll}
                        className="w-full px-4 py-2.5 text-sm font-semibold text-red-600 bg-white border border-red-200 hover:bg-red-50 rounded-lg transition-all flex items-center justify-center space-x-2 shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>Reset All Filters</span>
                    </button>
                </div>
            </div>
        </div>
    );
}