import Link from 'next/link'
import { GARMENTS } from '@/lib/garment'

const ICONS: Record<string, string> = {
  't-shirt': '👕',
  jersey: '🎽',
  shorts: '🩳',
}

const DESCRIPTIONS: Record<string, string> = {
  't-shirt': 'カジュアルからスポーツまで対応する定番アイテム',
  jersey: 'チームスポーツ向けの高機能ジャージ',
  shorts: 'ランニング・チームスポーツ用ショーツ',
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#050505]">
      {/* Background accent */}
      <div
        className="pointer-events-none fixed right-0 top-0 h-[600px] w-[600px] rounded-full opacity-10"
        style={{
          background: 'radial-gradient(circle, #38bdf8 0%, transparent 70%)',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-8 py-24">
        {/* Header */}
        <div className="mb-20">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-sky-400">
            apparel-sim
          </p>
          <h1 className="mb-6 text-6xl font-bold leading-tight">
            リアルタイム3D
            <br />
            <span className="text-sky-400">スポーツウェア</span>デザイン
          </h1>
          <p className="max-w-2xl text-xl leading-relaxed text-sky-100/80">
            ブラウザ上で3Dモデルを360°回転させながら色・柄・ロゴを配置。
            <br />
            デザイン確定で工場入稿用データ（型紙DXF・プリント画像・仕様書PDF）を自動生成。
          </p>
        </div>

        {/* Feature badges */}
        <div className="mb-16 flex flex-wrap gap-3">
          {['WebGL / Three.js', 'UV-map sync', 'DXF出力', 'PDF仕様書', 'サーバーレス'].map(
            (f) => (
              <span
                key={f}
                className="rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1.5 text-sm text-sky-300"
              >
                {f}
              </span>
            ),
          )}
        </div>

        {/* Garment selector */}
        <h2 className="mb-8 text-2xl font-bold text-white/60">アイテムを選択</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {Object.values(GARMENTS).map((g) => (
            <Link key={g.id} href={`/designer/${g.id}`}>
              <div className="group relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900 p-10 transition-all duration-300 hover:border-sky-500/60 hover:bg-gray-900/80">
                {/* Hover glow */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{ background: 'radial-gradient(circle at 50% 0%, rgba(56,189,248,0.08) 0%, transparent 70%)' }}
                />

                <div className="mb-6 text-5xl">{ICONS[g.id]}</div>
                <h3 className="mb-2 text-2xl font-bold text-white">{g.name}</h3>
                <p className="mb-6 text-sm text-gray-400">{DESCRIPTIONS[g.id]}</p>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{g.uvIslands.length} パーツ</span>
                  <span>•</span>
                  <span>{(g.textureSize / 1024).toFixed(0)}K テクスチャ</span>
                </div>

                <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-sky-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  デザインを開始
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer note */}
        <p className="mt-20 text-center text-sm text-gray-600">
          Phase 1 — 3D-2D連携 PoC | Three.js + React Three Fiber + Next.js
        </p>
      </div>
    </main>
  )
}
