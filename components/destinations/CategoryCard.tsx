import Image from "next/image";
import Link from "next/link";

import { ArrowRight } from "@/components/ui/Icons";
import type { CategorySummary } from "@/lib/queries/destinations";

export function CategoryCard({ category }: { category: CategorySummary }) {
  const image = category.thumbnail?.publicId ?? category.thumbnail?.url ?? "";

  return (
    <Link
      href={`/destinations/${category.slug}`}
      className="group flex flex-col overflow-hidden rounded-[26px] bg-white shadow-card transition duration-500 hover:-translate-y-2 hover:shadow-lift"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-teal to-ink">
        {image ? (
          <Image
            src={image}
            alt={category.thumbnail?.alt || category.name}
            fill
            sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 380px"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="grid size-full place-items-center">
            <span className="font-display text-3xl font-semibold text-white/50">
              {category.name}
            </span>
          </div>
        )}
        <span className="absolute right-4 top-4 rounded-full bg-white/95 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink shadow-sm">
          {category.packageCount} package{category.packageCount === 1 ? "" : "s"}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-7">
        <h3 className="font-display text-[26px] font-medium text-charcoal">
          {category.name}
        </h3>
        {(category.tagline || category.description) && (
          <p className="mt-3 line-clamp-2 text-[15px] leading-relaxed text-slate">
            {category.tagline || category.description}
          </p>
        )}

        <div className="mt-auto pt-7">
          <div className="flex items-center justify-between border-t border-black/10 pt-5 text-[15px] font-medium text-teal-deep transition group-hover:text-ink">
            <span>Explore Region</span>
            <ArrowRight className="size-5 transition-transform group-hover:translate-x-1.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
