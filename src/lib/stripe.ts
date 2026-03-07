import Stripe from "stripe";

let cached: Stripe | null = null;

export function getStripeServer() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }

  if (!cached) {
    cached = new Stripe(key, {
      apiVersion: "2026-02-25.clover",
      typescript: true,
    });
  }

  return cached;
}

export function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    "http://localhost:3000"
  );
}

export function getAllowedPriceIds() {
  const raw = process.env.STRIPE_ALLOWED_PRICE_IDS ?? "";
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
}
