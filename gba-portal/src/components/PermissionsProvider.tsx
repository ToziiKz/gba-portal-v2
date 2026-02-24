'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import type { DashboardRole } from '@/lib/dashboardRole'

export type Role = DashboardRole

interface PermissionsContextType {
  role: Role
  canEdit: boolean
  canDelete: boolean
  canViewMoney: boolean
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined)

export function PermissionsProvider({ children, role }: { children: ReactNode; role: Role }) {
  // Mapping roles to permissions
  // Adjust these rules based on business logic for V1
  const permissions: Record<Role, Omit<PermissionsContextType, 'role'>> = {
    admin: { canEdit: true, canDelete: true, canViewMoney: true },
    resp_sportif: { canEdit: true, canDelete: true, canViewMoney: true }, // Inherits staff powers
    resp_equipements: { canEdit: true, canDelete: false, canViewMoney: true }, // Needs money/edit for stock
    resp_pole: { canEdit: true, canDelete: false, canViewMoney: false },
    coach: { canEdit: true, canDelete: false, canViewMoney: false },
  }

  // Safety fallback if role is unknown (should be caught by authz before)
  const safePerms = permissions[role] || { canEdit: false, canDelete: false, canViewMoney: false }

  return (
    <PermissionsContext.Provider value={{ role, ...safePerms }}>
      {children}
    </PermissionsContext.Provider>
  )
}

export function usePermissions() {
  const context = useContext(PermissionsContext)
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider')
  }
  return context
}
