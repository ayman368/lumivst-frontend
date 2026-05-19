// types/api.ts  –  TypeScript interfaces mirroring all Pydantic schemas

// ─────────────────────────────────────────────────────────────
//  RISK FINANCE CALCULATOR
// ─────────────────────────────────────────────────────────────

export interface RiskFinanceRequest {
  buy_price: number;
  num_shares: number;
  stop_price: number;
  current_price: number;
}

export interface RiskFinanceRow {
  risk_financed_pct: number;   // 1.0 | 0.75 | 0.50 | 0.25
  shares_to_sell: number;
  effective_stop: number;      // 0 = breakeven
}

export interface RiskFinanceResponse {
  stop_loss_pct: number;
  rows: RiskFinanceRow[];
}

// ─────────────────────────────────────────────────────────────
//  RBAF
// ─────────────────────────────────────────────────────────────

export interface RBAFRequest {
  portfolio_size: number;
  portfolio_pct: number;
  desired_return: number;
  avg_pct_gain: number;
  avg_pct_loss: number;
  win_rate: number;
  risk_of_rote?: number;
  optimal_f?: number;
}

export interface RBAFResponse {
  avg_gain_on_winners: number;
  num_winning_trades: number;
  avg_loss_on_losers: number;
  num_losing_trades: number;
  gain_loss_ratio: number;
  position_size: number;
  expected_net_pct_per_trade: number;
  expected_net_return_per_trade: number;
  goal: number;
  trades_to_reach_goal: number;
  adjusted_gain_loss_ratio: number;
  optimal_f: number;
  stop_loss: number;
  monthly_trades_to_goal: number;
  quarter_position_sar: number;
  half_position_sar: number;
  full_position_sar: number;
}

// ─────────────────────────────────────────────────────────────
//  PORTFOLIO
// ─────────────────────────────────────────────────────────────

export interface PortfolioPositionIn {
  symbol: string;
  name: string;
  shares_held: number;
  avg_cost: number;
  current_price: number;
  buy_price: number;
  stop_price?: number;
  sell_price?: number;
  month_sold?: number;
}

export interface PortfolioPositionCreate {
  symbol: string;
  name: string;
  qty: number;
  buy_price: number;
  stop_price?: number;
  portfolio_name?: string;
  entry_date?: string;
}

export interface WalletPositionDB {
  id: number;
  symbol: string;
  name?: string;
  qty: number;
  buy_price: number;
  stop_price?: number;
  current_price?: number;
  portfolio_name: string;
  entry_date: string;
  created_at: string;
  updated_at: string;
}

export interface PortfolioPositionOut {
  symbol: string;
  name: string;
  cost_basis: number;
  unrealized_pnl: number;
  unrealized_pnl_pct: number;
  portfolio_weight: number;
  risk_pct: number;
  risk_to_reward: number | null;
  risk_financed_100pct: number;
  risk_financed_75pct: number;
  risk_financed_50pct: number;
  risk_financed_25pct: number;
  eff_stop_100pct: number;
  eff_stop_75pct: number;
  eff_stop_50pct: number;
  eff_stop_25pct: number;
}

export interface PortfolioSummary {
  total_cost_basis: number;
  total_unrealized_pnl: number;
  total_unrealized_pnl_pct: number;
  num_positions: number;
  positions: PortfolioPositionOut[];
}

// ─────────────────────────────────────────────────────────────
//  MONTHLY TRACKER
// ─────────────────────────────────────────────────────────────

export interface MonthlyStatsRow {
  month: number;
  label: string;
  investment: number;
  total_gain: number;
  total_loss: number;
  trades_gain: number;
  trades_loss: number;
  large_gain: number;
  large_loss: number;
  avg_gain: number;
  avg_loss: number;
  win_pct: number;
  total_trades: number;
  avg_days_gain: number;
  avg_days_loss: number;
  win_loss_ratio: number;
  adjusted_wl_ratio: number;
}

export interface MonthlyTrackerResponse {
  year: number;
  rows: MonthlyStatsRow[];
  summary_win_rate: number;
  summary_avg_gain: number;
  summary_avg_loss: number;
  summary_wl_ratio: number;
  summary_adj_wl_ratio: number;
}

export interface WalletTradeCreate {
  symbol: string;
  realized_pnl: number;
  pnl_pct: number;
  days_held?: number;
  exit_date?: string;
}

export interface WalletTradeResponse {
  id: number;
  symbol: string;
  realized_pnl: number;
  pnl_pct: number;
  days_held: number;
  exit_date: string;
  created_at: string;
}

// ─────────────────────────────────────────────────────────────
//  WEEKLY STUDY
// ─────────────────────────────────────────────────────────────

export type MarketStatus = "Positive" | "Neutral" | "Negative";

export interface MarketComponent {
  name: string;
  status: MarketStatus;
}

export interface WeeklyStudyResponse {
  spy_model_25: string | null;
  spy_model_33: string | null;
  stem_reading: string | null;
  stem_date: string | null;
  market_components: MarketComponent[];
}

// ─────────────────────────────────────────────────────────────
//  SHARED
// ─────────────────────────────────────────────────────────────

export interface ApiError {
  detail: string;
}
