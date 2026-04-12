import { getLatestScan } from '@/lib/api'
import { StockTable } from '@/components/stock-table'

export default async function StocksPage() {
  const data = await getLatestScan()
  return (
    <main className="mx-auto max-w-7xl space-y-4 px-4 py-6">
      <h1 className="text-2xl font-bold">股票清單</h1>
      {data ? <StockTable rows={data.all_selected} /> : <div className="rounded-3xl bg-white p-6">尚無資料</div>}
    </main>
  )
}
