'use client'

// UVCanvas renders a live 2D preview of all UV islands side-by-side.
// It reads from the same HTMLCanvasElement owned by UVSyncManager, so it
// always reflects the latest paint without any extra data copying.

import { useEffect, useRef } from 'react'
import type { UVSyncManager } from '@/lib/uv-sync'
import type { GarmentConfig } from '@/lib/garment'

interface UVCanvasProps {
  config: GarmentConfig
  uvSync: UVSyncManager | null
}

const PREVIEW_SIZE = 120 // px per island preview thumbnail

export function UVCanvas({ config, uvSync }: UVCanvasProps) {
  return (
    <div className="flex flex-wrap gap-3 p-4">
      {config.uvIslands.map((island) => (
        <div key={island.id} className="flex flex-col items-center gap-1.5">
          <IslandPreview
            island={island}
            uvSync={uvSync}
            textureSize={config.textureSize}
          />
          <span className="text-xs text-gray-400">{island.label}</span>
        </div>
      ))}
    </div>
  )
}

interface IslandPreviewProps {
  island: GarmentConfig['uvIslands'][number]
  uvSync: UVSyncManager | null
  textureSize: number
}

function IslandPreview({ island, uvSync, textureSize }: IslandPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!uvSync || !canvasRef.current) return

    // Use requestAnimationFrame to sync preview redraws with the render loop
    let rafId: number
    function draw() {
      const out = canvasRef.current
      if (!out || !uvSync) return
      const ctx = out.getContext('2d')!

      const s = textureSize
      const r = island.region
      // Crop the island region from the UVSyncManager's source canvas
      ctx.drawImage(
        uvSync.canvas,
        r.x * s,
        r.y * s,
        r.width * s,
        r.height * s,
        0,
        0,
        PREVIEW_SIZE,
        PREVIEW_SIZE,
      )
      rafId = requestAnimationFrame(draw)
    }

    rafId = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafId)
  }, [uvSync, island, textureSize])

  return (
    <canvas
      ref={canvasRef}
      width={PREVIEW_SIZE}
      height={PREVIEW_SIZE}
      className="rounded-md border border-gray-700 bg-gray-900"
    />
  )
}
