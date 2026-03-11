'use client'

// LivePresence — アバター群でオンラインユーザーを表示する。
// 実際のユーザーデータが揃うまでは seed されたデータをシミュレートし、
// 数秒ごとに小さな変動を加えてライブ感を演出する。

import { useEffect, useState } from 'react'

interface OnlineUser {
  id: string
  name: string
  initials: string
  color: string
  garment: string
}

// 架空の社内デザイナー・スポーツブランド担当者
const SEED_USERS: OnlineUser[] = [
  { id: 'u1', name: '田中 美咲', initials: 'TM', color: '#3b82f6', garment: 'jersey' },
  { id: 'u2', name: 'Kenji Watanabe', initials: 'KW', color: '#10b981', garment: 't-shirt' },
  { id: 'u3', name: '鈴木 一郎', initials: 'SI', color: '#f59e0b', garment: 'shorts' },
  { id: 'u4', name: 'Yuki Sato', initials: 'YS', color: '#ec4899', garment: 't-shirt' },
  { id: 'u5', name: '山田 健太', initials: 'YK', color: '#8b5cf6', garment: 'jersey' },
  { id: 'u6', name: 'Hana Ito', initials: 'HI', color: '#06b6d4', garment: 'shorts' },
  { id: 'u7', name: '佐藤 涼', initials: 'SR', color: '#f97316', garment: 't-shirt' },
]

interface Props {
  /** 現在表示するアバターの最大数 */
  max?: number
  showCount?: boolean
  className?: string
}

export function LivePresence({ max = 5, showCount = true, className = '' }: Props) {
  const [visible, setVisible] = useState<OnlineUser[]>(SEED_USERS.slice(0, max))
  const [total, setTotal] = useState(SEED_USERS.length + 4)

  // 人数を微妙に増減させて「生きている」感を出す
  useEffect(() => {
    const interval = setInterval(() => {
      const delta = Math.random() < 0.5 ? 1 : -1
      setTotal((prev) => Math.max(SEED_USERS.length, Math.min(prev + delta, 24)))
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Avatar stack */}
      <div className="flex items-center">
        {visible.map((user, i) => (
          <div
            key={user.id}
            title={user.name}
            className="relative flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#050505] text-[10px] font-bold text-white"
            style={{ backgroundColor: user.color, marginLeft: i === 0 ? 0 : -8, zIndex: visible.length - i }}
          >
            {user.initials}
            {/* オンラインドット */}
            <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-[#050505] bg-emerald-400" />
          </div>
        ))}
        {total > max && (
          <div
            className="relative flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#050505] bg-gray-700 text-[9px] font-bold text-gray-300"
            style={{ marginLeft: -8 }}
          >
            +{total - max}
          </div>
        )}
      </div>

      {showCount && (
        <span className="text-xs text-gray-400">
          <span className="font-semibold text-emerald-400">{total}</span> 人がデザイン中
        </span>
      )}
    </div>
  )
}
