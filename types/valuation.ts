// types/valuation.ts
// Shared TypeScript types for all 8 valuation tabs.

// ── Tab 1: Bond Dashboard ─────────────────────────────────────────────────────
export interface BondDashboard {
  sp500_price: number | null;
  sp500_pe: number | null;
  sp500_ey: number | null;   // as %
  a_yield: number | null;
  bbb_yield: number | null;
  bb_yield: number | null;
  b_yield: number | null;
  sp_ey_a_ratio: number | null;
  sp_ey_bbb_ratio: number | null;
  unemployment: number | null;
  nonfarm_payrolls: number | null;
  initial_claims_4wma: number | null;
  yield_10y: number | null;
  yield_2y: number | null;
  spread_10y_2y: number | null;
  dividend_yield: number | null;
  growth_ksa: number | null;
  as_of_date: string | null;
}

// ── Tab 2: Daily Treasury ─────────────────────────────────────────────────────
export interface TreasuryDailyRow {
  date: string;
  month_1: number | null;
  month_2: number | null;
  month_3: number | null;
  month_4: number | null;
  month_6: number | null;
  year_1: number | null;
  year_2: number | null;
  year_3: number | null;
  year_5: number | null;
  year_7: number | null;
  year_10: number | null;
  year_20: number | null;
  year_30: number | null;
}

export interface TreasuryDailyResponse {
  data: TreasuryDailyRow[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

// ── Tab 3: Monthly Yield Curve ────────────────────────────────────────────────
export interface MonthlyCurvePoint {
  month: string;
  curve: Record<string, number | null>;   // keys: mo_1, mo_3, …, yr_30
}

export interface MonthlyCurveResponse {
  months: MonthlyCurvePoint[];
  maturities: string[];   // ['1M', '3M', '6M', '1Y', …, '30Y']
  fields: string[];   // ['mo_1', 'mo_3', …]
}

// ── Tab 4: Economy Assessment ─────────────────────────────────────────────────
export type Verdict = 'Positive' | 'Negative' | 'Neutral' | 'Watch' | 'Attractive';

export interface EconomyIndicator {
  name: string;
  name_ar: string;
  value: number | null;
  unit: string;
  verdict: Verdict;
  note: string;
}

export interface ValuationZone {
  id: number;
  label: string;
  label_ar: string;
  price_from: number;
  price_to: number;
  return_pct_low: number;
  return_pct_high: number;
  color_code: string;
  is_current: boolean;
}

export interface EconomyAssessmentResponse {
  current_pe: number | null;
  median_pe: number | null;
  current_ey: number | null;
  indicators: EconomyIndicator[];
  sp500_zones: ValuationZone[];
  current_price: number | null;
  ey_a_ratio: number | null;
}

// ── Tab 5: SP-500 Scenarios ───────────────────────────────────────────────────
export interface ScenarioRow {
  name: string;
  pe: number;
  earnings_yield: number;
  fair_value: number;
  ey_a_ratio: number;
  upside_pct: number;
  return_2y?: number | null;
  return_3y?: number | null;
}

export interface HistoricalPeStats {
  min: number;
  median: number;
  average: number;
  values: number[];
  years_used: number;
}

export interface SP500ScenariosResponse {
  scenarios: ScenarioRow[];
  scenarios_adjusted: ScenarioRow[];
  gold_silver_bronze: {
    gold: number[];
    silver: number[];
    bronze: number[];
  };
  inputs: {
    eps_year: number;
    eps: number;
    eps_source: string;
    current_price: number;
    current_pe: number | null;
    a_yield_pct: number;
    bbb_yield_pct: number;
    fed_rate_current_pct: number | null;
    fed_rate_expected_pct: number | null;
    dividend_yield_pct: number;
    annual_dividend: number;
    n_years: number;
  };
  historical_pe_stats: HistoricalPeStats;
}

// ── Tab 6: Historical P/E ─────────────────────────────────────────────────────
export interface PeHistoryRow {
  year: number;
  label: string;
  pe: number;
  ey_pct: number;
  ey_a_ratio: number;
  ey_a_ratio_adj: number;
  is_estimate: boolean;
}

export interface HistoricalPeResponse {
  rows: PeHistoryRow[];
  a_yield_pct: number;
  a_yield_3yr_avg_pct: number;
  required_ey_pct: number;
  target_pe: number | null;
  target_pe_adj: number | null;
  target_price: number | null;
  target_price_adj: number | null;
  pe_stats: HistoricalPeStats;
  deviations: {
    min: Record<string, number | null>;
    median: Record<string, number | null>;
    average: Record<string, number | null>;
  };
  eps_estimates: Record<string, number>;
}

// ── Tab 7: TASI Market Weight ─────────────────────────────────────────────────
export interface TasiComponentRow {
  symbol: string;
  company_name: string;
  company_name_ar: string | null;
  sector: string | null;
  current_price: number | null;
  weight_in_index: number | null;
  weight_adjusted: number | null;
  weight_norm: number | null;
  eps: number | null;
  pe_ratio: number | null;
  weighted_eps: number | null;
  weighted_eps_top70: number | null;
  is_in_top70: boolean;
}

export interface TasiSummary {
  tasi_level: number | null;
  weighted_eps: number;
  pe: number | null;
  total_components?: number;
  profitable_components?: number;
  components_included?: number;
}

export interface TasiMarketWeightResponse {
  components: TasiComponentRow[];
  summary_current: TasiSummary;
  summary_top70: TasiSummary;
}

// ── Admin types ───────────────────────────────────────────────────────────────
export interface EpsEstimate {
  id: number;
  year: number;
  value: number;
  type: string;
  source: string | null;
  updated_at: string | null;
  created_by: string | null;
}

export interface SystemConfigRow {
  key: string;
  value: string;
  data_type: string;
  description: string | null;
  updated_at: string | null;
}
