"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";

import { ArrowRight, Search } from "@/components/ui/Icons";

const suggestions = [
  "Darjeeling",
  "Sikkim",
  "Kalimpong",
  "Dooars",
  "Kurseong",
  "Lava & Lolegaon",
];

/**
 * The overlapping search card that straddles the hero and the section below.
 * Submits to /destinations so the SearchAction in the structured data resolves
 * to a real, crawlable results URL.
 */
export function SearchPanel() {
  const router = useRouter();
  const inputId = useId();
  const listId = `${inputId}-suggestions`;
  const [query, setQuery] = useState("");

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    router.push(
      trimmed ? `/destinations?q=${encodeURIComponent(trimmed)}` : "/destinations",
    );
  };

  return (
    // The mint band starts at the foot of the hero; the card itself is pulled
    // up so it straddles the seam, exactly as in the design.
    <div className="relative z-30 bg-mint px-6 sm:px-10">
      <div className="mx-auto -mt-24 max-w-[1200px] rounded-[28px] bg-white p-6 shadow-lift sm:rounded-[32px] sm:p-8">
        <form onSubmit={onSubmit} role="search">
          <label
            htmlFor={inputId}
            className="block text-[12px] font-semibold uppercase tracking-eyebrow text-ink"
          >
            Where do you want to go?
          </label>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                aria-hidden
                className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-slate"
              />
              <input
                id={inputId}
                name="q"
                type="search"
                list={listId}
                autoComplete="off"
                enterKeyHint="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="e.g., Darjeeling, Sikkim, Kalimpong..."
                className="h-[58px] w-full rounded-full border border-black/10 bg-white pl-14 pr-5 text-[15px] text-ink outline-none transition placeholder:text-slate/70 focus:border-teal"
              />
              <datalist id={listId}>
                {suggestions.map((item) => (
                  <option key={item} value={item} />
                ))}
              </datalist>
            </div>

            <button
              type="submit"
              className="group inline-flex h-[58px] items-center justify-center gap-3 rounded-full bg-teal px-9 text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-teal-deep"
            >
              Search
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
