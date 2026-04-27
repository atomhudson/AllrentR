import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AdminStats {
  totalListings: number;
  pendingListings: number;
  approvedListings: number;
  rejectedListings: number;
  totalRevenue: number;
  pendingRevenue: number;
  totalUsers: number;
  todayListings: number;
  weeklyListings: number;
  monthlyListings: number;
}

export const useAdminStats = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalListings: 0,
    pendingListings: 0,
    approvedListings: 0,
    rejectedListings: 0,
    totalRevenue: 0,
    pendingRevenue: 0,
    totalUsers: 0,
    todayListings: 0,
    weeklyListings: 0,
    monthlyListings: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Get listing counts by status
      const { data: listings } = await supabase
        .from('listings')
        .select('listing_status, payment_verified, created_at, final_price');

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const pending = listings?.filter(l => l.listing_status === 'pending').length || 0;
      const approved = listings?.filter(l => l.listing_status === 'approved').length || 0;
      const rejected = listings?.filter(l => l.listing_status === 'rejected').length || 0;
      
      const todayCount = listings?.filter(l => new Date(l.created_at) >= today).length || 0;
      const weekCount = listings?.filter(l => new Date(l.created_at) >= weekAgo).length || 0;
      const monthCount = listings?.filter(l => new Date(l.created_at) >= monthAgo).length || 0;

      // Get user count — use admin RPC for accurate count (includes auth users without profiles)
      let userCount = 0;
      try {
        const { data: allUsers } = await (supabase.rpc as any)('admin_get_all_users');
        userCount = Array.isArray(allUsers) ? allUsers.length : 0;
      } catch {
        // Fallback to profiles count if RPC fails
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        userCount = count || 0;
      }

      // Calculate revenue: sum of final_price for payment-verified listings
      const verifiedListings = listings?.filter(l => l.payment_verified) || [];
      const totalRevenue = verifiedListings.reduce((sum, l) => sum + (Number(l.final_price) || 0), 0);
      const pendingRevenue = (listings?.filter(l => l.listing_status === 'pending') || [])
        .reduce((sum, l) => sum + (Number(l.final_price) || 0), 0);

      setStats({
        totalListings: listings?.length || 0,
        pendingListings: pending,
        approvedListings: approved,
        rejectedListings: rejected,
        totalRevenue,
        pendingRevenue,
        totalUsers: userCount || 0,
        todayListings: todayCount,
        weeklyListings: weekCount,
        monthlyListings: monthCount,
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, refetch: fetchStats };
};
