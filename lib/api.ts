const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ||
  'https://tw-smart-money-radar-backend.onrender.com'

export type ScanSummary = {
  market_scanned?: number
  selected?: number
  starting_count?: number
  starting_breakout_count?: number
  starting_accum_count?: number
  second_wave_count?: number
  strong_trend_count?: number
  overheated_count?: number
}

export type StockRow = {
  stock_id: string
  name: string
  close?: number | null
  group?: string | null
  theme?: string | null
  turnover_100m?: number | null
  score?: number | null
  score_total?: number | null
  tag?: string | null
  radar_tag?: string | null
  reason_text?: string | null
  near_support?: number | null
  strong_support?: number | null
  near_resistance?: number | null
  strong_resistance?: number | null
  near_pressure?: number | null
  strong_pressure?: number | null
  technical_tag?: string | null
  in_selected?: boolean
  trade_warning?: string | null
  [key: string]: unknown
}

export type ScanPayload = {
  summary?: ScanSummary
  top30?: StockRow[]
  watchlist?: StockRow[]
  starting?: StockRow[]
  starting_breakout?: StockRow[]
  starting_accum?: StockRow[]
  second_wave?: StockRow[]
  strong_trend?: StockRow[]
  broker_track?: StockRow[]
  overheated?: StockRow[]
  high_turnover?: StockRow[]
  all_selected?: StockRow[]
}

export type LatestScanResponse = {
  updated_at?: string
  data?: ScanPayload
}

export type ScanStatusResponse = {
  scan_running?: boolean
  percent?: number
  stage?: string
  message?: string
  processed?: number
  total?: number
  success?: number
  failed?: number
  skipped?: number
  last_scan_error?: string | null
  last_updated?: string | null
}

export type StockMeta = {
  stock_id: string
  in_selected: boolean
  source: string
  has_scoring: boolean
  label: string
}

export type StockOverview = {
  stock_id?: string
  stock_name?: string
  industry?: string | null
  theme?: string | null
  close?: number | null
  change?: number | null
  change_pct?: number | null
  volume?: number | null
  turnover_100m?: number | null
  market_cap_100m?: number | null
  pe_ratio?: number | null
  pb_ratio?: number | null
  dividend_yield?: number | null
  foreign_buy_sell?: number | null
  investment_trust_buy_sell?: number | null
  dealer_buy_sell?: number | null
  margin_balance?: number | null
  short_balance?: number | null
  margin_change?: number | null
  short_change?: number | null
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
  date?: string | null
  revenue?: number | null
  revenue_mom?: number | null
  revenue_yoy?: number | null
}

export type EpsItem = {
  quarter?: string | null
  eps?: number | null
  yoy?: number | null
  qoq?: number | null
}

export type DividendItem = {
  year?: string | null
  ex_dividend_date?: string | null
  payment_date?: string | null
  cash_dividend?: number | null
  stock_dividend?: number | null
  dividend_yield?: number | null
}

export type FinancialStatementItem = {
  period?: string | null
  revenue?: number | null
  gross_profit?: number | null
  operating_income?: number | null
  net_income?: number | null
  eps?: number | null
}

export type NewsItem = {
  id?: string | number | null
  title: string
  summary?: string | null
  source?: string | null
  published_at?: string | null
  url?: string | null
}

export type BrokerBranchItem = {
  broker_name?: string | null
  branch_name?: string | null
  buy?: number | null
  sell?: number | null
  net?: number | null
}

export type InstitutionalWindow = {
  d1?: number | null
  d5?: number | null
  d10?: number | null
  d20?: number | null
}

export type InstitutionalSummary = {
  latest_date?: string | null
  foreign?: InstitutionalWindow
  trust?: InstitutionalWindow
  dealer?: InstitutionalWindow
}

export type MarginWindow = {
  d1?: number | null
  d5?: number | null
  d10?: number | null
  d20?: number | null
}

export type MarginSummary = {
  latest_date?: string | null
  margin_balance?: number | null
  short_balance?: number | null
  margin?: MarginWindow
  short?: MarginWindow
}

export type CompanyProfile = {
  stock_id?: string
  industry?: string | null
  theme?: string | null
  industry_role?: string | null
  one_liner?: string | null
  positioning?: string | null
  core_tech?: string[]
  main_applications?: string[]
}

export type PriceHistoryPoint = {
  date: string
  close?: number | null
}

export type StockDetailResponse = {
  meta?: StockMeta
  overview?: StockOverview
  company_profile?: CompanyProfile
  price_history_180?: PriceHistoryPoint[]
  revenues?: RevenueItem[]
  eps_list?: EpsItem[]
  dividends?: DividendItem[]
  financials?: FinancialStatementItem[]
  news?: NewsItem[]
  broker_branches?: BrokerBranchItem[]
  institutional_summary?: InstitutionalSummary
  margin_summary?: MarginSummary
}

type FetchJsonOptions = {
  cache?: RequestCache
  signal?: AbortSignal
}

async function fetchJson<T>(url: string, options: FetchJsonOptions = {}): Promise<T> {
  const response = await fetch(url, {
    method: 'GET',
    cache: options.cache ?? 'no-store',
    signal: options.signal,
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  return (await response.json()) as T
}

function withNoCacheTs(url: string, enabled?: boolean) {
  if (!enabled) return url
  const joiner = url.includes('?') ? '&' : '?'
  return `${url}${joiner}_ts=${Date.now()}`
}

export async function getLatestScan(): Promise<LatestScanResponse | null> {
  try {
    return await fetchJson<LatestScanResponse>(`${API_BASE}/api/scan/latest`)
  } catch (error) {
    console.error('getLatestScan failed', error)
    return null
  }
}

export async function getScanStatus(): Promise<ScanStatusResponse | null> {
  try {
    return await fetchJson<ScanStatusResponse>(`${API_BASE}/api/scan/status`)
  } catch (error) {
    console.error('getScanStatus failed', error)
    return null
  }
}

export async function triggerScan(): Promise<{ ok?: boolean; message?: string; status?: ScanStatusResponse } | null> {
  try {
    const response = await fetch(`${API_BASE}/api/scan/run`, {
      method: 'POST',
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    return (await response.json()) as { ok?: boolean; message?: string; status?: ScanStatusResponse }
  } catch (error) {
    console.error('triggerScan failed', error)
    return null
  }
}

export async function getTop30(): Promise<StockRow[]> {
  try {
    return await fetchJson<StockRow[]>(`${API_BASE}/api/scan/top30`)
  } catch (error) {
    console.error('getTop30 failed', error)
    return []
  }
}

export async function getWatchlist(): Promise<StockRow[]> {
  try {
    return await fetchJson<StockRow[]>(`${API_BASE}/api/scan/watchlist`)
  } catch (error) {
    console.error('getWatchlist failed', error)
    return []
  }
}

export async function searchStocks(
  q: string,
  limit = 50,
  options?: { tag?: string; theme?: string; forceRefresh?: boolean },
): Promise<StockRow[]> {
  const params = new URLSearchParams()

  if (q?.trim()) params.set('q', q.trim())
  params.set('limit', String(limit))

  if (options?.tag) params.set('tag', options.tag)
  if (options?.theme) params.set('theme', options.theme)

  let url = `${API_BASE}/api/stocks?${params.toString()}`
  url = withNoCacheTs(url, options?.forceRefresh)

  try {
    return await fetchJson<StockRow[]>(url)
  } catch (error) {
    console.error('searchStocks failed', error)
    return []
  }
}

export async function getStockDetailClient(
  stockId: string,
  options?: { forceRefresh?: boolean; signal?: AbortSignal },
): Promise<StockDetailResponse | null> {
  if (!stockId) return null

  let url = `${API_BASE}/api/stocks/${encodeURIComponent(stockId)}`
  url = withNoCacheTs(url, options?.forceRefresh)

  try {
    return await fetchJson<StockDetailResponse>(url, {
      cache: 'no-store',
      signal: options?.signal,
    })
  } catch (error) {
    console.error('getStockDetailClient failed', error)
    return null
  }
}
