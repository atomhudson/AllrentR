-- Admin function to update user profile fields
CREATE OR REPLACE FUNCTION public.admin_update_user(
  _user_id uuid,
  _name text DEFAULT NULL,
  _phone text DEFAULT NULL,
  _pin_code text DEFAULT NULL,
  _current_streak integer DEFAULT NULL,
  _longest_streak integer DEFAULT NULL,
  _avatar_url text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  UPDATE public.profiles
  SET
    name = COALESCE(_name, name),
    phone = COALESCE(_phone, phone),
    pin_code = COALESCE(_pin_code, pin_code),
    current_streak = COALESCE(_current_streak, current_streak),
    longest_streak = COALESCE(_longest_streak, longest_streak),
    avatar_url = COALESCE(_avatar_url, avatar_url)
  WHERE id = _user_id;

  INSERT INTO public.admin_activity_logs (admin_id, action, target_type, target_id, details)
  VALUES (auth.uid(), 'update_user', 'user', _user_id::text, jsonb_build_object(
    'name', _name, 'phone', _phone, 'pin_code', _pin_code,
    'current_streak', _current_streak, 'longest_streak', _longest_streak
  ));
END;
$$;

-- Admin function to delete a user completely
CREATE OR REPLACE FUNCTION public.admin_delete_user(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  IF _user_id = auth.uid() THEN
    RAISE EXCEPTION 'You cannot delete your own admin account';
  END IF;

  -- Log first
  INSERT INTO public.admin_activity_logs (admin_id, action, target_type, target_id, details)
  VALUES (auth.uid(), 'delete_user', 'user', _user_id::text, '{}'::jsonb);

  -- Delete from auth.users will cascade to profiles via trigger/foreign key
  DELETE FROM public.user_roles WHERE user_id = _user_id;
  DELETE FROM public.profiles WHERE id = _user_id;
  DELETE FROM auth.users WHERE id = _user_id;
END;
$$;

-- Admin function to toggle admin role
CREATE OR REPLACE FUNCTION public.admin_toggle_admin_role(_user_id uuid, _make_admin boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: admin role required';
  END IF;

  IF _make_admin THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (_user_id, 'admin')
    ON CONFLICT DO NOTHING;
  ELSE
    IF _user_id = auth.uid() THEN
      RAISE EXCEPTION 'You cannot remove your own admin role';
    END IF;
    DELETE FROM public.user_roles WHERE user_id = _user_id AND role = 'admin';
  END IF;

  INSERT INTO public.admin_activity_logs (admin_id, action, target_type, target_id, details)
  VALUES (auth.uid(), CASE WHEN _make_admin THEN 'grant_admin' ELSE 'revoke_admin' END, 'user', _user_id::text, '{}'::jsonb);
END;
$$;