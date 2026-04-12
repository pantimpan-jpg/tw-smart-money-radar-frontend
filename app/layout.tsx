import './globals.css'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'TW Smart Money Radar',
  description: '台股主力籌碼掃描器',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body>
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-xl font-bold">TW Smart Money Radar</Link>
            <nav className="flex gap-4 text-sm text-slate-600">
              <Link href="/">首頁</Link>
              <Link href="/stocks">股票清單</Link>
              <Link href="/themes">題材分類</Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  )
}
