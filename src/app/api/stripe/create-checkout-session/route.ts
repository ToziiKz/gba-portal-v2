import { NextResponse } from "next/server";

import { getAllowedPriceIds, getBaseUrl, getStripeServer } from "@/lib/stripe";

type Payload = {
  items?: Array<{ priceId: string; quantity?: number }>;
  customerEmail?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Payload;
    const items = body.items ?? [];

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Panier vide" }, { status: 400 });
    }

    const allowed = getAllowedPriceIds();
    if (allowed.size === 0) {
      return NextResponse.json(
        { error: "Stripe non configuré (STRIPE_ALLOWED_PRICE_IDS manquant)." },
        { status: 503 },
      );
    }

    const line_items = items.map((item) => {
      const price = String(item.priceId ?? "").trim();
      const quantity = Math.max(
        1,
        Math.min(99, Number(item.quantity ?? 1) || 1),
      );

      if (!allowed.has(price)) {
        throw new Error(`PRICE_NOT_ALLOWED:${price}`);
      }

      return { price, quantity };
    });

    const stripe = getStripeServer();
    const base = getBaseUrl();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      customer_email: body.customerEmail,
      success_url: `${base}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/shop/cancel`,
      billing_address_collection: "auto",
      allow_promotion_codes: true,
      metadata: {
        source: "gba-shop",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    const status = message.startsWith("PRICE_NOT_ALLOWED:") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
