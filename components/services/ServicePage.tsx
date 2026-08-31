import { Check } from "@/components/ui/Icons";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { whatsappForService } from "@/lib/whatsapp";

export type ServiceContent = {
  service: "flight" | "car" | "train";
  eyebrow: string;
  title: string;
  intro: string;
  points: string[];
  note: string;
};

/**
 * Shared layout for /flights, /cars, /trains. No form, no database write —
 * per docs/06-stays-cars-bookings.md the whole point of these pages is one
 * WhatsApp button. Three thin page.tsx files pass their own copy in.
 */
export function ServicePage({ content }: { content: ServiceContent }) {
  const href = whatsappForService(content.service);

  return (
    <div className="bg-mint">
      <section className="bg-ink py-20 sm:py-24">
        <div className="mx-auto max-w-[900px] px-6 text-center sm:px-10">
          <p className="text-[13px] font-medium uppercase tracking-eyebrow text-gold">
            {content.eyebrow}
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.4rem,6vw,3.8rem)] font-semibold leading-[1.08] text-white">
            {content.title}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-[16px] leading-relaxed text-white/80">
            {content.intro}
          </p>
          <div className="mt-9 flex justify-center">
            <WhatsAppButton href={href}>Chat With Us on WhatsApp</WhatsAppButton>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-[800px] px-6 sm:px-10">
          <div className="rounded-[26px] bg-white p-8 shadow-card sm:p-10">
            <h2 className="font-display text-2xl font-bold text-ink">
              What we take care of
            </h2>
            <ul className="mt-6 space-y-4">
              {content.points.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <Check className="mt-1 size-4 shrink-0 text-teal" />
                  <span className="text-[15px] leading-relaxed text-slate">
                    {point}
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-8 rounded-2xl bg-mint px-5 py-4 text-[14px] leading-relaxed text-teal-deep">
              {content.note}
            </p>

            <div className="mt-8 flex justify-center">
              <WhatsAppButton href={href} className="w-full sm:w-auto">
                Chat With Us on WhatsApp
              </WhatsAppButton>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
