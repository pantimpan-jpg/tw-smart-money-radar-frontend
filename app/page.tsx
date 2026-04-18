'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import StockTable, { type StockRow } from '@/components/stock-table'

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ||
  'https://tw-smart-money-radar-backend.onrender.com'

type ScanSummary = {
  market_scanned?: number
  selected?: number
  starting_count?: number
  starting_breakout_count?: number
  starting_accum_count?: number
  second_wave_count?: number
  strong_trend_count?: number
  overheated_count?: number
}

type ScanPayload = {
  summary?: ScanSummary
  top30?: StockRow[]
  watchlist?: StockRow[]
  starting?: StockRow[]
  starting_breakout?: StockRow[]
  starting_accum?: StockRow[]
  second_wave?: StockRow[]
  strong_trend?: StockRow[]
  broker_track?: StockRow[]
  overheated?: StockRow[]
  high_turnover?: StockRow[]
  all_selected?: StockRow[]
}

type LatestScanResponse = {
  updated_at?: string
  data?: ScanPayload
}

type ScanStatusResponse = {
  scan_running?: boolean
  stage?: string
  percent?: number
  message?: string
  processed?: number
  total?: number
  success?: number
  failed?: number
  skipped?: number
}

function formatTime(value?: string) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString('zh-TW', { hour12: false })
}

function formatNumber(value?: number) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '0'
  return n.toLocaleString('zh-TW')
}

function Card({
  title,
  value,
  hint,
}: {
  title: string
  value: string | number
  hint: string
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-2 text-3xl font-bold text-slate-900">{value}</div>
      <div className="mt-1 text-sm text-slate-600">{hint}</div>
    </div>
  )
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }

  return res.json() as Promise<T>
}

export default function Page() {
  const [latest, setLatest] = useState<LatestScanResponse | null>(null)
  const [status, setStatus] = useState<ScanStatusResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [startingScan, setStartingScan] = useState(false)
  const [search, setSearch] = useState('')

  const loadAll = useCallback(async () => {
    try {
      const [latestData, statusData] = await Promise.all([
        fetchJson<LatestScanResponse>(`${API_BASE}/api/scan/latest`),
        fetchJson<ScanStatusResponse>(`${API_BASE}/api/scan/status`),
      ])
      setLatest(latestData)
      setStatus(statusData)
    } catch (error) {
      console.error('loadAll failed', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAll()
    const timer = setInterval(loadAll, 10000)
    return () => clearInterval(timer)
  }, [loadAll])

  const startScan = useCallback(async () => {
    try {
      setStartingScan(true)
      const res = await fetch(`${API_BASE}/api/scan/run`, {
        method: 'POST',
        cache: 'no-store',
      })
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }
      await loadAll()
    } catch (error) {
      console.error('startScan failed', error)
    } finally {
      setStartingScan(false)
    }
  }, [loadAll])

  const payload = latest?.data ?? {}
  const summary = payload.summary ?? {}

  const allSelected = payload.all_selected ?? []

  const filteredAllSelected = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return allSelected

    return allSelected.filter((row) => {
      const text = [
        row.stock_id,
        row.name,
        row.group,
        row.theme,
        row.tag,
        row.radar_tag,
        row.reason_text,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return text.includes(keyword)
    })
  }, [allSelected, search])

  const isRunning = Boolean(status?.scan_running)
  const progressPercent = Math.max(0, Math.min(100, Number(status?.percent ?? 0)))

  const startingAccumRows = payload.starting_accum ?? []
  const secondWaveRows = payload.second_wave ?? []
  const strongTrendRows = payload.strong_trend ?? []

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-[1600px]">
        <section className="rounded-[32px] bg-[#081a46] px-6 py-8 text-white shadow-lg">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-4xl">
              <div className="inline-flex rounded-full bg-white/10 px-3 py-1 text-sm">
                TW Smart Money Radar
              </div>

              <h1 className="mt-4 text-4xl font-black tracking-tight">台股主力掃描首頁</h1>

              <p className="mt-3 text-lg text-slate-200">
                已排除 ETF 與金融股。首頁上方可直接搜尋任意股票，榜單中若有警示沖、先買現沖、處置或注意股，會醒目標示。
              </p>

              <div className="mt-6 flex flex-col gap-3 lg:flex-row">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="搜尋股號、股名、題材，例如：1303 / 南亞 / PCB"
                  className="h-16 w-full rounded-2xl border border-white/10 bg-white/10 px-5 text-lg text-white placeholder:text-slate-300 outline-none"
                />

                <button
                  type="button"
                  className="h-16 rounded-2xl bg-white px-6 text-lg font-bold text-slate-900"
                >
                  搜尋
                </button>

                <button
                  type="button"
                  onClick={startScan}
                  disabled={startingScan || isRunning}
                  className="h-16 rounded-2xl bg-white px-6 text-lg font-bold text-slate-900 disabled:opacity-60"
                >
                  {startingScan || isRunning ? '掃描中' : '立即掃描'}
                </button>
              </div>

              <Link
                href="/stocks"
                className="mt-3 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold"
              >
                進入股票清單
              </Link>
            </div>

            <div className="min-w-[280px] rounded-3xl bg-white/10 p-5">
              <div className="text-sm text-slate-300">更新時間</div>
              <div className="mt-2 text-3xl font-bold">{formatTime(latest?.updated_at)}</div>
              <div className="mt-3 text-sm text-slate-300">平台台灣時間 17:00 自動掃描</div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[28px] border border-emerald-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <div className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                {isRunning ? '抓資料' : '已完成'}
              </div>

              <h2 className="mt-3 text-4xl font-black text-slate-900">
                {isRunning ? '掃描進行中' : '掃描完成'}
              </h2>

              <p className="mt-2 text-lg text-slate-600">{status?.message || '掃描完成'}</p>

              <div className="mt-4 text-xl text-slate-700">
                進度：{formatNumber(status?.processed)} / {formatNumber(status?.total)}　
                成功：{formatNumber(status?.success)}　
                失敗：{formatNumber(status?.failed)}　
                略過：{formatNumber(status?.skipped)}
              </div>

              <div className="mt-4 h-4 w-full rounded-full bg-slate-200">
                <div
                  className={`h-4 rounded-full ${isRunning ? 'bg-blue-500' : 'bg-emerald-500'}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="min-w-[320px] rounded-3xl bg-slate-50 p-5">
              <div className="text-sm text-slate-500">狀態更新時間</div>
              <div className="mt-2 text-3xl font-bold text-slate-900">
                {formatTime(latest?.updated_at)}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
          <Card
            title="掃描市場檔數"
            value={formatNumber(summary.market_scanned)}
            hint="成功抓到可用資料檔數"
          />
          <Card
            title="入選標的"
            value={formatNumber(summary.selected)}
            hint="通過模型篩選後的總檔數"
          />
          <Card
            title="剛啟動總數"
            value={formatNumber(summary.starting_count)}
            hint="包含爆量突破與收籌墊高"
          />
          <Card
            title="爆量突破"
            value={formatNumber(summary.starting_breakout_count)}
            hint="剛啟動子類型之一"
          />
          <Card
            title="收籌墊高"
            value={formatNumber(summary.starting_accum_count)}
            hint="剛啟動子類型之一"
          />
          <Card
            title="可能第二波"
            value={formatNumber(summary.second_wave_count)}
            hint="整理後再攻候選"
          />
        </section>

        <section className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-2">
          <Card
            title="強者恆強"
            value={formatNumber(summary.strong_trend_count)}
            hint="主升段延續、強勢續強"
          />
          <Card
            title="過熱風險"
            value={formatNumber(summary.overheated_count)}
            hint="量比與 RSI 偏高的高熱股"
          />
        </section>

        <section className="mt-8 grid grid-cols-1 gap-6 2xl:grid-cols-3">
          <StockTable
            title="剛啟動｜收籌墊高（30檔）"
            rows={startingAccumRows}
            maxRows={30}
            scrollHeight={900}
          />

          <StockTable
            title="可能第二波（30檔）"
            rows={secondWaveRows}
            maxRows={30}
            scrollHeight={900}
          />

          <StockTable
            title="強者恆強（30檔）"
            rows={strongTrendRows}
            maxRows={30}
            scrollHeight={900}
          />
        </section>

        <section className="mt-8">
          <StockTable
            title={`全部入選標的${search.trim() ? '｜搜尋結果' : ''}`}
            rows={filteredAllSelected}
            scrollHeight={900}
          />
        </section>

        {loading && (
          <div className="mt-6 rounded-3xl bg-white p-6 text-center text-slate-500 shadow-sm">
            讀取中...
          </div>
        )}
      </div>
    </main>
  )
}
