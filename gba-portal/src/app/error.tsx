"use client";

import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[70vh] bg-gradient-to-b from-[#020202] via-[#050505] to-black px-6 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs uppercase tracking-[0.6em] text-white/60">
          Incident
        </p>
        <h1 className="mt-4 font-[var(--font-teko)] text-5xl font-black tracking-[0.06em] text-white">
          Quelque chose a cassé.
        </h1>
        <p className="mt-4 text-sm text-white/70">
          Pas de panique — on peut relancer la page. Si le problème persiste,
          contactez-nous.
        </p>

        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <button
            type="button"
            onClick={() => reset()}
            className="btn-premium rounded-full border border-white/40 bg-gradient-to-r from-[#00a1ff] to-[#0065bd] px-6 py-3 text-xs font-black uppercase tracking-[0.5em] text-white shadow-[0_15px_50px_rgba(0,161,255,0.35)]"
          >
            Réessayer
          </button>
          <Link
            href="/"
            className="rounded-full border border-white/25 bg-white/5 px-6 py-3 text-xs font-semibold uppercase tracking-[0.5em] text-white/90 hover:border-white/40 hover:bg-white/10"
          >
            Retour à l’accueil
          </Link>
        </div>

        {error?.digest ? (
          <p className="mt-10 text-xs text-white/40">Code: {error.digest}</p>
        ) : null}
      </div>
    </div>
  );
}
