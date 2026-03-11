'use client'

// GarmentViewer renders the Three.js scene via React Three Fiber.
//
// While actual .glb garment files are not yet in the repo, it renders a
// placeholder mesh (rounded box) so the UV texture sync pipeline can be
// validated visually.  Replace <PlaceholderMesh> with <GarmentModel> once
// .glb files are available.

import { useEffect, useRef } from 'react'
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
        camera={{ position: [0, 0.5, 2.5], fov: 40 }}
        gl={{ antialias: true, outputColorSpace: THREE.SRGBColorSpace }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[3, 5, 3]} intensity={1.2} castShadow />
        <directionalLight position={[-3, 2, -3]} intensity={0.4} />

        {/* HDR environment for material reflections */}
        <Environment preset="city" />

        {/* Garment mesh */}
        {uvSync ? (
          <GarmentMesh texture={uvSync.texture} />
        ) : (
          <LoadingIndicator />
        )}

        {/* Camera controls */}
        <OrbitControls
          enablePan={false}
          minDistance={1.5}
          maxDistance={5}
          minPolarAngle={Math.PI * 0.1}
          maxPolarAngle={Math.PI * 0.9}
        />
      </Canvas>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Garment mesh — placeholder until real .glb models are added
// ---------------------------------------------------------------------------

function GarmentMesh({ texture }: { texture: THREE.CanvasTexture }) {
  const meshRef = useRef<THREE.Mesh>(null)

  // Rotate texture to match GLTF UV conventions
  useEffect(() => {
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.needsUpdate = true
  }, [texture])

  return (
    <group>
      {/* Body */}
      <RoundedBox ref={meshRef} args={[0.9, 1.1, 0.15]} radius={0.04} smoothness={4} position={[0, 0, 0]}>
        <meshStandardMaterial map={texture} roughness={0.85} metalness={0.0} />
      </RoundedBox>
      {/* Left sleeve */}
      <RoundedBox args={[0.35, 0.5, 0.12]} radius={0.03} position={[-0.63, 0.35, 0]}>
        <meshStandardMaterial map={texture} roughness={0.85} metalness={0.0} />
      </RoundedBox>
      {/* Right sleeve */}
      <RoundedBox args={[0.35, 0.5, 0.12]} radius={0.03} position={[0.63, 0.35, 0]}>
        <meshStandardMaterial map={texture} roughness={0.85} metalness={0.0} />
      </RoundedBox>

      {/* "Placeholder" label — remove when real GLB is in place */}
      <PlaceholderLabel />
    </group>
  )
}

function PlaceholderLabel() {
  return null // Three.js text requires @react-three/drei <Text>; add when needed
}

function LoadingIndicator() {
  return (
    <RoundedBox args={[0.9, 1.1, 0.15]} radius={0.04}>
      <meshStandardMaterial color="#1f2937" roughness={1} />
    </RoundedBox>
  )
}
