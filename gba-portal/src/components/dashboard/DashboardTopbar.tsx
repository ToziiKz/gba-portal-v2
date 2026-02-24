"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Search, Menu, User, LogOut, Globe, Bell, Command } from "lucide-react";

import { getNavLabelForPath } from "@/lib/dashboard/nav";
import { useDashboardScope } from "@/components/dashboard/DashboardScopeProvider";
import type { DashboardRole } from "@/lib/dashboardRole";

type Props = {
  role: DashboardRole;
  userName?: string;
  userEmail?: string;
  onOpenSpotlight: () => void;
};

export function DashboardTopbar({ role, userName, onOpenSpotlight }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const title = React.useMemo(() => getNavLabelForPath(pathname), [pathname]);
  const scope = useDashboardScope();

  const assignedTeamsLabel = React.useMemo(() => {
    if (role !== "coach") return null;
    if (!scope.assignedTeams || scope.assignedTeams.length === 0) return null;
    const primary = scope.assignedTeams[0];
    const extra = scope.assignedTeams.length - 1;
    return extra > 0 ? `${primary.name} +${extra}` : primary.name;
  }, [role, scope.assignedTeams]);

  const handleLogout = async () => {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="mb-8 flex items-center justify-between">
      {/* Mobile Title Area */}
      <div className="lg:hidden flex items-center gap-3">
        <button className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-sm active:scale-95 transition-transform">
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-600 leading-none mb-1">
            Plan de match du jour
          </p>
          <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none">
            {title}
          </h1>
        </div>
      </div>

      {/* Desktop Title Area */}
      <div className="hidden lg:block">
        <div className="flex items-center gap-3 text-slate-400 mb-1">
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">
            Espace GBA
          </span>
          <span className="text-[10px]">/</span>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">
            {title}
          </span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none font-[var(--font-teko)]">
          Priorité{" "}
          <span className="text-blue-600">
            {title === "Dashboard" ? "au terrain" : title.toLowerCase()}
          </span>
        </h1>
      </div>

      {/* Global Actions Area */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Search Bar - Visual only for Desktop */}
        <button
          onClick={onOpenSpotlight}
          className="hidden md:flex items-center gap-10 pl-4 pr-2 py-1.5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-blue-200 transition-all group"
        >
          <div className="flex items-center gap-3 text-slate-400">
            <Search className="h-4 w-4 group-hover:text-blue-600 transition-colors" />
            <span className="text-xs font-bold uppercase tracking-widest opacity-60">
              Recherche...
            </span>
          </div>
          <div className="px-2 py-1 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-400 flex items-center gap-1">
            <Command className="h-2.5 w-2.5" /> K
          </div>
        </button>

        {/* Notifications (Placeholder) */}
        <button className="h-10 w-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-600 shadow-sm transition-all">
          <Bell className="h-5 w-5" />
        </button>

        {/* User Card */}
        <div className="flex items-center gap-3 pl-2 md:pl-4 border-l border-slate-100">
          <div className="hidden md:flex flex-col items-end">
            <p className="text-xs font-black text-slate-900 leading-none uppercase tracking-wide">
              {userName?.split(" ")[0]}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-[8px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded ${role === "admin" ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"}`}
              >
                {role}
              </span>
              {assignedTeamsLabel && (
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                  {assignedTeamsLabel}
                </span>
              )}
            </div>
          </div>

          <div className="relative group">
            <button className="h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-slate-900 border-2 border-white shadow-xl flex items-center justify-center text-white transition-transform group-hover:scale-105 active:scale-95">
              <User className="h-5 w-5 md:h-6 md:w-6" />
            </button>

            {/* Context Dropdown (Simple Simulation) */}
            <div className="absolute right-0 top-full pt-2 w-48 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all z-50">
              <div className="rounded-2xl bg-white border border-slate-100 shadow-2xl p-2">
                <Link
                  href="/"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-slate-600"
                >
                  <Globe className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">
                    Site Public
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 text-slate-600 hover:text-red-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">
                    Déconnexion
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
