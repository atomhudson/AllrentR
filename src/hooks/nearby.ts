import { supabase } from '@/integrations/supabase/client';

const db = supabase as any;

export async function fetchNearbyListings(userLat: number, userLng: number, radiusMeters = 5000) {
  const { data, error } = await db.rpc('get_nearby_listings', {
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