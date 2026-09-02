/*
# Create suggestions table (single-tenant, no auth)

1. New Tables
- `suggestions`
  - `id` (uuid, primary key)
  - `text` (text, not null) — the user's suggestion text
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `suggestions`.
- Allow anon + authenticated to INSERT only (people can submit suggestions but not read/delete them).
*/

CREATE TABLE IF NOT EXISTS suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_suggestions" ON suggestions;
CREATE POLICY "anon_insert_suggestions"
ON suggestions FOR INSERT
TO anon, authenticated WITH CHECK (true);