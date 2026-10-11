import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Link } from "react-router-dom";
import { 
  Sparkles, 
  ShieldCheck, 
  Leaf, 
  Coins, 
  Repeat, 
  Users, 
  ArrowRight,
  Camera,
  Wrench,
  Laptop
} from "lucide-react";

const AboutPage = () => {
  return (
    <div className="w-full bg-background text-foreground flex flex-col justify-between min-h-screen">
      <SEOHead 
        title="About Us | AllrentR Peer-to-Peer Rental Marketplace"
        description="Discover AllrentR: India's peer-to-peer rental marketplace revolutionizing how people access tools, cameras, electronics, and lifestyle gear sustainably."
      />
      <Navbar />

      {/* ===== HERO SECTION ===== */}
      <section className="relative pt-28 md:pt-36 pb-16 md:pb-24 overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
              <Sparkles className="w-4 h-4" /> The Sharing Economy Reimagined
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight mb-6">
              Access Over Ownership. <br />
              <span className="bg-gradient-to-r from-[#E5383B] to-[#BA181B] bg-clip-text text-transparent">
                Rent Anything, Anywhere.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
              AllrentR is a modern peer-to-peer rental marketplace built to unlock the value of underutilized assets. We connect equipment owners with creators, DIYers, and smart consumers who need premium gear on demand.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/listings">
                <Button size="lg" className="w-full sm:w-auto px-8 font-semibold shadow-lg shadow-primary/20">
                  Explore Rental Gear <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/submit-listing">
                <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 font-semibold">
                  List Your Items for Rent
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== MISSION & PROBLEM ===== */}
      <section className="py-16 md:py-24 bg-card border-y border-border">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-widest">Our Mission</span>
              <h2 className="text-3xl md:text-4xl font-extrabold mt-2 mb-6">
                Why Buy When You Can Borrow from Your Community?
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Every year, billions of dollars are spent purchasing expensive equipment—cinema cameras, pressure washers, camping tents, and audio setups—that end up used just once or twice before being stored indefinitely.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                At <strong>AllrentR</strong>, we are building a hyper-efficient sharing network where community members monetize idle assets and borrowers save up to 80% compared to purchasing outright.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background border border-border p-6 rounded-2xl text-center shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 text-primary">
                  <Camera className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-1">Cameras & Drones</h3>
                <p className="text-xs text-muted-foreground">High-end video rigs, lenses & stabilizers</p>
              </div>

              <div className="bg-background border border-border p-6 rounded-2xl text-center shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 text-primary">
                  <Wrench className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-1">Tools & DIY</h3>
                <p className="text-xs text-muted-foreground">Power drills, lawn care & heavy tools</p>
              </div>

              <div className="bg-background border border-border p-6 rounded-2xl text-center shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 text-primary">
                  <Laptop className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-1">Electronics</h3>
                <p className="text-xs text-muted-foreground">Projectors, monitors & gaming setups</p>
              </div>

              <div className="bg-background border border-border p-6 rounded-2xl text-center shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 text-primary">
                  <Repeat className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-1">Lifestyle & Events</h3>
                <p className="text-xs text-muted-foreground">Camping, party sound & travel bags</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== THREE CORE PILLARS ===== */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Our Core Values</span>
            <h2 className="text-3xl md:text-4xl font-extrabold mt-2 mb-4">
              Built on Trust, Value & Sustainability
            </h2>
            <p className="text-muted-foreground">
              We design every feature around protecting our members and maximizing real-world value.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card border border-border p-8 rounded-3xl hover:border-primary/40 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <Coins className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Smart Economics</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Renters save substantial money by avoiding retail prices and depreciation, while owners turn idle household assets into dependable recurring income.
              </p>
            </div>

            <div className="bg-card border border-border p-8 rounded-3xl hover:border-primary/40 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Community Safety</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Verified member profiles, transparent user feedback, and clear rental guidelines ensure every handover is conducted with confidence and peace of mind.
              </p>
            </div>

            <div className="bg-card border border-border p-8 rounded-3xl hover:border-primary/40 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                <Leaf className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Eco-Friendly Sharing</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                By multiplying the usage cycle of each manufactured item, we directly lower carbon emissions, reduce manufacturing waste, and champion circular consumption.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section className="py-16 bg-gradient-to-r from-[#161A1D] to-[#660708] text-white">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Join the Sharing Revolution Today
          </h2>
          <p className="text-gray-300 text-lg mb-8 leading-relaxed">
            Whether you want to earn passive income from your gear or find an affordable tool for your next project, AllrentR is your local gateway.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/listings">
              <Button size="lg" className="bg-[#E5383B] hover:bg-[#BA181B] text-white px-8">
                Browse Rental Items
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                Contact Our Team
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
