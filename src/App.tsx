// OPTIMIZED
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationBanner } from "./components/NotificationBanner";
import ElevenLabsWidget from "./components/ElevenLabsWidget";
import OAuthCallback from "./components/OAuthCallback";

// Lazy Load Pages
const AboutPage = lazy(() => import("./pages/AboutPage"));
const Landing = lazy(() => import("./pages/Landing"));
const Signup = lazy(() => import("./pages/Signup"));
const Login = lazy(() => import("./pages/Login"));
const Listings = lazy(() => import("./pages/Listings"));
const SubmitListing = lazy(() => import("./pages/SubmitListing"));
const AIListing = lazy(() => import("./pages/AIListing"));
const Profile = lazy(() => import("./pages/Profile"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const BlogManagement = lazy(() => import("./pages/BlogManagement"));
const AdEditor = lazy(() => import("./pages/AdEditor"));
const TermsManagement = lazy(() => import("./pages/TermsManagement"));
const TopProfilesManagement = lazy(() => import("./pages/TopProfilesManagement"));
const InfluencerPartnersManagement = lazy(() => import("./pages/InfluencerPartnersManagement"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const LeaderboardManagement = lazy(() => import("./pages/LeaderboardManagement"));
const NotificationManagement = lazy(() => import("./pages/NotificationManagement"));
const NotFound = lazy(() => import("./pages/NotFound"));
const CouponManagement = lazy(() => import("./pages/CouponManagement"));
const PackageManagement = lazy(() => import("./pages/PackageManagement"));
const Inbox = lazy(() => import("./pages/Inbox"));
const TermsAndConditionPage = lazy(() => import("./pages/Terms&Condition"));

const PageLoader = () => (
  <div className="flex items-center justify-center h-screen w-full bg-background">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <NotificationBanner />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/listings" element={<Listings />} />
              <Route path="/submit-listing" element={<SubmitListing />} />
              <Route path="/submit-listing-ai" element={<AIListing />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/inbox" element={<Inbox />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/blogs" element={<BlogManagement />} />
              <Route path="/admin/ad-editor" element={<AdEditor />} />
              <Route path="/admin/terms" element={<TermsManagement />} />
              <Route path="/admin/top-profiles" element={<TopProfilesManagement />} />
              <Route path="/admin/influencer-partners" element={<InfluencerPartnersManagement />} />
              <Route path="/admin/leaderboard" element={<LeaderboardManagement />} />
              <Route path="/admin/notifications" element={<NotificationManagement />} />
              <Route path="/admin/coupons" element={<CouponManagement />} />
              <Route path="/manage-packages" element={<PackageManagement />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/blog" element={<Blog />} />

              <Route path="/terms-and-conditions" element={<TermsAndConditionPage />} />
              <Route path="/blog/:id" element={<BlogPost />} />
              <Route path="/auth/callback" element={<OAuthCallback />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <ElevenLabsWidget />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
