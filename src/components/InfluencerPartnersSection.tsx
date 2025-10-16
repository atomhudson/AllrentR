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
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-serif font-bold text-foreground mb-6">
          Partner with Influencers 🤝
        </h2>
        <ScrollArea className="w-full">
          <div className="flex gap-6 pb-4">
            {partners.map((partner) => (
              <Card
                key={partner.id}
                className="flex flex-col items-center gap-3 p-4 min-w-[200px] hover:shadow-card transition-shadow cursor-pointer"
                onClick={() => partner.profile_url && window.open(partner.profile_url, '_blank')}
              >
                <Avatar className="w-16 h-16">
                  <AvatarImage src={partner.avatar_url} alt={partner.name} />
                  <AvatarFallback>{partner.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="text-center flex-1">
                  <h3 className="font-semibold text-foreground">{partner.name}</h3>
                  {partner.bio && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {partner.bio}
                    </p>
                  )}
                  <div className="flex items-center gap-2 justify-center mt-2">
                    <span className="text-xs font-medium text-primary">
                      {partner.platform}
                    </span>
                    {partner.followers_count && (
                      <span className="text-xs text-muted-foreground">
                        {partner.followers_count >= 1000
                          ? `${(partner.followers_count / 1000).toFixed(1)}K`
                          : partner.followers_count}{' '}
                        followers
                      </span>
                    )}
                  </div>
                </div>
                {partner.profile_url && (
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                )}
              </Card>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </section>
  );
};

export default InfluencerPartnersSection;
