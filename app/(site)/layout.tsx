import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

/**
 * Chrome for the public site only.
 *
 * This lives in a route group rather than the root layout so /admin does not
 * inherit the marketing header and footer — they were previously rendering
 * over the admin panel.
 */
export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
