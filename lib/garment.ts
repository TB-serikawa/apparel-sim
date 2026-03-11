// Garment model definitions and UV island metadata.
// Each garment maps directly to a .glb file in /public/models/
// and declares the UV island regions that will be painted as CanvasTextures.

export type GarmentId = 't-shirt' | 'jersey' | 'shorts'

/** A named UV island — one rectangle within the [0,1] UV coordinate space. */
export interface UVIsland {
  id: string
  /** Japanese display name shown in the UI */
  label: string
  /** Normalized region in the UV texture atlas [0, 1] */
  region: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface GarmentConfig {
  id: GarmentId
  name: string
  /** Path relative to /public */
  modelPath: string
  /** Base resolution of the generated texture canvas (square) */
  textureSize: number
  uvIslands: UVIsland[]
}

// UV island layouts below match the UV unwrap of each .glb model.
// When model files are updated, these regions must be kept in sync.
export const GARMENTS: Record<GarmentId, GarmentConfig> = {
  't-shirt': {
    id: 't-shirt',
    name: 'Tシャツ',
    modelPath: '/models/t-shirt.glb',
    textureSize: 4096,
    uvIslands: [
      { id: 'front', label: '前身頃', region: { x: 0.0, y: 0.5, width: 0.5, height: 0.5 } },
      { id: 'back', label: '後身頃', region: { x: 0.5, y: 0.5, width: 0.5, height: 0.5 } },
      { id: 'sleeve-l', label: '左袖', region: { x: 0.0, y: 0.0, width: 0.25, height: 0.5 } },
      { id: 'sleeve-r', label: '右袖', region: { x: 0.25, y: 0.0, width: 0.25, height: 0.5 } },
    ],
  },
  jersey: {
    id: 'jersey',
    name: 'ジャージ',
    modelPath: '/models/jersey.glb',
    textureSize: 4096,
    uvIslands: [
      { id: 'front', label: '前身頃', region: { x: 0.0, y: 0.5, width: 0.5, height: 0.5 } },
      { id: 'back', label: '後身頃', region: { x: 0.5, y: 0.5, width: 0.5, height: 0.5 } },
      { id: 'sleeve-l', label: '左袖', region: { x: 0.0, y: 0.0, width: 0.25, height: 0.5 } },
      { id: 'sleeve-r', label: '右袖', region: { x: 0.25, y: 0.0, width: 0.25, height: 0.5 } },
    ],
  },
  shorts: {
    id: 'shorts',
    name: 'ショーツ',
    modelPath: '/models/shorts.glb',
    textureSize: 4096,
    uvIslands: [
      { id: 'front-l', label: '前左', region: { x: 0.0, y: 0.5, width: 0.25, height: 0.5 } },
      { id: 'front-r', label: '前右', region: { x: 0.25, y: 0.5, width: 0.25, height: 0.5 } },
      { id: 'back-l', label: '後左', region: { x: 0.5, y: 0.5, width: 0.25, height: 0.5 } },
      { id: 'back-r', label: '後右', region: { x: 0.75, y: 0.5, width: 0.25, height: 0.5 } },
    ],
  },
}
