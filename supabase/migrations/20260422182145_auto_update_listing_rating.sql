-- Function to update the average rating of a listing
CREATE OR REPLACE FUNCTION public.update_listing_average_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE public.listings
    SET rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM public.ratings
      WHERE listing_id = OLD.listing_id
    )
    WHERE id = OLD.listing_id;
  ELSE
    UPDATE public.listings
    SET rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM public.ratings
      WHERE listing_id = NEW.listing_id
    )
    WHERE id = NEW.listing_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update rating when a review is added, changed, or removed
DROP TRIGGER IF EXISTS tr_update_listing_rating ON public.ratings;
CREATE TRIGGER tr_update_listing_rating
AFTER INSERT OR UPDATE OR DELETE ON public.ratings
FOR EACH ROW EXECUTE FUNCTION public.update_listing_average_rating();

-- Backfill existing ratings to listing table
UPDATE public.listings l
SET rating = (
  SELECT COALESCE(AVG(r.rating), 0)
  FROM public.ratings r
  WHERE r.listing_id = l.id
);
