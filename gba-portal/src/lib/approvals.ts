"use client";

import type { DashboardRole } from "@/lib/dashboardRole";

export type ApprovalAction =
  | "planning.create"
  | "planning.update"
  | "planning.delete"
  | "player.create"
  | "attendance.save"
  | "stock.create"
  | "stock.update"
  | "stock.movement"
  | "competition.create_result"
  | "licence.renew"
  | "licence.payment"
  | "staff.update";

export type ApprovalRequest = {
  id: string;
  createdAt: number;
  createdAtLabel: string;
  authorRole: DashboardRole;
  action: ApprovalAction;
  payload: unknown;
  status: "pending" | "approved" | "rejected";
  decidedAt?: number;
  decidedAtLabel?: string;
  adminNote?: string;
};

export const APPROVALS_STORAGE_KEY = "gba-dashboard-approvals-v1";

function nowLabel() {
  return "à l'instant";
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function listApprovalRequests(): ApprovalRequest[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(APPROVALS_STORAGE_KEY);
  return safeParse<ApprovalRequest[]>(raw, []);
}

function emitApprovalsChanged() {
  try {
    window.dispatchEvent(new Event("gba:approvals"));
  } catch {
    // ignore
  }
}

function saveApprovalRequests(all: ApprovalRequest[]) {
  window.localStorage.setItem(APPROVALS_STORAGE_KEY, JSON.stringify(all));
  emitApprovalsChanged();
}

export function createApprovalRequest(params: {
  authorRole: DashboardRole;
  action: ApprovalAction;
  payload: unknown;
}): ApprovalRequest {
  const req: ApprovalRequest = {
    id: `apr-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    createdAt: Date.now(),
    createdAtLabel: nowLabel(),
    authorRole: params.authorRole,
    action: params.action,
    payload: params.payload,
    status: "pending",
  };

  const all = listApprovalRequests();
  saveApprovalRequests([req, ...all]);
  return req;
}

export function updateApprovalRequest(
  id: string,
  patch: Partial<ApprovalRequest>,
) {
  const all = listApprovalRequests();
  const next = all.map((r) => (r.id === id ? { ...r, ...patch } : r));
  saveApprovalRequests(next);
}

export function clearDecidedRequests() {
  const all = listApprovalRequests();
  saveApprovalRequests(all.filter((r) => r.status === "pending"));
}
