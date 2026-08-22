"use client";

import { useId, useState } from "react";

/* ------------------------------------------------------------------ *
 * Form + layout primitives shared by every admin screen.
 * Deliberately small and unstyled-by-default so the screens stay readable.
 * ------------------------------------------------------------------ */

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-black/8 bg-white shadow-[0_1px_2px_rgba(17,59,66,0.06)] ${className}`}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-3xl font-bold text-ink">{title}</h1>
        {description && (
          <p className="mt-1.5 text-[15px] text-slate">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  loading?: boolean;
};

const VARIANTS: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-teal text-white hover:bg-teal-deep disabled:bg-teal/50",
  secondary:
    "border border-black/12 bg-white text-ink hover:bg-black/[0.03] disabled:opacity-50",
  ghost: "text-slate hover:bg-black/[0.04] hover:text-ink disabled:opacity-50",
  danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-600/50",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition disabled:cursor-not-allowed ${
        size === "sm" ? "px-4 py-2 text-[13px]" : "px-6 py-2.5 text-sm"
      } ${VARIANTS[variant]} ${className}`}
    >
      {loading && (
        <span
          aria-hidden
          className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  );
}

export function Field({
  label,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: (id: string) => React.ReactNode;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block text-[13px] font-semibold text-ink">
        {label}
        {required && <span className="ml-1 text-red-600">*</span>}
      </label>
      {hint && <p className="mt-0.5 text-[12px] text-slate">{hint}</p>}
      <div className="mt-1.5">{children(id)}</div>
      {error && (
        <p role="alert" className="mt-1.5 text-[12px] font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

const CONTROL =
  "w-full rounded-xl border border-black/12 bg-white px-3.5 py-2.5 text-[15px] text-ink outline-none transition placeholder:text-slate/60 focus:border-teal focus:ring-2 focus:ring-teal/15 disabled:bg-black/[0.03]";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${CONTROL} ${props.className ?? ""}`} />;
}

export function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea
      rows={4}
      {...props}
      className={`${CONTROL} resize-y ${props.className ?? ""}`}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${CONTROL} ${props.className ?? ""}`} />;
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`mt-0.5 h-6 w-11 shrink-0 rounded-full p-0.5 transition ${
          checked ? "bg-teal" : "bg-black/15"
        }`}
      >
        <span
          className={`block size-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
      <span>
        <span className="block text-[14px] font-medium text-ink">{label}</span>
        {description && (
          <span className="block text-[12px] text-slate">{description}</span>
        )}
      </span>
    </label>
  );
}

/** Comma/Enter-separated tag input, used for amenities, inclusions, tags. */
export function ChipsInput({
  value,
  onChange,
  placeholder = "Type and press Enter",
  id,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  id?: string;
}) {
  const [draft, setDraft] = useState("");

  const commit = (raw: string) => {
    const parts = raw
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean)
      // Ignore duplicates rather than silently creating them.
      .filter((part) => !value.includes(part));
    if (parts.length) onChange([...value, ...parts]);
    setDraft("");
  };

  return (
    <div className="rounded-xl border border-black/12 bg-white p-2 focus-within:border-teal focus-within:ring-2 focus-within:ring-teal/15">
      {value.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-1.5">
          {value.map((item) => (
            <li
              key={item}
              className="inline-flex items-center gap-1.5 rounded-full bg-mint px-3 py-1 text-[13px] text-ink"
            >
              {item}
              <button
                type="button"
                onClick={() => onChange(value.filter((v) => v !== item))}
                aria-label={`Remove ${item}`}
                className="text-slate transition hover:text-red-600"
              >
                &times;
              </button>
            </li>
          ))}
        </ul>
      )}
      <input
        id={id}
        value={draft}
        placeholder={placeholder}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            commit(draft);
          } else if (event.key === "Backspace" && !draft && value.length) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={() => draft && commit(draft)}
        className="w-full bg-transparent px-1.5 py-1 text-[15px] outline-none placeholder:text-slate/60"
      />
    </div>
  );
}

export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
  children: React.ReactNode;
}) {
  const tones = {
    neutral: "bg-black/[0.06] text-slate",
    success: "bg-teal/12 text-teal-deep",
    warning: "bg-gold/25 text-[#7a5a00]",
    danger: "bg-red-100 text-red-700",
    info: "bg-ice text-teal-deep",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/12 px-6 py-16 text-center">
      <p className="font-display text-xl font-semibold text-ink">{title}</p>
      {description && (
        <p className="mt-2 max-w-md text-[15px] text-slate">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center">
      <p className="font-semibold text-red-800">Could not load this</p>
      <p className="mx-auto mt-2 max-w-lg text-[14px] text-red-700">{message}</p>
      {onRetry && (
        <div className="mt-5">
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}

export function Spinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-slate">
      <span
        aria-hidden
        className="size-5 animate-spin rounded-full border-2 border-current border-t-transparent"
      />
      <span className="text-[15px]">{label}…</span>
    </div>
  );
}
