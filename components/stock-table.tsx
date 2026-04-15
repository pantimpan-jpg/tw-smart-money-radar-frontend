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
}

function fmt1(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return '-'
  return Number(value).toFixed(1)
}

function fmtPrice(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return '-'
  return Number(value).toFixed(2)
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

export function StockTable({ rows }: { rows: StockRow[] }) {
  if (!rows.length) {
    return (
      <div className="rounded-2xl bg-white p-6 text-sm text-slate-500 shadow-sm ring-1 ring-slate-100">
        目前沒有資料
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-left text-slate-600">
          <tr>
            <th className="whitespace-nowrap px-4 py-3 font-semibold">股號</th>
            <th className="whitespace-nowrap px-4 py-3 font-semibold">名稱</th>
            <th className="whitespace-nowrap px-4 py-3 font-semibold">現價</th>
            <th className="whitespace-nowrap px-4 py-3 font-semibold">量比</th>
            <th className="whitespace-nowrap px-4 py-3 font-semibold">成交值(億)</th>
            <th className="whitespace-nowrap px-4 py-3 font-semibold">主題</th>
            <th className="whitespace-nowrap px-4 py-3 font-semibold">總分</th>
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
                {fmt1(stock.volume_ratio)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-800">
                {fmt1(stock.turnover_100m)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-700">{getTheme(stock)}</td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-800">{getScore(stock)}</td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-700">{getTag(stock)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
