import { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  onImagesUploaded: (urls: string[]) => void;
  currentImages?: string[];
  userId: string;
  maxImages?: number;
}

export const ImageUpload = ({ onImagesUploaded, currentImages = [], userId, maxImages = 100 }: ImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previews, setPreviews] = useState<string[]>(currentImages);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const uploadFile = async (file: File) => {
    if (previews.length >= maxImages) {
      toast({
        title: "Maximum images reached",
        description: `You can only upload up to ${maxImages} images`,
        variant: "destructive",
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, WebP, or GIF)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('listing-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('listing-images')
        .getPublicUrl(fileName);

      const newPreviews = [...previews, publicUrl];
      setPreviews(newPreviews);
      onImagesUploaded(newPreviews);

      toast({
        title: "Image uploaded successfully",
        description: `${newPreviews.length}/${maxImages} images uploaded`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => uploadFile(file));
  }, [userId, previews]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => uploadFile(file));
  };

  const handleRemove = (index: number) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
    onImagesUploaded(newPreviews);
  };

  return (
    <div className="space-y-4">
      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative rounded-lg overflow-hidden border-2 border-border">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-48 object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-2 right-2 p-2 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {previews.length < maxImages && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative border-2 border-dashed rounded-lg p-8 transition-all duration-300",
            isDragging ? "border-primary bg-primary/5 scale-105" : "border-border hover:border-primary/50",
            isUploading && "opacity-50 pointer-events-none"
          )}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileInput}
            disabled={isUploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            {isUploading ? (
              <>
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </>
            ) : (
              <>
                <div className="p-4 bg-primary/10 rounded-full">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    Drag & drop your images here
                  </p>
                  <p className="text-xs text-muted-foreground">
                    or click to browse ({previews.length}/{maxImages} images, max 5MB each)
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <ImageIcon className="w-4 h-4" />
                  <span>JPEG, PNG, WebP, or GIF</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
