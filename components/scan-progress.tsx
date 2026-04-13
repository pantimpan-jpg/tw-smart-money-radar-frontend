'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL

type ScanStatus = {
  scan_running: boolean
  percent?: number
  stage?: string
  message?: string
  processed?: number
  total?: number
  success?: number
  failed?: number
  skipped?: number
  last_scan_error?: string | null
  last_updated?: string | null
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

export function ScanProgress() {
  const [status, setStatus] = useState<ScanStatus | null>(null)
  const router = useRouter()
  const wasRunningRef = useRef(false)

  useEffect(() => {
    if (!API_BASE) return

    let mounted = true

    const fetchStatus = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/scan/status`, {
          cache: 'no-store',
        })
        if (!res.ok) return

        const data = await res.json()
        if (!mounted) return

        setStatus(data)

        if (data.scan_running) {
          wasRunningRef.current = true
        } else if (wasRunningRef.current) {
          wasRunningRef.current = false
          router.refresh()
        }
      } catch (err) {
        console.error(err)
      }
    }

    fetchStatus()
    const timer = setInterval(fetchStatus, 2000)

    return () => {
      mounted = false
      clearInterval(timer)
    }
  }, [router])

  if (!status) {
    return (
      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <div className="text-lg font-bold text-slate-900">掃描狀態</div>
        <div className="mt-2 text-sm text-slate-500">讀取狀態中...</div>
      </div>
    )
  }

  const running = !!status.scan_running
  const hasError = !!status.last_scan_error
  const percent = Math.max(0, Math.min(100, Number(status.percent ?? 0)))

  const title = hasError
    ? '掃描失敗'
    : running
      ? '掃描進行中'
      : '掃描待機中'

  const message = hasError
    ? `錯誤：${status.last_scan_error}`
    : running
      ? status.message || '處理中'
      : status.last_updated
        ? `最近完成時間：${formatTaipeiTime(status.last_updated)}`
        : '尚未開始掃描'

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-lg font-bold text-slate-900">{title}</div>
          <div className="mt-1 text-sm text-slate-600">{message}</div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-slate-900">
            {running ? `${percent}%` : hasError ? 'Error' : 'Idle'}
          </div>
          <div className="text-xs text-slate-500">{status.stage || '-'}</div>
        </div>
      </div>

      <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            hasError ? 'bg-red-500' : running ? 'bg-slate-900' : 'bg-slate-400'
          }`}
          style={{ width: `${running ? percent : 100}%` }}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
        <span>進度：{status.processed ?? 0} / {status.total ?? 0}</span>
        <span>成功：{status.success ?? 0}</span>
        <span>失敗：{status.failed ?? 0}</span>
        <span>略過：{status.skipped ?? 0}</span>
      </div>
    </div>
  )
}
