import { useState, useEffect, useCallback } from 'react';
import type { Stock, StockMetadata } from '../types';

export default function useStocks() {
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [metadata, setMetadata] = useState<StockMetadata | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStocks = useCallback(async () => {
        try {
            setLoading(true);
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            const headers: HeadersInit = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const [pricesRes, rsRes] = await Promise.all([
                fetch(`${API_URL}/api/prices/latest`, { cache: 'no-store', headers }),
                fetch(`${API_URL}/api/rs-v2/latest?limit=1000`, { cache: 'no-store', headers })
            ]);

            if (!pricesRes.ok) throw new Error(`Failed to fetch prices: ${pricesRes.status}`);

            const pricesData = await pricesRes.json();
            const rsData = rsRes.ok ? await rsRes.json() : { data: [] };

            const rsMap = new Map((rsData.data || []).map((item: any) => [String(item.symbol), item]));

            const mappedStocks = (pricesData.data || []).map((item: any) => {
                const symbolStr = String(item.symbol);
                const rsInfo: any = rsMap.get(symbolStr) || {};

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

                    rs_rating: rsInfo.rs_rating || 0,
                    industry_group_rs: rsInfo.industry_group_rs_rating || '',
                    sector_rs: rsInfo.sector_rs_rating || '',
                    industry_rs: rsInfo.industry_rs_rating || '',
                    sub_industry_rs: rsInfo.sub_industry_rs_rating || '',
                    acc_dis_rating: rsInfo.acc_dis_rating || '',

                    price_minus_sma_10: item.price_minus_sma_10,
                    price_minus_sma_21: item.price_minus_sma_21,
                    price_minus_sma_50: item.price_minus_sma_50,
                    price_minus_sma_150: item.price_minus_sma_150,
                    price_minus_sma_200: item.price_minus_sma_200,
                    fifty_two_week_high_price: item.fifty_two_week_high,
                    fifty_two_week_low_price: item.fifty_two_week_low,
                    average_volume_50: item.average_volume_50,

                    price_vs_sma_10_percent: item.price_vs_sma_10_percent,
                    price_vs_sma_21_percent: item.price_vs_sma_21_percent,
                    price_vs_sma_50_percent: item.price_vs_sma_50_percent,
                    price_vs_sma_150_percent: item.price_vs_sma_150_percent,
                    price_vs_sma_200_percent: item.price_vs_sma_200_percent,
                    percent_off_52w_high: item.percent_off_52w_high,
                    percent_off_52w_low: item.percent_off_52w_low,
                    vol_diff_50_percent: item.vol_diff_50_percent,
                    trading_view_symbol: item.trading_view_symbol,
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
