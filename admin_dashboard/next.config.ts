import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: `${process.env.NEXT_PUBLIC_HOSTNAME}`,
        pathname: "/**",
      }
    ],
  },
};

export default nextConfig;
