import { useTopProfiles, useSectionVisibility } from '@/hooks/useTopProfiles';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Flame } from 'lucide-react';

const TopProfilesSection = () => {
  const { data: profiles, isLoading } = useTopProfiles();
  const { data: visibility } = useSectionVisibility('top_profiles');

  if (!visibility?.is_visible || isLoading || !profiles?.length) return null;

  return (
    <section className="py-16 bg-gradient-to-br from-secondary/30 via-background to-accent/5 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--accent)/0.05),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,hsl(var(--primary)/0.05),transparent_50%)]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-10 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-serif font-bold bg-gradient-primary bg-clip-text text-transparent mb-3">
            Top 10 Profiles 🔥
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">
            Meet our most active community members
          </p>
        </div>
        
        <ScrollArea className="w-full">
          <div className="flex gap-6 md:gap-8 pb-6">
            {profiles.map((profile, index) => (
              <div
                key={profile.id}
                className="group flex flex-col items-center gap-3 min-w-[140px] animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative">
                  {/* Gradient glow effect */}
                  <div className="absolute inset-0 bg-gradient-primary rounded-full blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
                  
                  {/* Avatar with enhanced border */}
                  <div className="relative p-1 bg-gradient-primary rounded-full shadow-elegant group-hover:shadow-glow transition-all duration-300 group-hover:scale-110">
                    <Avatar className="w-24 h-24 border-4 border-background">
                      <AvatarImage src={profile.avatar_url} alt={profile.name} />
                      <AvatarFallback className="text-xl font-bold bg-gradient-accent">
                        {profile.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  {/* Streak badge */}
                  {profile.streak > 0 && (
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-accent rounded-full p-1 shadow-elegant animate-pulse">
                      <div className="flex items-center gap-1 px-3 py-1 bg-card rounded-full border border-accent/20">
                        <Flame className="w-4 h-4 text-accent drop-shadow-glow" />
                        <span className="text-sm font-bold text-foreground">
                          {profile.streak}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Rank badge for top 3 */}
                  {index < 3 && (
                    <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center shadow-card border-2 border-background">
                      <span className="text-xs font-bold text-primary-foreground">
                        #{index + 1}
                      </span>
                    </div>
                  )}
                </div>
                
                <span className="text-sm font-semibold text-foreground text-center group-hover:text-primary transition-colors">
                  {profile.name}
                </span>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="h-2" />
        </ScrollArea>
      </div>
    </section>
  );
};

export default TopProfilesSection;
