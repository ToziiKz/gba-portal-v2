import Link from "next/link";

export default async function ShopSuccessPage({
  searchParams,
}: {
  searchParams?: Promise<{ session_id?: string }>;
}) {
  const params = (await searchParams) ?? {};

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8">
        <p className="text-xs font-black uppercase tracking-widest text-emerald-700">
          Paiement confirmé
        </p>
        <h1 className="mt-2 text-3xl font-black text-slate-900">
          Merci pour votre commande 💙
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          Votre paiement a bien été pris en compte.
        </p>
        {params.session_id ? (
          <p className="mt-2 text-xs text-slate-500">
            Référence Stripe: <code>{params.session_id}</code>
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/shop"
            className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black uppercase tracking-widest text-white hover:bg-emerald-700"
          >
            Retour boutique
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-700 hover:bg-slate-50"
          >
            Retour accueil
          </Link>
        </div>
      </div>
    </main>
  );
}
