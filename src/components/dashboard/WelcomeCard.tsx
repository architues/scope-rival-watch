
import { Card, CardContent } from '@/components/ui/card';
import { Zap, TrendingUp, Shield } from 'lucide-react';

export const WelcomeCard = () => {
  const features = [
    {
      icon: Zap,
      title: 'Work blazingly fast',
      description: 'Monitor competitors in real-time'
    },
    {
      icon: TrendingUp,
      title: 'Stay ahead of competition',
      description: 'Get instant notifications of changes'
    },
    {
      icon: Shield,
      title: 'Get what you want, instantly',
      description: 'Automated competitive intelligence'
    }
  ];

  return (
    <Card className="glass-card border-0 mb-8">
      <CardContent className="p-8">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">ScopeRival</h2>
                <p className="text-gray-500">Competitive Intelligence Platform</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{feature.title}</p>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-32 h-32 gradient-primary rounded-3xl mb-4">
              <span className="text-4xl font-bold text-white">SR</span>
            </div>
            <div className="glass-card p-4 inline-block">
              <div className="text-3xl font-bold text-primary mb-1">1,849,716</div>
              <div className="text-sm text-gray-600">Changes detected</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
