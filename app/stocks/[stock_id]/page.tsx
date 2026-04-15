import Link from 'next/link'
import {
  getStockDetail,
  type DividendItem,
  type EpsItem,
  type FinancialStatementItem,
  type NewsItem,
  type RevenueItem,
  type StockDetailResponse,
} from '@/lib/api'

type PageProps = {
  params: {
    stock_id: string
  }
}

function fmtNumber(value?: number | null, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(value)) return '待補'
  return Number(value).toFixed(digits)
}

function fmtPercent(value?: number | null, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(value)) return '待補'
  return `${Number(value).toFixed(digits)}%`
}

function fmtSigned(value?: number | null, digits = 2) {
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

function StatCard({
  title,
  value,
  hint,
}: {
  title: string
  value: string
  hint?: string
}) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</div>
      {hint ? <div className="mt-1 text-sm text-slate-600">{hint}</div> : null}
    </div>
  )
}

function SectionCard({
  title,
  extra,
  children,
}: {
  title: string
  extra?: React.ReactNode
  children: React.ReactNode
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

function PlaceholderChart({
  title,
  subtitle,
  data,
  footer,
}: {
  title: string
  subtitle: string
  data: Array<{ label: string; value?: number | null; sub1?: string; sub2?: string }>
  footer?: string
}) {
  const validValues = data
    .map((item) => item.value)
    .filter((value): value is number => value !== null && value !== undefined && !Number.isNaN(value))

  const maxValue = validValues.length ? Math.max(...validValues.map((v) => Math.abs(v)), 1) : 1

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
      <div className="text-base font-semibold text-slate-900">{title}</div>
      <div className="mt-2 text-sm text-slate-500">{subtitle}</div>

      <div className="mt-6 grid h-64 grid-cols-6 items-end gap-3 rounded-xl bg-white p-4 ring-1 ring-slate-100">
        {data.length ? (
          data.map((item) => {
            const raw = item.value
            const hasValue =
              raw !== null && raw !== undefined && !Number.isNaN(raw)
            const height = hasValue
              ? Math.max((Math.abs(raw) / maxValue) * 100, 8)
              : 8

            return (
              <div key={item.label} className="flex h-full flex-col justify-end">
                <div className="mb-2 text-center text-[11px] text-slate-400">
                  {hasValue ? fmtNumber(raw, 2) : '待補'}
                </div>
                <div
                  className={`rounded-t-xl ${
                    hasValue ? 'bg-slate-800' : 'bg-slate-200'
                  }`}
                  style={{ height: `${height}%` }}
                />
                <div className="mt-2 text-center text-[11px] text-slate-500">
                  {item.label}
                </div>
              </div>
            )
          })
        ) : (
          <div className="col-span-6 flex h-full items-center justify-center text-sm text-slate-400">
            目前沒有資料
          </div>
        )}
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

function buildRevenueRows(revenues: RevenueItem[]) {
  return revenues.slice(0, 12).map((item) => [
    item.date,
    item.revenue !== undefined ? fmtNumber(item.revenue, 2) : '待補',
    item.revenue_mom !== undefined ? fmtPercent(item.revenue_mom, 1) : '待補',
    item.revenue_yoy !== undefined ? fmtPercent(item.revenue_yoy, 1) : '待補',
  ])
}

function buildDividendRows(dividends: DividendItem[]) {
  return dividends.slice(0, 8).map((item) => [
    item.year,
    fmtDate(item.ex_dividend_date),
    fmtDate(item.payment_date),
    item.cash_dividend !== undefined ? fmtNumber(item.cash_dividend, 2) : '待補',
    item.stock_dividend !== undefined ? fmtNumber(item.stock_dividend, 2) : '待補',
    item.dividend_yield !== undefined ? fmtPercent(item.dividend_yield, 2) : '待補',
  ])
}

function buildFinancialRows(financials: FinancialStatementItem[]) {
  return financials.slice(0, 8).map((item) => [
    item.period,
    item.revenue !== undefined ? fmtNumber(item.revenue, 2) : '待補',
    item.gross_profit !== undefined ? fmtNumber(item.gross_profit, 2) : '待補',
    item.operating_income !== undefined ? fmtNumber(item.operating_income, 2) : '待補',
    item.net_income !== undefined ? fmtNumber(item.net_income, 2) : '待補',
    item.eps !== undefined ? fmtNumber(item.eps, 2) : '待補',
  ])
}

function buildNewsRows(news: NewsItem[]) {
  return news.slice(0, 10).map((item) => [
    item.published_at || '待補',
    item.source || '待補',
    item.title,
  ])
}

function buildRevenueChartData(revenues: RevenueItem[]) {
  return revenues.slice(0, 6).map((item) => ({
    label: item.date,
    value: item.revenue,
  }))
}

function buildEpsChartData(epsList: EpsItem[]) {
  return epsList.slice(0, 6).map((item) => ({
    label: item.quarter,
    value: item.eps,
  }))
}

export default async function StockDetailPage({ params }: PageProps) {
  const stockId = params.stock_id
  const detail: StockDetailResponse | null = await getStockDetail(stockId)

  const overview = detail?.overview
  const stockName = overview?.stock_name || stockId

  const revenues = detail?.revenues ?? []
  const epsList = detail?.eps_list ?? []
  const dividends = detail?.dividends ?? []
  const financials = detail?.financials ?? []
  const news = detail?.news ?? []
  const brokerBranches = detail?.broker_branches ?? []

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <section className="rounded-[28px] bg-slate-900 px-6 py-7 text-white shadow-sm md:px-8 md:py-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-200 ring-1 ring-white/15">
              個股詳細頁 V1
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
              {stockId} {stockName}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 md:text-base">
              先把個股頁完整接起來，後面再慢慢補你要的券商分點、第二波判斷、支撐壓力與劇本區塊。
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/"
                className="rounded-2xl bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
              >
                返回首頁
              </Link>
              <Link
                href="/stocks"
                className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/15 transition hover:bg-white/15"
              >
                查看全清單
              </Link>
            </div>
          </div>

          <div className="rounded-3xl bg-white/10 p-4 ring-1 ring-white/10">
            <div className="text-sm text-slate-300">資料狀態</div>
            <div className="mt-2 text-lg font-semibold text-white">
              {detail ? '已接 API' : '尚未取得資料'}
            </div>
            <div className="mt-1 text-sm text-slate-300">
              {detail ? '有資料就顯示，沒有資料就安全 fallback。' : '後端 API 準備好後會自動顯示。'}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="最新收盤價"
          value={overview?.close !== undefined ? fmtNumber(overview.close, 2) : '待補'}
          hint={overview?.change_pct !== undefined ? `漲跌幅 ${fmtPercent(overview.change_pct, 2)}` : 'TaiwanStockPrice'}
        />
        <StatCard
          title="外資買賣超"
          value={overview?.foreign_buy_sell !== undefined ? fmtSigned(overview.foreign_buy_sell, 0) : '待補'}
          hint={overview?.industry || 'Institutional / Shareholding'}
        />
        <StatCard
          title="投信買賣超"
          value={
            overview?.investment_trust_buy_sell !== undefined
              ? fmtSigned(overview.investment_trust_buy_sell, 0)
              : '待補'
          }
          hint={overview?.theme || 'Institutional'}
        />
        <StatCard
          title="融資變化"
          value={overview?.margin_change !== undefined ? fmtSigned(overview.margin_change, 0) : '待補'}
          hint={overview?.margin_balance !== undefined ? `融資餘額 ${fmtCount(overview.margin_balance)}` : 'MarginPurchaseShortSale'}
        />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
          title="籌碼 / 主力分數"
          value={
            overview?.main_force_score !== undefined
              ? fmtNumber(overview.main_force_score, 1)
              : '待補'
          }
          hint={
            overview?.broker_score !== undefined
              ? `券商分數 ${fmtNumber(overview.broker_score, 1)}`
              : '待補'
          }
        />
        <StatCard
          title="支撐 / 壓力"
          value={
            overview?.support_price !== undefined || overview?.pressure_price !== undefined
              ? `${fmtNumber(overview.support_price, 2)} / ${fmtNumber(overview.pressure_price, 2)}`
              : '待補'
          }
          hint={overview?.radar_tag || overview?.technical_tag || '待補'}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="EPS"
          extra={
            <div className="text-sm text-slate-500">
              最近 {epsList.length || 0} 筆
            </div>
          }
        >
          <PlaceholderChart
            title="EPS 趨勢圖"
            subtitle="之後可再換成真正折線圖或柱狀圖。"
            data={buildEpsChartData(epsList)}
            footer={
              epsList[0]
                ? `最新一期 ${epsList[0].quarter} / EPS ${fmtNumber(epsList[0].eps, 2)} / 年增 ${fmtPercent(
                    epsList[0].yoy,
                    1
                  )}`
                : '目前沒有 EPS 資料'
            }
          />
        </SectionCard>

        <SectionCard
          title="月營收"
          extra={
            <div className="text-sm text-slate-500">
              最近 {revenues.length || 0} 筆
            </div>
          }
        >
          <PlaceholderChart
            title="月營收趨勢圖"
            subtitle="之後可再換成真正折線圖或柱狀圖。"
            data={buildRevenueChartData(revenues)}
            footer={
              revenues[0]
                ? `最新一期 ${revenues[0].date} / 月增 ${fmtPercent(
                    revenues[0].revenue_mom,
                    1
                  )} / 年增 ${fmtPercent(revenues[0].revenue_yoy, 1)}`
                : '目前沒有月營收資料'
            }
          />
        </SectionCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="現金股利 / 股票股利">
          <SimpleTable
            headers={['年度', '除息日', '發放日', '現金股利', '股票股利', '殖利率']}
            rows={buildDividendRows(dividends)}
          />
        </SectionCard>

        <SectionCard title="籌碼 / 技術摘要">
          <SimpleTable
            headers={['項目', '數值']}
            rows={[
              ['產業', overview?.industry || '待補'],
              ['主題', overview?.theme || '待補'],
              ['技術標籤', overview?.technical_tag || '待補'],
              ['雷達標籤', overview?.radar_tag || '待補'],
              ['法人分數', overview?.institution_score !== undefined ? fmtNumber(overview.institution_score, 1) : '待補'],
              ['券商分數', overview?.broker_score !== undefined ? fmtNumber(overview.broker_score, 1) : '待補'],
              ['主力分數', overview?.main_force_score !== undefined ? fmtNumber(overview.main_force_score, 1) : '待補'],
              ['最終分數', overview?.final_score !== undefined ? fmtNumber(overview.final_score, 1) : '待補'],
              ['外資持股變化', overview?.foreign_buy_sell !== undefined ? fmtSigned(overview.foreign_buy_sell, 0) : '待補'],
              ['融券餘額', overview?.short_balance !== undefined ? fmtCount(overview.short_balance) : '待補'],
            ]}
          />
        </SectionCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="財報">
          <SimpleTable
            headers={['期間', '營收', '毛利', '營業利益', '淨利', 'EPS']}
            rows={buildFinancialRows(financials)}
          />
        </SectionCard>

        <SectionCard title="新聞">
          <SimpleTable
            headers={['時間', '來源', '標題']}
            rows={buildNewsRows(news)}
          />
        </SectionCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="月營收明細">
          <SimpleTable
            headers={['日期', '營收', '月增', '年增']}
            rows={buildRevenueRows(revenues)}
          />
        </SectionCard>

        <SectionCard title="券商分點摘要">
          <SimpleTable
            headers={['券商', '分點', '買進', '賣出', '淨額']}
            rows={brokerBranches.slice(0, 10).map((item) => [
              item.broker_name,
              item.branch_name || '待補',
              item.buy !== undefined ? fmtCount(item.buy) : '待補',
              item.sell !== undefined ? fmtCount(item.sell) : '待補',
              item.net !== undefined ? fmtSigned(item.net, 0) : '待補',
            ])}
          />
        </SectionCard>
      </section>
    </main>
  )
}
