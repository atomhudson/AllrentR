import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAdminBlogs, useCreateBlog, useUpdateBlog, useDeleteBlog, uploadBlogImage, Blog } from '@/hooks/useBlogs';
import { useState } from 'react';
import { Pencil, Trash2, Plus, Image as ImageIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';

const BlogManagement = () => {
  const { data: blogs, isLoading } = useAdminBlogs();
  const createBlog = useCreateBlog();
  const updateBlog = useUpdateBlog();
  const deleteBlog = useDeleteBlog();

  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    category: '',
    published: false,
    image_url: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setUploading(true);

    try {
      const url = await uploadBlogImage(file);
      setFormData(prev => ({ ...prev, image_url: url }));
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingBlog) {
      await updateBlog.mutateAsync({ id: editingBlog.id, ...formData });
    } else {
      await createBlog.mutateAsync(formData);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      content: '',
      category: '',
      published: false,
      image_url: '',
    });
    setImageFile(null);
    setEditingBlog(null);
  };

  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      description: blog.description,
      content: blog.content,
      category: blog.category,
      published: blog.published,
      image_url: blog.image_url || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this blog?')) {
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
              <p className="text-muted-foreground">Create and manage blog posts</p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Blog Post
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingBlog ? 'Edit Blog Post' : 'Create New Blog Post'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingBlog 
                      ? 'Update the blog post details and save your changes' 
                      : 'Fill in the details to create a new blog post'
                    }
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Short Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={2}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      rows={6}
                      required
                    />
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
                      <img src={formData.image_url} alt="Preview" className="mt-2 w-full h-40 object-cover rounded" />
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="published"
                      checked={formData.published}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, published: checked }))}
                    />
                    <Label htmlFor="published">Publish immediately</Label>
                  </div>

                  <Button type="submit" disabled={uploading || createBlog.isPending || updateBlog.isPending}>
                    {editingBlog ? 'Update' : 'Create'} Blog Post
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
                          {blog.category} • {new Date(blog.created_at).toLocaleDateString()}
                          {blog.published ? (
                            <span className="ml-2 text-green-600">Published</span>
                          ) : (
                            <span className="ml-2 text-yellow-600">Draft</span>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(blog)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(blog.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {blog.image_url && (
                      <img src={blog.image_url} alt={blog.title} className="w-full h-48 object-cover rounded mb-4" />
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
