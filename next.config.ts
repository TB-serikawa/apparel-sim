import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Ensure three.js and related packages are transpiled correctly
  transpilePackages: ['three'],
  webpack(config) {
    // Allow importing GLTF/GLB as URLs via ?url suffix
    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      type: 'asset/resource',
    })
    return config
  },
}

export default nextConfig
