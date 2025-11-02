import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowRight } from "lucide-react";
import { useBlogs } from "@/hooks/useBlogs";
import { motion } from "framer-motion";

const Blog = () => {
  const navigate = useNavigate();
  const { data: blogs, isLoading } = useBlogs();
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", ...new Set(blogs?.map((b) => b.category))];
  const filteredBlogs =
    selectedCategory === "All"
      ? blogs
      : blogs?.filter((b) => b.category === selectedCategory);

  // Featured blog (first one)
  const featuredBlog = filteredBlogs?.[0];
  const recentBlogs = filteredBlogs?.slice(1);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 md:pt-32 pb-8 md:pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container mx-auto px-4 md:px-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
              Blog
            </h1>
            <p className="text-base md:text-lg text-muted-foreground">
              The latest industry news, interviews, technologies, and resources.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Blog Section */}
      {!isLoading && featuredBlog && (
        <section className="container mx-auto px-4 md:px-6 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => navigate(`/blog/${featuredBlog.id}`)}
            className="relative group cursor-pointer rounded-3xl overflow-hidden bg-card border border-border shadow-card hover:shadow-elegant transition-all duration-500"
          >
            {featuredBlog.image_url && (
              <div className="relative h-[400px] md:h-[500px] overflow-hidden">
                <img
                  src={featuredBlog.image_url}
                  alt={featuredBlog.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/50 to-transparent" />
                
                {/* Featured Badge */}
                <div className="absolute top-6 left-6">
                  <Badge className="bg-background/10 backdrop-blur-md text-background border-background/20 px-4 py-2">
                    Featured
                  </Badge>
                </div>

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                  <Badge className="bg-primary text-primary-foreground mb-4">
                    {featuredBlog.category}
                  </Badge>
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-background mb-4 leading-tight">
                    {featuredBlog.title}
                  </h2>
                  <p className="text-base md:text-lg text-background/90 mb-6 line-clamp-2">
                    {featuredBlog.description}
                  </p>
                  <div className="flex items-center gap-4 text-background/80">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        {new Date(featuredBlog.created_at).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </section>
      )}

      {/* Filter Section */}
      <section className="container mx-auto px-4 md:px-6 mb-12">
        <div className="flex flex-wrap gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Recent Blog Posts Section */}
      <section className="container mx-auto px-4 md:px-6 pb-24">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
          Recent blog posts
        </h2>

        {isLoading ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground animate-pulse text-lg">
              Loading blogs...
            </p>
          </div>
        ) : recentBlogs && recentBlogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {recentBlogs.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  onClick={() => navigate(`/blog/${post.id}`)}
                  className="group cursor-pointer overflow-hidden bg-card border border-border shadow-card hover:shadow-elegant transition-all duration-300 h-full"
                >
                  {post.image_url && (
                    <div className="overflow-hidden h-56">
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <Badge className="bg-primary text-primary-foreground mb-3">
                      {post.category}
                    </Badge>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Calendar className="w-4 h-4" />
                      {new Date(post.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>

                    <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>

                    <p className="text-base text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                      {post.description}
                    </p>

                    <button className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:gap-3 transition-all">
                      Read article
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              No blogs found for this category.
            </p>
          </div>
        )}
      </section>

    </div>
  );
};

export default Blog;
