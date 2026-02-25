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

    // === Technical Screener Fields ===

    // Daily RSI (kept for display only)
    rsi_14?: number | null;
    sma9_rsi?: number | null;
    wma45_rsi?: number | null;

    // Daily The Number
    sma9_close?: number | null;
    the_number?: number | null;
    the_number_hl?: number | null;
    the_number_ll?: number | null;

    // Daily STAMP
    stamp_s9rsi?: number | null;
    stamp_e45cfg?: number | null;

    // Daily CFG
    cfg_daily?: number | null;
    cfg_sma4?: number | null;
    cfg_ema45?: number | null;

    // Daily Trend
    sma4?: number | null;
    sma9_price?: number | null;
    sma18?: number | null;
    wma45_close?: number | null;
    cci?: number | null;
    cci_ema20?: number | null;
    aroon_up?: number | null;
    aroon_down?: number | null;

    // Weekly RSI
    rsi_w?: number | null;
    sma9_rsi_w?: number | null;
    wma45_rsi_w?: number | null;

    // Weekly The Number
    sma9_close_w?: number | null;
    the_number_w?: number | null;
    the_number_hl_w?: number | null;
    the_number_ll_w?: number | null;

    // Weekly STAMP
    stamp_s9rsi_w?: number | null;
    stamp_e45cfg_w?: number | null;

    // Weekly CFG
    cfg_w?: number | null;
    cfg_sma4_w?: number | null;
    cfg_ema45_w?: number | null;

    // Weekly Trend
    close_w?: number | null;
    sma4_w?: number | null;
    sma9_w?: number | null;
    sma18_w?: number | null;
    wma45_close_w?: number | null;
    cci_w?: number | null;
    cci_ema20_w?: number | null;
    aroon_up_w?: number | null;
    aroon_down_w?: number | null;

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

    // === Technical Screener Filters (KEPT) ===

    // Daily RSI
    rsi_14_min: string; rsi_14_max: string;
    sma9_rsi_min: string; sma9_rsi_max: string;
    wma45_rsi_min: string; wma45_rsi_max: string;

    // Daily The Number
    sma9_close_min: string; sma9_close_max: string;
    the_number_min: string; the_number_max: string;
    the_number_hl_min: string; the_number_hl_max: string;
    the_number_ll_min: string; the_number_ll_max: string;

    // Daily STAMP (kept: s9rsi, e45cfg)
    stamp_s9rsi_min: string; stamp_s9rsi_max: string;
    stamp_e45cfg_min: string; stamp_e45cfg_max: string;

    // Daily CFG (kept: cfg_daily, cfg_sma4, cfg_ema45)
    cfg_daily_min: string; cfg_daily_max: string;
    cfg_sma4_min: string; cfg_sma4_max: string;
    cfg_ema45_min: string; cfg_ema45_max: string;

    // Daily Trend
    sma4_min: string; sma4_max: string;
    sma9_price_min: string; sma9_price_max: string;
    sma18_min: string; sma18_max: string;
    wma45_close_min: string; wma45_close_max: string;
    cci_min: string; cci_max: string;
    cci_ema20_min: string; cci_ema20_max: string;
    aroon_up_min: string; aroon_up_max: string;
    aroon_down_min: string; aroon_down_max: string;

    // Weekly RSI
    rsi_w_min: string; rsi_w_max: string;
    sma9_rsi_w_min: string; sma9_rsi_w_max: string;
    wma45_rsi_w_min: string; wma45_rsi_w_max: string;

    // Weekly The Number
    sma9_close_w_min: string; sma9_close_w_max: string;
    the_number_w_min: string; the_number_w_max: string;
    the_number_hl_w_min: string; the_number_hl_w_max: string;
    the_number_ll_w_min: string; the_number_ll_w_max: string;

    // Weekly STAMP (kept: s9rsi_w, e45cfg_w)
    stamp_s9rsi_w_min: string; stamp_s9rsi_w_max: string;
    stamp_e45cfg_w_min: string; stamp_e45cfg_w_max: string;

    // Weekly CFG (kept: cfg_w, cfg_sma4_w, cfg_ema45_w)
    cfg_w_min: string; cfg_w_max: string;
    cfg_sma4_w_min: string; cfg_sma4_w_max: string;
    cfg_ema45_w_min: string; cfg_ema45_w_max: string;

    // Weekly Trend
    close_w_min: string; close_w_max: string;
    sma4_w_min: string; sma4_w_max: string;
    sma9_w_min: string; sma9_w_max: string;
    sma18_w_min: string; sma18_w_max: string;
    wma45_close_w_min: string; wma45_close_w_max: string;
    cci_w_min: string; cci_w_max: string;
    cci_ema20_w_min: string; cci_ema20_w_max: string;
    aroon_up_w_min: string; aroon_up_w_max: string;
    aroon_down_w_min: string; aroon_down_w_max: string;
}