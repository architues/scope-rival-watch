
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Globe } from 'lucide-react';
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
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add New Competitor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">
                Competitor Name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="e.g., Acme Corp"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="url" className="text-sm font-medium text-gray-700">
                Website URL
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="url"
                  type="url"
                  placeholder="competitor.com"
                  className="pl-10"
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
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Adding...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Competitor
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
