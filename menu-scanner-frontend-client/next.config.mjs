// next.config.mjs
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",

  allowedDevOrigins: ["d9b7-203-147-140-218.ngrok-free.app"],

  trailingSlash: false,

  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "**",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.BACKEND_API_URL || "http://localhost:8080"}/api/:path*`,
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
    ];
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
    // Setting staleTimes to 0 disables the Next.js client-side Router Cache.
    // Without this, navigating back from a different layout group (auth → public,
    // public → admin, etc.) restores a frozen React tree WITHOUT remounting, so
    // useEffect([]) never re-runs and pages appear empty.
    // With 0, every back/forward navigation remounts the component and triggers
    // normal data-fetching + snapshot-restore logic on ALL routes.
    staleTimes: {
      dynamic: 0,
      static: 30,
    },
  },
};

export default withNextIntl(nextConfig);
