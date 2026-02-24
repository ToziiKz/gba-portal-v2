import type { Metadata } from "next";
import Link from "next/link";

import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Accès staff",
  description: "Accès staff GBA. Connectez-vous pour accéder au dashboard.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: "/login",
  },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{
    disabled?: string;
    no_profile?: string;
    role_invalid?: string;
  }>;
}) {
  const params = (await searchParams) ?? {};

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020202] via-[#050505] to-[#000000] px-6 py-24">
      <div className="mx-auto w-full max-w-md rounded-[2.5rem] border border-white/10 bg-white/5 p-8 shadow-[0_25px_90px_rgba(0,0,0,0.65)] backdrop-blur md:p-10">
        <p className="text-xs uppercase tracking-widest text-white/60">
          Espace staff
        </p>
        <h1 className="mt-4 font-[var(--font-teko)] text-4xl font-black tracking-[0.06em] text-white md:text-5xl">
          Accès staff
        </h1>
        <p className="mt-4 text-sm text-white/70">
          Connectez-vous pour gérer les équipes, le planning et les licences.
        </p>

        {params.disabled === "1" ? (
          <div className="mt-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-100">
            Votre compte coach est actuellement suspendu. Contactez un
            administrateur.
          </div>
        ) : null}

        {params.no_profile === "1" ? (
          <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100">
            Compte authentifié, mais aucun profil n&apos;est trouvé dans la
            table
            <code className="mx-1">profiles</code>. Ajoute ton utilisateur dans
            Supabase pour accéder au dashboard.
          </div>
        ) : null}

        {params.role_invalid === "1" ? (
          <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100">
            Le rôle du profil est invalide. Rôles acceptés : admin,
            resp_sportif, resp_pole, resp_equipements, coach.
          </div>
        ) : null}

        <div className="mt-8">
          <LoginForm />
        </div>

        <div className="mt-8 text-center space-y-2">
          <p>
            <Link
              href="/coach-access"
              className="text-xs font-semibold text-white/70 hover:text-white hover:underline"
            >
              Demander un accès coach
            </Link>
          </p>
          <p>
            <Link
              href="/"
              className="text-xs font-semibold text-white/40 hover:text-white hover:underline"
            >
              Retour au site public
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
