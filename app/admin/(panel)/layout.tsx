import { redirect } from "next/navigation";

import { AdminShell } from "@/components/admin/AdminShell";
import { ToastProvider } from "@/components/admin/Toast";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

/**
 * Server-side gate. Middleware already redirects unauthenticated requests, but
 * this makes the panel safe on its own — and gives the shell a real admin
 * identity without a client round-trip.
 */
export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <ToastProvider>
      <AdminShell
        admin={{ name: session.name, email: session.email, role: session.role }}
      >
        {children}
      </AdminShell>
    </ToastProvider>
  );
}
