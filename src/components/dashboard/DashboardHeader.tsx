
import { TrendingUp, Users, AlertCircle, Activity } from 'lucide-react';

interface DashboardHeaderProps {
  totalCompetitors: number;
  activeChecks: number;
  recentChanges: number;
}

export const DashboardHeader = ({ totalCompetitors, activeChecks, recentChanges }: DashboardHeaderProps) => {
  const stats = [
    {
      label: 'Total Competitors',
      value: totalCompetitors,
      icon: Users,
      change: '+12%',
      trend: 'up'
    },
    {
      label: 'Active Checks',
      value: activeChecks,
      icon: Activity,
      change: '+5%',
      trend: 'up'
    },
    {
      label: 'Recent Changes',
      value: recentChanges,
      icon: AlertCircle,
      change: '+23%',
      trend: 'up'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Monitor your competitors and track changes in real-time
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div 
            key={stat.label} 
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-gray-50 rounded-lg">
                <stat.icon className="h-5 w-5 text-gray-600" />
              </div>
              {stat.value > 0 && (
                <div className="flex items-center gap-1 text-xs text-emerald-600">
                  <TrendingUp className="h-3 w-3" />
                  {stat.change}
                </div>
              )}
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className={`text-2xl font-semibold ${stat.value === 0 ? 'text-gray-600' : 'text-gray-900'}`}>
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
