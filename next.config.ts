import type { NextConfig } from "next";
import { extend } from "zod/mini";

const nextConfig: NextConfig = {
  images: {
    // Enable Next.js image optimization for automatic format conversion (WebP/AVIF) and responsive sizing
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/**",
      },
    ],
  },
  // Note: Consider setting to false to catch issues during development
  eslint: { ignoreDuringBuilds: true },
  turbopack: { root: __dirname },
  
  // Enable gzip compression for better performance
  compress: true,
  
  // Recommended: Enable React strict mode to catch potential issues
  reactStrictMode: true,
  
  // Security: Remove X-Powered-By header
  poweredByHeader: false,
};

export default nextConfig;
