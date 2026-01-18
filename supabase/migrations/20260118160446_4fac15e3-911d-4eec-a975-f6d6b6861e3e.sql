-- Create item_verifications table for storing handover verification data
CREATE TABLE public.item_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    owner_id UUID NOT NULL,
    renter_id UUID,
    owner_phone TEXT NOT NULL,
    owner_aadhar_masked TEXT NOT NULL, -- Only stores last 4 digits
    images TEXT[] NOT NULL DEFAULT '{}',
    video_url TEXT,
    declaration_accepted BOOLEAN NOT NULL DEFAULT false,
    verification_type TEXT NOT NULL DEFAULT 'handover', -- 'handover' or 'return'
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'returned'
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create verification_ratings table for owner/renter ratings
CREATE TABLE public.verification_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    verification_id UUID NOT NULL REFERENCES public.item_verifications(id) ON DELETE CASCADE,
    from_user_id UUID NOT NULL,
    to_user_id UUID NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(verification_id, from_user_id)
);

-- Add verification_enabled column to listings table
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS verification_enabled BOOLEAN DEFAULT false;

-- Enable RLS
ALTER TABLE public.item_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for item_verifications
-- Owner can view/manage their verifications
CREATE POLICY "Owners can view their verifications"
ON public.item_verifications
FOR SELECT
USING (owner_id = auth.uid() OR renter_id = auth.uid());

CREATE POLICY "Owners can create verifications"
ON public.item_verifications
FOR INSERT
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their verifications"
ON public.item_verifications
FOR UPDATE
USING (owner_id = auth.uid());

-- RLS Policies for verification_ratings
CREATE POLICY "Users can view ratings they are involved in"
ON public.verification_ratings
FOR SELECT
USING (from_user_id = auth.uid() OR to_user_id = auth.uid());

CREATE POLICY "Users can create ratings for their verifications"
ON public.verification_ratings
FOR INSERT
WITH CHECK (from_user_id = auth.uid());

-- Create private storage bucket for verification media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('verification-media', 'verification-media', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for verification-media bucket
CREATE POLICY "Authenticated users can upload verification media"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'verification-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own verification media"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'verification-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Verification participants can view media"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'verification-media' 
    AND EXISTS (
        SELECT 1 FROM public.item_verifications iv 
        WHERE (iv.owner_id = auth.uid() OR iv.renter_id = auth.uid())
        AND (
            (storage.foldername(name))[1] = iv.owner_id::text 
            OR (storage.foldername(name))[1] = iv.renter_id::text
        )
    )
);

-- Trigger for updated_at
CREATE TRIGGER update_item_verifications_updated_at
BEFORE UPDATE ON public.item_verifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();