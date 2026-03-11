# Stripe Setup (Safe Additive)

This integration is additive and does not replace existing shop flows until you wire UI triggers.

## Environment variables

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_ALLOWED_PRICE_IDS` (comma-separated list of allowed Stripe Price IDs)
- `NEXT_PUBLIC_SITE_URL`

## Endpoints

- `POST /api/stripe/create-checkout-session`
  - body:
    ```json
    {
      "items": [{ "priceId": "price_...", "quantity": 1 }],
      "customerEmail": "buyer@example.com"
    }
    ```

- `POST /api/stripe/webhook`
  - verifies Stripe signature
  - currently safe no-op on events (prepared for order persistence enablement)

## Test quickly

```bash
curl -X POST http://localhost:3000/api/stripe/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{"items":[{"priceId":"price_xxx","quantity":1}]}'
```

If `STRIPE_ALLOWED_PRICE_IDS` does not include the price, endpoint returns 400.

## Database foundation

Run migration:
- `src/lib/supabase/migrations/20260302_shop_orders_foundation.sql`

Tables created:
- `orders`
- `order_items`
