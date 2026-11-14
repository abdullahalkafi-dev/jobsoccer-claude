import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

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

export default withNextIntl(nextConfig);
