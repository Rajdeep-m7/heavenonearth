import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.legalName,
    short_name: siteConfig.name,
    description: siteConfig.shortDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#113b42",
    lang: siteConfig.language,
    categories: ["travel", "lifestyle"],
    icons: [
      {
        src: "/images/logo-mark.png",
        sizes: "128x127",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/images/logo.png",
        sizes: "634x640",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
