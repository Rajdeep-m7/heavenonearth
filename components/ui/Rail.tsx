"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ChevronLeft, ChevronRight } from "@/components/ui/Icons";

type RailProps = {
  children: React.ReactNode;
  /** Accessible name for the scrollable region. */
  label: string;
  className?: string;
  /** Visual treatment of the prev/next buttons. */
  tone?: "teal" | "gold" | "light";
  /** Hide the arrows once every card fits on screen. */
  hideControlsWhenFull?: boolean;
};

const toneClasses: Record<NonNullable<RailProps["tone"]>, string> = {
  teal: "bg-ink text-white hover:bg-teal",
  gold: "bg-gold text-ink hover:bg-gold-deep",
  light: "bg-white/85 text-ink hover:bg-white",
};

/**
 * Horizontal scroll rail with snap points. Native scrolling keeps touch,
 * trackpad and keyboard behaviour intact; the arrows are progressive
 * enhancement on top.
 */
export function Rail({
  children,
  label,
  className = "",
  tone = "teal",
  hideControlsWhenFull = true,
}: RailProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [overflowing, setOverflowing] = useState(false);

  const sync = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setOverflowing(max > 8);
    setAtStart(el.scrollLeft <= 8);
    setAtEnd(el.scrollLeft >= max - 8);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    sync();
    el.addEventListener("scroll", sync, { passive: true });
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", sync);
      observer.disconnect();
    };
  }, [sync]);

  const scrollBy = (direction: -1 | 1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: direction * Math.round(el.clientWidth * 0.82), behavior: "smooth" });
  };

  const showControls = !hideControlsWhenFull || overflowing;

  return (
    /*
      `overflow-x-clip` is load-bearing, not cosmetic.

      The inner scroller already clips its own paint, but Chrome still counts
      its scrollable content in every ancestor's scrollWidth — which pushed
      document.scrollWidth to 815px on a 360px viewport. Desktop browsers hide
      that (the page refuses to scroll sideways), but a real phone widens the
      layout viewport to fit and zooms the whole page out: the classic
      "site isn't responsive" symptom.

      `clip` rather than `hidden` because clip leaves the vertical axis
      `visible`, so card hover-lift and drop shadows still escape the box.
    */
    <div className="relative overflow-x-clip">
      <div
        ref={ref}
        role="group"
        aria-label={label}
        tabIndex={0}
        className={`rail flex snap-x snap-mandatory overflow-x-auto scroll-smooth ${className}`}
      >
        {children}
      </div>

      {showControls && (
        <>
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            disabled={atStart}
            aria-label={`Scroll ${label} backwards`}
            className={`absolute left-0 top-1/2 z-20 hidden -translate-y-1/2 place-items-center rounded-full p-3 shadow-lift transition disabled:pointer-events-none disabled:opacity-0 md:grid ${toneClasses[tone]}`}
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollBy(1)}
            disabled={atEnd}
            aria-label={`Scroll ${label} forwards`}
            className={`absolute right-0 top-1/2 z-20 hidden -translate-y-1/2 place-items-center rounded-full p-3 shadow-lift transition disabled:pointer-events-none disabled:opacity-0 md:grid ${toneClasses[tone]}`}
          >
            <ChevronRight className="size-5" />
          </button>
        </>
      )}
    </div>
  );
}
