import { useState, useMemo  } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Navbar } from "@/components/Navbar";
import { RatingCard } from "@/components/RatingCard";
import { AdPopup } from "@/components/AdPopup";
import BannerCarousel from "@/components/BannerCarousel";
import { useListings, incrementViews } from "@/hooks/useListings";
import { useAuth } from "@/contexts/AuthContext";
import {
  MapPin,
  Eye,
  Star,
  Phone,
  User,
  Package,
  Search,
  Tag,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useDebounce } from "@/hooks/useDebounce";

const Listings = () => {
  const { listings, loading } = useListings("approved");
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [pinCodeFilter, setPinCodeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [selectedListing, setSelectedListing] = useState<any>(null);
  // const [testLoading] = useState(true);

  const handleViewListing = (listing: any) => {
    incrementViews(listing.id);
    setSelectedListing(listing);
  };

  const debouncedSearch = useDebounce(searchQuery, 500);
  const debouncedPin = useDebounce(pinCodeFilter, 500);

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const matchesSearch =
        listing.product_name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        listing.description.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesPinCode =
        debouncedPin === "" || listing.pin_code.includes(debouncedPin);
      const matchesCategory =
        categoryFilter === "" || listing.category === categoryFilter;
      return matchesSearch && matchesPinCode && matchesCategory;
    });
  }, [listings, debouncedSearch, debouncedPin, categoryFilter]);

  console.log("Debounced search:", debouncedSearch);
  console.log("Search query:", searchQuery);

  const categories = [
    { value: "", label: "All" },
    { value: "electronics", label: "Electronics" },
    { value: "vehicles", label: "Vehicles" },
    { value: "furniture", label: "Furniture" },
    { value: "tools", label: "Tools" },
    { value: "sports", label: "Sports" },
    { value: "books", label: "Books" },
    { value: "clothing", label: "Clothing" },
    { value: "other", label: "Other" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F3F4] to-white relative">
      <Navbar />
      <AdPopup />

      {/* Decorative soft glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 left-10 w-72 h-72 bg-[#E5383B]/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-20 w-96 h-96 bg-[#BA181B]/10 rounded-full blur-3xl animate-float delay-2000" />
      </div>

      <div className="container mx-auto px-4 pt-28 pb-20 relative z-10">
        <div className="mb-16 text-center space-y-4 animate-fade-in">
          <h1 className="text-5xl font-serif font-bold text-[#161A1D]">
            Browse Premium Items
          </h1>
          <p className="text-lg text-[#660708]/70">
            Discover verified rentals from trusted owners near you
          </p>
          <div className="w-20 h-[3px] mx-auto bg-gradient-to-r from-[#E5383B] to-[#BA181B] rounded-full" />
        </div>

        <BannerCarousel />

        {/* Smart Filters Section */}
        <div className="container mx-auto py-12 px-4">
          <div
            className="relative overflow-hidden rounded-[32px] p-[2px] group"
            style={{
              background:
                "linear-gradient(135deg, rgba(229, 56, 59, 0.3), rgba(186, 24, 27, 0.2), rgba(102, 7, 8, 0.3))",
            }}
          >
            {/* Inner Container */}
            <div
              className="relative rounded-[30px] p-8 md:p-12 backdrop-blur-2xl overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, rgba(245, 243, 244, 0.95), rgba(211, 211, 211, 0.85))",
                boxShadow:
                  "inset 0 1px 0 rgba(255, 255, 255, 0.6), 0 20px 60px rgba(11, 9, 10, 0.1)",
              }}
            >
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-40">
                <div
                  className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(229, 56, 59, 0.15), transparent 70%)",
                    animation: "float 8s ease-in-out infinite",
                  }}
                />
                <div
                  className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(186, 24, 27, 0.12), transparent 70%)",
                    animation: "float 10s ease-in-out infinite reverse",
                  }}
                />
              </div>

              {/* Header */}
              <div className="relative text-center mb-10">
                <div
                  className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full backdrop-blur-xl"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(229, 56, 59, 0.1), rgba(186, 24, 27, 0.08))",
                    border: "1px solid rgba(229, 56, 59, 0.2)",
                    boxShadow: "0 4px 20px rgba(229, 56, 59, 0.15)",
                  }}
                >
                  <SlidersHorizontal className="w-4 h-4 text-[#BA181B]" />
                  <span className="text-xs font-bold tracking-wider text-[#660708] uppercase">
                    Smart Filters
                  </span>
                </div>

                <h2
                  className="text-3xl md:text-4xl font-black tracking-tight mb-3"
                  style={{
                    background: "linear-gradient(135deg, #161A1D, #660708)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Refine Your Search
                </h2>
                <p className="text-[#660708]/70 text-base max-w-2xl mx-auto">
                  Discover exactly what you're looking for with our intelligent
                  filtering system
                </p>
              </div>

              {/* Search Inputs */}
              <div className="grid md:grid-cols-2 gap-6 mb-10">
                {/* Search Field */}
                <div className="relative group/input">
                  <div
                    className="rounded-2xl p-[1px]"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(229, 56, 59, 0.2), rgba(186, 24, 27, 0.15))",
                    }}
                  >
                    <div
                      className="rounded-2xl overflow-hidden backdrop-blur-xl"
                      style={{
                        background: "rgba(255, 255, 255, 0.7)",
                        boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.05)",
                      }}
                    >
                      <div className="flex items-center px-5 py-4 gap-3">
                        <div
                          className="flex items-center justify-center w-10 h-10 rounded-xl"
                          style={{
                            background:
                              "linear-gradient(135deg, rgba(229, 56, 59, 0.1), rgba(186, 24, 27, 0.08))",
                          }}
                        >
                          <Search className="w-5 h-5 text-[#BA181B]" />
                        </div>
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search for items..."
                          className="flex-1 bg-transparent text-[#161A1D] text-base font-medium outline-none placeholder:text-[#B1A7A6]"
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery("")}
                            className="w-6 h-6 flex items-center justify-center rounded-full bg-[#B1A7A6]/20 hover:bg-[#E5383B]/20 transition-colors duration-200"
                          >
                            <span className="text-[#660708] text-xs">✕</span>
                          </button>
                        )}
                      </div>
                      <div
                        className="absolute bottom-0 left-0 h-[2px] transition-all duration-500"
                        style={{
                          width: searchQuery ? "100%" : "0%",
                          background:
                            "linear-gradient(90deg, #E5383B, #BA181B)",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Pin Code Field */}
                <div className="relative group/input">
                  <div
                    className="rounded-2xl p-[1px]"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(229, 56, 59, 0.2), rgba(186, 24, 27, 0.15))",
                    }}
                  >
                    <div
                      className="rounded-2xl overflow-hidden backdrop-blur-xl"
                      style={{
                        background: "rgba(255, 255, 255, 0.7)",
                        boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.05)",
                      }}
                    >
                      <div className="flex items-center px-5 py-4 gap-3">
                        <div
                          className="flex items-center justify-center w-10 h-10 rounded-xl"
                          style={{
                            background:
                              "linear-gradient(135deg, rgba(229, 56, 59, 0.1), rgba(186, 24, 27, 0.08))",
                          }}
                        >
                          <MapPin className="w-5 h-5 text-[#BA181B]" />
                        </div>
                        <input
                          type="text"
                          value={pinCodeFilter}
                          onChange={(e) => setPinCodeFilter(e.target.value)}
                          placeholder="Filter by pin code..."
                          className="flex-1 bg-transparent text-[#161A1D] text-base font-medium outline-none placeholder:text-[#B1A7A6]"
                        />
                        {pinCodeFilter && (
                          <button
                            onClick={() => setPinCodeFilter("")}
                            className="w-6 h-6 flex items-center justify-center rounded-full bg-[#B1A7A6]/20 hover:bg-[#E5383B]/20 transition-colors duration-200"
                          >
                            <span className="text-[#660708] text-xs">✕</span>
                          </button>
                        )}
                      </div>
                      <div
                        className="absolute bottom-0 left-0 h-[2px] transition-all duration-500"
                        style={{
                          width: pinCodeFilter ? "100%" : "0%",
                          background:
                            "linear-gradient(90deg, #E5383B, #BA181B)",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Pills */}
              <div className="relative">
                <div className="flex flex-wrap justify-center gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setCategoryFilter(cat.value)}
                      className="relative group/pill"
                    >
                      {categoryFilter === cat.value && (
                        <div
                          className="absolute inset-0 rounded-full blur-xl"
                          style={{
                            background:
                              "linear-gradient(135deg, rgba(229, 56, 59, 0.6), rgba(186, 24, 27, 0.4))",
                            animation: "pulse 2s ease-in-out infinite",
                          }}
                        />
                      )}
                      <div
                        className={`relative px-6 py-3 rounded-full transition-all duration-300 ${
                          categoryFilter === cat.value
                            ? "scale-105"
                            : "hover:scale-105"
                        }`}
                        style={{
                          background:
                            categoryFilter === cat.value
                              ? "linear-gradient(135deg, #E5383B, #BA181B, #660708)"
                              : "rgba(255, 255, 255, 0.8)",
                          border:
                            categoryFilter === cat.value
                              ? "none"
                              : "1px solid rgba(177, 167, 166, 0.3)",
                          boxShadow:
                            categoryFilter === cat.value
                              ? "0 8px 32px rgba(229, 56, 59, 0.35)"
                              : "0 2px 8px rgba(11, 9, 10, 0.05)",
                        }}
                      >
                        <span
                          className={`text-sm font-bold tracking-wide ${
                            categoryFilter === cat.value
                              ? "text-[#F5F3F4]"
                              : "text-[#161A1D] group-hover/pill:text-[#BA181B]"
                          }`}
                        >
                          {cat.label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Active Filter Count (Fixed) */}
                {(searchQuery || pinCodeFilter || categoryFilter) && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Sparkles className="w-4 h-4 text-[#E5383B]" />
                    <span className="text-sm font-semibold text-[#660708]">
                      {[
                        searchQuery ? 1 : 0,
                        pinCodeFilter ? 1 : 0,
                        categoryFilter ? 1 : 0,
                      ].reduce((a, b) => a + b, 0)}{" "}
                      active filter
                      {[
                        searchQuery ? 1 : 0,
                        pinCodeFilter ? 1 : 0,
                        categoryFilter ? 1 : 0,
                      ].reduce((a, b) => a + b, 0) !== 1
                        ? "s"
                        : ""}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Listings Section */}
        {loading ? (
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
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <p className="text-xl text-[#660708]/70">
              No listings found. Be the first to list an item!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredListings.map((listing, index) => (
              <Card
                key={listing.id}
                onClick={() => handleViewListing(listing)}
                className="group bg-white border border-[#E5E5E5] hover:border-[#E5383B]/50 hover:shadow-[0_8px_30px_rgba(229,56,59,0.15)] transition-all duration-500 rounded-2xl overflow-hidden hover:-translate-y-2 cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Image Section */}
                <div className="relative h-56 overflow-hidden">
                  {listing.images?.length > 0 ? (
                    <Carousel className="w-full h-full">
                      <CarouselContent>
                        {listing.images.map((image, i) => (
                          <CarouselItem key={i}>
                            <img
                              src={image}
                              alt={`${listing.product_name} - ${i + 1}`}
                              className="w-full h-56 object-cover transform group-hover:scale-105 transition-transform duration-700"
                            />
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="left-2 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 transition" />
                      <CarouselNext className="right-2 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100 transition" />
                    </Carousel>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#F8F9FA]">
                      <Package className="w-16 h-16 text-[#BA181B]" />
                    </div>
                  )}

                  {/* Sale / Rent Tag */}
                  {listing.product_type && (
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-[#BA181B] to-[#E5383B] text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-md flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" />
                      {listing.product_type === "both"
                        ? "Rent & Sale"
                        : listing.product_type === "sale"
                        ? "For Sale"
                        : "For Rent"}
                    </div>
                  )}

                  {/* Price Tag */}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md border border-[#E5383B]/20 text-[#E5383B] px-3 py-1 rounded-full text-sm font-semibold shadow-sm">
                    ₹{listing.rent_price}/day
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-[#161A1D] group-hover:text-[#E5383B] transition-colors duration-300 line-clamp-1">
                    {listing.product_name}
                  </h3>
                  <p className="text-sm text-[#660708]/70 leading-relaxed line-clamp-2">
                    {listing.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-[#A4161A]/70 mt-4">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-[#BA181B]" />
                      <span>{listing.pin_code}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4 text-[#BA181B]" />
                        <span>{listing.views || 0}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[#E5383B]">
                        <Star className="w-4 h-4 fill-current" />
                        <span>{listing.rating?.toFixed(1) || "5.0"}</span>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-[#E5383B] to-[#BA181B] hover:from-[#BA181B] hover:to-[#660708] text-white font-medium rounded-xl py-2 shadow-md transition-all duration-300">
                    Contact Owner
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={!!selectedListing}
        onOpenChange={() => setSelectedListing(null)}
      >
        <DialogContent className="max-w-5xl w-full max-h-[90vh] overflow-y-auto rounded-3xl border border-[#B1A7A6]/30 bg-gradient-to-br from-[#F5F3F4]/90 to-white/80 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.15)] transition-all duration-300">
          {selectedListing && (
            <>
              {/* Header */}
              <DialogHeader className="pb-4 border-b border-[#B1A7A6]/30">
                <DialogTitle className="text-3xl font-serif text-[#161A1D] tracking-wide">
                  {selectedListing.product_name}
                </DialogTitle>
                <div className="flex items-center gap-2 text-sm text-[#660708]/70 mt-1">
                  <User size={16} />
                  <span>{selectedListing.owner_name || "Unknown"}</span>
                </div>
              </DialogHeader>

              {/* Main Content */}
              <div className="grid md:grid-cols-2 gap-8 pt-6">
                {/* Left - Image Carousel */}
                <div className="space-y-4">
                  {selectedListing.images?.length > 0 ? (
                    <Carousel className="rounded-2xl overflow-hidden shadow-md">
                      <CarouselContent>
                        {selectedListing.images.map(
                          (image: string, index: number) => (
                            <CarouselItem key={index}>
                              <img
                                src={image}
                                alt={`${selectedListing.product_name}-${
                                  index + 1
                                }`}
                                className="w-full h-[400px] object-cover transition-transform duration-500 hover:scale-105"
                              />
                            </CarouselItem>
                          )
                        )}
                      </CarouselContent>
                      <CarouselPrevious className="bg-white/80 hover:bg-white text-[#161A1D]" />
                      <CarouselNext className="bg-white/80 hover:bg-white text-[#161A1D]" />
                    </Carousel>
                  ) : (
                    <div className="flex items-center justify-center h-[400px] bg-[#F5F3F4] rounded-2xl text-[#B1A7A6] text-sm">
                      No images available
                    </div>
                  )}
                </div>

                {/* Right - Details */}
                <div className="flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[#161A1D]">
                        Description
                      </h3>
                      <p className="text-[#660708]/80 leading-relaxed">
                        {selectedListing.description ||
                          "No description provided."}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-[#161A1D]">
                        Pricing
                      </h3>
                      <p className="text-4xl font-bold text-[#E5383B]">
                        ₹{selectedListing.rent_price}/day
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-[#161A1D]">
                        Location
                      </h3>
                      <div className="flex items-center gap-2 text-[#660708]/80">
                        <MapPin size={16} />
                        <span>{selectedListing.address || "Not provided"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-[#F5F3F4] to-[#D3D3D3]/40 border border-[#B1A7A6]/20 shadow-inner space-y-3">
                    <h3 className="font-semibold text-lg text-[#161A1D]">
                      Contact Owner
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-[#660708]/80">
                      <Phone size={16} />
                      <span>{selectedListing.phone || "Not provided"}</span>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-[#E5383B] via-[#BA181B] to-[#660708] hover:opacity-90 text-white rounded-xl py-2 font-medium shadow-md transition-all duration-300">
                      Call Owner
                    </Button>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="my-6 border-t border-[#B1A7A6]/30"></div>

              {/* Rating Section */}
              <div className="pb-2">
                <RatingCard
                  listingId={selectedListing.id}
                  currentUserId={user?.id}
                />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
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
    </div>
  );
};

export default Listings;
