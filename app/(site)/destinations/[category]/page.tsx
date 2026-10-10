import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EmptyGrid } from "@/components/site/EmptyGrid";
import { PackageCard } from "@/components/packages/PackageCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { ArrowRight } from "@/components/ui/Icons";
import {
  getAllCategorySlugs,
  getCategoryBySlug,
} from "@/lib/queries/destinations";
import { ogImageFrom, pageMetadata } from "@/lib/seo/metadata";
import { buildCategoryGraph } from "@/lib/seo/schema";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getAllCategorySlugs();
  return slugs.map(({ slug: category }) => ({ category }));
}

type Params = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { category: slug } = await params;
  const data = await getCategoryBySlug(slug);
  if (!data) return {};

  const title = data.category.seo?.title || data.category.name;
  const description =
    data.category.seo?.description ||
    data.category.tagline ||
    data.category.description;

  const cover = data.category.heroImage ?? data.category.thumbnail;

  return pageMetadata({
    title,
    description,
    path: `/destinations/${slug}`,
    image: ogImageFrom(cover?.url, cover?.alt || data.category.name),
  });
}

export default async function DestinationDetailPage({ params }: Params) {
  const { category: slug } = await params;
  const data = await getCategoryBySlug(slug);
  if (!data) notFound();

  const { category, packages } = data;
  const heroImage =
    category.heroImage?.publicId ??
    category.thumbnail?.publicId ??
    category.heroImage?.url ??
    category.thumbnail?.url ??
    "";

  return (
    <div className="bg-mint">
      <JsonLd id="destination-jsonld" data={buildCategoryGraph(data)} />

      <section className="relative min-h-[420px] overflow-hidden sm:min-h-[500px]">
        {heroImage && (
          <Image
            src={heroImage}
            alt={category.heroImage?.alt || category.thumbnail?.alt || category.name}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        )}
        <div aria-hidden className="absolute inset-0 bg-ink/55" />
        <div className="relative mx-auto flex min-h-[420px] max-w-[1000px] flex-col items-center justify-center px-6 text-center sm:min-h-[500px]">
          <Link
            href="/destinations"
            className="text-[13px] font-medium uppercase tracking-[0.14em] text-gold hover:underline"
          >
            &larr; All Destinations
          </Link>
          <h1 className="mt-4 font-display text-[clamp(2.4rem,6vw,4rem)] font-semibold leading-[1.06] text-white">
            {category.name}
          </h1>
          {category.tagline && (
            <p className="mx-auto mt-5 max-w-2xl text-[16px] leading-relaxed text-white/85">
              {category.tagline}
            </p>
          )}
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
          {category.description && (
            <p className="mx-auto mb-12 max-w-3xl text-center text-[16px] leading-relaxed text-teal-deep">
              {category.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold text-ink sm:text-3xl">
              Journeys in {category.name}
            </h2>
            <Link
              href="/packages"
              className="hidden items-center gap-2 text-[14px] font-semibold text-teal-deep hover:text-ink sm:inline-flex"
            >
              View all packages
              <ArrowRight className="size-4" />
            </Link>
          </div>

          {packages.length === 0 ? (
            <div className="mt-8">
              <EmptyGrid
                title="No packages here yet"
                description="This region is being curated — check back soon, or browse other destinations."
              />
            </div>
          ) : (
            <div className="mt-8 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {packages.map((pkg) => (
                <PackageCard
                  key={pkg._id}
                  pkg={{ ...pkg, category: { name: category.name, slug: category.slug } }}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
