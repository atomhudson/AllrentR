import { Navbar } from "@/components/Navbar";
import { calculateReadingTime } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  useAdminBlogs,
  useCreateBlog,
  useUpdateBlog,
  useDeleteBlog,
  uploadBlogImage,
  Blog,
} from "@/hooks/useBlogs";
import { useState, useEffect } from "react";
import { Pencil, Trash2, Plus, Image as ImageIcon, Wand2, Sparkles, LayoutPanelLeft, TrendingUp as TrendIcon, RefreshCw, Send, ExternalLink, Copy } from "lucide-react";
import { generateAIImage } from "@/lib/gemini";
import { generateBlogContent, improveSEO, getTrendingTopics } from "@/lib/openrouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { blogSchema } from "@/lib/validation";
import { toast } from "sonner";
import RichTextEditor from "@/components/RichTextEditor";

const BlogManagement = () => {
  const { data: blogs, isLoading } = useAdminBlogs();
  const createBlog = useCreateBlog();
  const updateBlog = useUpdateBlog();
  const deleteBlog = useDeleteBlog();

  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    category: "",
    published: false,
    image_url: "",
    reference_url: "",
    tags: [] as string[],
    // SEO fields
    seo_title: "",
    meta_description: "",
    meta_keywords: "",
    og_image: "",
    author_name: "",
    reading_time: null as number | null,
  });
  const [tagInput, setTagInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [trendingTopics, setTrendingTopics] = useState<{title: string, category: string}[]>([]);
  const [isFetchingTrends, setIsFetchingTrends] = useState(false);

  const fetchTrends = async () => {
    setIsFetchingTrends(true);
    try {
      const trends = await getTrendingTopics();
      setTrendingTopics(trends);
      toast.success("Current trending topics fetched!");
    } catch (error: any) {
      toast.error("Failed to fetch trends");
    } finally {
      setIsFetchingTrends(false);
    }
  };

  useEffect(() => {
    if (isDialogOpen) {
      console.log("Dialog opened, fetching trends...");
      fetchTrends();
    }
  }, [isDialogOpen]);

  const handleGenerateBlog = async () => {
    if (!formData.title || !formData.category) {
      toast.error("Please enter a Title and Category first to guide the AI");
      return;
    }

    setIsGenerating(true);
    try {
      const aiData = await generateBlogContent(formData.title, formData.category);
      
      // Update form data with AI results
      setFormData(prev => ({
        ...prev,
        title: aiData.title || prev.title,
        description: aiData.description || "",
        content: aiData.content || "",
        tags: aiData.tags || [],
        seo_title: aiData.seo_title || "",
        meta_description: aiData.meta_description || "",
        meta_keywords: aiData.meta_keywords || "",
        og_image: aiData.og_image || generateAIImage(aiData.title || formData.title),
        reading_time: aiData.reading_time || null,
      }));

      // Generate AI Image if no image is present
      if (!formData.image_url) {
        const imageUrl = generateAIImage(`${formData.title} ${formData.category} professional blog header`);
        setFormData(prev => ({ ...prev, image_url: imageUrl }));
      }

      toast.success("Blog content generated successfully!");
      return aiData; // Return for auto-publish flow
    } catch (error: any) {
      console.error("AI Generation error:", error);
      toast.error(error.message || "Failed to generate blog content");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAndPublish = async () => {
    const aiData = await handleGenerateBlog();
    if (aiData) {
      const finalData = {
        ...formData,
        ...aiData,
        published: true,
        reading_time: aiData.reading_time || calculateReadingTime(aiData.content),
      };
      await createBlog.mutateAsync(finalData);
      setIsDialogOpen(false);
      resetForm();
    }
  };

  const handleOpenClaude = () => {
    if (!formData.title) {
      toast.error("Please select or enter a topic first");
      return;
    }

    const expertPrompt = `Act as an expert SEO strategist, content writer, and Google ranking specialist. Your goal is to create a HIGH-RANKING BLOG POST using EEAT (Experience, Expertise, Authority, Trust), AEO (Answer Engine Optimization), GRO (Generative Result Optimization), and SEO best practices. 
Topic: ${formData.title}
Target Audience: INTERMEDIATE
Primary Keyword: ${formData.title}
Secondary Keywords: [ADD 5-10 KEYWORDS] 

Requirements: 
1. Write a SHORT DESCRIPTION (max 500 characters) that is highly engaging, click-worthy, and SEO optimized. 
2. Create the MAIN BLOG CONTENT with: 
- Strong Hook Introduction (problem + emotion) 
- Clear headings (H1, H2, H3) 
- Answer-first structure (AEO optimized – direct answers at top) 
- Human-like storytelling (experience-based tone) 
- Include real-life examples or case studies 
- Add statistics or facts (to improve trust) 
- Use simple Hinglish tone (easy to read) 

3. EEAT Optimization: 
- Show expertise (deep explanation) 
- Show experience (real-life scenario or example) 
- Build authority (mention best practices) 
- Build trust (clear, honest, no fake claims) 

4. SEO Optimization: 
- Use primary keyword in title, intro, and headings 
- Add internal linking suggestions 
- Add meta title & meta description 
- Add FAQ section (5 questions) 

5. AEO Optimization: 
- Add direct answers in 40-60 words for featured snippet 
- Use bullet points & structured answers 

6. GRO Optimization: 
- Make content AI-search friendly (ChatGPT, Google SGE) 
- Use clear explanations + summaries 

7. Add: 
- Conclusion with CTA 
- 5 viral blog title options 
- 3 social media captions 

Tone: Engaging, smart, slightly emotional, and practical. Output should be clean, structured, and ready to publish.`;

    navigator.clipboard.writeText(expertPrompt);
    toast.success("Expert Prompt copied to clipboard!");
    window.open("https://claude.ai/new", "_blank");
  };

  const handleImproveSEO = async () => {
    if (!formData.content) {
      toast.error("No content to optimize");
      return;
    }

    setIsGenerating(true);
    try {
      const optimizedContent = await improveSEO(formData.content);
      setFormData(prev => ({ ...prev, content: optimizedContent }));
      toast.success("SEO Optimization complete!");
    } catch (error: any) {
      toast.error(error.message || "Failed to optimize SEO");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setUploading(true);

    try {
      const url = await uploadBlogImage(file);
      setFormData((prev) => ({ ...prev, image_url: url }));
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalFormData = {
      ...formData,
      reading_time: formData.reading_time || calculateReadingTime(formData.content),
    };

    try {
      // Validate form data
      blogSchema.parse(finalFormData);

      if (editingBlog) {
        await updateBlog.mutateAsync({ id: editingBlog.id, ...finalFormData });
      } else {
        await createBlog.mutateAsync(finalFormData);
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      if (error.errors) {
        // Zod validation errors
        error.errors.forEach((err: any) => {
          toast.error(`${err.path.join(".")}: ${err.message}`);
        });
      } else {
        toast.error("Failed to save blog post");
      }
    }
  };
  const handleAddTags = () => {
    const newTags = tagInput
      .split(/[\n,]+/) // Split by newlines or commas
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    // If no line breaks, also split by double or extra spaces (for pasted single-line text)
    const finalTags = newTags
      .flatMap((tag) => tag.split(/\s{2,}/))
      .map((t) => t.trim())
      .filter(Boolean);

    if (finalTags.length > 0) {
      setFormData((prev) => ({
        ...prev,
        tags: Array.from(new Set([...prev.tags, ...finalTags])), // Avoid duplicates
      }));
      setTagInput("");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      content: "",
      category: "",
      published: false,
      image_url: "",
      reference_url: "",
      tags: [],
      // SEO fields
      seo_title: "",
      meta_description: "",
      meta_keywords: "",
      og_image: "",
      author_name: "",
      reading_time: null,
    });
    setImageFile(null);
    setEditingBlog(null);
    setTagInput("");
  };

  const decodeHtml = (html: string) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  };

  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog);

    setFormData({
      title: blog.title,
      description: blog.description,
      content: decodeHtml(blog.content),
      category: blog.category,
      published: blog.published,
      image_url: blog.image_url || "",
      reference_url: blog.reference_url || "",
      tags: blog.tags || [],
      // SEO fields
      seo_title: blog.seo_title || "",
      meta_description: blog.meta_description || "",
      meta_keywords: blog.meta_keywords || "",
      og_image: blog.og_image || "",
      author_name: blog.author_name || "",
      reading_time: blog.reading_time || null,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this blog?")) {
      await deleteBlog.mutateAsync(id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navbar />

      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-serif font-bold text-foreground mb-2">
                Blog Management
              </h1>
              <p className="text-muted-foreground">
                Create and manage blog posts
              </p>
            </div>

            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) resetForm();
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Blog Post
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingBlog ? "Edit Blog Post" : "Create New Blog Post"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingBlog
                      ? "Update the blog post details and save your changes"
                      : "Fill in the details to create a new blog post"}
                  </DialogDescription>
                </DialogHeader>

                <div className="flex flex-wrap gap-2 mb-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="w-full mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
                    <Sparkles className="w-4 h-4" /> AI Blog Automation
                  </div>
                  <Button 
                    type="button" 
                    variant="default" 
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-none"
                    onClick={handleGenerateBlog}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <div className="animate-spin mr-2">⏳</div>
                    ) : (
                      <Wand2 className="w-4 h-4 mr-2" />
                    )}
                    Generate Full Blog
                  </Button>
                  <Button 
                    type="button" 
                    variant="default" 
                    className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white border-none"
                    onClick={handleGenerateAndPublish}
                    disabled={isGenerating || createBlog.isPending}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Generate & Publish
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1 border-primary/30 text-primary hover:bg-primary/10"
                    onClick={handleImproveSEO}
                    disabled={isGenerating}
                  >
                    <Sparkles className="w-4 h-4 mr-2" /> Improve SEO
                  </Button>
                  <Button 
                    type="button" 
                    variant="secondary" 
                    className="w-full mt-2 bg-[#F5F3F4] border border-[#D3D3D3] hover:bg-[#D3D3D3] transition-all"
                    onClick={handleOpenClaude}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Claude Style: Copy Expert Prompt & Open Claude
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <TrendIcon className="w-4 h-4 text-orange-500" />
                      Trending Right Now (Google Trends/Reddit)
                    </Label>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-xs" 
                      onClick={fetchTrends}
                      disabled={isFetchingTrends}
                    >
                      <RefreshCw className={`w-3 h-3 mr-1 ${isFetchingTrends ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                  
                  {isFetchingTrends ? (
                    <div className="flex items-center justify-center p-6 border border-dashed rounded-md bg-orange-50/30">
                      <div className="animate-spin mr-2 text-orange-500">⏳</div>
                      <span className="text-sm text-orange-600 font-medium">Scanning Google Trends & Reddit...</span>
                    </div>
                  ) : trendingTopics.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {trendingTopics.map((trend, idx) => (
                        <Button
                          key={idx}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-xs border-orange-200 hover:bg-orange-50 hover:border-orange-500 transition-all shadow-sm"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              title: trend.title,
                              category: trend.category
                            }));
                            toast.info(`Topic selected: ${trend.title}`);
                          }}
                        >
                          {trend.title}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div 
                      className="text-xs text-muted-foreground border border-dashed rounded-md p-3 cursor-pointer hover:bg-secondary/50 text-center"
                      onClick={fetchTrends}
                    >
                      No trends found. Click to try again.
                    </div>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter Your Desired Title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Short Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      rows={2}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="content">Content</Label>
                    <div className="mt-2">
                      <RichTextEditor
                        value={formData.content}
                        topic={formData.title}
                        onChange={(content) =>
                          setFormData((prev) => ({
                            ...prev,
                            content: content,
                          }))
                        }
                        placeholder="Start Writing"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="image">Featured Image</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={uploading}
                      />
                      {formData.image_url && (
                        <ImageIcon className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                    {formData.image_url && (
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="mt-2 w-full h-40 object-cover rounded"
                      />
                    )}
                  </div>

                  <div>
                    <Label htmlFor="reference_url">
                      Reference URL (Optional)
                    </Label>
                    <Input
                      id="reference_url"
                      type="url"
                      placeholder="https://example.com/article"
                      value={formData.reference_url}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          reference_url: e.target.value,
                        }))
                      }
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Add a link to additional information or source
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="tags">Tags</Label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <textarea
                          id="tags"
                          placeholder="Paste tags here — one per line or separated by commas"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onBlur={handleAddTags}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleAddTags();
                            }
                          }}
                          className="flex-1 min-h-[100px] resize-y border rounded-md p-2"
                        />
                        <Button type="button" onClick={handleAddTags}>
                          Add
                        </Button>
                      </div>

                      {formData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.tags.map((tag, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                            >
                              <span>{tag}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    tags: prev.tags.filter(
                                      (_, i) => i !== index
                                    ),
                                  }))
                                }
                                className="hover:text-destructive"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Paste or type tags — each new line, comma, or multiple
                      spaces will create a new tag.
                    </p>
                  </div>

                  {/* SEO Section */}
                  <div className="border-t pt-6 mt-6">
                    <h3 className="text-lg font-semibold mb-4">SEO Settings</h3>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="seo_title">
                          SEO Title (Optional)
                          <span className="text-xs text-muted-foreground ml-2">
                            - Defaults to title if empty
                          </span>
                        </Label>
                        <Input
                          id="seo_title"
                          value={formData.seo_title}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              seo_title: e.target.value,
                            }))
                          }
                          placeholder="SEO optimized title (max 200 chars)"
                          maxLength={200}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Recommended: 50-60 characters for best SEO results
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="meta_description">
                          Meta Description (Optional)
                          <span className="text-xs text-muted-foreground ml-2">
                            - Defaults to description if empty
                          </span>
                        </Label>
                        <Textarea
                          id="meta_description"
                          value={formData.meta_description}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              meta_description: e.target.value,
                            }))
                          }
                          rows={2}
                          placeholder="SEO meta description (max 500 chars)"
                          maxLength={500}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Recommended: 150-160 characters. This appears in search results.
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Current length: {formData.meta_description.length}/500
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="meta_keywords">
                          Meta Keywords (Optional)
                        </Label>
                        <Input
                          id="meta_keywords"
                          value={formData.meta_keywords}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              meta_keywords: e.target.value,
                            }))
                          }
                          placeholder="Comma-separated keywords (e.g., rental, marketplace, India)"
                          maxLength={500}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Separate keywords with commas. Also auto-generated from tags if empty.
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="og_image">
                          Open Graph Image URL (Optional)
                          <span className="text-xs text-muted-foreground ml-2">
                            - Defaults to featured image if empty
                          </span>
                        </Label>
                        <Input
                          id="og_image"
                          type="url"
                          value={formData.og_image}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              og_image: e.target.value,
                            }))
                          }
                          placeholder="https://example.com/og-image.jpg"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Recommended size: 1200x630px. Used for social media sharing.
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="author_name">Author Name (Optional)</Label>
                        <Input
                          id="author_name"
                          value={formData.author_name}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              author_name: e.target.value,
                            }))
                          }
                          placeholder="Author name"
                          maxLength={100}
                        />
                      </div>

                      <div>
                        <Label htmlFor="reading_time">
                          Reading Time (minutes) (Optional)
                          <span className="text-xs text-muted-foreground ml-2">
                            - Auto-calculated if empty
                          </span>
                        </Label>
                        <Input
                          id="reading_time"
                          type="number"
                          min="1"
                          value={formData.reading_time || ""}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              reading_time: e.target.value
                                ? parseInt(e.target.value)
                                : null,
                            }))
                          }
                          placeholder="Estimated reading time in minutes"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Leave empty to auto-calculate from content length.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="published"
                      checked={formData.published}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, published: checked }))
                      }
                    />
                    <Label htmlFor="published">Publish immediately</Label>
                  </div>

                  <Button
                    type="submit"
                    disabled={
                      uploading || createBlog.isPending || updateBlog.isPending
                    }
                  >
                    {editingBlog ? "Update" : "Create"} Blog Post
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {isLoading ? (
            <p>Loading blogs...</p>
          ) : (
            <div className="grid gap-4">
              {blogs?.map((blog) => (
                <Card key={blog.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-xl">{blog.title}</CardTitle>
                        <CardDescription>
                          {blog.category} •{" "}
                          {new Date(blog.created_at).toLocaleDateString()}
                          {blog.published ? (
                            <span className="ml-2 text-green-600">
                              Published
                            </span>
                          ) : (
                            <span className="ml-2 text-yellow-600">Draft</span>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(blog)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(blog.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {blog.image_url && (
                      <img
                        src={blog.image_url}
                        alt={blog.title}
                        className="w-full h-48 object-cover rounded mb-4"
                      />
                    )}
                    <p className="text-muted-foreground">{blog.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BlogManagement;
