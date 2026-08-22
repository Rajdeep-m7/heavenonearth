import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Heaven on Earth Admin" },
  // Belt and braces alongside the Disallow in robots.txt.
  robots: { index: false, follow: false, nocache: true },
};

/** Nothing under /admin may ever be cached or prerendered. */
export const dynamic = "force-dynamic";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
