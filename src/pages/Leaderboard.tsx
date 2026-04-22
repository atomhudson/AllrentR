import { useState } from 'react';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { motion } from 'framer-motion';
import { useSectionVisibility } from '@/hooks/useTopProfiles';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Flame, Trophy, Medal } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Navbar } from '@/components/Navbar';

const Leaderboard = () => {
  const [page, setPage] = useState(0);
  const limit = 50;
  const { data: visibility } = useSectionVisibility('leaderboard');
  const { data: leaderboardData, isLoading } = useLeaderboard(limit, page * limit);

  if (!visibility?.is_visible) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-background pt-20">
          <div className="container mx-auto px-4 py-12">
            <p className="text-center text-muted-foreground">
              Leaderboard is currently not available.
            </p>
          </div>
        </div>
      </>
    );
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-700" />;
    return null;
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-serif font-bold text-foreground mb-2">
                🏆 Leaderboard
              </h1>
              <p className="text-muted-foreground">
                Top users ranked by their activity streaks
              </p>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[...Array(10)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-5 w-32 mb-2" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <Skeleton className="h-8 w-16" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {leaderboardData?.data.map((user, index) => (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      key={user.id || index}
                    >
                      <Card 
                        className={`overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                          user.rank <= 3 ? 'border-primary/50 bg-primary/5' : 'hover:border-primary/30'
                        }`}
                      >
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex items-center gap-3 sm:gap-6">
                            <div className="flex items-center gap-2 sm:gap-4 min-w-[100px] sm:min-w-[140px]">
                              <div className="w-8 sm:w-12 text-center">
                                {getRankIcon(user.rank) || (
                                  <span className="text-xl sm:text-2xl font-black text-muted-foreground/40">
                                    #{user.rank}
                                  </span>
                                )}
                              </div>
                              <div className="relative p-1 rounded-full bg-gradient-to-br from-[#E5383B] via-[#BA181B] to-[#660708]">
                                <Avatar className="w-12 h-12 sm:w-16 sm:h-16 border-2 border-white dark:border-gray-900">
                                  <AvatarImage 
                                    src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
                                    alt={user.name || 'User'} 
                                  />
                                  <AvatarFallback className="bg-muted text-lg">
                                    {(user.name || 'U').charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                              </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="text-base sm:text-lg font-bold text-foreground truncate">
                                {user.name || 'Anonymous User'}
                              </h3>
                              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                                <span className="inline-block w-2 h-2 rounded-full bg-primary/40"></span>
                                Longest streak: <span className="font-semibold text-foreground">{user.longest_streak || 0} days</span>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-1">
                              <div className="flex items-center gap-1.5 sm:gap-2 bg-gradient-primary rounded-xl px-3 sm:px-5 py-1.5 sm:py-2.5 shadow-lg shadow-primary/20">
                                <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-pulse" fill="white" />
                                <span className="text-lg sm:text-2xl font-black text-white">
                                  {user.current_streak || 0}
                                </span>
                              </div>
                              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                Current Streak
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {leaderboardData && leaderboardData.data.length < leaderboardData.total && (
                  <div className="flex justify-center mt-12 mb-8">
                    <Button
                      onClick={() => setPage(page + 1)}
                      variant="outline"
                      size="lg"
                      className="px-12 py-6 rounded-2xl border-2 hover:bg-primary hover:text-white transition-all duration-300 font-bold text-lg hover:scale-105"
                      disabled={isLoading}
                    >
                      {isLoading ? "Loading..." : "View More Legends"}
                    </Button>
                  </div>
                )}
                
                {leaderboardData && leaderboardData.data.length >= leaderboardData.total && leaderboardData.total > 0 && (
                  <p className="text-center text-muted-foreground mt-12 mb-8 font-medium italic">
                    You've reached the end of the legends. Start your streak to join them!
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Leaderboard;
