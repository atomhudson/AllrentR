import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";
import {
  Shield,
  Zap,
  Users,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Check,
  DollarSign,
  Star,
} from "lucide-react";
import { FaYoutube, FaInstagram, FaFacebookF, FaTwitter } from "react-icons/fa";
import Footer from "@/components/Footer";
import TopProfilesSection from "@/components/TopProfilesSection";
import InfluencerPartnersSection from "@/components/InfluencerPartnersSection";
import heroImage from "@/assets/hero-image.jpg";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import HowItWorks from "@/components/HowItWorks";

const Landing = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: "Secure & Verified",
      description:
        "All listings are verified by our team before going live. Your safety is our priority.",
    },
    {
      icon: Zap,
      title: "Quick & Easy",
      description:
        "List your items in minutes and start earning. Renting is just as simple!",
    },
    {
      icon: Users,
      title: "Community Driven",
      description:
        "Join thousands of Indians sharing and renting items in their neighborhood.",
    },
    {
      icon: TrendingUp,
      title: "Earn More",
      description:
        "Turn your unused items into income. Track your earnings with detailed analytics.",
    },
  ];

  const benefits = [
    "Zero listing fees",
    "Instant verification",
    "Secure payments",
    "24/7 support",
  ];

  return (
    <div className="min-h-screen bg-[#F5F3F4] overflow-hidden">
      <Navbar />

      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#E5383B] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-[#BA181B] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-[#660708] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 md:pt-32 pb-12 md:pb-24">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center">
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#E5383B]/10 to-[#BA181B]/10 rounded-full border border-[#E5383B]/20 backdrop-blur-sm animate-fade-in">
                <Sparkles className="w-4 h-4 text-[#E5383B]" />
                <span className="text-sm font-medium text-[#660708]">
                  🎯 India's #1 Rental Platform
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-[#161A1D] leading-tight animate-fade-in-up">
                Rent Anything,
                <br />
                <span className="bg-gradient-to-r from-[#E5383B] to-[#BA181B] bg-clip-text text-transparent">
                  Anytime
                </span>
                ,<br />
                <span className="bg-gradient-to-r from-[#660708] to-[#A4161A] bg-clip-text text-transparent">
                  Anywhere
                </span>
              </h1>

              <p
                className="text-base md:text-lg lg:text-xl text-[#161A1D]/80 leading-relaxed animate-fade-in-up"
                style={{ animationDelay: "0.1s" }}
              >
                Transform unused items into steady income. List in 30 seconds,
                connect with verified renters near you.
              </p>

              {/* Benefits List */}
              {/* <div
                className="grid grid-cols-2 gap-3 animate-fade-in-up"
                style={{ animationDelay: "0.2s" }}
              >
                {benefits.map((benefit, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#E5383B] to-[#BA181B] flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-[#F5F3F4]" />
                    </div>
                    <span className="text-sm font-medium text-[#161A1D]">
                      {benefit}
                    </span>
                  </div>
                ))}
              </div> */}

              <div
                className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4 animate-fade-in-up"
                style={{ animationDelay: "0.3s" }}
              >
                <Button
                  className="text-base md:text-lg px-6 md:px-8 py-4 md:py-6 bg-gradient-to-r from-[#E5383B] to-[#BA181B] text-[#F5F3F4] hover:shadow-2xl hover:shadow-[#E5383B]/50 transition-all duration-300 hover:scale-105 border-0 group"
                  size="lg"
                  onClick={() => navigate(user ? "/listings" : "/signup")}
                >
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  className="text-base md:text-lg px-6 md:px-8 py-4 md:py-6 bg-[#F5F3F4] border-2 border-[#E5383B] text-[#660708] hover:bg-[#E5383B] hover:text-[#F5F3F4] transition-all duration-300 hover:scale-105"
                  size="lg"
                  onClick={() => navigate("/listings")}
                >
                  Browse Listings
                </Button>
              </div>
            </div>

            {/* Hero Image with Floating Effect */}
            <div className="relative animate-float mt-8 lg:mt-0">
              <div className="absolute -inset-4 md:-inset-8 bg-gradient-to-r from-[#E5383B] to-[#BA181B] opacity-30 blur-3xl rounded-full animate-pulse-slow" />
              <div className="relative rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border-2 md:border-4 border-[#F5F3F4] transform hover:scale-105 transition-all duration-500 bg-gradient-to-br from-[#B1A7A6] to-[#D3D3D3]">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#E5383B]/20 to-transparent" />
                <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] flex items-center justify-center">
                  <img
                    src={heroImage}
                    alt="AllRentr Hero"
                    className="w-full h-full object-cover rounded-3xl shadow-2xl border-4 border-[#F5F3F4] transform hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#E5383B]/20 to-transparent rounded-3xl" />

                  {/* Optional text overlay if you still want text on top of the image */}
                  {/* <div className="absolute bottom-8 left-8 text-left space-y-2">
                    <h3 className="text-3xl font-bold text-[#F5F3F4] drop-shadow-lg">
                      Rent Smarter, Earn Faster
                    </h3>
                    <p className="text-[#F5F3F4]/80 drop-shadow-lg">
                      Thousands of verified listings. Start today!
                    </p>
                  </div> */}
                </div>
              </div>
              {/* Floating Badge */}
              <div className="absolute -bottom-4 md:-bottom-6 -right-4 md:-right-6 bg-[#F5F3F4] rounded-xl md:rounded-2xl shadow-2xl p-3 md:p-6 border-2 border-[#E5383B]/20 animate-bounce-slow">
                <div className="text-xl md:text-3xl font-bold bg-gradient-to-r from-[#E5383B] to-[#BA181B] bg-clip-text text-transparent">
                  ₹1000+
                </div>
                <div className="text-xs md:text-sm text-[#161A1D]/70">
                  Avg. Monthly Earnings
                </div>
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
      <section
        id="features"
        className="relative py-28 overflow-hidden bg-gradient-to-b from-[#F5F3F4] via-white to-[#F5F3F4]"
      >
        {/* Decorative Glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#E5383B]/10 blur-[160px] rounded-full animate-pulse" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#BA181B]/10 blur-[180px] rounded-full animate-pulse-slow" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Section Header */}
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#E5383B]/10 to-[#BA181B]/10 rounded-full mb-6">
              <span className="text-sm font-semibold tracking-wider text-[#660708] uppercase">
                Premium Features
              </span>
            </div>

            <h2 className="text-5xl font-extrabold text-[#161A1D] mb-6 leading-tight">
              Why Thousands Choose Us for
              <br />
              <span className="bg-gradient-to-r from-[#E5383B] via-[#BA181B] to-[#E5383B] bg-clip-text text-transparent">
                Renting & Earning
              </span>
            </h2>

            <p className="text-lg text-[#161A1D]/70 max-w-2xl mx-auto">
              Experience seamless, secure, and rewarding transactions with our
              industry-leading platform built for trust and growth.
            </p>
          </motion.div>

          {/* Feature Grid */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            transition={{ staggerChildren: 0.15 }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <Card className="group relative p-8 rounded-2xl bg-white border border-[#E5383B]/10 hover:border-[#E5383B]/30 shadow-md hover:shadow-[0_0_40px_rgba(229,56,59,0.15)] transition-all duration-500 hover:-translate-y-3 overflow-hidden">
                  {/* Animated gradient border effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-[#E5383B]/10 via-transparent to-[#BA181B]/10 transition-all duration-700" />

                  {/* Floating Icon */}
                  <div className="relative z-10">
                    <div className="w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-[#E5383B] to-[#BA181B] flex items-center justify-center shadow-xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>

                    <h3 className="text-2xl font-bold text-[#161A1D] mb-3 group-hover:text-[#E5383B] transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-[#161A1D]/70 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  {/* Subtle glow ring */}
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-40 h-40 bg-gradient-to-t from-[#E5383B]/10 to-transparent rounded-full blur-3xl group-hover:opacity-70 transition-opacity duration-700" />
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <HowItWorks />

      {/* CTA Section */}
      <section className="py-32 relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#E5383B] via-[#BA181B] to-[#660708]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(245,243,244,0.1),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(245,243,244,0.08),transparent_50%)]" />
        </div>

        {/* Animated dots pattern */}
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(245,243,244,0.15) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* Floating shapes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#F5F3F4]/5 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-[#F5F3F4]/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center space-y-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-[#F5F3F4]/10 backdrop-blur-md rounded-full border border-[#F5F3F4]/20 shadow-lg hover:bg-[#F5F3F4]/15 transition-all duration-300">
              <Sparkles className="w-5 h-5 text-[#F5F3F4] animate-pulse" />
              <span className="text-sm font-semibold text-[#F5F3F4]">
                Join 10,000+ Happy Users
              </span>
              <div className="flex -space-x-2 ml-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full bg-gradient-to-br from-[#F5F3F4] to-[#F5F3F4]/70 border-2 border-[#BA181B]"
                  />
                ))}
              </div>
            </div>

            {/* Main heading with enhanced typography */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-[#F5F3F4] leading-tight tracking-tight">
              Ready to Start Your
              <span className="block mt-2 bg-gradient-to-r from-[#F5F3F4] to-[#F5F3F4]/70 bg-clip-text text-transparent">
                Rental Journey?
              </span>
            </h2>

            {/* Decorative element */}
            <div className="flex items-center justify-center gap-3">
              <div className="h-1 w-16 bg-gradient-to-r from-transparent to-[#F5F3F4]/50 rounded-full" />
              <Star className="w-6 h-6 text-[#F5F3F4] fill-[#F5F3F4]" />
              <div className="h-1 w-16 bg-gradient-to-l from-transparent to-[#F5F3F4]/50 rounded-full" />
            </div>

            {/* Description */}
            <p className="text-base md:text-xl lg:text-2xl text-[#F5F3F4]/95 max-w-3xl mx-auto font-light leading-relaxed">
              Join thousands earning from unused items or finding exactly what
              they need at unbeatable prices.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-5 pt-6">
              <button 
                onClick={() => !user && navigate("/signup")}
                className="group relative px-12 py-5 bg-[#F5F3F4] text-[#E5383B] text-lg font-bold rounded-2xl hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#F5F3F4] to-[#F5F3F4]/90 transition-transform duration-300 group-hover:scale-110" />
                <span className="relative flex items-center gap-3">
                  Create Free Account
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                </span>
              </button>

              <button 
                onClick={() => navigate("/submit-listing")}
                className="group relative px-12 py-5 bg-transparent border-3 border-[#F5F3F4] text-[#F5F3F4] text-lg font-bold rounded-2xl hover:bg-[#F5F3F4] hover:text-[#E5383B] transition-all duration-300 hover:scale-105 overflow-hidden"
              >
                <span className="relative flex items-center gap-3">
                  List Your First Item
                  <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                </span>
              </button>
            </div>

            {/* Trust Indicators with enhanced design */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 pt-8 md:pt-12 max-w-4xl mx-auto">
              {[
                {
                  icon: Shield,
                  label: "100% Secure",
                  desc: "Bank-level encryption",
                },
                {
                  icon: Zap,
                  label: "Instant Setup",
                  desc: "Ready in 2 minutes",
                },
                {
                  icon: DollarSign,
                  label: "Zero Fees",
                  desc: "List items for free",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="group flex flex-col items-center gap-3 p-6 bg-[#F5F3F4]/5 backdrop-blur-sm rounded-2xl border border-[#F5F3F4]/10 hover:bg-[#F5F3F4]/10 transition-all duration-300 hover:scale-105"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F5F3F4]/20 to-[#F5F3F4]/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <item.icon className="w-8 h-8 text-[#F5F3F4]" />
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-[#F5F3F4]">
                      {item.label}
                    </p>
                    <p className="text-sm text-[#F5F3F4]/70 mt-1">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Social proof */}
            <div className="pt-8 flex items-center justify-center gap-2 text-[#F5F3F4]/80">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-[#F5F3F4] fill-[#F5F3F4]"
                  />
                ))}
              </div>
              <span className="text-sm font-medium ml-2">
                4.9/5 from 2,500+ reviews
              </span>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <style>{`
                @keyframes blob {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                }
                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 0.5; }
                }
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.8s ease-out forwards;
                }
                .animate-fade-in {
                    animation: fade-in 0.8s ease-out forwards;
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                .animate-pulse-slow {
                    animation: pulse-slow 4s ease-in-out infinite;
                }
                .animate-bounce-slow {
                    animation: bounce-slow 3s ease-in-out infinite;
                }
            `}</style>
    </div>
  );
};

export default Landing;
