import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Banner {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
  active: boolean;
  display_order: number;
}

export const BannerCarousel = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const { data } = await supabase
        .from('banners')
        .select('*')
        .eq('active', true)
        .order('display_order', { ascending: true });

      if (data) {
        setBanners(data);
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
    }
  };

  const nextBanner = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleBannerClick = (banner: Banner) => {
    if (banner.link_url) {
      window.open(banner.link_url, '_blank');
    }
  };

  if (banners.length === 0) return null;

  const currentBanner = banners[currentIndex];

  return (
    <div className="relative w-full overflow-hidden rounded-lg shadow-elegant mb-8 animate-fade-in">
      {/* Banner Image */}
      <div
        className={`relative w-full ${currentBanner.link_url ? 'cursor-pointer' : ''}`}
        onClick={() => handleBannerClick(currentBanner)}
      >
        <img
          src={currentBanner.image_url}
          alt={currentBanner.title}
          className="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover"
        />
        
        {/* Gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <h3 className="text-white text-lg sm:text-xl md:text-2xl font-bold">
            {currentBanner.title}
          </h3>
        </div>
      </div>

      {/* Navigation Buttons */}
      {banners.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
            onClick={prevBanner}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
            onClick={nextBanner}
          >
            <ChevronRight className="w-5 h-5" />
          </Button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-white w-6'
                    : 'bg-white/50'
                }`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
