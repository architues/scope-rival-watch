
import { useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardLoadingState } from '@/components/dashboard/DashboardLoadingState';
import { DashboardErrorState } from '@/components/dashboard/DashboardErrorState';
import { AddCompetitorForm } from '@/components/dashboard/AddCompetitorForm';
import { CompetitorsSection } from '@/components/dashboard/CompetitorsSection';
import { ChangeHistoryTable } from '@/components/dashboard/ChangeHistoryTable';
import { useCompetitors } from '@/hooks/useCompetitors';
import { useChangeRecords } from '@/hooks/useChangeRecords';
import { useCompetitorChecker } from '@/hooks/useCompetitorChecker';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Competitor } from '@/types/competitor';

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
  const { checkCompetitorChanges } = useCompetitorChecker();

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
    return <DashboardLoadingState authLoading={authLoading} user={user} competitorsLoading={competitorsLoading} />;
  }

  // Show error state if there's a persistent error
  if (competitorsError && !competitorsLoading) {
    return <DashboardErrorState error={competitorsError} />;
  }

  const handleAddCompetitor = (newCompetitor: Omit<Competitor, 'id' | 'addedAt'>) => {
    console.log('Dashboard: handleAddCompetitor called with:', newCompetitor);
    addCompetitor(newCompetitor);
  };

  const handleCheckChanges = async (id: string) => {
    const competitor = competitors.find(c => c.id === id);
    if (!competitor) {
      console.error('Dashboard: Competitor not found:', id);
      return;
    }

    const wrappedUpdateCompetitor = (id: string, updates: Partial<Competitor>) => {
      updateCompetitor({ id, updates });
    };

    await checkCompetitorChanges(competitor, wrappedUpdateCompetitor);
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
        
        <CompetitorsSection 
          competitors={competitors}
          onCheckChanges={handleCheckChanges}
          onRemove={handleRemoveCompetitor}
        />
        
        <ChangeHistoryTable changes={changes} />
      </div>
    </div>
  );
};
