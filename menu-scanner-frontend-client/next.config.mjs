// next.config.mjs
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",

  allowedDevOrigins: ["d9b7-203-147-140-218.ngrok-free.app"],

  trailingSlash: false,

  images: {
    // Disable Next.js image optimization proxy so images load directly from
    // their source URLs. Without this, /_next/image tries to download and
    // re-encode every remote image, which times out for external CDN images
    // (e.g. Unsplash premium photos) that require auth tokens or are slow.
    // Images still benefit from browser-level caching via their original CDN.
    unoptimized: true,
  },

  async rewrites() {
    const backendUrl = process.env.BACKEND_API_URL || "http://localhost:8080";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: "/ws/:path*",
        destination: `${backendUrl}/ws/:path*`,
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
  },

};

export default withNextIntl(nextConfig);
