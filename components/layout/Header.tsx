"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { ArrowRight, Close, Menu, Phone } from "@/components/ui/Icons";
import { navLinks, siteConfig } from "@/lib/site";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  // Lock the page behind the drawer, and restore whatever was there before.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Escape closes the drawer — expected of anything modal.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-5">
      {/*
        Three-column grid on desktop so the nav is centred against the pill
        itself, not against whatever happens to sit either side of it.
      */}
      <div
        className={`pointer-events-auto mx-auto flex max-w-[1400px] items-center gap-3 rounded-full border px-3 py-2.5 transition-colors duration-500 sm:px-4 lg:grid lg:grid-cols-[1fr_auto_1fr] ${
          scrolled
            ? "border-white/25 bg-ink/85 shadow-lift backdrop-blur-xl"
            : "border-white/20 bg-ink/35 backdrop-blur-md"
        }`}
      >
        <Link
          href="/"
          aria-label={`${siteConfig.legalName} — home`}
          className="w-fit shrink-0 rounded-full bg-white/95 p-0.5 ring-1 ring-white/60 transition hover:scale-105"
        >
          <Image
            src="/images/logo.png"
            alt=""
            width={634}
            height={640}
            priority
            sizes="52px"
            className="size-[42px] rounded-full object-cover sm:size-[48px]"
          />
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-7 xl:gap-10">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={`whitespace-nowrap text-[15px] font-medium transition-colors ${
                      active ? "text-gold" : "text-white/90 hover:text-gold"
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0 lg:justify-end">
          {/* Full number once there is room; icon-only on small screens. */}
          <a
            href={`tel:${siteConfig.phone}`}
            className="group hidden items-center gap-2.5 rounded-full bg-gold px-6 py-2.5 text-[15px] font-semibold text-ink transition hover:bg-gold-deep md:inline-flex"
          >
            <Phone className="size-[17px]" />
            <span className="whitespace-nowrap">{siteConfig.phoneDisplay}</span>
            <ArrowRight
              aria-hidden
              className="size-4 transition-transform group-hover:translate-x-1"
            />
          </a>

          <a
            href={`tel:${siteConfig.phone}`}
            aria-label={`Call ${siteConfig.phoneDisplay}`}
            className="grid size-11 place-items-center rounded-full bg-gold text-ink transition hover:bg-gold-deep md:hidden"
          >
            <Phone className="size-[18px]" />
          </a>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid size-11 place-items-center rounded-full border border-white/40 text-white transition hover:bg-white/10 lg:hidden"
          >
            {open ? <Close className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Drawer for anything below the desktop breakpoint */}
      <div
        id="mobile-nav"
        hidden={!open}
        className="pointer-events-auto mx-auto mt-2 max-h-[calc(100dvh-7rem)] max-w-[1400px] overflow-y-auto rounded-3xl border border-white/20 bg-ink/95 p-5 shadow-lift backdrop-blur-xl sm:p-6 lg:hidden"
      >
        <nav aria-label="Mobile">
          <ul className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={pathname === link.href ? "page" : undefined}
                  className={`block rounded-2xl px-4 py-3 text-lg font-medium transition ${
                    pathname === link.href
                      ? "bg-white/10 text-gold"
                      : "text-white/90 hover:bg-white/10"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <a
          href={`tel:${siteConfig.phone}`}
          className="mt-5 flex items-center justify-center gap-2.5 rounded-full bg-gold px-5 py-3.5 font-semibold text-ink"
        >
          <Phone className="size-[18px]" />
          {siteConfig.phoneDisplay}
        </a>
      </div>
    </header>
  );
}
