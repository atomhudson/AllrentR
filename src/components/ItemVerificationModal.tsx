import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Camera,
  Video,
  Upload,
  X,
  Star,
  Shield,
  Eye,
  Loader2,
  CheckCircle2,
  FileText,
} from "lucide-react";

interface ItemVerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listingId: string;
  ownerId: string;
  currentUserId: string;
  isOwner: boolean;
  verificationEnabled: boolean;
  onVerificationEnabledChange?: (enabled: boolean) => void;
}

interface Verification {
  id: string;
  listing_id: string;
  owner_id: string;
  renter_id: string | null;
  owner_phone: string;
  owner_aadhar_masked: string;
  images: string[];
  video_url: string | null;
  declaration_accepted: boolean;
  verification_type: string;
  status: string;
  created_at: string;
}

interface VerificationRating {
  id: string;
  verification_id: string;
  from_user_id: string;
  to_user_id: string;
  rating: number;
  feedback: string | null;
}

export const ItemVerificationModal = ({
  open,
  onOpenChange,
  listingId,
  ownerId,
  currentUserId,
  isOwner,
  verificationEnabled,
  onVerificationEnabledChange,
}: ItemVerificationModalProps) => {
  const [mode, setMode] = useState<"form" | "view" | "rate">("form");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [verification, setVerification] = useState<Verification | null>(null);
  const [existingRating, setExistingRating] = useState<VerificationRating | null>(null);

  // Form state
  const [ownerPhone, setOwnerPhone] = useState("");
  const [ownerAadhar, setOwnerAadhar] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [declarationAccepted, setDeclarationAccepted] = useState(false);

  // Rating state
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  useEffect(() => {
    if (open && listingId) {
      fetchVerification();
    }
  }, [open, listingId]);

  const fetchVerification = async () => {
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("item_verifications")
        .select("*")
        .eq("listing_id", listingId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setVerification(data);
        setMode("view");
        
        // Check for existing rating from current user
        const { data: ratingData } = await (supabase as any)
          .from("verification_ratings")
          .select("*")
          .eq("verification_id", data.id)
          .eq("from_user_id", currentUserId)
          .maybeSingle();
        
        if (ratingData) {
          setExistingRating(ratingData);
        }
      } else {
        setMode("form");
      }
    } catch (error) {
      console.error("Error fetching verification:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 6) {
      toast({ title: "Maximum 6 images allowed", variant: "destructive" });
      return;
    }
    
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: `${file.name} is too large (max 5MB)`, variant: "destructive" });
        return false;
      }
      return true;
    });

    setImages(prev => [...prev, ...validFiles]);
    
    // Create preview URLs
    validFiles.forEach(file => {
      const url = URL.createObjectURL(file);
      setImageUrls(prev => [...prev, url]);
    });
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast({ title: "Video too large (max 50MB)", variant: "destructive" });
      return;
    }

    setVideo(file);
    setVideoUrl(URL.createObjectURL(file));
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(imageUrls[index]);
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideo(null);
    setVideoUrl(null);
  };

  const uploadMedia = async () => {
    const uploadedUrls: string[] = [];
    let uploadedVideoUrl: string | null = null;

    // Upload images
    for (const image of images) {
      const fileName = `${currentUserId}/${listingId}/${Date.now()}_${image.name}`;
      const { error } = await supabase.storage
        .from("verification-media")
        .upload(fileName, image);

      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from("verification-media")
        .getPublicUrl(fileName);
      
      uploadedUrls.push(publicUrl);
    }

    // Upload video if exists
    if (video) {
      const fileName = `${currentUserId}/${listingId}/${Date.now()}_${video.name}`;
      const { error } = await supabase.storage
        .from("verification-media")
        .upload(fileName, video);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from("verification-media")
        .getPublicUrl(fileName);
      
      uploadedVideoUrl = publicUrl;
    }

    return { uploadedUrls, uploadedVideoUrl };
  };

  const handleSubmit = async () => {
    if (images.length < 6) {
      toast({ title: "Please upload 6 images", variant: "destructive" });
      return;
    }
    if (!ownerPhone || ownerPhone.length < 10) {
      toast({ title: "Please enter valid phone number", variant: "destructive" });
      return;
    }
    if (!ownerAadhar || ownerAadhar.length < 4) {
      toast({ title: "Please enter Aadhar number", variant: "destructive" });
      return;
    }
    if (!declarationAccepted) {
      toast({ title: "Please accept the declaration", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const { uploadedUrls, uploadedVideoUrl } = await uploadMedia();

      // Mask Aadhar - only store last 4 digits
      const maskedAadhar = `XXXX-XXXX-${ownerAadhar.slice(-4)}`;

      const { data, error } = await (supabase as any)
        .from("item_verifications")
        .insert({
          listing_id: listingId,
          owner_id: ownerId,
          owner_phone: ownerPhone,
          owner_aadhar_masked: maskedAadhar,
          images: uploadedUrls,
          video_url: uploadedVideoUrl,
          declaration_accepted: true,
          verification_type: "handover",
          status: "completed",
        })
        .select()
        .single();

      if (error) throw error;

      setVerification(data);
      setMode("view");
      toast({ title: "Verification submitted successfully!" });
    } catch (error: any) {
      console.error("Error submitting verification:", error);
      toast({ title: "Error submitting verification", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRatingSubmit = async () => {
    if (rating === 0) {
      toast({ title: "Please select a rating", variant: "destructive" });
      return;
    }
    if (!verification) return;

    setRatingSubmitting(true);
    try {
      // Determine who we're rating
      const toUserId = isOwner ? verification.renter_id : verification.owner_id;
      
      if (!toUserId) {
        toast({ title: "No renter associated with this verification", variant: "destructive" });
        return;
      }

      const { data, error } = await (supabase as any)
        .from("verification_ratings")
        .insert({
          verification_id: verification.id,
          from_user_id: currentUserId,
          to_user_id: toUserId,
          rating,
          feedback: feedback || null,
        })
        .select()
        .single();

      if (error) throw error;

      setExistingRating(data);
      toast({ title: "Rating submitted successfully!" });
      setMode("view");
    } catch (error: any) {
      console.error("Error submitting rating:", error);
      toast({ title: "Error submitting rating", description: error.message, variant: "destructive" });
    } finally {
      setRatingSubmitting(false);
    }
  };

  const toggleVerificationEnabled = async () => {
    try {
      const newValue = !verificationEnabled;
      const { error } = await supabase
        .from("listings")
        .update({ verification_enabled: newValue })
        .eq("id", listingId);

      if (error) throw error;
      
      onVerificationEnabledChange?.(newValue);
      toast({ title: newValue ? "Verification enabled" : "Verification disabled" });
    } catch (error: any) {
      toast({ title: "Error updating setting", variant: "destructive" });
    }
  };

  const renderForm = () => (
    <div className="space-y-6">
      {/* Owner Details */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          Owner Details
        </h3>
        
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="Enter phone number"
            value={ownerPhone}
            onChange={(e) => setOwnerPhone(e.target.value)}
            maxLength={10}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="aadhar">Aadhar Number * (will be masked)</Label>
          <Input
            id="aadhar"
            type="text"
            placeholder="Enter Aadhar number"
            value={ownerAadhar}
            onChange={(e) => setOwnerAadhar(e.target.value.replace(/\D/g, ""))}
            maxLength={12}
          />
          <p className="text-xs text-gray-500">Only last 4 digits will be stored for security</p>
        </div>
      </div>

      {/* Image Upload */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Camera className="w-4 h-4 text-primary" />
          Condition Images ({images.length}/6) *
        </h3>
        
        <div className="grid grid-cols-3 gap-2">
          {imageUrls.map((url, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
              <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
              <button
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          
          {images.length < 6 && (
            <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
              <Upload className="w-6 h-6 text-gray-400 mb-1" />
              <span className="text-xs text-gray-500">Add</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      {/* Video Upload */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Video className="w-4 h-4 text-primary" />
          Video (Optional)
        </h3>
        
        {videoUrl ? (
          <div className="relative rounded-lg overflow-hidden border border-gray-200">
            <video src={videoUrl} controls className="w-full max-h-48" />
            <button
              onClick={removeVideo}
              className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="block p-6 rounded-lg border-2 border-dashed border-gray-300 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
            <Video className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <span className="text-sm text-gray-600">Upload video (max 50MB)</span>
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* Declaration */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
        <Checkbox
          id="declaration"
          checked={declarationAccepted}
          onCheckedChange={(checked) => setDeclarationAccepted(checked as boolean)}
        />
        <Label htmlFor="declaration" className="text-sm text-amber-800 cursor-pointer leading-relaxed">
          I confirm these images and video represent the actual condition of the item at the time of handover.
        </Label>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={submitting || images.length < 6 || !declarationAccepted}
        className="w-full bg-gradient-to-r from-primary to-accent"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Submit Verification
          </>
        )}
      </Button>
    </div>
  );

  const renderView = () => (
    <div className="space-y-6">
      {verification && (
        <>
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Verified on {new Date(verification.created_at).toLocaleDateString()}
            </div>
          </div>

          {/* Owner Details */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-2">
            <h4 className="font-medium text-gray-700">Owner Details</h4>
            <p className="text-sm text-gray-600">Phone: {verification.owner_phone}</p>
            <p className="text-sm text-gray-600">Aadhar: {verification.owner_aadhar_masked}</p>
          </div>

          {/* Images Grid */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700">Condition Images</h4>
            <div className="grid grid-cols-3 gap-2">
              {verification.images.map((url, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                  <img 
                    src={url} 
                    alt={`Condition ${index + 1}`} 
                    className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open(url, '_blank')}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Video */}
          {verification.video_url && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">Condition Video</h4>
              <video
                src={verification.video_url}
                controls
                className="w-full rounded-lg border border-gray-200"
              />
            </div>
          )}

          {/* Rating Section */}
          {existingRating ? (
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <h4 className="font-medium text-amber-800 mb-2">Your Rating</h4>
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${star <= existingRating.rating ? "text-amber-500 fill-amber-500" : "text-gray-300"}`}
                  />
                ))}
              </div>
              {existingRating.feedback && (
                <p className="text-sm text-amber-700">{existingRating.feedback}</p>
              )}
            </div>
          ) : (
            verification.status === "completed" && (
              <Button
                onClick={() => setMode("rate")}
                variant="outline"
                className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
              >
                <Star className="w-4 h-4 mr-2" />
                Rate Transaction
              </Button>
            )
          )}
        </>
      )}
    </div>
  );

  const renderRating = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="font-semibold text-gray-800 mb-2">Rate Your Experience</h3>
        <p className="text-sm text-gray-600">
          {isOwner ? "Rate the renter" : "Rate the owner"}
        </p>
      </div>

      {/* Star Rating */}
      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            className="p-1 transition-transform hover:scale-110"
          >
            <Star
              className={`w-10 h-10 ${star <= rating ? "text-amber-500 fill-amber-500" : "text-gray-300"}`}
            />
          </button>
        ))}
      </div>

      {/* Feedback */}
      <div className="space-y-2">
        <Label htmlFor="feedback">Feedback (Optional)</Label>
        <Textarea
          id="feedback"
          placeholder="Share your experience..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={3}
        />
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => setMode("view")}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={handleRatingSubmit}
          disabled={ratingSubmitting || rating === 0}
          className="flex-1 bg-gradient-to-r from-primary to-accent"
        >
          {ratingSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Submit Rating"
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Item Condition & Verification
          </DialogTitle>
          <DialogDescription>
            {mode === "form" && "Document item condition for secure handover"}
            {mode === "view" && "View verification details"}
            {mode === "rate" && "Rate your transaction experience"}
          </DialogDescription>
        </DialogHeader>

        {/* Owner Toggle */}
        {isOwner && (
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200 mb-4">
            <span className="text-sm font-medium text-blue-800">Enable Verification</span>
            <Button
              size="sm"
              variant={verificationEnabled ? "default" : "outline"}
              onClick={toggleVerificationEnabled}
              className={verificationEnabled ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              {verificationEnabled ? "Enabled" : "Disabled"}
            </Button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {mode === "form" && isOwner && renderForm()}
            {mode === "view" && renderView()}
            {mode === "rate" && renderRating()}
            {mode === "form" && !isOwner && (
              <div className="text-center py-8 text-gray-500">
                <Eye className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Only the listing owner can submit verification</p>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
