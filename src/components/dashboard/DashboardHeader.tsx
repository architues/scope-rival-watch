
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
      trend: 'up',
      gradient: 'from-violet-500 to-purple-600'
    },
    {
      label: 'Active Checks',
      value: activeChecks,
      icon: Activity,
      change: '+5%',
      trend: 'up',
      gradient: 'from-cyan-500 to-blue-600'
    },
    {
      label: 'Recent Changes',
      value: recentChanges,
      icon: AlertCircle,
      change: '+23%',
      trend: 'up',
      gradient: 'from-emerald-500 to-teal-600'
    }
  ];

  return (
    <div className="mb-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-jakarta bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Monitor your competitors and track changes in real-time
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div 
            key={stat.label} 
            className="glass-card group hover:scale-105 transition-all duration-300"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg group-hover:shadow-xl transition-shadow`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-xs text-emerald-400">
                <TrendingUp className="h-3 w-3" />
                {stat.change}
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
              <p className="text-3xl font-bold font-jakarta">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
