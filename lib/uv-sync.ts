// Core UV-sync engine.
//
// A UVSyncManager owns one HTMLCanvasElement that acts as the live texture
// for a garment's Three.js material.  Any design edit (color fill, logo
// placement) paints directly onto that canvas; Three.js picks up the change
// in the same frame via texture.needsUpdate = true.
//
// The canvas is also the source-of-truth for manufacturing export: each UV
// island can be cropped and exported at full print resolution.

import * as THREE from 'three'
import type { GarmentConfig, UVIsland } from './garment'

export interface LogoPlacement {
  /** Normalized position within the island [0, 1] */
  normX: number
  normY: number
  /** Logo size as a fraction of the island width */
  normScale: number
}

export class UVSyncManager {
  /** The canvas that Three.js reads as a CanvasTexture */
  readonly canvas: HTMLCanvasElement
  /** Live Three.js texture — attach this to your MeshStandardMaterial.map */
  readonly texture: THREE.CanvasTexture

  private ctx: CanvasRenderingContext2D
  private config: GarmentConfig

  constructor(config: GarmentConfig) {
    this.config = config

    this.canvas = document.createElement('canvas')
    this.canvas.width = config.textureSize
    this.canvas.height = config.textureSize

    this.ctx = this.canvas.getContext('2d')!

    this.texture = new THREE.CanvasTexture(this.canvas)
    // GLTF uses bottom-left UV origin; Three.js CanvasTexture uses top-left.
    // Setting flipY = false keeps UV coordinates consistent with the model.
    this.texture.flipY = false
    this.texture.colorSpace = THREE.SRGBColorSpace

    this.clear()
  }

  // ---------------------------------------------------------------------------
  // Paint operations — all call texture.needsUpdate = true automatically
  // ---------------------------------------------------------------------------

  /** Flood-fill an entire UV island with a solid hex color, e.g. '#ff0000'. */
  fillIsland(islandId: string, color: string): void {
    const px = this.islandPixels(islandId)
    if (!px) return
    this.ctx.fillStyle = color
    this.ctx.fillRect(px.x, px.y, px.w, px.h)
    this.texture.needsUpdate = true
  }

  /**
   * Draw a loaded HTMLImageElement onto a UV island.
   * Position and scale are expressed as fractions of the island dimensions.
   */
  drawImageOnIsland(islandId: string, image: HTMLImageElement, placement: LogoPlacement): void {
    const px = this.islandPixels(islandId)
    if (!px) return

    const size = px.w * placement.normScale
    const drawX = px.x + placement.normX * px.w - size / 2
    const drawY = px.y + placement.normY * px.h - size / 2

    this.ctx.drawImage(image, drawX, drawY, size, size)
    this.texture.needsUpdate = true
  }

  /**
   * Draw an arbitrary image (by URL) onto a UV island.
   * Loads the image in the browser then delegates to drawImageOnIsland.
   */
  async drawImageUrlOnIsland(
    islandId: string,
    url: string,
    placement: LogoPlacement,
  ): Promise<void> {
    const img = await loadImage(url)
    this.drawImageOnIsland(islandId, img, placement)
  }

  /** Reset the entire texture to white (all islands). */
  clear(): void {
    this.ctx.fillStyle = '#ffffff'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    this.texture.needsUpdate = true
  }

  // ---------------------------------------------------------------------------
  // Export helpers
  // ---------------------------------------------------------------------------

  /**
   * Crop a single UV island from the canvas and return it as a data-URL.
   * The output is resampled to targetWidth × targetHeight, which should match
   * the required print resolution.
   *
   * @param islandId    Which island to export
   * @param targetWidth  Output pixel width  (default: island width on texture)
   * @param targetHeight Output pixel height (default: island height on texture)
   */
  exportIslandDataUrl(
    islandId: string,
    targetWidth?: number,
    targetHeight?: number,
  ): string | null {
    const px = this.islandPixels(islandId)
    if (!px) return null

    const w = targetWidth ?? px.w
    const h = targetHeight ?? px.h

    const out = document.createElement('canvas')
    out.width = w
    out.height = h
    const outCtx = out.getContext('2d')!
    outCtx.drawImage(this.canvas, px.x, px.y, px.w, px.h, 0, 0, w, h)
    return out.toDataURL('image/png')
  }

  /**
   * Export all islands as { islandId → dataUrl } for sending to the export API.
   */
  exportAllIslands(targetSize = 2048): Record<string, string> {
    return Object.fromEntries(
      this.config.uvIslands.map((island) => [
        island.id,
        this.exportIslandDataUrl(island.id, targetSize, targetSize) ?? '',
      ]),
    )
  }

  dispose(): void {
    this.texture.dispose()
  }

  // ---------------------------------------------------------------------------
  // Internals
  // ---------------------------------------------------------------------------

  private findIsland(id: string): UVIsland | undefined {
    return this.config.uvIslands.find((i) => i.id === id)
  }

  /** Convert a UV island's normalized region to pixel coordinates on this canvas. */
  private islandPixels(
    islandId: string,
  ): { x: number; y: number; w: number; h: number } | null {
    const island = this.findIsland(islandId)
    if (!island) return null
    const s = this.config.textureSize
    return {
      x: island.region.x * s,
      y: island.region.y * s,
      w: island.region.width * s,
      h: island.region.height * s,
    }
  }
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}
