import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-20 text-center">
      <p className="text-xs uppercase tracking-[0.6em] text-white/50">404</p>
      <h1 className="mt-4 font-[var(--font-teko)] text-5xl font-black tracking-[0.06em] text-white">
        Page introuvable
      </h1>
      <p className="mt-4 max-w-xl text-sm text-white/70">
        Cette page n’existe pas (ou a été déplacée). Retour à l’accueil ou
        connexion à l’espace staff.
      </p>

      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
        <Link
          href="/"
          className="rounded-full border border-white/35 bg-white/5 px-6 py-3 text-xs font-black uppercase tracking-[0.45em] text-white/85 hover:border-white/60 hover:bg-white/10"
        >
          Accueil
        </Link>
        <Link
          href="/login"
          className="rounded-full border border-white/35 bg-gradient-to-r from-[#00a1ff] to-[#0065bd] px-6 py-3 text-xs font-black uppercase tracking-[0.45em] text-white shadow-[0_15px_50px_rgba(0,161,255,0.4)]"
        >
          Login
        </Link>
      </div>
    </div>
  );
}
