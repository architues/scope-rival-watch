
import { Users } from 'lucide-react';
import { CompetitorCard } from './CompetitorCard';
import { Competitor } from '@/types/competitor';

interface CompetitorsSectionProps {
  competitors: Competitor[];
  onCheckChanges: (id: string) => void;
  onRemove: (id: string) => void;
}

export const CompetitorsSection = ({ competitors, onCheckChanges, onRemove }: CompetitorsSectionProps) => {
  if (competitors.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-sky-50 rounded-lg">
            <Users className="h-5 w-5 text-sky-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Your Competitors</h2>
            <p className="text-sm text-gray-600">Track your competitors' websites</p>
          </div>
        </div>
        
        <div className="text-center py-16 px-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <Users className="h-8 w-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Track your first competitor to get started</h4>
          <p className="text-gray-600 max-w-md mx-auto">
            Add a competitor above and we'll monitor their website for changes, sending you alerts when we detect updates to their content, design, or features.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-sky-50 rounded-lg">
          <Users className="h-5 w-5 text-sky-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Your Competitors</h2>
          <p className="text-sm text-gray-600">Track your competitors' websites</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {competitors.map((competitor) => (
          <CompetitorCard
            key={competitor.id}
            competitor={competitor}
            onCheckChanges={onCheckChanges}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
};
