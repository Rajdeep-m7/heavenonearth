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
    deviceSizes: [360, 640, 750, 828, 1080, 1440, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512],
    minimumCacheTTL: 60 * 60 * 24 * 365,
    // Quality hints used by components. The custom loader sets its own quality,
    // but listing them keeps next/image from warning about each one.
    qualities: [75, 80, 82, 85, 90],
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
          // Stops the site (the admin panel especially) being framed elsewhere.
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
      {
        // These list pages read searchParams, so Next renders them per request.
        // A short edge cache makes almost every visit a CDN hit while keeping
        // admin edits no more than ~a minute behind.
        source: "/:section(destinations|packages|stays|gallery|reviews)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=60, stale-while-revalidate=300",
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
