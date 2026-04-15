const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:8000'

async function fetcher<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  return response.json()
}

export type ScanStock = {
  stock_id: string
  name?: string
  stock_name?: string
  close?: number
  change_pct?: number
  volume_ratio?: number
  turnover_100m?: number
  score?: number
  score_total?: number
  tag?: string
  radar_tag?: string
  theme?: string
  group?: string
  pct_5d?: number
  pct_20d?: number
  revenue_yoy?: number
  revenue_mom?: number
  institution_score?: number
  broker_score?: number
  main_force_score?: number
}

export type LatestScanResponse = {
  updated_at?: string
  market_summary?: {
    total_stocks?: number
    rising_count?: number
    limit_up_count?: number
    high_turnover_count?: number
  }

  starting_stocks?: ScanStock[]
  second_wave_stocks?: ScanStock[]
  acceleration_stocks?: ScanStock[]
  high_turnover_stocks?: ScanStock[]
  overheated_stocks?: ScanStock[]
  watchlist_stocks?: ScanStock[]
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

export async function getLatestScan(): Promise<LatestScanResponse> {
  return fetcher<LatestScanResponse>('/api/latest-scan')
}

export async function getStockDetail(
  stockId: string
): Promise<StockDetailResponse> {
  return fetcher<StockDetailResponse>(`/api/stocks/${stockId}`)
}

export async function getStockRevenue(
  stockId: string
): Promise<RevenueItem[]> {
  return fetcher<RevenueItem[]>(`/api/stocks/${stockId}/revenues`)
}

export async function getStockEps(
  stockId: string
): Promise<EpsItem[]> {
  return fetcher<EpsItem[]>(`/api/stocks/${stockId}/eps`)
}

export async function getStockDividends(
  stockId: string
): Promise<DividendItem[]> {
  return fetcher<DividendItem[]>(`/api/stocks/${stockId}/dividends`)
}

export async function getStockFinancials(
  stockId: string
): Promise<FinancialStatementItem[]> {
  return fetcher<FinancialStatementItem[]>(
    `/api/stocks/${stockId}/financials`
  )
}

export async function getStockNews(
  stockId: string
): Promise<NewsItem[]> {
  return fetcher<NewsItem[]>(`/api/stocks/${stockId}/news`)
}

export async function getStockBrokerBranches(
  stockId: string
): Promise<BrokerBranchItem[]> {
  return fetcher<BrokerBranchItem[]>(
    `/api/stocks/${stockId}/broker-branches`
  )
}
