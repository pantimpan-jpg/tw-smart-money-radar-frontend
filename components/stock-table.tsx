type StockRow = {
  stock_id: string
  name?: string
  stock_name?: string
  close?: number
  volume_ratio?: number
  turnover_100m?: number
  score?: number
  score_total?: number
  tag?: string
  radar_tag?: string
  theme?: string
  group?: string
  pct_5d?: number
  pct_20d?: number
  revenue_yoy?: number
  revenue_mom?: number
  institution_score?: number
  broker_score?: number
  main_force_score?: number
}

type Variant = 'starting' | 'secondWave' | 'acceleration' | 'strategy' | 'default'

function fmt1(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return '-'
  return Number(value).toFixed(1)
}

function fmtPrice(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return '-'
  return Number(value).toFixed(2)
}

function fmtPercent(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return '-'
  return `${Number(value).toFixed(1)}%`
}

function getName(stock: StockRow) {
  return stock.name ?? stock.stock_name ?? '-'
}

function getScore(stock: StockRow) {
  const value = stock.score ?? stock.score_total
  if (value === null || value === undefined || Number.isNaN(value)) return '-'
  return Number(value).toFixed(1)
}

function getTag(stock: StockRow) {
  return stock.tag ?? stock.radar_tag ?? '-'
}

function getTheme(stock: StockRow) {
  return stock.theme ?? stock.group ?? '-'
}

function Badge({
  text,
  tone = 'slate',
}: {
  text: string
  tone?: 'blue' | 'green' | 'orange' | 'red' | 'slate'
}) {
  const toneClass = {
    blue: 'bg-blue-50 text-blue-700 ring-blue-100',
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    orange: 'bg-amber-50 text-amber-700 ring-amber-100',
    red: 'bg-rose-50 text-rose-700 ring-rose-100',
    slate: 'bg-slate-100 text-slate-700 ring-slate-200',
  }

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${toneClass[tone]}`}
    >
      {text}
    </span>
  )
}

function EmptyState() {
  return (
    <div className="rounded-2xl bg-white p-6 text-sm text-slate-500 shadow-sm ring-1 ring-slate-100">
      目前沒有資料
    </div>
  )
}

function StartingTable({ rows }: { rows: StockRow[] }) {
  return (
    <table className="min-w-full text-sm">
      <thead className="bg-slate-50 text-left text-slate-600">
        <tr>
          <th className="whitespace-nowrap px-4 py-3 font-semibold">股號</th>
          <th className="whitespace-nowrap px-4 py-3 font-semibold">名稱</th>
          <th className="whitespace-nowrap px-4 py-3 font-semibold">現價</th>
          <th className="whitespace-nowrap px-4 py-3 font-semibold">量比</th>
          <th className="whitespace-nowrap px-4 py-3 font-semibold">成交值(億)</th>
          <th className="whitespace-nowrap px-4 py-3 font-semibold">5日漲幅</th>
          <th className="whitespace-nowrap px-4 py-3 font-semibold">型態</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((stock) => (
          <tr key={stock.stock_id} className="border-t border-slate-100 hover:bg-slate-50/70">
            <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
              {stock.stock_id}
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-slate-800">{getName(stock)}</td>
            <td className="whitespace-nowrap px-4 py-3 text-slate-800">
              {fmtPrice(stock.close)}
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-slate-800">
              {fmt1(stock.volume_ratio)}
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-slate-800">
              {fmt1(stock.turnover_100m)}
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-slate-800">
              {fmtPercent(stock.pct_5d)}
            </td>
            <td className="whitespace-nowrap px-4 py-3">
              <Badge text={getTag(stock)} tone="green" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function SecondWaveTable({ rows }: { rows: StockRow[] }) {
  return (
    <table className="min-w-full text-sm">
      <thead className="bg-slate-50 text-left text-slate-600">
        <tr>
          <th className="whitespace-nowrap px-4 py-3 font-semibold">股號</th>
          <th className="whitespace-nowrap px-4 py-3 font-semibold">名稱</th>
          <th className="whitespace-nowrap px-4 py-3 font-semibold">現價</th>
          <th className="whitespace-nowrap px-4 py-3 font-semibold">20日漲幅</th>
          <th className="whitespace-nowrap px-4 py-3 font-semibold">量比</th>
          <th className="whitespace-nowrap px-4 py-3 font-semibold">主力分數</th>
          <th className="whitespace-nowrap px-4 py-3 font-semibold">型態</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((stock) => (
          <tr key={stock.stock_id} className="border-t border-slate-100 hover:bg-slate-50/70">
            <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
              {stock.stock_id}
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-slate-800">{getName(stock)}</td>
            <td className="whitespace-nowrap px-4 py-3 text-slate-800">
              {fmtPrice(stock.close)}
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-slate-800">
              {fmtPercent(stock.pct_20d)}
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-slate-800">
              {fmt1(stock.volume_ratio)}
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-slate-800">
              {fmt1(stock.main_force_score)}
            </td>
            <td className="whitespace-nowrap px-4 py-3">
              <Badge text={getTag(stock)} tone="blue" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function AccelerationTable({ rows }: { rows: StockRow[] }) {
  return (
    <table className="min-w-full text-sm">
      <thead className="bg-slate-50 text-left text-slate-600">
        <tr>
          <th className="whitespace-nowrap px-4 py-3 font-semibold">股號</th>
          <th className="whitespace-nowrap px-4 py-3 font-semibold">名稱</th>
          <th className="whitespace-nowrap px-4 py-3 font-semibold">現價</th>
          <th className="whitespace-nowrap px-4 py-3 font-semibold">成交值(億)</th>
          <th className="whitespace-nowrap px-4 py-3 font-semibold">籌碼分數</th>
          <th className="whitespace-nowrap px-4 py-3 font-semibold">總分</th>
          <th className="whitespace-nowrap px-4 py-3 font-semibold">題材</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((stock) => (
          <tr key={stock.stock_id} className="border-t border-slate-100 hover:bg-slate-50/70">
            <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
              {stock.stock_id}
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-slate-800">{getName(stock)}</td>
            <td className="whitespace-nowrap px-4 py-3 text-slate-800">
              {fmtPrice(stock.close)}
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-slate-800">
              {fmt1(stock.turnover_100m)}
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-slate-800">
              {fmt1(stock.broker_score)}
            </td>
            <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-900">
              {getScore(stock)}
            </td>
            <td className="whitespace-nowrap px-4 py-3">
              <Badge text={getTheme(stock)} tone="orange" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function StrategyTable({ rows }: { rows: StockRow[] }) {
  return (
    <table className="min-w-full text-sm">
      <thead className="bg-slate-50 text-left text-slate-600">
        <tr>
          <th className="whitespace-nowrap px-4 py-3 font-semibold">股號</th>
          <th className="whitespace-nowrap px-4 py-3 font-semibold">名稱</th>
          <th className="whitespace-nowrap px-4 py-3 font-semibold">現價</th>
          <th className="whitespace-nowrap px-4 py-3 font-semibold">成交值(億)</th>
          <th className="whitespace-nowrap px-4 py-3 font-semibold">量比</th>
          <th className="whitespace-nowrap px-4 py-3 font-semibold">標籤</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((stock) => (
          <tr key={stock.stock_id} className="border-t border-slate-100 hover:bg-slate-50/70">
            <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">
              {stock.stock_id}
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-slate-800">{getName(stock)}</td>
            <td className="whitespace-nowrap px-4 py-3 text-slate-800">
              {fmtPrice(stock.close)}
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-slate-800">
              {fmt1(stock.turnover_100m)}
            </td>
            <td className="whitespace-nowrap px-4 py-3 text-slate-800">
              {fmt1(stock.volume_ratio)}
            </td>
            <td className="whitespace-nowrap px-4 py-3">
              <Badge text={getTag(stock)} tone="red" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function StockTable({
  rows,
  variant = 'default',
}: {
  rows: StockRow[]
  variant?: Variant
}) {
  if (!rows.length) return <EmptyState />

  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
      {variant === 'starting' && <StartingTable rows={rows} />}
      {variant === 'secondWave' && <SecondWaveTable rows={rows} />}
      {variant === 'acceleration' && <AccelerationTable rows={rows} />}
      {variant === 'strategy' && <StrategyTable rows={rows} />}
      {variant === 'default' && <StrategyTable rows={rows} />}
    </div>
  )
}
