const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

async function fetcher<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: 'no-store',
    ...init,
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  return response.json()
}

/**
 * =========================
 * 掃描器首頁相容格式
 * =========================
 */

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
    return await fetcher<LatestScanResponse>('/api/scan/latest')
  } catch {
    return null
  }
}

export async function runScan() {
  return fetcher('/api/scan/run', {
    method: 'POST',
  })
}

/**
 * =========================
 * 個股詳細頁新格式
 * =========================
 */

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

  institution_score?: number
  broker_score?: number
  main_force_score?: number
  final_score?: number

  technical_tag?: string
  radar_tag?: string
  support_price?: number
  pressure_price?: number
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

export type StockDetailResponse = {
  overview: StockOverview
  revenues: RevenueItem[]
  eps_list: EpsItem[]
  dividends: DividendItem[]
  financials: FinancialStatementItem[]
  news: NewsItem[]
  broker_branches?: BrokerBranchItem[]
}

export async function getStockDetail(
  stockId: string
): Promise<StockDetailResponse | null> {
  try {
    return await fetcher<StockDetailResponse>(`/api/stocks/${stockId}`)
  } catch {
    return null
  }
}

export async function getStockRevenue(
  stockId: string
): Promise<RevenueItem[]> {
  try {
    return await fetcher<RevenueItem[]>(`/api/stocks/${stockId}/revenues`)
  } catch {
    return []
  }
}

export async function getStockEps(
  stockId: string
): Promise<EpsItem[]> {
  try {
    return await fetcher<EpsItem[]>(`/api/stocks/${stockId}/eps`)
  } catch {
    return []
  }
}

export async function getStockDividends(
  stockId: string
): Promise<DividendItem[]> {
  try {
    return await fetcher<DividendItem[]>(`/api/stocks/${stockId}/dividends`)
  } catch {
    return []
  }
}

export async function getStockFinancials(
  stockId: string
): Promise<FinancialStatementItem[]> {
  try {
    return await fetcher<FinancialStatementItem[]>(
      `/api/stocks/${stockId}/financials`
    )
  } catch {
    return []
  }
}

export async function getStockNews(
  stockId: string
): Promise<NewsItem[]> {
  try {
    return await fetcher<NewsItem[]>(`/api/stocks/${stockId}/news`)
  } catch {
    return []
  }
}

export async function getStockBrokerBranches(
  stockId: string
): Promise<BrokerBranchItem[]> {
  try {
    return await fetcher<BrokerBranchItem[]>(
      `/api/stocks/${stockId}/broker-branches`
    )
  } catch {
    return []
  }
}
