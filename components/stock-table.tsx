'use client'

import React from 'react'
import Link from 'next/link'

export type StockRow = {
  stock_id: string
  name: string
  group?: string
  theme?: string
  close?: number
  turnover_100m?: number
  volume_ratio?: number
  score?: number
  score_total?: number
  tag?: string
  radar_tag?: string
  reason_text?: string
  near_support?: number
  strong_support?: number
  near_resistance?: number
  strong_resistance?: number
  [key: string]: unknown
}

type StockTableProps = {
  title: string
  rows: StockRow[]
  maxRows?: number
  scrollHeight?: number
  emptyText?: string
}

function fmt(value: unknown, digits = 2): string {
  const n = Number(value)
  if (!Number.isFinite(n)) return '-'
  return n.toFixed(digits)
}

export function StockTable({
  title,
  rows,
  maxRows,
  scrollHeight = 720,
  emptyText = '目前沒有資料',
}: StockTableProps) {
  const visibleRows = typeof maxRows === 'number' ? rows.slice(0, maxRows) : rows

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <div className="text-sm text-slate-500">共 {visibleRows.length} 檔</div>
      </div>

      {visibleRows.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          {emptyText}
        </div>
      ) : (
        <div
          className="overflow-auto rounded-2xl border border-slate-100"
          style={{ maxHeight: `${scrollHeight}px` }}
        >
          <table className="min-w-full border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-slate-100 text-slate-700">
              <tr>
                <th className="px-3 py-3 text-left font-semibold">股號</th>
                <th className="px-3 py-3 text-left font-semibold">股名</th>
                <th className="px-3 py-3 text-left font-semibold">題材</th>
                <th className="px-3 py-3 text-right font-semibold">收盤</th>
                <th className="px-3 py-3 text-right font-semibold">成交額(億)</th>
                <th className="px-3 py-3 text-right font-semibold">量比</th>
                <th className="px-3 py-3 text-right font-semibold">分數</th>
                <th className="px-3 py-3 text-left font-semibold">標籤</th>
                <th className="px-3 py-3 text-left font-semibold">理由</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row, idx) => {
                const key = `${row.stock_id}-${idx}`
                const href = `/stocks/${row.stock_id}`

                return (
                  <tr key={key} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-3 font-medium text-slate-900">
                      <Link
                        href={href}
                        className="rounded underline-offset-4 hover:text-blue-600 hover:underline"
                      >
                        {row.stock_id || '-'}
                      </Link>
                    </td>

                    <td className="px-3 py-3 text-slate-800">
                      <Link
                        href={href}
                        className="rounded underline-offset-4 hover:text-blue-600 hover:underline"
                      >
                        {row.name || '-'}
                      </Link>
                    </td>

                    <td className="px-3 py-3 text-slate-600">{row.theme || row.group || '-'}</td>

                    <td className="px-3 py-3 text-right text-slate-800">{fmt(row.close)}</td>

                    <td className="px-3 py-3 text-right text-slate-800">
                      {fmt(row.turnover_100m)}
                    </td>

                    <td className="px-3 py-3 text-right text-slate-800">
                      {fmt(row.volume_ratio)}
                    </td>

                    <td className="px-3 py-3 text-right font-semibold text-slate-900">
                      {fmt(row.score ?? row.score_total, 1)}
                    </td>

                    <td className="px-3 py-3 text-slate-700">{row.tag || row.radar_tag || '-'}</td>

                    <td className="px-3 py-3 text-slate-600">{row.reason_text || '-'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default StockTable
