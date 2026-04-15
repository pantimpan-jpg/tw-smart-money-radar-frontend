'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { getLatestScan, type LatestScanResponse, type ScanPayload } from '@/lib/api'
import { StockTable } from '@/components/stock-table'
import { ScanButton } from '@/components/scan-button'
import { ScanProgress } from '@/components/scan-progress'

function StatCard({
  title,
  value,
  hint,
}: {
  title: string
  value: string | number
  hint: string
}) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</div>
      <div className="mt-1 text-sm text-slate-600">{hint}</div>
    </div>
  )
}

function SectionHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">{title}</h2>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </div>
      {action}
    </div>
  )
}

function formatTaipeiTime(value?: string | null) {
  if (!value) return '-'
  try {
    return new Date(value).toLocaleString('zh-TW', {
      timeZone: 'Asia/Taipei',
      hour12: false,
    })
  } catch {
    return value
  }
}

function formatCount(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) return '-'
  return value.toLocaleString('zh-TW')
}

function getMarketTone(data: ScanPayload | null) {
  if (!data?.summary) {
    return {
      label: '資料不足',
      desc: '等待最新掃描結果',
    }
  }

  const selected = data.summary.selected ?? 0
  const starting = data.summary.starting_count ?? 0
  const secondWave = data.summary.second_wave_count ?? 0
  const overheated = data.summary.overheated_count ?? 0

  if (selected >= 25 && overheated <= Math.max(5, Math.floor(selected * 0.25))) {
    return {
      label: '偏多輪動',
      desc: '可操作標的偏多，資金願意擴散。',
    }
  }

  if (overheated >= Math.max(8, Math.floor(selected * 0.35))) {
    return {
      label: '過熱偏震盪',
      desc: '強股不少，但追價風險也同步升高。',
    }
  }

  if (starting + secondWave <= 8) {
    return {
      label: '觀望整理',
      desc: '盤面可用型態不多，先挑最強結構。',
    }
  }

  return {
    label: '中性輪動',
    desc: '有機會，但需更重視型態與順位。',
  }
}

function getStrategySummary(data: ScanPayload | null) {
  if (!data?.summary) return '等待新資料'

  const starting = data.summary.starting_count ?? 0
  const secondWave = data.summary.second_wave_count ?? 0
  const overheated = data.summary.overheated_count ?? 0

  if (secondWave > starting) return '第二波候選較多，留意整理後再攻型。'
  if (starting > secondWave) return '剛啟動標的較多，市場偏向初動輪動。'
  if (overheated >= 8) return '強股不少，但短線追高要控制節奏。'

  return '三種型態接近，優先比成交值、籌碼與結構完整度。'
}

export default function HomePage() {
  const [raw, setRaw] = useState<LatestScanResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    ;(async () => {
      try {
        const result = await getLatestScan()
        if (mounted) setRaw(result)
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  const updatedAt = raw?.updated_at ?? null
  const data: ScanPayload | null = raw?.data ?? null

  const marketTone = useMemo(() => getMarketTone(data), [data])
  const strategySummary = useMemo(() => getStrategySummary(data), [data])

  const accelerationRows = useMemo(() => {
    return (data?.top30 ?? []).slice(0, 10)
  }, [data])

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <section className="rounded-[28px] bg-slate-900 px-6 py-7 text-white shadow-sm md:px-8 md:py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-200 ring-1 ring-white/15">
              短線交易決策平台
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
              TW Smart Money Radar
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-300 md:text-base">
              不只看哪些股票漲很多，而是找出今天最值得從短線交易角度優先研究的標的。
              首頁分成剛啟動、第二波、主升段加速與特殊策略區塊，避免不同型態混在同一張榜單。
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/stocks"
                className="rounded-2xl bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
              >
                查看全清單
              </Link>
              <ScanButton />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:w-[360px]">
            <div className="rounded-3xl bg-white/10 p-4 ring-1 ring-white/10">
              <div className="text-sm text-slate-300">市場狀態</div>
              <div className="mt-2 text-2xl font-bold">{marketTone.label}</div>
              <div className="mt-1 text-sm text-slate-300">{marketTone.desc}</div>
            </div>

            <div className="rounded-3xl bg-white/10 p-4 ring-1 ring-white/10">
              <div className="text-sm text-slate-300">今日策略重點</div>
              <div className="mt-2 text-base font-semibold text-white">{strategySummary}</div>
              <div className="mt-2 text-sm text-slate-300">
                更新時間：{formatTaipeiTime(updatedAt)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <ScanProgress />

      {loading ? (
        <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
          <div className="text-lg font-semibold text-slate-900">資料載入中...</div>
          <p className="mt-2 text-slate-600">正在抓取最新掃描結果。</p>
        </div>
      ) : data ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <StatCard
              title="掃描市場檔數"
              value={formatCount(data.summary?.market_scanned)}
              hint="全市場今日完成掃描"
            />
            <StatCard
              title="入選標的"
              value={formatCount(data.summary?.selected)}
              hint="通過模型篩選"
            />
            <StatCard
              title="剛啟動"
              value={formatCount(data.summary?.starting_count)}
              hint="靠近第一波初動"
            />
            <StatCard
              title="第二波候選"
              value={formatCount(data.summary?.second_wave_count)}
              hint="整理後再攻候選"
            />
            <StatCard
              title="過熱風險"
              value={formatCount(data.summary?.overheated_count)}
              hint="高檔爆量需留意"
            />
          </section>

          <section className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
              <div className="text-sm text-slate-500">交易儀表板</div>
              <div className="mt-2 text-lg font-bold text-slate-900">三大核心榜單</div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                將剛啟動、第二波與主升段加速拆開，避免不同型態混在同一排序，讓你更容易判斷短線優先順序。
              </p>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
              <div className="text-sm text-slate-500">特殊策略</div>
              <div className="mt-2 text-lg font-bold text-slate-900">成交值與過熱風險並看</div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                強股不一定能追。除了看強勢，也同時保留高成交值與過熱區塊，幫你分辨是健康攻擊還是可能過熱。
              </p>
            </div>

            <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
              <div className="text-sm text-slate-500">自選觀察</div>
              <div className="mt-2 text-lg font-bold text-slate-900">Watchlist 追蹤</div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                把真正想看的股票集中在自選區，後面再補分數變化、技術結構與隔日劇本，就會更像完整交易工作台。
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <SectionHeader
              title="三大核心榜單"
              description="首頁主榜單改成分型顯示，先看型態，再看排序。"
              action={
                <div className="flex items-center gap-3">
                  <div className="text-sm text-slate-500">
                    更新時間：{formatTaipeiTime(updatedAt)}
                  </div>
                  <ScanButton />
                </div>
              }
            />

            <div className="grid gap-6 xl:grid-cols-3">
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">剛啟動</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    偏第一波初動，重點看平台突破、量能與短均線翻揚。
                  </p>
                </div>
                <StockTable rows={(data.starting ?? []).slice(0, 10)} variant="starting" />
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">第二波候選</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    偏整理後再攻，後面應補第一波、整理天數與回檔品質欄位。
                  </p>
                </div>
                <StockTable rows={(data.second_wave ?? []).slice(0, 10)} variant="secondWave" />
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">主升段加速</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    目前以前排強勢股代理，後續再正式拆成獨立主升段模型。
                  </p>
                </div>
                <StockTable rows={accelerationRows} variant="acceleration" />
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <div className="space-y-3">
              <SectionHeader
                title="特殊策略：高成交值"
                description="先保留最實用的一塊，方便看資金真正集中在哪。"
              />
              <StockTable rows={(data.high_turnover ?? []).slice(0, 10)} variant="strategy" />
            </div>

            <div className="space-y-3">
              <SectionHeader
                title="特殊策略：過熱風險"
                description="強勢不代表安全，高檔爆量、過熱乖離仍要分開看。"
              />
              <StockTable rows={(data.overheated ?? []).slice(0, 10)} variant="strategy" />
            </div>
          </section>

          <section className="space-y-3">
            <SectionHeader
              title="Watchlist"
              description="保留你真正想追蹤的標的，後面再接個股頁與劇本區。"
            />
            <StockTable rows={(data.watchlist ?? []).slice(0, 10)} variant="default" />
          </section>
        </>
      ) : (
        <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
          <div className="text-lg font-semibold text-slate-900">目前還沒有掃描結果</div>
          <p className="mt-2 text-slate-600">請先執行掃描，再回來查看新版首頁內容。</p>
          <div className="mt-4">
            <ScanButton />
          </div>
        </div>
      )}
    </main>
  )
}
