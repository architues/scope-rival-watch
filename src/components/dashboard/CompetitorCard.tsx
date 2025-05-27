
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, ExternalLink, AlertTriangle, Clock, Activity } from 'lucide-react';
import { Competitor } from '@/types/competitor';

interface CompetitorCardProps {
  competitor: Competitor;
  onCheckChanges: (id: string) => void;
  onRemove: (id: string) => void;
}

export const CompetitorCard = ({ competitor, onCheckChanges, onRemove }: CompetitorCardProps) => {
  const getStatusColor = (status: Competitor['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'checking': return 'bg-blue-100 text-blue-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Competitor['status']) => {
    switch (status) {
      case 'active': return <Activity className="h-3 w-3" />;
      case 'checking': return <RefreshCw className="h-3 w-3 animate-spin" />;
      case 'error': return <AlertTriangle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{competitor.name}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <ExternalLink className="h-4 w-4" />
              <a 
                href={competitor.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-blue-600 transition-colors"
              >
                {competitor.url.replace(/^https?:\/\//, '')}
              </a>
            </div>
          </div>
          <Badge className={`${getStatusColor(competitor.status)} flex items-center gap-1`}>
            {getStatusIcon(competitor.status)}
            {competitor.status}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Last Checked</p>
            <p className="text-sm font-medium text-gray-900">
              {competitor.lastChecked.toLocaleDateString()} at {competitor.lastChecked.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Changes Detected</p>
            <p className="text-sm font-medium text-gray-900">{competitor.changesDetected}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => onCheckChanges(competitor.id)}
            disabled={competitor.status === 'checking'}
            size="sm"
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${competitor.status === 'checking' ? 'animate-spin' : ''}`} />
            Check Changes
          </Button>
          <Button 
            onClick={() => onRemove(competitor.id)}
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Remove
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
