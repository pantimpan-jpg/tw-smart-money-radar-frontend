import { notFound } from 'next/navigation'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

async function getStock(stockId: string) {
  try {
    const res = await fetch(`${API_BASE}/api/stocks/${stockId}`, { cache: 'no-store' })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function StockDetailPage({ params }: { params: { stock_id: string } }) {
  const stock = await getStock(params.stock_id)
  if (!stock) return notFound()

  const items = [
    ['股號', stock.stock_id],
    ['名稱', stock.name],
    ['族群', stock.group || '-'],
    ['題材', stock.theme || '-'],
    ['現價', stock.close],
    ['總分', stock.score_total],
    ['標籤', stock.radar_tag],
    ['量比', stock.volume_ratio],
    ['成交值(億)', stock.turnover_100m],
    ['法人分數', stock.institution_score],
    ['券商分數', stock.broker_score],
    ['主力分數', stock.main_force_score],
    ['營收 YoY', stock.revenue_yoy],
    ['營收 MoM', stock.revenue_mom],
    ['5日漲幅', stock.pct_5d],
    ['20日漲幅', stock.pct_20d],
  ]

  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold">{stock.stock_id} {stock.name}</h1>
        <div className="mt-2 text-slate-500">{stock.radar_tag}・{stock.theme || stock.group || '其他'}</div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {items.map(([label, value]) => (
            <div key={label} className="rounded-2xl border p-4">
              <div className="text-sm text-slate-500">{label}</div>
              <div className="mt-1 text-lg font-semibold">{String(value ?? '-')}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
