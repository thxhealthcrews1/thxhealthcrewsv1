/*
# Add lat/lng coordinates to us_cities

1. Modified Tables
- `us_cities`
  - Added `lat` (double precision) — latitude of the city
  - Added `lng` (double precision) — longitude of the city

2. Data
- Populates lat/lng for every existing city row so pins can be placed
  at the correct geographic location on the 3D globe.

3. Important Notes
- This is reference data, not user data. No user data is modified.
- Lat/lng values are approximate city-center coordinates.
*/

ALTER TABLE us_cities ADD COLUMN IF NOT EXISTS lat double precision;
ALTER TABLE us_cities ADD COLUMN IF NOT EXISTS lng double precision;

UPDATE us_cities AS c
SET lat = v.lat, lng = v.lng
FROM (VALUES
  ('AL','Birmingham',33.5207,-86.8025), ('AL','Montgomery',32.3792,-86.3076), ('AL','Mobile',30.6954,-88.0431), ('AL','Huntsville',34.7304,-86.5861), ('AL','Tuscaloosa',33.2098,-87.5692),
  ('AK','Anchorage',61.2181,-149.9003), ('AK','Fairbanks',64.8378,-147.7164), ('AK','Juneau',58.3005,-134.4197), ('AK','Wasilla',61.5814,-149.4394), ('AK','Sitka',57.0531,-135.3300),
  ('AZ','Phoenix',33.4484,-112.0740), ('AZ','Tucson',32.2226,-110.9747), ('AZ','Mesa',33.4152,-111.8315), ('AZ','Scottsdale',33.4942,-111.9261), ('AZ','Tempe',33.4255,-111.9400),
  ('AR','Little Rock',34.7465,-92.2896), ('AR','Fayetteville',36.0626,-94.1574), ('AR','Fort Smith',35.3859,-94.3985), ('AR','Springdale',36.1867,-94.1288), ('AR','Jonesboro',35.8423,-90.7043),
  ('CA','Los Angeles',34.0522,-118.2437), ('CA','San Diego',32.7157,-117.1611), ('CA','San Jose',37.3382,-121.8863), ('CA','San Francisco',37.7749,-122.4194), ('CA','Fresno',36.7378,-119.7871),
  ('CA','Sacramento',38.5816,-121.4944), ('CA','Long Beach',33.7701,-118.1937), ('CA','Oakland',37.8044,-122.2712), ('CA','Bakersfield',35.3733,-119.0187), ('CA','Anaheim',33.8366,-117.9143),
  ('CO','Denver',39.7392,-104.9903), ('CO','Colorado Springs',38.8339,-104.8214), ('CO','Aurora',39.7405,-104.8310), ('CO','Fort Collins',40.5853,-105.0844), ('CO','Boulder',40.0150,-105.2705),
  ('CT','Hartford',41.7658,-72.6734), ('CT','New Haven',41.3083,-72.9279), ('CT','Stamford',41.0534,-73.0535), ('CT','Bridgeport',41.1795,-73.1894), ('CT','Waterbury',41.5562,-73.0515),
  ('DE','Wilmington',39.7391,-75.5398), ('DE','Dover',39.1582,-75.5247), ('DE','Newark',39.6837,-75.7494), ('DE','Middletown',39.4421,-75.7169), ('DE','Smyrna',39.2998,-75.6046),
  ('FL','Jacksonville',30.3322,-81.6557), ('FL','Miami',25.7617,-80.1918), ('FL','Tampa',27.9506,-82.4572), ('FL','Orlando',28.5383,-81.3792), ('FL','St. Petersburg',27.7676,-82.6403),
  ('FL','Hialeah',25.8576,-80.2781), ('FL','Tallahassee',30.4383,-84.2807), ('FL','Fort Lauderdale',26.1224,-80.1373), ('FL','Naples',26.1420,-81.7948), ('FL','Gainesville',29.6516,-82.3248),
  ('GA','Atlanta',33.7490,-84.3880), ('GA','Augusta',33.4737,-82.0982), ('GA','Columbus',32.4609,-84.9877), ('GA','Savannah',32.0809,-81.0912), ('GA','Athens',33.9519,-83.3576),
  ('HI','Honolulu',21.3069,-157.8583), ('HI','Hilo',19.7016,-155.0849), ('HI','Kailua',19.7395,-155.8900), ('HI','Kapolei',21.3574,-158.0788), ('HI','Kaneohe',21.4459,-157.8042),
  ('ID','Boise',43.6150,-116.2023), ('ID','Meridian',43.6121,-116.3915), ('ID','Nampa',43.5407,-116.5635), ('ID','Idaho Falls',43.4917,-112.0339), ('ID','Pocatello',42.8713,-112.4455),
  ('IL','Chicago',41.8781,-87.6298), ('IL','Aurora',41.7606,-88.3201), ('IL','Naperville',41.7859,-88.1471), ('IL','Joliet',41.5250,-88.0817), ('IL','Rockford',42.2611,-89.0061),
  ('IL','Springfield',39.7817,-89.6501), ('IL','Elgin',42.0372,-88.2812), ('IL','Peoria',40.6936,-89.5890), ('IL','Champaign',40.1164,-88.2434), ('IL','Evanston',42.0451,-87.6877),
  ('IN','Indianapolis',39.7684,-86.1581), ('IN','Fort Wayne',41.0793,-85.1394), ('IN','Evansville',37.9716,-87.5711), ('IN','South Bend',41.6764,-86.2520), ('IN','Carmel',39.9784,-86.1180),
  ('IA','Des Moines',41.5868,-93.6250), ('IA','Cedar Rapids',41.9779,-91.6656), ('IA','Davenport',41.5236,-90.5776), ('IA','Sioux City',42.4964,-96.4053), ('IA','Iowa City',41.6611,-91.5302),
  ('KS','Wichita',37.6872,-97.3301), ('KS','Overland Park',38.9822,-94.6708), ('KS','Kansas City',39.1155,-94.6268), ('KS','Olathe',38.8814,-94.8191), ('KS','Topeka',39.0490,-95.6776),
  ('KY','Louisville',38.2527,-85.7585), ('KY','Lexington',38.0406,-84.5037), ('KY','Bowling Green',36.9685,-86.5739), ('KY','Owensboro',37.7742,-87.1133), ('KY','Covington',39.0837,-84.5086),
  ('LA','New Orleans',29.9511,-90.0715), ('LA','Baton Rouge',30.4515,-91.1871), ('LA','Shreveport',32.5252,-93.7502), ('LA','Lafayette',30.2241,-92.0198), ('LA','Lake Charles',30.2264,-93.2044),
  ('ME','Portland',43.6591,-70.2568), ('ME','Lewiston',44.0975,-70.2142), ('ME','Bangor',44.8018,-68.7713), ('ME','South Portland',43.6415,-70.2412), ('ME','Auburn',44.0872,-70.2313),
  ('MD','Baltimore',39.2904,-76.6122), ('MD','Frederick',39.4143,-77.4105), ('MD','Rockville',39.0840,-77.1528), ('MD','Gaithersburg',39.1434,-77.2014), ('MD','Annapolis',38.9784,-76.4922),
  ('MA','Boston',42.3601,-71.0589), ('MA','Worcester',42.2626,-71.8023), ('MA','Springfield',42.3485,-72.5787), ('MA','Cambridge',42.3736,-71.1097), ('MA','Lowell',42.6334,-71.3162),
  ('MI','Detroit',42.3314,-83.0458), ('MI','Grand Rapids',42.9634,-85.6681), ('MI','Warren',42.5145,-83.0147), ('MI','Sterling Heights',42.5803,-83.0302), ('MI','Ann Arbor',42.2807,-83.7436),
  ('MN','Minneapolis',44.9778,-93.2650), ('MN','Saint Paul',44.9537,-93.0900), ('MN','Rochester',44.0121,-92.4802), ('MN','Duluth',46.7867,-92.1005), ('MN','Bloomington',44.8408,-93.2983),
  ('MS','Jackson',32.2988,-90.1848), ('MS','Gulfport',30.3674,-89.0923), ('MS','Southaven',34.9890,-90.0122), ('MS','Hattiesburg',31.3271,-89.2903), ('MS','Biloxi',30.3960,-88.8853),
  ('MO','Kansas City',39.0997,-94.5786), ('MO','Saint Louis',38.6270,-90.1994), ('MO','Springfield',37.2089,-93.2923), ('MO','Independence',39.0911,-94.4155), ('MO','Columbia',38.9517,-92.3341),
  ('MT','Billings',45.7833,-108.5007), ('MT','Missoula',46.8787,-113.9966), ('MT','Great Falls',47.4924,-111.2996), ('MT','Bozeman',45.6770,-111.0429), ('MT','Butte',46.0036,-112.5346),
  ('NE','Omaha',41.2565,-95.9345), ('NE','Lincoln',40.8159,-96.6887), ('NE','Bellevue',41.1540,-95.9128), ('NE','Grand Island',40.9228,-98.3417), ('NE','Kearney',40.7000,-99.0812),
  ('NV','Las Vegas',36.1699,-115.1398), ('NV','Henderson',36.0397,-114.9817), ('NV','Reno',39.5296,-119.8138), ('NV','North Las Vegas',36.1988,-115.1175), ('NV','Sparks',39.5349,-119.7527),
  ('NH','Manchester',42.9956,-71.4548), ('NH','Nashua',42.7654,-71.4676), ('NH','Concord',43.2081,-71.5376), ('NH','Derry',42.8806,-71.3195), ('NH','Dover',43.1979,-70.8737),
  ('NJ','Newark',40.7357,-74.1724), ('NJ','Jersey City',40.7178,-74.0431), ('NJ','Paterson',40.9168,-74.1718), ('NJ','Elizabeth',40.6639,-74.2107), ('NJ','Trenton',40.2206,-74.7597),
  ('NM','Albuquerque',35.0844,-106.6504), ('NM','Las Cruces',32.3199,-106.7637), ('NM','Rio Rancho',35.2334,-106.6645), ('NM','Santa Fe',35.6870,-105.9378), ('NM','Roswell',33.3943,-104.5230),
  ('NY','New York City',40.7128,-74.0060), ('NY','Buffalo',42.8802,-78.8788), ('NY','Rochester',43.1566,-77.6088), ('NY','Yonkers',40.9312,-73.8987), ('NY','Syracuse',43.0481,-76.1474),
  ('NY','Albany',42.6526,-73.7562), ('NY','Brooklyn',40.6782,-73.9442), ('NY','Queens',40.7282,-73.7949), ('NY','Bronx',40.8448,-73.8648), ('NY','Staten Island',40.5795,-74.1502),
  ('NC','Charlotte',35.2271,-80.8431), ('NC','Raleigh',35.7796,-78.6382), ('NC','Greensboro',36.1627,-79.8756), ('NC','Durham',35.9940,-78.8986), ('NC','Winston-Salem',36.0998,-80.2442),
  ('ND','Fargo',46.8772,-96.7898), ('ND','Bismarck',46.8083,-100.7837), ('ND','Grand Forks',47.9253,-97.0326), ('ND','Minot',48.2329,-101.2911), ('ND','West Fargo',46.8747,-96.8992),
  ('OH','Columbus',39.9612,-82.9988), ('OH','Cleveland',41.4993,-81.6944), ('OH','Cincinnati',39.1031,-84.5120), ('OH','Toledo',41.6528,-83.5379), ('OH','Akron',41.0814,-81.5190),
  ('OK','Oklahoma City',35.4676,-97.5164), ('OK','Tulsa',36.1540,-95.9928), ('OK','Norman',35.2226,-97.4395), ('OK','Broken Arrow',36.0279,-95.7944), ('OK','Edmond',35.6528,-97.4781),
  ('OR','Portland',45.5152,-122.6784), ('OR','Salem',44.9429,-123.0351), ('OR','Eugene',44.0521,-123.0868), ('OR','Gresham',45.5001,-122.4310), ('OR','Hillsboro',45.5229,-122.9898),
  ('PA','Philadelphia',39.9526,-75.1652), ('PA','Pittsburgh',40.4406,-79.9959), ('PA','Allentown',40.6084,-75.4902), ('PA','Erie',42.1292,-80.0851), ('PA','Reading',40.3356,-75.9268),
  ('RI','Providence',41.8240,-71.4128), ('RI','Warwick',41.7001,-71.4162), ('RI','Cranston',41.7798,-71.3834), ('RI','Pawtucket',41.8787,-71.3823), ('RI','East Providence',41.8137,-71.3706),
  ('SC','Charleston',32.7765,-79.9311), ('SC','Columbia',34.0007,-81.0348), ('SC','North Charleston',32.8542,-80.0080), ('SC','Mount Pleasant',32.8323,-79.8284), ('SC','Greenville',34.8526,-82.3940),
  ('SD','Sioux Falls',43.5510,-96.7003), ('SD','Rapid City',44.0805,-103.2310), ('SD','Pierre',44.3683,-100.3510), ('SD','Brookings',44.3113,-96.7897), ('SD','Watertown',44.8994,-97.1153),
  ('TN','Nashville',36.1627,-86.7816), ('TN','Memphis',35.1495,-90.0490), ('TN','Knoxville',35.9606,-83.9207), ('TN','Chattanooga',35.0456,-85.3097), ('TN','Clarksville',36.5298,-87.3595),
  ('TX','Houston',29.7604,-95.3698), ('TX','San Antonio',29.4241,-98.4936), ('TX','Dallas',32.7767,-96.7970), ('TX','Austin',30.2672,-97.7431), ('TX','Fort Worth',32.7555,-97.3308),
  ('TX','El Paso',31.7619,-106.4850), ('TX','Arlington',32.7357,-97.1071), ('TX','Corpus Christi',27.8006,-97.3964), ('TX','Plano',33.0198,-96.6989), ('TX','Lubbock',33.5779,-101.8552),
  ('UT','Salt Lake City',40.7608,-111.8910), ('UT','West Valley City',40.6916,-111.9940), ('UT','Provo',40.2338,-111.6585), ('UT','West Jordan',40.6097,-111.9391), ('UT','Ogden',41.2230,-111.9738),
  ('VT','Burlington',44.4759,-73.2121), ('VT','South Burlington',44.4663,-73.1707), ('VT','Rutland',43.6106,-72.9726), ('VT','Montpelier',44.2601,-72.5754), ('VT','Essex',44.4915,-73.1120),
  ('VA','Virginia Beach',36.8529,-75.9780), ('VA','Norfolk',36.8508,-76.2859), ('VA','Chesapeake',36.7682,-76.2875), ('VA','Richmond',37.5407,-77.4360), ('VA','Arlington',38.8816,-77.0927),
  ('WA','Seattle',47.6062,-122.3321), ('WA','Spokane',47.6588,-117.4260), ('WA','Tacoma',47.2529,-122.4443), ('WA','Vancouver',45.6387,-122.6615), ('WA','Bellevue',47.6101,-122.2015),
  ('WV','Charleston',38.3498,-81.6336), ('WV','Huntington',38.4192,-82.4452), ('WV','Morgantown',39.6295,-79.9560), ('WV','Parkersburg',39.2667,-81.5615), ('WV','Wheeling',40.0639,-80.7209),
  ('WI','Milwaukee',43.0389,-87.9065), ('WI','Madison',43.0731,-89.4012), ('WI','Green Bay',44.5133,-88.0133), ('WI','Kenosha',42.5847,-87.8212), ('WI','Racine',42.7261,-87.8156),
  ('WY','Cheyenne',41.1400,-104.8202), ('WY','Casper',42.8666,-106.3131), ('WY','Laramie',41.3114,-105.5911), ('WY','Gillette',44.2814,-105.5022), ('WY','Rock Springs',41.5872,-109.2229),
  ('DC','Washington',38.9072,-77.0369), ('DC','Georgetown',38.9097,-77.0654), ('DC','Anacostia',38.8624,-76.9838),
  ('PR','San Juan',18.4655,-66.1057), ('PR','Bayamon',18.3989,-66.1559), ('PR','Ponce',18.0111,-66.6141), ('PR','Carolina',18.3802,-65.9574), ('PR','Caguas',18.2362,-66.0436)
) AS v(state_code, city, lat, lng)
WHERE c.state_code = v.state_code AND c.city = v.city;