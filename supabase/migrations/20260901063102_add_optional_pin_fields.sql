/*
# Add optional pin fields: medical center, date, initials

1. Modified Tables
- `globe_comments`
  - Added `medical_center` (text, nullable) — name of the medical center / hospital
  - Added `visit_date` (date, nullable) — the date of the visit/event
  - Added `initials` (text, nullable) — the person's initials

2. Security
- No changes to RLS or existing policies. The table already has
  anon + authenticated CRUD policies (single-tenant, no auth).
  The new columns inherit the existing row-level security.

3. Important Notes
- All three new columns are nullable so existing pins are unaffected.
- No user data is modified or lost — this is additive only.
- Idempotent: uses DO $$ ... IF NOT EXISTS ... END $$ so re-running is safe.
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'globe_comments' AND column_name = 'medical_center') THEN
    ALTER TABLE globe_comments ADD COLUMN medical_center text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'globe_comments' AND column_name = 'visit_date') THEN
    ALTER TABLE globe_comments ADD COLUMN visit_date date;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'globe_comments' AND column_name = 'initials') THEN
    ALTER TABLE globe_comments ADD COLUMN initials text;
  END IF;
END $$;