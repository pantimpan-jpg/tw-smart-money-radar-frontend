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

function fmt1(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '-'
  return Number(value).toFixed(1)
}

function fmt2(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '-'
  return Number(value).toFixed(2)
}

function InfoCard({
  title,
  value,
}: {
  title: string
  value: string | number | null | undefined
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-2 text-xl font-bold text-slate-900">{value ?? '-'}</div>
    </div>
  )
}

export default async function StockDetailPage({
  params,
}: {
  params: { stock_id: string }
}) {
  const stock = await getStock(params.stock_id)
  if (!stock) return notFound()

  const score = stock.score ?? stock.score_total ?? '-'
  const tag = stock.tag ?? stock.radar_tag ?? '-'

  const reasonText = stock.reason_text ?? '目前尚未提供入選原因摘要'
  const reasonList: string[] = Array.isArray(stock.reason_list) ? stock.reason_list : []

  const targetPrice = stock.target_price
  const resistanceLow = stock.resistance_low
  const resistanceHigh = stock.resistance_high

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">
      <section className="rounded-3xl bg-slate-900 p-8 text-white">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-sm text-slate-300">個股詳情</div>
            <h1 className="mt-2 text-3xl font-bold">
              {stock.stock_id} {stock.name}
            </h1>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-sm">
                標籤：{tag}
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-sm">
                總分：{score}
              </span>
            </div>
          </div>

          <div className="rounded-2xl bg-white/10 px-5 py-4">
            <div className="text-sm text-slate-300">現價</div>
            <div className="mt-1 text-3xl font-bold">{stock.close}</div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <InfoCard title="量比" value={fmt1(stock.volume_ratio)} />
        <InfoCard title="成交值(億)" value={fmt1(stock.turnover_100m)} />
        <InfoCard title="模型目標價" value={fmt2(targetPrice)} />
        <InfoCard
          title="壓力區"
          value={
            resistanceLow != null && resistanceHigh != null
              ? `${fmt2(resistanceLow)} ~ ${fmt2(resistanceHigh)}`
              : '-'
          }
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">入選原因摘要</h2>
          <p className="mt-4 leading-7 text-slate-700">{reasonText}</p>

          <h3 className="mt-6 text-lg font-semibold text-slate-900">細項理由</h3>
          {reasonList.length > 0 ? (
            <ul className="mt-3 space-y-2 text-slate-700">
              {reasonList.map((item, idx) => (
                <li key={`${item}-${idx}`} className="rounded-xl bg-slate-50 px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-3 text-slate-500">目前尚未提供細項理由</div>
          )}
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">模型數據</h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <InfoCard title="技術分數" value={fmt1(stock.tech_score)} />
            <InfoCard title="法人分數" value={fmt1(stock.institution_score)} />
            <InfoCard title="主力分數" value={fmt1(stock.main_force_score)} />
            <InfoCard title="分點分數" value={fmt1(stock.broker_score)} />
            <InfoCard title="突破分數" value={fmt1(stock.breakout_score)} />
            <InfoCard title="營收分數" value={fmt1(stock.revenue_score)} />
            <InfoCard title="起漲分數" value={fmt1(stock.score_starting)} />
            <InfoCard title="第二波分數" value={fmt1(stock.score_second_wave)} />
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">技術欄位參考</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <InfoCard title="MA20" value={fmt2(stock.ma20)} />
          <InfoCard title="MA60" value={fmt2(stock.ma60)} />
          <InfoCard title="RSI" value={fmt1(stock.rsi)} />
          <InfoCard title="MACD" value={fmt2(stock.macd)} />
          <InfoCard title="MACD Signal" value={fmt2(stock.macd_signal)} />
          <InfoCard title="MACD Hist" value={fmt2(stock.macd_hist)} />
          <InfoCard title="20日平台高點" value={fmt2(stock.platform_high_20d)} />
          <InfoCard title="60日平台高點" value={fmt2(stock.platform_high_60d)} />
        </div>
      </section>
    </main>
  )
}
