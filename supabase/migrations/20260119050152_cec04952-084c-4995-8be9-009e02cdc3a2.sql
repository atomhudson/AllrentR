-- Add rental_days and expires_at columns to item_verifications
ALTER TABLE public.item_verifications 
ADD COLUMN rental_days integer NOT NULL DEFAULT 1,
ADD COLUMN rental_cost numeric NOT NULL DEFAULT 0,
ADD COLUMN expires_at timestamp with time zone;

-- Create function to set expiry date (rental end date + 30 days)
CREATE OR REPLACE FUNCTION public.set_verification_expiry()
RETURNS TRIGGER AS $$
BEGIN
  -- Set expires_at to current date + rental_days + 30 days buffer
  NEW.expires_at := NOW() + (NEW.rental_days || ' days')::interval + INTERVAL '30 days';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger to auto-set expiry
CREATE TRIGGER set_verification_expiry_trigger
BEFORE INSERT OR UPDATE OF rental_days ON public.item_verifications
FOR EACH ROW
EXECUTE FUNCTION public.set_verification_expiry();

-- Update existing records with default expiry (30 days from now)
UPDATE public.item_verifications 
SET expires_at = NOW() + INTERVAL '30 days'
WHERE expires_at IS NULL;