"use client";

import { useCallback, useEffect, useRef, useState, Children } from "react";

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
 * enhancement on top. On mobile, it auto-slides and shows pagination dots.
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
  
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  const count = Children.count(children);

  const sync = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setOverflowing(max > 8);
    setAtStart(el.scrollLeft <= 8);
    setAtEnd(el.scrollLeft >= max - 8);
    
    setIsMobile(window.innerWidth < 768);

    if (count > 0 && max > 8) {
      const percentage = el.scrollLeft / max;
      let index = Math.round(percentage * (count - 1));
      if (index < 0) index = 0;
      if (index >= count) index = count - 1;
      setActiveIndex(index);
    } else {
      setActiveIndex(0);
    }
  }, [count]);

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

  // Auto-slide effect for mobile
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const startAutoSlide = () => {
      interval = setInterval(() => {
        if (window.innerWidth >= 768) return; // Only auto-slide on mobile screens
        
        const el = ref.current;
        if (!el) return;
        
        const max = el.scrollWidth - el.clientWidth;
        if (max <= 8) return; // Content fits, no need to scroll

        if (el.scrollLeft >= max - 8) {
          // If at the end, smoothly rewind to the start
          el.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          // Scroll forward by roughly one card width
          el.scrollBy({ left: el.clientWidth * 0.82, behavior: "smooth" });
        }
      }, 3500); // 3.5 seconds
    };

    startAutoSlide();

    const pause = () => clearInterval(interval);
    const resume = () => {
      clearInterval(interval);
      startAutoSlide();
    };

    const el = ref.current;
    if (el) {
      el.addEventListener("touchstart", pause, { passive: true });
      el.addEventListener("touchend", resume, { passive: true });
      el.addEventListener("mouseenter", pause);
      el.addEventListener("mouseleave", resume);
    }

    return () => {
      clearInterval(interval);
      if (el) {
        el.removeEventListener("touchstart", pause);
        el.removeEventListener("touchend", resume);
        el.removeEventListener("mouseenter", pause);
        el.removeEventListener("mouseleave", resume);
      }
    };
  }, []);

  const scrollBy = (direction: -1 | 1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: direction * Math.round(el.clientWidth * 0.82), behavior: "smooth" });
  };

  const showControls = !hideControlsWhenFull || overflowing;

  return (
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

      {/* Desktop prev/next controls */}
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

      {/* Mobile dots pagination */}
      {showControls && isMobile && count > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2 md:hidden">
          {Array.from({ length: count }).map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => {
                const el = ref.current;
                if (!el) return;
                const max = el.scrollWidth - el.clientWidth;
                const target = (max / (count - 1)) * i;
                el.scrollTo({ left: target, behavior: "smooth" });
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                activeIndex === i
                  ? tone === "gold" ? "w-6 bg-gold" : "w-6 bg-teal"
                  : "w-2 bg-black/15"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
