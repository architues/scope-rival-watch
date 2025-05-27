
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ChangeRecord } from '@/types/competitor';
import { useAuth } from './useAuth';

export const useChangeRecords = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

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

      if (error) {
        console.error('Error fetching change records:', error);
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

  // Set up real-time subscription for change records
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
          queryClient.invalidateQueries({ queryKey: ['change-records'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  return {
    changes,
    isLoading,
    subscribeToChanges,
  };
};
