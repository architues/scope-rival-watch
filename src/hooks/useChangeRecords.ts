
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ChangeRecord } from '@/types/competitor';
import { useAuth } from './useAuth';
import { toast } from '@/components/ui/use-toast';

const DEBUG = process.env.NODE_ENV === 'development';

/**
 * Hook for managing change records with real-time updates.
 * Fetches change records for the current user and sets up a real-time
 * subscription to receive updates when new changes are detected.
 */
export const useChangeRecords = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  /**
   * Fetches change records for the current user, ordered by detection time.
   * Only fetches records for competitors owned by the current user.
   */
  const { data: changes = [], isLoading } = useQuery({
    queryKey: ['change-records'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('change_records')
        .select(`
          *,
          competitors!inner(user_id)
        `)
        .order('detected_at', { ascending: false });

      if (DEBUG) console.error('Error fetching change records:', error);
      if (error) {
        toast({
          title: "Error loading changes",
          description: "Failed to load change records. Please try refreshing the page.",
          variant: "destructive",
        });
        throw error;
      }

      return data.map((record): ChangeRecord => ({
        id: record.id,
        competitorId: record.competitor_id,
        competitorName: record.competitor_name,
        changeType: record.change_type as 'content' | 'design' | 'structure',
        description: record.description,
        detectedAt: new Date(record.detected_at),
        severity: record.severity as 'low' | 'medium' | 'high',
      }));
    },
    enabled: !!user,
  });

  /**
   * Sets up a real-time subscription for change records.
   * When new changes are detected, the query is invalidated to refresh the data.
   * Returns a cleanup function to remove the subscription when the component unmounts.
   */
  const subscribeToChanges = () => {
    if (!user) return;

    const channel = supabase
      .channel('change-records')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'change_records',
        },
        () => {
          // Invalidate the query to trigger a refetch when new changes are detected
          queryClient.invalidateQueries({ queryKey: ['change-records'] });
        }
      )
      .on('error', (error) => {
        if (DEBUG) console.error('Change records subscription error:', error);
        toast({
          title: "Connection error",
          description: "Lost connection to real-time updates. Please refresh the page.",
          variant: "destructive",
        });
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  };

  return {
    changes,
    isLoading,
    subscribeToChanges,
  };
};
