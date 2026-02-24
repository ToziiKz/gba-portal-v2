# Sprint D Migration Notes

**Date:** 2026-02-14
**Modules Affected:** Stock, Licences, Staff, Categories, Competitions, Relances

## Summary

Successfully migrated the `stock`, `licences`, and `staff` dashboard modules from a mock/localStorage architecture to a database-first architecture using Supabase and Server Actions.

## Changes

### 1. Database Schema

Created / extended migrations:

- `src/lib/supabase/migrations/20260214_sprint_d_migration.sql`:
  - `stock_items`, `stock_movements`
  - `licences`, `licence_payments`
  - `staff_profiles`
  - helper functions + `updated_at` trigger
- `src/lib/supabase/migrations/20260215_finalize_migration.sql`:
  - `categories`
  - `competitions` (includes `status`)
  - `relances`
  - RLS + `updated_at` triggers

### 2. Code Refactoring

- **Stock Module** (`app/dashboard/stock`):
  - Converted `page.tsx` to Server Component.
  - Moved interactive logic to `StockClient.tsx`.
  - Added `actions.ts` for `getStockItems` and `updateStockQuantity`.
  - Removed `localStorage` persistence.
- **Licences Module** (`app/dashboard/licences`):
  - Converted `page.tsx` to Server Component.
  - Moved interactive logic to `LicencesClient.tsx`.
  - Added `actions.ts` for `getLicences`, `registerLicencePayment`, `resetLicencePayment`.
  - Removed `localStorage` persistence.
- **Staff Module** (`app/dashboard/staff`):
  - Converted `page.tsx` to Server Component.
  - Moved interactive logic to `StaffClient.tsx`.
  - Added `actions.ts` for `getStaffMembers`, `updateStaffAvailability`, `updateStaffDetails`.
  - Removed `localStorage` persistence and overrides.

### 3. Security

- Implemented Row Level Security (RLS) on all new tables.
- Added server-side role checks (`admin`, `staff`, `coach`) in all Server Actions.

## Instructions for Deployment

1. **Apply SQL Migration:**
   Run the SQL script `src/lib/supabase/migrations/20260214_sprint_d_migration.sql` in your Supabase SQL Editor.

2. **Seed Data (Optional):**
   The tables are created empty. You may want to import the data from `src/lib/mocks/` into the database if you want to preserve the mock data as initial state.

3. **Verify RLS:**
   Ensure your authenticated user has the correct role in `public.profiles.role` and is active (`is_active=true`).
   Current write rules:
   - Stock: `admin`, `staff`
   - Licences: `admin`, `staff`
   - Staff profiles: `admin`
