export interface StockData {
    symbol: string;
    name: string;
    price: number;
    change: number; // percentage
    changeAmount: number;
    marketCap: number; // in USD
    volume: number;
    peRatio?: number;
    sector: string;
    industry: string;
    country: string;
}

export const MOCK_STOCKS: StockData[] = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 277.89, change: -0.32, changeAmount: -0.89, marketCap: 4110000000000, volume: 38210000, peRatio: 37.25, sector: 'Technology', industry: 'Consumer Electronics', country: 'US' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 185.55, change: 1.72, changeAmount: 3.14, marketCap: 4510000000000, volume: 204380000, peRatio: 45.96, sector: 'Technology', industry: 'Semiconductors', country: 'US' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', price: 491.02, change: 1.63, changeAmount: 7.85, marketCap: 3650000000000, volume: 21970000, peRatio: 34.93, sector: 'Technology', industry: 'Software', country: 'US' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 314.45, change: -2.37, changeAmount: -7.63, marketCap: 3790000000000, volume: 22010000, peRatio: 31.02, sector: 'Technology', industry: 'Internet Content', country: 'US' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 226.89, change: -1.15, changeAmount: -2.64, marketCap: 2430000000000, volume: 35020000, peRatio: 32.05, sector: 'Consumer Cyclical', industry: 'Internet Retail', country: 'US' },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 439.58, change: -3.39, changeAmount: -15.42, marketCap: 1460000000000, volume: 69160000, peRatio: 293.72, sector: 'Consumer Cyclical', industry: 'Auto Manufacturers', country: 'US' },
    { symbol: 'META', name: 'Meta Platforms Inc.', price: 666.80, change: -0.98, changeAmount: -6.60, marketCap: 1680000000000, volume: 13160000, peRatio: 29.46, sector: 'Technology', industry: 'Internet Content', country: 'US' },
    { symbol: 'AVGO', name: 'Broadcom Inc.', price: 401.10, change: 2.78, changeAmount: 10.85, marketCap: 1890000000000, volume: 30410000, peRatio: 102.47, sector: 'Technology', industry: 'Semiconductors', country: 'US' },
    { symbol: 'BRK.B', name: 'Berkshire Hathaway', price: 466.80, change: -0.5, changeAmount: -2.33, marketCap: 1000000000000, volume: 4000000, peRatio: 12.5, sector: 'Financial', industry: 'Insurance', country: 'US' },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.', price: 172.50, change: 0.8, changeAmount: 1.37, marketCap: 500000000000, volume: 9000000, peRatio: 11.2, sector: 'Financial', industry: 'Banks', country: 'US' },
];

/**
 * TODO: When API is ready
 * 1. Remove MOCK_STOCKS
 * 2. Fetch data from /api/screener using useScreener hook
 */
