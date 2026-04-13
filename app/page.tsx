'use client'

import { useEffect, useState } from 'react'

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

export default function HomePage() {
  const [text, setText] = useState('loading...')

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/scan/latest`, {
          cache: 'no-store',
        })
        const raw = await res.text()
        setText(raw)
      } catch (e) {
        setText(`ERROR: ${String(e)}`)
      }
    })()
  }, [])

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">DEBUG PAGE</h1>
      <div className="mb-4">API_BASE: {API_BASE}</div>
      <pre className="whitespace-pre-wrap break-all rounded bg-white p-4 shadow">
        {text}
      </pre>
    </main>
  )
}
