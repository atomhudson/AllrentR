import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useSectionVisibility = (sectionName?: string) => {
  const queryClient = useQueryClient();

  const { data: visibility, isLoading } = useQuery({
    queryKey: ['section-visibility', sectionName],
    queryFn: async () => {
      if (sectionName) {
        const { data, error } = await supabase
          .from('section_visibility')
          .select('*')
          .eq('section_name', sectionName)
          .single();
        if (error) return null;
        return data;
      }
      return null;
    },
    enabled: !!sectionName,
  });

  const isVisible = visibility?.is_visible ?? true;

  return { isVisible, isLoading };
};

export const useAllSectionVisibility = () => {
  const queryClient = useQueryClient();

  const { data: sections, isLoading } = useQuery({
    queryKey: ['section-visibility-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('section_visibility')
        .select('*')
        .order('section_name');
      if (error) throw error;
      return data;
    },
  });

  const toggleVisibility = useMutation({
    mutationFn: async ({ sectionName, isVisible }: { sectionName: string; isVisible: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      // Upsert so missing rows are created automatically (fixes "only 3 toggles in production")
      const { error } = await supabase
        .from('section_visibility')
        .upsert(
          { section_name: sectionName, is_visible: isVisible, updated_by: user?.id },
          { onConflict: 'section_name' }
        );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['section-visibility'] });
      queryClient.invalidateQueries({ queryKey: ['section-visibility-all'] });
    },
  });

  return { sections, isLoading, toggleVisibility };
};
