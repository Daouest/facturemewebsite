import type { NextConfig } from "next";
import { extend } from "zod/mini";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/**",
      },
    ],
  },
  eslint: { ignoreDuringBuilds: true },
  turbopack: { root: __dirname }
};

export default nextConfig;
