import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const withSerwist = withSerwistInit({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  reloadOnOnline: true,
});

const nextConfig: NextConfig = {
  allowedDevOrigins: ['http://165.101.214.108', 'http://165.101.214.108:8088'],
  reactCompiler: true,
  compress: true, // Explicitly compress responses with Gzip/Brotli for performance
  generateEtags: true, // Cache static files efficiently

  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default withSerwist(nextConfig);