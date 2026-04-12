import Link from 'next/link'
import { StockRow } from '@/lib/api'

export function StockTable({ rows }: { rows: StockRow[] }) {
  return (
    <div className="overflow-x-auto rounded-3xl bg-white shadow-sm">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="border-b bg-slate-50 text-left text-sm text-slate-500">
            <th className="px-4 py-3">股號</th>
            <th className="px-4 py-3">名稱</th>
            <th className="px-4 py-3">題材</th>
            <th className="px-4 py-3">現價</th>
            <th className="px-4 py-3">量比</th>
            <th className="px-4 py-3">成交值(億)</th>
            <th className="px-4 py-3">總分</th>
            <th className="px-4 py-3">標籤</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.stock_id} className="border-b text-sm hover:bg-slate-50">
              <td className="px-4 py-3 font-semibold">{row.stock_id}</td>
              <td className="px-4 py-3">
                <Link href={`/stocks/${row.stock_id}`} className="text-sky-700 hover:underline">
                  {row.name}
                </Link>
              </td>
              <td className="px-4 py-3">{row.theme || row.group || '-'}</td>
              <td className="px-4 py-3">{row.close}</td>
              <td className="px-4 py-3">{row.volume_ratio}</td>
              <td className="px-4 py-3">{row.turnover_100m}</td>
              <td className="px-4 py-3 font-semibold">{row.score_total}</td>
              <td className="px-4 py-3">{row.radar_tag}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
