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

export const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { 
    competitors, 
    isLoading: competitorsLoading, 
    error: competitorsError,
    addCompetitor, 
    updateCompetitor, 
    removeCompetitor 
  } = useCompetitors();
  
  const { changes, subscribeToChanges } = useChangeRecords();

  console.log('Dashboard: Rendering with user:', user ? `ID: ${user.id}` : 'No user');
  console.log('Dashboard: Auth loading:', authLoading);
  console.log('Dashboard: Competitors loading:', competitorsLoading);
  console.log('Dashboard: Competitors count:', competitors.length);
  console.log('Dashboard: Error:', competitorsError);

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
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
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
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleAddCompetitor = (newCompetitor: any) => {
    addCompetitor({
      name: newCompetitor.name,
      url: newCompetitor.url,
      status: 'active',
      lastChecked: new Date(),
      changesDetected: 0,
    });
  };

  const handleCheckChanges = async (id: string) => {
    const competitor = competitors.find(c => c.id === id);
    if (!competitor) return;

    // Update status to checking
    updateCompetitor({ 
      id, 
      updates: { status: 'checking' }
    });

    // Simulate monitoring process (will be replaced with real Edge Function)
    setTimeout(() => {
      const hasChanges = Math.random() > 0.5;
      
      if (hasChanges) {
        updateCompetitor({ 
          id, 
          updates: { 
            status: 'active',
            lastChecked: new Date(),
            changesDetected: competitor.changesDetected + 1
          }
        });
        
        toast({
          title: "Changes detected!",
          description: `New changes found on ${competitor.name}`,
        });
      } else {
        updateCompetitor({ 
          id, 
          updates: { 
            status: 'active',
            lastChecked: new Date()
          }
        });
        
        toast({
          title: "No changes found",
          description: `${competitor.name} appears unchanged.`,
        });
      }
    }, 2000);
  };

  const handleRemoveCompetitor = (id: string) => {
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
