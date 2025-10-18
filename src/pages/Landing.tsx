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
                Rent where,
                <span className="text-primary"> Anytime</span>,
                <span className="text-accent"> Anywhere</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                India's most trusted P2P rental marketplace. List your unused items or rent what you need from verified owners in your neighborhood.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/signup">
                  <Button variant="hero" size="lg" className="text-lg px-8">
                    Get Started Free
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
      <footer className="bg-gradient-to-b from-background to-primary/5 border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-serif font-bold text-primary mb-4">RentKaro</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                India's most trusted P2P rental marketplace. Empowering the sharing economy.
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
                    support@rentkaro.com
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">📞</span>
                  <a href="tel:+919876543210" className="hover:text-primary transition-colors">
                    +91 98765 43210
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">📍</span>
                  <span>Mumbai, Maharashtra, India</span>
                </li>
                <li className="flex gap-3 mt-4">
                  <a href="#" className="hover:text-primary transition-colors text-xl">📘</a>
                  <a href="#" className="hover:text-primary transition-colors text-xl">📷</a>
                  <a href="#" className="hover:text-primary transition-colors text-xl">🐦</a>
                  <a href="#" className="hover:text-primary transition-colors text-xl">💼</a>
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
