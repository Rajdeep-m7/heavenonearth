import type { Metadata } from "next";
import Image from "next/image";

import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { siteConfig } from "@/lib/site";
import { whatsappGeneral } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "Heaven on Earth Destination Experts curate personal Himalayan journeys across Darjeeling, Sikkim, Kalimpong and the Dooars.",
  alternates: { canonical: "/about" },
};

const VALUES = [
  {
    title: "Local knowledge, not a script",
    body: "Every route, homestay and driver we recommend is one we know personally — not pulled from a database of listings we've never seen.",
  },
  {
    title: "Personal attention",
    body: "You talk to a person, not a booking engine. Every trip is planned around your pace, not a fixed template.",
  },
  {
    title: "West Bengal and beyond",
    body: `Darjeeling, Sikkim, Kalimpong and the Dooars are where we started — and where we still know every back road.`,
  },
];

export default function AboutPage() {
  return (
    <div className="bg-mint">
      <section className="relative min-h-[380px] overflow-hidden sm:min-h-[460px]">
        <Image
          src="/images/story-longtail-boat.jpg"
          alt="A wooden long-tail boat resting on still turquoise water beneath limestone cliffs at sunset"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div aria-hidden className="absolute inset-0 bg-ink/60" />
        <div className="relative mx-auto flex min-h-[380px] max-w-[900px] flex-col items-center justify-center px-6 text-center sm:min-h-[460px]">
          <p className="text-[13px] font-medium uppercase tracking-eyebrow text-gold">
            Our Story
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.2rem,5.5vw,3.6rem)] font-semibold leading-[1.1] text-white">
            We Believe The Best Journeys Feel Personal
          </h1>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-[800px] px-6 sm:px-10">
          <p className="text-[17px] leading-relaxed text-teal-deep">
            {siteConfig.description}
          </p>
          <p className="mt-5 text-[16px] leading-relaxed text-slate">
            From Himalayan escapes and peaceful homestays to carefully planned
            journeys across Eastern India, we help you travel with local
            knowledge, personal attention, and a little more soul. We don&rsquo;t
            run a checkout — when you&rsquo;re ready, we plan the trip together
            over a conversation, not a form.
          </p>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {VALUES.map((value) => (
              <div key={value.title} className="rounded-[20px] bg-white p-6 shadow-card">
                <h2 className="font-display text-lg font-semibold text-ink">
                  {value.title}
                </h2>
                <p className="mt-2.5 text-[14px] leading-relaxed text-slate">
                  {value.body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-14 flex justify-center">
            <WhatsAppButton href={whatsappGeneral()}>
              Start Planning Your Trip
            </WhatsAppButton>
          </div>
        </div>
      </section>
    </div>
  );
}
