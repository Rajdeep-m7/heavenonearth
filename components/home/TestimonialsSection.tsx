import Link from "next/link";

import { Rail } from "@/components/ui/Rail";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowRight, Star } from "@/components/ui/Icons";
import type { TestimonialView } from "@/lib/queries/home";
import { siteConfig } from "@/lib/site";

type Props = {
  testimonials: TestimonialView[];
  rating: { value: number; count: number } | null;
};

export function TestimonialsSection({ testimonials, rating }: Props) {
  if (testimonials.length === 0) return null;

  return (
    <section
      id="reviews"
      aria-labelledby="testimonials-heading"
      className="bg-teal py-20 sm:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10">
        <Reveal>
          <p className="text-[13px] font-medium uppercase tracking-eyebrow text-gold">
            Testimonials
          </p>

          <div className="mt-5 flex items-center justify-between gap-6">
            <h2
              id="testimonials-heading"
              className="font-display text-[clamp(2.1rem,5.5vw,3.7rem)] font-bold leading-tight text-white"
            >
              Stories From The Road
            </h2>
            <Link
              href="/reviews"
              aria-label="Read all traveller reviews"
              className="hidden size-14 shrink-0 place-items-center rounded-full text-gold transition hover:bg-gold hover:text-ink sm:grid"
            >
              <ArrowRight className="size-7" />
            </Link>
          </div>

          <p className="mt-4 text-[15px] text-white/80">
            Rated{" "}
            <span className="font-semibold text-gold">
              {(rating?.value ?? siteConfig.rating.value).toFixed(1)}/5
            </span>{" "}
            by{" "}
            {(rating?.count ?? siteConfig.rating.count).toLocaleString("en-IN")}{" "}
            travellers.
          </p>
        </Reveal>

        <Reveal delay={120} className="mt-12 lg:mt-14">
          <Rail label="Traveller reviews" tone="gold" className="gap-6 pb-4">
            {testimonials.map((testimonial) => (
              <figure
                key={testimonial.id}
                className="flex w-[min(84vw,300px)] shrink-0 snap-start flex-col rounded-[22px] border border-gold/70 p-7 transition duration-500 hover:-translate-y-1.5 hover:bg-white/5 lg:w-[calc((100%-4.5rem)/4)]"
              >
                <div
                  className="flex gap-1.5 text-gold"
                  role="img"
                  aria-label={`${testimonial.rating} out of 5 stars`}
                >
                  {Array.from({ length: testimonial.rating }).map((_, index) => (
                    <Star key={index} className="size-4" />
                  ))}
                </div>

                <blockquote className="mt-5 flex-1 text-[15px] italic leading-relaxed text-white/95">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>

                <figcaption className="mt-7 flex items-center gap-3.5 border-t border-white/15 pt-5">
                  <div>
                    <p className="font-semibold text-white">
                      {testimonial.author}
                    </p>
                    <p className="mt-0.5 text-[13px] text-white/70">
                      {testimonial.trip} &middot;{" "}
                      <time dateTime={testimonial.datePublished}>
                        {testimonial.date}
                      </time>
                    </p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </Rail>
        </Reveal>
      </div>
    </section>
  );
}
