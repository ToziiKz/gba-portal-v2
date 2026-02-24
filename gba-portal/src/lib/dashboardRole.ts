"use client";

import * as React from "react";

export type DashboardRole =
  | "coach"
  | "resp_pole"
  | "resp_equipements"
  | "resp_sportif"
  | "admin";

export const DASHBOARD_ROLE_STORAGE_KEY = "gba.dashboardRole";

const roleOrder: Record<DashboardRole, number> = {
  coach: 1,
  resp_pole: 2,
  resp_equipements: 2,
  resp_sportif: 3,
  admin: 4,
};

export function isAdminRole(role: DashboardRole) {
  return role === "admin";
}

export function readDashboardRoleFromStorage(): DashboardRole {
  if (typeof window === "undefined") return "coach";
  try {
    const stored = window.localStorage.getItem(DASHBOARD_ROLE_STORAGE_KEY);
    // Validate if stored value is a valid role
    if (stored && Object.keys(roleOrder).includes(stored)) {
      return stored as DashboardRole;
    }
  } catch {
    // ignore
  }
  return "coach"; // Default fallback changed from 'staff' to 'coach'
}

export function useDashboardRole() {
  const [role, setRole] = React.useState<DashboardRole>("coach");

  React.useEffect(() => {
    setRole(readDashboardRoleFromStorage());

    const onStorage = (e: StorageEvent) => {
      if (e.key !== DASHBOARD_ROLE_STORAGE_KEY) return;
      setRole(readDashboardRoleFromStorage());
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return role;
}
