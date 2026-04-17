-- 1. PROFILES: ensure no permissive public-read policy remains
DROP POLICY IF EXISTS "Public leaderboard data access" ON public.profiles;

-- 2. COUPONS: restrict SELECT to admins only
DROP POLICY IF EXISTS "Anyone can view active coupons" ON public.coupons;

CREATE POLICY "Only admins can view coupons"
ON public.coupons
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 3. Create SECURITY DEFINER function so users can validate a coupon by code
-- without being able to enumerate all coupons.
CREATE OR REPLACE FUNCTION public.validate_coupon_code(_code text)
RETURNS TABLE(
  valid boolean,
  error_message text,
  code text,
  discount_percentage integer,
  discount_amount numeric,
  is_percentage boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  c public.coupons%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN QUERY SELECT false, 'Authentication required'::text, NULL::text, NULL::integer, NULL::numeric, NULL::boolean;
    RETURN;
  END IF;

  SELECT * INTO c
  FROM public.coupons
  WHERE upper(code) = upper(_code) AND active = true
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 'Invalid coupon code'::text, NULL::text, NULL::integer, NULL::numeric, NULL::boolean;
    RETURN;
  END IF;

  IF now() < c.valid_from THEN
    RETURN QUERY SELECT false, 'Coupon not yet valid'::text, NULL::text, NULL::integer, NULL::numeric, NULL::boolean;
    RETURN;
  END IF;

  IF c.valid_until IS NOT NULL AND now() > c.valid_until THEN
    RETURN QUERY SELECT false, 'Coupon has expired'::text, NULL::text, NULL::integer, NULL::numeric, NULL::boolean;
    RETURN;
  END IF;

  IF c.usage_limit IS NOT NULL AND c.used_count >= c.usage_limit THEN
    RETURN QUERY SELECT false, 'Coupon usage limit reached'::text, NULL::text, NULL::integer, NULL::numeric, NULL::boolean;
    RETURN;
  END IF;

  RETURN QUERY SELECT
    true,
    NULL::text,
    c.code,
    c.discount_percentage,
    c.discount_amount,
    c.is_percentage;
END;
$$;

REVOKE ALL ON FUNCTION public.validate_coupon_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.validate_coupon_code(text) TO authenticated;