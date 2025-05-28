
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Competitor } from '@/types/competitor';
import { toast } from '@/hooks/use-toast';
import { useAuth } from './useAuth';

export const useCompetitors = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  console.log('useCompetitors: user state', user ? `User ID: ${user.id}` : 'No user');

  const { data: competitors = [], isLoading, error } = useQuery({
    queryKey: ['competitors', user?.id],
    queryFn: async () => {
      if (!user) {
        console.log('useCompetitors: No user found, returning empty array');
        return [];
      }
      
      console.log('useCompetitors: Fetching competitors for user:', user.id);
      
      try {
        // Add a timeout to the request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const { data, error } = await supabase
          .from('competitors')
          .select('*')
          .eq('user_id', user.id)
          .order('added_at', { ascending: false })
          .abortSignal(controller.signal);

        clearTimeout(timeoutId);

        if (error) {
          console.error('useCompetitors: Error fetching competitors:', error);
          console.error('useCompetitors: Error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          throw error;
        }

        console.log('useCompetitors: Fetched competitors:', data);
        
        return data.map((comp): Competitor => ({
          id: comp.id,
          name: comp.name,
          url: comp.url,
          status: comp.status as 'active' | 'checking' | 'error',
          lastChecked: comp.last_checked ? new Date(comp.last_checked) : new Date(),
          changesDetected: comp.changes_detected || 0,
          addedAt: new Date(comp.added_at),
        }));
      } catch (error) {
        console.error('useCompetitors: Error in competitors query:', error);
        
        // Check if it's an abort error
        if (error.name === 'AbortError') {
          console.error('useCompetitors: Request timed out');
          throw new Error('Request timed out. Please check your internet connection.');
        }
        
        throw error;
      }
    },
    enabled: !!user,
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error?.message?.includes('401') || error?.message?.includes('403')) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  console.log('useCompetitors: Current state - competitors:', competitors.length, 'isLoading:', isLoading, 'error:', error);

  const addCompetitorMutation = useMutation({
    mutationFn: async (newCompetitor: Omit<Competitor, 'id' | 'addedAt'>) => {
      if (!user) throw new Error('User not authenticated');

      console.log('Adding competitor for user:', user.id);

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

      if (error) {
        console.error('Error adding competitor:', error);
        throw error;
      }
      
      console.log('Successfully added competitor:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitors', user?.id] });
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
      queryClient.invalidateQueries({ queryKey: ['competitors', user?.id] });
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
      queryClient.invalidateQueries({ queryKey: ['competitors', user?.id] });
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
