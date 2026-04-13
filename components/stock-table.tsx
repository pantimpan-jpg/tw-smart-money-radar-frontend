type StockRow = {
  stock_id: string
  name: string
  close: number
  volume_ratio: number
  turnover_100m: number
  score?: number
  tag?: string
}

function fmt1(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return '-'
  return Number(value).toFixed(1)
}

export function StockTable({ rows }: { rows: StockRow[] }) {
  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-left">
          <tr>
            <th className="whitespace-nowrap px-4 py-3">股號</th>
            <th className="whitespace-nowrap px-4 py-3">名稱</th>
            <th className="whitespace-nowrap px-4 py-3">現價</th>
            <th className="whitespace-nowrap px-4 py-3">量比</th>
            <th className="whitespace-nowrap px-4 py-3">成交值(億)</th>
            <th className="whitespace-nowrap px-4 py-3">總分</th>
            <th className="whitespace-nowrap px-4 py-3">標籤</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((stock) => (
            <tr key={stock.stock_id} className="border-t">
              <td className="whitespace-nowrap px-4 py-3">{stock.stock_id}</td>
              <td className="whitespace-nowrap px-4 py-3">{stock.name}</td>
              <td className="whitespace-nowrap px-4 py-3">{stock.close}</td>
              <td className="whitespace-nowrap px-4 py-3">{fmt1(stock.volume_ratio)}</td>
              <td className="whitespace-nowrap px-4 py-3">{fmt1(stock.turnover_100m)}</td>
              <td className="whitespace-nowrap px-4 py-3">{stock.score ?? '-'}</td>
              <td className="whitespace-nowrap px-4 py-3">{stock.tag ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
