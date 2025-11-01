import { useInfluencerPartners } from "@/hooks/useInfluencerPartners";
import { useSectionVisibility } from "@/hooks/useTopProfiles";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { ExternalLink, Star} from "lucide-react";
import image from '@/assets/image.svg';
import image2 from '@/assets/image2.svg';
import image3 from '@/assets/image2.svg';

const InfluencerPartnersSection = () => {
  const { data: partners, isLoading } = useInfluencerPartners();
  const { data: visibility } = useSectionVisibility("influencer_partners");
  if (!visibility?.is_visible || isLoading || !partners?.length) return null;
  return (
    <section className="relative py-32 overflow-hidden bg-gradient-to-b from-white via-[#F5F3F4] to-white">
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#E5383B]/20 rounded-full blur-[120px] animate-pulse-slow" />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#BA181B]/20 rounded-full blur-[120px] animate-pulse-slow"
          style={{ animationDelay: "1.5s" }}
        />
      </div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-20 h-20 border-2 border-[#E5383B]/20 rotate-45 animate-float" />
        <div
          className="absolute bottom-32 left-1/3 w-12 h-12 border-2 border-[#660708]/20 animate-float"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-40 right-20 w-16 h-16 bg-[#BA181B]/10 rounded-full animate-float"
          style={{ animationDelay: "0.5s" }}
        />
        <div
          className="absolute bottom-10 right-1/3 w-10 h-10 border-2 border-[#E5383B]/30 rounded-full animate-float"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/3 left-[10%] w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[35px] border-b-[#A4161A]/30 animate-float-slow"
          style={{ animationDelay: "2.5s" }}
        />
        <div
          className="absolute bottom-20 left-[15%] w-16 h-16 bg-[#E5383B]/10 clip-hexagon rotate-12 animate-float"
          style={{ animationDelay: "3s" }}
        />
        <div
          className="absolute top-10 right-[35%] w-24 h-[2px] bg-gradient-to-r from-[#E5383B]/30 to-[#BA181B]/30 rotate-[25deg] animate-float-slow"
          style={{ animationDelay: "1s" }}
        />
        <div className="absolute bottom-[15%] right-[15%] w-24 h-24 border-4 border-[#B1A7A6]/30 rounded-full animate-spin-slow" />
        <div
          className="absolute top-[25%] left-[40%] w-10 h-10 bg-[#D3D3D3]/30 rounded-md rotate-45 animate-float"
          style={{ animationDelay: "3.5s" }}
        />
        <div
          className="absolute top-[70%] left-[60%] w-12 h-12 border-2 border-[#BA181B]/30 rounded-lg animate-float-slow"
          style={{ animationDelay: "4s" }}
        />
        <div
          className="absolute top-[15%] right-[10%] w-8 h-8 bg-gradient-to-br from-[#E5383B]/30 to-[#BA181B]/30 rounded-full animate-float"
          style={{ animationDelay: "1.8s" }}
        />
        <div
          className="absolute bottom-[10%] left-[50%] w-24 h-24 bg-[#660708]/10 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: "3s" }}
        />
        <div
          className="absolute bottom-[25%] right-[5%] w-20 h-20 border-[3px] border-[#A4161A]/20 rotate-[30deg] animate-float-slow"
          style={{ animationDelay: "2.8s" }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-20 space-y-6">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-full shadow-lg border-2 border-[#E5383B]/10 animate-fade-in">
            <div className="relative">
              <Star className="w-5 h-5 text-[#E5383B] fill-[#E5383B]" />
              <div className="absolute inset-0 animate-ping">
                <Star className="w-5 h-5 text-[#E5383B] fill-[#E5383B] opacity-75" />
              </div>
            </div>
            <span className="text-sm font-bold tracking-wide text-[#660708] uppercase">
              Verified Creator Network
            </span>
          </div>

          <h2 className="text-6xl md:text-7xl font-black tracking-tight animate-fade-in-up">
            <span className="text-[#161A1D]">Meet Our</span>
            <br />
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-[#E5383B] via-[#BA181B] to-[#660708] bg-clip-text text-transparent">
                Elite Creators
              </span>
              <div className="absolute -bottom-4 left-0 right-0 h-2 bg-gradient-to-r from-[#E5383B] via-[#BA181B] to-[#660708] rounded-full transform -skew-x-12" />
            </span>
          </h2>

          <p
            className="text-xl text-[#161A1D]/70 max-w-2xl mx-auto leading-relaxed animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            Collaborate with top-tier influencers who are shaping the future of
            digital commerce
          </p>
        </div>

        <ScrollArea className="w-full">
          <div className="flex gap-8 pb-12 pt-4">
            {partners.map((partner, index) => (
              <Card
                key={partner.id}
                onClick={() =>
                  partner.profile_url &&
                  window.open(partner.profile_url, "_blank")
                }
                className="relative flex-shrink-0 w-[700px] h-[380px] rounded-2xl overflow-hidden cursor-pointer bg-[#161A1D] text-white group transition-all duration-500 hover:shadow-[0_0_40px_rgba(229,56,59,0.25)]"
              >
                {/* Background Decorations */}
                <img
                  src={image3}
                  alt="design element"
                  className="absolute top-1/4 left-10 w-32 opacity-90"
                />
                <img
                  src={image2}
                  alt="design element"
                  className="absolute top-8 right-8 w-16 opacity-70"
                />
                <img
                  src={image}
                  alt="design element"
                  className="absolute bottom-6 right-16 w-24 opacity-50"
                />

                {/* Content Layout */}
                <div className="relative z-10 flex items-center justify-between h-full px-14">
                  {/* Left Text Section */}
                  <div className="flex flex-col justify-between h-full py-10">
                    <div>
                      <h1 className="text-[48px] font-light tracking-widest text-[#F5F3F4] leading-tight">
                        {partner.name.toUpperCase()}
                      </h1>
                    </div>

                    <div>
                      <p className="font-bold text-[20px] text-[#BA181B]/90 mb-1">
                        INFLUENCER WITH{" "}
                        <span className="font-bold text-[#F5F3F4]">
                          {partner.followers_count >= 1000000
                            ? `${(partner.followers_count / 1000000).toFixed(
                                1
                              )}M`
                            : partner.followers_count >= 1000
                            ? `${(partner.followers_count / 1000).toFixed(1)}K`
                            : partner.followers_count}
                        </span>{" "}
                        FOLLOWERS
                      </p>
                      <p className="text-[22px] font-bold text-[#BA181B]/90 tracking-wide">
                        TOP CREATOR
                      </p>
                    </div>

                    <div className="mt-8">
                      <p className="text-sm text-[#F5F3F4]/70 leading-tight">
                        JOIN THE JOURNEY
                      </p>
                      <p className="text-sm font-semibold text-[#F5F3F4]/90">
                        @{partner.platform || "REALLYGREATSITE"}
                      </p>
                    </div>
                  </div>

                  {/* Right Profile Section */}
                  <div className="relative">
                    <div className="w-40 h-40 rounded-full overflow-hidden border-[3px] border-[#E5383B] shadow-[0_0_30px_rgba(229,56,59,0.25)]">
                      <Avatar className="w-full h-full">
                        <AvatarImage
                          src={partner.avatar_url}
                          alt={partner.name}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-[#E5383B] text-white text-3xl font-bold">
                          {partner.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="h-2 bg-[#E5383B]/10" />
        </ScrollArea>

        {/* Bottom CTA */}
        <div
          className="text-center mt-16 animate-fade-in-up"
          style={{ animationDelay: "0.3s" }}
        >
          <p className="text-[#161A1D]/60 text-lg mb-6">
            Want to become a featured creator?
          </p>
          <button className="group relative px-8 py-4 bg-gradient-to-r from-[#E5383B] via-[#BA181B] to-[#660708] text-white font-bold rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
            <span className="relative z-10 flex items-center gap-2">
              Join Our Network
              <ExternalLink className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#660708] via-[#BA181B] to-[#E5383B] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }

        @keyframes float-slow {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(-5deg);
          }
        }

        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.4;
          }
          50% {
            opacity: 0.6;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes float-slow {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }

          50% {
            transform: translateY(-15px) rotate(6deg);
          }
        }
        .clip-hexagon {
          clip-path: polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%);
        }

        .animate-float-slow {
          animation: float-slow 10s ease-in-out infinite;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }

        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }

        .clip-hexagon {
          clip-path: polygon(25% 5%, 75% 5%, 100% 50%, 75% 95%, 25% 95%, 0% 50%);
        }
      `}</style>
    </section>
  );
};
export default InfluencerPartnersSection;
