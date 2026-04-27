-- Fix: admin_get_all_users should start from auth.users so we capture
-- ALL authenticated users, even those who haven't created a profile yet.
-- Previously it started FROM profiles and LEFT JOINed auth.users, which
-- missed any auth user without a corresponding profiles row.

CREATE OR REPLACE FUNCTION public.admin_get_all_users()
RETURNS TABLE (
  id uuid,
  name text,
  phone text,
  pin_code text,
  email text,
  avatar_url text,
  current_streak integer,
  longest_streak integer,
  last_active_at timestamptz,
  created_at timestamptz,
  is_admin boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  RETURN QUERY
  SELECT
    u.id,
    COALESCE(p.name, u.raw_user_meta_data->>'name', 'Unknown')::text AS name,
    COALESCE(p.phone, u.phone, '')::text AS phone,
    COALESCE(p.pin_code, '')::text AS pin_code,
    COALESCE(u.email, '')::text AS email,
    p.avatar_url::text,
    COALESCE(p.current_streak, 0)::integer AS current_streak,
    COALESCE(p.longest_streak, 0)::integer AS longest_streak,
    p.last_active_at,
    COALESCE(p.created_at, u.created_at) AS created_at,
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = u.id AND ur.role = 'admin'
    ) AS is_admin
  FROM auth.users u
  LEFT JOIN public.profiles p ON p.id = u.id
  ORDER BY COALESCE(p.created_at, u.created_at) DESC;
END;
$$;
