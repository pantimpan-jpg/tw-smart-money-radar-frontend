import Link from 'next/link'
import { getLatestScan, type StockRow } from '@/lib/api'
import { ScanButton } from '@/components/scan-button'
import { ScanProgress } from '@/components/scan-progress'

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

export default async function HomePage() {
  const raw = await getLatestScan()
  const data = raw?.data

  const starting = data?.starting?.slice(0, 10) ?? []
  const secondWave = data?.second_wave?.slice(0, 10) ?? []
  const watchlist = data?.watchlist?.slice(0, 10) ?? []

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
              {raw?.updated_at || '待補'}
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

      <ScanProgress />

      {data ? (
        <>
          <section className="grid gap-4 md:grid-cols-4">
            <SummaryCard
              title="掃描市場檔數"
              value={data.summary?.market_scanned ?? 0}
              hint="原始全市場掃描檔數"
            />
            <SummaryCard
              title="入選標的"
              value={data.summary?.selected ?? 0}
              hint="排除 ETF / 金融後通過模型篩選"
            />
            <SummaryCard
              title="剛啟動"
              value={data.summary?.starting_count ?? 0}
              hint="偏第一波初動候選"
            />
            <SummaryCard
              title="可能第二波"
              value={data.summary?.second_wave_count ?? 0}
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
      ) : (
        <section className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
          <div className="text-xl font-bold text-slate-900">目前還沒有掃描結果</div>
          <p className="mt-2 text-slate-600">請先等排程掃描完成，或按右上方的立即掃描手動執行。</p>
        </section>
      )}
    </main>
  )
}
