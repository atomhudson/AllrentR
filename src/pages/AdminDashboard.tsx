import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { useListings, approveListing, rejectListing } from '@/hooks/useListings';
import { useAdminStats } from '@/hooks/useAdminStats';
import { CheckCircle, XCircle, Clock, IndianRupee, Users, TrendingUp, Download, FileSpreadsheet, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface ActivityLog {
  id: string;
  admin_id: string;
  action: string;
  target_type: string;
  target_id: string;
  details: any;
  created_at: string;
}

interface UserActivity {
  id: string;
  user_id: string;
  action: string;
  details: any;
  created_at: string;
}

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { listings: pendingListings, refetch } = useListings('pending');
  const { stats, loading: statsLoading, refetch: refetchStats } = useAdminStats();
  const [loading, setLoading] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);

  const refetchActivityLogs = async () => {
    try {
      // Fetch admin activity logs
      const { data: adminLogs } = await supabase
        .from('admin_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      // Fetch user activity logs
      const { data: userLogs } = await supabase
        .from('user_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      setActivityLogs(adminLogs || []);
      setUserActivities(userLogs || []);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    }
  };

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate('/');
      return;
    }
    refetchActivityLogs();
  }, [user, isAdmin, navigate]);

  const handleApprove = async (listingId: string) => {
    setLoading(listingId);
    const success = await approveListing(listingId);
    
    if (success) {
      // Log admin activity
      await supabase.from('admin_activity_logs').insert({
        admin_id: user?.id,
        action: 'APPROVE_LISTING',
        target_type: 'listing',
        target_id: listingId,
        details: { timestamp: new Date().toISOString() }
      });

      toast({
        title: "Listing approved!",
        description: "The listing is now live on the marketplace.",
      });
      await refetch();
      await refetchStats();
      await refetchActivityLogs();
    }
    setLoading(null);
  };

  const handleReject = async (listingId: string) => {
    setLoading(listingId);
    const success = await rejectListing(listingId);
    
    if (success) {
      // Log admin activity
      await supabase.from('admin_activity_logs').insert({
        admin_id: user?.id,
        action: 'REJECT_LISTING',
        target_type: 'listing',
        target_id: listingId,
        details: { timestamp: new Date().toISOString() }
      });

      toast({
        title: "Listing rejected",
        description: "The listing has been rejected.",
        variant: "destructive",
      });
      await refetch();
      await refetchStats();
      await refetchActivityLogs();
    }
    setLoading(null);
  };

  const downloadReport = async () => {
    try {
      // Log admin activity
      await supabase.from('admin_activity_logs').insert({
        admin_id: user?.id,
        action: 'DOWNLOAD_REPORT',
        target_type: 'system',
        target_id: 'report',
        details: { timestamp: new Date().toISOString() }
      });

      // Fetch all data
      const { data: listings } = await supabase.from('listings').select('*');
      const { data: profiles } = await supabase.from('profiles').select('*');

      // Create CSV content
      let csv = 'RENTKARO ADMIN REPORT\n\n';
      
      csv += 'SUMMARY STATISTICS\n';
      csv += `Total Listings,${stats.totalListings}\n`;
      csv += `Approved Listings,${stats.approvedListings}\n`;
      csv += `Pending Listings,${stats.pendingListings}\n`;
      csv += `Rejected Listings,${stats.rejectedListings}\n`;
      csv += `Total Users,${stats.totalUsers}\n`;
      csv += `Total Revenue,₹${stats.totalRevenue}\n`;
      csv += `Pending Revenue,₹${stats.pendingRevenue}\n\n`;

      csv += 'ALL LISTINGS\n';
      csv += 'ID,Product Name,Description,Rent Price,Pin Code,Status,Owner ID,Payment Verified,Created At\n';
      listings?.forEach(l => {
        csv += `"${l.id}","${l.product_name}","${l.description}",${l.rent_price},"${l.pin_code}","${l.listing_status}","${l.owner_user_id}","${l.payment_verified ? 'Yes' : 'No'}","${l.created_at}"\n`;
      });

      csv += '\nALL USERS\n';
      csv += 'ID,Name,Phone,Pin Code,Created At\n';
      profiles?.forEach(p => {
        csv += `"${p.id}","${p.name}","${p.phone}","${p.pin_code}","${p.created_at}"\n`;
      });

      // Download file
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rentkaro-report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Report downloaded",
        description: "Your admin report has been downloaded successfully",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const syncToGoogleSheets = async () => {
    setSyncing(true);
    try {
      // Log admin activity
      await supabase.from('admin_activity_logs').insert({
        admin_id: user?.id,
        action: 'SYNC_TO_SHEETS',
        target_type: 'system',
        target_id: 'google_sheets',
        details: { timestamp: new Date().toISOString() }
      });
      // Fetch all data
      const { data: listings } = await supabase.from('listings').select('*');
      const { data: profiles } = await supabase.from('profiles').select('*');

      // Sync listings
      if (listings) {
        for (const listing of listings) {
          await supabase.functions.invoke('sync-to-sheets', {
            body: { type: 'listing', data: listing }
          });
        }
      }

      // Sync users
      if (profiles) {
        for (const profile of profiles) {
          await supabase.functions.invoke('sync-to-sheets', {
            body: { type: 'user', data: profile }
          });
        }
      }

      // Log admin activity
      await supabase.functions.invoke('sync-to-sheets', {
        body: {
          type: 'admin_activity',
          data: {
            action: 'Data Sync',
            admin_id: user?.id,
            target_id: 'all',
            details: `Synced ${listings?.length || 0} listings and ${profiles?.length || 0} users`,
            timestamp: new Date().toISOString()
          }
        }
      });

      toast({
        title: "Synced to Google Sheets",
        description: "All data has been synced successfully",
      });
      await refetchActivityLogs();
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: "Sync failed",
        description: "Please ensure Google Sheets API credentials are configured",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="mb-8 animate-fade-in flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-serif font-bold text-foreground mb-2">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Complete overview of RentKaro platform
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/admin/ad-editor')}
              className="gap-2"
            >
              <FileText className="w-4 h-4" />
              Ad Editor
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/admin/blogs')}
              className="gap-2"
            >
              <FileText className="w-4 h-4" />
              Manage Blogs
            </Button>
            <Button
              variant="outline"
              onClick={downloadReport}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Download Report
            </Button>
            <Button
              variant="hero"
              onClick={syncToGoogleSheets}
              disabled={syncing}
              className="gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              {syncing ? 'Syncing...' : 'Sync to Sheets'}
            </Button>
          </div>
        </div>

        {/* Primary Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 shadow-card hover:shadow-elegant transition-all duration-300 animate-fade-in-up">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-primary" />
              <span className="text-3xl font-bold text-foreground">{stats.pendingListings}</span>
            </div>
            <p className="text-sm text-muted-foreground">Pending Approvals</p>
          </Card>

          <Card className="p-6 shadow-card hover:shadow-elegant transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 text-accent" />
              <span className="text-3xl font-bold text-foreground">{stats.approvedListings}</span>
            </div>
            <p className="text-sm text-muted-foreground">Approved Listings</p>
          </Card>

          <Card className="p-6 shadow-card hover:shadow-elegant transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-primary" />
              <span className="text-3xl font-bold text-foreground">{stats.totalUsers}</span>
            </div>
            <p className="text-sm text-muted-foreground">Total Users</p>
          </Card>

          <Card className="p-6 shadow-card hover:shadow-elegant transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-2">
              <IndianRupee className="w-8 h-8 text-accent" />
              <span className="text-3xl font-bold text-foreground">₹{stats.totalRevenue}</span>
            </div>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
          </Card>
        </div>

        {/* Activity Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 shadow-card animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-6 h-6 text-primary" />
              <h3 className="font-semibold text-foreground">Today's Activity</h3>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.todayListings}</p>
            <p className="text-xs text-muted-foreground mt-1">New listings today</p>
          </Card>

          <Card className="p-6 shadow-card animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-6 h-6 text-primary" />
              <h3 className="font-semibold text-foreground">This Week</h3>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.weeklyListings}</p>
            <p className="text-xs text-muted-foreground mt-1">Listings in last 7 days</p>
          </Card>

          <Card className="p-6 shadow-card animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-6 h-6 text-primary" />
              <h3 className="font-semibold text-foreground">This Month</h3>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.monthlyListings}</p>
            <p className="text-xs text-muted-foreground mt-1">Listings in last 30 days</p>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 shadow-card animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
            <h3 className="text-lg font-semibold text-foreground mb-4">Listing Status Distribution</h3>
            <ChartContainer
              config={{
                pending: { label: 'Pending', color: 'hsl(var(--accent))' },
                approved: { label: 'Approved', color: 'hsl(var(--primary))' },
                rejected: { label: 'Rejected', color: 'hsl(var(--destructive))' },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Pending', value: stats.pendingListings, fill: 'hsl(var(--accent))' },
                      { name: 'Approved', value: stats.approvedListings, fill: 'hsl(var(--primary))' },
                      { name: 'Rejected', value: stats.rejectedListings, fill: 'hsl(var(--destructive))' },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    dataKey="value"
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </Card>

          <Card className="p-6 shadow-card animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
            <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
            <ChartContainer
              config={{
                listings: { label: 'Listings', color: 'hsl(var(--primary))' },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: 'Today', listings: stats.todayListings },
                    { name: 'This Week', listings: stats.weeklyListings },
                    { name: 'This Month', listings: stats.monthlyListings },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
                  <YAxis stroke="hsl(var(--foreground))" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="listings" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </Card>
        </div>

        {/* Activity Logs Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Admin Activity Logs */}
          <Card className="p-6 shadow-card animate-fade-in-up">
            <h3 className="text-lg font-semibold text-foreground mb-4">Recent Admin Actions</h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {activityLogs.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">No admin activity yet</p>
              ) : (
                activityLogs.map((log) => (
                  <div key={log.id} className="border-l-2 border-primary pl-3 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-foreground">
                        {log.action.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {log.target_type}: {log.target_id.substring(0, 8)}...
                    </p>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* User Activity Logs */}
          <Card className="p-6 shadow-card animate-fade-in-up">
            <h3 className="text-lg font-semibold text-foreground mb-4">Recent User Activity</h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {userActivities.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-8">No user activity yet</p>
              ) : (
                userActivities.map((activity) => (
                  <div key={activity.id} className="border-l-2 border-accent pl-3 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-foreground">
                        {activity.action.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(activity.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      User: {activity.user_id.substring(0, 8)}...
                    </p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Pending Listings */}
        <Card className="p-8 shadow-elegant animate-fade-in">
          <h2 className="text-2xl font-serif font-bold text-foreground mb-6">
            Pending Listings for Approval
          </h2>

          {pendingListings.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-accent mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">
                All caught up! No pending listings to review.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingListings.map((listing, index) => (
                <div
                  key={listing.id}
                  className="border-2 border-border rounded-lg p-6 hover:shadow-card transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Listing Image */}
                    <div className="relative h-64 bg-muted rounded-lg overflow-hidden">
                      {listing.images && listing.images.length > 0 ? (
                        <img
                          src={listing.images[0]}
                          alt={listing.product_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-primary">
                          <span className="text-primary-foreground text-8xl font-serif">
                            {listing.product_name.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Listing Details */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-2xl font-semibold text-foreground mb-2">
                          {listing.product_name}
                        </h3>
                        <p className="text-muted-foreground">
                          {listing.description}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 py-4 border-y border-border">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Rent Price</p>
                          <p className="text-lg font-semibold text-accent">₹{listing.rent_price}/day</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Pin Code</p>
                          <p className="text-lg font-semibold text-foreground">{listing.pin_code}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Owner ID</p>
                          <p className="text-sm font-mono text-foreground truncate">{listing.owner_user_id}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Transaction ID</p>
                          <p className="text-sm font-mono text-foreground truncate">{listing.payment_transaction}</p>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <Button
                          variant="hero"
                          className="flex-1"
                          onClick={() => handleApprove(listing.id)}
                          disabled={loading === listing.id}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve & Go Live
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1"
                          onClick={() => handleReject(listing.id)}
                          disabled={loading === listing.id}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
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

export default AdminDashboard;
