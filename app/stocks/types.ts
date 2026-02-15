export interface StockMetadata {
    exchange: string;
    currency: string;
    datetime: string;
    timezone: string;
}

export interface Stock {
    symbol: string;
    name: string;
    industry_group: string;
    sector: string;
    industry: string;
    sub_industry: string;

    price: string | number;
    change: string | number;
    percent_change: string | number;

    open: string | number;
    high: string | number;
    low: string | number;

    volume: string | number;
    turnover: string | number;
    no_of_trades: number;
    market_cap: string | number;

    rs_rating?: number;
    industry_group_rs?: string;
    sector_rs?: string;
    industry_rs?: string;
    sub_industry_rs?: string;
    acc_dis_rating?: string;

    price_minus_sma_10?: number;
    price_minus_sma_21?: number;
    price_minus_sma_50?: number;
    price_minus_sma_150?: number;
    price_minus_sma_200?: number;
    fifty_two_week_high_price?: number;
    fifty_two_week_low_price?: number;
    average_volume_50?: number;

    price_vs_sma_10_percent?: number;
    price_vs_sma_21_percent?: number;
    price_vs_sma_50_percent?: number;
    price_vs_sma_150_percent?: number;
    price_vs_sma_200_percent?: number;
    percent_off_52w_high?: number;
    percent_off_52w_low?: number;
    vol_diff_50_percent?: number;
    trading_view_symbol?: string;
}

export interface FilterState {
    rs_rating_min: string;
    rs_rating_max: string;
    acc_dis_rating: string[];
    industry_group_rs: string[];
    sector_rs: string[];
    industry_rs: string[];
    sub_industry_rs: string[];

    price_min: string;
    price_max: string;
    change_min: string;
    change_max: string;
    percent_change_min: string;
    percent_change_max: string;
    volume_min: string;
    volume_max: string;
    turnover_min: string;
    turnover_max: string;
    market_cap_min: string;
    market_cap_max: string;
    no_of_trades_min: string;
    no_of_trades_max: string;
    percent_off_52w_high_min: string;
    percent_off_52w_high_max: string;
    percent_off_52w_low_min: string;
    percent_off_52w_low_max: string;

    price_minus_sma_10_min: string;
    price_minus_sma_10_max: string;
    price_minus_sma_21_min: string;
    price_minus_sma_21_max: string;
    price_minus_sma_50_min: string;
    price_minus_sma_50_max: string;
    price_minus_sma_150_min: string;
    price_minus_sma_150_max: string;
    price_minus_sma_200_min: string;
    price_minus_sma_200_max: string;

    price_vs_sma_10_min: string;
    price_vs_sma_10_max: string;
    price_vs_sma_21_min: string;
    price_vs_sma_21_max: string;
    price_vs_sma_50_min: string;
    price_vs_sma_50_max: string;
    price_vs_sma_150_min: string;
    price_vs_sma_150_max: string;
    price_vs_sma_200_min: string;
    price_vs_sma_200_max: string;

    fifty_two_week_high_min: string;
    fifty_two_week_high_max: string;
    fifty_two_week_low_min: string;
    fifty_two_week_low_max: string;

    average_volume_50_min: string;
    average_volume_50_max: string;
    vol_diff_50_percent_min: string;
    vol_diff_50_percent_max: string;

    open_min: string;
    open_max: string;
    high_min: string;
    high_max: string;
    low_min: string;
    low_max: string;

    symbol: string;
    name: string;
    industry_group: string[];
    sector: string[];
    industry: string[];
    sub_industry: string[];
}
