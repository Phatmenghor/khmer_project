/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",

  allowedDevOrigins: ["d9b7-203-147-140-218.ngrok-free.app"],

  trailingSlash: false,

  images: {
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

export default nextConfig;
