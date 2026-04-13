/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverExternalPackages: ['@clerk/backend', '@clerk/shared'],
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: false,
    }
    config.resolve.conditionNames = [
      'edge-light',
      'worker',
      ...config.resolve.conditionNames ?? [],
    ]
    return config
  },
}

module.exports = nextConfig
