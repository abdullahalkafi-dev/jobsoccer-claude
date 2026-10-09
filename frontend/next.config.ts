import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: process.env.NEXT_PUBLIC_HOSTNAME || "74.208.193.37",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_HOSTNAME || "74.208.193.37",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.jobsoccer.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "jobsoccer.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.jobsoccer.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
