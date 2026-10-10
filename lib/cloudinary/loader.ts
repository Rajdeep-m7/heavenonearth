"use client";

/**
 * Custom next/image loader.
 *
 * Points every image at Cloudinary's CDN instead of Vercel's optimizer, which
 * means: Vercel's image-optimization quota is never consumed, image bandwidth
 * is served by Cloudinary, and f_auto/q_auto pick format and quality per image
 * and per browser.
 *
 * `src` may be either a Cloudinary publicId ("heavenonearth/packages/abc") or a
 * local /images/... path, so the site keeps working before any asset has been
 * migrated to Cloudinary.
 */
export default function cloudinaryLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  // Local public/ assets and absolute URLs are served as-is. The `w` query is
  // ignored by the static file server but keeps each srcset entry distinct and
  // satisfies next/image's "loader must implement width" check.
  if (src.startsWith("/") || src.startsWith("http")) {
    return `${src}${src.includes("?") ? "&" : "?"}w=${width}`;
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return src;

  const transforms = [
    "f_auto",
    `q_${quality ?? "auto"}`,
    `w_${width}`,
    "c_limit",
    "dpr_auto",
  ].join(",");

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${src}`;
}
