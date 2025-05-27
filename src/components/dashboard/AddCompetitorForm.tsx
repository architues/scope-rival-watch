
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Globe, Sparkles } from 'lucide-react';
import { Competitor } from '@/types/competitor';

interface AddCompetitorFormProps {
  onAddCompetitor: (competitor: Omit<Competitor, 'id' | 'addedAt'>) => void;
}

export const AddCompetitorForm = ({ onAddCompetitor }: AddCompetitorFormProps) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !url) return;

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const competitor: Omit<Competitor, 'id' | 'addedAt'> = {
      name,
      url: url.startsWith('http') ? url : `https://${url}`,
      status: 'active',
      lastChecked: new Date(),
      changesDetected: 0
    };

    onAddCompetitor(competitor);
    
    setName('');
    setUrl('');
    setIsLoading(false);
  };

  return (
    <div className="glass-card mb-8 animate-scale-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 gradient-secondary rounded-xl">
          <Plus className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-jakarta">Add New Competitor</h2>
          <p className="text-sm text-muted-foreground">Start tracking a new competitor website</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-foreground">
              Competitor Name
            </label>
            <Input
              id="name"
              type="text"
              placeholder="e.g., Acme Corp"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background/50 border-border/50 focus:border-primary/50 focus:bg-background/80 transition-all"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="url" className="text-sm font-medium text-foreground">
              Website URL
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="url"
                type="url"
                placeholder="competitor.com"
                className="pl-10 bg-background/50 border-border/50 focus:border-primary/50 focus:bg-background/80 transition-all"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>
          </div>
        </div>
        
        <Button 
          type="submit" 
          disabled={isLoading}
          className="gradient-primary hover:opacity-90 transition-opacity font-medium px-8"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Adding...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Add Competitor
            </div>
          )}
        </Button>
      </form>
    </div>
  );
};
