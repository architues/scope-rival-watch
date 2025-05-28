
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Competitor } from '@/types/competitor';

export const useCompetitorChecker = () => {
  const [isChecking, setIsChecking] = useState<string[]>([]);

  const checkCompetitorChanges = async (competitor: Competitor, onUpdate: (id: string, updates: Partial<Competitor>) => void) => {
    console.log('useCompetitorChecker: handleCheckChanges called for competitor:', competitor.id);
    
    setIsChecking(prev => [...prev, competitor.id]);
    
    // Update status to checking
    onUpdate(competitor.id, { status: 'checking' });

    try {
      console.log('useCompetitorChecker: Calling Val.town to scrape competitor:', competitor.url);
      
      // Call Val.town API to scrape the competitor's website
      const response = await fetch(`https://www.val.town/x/architues/scrapecompetitor/code/main.tsx?url=${encodeURIComponent(competitor.url)}`);
      
      if (!response.ok) {
        throw new Error(`Val.town API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('useCompetitorChecker: Val.town response:', data);

      if (data.success) {
        // Get the current hash from the database using raw SQL to avoid type issues
        const { data: currentCompetitor, error: fetchError } = await supabase
          .from('competitors')
          .select('*')
          .eq('id', competitor.id)
          .single();

        if (fetchError) {
          console.error('useCompetitorChecker: Error fetching current competitor data:', fetchError);
          throw new Error('Failed to fetch competitor data');
        }

        // Access last_hash as any to avoid TypeScript errors until types are regenerated
        const previousHash = (currentCompetitor as any)?.last_hash;
        const newHash = data.hash;

        console.log('useCompetitorChecker: Comparing hashes - Previous:', previousHash, 'New:', newHash);

        // Check if content has changed
        const hasChanges = previousHash && previousHash !== newHash;

        if (hasChanges) {
          console.log('useCompetitorChecker: Changes detected! Creating change record');
          
          // Create a change record
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

          if (changeError) {
            console.error('useCompetitorChecker: Error creating change record:', changeError);
          }

          // Update competitor with new hash and increment changes using raw update
          const { error: updateError } = await supabase
            .from('competitors')
            .update({
              last_hash: newHash,
              last_checked: new Date().toISOString(),
              changes_detected: competitor.changesDetected + 1,
              status: 'active'
            } as any)
            .eq('id', competitor.id);

          if (updateError) {
            console.error('useCompetitorChecker: Error updating competitor:', updateError);
            throw new Error('Failed to update competitor data');
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
            } as any)
            .eq('id', competitor.id);

          if (updateError) {
            console.error('useCompetitorChecker: Error updating competitor:', updateError);
            throw new Error('Failed to update competitor data');
          }

          toast({
            title: "No changes found",
            description: `${competitor.name} appears unchanged.`,
          });
        }

        // Refresh the competitors data
        window.location.reload();
        
      } else {
        // Val.town returned an error
        console.error('useCompetitorChecker: Val.town scraping failed:', data.error);
        throw new Error(data.error || 'Failed to scrape website');
      }

    } catch (error) {
      console.error('useCompetitorChecker: Error checking changes:', error);
      
      // Update status to error
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
