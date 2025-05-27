
import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { AddCompetitorForm } from '@/components/dashboard/AddCompetitorForm';
import { CompetitorCard } from '@/components/dashboard/CompetitorCard';
import { ChangeHistoryTable } from '@/components/dashboard/ChangeHistoryTable';
import { Competitor, ChangeRecord } from '@/types/competitor';
import { toast } from '@/hooks/use-toast';

export const Dashboard = () => {
  const [competitors, setCompetitors] = useState<Competitor[]>([
    {
      id: '1',
      name: 'TechRival Corp',
      url: 'https://techrival.com',
      status: 'active',
      lastChecked: new Date(Date.now() - 3600000), // 1 hour ago
      changesDetected: 3,
      addedAt: new Date(Date.now() - 86400000), // 1 day ago
    },
    {
      id: '2',
      name: 'CompeteNow',
      url: 'https://competenow.io',
      status: 'active',
      lastChecked: new Date(Date.now() - 7200000), // 2 hours ago
      changesDetected: 1,
      addedAt: new Date(Date.now() - 172800000), // 2 days ago
    }
  ]);

  const [changes, setChanges] = useState<ChangeRecord[]>([
    {
      id: '1',
      competitorId: '1',
      competitorName: 'TechRival Corp',
      changeType: 'content',
      description: 'New pricing page added with updated subscription tiers',
      detectedAt: new Date(Date.now() - 1800000), // 30 minutes ago
      severity: 'high'
    },
    {
      id: '2',
      competitorId: '1',
      competitorName: 'TechRival Corp',
      changeType: 'design',
      description: 'Homepage hero section redesigned with new call-to-action',
      detectedAt: new Date(Date.now() - 3600000), // 1 hour ago
      severity: 'medium'
    },
    {
      id: '3',
      competitorId: '2',
      competitorName: 'CompeteNow',
      changeType: 'structure',
      description: 'Navigation menu restructured with new product categories',
      detectedAt: new Date(Date.now() - 7200000), // 2 hours ago
      severity: 'low'
    }
  ]);

  const handleAddCompetitor = (newCompetitor: Omit<Competitor, 'id' | 'addedAt'>) => {
    const competitor: Competitor = {
      ...newCompetitor,
      id: Date.now().toString(),
      addedAt: new Date()
    };
    
    setCompetitors(prev => [...prev, competitor]);
    toast({
      title: "Competitor added",
      description: `${competitor.name} is now being tracked.`,
    });
  };

  const handleCheckChanges = async (id: string) => {
    // Update competitor status to checking
    setCompetitors(prev => 
      prev.map(comp => 
        comp.id === id ? { ...comp, status: 'checking' as const } : comp
      )
    );

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate random change detection
    const hasChanges = Math.random() > 0.5;
    const competitor = competitors.find(c => c.id === id);
    
    if (hasChanges && competitor) {
      const newChange: ChangeRecord = {
        id: Date.now().toString(),
        competitorId: id,
        competitorName: competitor.name,
        changeType: ['content', 'design', 'structure'][Math.floor(Math.random() * 3)] as ChangeRecord['changeType'],
        description: 'Automated change detection found updates to the website',
        detectedAt: new Date(),
        severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as ChangeRecord['severity']
      };
      
      setChanges(prev => [newChange, ...prev]);
      
      setCompetitors(prev => 
        prev.map(comp => 
          comp.id === id ? { 
            ...comp, 
            status: 'active' as const,
            lastChecked: new Date(),
            changesDetected: comp.changesDetected + 1
          } : comp
        )
      );
      
      toast({
        title: "Changes detected!",
        description: `New changes found on ${competitor.name}`,
      });
    } else {
      setCompetitors(prev => 
        prev.map(comp => 
          comp.id === id ? { 
            ...comp, 
            status: 'active' as const,
            lastChecked: new Date()
          } : comp
        )
      );
      
      toast({
        title: "No changes found",
        description: `${competitor?.name} appears unchanged.`,
      });
    }
  };

  const handleRemoveCompetitor = (id: string) => {
    const competitor = competitors.find(c => c.id === id);
    setCompetitors(prev => prev.filter(comp => comp.id !== id));
    setChanges(prev => prev.filter(change => change.competitorId !== id));
    
    toast({
      title: "Competitor removed",
      description: `${competitor?.name} is no longer being tracked.`,
    });
  };

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
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Competitors</h3>
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
