# Public continuous improvement — 2026-02-11

## Chosen improvement

Strengthen internal linking to `/shop` from the landing page without adding heavy sections.

## What changed

- Landing (`/`):
  - Refined the existing formation paragraph link text to be clearer ("boutique officielle du GBA").
  - Added a discreet inline link to `/shop` in the sponsors section intro copy (helps users find the shop from another high-intent section).

## Files modified

- `src/app/page.tsx`

## Notes / validation

- `npm run lint -- --max-warnings=0`
- `npm run build`

## Quick test plan

- Visit `/` and scroll to **Nos Partenaires** section; verify the new inline link goes to `/shop`.
- Check the **Formation GBA** paragraph link wording and hover/underline styles.
- Confirm no layout shift / wrapping issues on mobile.
