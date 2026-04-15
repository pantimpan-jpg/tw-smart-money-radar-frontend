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

function fmt1(value: number | null | undefined, fallback = '待補') {
  if (value === null || value === undefined || Number.isNaN(value)) return fallback
  return Number(value).toFixed(1)
}

function fmtPrice(value: number | null | undefined, fallback = '待補') {
  if (value === null || value === undefined || Number.isNaN(value)) return fallback
  return Number(value).toFixed(2)
}

function fmtPercent(value: number | null | undefined, fallback = '待補') {
  if (value === null || value === undefined || Number.isNaN(value)) return fallback
  return `${Number(value).toFixed(1)}%`
}

function getName(stock: StockRow) {
  return stock.name ?? stock.stock_name ?? '待補'
}

function getScore(stock: StockRow) {
  const value = stock.score ?? stock.score_total
  if (value === null || value === undefined || Number.isNaN(value)) return '待補'
  return Number(value).toFixed(1)
}

function getTag(stock: StockRow) {
  return stock.tag ?? stock.radar_tag ?? '待補'
}

function getTheme(stock: StockRow) {
  return stock.theme ?? stock.group ?? '待補'
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
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${toneClass[tone]}`}
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

function TableShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
      <table className="w-full min-w-[760px] text-sm">{children}</table>
    </div>
  )
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="whitespace-nowrap px-5 py-3 text-left font-semibold text-slate-700">
      {children}
    </th>
  )
}

function Td({
  children,
  strong = false,
}: {
  children: React.ReactNode
  strong?: boolean
}) {
  return (
    <td
      className={`whitespace-nowrap px-5 py-3 ${
        strong ? 'font-medium text-slate-900' : 'text-slate-800'
      }`}
    >
      {children}
    </td>
  )
}

function StartingTable({ rows }: { rows: StockRow[] }) {
  return (
    <TableShell>
      <thead className="bg-slate-50">
        <tr>
          <Th>股號</Th>
          <Th>名稱</Th>
          <Th>現價</Th>
          <Th>量比</Th>
          <Th>成交值(億)</Th>
          <Th>5日漲幅</Th>
          <Th>型態</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((stock) => (
          <tr key={stock.stock_id} className="border-t border-slate-100 hover:bg-slate-50/70">
            <Td strong>{stock.stock_id}</Td>
            <Td>{getName(stock)}</Td>
            <Td>{fmtPrice(stock.close)}</Td>
            <Td>{fmt1(stock.volume_ratio)}</Td>
            <Td>{fmt1(stock.turnover_100m)}</Td>
            <Td>{fmtPercent(stock.pct_5d)}</Td>
            <Td>
              <Badge text={getTag(stock)} tone="green" />
            </Td>
          </tr>
        ))}
      </tbody>
    </TableShell>
  )
}

function SecondWaveTable({ rows }: { rows: StockRow[] }) {
  return (
    <TableShell>
      <thead className="bg-slate-50">
        <tr>
          <Th>股號</Th>
          <Th>名稱</Th>
          <Th>現價</Th>
          <Th>20日漲幅</Th>
          <Th>量比</Th>
          <Th>主力分數</Th>
          <Th>型態</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((stock) => (
          <tr key={stock.stock_id} className="border-t border-slate-100 hover:bg-slate-50/70">
            <Td strong>{stock.stock_id}</Td>
            <Td>{getName(stock)}</Td>
            <Td>{fmtPrice(stock.close)}</Td>
            <Td>{fmtPercent(stock.pct_20d)}</Td>
            <Td>{fmt1(stock.volume_ratio)}</Td>
            <Td>{fmt1(stock.main_force_score)}</Td>
            <Td>
              <Badge text={getTag(stock)} tone="blue" />
            </Td>
          </tr>
        ))}
      </tbody>
    </TableShell>
  )
}

function AccelerationTable({ rows }: { rows: StockRow[] }) {
  return (
    <TableShell>
      <thead className="bg-slate-50">
        <tr>
          <Th>股號</Th>
          <Th>名稱</Th>
          <Th>現價</Th>
          <Th>成交值(億)</Th>
          <Th>籌碼分數</Th>
          <Th>總分</Th>
          <Th>題材</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((stock) => (
          <tr key={stock.stock_id} className="border-t border-slate-100 hover:bg-slate-50/70">
            <Td strong>{stock.stock_id}</Td>
            <Td>{getName(stock)}</Td>
            <Td>{fmtPrice(stock.close)}</Td>
            <Td>{fmt1(stock.turnover_100m)}</Td>
            <Td>{fmt1(stock.broker_score)}</Td>
            <Td strong>{getScore(stock)}</Td>
            <Td>
              <Badge text={getTheme(stock)} tone="orange" />
            </Td>
          </tr>
        ))}
      </tbody>
    </TableShell>
  )
}

function StrategyTable({ rows }: { rows: StockRow[] }) {
  return (
    <TableShell>
      <thead className="bg-slate-50">
        <tr>
          <Th>股號</Th>
          <Th>名稱</Th>
          <Th>現價</Th>
          <Th>成交值(億)</Th>
          <Th>量比</Th>
          <Th>標籤</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((stock) => (
          <tr key={stock.stock_id} className="border-t border-slate-100 hover:bg-slate-50/70">
            <Td strong>{stock.stock_id}</Td>
            <Td>{getName(stock)}</Td>
            <Td>{fmtPrice(stock.close)}</Td>
            <Td>{fmt1(stock.turnover_100m)}</Td>
            <Td>{fmt1(stock.volume_ratio)}</Td>
            <Td>
              <Badge text={getTag(stock)} tone="red" />
            </Td>
          </tr>
        ))}
      </tbody>
    </TableShell>
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

  if (variant === 'starting') return <StartingTable rows={rows} />
  if (variant === 'secondWave') return <SecondWaveTable rows={rows} />
  if (variant === 'acceleration') return <AccelerationTable rows={rows} />
  if (variant === 'strategy') return <StrategyTable rows={rows} />

  return <StrategyTable rows={rows} />
}
