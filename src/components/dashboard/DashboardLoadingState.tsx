
interface DashboardLoadingStateProps {
  authLoading: boolean;
  user: any;
  competitorsLoading: boolean;
}

export const DashboardLoadingState = ({ authLoading, user, competitorsLoading }: DashboardLoadingStateProps) => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{borderColor: '#38BDF8', borderTopColor: 'transparent'}} />
            <p className="text-gray-600">
              {authLoading ? 'Authenticating...' : 
               !user ? 'Loading user...' : 
               'Loading dashboard...'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
