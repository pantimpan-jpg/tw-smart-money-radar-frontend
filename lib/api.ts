const API_BASE_URL =
  (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')

const STOCK_DETAIL_CACHE_TTL_MS = 5 * 60 * 1000

type FetcherOptions = RequestInit & {
  next?: NextFetchRequestConfig
}

async function fetcher<T>(path: string, init?: FetcherOptions): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, init)

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  return response.json()
}

function getStockDetailCacheKey(stockId: string) {
  return `stock-detail-cache:${stockId}`
}

function readStockDetailCache(stockId: string): StockDetailResponse | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.sessionStorage.getItem(getStockDetailCacheKey(stockId))
    if (!raw) return null

    const parsed = JSON.parse(raw) as {
      savedAt: number
      data: StockDetailResponse
    }

    if (!parsed?.savedAt || !parsed?.data) return null

    if (Date.now() - parsed.savedAt > STOCK_DETAIL_CACHE_TTL_MS) {
      window.sessionStorage.removeItem(getStockDetailCacheKey(stockId))
      return null
    }

    return parsed.data
  } catch {
    return null
  }
}

function writeStockDetailCache(stockId: string, data: StockDetailResponse) {
  if (typeof window === 'undefined') return

  try {
    window.sessionStorage.setItem(
      getStockDetailCacheKey(stockId),
      JSON.stringify({
        savedAt: Date.now(),
        data,
      })
    )
  } catch {
    // ignore cache write failure
  }
}

export type StockRow = {
  stock_id: string
  name?: string
  stock_name?: string
  theme?: string
  group?: string
  close?: number
  volume_ratio?: number
  turnover_100m?: number
  score?: number
  score_total?: number
  radar_tag?: string
  tag?: string
  institution_score?: number
  broker_score?: number
  main_force_score?: number
  revenue_yoy?: number
  revenue_mom?: number
  pct_5d?: number
  pct_20d?: number
  change_pct?: number
  near_support?: number | null
  strong_support?: number | null
  near_resistance?: number | null
  strong_resistance?: number | null
  trade_warning?: string | null
  is_restricted?: boolean
}

export type ScanPayload = {
  summary: {
    market_scanned: number
    selected: number
    starting_count: number
    second_wave_count: number
    overheated_count: number
  }
  top30: StockRow[]
  watchlist: StockRow[]
  starting: StockRow[]
  second_wave: StockRow[]
  broker_track: StockRow[]
  overheated: StockRow[]
  high_turnover: StockRow[]
  all_selected: StockRow[]
}

export type LatestScanResponse = {
  updated_at?: string
  data: ScanPayload
}

export async function getLatestScan(): Promise<LatestScanResponse | null> {
  try {
    return await fetcher<LatestScanResponse>('/api/scan/latest', {
      cache: 'no-store',
    })
  } catch {
    return null
  }
}

export async function runScan() {
  return fetcher('/api/scan/run', {
    method: 'POST',
    cache: 'no-store',
  })
}

export type StockMeta = {
  stock_id: string
  in_selected: boolean
  source: string
  has_scoring: boolean
  label: string
}

export type StockOverview = {
  stock_id: string
  stock_name: string
  industry?: string
  theme?: string
  close?: number
  change?: number
  change_pct?: number
  volume?: number
  turnover_100m?: number
  market_cap_100m?: number
  pe_ratio?: number
  pb_ratio?: number
  dividend_yield?: number
  foreign_buy_sell?: number
  investment_trust_buy_sell?: number
  dealer_buy_sell?: number
  margin_balance?: number
  short_balance?: number
  margin_change?: number
  short_change?: number
  institution_score?: number | null
  broker_score?: number | null
  main_force_score?: number | null
  final_score?: number | null
  technical_tag?: string | null
  radar_tag?: string | null
  near_support?: number | null
  strong_support?: number | null
  near_pressure?: number | null
  strong_pressure?: number | null
  trade_warning?: string | null
  is_restricted?: boolean
}

export type RevenueItem = {
  date: string
  revenue?: number
  revenue_mom?: number
  revenue_yoy?: number
}

export type EpsItem = {
  quarter: string
  eps?: number
  yoy?: number
  qoq?: number
}

export type DividendItem = {
  year: string
  ex_dividend_date?: string
  payment_date?: string
  cash_dividend?: number
  stock_dividend?: number
  dividend_yield?: number
}

export type FinancialStatementItem = {
  period: string
  revenue?: number
  gross_profit?: number
  operating_income?: number
  net_income?: number
  eps?: number
}

export type NewsItem = {
  id?: string
  title: string
  summary?: string
  source?: string
  published_at?: string
  url?: string
}

export type BrokerBranchItem = {
  broker_name: string
  branch_name?: string
  buy?: number
  sell?: number
  net?: number
}

export type WindowSummary = {
  d1?: number | null
  d5?: number | null
  d10?: number | null
  d20?: number | null
}

export type InstitutionalSummary = {
  latest_date?: string | null
  foreign?: WindowSummary
  trust?: WindowSummary
  dealer?: WindowSummary
}

export type MarginSummary = {
  latest_date?: string | null
  margin_balance?: number | null
  short_balance?: number | null
  margin?: WindowSummary
  short?: WindowSummary
}

export type StockDetailResponse = {
  meta: StockMeta
  overview: StockOverview
  revenues: RevenueItem[]
  eps_list: EpsItem[]
  dividends: DividendItem[]
  financials: FinancialStatementItem[]
  news: NewsItem[]
  broker_branches?: BrokerBranchItem[]
  institutional_summary?: InstitutionalSummary
  margin_summary?: MarginSummary
}

export type SearchStockItem = {
  stock_id: string
  name?: string
  close?: number
  group?: string | null
  theme?: string | null
  turnover_100m?: number | null
  in_selected: boolean
  radar_tag?: string | null
  score_total?: number | null
  trade_warning?: string | null
}

export async function getStockDetail(
  stockId: string
): Promise<StockDetailResponse | null> {
  try {
    return await fetcher<StockDetailResponse>(`/api/stocks/${stockId}`, {
      next: { revalidate: 300 },
    })
  } catch {
    return null
  }
}

export async function getStockDetailClient(
  stockId: string,
  options?: {
    forceRefresh?: boolean
  }
): Promise<StockDetailResponse | null> {
  const forceRefresh = options?.forceRefresh ?? false

  if (!forceRefresh) {
    const cached = readStockDetailCache(stockId)
    if (cached) return cached
  }

  try {
    const data = await fetcher<StockDetailResponse>(`/api/stocks/${stockId}`, {
      cache: 'no-store',
    })
    writeStockDetailCache(stockId, data)
    return data
  } catch {
    return null
  }
}

export async function searchStocks(
  q: string,
  limit = 50
): Promise<SearchStockItem[]> {
  try {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    params.set('limit', String(limit))
    return await fetcher<SearchStockItem[]>(`/api/stocks?${params.toString()}`, {
      cache: 'no-store',
    })
  } catch {
    return []
  }
}
