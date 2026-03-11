"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireRole } from "@/lib/dashboard/authz";

export async function updateEffectifClubPlayer(formData: FormData) {
  const { supabase } = await requireRole("admin");

  const playerUid = String(formData.get("player_uid") ?? "").trim();
  const originalLicense = String(formData.get("original_license") ?? "").trim();

  if (!playerUid && !originalLicense) {
    redirect(
      "/dashboard/effectif-club?err=" +
        encodeURIComponent("Identifiant joueur manquant pour la mise à jour."),
    );
  }

  const payload = {
    license: String(formData.get("license") ?? "").trim() || null,
    firstname: String(formData.get("firstname") ?? "").trim() || null,
    lastname: String(formData.get("lastname") ?? "").trim() || null,
    gender: String(formData.get("gender") ?? "").trim() || null,
    category: String(formData.get("category") ?? "").trim() || null,
    mutation: String(formData.get("mutation") ?? "").trim() || null,
    debut_mutation: String(formData.get("debut_mutation") ?? "").trim() || null,
    fin_mutation: String(formData.get("fin_mutation") ?? "").trim() || null,
    mobile: String(formData.get("mobile") ?? "").trim() || null,
    email: String(formData.get("email") ?? "").trim() || null,
    resp_legal_1: String(formData.get("resp_legal_1") ?? "").trim() || null,
    adress_resp_legal_1:
      String(formData.get("adress_resp_legal_1") ?? "").trim() || null,
    zip_resp_legal_1:
      String(formData.get("zip_resp_legal_1") ?? "").trim() || null,
    city_resp_legal_1:
      String(formData.get("city_resp_legal_1") ?? "").trim() || null,
    mobile_resp_legal_1:
      String(formData.get("mobile_resp_legal_1") ?? "").trim() || null,
    email_resp_legal_1:
      String(formData.get("email_resp_legal_1") ?? "").trim() || null,
    resp_legal_2: String(formData.get("resp_legal_2") ?? "").trim() || null,
    adress_resp_legal_2:
      String(formData.get("adress_resp_legal_2") ?? "").trim() || null,
    zip_resp_legal_2:
      String(formData.get("zip_resp_legal_2") ?? "").trim() || null,
    city_resp_legal_2:
      String(formData.get("city_resp_legal_2") ?? "").trim() || null,
    mobile_resp_legal_2:
      String(formData.get("mobile_resp_legal_2") ?? "").trim() || null,
    email_resp_legal_2:
      String(formData.get("email_resp_legal_2") ?? "").trim() || null,
    team_id: String(formData.get("team_id") ?? "").trim() || null,
  };

  let updateQuery = supabase.from("players").update(payload);

  if (playerUid) {
    updateQuery = updateQuery.eq("player_uid", playerUid);
  } else {
    updateQuery = updateQuery.eq("license", originalLicense);
  }

  const { data, error } = await updateQuery.select("license").limit(1);

  if (error || !data || data.length === 0) {
    redirect(
      "/dashboard/effectif-club?err=" +
        encodeURIComponent(error?.message || "Mise à jour impossible."),
    );
  }

  const newLicense = data[0]?.license || originalLicense;

  revalidatePath("/dashboard/effectif-club");
  redirect(
    `/dashboard/effectif-club?player=${encodeURIComponent(newLicense)}&saved=1`,
  );
}
