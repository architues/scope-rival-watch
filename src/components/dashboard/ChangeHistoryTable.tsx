
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, ExternalLink } from 'lucide-react';
import { ChangeRecord } from '@/types/competitor';

interface ChangeHistoryTableProps {
  changes: ChangeRecord[];
}

export const ChangeHistoryTable = ({ changes }: ChangeHistoryTableProps) => {
  const getSeverityColor = (severity: ChangeRecord['severity']) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getChangeTypeColor = (type: ChangeRecord['changeType']) => {
    switch (type) {
      case 'content': return 'bg-blue-100 text-blue-800';
      case 'design': return 'bg-purple-100 text-purple-800';
      case 'structure': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (changes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Change History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <History className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No changes detected yet</p>
            <p className="text-sm text-gray-400 mt-1">Check your competitors to start tracking changes</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Change History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {changes.map((change) => (
            <div key={change.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">{change.competitorName}</h4>
                    <Badge className={getChangeTypeColor(change.changeType)}>
                      {change.changeType}
                    </Badge>
                    <Badge className={getSeverityColor(change.severity)}>
                      {change.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{change.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {change.detectedAt.toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {change.detectedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
