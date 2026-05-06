import { API_BASE_URL } from '@/lib/api/config';

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
}

const SCREENER_ENDPOINTS = [
  { id: 'trend-1-month', label: 'Trend - 1 Month' },
  { id: 'trend-2-months', label: 'Trend - 2 Months' },
  { id: 'trend-4-months', label: 'Trend - 4 Months' },
  { id: 'trend-5-months', label: 'Trend - 5 Months' },
  { id: 'trend-5-months-wide', label: 'Trend - 5 Months Wide' },
  { id: 'power-play', label: 'Power Play' },
  { id: 'alrayan', label: 'Alrayan' },
];

/**
 * Fetches data from all screener endpoints and applies deduplication logic.
 *
 * PRIORITY RULE: Later screeners win.
 * If a symbol exists in both "Trend - 1 Month" and "Trend - 2 Months",
 * it is REMOVED from "Trend - 1 Month" and kept only in "Trend - 2 Months".
 *
 * Strategy (two-pass):
 *   Pass 1 — fetch all screeners and collect raw data per screener.
 *   Pass 2 — iterate from LAST to FIRST, build a "claimed" set.
 *             Any symbol already claimed by a later screener is excluded
 *             from the earlier one.
 */
export async function fetchBulkScreenerData(): Promise<BulkExportResult> {
  // ── Pass 1: fetch all screeners in order ──────────────────────────────────
  const rawPerScreener: { label: string; items: StockResult[] }[] = [];

  for (const screener of SCREENER_ENDPOINTS) {
    try {
      let items: StockResult[] = [];

      if (screener.id === 'alrayan') {
        items = await fetchAlrayanData();
      } else {
        const response = await fetch(
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

  // ── Pass 2: deduplicate — iterate LAST → FIRST, later screeners take priority ─
  // claimedSymbols grows as we move backwards through the list.
  // Any symbol already claimed by a later screener is dropped from earlier ones.
  const claimedSymbols = new Set<string>();
  const dedupedPerScreener: { label: string; items: StockResult[] }[] = [];

  for (let i = rawPerScreener.length - 1; i >= 0; i--) {
    const { label, items } = rawPerScreener[i];
    const uniqueItems = items.filter(s => !claimedSymbols.has(s.symbol));
    uniqueItems.forEach(s => claimedSymbols.add(s.symbol));
    dedupedPerScreener[i] = { label, items: uniqueItems };
  }

  // ── Build final flat list (original order) + breakdown ───────────────────
  const allData: StockResult[] = [];
  const screenerBreakdown: Record<string, number> = {};

  for (const { label, items } of dedupedPerScreener) {
    allData.push(...items);
    screenerBreakdown[label] = items.length;
  }

  return {
    data: allData,
    screenerBreakdown,
  };
}

/**
 * Fetches and filters Alrayan screener data from three parallel endpoints.
 */
async function fetchAlrayanData(): Promise<StockResult[]> {
  try {
    const [pricesRes, rsRes, techRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/prices/latest`, { cache: 'no-store', credentials: 'include' }),
      fetch(`${API_BASE_URL}/api/rs-v2/latest?limit=1000`, { cache: 'no-store', credentials: 'include' }),
      fetch(`${API_BASE_URL}/api/technical-screener/screener?limit=1000`, { cache: 'no-store', credentials: 'include' }),
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