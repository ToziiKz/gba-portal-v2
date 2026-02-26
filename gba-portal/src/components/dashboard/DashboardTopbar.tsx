"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Bell, ChevronDown, LogOut, Home } from "lucide-react";

import type { DashboardRole } from "@/lib/dashboardRole";
import { signOutDashboard } from "@/app/dashboard/actions";

type Props = {
  role: DashboardRole;
  userName?: string;
  userEmail?: string;
  onOpenSpotlight: () => void;
};

const roleLabelMap: Record<DashboardRole, string> = {
  admin: "Admin",
  coach: "Coach",
  resp_pole: "Resp. Pôle",
  resp_sportif: "Resp. Sportif",
  resp_equipements: "Resp. Équipements",
};

type TopbarTitle = {
  title: string;
  subtitle: string;
};

function getTopbarTitle(pathname: string): TopbarTitle {
  if (pathname.startsWith("/dashboard/effectif-club")) {
    return {
      title: "Effectif Club",
      subtitle: "Pilotage des effectifs",
    };
  }
  if (pathname.startsWith("/dashboard/acces")) {
    return {
      title: "Accès & Permissions",
      subtitle: "Gouvernance des rôles",
    };
  }
  if (pathname.startsWith("/dashboard/planning")) {
    return {
      title: "Planning",
      subtitle: "Coordination hebdomadaire",
    };
  }

  return {
    title: "Dashboard",
    subtitle: "Pilotage au terrain",
  };
}

export function DashboardTopbar({
  role,
  userName,
  userEmail,
  onOpenSpotlight,
}: Props) {
  const pathname = usePathname() ?? "/dashboard";
  const { title, subtitle } = getTopbarTitle(pathname);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto max-w-[1600px] px-4 py-2.5 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-slate-400">
              <span className="text-[10px] font-black uppercase tracking-[0.28em]">
                Espace GBA
              </span>
              <span className="text-[10px]">/</span>
              <span className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-600 truncate">
                {title}
              </span>
            </div>
            <h1 className="mt-1 font-[var(--font-teko)] text-2xl font-black uppercase leading-none tracking-tight text-slate-900 sm:text-3xl">
              {subtitle.split(" ")[0]}{" "}
              <span className="text-blue-600">
                {subtitle.replace(`${subtitle.split(" ")[0]} `, "")}
              </span>
            </h1>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={onOpenSpotlight}
              className="group flex h-9 min-w-[250px] items-center justify-between rounded-xl border border-slate-200 bg-white px-3 text-left shadow-sm transition hover:border-blue-200"
            >
              <span className="flex items-center gap-2 text-slate-400 group-hover:text-slate-600">
                <Search className="h-4 w-4" />
                <span className="text-xs font-semibold">
                  Rechercher joueur, équipe, coach...
                </span>
              </span>
              <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                ⌘K
              </span>
            </button>

            <div
              ref={menuRef}
              className="relative flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1.5 shadow-sm"
            >
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50 hover:text-blue-700"
              >
                <Bell className="h-4 w-4" />
              </button>
              <div className="min-w-0 pr-1">
                <p className="max-w-[140px] truncate text-[10px] font-black uppercase tracking-widest text-slate-800">
                  {userName || "Utilisateur"}
                </p>
                {userEmail ? (
                  <p className="max-w-[140px] truncate text-[9px] text-slate-500">
                    {userEmail}
                  </p>
                ) : null}
              </div>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-blue-700">
                {roleLabelMap[role] ?? role}
              </span>
              <button
                type="button"
                aria-label="Ouvrir menu utilisateur"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
              >
                <ChevronDown className="h-4 w-4" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-11 z-50 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                  <Link
                    href="/"
                    onClick={() => setMenuOpen(false)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <Home className="h-4 w-4 text-slate-500" />
                    Retour au site public
                  </Link>
                  <form action={signOutDashboard}>
                    <button
                      type="submit"
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Se déconnecter
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between gap-3 sm:hidden">
          <button
            type="button"
            onClick={onOpenSpotlight}
            className="flex h-9 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-slate-500"
          >
            <Search className="h-4 w-4" />
            <span className="text-xs font-semibold">Recherche</span>
          </button>
          <span className="rounded-full bg-blue-100 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-blue-700">
            {roleLabelMap[role] ?? role}
          </span>
        </div>
      </div>
    </header>
  );
}
