import { Suspense } from "react";
import { getStockItems } from "./actions";
import { StockClient } from "./StockClient";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";

export default async function DashboardStockPage() {
  const stockItems = await getStockItems();

  return (
    <Suspense fallback={<StockLoading />}>
      <StockClient initialStock={stockItems} />
    </Suspense>
  );
}

function StockLoading() {
  return (
    <div className="grid gap-6">
      <div>
        <p className="text-xs uppercase tracking-[0.6em] text-white/60">
          Module
        </p>
        <h2 className="mt-3 font-[var(--font-teko)] text-3xl font-black tracking-[0.06em] text-white md:text-4xl">
          Stock & matériel
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-white/70">
          Chargement de l’inventaire…
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="premium-card card-shell rounded-3xl">
            <CardHeader>
              <CardDescription className="h-4 w-24 animate-pulse rounded bg-white/10" />
              <CardTitle className="h-8 w-16 animate-pulse rounded bg-white/10" />
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card className="premium-card card-shell rounded-3xl p-0">
        <div className="border-b border-white/10 px-4 py-3">
          <h3 className="text-sm font-semibold text-white">Inventaire</h3>
        </div>
        <div className="grid gap-3 px-4 py-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[92px] animate-pulse rounded-2xl border border-white/10 bg-white/5"
            />
          ))}
        </div>
      </Card>
    </div>
  );
}
