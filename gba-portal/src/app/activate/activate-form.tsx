"use client";

import { useActionState, useEffect } from "react";

import { activateCoachAccount } from "./actions";
import { Button } from "@/components/ui/Button";

type ActionState = { ok: boolean; error?: string };
const initialState: ActionState = { ok: false };

export function ActivateForm({
  invitationId,
  token,
  initialFullName = "",
}: {
  invitationId?: string;
  token?: string;
  initialFullName?: string;
}) {
  const [state, formAction, isPending] = useActionState(
    activateCoachAccount,
    initialState,
  );

  useEffect(() => {
    if (!invitationId || !token) return;

    const url = new URL(window.location.href);
    if (!url.searchParams.has("token")) return;

    url.searchParams.delete("token");
    window.history.replaceState(
      {},
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
  }, [invitationId, token]);

  if (!invitationId || !token) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
        Lien d’activation invalide.
      </div>
    );
  }

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="invitationId" value={invitationId} />
      <input type="hidden" name="token" value={token} />

      {state.ok ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">
          Compte créé. Vérifiez votre boîte mail et confirmez votre adresse,
          puis connectez-vous.
        </div>
      ) : null}
      {state.error ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-100">
          {state.error}
        </div>
      ) : null}

      <label className="grid gap-2">
        <span className="text-xs uppercase tracking-widest text-white/60">
          Nom complet
        </span>
        <input
          name="fullName"
          required
          defaultValue={initialFullName}
          className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white/85 outline-none placeholder:text-white/30 focus:border-white/30 focus:ring-2 focus:ring-[#00A1FF]"
          placeholder="Prénom Nom"
        />
      </label>

      <label className="grid gap-2">
        <span className="text-xs uppercase tracking-widest text-white/60">
          Mot de passe
        </span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white/85 outline-none placeholder:text-white/30 focus:border-white/30 focus:ring-2 focus:ring-[#00A1FF]"
          placeholder="8 caractères minimum"
        />
      </label>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-gradient-to-r from-[#00a1ff] to-[#0065bd] py-6 text-base font-bold shadow-[0_15px_50px_rgba(0,161,255,0.45)] hover:opacity-90"
      >
        {isPending ? "Activation..." : "Activer mon compte"}
      </Button>
    </form>
  );
}
