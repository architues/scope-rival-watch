
import { useEffect } from 'react';
import { Users } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { AddCompetitorForm } from '@/components/dashboard/AddCompetitorForm';
import { CompetitorCard } from '@/components/dashboard/CompetitorCard';
import { ChangeHistoryTable } from '@/components/dashboard/ChangeHistoryTable';
import { useCompetitors } from '@/hooks/useCompetitors';
import { useChangeRecords } from '@/hooks/useChangeRecords';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Competitor } from '@/types/competitor';
import { supabase } from '@/integrations/supabase/client';

export const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { 
    competitors, 
    isLoading: competitorsLoading, 
    error: competitorsError,
    addCompetitor, 
    updateCompetitor, 
    removeCompetitor,
    isAddingCompetitor
  } = useCompetitors();
  
  const { changes, subscribeToChanges } = useChangeRecords();

  console.log('Dashboard: Rendering with user:', user ? `ID: ${user.id}` : 'No user');

  // Set up real-time subscriptions
  useEffect(() => {
    if (user && !authLoading) {
      console.log('Dashboard: Setting up real-time subscriptions for user:', user.id);
      try {
        const unsubscribe = subscribeToChanges();
        return unsubscribe;
      } catch (error) {
        console.error('Dashboard: Error setting up real-time subscriptions:', error);
      }
    }
  }, [subscribeToChanges, user, authLoading]);

  // Handle errors with more specific messaging
  useEffect(() => {
    if (competitorsError) {
      console.error('Dashboard: Competitors error:', competitorsError);
      
      let errorMessage = "Please try refreshing the page.";
      
      if (competitorsError.message?.includes('timeout')) {
        errorMessage = "Request timed out. Please check your internet connection.";
      } else if (competitorsError.message?.includes('401') || competitorsError.message?.includes('403')) {
        errorMessage = "Authentication error. Please try signing out and back in.";
      } else if (competitorsError.message?.includes('network')) {
        errorMessage = "Network error. Please check your internet connection.";
      }
      
      toast({
        title: "Error loading competitors",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [competitorsError]);

  // Show loading state if auth is loading or user is not loaded or competitors are loading
  if (authLoading || !user || competitorsLoading) {
    console.log('Dashboard: Showing loading state - authLoading:', authLoading, 'user:', !!user, 'competitorsLoading:', competitorsLoading);
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{borderColor: '#38BDF8', borderTopColor: 'transparent'}} />
              <p className="text-gray-600">
                {authLoading ? 'Authenticating...' : 
                 !user ? 'Loading user...' : 
                 'Loading dashboard...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if there's a persistent error
  if (competitorsError && !competitorsLoading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load dashboard</h3>
              <p className="text-gray-600 mb-4">
                {competitorsError.message?.includes('timeout') 
                  ? 'The request timed out. Please check your internet connection.' 
                  : 'There was an error loading your data. Please try again.'}
              </p>
              <button 
                onClick={() => window.location.reload()} 
                className="text-white px-4 py-2 rounded-lg hover:bg-sky-700"
                style={{backgroundColor: '#38BDF8'}}
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleAddCompetitor = (newCompetitor: Omit<Competitor, 'id' | 'addedAt'>) => {
    console.log('Dashboard: handleAddCompetitor called with:', newCompetitor);
    addCompetitor(newCompetitor);
  };

  const handleCheckChanges = async (id: string) => {
    console.log('Dashboard: handleCheckChanges called for competitor:', id);
    const competitor = competitors.find(c => c.id === id);
    if (!competitor) {
      console.error('Dashboard: Competitor not found:', id);
      return;
    }

    // Update status to checking
    updateCompetitor({ 
      id, 
      updates: { status: 'checking' }
    });

    try {
      console.log('Dashboard: Calling Val.town to scrape competitor:', competitor.url);
      
      // Call Val.town API to scrape the competitor's website
      const response = await fetch(`https://www.val.town/x/architues/scrapecompetitor/code/main.tsx?url=${encodeURIComponent(competitor.url)}`);
      
      if (!response.ok) {
        throw new Error(`Val.town API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Dashboard: Val.town response:', data);

      if (data.success) {
        // Get the current hash from the database
        const { data: currentCompetitor, error: fetchError } = await supabase
          .from('competitors')
          .select('last_hash')
          .eq('id', id)
          .single();

        if (fetchError) {
          console.error('Dashboard: Error fetching current competitor data:', fetchError);
          throw new Error('Failed to fetch competitor data');
        }

        const previousHash = currentCompetitor?.last_hash;
        const newHash = data.hash;

        console.log('Dashboard: Comparing hashes - Previous:', previousHash, 'New:', newHash);

        // Check if content has changed
        const hasChanges = previousHash && previousHash !== newHash;

        if (hasChanges) {
          console.log('Dashboard: Changes detected! Creating change record');
          
          // Create a change record
          const { error: changeError } = await supabase
            .from('change_records')
            .insert([{
              competitor_id: id,
              competitor_name: competitor.name,
              change_type: 'content',
              description: 'Website content has been updated',
              severity: 'medium',
              detected_at: new Date().toISOString()
            }]);

          if (changeError) {
            console.error('Dashboard: Error creating change record:', changeError);
          }

          // Update competitor with new hash and increment changes
          const { error: updateError } = await supabase
            .from('competitors')
            .update({
              last_hash: newHash,
              last_checked: new Date().toISOString(),
              changes_detected: competitor.changesDetected + 1,
              status: 'active'
            })
            .eq('id', id);

          if (updateError) {
            console.error('Dashboard: Error updating competitor:', updateError);
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
            })
            .eq('id', id);

          if (updateError) {
            console.error('Dashboard: Error updating competitor:', updateError);
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
        console.error('Dashboard: Val.town scraping failed:', data.error);
        throw new Error(data.error || 'Failed to scrape website');
      }

    } catch (error) {
      console.error('Dashboard: Error checking changes:', error);
      
      // Update status to error
      updateCompetitor({ 
        id, 
        updates: { status: 'error' }
      });

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
    }
  };

  const handleRemoveCompetitor = (id: string) => {
    console.log('Dashboard: handleRemoveCompetitor called for competitor:', id);
    removeCompetitor(id);
  };

  const activeChecks = competitors.filter(c => c.status === 'checking').length;
  const recentChanges = changes.filter(c => 
    new Date(c.detectedAt).getTime() > Date.now() - 86400000 // 24 hours
  ).length;

  console.log('Dashboard: Rendering main content with', competitors.length, 'competitors');

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <DashboardHeader 
          totalCompetitors={competitors.length}
          activeChecks={activeChecks}
          recentChanges={recentChanges}
        />
        
        <AddCompetitorForm onAddCompetitor={handleAddCompetitor} />
        
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Competitors</h3>
          {competitors.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 text-center py-16 px-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Track your first competitor to get started</h4>
              <p className="text-gray-600 max-w-md mx-auto">
                Add a competitor above and we'll monitor their website for changes, sending you alerts when we detect updates to their content, design, or features.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {competitors.map((competitor) => (
                <CompetitorCard
                  key={competitor.id}
                  competitor={competitor}
                  onCheckChanges={handleCheckChanges}
                  onRemove={handleRemoveCompetitor}
                />
              ))}
            </div>
          )}
        </div>
        
        <ChangeHistoryTable changes={changes} />
      </div>
    </div>
  );
};
