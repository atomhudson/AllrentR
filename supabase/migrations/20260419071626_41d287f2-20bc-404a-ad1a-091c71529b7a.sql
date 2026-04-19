-- Function to get user listing stats (count + total views)
CREATE OR REPLACE FUNCTION public.admin_get_user_stats(_user_id uuid)
RETURNS TABLE(listings_count bigint, total_views bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  RETURN QUERY
  SELECT
    COUNT(*)::bigint AS listings_count,
    COALESCE(SUM(views), 0)::bigint AS total_views
  FROM public.listings
  WHERE owner_user_id = _user_id;
END;
$$;

-- Function to bulk delete users
CREATE OR REPLACE FUNCTION public.admin_bulk_delete_users(_user_ids uuid[])
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_count integer := 0;
  v_id uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  FOREACH v_id IN ARRAY _user_ids LOOP
    IF v_id = auth.uid() THEN
      CONTINUE; -- skip self
    END IF;

    INSERT INTO public.admin_activity_logs (admin_id, action, target_type, target_id, details)
    VALUES (auth.uid(), 'bulk_delete_user', 'user', v_id::text, '{}'::jsonb);

    DELETE FROM public.user_roles WHERE user_id = v_id;
    DELETE FROM public.profiles WHERE id = v_id;
    DELETE FROM auth.users WHERE id = v_id;

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

-- Function to bulk grant/revoke admin
CREATE OR REPLACE FUNCTION public.admin_bulk_toggle_admin(_user_ids uuid[], _make_admin boolean)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_count integer := 0;
  v_id uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  FOREACH v_id IN ARRAY _user_ids LOOP
    IF _make_admin THEN
      INSERT INTO public.user_roles (user_id, role)
      VALUES (v_id, 'admin')
      ON CONFLICT DO NOTHING;
    ELSE
      IF v_id = auth.uid() THEN
        CONTINUE; -- skip self for revoke
      END IF;
      DELETE FROM public.user_roles WHERE user_id = v_id AND role = 'admin';
    END IF;

    INSERT INTO public.admin_activity_logs (admin_id, action, target_type, target_id, details)
    VALUES (
      auth.uid(),
      CASE WHEN _make_admin THEN 'bulk_grant_admin' ELSE 'bulk_revoke_admin' END,
      'user', v_id::text, '{}'::jsonb
    );

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;