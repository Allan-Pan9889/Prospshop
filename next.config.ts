import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "m.media-amazon.com" },
      { protocol: "https", hostname: "tradexelh.com" },
      { protocol: "https", hostname: "www.tradexelh.com" },
      { protocol: "https", hostname: "prospshop.in" },
    ],
  },
};

export default nextConfig;
