"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { log } from "@/lib/logger";

export type Relance = {
  id: string;
  kind: string;
  pole: string;
  category: string;
  team: string;
  player_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  channel_hint: string;
  last_action_label: string;
  amount_due_eur?: number;
  due_date?: string;
  equipment_todo_label?: string;
  note?: string;
  status: string;
  created_at: string;
};

export async function getRelances() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("relances")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    log.error("Error fetching relances:", error);
    return [];
  }
  return data as Relance[];
}

export async function createRelance(formData: FormData) {
  const supabase = await createClient();

  const kind = formData.get("kind") as string;
  const pole = formData.get("pole") as string;
  const category = formData.get("category") as string;
  const team = formData.get("team") as string;
  const player_name = formData.get("player_name") as string;
  const contact_name = formData.get("contact_name") as string;
  const contact_email = formData.get("contact_email") as string;
  const contact_phone = formData.get("contact_phone") as string;
  const channel_hint = formData.get("channel_hint") as string;
  const amount_due_eur = parseFloat(
    (formData.get("amount_due_eur") as string) || "0",
  );
  const due_date = formData.get("due_date") as string;
  const equipment_todo_label = formData.get("equipment_todo_label") as string;
  const note = formData.get("note") as string;

  const { error } = await supabase.from("relances").insert({
    kind,
    pole,
    category,
    team,
    player_name,
    contact_name,
    contact_email,
    contact_phone,
    channel_hint,
    amount_due_eur: amount_due_eur || null,
    due_date: due_date || null,
    equipment_todo_label,
    note,
    status: "pending",
  });

  if (error) {
    log.error("Error creating relance:", error);
    throw new Error("Failed to create relance");
  }

  revalidatePath("/dashboard/relances");
}

export async function updateRelanceStatus(id: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("relances")
    .update({ status })
    .eq("id", id);

  if (error) {
    log.error("Error updating relance status:", error);
    throw new Error("Failed to update status");
  }
  revalidatePath("/dashboard/relances");
}

export async function deleteRelance(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("relances").delete().eq("id", id);

  if (error) {
    log.error("Error deleting relance:", error);
    throw new Error("Failed to delete relance");
  }
  revalidatePath("/dashboard/relances");
}
