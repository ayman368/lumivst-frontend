// types/rs-line.ts

export interface RSPoint {
  date: string;
  stock_close: number;
  bench_close: number;
  rs_line: number;
  ma1: number | null;
  ma2: number | null;
  cross_bull: boolean;
  cross_bear: boolean;
  rs_new_high: boolean;
  rsnhbp: boolean;
  rs_up: boolean;
  above_ma2: boolean;
}

export interface RSLineSummary {
  last_date: string;
  rs_line: number;
  ma1: number;
  ma2: number;
  direction: "up" | "down";
  position: "above_ma" | "below_ma";
  signal_today: "bullish_cross" | "bearish_cross" | null;
  rsnhbp_today: boolean;
  last_bull_cross: string | null;
  last_bear_cross: string | null;
}

export interface RSLineResponse {
  symbol: string;
  benchmark: string;
  summary: RSLineSummary;
  data: RSPoint[];
  total_bars: number;
}

export interface RSLineRequest {
  symbol: string;
  benchmark?: string;
  start_date: string;
  end_date?: string;
  ma1_type?: "EMA" | "SMA";
  ma1_period?: number;
  ma2_type?: "EMA" | "SMA";
  ma2_period?: number;
  lookback?: number;
}
