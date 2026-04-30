import { Navbar } from "@/components/Navbar";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowLeft, ExternalLink, Share2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { SEOHead } from "@/components/SEOHead";
import GoogleAd from "@/components/GoogleAd";
import { BlogComments } from "@/components/BlogComments";

interface Blog {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  published: boolean;
  author_name?: string | null;
  reading_time?: number | null;
  tags?: string[] | null;
  seo_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
  reference_url: string | null;
}

const decodeHtml = (html: string) => {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

const parseContent = (html: string | null | undefined) => {
  if (!html) return "";
  
  const decodeHtmlString = (str: string) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = str;
    return txt.value;
  };
  
  let parsed = decodeHtmlString(html);
  
  // 1. Normalize shortcodes: handle spaces, case, and remove inner HTML tags
  parsed = parsed.replace(/\[\[\s*(FAQ|STAT|CONCLUSION)\s*\|\|\|\s*([\s\S]*?)\s*\]\]/gi, (match, type, content) => {
    const cleanType = type.toUpperCase();
    const cleanContent = content.replace(/<\/?[^>]+(>|$)/g, "").trim();
    return `[[${cleanType}|||${cleanContent}]]`;
  });

  // 2. Remove P tags wrapping shortcodes
  parsed = parsed.replace(/<p>\s*((?:\[\[(?:CONCLUSION|STAT|FAQ)\|\|\|[\s\S]*?\]\]\s*)+)\s*<\/p>/gi, '$1');

  // 3. Parse CONCLUSION
  parsed = parsed.replace(/\[\[CONCLUSION\|\|\|([\s\S]*?)\]\]/gi, (match, content) => {
    return `
      <div class="blog-conclusion mt-16 mb-12 p-8 md:p-12 rounded-[40px] bg-gradient-to-br from-[#161A1D] to-[#660708] text-white shadow-2xl relative overflow-hidden group">
        <div class="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div class="relative z-10">
          <div class="flex items-center gap-3 mb-6">
            <div class="w-10 h-1 bg-[#E5383B] rounded-full"></div>
            <span class="text-xs font-black uppercase tracking-[0.3em] text-[#E5383B]">Final Thoughts</span>
          </div>
          <h2 class="text-3xl md:text-4xl font-black mb-6 leading-tight !text-white border-0 p-0 m-0">Conclusion</h2>
          <div class="text-lg md:text-xl text-gray-300 leading-relaxed font-medium italic border-0 p-0">
            ${content}
          </div>
        </div>
      </div>
    `;
  });

  // 4. Parse STAT
  parsed = parsed.replace(/\[\[STAT\|\|\|([\s\S]*?)\]\]/gi, (match, content) => {
    const parts = content.split('|||').map(p => p.trim());
    if (parts.length <= 2) {
      const text = parts[0] || "";
      const sub = parts[1] || "";
      return `
        <div class="stat-card-full w-full my-8 p-8 rounded-[32px] bg-[#1a1a1a] shadow-2xl border border-white/5 relative overflow-hidden group">
          <div class="absolute top-0 right-0 w-32 h-32 bg-[#E5383B]/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <div class="flex items-start gap-6 relative z-10">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#E5383B] to-[#BA181B] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#E5383B]/20 transition-transform group-hover:scale-110">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            </div>
            <div class="flex-grow">
              <p class="text-[10px] font-black uppercase tracking-[0.2em] text-[#E5383B] mb-2">Key Statistic & Insight</p>
              <p class="text-xl md:text-2xl font-extrabold text-white leading-tight !text-white">${text}</p>
              ${sub ? `<p class="mt-3 text-sm font-medium text-gray-400 !text-gray-400">${sub}</p>` : ""}
            </div>
          </div>
        </div>
      `;
    }
    const title = parts[0] || "STAT";
    const value = parts[1] || "0";
    const subtitle = parts[2] || "";
    return `
      <div class="stat-card inline-flex flex-col justify-between w-[calc(33.33%-12px)] aspect-square m-1 p-5 rounded-[28px] bg-[#1a1a1a] shadow-xl border border-white/5 transition-transform hover:scale-[1.02]">
        <div class="flex flex-col h-full justify-between">
          <div>
            <p class="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-4 leading-tight !text-gray-400">${title}</p>
            <p class="text-3xl font-black text-white tracking-tighter leading-none !text-white">${value}</p>
          </div>
          ${subtitle ? `<p class="text-[11px] font-medium text-gray-500 leading-snug !text-gray-500">${subtitle}</p>` : ''}
        </div>
      </div>
    `;
  });

  // 5. Parse FAQ: Collect all items to move them to the end
  let faqCount = 0;
  const faqItems: string[] = [];
  
  parsed = parsed.replace(/\[\[FAQ\|\|\|([\s\S]*?)\]\]/gi, (match, content) => {
    faqCount++;
    const parts = content.split('|||').map(p => p.trim());
    let question = parts[0] || "";
    let answer = parts[1] || "";

    if (!answer && question.includes('?')) {
      const qIndex = question.indexOf('?');
      answer = question.substring(qIndex + 1).trim();
      question = question.substring(0, qIndex + 1);
    }

    if (!question || !answer) return "";

    const cleanQuestion = question.replace(/^(Q\d+:|Question:|Q:)\s*/i, "").trim();
    const cleanAnswer = answer.replace(/^(A\d+:|Answer:|A:)\s*/i, "").trim();

    faqItems.push(`
      <div class="faq-item my-5 group w-full">
        <details class="group rounded-[32px] bg-white border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-[#E5383B]/20 overflow-hidden" ${faqCount === 1 ? 'open' : ''}>
          <summary class="flex items-center gap-5 p-7 cursor-pointer list-none outline-none select-none">
            <div class="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-[#161A1D] to-[#660708] flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-black/10 group-open:from-[#E5383B] group-open:to-[#BA181B] transition-all duration-500">
              ?
            </div>
            <h3 class="text-xl md:text-2xl font-extrabold text-[#161A1D] transition-colors leading-snug pr-8 relative flex-grow faq-question-text !m-0 !p-0 border-0">
              ${cleanQuestion}
              <span class="absolute right-0 top-1/2 -translate-y-1/2 transition-transform duration-300 group-open:rotate-180 text-gray-400 group-hover:text-[#E5383B]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </span>
            </h3>
          </summary>
          <div class="px-7 pb-8 pt-0 text-[#161A1D]/70 leading-relaxed text-lg pl-1 md:pl-[88px] font-medium border-t border-gray-50/50 mt-2">
            <div class="pt-7 faq-answer-text border-0">
              ${cleanAnswer}
            </div>
          </div>
        </details>
      </div>
    `);
    
    return ""; // Remove from original position
  });

  // 6. Append FAQ section to the end if items exist
  if (faqItems.length > 0) {
    const faqSection = `
      <div class="mt-20 mb-12 flex flex-col items-center text-center w-full">
        <span class="px-5 py-2 rounded-full bg-[#E5383B]/10 text-[#E5383B] text-xs font-black uppercase tracking-[0.25em] mb-4 shadow-sm border border-[#E5383B]/5">Support & FAQ</span>
        <h2 class="text-4xl md:text-5xl font-black text-[#161A1D] m-0 p-0 border-0 leading-tight">Frequently Asked Questions</h2>
        <div class="w-24 h-1.5 bg-gradient-to-r from-[#E5383B] to-[#BA181B] mt-8 rounded-full shadow-lg shadow-[#E5383B]/20"></div>
      </div>
      <div class="faq-container w-full">
        ${faqItems.join('')}
      </div>
    `;
    parsed += faqSection;
  }

  return parsed;
};

// Styles to ensure rich text content looks good
const blogStyles = `
  .blog-content-rendered h1 { font-size: 2.5rem; font-weight: 800; margin-bottom: 1.5rem; margin-top: 2rem; color: #161A1D; line-height: 1.2; }
  .blog-content-rendered h2 { font-size: 2rem; font-weight: 700; margin-bottom: 1.25rem; margin-top: 1.75rem; color: #161A1D; border-left: 4px solid #E5383B; padding-left: 1rem; }
  .blog-content-rendered h3 { font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; margin-top: 1.5rem; color: #161A1D; }
  .blog-content-rendered p { margin-bottom: 1.25rem; line-height: 1.8; color: #161A1D; font-size: 1.125rem; }
  .blog-content-rendered ul { list-style-type: disc; margin-left: 1.5rem; margin-bottom: 1.25rem; }
  .blog-content-rendered ol { list-style-type: decimal; margin-left: 1.5rem; margin-bottom: 1.25rem; }
  .blog-content-rendered li { margin-bottom: 0.5rem; color: #161A1D; }
  .blog-content-rendered strong { font-weight: 700; color: #E5383B; }
  .blog-content-rendered img { border-radius: 1rem; margin-top: 2rem; margin-bottom: 2rem; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); }
  .blog-content-rendered blockquote { border-left: 4px solid #E5383B; padding-left: 1.5rem; font-style: italic; margin: 2rem 0; color: #660708; }
  
  /* Grid container for stats */
  .blog-content-rendered {
    display: flow-root;
  }
  
  .faq-question-text {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.3 !important;
  }
  
  .faq-answer-text {
    color: rgba(22, 26, 29, 0.7);
    line-height: 1.7 !important;
  }

  .stat-card-full p {
    margin: 0 !important;
  }
`;

const BlogPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [suggestedBlogs, setSuggestedBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from('blogs')
          .select('*')
          .eq('id', id)
          .eq('published', true)
          .single();

        if (error) throw error;
        setBlog(data);

        // Fetch suggested blogs
        const { data: suggested } = await supabase
          .from('blogs')
          .select('*')
          .eq('published', true)
          .eq('category', data.category)
          .neq('id', id)
          .limit(3);

        setSuggestedBlogs(suggested || []);
      } catch (error) {
        console.error('Error fetching blog:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  const readingTime = useMemo(() => {
    if (!blog) return null;
    const wordsPerMinute = 200;
    const wordCount = blog.content.split(/\s+/g).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }, [blog]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E5383B]"></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Blog post not found</h1>
        <Button onClick={() => navigate('/blog')}>Back to Blogs</Button>
      </div>
    );
  }

  const blogUrl = typeof window !== 'undefined' ? window.location.href : '';
  const seoTitle = blog.seo_title || blog.title;
  const seoDescription = blog.meta_description || blog.description;
  const seoImage = blog.image_url || '';
  const seoKeywords = blog.meta_keywords || (Array.isArray(blog.tags) ? blog.tags.join(', ') : '');

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog.title,
          text: blog.description,
          url: blogUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(blogUrl);
      toast.success("Link copied to clipboard!");
    }
  };

  const scrollToComments = () => {
    const element = document.getElementById('blog-comments-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5F3F4] to-white">
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        image={seoImage}
        url={blogUrl}
        type="article"
        siteName="AllRentr - P2P Rental Marketplace India"
        author={blog.author_name || undefined}
        publishedTime={blog.created_at}
        modifiedTime={blog.updated_at}
        section={blog.category}
        tags={Array.isArray(blog.tags) ? blog.tags : []}
        keywords={seoKeywords}
        canonicalUrl={blogUrl}
      />
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-20">
        <article className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button
            onClick={() => navigate('/blog')}
            variant="ghost"
            className="mb-8 text-[#660708] hover:text-[#E5383B] hover:bg-[#E5383B]/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to all blogs
          </Button>

          {/* Featured Image */}
          {blog.image_url && (
            <div className="relative h-[400px] md:h-[500px] rounded-3xl overflow-hidden mb-8 shadow-2xl">
              <img
                src={blog.image_url}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <Badge className="bg-[#E5383B] text-white hover:bg-[#BA181B] border-0 px-3 py-1">
              {blog.category}
            </Badge>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Calendar className="w-4 h-4" />
              {new Date(blog.created_at).toLocaleDateString("en-US", {
                month: "long", day: "numeric", year: "numeric"
              })}
            </div>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Clock className="w-4 h-4" />
              {readingTime} min read
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-[#161A1D] mb-8 leading-tight">
            {blog.title}
          </h1>

          <p className="text-xl text-gray-600 mb-12 leading-relaxed border-l-4 border-[#E5383B] pl-6 font-medium italic">
            {blog.description}
          </p>

          <GoogleAd slot="1807793922" layout="in-article" format="fluid" />

          {/* Render Content with Styles */}
          <style>{blogStyles}</style>
          <div
            className="blog-content-rendered"
            dangerouslySetInnerHTML={{ __html: parseContent(blog.content) }}
          />

          <GoogleAd slot="7233876092" />

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-100">
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag, i) => (
                  <Badge key={i} variant="outline" className="text-xs bg-gray-50 border-gray-200">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Share & Support */}
          <div className="mt-12 p-8 rounded-3xl bg-gradient-to-br from-[#161A1D] to-[#660708] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div>
              <h3 className="text-2xl font-bold mb-2">Enjoyed this article?</h3>
              <p className="text-gray-300">Share it with your friends or join the discussion below.</p>
            </div>
            <div className="flex gap-4">
              <Button
                onClick={handleShare}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Share2 className="w-4 h-4 mr-2" /> Share
              </Button>
              <Button
                onClick={scrollToComments}
                className="bg-[#E5383B] hover:bg-[#BA181B] text-white"
              >
                <MessageSquare className="w-4 h-4 mr-2" /> Discuss
              </Button>
            </div>
          </div>

          {/* Comments Section */}
          <div id="blog-comments-section" className="mt-16">
            <BlogComments blogId={blog.id} />
          </div>
        </article>

        {/* Suggested Blogs */}
        {suggestedBlogs.length > 0 && (
          <div className="max-w-6xl mx-auto mt-24">
            <h2 className="text-3xl font-bold mb-8 text-[#161A1D]">Suggested Reads</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {suggestedBlogs.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ y: -10 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100 cursor-pointer"
                  onClick={() => navigate(`/blog/${item.id}`)}
                >
                  <div className="h-48 relative">
                    <img src={item.image_url || ''} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-6">
                    <Badge className="mb-3 bg-gray-100 text-gray-700 hover:bg-gray-200 border-0">{item.category}</Badge>
                    <h3 className="font-bold text-lg line-clamp-2 mb-2">{item.title}</h3>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default BlogPost;
