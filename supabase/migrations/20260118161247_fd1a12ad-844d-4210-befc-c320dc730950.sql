-- Add display_id column to listings if not exists
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS display_id TEXT;

-- Create unique index on display_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_listings_display_id ON public.listings(display_id) WHERE display_id IS NOT NULL;

-- Create function to generate display_id
CREATE OR REPLACE FUNCTION public.generate_display_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.display_id IS NULL THEN
    NEW.display_id := 'PROD_' || LOWER(SUBSTRING(NEW.id::text, 1, 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger to auto-generate display_id
DROP TRIGGER IF EXISTS set_display_id ON public.listings;
CREATE TRIGGER set_display_id
BEFORE INSERT ON public.listings
FOR EACH ROW
EXECUTE FUNCTION public.generate_display_id();

-- Update existing listings to have display_id
UPDATE public.listings 
SET display_id = 'PROD_' || LOWER(SUBSTRING(id::text, 1, 8))
WHERE display_id IS NULL;