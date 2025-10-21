import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { Shield, Zap, Users, TrendingUp } from 'lucide-react';
import heroImage from '@/assets/hero-image.jpg';
import { AdPopup } from '@/components/AdPopup';
import TopProfilesSection from '@/components/TopProfilesSection';
import InfluencerPartnersSection from '@/components/InfluencerPartnersSection';
import { FaYoutube, FaInstagram, FaFacebookF, FaTwitter } from "react-icons/fa";

const Landing = () => {
  const features = [
    {
      icon: Shield,
      title: 'Secure & Verified',
      description: 'All listings are verified by our team before going live. Your safety is our priority.',
    },
    {
      icon: Zap,
      title: 'Quick & Easy',
      description: 'List your items in minutes and start earning. Renting is just as simple!',
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Join thousands of Indians sharing and renting items in their neighborhood.',
    },
    {
      icon: TrendingUp,
      title: 'Earn More',
      description: 'Turn your unused items into income. Track your earnings with detailed analytics.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <AdPopup />
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-overlay" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(215_45%_25%_/_0.03),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,hsl(38_70%_55%_/_0.05),transparent_50%)]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 animate-fade-in-up">
              <div className="inline-block">
                <span className="px-4 py-2 rounded-full bg-accent/10 text-accent font-semibold text-sm tracking-wide border border-accent/20">
                  🎯 India's Most Trusted Rental Platform
                </span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-serif font-bold text-foreground leading-[1.1] tracking-tight">
                Rent Anything,
                <br />
                <span className="text-primary">Anytime</span>,
                <br />
                <span className="bg-gradient-accent bg-clip-text text-transparent">Anywhere</span>
              </h1>
              <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed font-light">
                Transform your unused items into steady income. List in 30 seconds, connect with verified renters nearby.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link to="/signup">
                  <Button variant="premium" size="xl">
                    Get Started Free →
                  </Button>
                </Link>
                <Link to="/listings">
                  <Button variant="outline" size="xl">
                    Browse Listings
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-8 pt-6 border-t border-border/50">
                <div className="text-center">
                  <div className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">10K+</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Active Users</div>
                </div>
                <div className="w-px h-16 bg-gradient-to-b from-transparent via-border to-transparent" />
                <div className="text-center">
                  <div className="text-4xl font-bold bg-gradient-accent bg-clip-text text-transparent">5K+</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Items Listed</div>
                </div>
                <div className="w-px h-16 bg-gradient-to-b from-transparent via-border to-transparent" />
                <div className="text-center">
                  <div className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">15K+</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Rentals</div>
                </div>
              </div>
            </div>
            <div className="relative animate-scale-in">
              <div className="absolute -inset-8 bg-gradient-primary opacity-15 blur-3xl rounded-full animate-pulse" />
              <div className="absolute -inset-4 bg-gradient-accent opacity-10 blur-2xl rounded-full" />
              <div className="relative rounded-2xl overflow-hidden shadow-elegant border-4 border-white/50">
                <img
                  src={heroImage}
                  alt="P2P Rental Marketplace"
                  className="w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Profiles Section */}
      <TopProfilesSection />

      {/* Influencer Partners Section */}
      <InfluencerPartnersSection />

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/40 to-background" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-20 animate-fade-in max-w-3xl mx-auto">
            <span className="text-accent font-semibold tracking-wider uppercase text-sm mb-3 block">
              Premium Features
            </span>
            <h2 className="text-4xl lg:text-5xl font-serif font-bold text-foreground mb-6 leading-tight">
              Why Thousands Choose Us for <span className="text-primary">Renting & Earning</span>
            </h2>
            <p className="text-xl text-muted-foreground font-light">
              Experience seamless, secure, and rewarding transactions with our platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group p-8 hover:shadow-elegant transition-all duration-500 hover:-translate-y-3 bg-card animate-fade-in-up border border-border/50 hover:border-primary/30 relative overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-primary opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500" />
                <div className="relative">
                  <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center mb-6 shadow-card group-hover:shadow-glow group-hover:scale-110 transition-all duration-300">
                    <feature.icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-95" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
            <span className="inline-block px-4 py-2 rounded-full bg-white/10 text-primary-foreground font-semibold text-sm tracking-wide border border-white/20 backdrop-blur-sm">
              ✨ Join Our Growing Community
            </span>
            <h2 className="text-4xl lg:text-6xl font-serif font-bold text-primary-foreground leading-tight">
              Ready to Start Your <br />Rental Journey?
            </h2>
            <p className="text-xl lg:text-2xl text-primary-foreground/90 max-w-2xl mx-auto font-light">
              Join thousands earning from unused items or finding exactly what they need at affordable prices.
            </p>
            <div className="flex flex-wrap justify-center gap-5 pt-4">
              <Link to="/signup">
                <Button variant="accent" size="xl" className="shadow-2xl">
                  Create Free Account
                </Button>
              </Link>
              <Link to="/submit-listing">
                <Button 
                  variant="outline" 
                  size="xl"
                  className="bg-white/10 backdrop-blur-sm text-primary-foreground border-white/30 hover:bg-white hover:text-primary shadow-xl"
                >
                  List Your First Item →
                </Button>
              </Link>
            </div>
            <div className="pt-8 text-primary-foreground/70 text-sm">
              🔒 100% Secure • ⚡ Instant Setup • 💰 Zero Listing Fees
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-muted/30 to-background border-t border-border/50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div>
              <h3 className="text-xl font-serif font-bold text-primary mb-4">AllRentr</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
               AllRentr is a peer-to-peer rental platform in India where users can rent household items, camera gear, bikes, tools, furniture and more at affordable prices.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/listings" className="hover:text-primary transition-colors">Browse Listings</Link></li>
                <li><Link to="/submit-listing" className="hover:text-primary transition-colors">List Your Item</Link></li>
                <li><Link to="/leaderboard" className="hover:text-primary transition-colors">Leaderboard</Link></li>
                <li><Link to="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Refund Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Community Guidelines</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-foreground mb-4">Contact Us</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="text-primary">📧</span>
                  <a href="mailto:support@rentkaro.com" className="hover:text-primary transition-colors">
                    allrentr15@gmail.com
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">📞</span>
                  <a href="tel:+917906744723" className="hover:text-primary transition-colors">
                    +91 79067 44723
                  </a>
                </li>
                {/* <li className="flex items-center gap-2">
                  <span className="text-primary">📍</span>
                  <span>Mumbai, Maharashtra, India</span>
                </li> */}
               <li className="flex gap-3 mt-4 text-xl">
  <a href="https://youtube.com/@allrentr?si=Su67ymW9sOrkSygF" className="hover:text-primary transition-colors">
    <FaYoutube />
  </a>
  <a href="https://www.instagram.com/allrentr/" className="hover:text-primary transition-colors">
    <FaInstagram />
  </a>
  <a href="https://www.facebook.com/profile.php?id=61581953741666" className="hover:text-primary transition-colors">
    <FaFacebookF />
  </a>
  <a href="https://x.com/heyrenter86" className="hover:text-primary transition-colors">
    <FaTwitter />
  </a>
</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border pt-6 text-center">
            <p className="text-sm text-muted-foreground">
              © 2025 RentKaro. All rights reserved. Made with ❤️ in India.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
