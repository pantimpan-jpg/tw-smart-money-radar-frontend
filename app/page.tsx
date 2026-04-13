import Link from 'next/link'
import { getLatestScan } from '@/lib/api'
import { StockTable } from '@/components/stock-table'

function Card({ title, value, hint }: { title: string; value: string | number; hint: string }) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-2 text-3xl font-bold">{value}</div>
      <div className="mt-1 text-sm text-slate-600">{hint}</div>
    </div>
  )
}

function formatTaipeiTime(value?: string | null) {
  if (!value) return '-'
  try {
    return new Date(value).toLocaleString('zh-TW', {
      timeZone: 'Asia/Taipei',
      hour12: false,
    })
  } catch {
    return value
  }
}

export default async function HomePage() {
  const raw = await getLatestScan()

  const updatedAt = raw?.updated_at ?? null
  const data = raw?.data ?? null

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <section className="rounded-3xl bg-slate-900 p-8 text-white">
        <h1 className="text-3xl font-bold">TW Smart Money Radar</h1>
        <p className="mt-2 max-w-3xl text-slate-300">
          公開版台股主力掃描器。把你的 Python 模型包成網站，顯示 Top30、剛啟動、可能第二波、主力追蹤與過熱風險。
        </p>
        <div className="mt-4 flex gap-3">
          <Link href="/stocks" className="rounded-2xl bg-white px-4 py-2 text-sm font-medium text-slate-900">
            查看全清單
          </Link>
          <Link href="/themes" className="rounded-2xl border border-white/30 px-4 py-2 text-sm font-medium text-white">
            看題材分組
          </Link>
        </div>
      </section>

      {data ? (
        <>
          <section className="grid gap-4 md:grid-cols-5">
            <Card title="掃描市場檔數" value={data.summary?.market_scanned ?? 0} hint="全市場今日完成掃描" />
            <Card title="入選標的" value={data.summary?.selected ?? 0} hint="通過第一層與第二層模型" />
            <Card title="剛啟動" value={data.summary?.starting_count ?? 0} hint="靠近起漲結構" />
            <Card title="可能第二波" value={data.summary?.second_wave_count ?? 0} hint="主升後再攻候選" />
            <Card title="過熱風險" value={data.summary?.overheated_count ?? 0} hint="爆量高 RSI 需留意" />
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Top 30</h2>
              <div className="text-sm text-slate-500">
                更新時間：{formatTaipeiTime(updatedAt)}
              </div>
            </div>
            <StockTable rows={data.top30 ?? []} />
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              <h2 className="text-xl font-bold">剛啟動</h2>
              <StockTable rows={(data.starting ?? []).slice(0, 10)} />
            </div>
            <div className="space-y-3">
              <h2 className="text-xl font-bold">可能第二波</h2>
              <StockTable rows={(data.second_wave ?? []).slice(0, 10)} />
            </div>
          </section>
        </>
      ) : (
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <div className="text-lg font-semibold">目前還沒有掃描結果</div>
          <p className="mt-2 text-slate-600">
            先啟動後端並執行 <code>/api/scan/run</code>，首頁就會自動顯示最新結果。
          </p>
        </div>
      )}
    </main>
  )
}
