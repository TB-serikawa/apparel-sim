'use client'

// MaterialEditor is the right-panel control surface.
// It drives the UVSyncManager: color fills per island, logo upload/placement.

import { useRef, useState } from 'react'
import type { UVSyncManager, LogoPlacement } from '@/lib/uv-sync'
import type { GarmentConfig } from '@/lib/garment'

interface MaterialEditorProps {
  config: GarmentConfig
  uvSync: UVSyncManager | null
  onExportRequest: () => void
  isExporting: boolean
}

const PRESET_COLORS = [
  '#ffffff', '#111827', '#1d4ed8', '#dc2626',
  '#16a34a', '#ca8a04', '#7c3aed', '#db2777',
  '#0891b2', '#ea580c', '#38bdf8', '#4ade80',
]

export function MaterialEditor({
  config,
  uvSync,
  onExportRequest,
  isExporting,
}: MaterialEditorProps) {
  const [activeIsland, setActiveIsland] = useState(config.uvIslands[0].id)
  const [islandColors, setIslandColors] = useState<Record<string, string>>(() =>
    Object.fromEntries(config.uvIslands.map((i) => [i.id, '#1d4ed8'])),
  )
  const [logoPlacements, setLogoPlacements] = useState<Record<string, LogoPlacement>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleColorClick(color: string) {
    if (!uvSync) return
    setIslandColors((prev) => ({ ...prev, [activeIsland]: color }))
    uvSync.fillIsland(activeIsland, color)
  }

  function handleCustomColor(e: React.ChangeEvent<HTMLInputElement>) {
    handleColorClick(e.target.value)
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!uvSync) return
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    const placement: LogoPlacement = { normX: 0.5, normY: 0.4, normScale: 0.3 }
    await uvSync.drawImageUrlOnIsland(activeIsland, url, placement)
    setLogoPlacements((prev) => ({ ...prev, [activeIsland]: placement }))
    URL.revokeObjectURL(url)
  }

  function handleReset() {
    if (!uvSync) return
    uvSync.clear()
    const defaultColors = Object.fromEntries(config.uvIslands.map((i) => [i.id, '#1d4ed8']))
    setIslandColors(defaultColors)
    config.uvIslands.forEach((i) => uvSync.fillIsland(i.id, '#1d4ed8'))
    setLogoPlacements({})
  }

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-6">
      {/* Island selector */}
      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
          パーツ選択
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {config.uvIslands.map((island) => (
            <button
              key={island.id}
              onClick={() => setActiveIsland(island.id)}
              className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                activeIsland === island.id
                  ? 'border-sky-500 bg-sky-500/20 text-sky-300'
                  : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600'
              }`}
            >
              <span
                className="mr-2 inline-block h-3 w-3 rounded-full border border-white/20"
                style={{ backgroundColor: islandColors[island.id] }}
              />
              {island.label}
            </button>
          ))}
        </div>
      </section>

      {/* Color picker */}
      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
          カラー — {config.uvIslands.find((i) => i.id === activeIsland)?.label}
        </h3>
        <div className="mb-3 grid grid-cols-6 gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => handleColorClick(color)}
              title={color}
              className={`h-8 w-full rounded-md border-2 transition-transform hover:scale-110 ${
                islandColors[activeIsland] === color
                  ? 'border-sky-400 scale-110'
                  : 'border-transparent'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        {/* Custom color picker */}
        <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 hover:border-gray-600">
          <input
            type="color"
            value={islandColors[activeIsland]}
            onChange={handleCustomColor}
            className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent"
          />
          <span className="text-sm text-gray-300">カスタムカラー</span>
          <code className="ml-auto text-xs text-gray-500">{islandColors[activeIsland]}</code>
        </label>
      </section>

      {/* Logo upload */}
      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
          ロゴ配置 — {config.uvIslands.find((i) => i.id === activeIsland)?.label}
        </h3>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={!uvSync}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-dashed border-gray-600 bg-gray-800/30 px-4 py-4 text-sm text-gray-400 transition-colors hover:border-sky-500/50 hover:text-sky-400 disabled:opacity-50"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          PNG / SVG をアップロード
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/svg+xml,image/jpeg"
          className="hidden"
          onChange={handleLogoUpload}
        />
        {logoPlacements[activeIsland] && (
          <p className="mt-2 text-xs text-sky-400">ロゴ配置済み ✓</p>
        )}
      </section>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <section className="space-y-3">
        <button
          onClick={handleReset}
          disabled={!uvSync}
          className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-sm text-gray-400 transition-colors hover:border-gray-600 hover:text-gray-200 disabled:opacity-50"
        >
          リセット
        </button>
        <button
          onClick={onExportRequest}
          disabled={!uvSync || isExporting}
          className="w-full rounded-lg bg-sky-500 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-sky-400 disabled:opacity-50"
        >
          {isExporting ? '生成中...' : 'デザイン確定・データ出力'}
        </button>
        <p className="text-center text-xs text-gray-600">
          DXF · プリント画像 · 仕様書PDF を自動生成
        </p>
      </section>
    </div>
  )
}
