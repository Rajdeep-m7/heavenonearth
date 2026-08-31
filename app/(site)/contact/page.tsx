import type { Metadata } from "next";

import { Mail, Phone, WhatsApp } from "@/components/ui/Icons";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { siteConfig } from "@/lib/site";
import { whatsappGeneral } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Reach Heaven on Earth Destination Experts by WhatsApp, phone, or email — we plan every trip over a conversation, not a form.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="bg-mint">
      <section className="bg-ink py-20 sm:py-24">
        <div className="mx-auto max-w-[900px] px-6 text-center sm:px-10">
          <p className="text-[13px] font-medium uppercase tracking-eyebrow text-gold">
            Talk To Us
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.4rem,6vw,3.8rem)] font-semibold leading-[1.08] text-white">
            Let&rsquo;s Plan Your Trip
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-white/80">
            No forms to fill and wait on — message us directly and a real
            person will reply.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto grid max-w-[900px] gap-6 px-6 sm:grid-cols-2 sm:px-10">
          <a
            href={whatsappGeneral()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-start gap-3 rounded-[22px] bg-white p-7 shadow-card transition hover:-translate-y-1 hover:shadow-lift"
          >
            <span className="grid size-12 place-items-center rounded-full bg-[#25D366]/12 text-[#1ebe57]">
              <WhatsApp className="size-6" />
            </span>
            <p className="font-display text-lg font-semibold text-ink">WhatsApp</p>
            <p className="text-[14px] text-slate">
              The fastest way to reach us — usually a reply within the hour.
            </p>
            <span className="text-[14px] font-semibold text-teal-deep">
              {siteConfig.phoneDisplay}
            </span>
          </a>

          <a
            href={`tel:${siteConfig.phone}`}
            className="flex flex-col items-start gap-3 rounded-[22px] bg-white p-7 shadow-card transition hover:-translate-y-1 hover:shadow-lift"
          >
            <span className="grid size-12 place-items-center rounded-full bg-teal/12 text-teal-deep">
              <Phone className="size-6" />
            </span>
            <p className="font-display text-lg font-semibold text-ink">Call</p>
            <p className="text-[14px] text-slate">
              {siteConfig.openingHours.replace("Mo-Su", "Open daily")}.
            </p>
            <span className="text-[14px] font-semibold text-teal-deep">
              {siteConfig.phoneDisplay}
            </span>
          </a>

          <a
            href={`mailto:${siteConfig.email}`}
            className="flex flex-col items-start gap-3 rounded-[22px] bg-white p-7 shadow-card transition hover:-translate-y-1 hover:shadow-lift sm:col-span-2"
          >
            <span className="grid size-12 place-items-center rounded-full bg-gold/20 text-gold-deep">
              <Mail className="size-6" />
            </span>
            <p className="font-display text-lg font-semibold text-ink">Email</p>
            <p className="text-[14px] text-slate">
              For detailed itineraries or group bookings.
            </p>
            <span className="text-[14px] font-semibold text-teal-deep">
              {siteConfig.email}
            </span>
          </a>
        </div>

        <div className="mx-auto mt-10 max-w-[900px] px-6 text-center sm:px-10">
          <p className="text-[14px] text-slate">
            {siteConfig.address.street}, {siteConfig.address.locality},{" "}
            {siteConfig.address.region} {siteConfig.address.postalCode}
          </p>
          <div className="mt-8 flex justify-center">
            <WhatsAppButton href={whatsappGeneral()}>
              Message Us on WhatsApp
            </WhatsAppButton>
          </div>
        </div>
      </section>
    </div>
  );
}
