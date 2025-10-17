import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { Shield, Zap, Users, TrendingUp } from 'lucide-react';
import heroImage from '@/assets/hero-image.jpg';
import { AdPopup } from '@/components/AdPopup';
import TopProfilesSection from '@/components/TopProfilesSection';
import InfluencerPartnersSection from '@/components/InfluencerPartnersSection';

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
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in-up">
              <h1 className="text-5xl lg:text-6xl font-serif font-bold text-foreground leading-tight">
                Rent Anything,
                <span className="text-primary"> Earn  From</span>,
                <span className="text-accent"> Everything</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                India's most trusted P2P rental marketplace. List your unused items or rent what you need from verified owners in your neighborhood.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/signup">
                  <Button variant="hero" size="lg" className="text-lg px-8">
                    Get Started For Free
                  </Button>
                </Link>
                <Link to="/listings">
                  <Button variant="outline" size="lg" className="text-lg px-8">
                    Browse Listings
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">10K+</div>
                  <div className="text-sm text-muted-foreground">Active Users</div>
                </div>
                <div className="w-px h-12 bg-border" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent">5K+</div>
                  <div className="text-sm text-muted-foreground">Items Listed</div>
                </div>
                <div className="w-px h-12 bg-border" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">15K+</div>
                  <div className="text-sm text-muted-foreground">Rentals</div>
                </div>
              </div>
            </div>
            <div className="relative animate-scale-in">
              <div className="absolute -inset-4 bg-gradient-primary opacity-20 blur-3xl rounded-full" />
              <img
                src={heroImage}
                alt="P2P Rental Marketplace"
                className="relative rounded-2xl shadow-elegant w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Top Profiles Section */}
      <TopProfilesSection />

      {/* Influencer Partners Section */}
      <InfluencerPartnersSection />

      {/* Features Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-serif font-bold text-foreground mb-4">
              Why Choose RentKaro?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We make renting and lending simple, secure, and rewarding for everyone.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-card transition-all duration-300 hover:-translate-y-2 bg-card animate-fade-in-up border-border"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4 shadow-card">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8 animate-fade-in">
            <h2 className="text-4xl lg:text-5xl font-serif font-bold text-foreground">
              Ready to Start Renting?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of Indians earning from their unused items or finding what they need at affordable prices.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/signup">
                <Button variant="hero" size="lg" className="text-lg px-10">
                  Create Free Account
                </Button>
              </Link>
              <Link to="/submit-listing">
                <Button variant="accent" size="lg" className="text-lg px-10">
                  List Your First Item
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm opacity-90">
            © 2025 RentKaro. Empowering India's sharing economy.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
