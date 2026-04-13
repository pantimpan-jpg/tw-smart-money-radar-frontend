export const dynamic = 'force-dynamic'

import { getLatestScan, type ScanPayload } from '@/lib/api'
import { StockTable } from '@/components/stock-table'

export default async function StocksPage() {
  const raw = await getLatestScan()
  const data: ScanPayload | null = raw?.data ?? null

  return (
    <main className="mx-auto max-w-7xl space-y-4 px-4 py-6">
      <h1 className="text-2xl font-bold">股票清單</h1>

      {data ? (
        <StockTable rows={data.all_selected ?? []} />
      ) : (
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <div className="text-lg font-semibold">目前還沒有掃描結果</div>
          <p className="mt-2 text-slate-600">
            請先執行掃描，再回來查看股票清單。
          </p>
        </div>
      )}
    </main>
  )
}
