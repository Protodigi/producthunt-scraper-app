/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['ph-files.imgix.net', 'ph-avatars.imgix.net'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.producthunt.com',
      },
      {
        protocol: 'https',
        hostname: '**.imgix.net',
      },
    ],
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig