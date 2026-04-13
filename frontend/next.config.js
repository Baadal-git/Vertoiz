const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: false,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '#crypto': path.resolve(
        __dirname,
        'node_modules/@clerk/backend/dist/runtime/browser/crypto.mjs'
      ),
      '#safe-node-apis': path.resolve(
        __dirname,
        'node_modules/@clerk/nextjs/dist/esm/runtime/browser/safe-node-apis.js'
      ),
      '@clerk/shared/buildAccountsBaseUrl': path.resolve(
        __dirname,
        'node_modules/@clerk/shared/dist/runtime/buildAccountsBaseUrl.mjs'
      ),
    }

    return config
  },
}

module.exports = nextConfig
