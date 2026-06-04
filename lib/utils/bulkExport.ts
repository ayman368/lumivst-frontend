import { API_BASE_URL } from '@/lib/api/config';
import { authFetch } from '@/lib/api/authFetch';

interface StockResult {
  symbol: string;
  company_name: string;
  close: number;
  sma_50: number;
  sma_150: number;
  sma_200: number;
  rs_rating: number;
  rank_1m: number;
  rank_3m: number;
  rank_6m: number;
  rank_9m: number;
  rank_12m: number;
  percent_off_52w_high: number;
  percent_off_52w_low: number;
}

interface BulkExportResult {
  data: StockResult[];
  screenerBreakdown: Record<string, number>;
  groupedData: { label: string; items: StockResult[] }[];
  deduplicatedGroupedData?: { label: string; items: StockResult[] }[];
}

const SCREENER_ENDPOINTS = [
  { id: 'trend-1-month', label: 'Trend - 1 Month' },
  { id: 'trend-2-months', label: 'Trend - 2 Months' },
  { id: 'trend-4-months', label: 'Trend - 4 Months' },
  { id: 'trend-5-months', label: 'Trend - 5 Months' },
  { id: 'trend-5-months-wide', label: 'Trend - 5 Months Wide' },
  { id: 'alhussain', label: 'Alhussain' },
  { id: 'alrayan', label: 'Alrayan' },
  { id: 'rsi', label: 'RSI Momentum' },
  { id: 'power-play', label: 'Power Play' },
];

/**
 * Fetches data from all screener endpoints and applies deduplication logic.
 *
 * PRIORITY ORDER (highest → lowest):
 *   Trend Group (symbol moves up to the highest tier it qualifies for):
 *     5 Months Wide  ← highest priority, never removed
 *     5 Month        ← removed if in 5 Months Wide
 *     4 Month        ← removed if in 5 Month or above
 *     2 Month        ← removed if in 4 Month or above
 *     1 Month        ← removed if in 2 Month or above
 *
 *   Standalone screeners (each shows only NEW symbols not seen in any previous):
 *     Alhussain, RSI Momentum, Alrayan, Power Play
 *
 * Strategy (two-pass):
 *   Pass 1 — fetch all screeners and collect raw data per screener.
 *   Pass 2 — iterate from LAST to FIRST (highest priority to lowest),
 *             build a "claimed" set. Any symbol already claimed by a
 *             higher-priority screener is excluded from lower-priority ones.
 */
export async function fetchBulkScreenerData(): Promise<BulkExportResult> {
  // ── Pass 1: fetch all screeners in order ──────────────────────────────────
  const rawPerScreener: { label: string; items: StockResult[] }[] = [];

  for (const screener of SCREENER_ENDPOINTS) {
    try {
      let items: StockResult[] = [];

      if (screener.id === 'alrayan') {
        items = await fetchAlrayanData();
      } else if (screener.id === 'alhussain') {
        items = await fetchAlhussainData();
      } else if (screener.id === 'rsi') {
        items = await fetchRsiData();
      } else {
        const response = await authFetch(
          `${API_BASE_URL}/api/screeners/${screener.id}?limit=5000&offset=0`,
          { cache: 'no-store', credentials: 'include' }
        );

        if (!response.ok) {
          console.warn(`Failed to fetch ${screener.label}: ${response.status}`);
          rawPerScreener.push({ label: screener.label, items: [] });
          continue;
        }

        const responseData = await response.json();
        const raw = responseData.data;
        items = Array.isArray(raw)
          ? raw.map(normalizeStockData)
          : Array.isArray(raw?.data)
            ? raw.data.map(normalizeStockData)
            : [];
      }

      rawPerScreener.push({ label: screener.label, items });
    } catch (error) {
      console.error(`Error fetching ${screener.label}:`, error);
      rawPerScreener.push({ label: screener.label, items: [] });
    }
  }

  // ── Pass 2: Deduplication (higher-priority screeners win) ────────────────
  // Array is ordered lowest→highest priority, so iterating backwards
  // means we claim symbols from highest priority first.
  // Result: each symbol appears only in the highest-priority screener it belongs to.
  const claimedSymbols = new Set<string>();
  const finalGroupedData: { label: string; items: StockResult[] }[] = [];

  // Iterate backwards from highest priority to lowest
  for (let i = rawPerScreener.length - 1; i >= 0; i--) {
    const group = rawPerScreener[i];
    const filteredItems: StockResult[] = [];

    for (const item of group.items) {
      if (!claimedSymbols.has(item.symbol)) {
        claimedSymbols.add(item.symbol);
        filteredItems.push(item);
      }
    }

    // Unshift to maintain original order in UI
    finalGroupedData.unshift({ label: group.label, items: filteredItems });
  }

  // ── Build final flat list (original order) + breakdown ───────────────────
  const allData: StockResult[] = [];
  const screenerBreakdown: Record<string, number> = {};

  for (const { label, items } of rawPerScreener) {
    screenerBreakdown[label] = items.length;
    for (const item of items) {
      if (!allData.some(d => d.symbol === item.symbol)) {
        allData.push(item);
      }
    }
  }

  return {
    data: allData,
    screenerBreakdown,
    groupedData: rawPerScreener,          // UI uses this (full data)
    deduplicatedGroupedData: finalGroupedData, // Export uses this (deduplicated)
  };
}

/**
 * Fetches and filters Alrayan screener data from three parallel endpoints.
 */
async function fetchAlrayanData(): Promise<StockResult[]> {
  try {
    const [pricesRes, rsRes, techRes] = await Promise.all([
      authFetch(`${API_BASE_URL}/api/prices/latest`, { cache: 'no-store', credentials: 'include' }),
      authFetch(`${API_BASE_URL}/api/rs-v2/latest?limit=1000`, { cache: 'no-store', credentials: 'include' }),
      authFetch(`${API_BASE_URL}/api/technical-screener/screener?limit=1000`, { cache: 'no-store', credentials: 'include' }),
    ]);

    if (!pricesRes.ok) throw new Error('Failed to fetch prices');

    const pricesData = await pricesRes.json();
    const rsData = rsRes.ok ? await rsRes.json() : { data: [] };
    const techData = techRes.ok ? await techRes.json() : { data: [] };

    const rsMap = new Map((rsData.data || []).map((item: any) => [String(item.symbol), item]));
    const techMap = new Map((techData.data || []).map((item: any) => [String(item.symbol), item]));

    const filteredStocks: StockResult[] = [];

    for (const item of (pricesData.data || [])) {
      const sym = String(item.symbol);
      const tech: any = techMap.get(sym) || {};
      const rs: any = rsMap.get(sym) || {};

      const p = parseFloat(item.close || 0);

      // Daily SMA
      const sma18 = parseFloat(tech.sma18 || 0);
      const sma4 = parseFloat(tech.sma4 || 0);
      const sma9 = parseFloat(tech.sma9_close || tech.sma9 || 0);

      // Weekly SMA
      const sma9w = parseFloat(tech.sma_9w || tech.sma9_w || 0);
      const sma4w = parseFloat(tech.sma_4w || tech.sma4_w || 0);
      const sma18w = parseFloat(tech.sma_18w || tech.sma18_w || 0);

      // CCI
      const cci14 = parseFloat(tech.cci || 0);
      const cci_ema20 = parseFloat(tech.cci_ema20 || 0);
      const cci14_w = parseFloat(tech.cci_w || 0);
      const cci_ema20_w = parseFloat(tech.cci_ema20_w || 0);

      // Aroon
      const aroon_up = parseFloat(tech.aroon_up || 0);
      const aroon_down = parseFloat(tech.aroon_down || 0);

      // ─ 1. Price > 18 SMA (Daily) ─
      if (!(p > sma18)) continue;
      // ─ 2. SMA 4 > SMA 9 > SMA 18 (Daily) ─
      if (!(sma4 > sma9 && sma9 > sma18)) continue;
      // ─ 3. Price > 9 SMA (Weekly) ─
      if (!(p > sma9w)) continue;
      // ─ 4. SMA 4 > SMA 9 > SMA 18 (Weekly) ─
      if (!(sma4w > sma9w && sma9w > sma18w)) continue;
      // ─ 5. CCI(14) > 100 ─
      if (!(cci14 > 100)) continue;
      // ─ 6. CCI(14) EMA(20) > 0 (Daily) ─
      if (!(cci_ema20 > 0)) continue;
      // ─ 7. CCI(14) EMA(20) > 0 (Weekly) & CCI(14) W > 100 ─
      if (!(cci14_w > 100 && cci_ema20_w > 0)) continue;
      // ─ 8. Aroon Up > 70% ─
      if (!(aroon_up > 70)) continue;
      // ─ 9. Aroon Down < 30% ─
      if (!(aroon_down < 30)) continue;

      filteredStocks.push({
        symbol: item.symbol,
        company_name: item.company_name || '',
        close: p,
        sma_50: parseFloat(tech.sma50 || tech.sma_50 || 0),
        sma_150: parseFloat(tech.sma150 || tech.sma_150 || 0),
        sma_200: parseFloat(tech.sma200 || tech.sma_200 || 0),
        rs_rating: parseFloat(rs.rs_rating || 0),
        rank_1m: parseFloat(rs.rank_1m || 0),
        rank_3m: parseFloat(rs.rank_3m || 0),
        rank_6m: parseFloat(rs.rank_6m || 0),
        rank_9m: parseFloat(rs.rank_9m || 0),
        rank_12m: parseFloat(rs.rank_12m || 0),
        percent_off_52w_high: parseFloat(tech.percent_off_52w_high || 0),
        percent_off_52w_low: parseFloat(tech.percent_off_52w_low || 0),
      });
    }

    return filteredStocks;
  } catch (error) {
    console.error('Error fetching Alrayan data:', error);
    return [];
  }
}

/**
 * Normalizes stock data from different API response shapes.
 */
function normalizeStockData(item: any): StockResult {
  return {
    symbol: String(item.symbol || ''),
    company_name: item.company_name || '',
    close: parseFloat(item.close || 0),
    sma_50: parseFloat(item.sma_50 || item.sma50 || 0),
    sma_150: parseFloat(item.sma_150 || item.sma150 || 0),
    sma_200: parseFloat(item.sma_200 || item.sma200 || 0),
    rs_rating: parseFloat(item.rs_rating || item.rs_12m || 0),
    rank_1m: parseFloat(item.rank_1m || 0),
    rank_3m: parseFloat(item.rank_3m || 0),
    rank_6m: parseFloat(item.rank_6m || 0),
    rank_9m: parseFloat(item.rank_9m || 0),
    rank_12m: parseFloat(item.rank_12m || 0),
    percent_off_52w_high: parseFloat(item.percent_off_52w_high || 0),
    percent_off_52w_low: parseFloat(item.percent_off_52w_low || 0),
  };
}

/**
 * Fetches and filters Alhussain screener data.
 */
async function fetchAlhussainData(): Promise<StockResult[]> {
  try {
    const [pricesRes, rsRes, techRes] = await Promise.all([
      authFetch(`${API_BASE_URL}/api/prices/latest`, { cache: 'no-store', credentials: 'include' }),
      authFetch(`${API_BASE_URL}/api/rs-v2/latest?limit=1000`, { cache: 'no-store', credentials: 'include' }),
      authFetch(`${API_BASE_URL}/api/technical-screener/screener?limit=1000`, { cache: 'no-store', credentials: 'include' }),
    ]);

    if (!pricesRes.ok) throw new Error('Failed to fetch prices');

    const pricesData = await pricesRes.json();
    const rsData = rsRes.ok ? await rsRes.json() : { data: [] };
    const techData = techRes.ok ? await techRes.json() : { data: [] };

    const rsMap = new Map((rsData.data || []).map((item: any) => [String(item.symbol), item]));
    const techMap = new Map((techData.data || []).map((item: any) => [String(item.symbol), item]));

    const filteredStocks: StockResult[] = [];

    for (const item of (pricesData.data || [])) {
      const sym = String(item.symbol);
      const tech: any = techMap.get(sym) || {};
      const rs: any = rsMap.get(sym) || {};

      const p = parseFloat(item.close || 0);
      const sma50 = parseFloat(tech.sma50 || tech.sma_50 || 0);
      const sma150 = parseFloat(tech.sma150 || tech.sma_150 || 0);
      const sma200 = parseFloat(tech.sma200 || tech.sma_200 || 0);
      const priceVsSma50 = parseFloat(tech.price_vs_sma_50_percent || tech.price_vs_sma_50 || 0);
      const avgVolume50 = parseFloat(tech.average_volume_50 || 0);

      if (!(sma50 > sma150)) continue;
      if (!(sma50 > sma200)) continue;
      if (!(sma150 > sma200)) continue;
      if (!(priceVsSma50 >= 0)) continue;
      if (!(avgVolume50 >= 100000)) continue;

      filteredStocks.push({
        symbol: item.symbol,
        company_name: item.company_name || '',
        close: p,
        sma_50: sma50,
        sma_150: sma150,
        sma_200: sma200,
        rs_rating: parseFloat(rs.rs_rating || 0),
        rank_1m: parseFloat(rs.rank_1m || 0),
        rank_3m: parseFloat(rs.rank_3m || 0),
        rank_6m: parseFloat(rs.rank_6m || 0),
        rank_9m: parseFloat(rs.rank_9m || 0),
        rank_12m: parseFloat(rs.rank_12m || 0),
        percent_off_52w_high: parseFloat(tech.percent_off_52w_high || 0),
        percent_off_52w_low: parseFloat(tech.percent_off_52w_low || 0),
      });
    }

    filteredStocks.sort((a, b) => b.rs_rating - a.rs_rating);
    return filteredStocks;
  } catch (error) {
    console.error('Error fetching Alhussain data:', error);
    return [];
  }
}

/**
 * Fetches and filters RSI screener data.
 */
async function fetchRsiData(): Promise<StockResult[]> {
  try {
    const [pricesRes, rsRes, techRes] = await Promise.all([
      authFetch(`${API_BASE_URL}/api/prices/latest`, { cache: 'no-store', credentials: 'include' }),
      authFetch(`${API_BASE_URL}/api/rs-v2/latest?limit=1000`, { cache: 'no-store', credentials: 'include' }),
      authFetch(`${API_BASE_URL}/api/technical-screener/screener?limit=1000`, { cache: 'no-store', credentials: 'include' }),
    ]);

    if (!pricesRes.ok) throw new Error('Failed to fetch prices');

    const pricesData = await pricesRes.json();
    const rsData = rsRes.ok ? await rsRes.json() : { data: [] };
    const techData = techRes.ok ? await techRes.json() : { data: [] };

    const rsMap = new Map((rsData.data || []).map((item: any) => [String(item.symbol), item]));
    const techMap = new Map((techData.data || []).map((item: any) => [String(item.symbol), item]));

    const filteredStocks: StockResult[] = [];

    for (const item of (pricesData.data || [])) {
      const sym = String(item.symbol);
      const tech: any = techMap.get(sym) || {};
      const rs: any = rsMap.get(sym) || {};

      const p = parseFloat(item.close || 0);

      // RSI Daily
      const rsi14 = tech.rsi_14 != null ? parseFloat(tech.rsi_14) : null;
      const sma9_rsi = tech.sma9_rsi != null ? parseFloat(tech.sma9_rsi) : null;
      const wma45_rsi = tech.wma45_rsi != null ? parseFloat(tech.wma45_rsi) : null;
      const sma9_price = tech.sma9 != null ? parseFloat(tech.sma9) : null;
      const the_number = tech.the_number != null ? parseFloat(tech.the_number) : null;
      const wma45_close = tech.wma45_close != null ? parseFloat(tech.wma45_close) : null;

      // RSI Weekly
      const rsi_w = tech.rsi_w != null ? parseFloat(tech.rsi_w) : null;
      const sma9_rsi_w = tech.sma9_rsi_w != null ? parseFloat(tech.sma9_rsi_w) : null;
      const wma45_rsi_w = tech.wma45_rsi_w != null ? parseFloat(tech.wma45_rsi_w) : null;
      const sma9_w = tech.sma9_w != null ? parseFloat(tech.sma9_w) : null;
      const the_number_w = tech.the_number_w != null ? parseFloat(tech.the_number_w) : null;
      const wma45_close_w = tech.wma45_close_w != null ? parseFloat(tech.wma45_close_w) : null;

      // ─ Daily Filters ─
      if (rsi14 === null || !(rsi14 >= 40 && rsi14 <= 80)) continue;
      if (sma9_rsi === null || !(sma9_rsi <= 75)) continue;
      if (wma45_rsi === null || !(wma45_rsi <= 70)) continue;
      if (sma9_price === null || the_number === null || !(sma9_price > the_number)) continue;
      if (sma9_price === null || wma45_close === null || !(sma9_price > wma45_close)) continue;

      // ─ Weekly Filters ─
      if (rsi_w === null || !(rsi_w >= 40 && rsi_w <= 80)) continue;
      if (sma9_rsi_w === null || !(sma9_rsi_w <= 75)) continue;
      if (wma45_rsi_w === null || !(wma45_rsi_w <= 70)) continue;
      if (sma9_w === null || the_number_w === null || !(sma9_w > the_number_w)) continue;
      if (sma9_w === null || wma45_close_w === null || !(sma9_w > wma45_close_w)) continue;

      filteredStocks.push({
        symbol: item.symbol,
        company_name: item.company_name || '',
        close: p,
        sma_50: parseFloat(tech.sma50 || tech.sma_50 || 0),
        sma_150: parseFloat(tech.sma150 || tech.sma_150 || 0),
        sma_200: parseFloat(tech.sma200 || tech.sma_200 || 0),
        rs_rating: parseFloat(rs.rs_rating || 0),
        rank_1m: parseFloat(rs.rank_1m || 0),
        rank_3m: parseFloat(rs.rank_3m || 0),
        rank_6m: parseFloat(rs.rank_6m || 0),
        rank_9m: parseFloat(rs.rank_9m || 0),
        rank_12m: parseFloat(rs.rank_12m || 0),
        percent_off_52w_high: parseFloat(tech.percent_off_52w_high || 0),
        percent_off_52w_low: parseFloat(tech.percent_off_52w_low || 0),
      });
    }

    filteredStocks.sort((a, b) => b.rs_rating - a.rs_rating);
    return filteredStocks;
  } catch (error) {
    console.error('Error fetching RSI data:', error);
    return [];
  }
}