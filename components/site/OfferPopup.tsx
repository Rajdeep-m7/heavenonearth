"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { ArrowRight, Close } from "@/components/ui/Icons";
import type { OfferPopupData } from "@/lib/queries/offer";

const DAY_MS = 24 * 60 * 60 * 1000;

const isExternal = (href: string) => /^https?:\/\//.test(href);

/**
 * "Every visit" means every full page load. Client-side navigation keeps this
 * module alive, so without the flag the popup would reopen on each page change.
 */
let shownThisPageLoad = false;

/** Storage is blocked in some private modes; a popup must never throw over that. */
function safely<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

/**
 * True when this visitor should be shown this version of the offer now.
 * The version is part of the key, so editing the offer in the admin shows it
 * again to people who had already dismissed the old one.
 */
function shouldShow(offer: OfferPopupData): boolean {
  const now = Date.now();
  if (offer.startsAt && now < Date.parse(offer.startsAt)) return false;
  if (offer.endsAt && now > Date.parse(offer.endsAt)) return false;

  const key = `hoe-offer:${offer.version}`;
  if (offer.frequency === "session") {
    return !safely(() => sessionStorage.getItem(key), null);
  }
  if (offer.frequency === "day") {
    const last = Number(safely(() => localStorage.getItem(key), null));
    return !last || now - last > DAY_MS;
  }
  return !shownThisPageLoad;
}

function remember(offer: OfferPopupData) {
  const key = `hoe-offer:${offer.version}`;
  shownThisPageLoad = true;
  if (offer.frequency === "session") {
    safely(() => sessionStorage.setItem(key, "1"), undefined);
  } else if (offer.frequency === "day") {
    safely(() => localStorage.setItem(key, String(Date.now())), undefined);
  }
}

/** Mounted once in the site layout; decides for itself whether this page qualifies. */
export function OfferPopup({ offer }: { offer: OfferPopupData }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imageReady, setImageReady] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocusTo = useRef<Element | null>(null);

  const eligible = offer.showOn === "all" || pathname === "/";

  useEffect(() => {
    if (!eligible || !shouldShow(offer)) return;

    const timer = window.setTimeout(() => {
      returnFocusTo.current = document.activeElement;
      remember(offer);
      setOpen(true);
    }, offer.delaySeconds * 1000);

    return () => window.clearTimeout(timer);
  }, [eligible, offer, pathname]);

  const close = useCallback(() => {
    setOpen(false);
    setCopied(false);
    if (returnFocusTo.current instanceof HTMLElement) returnFocusTo.current.focus();
  }, []);

  // Modal behaviour: scroll lock, Escape, focus in, and Tab kept inside.
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  // Navigating away (to the offer's link, say) must not leave it open.
  useEffect(() => setOpen(false), [pathname]);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(offer.couponCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be unavailable; the code is still on screen to read.
    }
  };

  if (!open) return null;

  const hasCta = Boolean(offer.ctaLabel && offer.ctaHref);
  const withImage = Boolean(offer.image);
  const ctaClass =
    "group inline-flex items-center justify-center gap-3 rounded-full bg-teal px-8 py-4 text-sm font-semibold uppercase tracking-[0.14em] text-white shadow-lift transition hover:bg-teal-deep";

  return (
    <div
      className="fixed inset-0 z-[90] grid place-items-center overflow-y-auto bg-ink/70 p-4 backdrop-blur-sm animate-[hoe-rise_0.4s_var(--ease-out-soft)_both]"
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="offer-popup-title"
        className={`relative my-auto w-full max-w-[460px] overflow-hidden rounded-[28px] shadow-lift ${
          withImage ? "bg-ink" : "bg-white"
        }`}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={close}
          aria-label="Close offer"
          className="absolute right-3 top-3 z-10 grid size-10 place-items-center rounded-full bg-white/90 text-ink shadow-card transition hover:bg-gold"
        >
          <Close className="size-5" />
        </button>

        {offer.image && (
          // The photo fills the whole card and the text sits on top of it, with
          // a gradient behind the copy so it stays readable on any photo.
          <>
            <Image
              src={offer.image.src}
              alt={offer.image.alt}
              fill
              loading="eager"
              sizes="460px"
              onLoad={() => setImageReady(true)}
              className={`object-cover transition-opacity duration-500 ${
                imageReady ? "opacity-100" : "opacity-0"
              }`}
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/60 to-ink/10"
            />
          </>
        )}

        <div
          className={`relative p-7 text-center sm:p-9 ${
            withImage
              ? "flex min-h-[min(540px,calc(100vh-2rem))] flex-col justify-end pt-24"
              : ""
          }`}
        >
          {offer.badge && (
            <p className="mx-auto inline-block rounded-full bg-gold px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-ink">
              {offer.badge}
            </p>
          )}

          <h2
            id="offer-popup-title"
            className={`mt-4 font-display text-[28px] font-semibold leading-tight text-balance sm:text-[32px] ${
              withImage
                ? "text-white [text-shadow:0_2px_14px_rgb(0_0_0/0.4)]"
                : "text-ink"
            }`}
          >
            {offer.title}
          </h2>

          {offer.description && (
            <p
              className={`mt-3 text-[15px] leading-relaxed text-pretty ${
                withImage ? "text-white/90" : "text-slate"
              }`}
            >
              {offer.description}
            </p>
          )}

          {offer.couponCode && (
            <button
              type="button"
              onClick={copyCode}
              className={`mx-auto mt-6 inline-flex items-center gap-3 rounded-2xl border-2 border-dashed px-5 py-3 transition ${
                withImage
                  ? "border-white/70 bg-white/15 backdrop-blur-sm hover:bg-white/25"
                  : "border-teal/60 bg-mint hover:bg-ice"
              }`}
            >
              <span
                className={`font-mono text-lg font-bold tracking-[0.18em] ${
                  withImage ? "text-white" : "text-ink"
                }`}
              >
                {offer.couponCode}
              </span>
              <span
                className={`text-[12px] font-semibold uppercase tracking-[0.1em] ${
                  withImage ? "text-gold" : "text-teal-deep"
                }`}
              >
                {copied ? "Copied" : "Tap to copy"}
              </span>
            </button>
          )}

          <div className="mt-6 flex flex-col items-center gap-3">
            {hasCta &&
              (isExternal(offer.ctaHref) ? (
                <a
                  href={offer.ctaHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={close}
                  className={ctaClass}
                >
                  {offer.ctaLabel}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </a>
              ) : (
                <Link href={offer.ctaHref} onClick={close} className={ctaClass}>
                  {offer.ctaLabel}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              ))}

            <button
              type="button"
              onClick={close}
              className={`text-[13px] font-medium underline-offset-4 hover:underline ${
                withImage ? "text-white/80 hover:text-white" : "text-slate hover:text-ink"
              }`}
            >
              No thanks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
