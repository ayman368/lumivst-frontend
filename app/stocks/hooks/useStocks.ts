import { useState, useEffect, useCallback } from 'react';
import type { Stock, StockMetadata } from '../types';
import { API_BASE_URL } from '@/lib/api/config';

export default function useStocks() {
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [metadata, setMetadata] = useState<StockMetadata | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStocks = useCallback(async () => {
        try {
            setLoading(true);

            const [pricesRes, rsRes, techRes] = await Promise.all([
                fetch(`${API_BASE_URL}/api/prices/latest`, { cache: 'no-store', credentials: 'include' }),
                fetch(`${API_BASE_URL}/api/rs-v2/latest?limit=1000`, { cache: 'no-store', credentials: 'include' }),
                fetch(`${API_BASE_URL}/api/technical-screener/screener?limit=1000`, { cache: 'no-store', credentials: 'include' })
            ]);

            if (!pricesRes.ok) throw new Error(`Failed to fetch prices: ${pricesRes.status}`);

            const pricesData = await pricesRes.json();
            const rsData = rsRes.ok ? await rsRes.json() : { data: [] };
            const techData = techRes.ok ? await techRes.json() : { data: [] };

            console.log('📊 Prices Data:', pricesData.data?.length ?? 0, 'items');
            console.log('📊 RS Data:', rsData.data?.length ?? 0, 'items');
            console.log('📊 Tech Data:', techData.data?.length ?? 0, 'items');

            // Sample RS data to debug
            if (rsData.data && rsData.data.length > 0) {
                console.log('🔍 Sample RS Item:', rsData.data[0]);
            }

            const rsMap = new Map((rsData.data || []).map((item: any) => [String(item.symbol), item]));
            const techMap = new Map((techData.data || []).map((item: any) => [String(item.symbol), item]));

            const mappedStocks = (pricesData.data || []).map((item: any) => {
                const symbolStr = String(item.symbol);
                const rsInfo: any = rsMap.get(symbolStr) || {};
                const techInfo: any = techMap.get(symbolStr) || {};

                return {
                    symbol: item.symbol,
                    name: item.company_name || '',
                    industry_group: item.industry_group || '',
                    sector: item.sector || '',
                    industry: item.industry || '',
                    sub_industry: item.sub_industry || '',
                    price: item.close,
                    change: item.change,
                    percent_change: item.change_percent,
                    volume: item.volume_traded,
                    turnover: item.value_traded_sar,
                    open: item.open,
                    high: item.high,
                    low: item.low,
                    no_of_trades: item.no_of_trades,
                    market_cap: item.market_cap,

                    // Try to get RS data from prices table first, then from rs-v2 API
                    rs_rating: rsInfo.rs_rating ?? item.rs_rating ?? 0,
                    rank_1m: rsInfo.rank_1m,
                    rank_3m: rsInfo.rank_3m,
                    rank_6m: rsInfo.rank_6m,
                    rank_9m: rsInfo.rank_9m,
                    rank_12m: rsInfo.rank_12m,
                    industry_group_rs: rsInfo.industry_group_rs_rating ?? item.industry_group_rs ?? '',
                    sector_rs: rsInfo.sector_rs_rating ?? item.sector_rs ?? '',
                    industry_rs: rsInfo.industry_rs_rating ?? item.industry_rs ?? '',
                    sub_industry_rs: rsInfo.sub_industry_rs_rating ?? item.sub_industry_rs ?? '',
                    acc_dis_rating: rsInfo.acc_dis_rating ?? item.acc_dis_rating ?? '',

                    price_minus_sma_10: techInfo.price_minus_sma_10,
                    price_minus_sma_21: techInfo.price_minus_sma_21,
                    price_minus_sma_50: techInfo.price_minus_sma_50,
                    price_minus_sma_150: techInfo.price_minus_sma_150,
                    price_minus_sma_200: techInfo.price_minus_sma_200,
                    fifty_two_week_high_price: techInfo.fifty_two_week_high,
                    fifty_two_week_low_price: techInfo.fifty_two_week_low,
                    average_volume_50: techInfo.average_volume_50,

                    // SMA values — directly from techInfo
                    sma_50: techInfo.sma50 ?? techInfo.sma_50 ?? undefined,
                    sma_150: techInfo.sma150 ?? techInfo.sma_150 ?? undefined,
                    sma_200: techInfo.sma200 ?? techInfo.sma_200 ?? undefined,

                    price_vs_sma_10_percent: techInfo.price_vs_sma_10_percent,
                    price_vs_sma_21_percent: techInfo.price_vs_sma_21_percent,
                    price_vs_sma_50_percent: techInfo.price_vs_sma_50_percent,
                    price_vs_sma_150_percent: techInfo.price_vs_sma_150_percent,
                    price_vs_sma_200_percent: techInfo.price_vs_sma_200_percent,
                    price_vs_ema_10_percent: (() => { const e = techInfo.ema10 ?? techInfo.ema_10; return e ? ((item.close - e) / e) * 100 : null; })(),
                    price_vs_ema_21_percent: (() => { const e = techInfo.ema21 ?? techInfo.ema_21; return e ? ((item.close - e) / e) * 100 : null; })(),
                    percent_off_52w_high: techInfo.percent_off_52w_high,
                    percent_off_52w_low: techInfo.percent_off_52w_low,
                    vol_diff_50_percent: techInfo.vol_diff_50_percent,
                    beta: techInfo.beta ?? undefined,
                    trading_view_symbol: item.trading_view_symbol,

                    approval_with_controls: item.approval_with_controls ?? null,
                    purge_amount: item.purge_amount !== undefined && item.purge_amount !== null ? Number(item.purge_amount) : null,
                    marginable_percent: item.marginable_percent !== undefined && item.marginable_percent !== null ? Number(item.marginable_percent) : null,

                    // New MA Comparison Indicators (exclusively from techInfo)
                    ema_21: techInfo.ema21 ?? techInfo.ema_21 ?? undefined,
                    ema_10: techInfo.ema10 ?? techInfo.ema_10 ?? undefined,
                    sma_3: techInfo.sma3_rsi3 ?? techInfo.sma_3 ?? undefined,
                    ema_20_sma3: techInfo.ema20_sma3 ?? undefined,
                    sma_4: techInfo.sma4 ?? undefined,
                    sma_9: techInfo.sma9_close ?? techInfo.sma9 ?? undefined,
                    sma_18: techInfo.sma18 ?? undefined,
                    sma_4w: techInfo.sma_4w ?? techInfo.sma4_w ?? undefined,
                    sma_9w: techInfo.sma_9w ?? techInfo.sma9_w ?? undefined,
                    sma_18w: techInfo.sma_18w ?? techInfo.sma18_w ?? undefined,
                    sma_200_1m_ago: techInfo.sma_200_1m_ago ?? undefined,
                    sma_200_2m_ago: techInfo.sma_200_2m_ago ?? undefined,
                    sma_200_3m_ago: techInfo.sma_200_3m_ago ?? undefined,
                    sma_200_4m_ago: techInfo.sma_200_4m_ago ?? undefined,
                    sma_200_5m_ago: techInfo.sma_200_5m_ago ?? undefined,
                    sma_30w: techInfo.sma_30w ?? undefined,
                    sma_40w: techInfo.sma_40w ?? undefined,
                    cci_14: techInfo.cci ?? undefined,
                    cci_ema_20: techInfo.cci_ema20 ?? undefined,
                    aroon_up: techInfo.aroon_up ?? undefined,
                    aroon_down: techInfo.aroon_down ?? undefined,

                    // Technical Screener data
                    tech_score: techInfo.score ?? undefined,

                    // Daily RSI
                    rsi_14: techInfo.rsi_14 ?? null,
                    rsi_3: techInfo.rsi_3 ?? null,
                    sma9_rsi: techInfo.sma9_rsi ?? null,
                    wma45_rsi: techInfo.wma45_rsi ?? null,
                    ema45_rsi: techInfo.ema45_rsi ?? null,
                    sma3_rsi3: techInfo.sma3_rsi3 ?? null,
                    ema20_sma3: techInfo.ema20_sma3 ?? null,

                    // Daily The Number
                    sma9_close: techInfo.sma9_close ?? null,
                    high_sma13: techInfo.high_sma13 ?? null,
                    low_sma13: techInfo.low_sma13 ?? null,
                    high_sma65: techInfo.high_sma65 ?? null,
                    low_sma65: techInfo.low_sma65 ?? null,
                    the_number: techInfo.the_number ?? null,
                    the_number_hl: techInfo.the_number_hl ?? null,
                    the_number_ll: techInfo.the_number_ll ?? null,

                    // Daily STAMP
                    rsi_14_9days_ago: techInfo.rsi_14_9days_ago ?? null,
                    stamp_a_value: techInfo.stamp_a_value ?? null,
                    stamp_s9rsi: techInfo.stamp_s9rsi ?? null,
                    stamp_e45cfg: techInfo.stamp_e45cfg ?? null,
                    stamp_e45rsi: techInfo.stamp_e45rsi ?? null,
                    stamp_e20sma3: techInfo.stamp_e20sma3 ?? null,

                    // Daily CFG
                    cfg_daily: techInfo.cfg_daily ?? null,
                    cfg_sma4: techInfo.cfg_sma4 ?? null,
                    cfg_sma9: techInfo.cfg_sma9 ?? null,
                    cfg_sma20: techInfo.cfg_sma20 ?? null,
                    cfg_ema20: techInfo.cfg_ema20 ?? null,
                    cfg_ema45: techInfo.cfg_ema45 ?? null,
                    cfg_wma45: techInfo.cfg_wma45 ?? null,

                    // Daily Trend
                    sma4: techInfo.sma4 ?? null,
                    sma9_price: techInfo.sma9 ?? null,
                    sma18: techInfo.sma18 ?? null,
                    wma45_close: techInfo.wma45_close ?? null,
                    cci: techInfo.cci ?? null,
                    cci_ema20: techInfo.cci_ema20 ?? null,

                    // Weekly RSI
                    rsi_w: techInfo.rsi_w ?? null,
                    rsi_3_w: techInfo.rsi_3_w ?? null,
                    sma9_rsi_w: techInfo.sma9_rsi_w ?? null,
                    wma45_rsi_w: techInfo.wma45_rsi_w ?? null,
                    ema45_rsi_w: techInfo.ema45_rsi_w ?? null,
                    sma3_rsi3_w: techInfo.sma3_rsi3_w ?? null,
                    ema20_sma3_w: techInfo.ema20_sma3_w ?? null,

                    // Weekly The Number
                    sma9_close_w: techInfo.sma9_close_w ?? null,
                    high_sma13_w: techInfo.high_sma13_w ?? null,
                    low_sma13_w: techInfo.low_sma13_w ?? null,
                    high_sma65_w: techInfo.high_sma65_w ?? null,
                    low_sma65_w: techInfo.low_sma65_w ?? null,
                    the_number_w: techInfo.the_number_w ?? null,
                    the_number_hl_w: techInfo.the_number_hl_w ?? null,
                    the_number_ll_w: techInfo.the_number_ll_w ?? null,

                    // Weekly STAMP
                    rsi_14_9days_ago_w: techInfo.rsi_14_9days_ago_w ?? null,
                    stamp_a_value_w: techInfo.stamp_a_value_w ?? null,
                    stamp_s9rsi_w: techInfo.stamp_s9rsi_w ?? null,
                    stamp_e45cfg_w: techInfo.stamp_e45cfg_w ?? null,
                    stamp_e45rsi_w: techInfo.stamp_e45rsi_w ?? null,
                    stamp_e20sma3_w: techInfo.stamp_e20sma3_w ?? null,

                    // Weekly CFG
                    cfg_w: techInfo.cfg_w ?? null,
                    cfg_sma4_w: techInfo.cfg_sma4_w ?? null,
                    cfg_sma9_w: techInfo.cfg_sma9_w ?? null,
                    cfg_ema20_w: techInfo.cfg_ema20_w ?? null,
                    cfg_ema45_w: techInfo.cfg_ema45_w ?? null,
                    cfg_wma45_w: techInfo.cfg_wma45_w ?? null,

                    // Weekly Trend
                    close_w: techInfo.close_w ?? techInfo.close ?? null,
                    sma4_w: techInfo.sma4_w ?? null,
                    sma9_w: techInfo.sma9_w ?? null,
                    sma18_w: techInfo.sma18_w ?? null,
                    wma45_close_w: techInfo.wma45_close_w ?? null,
                    cci_w: techInfo.cci_w ?? null,
                    cci_ema20_w: techInfo.cci_ema20_w ?? null,
                    aroon_up_w: techInfo.aroon_up_w ?? null,
                    aroon_down_w: techInfo.aroon_down_w ?? null,

                    // Signals
                    stamp: techInfo.stamp ?? false,
                    stamp_daily: techInfo.stamp_daily ?? false,
                    stamp_weekly: techInfo.stamp_weekly ?? false,
                    trend_signal: techInfo.trend_signal ?? false,
                    final_signal: techInfo.final_signal ?? false,
                    rsi_55_70: techInfo.rsi_55_70 ?? false,
                    cfg_gt_50_daily: techInfo.cfg_gt_50_daily ?? false,
                    cfg_gt_50_w: techInfo.cfg_gt_50_w ?? false,
                } as Stock;
            });

            setStocks(mappedStocks);

            setMetadata({
                exchange: 'Tadawul',
                currency: 'SAR',
                datetime: pricesData.date ? pricesData.date.toString() : new Date().toISOString().split('T')[0],
                timezone: 'Asia/Riyadh'
            });
            setError(null);
        } catch (err) {
            console.error('❌ Error fetching data:', err);
            setError(err instanceof Error ? err.message : 'Failed to connect to server');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStocks();
    }, [fetchStocks]);

    return { stocks, metadata, loading, error, refetch: fetchStocks, setStocks, setMetadata, setLoading, setError };
}
