import { createHash } from "crypto";

import { createClient } from "@/lib/supabase/server";
import { ActivateForm } from "./activate-form";

export const metadata = {
  title: "Activation compte coach · GBA",
};

export default async function ActivatePage({
  searchParams,
}: {
  searchParams?: Promise<{ inv?: string; token?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const supabase = await createClient();

  let initialFullName = "";
  let email = "";
  let assignedTeamNames: string[] = [];

  if (params.inv && params.token) {
    const tokenHash = createHash("sha256")
      .update(String(params.token))
      .digest("hex");

    const { data: invPreview } = await supabase.rpc(
      "get_invitation_activation_preview",
      {
        p_invitation_id: params.inv,
        p_token_hash: tokenHash,
      },
    );

    const inv = (invPreview?.[0] ?? null) as {
      full_name: string;
      email: string;
      target_team_ids: string[];
    } | null;

    if (inv?.full_name) {
      initialFullName = inv.full_name;
      email = inv.email ?? "";

      const teamIds = (inv.target_team_ids ?? []) as string[];
      if (teamIds.length > 0) {
        const { data: teams } = await supabase
          .from("teams")
          .select("name")
          .in("id", teamIds);
        assignedTeamNames = (teams ?? []).map((t) => t.name);
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020202] via-[#050505] to-[#000000] px-6 py-24">
      <div className="mx-auto w-full max-w-md rounded-[2.5rem] border border-white/10 bg-white/5 p-8 shadow-[0_25px_90px_rgba(0,0,0,0.65)] backdrop-blur md:p-10">
        <p className="text-xs uppercase tracking-widest text-white/60">
          Activation coach
        </p>
        <h1 className="mt-4 font-[var(--font-teko)] text-4xl font-black tracking-[0.06em] text-white md:text-5xl">
          Créer le compte
        </h1>
        <p className="mt-4 text-sm text-white/70">
          Finalisez votre accès dashboard via le lien d’invitation transmis par
          un admin.
        </p>

        <div className="mt-8">
          <ActivateForm
            invitationId={params.inv}
            token={params.token}
            initialFullName={initialFullName}
            email={email}
            assignedTeamNames={assignedTeamNames}
          />
        </div>
      </div>
    </div>
  );
}
