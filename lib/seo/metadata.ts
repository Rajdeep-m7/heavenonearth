import type { Metadata } from "next";

import { absoluteUrl, siteConfig } from "@/lib/site";

/**
 * Next replaces a parent's `openGraph` object wholesale when a page defines its
 * own, so every page must carry the full set (url, siteName, image...) or it
 * shares as the homepage with no preview image. This is the one place that
 * builds it.
 */

type OgImage = { url: string; alt: string; width?: number; height?: number };

const DEFAULT_IMAGE: OgImage = {
  url: siteConfig.ogImage,
  alt: "Tea slopes and hill houses above a winding Darjeeling road in the Himalaya",
  width: 1376,
  height: 768,
};

/**
 * Cloudinary originals can be many megabytes. Social crawlers want roughly
 * 1200x630, so ask Cloudinary for exactly that instead of the raw upload.
 */
export function ogImageFrom(url: string | undefined, alt: string): OgImage {
  if (!url) return DEFAULT_IMAGE;
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    return {
      url: url.replace("/upload/", "/upload/c_fill,g_auto,w_1200,h_630,f_jpg,q_auto/"),
      alt,
      width: 1200,
      height: 630,
    };
  }
  return { url, alt };
}

type Input = {
  title: string;
  description?: string;
  /** Path beginning with "/", e.g. "/packages/sikkim-mountain-journey". */
  path: string;
  image?: OgImage;
  /** Keep out of search results (still crawlable for link discovery). */
  noindex?: boolean;
};

export function pageMetadata({
  title,
  description,
  path,
  image = DEFAULT_IMAGE,
  noindex,
}: Input): Metadata {
  const shareTitle = `${title} | ${siteConfig.name}`;
  const images = [image];

  return {
    title,
    description,
    alternates: { canonical: path },
    ...(noindex && { robots: { index: false, follow: true } }),
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      siteName: siteConfig.name,
      url: absoluteUrl(path),
      title: shareTitle,
      description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description,
      images: images.map((item) => item.url),
    },
  };
}
