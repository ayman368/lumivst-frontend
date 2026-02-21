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
    // Score
    tech_score?: number;

    // Daily RSI
    rsi_14?: number | null;
    rsi_3?: number | null;
    sma9_rsi?: number | null;
    wma45_rsi?: number | null;
    ema45_rsi?: number | null;
    sma3_rsi3?: number | null;
    ema20_sma3?: number | null;

    // Daily The Number
    sma9_close?: number | null;
    high_sma13?: number | null;
    low_sma13?: number | null;
    high_sma65?: number | null;
    low_sma65?: number | null;
    the_number?: number | null;
    the_number_hl?: number | null;
    the_number_ll?: number | null;

    // Daily STAMP
    rsi_14_9days_ago?: number | null;
    stamp_a_value?: number | null;
    stamp_s9rsi?: number | null;
    stamp_e45cfg?: number | null;
    stamp_e45rsi?: number | null;
    stamp_e20sma3?: number | null;

    // Daily CFG
    cfg_daily?: number | null;
    cfg_sma4?: number | null;
    cfg_sma9?: number | null;
    cfg_sma20?: number | null;
    cfg_ema20?: number | null;
    cfg_ema45?: number | null;
    cfg_wma45?: number | null;

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
    rsi_3_w?: number | null;
    sma9_rsi_w?: number | null;
    wma45_rsi_w?: number | null;
    ema45_rsi_w?: number | null;
    sma3_rsi3_w?: number | null;
    ema20_sma3_w?: number | null;

    // Weekly The Number
    sma9_close_w?: number | null;
    high_sma13_w?: number | null;
    low_sma13_w?: number | null;
    high_sma65_w?: number | null;
    low_sma65_w?: number | null;
    the_number_w?: number | null;
    the_number_hl_w?: number | null;
    the_number_ll_w?: number | null;

    // Weekly STAMP
    rsi_14_9days_ago_w?: number | null;
    stamp_a_value_w?: number | null;
    stamp_s9rsi_w?: number | null;
    stamp_e45cfg_w?: number | null;
    stamp_e45rsi_w?: number | null;
    stamp_e20sma3_w?: number | null;

    // Weekly CFG
    cfg_w?: number | null;
    cfg_sma4_w?: number | null;
    cfg_sma9_w?: number | null;
    cfg_ema20_w?: number | null;
    cfg_ema45_w?: number | null;
    cfg_wma45_w?: number | null;

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

    // Signals & Booleans
    stamp?: boolean;
    stamp_daily?: boolean;
    stamp_weekly?: boolean;
    trend_signal?: boolean;
    final_signal?: boolean;
    rsi_55_70?: boolean;
    cfg_gt_50_daily?: boolean;
    cfg_gt_50_w?: boolean;
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

    // === Technical Screener Filters ===
    // Score
    tech_score_min: string;
    tech_score_max: string;

    // Signals (Boolean/Select)
    final_signal: string[]; // 'YES', 'NO'
    stamp_signal: string[];
    trend_signal: string[];
    rsi_55_70: string[];
    cfg_gt_50_daily: string[];
    cfg_gt_50_w: string[];
    stamp_daily: string[];
    stamp_weekly: string[];

    // Daily RSI
    rsi_14_min: string; rsi_14_max: string;
    rsi_3_min: string; rsi_3_max: string;
    sma9_rsi_min: string; sma9_rsi_max: string;
    wma45_rsi_min: string; wma45_rsi_max: string;
    ema45_rsi_min: string; ema45_rsi_max: string;
    sma3_rsi3_min: string; sma3_rsi3_max: string;
    ema20_sma3_min: string; ema20_sma3_max: string;

    // Daily The Number
    sma9_close_min: string; sma9_close_max: string;
    high_sma13_min: string; high_sma13_max: string;
    low_sma13_min: string; low_sma13_max: string;
    high_sma65_min: string; high_sma65_max: string;
    low_sma65_min: string; low_sma65_max: string;
    the_number_min: string; the_number_max: string;
    the_number_hl_min: string; the_number_hl_max: string;
    the_number_ll_min: string; the_number_ll_max: string;

    // Daily STAMP
    rsi_14_9days_ago_min: string; rsi_14_9days_ago_max: string;
    stamp_a_value_min: string; stamp_a_value_max: string;
    stamp_s9rsi_min: string; stamp_s9rsi_max: string;
    stamp_e45cfg_min: string; stamp_e45cfg_max: string;
    stamp_e45rsi_min: string; stamp_e45rsi_max: string;
    stamp_e20sma3_min: string; stamp_e20sma3_max: string;

    // Daily CFG
    cfg_daily_min: string; cfg_daily_max: string;
    cfg_sma4_min: string; cfg_sma4_max: string;
    cfg_sma9_min: string; cfg_sma9_max: string;
    cfg_sma20_min: string; cfg_sma20_max: string;
    cfg_ema20_min: string; cfg_ema20_max: string;
    cfg_ema45_min: string; cfg_ema45_max: string;
    cfg_wma45_min: string; cfg_wma45_max: string;

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
    rsi_3_w_min: string; rsi_3_w_max: string;
    sma9_rsi_w_min: string; sma9_rsi_w_max: string;
    wma45_rsi_w_min: string; wma45_rsi_w_max: string;
    ema45_rsi_w_min: string; ema45_rsi_w_max: string;
    sma3_rsi3_w_min: string; sma3_rsi3_w_max: string;
    ema20_sma3_w_min: string; ema20_sma3_w_max: string;

    // Weekly The Number
    sma9_close_w_min: string; sma9_close_w_max: string;
    high_sma13_w_min: string; high_sma13_w_max: string;
    low_sma13_w_min: string; low_sma13_w_max: string;
    high_sma65_w_min: string; high_sma65_w_max: string;
    low_sma65_w_min: string; low_sma65_w_max: string;
    the_number_w_min: string; the_number_w_max: string;
    the_number_hl_w_min: string; the_number_hl_w_max: string;
    the_number_ll_w_min: string; the_number_ll_w_max: string;

    // Weekly STAMP
    rsi_14_9days_ago_w_min: string; rsi_14_9days_ago_w_max: string;
    stamp_a_value_w_min: string; stamp_a_value_w_max: string;
    stamp_s9rsi_w_min: string; stamp_s9rsi_w_max: string;
    stamp_e45cfg_w_min: string; stamp_e45cfg_w_max: string;
    stamp_e45rsi_w_min: string; stamp_e45rsi_w_max: string;
    stamp_e20sma3_w_min: string; stamp_e20sma3_w_max: string;

    // Weekly CFG
    cfg_w_min: string; cfg_w_max: string;
    cfg_sma4_w_min: string; cfg_sma4_w_max: string;
    cfg_sma9_w_min: string; cfg_sma9_w_max: string;
    cfg_ema20_w_min: string; cfg_ema20_w_max: string;
    cfg_ema45_w_min: string; cfg_ema45_w_max: string;
    cfg_wma45_w_min: string; cfg_wma45_w_max: string;

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
