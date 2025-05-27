
import { useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { AddCompetitorForm } from '@/components/dashboard/AddCompetitorForm';
import { CompetitorCard } from '@/components/dashboard/CompetitorCard';
import { ChangeHistoryTable } from '@/components/dashboard/ChangeHistoryTable';
import { useCompetitors } from '@/hooks/useCompetitors';
import { useChangeRecords } from '@/hooks/useChangeRecords';
import { toast } from '@/hooks/use-toast';

export const Dashboard = () => {
  const { 
    competitors, 
    isLoading: competitorsLoading, 
    addCompetitor, 
    updateCompetitor, 
    removeCompetitor 
  } = useCompetitors();
  
  const { changes, subscribeToChanges } = useChangeRecords();

  // Set up real-time subscriptions
  useEffect(() => {
    const unsubscribe = subscribeToChanges();
    return unsubscribe;
  }, [subscribeToChanges]);

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

  if (competitorsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const activeChecks = competitors.filter(c => c.status === 'checking').length;
  const recentChanges = changes.filter(c => 
    new Date(c.detectedAt).getTime() > Date.now() - 86400000 // 24 hours
  ).length;

  return (
    <div>
      <DashboardHeader 
        totalCompetitors={competitors.length}
        activeChecks={activeChecks}
        recentChanges={recentChanges}
      />
      
      <AddCompetitorForm onAddCompetitor={handleAddCompetitor} />
      
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-white mb-4">Your Competitors</h3>
        {competitors.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500">No competitors added yet</p>
            <p className="text-sm text-gray-400 mt-1">Add your first competitor above to get started</p>
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
  );
};
