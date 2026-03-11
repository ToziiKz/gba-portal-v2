interface ProductCardProps {
  name: string;
  priceHint: string;
  detail: string;
  cta: string;
  contactEmail?: string;
}

export function ProductCard({
  name,
  priceHint,
  detail,
  cta,
  contactEmail = "contact@gba-portal.fr",
}: ProductCardProps) {
  const mailtoBase = `mailto:${contactEmail}`;
  const subject = encodeURIComponent(`Précommande — ${name}`);
  const body = encodeURIComponent(
    `Bonjour,\n\nJe souhaite précommander : ${name}.\n\n- Nom :\n- Article : ${name}\n- Taille (si applicable) :\n- Quantité :\n- Flocage (optionnel) :\n- Téléphone (optionnel) :\n\nMerci !`,
  );

  return (
    <article className="flex flex-col justify-between rounded-3xl border border-white/10 p-6 transition-colors hover:border-white/20 bg-white/[0.02]">
      <div>
        <p className="text-xs font-bold text-white/40">{priceHint}</p>
        <h3 className="mt-3 text-xl font-bold text-white font-[family-name:var(--font-teko)] tracking-wide">
          {name}
        </h3>
        <p className="mt-3 text-sm text-white/60">{detail}</p>
      </div>
      <a
        className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-white/10 px-5 py-3 text-center text-xs font-bold text-white transition hover:bg-white hover:text-black uppercase tracking-widest"
        href={`${mailtoBase}?subject=${subject}&body=${body}`}
      >
        {cta}
      </a>
    </article>
  );
}
