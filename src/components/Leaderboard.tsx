import { useState } from 'react';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useSectionVisibility } from '@/hooks/useTopProfiles';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Flame, Trophy, Medal } from 'lucide-react';

const Leaderboard = () => {
  const [limit, setLimit] = useState(50);
  const { data: leaderboard, isLoading } = useLeaderboard(limit, 0);
  const { data: visibility } = useSectionVisibility('leaderboard');

  if (!visibility?.is_visible || isLoading) return null;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return null;
    }
  };

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="w-8 h-8 text-primary" />
          <h2 className="text-3xl font-serif font-bold text-foreground">
            Leaderboard
          </h2>
        </div>
        
        <div className="grid gap-4 max-w-4xl mx-auto">
          {leaderboard?.map((user: any) => (
            <Card 
              key={user.id} 
              className="p-4 hover:shadow-card transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 min-w-[60px]">
                  {getRankIcon(user.rank)}
                  {!getRankIcon(user.rank) && (
                    <span className="text-2xl font-bold text-muted-foreground">
                      #{user.rank}
                    </span>
                  )}
                </div>
                
                <Avatar className="w-12 h-12 border-2 border-primary/20">
                  <AvatarImage 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
                    alt={user.name} 
                  />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Longest streak: {user.longest_streak} days
                  </p>
                </div>
                
                <div className="flex items-center gap-2 bg-gradient-primary rounded-full px-4 py-2">
                  <Flame className="w-5 h-5 text-accent" />
                  <span className="text-lg font-bold text-foreground">
                    {user.current_streak}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
        
        {leaderboard && leaderboard.length >= limit && (
          <div className="text-center mt-8">
            <Button 
              onClick={() => setLimit(limit + 50)}
              variant="outline"
              size="lg"
            >
              Load More
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Leaderboard;
