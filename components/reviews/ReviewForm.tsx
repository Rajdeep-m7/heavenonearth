"use client";

import { useState } from "react";

const RATINGS = [5, 4, 3, 2, 1] as const;

type FieldErrors = Record<string, string>;

/**
 * Public review submission. Posts straight to /api/reviews, which creates the
 * review as `pending` — it never becomes visible until an admin approves it.
 * The `website` field is a honeypot: real visitors never see or fill it, so a
 * non-empty value marks the submission as a bot and the server silently
 * discards it while still returning success (never tips the bot off).
 */
export function ReviewForm() {
  const [author, setAuthor] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState(5);
  const [quote, setQuote] = useState("");
  const [trip, setTrip] = useState("");
  const [website, setWebsite] = useState(""); // honeypot

  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<FieldErrors>({});

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("sending");
    setError(null);
    setFields({});

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          author,
          email: email || undefined,
          rating,
          quote,
          trip: trip || undefined,
          website,
        }),
      });
      const payload = await response.json();

      if (!payload.ok) {
        setError(payload.error?.message ?? "Something went wrong. Please try again.");
        setFields(payload.error?.fields ?? {});
        setStatus("idle");
        return;
      }

      setStatus("sent");
      setAuthor("");
      setEmail("");
      setRating(5);
      setQuote("");
      setTrip("");
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
      setStatus("idle");
    }
  };

  if (status === "sent") {
    return (
      <div className="rounded-[22px] border border-teal/30 bg-white p-8 text-center shadow-card">
        <p className="font-display text-xl font-semibold text-ink">
          Thank you for sharing your story
        </p>
        <p className="mt-2 text-[14px] text-slate">
          Your review is being looked over and will appear here once it&rsquo;s
          approved.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-[22px] border border-black/10 bg-white p-7 shadow-card sm:p-8"
    >
      <h2 className="font-display text-xl font-bold text-ink">Share Your Story</h2>
      <p className="mt-1 text-[13px] text-slate">
        Reviews are checked before they go live.
      </p>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800"
        >
          {error}
        </p>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Your name" error={fields.author} required>
          <input
            required
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
            placeholder="Priya S."
            className={inputClass}
          />
        </Field>
        <Field label="Email (optional, not shown publicly)" error={fields.email}>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className={inputClass}
          />
        </Field>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Trip (optional)" error={fields.trip}>
          <input
            value={trip}
            onChange={(event) => setTrip(event.target.value)}
            placeholder="Darjeeling Tea Escape"
            className={inputClass}
          />
        </Field>
        <Field label="Rating" error={fields.rating} required>
          <select
            value={rating}
            onChange={(event) => setRating(Number(event.target.value))}
            className={inputClass}
          >
            {RATINGS.map((value) => (
              <option key={value} value={value}>
                {value} star{value === 1 ? "" : "s"}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-4">
        <Field label="Your review" error={fields.quote} required>
          <textarea
            required
            rows={4}
            maxLength={600}
            value={quote}
            onChange={(event) => setQuote(event.target.value)}
            placeholder="Tell other travellers what stood out about your trip…"
            className={`${inputClass} resize-y`}
          />
        </Field>
      </div>

      {/*
        Honeypot. `sr-only` (1px, clipped, no page-width impact) rather than
        left:-9999px — an off-canvas honeypot earlier in this project widened
        the whole page and broke mobile layouts; this pattern can't do that.
      */}
      <div aria-hidden="true" className="sr-only">
        <label htmlFor="website">Leave this field empty</label>
        <input
          id="website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </div>

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-6 inline-flex items-center justify-center rounded-full bg-teal px-8 py-3.5 text-sm font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-teal-deep disabled:opacity-60"
      >
        {status === "sending" ? "Submitting…" : "Submit Review"}
      </button>
    </form>
  );
}

const inputClass =
  "w-full rounded-xl border border-black/12 bg-white px-3.5 py-2.5 text-[15px] text-ink outline-none transition placeholder:text-slate/60 focus:border-teal focus:ring-2 focus:ring-teal/15";

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-[13px] font-semibold text-ink">
      {label}
      {required && <span className="ml-1 text-red-600">*</span>}
      <div className="mt-1.5 font-normal">{children}</div>
      {error && <p className="mt-1 text-[12px] font-medium text-red-600">{error}</p>}
    </label>
  );
}
