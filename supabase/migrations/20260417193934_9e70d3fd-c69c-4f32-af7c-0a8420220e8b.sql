INSERT INTO public.section_visibility (section_name, is_visible, updated_by)
SELECT 'listing_type_selection', true, (SELECT user_id FROM public.user_roles WHERE role = 'admin' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM public.section_visibility WHERE section_name = 'listing_type_selection');