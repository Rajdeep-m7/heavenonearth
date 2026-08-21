import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets a production build run side by side with `next dev` without the two
  // clobbering each other's .next directory.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    // Serve every image from Cloudinary's CDN instead of Vercel's optimizer:
    // Vercel's image-optimization quota is never touched, and image bandwidth
    // is billed to Cloudinary's free tier rather than ours.
    loader: "custom",
    loaderFile: "./lib/cloudinary/loader.ts",
    // Deliberately few widths — each one is a distinct Cloudinary derived
    // asset, and a long list is what burns a free transformation allowance.
    deviceSizes: [360, 640, 828, 1080, 1440, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365,
  },
  // Kept out of the bundler: these are Node-only and must not be traced into
  // client or edge chunks.
  serverExternalPackages: ["mongoose", "bcryptjs", "cloudinary"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
