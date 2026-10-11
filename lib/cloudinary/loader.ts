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
  // Local public/ assets (e.g. /images/...) are served as-is with a width query for cache busting.
  if (src.startsWith("/") && !src.startsWith("//")) {
    return `${src}${src.includes("?") ? "&" : "?"}w=${width}`;
  }

  // Special handling for Unsplash images: deliver crystal-clear, high-DPI (Retina) imagery
  if (src.includes("images.unsplash.com")) {
    try {
      const url = new URL(src);
      // For sharp display on modern high-DPI (Retina, 2x, 3x) mobile and desktop screens,
      // request at least 2x the slot width with a floor of 1200px and ceiling of 2400px.
      const retinaWidth = Math.min(Math.max(width * 2, 1200), 2400);
      url.searchParams.set("w", String(retinaWidth));
      url.searchParams.set("auto", "format");
      url.searchParams.set("fit", "crop");
      // Never below 85: Unsplash's JPEG at lower settings shows banding in skies.
      url.searchParams.set("q", String(Math.max(quality ?? 0, 85)));
      return url.toString();
    } catch {
      return src;
    }
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return src;

  // Extract public ID if a full Cloudinary URL is passed
  let publicId = src;
  const cloudinaryUrlRegex =
    /^https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/(?:(?:[a-z]_[^/]+,?)+\/)?(?:v\d+\/)?(.+)$/;
  const match = src.match(cloudinaryUrlRegex);
  if (match) {
    publicId = match[1];
  } else if (src.startsWith("http://") || src.startsWith("https://")) {
    // Other external URLs pass through cleanly without degrading width
    return src;
  }

  // Always q_auto:best. Components pass numeric `quality` hints (80, 82) that
  // were written for Next's own optimizer; honouring them here would pin
  // Cloudinary to a lower quality than "best" and visibly soften photos.
  // The width is doubled for retina screens; c_limit never upscales, so a small
  // original is delivered as-is rather than stretched. `dpr_auto` is left out:
  // it only acts on client hints, which browsers rarely send, and the explicit
  // w_ above already covers high-density displays.
  // Capped at 2400: no screen needs more, and every extra pixel is Cloudinary
  // bandwidth. (The Unsplash path above uses the same ceiling.)
  const targetWidth = Math.min(Math.max(width * 2, 800), 2400);

  const transforms = [
    "f_auto",
    "q_auto:best",
    `w_${targetWidth}`,
    "c_limit",
  ].join(",");

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transforms}/${publicId}`;
}
