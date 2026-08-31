"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Close, Menu } from "@/components/ui/Icons";
import { api } from "@/lib/admin/api";

const NAV = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/categories", label: "Master packages" },
  { href: "/admin/packages", label: "Packages" },
  { href: "/admin/stays", label: "Room stays" },
  { href: "/admin/trending", label: "Trending" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/gallery", label: "Gallery" },
  // Managing who else has admin access is owner-only — an editor should not
  // even see the door, let alone be blocked at it.
  { href: "/admin/users", label: "Admin users", ownerOnly: true },
];

export function AdminShell({
  admin,
  children,
}: {
  admin: { name: string; email: string; role: string };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(0);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  // Pending-review badge. A failure here is cosmetic, so it stays silent.
  useEffect(() => {
    api
      .get<unknown>("/api/admin/reviews?status=pending&limit=1")
      .then((result) => setPending(Number(result.meta?.pending ?? 0)))
      .catch(() => undefined);
  }, [pathname]);

  const signOut = async () => {
    setSigningOut(true);
    try {
      await api.post("/api/admin/auth/logout");
    } catch {
      // Even if the request fails, send them to the login screen.
    }
    router.replace("/admin/login");
    router.refresh();
  };

  const isActive = (item: (typeof NAV)[number]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  const visibleNav = NAV.filter((item) => !item.ownerOnly || admin.role === "owner");

  const nav = (
    <nav aria-label="Admin sections">
      <ul className="space-y-1">
        {visibleNav.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={isActive(item) ? "page" : undefined}
              className={`flex items-center justify-between rounded-xl px-4 py-2.5 text-[15px] font-medium transition ${
                isActive(item)
                  ? "bg-white/12 text-gold"
                  : "text-white/80 hover:bg-white/8 hover:text-white"
              }`}
            >
              {item.label}
              {item.href === "/admin/reviews" && pending > 0 && (
                <span className="ml-2 grid min-w-6 place-items-center rounded-full bg-gold px-1.5 py-0.5 text-[11px] font-bold text-ink">
                  {pending}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#f6f8f8]">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-ink p-5 lg:flex">
        <Link href="/admin" className="px-2 py-1">
          <span className="font-display text-lg font-bold uppercase tracking-[0.06em] text-white">
            Heaven on Earth
          </span>
          <span className="mt-0.5 block text-[11px] uppercase tracking-[0.18em] text-gold">
            Admin
          </span>
        </Link>

        <div className="mt-8 flex-1">{nav}</div>

        <div className="rounded-2xl bg-white/8 p-4">
          <p className="truncate text-[14px] font-semibold text-white">
            {admin.name}
          </p>
          <p className="truncate text-[12px] text-white/60">{admin.email}</p>
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={signOut}
              disabled={signingOut}
              className="text-[13px] font-semibold text-gold hover:underline disabled:opacity-60"
            >
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
            <Link
              href="/"
              target="_blank"
              className="text-[13px] text-white/70 hover:text-white"
            >
              View site
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-black/8 bg-white px-4 py-3 lg:hidden">
        <Link
          href="/admin"
          className="font-display text-base font-bold uppercase tracking-wide text-ink"
        >
          HOE Admin
        </Link>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="admin-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          className="grid size-10 place-items-center rounded-full border border-black/12 text-ink"
        >
          {open ? <Close className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <div
        id="admin-nav"
        hidden={!open}
        className="sticky top-[57px] z-30 bg-ink p-4 lg:hidden"
      >
        {nav}
        <div className="mt-4 flex items-center justify-between border-t border-white/15 pt-4">
          <span className="truncate text-[13px] text-white/70">{admin.email}</span>
          <button
            onClick={signOut}
            className="text-[13px] font-semibold text-gold"
          >
            Sign out
          </button>
        </div>
      </div>

      <main className="px-4 py-6 sm:px-6 lg:ml-64 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-[1100px]">{children}</div>
      </main>
    </div>
  );
}
