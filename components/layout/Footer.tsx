import Image from "next/image";
import Link from "next/link";

import { Mail, Share } from "@/components/ui/Icons";
import { footerLinks, siteConfig } from "@/lib/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink text-white/85">
      <div className="mx-auto max-w-[1200px] px-6 pb-10 pt-16 sm:px-8 lg:pt-24">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <Link href="/" className="flex items-center gap-4">
              <Image
                src="/images/logo.png"
                alt=""
                width={634}
                height={640}
                sizes="72px"
                className="size-[68px] rounded-full bg-white/95 object-cover p-0.5"
              />
              <span className="font-display text-2xl font-bold uppercase tracking-[0.06em] text-white sm:text-[28px]">
                {siteConfig.name}
              </span>
            </Link>
            <p className="mt-7 max-w-md text-[15px] leading-relaxed text-white/70">
              Curating tranquil West Bengal experiences. We craft journeys that
              connect you deeply with the landscapes, cultures, and people of
              the Himalayas.
            </p>

            <div className="mt-7 flex flex-wrap gap-x-8 gap-y-2 text-[15px]">
              <a
                href={`tel:${siteConfig.phone}`}
                className="text-white/80 transition hover:text-gold"
              >
                {siteConfig.phoneDisplay}
              </a>
              <a
                href={`mailto:${siteConfig.email}`}
                className="text-white/80 transition hover:text-gold"
              >
                {siteConfig.email}
              </a>
            </div>
          </div>

          <FooterColumn title="Explore" links={footerLinks.explore} />
          <FooterColumn title="Company" links={footerLinks.company} />
        </div>

        <div className="mt-14 border-t border-white/15 pt-7 sm:mt-20">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-white/60">
              &copy; {year} {siteConfig.legalName}. Curating tranquil West
              Bengal experiences.
            </p>
            <div className="flex items-center gap-5">
              <a
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noopener noreferrer me"
                aria-label={`${siteConfig.name} on Instagram`}
                className="text-white/70 transition hover:text-gold"
              >
                <Share className="size-5" />
              </a>
              <a
                href={`mailto:${siteConfig.email}`}
                aria-label={`Email ${siteConfig.name}`}
                className="text-white/70 transition hover:text-gold"
              >
                <Mail className="size-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { label: string; href: string }[];
}) {
  return (
    <nav aria-label={title}>
      <h2 className="font-sans text-[13px] font-semibold uppercase tracking-eyebrow text-white">
        {title}
      </h2>
      <ul className="mt-6 space-y-4">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-[15px] text-white/75 transition hover:text-gold"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
