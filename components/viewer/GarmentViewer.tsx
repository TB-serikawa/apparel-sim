'use client'

// GarmentViewer renders the Three.js scene via React Three Fiber.
//
// A mannequin-like human body is built from Three.js primitives so the garment
// appears to be "worn".  Once real .glb garment models are added to
// /public/models/, replace <MannequinBody> with <GarmentModel> using useGLTF.

import { useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import type { UVSyncManager } from '@/lib/uv-sync'

interface GarmentViewerProps {
  uvSync: UVSyncManager | null
}

export function GarmentViewer({ uvSync }: GarmentViewerProps) {
  return (
    <div className="h-full w-full">
      <Canvas
        camera={{ position: [0, 0.6, 2.8], fov: 38 }}
        gl={{ antialias: true, outputColorSpace: THREE.SRGBColorSpace }}
        shadows
      >
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 6, 4]} intensity={1.4} castShadow />
        <directionalLight position={[-4, 2, -3]} intensity={0.3} />
        <pointLight position={[0, 3, 2]} intensity={0.4} color="#b0d8ff" />

        {/* HDR environment for material reflections */}
        <Environment preset="city" />

        {/* Ground shadow plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.52, 0]} receiveShadow>
          <planeGeometry args={[6, 6]} />
          <shadowMaterial opacity={0.18} />
        </mesh>

        {/* Mannequin + garment */}
        {uvSync ? (
          <MannequinBody texture={uvSync.texture} />
        ) : (
          <MannequinBody texture={null} />
        )}

        {/* Camera controls */}
        <OrbitControls
          enablePan={false}
          target={[0, 0.1, 0]}
          minDistance={1.8}
          maxDistance={5}
          minPolarAngle={Math.PI * 0.1}
          maxPolarAngle={Math.PI * 0.85}
        />
      </Canvas>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Materials
// ---------------------------------------------------------------------------

// Skin-tone matte material for exposed body parts
const SKIN_COLOR = '#c8956c'
const SKIN_PROPS = { roughness: 0.9, metalness: 0.0, color: SKIN_COLOR } as const

// ---------------------------------------------------------------------------
// MannequinBody — human figure wearing the garment
// ---------------------------------------------------------------------------

function MannequinBody({ texture }: { texture: THREE.CanvasTexture | null }) {
  useEffect(() => {
    if (!texture) return
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.needsUpdate = true
  }, [texture])

  const fabricProps = texture
    ? { map: texture, roughness: 0.82, metalness: 0.0 }
    : { color: '#1d4ed8', roughness: 0.82, metalness: 0.0 }

  return (
    <group position={[0, 0, 0]}>
      {/* ── HEAD ──────────────────────────────────────────────── */}
      <mesh position={[0, 1.58, 0]} castShadow>
        <sphereGeometry args={[0.16, 24, 24]} />
        <meshStandardMaterial {...SKIN_PROPS} />
      </mesh>

      {/* ── NECK ─────────────────────────────────────────────── */}
      <mesh position={[0, 1.36, 0]} castShadow>
        <cylinderGeometry args={[0.065, 0.075, 0.18, 16]} />
        <meshStandardMaterial {...SKIN_PROPS} />
      </mesh>

      {/* ── TORSO (garment fabric) ────────────────────────────── */}
      {/* Chest / front */}
      <RoundedBox args={[0.56, 0.72, 0.22]} radius={0.06} smoothness={4} position={[0, 0.78, 0]} castShadow>
        <meshStandardMaterial {...fabricProps} />
      </RoundedBox>
      {/* Waist / lower torso — slightly narrower */}
      <RoundedBox args={[0.48, 0.36, 0.2]} radius={0.05} smoothness={4} position={[0, 0.3, 0]} castShadow>
        <meshStandardMaterial {...fabricProps} />
      </RoundedBox>
      {/* Collar band */}
      <mesh position={[0, 1.18, 0]} castShadow>
        <torusGeometry args={[0.12, 0.025, 10, 28]} />
        <meshStandardMaterial {...fabricProps} />
      </mesh>

      {/* ── SHOULDERS ─────────────────────────────────────────── */}
      <mesh position={[-0.35, 1.08, 0]} castShadow>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial {...fabricProps} />
      </mesh>
      <mesh position={[0.35, 1.08, 0]} castShadow>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial {...fabricProps} />
      </mesh>

      {/* ── SLEEVES (garment fabric) ──────────────────────────── */}
      {/* Left sleeve — angled slightly down */}
      <group position={[-0.48, 0.9, 0]} rotation={[0, 0, Math.PI * 0.08]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.085, 0.075, 0.42, 16]} />
          <meshStandardMaterial {...fabricProps} />
        </mesh>
      </group>
      {/* Right sleeve */}
      <group position={[0.48, 0.9, 0]} rotation={[0, 0, -Math.PI * 0.08]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.085, 0.075, 0.42, 16]} />
          <meshStandardMaterial {...fabricProps} />
        </mesh>
      </group>

      {/* ── FOREARMS (skin) ───────────────────────────────────── */}
      <group position={[-0.52, 0.56, 0]} rotation={[0, 0, Math.PI * 0.06]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.06, 0.055, 0.34, 16]} />
          <meshStandardMaterial {...SKIN_PROPS} />
        </mesh>
      </group>
      <group position={[0.52, 0.56, 0]} rotation={[0, 0, -Math.PI * 0.06]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.06, 0.055, 0.34, 16]} />
          <meshStandardMaterial {...SKIN_PROPS} />
        </mesh>
      </group>

      {/* ── HANDS (skin) ─────────────────────────────────────── */}
      <mesh position={[-0.55, 0.35, 0]} castShadow>
        <sphereGeometry args={[0.055, 14, 14]} />
        <meshStandardMaterial {...SKIN_PROPS} />
      </mesh>
      <mesh position={[0.55, 0.35, 0]} castShadow>
        <sphereGeometry args={[0.055, 14, 14]} />
        <meshStandardMaterial {...SKIN_PROPS} />
      </mesh>

      {/* ── LEGS (neutral dark — shorts/pants not yet modeled) ── */}
      {/* Upper legs */}
      <group position={[-0.14, -0.16, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.1, 0.09, 0.6, 16]} />
          <meshStandardMaterial color="#111827" roughness={0.9} />
        </mesh>
      </group>
      <group position={[0.14, -0.16, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.1, 0.09, 0.6, 16]} />
          <meshStandardMaterial color="#111827" roughness={0.9} />
        </mesh>
      </group>
      {/* Lower legs (skin) */}
      <group position={[-0.14, -0.66, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.075, 0.065, 0.52, 16]} />
          <meshStandardMaterial {...SKIN_PROPS} />
        </mesh>
      </group>
      <group position={[0.14, -0.66, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.075, 0.065, 0.52, 16]} />
          <meshStandardMaterial {...SKIN_PROPS} />
        </mesh>
      </group>
      {/* Shoes */}
      <mesh position={[-0.14, -0.98, 0.04]} castShadow>
        <boxGeometry args={[0.14, 0.1, 0.28]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} />
      </mesh>
      <mesh position={[0.14, -0.98, 0.04]} castShadow>
        <boxGeometry args={[0.14, 0.1, 0.28]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} />
      </mesh>
    </group>
  )
}
