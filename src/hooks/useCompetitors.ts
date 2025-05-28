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
      console.log('useCompetitors: RLS is currently DISABLED for testing');
      
      // Create a promise that will timeout after 5 seconds
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Query timeout after 5 seconds'));
        }, 5000);
      });

      // Create the actual query promise
      const queryPromise = (async () => {
        try {
          console.log('useCompetitors: About to execute Supabase query...');
          
          const queryStart = Date.now();
          const { data, error } = await supabase
            .from('competitors')
            .select('*')
            .eq('user_id', user.id)
            .order('added_at', { ascending: false });

          const queryEnd = Date.now();
          console.log(`useCompetitors: Query completed in ${queryEnd - queryStart}ms`);

          console.log('useCompetitors: Supabase response received - data:', data, 'error:', error);

          if (error) {
            console.error('useCompetitors: Supabase error details:', error);
            console.error('useCompetitors: Error code:', error.code);
            console.error('useCompetitors: Error message:', error.message);
            console.error('useCompetitors: Error details:', error.details);
            console.error('useCompetitors: Error hint:', error.hint);
            throw error;
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
          console.log('useCompetitors: SUCCESS - Query completed without timeout!');
          return mappedCompetitors;
        } catch (fetchError) {
          console.error('useCompetitors: Fetch error caught:', fetchError);
          throw fetchError;
        }
      })();

      // Race the query against the timeout
      try {
        return await Promise.race([queryPromise, timeoutPromise]);
      } catch (error) {
        console.error('useCompetitors: Promise race failed:', error);
        throw error;
      }
    },
    enabled: !!user,
    retry: false, // Disable retries for now to see the raw error
    staleTime: 0, // Force fresh queries
    gcTime: 0, // Don't cache
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
