'use client'

// ActivityFeed — 最近のデザイン確定・保存などのアクティビティをライブ表示。
// 実バックエンド接続前はシード済みのイベントをランダムに流す。

import { useEffect, useState } from 'react'

type EventType = 'confirmed' | 'saved' | 'started' | 'logo'

interface ActivityEvent {
  id: string
  type: EventType
  user: string
  garment: string
  team?: string
  time: Date
}

const GARMENT_NAMES: Record<string, string> = {
  't-shirt': 'Tシャツ',
  jersey: 'ジャージ',
  shorts: 'ショーツ',
}

const SEED_EVENTS: Omit<ActivityEvent, 'id' | 'time'>[] = [
  { type: 'confirmed', user: '田中 美咲', garment: 'jersey', team: 'FC Yamato U-18' },
  { type: 'logo', user: 'Kenji W.', garment: 't-shirt', team: 'Tokyo Runners' },
  { type: 'saved', user: '鈴木 一郎', garment: 'shorts' },
  { type: 'started', user: 'Yuki S.', garment: 'jersey', team: 'Osaka Knights' },
  { type: 'confirmed', user: '山田 健太', garment: 't-shirt', team: 'Kobe Tigers' },
  { type: 'logo', user: 'Hana I.', garment: 'shorts' },
  { type: 'saved', user: '佐藤 涼', garment: 'jersey', team: 'Nagoya FC' },
  { type: 'started', user: '中村 葵', garment: 't-shirt' },
  { type: 'confirmed', user: 'Ryo M.', garment: 'shorts', team: 'Sapporo SC' },
  { type: 'logo', user: '小林 誠', garment: 'jersey', team: 'Yokohama Blue' },
]

const EVENT_LABEL: Record<EventType, { label: string; icon: string; color: string }> = {
  confirmed: { label: 'デザイン確定', icon: '✓', color: 'text-emerald-400' },
  saved:     { label: '保存',         icon: '💾', color: 'text-sky-400' },
  started:   { label: 'デザイン開始', icon: '✦', color: 'text-violet-400' },
  logo:      { label: 'ロゴ配置',     icon: '🎨', color: 'text-amber-400' },
}

function makeEvent(seed: Omit<ActivityEvent, 'id' | 'time'>, offsetMs: number): ActivityEvent {
  return {
    ...seed,
    id: `${Date.now()}-${Math.random()}`,
    time: new Date(Date.now() - offsetMs),
  }
}

function timeAgo(date: Date): string {
  const s = Math.floor((Date.now() - date.getTime()) / 1000)
  if (s < 60) return `${s}秒前`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}分前`
  return `${Math.floor(m / 60)}時間前`
}

export function ActivityFeed({ maxItems = 6 }: { maxItems?: number }) {
  const [events, setEvents] = useState<ActivityEvent[]>(() =>
    SEED_EVENTS.slice(0, maxItems).map((s, i) => makeEvent(s, i * 40_000)),
  )

  // 30〜90 秒おきに新しいイベントを先頭に追加
  useEffect(() => {
    function scheduleNext() {
      const delay = 30_000 + Math.random() * 60_000
      const timer = setTimeout(() => {
        const seed = SEED_EVENTS[Math.floor(Math.random() * SEED_EVENTS.length)]
        setEvents((prev) => [makeEvent(seed, 0), ...prev].slice(0, maxItems))
        scheduleNext()
      }, delay)
      return timer
    }
    const t = scheduleNext()
    return () => clearTimeout(t)
  }, [maxItems])

  // 表示上の「〇秒前」を毎分更新
  useEffect(() => {
    const interval = setInterval(() => setEvents((e) => [...e]), 30_000)
    return () => clearInterval(interval)
  }, [])

  return (
    <ul className="space-y-2">
      {events.map((ev) => {
        const meta = EVENT_LABEL[ev.type]
        return (
          <li key={ev.id} className="flex items-start gap-3 text-sm">
            <span className={`mt-0.5 w-5 text-center text-sm ${meta.color}`}>{meta.icon}</span>
            <div className="min-w-0 flex-1">
              <span className="font-medium text-white">{ev.user}</span>
              <span className="text-gray-400"> が </span>
              <span className={`font-medium ${meta.color}`}>{GARMENT_NAMES[ev.garment]}</span>
              <span className="text-gray-400"> を{meta.label}</span>
              {ev.team && (
                <span className="ml-1 rounded-full bg-gray-800 px-2 py-0.5 text-xs text-gray-400">
                  {ev.team}
                </span>
              )}
            </div>
            <span className="shrink-0 text-xs text-gray-600">{timeAgo(ev.time)}</span>
          </li>
        )
      })}
    </ul>
  )
}
