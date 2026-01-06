-- ============================================================================
-- Migration: Price History Tracking
-- Tracks price changes for listings with automatic trigger
-- ============================================================================

-- Create price_history table
CREATE TABLE IF NOT EXISTS public.price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE NOT NULL,
  old_price DECIMAL(10,2),
  new_price DECIMAL(10,2) NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;

-- Create index for fast lookups by listing
CREATE INDEX IF NOT EXISTS idx_price_history_listing_id ON public.price_history(listing_id);
CREATE INDEX IF NOT EXISTS idx_price_history_changed_at ON public.price_history(changed_at);

-- RLS Policy: Anyone can view price history for approved listings
CREATE POLICY "Anyone can view price history"
  ON public.price_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.listings 
      WHERE listings.id = price_history.listing_id 
      AND (listings.listing_status = 'approved' OR listings.owner_user_id = auth.uid())
    )
  );

-- Trigger function to track price changes on update
CREATE OR REPLACE FUNCTION public.track_price_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.rent_price IS DISTINCT FROM NEW.rent_price THEN
    INSERT INTO public.price_history (listing_id, old_price, new_price)
    VALUES (NEW.id, OLD.rent_price, NEW.rent_price);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function to capture initial price on insert
CREATE OR REPLACE FUNCTION public.capture_initial_price()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.price_history (listing_id, old_price, new_price)
  VALUES (NEW.id, NULL, NEW.rent_price);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_listing_price_change ON public.listings;
DROP TRIGGER IF EXISTS on_listing_price_insert ON public.listings;

-- Create triggers
CREATE TRIGGER on_listing_price_change
  AFTER UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.track_price_change();

CREATE TRIGGER on_listing_price_insert
  AFTER INSERT ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.capture_initial_price();

-- Backfill price history for existing listings (initial price only)
INSERT INTO public.price_history (listing_id, old_price, new_price, changed_at)
SELECT id, NULL, rent_price, created_at
FROM public.listings
WHERE NOT EXISTS (
  SELECT 1 FROM public.price_history ph WHERE ph.listing_id = listings.id
);
