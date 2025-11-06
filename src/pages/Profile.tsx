import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { useListings } from '@/hooks/useListings';
import { useNavigate } from 'react-router-dom';
import { useUserStreak } from '@/hooks/useLeaderboard';
import ListingCardOnProfile from '@/components/ListingCardOnProfile';
import StatsCardsOnProfile from '@/components/StatsCardsOnProfile';
import DashboardHero from '@/components/DashboardHeroOnProfile';
import { ProfileEditDialog } from '@/components/ProfileEditDialog';
import { useState } from 'react';

const Profile = () => {
  const { user, authReady } = useAuth();
  const navigate = useNavigate();
  const { listings } = useListings(undefined, user?.id);
  const { data: streakData } = useUserStreak(user?.id || '');
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  if (!user) return null;

  const totalViews = listings.reduce((sum, listing) => sum + (listing.views || 0), 0);
  const avgRating = listings.length > 0
    ? listings.reduce((sum, listing) => sum + (listing.rating || 0), 0) / listings.length
    : 0;
  const approvedListings = listings.filter(l => l.listing_status === 'approved').length;
  const pendingListings = listings.filter(l => l.listing_status === 'pending').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F3F4] via-white to-[#F5F3F4]">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-20 md:pt-28 pb-12 md:pb-20">

        {/* Hero Section */}
        <DashboardHero
          user={user}
          totalViews={totalViews}
          avgRating={avgRating}
          streakData={streakData}
          onEditProfile={() => setEditDialogOpen(true)}
        />
        <StatsCardsOnProfile
          totalListings={listings.length}
          totalViews={totalViews}
          avgRating={avgRating}
          approvedListings={approvedListings}
          pendingListings={pendingListings}
        />

        <ListingCardOnProfile listings={listings} />
      </div>

      {/* Edit Profile Dialog */}
      <ProfileEditDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} />
    </div>
  );
};

export default Profile;