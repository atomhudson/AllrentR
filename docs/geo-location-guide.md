## Location Features Guide (Supabase + PostGIS + React)

This guide shows how to add location support to your P2P rental marketplace using Supabase (PostgreSQL + PostGIS) without Google Maps. It includes SQL migrations, geocoding with OpenStreetMap Nominatim, inserting listings with location, a nearby-listings RPC, and clustering queries you can render without a map.

### Prerequisites
- Supabase project (PostgreSQL 15+ recommended)
- PostGIS available (we enable it below)
- React frontend using `@supabase/supabase-js`

---

### 1) Enable PostGIS and Add Columns (SQL Migration)
Run in Supabase SQL editor or as a migration.

```sql
-- Enable extensions (idempotent)
create extension if not exists postgis;
create extension if not exists postgis_topology;
create extension if not exists fuzzystrmatch;
create extension if not exists postgis_tiger_geocoder;

-- Add place and coordinate fields
alter table public.listings
	add column if not exists latitude double precision,
	add column if not exists longitude double precision,
	add column if not exists city text,
	add column if not exists state text,
	add column if not exists locality text,
	add column if not exists geohash text;

-- Add a generated GEOGRAPHY point column (WGS84)
alter table public.listings
	add column if not exists location geography(Point, 4326)
	generated always as (
		ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
	) stored;

-- Add a generated geohash (9 chars ~2.3m precision); adjust precision as needed
alter table public.listings
	add column if not exists geohash9 text
	generated always as (
		ST_GeoHash((location::geometry), 9)
	) stored;

-- Indexes for fast geo filtering and grouping
create index if not exists idx_listings_location_gist
	on public.listings using gist (location);

create index if not exists idx_listings_city
	on public.listings (city);

create index if not exists idx_listings_pin_code
	on public.listings (pin_code);

-- For geohash prefix grouping (6 chars ≈ ~1.2 km)
create index if not exists idx_listings_geohash6
	on public.listings (left(geohash9, 6));

-- Optional: skip inactive items in geo queries
create index if not exists idx_listings_active_location
	on public.listings using gist (location)
	where listing_status = 'active';
```

Notes:
- You only need to insert `latitude` and `longitude`; Postgres generates `location` and `geohash9`.
- Use `left(geohash9, N)` for area buckets.

---

### 2) Geocoding and Insert Logic (TypeScript)
Use OpenStreetMap Nominatim to convert address/pincode to coordinates. Respect Nominatim usage policy with a descriptive `User-Agent` and consider server-side caching.

Install deps:

```bash
npm i @supabase/supabase-js ngeohash
```

Example utilities:

```ts
// utils/location.ts
import ngeohash from 'ngeohash';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type GeocodeResult = {
  lat: number;
  lon: number;
  city?: string;
  state?: string;
  locality?: string;
};

export async function geocodeWithNominatim(query: string): Promise<GeocodeResult | null> {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'json');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('limit', '1');

  const res = await fetch(url.toString(), {
    headers: {
      'User-Agent': 'AllrentR/1.0 (contact: youremail@example.com)'
    }
  });

  if (!res.ok) return null;
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;

  const item = data[0];
  const address = item.address ?? {};
  return {
    lat: Number(item.lat),
    lon: Number(item.lon),
    city: address.city || address.town || address.village || address.county,
    state: address.state,
    locality: address.suburb || address.neighbourhood || address.hamlet
  };
}

export async function insertListing(listing: {
  owner_user_id: string;
  product_name: string;
  description?: string;
  category?: string;
  pin_code?: string;
  phone?: string;
  address?: string;
  rent_price?: number;
  original_price?: number;
  discount_amount?: number;
  final_price?: number;
  product_type?: string;
  package_id?: string;
  listing_type?: string;
}) {
  const search = listing.address || listing.pin_code;
  if (!search) throw new Error('Address or pin_code is required to geocode');

  const geo = await geocodeWithNominatim(search);
  if (!geo) throw new Error('Unable to geocode address');

  const geohash = ngeohash.encode(geo.lat, geo.lon, 9);

  const { data, error } = await supabase
    .from('listings')
    .insert([
      {
        owner_user_id: listing.owner_user_id,
        product_name: listing.product_name,
        description: listing.description,
        category: listing.category,
        pin_code: listing.pin_code,
        phone: listing.phone,
        address: listing.address,
        rent_price: listing.rent_price,
        original_price: listing.original_price,
        discount_amount: listing.discount_amount,
        final_price: listing.final_price,
        product_type: listing.product_type,
        package_id: listing.package_id,
        listing_type: listing.listing_type,

        latitude: geo.lat,
        longitude: geo.lon,
        city: geo.city,
        state: geo.state,
        locality: geo.locality,

        geohash // optional; DB also generates geohash9
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

---

### 3) Nearby Listings RPC (SQL)
Creates `public.get_nearby_listings(user_lat, user_lng, radius_meters)` sorted by distance.

```sql
create or replace function public.get_nearby_listings(
	in user_lat double precision,
	in user_lng double precision,
	in radius_meters integer default 5000
)
returns table (
	id uuid,
	product_name text,
	rent_price numeric,
	owner_user_id uuid,
	city text,
	state text,
	pin_code text,
	latitude double precision,
	longitude double precision,
	distance_meters double precision
)
language sql
stable
as $$
	with origin as (
		select ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography as g
	)
	select
		l.id,
		l.product_name,
		l.rent_price,
		l.owner_user_id,
		l.city,
		l.state,
		l.pin_code,
		l.latitude,
		l.longitude,
		ST_Distance(l.location, o.g) as distance_meters
	from public.listings l
	cross join origin o
	where l.location is not null
	  and l.listing_status = 'active'
	  and ST_DWithin(l.location, o.g, radius_meters)
	order by ST_Distance(l.location, o.g) asc;
$$;

grant execute on function public.get_nearby_listings(double precision, double precision, integer) to anon, authenticated;
```

---

### 4) Call RPC from React (Supabase JS)

```ts
// utils/nearby.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function fetchNearbyListings(userLat: number, userLng: number, radiusMeters = 5000) {
  const { data, error } = await supabase.rpc('get_nearby_listings', {
    user_lat: userLat,
    user_lng: userLng,
    radius_meters: radiusMeters
  });

  if (error) throw error;
  return data as Array<{
    id: string;
    product_name: string;
    rent_price: number;
    owner_user_id: string;
    city: string | null;
    state: string | null;
    pin_code: string | null;
    latitude: number;
    longitude: number;
    distance_meters: number;
  }>;
}
```

Tip: You can wrap this in a React hook (e.g., `src/hooks/useListings.ts`) to fetch on mount or when the user shares location.

---

### 5) Clustering Without a Map (SQL)
Group listings server-side and render them as area cards/lists.

By pincode:

```sql
select
	pin_code,
	count(*) as listing_count,
	avg(rent_price) as avg_rent_price,
	ST_Y(ST_Centroid(ST_Collect(location::geometry))) as center_lat,
	ST_X(ST_Centroid(ST_Collect(location::geometry))) as center_lng
from public.listings
where listing_status = 'active'
group by pin_code
order by listing_count desc;
```

By city:

```sql
select
	city,
	count(*) as listing_count,
	ST_Y(ST_Centroid(ST_Collect(location::geometry))) as center_lat,
	ST_X(ST_Centroid(ST_Collect(location::geometry))) as center_lng
from public.listings
where listing_status = 'active'
group by city
order by listing_count desc;
```

By geohash prefix (~1 km with 6 chars):

```sql
select
	left(geohash9, 6) as geohash6,
	count(*) as listing_count,
	ST_Y(ST_Centroid(ST_Collect(location::geometry))) as center_lat,
	ST_X(ST_Centroid(ST_Collect(location::geometry))) as center_lng
from public.listings
where listing_status = 'active'
group by left(geohash9, 6)
order by listing_count desc;
```

Frontend display idea:
- Render each row as a "cluster card" with label (city/pincode/geohash6), `listing_count`, and optional centroid.
- Clicking a card loads listings in that cluster:
  - For pincode/city: filter by `pin_code` or `city`.
  - For geohash: filter where `left(geohash9, 6) = :prefix` or use a SQL view/RPC.
- Optionally show distance from user to cluster centroid (Haversine in JS or an RPC).

---

### 6) RLS and Privacy Tips
- Ensure `select` policies permit reading `latitude`, `longitude`, `location` if needed.
- Grant `execute` on `get_nearby_listings` to relevant roles (`authenticated`, optionally `anon`).
- If precise coordinates are sensitive, expose only coarse fields (city/pincode) or only distances via RPCs.

---

### 7) Operational Hygiene
- Cache geocode results for repeated addresses/pincodes to reduce Nominatim usage.
- Add request throttling/debouncing in the UI.
- Monitor index bloat; reindex occasionally if listings churn is high.

---

### Quick Checklist
- [ ] Run the SQL migration (Section 1)
- [ ] Add geocoding and insert functions (Section 2)
- [ ] Create `get_nearby_listings` function (Section 3)
- [ ] Call RPC from React (Section 4)
- [ ] Add clustering queries and UI cards (Section 5)
- [ ] Review RLS policies (Section 6)


