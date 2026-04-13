'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL

export function ScanButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleScan = async () => {
    if (loading) return

    if (!API_BASE) {
      alert('找不到 API_BASE，請檢查 NEXT_PUBLIC_API_BASE_URL')
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`${API_BASE}/api/scan/run`, {
        method: 'POST',
      })

      if (!res.ok) {
        throw new Error(`掃描啟動失敗: ${res.status}`)
      }

      alert('已開始掃描。全市場掃描需要一些時間，請稍後再重新整理查看結果。')

      setTimeout(() => {
        router.refresh()
      }, 5000)
    } catch (err) {
      console.error(err)
      alert('掃描啟動失敗')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleScan}
      disabled={loading}
      className="rounded-2xl border border-white/20 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? '掃描中...' : '立即掃描'}
    </button>
  )
}
