import { getLatestScan } from '@/lib/api'

export default async function ThemesPage() {
  const data = await getLatestScan()
  const groups = new Map<string, any[]>()
  if (data) {
    for (const row of data.all_selected) {
      const key = row.theme || '其他'
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(row)
    }
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <h1 className="text-2xl font-bold">題材分類</h1>
      {[...groups.entries()].map(([theme, rows]) => (
        <section key={theme} className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">{theme}</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {rows.slice(0, 12).map((row) => (
              <div key={row.stock_id} className="rounded-2xl border p-4">
                <div className="text-lg font-semibold">{row.stock_id} {row.name}</div>
                <div className="mt-1 text-sm text-slate-500">{row.radar_tag}</div>
                <div className="mt-3 text-sm text-slate-700">現價 {row.close} ・ 總分 {row.score_total} ・ 量比 {row.volume_ratio}</div>
              </div>
            ))}
          </div>
        </section>
      ))}
      {!data && <div className="rounded-3xl bg-white p-6">尚無資料</div>}
    </main>
  )
}
