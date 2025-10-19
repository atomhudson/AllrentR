import { useInfluencerPartners } from '@/hooks/useInfluencerPartners';
import { useSectionVisibility } from '@/hooks/useTopProfiles';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';

const InfluencerPartnersSection = () => {
  const { data: partners, isLoading } = useInfluencerPartners();
  const { data: visibility } = useSectionVisibility('influencer_partners');

  if (!visibility?.is_visible || isLoading || !partners?.length) return null;

  return (
    <section className="py-16 bg-gradient-to-br from-primary/5 via-background to-accent/10 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,hsl(var(--accent)/0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,hsl(var(--primary)/0.08),transparent_50%)]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-10 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-serif font-bold bg-gradient-primary bg-clip-text text-transparent mb-3">
            Partner with Influencers 🤝
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">
            Collaborate with our verified influencer partners
          </p>
        </div>
        
        <ScrollArea className="w-full">
          <div className="flex gap-6 md:gap-8 pb-6">
            {partners.map((partner, index) => (
              <Card
                key={partner.id}
                className="group relative flex flex-col items-center gap-4 p-6 min-w-[240px] hover:shadow-elegant transition-all duration-300 cursor-pointer border-2 hover:border-primary/30 bg-card/80 backdrop-blur-sm animate-scale-in overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => partner.profile_url && window.open(partner.profile_url, '_blank')}
              >
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
                
                {/* Profile section */}
                <div className="relative z-10 flex flex-col items-center gap-3">
                  <div className="relative">
                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 bg-accent rounded-full blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
                    
                    <div className="relative p-1 bg-gradient-to-br from-primary to-accent rounded-full group-hover:scale-110 transition-transform duration-300">
                      <Avatar className="w-20 h-20 border-4 border-background">
                        <AvatarImage src={partner.avatar_url} alt={partner.name} />
                        <AvatarFallback className="text-lg font-bold bg-gradient-accent">
                          {partner.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    
                    {/* Verified badge */}
                    <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-accent rounded-full flex items-center justify-center shadow-card border-2 border-background">
                      <span className="text-xs">✓</span>
                    </div>
                  </div>
                  
                  <div className="text-center flex-1 space-y-2">
                    <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                      {partner.name}
                    </h3>
                    
                    {partner.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {partner.bio}
                      </p>
                    )}
                    
                    {/* Platform and followers */}
                    <div className="flex flex-col gap-2 pt-2">
                      <div className="inline-flex items-center justify-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
                        <span className="text-xs font-semibold text-primary">
                          {partner.platform}
                        </span>
                      </div>
                      
                      {partner.followers_count && (
                        <div className="flex items-center justify-center gap-1">
                          <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                          <span className="text-sm font-medium text-foreground">
                            {partner.followers_count >= 1000000
                              ? `${(partner.followers_count / 1000000).toFixed(1)}M`
                              : partner.followers_count >= 1000
                              ? `${(partner.followers_count / 1000).toFixed(1)}K`
                              : partner.followers_count}
                          </span>
                          <span className="text-xs text-muted-foreground">followers</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* External link icon */}
                {partner.profile_url && (
                  <div className="absolute top-4 right-4 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary group-hover:rotate-45 transition-all duration-300">
                    <ExternalLink className="w-4 h-4 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                )}
              </Card>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="h-2" />
        </ScrollArea>
      </div>
    </section>
  );
};

export default InfluencerPartnersSection;
