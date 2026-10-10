import type { Metadata, Viewport } from "next";
import { Playfair_Display, Poppins } from "next/font/google";

import "./globals.css";
import { siteConfig } from "@/lib/site";

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
  // Variable font: one file per style instead of a file per weight.
  style: ["normal", "italic"],
  preload: true,
});

const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | Himalayan Tour Packages, Homestays & Destination Experts`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.legalName, url: siteConfig.url }],
  creator: siteConfig.legalName,
  publisher: siteConfig.legalName,
  category: "travel",
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.shortDescription,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1376,
        height: 768,
        alt: "Tea slopes and hill houses above a winding Darjeeling road in the Himalaya",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.shortDescription,
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [{ url: "/images/logo-mark.png", type: "image/png" }],
    apple: [{ url: "/images/logo-mark.png" }],
  },
  manifest: "/manifest.webmanifest",
  formatDetection: { telephone: true, address: true, email: true },
  other: {
    "geo.region": "IN-WB",
    "geo.placename": siteConfig.address.locality,
    "geo.position": `${siteConfig.geo.latitude};${siteConfig.geo.longitude}`,
    ICBM: `${siteConfig.geo.latitude}, ${siteConfig.geo.longitude}`,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#113b42" },
    { media: "(prefers-color-scheme: dark)", color: "#113b42" },
  ],
  width: "device-width",
  initialScale: 1,
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang={siteConfig.language} className={`${playfair.variable} ${poppins.variable}`}>
      {/* Chrome lives in app/(site)/layout.tsx so /admin does not inherit it. */}
      <body className="min-h-screen bg-white antialiased">{children}</body>
    </html>
  );
}
