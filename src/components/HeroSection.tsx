import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  Sparkles,
  Shield,
  Clock,
  CheckCircle,
  Zap,
  Package,
} from "lucide-react";
import heroImage from "@/assets/heroimage.mp4";

export default function StartupHeroSection() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 20 - 10,
        y: (e.clientY / window.innerHeight) * 20 - 10,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="pt-4 relative min-h-screen overflow-hidden bg-gradient-to-br from-[#660708] via-[#A4161A] to-[#BA181B]">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Blurred Shapes */}
        <div
          className="absolute top-20 left-10 w-96 h-96 bg-[#E5383B] rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-float-slow"
          style={{
            transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
          }}
        />
        <div
          className="absolute bottom-40 right-20 w-80 h-80 bg-[#BA181B] rounded-full mix-blend-screen filter blur-3xl opacity-25 animate-float-slower"
          style={{
            transform: `translate(${-mousePosition.x}px, ${-mousePosition.y}px)`,
          }}
        />
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-[#660708] rounded-full mix-blend-screen filter blur-3xl opacity-15 animate-pulse-slow" />

        {/* Particle Grid */}
        <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-12 gap-8 h-full p-8">
            {[...Array(48)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-[#F5F3F4] rounded-full animate-twinkle"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>

        {/* Gradient Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-[#161A1D]/20 to-[#161A1D]/60" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 min-h-screen flex items-center">
        <div className="grid lg:grid-cols-2 gap-16 items-center w-full py-20">
          {/* Left Content */}
          <div className="space-y-8 animate-slide-in-left">
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full glass-card border border-[#E5383B]/30">
              <Sparkles className="w-5 h-5 text-[#E5383B]" />
              <span className="text-sm font-semibold text-[#F5F3F4] tracking-wide">
                India's Newest Rental Revolution
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="space-y-2">
              <span className="block text-5xl md:text-6xl lg:text-7xl font-bold text-[#F5F3F4] leading-tight serif-heading">
                Rent Smarter.
              </span>
              <span className="block text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="gradient-text serif-heading">Live Freer.</span>
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-[#D3D3D3] leading-relaxed max-w-xl font-light">
              Everything you need, anytime you want. Join India's most
              innovative peer-to-peer rental marketplace and turn your unused
              items into income.
            </p>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-6 pt-2">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#E5383B]/20 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[#E5383B]" />
                </div>
                <span className="text-sm text-[#F5F3F4] font-medium">
                  100% Secure
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#E5383B]/20 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-[#E5383B]" />
                </div>
                <span className="text-sm text-[#F5F3F4] font-medium">
                  Verified Users
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#E5383B]/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-[#E5383B]" />
                </div>
                <span className="text-sm text-[#F5F3F4] font-medium">
                  Quick Setup
                </span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button className="group relative px-8 py-4 bg-[#E5383B] text-white font-semibold text-lg rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-[#E5383B]/50 hover:scale-105 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative flex items-center justify-center gap-2">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>

              <button className="px-8 py-4 glass-card border border-[#F5F3F4]/30 text-[#F5F3F4] font-semibold text-lg rounded-2xl hover:border-[#F5F3F4]/50 transition-all duration-300 hover:scale-105">
                See How It Works
              </button>
            </div>

            {/* Key Features */}
            <div className="grid grid-cols-2 gap-4 pt-6">
              <div className="glass-card rounded-xl p-4 border border-[#F5F3F4]/10">
                <div className="text-2xl font-bold text-[#E5383B] mb-1">
                  30 sec
                </div>
                <div className="text-sm text-[#B1A7A6]">Quick Listing</div>
              </div>
              <div className="glass-card rounded-xl p-4 border border-[#F5F3F4]/10">
                <div className="text-2xl font-bold text-[#E5383B] mb-1">₹0</div>
                <div className="text-sm text-[#B1A7A6]">Setup Fee</div>
              </div>
            </div>
          </div>

          {/* Right Visual - Image with Overlay Effects */}
          <div className="relative animate-slide-in-right">
            {/* Main Image Container with Glassmorphism Frame */}
            <div className="relative glass-card-strong rounded-3xl p-4 shadow-2xl border border-[#F5F3F4]/20 overflow-hidden">
              {/* Decorative Corner Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-[#E5383B] to-[#BA181B] rounded-2xl rotate-12 opacity-80 blur-sm" />
              <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-br from-[#BA181B] to-[#660708] rounded-2xl -rotate-12 opacity-60 blur-sm" />

              {/* Image */}
              <div className="relative rounded-2xl overflow-hidden">
                <video
                  src={heroImage}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-[500px] object-cover rounded-2xl"
                >
                  Your browser does not support the video tag.
                </video>

                {/* Image Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B090A]/80 via-transparent to-transparent" />

                {/* Floating Info Cards on Image */}
                <div className="absolute bottom-6 left-6 right-6 space-y-3">
                  {/* Feature Card 1 */}
                  <div className="glass-card-strong rounded-xl p-4 border border-[#F5F3F4]/20 backdrop-blur-xl animate-float">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#E5383B] to-[#BA181B] flex items-center justify-center shadow-lg">
                        <Zap className="w-6 h-6 text-white" fill="white" />
                      </div>
                      <div>
                        <div className="text-[#F5F3F4] font-semibold">
                          Instant Connect
                        </div>
                        <div className="text-[#ffffff] text-sm">
                          Match with renters nearby
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Feature Card 2 */}
                  <div className="glass-card-strong rounded-xl p-4 border border-[#F5F3F4]/20 backdrop-blur-xl animate-float-delayed">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#BA181B] to-[#660708] flex items-center justify-center shadow-lg">
                        <Package className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-[#F5F3F4] font-semibold">
                          Smart Pricing
                        </div>
                        <div className="text-[#ffffff] text-sm">
                          AI-powered recommendations
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature Highlights Below Image */}
              <div className="relative mt-4 space-y-3">
                {[
                  "List unlimited items",
                  "Flexible rental terms",
                  "Built-in messaging",
                  "Easy payments",
                ].map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 group cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#E5383B]/20 flex items-center justify-center group-hover:bg-[#E5383B]/30 transition-colors">
                      <CheckCircle className="w-5 h-5 text-[#E5383B]" />
                    </div>
                    <span className="text-[#D3D3D3] group-hover:text-[#F5F3F4] transition-colors">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* Geometric Accent */}
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full">
                <div className="w-full h-full rounded-3xl border-2 border-[#E5383B]/20 animate-pulse-slow" />
              </div>
            </div>

            {/* Floating Accent Shapes */}
            <div className="absolute -top-8 -left-8 w-16 h-16 rounded-full bg-gradient-to-br from-[#E5383B] to-[#BA181B] opacity-60 blur-xl animate-float" />
            <div className="absolute -bottom-8 -right-8 w-20 h-20 rounded-2xl bg-gradient-to-br from-[#BA181B] to-[#660708] opacity-50 blur-xl animate-float-slower" />
          </div>
        </div>
      </div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#0B090A] to-transparent pointer-events-none" />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;600;700&display=swap');
        
        body { font-family: 'Inter', sans-serif; }
        .serif-heading { font-family: 'Playfair Display', serif; }
        
        @keyframes float { 
          0%, 100% { transform: translateY(0px); } 
          50% { transform: translateY(-20px); } 
        }
        @keyframes float-delayed { 
          0%, 100% { transform: translateY(0px); } 
          50% { transform: translateY(-15px); } 
        }
        @keyframes float-slow { 
          0%, 100% { transform: translate(0, 0); } 
          50% { transform: translate(-30px, -30px); } 
        }
        @keyframes float-slower { 
          0%, 100% { transform: translate(0, 0); } 
          50% { transform: translate(30px, 30px); } 
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.25; transform: scale(1.05); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.8; }
        }
        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        .animate-float { 
          animation: float 4s ease-in-out infinite; 
        }
        .animate-float-delayed { 
          animation: float-delayed 4s ease-in-out infinite; 
          animation-delay: 0.5s;
        }
        .animate-float-slow { animation: float-slow 15s ease-in-out infinite; }
        .animate-float-slower { animation: float-slower 20s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse-slow 4s ease-in-out infinite; }
        .animate-twinkle { animation: twinkle 3s ease-in-out infinite; }
        .animate-slide-in-left { animation: slide-in-left 0.8s ease-out; }
        .animate-slide-in-right { animation: slide-in-right 0.8s ease-out; }
        
        .glass-card {
          background: linear-gradient(135deg, rgba(245, 243, 244, 0.08), rgba(177, 167, 166, 0.05));
          backdrop-filter: blur(20px);
        }
        .glass-card-strong {
          background: linear-gradient(135deg, rgba(245, 243, 244, 0.12), rgba(177, 167, 166, 0.08));
          backdrop-filter: blur(30px);
        }
        .gradient-text {
          background: linear-gradient(135deg, #E5383B 0%, #F5F3F4 50%, #E5383B 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s ease-in-out infinite;
        }
        @keyframes shimmer {
          0%, 100% { background-position: 0% center; }
          50% { background-position: 100% center; }
        }
        .bg-gradient-radial {
          background: radial-gradient(circle at center, var(--tw-gradient-stops));
        }
      `}</style>
    </div>
  );
}
