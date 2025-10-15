import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { useBlogs } from '@/hooks/useBlogs';

const Blog = () => {
  const { data: blogs, isLoading } = useBlogs();
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
              RentKaro Blog
            </h1>
            <p className="text-lg text-muted-foreground">
              Stay updated with the latest news, features, and tips from our platform
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading blogs...</p>
            </div>
          ) : blogs && blogs.length > 0 ? (
            <div className="space-y-6">
              {blogs.map((post) => (
                <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {post.image_url && (
                    <img 
                      src={post.image_url} 
                      alt={post.title}
                      className="w-full h-64 object-cover"
                    />
                  )}
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary">{post.category}</Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(post.created_at).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                    <CardTitle className="text-2xl">{post.title}</CardTitle>
                    <CardDescription className="text-base">{post.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">{post.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No blog posts available yet.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Blog;
