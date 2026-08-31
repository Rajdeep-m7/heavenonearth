import { WhatsApp } from "@/components/ui/Icons";

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: "solid" | "outline";
  className?: string;
};

/**
 * The one call-to-action pattern used everywhere the site would otherwise
 * have a "Book Now" button. `href` is a pre-built wa.me link from
 * lib/whatsapp.ts — this component has no logic of its own.
 */
export function WhatsAppButton({
  href,
  children,
  variant = "solid",
  className = "",
}: Props) {
  const base =
    "group inline-flex items-center justify-center gap-2.5 rounded-full px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.1em] transition";
  const tone =
    variant === "solid"
      ? "bg-[#25D366] text-white hover:bg-[#1ebe57]"
      : "border border-[#25D366] text-[#1ebe57] hover:bg-[#25D366] hover:text-white";

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} ${tone} ${className}`}
    >
      <WhatsApp className="size-[18px]" />
      {children}
    </a>
  );
}
