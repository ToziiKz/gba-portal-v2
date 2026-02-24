"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getDashboardScope } from "@/lib/dashboard/getDashboardScope";
import { log } from "@/lib/logger";

export type StaffMember = {
  id: string;
  fullName: string;
  role: string;
  pole: string;
  teamsLabel: string;
  phone: string | null;
  email: string | null;
  availability: "ok" | "limited" | "off";
  availabilityHint: string | null;
  tags: string[];
  updatedAtLabel: string;
  note: string | null;
};

function formatDate(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

export async function getStaffMembers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("staff_profiles")
    .select("*")
    .order("full_name", { ascending: true });

  if (error) {
    log.error("Error fetching staff:", error);
    return [];
  }

  return (data || []).map(
    (item: {
      id: string;
      full_name: string;
      role: string;
      pole: string;
      teams_label: string | null;
      phone: string | null;
      email: string | null;
      availability: "ok" | "limited" | "off";
      availability_hint: string | null;
      tags: string[] | null;
      updated_at: string;
      note: string | null;
    }) => ({
      id: item.id,
      fullName: item.full_name,
      role: item.role,
      pole: item.pole,
      teamsLabel: item.teams_label ?? "",
      phone: item.phone,
      email: item.email,
      availability: item.availability as "ok" | "limited" | "off",
      availabilityHint: item.availability_hint,
      tags: item.tags || [],
      updatedAtLabel: formatDate(item.updated_at),
      note: item.note,
    }),
  ) as StaffMember[];
}

export async function updateStaffAvailability(
  id: string,
  availability: "ok" | "limited" | "off",
) {
  const scope = await getDashboardScope();
  if (!["admin", "staff", "coach"].includes(scope.role)) {
    return { error: "Unauthorized" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("staff_profiles")
    .update({
      availability,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { error: "Failed to update availability" };
  }

  revalidatePath("/dashboard/staff");
  return { success: true };
}

export async function updateStaffDetails(
  id: string,
  data: { email?: string; phone?: string; note?: string },
) {
  const scope = await getDashboardScope();
  if (scope.role !== "admin") {
    return { error: "Unauthorized (Admin only)" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("staff_profiles")
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { error: "Failed to update details" };
  }

  revalidatePath("/dashboard/staff");
  return { success: true };
}
