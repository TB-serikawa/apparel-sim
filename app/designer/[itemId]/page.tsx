'use client'

// Main designer page — split layout:
//   Left  (2/3): 3D viewport (WebGL via React Three Fiber)
//   Right (1/3): MaterialEditor (color, logo, export controls)
//   Bottom strip: UVCanvas (live 2D UV island preview)
//
// GarmentViewer is dynamically imported (ssr: false) because Three.js and
// React Three Fiber require browser APIs unavailable during SSR.

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { use, useEffect, useRef, useState } from 'react'
import { notFound } from 'next/navigation'
import { GARMENTS } from '@/lib/garment'
import { UVSyncManager } from '@/lib/uv-sync'
import { MaterialEditor } from '@/components/viewer/MaterialEditor'
import { UVCanvas } from '@/components/viewer/UVCanvas'
import { requestExport } from '@/lib/export'

// Lazy-load the 3D scene — no SSR
const GarmentViewer = dynamic(
  () => import('@/components/viewer/GarmentViewer').then((m) => m.GarmentViewer),
  { ssr: false, loading: () => <ViewerSkeleton /> },
)

interface Props {
  params: Promise<{ itemId: string }>
}

export default function DesignerPage({ params }: Props) {
  const { itemId } = use(params)
  const config = GARMENTS[itemId as keyof typeof GARMENTS]
  if (!config) notFound()

  // UVSyncManager lives outside React state to avoid triggering re-renders
  // on every canvas paint.  We use a ref and force a single re-render after init.
  const uvSyncRef = useRef<UVSyncManager | null>(null)
  const [uvSyncReady, setUvSyncReady] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportResult, setExportResult] = useState<{ dxfUrl: string; specPdfUrl: string } | null>(
    null,
  )

  // Initialize UVSyncManager on the client after mount
  useEffect(() => {
    const manager = new UVSyncManager(config)

    // Apply default colors (one per island so each is visually distinct)
    const defaults = ['#1d4ed8', '#111827', '#0891b2', '#1e40af']
    config.uvIslands.forEach((island, i) => {
      manager.fillIsland(island.id, defaults[i % defaults.length])
    })

    uvSyncRef.current = manager
    setUvSyncReady(true)

    return () => {
      manager.dispose()
      uvSyncRef.current = null
    }
  }, [config])

  async function handleExport() {
    if (!uvSyncRef.current) return
    setIsExporting(true)
    setExportResult(null)
    try {
      const islandImages = uvSyncRef.current.exportAllIslands(2048)
      const result = await requestExport({
        garmentId: config.id,
        islandImages,
        meta: {
          designName: `${config.name} デザイン`,
          createdAt: new Date().toISOString(),
        },
      })
      setExportResult(result)
    } catch (err) {
      console.error('Export failed:', err)
      alert('データ出力に失敗しました。コンソールを確認してください。')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex h-screen flex-col bg-[#050505] text-white">
      {/* Top bar */}
      <header className="flex shrink-0 items-center justify-between border-b border-gray-800/60 px-6 py-3">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-gray-400 transition-colors hover:text-white">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="text-xs text-gray-500">apparel-sim</span>
          <span className="text-xs text-gray-600">/</span>
          <span className="text-sm font-semibold text-white">{config.name}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span className="rounded-full bg-sky-500/10 px-3 py-1 text-sky-400">
            {config.uvIslands.length} UV islands
          </span>
          <span>{(config.textureSize / 1024).toFixed(0)}K テクスチャ</span>
        </div>
      </header>

      {/* Main area */}
      <div className="flex min-h-0 flex-1">
        {/* 3D Viewport */}
        <div className="relative flex-1 bg-[#0a0a0f]">
          {uvSyncReady && <GarmentViewer uvSync={uvSyncRef.current} />}
          {!uvSyncReady && <ViewerSkeleton />}

          {/* Placeholder notice — remove when real GLB files are added */}
          <div className="pointer-events-none absolute bottom-4 left-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-3 py-2 text-xs text-yellow-400/70">
            プレースホルダーメッシュ — .glb モデル追加後に置き換えてください
          </div>
        </div>

        {/* Right panel */}
        <aside className="flex w-72 shrink-0 flex-col border-l border-gray-800/60 bg-[#060810]">
          <MaterialEditor
            config={config}
            uvSync={uvSyncRef.current}
            onExportRequest={handleExport}
            isExporting={isExporting}
          />
        </aside>
      </div>

      {/* UV Preview strip */}
      <div className="shrink-0 border-t border-gray-800/60 bg-[#060810]">
        <div className="flex items-center gap-2 px-4 pt-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
            UV展開プレビュー（2D型紙）
          </span>
        </div>
        <UVCanvas config={config} uvSync={uvSyncReady ? uvSyncRef.current : null} />
      </div>

      {/* Export result modal */}
      {exportResult && (
        <ExportResultModal result={exportResult} onClose={() => setExportResult(null)} />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ViewerSkeleton() {
  return (
    <div className="flex h-full w-full animate-pulse items-center justify-center">
      <div className="h-64 w-48 rounded-2xl bg-gray-800/40" />
    </div>
  )
}

function ExportResultModal({
  result,
  onClose,
}: {
  result: { dxfUrl: string; specPdfUrl: string }
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-[480px] rounded-2xl border border-gray-700 bg-gray-900 p-8">
        <h2 className="mb-2 text-2xl font-bold text-white">出力完了</h2>
        <p className="mb-6 text-sm text-gray-400">工場入稿用データが生成されました。</p>
        <div className="space-y-3">
          <a
            href={result.dxfUrl}
            className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white hover:border-sky-500/50"
          >
            型紙データ (.dxf)
            <svg className="h-4 w-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </a>
          <a
            href={result.specPdfUrl}
            className="flex items-center justify-between rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-white hover:border-sky-500/50"
          >
            縫製仕様書 (.pdf)
            <svg className="h-4 w-4 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </a>
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full rounded-lg border border-gray-700 py-2.5 text-sm text-gray-400 hover:text-white"
        >
          閉じる
        </button>
      </div>
    </div>
  )
}
