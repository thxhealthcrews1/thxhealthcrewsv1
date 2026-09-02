/*
# Create globe_comments table (single-tenant, no auth)

1. New Tables
- `globe_comments`
  - `id` (uuid, primary key, auto-generated)
  - `created_at` (timestamptz, default now())
  - `city` (text, not null) — the city name entered by the user
  - `state` (text, not null) — the US state/region selected by the user
  - `comment` (text, not null) — the user's comment (max 200 chars enforced at app layer)
  - `pos_x` (double precision, not null) — 3D x coordinate on the globe surface
  - `pos_y` (double precision, not null) — 3D y coordinate on the globe surface
  - `pos_z` (double precision, not null) — 3D z coordinate on the globe surface

2. Security
- Enable RLS on `globe_comments`.
- Allow anon + authenticated full CRUD because the data is intentionally shared/public
  (any visitor can drop pins and see everyone's pins; no sign-in screen).

3. Important Notes
- This is a single-tenant, no-auth app. There is no user_id column.
- All visitors read and write the same shared set of pins.
- The 3D position fields store where on the globe the pin was placed,
  so pins re-render at the correct location on reload.
*/

CREATE TABLE IF NOT EXISTS globe_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  city text NOT NULL,
  state text NOT NULL,
  comment text NOT NULL,
  pos_x double precision NOT NULL,
  pos_y double precision NOT NULL,
  pos_z double precision NOT NULL
);

ALTER TABLE globe_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_globe_comments" ON globe_comments;
CREATE POLICY "anon_select_globe_comments" ON globe_comments FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_globe_comments" ON globe_comments;
CREATE POLICY "anon_insert_globe_comments" ON globe_comments FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_globe_comments" ON globe_comments;
CREATE POLICY "anon_update_globe_comments" ON globe_comments FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_globe_comments" ON globe_comments;
CREATE POLICY "anon_delete_globe_comments" ON globe_comments FOR DELETE
  TO anon, authenticated USING (true);