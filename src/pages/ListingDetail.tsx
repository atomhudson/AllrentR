import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/Navbar";
import { RatingCard } from "@/components/RatingCard";
import { ShareButtons } from "@/components/ShareButtons";
import { ListingQRCode } from "@/components/ListingQRCode";
import { PriceHistoryChart } from "@/components/PriceHistoryChart";
import { ChatWindow } from "@/components/ChatWindow";
import { ItemVerificationModal } from "@/components/ItemVerificationModal";
import { useAuth } from "@/contexts/AuthContext";
import { useChat } from "@/hooks/useChat";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    MapPin,
    Eye,
    Star,
    User,
    Package,
    Tag,
    MessageCircle,
    ArrowLeft,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Clock,
    Shield,
    TrendingUp,
    FileText,
    Send,
    Pencil,
    Trash2,
    Save,
    X,
    AlertTriangle,
    ClipboardCheck,
} from "lucide-react";

const ListingDetail = () => {
    const navigate = useNavigate();
    const { slugId } = useParams();
    const { user } = useAuth();
    const { getOrCreateConversation, joinConversation, conversations } = useChat();

    const [listing, setListing] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [chatOpen, setChatOpen] = useState(false);
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
    const [otherUserProfile, setOtherUserProfile] = useState<any>(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    // Edit modal state
    const [editOpen, setEditOpen] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [editForm, setEditForm] = useState({
        product_name: '',
        description: '',
        rent_price: 0,
        original_price: 0,
        product_type: 'rent',
        address: '',
        city: '',
        pin_code: '',
    });

    // Delete dialog state
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Verification modal state
    const [verificationOpen, setVerificationOpen] = useState(false);
    const [verificationEnabled, setVerificationEnabled] = useState(false);
    const [contactRevealed, setContactRevealed] = useState(false);
    const [revealedContact, setRevealedContact] = useState<{ phone: string; address: string } | null>(null);
    const [revealingContact, setRevealingContact] = useState(false);
    
    const displayIdFromUrl = useMemo(() => {
        if (!slugId) return null;
        const match = slugId.match(/PROD[-_][a-z0-9-]+$/i);
        return match ? match[0] : null;
    }, [slugId]);

    // Check if current user is the owner
    const isOwner = useMemo(() => {
        return user && listing && listing.owner_user_id === user.id;
    }, [user, listing]);

    useEffect(() => {
        const fetchListing = async () => {
            if (!displayIdFromUrl) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const normalizedId = displayIdFromUrl.replace('PROD-', 'PROD_');
                let fetchedListing: any = null;

                // Use secure view for public queries - masks phone/address for non-owners
                const { data, error } = await (supabase as any)
                    .from('listings_public')
                    .select('*')
                    .eq('display_id', normalizedId)
                    .eq('listing_status', 'approved')
                    .single();

                if (error) {
                    const altId = displayIdFromUrl.replace('PROD_', 'PROD-');
                    const { data: altData, error: altError } = await (supabase as any)
                        .from('listings_public')
                        .select('*')
                        .eq('display_id', altId)
                        .eq('listing_status', 'approved')
                        .single();

                    if (altError) {
                        toast({ title: "Listing not found", description: "The listing you're looking for doesn't exist.", variant: "destructive" });
                        navigate('/listings');
                        return;
                    }
                    fetchedListing = altData;
                    setListing(altData);
                } else {
                    fetchedListing = data;
                    setListing(data);
                }

                if (fetchedListing?.id) {
                    await supabase.rpc('increment_listing_views', { listing_id: fetchedListing.id });
                }
            } catch (err) {
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchListing();
    }, [displayIdFromUrl, navigate]);

    // Initialize edit form and verification enabled when listing loads
    useEffect(() => {
        if (listing) {
            setEditForm({
                product_name: listing.product_name || '',
                description: listing.description || '',
                rent_price: listing.rent_price || 0,
                original_price: listing.original_price || 0,
                product_type: listing.product_type || 'rent',
                address: listing.address || '',
                city: listing.city || '',
                pin_code: listing.pin_code || '',
            });
            setVerificationEnabled(listing.verification_enabled || false);
        }
    }, [listing]);

    const existingConversation = useMemo(() => {
        if (!listing || !user) return null;
        return conversations.find(
            conv => conv.listing_id === listing.id && (conv.owner_id === user.id || conv.leaser_id === user.id)
        );
    }, [conversations, listing, user]);

    // Function to reveal full contact details
    const handleRevealContact = async () => {
        if (!user) {
            toast({ title: "Login Required", description: "Please login to view contact details", variant: "destructive" });
            navigate("/login");
            return;
        }

        if (!listing) return;

        setRevealingContact(true);
        try {
            const { data, error } = await supabase.rpc('get_listing_contact', {
                listing_id_param: listing.id
            });

            if (error) throw error;

            if (data && data.length > 0) {
                setRevealedContact({ phone: data[0].phone, address: data[0].address });
                setContactRevealed(true);
            }
        } catch (error) {
            console.error('Error revealing contact:', error);
            toast({ title: "Error", description: "Could not retrieve contact details", variant: "destructive" });
        } finally {
            setRevealingContact(false);
        }
    };

    const handleStartChat = async () => {
        if (!user) {
            toast({ title: "Login Required", description: "Please login to start a conversation", variant: "destructive" });
            navigate("/login");
            return;
        }

        if (!listing) return;

        if (listing.owner_user_id === user.id) {
            toast({ title: "Cannot chat with yourself", description: "You cannot start a conversation for your own listing", variant: "destructive" });
            return;
        }

        try {
            let conversation: any = existingConversation;

            if (!conversation) {
                conversation = await getOrCreateConversation(listing.id, listing.owner_user_id);
            }

            if (conversation) {
                const isOwner = listing.owner_user_id === user.id;
                let profile = null;

                if (existingConversation?.other_user) {
                    profile = existingConversation.other_user;
                } else {
                    const otherUserId = isOwner ? conversation.leaser_id : conversation.owner_id;
                    const { data, error } = await supabase.from('profiles').select('name, avatar_url').eq('id', otherUserId).maybeSingle();
                    if (!error && data) profile = data;
                }

                setOtherUserProfile(profile || { name: isOwner ? 'Leaser' : 'Owner', avatar_url: null });
                setCurrentConversationId(conversation.id);
                joinConversation(conversation.id);
                setChatOpen(true);
            }
        } catch (error) {
            console.error('Error starting chat:', error);
            toast({ title: "Error", description: "Failed to start conversation", variant: "destructive" });
        }
    };

    // Handle edit form submission
    const handleEditSubmit = async () => {
        if (!listing || !user) return;

        setEditLoading(true);
        try {
            const { error } = await supabase
                .from('listings')
                .update({
                    product_name: editForm.product_name,
                    description: editForm.description,
                    rent_price: editForm.rent_price,
                    original_price: editForm.original_price,
                    product_type: editForm.product_type as "rent" | "sale" | "both",
                    address: editForm.address,
                    city: editForm.city,
                    pin_code: editForm.pin_code,
                })
                .eq('id', listing.id)
                .eq('owner_user_id', user.id);

            if (error) throw error;

            // Update local state
            setListing((prev: any) => ({
                ...prev,
                ...editForm,
            }));

            toast({ title: "Success", description: "Listing updated successfully" });
            setEditOpen(false);
        } catch (error: any) {
            console.error('Error updating listing:', error);
            toast({ title: "Error", description: error.message || "Failed to update listing", variant: "destructive" });
        } finally {
            setEditLoading(false);
        }
    };

    // Handle delete
    const handleDelete = async () => {
        if (!listing || !user) return;

        setDeleteLoading(true);
        try {
            const { error } = await supabase
                .from('listings')
                .delete()
                .eq('id', listing.id)
                .eq('owner_user_id', user.id);

            if (error) throw error;

            toast({ title: "Deleted", description: "Your listing has been deleted" });
            navigate('/listings');
        } catch (error: any) {
            console.error('Error deleting listing:', error);
            toast({ title: "Error", description: error.message || "Failed to delete listing", variant: "destructive" });
        } finally {
            setDeleteLoading(false);
            setDeleteOpen(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FAFAFA]">
                <Navbar />
                <div className="max-w-6xl mx-auto px-4 pt-20 pb-8">
                    <div className="animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
                        <div className="grid lg:grid-cols-5 gap-6">
                            <div className="lg:col-span-3 h-[400px] bg-gray-200 rounded-2xl" />
                            <div className="lg:col-span-2 space-y-4">
                                <div className="h-32 bg-gray-200 rounded-xl" />
                                <div className="h-48 bg-gray-200 rounded-xl" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!listing) {
        return (
            <div className="min-h-screen bg-[#FAFAFA]">
                <Navbar />
                <div className="max-w-6xl mx-auto px-4 pt-20 pb-8 text-center">
                    <Package className="w-16 h-16 mx-auto text-gray-300 mb-3" />
                    <h1 className="text-xl font-semibold text-gray-600">Listing Not Found</h1>
                    <Button onClick={() => navigate('/listings')} className="mt-4 bg-gradient-to-r from-primary to-accent text-white">
                        <ArrowLeft className="w-4 h-4 mr-2" />Back to Listings
                    </Button>
                </div>
            </div>
        );
    }

    const images = listing.images || [];

    return (
        <div className="min-h-screen bg-[#FAFAFA]">
            <Navbar />

            <div className="max-w-6xl mx-auto px-3 sm:px-4 pt-16 sm:pt-20 pb-6 sm:pb-8">
                {/* Navigation */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4">
                    <Button variant="ghost" size="sm" onClick={() => navigate('/listings')} className="text-gray-600 hover:text-primary hover:bg-primary/5 -ml-2">
                        <ArrowLeft className="w-4 h-4 mr-1.5" />Back to Listings
                    </Button>
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Owner Controls */}
                        {isOwner && (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditOpen(true)}
                                    className="gap-1.5 border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                                >
                                    <Pencil className="w-3.5 h-3.5" />
                                    <span className="hidden xs:inline">Edit</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setDeleteOpen(true)}
                                    className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span className="hidden xs:inline">Delete</span>
                                </Button>
                            </>
                        )}
                        <ShareButtons url={window.location.href} title={listing.product_name} />
                        <ListingQRCode listingId={listing.id} productName={listing.product_name} />
                    </div>
                </div>

                {/* Owner Badge */}
                {isOwner && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-blue-700 font-medium">You own this listing</span>
                    </div>
                )}

                {/* Main Grid - 60/40 Split */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
                    {/* Left Column - Images & Details */}
                    <div className="lg:col-span-3 space-y-3 sm:space-y-4">
                        {/* Image Gallery */}
                        <div className="relative rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100">
                            <div className="aspect-[16/10] relative">
                                {images.length > 0 ? (
                                    <>
                                        <img
                                            src={images[selectedImageIndex]}
                                            alt={listing.product_name}
                                            className="w-full h-full object-cover"
                                        />
                                        {images.length > 1 && (
                                            <>
                                                <button
                                                    onClick={() => setSelectedImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 hover:bg-white shadow-lg flex items-center justify-center transition-all hover:scale-105"
                                                >
                                                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                                                </button>
                                                <button
                                                    onClick={() => setSelectedImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/95 hover:bg-white shadow-lg flex items-center justify-center transition-all hover:scale-105"
                                                >
                                                    <ChevronRight className="w-5 h-5 text-gray-700" />
                                                </button>
                                            </>
                                        )}
                                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full">
                                            {selectedImageIndex + 1} / {images.length}
                                        </div>
                                        {listing.product_type && (
                                            <div className="absolute top-3 right-3 bg-gradient-to-r from-primary to-accent text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1.5">
                                                <Tag className="w-3 h-3" />
                                                {listing.product_type === "both" ? "Rent & Sale" : listing.product_type === "sale" ? "For Sale" : "For Rent"}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center h-full bg-gray-50">
                                        <Package className="w-20 h-20 text-gray-300" />
                                    </div>
                                )}
                            </div>
                            {images.length > 1 && (
                                <div className="p-3 bg-gray-50 border-t border-gray-100">
                                    <div className="flex gap-2 overflow-x-auto">
                                        {images.map((img: string, idx: number) => (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedImageIndex(idx)}
                                                className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${selectedImageIndex === idx ? 'border-primary ring-2 ring-primary/20' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                            >
                                                <img src={img} alt="" className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Info Cards Row */}
                        <div className="grid grid-cols-3 gap-2 sm:gap-3">
                            <div className="p-2 sm:p-3 bg-white rounded-lg sm:rounded-xl border border-gray-100 shadow-sm text-center">
                                <Eye className="w-4 sm:w-5 h-4 sm:h-5 text-primary mx-auto mb-1" />
                                <p className="text-base sm:text-lg font-bold text-gray-800">{listing.views || 0}</p>
                                <p className="text-[10px] sm:text-xs text-gray-500">Views</p>
                            </div>
                            <div className="p-2 sm:p-3 bg-white rounded-lg sm:rounded-xl border border-gray-100 shadow-sm text-center">
                                <Star className="w-4 sm:w-5 h-4 sm:h-5 text-amber-500 fill-amber-500 mx-auto mb-1" />
                                <p className="text-base sm:text-lg font-bold text-gray-800">{listing.rating?.toFixed(1) || "5.0"}</p>
                                <p className="text-[10px] sm:text-xs text-gray-500">Rating</p>
                            </div>
                            <div className="p-2 sm:p-3 bg-white rounded-lg sm:rounded-xl border border-gray-100 shadow-sm text-center">
                                <MapPin className="w-4 sm:w-5 h-4 sm:h-5 text-primary mx-auto mb-1" />
                                <p className="text-base sm:text-lg font-bold text-gray-800 truncate">{listing.city || "—"}</p>
                                <p className="text-[10px] sm:text-xs text-gray-500">Location</p>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="p-4 sm:p-5 bg-white rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-2 sm:mb-3">
                                <FileText className="w-4 h-4 text-primary" />
                                <h3 className="font-semibold text-gray-800">Description</h3>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                                {listing.description || "No description provided."}
                            </p>
                        </div>

                        {/* Location & Contact Section */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-primary" />
                                        <h3 className="font-semibold text-gray-800 text-sm">Location & Contact</h3>
                                    </div>
                                    {!isOwner && !contactRevealed && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={handleRevealContact}
                                            disabled={revealingContact}
                                            className="text-xs h-7 px-2 border-primary text-primary hover:bg-primary/10"
                                        >
                                            {revealingContact ? "Loading..." : "Reveal Contact"}
                                        </Button>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600">
                                    {contactRevealed && revealedContact ? revealedContact.address : listing.address || "Not provided"}
                                </p>
                                {listing.pin_code && (
                                    <p className="text-xs text-gray-400 mt-1">PIN: {listing.pin_code}</p>
                                )}
                                {(contactRevealed && revealedContact) ? (
                                    <p className="text-sm text-primary font-medium mt-2">
                                        📞 {revealedContact.phone}
                                    </p>
                                ) : !isOwner && listing.phone?.startsWith('******') ? (
                                    <p className="text-xs text-muted-foreground mt-2 italic">
                                        Contact hidden • Click "Reveal Contact" to view
                                    </p>
                                ) : (
                                    <p className="text-sm text-primary font-medium mt-2">
                                        📞 {listing.phone}
                                    </p>
                                )}
                            </div>
                            <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="w-4 h-4 text-primary" />
                                    <h3 className="font-semibold text-gray-800 text-sm">Price History</h3>
                                </div>
                                <PriceHistoryChart listingId={listing.id} />
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Sticky Sidebar */}
                    <div className="lg:col-span-2 order-first lg:order-last">
                        <div className="lg:sticky lg:top-20 space-y-3 sm:space-y-4">
                            {/* Product Info Card */}
                            <div className="p-4 sm:p-5 bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-sm">
                                <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{listing.product_name}</h1>
                                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                                    <div className="flex items-center gap-1">
                                        <User className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                                        <span>{listing.owner_name || "Verified Owner"}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                                        <span>{new Date(listing.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="p-3 sm:p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg sm:rounded-xl mb-3 sm:mb-4">
                                    <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide mb-1">Price</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl sm:text-3xl font-bold text-primary">₹{listing.rent_price || 0}</span>
                                        <span className="text-sm text-gray-500">{listing.product_type === 'sale' ? '' : '/day'}</span>
                                    </div>
                                    {listing.original_price > listing.rent_price && (
                                        <p className="text-xs sm:text-sm text-gray-400 line-through mt-1">₹{listing.original_price}</p>
                                    )}
                                </div>

                                {/* CTA - Different for owner vs visitor */}
                                {isOwner ? (
                                    <div className="space-y-2">
                                        <Button
                                            onClick={() => setEditOpen(true)}
                                            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90 text-white rounded-xl py-5 text-base font-semibold shadow-lg shadow-blue-500/20"
                                        >
                                            <Pencil className="w-5 h-5 mr-2" />
                                            Edit Listing
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => setDeleteOpen(true)}
                                            className="w-full border-red-200 text-red-600 hover:bg-red-50 rounded-xl py-5 text-base font-semibold"
                                        >
                                            <Trash2 className="w-5 h-5 mr-2" />
                                            Delete Listing
                                        </Button>
                                        {/* Owner Verification Button */}
                                        <Button
                                            onClick={() => setVerificationOpen(true)}
                                            variant="outline"
                                            className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-xl py-5 text-base font-semibold"
                                        >
                                            <ClipboardCheck className="w-5 h-5 mr-2" />
                                            Item Condition & Verification
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        <Button
                                            onClick={handleStartChat}
                                            className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white rounded-xl py-5 text-base font-semibold shadow-lg shadow-primary/20 transition-all duration-300"
                                        >
                                            <MessageCircle className="w-5 h-5 mr-2" />
                                            {existingConversation ? "Continue Chat" : "Chat with Owner"}
                                        </Button>
                                        {existingConversation && (
                                            <p className="text-xs text-center text-gray-400 mt-2">You have an existing conversation</p>
                                        )}
                                        
                                        {/* Item Condition & Verification Button */}
                                        <Button
                                            onClick={() => setVerificationOpen(true)}
                                            variant="outline"
                                            className="w-full mt-3 border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-xl py-5 text-base font-semibold"
                                        >
                                            <ClipboardCheck className="w-5 h-5 mr-2" />
                                            Item Condition & Verification
                                        </Button>
                                    </>
                                )}
                            </div>

                            {/* Trust Badges */}
                            <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg">
                                        <Shield className="w-4 h-4 text-emerald-600" />
                                        <span className="text-xs font-medium text-emerald-700">Verified Listing</span>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                                        <Clock className="w-4 h-4 text-blue-600" />
                                        <span className="text-xs font-medium text-blue-700">Quick Response</span>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg">
                                        <Star className="w-4 h-4 text-amber-600" />
                                        <span className="text-xs font-medium text-amber-700">Top Rated</span>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg">
                                        <Send className="w-4 h-4 text-purple-600" />
                                        <span className="text-xs font-medium text-purple-700">Safe Delivery</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="mt-8">
                    <RatingCard listingId={listing.id} currentUserId={user?.id} />
                </div>
            </div>

            {/* Edit Modal */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Pencil className="w-5 h-5 text-blue-600" />
                            Edit Listing
                        </DialogTitle>
                        <DialogDescription>
                            Update your listing details
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
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
                        <Button onClick={handleEditSubmit} disabled={editLoading} className="bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90 text-white">
                            {editLoading ? (
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                            ) : (
                                <Save className="w-4 h-4 mr-1.5" />
                            )}
                            Save Changes
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
                            Are you sure you want to delete "{listing.product_name}"? This action cannot be undone.
                            All conversations, ratings, and views associated with this listing will also be removed.
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

            {/* Chat Dialog */}
            <Dialog open={chatOpen} onOpenChange={setChatOpen}>
                <DialogContent className="max-w-4xl p-0 border-0 bg-transparent" aria-describedby="chat-description">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Chat with {otherUserProfile?.name || "Owner"}</DialogTitle>
                        <DialogDescription id="chat-description">
                            Start a conversation about {listing?.product_name || 'this listing'}
                        </DialogDescription>
                    </DialogHeader>
                    {currentConversationId && listing && otherUserProfile && (
                        <ChatWindow
                            conversationId={currentConversationId}
                            listingName={listing.product_name}
                            otherUserName={otherUserProfile.name || (listing.owner_user_id === user?.id ? "Leaser" : "Owner")}
                            otherUserAvatar={otherUserProfile.avatar_url}
                            onClose={() => { setChatOpen(false); setCurrentConversationId(null); setOtherUserProfile(null); }}
                            isOwner={listing.owner_user_id === user?.id}
                            contactRequestStatus={existingConversation?.contact_request_status}
                            ownerPhone={listing.phone}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Item Verification Modal */}
            {listing && user && (
                <ItemVerificationModal
                    open={verificationOpen}
                    onOpenChange={setVerificationOpen}
                    listingId={listing.id}
                    ownerId={listing.owner_user_id}
                    currentUserId={user.id}
                    isOwner={isOwner}
                    verificationEnabled={verificationEnabled}
                    onVerificationEnabledChange={(enabled) => {
                        setVerificationEnabled(enabled);
                        setListing((prev: any) => ({ ...prev, verification_enabled: enabled }));
                    }}
                />
            )}
        </div>
    );
};

export default ListingDetail;
