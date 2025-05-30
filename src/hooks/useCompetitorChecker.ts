import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Competitor } from '@/types/competitor';
import type { Database } from '@/integrations/supabase/types';
import { useQueryClient } from '@tanstack/react-query';

const DEBUG = process.env.NODE_ENV === 'development';

/**
 * Hook for checking and tracking changes in competitor websites.
 * Uses a Val.town service to scrape and hash competitor websites, then compares
 * the hashes to detect changes in content.
 */
export const useCompetitorChecker = () => {
  const [isChecking, setIsChecking] = useState<string[]>([]);
  const queryClient = useQueryClient();

  /**
   * Checks a competitor's website for changes by:
   * 1. Scraping the website content via Val.town service
   * 2. Comparing the new hash with the previous hash
   * 3. Creating a change record if differences are detected
   * 4. Updating the competitor's status and metadata
   */
  const checkCompetitorChanges = async (competitor: Competitor, onUpdate: (id: string, updates: Partial<Competitor>) => void) => {
    if (DEBUG) console.log('useCompetitorChecker: handleCheckChanges called for competitor:', competitor.id);
    
    setIsChecking(prev => [...prev, competitor.id]);
    
    // Update status to checking to provide immediate feedback
    onUpdate(competitor.id, { status: 'checking' });

    try {
      if (DEBUG) console.log('useCompetitorChecker: Calling Val.town to scrape competitor:', competitor.url);
      
      // Call Val.town API to scrape the competitor's website
      // The service returns a hash of the website's content for change detection
      const response = await fetch(`https://www.val.town/x/architues/scrapecompetitor/code/main.tsx?url=${encodeURIComponent(competitor.url)}`);
      
      if (!response.ok) {
        throw new Error(`Val.town API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      if (DEBUG) console.log('useCompetitorChecker: Val.town response:', data);

      if (data.success) {
        // Fetch current competitor data to get the previous hash
        const { data: currentCompetitor, error: fetchError } = await supabase
          .from('competitors')
          .select('*')
          .eq('id', competitor.id)
          .single();

        if (DEBUG) console.error('useCompetitorChecker: Error fetching current competitor data:', fetchError);
        if (fetchError) {
          throw new Error('Failed to fetch competitor data');
        }

        // Compare the new hash with the previous hash to detect changes
        const previousHash = (currentCompetitor as Database['public']['Tables']['competitors']['Row'])?.last_hash;
        const newHash = data.hash;

        if (DEBUG) console.log('useCompetitorChecker: Comparing hashes - Previous:', previousHash, 'New:', newHash);

        // Only create a change record if we have a previous hash and it's different
        const hasChanges = previousHash && previousHash !== newHash;

        if (hasChanges) {
          if (DEBUG) console.log('useCompetitorChecker: Changes detected! Creating change record');
          
          // Create a change record to track the detected changes
          const { error: changeError } = await supabase
            .from('change_records')
            .insert([{
              competitor_id: competitor.id,
              competitor_name: competitor.name,
              change_type: 'content',
              description: 'Website content has been updated',
              severity: 'medium',
              detected_at: new Date().toISOString()
            }]);

          if (DEBUG) console.error('useCompetitorChecker: Error creating change record:', changeError);
          if (changeError) {
            toast({
              title: "Error recording changes",
              description: "Failed to record the detected changes. Please try again.",
              variant: "destructive",
            });
          }

          // Update competitor metadata with new hash and increment change counter
          const { error: updateError } = await supabase
            .from('competitors')
            .update({
              last_hash: newHash,
              last_checked: new Date().toISOString(),
              changes_detected: competitor.changesDetected + 1,
              status: 'active'
            } as Database['public']['Tables']['competitors']['Update'])
            .eq('id', competitor.id);

          if (DEBUG) console.error('useCompetitorChecker: Error updating competitor:', updateError);
          if (updateError) {
            toast({
              title: "Error updating competitor",
              description: "Failed to update competitor status. Please try again.",
              variant: "destructive",
            });
            return;
          }

          toast({
            title: "Changes detected!",
            description: `New changes found on ${competitor.name}`,
          });
        } else {
          // No changes detected, just update the last checked time and hash
          const { error: updateError } = await supabase
            .from('competitors')
            .update({
              last_hash: newHash,
              last_checked: new Date().toISOString(),
              status: 'active'
            } as Database['public']['Tables']['competitors']['Update'])
            .eq('id', competitor.id);

          if (DEBUG) console.error('useCompetitorChecker: Error updating competitor:', updateError);
          if (updateError) {
            toast({
              title: "Error updating competitor",
              description: "Failed to update competitor status. Please try again.",
              variant: "destructive",
            });
            return;
          }

          toast({
            title: "No changes found",
            description: `${competitor.name} appears unchanged.`,
          });
        }

        // Refresh the competitors data to show updated status
        queryClient.invalidateQueries({ queryKey: ['competitors', competitor.id] });
        
      } else {
        // Handle Val.town service errors
        if (DEBUG) console.error('useCompetitorChecker: Val.town scraping failed:', data.error);
        if (data.error) {
          throw new Error(data.error || 'Failed to scrape website');
        }
      }

    } catch (error) {
      if (DEBUG) console.error('useCompetitorChecker: Error checking changes:', error);
      
      // Update status to error on failure
      onUpdate(competitor.id, { status: 'error' });

      let errorMessage = 'Failed to check for changes';
      
      if (error instanceof Error) {
        if (error.message.includes('Val.town')) {
          errorMessage = 'Monitoring service is temporarily unavailable. Please try again later.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Error checking changes",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsChecking(prev => prev.filter(id => id !== competitor.id));
    }
  };

  return {
    checkCompetitorChanges,
    isChecking: (id: string) => isChecking.includes(id)
  };
};
