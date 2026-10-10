import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/seo/JsonLd";
import { ReviewCard } from "@/components/packages/ReviewCard";
import { ArrowRight, Check, Star } from "@/components/ui/Icons";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { redirectIfRenamed } from "@/lib/queries/redirects";
import { getAllStaySlugs, getStayBySlug } from "@/lib/queries/stays";
import { ogImageFrom, pageMetadata } from "@/lib/seo/metadata";
import { buildStayGraph } from "@/lib/seo/schema";
import { absoluteUrl } from "@/lib/site";
import { whatsappForRoom, whatsappForStay } from "@/lib/whatsapp";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getAllStaySlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

type Params = { params: Promise<{ slug: string }> };

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const PROPERTY_LABEL: Record<string, string> = {
  homestay: "Homestay",
  resort: "Resort",
  cottage: "Cottage",
  teaBungalow: "Tea Bungalow",
  camp: "Camp",
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const data = await getStayBySlug(slug);
  if (!data) return {};

  const { stay } = data;
  const title = stay.seo?.title || stay.name;
  const description = stay.seo?.description || stay.summary;

  return pageMetadata({
    title,
    description,
    path: `/stays/${slug}`,
    image: ogImageFrom(stay.coverImage.url, stay.coverImage.alt || stay.name),
  });
}

export default async function StayDetailPage({ params }: Params) {
  const { slug } = await params;
  const data = await getStayBySlug(slug);
  if (!data) {
    await redirectIfRenamed("stays", slug);
    notFound();
  }

  const { stay, rooms, reviews, rating } = data;
  const place = [stay.location.locality, stay.location.region]
    .filter(Boolean)
    .join(", ");
  const stayWhatsapp = whatsappForStay(stay.name, absoluteUrl(`/stays/${slug}`));

  return (
    <div className="bg-mint">
      <JsonLd id="stay-jsonld" data={buildStayGraph(data)} />

      <section className="relative min-h-[440px] overflow-hidden sm:min-h-[560px]">
        <Image
          src={stay.coverImage.publicId || stay.coverImage.url}
          alt={stay.coverImage.alt || stay.name}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-ink/50" />

        <div className="relative mx-auto flex min-h-[440px] max-w-[1100px] flex-col justify-end px-6 pb-12 pt-32 sm:min-h-[560px] sm:px-10 sm:pb-16">
          <Link
            href="/stays"
            className="w-fit text-[13px] font-medium uppercase tracking-[0.14em] text-gold hover:underline"
          >
            &larr; All Stays
          </Link>

          <span className="mt-4 w-fit rounded-full bg-white/15 px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-sm">
            {PROPERTY_LABEL[stay.propertyType] ?? stay.propertyType}
          </span>

          <h1 className="mt-4 max-w-3xl font-display text-[clamp(2.2rem,5.5vw,3.6rem)] font-semibold leading-[1.08] text-white text-balance">
            {stay.name}
          </h1>
          {place && <p className="mt-2 text-[15px] text-white/85">{place}</p>}

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <WhatsAppButton href={stayWhatsapp}>Enquire on WhatsApp</WhatsAppButton>
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
            {/* Overview */}
            <div>
              <h2 className="font-display text-2xl font-bold text-ink">
                About the Stay
              </h2>
              <p className="mt-4 text-[16px] italic leading-relaxed text-teal-deep">
                &ldquo;{stay.summary}&rdquo;
              </p>
              {stay.description && (
                <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-slate">
                  {stay.description}
                </p>
              )}

              {stay.highlights.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {stay.highlights.map((item) => (
                    <span
                      key={item}
                      className="rounded-full bg-white px-3.5 py-1.5 text-[12px] font-medium text-teal-deep shadow-sm"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Amenities */}
            {stay.amenities.length > 0 && (
              <div>
                <h3 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-slate">
                  Amenities
                </h3>
                <ul className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {stay.amenities.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-[14px] text-ink">
                      <Check className="size-4 shrink-0 text-teal" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Rooms */}
            {rooms.length > 0 && (
              <div>
                <h2 className="font-display text-2xl font-bold text-ink">
                  Choose Your Room
                </h2>
                <div className="mt-5 space-y-5">
                  {rooms.map((room) => {
                    const roomImage = room.images[0]?.publicId ?? room.images[0]?.url ?? "";
                    return (
                      <div
                        key={room._id}
                        className="flex flex-col gap-5 rounded-[22px] border border-black/10 bg-white p-5 sm:flex-row"
                      >
                        {roomImage && (
                          <div className="relative h-48 w-full shrink-0 overflow-hidden rounded-xl sm:h-auto sm:w-56">
                            <Image
                              src={roomImage}
                              alt={room.images[0]?.alt || room.name}
                              fill
                              sizes="(max-width: 640px) 100vw, 224px"
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="flex flex-1 flex-col">
                          <h3 className="font-display text-lg font-semibold text-ink">
                            {room.name}
                          </h3>
                          {room.description && (
                            <p className="mt-1.5 text-[14px] leading-relaxed text-slate">
                              {room.description}
                            </p>
                          )}
                          <p className="mt-2 text-[13px] text-slate">
                            Sleeps {room.maxAdults}
                            {room.maxChildren > 0 && ` + ${room.maxChildren}`}
                            {room.bedType && ` · ${room.bedType}`}
                          </p>
                          {room.amenities.length > 0 && (
                            <p className="mt-1 text-[13px] text-slate">
                              {room.amenities.join(" · ")}
                            </p>
                          )}

                          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
                            <p className="text-[16px] font-semibold text-teal">
                              {inr.format(room.pricePerNight)}{" "}
                              <span className="text-[13px] font-normal text-slate">
                                / night
                              </span>
                            </p>
                            <WhatsAppButton
                              href={whatsappForRoom(
                                stay.name,
                                room.name,
                                absoluteUrl(`/stays/${slug}`),
                              )}
                              variant="outline"
                            >
                              Ask About This Room
                            </WhatsAppButton>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Host */}
            {stay.host?.name && (
              <div className="rounded-[22px] bg-white p-6">
                <h3 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-slate">
                  Meet Your Host
                </h3>
                <div className="mt-3 flex items-start gap-4">
                  {stay.host.avatar && (
                    <Image
                      src={stay.host.avatar.publicId || stay.host.avatar.url}
                      alt={stay.host.avatar.alt || stay.host.name}
                      width={64}
                      height={64}
                      sizes="56px"
                      className="size-14 shrink-0 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="font-display text-lg font-semibold text-ink">
                      Hosted by {stay.host.name}
                    </p>
                    {stay.host.bio && (
                      <p className="mt-1.5 text-[14px] leading-relaxed text-slate">
                        &ldquo;{stay.host.bio}&rdquo;
                      </p>
                    )}
                  </div>
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

            {/* Location & policies */}
            <div className="grid gap-8 sm:grid-cols-2">
              {stay.houseRules.length > 0 && (
                <div>
                  <h3 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-slate">
                    House Rules
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {stay.houseRules.map((rule) => (
                      <li key={rule} className="text-[14px] text-slate">
                        &middot; {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {stay.cancellationPolicy && (
                <div>
                  <h3 className="text-[13px] font-semibold uppercase tracking-[0.14em] text-slate">
                    Cancellation Policy
                  </h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-slate">
                    {stay.cancellationPolicy}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sticky sidebar CTA */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-[22px] border border-black/10 bg-white p-7 shadow-card">
              <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-slate">
                Starting From
              </p>
              <p className="mt-1.5 font-display text-3xl font-bold text-ink">
                {stay.priceFrom > 0 ? inr.format(stay.priceFrom) : "Ask us"}
                {stay.priceFrom > 0 && (
                  <span className="text-[14px] font-normal text-slate"> / night</span>
                )}
              </p>
              <p className="mt-1 text-[13px] text-slate">
                Check-in {stay.checkInTime} &middot; Check-out {stay.checkOutTime}
              </p>

              <WhatsAppButton href={stayWhatsapp} className="mt-6 w-full">
                Enquire on WhatsApp
              </WhatsAppButton>

              <p className="mt-4 text-[12px] leading-relaxed text-slate">
                No payment or booking on the site — our team will confirm
                availability and finalise every detail with you directly.
              </p>

              <Link
                href="/stays"
                className="mt-5 flex items-center gap-2 text-[13px] font-semibold text-teal-deep hover:text-ink"
              >
                Browse more stays
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
