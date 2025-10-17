import { useState } from 'react';
import { useSectionVisibility } from '@/hooks/useTopProfiles';
import { syncTopProfiles } from '@/hooks/useLeaderboard';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LeaderboardManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: visibility, refetch } = useSectionVisibility('leaderboard');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleVisibilityToggle = async (checked: boolean) => {
    if (!user) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('section_visibility')
        .update({
          is_visible: checked,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('section_name', 'leaderboard');

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Leaderboard ${checked ? 'shown' : 'hidden'} successfully`,
      });
      
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update visibility',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncTopProfiles();
      toast({
        title: 'Success',
        description: 'Top 10 profiles synced with leaderboard',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sync profiles',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => navigate('/admin')}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Admin Dashboard
      </Button>

      <h1 className="text-3xl font-bold mb-6">Leaderboard Management</h1>

      <div className="grid gap-6 max-w-2xl">
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="visibility" className="text-base font-semibold">
                  Show Leaderboard Section
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Control whether the leaderboard is visible on the homepage
                </p>
              </div>
              <Switch
                id="visibility"
                checked={visibility?.is_visible || false}
                onCheckedChange={handleVisibilityToggle}
                disabled={isUpdating}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Sync Top Profiles</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Manually sync the top 10 profiles section with the current leaderboard rankings.
                This happens automatically when users log in, but you can also trigger it manually.
              </p>
              <Button
                onClick={handleSync}
                disabled={isSyncing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-muted">
          <h3 className="text-lg font-semibold mb-2">How It Works</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Users build streaks by logging in daily</li>
            <li>• Missing a day resets their streak to 0</li>
            <li>• The leaderboard shows all users ranked by their current streak</li>
            <li>• Top 10 profiles are automatically synced from the leaderboard</li>
            <li>• Users can see their rank and streak on their profile</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default LeaderboardManagement;
