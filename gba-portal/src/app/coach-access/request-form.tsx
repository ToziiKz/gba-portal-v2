"use client";

import * as React from "react";
import { useActionState } from "react";

import { submitCoachAccessRequest } from "./actions";
import { Button } from "@/components/ui/Button";

type ActionState = { ok: boolean; error?: string };

const initialState: ActionState = { ok: false };

export function CoachAccessForm({ teamOptions }: { teamOptions: string[] }) {
  const [state, formAction, isPending] = useActionState(
    submitCoachAccessRequest,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-4">
      {state.ok ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">
          Demande envoyée. Un admin va la valider avant envoi du lien
          d’activation.
        </div>
      ) : null}

      {state.error ? (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-100">
          {state.error}
        </div>
      ) : null}

      <label className="grid gap-2">
        <span className="text-xs uppercase tracking-widest text-white/60">
          Nom complet *
        </span>
        <input
          name="fullName"
          required
          className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white/85 outline-none placeholder:text-white/30 focus:border-white/30 focus:ring-2 focus:ring-[#00A1FF]"
          placeholder="Prénom Nom"
        />
      </label>

      <label className="grid gap-2">
        <span className="text-xs uppercase tracking-widest text-white/60">
          Email *
        </span>
        <input
          name="email"
          type="email"
          required
          className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white/85 outline-none placeholder:text-white/30 focus:border-white/30 focus:ring-2 focus:ring-[#00A1FF]"
          placeholder="coach@club.fr"
        />
      </label>

      <label className="grid gap-2">
        <span className="text-xs uppercase tracking-widest text-white/60">
          Téléphone
        </span>
        <input
          name="phone"
          className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white/85 outline-none placeholder:text-white/30 focus:border-white/30 focus:ring-2 focus:ring-[#00A1FF]"
          placeholder="06..."
        />
      </label>

      <label className="grid gap-2">
        <span className="text-xs uppercase tracking-widest text-white/60">
          Équipe souhaitée
        </span>
        <select
          name="requestedTeam"
          defaultValue=""
          disabled={teamOptions.length === 0}
          className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white/85 outline-none focus:border-white/30 focus:ring-2 focus:ring-[#00A1FF] disabled:opacity-60"
        >
          <option value="">
            {teamOptions.length === 0
              ? "Aucune équipe disponible"
              : "Sélectionner une équipe"}
          </option>
          {teamOptions.map((team) => (
            <option key={team} value={team}>
              {team}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-2">
        <span className="text-xs uppercase tracking-widest text-white/60">
          Message (optionnel)
        </span>
        <textarea
          name="message"
          rows={4}
          className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-sm text-white/85 outline-none placeholder:text-white/30 focus:border-white/30 focus:ring-2 focus:ring-[#00A1FF]"
          placeholder="Contexte, disponibilités, infos complémentaires..."
        />
      </label>

      <Button
        type="submit"
        disabled={isPending}
        className="mt-2 w-full rounded-full bg-gradient-to-r from-[#00a1ff] to-[#0065bd] py-6 text-base font-bold shadow-[0_15px_50px_rgba(0,161,255,0.45)] hover:opacity-90"
      >
        {isPending ? "Envoi..." : "Envoyer la demande"}
      </Button>
    </form>
  );
}
