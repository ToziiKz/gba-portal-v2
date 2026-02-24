"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/dashboard/authz";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2),
  category: z.string().min(1),
  gender: z.enum(["M", "F", "Mixte"]),
});

export async function createTeam(prevState: unknown, formData: FormData) {
  const { supabase, role } = await requireRole("coach");

  const data = {
    name: formData.get("name"),
    category: formData.get("category"),
    gender: formData.get("gender"),
  };

  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    return { message: "Données invalides" };
  }
  if (role === "admin") {
    const { error } = await supabase.from("teams").insert([parsed.data]);
    if (error) return { message: "Erreur lors de la création" };
    revalidatePath("/dashboard/equipes");
    return { message: "Équipe créée !", success: true };
  }

  // Club setup: teams are fixed. Only admin can create teams.
  return { message: "Création d'équipe réservée à l'admin." };
}
