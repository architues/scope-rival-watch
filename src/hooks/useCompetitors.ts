import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Competitor } from '@/types/competitor';
import { toast } from '@/hooks/use-toast';
import { useAuth } from './useAuth';

const DEBUG = process.env.NODE_ENV === 'development';

/**
 * Hook for managing competitors with real-time updates and optimistic UI.
 * Handles fetching, adding, updating, and removing competitors.
 * Uses React Query for data management and caching.
 */
export const useCompetitors = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  if (DEBUG) console.log('useCompetitors: user state', user ? `User ID: ${user.id}` : 'No user');

  /**
   * Fetches competitors for the current user.
   * Includes error handling and data transformation.
   */
  const { data: competitors = [], isLoading, error } = useQuery<Competitor[]>({
    queryKey: ['competitors', user?.id],
    queryFn: async (): Promise<Competitor[]> => {
      if (!user) {
        if (DEBUG) console.log('useCompetitors: No user found, returning empty array');
        return [];
      }
      
      if (DEBUG) console.log('useCompetitors: Starting query for user:', user.id);
      
      try {
        // First, let's check what competitors exist in the database
        if (DEBUG) console.log('useCompetitors: Checking all competitors in database...');
        const { data: allCompetitors, error: allError } = await supabase
          .from('competitors')
          .select('*');
        
        if (DEBUG) console.log('useCompetitors: All competitors in database:', allCompetitors);
        if (DEBUG) console.log('useCompetitors: All competitors error:', allError);
        
        // Now fetch user's specific competitors
        if (DEBUG) console.log('useCompetitors: Fetching competitors for user:', user.id);
        const { data, error } = await supabase
          .from('competitors')
          .select('*')
          .eq('user_id', user.id)
          .order('added_at', { ascending: false });

        if (DEBUG) console.log('useCompetitors: User-specific query result:', data);
        if (DEBUG) console.log('useCompetitors: User-specific query error:', error);

        if (error) {
          if (DEBUG) console.error('useCompetitors: Supabase error:', error);
          toast({
            title: "Error loading competitors",
            description: "Failed to load your competitors. Please try refreshing the page.",
            variant: "destructive",
          });
          throw error;
        }

        // Transform database records into Competitor objects
        const mappedCompetitors = (data || []).map((comp): Competitor => ({
          id: comp.id,
          name: comp.name,
          url: comp.url,
          status: comp.status as 'active' | 'checking' | 'error',
          lastChecked: comp.last_checked ? new Date(comp.last_checked) : new Date(),
          changesDetected: comp.changes_detected || 0,
          addedAt: new Date(comp.added_at),
        }));

        if (DEBUG) console.log('useCompetitors: Mapped competitors:', mappedCompetitors);
        return mappedCompetitors;
        
      } catch (fetchError) {
        if (DEBUG) console.error('useCompetitors: Fetch error details:', fetchError);
        toast({
          title: "Error loading competitors",
          description: "An unexpected error occurred while loading your competitors.",
          variant: "destructive",
        });
        throw fetchError;
      }
    },
    enabled: !!user,
    retry: 1,
    staleTime: 30000,
    gcTime: 300000,
  });

  if (DEBUG) console.log('useCompetitors: Final state - competitors count:', competitors.length, 'isLoading:', isLoading, 'error:', error?.message || 'none');

  /**
   * Mutation for adding a new competitor.
   * Handles validation, data transformation, and error handling.
   */
  const addCompetitorMutation = useMutation({
    mutationFn: async (newCompetitor: Omit<Competitor, 'id' | 'addedAt'>) => {
      if (!user) {
        if (DEBUG) console.error('useCompetitors: User not authenticated');
        toast({
          title: "Authentication error",
          description: "Please sign in to add competitors.",
          variant: "destructive",
        });
        throw new Error('User not authenticated');
      }

      if (DEBUG) console.log('useCompetitors: Adding competitor for user:', user.id, newCompetitor);

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
        if (DEBUG) console.error('useCompetitors: Error adding competitor:', error);
        let errorMessage = 'Failed to add competitor';
        if (error.code === '23505') {
          errorMessage = 'A competitor with this URL already exists';
        } else if (error.code === '23503') {
          errorMessage = 'Invalid competitor data';
        }
        toast({
          title: "Error adding competitor",
          description: errorMessage,
          variant: "destructive",
        });
        throw error;
      }
      
      if (DEBUG) console.log('useCompetitors: Successfully added competitor:', data);
      return data;
    },
    onSuccess: (data) => {
      if (DEBUG) console.log('useCompetitors: Add competitor mutation succeeded:', data);
      queryClient.invalidateQueries({ queryKey: ['competitors', user?.id] });
      toast({
        title: "Competitor added",
        description: "Competitor is now being tracked.",
      });
    },
    onError: (error) => {
      if (DEBUG) console.error('useCompetitors: Add competitor mutation failed:', error);
    },
  });

  /**
   * Mutation for updating a competitor's status and metadata.
   * Used for tracking checking status and change detection.
   */
  const updateCompetitorMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Competitor> }) => {
      if (DEBUG) console.log('useCompetitors: Updating competitor:', id, updates);
      
      const { error } = await supabase
        .from('competitors')
        .update({
          ...(updates.status && { status: updates.status }),
          ...(updates.lastChecked && { last_checked: updates.lastChecked.toISOString() }),
          ...(updates.changesDetected !== undefined && { changes_detected: updates.changesDetected }),
        })
        .eq('id', id);

      if (error) {
        if (DEBUG) console.error('useCompetitors: Error updating competitor:', error);
        toast({
          title: "Error updating competitor",
          description: "Failed to update competitor status. Please try again.",
          variant: "destructive",
        });
        throw error;
      }
      
      if (DEBUG) console.log('useCompetitors: Successfully updated competitor:', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitors', user?.id] });
    },
    onError: (error) => {
      if (DEBUG) console.error('useCompetitors: Update competitor mutation failed:', error);
      toast({
        title: "Error updating competitor",
        description: "Failed to update competitor. Please try again.",
        variant: "destructive",
      });
    },
  });

  /**
   * Mutation for removing a competitor.
   * Handles cleanup and error handling.
   */
  const removeCompetitorMutation = useMutation({
    mutationFn: async (id: string) => {
      if (DEBUG) console.log('useCompetitors: Removing competitor:', id);
      
      const { error } = await supabase
        .from('competitors')
        .delete()
        .eq('id', id);

      if (error) {
        if (DEBUG) console.error('useCompetitors: Error removing competitor:', error);
        toast({
          title: "Error removing competitor",
          description: "Failed to remove competitor. Please try again.",
          variant: "destructive",
        });
        throw error;
      }
      
      if (DEBUG) console.log('useCompetitors: Successfully removed competitor:', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitors', user?.id] });
      toast({
        title: "Competitor removed",
        description: "Competitor is no longer being tracked.",
      });
    },
    onError: (error) => {
      if (DEBUG) console.error('useCompetitors: Remove competitor mutation failed:', error);
      toast({
        title: "Error removing competitor",
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
