import type { Metadata } from "next";
import Link from "next/link";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "Page not found",
  description: "That page has moved or no longer exists.",
  robots: { index: false, follow: true },
};

/** Root-level so unmatched URLs get the site chrome too, not Next's bare 404. */
export default function NotFound() {
  return (
    <>
      <Header />
      <main id="main" className="bg-mint">
        <section className="mx-auto flex min-h-[70vh] max-w-[720px] flex-col items-center justify-center px-6 py-32 text-center">
          <p className="text-[13px] font-medium uppercase tracking-eyebrow text-teal">
            Error 404
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.2rem,6vw,3.4rem)] font-semibold leading-[1.1] text-ink">
            This trail leads nowhere.
          </h1>
          <p className="mt-5 text-[16px] leading-relaxed text-slate">
            The page you were looking for has moved or no longer exists. Try one
            of these instead.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link
              href="/"
              className="rounded-full bg-teal px-8 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-teal-deep"
            >
              Back to home
            </Link>
            <Link
              href="/packages"
              className="rounded-full border border-ink/20 px-8 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-ink transition hover:bg-ink hover:text-white"
            >
              Browse packages
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
