import Link from 'next/link'
import { ScanButton } from '@/components/scan-button'

type StockRow = {
  stock_id: string
  name?: string | null
  theme?: string | null
  close?: number | null
  turnover_100m?: number | null
  score_total?: number | null
  score?: number | null
  radar_tag?: string | null
  tag?: string | null
  trade_warning?: string | null
}

type LatestScanResponse = {
  updated_at?: string | null
  data?: {
    starting?: StockRow[]
    second_wave?: StockRow[]
    watchlist?: StockRow[]
    summary?: {
      market_scanned?: number | null
      selected?: number | null
      starting_count?: number | null
      second_wave_count?: number | null
    }
  }
}

type ScanStatusResponse = {
  scan_running?: boolean
  percent?: number
  stage?: string | null
  message?: string | null
  processed?: number
  total?: number
  success?: number
  failed?: number
  skipped?: number
  last_scan_error?: string | null
  last_updated?: string | null
}

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '')

function buildApiUrl(path: string) {
  if (!API_BASE) return ''
  return `${API_BASE}${path}`
}

async function fetchBackendJson<T>(path: string): Promise<T | null> {
  const url = buildApiUrl(path)
  if (!url) return null

  try {
    const res = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      next: { revalidate: 0 },
    })

    if (!res.ok) {
      return null
    }

    return (await res.json()) as T
  } catch {
    return null
  }
}

function fmtPrice(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) return '待補'
  return Number(value).toFixed(2)
}

function fmtTurnover(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) return '待補'
  return `${Number(value).toFixed(1)} 億`
}

function fmtScore(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) return '待補'
  return Number(value).toFixed(1)
}

function formatTaipeiTime(value?: string | null) {
  if (!value) return '待補'

  try {
    return new Intl.DateTimeFormat('zh-TW', {
      timeZone: 'Asia/Taipei',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date(value))
  } catch {
    return value
  }
}

function SummaryCard({
  title,
  value,
  hint,
}: {
  title: string
  value: string | number
  hint: string
}) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</div>
      <div className="mt-1 text-sm text-slate-600">{hint}</div>
    </div>
  )
}

function RestrictionBadge({ text }: { text?: string | null }) {
  if (!text) return null
  return (
    <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
      {text}
    </span>
  )
}

function StockSection({
  title,
  subtitle,
  rows,
}: {
  title: string
  subtitle: string
  rows: StockRow[]
}) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>

      {rows.length ? (
        <div className="overflow-x-auto rounded-2xl ring-1 ring-slate-100">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-700">股號</th>
                <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-700">名稱</th>
                <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-700">主題</th>
                <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-700">現價</th>
                <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-700">成交值</th>
                <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-700">分數</th>
                <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-700">標籤</th>
                <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-700">交易限制</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((stock) => (
                <tr key={stock.stock_id} className="border-t border-slate-100">
                  <td className="whitespace-nowrap px-4 py-3 text-slate-800">{stock.stock_id}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-900">
                    <Link
                      href={`/stocks/${stock.stock_id}`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {stock.name || stock.stock_id}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-800">{stock.theme || '其他'}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-800">{fmtPrice(stock.close)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-800">
                    {fmtTurnover(stock.turnover_100m)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-800">
                    {fmtScore(stock.score_total ?? stock.score)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-800">
                    {stock.radar_tag || stock.tag || '待補'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <RestrictionBadge text={stock.trade_warning} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-slate-500">
          目前沒有資料
        </div>
      )}
    </section>
  )
}

function ScanStatusPanel({
  status,
  lastSuccessfulUpdatedAt,
}: {
  status: ScanStatusResponse | null
  lastSuccessfulUpdatedAt?: string | null
}) {
  if (!status) {
    return (
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <div className="text-xl font-bold text-slate-900">尚未取得掃描狀態</div>
        <p className="mt-2 text-slate-600">請確認後端 API 與環境變數是否正常。</p>
      </section>
    )
  }

  const stage = status.stage || 'idle'
  const percent = Math.max(0, Math.min(100, Number(status.percent ?? 0)))
  const processed = Number(status.processed ?? 0)
  const total = Number(status.total ?? 0)
  const success = Number(status.success ?? 0)
  const failed = Number(status.failed ?? 0)
  const skipped = Number(status.skipped ?? 0)

  let title = '掃描狀態'
  let description = status.message || '尚未開始掃描'
  let tone = {
    card: 'bg-white ring-slate-100',
    title: 'text-slate-900',
    text: 'text-slate-600',
    bar: 'bg-slate-400',
    badge: 'bg-slate-100 text-slate-700',
  }

  if (status.scan_running || stage === 'prepare' || stage === 'running') {
    title = '掃描進行中'
    tone = {
      card: 'bg-white ring-blue-100',
      title: 'text-slate-900',
      text: 'text-slate-600',
      bar: 'bg-blue-500',
      badge: 'bg-blue-100 text-blue-700',
    }
  } else if (stage === 'completed') {
    title = '掃描完成'
    tone = {
      card: 'bg-white ring-emerald-100',
      title: 'text-slate-900',
      text: 'text-slate-600',
      bar: 'bg-emerald-500',
      badge: 'bg-emerald-100 text-emerald-700',
    }
  } else if (stage === 'empty') {
    title = '本次掃描無結果'
    description = status.message || '第一層快篩後沒有股票'
    tone = {
      card: 'bg-white ring-amber-100',
      title: 'text-slate-900',
      text: 'text-slate-600',
      bar: 'bg-amber-500',
      badge: 'bg-amber-100 text-amber-700',
    }
  } else if (stage === 'error') {
    title = '掃描失敗'
    description = status.last_scan_error || status.message || '發生未知錯誤'
    tone = {
      card: 'bg-white ring-red-100',
      title: 'text-slate-900',
      text: 'text-slate-600',
      bar: 'bg-red-500',
      badge: 'bg-red-100 text-red-700',
    }
  }

  return (
    <section className={`rounded-3xl p-6 shadow-sm ring-1 ${tone.card}`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tone.badge}`}>
            {stage}
          </div>
          <h2 className={`mt-3 text-2xl font-bold ${tone.title}`}>{title}</h2>
          <p className={`mt-2 ${tone.text}`}>{description}</p>

          <div className={`mt-4 text-sm ${tone.text}`}>
            進度：{processed} / {total}　成功：{success}　失敗：{failed}　略過：{skipped}
          </div>

          {stage === 'empty' && lastSuccessfulUpdatedAt ? (
            <div className="mt-2 text-sm text-slate-500">
              最近一次有結果的榜單時間：{formatTaipeiTime(lastSuccessfulUpdatedAt)}
            </div>
          ) : null}
        </div>

        <div className="w-full max-w-sm rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
          <div className="text-sm text-slate-500">狀態更新時間</div>
          <div className="mt-2 text-base font-semibold text-slate-900">
            {formatTaipeiTime(status.last_updated)}
          </div>
        </div>
      </div>

      <div className="mt-5 h-3 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all ${tone.bar}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </section>
  )
}

export default async function HomePage() {
  const [raw, status] = await Promise.all([
    fetchBackendJson<LatestScanResponse>('/api/scan/latest'),
    fetchBackendJson<ScanStatusResponse>('/api/scan/status'),
  ])

  const data = raw?.data
  const stage = status?.stage || 'idle'

  const starting = data?.starting?.slice(0, 10) ?? []
  const secondWave = data?.second_wave?.slice(0, 10) ?? []
  const watchlist = data?.watchlist?.slice(0, 10) ?? []

  const headerUpdatedAt = status?.last_updated || raw?.updated_at || null
  const showRanking = Boolean(data) && stage !== 'empty'

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <section className="rounded-[28px] bg-slate-900 px-6 py-7 text-white shadow-sm md:px-8 md:py-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-200 ring-1 ring-white/15">
              TW Smart Money Radar
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
              台股主力掃描首頁
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 md:text-base">
              已排除 ETF 與金融股。首頁上方可直接搜尋任意股票，榜單中若有禁現沖、先買現沖、處置或注意股，會醒目標示。
            </p>
          </div>

          <div className="rounded-3xl bg-white/10 p-4 ring-1 ring-white/10">
            <div className="text-sm text-slate-300">更新時間</div>
            <div className="mt-2 text-lg font-semibold text-white">
              {formatTaipeiTime(headerUpdatedAt)}
            </div>
            <div className="mt-1 text-sm text-slate-300">
              平日台灣時間 17:00 自動掃描
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 md:flex-row">
          <form action="/stocks" className="flex w-full gap-3">
            <input
              type="text"
              name="q"
              placeholder="搜尋股號、股名、題材，例如：1303 / 南亞 / PCB"
              className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <button
              type="submit"
              className="rounded-2xl bg-white px-5 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
            >
              搜尋
            </button>
          </form>

          <div className="shrink-0">
            <ScanButton />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/stocks"
            className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/15 transition hover:bg-white/15"
          >
            進入股票清單
          </Link>
        </div>
      </section>

      <ScanStatusPanel status={status} lastSuccessfulUpdatedAt={raw?.updated_at} />

      {showRanking ? (
        <>
          <section className="grid gap-4 md:grid-cols-4">
            <SummaryCard
              title="掃描市場檔數"
              value={data?.summary?.market_scanned ?? 0}
              hint="原始全市場掃描檔數"
            />
            <SummaryCard
              title="入選標的"
              value={data?.summary?.selected ?? 0}
              hint="排除 ETF / 金融後通過模型篩選"
            />
            <SummaryCard
              title="剛啟動"
              value={data?.summary?.starting_count ?? 0}
              hint="偏第一波初動候選"
            />
            <SummaryCard
              title="可能第二波"
              value={data?.summary?.second_wave_count ?? 0}
              hint="整理後再攻候選"
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <StockSection
              title="剛啟動"
              subtitle="偏第一波初動，重點看平台突破、量能與均線翻揚。"
              rows={starting}
            />
            <StockSection
              title="可能第二波"
              subtitle="偏整理後再攻，重點看第一波後的整理與再轉強。"
              rows={secondWave}
            />
          </section>

          <StockSection
            title="Watchlist"
            subtitle="先放你要追蹤的名單，方便後續進個股頁深看。"
            rows={watchlist}
          />
        </>
      ) : stage === 'empty' ? (
        <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
          <div className="text-xl font-bold text-slate-900">今天沒有新榜單</div>
          <p className="mt-2 text-slate-600">
            這代表本次掃描有正常跑完，但沒有股票通過第一層快篩，所以不顯示舊榜單來避免誤判。
          </p>
        </section>
      ) : (
        <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
          <div className="text-xl font-bold text-slate-900">目前還沒有掃描結果</div>
          <p className="mt-2 text-slate-600">請先等排程掃描完成，或按右上方的立即掃描手動執行。</p>
        </section>
      )}
    </main>
  )
}
