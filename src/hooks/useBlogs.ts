import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Blog {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  image_url: string | null;
  reference_url: string | null;
  author_id: string;
  created_at: string;
  tags?: string[];
  updated_at: string;
  published: boolean;
  // SEO fields
  seo_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string | null;
  og_image?: string | null;
  author_name?: string | null;
  reading_time?: number | null;
}

const cleanupOldBlogs = async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  try {
    const { data: oldBlogs } = await supabase
      .from('blogs')
      .select('id, image_url, og_image')
      .lt('created_at', sevenDaysAgo.toISOString());
      
    if (oldBlogs && oldBlogs.length > 0) {
      // 1. Delete associated media from Supabase Storage first to save storage limits
      const filesToRemove: string[] = [];
      oldBlogs.forEach((blog) => {
        if (blog.image_url) {
          const path = blog.image_url.split('/').pop();
          if (path) filesToRemove.push(path);
        }
        if (blog.og_image) {
          const path = blog.og_image.split('/').pop();
          if (path && !filesToRemove.includes(path)) filesToRemove.push(path);
        }
      });
      
      if (filesToRemove.length > 0) {
        await supabase.storage.from('blog-images').remove(filesToRemove);
      }
      
      // 2. Delete the actual blog records from postgres
      const ids = oldBlogs.map(b => b.id);
      await supabase.from('blogs').delete().in('id', ids);
    }
  } catch (error) {
    console.error('Error auto-cleaning old blogs:', error);
  }
};

export const useBlogs = () => {
  return useQuery({
    queryKey: ['blogs'],
    queryFn: async () => {
      // Run cleanup in background
      cleanupOldBlogs();

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .gte('created_at', sevenDaysAgo.toISOString())
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Blog[];
    },
  });
};

export const useAdminBlogs = () => {
  return useQuery({
    queryKey: ['admin-blogs'],
    queryFn: async () => {
      // Run cleanup in background
      cleanupOldBlogs();

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Blog[];
    },
  });
};

export const useCreateBlog = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (blog: Omit<Blog, 'id' | 'created_at' | 'updated_at' | 'author_id'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('blogs')
        .insert([{ ...blog, author_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
      toast({
        title: 'Success',
        description: 'Blog created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateBlog = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...blog }: Partial<Blog> & { id: string }) => {
      const { data, error } = await supabase
        .from('blogs')
        .update(blog)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
      toast({
        title: 'Success',
        description: 'Blog updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteBlog = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
      toast({
        title: 'Success',
        description: 'Blog deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const uploadBlogImage = async (file: File): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('blog-images')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('blog-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
};
