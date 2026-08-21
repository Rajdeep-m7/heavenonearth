import { Facebook, Instagram, WhatsApp } from "@/components/ui/Icons";
import { siteConfig } from "@/lib/site";

const channels = [
  { href: siteConfig.social.facebook, label: "Facebook", Icon: Facebook },
  { href: siteConfig.social.whatsapp, label: "WhatsApp", Icon: WhatsApp },
  { href: siteConfig.social.instagram, label: "Instagram", Icon: Instagram },
];

/** The vertical social strip pinned to the right edge of the hero. */
export function SocialRail() {
  return (
    <nav
      aria-label="Social channels"
      className="absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-4 lg:flex xl:right-8"
    >
      {channels.map(({ href, label, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer me"
          aria-label={`${siteConfig.name} on ${label}`}
          className="grid size-9 place-items-center rounded-full bg-white/95 text-ink shadow-card transition hover:scale-110 hover:bg-gold"
        >
          <Icon className="size-[18px]" />
        </a>
      ))}
    </nav>
  );
}
