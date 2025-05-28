
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Competitor } from '@/types/competitor';
import { toast } from '@/hooks/use-toast';
import { useAuth } from './useAuth';

export const useCompetitors = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: competitors = [], isLoading, error } = useQuery({
    queryKey: ['competitors'],
    queryFn: async () => {
      if (!user) return [];
      
      // First ensure the user profile exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!profile) {
        console.log('User profile not found, creating...');
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: user.id,
              email: user.email || '',
              name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
            },
          ]);
        
        if (profileError && profileError.code !== '23505') {
          console.error('Error creating user profile:', profileError);
        }
      }

      const { data, error } = await supabase
        .from('competitors')
        .select('*')
        .order('added_at', { ascending: false });

      if (error) {
        console.error('Error fetching competitors:', error);
        throw error;
      }

      return data.map((comp): Competitor => ({
        id: comp.id,
        name: comp.name,
        url: comp.url,
        status: comp.status as 'active' | 'checking' | 'error',
        lastChecked: comp.last_checked ? new Date(comp.last_checked) : new Date(),
        changesDetected: comp.changes_detected || 0,
        addedAt: new Date(comp.added_at),
      }));
    },
    enabled: !!user,
  });

  const addCompetitorMutation = useMutation({
    mutationFn: async (newCompetitor: Omit<Competitor, 'id' | 'addedAt'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('competitors')
        .insert([{
          name: newCompetitor.name,
          url: newCompetitor.url,
          status: newCompetitor.status,
          last_checked: newCompetitor.lastChecked.toISOString(),
          changes_detected: newCompetitor.changesDetected,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitors'] });
      toast({
        title: "Competitor added",
        description: "Competitor is now being tracked.",
      });
    },
    onError: (error) => {
      console.error('Error adding competitor:', error);
      toast({
        title: "Error",
        description: "Failed to add competitor. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateCompetitorMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Competitor> }) => {
      const { error } = await supabase
        .from('competitors')
        .update({
          ...(updates.status && { status: updates.status }),
          ...(updates.lastChecked && { last_checked: updates.lastChecked.toISOString() }),
          ...(updates.changesDetected !== undefined && { changes_detected: updates.changesDetected }),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitors'] });
    },
    onError: (error) => {
      console.error('Error updating competitor:', error);
    },
  });

  const removeCompetitorMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('competitors')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitors'] });
      toast({
        title: "Competitor removed",
        description: "Competitor is no longer being tracked.",
      });
    },
    onError: (error) => {
      console.error('Error removing competitor:', error);
      toast({
        title: "Error",
        description: "Failed to remove competitor. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    competitors,
    isLoading,
    error,
    addCompetitor: addCompetitorMutation.mutate,
    updateCompetitor: updateCompetitorMutation.mutate,
    removeCompetitor: removeCompetitorMutation.mutate,
    isAddingCompetitor: addCompetitorMutation.isPending,
  };
};
