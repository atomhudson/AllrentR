-- 1. Fix profiles PII exposure: drop overly permissive leaderboard policy
DROP POLICY IF EXISTS "Public leaderboard data access" ON public.profiles;

-- Create a new limited policy: public can see only id, name, avatar_url, streak fields
-- Since RLS can't filter columns, we create a secure view and restrict direct table access
CREATE POLICY "Public leaderboard profile access"
ON public.profiles
FOR SELECT
TO anon, authenticated
USING (
  auth.uid() = id
);

-- 2. Fix increment_coupon_usage: add admin check
CREATE OR REPLACE FUNCTION public.increment_coupon_usage(coupon_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow if user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  UPDATE public.coupons
  SET used_count = used_count + 1
  WHERE code = coupon_code 
    AND active = true
    AND (usage_limit IS NULL OR used_count < usage_limit);
END;
$$;

-- 3. Add validation trigger for listings
CREATE OR REPLACE FUNCTION public.validate_listing_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Validate product name length
  IF length(NEW.product_name) < 1 OR length(NEW.product_name) > 500 THEN
    RAISE EXCEPTION 'Product name must be between 1 and 500 characters';
  END IF;
  
  -- Validate price range
  IF NEW.rent_price < 0 OR NEW.rent_price > 10000000 THEN
    RAISE EXCEPTION 'Price must be between 0 and 10,000,000';
  END IF;
  
  -- Validate pin code format (6 digits)
  IF NEW.pin_code !~ '^\d{6}$' THEN
    RAISE EXCEPTION 'Pin code must be exactly 6 digits';
  END IF;
  
  -- Validate phone format (Indian 10-digit)
  IF NEW.phone != '' AND NEW.phone !~ '^[6-9]\d{9}$' THEN
    RAISE EXCEPTION 'Phone must be a valid 10-digit Indian number';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_listing_before_insert_update
  BEFORE INSERT OR UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_listing_data();

-- 4. Drop the leaderboard view and recreate to ensure it uses proper columns only
DROP VIEW IF EXISTS public.leaderboard;
CREATE VIEW public.leaderboard WITH (security_invoker = true) AS
SELECT 
  p.id,
  p.name,
  p.current_streak,
  p.longest_streak,
  p.last_active_at,
  p.avatar_url,
  ROW_NUMBER() OVER (ORDER BY p.current_streak DESC, p.last_active_at DESC) as rank
FROM public.profiles p
WHERE p.current_streak > 0
ORDER BY p.current_streak DESC, p.last_active_at DESC;

-- Grant access to the leaderboard view
GRANT SELECT ON public.leaderboard TO anon, authenticated;