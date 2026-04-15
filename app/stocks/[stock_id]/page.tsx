type PageProps = {
  params: {
    stock_id: string
  }
}

function StatCard({
  title,
  value,
  hint,
}: {
  title: string
  value: string
  hint?: string
}) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</div>
      {hint ? <div className="mt-1 text-sm text-slate-600">{hint}</div> : null}
    </div>
  )
}

function SectionCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-100">
      <div className="border-b border-slate-100 px-6 py-4">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </section>
  )
}

function PlaceholderChart({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6">
      <div className="text-base font-semibold text-slate-900">{title}</div>
      <div className="mt-2 text-sm text-slate-500">{subtitle}</div>
      <div className="mt-6 flex h-52 items-center justify-center rounded-xl bg-white text-sm text-slate-400 ring-1 ring-slate-100">
        之後接入真實圖表資料
      </div>
    </div>
  )
}

function SimpleTable({
  headers,
  rows,
}: {
  headers: string[]
  rows: Array<Array<string | number>>
}) {
  return (
    <div className="overflow-x-auto rounded-2xl ring-1 ring-slate-100">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-700"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-t border-slate-100">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="whitespace-nowrap px-4 py-3 text-slate-800">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function StockDetailPage({ params }: PageProps) {
  const stockId = params.stock_id

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <section className="rounded-[28px] bg-slate-900 px-6 py-7 text-white shadow-sm md:px-8 md:py-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-200 ring-1 ring-white/15">
              個股詳細頁 V1
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
              {stockId} 個股頁
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 md:text-base">
              這一頁先把你要的版型骨架搭起來，後面會再逐步接入股價、法人、融資、月營收、EPS、股利、財報與新聞資料。
            </p>
          </div>

          <div className="rounded-3xl bg-white/10 p-4 ring-1 ring-white/10">
            <div className="text-sm text-slate-300">目前狀態</div>
            <div className="mt-2 text-lg font-semibold text-white">版型已建立，等待串接資料</div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="最新收盤價" value="待接資料" hint="TaiwanStockPrice" />
        <StatCard title="外資買賣超" value="待接資料" hint="Institutional / Shareholding" />
        <StatCard title="投信買賣超" value="待接資料" hint="Institutional" />
        <StatCard title="融資變化" value="待接資料" hint="MarginPurchaseShortSale" />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="EPS">
          <PlaceholderChart
            title="EPS 趨勢圖"
            subtitle="之後接入季度 EPS、年增、季增與最近一期數值。"
          />
        </SectionCard>

        <SectionCard title="月營收">
          <PlaceholderChart
            title="月營收趨勢圖"
            subtitle="之後接入月營收、月增、年增與最近 6–12 個月趨勢。"
          />
        </SectionCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="現金股利 / 股票股利">
          <SimpleTable
            headers={['年度', '交易日', '發放日', '現金股利', '股票股利']}
            rows={[
              ['2025', '待接資料', '待接資料', '待接資料', '待接資料'],
              ['2024', '待接資料', '待接資料', '待接資料', '待接資料'],
              ['2023', '待接資料', '待接資料', '待接資料', '待接資料'],
            ]}
          />
        </SectionCard>

        <SectionCard title="籌碼 / 技術摘要">
          <SimpleTable
            headers={['項目', '數值']}
            rows={[
              ['BIAS', '待接資料'],
              ['RSV', '待接資料'],
              ['外資持股比例', '待接資料'],
              ['主力分數', '待接資料'],
              ['第二波判斷', '待接資料'],
            ]}
          />
        </SectionCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="財報">
          <SimpleTable
            headers={['項目', '年增', '季增', '金額']}
            rows={[
              ['基本每股盈餘', '待接資料', '待接資料', '待接資料'],
              ['營業收入', '待接資料', '待接資料', '待接資料'],
              ['營業利益', '待接資料', '待接資料', '待接資料'],
              ['本期淨利', '待接資料', '待接資料', '待接資料'],
              ['綜合損益總額', '待接資料', '待接資料', '待接資料'],
            ]}
          />
        </SectionCard>

        <SectionCard title="新聞">
          <SimpleTable
            headers={['時間', '標題']}
            rows={[
              ['待接資料', '之後接 TaiwanStockNews 或其他新聞來源'],
              ['待接資料', '新聞清單會放在這裡'],
              ['待接資料', '可再加來源與連結'],
            ]}
          />
        </SectionCard>
      </section>
    </main>
  )
}
