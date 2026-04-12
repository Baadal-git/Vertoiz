/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: false,
    serverComponentsExternalPackages: ['@clerk/nextjs', '@clerk/backend']
  },
};

export default nextConfig;
