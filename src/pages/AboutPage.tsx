import { Button } from "@/components/ui/button";
import heroImage from "@/assets/ChatGPT Image Nov 3, 2025, 07_38_40 PM.png";
import { Navbar } from "@/components/Navbar";


const AboutPage = () => {
  return (
    
    <div className="w-full bg-background text-foreground">
         <Navbar />
      {/* ===== HERO SECTION ===== */}
      <br></br>
      <section className="w-full bg-background">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16">
          <div className="flex flex-col items-center gap-6 sm:gap-8">
            <div className="w-full text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight mb-4 sm:mb-6">
                Find Your Tribe,
                <br />
                Build Your Network.
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-foreground/70 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
                Connect with like-minded students for fun,
                <br className="hidden sm:block" />
                friendships, and future opportunities.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 justify-center">
                <Button size="lg" className="min-w-[140px] sm:min-w-[160px] w-full sm:w-auto">
                  Join for Free →
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 sm:gap-3 min-w-[200px] sm:min-w-[220px] w-full sm:w-auto"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden flex-shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"
                      alt="User avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  Explore Communities
                </Button>
              </div>
            </div>
            <div className="w-full max-w-5xl mt-4 px-2 sm:px-0">
              <img
                src={heroImage}
                alt="Diverse group of happy students networking and building friendships"
                className="w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== ABOUT SECTION ===== */}
      <section id="about" className="w-full py-12 sm:py-16 md:py-20 lg:py-32 bg-card">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
              About AllRentR
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 leading-relaxed px-2">
              AllRentR is a modern platform designed to help people connect,
              share, and rent gadgets, tools, and everyday items easily. Whether
              you're a student, freelancer, or creator — our goal is to make
              collaboration, community, and convenience accessible to everyone.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mt-8 sm:mt-12 md:mt-16">
              {/* Card 1 */}
              <div className="p-6 rounded-2xl bg-background border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Diverse Communities</h3>
                <p className="text-muted-foreground">
                  Join communities based on your interests, location, or goals.
                </p>
              </div>

              {/* Card 2 */}
              <div className="p-6 rounded-2xl bg-background border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Campus Events</h3>
                <p className="text-muted-foreground">
                  Discover and attend exciting local or online events easily.
                </p>
              </div>

              {/* Card 3 */}
              <div className="p-6 rounded-2xl bg-background border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Future Ready</h3>
                <p className="text-muted-foreground">
                  Build a strong network that supports your growth and success.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
