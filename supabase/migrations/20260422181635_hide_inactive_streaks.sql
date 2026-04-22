-- Update the leaderboard view to only show users who were active today or yesterday
-- This ensures that if a user misses a day, they automatically disappear from the leaderboard
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
  AND p.last_active_at >= CURRENT_DATE - INTERVAL '1 day'
ORDER BY p.current_streak DESC, p.last_active_at DESC;

-- Grant access to the updated view
GRANT SELECT ON public.leaderboard TO anon, authenticated;

-- Also update sync_top_profiles to follow the same logic
CREATE OR REPLACE FUNCTION public.sync_top_profiles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Clear existing top profiles
  DELETE FROM public.top_profiles;
  
  -- Insert top 10 users by streak who are currently active
  INSERT INTO public.top_profiles (user_id, name, avatar_url, streak, display_order, created_by)
  SELECT 
    p.id,
    p.name,
    COALESCE(p.avatar_url, 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || p.id::text),
    p.current_streak,
    ROW_NUMBER() OVER (ORDER BY p.current_streak DESC, p.last_active_at DESC)::integer,
    p.id
  FROM public.profiles p
  WHERE p.current_streak > 0 
    AND p.last_active_at >= CURRENT_DATE - INTERVAL '1 day'
  ORDER BY p.current_streak DESC, p.last_active_at DESC
  LIMIT 10;
END;
$$;
