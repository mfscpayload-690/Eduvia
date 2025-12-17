/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    strict: true,
  },
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.googleusercontent.com",
      },
    ],
  },
}

module.exports = nextConfig
