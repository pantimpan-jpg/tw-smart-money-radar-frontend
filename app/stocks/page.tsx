'use client'

import { useEffect, useState } from 'react'
import { getLatestScan, type ScanPayload, type LatestScanResponse } from '@/lib/api'
import { StockTable } from '@/components/stock-table'

export default function StocksPage() {
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

  return (
    <main className="mx-auto max-w-7xl space-y-4 px-4 py-6">
      <h1 className="text-2xl font-bold">股票清單</h1>

      {loading ? (
        <div className="rounded-3xl bg-white p-8 shadow-sm">資料載入中...</div>
      ) : data ? (
        <StockTable rows={data.all_selected ?? []} />
      ) : (
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <div className="text-lg font-semibold">尚無資料</div>
        </div>
      )}
    </main>
  )
}
