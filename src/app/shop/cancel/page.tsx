import Link from "next/link";

export default function ShopCancelPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8">
        <p className="text-xs font-black uppercase tracking-widest text-amber-700">
          Paiement annulé
        </p>
        <h1 className="mt-2 text-3xl font-black text-slate-900">
          Votre commande n&apos;a pas été finalisée
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          Aucun débit n&apos;a été effectué. Vous pouvez revenir à la boutique
          et réessayer quand vous voulez.
        </p>

        <div className="mt-6">
          <Link
            href="/shop"
            className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-black uppercase tracking-widest text-white hover:bg-amber-700"
          >
            Retour boutique
          </Link>
        </div>
      </div>
    </main>
  );
}
