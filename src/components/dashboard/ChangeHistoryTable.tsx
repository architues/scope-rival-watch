
import { Badge } from '@/components/ui/badge';
import { History, ExternalLink, Clock, TrendingUp } from 'lucide-react';
import { ChangeRecord } from '@/types/competitor';

interface ChangeHistoryTableProps {
  changes: ChangeRecord[];
}

export const ChangeHistoryTable = ({ changes }: ChangeHistoryTableProps) => {
  const getSeverityColor = (severity: ChangeRecord['severity']) => {
    switch (severity) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getChangeTypeColor = (type: ChangeRecord['changeType']) => {
    switch (type) {
      case 'content': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'design': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'structure': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (changes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-sky-50 rounded-lg">
            <History className="h-5 w-5 text-sky-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Change History</h2>
            <p className="text-sm text-gray-600">Track all competitor changes</p>
          </div>
        </div>
        
        <div className="text-center py-16 px-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <History className="h-8 w-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">No changes detected yet</h4>
          <p className="text-gray-600 max-w-md mx-auto">
            Start monitoring your competitors to see changes here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sky-50 rounded-lg">
            <History className="h-5 w-5 text-sky-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Change History</h2>
            <p className="text-sm text-gray-600">Recent competitor updates and modifications</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <TrendingUp className="h-4 w-4" />
          {changes.length} changes
        </div>
      </div>
      
      <div className="space-y-4">
        {changes.map((change, index) => (
          <div 
            key={change.id} 
            className="bg-gray-50 border border-gray-200 rounded-lg p-6 hover:bg-gray-100 transition-all duration-200 group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xs">
                      {change.competitorName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-900">{change.competitorName}</h4>
                  <Badge className={getChangeTypeColor(change.changeType)}>
                    {change.changeType}
                  </Badge>
                  <Badge className={getSeverityColor(change.severity)}>
                    {change.severity}
                  </Badge>
                </div>
                <p className="text-gray-600">{change.description}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                  <Clock className="h-3 w-3" />
                  {change.detectedAt.toLocaleDateString()}
                </div>
                <p className="text-xs text-gray-500">
                  {change.detectedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="text-xs text-sky-600 hover:text-sky-500 flex items-center gap-1">
                <ExternalLink className="h-3 w-3" />
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
