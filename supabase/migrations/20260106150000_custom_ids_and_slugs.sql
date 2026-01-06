-- ============================================================================
-- Migration: Custom Display IDs and URL Slugs
-- Adds prefixed display IDs (USR_, PROD_) and URL slugs for SEO-friendly URLs
-- ============================================================================

-- Function to generate short unique IDs with prefix
CREATE OR REPLACE FUNCTION public.generate_short_id(prefix TEXT)
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghijkmnpqrstuvwxyz23456789';
  result TEXT := prefix;
  i INT;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to generate URL-friendly slug from text
CREATE OR REPLACE FUNCTION public.generate_slug(name TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(regexp_replace(regexp_replace(name, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
END;
$$ LANGUAGE plpgsql;

-- Add display_id column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS display_id TEXT UNIQUE;

-- Add display_id and slug columns to listings
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS display_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create index on display_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_display_id ON public.profiles(display_id);
CREATE INDEX IF NOT EXISTS idx_listings_display_id ON public.listings(display_id);
CREATE INDEX IF NOT EXISTS idx_listings_slug ON public.listings(slug);

-- Trigger function to auto-generate profile display_id
CREATE OR REPLACE FUNCTION public.set_profile_display_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.display_id IS NULL THEN
    NEW.display_id := public.generate_short_id('USR_');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to auto-generate listing display_id and slug
CREATE OR REPLACE FUNCTION public.set_listing_display_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.display_id IS NULL THEN
    NEW.display_id := public.generate_short_id('PROD_');
  END IF;
  IF NEW.slug IS NULL AND NEW.product_name IS NOT NULL THEN
    NEW.slug := public.generate_slug(NEW.product_name);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist (for idempotency)
DROP TRIGGER IF EXISTS on_profile_display_id ON public.profiles;
DROP TRIGGER IF EXISTS on_listing_display_id ON public.listings;

-- Create triggers
CREATE TRIGGER on_profile_display_id
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_profile_display_id();

CREATE TRIGGER on_listing_display_id
  BEFORE INSERT ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_listing_display_id();

-- Backfill existing profiles without display_id
UPDATE public.profiles 
SET display_id = public.generate_short_id('USR_') 
WHERE display_id IS NULL;

-- Backfill existing listings without display_id or slug
UPDATE public.listings 
SET 
  display_id = public.generate_short_id('PROD_'),
  slug = public.generate_slug(product_name)
WHERE display_id IS NULL;
