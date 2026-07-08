import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "prospshop.in" },
    ],
  },
};

export default nextConfig;
