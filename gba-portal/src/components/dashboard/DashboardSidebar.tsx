"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  CheckSquare,
  Trophy,
  ShieldCheck,
  Settings,
  ChevronRight,
  LogOut,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";

import { getVisibleNavItems, isActivePath } from "@/lib/dashboard/nav";
import type { DashboardRole } from "@/lib/dashboardRole";

type Props = {
  role: DashboardRole;
};

const iconMap: Record<string, LucideIcon> = {
  "/dashboard": LayoutDashboard,
  "/dashboard/effectif": Users,
  "/dashboard/planning": Calendar,
  "/dashboard/presences": CheckSquare,
  "/dashboard/match": Trophy,
  "/dashboard/acces": ShieldCheck,
  "/dashboard/joueurs": Users,
  "/dashboard/equipes": Trophy,
};

export function DashboardSidebar({ role }: Props) {
  const pathname = usePathname();
  const items = React.useMemo(() => getVisibleNavItems(role), [role]);

  return (
    <aside className="fixed left-0 top-0 z-50 hidden h-full w-64 shrink-0 flex-col border-r border-[color:var(--ui-border)] bg-white lg:flex shadow-sm">
      {/* Brand Header */}
      <div className="flex h-24 items-center justify-center px-4 border-b border-slate-50">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 focus:outline-none group"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-blue-100 shadow-lg shadow-blue-100 transition-transform group-hover:scale-105">
            <Image
              src="/gba-logo.png"
              alt="Logo du club GBA"
              width={34}
              height={34}
              className="object-contain"
              priority
            />
          </div>
          <div className="leading-tight text-center">
            <span className="block font-[var(--font-teko)] text-2xl font-black uppercase tracking-wider text-slate-900 leading-none">
              ESPACE GBA
            </span>
            <span className="block text-[9px] font-black uppercase tracking-[0.2em] text-blue-600 mt-1">
              Centre opérationnel du club
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Main */}
      <nav className="flex-1 overflow-y-auto px-4 py-8">
        <p className="px-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">
          Menu Principal
        </p>
        <ul className="space-y-1.5">
          {items.map((item) => {
            const Icon = iconMap[item.href] || ChevronRight;
            const active = isActivePath(pathname ?? "", item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
                    active
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"} transition-colors`}
                  />
                  <span>{item.label}</span>
                  {active && (
                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-600" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer Tools */}
      <div className="p-4 space-y-4">
        <div className="rounded-3xl bg-slate-50 p-6 border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-4 -mt-4 h-16 w-16 bg-blue-100 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500" />
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-2 flex items-center gap-2">
            <HelpCircle className="h-3 w-3" /> Support
          </p>
          <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
            Besoin d&apos;aide sur le terrain ? Contacte l&apos;admin.
          </p>
        </div>

        <div className="flex items-center justify-between px-2 pt-2">
          <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors">
            <LogOut className="h-4 w-4" /> Déconnexion
          </button>
          <Link href="/dashboard/settings">
            <Settings className="h-4 w-4 text-slate-400 hover:text-blue-600 transition-colors" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
