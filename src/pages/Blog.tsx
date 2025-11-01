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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-950 dark:to-black transition-all">
      <Navbar />

      {/* Hero Section */}
      <section className="relative text-center py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-300/40 via-transparent to-transparent blur-3xl"></div>
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 bg-clip-text text-transparent font-serif tracking-tight"
        >
          AllRentr Blogs
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto"
        >
          Discover the latest updates, insights, and stories from AllRentr —
          curated for modern readers.
        </motion.p>
      </section>

      {/* Filter Section */}
      <section className="container mx-auto px-6 mb-10">
        <div className="flex flex-wrap justify-center items-center gap-3 bg-white/70 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
          <Filter className="w-4 h-4 text-muted-foreground mr-2" />
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              className={`rounded-full px-4 py-1 text-sm transition-all ${
                selectedCategory === cat
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                  : "hover:bg-indigo-50 dark:hover:bg-gray-700"
              }`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </section>

      {/* Blog Grid */}
      <main className="container mx-auto px-6 pb-24">
        {isLoading ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground animate-pulse text-lg">
              Loading blogs...
            </p>
          </div>
        ) : filteredBlogs && filteredBlogs.length > 0 ? (
          <motion.div
            layout
            className="grid gap-10 md:grid-cols-2 lg:grid-cols-3"
          >
            {filteredBlogs.map((post, index) => (
              <motion.div
                layout
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="overflow-hidden group bg-white/80 dark:bg-gray-900/40 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl transition-all duration-300">
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
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs px-3 py-1 rounded-full shadow-sm"
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

                    <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100 group-hover:text-indigo-600 transition-colors">
                      {post.title}
                    </CardTitle>

                    {/* Show full short description */}
                    <CardDescription className="text-base mt-3 text-gray-600 dark:text-gray-300 leading-relaxed">
                      {post.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="px-6 pb-6">
                    <button
                      onClick={() => setSelectedBlog(post)}
                      className="mt-3 inline-flex items-center text-sm font-medium text-indigo-600 hover:underline hover:translate-x-1 transition-transform"
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
              className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedBlog(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 transition"
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
                  <Badge className="bg-indigo-600 text-white">
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

                <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                  {selectedBlog.title}
                </h2>

                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  {selectedBlog.description}
                </p>

                <p className="text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedBlog.content}
                </p>

                {selectedBlog.reference_url && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-lg border border-indigo-200 dark:border-indigo-800">
                    <p className="text-sm font-semibold text-induted-foreground mb-2">📚 Additional Resources</p>
                    <a
                      href={selectedBlog.reference_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 underline text-sm flex items-center gap-1"
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
