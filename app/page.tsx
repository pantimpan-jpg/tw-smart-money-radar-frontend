'use client'

import { useEffect, useMemo, useState } from 'react'
import { getLatestScan, type LatestScanResponse, type ScanPayload, type StockRow } from '@/lib/api'
import { StockTable } from '@/components/stock-table'

export default function ThemesPage() {
  const [raw, setRaw] = useState<LatestScanResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    ;(async () => {
      try {
        const result = await getLatestScan()
        if (mounted) setRaw(result)
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  const data: ScanPayload | null = raw?.data ?? null

  const groups = useMemo(() => {
    const map = new Map<string, StockRow[]>()

    for (const row of data?.all_selected ?? []) {
      const key = row.theme || '其他'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(row)
    }

    return Array.from(map.entries())
  }, [data])

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <h1 className="text-2xl font-bold">題材分類</h1>

      {loading ? (
        <div className="rounded-3xl bg-white p-8 shadow-sm">資料載入中...</div>
      ) : data ? (
        groups.map(([theme, rows]) => (
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
