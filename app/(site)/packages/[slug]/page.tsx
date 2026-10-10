import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/seo/JsonLd";
import { ReviewCard } from "@/components/packages/ReviewCard";
import { ArrowRight, Check, Star } from "@/components/ui/Icons";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { redirectIfRenamed } from "@/lib/queries/redirects";
import { getAllPackageSlugs, getPackageBySlug } from "@/lib/queries/packages";
import { ogImageFrom, pageMetadata } from "@/lib/seo/metadata";
import { buildPackageGraph } from "@/lib/seo/schema";
import { absoluteUrl } from "@/lib/site";
import { whatsappForPackage } from "@/lib/whatsapp";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getAllPackageSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

type Params = { params: Promise<{ slug: string }> };

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPackageBySlug(slug);
  if (!data) return {};

  const { pkg } = data;
  const title = pkg.seo?.title || pkg.title;
  const description = pkg.seo?.description || pkg.summary;

  return pageMetadata({
    title,
    description,
    path: `/packages/${slug}`,
    image: ogImageFrom(pkg.coverImage.url, pkg.coverImage.alt || pkg.title),
  });
}

export default async function PackageDetailPage({ params }: Params) {
  const { slug } = await params;
  const data = await getPackageBySlug(slug);
  if (!data) {
    await redirectIfRenamed("packages", slug);
    notFound();
  }

  const { pkg, reviews, rating } = data;
  const whatsappHref = whatsappForPackage(pkg.title, absoluteUrl(`/packages/${slug}`));

  return (
    <div className="bg-mint">
      <JsonLd id="package-jsonld" data={buildPackageGraph(data)} />

      <section className="relative min-h-[440px] overflow-hidden sm:min-h-[560px]">
        <Image
          src={pkg.coverImage.publicId || pkg.coverImage.url}
          alt={pkg.coverImage.alt || pkg.title}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-ink/50" />

        <div className="relative mx-auto flex min-h-[440px] max-w-[1100px] flex-col justify-end px-6 pb-12 pt-32 sm:min-h-[560px] sm:px-10 sm:pb-16">
          <Link
            href="/packages"
            className="w-fit text-[13px] font-medium uppercase tracking-[0.14em] text-gold hover:underline"
          >
            &larr; All Packages
          </Link>

          {pkg.category && (
            <Link
              href={`/destinations/${pkg.category.slug}`}
              className="mt-4 w-fit rounded-full bg-white/15 px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-sm transition hover:bg-white/25"
            >
              {pkg.category.name}
            </Link>
          )}

          <h1 className="mt-4 max-w-3xl font-display text-[clamp(2.2rem,5.5vw,3.6rem)] font-semibold leading-[1.08] text-white text-balance">
            {pkg.title}
          </h1>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <WhatsAppButton href={whatsappHref}>Enquire on WhatsApp</WhatsAppButton>
            {rating && rating.count > 0 && (
              <div className="flex items-center gap-1.5 text-white">
                <Star className="size-4 text-gold" />
                <span className="font-semibold">{rating.value.toFixed(1)}</span>
                <span className="text-white/70">
                  ({rating.count} review{rating.count === 1 ? "" : "s"})
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20">
        <div className="mx-auto grid max-w-[1100px] gap-12 px-6 sm:px-10 lg:grid-cols-[1fr_320px]">
          <div className="space-y-12">
            {/* Quick facts */}
            <div className="grid grid-cols-2 gap-4 rounded-[22px] border border-black/10 bg-white p-6 sm:grid-cols-3">
              <Fact label="Duration" value={pkg.duration} />
              <Fact label="Starting From" value={`${inr.format(pkg.priceFrom)} / person`} />
              {pkg.destination && <Fact label="Destination" value={pkg.destination} />}
            </div>

            {/* Overview */}
            <div>
              <h2 className="font-display text-2xl font-bold text-ink">Overview</h2>
              <p className="mt-4 text-[16px] italic leading-relaxed text-teal-deep">
                &ldquo;{pkg.summary}&rdquo;
              </p>
              {pkg.description && (
                <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-slate">
                  {pkg.description}
                </p>
              )}
            </div>

            {/* Inclusions / exclusions */}
            {(pkg.inclusions.length > 0 || pkg.exclusions.length > 0) && (
              <div className="grid gap-8 sm:grid-cols-2">
                {pkg.inclusions.length > 0 && (
                  <div>
                    <h3 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-slate">
                      Inclusions
                    </h3>
                    <ul className="mt-3 space-y-2.5">
                      {pkg.inclusions.map((item) => (
                        <li key={item} className="flex items-center gap-2.5 text-[15px] text-ink">
                          <Check className="size-4 shrink-0 text-teal" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {pkg.exclusions.length > 0 && (
                  <div>
                    <h3 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-slate">
                      Exclusions
                    </h3>
                    <ul className="mt-3 space-y-2.5">
                      {pkg.exclusions.map((item) => (
                        <li key={item} className="flex items-center gap-2.5 text-[15px] text-slate">
                          <span aria-hidden className="text-[15px] text-slate/60">
                            &times;
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Itinerary */}
            {pkg.itinerary.length > 0 && (
              <div>
                <h2 className="font-display text-2xl font-bold text-ink">Itinerary</h2>
                <ol className="mt-6 space-y-6">
                  {pkg.itinerary.map((day) => (
                    <li key={day.day} className="flex gap-5">
                      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-teal text-[14px] font-bold text-white">
                        {day.day}
                      </span>
                      <div>
                        <p className="font-display text-lg font-semibold text-ink">
                          {day.title}
                        </p>
                        {day.detail && (
                          <p className="mt-1 text-[15px] leading-relaxed text-slate">
                            {day.detail}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Gallery */}
            {pkg.images.length > 0 && (
              <div>
                <h2 className="font-display text-2xl font-bold text-ink">Gallery</h2>
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {pkg.images.map((image) => (
                    <div
                      key={image.publicId}
                      className="relative aspect-square overflow-hidden rounded-xl"
                    >
                      <Image
                        src={image.publicId || image.url}
                        alt={image.alt || pkg.title}
                        fill
                        sizes="(max-width: 640px) 45vw, 220px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {reviews.length > 0 && (
              <div>
                <h2 className="font-display text-2xl font-bold text-ink">
                  Traveller Reviews
                </h2>
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  {reviews.map((review) => (
                    <ReviewCard key={review._id} review={review} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sticky sidebar CTA */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-[22px] border border-black/10 bg-white p-7 shadow-card">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-slate">
                Starting From
              </p>
              <p className="mt-1.5 font-display text-3xl font-bold text-ink">
                {inr.format(pkg.priceFrom)}
                <span className="text-[14px] font-normal text-slate"> / person</span>
              </p>
              <p className="mt-1 text-[13px] text-slate">{pkg.duration}</p>

              <WhatsAppButton href={whatsappHref} className="mt-6 w-full">
                Enquire on WhatsApp
              </WhatsAppButton>

              <p className="mt-4 text-[12px] leading-relaxed text-slate">
                No payment or booking on the site — our team will confirm
                availability and finalise every detail with you directly.
              </p>

              <Link
                href="/packages"
                className="mt-5 flex items-center gap-2 text-[13px] font-semibold text-teal-deep hover:text-ink"
              >
                Browse more journeys
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate">
        {label}
      </p>
      <p className="mt-1 text-[15px] font-semibold text-ink">{value}</p>
    </div>
  );
}
