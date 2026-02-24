import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Match · GBA Dashboard",
};

const subModules = [
  {
    title: "Composition",
    description:
      "Construire le onze, définir les postes et préparer les variantes.",
    href: "/dashboard/tactique",
    cta: "Ouvrir Composition",
    badge: "Stratégie",
    accent: "from-blue-500/15 to-cyan-500/10",
  },
  {
    title: "Convocations",
    description:
      "Composer le groupe, notifier les joueurs et suivre les retours.",
    href: "/dashboard/convocations",
    cta: "Ouvrir Convocations",
    badge: "Organisation",
    accent: "from-emerald-500/15 to-teal-500/10",
  },
];

export default function MatchPage() {
  return (
    <div className="grid gap-6">
      <section className="relative overflow-hidden rounded-3xl border border-[color:var(--ui-border)] bg-[color:var(--ui-surface)] p-6 md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_220px_at_15%_0%,rgba(59,130,246,0.14),transparent_65%),radial-gradient(520px_220px_at_85%_10%,rgba(16,185,129,0.12),transparent_62%)]" />
        <div className="relative">
          <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-[color:var(--ui-muted-2)]">
            Module match
          </p>
          <h2 className="mt-3 font-[var(--font-teko)] text-4xl font-black uppercase tracking-[0.06em] text-[color:var(--ui-fg)] md:text-5xl">
            Centre de match
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-[color:var(--ui-muted)]">
            Un espace clair, visuel et orienté action pour préparer ton prochain
            match rapidement.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/dashboard/tactique">
              <Button>Commencer la composition</Button>
            </Link>
            <Link href="/dashboard/convocations">
              <Button variant="secondary">Préparer les convocations</Button>
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {subModules.map((item) => (
          <Card
            key={item.href}
            className="relative overflow-hidden rounded-3xl border border-[color:var(--ui-border)] bg-[color:var(--ui-surface)]"
          >
            <div
              className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${item.accent}`}
            />
            <div className="relative">
              <CardHeader>
                <span className="w-fit rounded-full border border-[color:var(--ui-border)] bg-[color:var(--ui-surface-2)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-[color:var(--ui-muted)]">
                  {item.badge}
                </span>
                <CardTitle className="mt-3">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={item.href}>
                  <Button>{item.cta}</Button>
                </Link>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
