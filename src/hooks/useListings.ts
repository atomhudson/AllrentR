import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Listing {
  id: string;
  display_id?: string;
  owner_user_id: string;
  product_name: string;
  description: string;
  images: string[];
  rent_price: number;
  pin_code: string;
  availability: boolean;
  payment_transaction: string;
  payment_verified: boolean;
  listing_status: string;
  views: number;
  rating: number | null;
  product_type: 'rent' | 'sale' | 'both';
  category: string;
  phone: string;
  address: string;
  created_at: string;
  listing_type?: string | null;
  coupon_code?: string;
  original_price?: number;
  discount_amount?: number;
  final_price?: number;
}

export const parseListing = (listing: any): Listing => {
  let finalListing = { ...listing };
  
  // Handle embedded category trick: __cat:category__description
  if (finalListing.description && finalListing.description.startsWith('__cat:')) {
    const match = finalListing.description.match(/^__cat:([^__]+)__(.*)/);
    if (match) {
      finalListing.category = match[1];
      finalListing.description = match[2];
    }
  }

  if (finalListing.ratings && Array.isArray(finalListing.ratings) && finalListing.ratings.length > 0) {
    const sum = finalListing.ratings.reduce((acc: number, curr: any) => acc + curr.rating, 0);
    finalListing.rating = sum / finalListing.ratings.length;
  }
  
  return finalListing as Listing;
};

export const useListings = (status?: string, userId?: string, enabled: boolean = true) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = useCallback(async () => {
    if (!enabled) {
      return;
    }
    setLoading(true);
    try {
      // Use secure view for approved public listings, direct table for owner's own listings
      const isPublicApprovedQuery = status === 'approved' && !userId;
      
      let data: any[] | null = null;
      let error: any = null;
      
      if (isPublicApprovedQuery) {
        // Query approved listings with their ratings
        const result = await supabase.from('listings').select('*, ratings(rating)')
          .eq('listing_status', 'approved')
          .order('created_at', { ascending: false });
        data = result.data;
        error = result.error;
      } else {
        // Use direct table for owner's own listings or admin queries
        let query = supabase.from('listings').select('*, ratings(rating)');
        
        if (status) {
          query = query.eq('listing_status', status);
        }
        
        if (userId) {
          query = query.eq('owner_user_id', userId);
        }
        
        const result = await query.order('created_at', { ascending: false });
        data = result.data;
        error = result.error;
      }
      
      if (error) throw error;
      
      // Calculate average ratings if ratings were joined and parse embedded categories
      const processedData = (data || []).map(listing => parseListing(listing));
      
      setListings(processedData);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  }, [status, userId, enabled]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return { listings, loading, refetch: fetchListings };
};

export const approveListing = async (listingId: string) => {
  const { error } = await supabase
    .from('listings')
    .update({ listing_status: 'approved', payment_verified: true })
    .eq('id', listingId);
  
  return !error;
};

export const rejectListing = async (listingId: string) => {
  const { error } = await supabase
    .from('listings')
    .update({ listing_status: 'rejected' })
    .eq('id', listingId);
  
  return !error;
};

export const incrementViews = async (listingId: string) => {
  const { error } = await supabase.rpc('increment_listing_views', {
    listing_id: listingId,
  });
  
  return !error;
};
