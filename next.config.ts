import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["mysql2"],
  compress: false,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
