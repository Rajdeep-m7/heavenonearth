type IconProps = React.SVGProps<SVGSVGElement>;

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
  "aria-hidden": true,
  focusable: false,
};

export const ArrowRight = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M4 12h15" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);

export const ArrowUpRight = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M7 17 17 7" />
    <path d="M8 7h9v9" />
  </svg>
);

export const ChevronLeft = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="m14 6-6 6 6 6" />
  </svg>
);

export const ChevronRight = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="m10 6 6 6-6 6" />
  </svg>
);

export const Phone = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M6.5 3h3l1.5 4-2 1.5a13 13 0 0 0 6.5 6.5L17 13l4 1.5v3a2 2 0 0 1-2.2 2A17.5 17.5 0 0 1 3 5.2 2 2 0 0 1 5 3Z" />
  </svg>
);

export const Search = (props: IconProps) => (
  <svg {...base} {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const Check = (props: IconProps) => (
  <svg {...base} strokeWidth={2.25} {...props}>
    <path d="m4 12.5 5 5L20 6.5" />
  </svg>
);

export const Star = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false" {...props}>
    <path d="m12 2.6 2.75 5.86 6.25.9-4.53 4.5 1.08 6.34L12 17.2l-5.55 3-1.08-6.34L.84 9.36l6.26-.9L12 2.6Z" />
  </svg>
);

export const BadgeCheck = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden focusable="false" {...props}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
    <path
      d="m8.5 12.2 2.4 2.4 4.6-4.9"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const Facebook = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false" {...props}>
    <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5H16.7V3.6A21 21 0 0 0 14.3 3.5c-2.4 0-4 1.45-4 4.12V9.9H7.6V13h2.7v8Z" />
  </svg>
);

export const Instagram = (props: IconProps) => (
  <svg {...base} {...props}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="3.75" />
    <circle cx="17.1" cy="6.9" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export const WhatsApp = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false" {...props}>
    <path d="M12 2a9.9 9.9 0 0 0-8.5 15L2 22l5.2-1.4A9.9 9.9 0 1 0 12 2Zm0 18a8.1 8.1 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.1 8.1 0 1 1 12 20Zm4.5-5.9c-.25-.13-1.45-.72-1.68-.8-.22-.08-.39-.12-.55.13-.16.24-.62.79-.77.95-.14.16-.28.18-.53.06a6.6 6.6 0 0 1-3.3-2.88c-.25-.43.25-.4.71-1.32.08-.16.04-.3-.02-.42-.06-.13-.55-1.33-.76-1.82-.2-.47-.4-.4-.55-.41h-.47a.9.9 0 0 0-.65.3 2.75 2.75 0 0 0-.86 2.05 4.78 4.78 0 0 0 1 2.54 10.94 10.94 0 0 0 4.2 3.7c1.56.68 2.18.73 2.96.62.47-.07 1.45-.6 1.66-1.17.2-.58.2-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z" />
  </svg>
);

export const Share = (props: IconProps) => (
  <svg {...base} {...props}>
    <circle cx="18" cy="5.5" r="2.5" />
    <circle cx="6" cy="12" r="2.5" />
    <circle cx="18" cy="18.5" r="2.5" />
    <path d="m8.2 10.8 7.6-4M8.2 13.2l7.6 4" />
  </svg>
);

export const Mail = (props: IconProps) => (
  <svg {...base} {...props}>
    <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
    <path d="m3.8 7 7.3 5.2a1.5 1.5 0 0 0 1.8 0L20.2 7" />
  </svg>
);

export const Menu = (props: IconProps) => (
  <svg {...base} strokeWidth={2} {...props}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const Close = (props: IconProps) => (
  <svg {...base} strokeWidth={2} {...props}>
    <path d="M6 6 18 18M18 6 6 18" />
  </svg>
);
