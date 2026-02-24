import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { PermissionsProvider } from "@/components/PermissionsProvider";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { getDashboardScope } from "@/lib/dashboard/getDashboardScope";
import type { DashboardRole } from "@/lib/dashboardRole";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Espace staff GBA.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/dashboard",
  },
};

const VALID_ROLES = new Set([
  "admin",
  "resp_sportif",
  "resp_pole",
  "resp_equipements",
  "coach",
]);

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active, full_name, email, id")
    .eq("id", user.id)
    .single();

  if (profile?.is_active === false) {
    redirect("/login?disabled=1");
  }

  const rawRole = String(profile?.role ?? "coach").trim();
  const role = VALID_ROLES.has(rawRole)
    ? (rawRole as DashboardRole)
    : ("coach" as DashboardRole);

  const userProfile = {
    id: user.id,
    email: profile?.email ?? user.email ?? null,
    full_name:
      profile?.full_name ??
      (user.user_metadata?.full_name as string | undefined) ??
      null,
    is_active: profile?.is_active ?? true,
    role,
  };

  const scopeRaw = await getDashboardScope();
  // Source of truth for role in dashboard shell = profile role resolved above.
  const scope = { ...scopeRaw, role };

  return (
    <DashboardShell userProfile={userProfile} scope={scope}>
      <div className="mx-auto w-full max-w-6xl">
        <section aria-label="Contenu du dashboard" className="min-w-0">
          <PermissionsProvider role={role}>{children}</PermissionsProvider>
        </section>
      </div>
    </DashboardShell>
  );
}
