-- Drop and recreate view with SECURITY INVOKER
DROP VIEW IF EXISTS public.listings_public;

CREATE VIEW public.listings_public 
WITH (security_invoker = true)
AS
SELECT 
  id,
  display_id,
  owner_user_id,
  product_name,
  description,
  images,
  rent_price,
  pin_code,
  availability,
  payment_transaction,
  payment_verified,
  listing_status,
  views,
  rating,
  product_type,
  category,
  -- Mask phone for non-owners (show only last 4 digits)
  CASE 
    WHEN auth.uid() = owner_user_id OR has_role(auth.uid(), 'admin'::app_role) 
    THEN phone 
    ELSE CONCAT('******', RIGHT(phone, 4))
  END AS phone,
  -- Mask full address for non-owners (show only area/locality)
  CASE 
    WHEN auth.uid() = owner_user_id OR has_role(auth.uid(), 'admin'::app_role) 
    THEN address 
    ELSE CONCAT(SPLIT_PART(address, ',', 1), ', ', pin_code)
  END AS address,
  created_at,
  listing_type,
  coupon_code,
  original_price,
  discount_amount,
  final_price,
  package_id,
  verification_enabled
FROM public.listings;

-- Grant access to the view
GRANT SELECT ON public.listings_public TO authenticated, anon;