export const dynamic = 'force-dynamic'

import { getLatestScan, type ScanPayload, type StockRow } from '@/lib/api'
import { StockTable } from '@/components/stock-table'

export default async function ThemesPage() {
  const raw = await getLatestScan()
  const data: ScanPayload | null = raw?.data ?? null

  const groups = new Map<string, StockRow[]>()

 if (data) {
  for (const row of (data.all_selected ?? [])) {
    const key = row.theme || '其他'
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(row)
  }
}

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <h1 className="text-2xl font-bold">題材分類</h1>

      {data ? (
        Array.from(groups.entries()).map(([theme, rows]) => (
          <section key={theme} className="space-y-3">
            <h2 className="text-xl font-semibold">{theme}</h2>
            <StockTable rows={rows} />
          </section>
        ))
      ) : (
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <div className="text-lg font-semibold">目前還沒有掃描結果</div>
          <p className="mt-2 text-slate-600">請先執行掃描，再回來查看題材分類。</p>
        </div>
      )}
    </main>
  )
}
