import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Ad {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  video_url: string | null;
  link_url: string | null;
  display_duration: number;
  active: boolean;
}

export const AdPopup = () => {
  const [open, setOpen] = useState(false);
  const [currentAd, setCurrentAd] = useState<Ad | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    // Check if user has already seen an ad in this session
    const hasSeenAd = sessionStorage.getItem('hasSeenAd');
    
    if (!hasSeenAd) {
      fetchRandomAd();
    }
  }, []);

  useEffect(() => {
    if (currentAd && open && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && open) {
      handleClose();
    }
  }, [timeLeft, open, currentAd]);

  const fetchRandomAd = async () => {
    try {
      const { data } = await supabase
        .from('ads')
        .select('*')
        .eq('active', true);

      if (data && data.length > 0) {
        // Get a random ad
        const randomAd = data[Math.floor(Math.random() * data.length)];
        setCurrentAd(randomAd);
        setTimeLeft(randomAd.display_duration);
        setOpen(true);
      }
    } catch (error) {
      console.error('Error fetching ad:', error);
    }
  };

  const handleClose = () => {
    setOpen(false);
    sessionStorage.setItem('hasSeenAd', 'true');
  };

  const handleAdClick = () => {
    if (currentAd?.link_url) {
      window.open(currentAd.link_url, '_blank');
    }
  };

  if (!currentAd) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <div className="relative">
          {/* Close button with timer */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur-sm hover:bg-background/90"
            onClick={handleClose}
          >
            <X className="w-4 h-4" />
          </Button>
          
          {timeLeft > 0 && (
            <div className="absolute top-2 left-2 z-10 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-semibold">
              {timeLeft}s
            </div>
          )}

          {/* Ad Content */}
          <div 
            className={`${currentAd.link_url ? 'cursor-pointer' : ''}`}
            onClick={handleAdClick}
          >
            {/* Video or Image */}
            {currentAd.video_url ? (
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={currentAd.video_url}
                  className="absolute top-0 left-0 w-full h-full"
                  allowFullScreen
                  allow="autoplay; encrypted-media"
                />
              </div>
            ) : currentAd.image_url ? (
              <img
                src={currentAd.image_url}
                alt={currentAd.title}
                className="w-full h-auto max-h-[70vh] object-contain"
              />
            ) : null}

            {/* Ad Info */}
            <div className="p-6 bg-background">
              <h3 className="text-xl font-bold text-foreground mb-2">
                {currentAd.title}
              </h3>
              {currentAd.description && (
                <p className="text-muted-foreground mb-4">
                  {currentAd.description}
                </p>
              )}
              {currentAd.link_url && (
                <Button 
                  variant="hero" 
                  className="w-full"
                  onClick={handleAdClick}
                >
                  Learn More
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
