import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { useListings } from '@/hooks/useListings';
import { Eye, Star, Package, CheckCircle, Clock, XCircle, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserStreak } from '@/hooks/useLeaderboard';
import { ProfileEditDialog } from '@/components/ProfileEditDialog';
import { supabase } from '@/integrations/supabase/client';
import { User } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { listings } = useListings(undefined, user?.id);
  const { data: streakData } = useUserStreak(user?.id || '');
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadProfile();
  }, [user, navigate]);

  const loadProfile = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('avatar_url, name')
      .eq('id', user.id)
      .single();

    if (data) {
      setProfile(data);
    }
  };

  if (!user) return null;

  const totalViews = listings.reduce((sum, listing) => sum + (listing.views || 0), 0);
  const avgRating = listings.length > 0
    ? listings.reduce((sum, listing) => sum + (listing.rating || 0), 0) / listings.length
    : 0;
  const approvedListings = listings.filter(l => l.listing_status === 'approved').length;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-[#E5383B]" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-[#E5383B]" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      approved: 'bg-[#E5383B]/10 text-[#E5383B] border-[#E5383B]',
      pending: 'bg-[#E5383B]/10 text-[#E5383B] border-[#E5383B]',
      rejected: 'bg-destructive/10 text-destructive border-destructive',
    };
    return styles[status as keyof typeof styles] || '';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-20 md:pt-28 pb-12 md:pb-20">
        {/* User Info */}
        <div className="mb-8 md:mb-12 animate-fade-in">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 md:p-8 bg-gradient-overlay rounded-2xl border border-border/50 shadow-card">
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-3">
                Welcome Back!
              </h1>
              <div className="flex items-center gap-3">
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full object-cover border-2 border-[#E5383B]"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#E5383B]/10 flex items-center justify-center border-2 border-[#E5383B]/20">
                    <User className="w-5 h-5 text-[#E5383B]" />
                  </div>
                )}
                <p className="text-base md:text-lg text-muted-foreground">
                  {user.email}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              {streakData && streakData.current_streak > 0 && (
                <Card className="p-6 bg-[#E5383B] border-none">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-[#F5F3F4]/20 flex items-center justify-center">
                      <Flame className="w-9 h-9 text-[#F5F3F4]" />
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-[#F5F3F4]">
                        {streakData.current_streak} Days
                      </div>
                      <div className="text-sm text-[#F5F3F4]/80 font-medium">
                        Current Streak 🔥
                      </div>
                      <div className="text-xs text-[#F5F3F4]/70 mt-1">
                        Best: {streakData.longest_streak} days
                      </div>
                    </div>
                  </div>
                </Card>
              )}
              <div className="flex items-center">
                <ProfileEditDialog />
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
          <Card className="p-6 md:p-8 shadow-card hover:shadow-elegant transition-all duration-500 animate-fade-in-up border-border/50 hover:border-[#E5383B]/30 group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-[#E5383B]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Package className="w-6 h-6 md:w-7 md:h-7 text-[#E5383B]" />
              </div>
              <span className="text-3xl md:text-4xl font-bold text-foreground">{listings.length}</span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground font-medium uppercase tracking-wide">Total Listings</p>
          </Card>

          <Card className="p-6 md:p-8 shadow-card hover:shadow-elegant transition-all duration-500 animate-fade-in-up border-border/50 hover:border-[#E5383B]/30 group" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-[#E5383B]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CheckCircle className="w-6 h-6 md:w-7 md:h-7 text-[#E5383B]" />
              </div>
              <span className="text-3xl md:text-4xl font-bold text-foreground">{approvedListings}</span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground font-medium uppercase tracking-wide">Approved & Live</p>
          </Card>

          <Card className="p-6 md:p-8 shadow-card hover:shadow-elegant transition-all duration-500 animate-fade-in-up border-border/50 hover:border-[#E5383B]/30 group" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-[#E5383B]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Eye className="w-6 h-6 md:w-7 md:h-7 text-[#E5383B]" />
              </div>
              <span className="text-3xl md:text-4xl font-bold text-foreground">{totalViews}</span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground font-medium uppercase tracking-wide">Total Views</p>
          </Card>

          <Card className="p-6 md:p-8 shadow-card hover:shadow-elegant transition-all duration-500 animate-fade-in-up border-border/50 hover:border-[#E5383B]/30 group" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-[#E5383B]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Star className="w-6 h-6 md:w-7 md:h-7 text-[#E5383B] fill-current" />
              </div>
              <span className="text-3xl md:text-4xl font-bold text-foreground">{avgRating.toFixed(1)}</span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground font-medium uppercase tracking-wide">Average Rating</p>
          </Card>
        </div>

        {/* Listings Table */}
        <Card className="p-6 md:p-8 shadow-elegant animate-fade-in">
          <h2 className="text-xl md:text-2xl font-serif font-bold text-foreground mb-6">
            Your Listings
          </h2>

          {listings.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">
                You haven't listed any items yet. Start listing to earn!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {listings.map((listing, index) => (
                <div
                  key={listing.id}
                  className="border border-border rounded-lg p-4 hover:shadow-card transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          {listing.product_name}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(listing.listing_status)}`}>
                          {getStatusIcon(listing.listing_status)}
                          <span className="ml-1 capitalize">{listing.listing_status}</span>
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {listing.description}
                      </p>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-1 text-[#E5383B] font-medium">
                          ₹{listing.rent_price}/day
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Eye className="w-4 h-4" />
                          {listing.views || 0} views
                        </div>
                        <div className="flex items-center gap-1 text-[#E5383B]">
                          <Star className="w-4 h-4 fill-current" />
                          {listing.rating?.toFixed(1) || '5.0'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Profile;
