import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    domains: ["lh3.googleusercontent.com", "static.vecteezy.com"],
  },
};

export default nextConfig;
