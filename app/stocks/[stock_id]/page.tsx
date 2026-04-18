'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  getStockDetailClient,
  type DividendItem,
  type EpsItem,
  type FinancialStatementItem,
  type InstitutionalSummary,
  type MarginSummary,
  type NewsItem,
  type RevenueItem,
  type StockDetailResponse,
} from '@/lib/api'

type PriceHistoryPoint = {
  date: string
  close?: number | null
}

type CompanyProfile = {
  stock_id?: string
  industry?: string | null
  theme?: string | null
  industry_role?: string | null
  one_liner?: string | null
  positioning?: string | null
  core_tech?: string[]
  main_applications?: string[]
}

function fmtNumber(value?: number | null, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(value)) return '待補'
  return Number(value).toFixed(digits)
}

function fmtPercent(value?: number | null, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(value)) return '待補'
  return `${Number(value).toFixed(digits)}%`
}

function fmtSigned(value?: number | null, digits = 0) {
  if (value === null || value === undefined || Number.isNaN(value)) return '待補'
  const num = Number(value)
  return `${num > 0 ? '+' : ''}${num.toFixed(digits)}`
}

function fmtDate(value?: string | null) {
  if (!value) return '待補'
  return value
}

function fmtMoney100m(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) return '待補'
  return `${Number(value).toFixed(1)} 億`
}

function fmtCount(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) return '待補'
  return Number(value).toLocaleString('zh-TW')
}

function toYi(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) return null
  return Number(value) / 100000000
}

function fmtYi(value?: number | null, digits = 1) {
  const yi = toYi(value)
  if (yi === null) return '待補'
  return yi.toFixed(digits)
}

function fmtYiWithUnit(value?: number | null, digits = 1) {
  const yi = toYi(value)
  if (yi === null) return '待補'
  return `${yi.toFixed(digits)} 億`
}

function joinList(items?: string[] | null) {
  if (!items || !items.length) return '待補'
  return items.filter(Boolean).join('、')
}

function StatCard({
  title,
  value,
  hint,
  alert = false,
}: {
  title: string
  value: string
  hint?: string
  alert?: boolean
}) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className={`text-sm ${alert ? 'font-semibold text-red-600' : 'text-slate-500'}`}>{title}</div>
      <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</div>
      {hint ? <div className={`mt-1 text-sm ${alert ? 'text-red-600' : 'text-slate-600'}`}>{hint}</div> : null}
    </div>
  )
}

function StatCardSkeleton() {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
      <div className="mt-3 h-8 w-28 animate-pulse rounded bg-slate-200" />
      <div className="mt-3 h-4 w-32 animate-pulse rounded bg-slate-100" />
    </div>
  )
}

function SectionCard({
  title,
  extra,
  children,
}: {
  title: string
  extra?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-100">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        {extra}
      </div>
      <div className="p-6">{children}</div>
    </section>
  )
}

function SectionSkeleton({ title }: { title: string }) {
  return (
    <section className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-100">
      <div className="border-b border-slate-100 px-6 py-4">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      </div>
      <div className="p-6">
        <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    </section>
  )
}

function HeroBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm text-slate-100">
      {children}
    </span>
  )
}

function HeroInfoCard({
  title,
  main,
  sub,
  chips,
}: {
  title: string
  main: string
  sub?: string
  chips?: string[]
}) {
  return (
    <div className="rounded-3xl bg-white/10 p-4 ring-1 ring-white/10">
      <div className="text-sm text-slate-300">{title}</div>
      <div className="mt-2 text-xl font-bold text-white">{main}</div>
      {sub ? <div className="mt-2 text-sm leading-6 text-slate-300">{sub}</div> : null}
      {chips && chips.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <span
              key={chip}
              className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-slate-100"
            >
              {chip}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function HeroPriceChart({ data }: { data: PriceHistoryPoint[] }) {
  const valid = data.filter((item) => item.close !== null && item.close !== undefined && !Number.isNaN(item.close))
  if (!valid.length) {
    return (
      <div className="rounded-3xl bg-white/10 p-5 ring-1 ring-white/10">
        <div className="text-sm text-slate-300">180 天走勢圖</div>
        <div className="mt-4 flex h-[320px] items-center justify-center rounded-2xl bg-slate-950/30 text-sm text-slate-400">
          目前沒有走勢資料
        </div>
      </div>
    )
  }

  const values = valid.map((item) => Number(item.close))
  const min = Math.min(...values)
  const max = Math.max(...values)
  const first = Number(valid[0].close)
  const last = Number(valid[valid.length - 1].close)
  const range = max - min || 1
  const changePct = first !== 0 ? ((last - first) / first) * 100 : 0

  const points = valid.map((item, idx) => {
    const x = (idx / Math.max(valid.length - 1, 1)) * 100
    const y = 88 - ((Number(item.close) - min) / range) * 76
    return {
      x,
      y,
      date: item.date,
      close: Number(item.close),
    }
  })

  const polyline = points.map((point) => `${point.x},${point.y}`).join(' ')
  const midIndex = Math.floor(points.length / 2)
  const labelPoints = [points[0], points[midIndex], points[points.length - 1]]

  return (
    <div className="rounded-3xl bg-white/10 p-5 ring-1 ring-white/10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm text-slate-300">180 天走勢圖</div>
          <div className="mt-1 text-2xl font-bold text-white">{fmtNumber(last, 2)}</div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-right text-xs text-slate-300">
          <div>
            <div>區間低</div>
            <div className="mt-1 text-sm font-semibold text-white">{fmtNumber(min, 2)}</div>
          </div>
          <div>
            <div>區間高</div>
            <div className="mt-1 text-sm font-semibold text-white">{fmtNumber(max, 2)}</div>
          </div>
          <div>
            <div>區間漲跌</div>
            <div className="mt-1 text-sm font-semibold text-white">{fmtPercent(changePct, 2)}</div>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-slate-950/30 p-4">
        <svg viewBox="0 0 100 100" className="h-[320px] w-full overflow-visible">
          <line x1="0" y1="12" x2="100" y2="12" stroke="rgba(255,255,255,0.08)" strokeWidth="0.4" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.08)" strokeWidth="0.4" />
          <line x1="0" y1="88" x2="100" y2="88" stroke="rgba(255,255,255,0.08)" strokeWidth="0.4" />

          <polyline
            fill="none"
            stroke="#60a5fa"
            strokeWidth="1.8"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={polyline}
          />

          {points.length ? (
            <circle
              cx={points[points.length - 1].x}
              cy={points[points.length - 1].y}
              r="2.2"
              fill="#ffffff"
            />
          ) : null}

          {labelPoints.map((point) => (
            <text
              key={`${point.date}-${point.x}`}
              x={point.x}
              y="98"
              textAnchor="middle"
              fontSize="3.3"
              fill="rgba(255,255,255,0.72)"
            >
              {point.date.slice(5)}
            </text>
          ))}
        </svg>
      </div>
    </div>
  )
}

function LinePointChart({
  title,
  subtitle,
  data,
  unitLabel,
  valueFormatter,
  footer,
}: {
  title: string
  subtitle: string
  data: Array<{ label: string; value?: number | null }>
  unitLabel?: string
  valueFormatter?: (value?: number | null) => string
  footer?: string
}) {
  const valid = data.filter((d) => d.value !== null && d.value !== undefined && !Number.isNaN(d.value))
  if (!valid.length) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
        <div className="text-base font-semibold text-slate-900">{title}</div>
        <div className="mt-2 text-sm text-slate-500">{subtitle}</div>
        <div className="mt-6 flex h-64 items-center justify-center rounded-xl bg-white text-sm text-slate-400 ring-1 ring-slate-100">
          目前沒有資料
        </div>
      </div>
    )
  }

  const values = valid.map((d) => Number(d.value))
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const points = data
    .map((item, idx) => {
      const value = item.value
      if (value === null || value === undefined || Number.isNaN(value)) return null
      const x = (idx / Math.max(data.length - 1, 1)) * 100
      const y = 100 - ((Number(value) - min) / range) * 100
      return { x, y, label: item.label, value: Number(value) }
    })
    .filter(Boolean) as Array<{ x: number; y: number; label: string; value: number }>

  const polyline = points.map((p) => `${p.x},${p.y}`).join(' ')

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
      <div className="text-base font-semibold text-slate-900">{title}</div>
      <div className="mt-2 text-sm text-slate-500">{subtitle}</div>

      <div className="mt-6 rounded-xl bg-white p-4 ring-1 ring-slate-100">
        <svg viewBox="0 0 100 110" className="h-72 w-full overflow-visible">
          <polyline fill="none" stroke="#1e293b" strokeWidth="2" points={polyline} />
          {points.map((p) => (
            <g key={p.label}>
              <circle cx={p.x} cy={p.y} r="2.2" fill="#1e293b" />
              <text x={p.x} y={p.y - 4} textAnchor="middle" fontSize="3" fill="#64748b">
                {valueFormatter ? valueFormatter(p.value) : fmtNumber(p.value, 1)}
              </text>
              <text x={p.x} y="108" textAnchor="middle" fontSize="3" fill="#64748b">
                {p.label}
              </text>
            </g>
          ))}
        </svg>
        {unitLabel ? (
          <div className="mt-3 text-right text-xs text-slate-400">單位：{unitLabel}</div>
        ) : null}
      </div>

      {footer ? <div className="mt-4 text-sm text-slate-500">{footer}</div> : null}
    </div>
  )
}

function SimpleTable({
  headers,
  rows,
}: {
  headers: string[]
  rows: Array<Array<string | number>>
}) {
  if (!rows.length) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-sm text-slate-500">
        目前沒有資料
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl ring-1 ring-slate-100">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-700"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-t border-slate-100">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="whitespace-nowrap px-4 py-3 text-slate-800">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function buildRevenueChartData(
  revenues: RevenueItem[],
): Array<{ label: string; value: number | null }> {
  return revenues
    .slice(0, 12)
    .reverse()
    .map((item) => ({
      label: item.date ?? '',
      value: item.revenue !== null && item.revenue !== undefined ? toYi(item.revenue) : null,
    }))
    .filter((item) => item.label !== '')
}

function buildEpsChartData(
  epsList: EpsItem[],
): Array<{ label: string; value: number | null }> {
  return epsList
    .slice(0, 8)
    .reverse()
    .map((item) => ({
      label: item.quarter ?? '',
      value: item.eps ?? null,
    }))
    .filter((item) => item.label !== '')
}

function buildInstitutionalRows(summary?: InstitutionalSummary | null) {
  if (!summary) return []
  return [
    ['外資', fmtSigned(summary.foreign?.d1), fmtSigned(summary.foreign?.d5), fmtSigned(summary.foreign?.d10), fmtSigned(summary.foreign?.d20)],
    ['投信', fmtSigned(summary.trust?.d1), fmtSigned(summary.trust?.d5), fmtSigned(summary.trust?.d10), fmtSigned(summary.trust?.d20)],
    ['自營商', fmtSigned(summary.dealer?.d1), fmtSigned(summary.dealer?.d5), fmtSigned(summary.dealer?.d10), fmtSigned(summary.dealer?.d20)],
  ]
}

function buildMarginRows(summary?: MarginSummary | null) {
  if (!summary) return []
  return [
    ['融資', fmtSigned(summary.margin?.d1), fmtSigned(summary.margin?.d5), fmtSigned(summary.margin?.d10), fmtSigned(summary.margin?.d20), summary.margin_balance ?? '待補'],
    ['融券', fmtSigned(summary.short?.d1), fmtSigned(summary.short?.d5), fmtSigned(summary.short?.d10), fmtSigned(summary.short?.d20), summary.short_balance ?? '待補'],
  ]
}

export default function StockDetailPage() {
  const params = useParams<{ stock_id: string }>()
  const stockId = String(params?.stock_id || '')

  const [detail, setDetail] = useState<StockDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [loadFailed, setLoadFailed] = useState(false)

  useEffect(() => {
    let active = true

    async function loadInitial() {
      setLoading(true)
      setLoadFailed(false)

      const data = await getStockDetailClient(stockId)
      if (!active) return

      setDetail(data)
      setLoadFailed(!data)
      setLoading(false)
    }

    if (stockId) {
      loadInitial()
    }

    return () => {
      active = false
    }
  }, [stockId])

  async function handleRefresh() {
    setRefreshing(true)
    const data = await getStockDetailClient(stockId, { forceRefresh: true })
    setDetail(data)
    setLoadFailed(!data)
    setRefreshing(false)
  }

  const stockName = detail?.overview?.stock_name || stockId
  const tradeWarning = detail?.overview?.trade_warning || ''
  const hasRestriction = Boolean(tradeWarning)
  const meta = detail?.meta
  const overview = detail?.overview

  const companyProfile = useMemo(() => {
    return (((detail as any)?.company_profile ?? null) as CompanyProfile | null)
  }, [detail])

  const priceHistory180 = useMemo(() => {
    const raw = (detail as any)?.price_history_180
    if (!Array.isArray(raw)) return []
    return raw as PriceHistoryPoint[]
  }, [detail])

  const revenueChartData = useMemo(
    () => buildRevenueChartData(detail?.revenues ?? []),
    [detail]
  )
  const epsChartData = useMemo(
    () => buildEpsChartData(detail?.eps_list ?? []),
    [detail]
  )

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <section className="rounded-[28px] bg-slate-900 px-6 py-7 text-white shadow-sm md:px-8 md:py-8">
        <div className="grid gap-6 xl:grid-cols-[1.1fr,1.45fr,0.85fr] xl:items-stretch">
          <div className="flex flex-col justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                {stockId} {stockName}
              </h1>

              <div className="mt-4 flex flex-wrap gap-2">
                <HeroBadge>{companyProfile?.industry || overview?.industry || '待補產業'}</HeroBadge>
                <HeroBadge>{companyProfile?.theme || overview?.theme || '其他主題'}</HeroBadge>
                <HeroBadge>{meta?.label || '待補'}</HeroBadge>
              </div>

              <div className="mt-5 space-y-2">
                <div className="text-lg font-semibold text-white">
                  {companyProfile?.one_liner || '待補'}
                </div>
                <div className="text-sm leading-6 text-slate-300">
                  公司定位：{companyProfile?.industry_role || companyProfile?.positioning || '待補'}
                </div>
                <div className="text-sm leading-6 text-slate-300">
                  {loading
                    ? '頁面已先載入，個股資料正在背景讀取中。'
                    : `搜尋股票與榜單股票共用同一頁面。${meta?.in_selected ? '這檔有進今日榜單。' : '這檔未進今日榜單，但資料仍完整顯示。'}`}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/"
                className="rounded-2xl bg-white px-4 py-2 text-sm font-medium text-slate-900"
              >
                返回首頁
              </Link>
              <Link
                href="/stocks"
                className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/15"
              >
                搜尋股票
              </Link>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing || loading}
                className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {refreshing ? '重新整理中…' : '重新整理資料'}
              </button>
            </div>
          </div>

          <HeroPriceChart data={priceHistory180} />

          <div className="grid gap-4">
            <HeroInfoCard
              title="公司定位"
              main={companyProfile?.industry_role || '待補'}
              sub={companyProfile?.positioning || companyProfile?.one_liner || '待補'}
              chips={[
                companyProfile?.industry || overview?.industry || '待補',
                companyProfile?.theme || overview?.theme || '其他',
              ]}
            />

            <HeroInfoCard
              title="核心技術 / 主要應用"
              main={joinList(companyProfile?.core_tech)}
              sub={`主要應用：${joinList(companyProfile?.main_applications)}`}
            />
          </div>
        </div>

        {hasRestriction ? (
          <div className="mt-5 rounded-2xl bg-red-500/15 px-4 py-3 text-sm font-medium text-red-200 ring-1 ring-red-400/30">
            交易限制提醒：{tradeWarning}
          </div>
        ) : null}
      </section>

      {loadFailed && !loading ? (
        <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
          <div className="text-xl font-bold text-slate-900">找不到這檔股票資料</div>
          <p className="mt-2 text-slate-600">後端目前沒有回傳成功資料，請稍後重試。</p>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="最新收盤價"
              value={overview?.close !== undefined ? fmtNumber(overview.close, 2) : '待補'}
              hint={overview?.change_pct !== undefined ? `漲跌幅 ${fmtPercent(overview.change_pct, 2)}` : '待補'}
            />
            <StatCard
              title="外資當日買賣超"
              value={fmtSigned(detail?.institutional_summary?.foreign?.d1)}
              hint={detail?.institutional_summary?.latest_date ? `${detail.institutional_summary.latest_date} / 單位：張` : '單位：張'}
            />
            <StatCard
              title="投信當日買賣超"
              value={fmtSigned(detail?.institutional_summary?.trust?.d1)}
              hint={detail?.institutional_summary?.latest_date ? `${detail.institutional_summary.latest_date} / 單位：張` : '單位：張'}
            />
            <StatCard
              title="融資 / 融券當日變化"
              value={`${fmtSigned(detail?.margin_summary?.margin?.d1)} / ${fmtSigned(detail?.margin_summary?.short?.d1)}`}
              hint={detail?.margin_summary?.latest_date ? `${detail.margin_summary.latest_date} / 單位：張` : '單位：張'}
              alert={hasRestriction}
            />
          </>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="成交值"
              value={fmtMoney100m(overview?.turnover_100m)}
              hint={overview?.volume !== undefined ? `成交量 ${fmtCount(overview.volume)}` : '待補'}
            />
            <StatCard
              title="殖利率 / 本益比"
              value={
                overview?.dividend_yield !== undefined
                  ? `${fmtPercent(overview.dividend_yield, 2)} / ${fmtNumber(overview.pe_ratio, 2)}`
                  : '待補'
              }
              hint={overview?.pb_ratio !== undefined ? `PBR ${fmtNumber(overview.pb_ratio, 2)}` : '待補'}
            />
            <StatCard
              title={meta?.in_selected ? '籌碼 / 主力分數' : '今日榜單狀態'}
              value={
                meta?.in_selected
                  ? overview?.main_force_score !== undefined && overview?.main_force_score !== null
                    ? fmtNumber(overview.main_force_score, 1)
                    : '待補'
                  : meta?.label || '待補'
              }
              hint={
                meta?.in_selected
                  ? overview?.broker_score !== undefined && overview?.broker_score !== null
                    ? `券商分數 ${fmtNumber(overview.broker_score, 1)}`
                    : '待補'
                  : '這檔未進今日榜單'
              }
            />
            <StatCard
              title="近支撐 / 近壓力"
              value={`${fmtNumber(overview?.near_support, 2)} / ${fmtNumber(overview?.near_pressure, 2)}`}
              hint={`強支撐 ${fmtNumber(overview?.strong_support, 2)} / 強壓力 ${fmtNumber(overview?.strong_pressure, 2)}`}
            />
          </>
        )}
      </section>

      {loading ? (
        <>
          <section className="grid gap-6 xl:grid-cols-2">
            <SectionSkeleton title="EPS" />
            <SectionSkeleton title="月營收" />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <SectionSkeleton title="現金股利 / 股票股利" />
            <SectionSkeleton title="籌碼 / 技術摘要" />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <SectionSkeleton title="法人買賣超變化" />
            <SectionSkeleton title="融資融券變化" />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <SectionSkeleton title="財報" />
            <SectionSkeleton title="新聞" />
          </section>
        </>
      ) : detail ? (
        <>
          <section className="grid gap-6 xl:grid-cols-2">
            <SectionCard title="EPS" extra={<div className="text-sm text-slate-500">近 8 季</div>}>
              <LinePointChart
                title="EPS 趨勢圖"
                subtitle="每季一個點，較容易看轉折。"
                data={epsChartData}
                unitLabel="元"
                valueFormatter={(value) => fmtNumber(value, 2)}
                footer={
                  detail?.eps_list?.[0]
                    ? `最新一期 ${detail.eps_list[0].quarter} / EPS ${fmtNumber(detail.eps_list[0].eps, 2)} / 年增 ${fmtPercent(detail.eps_list[0].yoy, 1)}`
                    : '目前沒有 EPS 資料'
                }
              />
            </SectionCard>

            <SectionCard title="月營收" extra={<div className="text-sm text-slate-500">近 12 個月</div>}>
              <LinePointChart
                title="月營收趨勢圖"
                subtitle="每月一個點，已轉成較精簡數字。"
                data={revenueChartData}
                unitLabel="億"
                valueFormatter={(value) => fmtNumber(value, 1)}
                footer={
                  detail?.revenues?.[0]
                    ? `最新一期 ${detail.revenues[0].date} / 月營收 ${fmtYiWithUnit(detail.revenues[0].revenue, 1)} / 月增 ${fmtPercent(detail.revenues[0].revenue_mom, 1)} / 年增 ${fmtPercent(detail.revenues[0].revenue_yoy, 1)}`
                    : '目前沒有月營收資料'
                }
              />
            </SectionCard>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <SectionCard title="現金股利 / 股票股利">
              <SimpleTable
                headers={['年度', '除息日', '發放日', '現金股利', '股票股利', '殖利率']}
                rows={(detail?.dividends ?? []).slice(0, 8).map((item: DividendItem) => [
                  item.year,
                  fmtDate(item.ex_dividend_date),
                  fmtDate(item.payment_date),
                  item.cash_dividend !== undefined ? fmtNumber(item.cash_dividend, 2) : '待補',
                  item.stock_dividend !== undefined ? fmtNumber(item.stock_dividend, 2) : '待補',
                  item.dividend_yield !== undefined ? fmtPercent(item.dividend_yield, 2) : '待補',
                ])}
              />
            </SectionCard>

            <SectionCard title="籌碼 / 技術摘要">
              <SimpleTable
                headers={['項目', '數值']}
                rows={[
                  ['產業', overview?.industry || '待補'],
                  ['主題', overview?.theme || '其他'],
                  ['一句話定位', companyProfile?.one_liner || '待補'],
                  ['公司定位', companyProfile?.industry_role || companyProfile?.positioning || '待補'],
                  ['核心技術', joinList(companyProfile?.core_tech)],
                  ['主要應用', joinList(companyProfile?.main_applications)],
                  ['今日榜單狀態', meta?.label || '待補'],
                  ['技術標籤', meta?.in_selected ? (overview?.technical_tag || '待補') : '未進榜不顯示'],
                  ['雷達標籤', meta?.in_selected ? (overview?.radar_tag || '待補') : '未進榜不顯示'],
                  ['法人分數', meta?.in_selected ? (overview?.institution_score !== undefined && overview?.institution_score !== null ? fmtNumber(overview.institution_score, 1) : '待補') : '未進榜不顯示'],
                  ['券商分數', meta?.in_selected ? (overview?.broker_score !== undefined && overview?.broker_score !== null ? fmtNumber(overview.broker_score, 1) : '待補') : '未進榜不顯示'],
                  ['主力分數', meta?.in_selected ? (overview?.main_force_score !== undefined && overview?.main_force_score !== null ? fmtNumber(overview.main_force_score, 1) : '待補') : '未進榜不顯示'],
                  ['近支撐', fmtNumber(overview?.near_support, 2)],
                  ['強支撐', fmtNumber(overview?.strong_support, 2)],
                  ['近壓力', fmtNumber(overview?.near_pressure, 2)],
                  ['強壓力', fmtNumber(overview?.strong_pressure, 2)],
                  ['交易限制', tradeWarning || '無'],
                ]}
              />
            </SectionCard>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <SectionCard title="法人買賣超變化" extra={<div className="text-sm text-slate-500">單位：張</div>}>
              <SimpleTable
                headers={['法人', '當日', '5日', '10日', '20日']}
                rows={buildInstitutionalRows(detail?.institutional_summary)}
              />
            </SectionCard>

            <SectionCard title="融資融券變化" extra={<div className="text-sm text-slate-500">單位：張</div>}>
              <SimpleTable
                headers={['項目', '當日', '5日', '10日', '20日', '目前餘額']}
                rows={buildMarginRows(detail?.margin_summary)}
              />
            </SectionCard>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <SectionCard title="財報">
              <SimpleTable
                headers={['期間', '營收(億)', '毛利(億)', '營業利益(億)', '淨利(億)', 'EPS']}
                rows={(detail?.financials ?? []).slice(0, 8).map((item: FinancialStatementItem) => [
                  item.period,
                  item.revenue !== undefined ? fmtYi(item.revenue, 1) : '待補',
                  item.gross_profit !== undefined ? fmtYi(item.gross_profit, 1) : '待補',
                  item.operating_income !== undefined ? fmtYi(item.operating_income, 1) : '待補',
                  item.net_income !== undefined ? fmtYi(item.net_income, 1) : '待補',
                  item.eps !== undefined ? fmtNumber(item.eps, 2) : '待補',
                ])}
              />
            </SectionCard>

            <SectionCard title="新聞">
              <SimpleTable
                headers={['時間', '來源', '標題']}
                rows={(detail?.news ?? []).slice(0, 10).map((item: NewsItem) => [
                  item.published_at || '待補',
                  item.source || '待補',
                  item.title,
                ])}
              />
            </SectionCard>
          </section>
        </>
      ) : null}
    </main>
  )
}
