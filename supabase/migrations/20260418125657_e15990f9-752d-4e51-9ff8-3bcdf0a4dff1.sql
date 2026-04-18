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
    p.id,
    p.name,
    p.phone,
    p.pin_code,
    u.email::text,
    p.avatar_url,
    p.current_streak,
    p.longest_streak,
    p.last_active_at,
    p.created_at,
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = p.id AND ur.role = 'admin'
    ) AS is_admin
  FROM public.profiles p
  LEFT JOIN auth.users u ON u.id = p.id
  ORDER BY p.created_at DESC;
END;
$$;