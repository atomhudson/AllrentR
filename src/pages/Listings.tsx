import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AdPopup } from "@/components/AdPopup";
import BannerCarousel from "@/components/BannerCarousel";
import FilterSection from "@/components/FilterSection";
import { useListings, incrementViews } from "@/hooks/useListings";
import { useSectionVisibility } from "@/hooks/useSectionVisibility";
import { useAuth } from "@/contexts/AuthContext";
import GoogleAd from "@/components/GoogleAd";
import Footer from "@/components/Footer";
import {
  MapPin,
  Eye,
  Star,
  Package,
  Tag,
  Sparkles,
  Heart,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Car,
  Sofa,
  Hammer,
  Trophy,
  BookOpen,
  Shirt,
  Box,
  LayoutGrid,
  Building2,
  Home,
  Store,
  Hotel,
  DoorOpen,
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDebounce } from "@/hooks/useDebounce";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const Listings = () => {
  const navigate = useNavigate();
  const { listings, loading } = useListings("approved");
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  
  const { isVisible: isPropertyModeVisible } = useSectionVisibility('property_mode');

  const [searchQuery, setSearchQuery] = useState("");
  const [pinCodeFilter, setPinCodeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [clusterMode, setClusterMode] = useState<"none" | "city" | "pin" | "geo">("none");
  const [selectedClusterItems, setSelectedClusterItems] = useState<any[] | null>(null);
  const [nearbyEnabled, setNearbyEnabled] = useState(false);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);
  const [radiusMeters, setRadiusMeters] = useState<number>(5000);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyListings, setNearbyListings] = useState<any[]>([]);
  const [distanceById, setDistanceById] = useState<Record<string, number>>({});

  // New filters and sort
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1000000);
  const [sortBy, setSortBy] = useState<string>("newest");

  // Wishlist state
  const [wishlist, setWishlist] = useState<string[]>([]);

  // Mode state: Default is Items mode (ON)
  const [isItemsMode, setIsItemsMode] = useState(true);

  // Dialog state for no nearby results
  const [showNoResultsDialog, setShowNoResultsDialog] = useState(false);
  const [closestListingInfo, setClosestListingInfo] = useState<string>("");

  // Reset to items mode if the feature is hidden by admin
  useEffect(() => {
    if (!isPropertyModeVisible) {
      setIsItemsMode(true);
      setCategoryFilter("");
    }
  }, [isPropertyModeVisible]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const propertyCategoryValues = ['pg', 'room', 'flat', 'house', 'office', 'shop', 'warehouse'];

  useEffect(() => {
    if (user) {
      const fetchWishlist = async () => {
        const { data } = await (supabase as any)
          .from('wishlist')
          .select('listing_id')
          .eq('user_id', user.id);
        if (data) {
          setWishlist(data.map(item => item.listing_id));
        }
      };
      fetchWishlist();
    }
  }, [user]);

  const toggleWishlist = async (e: React.MouseEvent, listingId: string) => {
    e.stopPropagation();
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to add items to your wishlist",
        variant: "destructive"
      });
      return;
    }

    if (wishlist.includes(listingId)) {
      // Remove
      const { error } = await (supabase as any)
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('listing_id', listingId);

      if (!error) {
        setWishlist(prev => prev.filter(id => id !== listingId));
        toast({ title: "Removed from wishlist" });
      }
    } else {
      // Add
      const { error } = await (supabase as any)
        .from('wishlist')
        .insert({ user_id: user.id, listing_id: listingId });

      if (!error) {
        setWishlist(prev => [...prev, listingId]);
        toast({ title: "Added to wishlist" });
      }
    }
  };

  const requestLocation = () => {
    if (!('geolocation' in navigator)) {
      toast({
        title: 'Geolocation not supported',
        description: 'Your browser does not support location services.',
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }
    // Clear previous coordinates to ensure fresh location
    setUserLat(null);
    setUserLng(null);
    setNearbyListings([]);
    setDistanceById({});

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
        setNearbyEnabled(true);
        toast({
          title: 'Location enabled',
          description: 'Showing listings near you',
          duration: 3000,
        });
      },
      (err) => {
        console.error('Geolocation error:', err);
        setNearbyEnabled(false);
        // Silently fail for auto-fetch, don't show toast unless manual
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
    );
  };

  // Auto-fetch location removed as per user request
  // Location is now handled only via manual button click

  const handleViewListing = (listing: any) => {
    incrementViews(listing.id);
    // Generate SEO-friendly slug from product name
    const slug = listing.product_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    // Use display_id with hyphens for URL (converted from PROD_xxx to PROD-xxx)
    const urlId = (listing.display_id || listing.id).replace('_', '-');
    navigate(`/listings/${slug}-${urlId}`);
  };

  const debouncedSearch = useDebounce(searchQuery, 500);
  const debouncedPin = useDebounce(pinCodeFilter, 500);

  const baseFiltered = useMemo(() => {
    return listings.filter((listing) => {
      const matchesSearch =
        listing.product_name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        listing.description.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesPinCode =
        debouncedPin === "" || listing.pin_code.includes(debouncedPin);
      
      const isProperty = propertyCategoryValues.includes(listing.category?.toLowerCase() || "");
      const matchesCategory = categoryFilter === "" 
        ? (isItemsMode ? !isProperty : isProperty)
        : listing.category === categoryFilter;
        
      const matchesPrice = (listing.rent_price || 0) >= minPrice && (listing.rent_price || 0) <= maxPrice;

      return matchesSearch && matchesPinCode && matchesCategory && matchesPrice;
    }).sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return (a.rent_price || 0) - (b.rent_price || 0);
        case 'price_desc':
          return (b.rent_price || 0) - (a.rent_price || 0);
        case 'most_reviewed':
          return (b.views || 0) - (a.views || 0); // Using views as proxy for now, or fetch review count
        case 'top_rated':
          return (b.rating || 0) - (a.rating || 0);
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  }, [listings, debouncedSearch, debouncedPin, categoryFilter, minPrice, maxPrice, sortBy, isItemsMode]);

  const nearbyFiltered = useMemo(() => {
    if (!nearbyEnabled) return [];
    return nearbyListings.filter((listing) => {
      const matchesSearch =
        listing.product_name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (listing.description || "").toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesPinCode = debouncedPin === "" || (listing.pin_code || "").includes(debouncedPin);
      
      const isProperty = propertyCategoryValues.includes(listing.category?.toLowerCase() || "");
      const matchesCategory = categoryFilter === "" 
        ? (isItemsMode ? !isProperty : isProperty)
        : listing.category === categoryFilter;

      return matchesSearch && matchesPinCode && matchesCategory;
    }).sort((a, b) => (distanceById[a.id] || 0) - (distanceById[b.id] || 0));
  }, [nearbyEnabled, nearbyListings, debouncedSearch, debouncedPin, categoryFilter, distanceById, isItemsMode]);

  // If a cluster is selected, show only those items
  const clusterFiltered = useMemo(() => {
    if (!selectedClusterItems || selectedClusterItems.length === 0) return null;
    return selectedClusterItems.filter((listing) => {
      const matchesSearch =
        listing.product_name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        (listing.description || "").toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesPinCode = debouncedPin === "" || (listing.pin_code || "").includes(debouncedPin);
      
      const isProperty = propertyCategoryValues.includes(listing.category?.toLowerCase() || "");
      const matchesCategory = categoryFilter === "" 
        ? (isItemsMode ? !isProperty : isProperty)
        : listing.category === categoryFilter;

      return matchesSearch && matchesPinCode && matchesCategory;
    });
  }, [selectedClusterItems, debouncedSearch, debouncedPin, categoryFilter, isItemsMode]);

  const filteredListings = clusterFiltered !== null
    ? clusterFiltered
    : (nearbyEnabled ? nearbyFiltered : baseFiltered);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, debouncedPin, categoryFilter, minPrice, maxPrice, sortBy, nearbyEnabled, clusterMode]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredListings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedListings = filteredListings.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    // Scroll to listings section
    setTimeout(() => {
      const listingsSection = document.getElementById('listings-section');
      if (listingsSection) {
        listingsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Haversine helper for fallback distance calculations
  const haversineMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (d: number) => (d * Math.PI) / 180;
    const R = 6371000; // meters
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Fetch nearby listings via RPC then hydrate to full records
  useEffect(() => {
    const fetchNearby = async () => {
      if (!nearbyEnabled || userLat == null || userLng == null) {
        setNearbyListings([]);
        setDistanceById({});
        return;
      }
      setNearbyLoading(true);
      try {
        // Cast to any to allow calling custom RPC without generated types
        const { data: rpcData, error: rpcError } = await (supabase.rpc as any)('get_nearby_listings', {
          user_lat: userLat,
          user_lng: userLng,
          radius_meters: radiusMeters
        });

        if (rpcError) {
          console.error('RPC error:', rpcError);
          throw rpcError;
        }

        const rpcRows: any[] = Array.isArray(rpcData) ? rpcData : [];
        console.log('RPC returned', rpcRows.length, 'nearby listings');

        if (rpcRows.length === 0) {
          // RPC returned empty - this is normal if no listings in radius or RPC not available
          // Silently fall through to client-side fallback
          console.log('RPC returned no results, using client-side fallback');
        } else {
          // RPC succeeded, process results
          const ids = rpcRows.map((r: any) => r.id);
          const distanceMap: Record<string, number> = {};
          rpcRows.forEach((r: any) => { distanceMap[r.id] = r.distance_meters; });
          setDistanceById(distanceMap);

          const { data: fullRows, error: selError } = await supabase
            .from('listings')
            .select('*')
            .in('id', ids);
          if (selError) throw selError;

          // Preserve RPC order by distance
          const orderIndex: Record<string, number> = {};
          ids.forEach((id: string, i: number) => { orderIndex[id] = i; });
          const ordered = (fullRows || []).slice().sort((a: any, b: any) => orderIndex[a.id] - orderIndex[b.id]);
          setNearbyListings(ordered);
          console.log('Nearby listings set from RPC:', ordered.length);
          setNearbyLoading(false);
          return; // Exit early if RPC succeeded
        }

      } catch (e) {
        console.warn('RPC error, using client-side fallback:', e);
      }

      // Fallback: compute nearby client-side from all approved listings
      // This runs if RPC returned empty or failed
      try {
        const candidates = listings.filter((l: any) =>
          typeof l.latitude === 'number' &&
          typeof l.longitude === 'number' &&
          !isNaN(l.latitude) &&
          !isNaN(l.longitude)
        );
        console.log('Fallback: found', candidates.length, 'listings with coordinates');

        if (candidates.length === 0) {
          console.warn('No listings with coordinates found');
          setNearbyListings([]);
          setDistanceById({});
          setNearbyLoading(false);
          return;
        }

        const distances: Record<string, number> = {};
        // Calculate distances for all candidates first
        candidates.forEach((l: any) => {
          const d = haversineMeters(userLat!, userLng!, l.latitude, l.longitude);
          distances[l.id] = d;
        });

        // Filter to within radius - respect the user's radius selection
        const within = candidates.filter((l: any) => {
          return distances[l.id] <= radiusMeters;
        }).sort((a: any, b: any) => (distances[a.id] || 0) - (distances[b.id] || 0));

        console.log('Fallback: found', within.length, 'listings within', radiusMeters, 'meters');
        console.log('User location:', userLat, userLng);
        console.log('Total candidates with coordinates:', candidates.length);
        console.log('Sample distances:', Object.entries(distances).slice(0, 5));

        // Only store distances for listings within radius
        const distanceMap: Record<string, number> = {};
        within.forEach((l: any) => {
          distanceMap[l.id] = distances[l.id];
        });
        setDistanceById(distanceMap);
        setNearbyListings(within);

        if (within.length === 0) {
          // If no listings at current radius, try expanding automatically once (from 5km to 10km)
          if (radiusMeters < 10000) {
            setRadiusMeters(10000);
            return;
          }

          // Find the closest listing to suggest increasing radius
          const allSorted = candidates.sort((a: any, b: any) => (distances[a.id] || 0) - (distances[b.id] || 0));
          const closestDistance = allSorted.length > 0 ? distances[allSorted[0].id] : null;
          const closestKm = closestDistance ? (closestDistance / 1000).toFixed(1) : 'unknown';

          setClosestListingInfo(closestDistance ? `Closest listing is ${closestKm}km away.` : "");
          setShowNoResultsDialog(true);
        }
      } catch (err) {
        console.error('Nearby fallback failed', err);
        setNearbyListings([]);
        setDistanceById({});
        toast({
          title: 'Error finding nearby listings',
          description: 'Unable to calculate nearby listings. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setNearbyLoading(false);
      }
    };
    fetchNearby();
  }, [nearbyEnabled, userLat, userLng, radiusMeters, listings]);

  // Client-side clusters derived from filtered listings
  const clusters = useMemo(() => {
    // console.log('Clusters useMemo triggered, clusterMode:', clusterMode, 'listings count:', listings.length);
    if (clusterMode === 'none') {
      // console.log('Cluster mode is none, returning empty');
      return [] as any[];
    }

    // Use base listings (not filtered) for clustering but respect the current mode (Items vs Properties)
    const sourceListings = (listings.length > 0 ? listings : []).filter(listing => {
      const isProperty = propertyCategoryValues.includes(listing.category?.toLowerCase() || "");
      return isItemsMode ? !isProperty : isProperty;
    });
    
    if (!sourceListings || sourceListings.length === 0) {
      // console.log('No listings available for clustering');
      return [] as any[];
    }

    // console.log('Computing clusters for', sourceListings.length, 'listings, mode:', clusterMode);

    if (clusterMode === 'city') {
      const map: Record<string, any[]> = {};
      sourceListings.forEach((l: any) => {
        const key = (l.city && l.city.trim()) || 'Unknown';
        if (!map[key]) map[key] = [];
        map[key].push(l);
      });
      const result = Object.entries(map).map(([key, items]) => ({
        key,
        label: key,
        count: (items as any[]).length,
        items: items as any[],
      })).sort((a, b) => b.count - a.count);
      // console.log('City clusters:', result.length);
      return result;
    }

    if (clusterMode === 'pin') {
      const map: Record<string, any[]> = {};
      sourceListings.forEach((l: any) => {
        const key = (l.pin_code && l.pin_code.trim()) || '—';
        if (!map[key]) map[key] = [];
        map[key].push(l);
      });
      const result = Object.entries(map).map(([key, items]) => ({
        key,
        label: `PIN ${key}`,
        count: (items as any[]).length,
        items: items as any[],
      })).sort((a, b) => b.count - a.count);
      // console.log('PIN clusters:', result.length);
      return result;
    }

    // geo clustering by coarse lat/lng grid (~1km). Uses 0.01 deg buckets as a simple approximation
    if (clusterMode === 'geo') {
      const grid: Record<string, any[]> = {};
      sourceListings.forEach((l: any) => {
        if (typeof l.latitude !== 'number' || typeof l.longitude !== 'number' ||
          isNaN(l.latitude) || isNaN(l.longitude)) return;
        const latBucket = Math.round(l.latitude * 100) / 100;
        const lngBucket = Math.round(l.longitude * 100) / 100;
        const key = `${latBucket.toFixed(2)},${lngBucket.toFixed(2)}`;
        if (!grid[key]) grid[key] = [];
        grid[key].push(l);
      });
      const result = Object.entries(grid).map(([key, items]) => ({
        key,
        label: key,
        count: (items as any[]).length,
        items: items as any[],
      })).sort((a, b) => b.count - a.count);
      // console.log('Geo clusters:', result.length);
      return result;
    }

    return [] as any[];
  }, [clusterMode, listings, filteredListings, isItemsMode]);

  const itemCategories = [
    { value: "", label: "All Items", icon: LayoutGrid },
    { value: "electronics", label: "Electronics", icon: Monitor },
    { value: "vehicles", label: "Vehicles", icon: Car },
    { value: "furniture", label: "Furniture", icon: Sofa },
    { value: "tools", label: "Tools", icon: Hammer },
    { value: "sports", label: "Sports", icon: Trophy },
    { value: "books", label: "Books", icon: BookOpen },
    { value: "clothing", label: "Clothing", icon: Shirt },
    { value: "other", label: "Other", icon: Box },
  ];

  const accommodationCategories = [
    { value: "", label: "All Properties", icon: LayoutGrid },
    { value: "pg", label: "PG / Hostel", icon: Hotel },
    { value: "room", label: "Single Room", icon: DoorOpen },
    { value: "flat", label: "Flat / Apartment", icon: Building2 },
    { value: "house", label: "Independent House", icon: Home },
    { value: "office", label: "Office Space", icon: Store },
    { value: "shop", label: "Shop", icon: Store },
    { value: "warehouse", label: "Warehouse", icon: Package },
  ];

  const categoryConfig = isItemsMode ? itemCategories : accommodationCategories;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F3F4] to-white relative">
      <Navbar />
      <AdPopup />

      {/* Decorative soft glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 left-10 w-72 h-72 bg-[#E5383B]/8 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-[#BA181B]/8 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 pt-28 pb-20 relative z-10">
        <div className="mb-12 text-center space-y-4 animate-fade-in">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#161A1D]">
              {isItemsMode ? "Browse Premium Items" : "Browse Accommodations"}
            </h1>
            
            {isPropertyModeVisible && (
              <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-[#E5E5E5] shadow-sm">
                <Switch 
                  id="mode-toggle" 
                  checked={isItemsMode} 
                  onCheckedChange={(val) => {
                    setIsItemsMode(val);
                    setCategoryFilter(""); // Reset category when switching
                  }}
                  className="data-[state=checked]:bg-[#E5383B]"
                />
                <Label htmlFor="mode-toggle" className="text-[10px] font-bold uppercase tracking-wider text-[#660708] cursor-pointer">
                  {isItemsMode ? "Rental Items" : "Properties Mode"}
                </Label>
              </div>
            )}
          </div>
          <p className="text-lg text-[#660708]/70 max-w-lg mx-auto">
            {isItemsMode 
              ? "Discover verified rentals from trusted owners near you" 
              : "Find perfect PG, Rooms, Flats and more from trusted owners"}
          </p>

          <div className="pt-2">
            <Button
              onClick={requestLocation}
              className={`group relative overflow-hidden bg-white border border-[#E5383B]/30 text-[#E5383B] hover:text-white font-semibold rounded-full px-6 sm:px-8 py-4 sm:py-6 shadow-md transition-all duration-300 hover:scale-105 active:scale-95 ${nearbyEnabled ? 'bg-gradient-to-r from-[#E5383B] to-[#BA181B] text-white border-none' : ''}`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#E5383B] to-[#BA181B] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative flex items-center gap-2 text-sm sm:text-base">
                <MapPin className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 group-hover:animate-bounce ${nearbyEnabled ? 'fill-white text-white' : ''}`} />
                {nearbyEnabled ? "Location Enabled" : "Enable Near Me"}
              </span>
            </Button>
          </div>

          <div className="w-16 h-1 mx-auto bg-gradient-to-r from-[#E5383B] to-[#BA181B] rounded-full mt-6" />
        </div>

        <BannerCarousel />

        {/* Smart Filters Section */}
        <FilterSection
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          pinCodeFilter={pinCodeFilter}
          setPinCodeFilter={setPinCodeFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          categories={categoryConfig}
          nearbyEnabled={nearbyEnabled}
          setNearbyEnabled={setNearbyEnabled}
          requestLocation={requestLocation}
          radiusMeters={radiusMeters}
          setRadiusMeters={setRadiusMeters}
          clusterMode={clusterMode}
          setClusterMode={setClusterMode}
          setSelectedClusterItems={setSelectedClusterItems}
          minPrice={minPrice}
          setMinPrice={setMinPrice}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />

        {/* Category Quick Filters */}
        <div className="mb-10 animate-fade-in overflow-hidden">
          <div className="flex items-center justify-start md:justify-center gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:display-none">
            {categoryConfig.map((cat) => {
              const Icon = cat.icon;
              const isActive = categoryFilter === cat.value;
              
              return (
                <button
                  key={cat.label}
                  onClick={() => setCategoryFilter(cat.value)}
                  className={`flex flex-col items-center gap-2 min-w-[80px] group transition-all duration-300 ${
                    isActive ? 'opacity-100' : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className={`p-4 rounded-2xl transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-br from-[#E5383B] to-[#BA181B] text-white shadow-lg scale-110' 
                      : 'bg-white border border-[#E5E5E5] text-[#660708] group-hover:border-[#E5383B]/30 group-hover:shadow-md group-hover:-translate-y-1'
                  }`}>
                    <Icon className="w-5 h-5 flex-shrink-0" />
                  </div>
                  <span className={`text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
                    isActive ? 'text-[#E5383B]' : 'text-[#660708]/70 group-hover:text-[#660708]'
                  }`}>
                    {cat.label}
                  </span>
                  {isActive && (
                    <motion.div 
                      layoutId="activeCategory"
                      className="w-1.5 h-1.5 rounded-full bg-[#E5383B]" 
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <GoogleAd slot="7233876092" />

        {/* Listings Section */}
        <div id="listings-section">
          {/* Show indicator when viewing cluster items */}
          {selectedClusterItems && selectedClusterItems.length > 0 && (
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-[#E5383B]/10 to-[#BA181B]/10 border border-[#E5383B]/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-[#E5383B]" />
                <span className="text-sm font-semibold text-[#660708]">
                  Showing {filteredListings.length} items from selected cluster
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedClusterItems(null);
                  setSearchQuery('');
                  setPinCodeFilter('');
                  setCategoryFilter('');
                }}
                className="border-[#E5383B] text-[#E5383B] hover:bg-[#E5383B] hover:text-white"
              >
                Clear Filter
              </Button>
            </div>
          )}
          {(loading || (nearbyEnabled && nearbyLoading)) ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 py-10 animate-fade-in">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden shadow-sm animate-pulse"
                >
                  {/* Image skeleton */}
                  <div className="h-56 bg-gray-200 rounded animate-shimmer" />

                  {/* Content skeleton */}
                  <div className="p-6 space-y-4">
                    <div className="h-5 bg-gray-200 rounded w-3/4 animate-shimmer" />
                    <div className="h-3 bg-gray-200 rounded w-full animate-shimmer" />
                    <div className="h-3 bg-gray-200 rounded w-5/6 animate-shimmer" />

                    <div className="flex items-center justify-between mt-4">
                      <div className="h-3 bg-gray-200 rounded w-1/4 animate-shimmer" />
                      <div className="h-3 bg-gray-200 rounded w-1/6 animate-shimmer" />
                    </div>

                    <div className="h-9 bg-gray-200 rounded-xl mt-5 animate-shimmer" />
                  </div>
                </div>
              ))}
            </div>
          ) : (clusterMode !== 'none') ? (
            clusters.length === 0 ? (
              <div className="text-center py-20 animate-fade-in">
                <p className="text-xl text-[#660708]/70">
                  No clusters found. {listings.length === 0 ? 'No listings available.' : 'Try a different cluster mode or check if listings have location data.'}
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                {clusters.map((cluster, index) => (
                  <Card
                    key={cluster.key}
                    className="group bg-white border border-[#E5E5E5] hover:border-[#E5383B]/50 hover:shadow-[0_8px_30px_rgba(229,56,59,0.15)] transition-all duration-500 rounded-2xl overflow-hidden"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-[#161A1D]">{cluster.label}</h3>
                        <span className="text-sm px-2 py-1 rounded-full bg-[#E5383B]/10 text-[#E5383B] font-semibold">{cluster.count}</span>
                      </div>
                      <p className="text-sm text-[#660708]/70">Popular items in this area</p>
                      <div className="grid grid-cols-3 gap-2">
                        {cluster.items.slice(0, 3).map((l: any) => (
                          <div key={l.id} className="aspect-video rounded-md overflow-hidden bg-[#F8F9FA]">
                            {l.images?.[0] ? (
                              <img src={l.images[0]} alt={l.product_name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center"><Package className="w-6 h-6 text-[#BA181B]" /></div>
                            )}
                          </div>
                        ))}
                      </div>
                      <Button
                        className="w-full bg-gradient-to-r from-[#E5383B] to-[#BA181B] hover:from-[#BA181B] hover:to-[#660708] text-white font-medium rounded-xl py-2 shadow-md transition-all duration-300"
                        onClick={() => {
                          // console.log('View items clicked for cluster:', cluster.key, 'Items:', cluster.items.length);
                          // Store the cluster items and exit cluster mode to show them
                          setSelectedClusterItems(cluster.items);
                          setClusterMode('none');
                          setNearbyEnabled(false); // Disable nearby when viewing cluster items
                          // Clear other filters to show all items from this cluster
                          setSearchQuery('');
                          setPinCodeFilter('');
                          setCategoryFilter('');
                          // Scroll to listings section
                          setTimeout(() => {
                            const listingsSection = document.getElementById('listings-section');
                            if (listingsSection) {
                              listingsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                          }, 100);
                        }}
                      >
                        View {cluster.count} items
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )
          ) : filteredListings.length === 0 ? (
            <div className="text-center py-24 animate-fade-in">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-900 mb-1">
                No listings found
              </p>
              <p className="text-sm text-gray-500">
                Be the first to list an item in this category!
              </p>
            </div>
          ) : (
            <>
              {/* Showing count */}
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-[#660708]/70">
                  Showing <span className="font-semibold text-[#161A1D]">{startIndex + 1}-{Math.min(endIndex, filteredListings.length)}</span> of <span className="font-semibold text-[#E5383B]">{filteredListings.length}</span> items
                </p>
              </div>

              {/* Uniform Responsive Grid - Optimized for 4 items on desktop and 2 on mobile */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {paginatedListings.map((listing) => {
                  return (
                    <div key={listing.id} className="h-full">
                      <div
                        onClick={() => handleViewListing(listing)}
                        className="group relative bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:border-[#E5383B]/40 hover:shadow-[0_15px_40px_-10px_rgba(229,56,59,0.2)] hover:-translate-y-1"
                      >
                        {/* Image Section - Fixed Aspect Ratio */}
                        <div className="relative aspect-[4/3] overflow-hidden">
                          {listing.images?.length > 0 ? (
                            <>
                              <img
                                src={listing.images[0]}
                                alt={listing.product_name}
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                              />
                              {/* Gradient Overlay on Hover */}
                              <div className="absolute inset-0 bg-gradient-to-t from-[#161A1D]/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#F5F3F4] to-[#E5E5E5]">
                              <Package className="w-14 h-14 text-[#B1A7A6]" />
                            </div>
                          )}

                          {/* Product Type Badge */}
                          {listing.product_type && (
                            <div className="absolute top-3 left-3">
                              <span className="px-2.5 py-1 bg-gradient-to-r from-[#BA181B] to-[#E5383B] text-white text-xs font-semibold rounded-full shadow-md flex items-center gap-1">
                                <Tag className="w-3 h-3" />
                                {listing.product_type === "both"
                                  ? "Rent & Sale"
                                  : listing.product_type === "sale"
                                    ? "For Sale"
                                    : "For Rent"}
                              </span>
                            </div>
                          )}

                          {/* Wishlist Button */}
                          <button
                            onClick={(e) => toggleWishlist(e, listing.id)}
                            className="absolute top-3 right-3 p-2 bg-white/95 backdrop-blur-sm rounded-full shadow-md hover:bg-white hover:scale-110 transition-all duration-300 border border-[#E5E5E5]"
                          >
                            <Heart
                              className={`w-4 h-4 ${wishlist.includes(listing.id) ? 'fill-[#E5383B] text-[#E5383B]' : 'text-[#660708]/60 group-hover:text-[#E5383B]'} transition-colors`}
                            />
                          </button>

                          {/* Price Badge */}
                          <div className="absolute bottom-3 left-3">
                            <div className="px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-white/50">
                              <span className="text-base font-bold text-[#E5383B]">
                                ₹{listing.rent_price?.toLocaleString() || 0}
                              </span>
                              <span className="text-xs text-[#660708]/60 ml-0.5">
                                {listing.product_type === 'sale' ? '' : '/day'}
                              </span>
                            </div>
                          </div>

                          {/* Multiple Images Indicator */}
                          {listing.images?.length > 1 && (
                            <div className="absolute bottom-3 right-3 flex gap-1">
                              {listing.images.slice(0, 4).map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-white' : 'bg-white/50'}`}
                                />
                              ))}
                              {listing.images.length > 4 && (
                                <span className="text-[10px] text-white/80 ml-0.5">+{listing.images.length - 4}</span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Content Section */}
                        <div className="p-3 sm:p-4">
                          <h3 className="font-serif font-semibold text-[13px] sm:text-[15px] text-[#161A1D] group-hover:text-[#E5383B] transition-colors line-clamp-1 leading-tight mb-1 sm:mb-2">
                            {listing.product_name}
                          </h3>

                          <p className="text-[10px] sm:text-xs text-[#660708]/60 line-clamp-1 leading-relaxed mb-2 sm:mb-3">
                            {listing.description}
                          </p>

                          {/* Footer Stats */}
                          <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-[#F5F3F4]">
                            <div className="flex items-center gap-1 text-[#660708]/50 overflow-hidden">
                              <MapPin className="w-3 sm:w-3.5 h-3 sm:h-3.5 flex-shrink-0" />
                              <span className="text-[9px] sm:text-xs truncate">
                                {listing.city ? listing.city : (listing.pin_code || "Remote")}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
                              <div className="flex items-center gap-1 text-[#660708]/40">
                                <Eye className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                                <span className="text-[9px] sm:text-xs">{listing.views || 0}</span>
                              </div>
                              <div className="flex items-center gap-0.5 text-[#E5383B]">
                                <Star className={`w-3 sm:w-3.5 h-3 sm:h-3.5 ${listing.rating ? 'fill-[#E5383B]' : 'text-[#E5383B] opacity-40'}`} />
                                <span className="text-[9px] sm:text-xs font-semibold">
                                  {(listing.rating || 0).toFixed(1)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="pagination-container">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="pagination-btn"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      // Show first, last, current, and adjacent pages
                      return page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 1;
                    })
                    .map((page, idx, arr) => (
                      <span key={page} className="flex items-center">
                        {idx > 0 && arr[idx - 1] !== page - 1 && (
                          <span className="px-2 text-[#660708]/50">...</span>
                        )}
                        <button
                          onClick={() => goToPage(page)}
                          className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                        >
                          {page}
                        </button>
                      </span>
                    ))}

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
      @keyframes float {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -30px) scale(1.05); }
            66% { transform: translate(-20px, 20px) scale(0.95); }
          }

          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
      @keyframes shimmer {
        100% {
          transform: translateX(100%);
        }
      }
      .animate-shimmer {
        position: relative;
        overflow: hidden;
      }
      .animate-shimmer::after {
        content: "";
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg,
          rgba(
          255,
          255,
          255,
          0
        ) 0%,
          rgba(255, 255, 255, 0) 0%,
          rgba(255, 255, 255, 0.4) 50%,
          rgba(255, 255, 255, 0) 100%
        );
        animation: shimmer 1.5s infinite;
      }
      `}</style>
      <Footer />
      
      <AlertDialog open={showNoResultsDialog} onOpenChange={setShowNoResultsDialog}>
        <AlertDialogContent className="bg-white rounded-2xl border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-serif font-bold text-[#161A1D] flex items-center gap-2">
              <MapPin className="w-6 h-6 text-[#E5383B]" />
              No Listings Nearby
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-[#660708]/70 pt-2">
              We couldn't find any rentals within 10km of your location. 
              <br />
              <span className="font-bold text-[#161A1D]">{closestListingInfo}</span>
              <div className="mt-4 p-4 bg-[#F5F3F4] rounded-xl text-sm space-y-2">
                <p>💡 **Tips to find more items:**</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Increase the search radius in Smart Filters.</li>
                  <li>Use the "By City" or "By Area" display modes.</li>
                  <li>Try different keywords or clear your search.</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={() => setShowNoResultsDialog(false)}
              className="bg-[#E5383B] hover:bg-[#BA181B] text-white rounded-full px-8 py-2 font-bold"
            >
              Got it!
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Listings;
