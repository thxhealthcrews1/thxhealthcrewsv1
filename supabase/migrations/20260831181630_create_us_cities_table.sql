/*
# Create us_cities table (single-tenant, no auth)

1. New Tables
- `us_cities`
  - `id` (uuid, primary key, auto-generated)
  - `state_code` (text, not null) — US state code (e.g. 'CA', 'NY')
  - `city` (text, not null) — city name
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `us_cities`.
- Allow anon + authenticated read-only access since city data is public reference data.
- No insert/update/delete needed — cities are managed via migration.

3. Purpose
- Provides the dropdown list of cities filtered by the selected state
  when a user drops a pin on the globe.

4. Data
- Pre-populated with major cities for all 50 states + DC + PR.
*/

CREATE TABLE IF NOT EXISTS us_cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state_code text NOT NULL,
  city text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE us_cities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_us_cities" ON us_cities;
CREATE POLICY "anon_select_us_cities" ON us_cities FOR SELECT
  TO anon, authenticated USING (true);

-- Insert major cities per state (idempotent: only insert if table is empty)
INSERT INTO us_cities (state_code, city)
SELECT * FROM (VALUES
  ('AL','Birmingham'), ('AL','Montgomery'), ('AL','Mobile'), ('AL','Huntsville'), ('AL','Tuscaloosa'),
  ('AK','Anchorage'), ('AK','Fairbanks'), ('AK','Juneau'), ('AK','Wasilla'), ('AK','Sitka'),
  ('AZ','Phoenix'), ('AZ','Tucson'), ('AZ','Mesa'), ('AZ','Scottsdale'), ('AZ','Tempe'),
  ('AR','Little Rock'), ('AR','Fayetteville'), ('AR','Fort Smith'), ('AR','Springdale'), ('AR','Jonesboro'),
  ('CA','Los Angeles'), ('CA','San Diego'), ('CA','San Jose'), ('CA','San Francisco'), ('CA','Fresno'),
  ('CA','Sacramento'), ('CA','Long Beach'), ('CA','Oakland'), ('CA','Bakersfield'), ('CA','Anaheim'),
  ('CO','Denver'), ('CO','Colorado Springs'), ('CO','Aurora'), ('CO','Fort Collins'), ('CO','Boulder'),
  ('CT','Hartford'), ('CT','New Haven'), ('CT','Stamford'), ('CT','Bridgeport'), ('CT','Waterbury'),
  ('DE','Wilmington'), ('DE','Dover'), ('DE','Newark'), ('DE','Middletown'), ('DE','Smyrna'),
  ('FL','Jacksonville'), ('FL','Miami'), ('FL','Tampa'), ('FL','Orlando'), ('FL','St. Petersburg'),
  ('FL','Hialeah'), ('FL','Tallahassee'), ('FL','Fort Lauderdale'), ('FL','Naples'), ('FL','Gainesville'),
  ('GA','Atlanta'), ('GA','Augusta'), ('GA','Columbus'), ('GA','Savannah'), ('GA','Athens'),
  ('HI','Honolulu'), ('HI','Hilo'), ('HI','Kailua'), ('HI','Kapolei'), ('HI','Kaneohe'),
  ('ID','Boise'), ('ID','Meridian'), ('ID','Nampa'), ('ID','Idaho Falls'), ('ID','Pocatello'),
  ('IL','Chicago'), ('IL','Aurora'), ('IL','Naperville'), ('IL','Joliet'), ('IL','Rockford'),
  ('IL','Springfield'), ('IL','Elgin'), ('IL','Peoria'), ('IL','Champaign'), ('IL','Evanston'),
  ('IN','Indianapolis'), ('IN','Fort Wayne'), ('IN','Evansville'), ('IN','South Bend'), ('IN','Carmel'),
  ('IA','Des Moines'), ('IA','Cedar Rapids'), ('IA','Davenport'), ('IA','Sioux City'), ('IA','Iowa City'),
  ('KS','Wichita'), ('KS','Overland Park'), ('KS','Kansas City'), ('KS','Olathe'), ('KS','Topeka'),
  ('KY','Louisville'), ('KY','Lexington'), ('KY','Bowling Green'), ('KY','Owensboro'), ('KY','Covington'),
  ('LA','New Orleans'), ('LA','Baton Rouge'), ('LA','Shreveport'), ('LA','Lafayette'), ('LA','Lake Charles'),
  ('ME','Portland'), ('ME','Lewiston'), ('ME','Bangor'), ('ME','South Portland'), ('ME','Auburn'),
  ('MD','Baltimore'), ('MD','Frederick'), ('MD','Rockville'), ('MD','Gaithersburg'), ('MD','Annapolis'),
  ('MA','Boston'), ('MA','Worcester'), ('MA','Springfield'), ('MA','Cambridge'), ('MA','Lowell'),
  ('MI','Detroit'), ('MI','Grand Rapids'), ('MI','Warren'), ('MI','Sterling Heights'), ('MI','Ann Arbor'),
  ('MN','Minneapolis'), ('MN','Saint Paul'), ('MN','Rochester'), ('MN','Duluth'), ('MN','Bloomington'),
  ('MS','Jackson'), ('MS','Gulfport'), ('MS','Southaven'), ('MS','Hattiesburg'), ('MS','Biloxi'),
  ('MO','Kansas City'), ('MO','Saint Louis'), ('MO','Springfield'), ('MO','Independence'), ('MO','Columbia'),
  ('MT','Billings'), ('MT','Missoula'), ('MT','Great Falls'), ('MT','Bozeman'), ('MT','Butte'),
  ('NE','Omaha'), ('NE','Lincoln'), ('NE','Bellevue'), ('NE','Grand Island'), ('NE','Kearney'),
  ('NV','Las Vegas'), ('NV','Henderson'), ('NV','Reno'), ('NV','North Las Vegas'), ('NV','Sparks'),
  ('NH','Manchester'), ('NH','Nashua'), ('NH','Concord'), ('NH','Derry'), ('NH','Dover'),
  ('NJ','Newark'), ('NJ','Jersey City'), ('NJ','Paterson'), ('NJ','Elizabeth'), ('NJ','Trenton'),
  ('NM','Albuquerque'), ('NM','Las Cruces'), ('NM','Rio Rancho'), ('NM','Santa Fe'), ('NM','Roswell'),
  ('NY','New York City'), ('NY','Buffalo'), ('NY','Rochester'), ('NY','Yonkers'), ('NY','Syracuse'),
  ('NY','Albany'), ('NY','Brooklyn'), ('NY','Queens'), ('NY','Bronx'), ('NY','Staten Island'),
  ('NC','Charlotte'), ('NC','Raleigh'), ('NC','Greensboro'), ('NC','Durham'), ('NC','Winston-Salem'),
  ('ND','Fargo'), ('ND','Bismarck'), ('ND','Grand Forks'), ('ND','Minot'), ('ND','West Fargo'),
  ('OH','Columbus'), ('OH','Cleveland'), ('OH','Cincinnati'), ('OH','Toledo'), ('OH','Akron'),
  ('OK','Oklahoma City'), ('OK','Tulsa'), ('OK','Norman'), ('OK','Broken Arrow'), ('OK','Edmond'),
  ('OR','Portland'), ('OR','Salem'), ('OR','Eugene'), ('OR','Gresham'), ('OR','Hillsboro'),
  ('PA','Philadelphia'), ('PA','Pittsburgh'), ('PA','Allentown'), ('PA','Erie'), ('PA','Reading'),
  ('RI','Providence'), ('RI','Warwick'), ('RI','Cranston'), ('RI','Pawtucket'), ('RI','East Providence'),
  ('SC','Charleston'), ('SC','Columbia'), ('SC','North Charleston'), ('SC','Mount Pleasant'), ('SC','Greenville'),
  ('SD','Sioux Falls'), ('SD','Rapid City'), ('SD','Pierre'), ('SD','Brookings'), ('SD','Watertown'),
  ('TN','Nashville'), ('TN','Memphis'), ('TN','Knoxville'), ('TN','Chattanooga'), ('TN','Clarksville'),
  ('TX','Houston'), ('TX','San Antonio'), ('TX','Dallas'), ('TX','Austin'), ('TX','Fort Worth'),
  ('TX','El Paso'), ('TX','Arlington'), ('TX','Corpus Christi'), ('TX','Plano'), ('TX','Lubbock'),
  ('UT','Salt Lake City'), ('UT','West Valley City'), ('UT','Provo'), ('UT','West Jordan'), ('UT','Ogden'),
  ('VT','Burlington'), ('VT','South Burlington'), ('VT','Rutland'), ('VT','Montpelier'), ('VT','Essex'),
  ('VA','Virginia Beach'), ('VA','Norfolk'), ('VA','Chesapeake'), ('VA','Richmond'), ('VA','Arlington'),
  ('WA','Seattle'), ('WA','Spokane'), ('WA','Tacoma'), ('WA','Vancouver'), ('WA','Bellevue'),
  ('WV','Charleston'), ('WV','Huntington'), ('WV','Morgantown'), ('WV','Parkersburg'), ('WV','Wheeling'),
  ('WI','Milwaukee'), ('WI','Madison'), ('WI','Green Bay'), ('WI','Kenosha'), ('WI','Racine'),
  ('WY','Cheyenne'), ('WY','Casper'), ('WY','Laramie'), ('WY','Gillette'), ('WY','Rock Springs'),
  ('DC','Washington'), ('DC','Georgetown'), ('DC','Anacostia'),
  ('PR','San Juan'), ('PR','Bayamon'), ('PR','Ponce'), ('PR','Carolina'), ('PR','Caguas')
) AS v(state_code, city)
WHERE NOT EXISTS (SELECT 1 FROM us_cities LIMIT 1);

CREATE INDEX IF NOT EXISTS idx_us_cities_state_code ON us_cities(state_code);