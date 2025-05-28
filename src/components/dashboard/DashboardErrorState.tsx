
import { Users } from 'lucide-react';

interface DashboardErrorStateProps {
  error: Error | null;
}

export const DashboardErrorState = ({ error }: DashboardErrorStateProps) => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Users className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load dashboard</h3>
            <p className="text-gray-600 mb-4">
              {error?.message?.includes('timeout') 
                ? 'The request timed out. Please check your internet connection.' 
                : 'There was an error loading your data. Please try again.'}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="text-white px-4 py-2 rounded-lg hover:bg-sky-700"
              style={{backgroundColor: '#38BDF8'}}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
