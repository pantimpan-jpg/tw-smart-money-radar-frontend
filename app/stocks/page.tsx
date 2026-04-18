export const dynamic = 'force-dynamic'
export const revalidate = 0

import Link from 'next/link'
import { searchStocks } from '@/lib/api'

type PageProps = {
  searchParams?: {
    q?: string
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

export default async function StocksSearchPage({ searchParams }: PageProps) {
  const q = searchParams?.q?.trim() || ''
  const results = q ? await searchStocks(q, 80) : []

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">股票清單</h1>
            <p className="mt-1 text-sm text-slate-500">
              可直接搜尋任意股票，點進後使用和榜單股票相同的個股頁。
            </p>
          </div>

          <form action="/stocks" className="flex w-full max-w-3xl gap-3">
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="輸入股號、股名、題材，例如：1303 / 南亞 / PCB"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300"
            />
            <button
              type="submit"
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              搜尋
            </button>
          </form>
        </div>

        <div className="mt-3">
          <Link
            href="/"
            className="text-sm text-slate-500 underline-offset-4 hover:underline"
          >
            返回首頁
          </Link>
        </div>
      </section>

      {q ? (
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-slate-900">搜尋結果</h2>
            <div className="text-sm text-slate-500">
              關鍵字：<span className="font-medium text-slate-700">{q}</span> / 共 {results.length} 筆
            </div>
          </div>

          {results.length ? (
            <div className="overflow-x-auto rounded-2xl ring-1 ring-slate-100">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-700">股號</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-700">名稱</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-700">現價</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-700">產業</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-700">主題</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-700">成交值</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-700">今日榜單</th>
                    <th className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-700">型態</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((stock) => (
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
                      <td className="whitespace-nowrap px-4 py-3 text-slate-800">{fmtPrice(stock.close)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-800">{stock.group || '待補'}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-800">{stock.theme || '待補'}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-800">{fmtTurnover(stock.turnover_100m)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-800">
                        {stock.in_selected ? '有' : '無'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-800">
                        {stock.in_selected ? stock.radar_tag || '待補' : '未進榜'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-slate-500">
              找不到符合的股票。
            </div>
          )}
        </section>
      ) : (
        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <div className="text-slate-600">請在上方搜尋列輸入股號、股名或題材關鍵字。</div>
        </section>
      )}
    </main>
  )
}
