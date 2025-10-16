import { useTopProfiles, useSectionVisibility } from '@/hooks/useTopProfiles';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Flame } from 'lucide-react';

const TopProfilesSection = () => {
  const { data: profiles, isLoading } = useTopProfiles();
  const { data: visibility } = useSectionVisibility('top_profiles');

  if (!visibility?.is_visible || isLoading || !profiles?.length) return null;

  return (
    <section className="py-12 bg-secondary/20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-serif font-bold text-foreground mb-6">
          Top 10 Profiles 🔥
        </h2>
        <ScrollArea className="w-full">
          <div className="flex gap-6 pb-4">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="flex flex-col items-center gap-2 min-w-[120px]"
              >
                <div className="relative">
                  <Avatar className="w-20 h-20 border-4 border-gradient-primary">
                    <AvatarImage src={profile.avatar_url} alt={profile.name} />
                    <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {profile.streak > 0 && (
                    <div className="absolute -bottom-1 -right-1 bg-gradient-primary rounded-full p-1 shadow-card">
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-card rounded-full">
                        <Flame className="w-3 h-3 text-accent" />
                        <span className="text-xs font-bold text-foreground">
                          {profile.streak}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <span className="text-sm font-medium text-foreground text-center">
                  {profile.name}
                </span>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </section>
  );
};

export default TopProfilesSection;
