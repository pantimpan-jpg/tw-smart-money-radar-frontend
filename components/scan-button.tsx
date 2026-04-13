'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL

export function ScanButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleScan = async () => {
    if (loading) return
    setLoading(true)

    try {
      const res = await fetch(`${API_BASE}/api/scan/run`, {
        method: 'POST',
      })

      if (!res.ok) {
        throw new Error('掃描啟動失敗')
      }

      alert('已開始掃描，幾分鐘後再重新整理查看結果。')
      setTimeout(() => {
        router.refresh()
      }, 2000)
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
      className="rounded-full border border-white/20 bg-white px-6 py-3 text-base font-medium text-slate-900 hover:bg-gray-100 disabled:opacity-60"
    >
      {loading ? '掃描中...' : '立即掃描'}
    </button>
  )
}
