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
        // Add a timeout promise to prevent hanging
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Query timeout after 10 seconds')), 10000);
        });

        const queryPromise = supabase
          .from('competitors')
          .select('*')
          .eq('user_id', user.id)
          .order('added_at', { ascending: false });

        const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

        console.log('useCompetitors: Supabase response received - data:', data, 'error:', error);

        if (error) {
          console.error('useCompetitors: Supabase error:', error);
          throw new Error(`Failed to fetch competitors: ${error.message}`);
        }

        console.log('useCompetitors: Raw data from Supabase:', data);
        
        const mappedCompetitors = (data || []).map((comp): Competitor => ({
          id: comp.id,
          name: comp.name,
          url: comp.url,
          status: comp.status as 'active' | 'checking' | 'error',
          lastChecked: comp.last_checked ? new Date(comp.last_checked) : new Date(),
          changesDetected: comp.changes_detected || 0,
          addedAt: new Date(comp.added_at),
        }));

        console.log('useCompetitors: Mapped competitors:', mappedCompetitors);
        return mappedCompetitors;
      } catch (fetchError) {
        console.error('useCompetitors: Fetch error caught:', fetchError);
        throw fetchError;
      }
    },
    enabled: !!user,
    retry: (failureCount, error) => {
      console.log('useCompetitors: Query retry attempt', failureCount, error);
      return failureCount < 2; // Only retry twice
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 5000),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime in older versions)
  });

  console.log('useCompetitors: Query state - competitors:', competitors?.length || 0, 'isLoading:', isLoading, 'error:', error?.message || 'none');

  const addCompetitorMutation = useMutation({
    mutationFn: async (newCompetitor: Omit<Competitor, 'id' | 'addedAt'>) => {
      if (!user) {
        console.error('useCompetitors: User not authenticated');
        throw new Error('User not authenticated');
      }

      console.log('useCompetitors: Adding competitor for user:', user.id, newCompetitor);

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
        console.error('useCompetitors: Error adding competitor:', error);
        throw error;
      }
      
      console.log('useCompetitors: Successfully added competitor:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('useCompetitors: Add competitor mutation succeeded:', data);
      queryClient.invalidateQueries({ queryKey: ['competitors', user?.id] });
      toast({
        title: "Competitor added",
        description: "Competitor is now being tracked.",
      });
    },
    onError: (error) => {
      console.error('useCompetitors: Add competitor mutation failed:', error);
      toast({
        title: "Error",
        description: `Failed to add competitor: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateCompetitorMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Competitor> }) => {
      console.log('useCompetitors: Updating competitor:', id, updates);
      
      const { error } = await supabase
        .from('competitors')
        .update({
          ...(updates.status && { status: updates.status }),
          ...(updates.lastChecked && { last_checked: updates.lastChecked.toISOString() }),
          ...(updates.changesDetected !== undefined && { changes_detected: updates.changesDetected }),
        })
        .eq('id', id);

      if (error) {
        console.error('useCompetitors: Error updating competitor:', error);
        throw error;
      }
      
      console.log('useCompetitors: Successfully updated competitor:', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitors', user?.id] });
    },
    onError: (error) => {
      console.error('useCompetitors: Update competitor mutation failed:', error);
    },
  });

  const removeCompetitorMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('useCompetitors: Removing competitor:', id);
      
      const { error } = await supabase
        .from('competitors')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('useCompetitors: Error removing competitor:', error);
        throw error;
      }
      
      console.log('useCompetitors: Successfully removed competitor:', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitors', user?.id] });
      toast({
        title: "Competitor removed",
        description: "Competitor is no longer being tracked.",
      });
    },
    onError: (error) => {
      console.error('useCompetitors: Remove competitor mutation failed:', error);
      toast({
        title: "Error",
        description: `Failed to remove competitor: ${error.message}`,
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
