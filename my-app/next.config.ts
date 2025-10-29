import type { NextConfig } from "next";
import { extend } from "zod/mini";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // <-- ici
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000", 
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
