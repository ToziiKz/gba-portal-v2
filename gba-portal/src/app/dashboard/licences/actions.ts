"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getDashboardScope } from "@/lib/dashboard/getDashboardScope";
import { log } from "@/lib/logger";

export type LicenceRow = {
  id: string;
  playerName: string;
  team: string;
  category: string;
  pole: string;
  status: "unpaid" | "partial" | "paid";
  amountTotalEur: number;
  amountPaidEur: number;
  dueDateLabel: string;
  isOverdue: boolean;
  updatedAtLabel: string;
  contactName: string;
  contactEmail: string | null;
  contactPhone: string | null;
  lastPaymentMethod: string | null;
};

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

function deriveStatus(
  amountPaid: number,
  amountTotal: number,
): "unpaid" | "partial" | "paid" {
  if (amountPaid <= 0) return "unpaid";
  if (amountPaid >= amountTotal) return "paid";
  return "partial";
}

export async function getLicences() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("licences")
    .select("*")
    .order("player_name", { ascending: true });

  if (error) {
    log.error("Error fetching licences:", error);
    return [];
  }

  return (data || []).map(
    (item: {
      id: string;
      player_name: string;
      team: string;
      category: string;
      pole: string;
      amount_total_eur: number;
      amount_paid_eur: number;
      due_date: string | null;
      updated_at: string;
      contact_name: string;
      contact_email: string | null;
      contact_phone: string | null;
      last_payment_method: string | null;
    }) => {
      const isOverdue = item.due_date
        ? new Date(item.due_date) < new Date() &&
          item.amount_paid_eur < item.amount_total_eur
        : false;
      return {
        id: item.id,
        playerName: item.player_name,
        team: item.team,
        category: item.category,
        pole: item.pole,
        status: deriveStatus(item.amount_paid_eur, item.amount_total_eur),
        amountTotalEur: item.amount_total_eur,
        amountPaidEur: item.amount_paid_eur,
        dueDateLabel: formatDate(item.due_date),
        isOverdue,
        updatedAtLabel: formatDate(item.updated_at),
        contactName: item.contact_name,
        contactEmail: item.contact_email,
        contactPhone: item.contact_phone,
        lastPaymentMethod: item.last_payment_method,
      };
    },
  ) as LicenceRow[];
}

export async function registerLicencePayment(
  licenceId: string,
  amount: number,
  method: string,
  note: string,
) {
  const scope = await getDashboardScope();
  if (!["admin", "staff"].includes(scope.role)) {
    return { error: "Unauthorized" };
  }

  const supabase = await createClient();

  // 1. Get licence
  const { data: licence, error: fetchError } = await supabase
    .from("licences")
    .select("amount_paid_eur, amount_total_eur")
    .eq("id", licenceId)
    .single();

  if (fetchError || !licence) {
    return { error: "Licence not found" };
  }

  const newPaid = licence.amount_paid_eur + amount;
  const newStatus = deriveStatus(newPaid, licence.amount_total_eur);

  // 2. Update licence
  const { error: updateError } = await supabase
    .from("licences")
    .update({
      amount_paid_eur: newPaid,
      status: newStatus,
      last_payment_method: method,
      updated_at: new Date().toISOString(),
    })
    .eq("id", licenceId);

  if (updateError) {
    return { error: "Failed to update licence" };
  }

  // 3. Record payment
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("licence_payments").insert({
    licence_id: licenceId,
    amount,
    method,
    note,
    recorded_by: user?.id,
  });

  revalidatePath("/dashboard/licences");
  return { success: true };
}

export async function resetLicencePayment(licenceId: string) {
  const scope = await getDashboardScope();
  if (!["admin", "staff"].includes(scope.role)) {
    return { error: "Unauthorized" };
  }

  const supabase = await createClient();

  // 1. Get licence to reset
  const { error: updateError } = await supabase
    .from("licences")
    .update({
      amount_paid_eur: 0,
      status: "unpaid",
      last_payment_method: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", licenceId);

  if (updateError) {
    return { error: "Failed to reset licence" };
  }

  // Optional: Delete payments or mark as annulled?
  // For now, let's just leave history or maybe delete?
  // Let's delete for a hard reset as implied by "reset".
  await supabase.from("licence_payments").delete().eq("licence_id", licenceId);

  revalidatePath("/dashboard/licences");
  return { success: true };
}
