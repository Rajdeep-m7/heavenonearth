"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { ArrowRight, ChevronLeft, ChevronRight, Phone } from "@/components/ui/Icons";
import type { HeroSlideData } from "@/lib/data/hero";
import { siteConfig } from "@/lib/site";

const AUTOPLAY_MS = 6000;
const SWIPE_PX = 50;

type HeroSliderProps = {
  slides: HeroSlideData[];
  /** Server-rendered pieces handed through so they stay out of this bundle. */
  badge: React.ReactNode;
  rail: React.ReactNode;
};

const isExternal = (href: string) => /^https?:\/\//.test(href);

/**
 * The hero banner. Image layers cross-fade, the copy follows the active slide,
 * and a single slide renders exactly like a static banner (no controls, no
 * timers). Only the first image is eager — it is the LCP element — and the
 * rest are mounted just ahead of being shown.
 */
export function HeroSlider({ slides, badge, rail }: HeroSliderProps) {
  const count = slides.length;
  const multiple = count > 1;

  const [active, setActive] = useState(0);
  const [mounted, setMounted] = useState<ReadonlySet<number>>(() => new Set([0]));
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [hidden, setHidden] = useState(false);
  // The first paint must not animate: the h1 is the LCP candidate.
  const [hasMoved, setHasMoved] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const goTo = useCallback(
    (index: number) => {
      setHasMoved(true);
      setActive(((index % count) + count) % count);
    },
    [count],
  );

  // A slide deleted in the admin can leave `active` out of range after a refresh.
  const current = slides[active] ?? slides[0];

  // Mount the active slide and the one after it, and keep anything already seen.
  useEffect(() => {
    setMounted((previous) => {
      const next = new Set(previous);
      next.add(active);
      if (count > 1) next.add((active + 1) % count);
      return next.size === previous.size ? previous : next;
    });
  }, [active, count]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(query.matches);
    sync();
    query.addEventListener("change", sync);

    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      query.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const playing =
    multiple && !userPaused && !hovering && !focused && !reducedMotion && !hidden;

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => goTo(active + 1), AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [playing, active, goTo]);

  const lines = current.headline.split("\n");

  return (
    <div
      className="relative min-h-[640px] overflow-hidden sm:min-h-[720px] lg:min-h-[804px]"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        const start = touchStartX.current;
        touchStartX.current = null;
        if (!multiple || start === null) return;
        const delta = (event.changedTouches[0]?.clientX ?? start) - start;
        if (Math.abs(delta) >= SWIPE_PX) goTo(active + (delta < 0 ? 1 : -1));
      }}
      {...(multiple && { "aria-roledescription": "carousel" })}
    >
      {slides.map((slide, index) =>
        mounted.has(index) ? (
          <Image
            key={slide._id}
            src={slide.image}
            alt={index === active ? slide.alt : ""}
            aria-hidden={index === active ? undefined : true}
            fill
            // Only the first slide is the LCP image; the others load on demand.
            {...(index === 0 ? { priority: true, fetchPriority: "high" as const } : {})}
            quality={82}
            sizes="100vw"
            className={`object-cover object-center transition-opacity duration-1000 ease-out ${
              index === active ? "opacity-100" : "opacity-0"
            }`}
          />
        ) : null,
      )}

      {/* Legibility scrims, kept subtle so the photograph still reads. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-ink/55 via-ink/15 to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/45 to-transparent"
      />

      <div className="relative mx-auto flex min-h-[640px] max-w-[1400px] flex-col justify-center px-6 pb-40 pt-32 sm:min-h-[720px] sm:px-10 sm:pb-44 lg:min-h-[804px] lg:pb-36">
        <div className="max-w-2xl">
          {badge}

          <p className="mt-8 text-[13px] font-medium uppercase tracking-eyebrow text-white sm:text-sm">
            Your Journey.{" "}
            <span className="text-gold">Our Local Expertise.</span>
          </p>

          {/* Keyed so the copy re-enters each time the slide changes. */}
          <div
            key={current._id}
            className={hasMoved ? "animate-[hoe-rise_0.7s_var(--ease-out-soft)_both]" : undefined}
            {...(multiple && {
              role: "group",
              "aria-roledescription": "slide",
              "aria-label": `${active + 1} of ${count}`,
            })}
          >
            <h1
              id="hero-heading"
              className="mt-5 font-display text-[clamp(2.6rem,7vw,4.2rem)] font-semibold leading-[1.06] text-white text-balance"
            >
              {lines.map((line, index) => (
                <span key={index}>
                  {index > 0 && <br />}
                  {line}
                </span>
              ))}
            </h1>

            {current.subheading && (
              <p className="mt-4 font-display text-xl italic text-gold sm:text-[22px]">
                {current.subheading}
              </p>
            )}
          </div>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
            {current.ctaLabel && current.ctaHref && (
              <HeroCta href={current.ctaHref}>
                {current.ctaLabel}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </HeroCta>
            )}

            <a
              href={`tel:${siteConfig.phone}`}
              className="group inline-flex items-center justify-center gap-3 rounded-full border border-white/70 px-8 py-[18px] text-[17px] font-semibold text-white backdrop-blur-sm transition hover:bg-white hover:text-ink"
            >
              <Phone className="size-[18px]" />
              {siteConfig.phoneDisplay}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </div>

      {multiple && (
        <div className="absolute inset-x-0 bottom-28 z-20">
          <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-6 sm:px-10">
            <ControlButton label="Previous slide" onClick={() => goTo(active - 1)}>
              <ChevronLeft className="size-4" />
            </ControlButton>

            <div className="flex items-center gap-2" role="group" aria-label="Choose slide">
              {slides.map((slide, index) => (
                <button
                  key={slide._id}
                  type="button"
                  onClick={() => goTo(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={index === active ? "true" : undefined}
                  // Tall hit area, slim visible pill.
                  className="group grid h-8 place-items-center px-0.5"
                >
                  <span
                    className={`block h-2 rounded-full transition-all duration-300 ${
                      index === active
                        ? "w-8 bg-gold"
                        : "w-2 bg-white/60 group-hover:bg-white"
                    }`}
                  />
                </button>
              ))}
            </div>

            <ControlButton label="Next slide" onClick={() => goTo(active + 1)}>
              <ChevronRight className="size-4" />
            </ControlButton>

            <ControlButton
              label={userPaused ? "Play slideshow" : "Pause slideshow"}
              onClick={() => setUserPaused((value) => !value)}
            >
              {userPaused ? (
                <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor" aria-hidden>
                  <path d="M8 5v14l11-7z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor" aria-hidden>
                  <path d="M6 5h4v14H6zm8 0h4v14h-4z" />
                </svg>
              )}
            </ControlButton>
          </div>
        </div>
      )}

      {/* Announces slide changes only when the visitor drives them. */}
      {multiple && (
        <p className="sr-only" aria-live={playing ? "off" : "polite"}>
          Slide {active + 1} of {count}
        </p>
      )}

      {rail}
    </div>
  );
}

function HeroCta({ href, children }: { href: string; children: React.ReactNode }) {
  const className =
    "group inline-flex items-center justify-center gap-3 rounded-full bg-teal px-9 py-[18px] text-sm font-semibold uppercase tracking-[0.14em] text-white shadow-lift transition hover:bg-teal-deep";

  return isExternal(href) ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  ) : (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

function ControlButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid size-9 place-items-center rounded-full border border-white/50 bg-white/12 text-white backdrop-blur-md transition hover:bg-white hover:text-ink"
    >
      {children}
    </button>
  );
}
