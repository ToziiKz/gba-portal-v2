"use client";

import React, { createContext, useContext, ReactNode } from "react";
import type { DashboardRole } from "@/lib/dashboardRole";
import type { DashboardScope as OriginalScope } from "@/lib/dashboard/getDashboardScope";

// Re-export type but force role alignment
export type DashboardScope = Omit<OriginalScope, "role"> & {
  role: DashboardRole;
};

const ScopeContext = createContext<DashboardScope | undefined>(undefined);

export function DashboardScopeProvider({
  children,
  scope,
}: {
  children: ReactNode;
  scope: DashboardScope;
}) {
  return (
    <ScopeContext.Provider value={scope}>{children}</ScopeContext.Provider>
  );
}

export function useDashboardScope() {
  const context = useContext(ScopeContext);
  if (!context) {
    throw new Error(
      "useDashboardScope must be used within a DashboardScopeProvider",
    );
  }
  return context;
}
