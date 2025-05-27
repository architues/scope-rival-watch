
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Zap } from 'lucide-react';

interface AuthFormProps {
  onMagicLinkSent: (email: string) => void;
}

export const AuthForm = ({ onMagicLinkSent }: AuthFormProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    onMagicLinkSent(email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo and Welcome */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 gradient-primary rounded-2xl mb-6">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to ScopeRival</h1>
          <p className="text-gray-600">Track your competitors and stay ahead of the game</p>
        </div>

        {/* Auth Card */}
        <Card className="glass-card border-0">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Input
                  id="email"
                  type="email"
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 text-base border-gray-200 focus:border-primary focus:ring-primary"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 gradient-primary text-white font-semibold text-base rounded-xl hover:shadow-lg transition-all duration-200" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending magic link...
                  </div>
                ) : (
                  "Get a magic link sent to your email that will sign you instantly! ✨"
                )}
              </Button>
            </form>
            
            <p className="text-xs text-gray-500 text-center mt-6">
              By continuing, you agree to ScopeRival's Terms & Conditions and Privacy Policy
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
