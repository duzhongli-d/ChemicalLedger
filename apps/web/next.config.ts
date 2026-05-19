import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/index.ts");

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
  },
  // Allow browser extensions and external tools to access dev resources (HMR, etc.)
  allowedDevOrigins: ["ai001.oidcs.com"],
};

export default withNextIntl(nextConfig);
