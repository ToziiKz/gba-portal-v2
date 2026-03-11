"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";

import { activateCoachAccount } from "./actions";
import { Button } from "@/components/ui/Button";

type ActionState = { ok: boolean; error?: string };
const initialState: ActionState = { ok: false };

export function ActivateForm({
  invitationId,
  token,
  initialFullName = "",
  email = "",
  assignedTeamNames = [],
}: {
  invitationId?: string;
  token?: string;
  initialFullName?: string;
  email?: string;
  assignedTeamNames?: string[];
}) {
  const [state, formAction, isPending] = useActionState(
    activateCoachAccount,
    initialState,
  );

  useEffect(() => {
    if (!state.ok) return;

    const url = new URL(window.location.href);
    if (!url.searchParams.has("token")) return;

    url.searchParams.delete("token");
    window.history.replaceState(
      {},
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
  }, [state.ok]);

  if (!invitationId || !token) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
        Lien d&apos;activation invalide ou expiré.
      </div>
    );
  }

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="invitationId" value={invitationId} />
      <input type="hidden" name="token" value={token} />

      {state.ok ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">
          Compte créé avec succès. Vous pouvez vous connecter immédiatement.
          <div className="mt-3">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-3 py-2 text-xs font-black uppercase tracking-widest text-white hover:bg-emerald-700"
            >
              Aller à la connexion
            </Link>
          </div>
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
          value={initialFullName || "Nom défini par invitation"}
          readOnly
          className="w-full rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white/85 outline-none"
        />
      </label>

      <label className="grid gap-2">
        <span className="text-xs uppercase tracking-widest text-white/60">
          Email
        </span>
        <input
          value={email}
          readOnly
          className="w-full rounded-2xl border border-white/15 bg-black/20 px-4 py-3 text-sm text-white/85 outline-none"
        />
      </label>

      {assignedTeamNames.length > 0 && (
        <div className="rounded-2xl border border-white/15 bg-black/20 p-3">
          <p className="text-xs uppercase tracking-widest text-white/60 mb-2">
            Équipes pré-assignées
          </p>
          <div className="flex flex-wrap gap-2">
            {assignedTeamNames.map((team) => (
              <span
                key={team}
                className="rounded-xl bg-white/10 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-white/80"
              >
                {team}
              </span>
            ))}
          </div>
        </div>
      )}

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

      <label className="grid gap-2">
        <span className="text-xs uppercase tracking-widest text-white/60">
          Confirmer le mot de passe
        </span>
        <input
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white/85 outline-none placeholder:text-white/30 focus:border-white/30 focus:ring-2 focus:ring-[#00A1FF]"
          placeholder="Retapez le mot de passe"
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
