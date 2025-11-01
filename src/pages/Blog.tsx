import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, X, Filter } from "lucide-react";
import { useBlogs } from "@/hooks/useBlogs";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const Blog = () => {
  const { data: blogs, isLoading } = useBlogs();
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Collect all unique categories
  const categories = ["All", ...new Set(blogs?.map((b) => b.category))];

  // Filter blogs
  const filteredBlogs =
    selectedCategory === "All"
      ? blogs
      : blogs?.filter((b) => b.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative text-center pt-20 md:pt-32 pb-12 md:pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#E5383B]/20 via-transparent to-transparent blur-3xl"></div>
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground font-serif tracking-tight"
        >
          AllRentr Blogs
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-base md:text-lg text-muted-foreground mt-4 max-w-2xl mx-auto px-4"
        >
          Discover the latest updates, insights, and stories from AllRentr —
          curated for modern readers.
        </motion.p>
      </section>

      {/* Filter Section */}
      <section className="container mx-auto px-4 md:px-6 mb-10">
        <div className="flex flex-wrap justify-center items-center gap-3 bg-card backdrop-blur-md border border-border rounded-xl p-4 shadow-card">
          <Filter className="w-4 h-4 text-muted-foreground mr-2" />
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              className={`rounded-full px-4 py-1 text-sm transition-all ${
                selectedCategory === cat
                  ? "bg-[#E5383B] hover:bg-[#E5383B]/90 text-[#F5F3F4] shadow-md"
                  : "hover:bg-accent/10"
              }`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </section>

      {/* Blog Grid */}
      <main className="container mx-auto px-4 md:px-6 pb-24">
        {isLoading ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground animate-pulse text-lg">
              Loading blogs...
            </p>
          </div>
        ) : filteredBlogs && filteredBlogs.length > 0 ? (
          <motion.div
            layout
            className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3"
          >
            {filteredBlogs.map((post, index) => (
              <motion.div
                layout
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="overflow-hidden group bg-card backdrop-blur-md rounded-2xl border border-border shadow-card hover:shadow-elegant transition-all duration-300">
                  {post.image_url && (
                    <div className="overflow-hidden h-56">
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <CardHeader className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <Badge
                        variant="secondary"
                        className="bg-[#E5383B] text-[#F5F3F4] text-xs px-3 py-1 rounded-full shadow-sm"
                      >
                        {post.category}
                      </Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(post.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </div>

                    <CardTitle className="text-xl font-semibold text-foreground group-hover:text-[#E5383B] transition-colors">
                      {post.title}
                    </CardTitle>

                    {/* Show full short description */}
                    <CardDescription className="text-base mt-3 text-muted-foreground leading-relaxed">
                      {post.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="px-6 pb-6">
                    <button
                      onClick={() => setSelectedBlog(post)}
                      className="mt-3 inline-flex items-center text-sm font-medium text-[#E5383B] hover:underline hover:translate-x-1 transition-transform"
                    >
                      Read Full Blog →
                    </button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              No blogs found for this category.
            </p>
          </div>
        )}
      </main>

      {/* Pop-up Modal for Full Blog */}
      <AnimatePresence>
        {selectedBlog && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative bg-card rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedBlog(null)}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition z-10"
                >
                  <X className="w-6 h-6" />
                </button>

                {/* Blog Image */}
                {selectedBlog.image_url && (
                  <img
                    src={selectedBlog.image_url}
                    alt={selectedBlog.title}
                    className="w-full h-72 object-cover rounded-t-2xl"
                  />
                )}

                {/* Blog Full Content */}
                <div className="p-8">
                  <div className="flex items-center justify-between mb-4">
                    <Badge className="bg-[#E5383B] text-[#F5F3F4]">
                      {selectedBlog.category}
                    </Badge>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(selectedBlog.created_at).toLocaleDateString(
                        "en-US",
                        {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </div>
                  </div>

                  <h2 className="text-3xl font-bold mb-4 text-foreground">
                    {selectedBlog.title}
                  </h2>

                  <p className="text-lg text-foreground leading-relaxed mb-4">
                    {selectedBlog.description}
                  </p>

                  <p className="text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedBlog.content}
                  </p>

                  {selectedBlog.reference_url && (
                    <div className="mt-6 p-4 bg-accent/10 rounded-lg border border-accent/30">
                      <p className="text-sm font-semibold text-foreground mb-2">📚 Additional Resources</p>
                      <a
                        href={selectedBlog.reference_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#E5383B] hover:text-[#E5383B]/80 underline text-sm flex items-center gap-1"
                      >
                      Read more at source
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Blog;
