"use client";

import * as React from "react";
import type { DashboardRole } from "@/lib/dashboardRole";
import { DashboardTopbar } from "@/components/dashboard/DashboardTopbar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardSpotlight } from "@/components/dashboard/DashboardSpotlight";
import {
  DashboardScopeProvider,
  type DashboardScope,
} from "@/components/dashboard/DashboardScopeProvider";

type Props = {
  children: React.ReactNode;
  userProfile: { full_name: string | null; role: string; email: string };
  scope: DashboardScope;
};

function formatDisplayName(fullName: string | null) {
  if (!fullName) return null;
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return null;
  if (parts.length === 1) return parts[0];
  const first = parts[0];
  const last = parts.slice(1).join(" ").toUpperCase();
  return `${first} ${last}`;
}

function normalizeRole(role: string): DashboardRole {
  const raw = String(role ?? "")
    .trim()
    .toLowerCase();
  if (
    raw === "admin" ||
    raw === "resp_sportif" ||
    raw === "resp_pole" ||
    raw === "resp_equipements" ||
    raw === "coach"
  ) {
    return raw as DashboardRole;
  }
  return "coach"; // Default fallback (minimal access)
}

export function DashboardShell({ children, userProfile, scope }: Props) {
  const [spotlightOpen, setSpotlightOpen] = React.useState(false);
  // Source of truth for displayed role = user profile role (not scope resolver)
  const role = normalizeRole(userProfile.role);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isK = e.key.toLowerCase() === "k";
      if ((e.metaKey || e.ctrlKey) && isK) {
        e.preventDefault();
        setSpotlightOpen(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <DashboardScopeProvider scope={scope}>
      <div className="theme-light min-h-screen bg-slate-50">
        <DashboardSidebar role={role} />
        <div className="flex-1 lg:pl-64">
          <div className="min-h-screen px-4 py-8 md:px-10">
            <DashboardTopbar
              role={role}
              userName={
                formatDisplayName(userProfile.full_name) || userProfile.email
              }
              userEmail={userProfile.email}
              onOpenSpotlight={() => setSpotlightOpen(true)}
            />
            <main id="dashboard-content" className="max-w-7xl mx-auto">
              {children}
            </main>
          </div>
        </div>
        <DashboardSpotlight
          role={role}
          isOpen={spotlightOpen}
          onClose={() => setSpotlightOpen(false)}
        />
      </div>
    </DashboardScopeProvider>
  );
}
