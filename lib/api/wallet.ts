import { API_BASE_URL } from "./config";
import type {
  RiskFinanceRequest, RiskFinanceResponse,
  RBAFRequest, RBAFResponse,
  PortfolioRequest, PortfolioSummary,
  PortfolioPositionCreate, WalletPositionDB,
  MonthlyTrackerResponse, WalletTradeCreate, WalletTradeResponse,
  WeeklyStudyRequest, WeeklyStudyResponse
} from "@/types/wallet";

async function handleRes(response: Response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    let msg = errorData.detail || "Request failed";
    if (Array.isArray(msg)) msg = msg.map((m: any) => `${m.loc?.[m.loc.length-1]}: ${m.msg}`).join(", ");
    throw new Error(msg);
  }
  return response.json();
}

export async function calcRiskFinance(data: RiskFinanceRequest): Promise<RiskFinanceResponse> {
  const response = await fetch(`${API_BASE_URL}/api/wallet/calculator/calculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-csrf-token": "1" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return handleRes(response);
}

export async function calcRBAF(data: RBAFRequest): Promise<RBAFResponse> {
  const response = await fetch(`${API_BASE_URL}/api/wallet/rbaf/calculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-csrf-token": "1" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return handleRes(response);
}

export async function getRbafSettings(): Promise<RBAFRequest> {
  const response = await fetch(`${API_BASE_URL}/api/wallet/rbaf/settings`, {
    credentials: "include",
  });
  return handleRes(response);
}

export async function analyzePortfolio(data: PortfolioRequest): Promise<PortfolioSummary> {
  const response = await fetch(`${API_BASE_URL}/api/wallet/portfolio/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-csrf-token": "1" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return handleRes(response);
}

export async function fetchPortfolioPositions(): Promise<WalletPositionDB[]> {
  const response = await fetch(`${API_BASE_URL}/api/wallet/portfolio/positions`, {
    credentials: "include",
  });
  return handleRes(response);
}

export async function createPortfolioPosition(data: PortfolioPositionCreate): Promise<WalletPositionDB> {
  const response = await fetch(`${API_BASE_URL}/api/wallet/portfolio/positions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-csrf-token": "1" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return handleRes(response);
}

export async function closePortfolioPosition(id: number): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/api/wallet/portfolio/positions/${id}/close`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-csrf-token": "1" },
    credentials: "include",
  });
  return handleRes(response);
}

export async function getMonthlyTracker(year: number): Promise<MonthlyTrackerResponse> {
  const response = await fetch(`${API_BASE_URL}/api/wallet/tracker/${year}`, {
    credentials: "include",
  });
  return handleRes(response);
}

export async function createMonthlyTrade(data: WalletTradeCreate): Promise<WalletTradeResponse> {
  const response = await fetch(`${API_BASE_URL}/api/wallet/tracker/trades`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-csrf-token": "1" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return handleRes(response);
}

export async function calcMonthlyTracker(year: number, trades: any[]): Promise<MonthlyTrackerResponse> {
  const response = await fetch(`${API_BASE_URL}/api/wallet/tracker/calculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-csrf-token": "1" },
    credentials: "include",
    body: JSON.stringify({ year, trades }),
  });
  return handleRes(response);
}

export async function getEmptyTracker(year: number): Promise<MonthlyTrackerResponse> {
  const response = await fetch(`${API_BASE_URL}/api/wallet/tracker/${year}`, {
    credentials: "include",
  });
  return handleRes(response);
}

export async function getWeeklyStudy(): Promise<WeeklyStudyResponse> {
  const response = await fetch(`${API_BASE_URL}/api/wallet/weekly/latest`, {
    credentials: "include",
  });
  return handleRes(response);
}

export async function updateWeeklyStudy(data: WeeklyStudyRequest): Promise<WeeklyStudyResponse> {
  const response = await fetch(`${API_BASE_URL}/api/wallet/weekly/update`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-csrf-token": "1" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return handleRes(response);
}

export async function getLatestPrice(symbol: string): Promise<{ symbol: string; close: number; date: string }> {
  const response = await fetch(`${API_BASE_URL}/api/wallet/calculator/price/${symbol}`, {
    credentials: "include",
  });
  return handleRes(response);
}

