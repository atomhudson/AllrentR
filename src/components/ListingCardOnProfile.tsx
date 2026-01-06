import React, { useState, useEffect } from 'react';
import { Package, Eye, Star, Clock, TrendingUp, CheckCircle, AlertCircle, XCircle, Pencil, Trash2, RotateCcw, Zap, X, Save, AlertTriangle, Tag, Upload, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { validateCoupon, Coupon } from '@/hooks/useCoupons';
import { ImageUpload } from '@/components/ImageUpload';
import { useAuth } from '@/contexts/AuthContext';

// Razorpay type declaration
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Listing {
  id: string;
  product_name: string;
  description: string;
  rent_price: number;
  original_price?: number;
  product_type: string;
  address?: string;
  city?: string;
  pin_code?: string;
  listing_status: string;
  views?: number;
  rating?: number;
  is_featured?: boolean;
  priority?: number;
  images?: string[];
}

interface BoostPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  priority_boost: number;
  duration_days: number;
  is_featured: boolean;
  is_active: boolean;
}

interface ListingsCardOnProfileProps {
  listings: Listing[];
  onListingUpdated?: () => void;
}

const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={className}>{children}</div>
);

export default function ListingsCardOnProfile({ listings, onListingUpdated }: ListingsCardOnProfileProps) {
  const { user } = useAuth();

  // Modals state
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [boostOpen, setBoostOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  // Loading states
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [boostLoading, setBoostLoading] = useState(false);

  // Boost packages from database
  const [boostPackages, setBoostPackages] = useState<BoostPackage[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Track if current boost is an upgrade
  const [isUpgrade, setIsUpgrade] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    product_name: '',
    description: '',
    rent_price: 0,
    original_price: 0,
    product_type: 'rent',
    address: '',
    city: '',
    pin_code: '',
    images: [] as string[],
  });

  const pendingListings = listings.filter(l => l.listing_status === 'pending').length;
  const rejectedListings = listings.filter(l => l.listing_status === 'rejected').length;

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Fetch boost packages from database
  useEffect(() => {
    const fetchBoostPackages = async () => {
      setPackagesLoading(true);
      try {
        const { data, error } = await (supabase as any)
          .from('boost_packages')
          .select('*')
          .eq('is_active', true)
          .order('price', { ascending: true });

        if (error) throw error;
        setBoostPackages(data || []);
      } catch (error) {
        console.error('Error fetching boost packages:', error);
      } finally {
        setPackagesLoading(false);
      }
    };

    fetchBoostPackages();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-[#0B090A]" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-[#A4161A]" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-[#660708]" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      approved: 'bg-gradient-to-r from-[#BA181B] to-[#E5383B] text-white border-transparent shadow-lg shadow-[#E5383B]/20',
      pending: 'bg-[#F5F3F4] text-[#660708] border-[#B1A7A6]',
      rejected: 'bg-[#660708]/10 text-[#660708] border-[#660708]/30',
    };
    return styles[status] || '';
  };

  // Open edit modal
  const openEditModal = (listing: Listing) => {
    setSelectedListing(listing);
    setEditForm({
      product_name: listing.product_name || '',
      description: listing.description || '',
      rent_price: listing.rent_price || 0,
      original_price: listing.original_price || 0,
      product_type: listing.product_type || 'rent',
      address: listing.address || '',
      city: listing.city || '',
      pin_code: listing.pin_code || '',
      images: listing.images || [],
    });
    setEditOpen(true);
  };

  // Handle edit submit
  const handleEditSubmit = async (reapply: boolean = false) => {
    if (!selectedListing) return;

    setEditLoading(true);
    try {
      const updateData: any = {
        product_name: editForm.product_name,
        description: editForm.description,
        rent_price: editForm.rent_price,
        original_price: editForm.original_price,
        product_type: editForm.product_type,
        address: editForm.address,
        city: editForm.city,
        pin_code: editForm.pin_code,
        images: editForm.images,
      };

      // If re-applying rejected listing, set status to pending
      if (reapply && selectedListing.listing_status === 'rejected') {
        updateData.listing_status = 'pending';
      }

      const { error } = await supabase
        .from('listings')
        .update(updateData)
        .eq('id', selectedListing.id);

      if (error) throw error;

      toast({
        title: reapply ? 'Re-submitted for Review!' : 'Listing Updated!',
        description: reapply ? 'Your listing has been submitted for review again.' : 'Your changes have been saved.',
      });

      setEditOpen(false);
      onListingUpdated?.();
    } catch (error: any) {
      console.error('Error updating listing:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update listing',
        variant: 'destructive',
      });
    } finally {
      setEditLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedListing) return;

    setDeleteLoading(true);
    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', selectedListing.id);

      if (error) throw error;

      toast({
        title: 'Deleted',
        description: 'Your listing has been removed.',
      });

      setDeleteOpen(false);
      onListingUpdated?.();
    } catch (error: any) {
      console.error('Error deleting listing:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete listing',
        variant: 'destructive',
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  // Validate coupon code
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    try {
      const result = await validateCoupon(couponCode);

      if (result.valid && result.coupon) {
        setAppliedCoupon(result.coupon);
        toast({
          title: 'Coupon Applied!',
          description: `You'll get ${result.coupon.is_percentage ? `${result.coupon.discount_percentage}%` : `₹${result.coupon.discount_amount}`} off!`,
        });
      } else {
        toast({
          title: 'Invalid Coupon',
          description: result.error || 'This coupon is not valid',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error validating coupon:', error);
    } finally {
      setCouponLoading(false);
    }
  };

  // Calculate discounted price
  const getDiscountedPrice = (originalPrice: number) => {
    if (!appliedCoupon) return originalPrice;

    if (appliedCoupon.is_percentage) {
      return Math.round(originalPrice * (1 - appliedCoupon.discount_percentage / 100));
    } else {
      return Math.max(0, originalPrice - appliedCoupon.discount_amount);
    }
  };

  // Handle boost/feature with Razorpay payment
  const handleBoost = async (pkg: BoostPackage) => {
    if (!selectedListing || !user) return;

    const finalPrice = getDiscountedPrice(pkg.price);

    // If price is 0 (100% discount), apply boost directly
    if (finalPrice === 0) {
      setBoostLoading(true);
      try {
        await applyBoostToListing(pkg, 'FREE_COUPON');
      } finally {
        setBoostLoading(false);
      }
      return;
    }

    setBoostLoading(true);
    try {
      // Create Razorpay order via Supabase function
      // Receipt must be max 40 chars - use short format
      const shortId = selectedListing.id.slice(-8);
      const timestamp = Date.now().toString().slice(-10);
      const receipt = `bst_${shortId}_${timestamp}`.slice(0, 40);

      const { data: orderData, error: orderError } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          amount: finalPrice,
          currency: 'INR',
          receipt
        }
      });

      if (orderError) {
        console.error('Payment order error:', orderError);
        throw new Error(orderError.message || 'Failed to create payment order. Please check Razorpay configuration.');
      }

      if (!orderData || orderData.error) {
        console.error('Payment order data error:', orderData);
        throw new Error(orderData?.error || 'Failed to create payment order. Razorpay credentials may not be configured.');
      }

      // Check if Razorpay script is loaded
      if (!window.Razorpay) {
        toast({
          title: 'Payment gateway not loaded',
          description: 'Please refresh and try again',
          variant: 'destructive'
        });
        setBoostLoading(false);
        return;
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'AllrentR',
        description: `Boost Package: ${pkg.name}`,
        order_id: orderData.orderId,
        handler: async (response: any) => {
          // Payment successful - apply boost
          try {
            await applyBoostToListing(pkg, response.razorpay_payment_id);
          } catch (err) {
            toast({
              title: 'Failed to apply boost',
              description: 'Payment was successful but boost failed. Please contact support.',
              variant: 'destructive'
            });
          }
        },
        modal: {
          ondismiss: () => {
            setBoostLoading(false);
            toast({
              title: 'Payment Cancelled',
              description: 'You can try again when ready',
              variant: 'destructive'
            });
          }
        },
        theme: {
          color: '#E5383B'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      console.error('Error initiating payment:', error);
      const errorMessage = error.message?.toLowerCase() || '';

      // Check if it's a configuration issue
      if (errorMessage.includes('non-2xx') || errorMessage.includes('credentials') || errorMessage.includes('razorpay')) {
        toast({
          title: 'Payment Configuration Error',
          description: 'Razorpay is not configured. Please contact the administrator to set up payment credentials in Supabase.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Payment Error',
          description: error.message || 'Failed to initiate payment. Please try again.',
          variant: 'destructive',
        });
      }
      setBoostLoading(false);
    }
  };

  // Apply boost to listing after successful payment
  const applyBoostToListing = async (pkg: BoostPackage, paymentId: string) => {
    if (!selectedListing) return;

    try {
      const boostExpires = new Date();
      boostExpires.setDate(boostExpires.getDate() + pkg.duration_days);

      const { error } = await (supabase as any)
        .from('listings')
        .update({
          is_featured: pkg.is_featured,
          priority: pkg.priority_boost,
          boost_expires_at: boostExpires.toISOString(),
        })
        .eq('id', selectedListing.id);

      if (error) throw error;

      // Increment coupon usage if applied
      if (appliedCoupon) {
        await supabase
          .from('coupons')
          .update({ used_count: appliedCoupon.used_count + 1 })
          .eq('id', appliedCoupon.id);
      }

      toast({
        title: 'Listing Boosted!',
        description: `Your listing is now boosted with the ${pkg.name} plan for ${pkg.duration_days} days!`,
      });

      setBoostOpen(false);
      setCouponCode('');
      setAppliedCoupon(null);
      setBoostLoading(false);
      onListingUpdated?.();
    } catch (error: any) {
      console.error('Error applying boost:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to apply boost',
        variant: 'destructive',
      });
      setBoostLoading(false);
    }
  };

  // Handle images update in edit form
  const handleImagesUpdate = (urls: string[]) => {
    setEditForm(prev => ({ ...prev, images: urls }));
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <Card className="relative max-w-7xl mx-auto bg-white/80 backdrop-blur-sm shadow-2xl rounded-[2rem] overflow-hidden border border-[#D3D3D3]/30">
        {/* Animated gradient border */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#660708] via-[#E5383B] to-[#BA181B] animate-pulse"></div>

        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#E5383B]/10 via-[#BA181B]/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-[#660708]/10 via-[#161A1D]/5 to-transparent rounded-full blur-3xl"></div>

        <div className="relative p-8 md:p-12">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#E5383B] to-[#BA181B] animate-pulse"></div>
                <h2 className="pb-2 text-4xl md:text-5xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-[#0B090A] via-[#660708] to-[#A4161A]">
                  Your Listings
                </h2>
              </div>
              <p className="text-[#660708]/80 font-medium text-lg ml-7">
                Manage and track all your products
              </p>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              {rejectedListings > 0 && (
                <div className="px-4 py-2 bg-red-100 rounded-xl text-red-700 font-bold text-sm flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  <span>{rejectedListings} Rejected</span>
                </div>
              )}
              {pendingListings > 0 && (
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#E5383B] to-[#BA181B] rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative px-6 py-3 bg-gradient-to-r from-[#A4161A] to-[#BA181B] rounded-2xl text-white font-bold shadow-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    <span>{pendingListings} Pending Review</span>
                  </div>
                </div>
              )}
              <div className="px-6 py-3 bg-gradient-to-r from-[#F5F3F4] to-white rounded-2xl border-2 border-[#D3D3D3] font-bold text-[#660708] flex items-center gap-2 hover:shadow-lg transition-shadow">
                <TrendingUp className="w-5 h-5" />
                <span>{listings.length} Total</span>
              </div>
            </div>
          </div>

          {/* Listings Grid */}
          {listings.length === 0 ? (
            <div className="text-center py-32">
              <div className="relative inline-block mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-[#E5383B]/20 to-[#BA181B]/20 rounded-3xl blur-xl"></div>
                <div className="relative w-32 h-32 rounded-3xl bg-gradient-to-br from-[#E5383B]/10 to-[#BA181B]/10 flex items-center justify-center border-2 border-[#D3D3D3]/50">
                  <Package className="w-16 h-16 text-[#660708]" />
                </div>
              </div>
              <p className="text-2xl text-[#660708] font-bold mb-3">
                No listings yet
              </p>
              <p className="text-[#B1A7A6] text-lg">
                Start listing your items to begin earning!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              {listings.map((listing, index) => (
                <div
                  key={listing.id}
                  className="group relative bg-gradient-to-br from-white via-[#F5F3F4]/30 to-white rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 border-2 border-[#D3D3D3]/40 hover:border-[#E5383B]/50"
                  style={{ animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both` }}
                >
                  {/* Featured badge */}
                  {listing.is_featured && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-full flex items-center gap-1 shadow-lg z-10">
                      <Zap className="w-3 h-3 fill-white" />
                      Featured
                    </div>
                  )}

                  {/* Hover gradient effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#E5383B]/0 via-[#E5383B]/5 to-[#BA181B]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  {/* Decorative corner accent */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#E5383B]/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

                  <div className="relative p-6 md:p-8">
                    <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
                      {/* Image */}
                      {listing.images && listing.images.length > 0 && (
                        <div className="w-full lg:w-32 h-24 lg:h-24 rounded-xl overflow-hidden flex-shrink-0">
                          <img
                            src={listing.images[0]}
                            alt={listing.product_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      {/* Content Section */}
                      <div className="flex-1 space-y-4">
                        {/* Title and Status */}
                        <div className="flex items-start gap-4 flex-wrap">
                          <h3 className="text-xl md:text-2xl font-black text-[#0B090A] group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-[#660708] group-hover:to-[#E5383B] transition-all duration-300">
                            {listing.product_name}
                          </h3>
                          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border-2 ${getStatusBadge(listing.listing_status)} shadow-sm`}>
                            {getStatusIcon(listing.listing_status)}
                            <span className="capitalize">{listing.listing_status}</span>
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-[#660708]/70 text-base leading-relaxed line-clamp-2">
                          {listing.description}
                        </p>

                        {/* Stats Section */}
                        <div className="flex items-center gap-4 flex-wrap pt-2">
                          {/* Price Badge */}
                          <div className="relative group/price">
                            <div className="absolute inset-0 bg-gradient-to-r from-[#BA181B] to-[#E5383B] rounded-xl blur opacity-40 group-hover/price:opacity-60 transition-opacity"></div>
                            <div className="relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#BA181B] to-[#E5383B] text-white font-bold rounded-xl shadow-lg">
                              <span className="text-xl">₹{listing.rent_price || 0}</span>
                              {listing.product_type !== 'sale' && <span className="text-xs text-white/90">/day</span>}
                            </div>
                          </div>

                          {/* Views */}
                          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#F5F3F4] to-white rounded-xl border border-[#D3D3D3]">
                            <Eye className="w-4 h-4 text-[#660708]" />
                            <span className="text-sm font-bold text-[#660708]">{listing.views || 0} views</span>
                          </div>

                          {/* Rating */}
                          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl border border-amber-200">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            <span className="text-sm font-bold text-amber-700">{listing.rating?.toFixed(1) || '5.0'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap lg:flex-col gap-2">
                        {/* Edit Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(listing)}
                          className="gap-1.5 border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-xl"
                        >
                          <Pencil className="w-4 h-4" />
                          Edit
                        </Button>

                        {/* Re-apply Button (only for rejected) */}
                        {listing.listing_status === 'rejected' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(listing)}
                            className="gap-1.5 border-amber-200 text-amber-600 hover:bg-amber-50 hover:text-amber-700 rounded-xl"
                          >
                            <RotateCcw className="w-4 h-4" />
                            Re-apply
                          </Button>
                        )}

                        {/* Boost/Upgrade Button (only for approved) */}
                        {listing.listing_status === 'approved' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedListing(listing);
                              setCouponCode('');
                              setAppliedCoupon(null);
                              // Check if already boosted (has priority > 0)
                              const isBoosted = (listing.priority || 0) > 0;
                              setIsUpgrade(isBoosted);
                              setBoostOpen(true);
                            }}
                            className={`gap-1.5 rounded-xl ${(listing.priority || 0) > 0
                              ? 'border-amber-200 text-amber-600 hover:bg-amber-50 hover:text-amber-700'
                              : 'border-purple-200 text-purple-600 hover:bg-purple-50 hover:text-purple-700'
                              }`}
                          >
                            <Zap className="w-4 h-4" />
                            {(listing.priority || 0) > 0 ? 'Upgrade' : 'Boost'}
                          </Button>
                        )}

                        {/* Delete Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedListing(listing);
                            setDeleteOpen(true);
                          }}
                          className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Bottom accent line */}
                  <div className="h-1 bg-gradient-to-r from-transparent via-[#E5383B]/30 to-transparent group-hover:via-[#E5383B]/60 transition-all duration-500"></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Edit Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedListing?.listing_status === 'rejected' ? (
                <>
                  <RotateCcw className="w-5 h-5 text-amber-600" />
                  Re-apply for Listing
                </>
              ) : (
                <>
                  <Pencil className="w-5 h-5 text-blue-600" />
                  Edit Listing
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedListing?.listing_status === 'rejected'
                ? 'Make changes and resubmit for approval.'
                : 'Update your listing details.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Image Upload Section */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                Product Images
              </Label>
              {user && (
                <ImageUpload
                  onImagesUploaded={handleImagesUpdate}
                  currentImages={editForm.images}
                  userId={user.id}
                  maxImages={10}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="product_name">Product Name</Label>
              <Input
                id="product_name"
                value={editForm.product_name}
                onChange={(e) => setEditForm(prev => ({ ...prev, product_name: e.target.value }))}
                placeholder="Enter product name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your product"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rent_price">Price (₹)</Label>
                <Input
                  id="rent_price"
                  type="number"
                  value={editForm.rent_price}
                  onChange={(e) => setEditForm(prev => ({ ...prev, rent_price: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="original_price">Original Price (₹)</Label>
                <Input
                  id="original_price"
                  type="number"
                  value={editForm.original_price}
                  onChange={(e) => setEditForm(prev => ({ ...prev, original_price: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="product_type">Listing Type</Label>
              <Select
                value={editForm.product_type}
                onValueChange={(value) => setEditForm(prev => ({ ...prev, product_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rent">For Rent</SelectItem>
                  <SelectItem value="sale">For Sale</SelectItem>
                  <SelectItem value="both">Rent & Sale</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={editForm.address}
                onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter address"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={editForm.city}
                  onChange={(e) => setEditForm(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="City"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pin_code">PIN Code</Label>
                <Input
                  id="pin_code"
                  value={editForm.pin_code}
                  onChange={(e) => setEditForm(prev => ({ ...prev, pin_code: e.target.value }))}
                  placeholder="PIN Code"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={editLoading}>
              <X className="w-4 h-4 mr-1.5" /> Cancel
            </Button>
            <Button
              onClick={() => handleEditSubmit(selectedListing?.listing_status === 'rejected')}
              disabled={editLoading}
              className={selectedListing?.listing_status === 'rejected'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-white'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90 text-white'}
            >
              {editLoading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-1.5" />
              )}
              {selectedListing?.listing_status === 'rejected' ? 'Re-submit' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Delete Listing
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedListing?.product_name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteLoading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              ) : (
                <Trash2 className="w-4 h-4 mr-1.5" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Boost Modal */}
      <Dialog open={boostOpen} onOpenChange={setBoostOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-600" />
              {isUpgrade ? 'Upgrade Your Boost' : 'Boost Your Listing'}
            </DialogTitle>
            <DialogDescription>
              {isUpgrade
                ? `Upgrade to a higher boost tier for "${selectedListing?.product_name}". Current priority: ${selectedListing?.priority || 0}`
                : `Increase visibility and get more views for "${selectedListing?.product_name}"`}
            </DialogDescription>
          </DialogHeader>

          {/* Coupon Code Input */}
          <div className="space-y-2 py-2">
            <Label className="flex items-center gap-2 text-sm">
              <Tag className="w-4 h-4" />
              Have a coupon code?
            </Label>
            <div className="flex gap-2">
              <Input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="SAVE20"
                disabled={!!appliedCoupon}
              />
              {appliedCoupon ? (
                <Button
                  variant="outline"
                  onClick={() => {
                    setAppliedCoupon(null);
                    setCouponCode('');
                  }}
                  className="flex-shrink-0"
                >
                  Remove
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleApplyCoupon}
                  disabled={couponLoading || !couponCode.trim()}
                  className="flex-shrink-0"
                >
                  {couponLoading ? (
                    <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                  ) : (
                    'Apply'
                  )}
                </Button>
              )}
            </div>
            {appliedCoupon && (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                {appliedCoupon.is_percentage
                  ? `${appliedCoupon.discount_percentage}% discount applied!`
                  : `₹${appliedCoupon.discount_amount} discount applied!`}
              </p>
            )}
          </div>

          <div className="space-y-3 py-2">
            {packagesLoading ? (
              <div className="text-center py-8">
                <span className="w-6 h-6 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin inline-block" />
              </div>
            ) : (() => {
              // Filter packages: for upgrades, only show packages with higher priority
              const currentPriority = selectedListing?.priority || 0;
              const availablePackages = isUpgrade
                ? boostPackages.filter(pkg => pkg.priority_boost > currentPriority)
                : boostPackages;

              if (availablePackages.length === 0) {
                return (
                  <p className="text-center text-muted-foreground py-4">
                    {isUpgrade
                      ? 'You already have the highest boost tier!'
                      : 'No boost packages available'}
                  </p>
                );
              }

              return availablePackages.map((pkg, index) => {
                const originalPrice = pkg.price;
                const discountedPrice = getDiscountedPrice(originalPrice);
                const hasDiscount = appliedCoupon && discountedPrice < originalPrice;

                return (
                  <button
                    key={pkg.id}
                    onClick={() => handleBoost(pkg)}
                    disabled={boostLoading}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left group ${index === 1
                      ? 'border-purple-200 bg-purple-50 hover:border-purple-400 hover:bg-purple-100'
                      : pkg.is_featured
                        ? 'border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100'
                        : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                      }`}
                  >
                    {index === 1 && (
                      <div className="absolute -top-2 right-4 px-2 py-0.5 bg-purple-600 text-white text-xs font-bold rounded-full">
                        Popular
                      </div>
                    )}
                    <div className="flex items-center justify-between relative">
                      <div>
                        <h4 className={`font-bold ${pkg.is_featured ? 'text-amber-800 flex items-center gap-2' :
                          index === 1 ? 'text-purple-800' : 'text-gray-800 group-hover:text-blue-700'
                          }`}>
                          {pkg.is_featured && <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />}
                          {pkg.name}
                        </h4>
                        <p className={`text-sm ${pkg.is_featured ? 'text-amber-600' : index === 1 ? 'text-purple-600' : 'text-gray-500'}`}>
                          {pkg.description}
                        </p>
                      </div>
                      <div className="text-right">
                        {hasDiscount ? (
                          <>
                            <span className="text-sm text-gray-400 line-through">₹{originalPrice}</span>
                            <span className={`text-2xl font-bold ml-2 ${pkg.is_featured ? 'text-amber-800' : index === 1 ? 'text-purple-800' : 'text-gray-800'}`}>
                              ₹{discountedPrice}
                            </span>
                          </>
                        ) : (
                          <span className={`text-2xl font-bold ${pkg.is_featured ? 'text-amber-800' : index === 1 ? 'text-purple-800' : 'text-gray-800'}`}>
                            ₹{originalPrice}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              });
            })()}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setBoostOpen(false)} disabled={boostLoading}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}