"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { Button, Card, Field, Input } from "@/components/admin/ui";
import { ApiClientError, api } from "@/lib/admin/api";

export const dynamic = "force-dynamic";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setFields({});

    try {
      await api.post("/api/admin/auth/login", { email, password });
      // Only allow same-site paths — a crafted ?next= must not bounce
      // an admin to another origin straight after signing in.
      const target = next.startsWith("/") && !next.startsWith("//") ? next : "/admin";
      router.replace(target);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
        setFields(err.fields ?? {});
      } else {
        setError("Something went wrong. Please try again.");
      }
      setBusy(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-ink px-5 py-12">
      <div className="w-full max-w-md">
        <div className="text-center">
          <p className="font-display text-2xl font-bold uppercase tracking-[0.06em] text-white">
            Heaven on Earth
          </p>
          <p className="mt-1 text-[12px] uppercase tracking-[0.2em] text-gold">
            Admin
          </p>
        </div>

        <Card className="mt-8 p-7">
          <h1 className="font-display text-2xl font-bold text-ink">Sign in</h1>
          <p className="mt-1 text-[14px] text-slate">
            Manage packages, stays, reviews and the gallery.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
            {error && (
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-800"
              >
                {error}
              </p>
            )}

            <Field label="Email" error={fields.email} required>
              {(id) => (
                <Input
                  id={id}
                  type="email"
                  autoComplete="username"
                  autoFocus
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              )}
            </Field>

            <Field label="Password" error={fields.password} required>
              {(id) => (
                <Input
                  id={id}
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                />
              )}
            </Field>

            <Button type="submit" loading={busy} className="w-full">
              {busy ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-[13px] text-white/50">
          Accounts are created with the seed script — there is no public sign-up.
        </p>
      </div>
    </main>
  );
}

export default function AdminLoginPage() {
  // useSearchParams needs a Suspense boundary during prerender.
  return (
    <Suspense fallback={<main className="min-h-screen bg-ink" />}>
      <LoginForm />
    </Suspense>
  );
}
