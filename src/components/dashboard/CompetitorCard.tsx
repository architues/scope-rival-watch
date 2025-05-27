import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, ExternalLink, AlertTriangle, Clock, Activity, MoreVertical } from 'lucide-react';
import { Competitor } from '@/types/competitor';

interface CompetitorCardProps {
  competitor: Competitor;
  onCheckChanges: (id: string) => void;
  onRemove: (id: string) => void;
}

export const CompetitorCard = ({ competitor, onCheckChanges, onRemove }: CompetitorCardProps) => {
  const getStatusColor = (status: Competitor['status']) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'checking': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'error': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
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
    <div className="glass-card group hover:scale-105 transition-all duration-300">
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {competitor.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold font-jakarta">{competitor.name}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ExternalLink className="h-3 w-3" />
                <a 
                  href={competitor.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  {competitor.url.replace(/^https?:\/\//, '')}
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className={`${getStatusColor(competitor.status)} flex items-center gap-1 font-medium`}>
            {getStatusIcon(competitor.status)}
            {competitor.status}
          </Badge>
          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Last Checked</p>
          <p className="text-sm font-medium">
            {competitor.lastChecked.toLocaleDateString()}
          </p>
          <p className="text-xs text-muted-foreground">
            {competitor.lastChecked.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Changes Detected</p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold font-jakarta">{competitor.changesDetected}</p>
            {competitor.changesDetected > 0 && (
              <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button 
          onClick={() => onCheckChanges(competitor.id)}
          disabled={competitor.status === 'checking'}
          size="sm"
          className="flex-1 gradient-primary hover:opacity-90 transition-opacity font-medium"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${competitor.status === 'checking' ? 'animate-spin' : ''}`} />
          Check Changes
        </Button>
        <Button 
          onClick={() => onRemove(competitor.id)}
          variant="outline"
          size="sm"
          className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
        >
          Remove
        </Button>
      </div>
    </div>
  );
};
