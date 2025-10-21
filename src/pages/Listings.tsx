import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Navbar } from '@/components/Navbar';
import { RatingCard } from '@/components/RatingCard';
import { AdPopup } from '@/components/AdPopup';
import { BannerCarousel } from '@/components/BannerCarousel';
import { useListings, incrementViews } from '@/hooks/useListings';
import { useAuth } from '@/contexts/AuthContext';
import { MapPin, Eye, Star, Tag, Package } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

const Listings = () => {
  const { listings, loading } = useListings('approved');
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [pinCodeFilter, setPinCodeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedListing, setSelectedListing] = useState<any>(null);

  const handleViewListing = (listing: any) => {
    incrementViews(listing.id);
    setSelectedListing(listing);
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         listing.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPinCode = pinCodeFilter === '' || listing.pin_code.includes(pinCodeFilter);
    const matchesCategory = categoryFilter === '' || listing.category === categoryFilter;
    return matchesSearch && matchesPinCode && matchesCategory;
  });

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'vehicles', label: 'Vehicles' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'tools', label: 'Tools' },
    { value: 'sports', label: 'Sports' },
    { value: 'books', label: 'Books' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <AdPopup />
      
      <div className="container mx-auto px-4 pt-28 pb-20">
        <div className="mb-12 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl lg:text-5xl font-serif font-bold text-foreground mb-3">
                Browse Premium Items
              </h1>
              <p className="text-xl text-muted-foreground">
                Discover verified rentals from trusted owners in your area
              </p>
            </div>
          </div>
          <BannerCarousel />
          
          <div className="space-y-6 mt-8">
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                placeholder="🔍 Search for items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 text-base shadow-soft focus:shadow-card transition-all"
              />
              <Input
                placeholder="📍 Filter by pin code..."
                value={pinCodeFilter}
                onChange={(e) => setPinCodeFilter(e.target.value)}
                className="h-12 text-base shadow-soft focus:shadow-card transition-all"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => (
                <Button
                  key={cat.value}
                  variant={categoryFilter === cat.value ? "default" : "secondary"}
                  size="default"
                  onClick={() => setCategoryFilter(cat.value)}
                  className="transition-all"
                >
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 animate-fade-in">
            <p className="text-xl text-muted-foreground">Loading listings...</p>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <p className="text-xl text-muted-foreground">
              No listings found. Be the first to list an item!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredListings.map((listing, index) => (
              <Card
                key={listing.id}
                className="group overflow-hidden hover:shadow-elegant transition-all duration-500 hover:-translate-y-3 animate-fade-in-up cursor-pointer border-border/50 hover:border-primary/30 bg-card"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => handleViewListing(listing)}
              >
                <div className="relative h-56 bg-muted overflow-hidden">
                  {listing.images && listing.images.length > 0 ? (
                    <Carousel className="w-full h-full">
                      <CarouselContent>
                        {listing.images.map((image, index) => (
                          <CarouselItem key={index}>
                            <img
                              src={image}
                              alt={`${listing.product_name} - ${index + 1}`}
                              className="w-full h-48 object-cover"
                            />
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="left-2 top-1/2 -translate-y-1/2" />
                      <CarouselNext className="right-2 top-1/2 -translate-y-1/2" />
                    </Carousel>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-primary">
                      <Package className="w-16 h-16 text-primary-foreground" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex flex-col gap-2 z-10">
                    <div className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-semibold shadow-card">
                      ₹{listing.rent_price}/day
                    </div>
                    {listing.product_type && (
                      <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold shadow-card flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        {listing.product_type === 'both' ? 'Rent & Sale' : listing.product_type === 'sale' ? 'For Sale' : 'For Rent'}
                      </div>
                    )}
                  </div>
                  {listing.listing_type === 'paid' && (
                    <div className="absolute top-2 left-2 z-10">
                     <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md flex items-center justify-center">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-2 w-2 mr-1"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M22.25 12c0 5.65-4.6 10.25-10.25 10.25S1.75 17.65 1.75 12 6.35 1.75 12 1.75 22.25 6.35 22.25 12zm-5.97-3.53l-5.33 5.34-2.83-2.83 1.06-1.06 1.77 1.77 4.27-4.27 1.06 1.06z" />
  </svg>
  👑
</div>

                    </div>
                  )}
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {listing.product_name}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {listing.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{listing.pin_code}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Eye className="w-4 h-4" />
                        <span>{listing.views || 0}</span>
                      </div>
                      <div className="flex items-center gap-1 text-accent">
                        <Star className="w-4 h-4 fill-current" />
                        <span>{listing.rating?.toFixed(1) || '5.0'}</span>
                      </div>
                    </div>
                  </div>

                  <Button variant="premium" className="w-full">
                    Contact Owner
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Listing Details Dialog */}
      <Dialog open={!!selectedListing} onOpenChange={() => setSelectedListing(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedListing && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedListing.product_name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {selectedListing.images && selectedListing.images.length > 0 && (
                  <Carousel className="w-full">
                    <CarouselContent>
                      {selectedListing.images.map((image: string, index: number) => (
                        <CarouselItem key={index}>
                          <div className="rounded-lg overflow-hidden">
                            <img
                              src={image}
                              alt={`${selectedListing.product_name} - ${index + 1}`}
                              className="w-full h-96 object-cover"
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                  </Carousel>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Details</h3>
                    <p className="text-foreground">{selectedListing.description}</p>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>Pin Code: {selectedListing.pin_code}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      <span>
                        {selectedListing.product_type === 'both' 
                          ? 'Available for Rent & Sale' 
                          : selectedListing.product_type === 'sale' 
                          ? 'For Sale' 
                          : 'For Rent'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Pricing & Stats</h3>
                    <p className="text-3xl font-bold text-primary">₹{selectedListing.rent_price}/day</p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{selectedListing.views || 0} views</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-accent text-accent" />
                        <span>{selectedListing.rating?.toFixed(1) || '0.0'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Card className="p-4 bg-muted/50 space-y-3">
                  <h3 className="font-semibold text-lg">Contact Owner</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Phone: </span>
                      <span className="text-foreground">{selectedListing.phone || 'Not provided'}</span>
                    </div>
                    <div>
                      <span className="font-medium">Address: </span>
                      <span className="text-foreground">{selectedListing.address || 'Not provided'}</span>
                    </div>
                  </div>
                  <Button className="w-full" size="lg">
                    Call Owner
                  </Button>
                </Card>

                <div>
                </div>

                <RatingCard listingId={selectedListing.id} currentUserId={user?.id} />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Listings;
