export const dynamic = 'force-dynamic'
export const revalidate = 0

import Link from 'next/link'

type StockRow = {
  stock_id: string
  name?: string | null
  theme?: string | null
  group?: string | null
  close?: number | null
  turnover_100m?: number | null
  score_total?: number | null
  score?: number | null
  radar_tag?: string | null
  tag?: string | null
}

type LatestScanResponse = {
  updated_at?: string | null
  data?: {
    all_selected?: StockRow[]
  }
}

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '')

const THEME_ORDER = [
  'CPO/矽光子',
  'AI伺服器/BMC',
  'AI伺服器/OEM',
  '散熱',
  'BBU/電池備援',
  '電源/BBU',
  '低軌衛星',
  'PCB/CCL',
  'ABF載板',
  '記憶體',
  '面板/觸控',
  '網通',
  'MLCC/被動元件',
  '軍工/航太',
  '半導體設備/測試',
  '銅箔/材料',
  '半導體',
  '光電',
  '電子零組件',
  '其他電子',
  '其他',
]

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
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

function fmtPrice(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) return '待補'
  return Number(value).toFixed(2)
}

function pickTheme(row: StockRow) {
  const theme = (row.theme || '').trim()
  const group = (row.group || '').trim()

  if (theme && theme !== '其他') return theme
  if (group) return group
  return '其他'
}

export default async function ThemesPage() {
  const raw = await fetchBackendJson<LatestScanResponse>('/api/scan/latest')
  const rows = raw?.data?.all_selected ?? []

  const grouped = new Map<string, StockRow[]>()

  for (const row of rows) {
    const label = pickTheme(row)
    const current = grouped.get(label) || []
    current.push(row)
    grouped.set(label, current)
  }

  const groups = Array.from(grouped.entries())
    .map(([label, items]) => [
      label,
      [...items].sort(
        (a, b) => Number(b.score_total ?? b.score ?? 0) - Number(a.score_total ?? a.score ?? 0)
      ),
    ] as const)
    .sort((a, b) => {
      const ai = THEME_ORDER.indexOf(a[0])
      const bi = THEME_ORDER.indexOf(b[0])

      const orderA = ai === -1 ? 999 : ai
      const orderB = bi === -1 ? 999 : bi

      if (orderA !== orderB) return orderA - orderB
      return b[1].length - a[1].length
    })

  return (
    <main className="mx-auto max-w-7xl space-y-4 px-3 py-4">
      <section className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <h1 className="text-2xl font-bold text-slate-900">題材分類</h1>
        <p className="mt-1 text-sm text-slate-600">
          先用細題材 mapping 分組；若沒有細題材，再退回產業別。
        </p>
      </section>

      {groups.length ? (
        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {groups.map(([label, items]) => (
            <div key={label} className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">{label}</h2>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                  {items.length} 檔
                </span>
              </div>

              <div className="space-y-1.5">
                {items.slice(0, 10).map((row) => (
                  <Link
                    key={`${label}-${row.stock_id}`}
                    href={`/stocks/${row.stock_id}`}
                    className="flex items-center justify-between rounded-lg border border-slate-100 px-2.5 py-2 transition hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-900">
                        {row.stock_id} {row.name || ''}
                      </div>
                      <div className="mt-0.5 text-[11px] text-slate-500">
                        {row.radar_tag || row.tag || '未標記'}
                      </div>
                    </div>
                    <div className="shrink-0 text-xs font-semibold text-slate-800">
                      {fmtPrice(row.close)}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </section>
      ) : (
        <section className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="text-sm text-slate-500">目前沒有可分類的資料</div>
        </section>
      )}
    </main>
  )
}
