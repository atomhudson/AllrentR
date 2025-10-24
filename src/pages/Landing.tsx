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
      <section className="relative pt-32 pb-28 overflow-hidden bg-secondary/20">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8 animate-fade-in-up">
              <div className="inline-block animate-slide-up">
                <span className="px-5 py-2.5 rounded-full bg-accent text-accent-foreground font-bold text-xs uppercase tracking-widest shadow-card border-2 border-accent/20">
                  🎯 India's #1 Rental Platform
                </span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-serif font-bold text-foreground leading-[1.05] tracking-tight">
                Rent Anything,
                <br />
                <span className="text-primary">Anytime</span>,
                <br />
                <span className="text-accent">Anywhere</span>
              </h1>
              <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed">
                Transform unused items into steady income. List in 30 seconds, connect with verified renters near you.
              </p>
              <div className="flex flex-wrap gap-5 pt-4">
                <Link to="/signup">
                  <Button variant="luxury" size="xl" className="animate-reveal">
                    Get Started  →
                  </Button>
                </Link>
                <Link to="/listings">
                  <Button variant="outline" size="xl" className="animate-reveal" style={{ animationDelay: '0.1s' }}>
                    Browse Listings
                  </Button>
                </Link>
              </div>
              {/* <div className="flex items-center gap-8 pt-4"> */}
                {/* <div className="text-center">
                  <div className="text-3xl font-bold text-primary">10K+</div>
                  <div className="text-sm text-muted-foreground">Active Users</div>
                </div> */}
                {/* <div className="w-px h-12 bg-border" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent">5K+</div>
                  <div className="text-sm text-muted-foreground">Items Listed</div>
                </div> */}
                {/* <div className="w-px h-12 bg-border" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">15K+</div>
                  <div className="text-sm text-muted-foreground">Rentals</div>
                </div> */}
              {/* </div> */}
            </div>
            <div className="relative animate-scale-in lg:animate-float">
              <div className="absolute -inset-12 bg-primary/5 rounded-3xl" />
              <div className="absolute -inset-6 bg-accent/5 rounded-2xl" />
              <div className="relative rounded-2xl overflow-hidden shadow-luxury border-4 border-white/80">
                <img
                  src={heroImage}
                  alt="P2P Rental Marketplace"
                  className="w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-accent rounded-full opacity-20 blur-3xl animate-pulse-subtle" />
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-primary rounded-full opacity-20 blur-3xl animate-pulse-subtle" style={{ animationDelay: '1s' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Top Profiles Section */}
      <TopProfilesSection />

      {/* Influencer Partners Section */}
      <InfluencerPartnersSection />

      {/* Features Section */}
      <section className="py-28 relative bg-white">
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-20 animate-fade-in max-w-4xl mx-auto">
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-widest mb-4">
              Premium Features
            </span>
            <h2 className="text-4xl lg:text-6xl font-serif font-bold text-foreground mb-6 leading-tight">
              Why Thousands Choose Us for <br /><span className="text-primary">Renting & Earning</span>
            </h2>
            <div className="w-24 h-1.5 bg-accent mx-auto mb-6" />
            <p className="text-xl text-muted-foreground">
              Experience seamless, secure, and rewarding transactions with our premium platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group p-10 hover:shadow-luxury transition-all duration-700 hover:-translate-y-4 bg-card animate-reveal border-2 border-border/30 hover:border-accent/50 relative"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-6 shadow-card group-hover:shadow-elegant group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <feature.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden bg-primary">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, hsl(var(--accent)) 35px, hsl(var(--accent)) 70px)`
        }} />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center space-y-10 animate-fade-in">
            <span className="inline-block px-6 py-3 rounded-full bg-accent text-accent-foreground font-bold text-xs uppercase tracking-widest shadow-luxury border-2 border-accent/30 animate-reveal">
              ✨ Join 10,000+ Happy Users
            </span>
            <h2 className="text-5xl lg:text-7xl font-serif font-bold text-primary-foreground leading-tight animate-slide-up">
              Ready to Start Your<br />Rental Journey?
            </h2>
            <div className="w-32 h-2 bg-accent mx-auto animate-scale-in" />
            <p className="text-xl lg:text-2xl text-primary-foreground/90 max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Join thousands earning from unused items or finding exactly what they need at unbeatable prices.
            </p>
            <div className="flex flex-wrap justify-center gap-6 pt-6">
              <Link to="/signup">
                <Button variant="accent" size="xl" className="shadow-luxury animate-reveal" style={{ animationDelay: '0.3s' }}>
                  Create Free Account →
                </Button>
              </Link>
              <Link to="/submit-listing">
                <Button 
                  variant="secondary" 
                  size="xl"
                  className="bg-white/10 backdrop-blur-sm text-primary-foreground border-2 border-white/30 hover:bg-white hover:text-primary shadow-luxury animate-reveal"
                  style={{ animationDelay: '0.4s' }}
                >
                  List Your First Item
                </Button>
              </Link>
            </div>
            <div className="pt-10 flex flex-wrap justify-center gap-8 text-primary-foreground/80 text-sm font-medium animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">🔒</div>
                <span>100% Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">⚡</div>
                <span>Instant Setup</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">💰</div>
                <span>Zero Listing Fees</span>
              </div>
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
              © 2025 AllRentr. All rights reserved. Made with ❤️ in India.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
